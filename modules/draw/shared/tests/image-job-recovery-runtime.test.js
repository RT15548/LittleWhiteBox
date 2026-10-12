import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { indexedDB } from 'fake-indexeddb';

import { deriveDrawRunChildJobId, deriveDrawRunItemIds } from '../draw-run-identifiers.js';
import { hashSceneSource, normalizeMessageSceneSourceText } from '../scene-source.js';
import { isSceneSlotAlive, removeSceneSlotPlaceholders, setActiveMessageText } from '../scene-placement.js';

// 测真正的 adoption → IndexedDB → 页面接回 → 结算；仅替换宿主/画廊 IO 和 DOM 投影。
// 不发起付费生成，也不以源码字符串断言代替旧图是否仍在正文中的行为验证。
const host = { ctx: null, previews: new Map(), selections: new Map() };
globalThis.__drawRecoveryTest = host;
globalThis.indexedDB = indexedDB;
globalThis.window = new EventTarget();
globalThis.document = new EventTarget();

const stubs = {
    'extensions.js': 'export const getContext = () => globalThis.__drawRecoveryTest.ctx;',
    'user.js': 'export const getCurrentUserHandle = () => globalThis.__drawRecoveryTest.owner ?? "fixture";',
    'script.js': 'export const getRequestHeaders = () => ({});',
    'event-manager.js': `
        export const event_types = { CHAT_CHANGED: 'chat_changed' };
        export const createModuleEvents = () => ({ on() {}, cleanup() {} });
    `,
    'draw-run-recovery-runtime.js': 'export const runDrawRunRecoveryPass = async options => { globalThis.__drawRecoveryTest.drawRecovery = options; };',
    'draw-common.js': `
        export const isMessageBeingEdited = () => false;
        export const isAnyMessageBeingEdited = () => false;
        export const renderPreviewsForMessage = async () => {};
        export const materializeDrawSavedPreview = async () => null;
        export const ErrorType = { JOB_EXPIRED: { code: 'expired', label: 'expired', desc: 'expired' } };
        export const classifyError = () => ErrorType.JOB_EXPIRED;
    `,
    'gallery-cache.js': `
        const host = globalThis.__drawRecoveryTest;
        export const getPreview = async id => host.previews.get(id);
        export const storePreview = async value => host.previews.set(value.imgId, value);
        export const storeFailedPlaceholder = async value => storePreview({ ...value, status: 'failed' });
        export const deletePreview = async id => host.previews.delete(id);
        export const setSlotSelection = async (slot, id) => host.selections.set(slot, id);
        export const clearSlotSelection = async slot => host.selections.delete(slot);
    `,
};
const bundle = await build({
    stdin: {
        contents: `
            export * from './image-job-recovery-runtime.js';
            export * from './draw-run-adoption.js';
            export * from './pending-image-jobs.js';
            export * from './draw-cancellation-journal.js';
            export * from './draw-work-cancellation.js';
            export * from './backend-image-jobs.js';
        `,
        resolveDir: fileURLToPath(new URL('..', import.meta.url)),
    },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    plugins: [{
        name: 'recovery-host-boundaries',
        setup(builder) {
            builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
                const name = path.split('/').at(-1);
                return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
            });
            builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
        },
    }],
});
// 只执行本测试现场构建的本地模块，没有外部输入。
// eslint-disable-next-line no-unsanitized/method
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text + '\n//# sourceURL=draw-recovery-test.mjs').toString('base64')}`);

for (const backendState of ['cancelled', 'missing']) for (const preserveSlotsOnCancel of [true, false]) test(`replayed cancellation settles pending cards and preserves newer rerolls (${backendState}, preserve=${preserveSlotsOnCancel})`, async t => {
    const suffix = `${backendState}-${preserveSlotsOnCancel}`, slotId = 'cancel-' + suffix, keptSlot = 'kept-' + suffix;
    const message = { name: 'Alice', mes: `[image:${keptSlot}] [image:${slotId}]`, swipe_id: 0 };
    let persisted = structuredClone([message]);
    host.ctx = { chatId: 'cancel-chat', groupId: 'cancel-group', chat: [message], getRequestHeaders: () => ({}),
        async saveChat() { persisted = structuredClone(this.chat); } };
    host.previews.clear(); host.selections.clear();
    t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => structuredClone(persisted) }));
    const record = await api.recordPendingImageJob({ jobId: 'cancel-job-' + suffix, provider: 'sd-webui',
        delivery: { mode: 'slots', chatId: host.ctx.chatId, messageId: '0', preserveSlotsOnCancel },
        items: [{ index: 0, slotId: keptSlot, imgId: 'committed-old-' + suffix },
            { index: 1, slotId, imgId: 'pending-' + suffix, previewMetadata: { tags: 'kept tags' } }] });
    await api.markPendingImageJobActive(record.jobId, record.leaseId);
    await api.commitPendingImageJobItem(record.jobId, record.leaseId, 0);
    await api.renewPendingImageJobLease(record.jobId, record.leaseId, { now: 0 });
    const reroll = { imgId: 'rerolled-' + suffix, slotId: keptSlot, base64: 'new result', status: 'success' };
    host.previews.set(reroll.imgId, reroll); host.selections.set(keptSlot, reroll.imgId);
    host.previews.set(record.items[1].imgId, { ...record.items[1], status: 'pending' });
    await assert.rejects(api.cancelDrawWork({ owner: 'fixture', jobIds: [record.jobId], runIds: [] },
        { cancelWork: async () => { throw new Error('offline'); } }));
    const job = { id: record.jobId, state: 'cancelled', items: [{ index: 0, state: 'consumed' }, { index: 1, state: 'cancelled' }] };
    const calls = [];
    const client = api.createImageBackendJobsClient({ getOwner: () => 'fixture', fetchImpl: async (url, options = {}) => {
        calls.push({ url, method: options.method });
        return Response.json(url.endsWith('/v1/jobs') ? { ok: true, jobs: backendState === 'missing' ? [] : [job] } : { ok: true, job });
    } });
    api.startImageJobRecovery({ client, decoders: { 'sd-webui': async () => assert.fail('committed item must not be decoded again') } });
    t.after(() => api.stopImageJobRecovery());
    await api.reconcilePendingImageJobs();
    assert.deepEqual(await api.drawCancellationJournal.list(), []);
    assert.equal(await api.getPendingImageJob(record.jobId), null);
    assert.equal(host.previews.get(record.items[1].imgId)?.status, preserveSlotsOnCancel ? 'failed' : undefined);
    assert.equal(isSceneSlotAlive(message.mes, slotId), preserveSlotsOnCancel);
    assert.equal(host.previews.get(reroll.imgId), reroll);
    assert.equal(host.selections.get(keptSlot), reroll.imgId);
    assert.equal(calls.some(call => call.method === 'POST' && call.url.endsWith('/v1/jobs')), false);
});

test('online retry and new delivery proceed while an unrelated recovered job is still running', { timeout: 5000 }, async t => {
    host.ctx = { chatId: 'independent-recovery', chat: [] };
    host.previews.clear();
    t.mock.method(console, 'warn', () => {});
    const entered = Promise.withResolvers(), finish = Promise.withResolvers(), acknowledged = Promise.withResolvers();
    let offline = true, finished = false;
    const attachments = [], passes = [];
    async function recordJob(id) {
        const record = await api.recordPendingImageJob({ jobId: id, provider: 'sd-webui', delivery: { mode: 'gallery' },
            items: [{ index: 0, slotId: id + '-slot', imgId: id + '-image' }] });
        await api.markPendingImageJobActive(id, record.leaseId);
        await api.renewPendingImageJobLease(id, record.leaseId, { now: 0 });
    }
    await recordJob('long-job');
    await api.drawCancellationJournal.record({ owner: 'fixture', jobIds: ['cancel-job'], runIds: [] });
    const backendJobs = [{ id: 'long-job' }];
    api.startImageJobRecovery({ client: {
        async cancelWork() { if (offline) throw new Error('offline'); acknowledged.resolve(); },
        listJobs: async () => backendJobs,
        async attachJob(id, handlers) {
            attachments.push(id);
            if (id === 'long-job') { entered.resolve(); await finish.promise; finished = true; }
            await handlers.onItemReady({ index: 0, response: {} });
            return { job: { id, state: 'completed' } };
        },
    }, decoders: { 'sd-webui': async () => 'delivered' } });
    t.after(async () => { api.stopImageJobRecovery(); finish.resolve(); await Promise.all(passes); });
    passes.push(api.reconcilePendingImageJobs());
    await entered.promise;
    offline = false;
    window.dispatchEvent(new Event('online'));
    await acknowledged.promise;
    assert.equal(finished, false);
    await recordJob('new-job'); backendJobs.push({ id: 'new-job' });
    passes.push(api.reconcilePendingImageJobs(), api.reconcilePendingImageJobs());
    for (let attempt = 0; attempt < 100 && await api.getPendingImageJob('new-job'); attempt++) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    assert.equal(await api.getPendingImageJob('new-job'), null);
    assert.equal(host.previews.get('new-job-image')?.base64, 'delivered');
    assert.deepEqual(await api.drawCancellationJournal.list(), []);
    assert.deepEqual(attachments, ['long-job', 'new-job']);
    assert.equal(finished, false);
    finish.resolve(); await Promise.all(passes);
    assert.equal(await api.getPendingImageJob('long-job'), null);
});

test('a failed cancellation isolates its jobs and parent without blocking unrelated ready delivery', async t => {
    host.ctx = { chatId: 'isolation-chat', chat: [{ mes: '[image:blocked-slot] [image:ready-slot]' }] };
    host.previews.clear(); host.selections.clear();
    t.mock.method(console, 'warn', () => {});
    const records = [];
    for (const id of ['blocked', 'ready']) {
        const record = await api.recordPendingImageJob({ jobId: id + '-job', provider: 'sd-webui',
            ...(id === 'blocked' ? { originRunId: 'blocked-plan', originRunAckReady: true, sourceHash: 'source',
                chatTarget: { kind: 'group', chatId: host.ctx.chatId, body: { id: host.ctx.chatId } } } : {}),
            delivery: { mode: 'slots', chatId: host.ctx.chatId, messageId: '0', swipeIndex: 0 },
            items: [{ index: 0, slotId: id + '-slot', imgId: id + '-image' }] });
        await api.markPendingImageJobActive(record.jobId, record.leaseId);
        await api.renewPendingImageJobLease(record.jobId, record.leaseId, { now: 0 });
        records.push(record);
    }
    const intent = await api.drawCancellationJournal.record({ owner: 'fixture', jobIds: ['blocked-job'], runIds: [] });
    const attachments = [], cancellations = [];
    const before = await api.getPendingImageJob('blocked-job');
    api.startImageJobRecovery({ client: {
        cancelWork: async targets => { cancellations.push(targets); throw Object.assign(new Error('limit'), { code: 'cancellation_limit' }); },
        listJobs: async () => records.map(record => ({ id: record.jobId })),
        attachJob: async (id, callbacks) => {
            attachments.push(id); await callbacks.onItemReady({ index: 0, response: {} });
            return { job: { id, state: 'completed' } };
        },
    }, decoders: { 'sd-webui': async () => 'ready-image' } });
    t.after(async () => {
        api.stopImageJobRecovery();
        await api.forgetPendingImageJob(before.jobId, before.leaseId);
        await api.drawCancellationJournal.forget(intent.id);
    });
    await api.reconcilePendingImageJobs();
    assert.deepEqual(attachments, ['ready-job']);
    assert.equal(host.previews.get('ready-image').base64, 'ready-image');
    assert.deepEqual(await api.getPendingImageJob('blocked-job'), before);
    assert.equal(host.drawRecovery.excludedRunIds.has('blocked-plan'), true);
    assert.equal(host.drawRecovery.records.some(record => record.jobId === 'blocked-job'), false);
    assert.ok(cancellations.length > 0);
    for (const targets of cancellations) assert.deepEqual(targets, { owner: 'fixture', jobIds: ['blocked-job'], runIds: [] });
    assert.deepEqual(await api.drawCancellationJournal.list(), [intent]);
});

for (const late of ['ready', 'failed', 'cancelled', 'missing', 'settling-fail', 'settling-discard']) {
    test(`old batch ${late} cannot overwrite a reroll after its delivered cache was cleared`, async t => {
        const slotId = `receipt-${late}`, sibling = `${slotId}-sibling`;
        const message = { name: 'Alice', mes: `[image:${slotId}] [image:${sibling}]`, swipe_id: 0 };
        let persistedChat = structuredClone([message]);
        host.ctx = { chatId: 'receipt-chat', groupId: 'receipt-group', chat: [message], getRequestHeaders: () => ({}),
            async saveChat() { persistedChat = structuredClone(this.chat); } };
        t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => structuredClone(persistedChat) }));
        host.previews.clear(); host.selections.clear();
        const record = await api.recordPendingImageJob({ jobId: `job-${slotId}`, provider: 'sd-webui',
            delivery: { mode: 'slots', chatId: host.ctx.chatId, messageId: '0', preserveSlotsOnCancel: true },
            items: [{ index: 0, slotId, imgId: `old-${slotId}` }, { index: 1, slotId: sibling, imgId: `old-${sibling}` }] });
        await api.markPendingImageJobActive(record.jobId, record.leaseId);
        await api.commitPendingImageJobItem(record.jobId, record.leaseId, 0);
        const rerolled = { imgId: `new-${slotId}`, slotId, base64: 'new', tags: 'new tags' };
        host.previews.set(rerolled.imgId, rerolled);
        host.selections.set(slotId, rerolled.imgId);
        if (late === 'cancelled') await api.markPendingImageJobCancelling(record.jobId, record.leaseId);
        if (late.startsWith('settling-')) await api.markPendingImageJobSettling(record.jobId, record.leaseId,
            { mode: late.slice('settling-'.length) });
        await api.renewPendingImageJobLease(record.jobId, record.leaseId, { now: 0 });
        let decoded = 0;
        t.after(() => api.stopImageJobRecovery());
        api.startImageJobRecovery({ client: {
            listJobs: async () => late === 'missing' || late.startsWith('settling-') ? [] : [{ id: record.jobId }],
            attachJob: async (_id, handlers) => {
                if (late === 'ready') await handlers.onItemReady({ index: 0, response: {} });
                else await handlers.onItemSettled({ index: 0, state: late, source: 'backend' });
                await handlers.onItemSettled({ index: 1, state: 'failed', source: 'backend' });
                return {};
            },
        }, decoders: { 'sd-webui': async () => { decoded++; return 'old'; } } });
        await api.reconcilePendingImageJobs();
        assert.equal(host.selections.get(slotId), rerolled.imgId);
        assert.equal(host.previews.get(rerolled.imgId), rerolled);
        assert.equal(host.previews.has(record.items[0].imgId), false);
        assert.equal(isSceneSlotAlive(message.mes, slotId), true);
        assert.equal(decoded, 0);
        assert.equal(await api.getPendingImageJob(record.jobId), null);
    });
}

for (const mode of ['complete', 'fail', 'discard']) {
    for (const userDeletedSlot of [false, true]) {
        test(`recovered ${mode} keeps three old images${userDeletedSlot ? ' and respects a deleted new slot' : ''}`, async t => {
            const original = 'Alpha.[image:old-1] Beta.[image:old-2][image:old-3]';
            const message = { name: 'Alice', mes: original, swipe_id: 1, swipes: ['other swipe', original] };
            let persistedChat = structuredClone([message]);
            const saves = [];
            host.ctx = {
                chatId: 'chat-1', groupId: 'group-1', chat: [message], getRequestHeaders: () => ({}),
                async saveChat() {
                    persistedChat = structuredClone(this.chat);
                    saves.push(message.mes);
                },
            };
            t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => structuredClone(persistedChat) }));
            host.previews.clear();
            host.selections.clear();
            const oldPreviews = [1, 2, 3].map(n => ({ slotId: `old-${n}`, imgId: `old-img-${n}`, base64: `old-${n}` }));
            for (const image of oldPreviews) {
                host.previews.set(image.imgId, image);
                host.selections.set(image.slotId, image.imgId);
            }

            const runId = `run-test-${mode}-${userDeletedSlot ? 2 : 1}`;
            const sourceText = normalizeMessageSceneSourceText(original);
            const sourceHash = hashSceneSource(sourceText);
            const marker = { version: 1, provider: 'sd-webui', sourceHash, targetHash: hashSceneSource(original), createdAt: 100 };
            const items = [0, 1].map(index => ({
                index, ...deriveDrawRunItemIds(runId, index), insertOffset: sourceText.length,
            }));
            const run = {
                id: runId, provider: marker.provider, state: 'dispatched', sourceHash,
                handoffManifest: {
                    childJobId: deriveDrawRunChildJobId(runId), provider: marker.provider,
                    sourceHash, placementContract: 1, items,
                },
            };
            const adopted = await api.adoptExistingJobFromDrawRun({
                run, marker,
                chatTarget: { kind: 'group', chatId: 'chat-1', endpoint: '/api/chats/group/get', body: { id: 'chat-1' } },
                resolveTarget: () => ({ runId, marker, message, messageId: 0, swipeIndex: 1, chatId: 'chat-1' }),
                confirmSlots: () => host.ctx.saveChat(),
            });
            assert.equal(adopted.status, 'ready');
            const { jobId, leaseId } = adopted.record;
            await api.markPendingImageJobOriginRunAckReady(jobId, leaseId, runId);
            await api.activateAdoptingPendingImageJob(jobId, leaseId);
            await api.markPendingImageJobSettling(jobId, leaseId, { mode });
            await api.renewPendingImageJobLease(jobId, leaseId, { now: 0 });

            // 成功结果已落画廊，另一张可能尚未完成；页面此时退出，下一页面负责结算。
            for (const item of items) host.previews.set(item.imgId, { ...item, status: 'pending', tags: 'kept input' });
            if (mode !== 'fail') host.previews.set(items[0].imgId, { ...items[0], base64: 'new-1' });
            if (mode === 'complete') host.previews.set(items[1].imgId, { ...items[1], base64: 'new-2' });
            if (userDeletedSlot) {
                setActiveMessageText(message, removeSceneSlotPlaceholders(message.mes, [items[1].slotId]));
                await host.ctx.saveChat();
            }
            const beforeRecovery = message.mes;
            let acknowledged = 0;
            t.after(() => api.stopImageJobRecovery());
            api.startImageJobRecovery({
                client: { listJobs: async () => [] },
                drawRunsClient: { acknowledgeRun: async () => { acknowledged += 1; } },
            });
            await api.reconcilePendingImageJobs();

            const expected = mode === 'discard'
                ? removeSceneSlotPlaceholders(beforeRecovery, [items[1].slotId])
                : beforeRecovery;
            assert.equal(message.mes, expected);
            assert.deepEqual(message.swipes, ['other swipe', expected]);
            assert.equal(persistedChat[0].mes, expected);
            for (const text of saves) {
                for (const old of oldPreviews) assert.equal(isSceneSlotAlive(text, old.slotId), true);
            }
            for (const old of oldPreviews) {
                assert.equal(host.previews.get(old.imgId), old);
                assert.equal(host.selections.get(old.slotId), old.imgId);
            }
            if (mode === 'fail') {
                assert.equal(host.previews.get(items[0].imgId)?.status, 'failed');
                assert.equal(host.previews.get(items[1].imgId)?.status === 'failed', !userDeletedSlot);
                if (userDeletedSlot) assert.equal(host.previews.has(items[1].imgId), false);
            }
            assert.equal(await api.getPendingImageJob(jobId), null);
            assert.equal(acknowledged, 1);
        });
    }
}
