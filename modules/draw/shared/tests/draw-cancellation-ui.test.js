import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { setImmediate } from 'node:timers/promises';
import { build } from 'esbuild';
import { indexedDB, IDBObjectStore } from 'fake-indexeddb';
import { parseHTML } from 'linkedom';
import { providerFixtures } from './fixtures/provider-runtime-fixture.mjs';

// Production capsule DOM/events, cancellation controls and IndexedDB. Only the
// host and provider boundary are replaced; clicks never buy image generation.
async function buildPanel(provider) {
    const { folder, name } = providerFixtures[provider];
    const stubs = {
        'extensions.js': 'export const getContext=()=>globalThis.__cancelUi.ctx;',
        'script.js': 'export const getRequestHeaders=()=>({});',
        'user.js': 'export const getCurrentUserHandle=()=>"fixture";',
        [`${name}-draw.js`]: `export const openNovelDrawSettings=()=>{};export const openSettings=()=>{};
            export const generateAndInsertImages=()=>{throw new Error("Unexpected image submission");};
            export const getSettings=()=>({showFloorButton:true,showFloatingButton:true});
            export const updateSettingsPersistent=()=>{};export const findLastAIMessageId=()=>0;
            export const getGenerationState=()=>null;export const abortGeneration=(...args)=>globalThis.__cancelUi.abort(...args);`,
        'message-toolbar.js': `export const registerToToolbar=(_id,node)=>{document.querySelector('.mes').append(node);return true;};
            export const removeFromToolbar=(_id,node)=>node.remove();`,
        'draw-common.js': 'export const formatScenePlannerProgress=()=>"";',
        'draw-run-production.js': 'export const isDrawRunPendingError=()=>false;',
    };
    const bundle = await build({ stdin: { resolveDir: fileURLToPath(new URL('..', import.meta.url)), contents: `
        export * from '../providers/${folder}/floating-panel.js';
        export * from './draw-run-controls.js';export * from './pending-image-jobs.js';
        export * from './draw-cancellation-journal.js';` }, bundle: true, write: false, format: 'esm', platform: 'node',
        footer: { js: '//# sourceURL=draw-cancellation-ui-fixture.mjs' },
        plugins: [{ name: 'host', setup(builder) {
            builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
                const key = path.split('/').at(-1);
                return stubs[key] ? { path: key, namespace: 'host' } : null;
            });
            builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Fixed local production bundle, no external code.
    return import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
}

async function until(predicate) {
    for (let turn = 0; turn < 200 && !predicate(); turn++) await setImmediate();
    assert.ok(predicate(), 'expected UI operation to settle');
}

for (const provider of Object.keys(providerFixtures)) test(`${provider} cancellation failure remains retryable`, async t => {
    const api = await buildPanel(provider);
    for (const surface of ['floor', 'floating']) for (const failure of ['read', 'write', 'transport']) {
        await t.test(`${surface}: ${failure}`, async t => {
            const { document, window } = parseHTML('<html><head></head><body><div class="mes" mesid="0"></div></body></html>');
            Object.assign(globalThis, { document, window, indexedDB, BroadcastChannel: undefined });
            window.innerWidth = 800; window.innerHeight = 600;
            window.HTMLElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, bottom: 40 });
            const h = globalThis.__cancelUi = { ctx: { chatId: `${provider}-${surface}-${failure}`,
                chat: [{ mes: '[image:cancel-ui-slot]', swipe_id: 0 }] }, operations: [], errors: [] };
            globalThis.toastr = { error: error => h.errors.push(error), info() {} };
            t.mock.method(console, 'error', () => {});
            const record = await api.recordPendingImageJob({ jobId: h.ctx.chatId, provider,
                delivery: { mode: 'slots', chatId: h.ctx.chatId, messageId: '0', swipeIndex: 0 },
                items: [{ index: 0, slotId: 'cancel-ui-slot', imgId: h.ctx.chatId }] });
            await api.markPendingImageJobActive(record.jobId, record.leaseId);
            let broken = true;
            const serverCalls = [];
            h.abort = (id, options) => {
                const operation = api.cancelFloorDrawWork(id, { ...options, imageJobClient: { cancelWork: async targets => {
                    serverCalls.push(targets);
                    if (broken && failure === 'transport') throw new TypeError('offline');
                } } });
                h.operations.push(operation);
                return operation;
            };
            api.initFloatingPanel();
            const panel = api[`ensure${providerFixtures[provider].title}DrawPanel`](document.querySelector('.mes'), 0, { force: true });
            t.after(async () => {
                api.destroyFloatingPanel();
                await api.forgetPendingImageJob(record.jobId, record.leaseId);
                for (const entry of await api.drawCancellationJournal.list()) await api.drawCancellationJournal.forget(entry.id);
            });
            // Mounting reads and activity events can supersede one another. A
            // real pending record must be visible before injecting I/O failure.
            await until(() => panel.state === 'accepted');
            const action = surface === 'floor' ? panel.root.querySelector('.nd-layer-active')
                : document.querySelector('.nd-floating-global .nd-layer-active');
            const click = () => {
                if (surface === 'floor') action.click();
                else for (const type of ['pointerdown', 'pointerup']) {
                    const event = new window.Event(type, { bubbles: true });
                    Object.assign(event, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
                    action.dispatchEvent(event);
                }
            };
            const getAll = IDBObjectStore.prototype.getAll, add = IDBObjectStore.prototype.add;
            t.mock.method(IDBObjectStore.prototype, 'getAll', function (...args) {
                if (broken && failure === 'read' && this.name === 'jobs') throw new DOMException('read failed', 'InvalidStateError');
                return getAll.apply(this, args);
            });
            t.mock.method(IDBObjectStore.prototype, 'add', function (...args) {
                if (broken && failure === 'write' && this.name === 'intents') throw new DOMException('full', 'QuotaExceededError');
                return add.apply(this, args);
            });
            click();
            await until(() => h.errors.length === 1);
            assert.equal(h.operations.length, 1);
            assert.equal(serverCalls.length, failure === 'transport' ? 1 : 0);
            assert.equal((await api.getPendingImageJob(record.jobId)).state, 'active');
            // Let failure activity finish too: it must not reapply cancelling
            // after the click handler has already restored its own view.
            for (let turn = 0; turn < 10; turn++) await setImmediate();
            broken = false;
            click();
            assert.equal(h.operations.length, 2, 'the same visible control accepts a retry');
            await h.operations[1];
            assert.equal((await api.getPendingImageJob(record.jobId)).state, 'cancelling');
            assert.deepEqual(serverCalls.at(-1), { owner: 'fixture', jobIds: [record.jobId], runIds: [] });
        });
    }
});
