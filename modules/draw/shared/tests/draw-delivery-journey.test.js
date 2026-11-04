import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { indexedDB } from 'fake-indexeddb';

// User contracts, cost: lost paid images, duplicate purchases, cross-account writes.
// - Host saving never gates submission/adoption/delivery; no whole-chat readback.
// - An unsaved marker survives page loss and appended text through the same journal.
// - Lost submission responses are queried, never POSTed twice.
// - Explicit deletion and another account cannot lend attachment authority.
const host = { ctx: null, owner: 'alice', saves: 0, previews: new Map(), selections: new Map() };
globalThis.__drawDeliveryJourney = host;
globalThis.indexedDB = indexedDB;
globalThis.window = new EventTarget();
globalThis.document = new EventTarget();
const stubs = {
    'image-autosave.js': 'export const autoSaveDeliveredImage=async()=>false; export const imageFilePrefix=()=>"draw";',
    'extensions.js': 'export const getContext=()=>globalThis.__drawDeliveryJourney.ctx;',
    'user.js': 'export const getCurrentUserHandle=()=>globalThis.__drawDeliveryJourney.owner;',
    'script.js': `export const getRequestHeaders=()=>({}); export const syncMesToSwipe=()=>true;
        export const saveChatDebounced=()=>{globalThis.__drawDeliveryJourney.saves++;};`,
    'utils.js': 'export const uuidv4=()=>globalThis.crypto.randomUUID();',
    'event-manager.js': `export const event_types={CHAT_CHANGED:'chat_changed'};
        export const createModuleEvents=()=>({on(){},cleanup(){}});`,
    'draw-common.js': `export const isMessageBeingEdited=()=>false;
        export const isAnyMessageBeingEdited=()=>false;
        export const syncRenderedMessageFromState=async()=>{};
        export const renderPreviewsForMessage=async()=>{};
        export const materializeDrawSavedPreview=async()=>null;
        export const ErrorType={JOB_EXPIRED:{code:'expired',label:'expired',desc:'expired'}};
        export const classifyError=()=>ErrorType.JOB_EXPIRED;`,
    'gallery-cache.js': `const h=globalThis.__drawDeliveryJourney;
        export const getPreview=async id=>h.previews.get(id);
        export const storePreview=async value=>h.previews.set(value.imgId,value);
        export const storeFailedPlaceholder=async value=>storePreview({...value,status:'failed'});
        export const deletePreview=async id=>h.previews.delete(id);
        export const setSlotSelection=async(slot,id)=>h.selections.set(slot,id);
        export const clearSlotSelection=async slot=>h.selections.delete(slot);`,
};
const bundle = await build({
    stdin: { resolveDir: fileURLToPath(new URL('..', import.meta.url)), contents: `
        export * from './draw-run-coordinator.js'; export * from './draw-run-recovery-runtime.js';
        export * from './draw-run-target.js'; export * from './draw-run-identifiers.js';
        export * from './draw-run-markers.js'; export * from './pending-image-jobs.js';
        export * from './image-job-recovery-runtime.js'; export * from './scene-source.js';
        export * from './chat-image-persistence.js'; export * from './draw-chat-save.js';` },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'host-boundaries', setup(builder) {
        builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
            const name = path.split('/').at(-1);
            return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
        });
        builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Only this locally built fixture module is evaluated.
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

async function setup(t, suffix, lostResponse = false) {
    const source = 'The sea is calm.\n\nA boat approaches.';
    const message = { mes: source, name: 'Alice', send_date: `date-${suffix}`, swipe_id: 0 };
    host.owner = 'alice'; host.saves = 0; host.previews.clear(); host.selections.clear();
    host.ctx = { chatId: suffix, groupId: 'group', chat: [message], getRequestHeaders: () => ({}),
        saveChat: () => new Promise(() => {}) };
    const before = structuredClone(host.ctx.chat);
    const runId = `run-${suffix}`, jobId = api.deriveDrawRunChildJobId(runId);
    const sourceHash = api.hashSceneSource(source);
    let posts = 0, lookups = 0;
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        assert.ok(String(url).includes('/v1/draw-runs'), 'drawing must never read back the chat');
        if (options.method === 'POST') {
            posts++;
            assert.ok(await api.getPendingImageJob(jobId), 'durable receipt precedes any paid work');
            if (lostResponse) throw new Error('submission response lost');
            return Response.json({ run: { id: runId } }, { status: 202 });
        }
        lookups++;
        return Response.json({ run: { id: runId } });
    });
    if (lostResponse) t.mock.method(console, 'warn', () => {});
    t.after(async () => {
        api.stopImageJobRecovery();
        for (const record of await api.listPendingImageJobs()) await api.forgetPendingImageJob(record.jobId, record.leaseId);
    });
    const submit = id => api.submitDrawRun({ ctx: host.ctx, getCurrentContext: () => host.ctx,
        message: host.ctx.chat[0], messageId: 0, targetHash: sourceHash, targetLength: source.length,
        prepared: { version: 1, planner: { validationContext: { sceneSource: { sourceHash } } },
            agent: { providerConfig: { provider: 'openai-compatible' } } },
        imageProvider: 'sd-webui', generationRecipe: {}, runId: id,
        owner: api.getImageChatIdentity(host.ctx), requestSave: api.requestDrawChatSave });
    assert.equal((await submit(runId)).status, 'accepted');
    const items = [0, 1].map(index => ({ index, ...api.deriveDrawRunItemIds(runId, index),
        insertOffset: source.length, displayMetadata: { tags: `scene ${index}` } }));
    const run = { id: runId, state: 'dispatched', provider: 'sd-webui', sourceHash,
        childJobId: jobId, handoffManifest: { childJobId: jobId, provider: 'sd-webui', sourceHash,
            placementContract: 1, items } };
    return { source, before, runId, jobId, items, submit, counts: () => ({ posts, lookups }),
        client: { listRuns: async () => [run], acknowledgeRun: async () => {},
            cancelRun: async () => assert.fail('no implicit cancellation') } };
}

