import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';
import { maintenanceFixture } from './fixtures/memory-maintenance.js';

// The old defect starves timers, so isolate the real transaction in a worker.
// The parent can still fail and terminate it rather than hang the entire suite.
const bundle = await build({
    stdin: { resolveDir: fileURLToPath(new URL('../data/', import.meta.url)), contents: `
        export * from './memory-commit.js';
        export { reload } from 'script.js';` },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'memory-owner-host', setup(builder) {
        const shims = {
            'extensions.js': 'export const getContext=()=>globalThis.__commitHost.context;',
            'script.js': 'export let chat_metadata=globalThis.__commitHost.metadata;export const getRequestHeaders=()=>({});export function reload(){chat_metadata=globalThis.__commitHost.metadata;}',
        };
        builder.onResolve({ filter: /(?:^|\/)\w+\.js$/ }, ({ path }) => {
            const name = path.split('/').at(-1);
            return Object.hasOwn(shims, name) ? { path: name, namespace: 'host' } : null;
        });
        builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: shims[path] }));
    } }],
});
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64');

async function scenario() {
    const { parentPort, workerData } = await import('node:worker_threads');
    let releaseSave, announceSave, writes = 0;
    const started = new Promise(resolve => { announceSave = resolve; });
    const metadata = { extensions: { LittleWhiteBox: { storySummary: { json: workerData.summary } } } };
    const context = { chatId: 'chat-A', groupId: 'fixture', async saveMetadata() {
        writes++; announceSave(); await new Promise(resolve => { releaseSave = resolve; });
    } };
    const host = globalThis.__commitHost = { metadata, context };
    globalThis.fetch = async () => { throw new Error('offline confirmation fixture'); };
    // eslint-disable-next-line no-unsanitized/method -- Only the locally built transaction module is executed.
    const api = await import(workerData.moduleUrl);
    const next = api.readSummaryMemory();
    next.storySummary.json.facts[0].o = 'first write';
    const saving = api.commitSummaryMemory('chat-A', next).then(() => null, error => error.code);
    await started;
    const later = api.readSummaryMemory(); later.storySummary.json.facts[0].o = 'queued write';
    const queued = api.commitSummaryMemory('chat-A', later).then(() => null, error => error.code);
    host.metadata = { extensions: { LittleWhiteBox: { storySummary: { json: { facts: ['untouched'] } } } } };
    host.context = { ...context, chatId: workerData.switchChat ? 'chat-B' : 'chat-A' };
    api.reload();
    const untouched = JSON.stringify(host.metadata);
    const heartbeat = new Promise(resolve => setTimeout(() => resolve(true), 20));
    releaseSave();
    const [firstCode, queuedCode, timerRan] = await Promise.all([saving, queued, heartbeat]);
    const newOwnerReady = api.getMemoryCommitState() === 'ready';
    const newOwnerUnchanged = JSON.stringify(host.metadata) === untouched;
    host.metadata = metadata; host.context = context; api.reload();
    parentPort.postMessage({ firstCode, queuedCode, timerRan, writes, newOwnerReady, newOwnerUnchanged,
        oldOwnerState: api.getMemoryCommitState() });
}

for (const switchChat of [true, false]) test(`queued writes stop when ${switchChat ? 'the chat changes' : 'the same chat metadata is reloaded'} during failed confirmation`, async t => {
    const worker = new Worker(`(${scenario.toString()})()`, { eval: true,
        workerData: { moduleUrl, switchChat, summary: maintenanceFixture().json } });
    t.after(() => worker.terminate());
    const result = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('queued memory write starved its worker heartbeat')), 5000);
        worker.once('message', value => { clearTimeout(timeout); resolve(value); });
        worker.once('error', error => { clearTimeout(timeout); reject(error); });
        worker.once('exit', code => { clearTimeout(timeout); reject(new Error(`transaction worker exited before reporting its result (${code})`)); });
    });
    assert.deepEqual(result, { firstCode: 'metadata_save_unconfirmed', queuedCode: 'summary_chat_changed_before_save',
        timerRan: true, writes: 1, newOwnerReady: true, newOwnerUnchanged: true, oldOwnerState: 'unconfirmed' });
});
