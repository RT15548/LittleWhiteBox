import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';
import { indexedDB } from 'fake-indexeddb';

// Exercise the real planner recovery boundary, marker persistence and journal;
// only the host and DOM projection are substituted. A blocked group's parent
// must not be adopted/ACKed while unrelated terminal runs can still settle.
const host = { ctx: null };
globalThis.__drawRunRecoveryTest = host;
globalThis.indexedDB = indexedDB;
globalThis.window = new EventTarget();
const stubs = {
    'extensions.js': 'export const getContext=()=>globalThis.__drawRunRecoveryTest.ctx;',
    'script.js': 'export const syncMesToSwipe=()=>true;',
    'draw-common.js': 'export const isMessageBeingEdited=()=>false;export const syncRenderedMessageFromState=async()=>{};',
};
const bundle = await build({
    stdin: { resolveDir: fileURLToPath(new URL('..', import.meta.url)), contents: `
        export * from './draw-run-recovery-runtime.js';
        export * from './draw-run-markers.js';
        export * from './pending-image-jobs.js';` },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'draw-run-host-boundaries', setup(builder) {
        builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
            const name = path.split('/').at(-1);
            return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
        });
        builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
    } }],
});
// Only the locally built test module is evaluated, never external input.
// eslint-disable-next-line no-unsanitized/method
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text
    + '\n//# sourceURL=draw-run-recovery-test.mjs').toString('base64')}`);

test('unconfirmed groups protect parent markers and adoption records without blocking other run settlement', async t => {
    const blocked = 'run-blocked-marker', adopting = 'run-blocked-adoption', ready = 'run-unrelated-terminal';
    const messages = [blocked, ready].map(runId => ({ mes: runId, extra: { xbDrawRuns: {
        [runId]: api.createDrawRunMarker({ provider: 'sd-webui', sourceHash: 'source', targetHash: 'target' }),
    } } }));
    let persisted = structuredClone(messages);
    host.ctx = { chatId: 'isolation', groupId: 'fixture-group', chat: messages, getRequestHeaders: () => ({}),
        async saveChat() { persisted = structuredClone(this.chat); } };
    t.mock.method(globalThis, 'fetch', async () => Response.json(persisted));
    const record = await api.createAdoptingPendingImageJob({ jobId: 'blocked-child', provider: 'sd-webui',
        originRunId: adopting, sourceHash: 'source',
        chatTarget: { kind: 'group', chatId: 'isolation', body: { id: 'isolation' } },
        delivery: { mode: 'slots', chatId: 'isolation', messageId: '0', swipeIndex: 0 },
        items: [{ index: 0, slotId: 'unadopted-slot', imgId: 'unadopted-img' }] });
    await api.renewPendingImageJobLease(record.jobId, record.leaseId, { now: 0 });
    const before = await api.getPendingImageJob(record.jobId);
    t.after(() => api.forgetPendingImageJob(record.jobId, record.leaseId));
    const acknowledgements = [], cancellations = [], adopted = [];
    const runs = [blocked, adopting, ready].map(id => ({ id, state: 'cancelled', provider: 'sd-webui' }));
    await api.runDrawRunRecoveryPass({ ctx: host.ctx, records: [before],
        excludedRunIds: new Set([blocked, adopting]), scheduleRecovery() {},
        onAdoptionReady: record => adopted.push(record),
        client: { listRuns: async () => runs, cancelRun: async id => cancellations.push(id),
            acknowledgeRun: async id => acknowledgements.push(id) },
    });
    assert.deepEqual(acknowledgements, [ready]);
    assert.deepEqual(cancellations, []);
    assert.deepEqual(adopted, []);
    assert.ok(api.findDrawRunMarker(messages, blocked));
    assert.ok(api.findDrawRunMarker(persisted, blocked));
    assert.equal(api.findDrawRunMarker(messages, ready), null);
    assert.equal(api.findDrawRunMarker(persisted, ready), null);
    assert.deepEqual(await api.getPendingImageJob(record.jobId), before);
});