for (const lostResponse of [false, true]) test(`unsaved submission and continuation deliver without waiting for chat I/O (lost response=${lostResponse})`, { timeout: 5000 }, async t => {
    const h = await setup(t, `unsaved-${lostResponse}`, lostResponse);
    // Lose every in-memory marker as if the page closed before the host saved.
    host.ctx.chat = structuredClone(h.before);
    await assert.rejects(h.submit(`duplicate-${lostResponse}`), { code: 'PENDING_JOB_CONFLICT' });
    const suffix = '\n\nThe story continues.';
    host.ctx.chat[0].mes += suffix;
    api.startImageJobRecovery({ drawRunsClient: h.client, client: {
        listJobs: async () => [{ id: h.jobId }],
        async attachJob(id, callbacks) {
            assert.equal(id, h.jobId);
            for (const item of h.items) await callbacks.onItemReady({ index: item.index, response: {} });
            return { job: { id, state: 'completed' } };
        },
    }, decoders: { 'sd-webui': async () => 'paid-image' } });
    await api.reconcilePendingImageJobs();
    const text = host.ctx.chat[0].mes;
    for (const item of h.items) {
        assert.ok(text.includes(`[image:${item.slotId}]`));
        assert.equal(host.previews.get(item.imgId).base64, 'paid-image');
        assert.equal(host.previews.get(item.imgId).placement.sourceLength, h.source.length);
    }
    assert.ok(text.indexOf(h.items[0].slotId) < text.indexOf(h.items[1].slotId));
    assert.ok(text.endsWith(suffix));
    assert.equal(await api.getPendingImageJob(h.jobId), null);
    assert.deepEqual(h.counts(), { posts: 1, lookups: lostResponse ? 1 : 0 });
    assert.ok(host.saves > 0, 'normal host autosave was requested, not awaited');
});

test('journal recovery honors account, original text, moved floors and explicit deletion', { timeout: 5000 }, async t => {
    const h = await setup(t, 'target-authority');
    host.ctx.chat = [{ mes: 'unrelated' }, ...structuredClone(h.before)];
    const recover = () => api.runDrawRunRecoveryPass({ ctx: host.ctx, records: [], client: h.client, scheduleRecovery() {} });
    const receipt = await api.getPendingImageJob(h.jobId);
    host.owner = 'bob';
    api.restoreDrawRunTargets(host.ctx, [receipt]);
    assert.equal(api.findDrawRunMarker(host.ctx.chat, h.runId), null);
    host.owner = 'alice';
    host.ctx.chat[1].mes = 'Edited original';
    api.restoreDrawRunTargets(host.ctx, [receipt]);
    assert.equal(api.findDrawRunMarker(host.ctx.chat, h.runId), null);
    host.ctx.chat[1].mes = h.source + '\nA continuation';
    api.restoreDrawRunTargets(host.ctx, [receipt]);
    assert.equal(api.findDrawRunMarker(host.ctx.chat, h.runId).messageId, 1);
    await recover();
    let record = await api.getPendingImageJob(h.jobId);
    assert.equal(record.state, 'active');
    await api.discardPendingImageSlot(h.items[0].slotId);
    record = await api.getPendingImageJob(h.jobId);
    host.ctx.chat[1] = { ...structuredClone(h.before[0]), mes: h.source + '\nMore continuation' };
    api.restoreDrawRunTargets(host.ctx, [record]);
    assert.ok(!host.ctx.chat[1].mes.includes(h.items[0].slotId), 'deleted image cannot be resurrected');
    assert.ok(host.ctx.chat[1].mes.includes(h.items[1].slotId), 'remaining paid image is recoverable');
    assert.equal(host.ctx.chat[0].mes, 'unrelated');
    assert.equal(h.counts().posts, 1);
});
