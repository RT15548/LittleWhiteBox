import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';

// Acceptance: the actual iframe handler must retain paid output across write /
// history-read failures, reopen, retry and concurrent messages, without resubmit.
const host = {};
globalThis.__quickTestHandler = host;
const stubs = {
    'novel-prompts.js': 'exports.DEFAULT_PROMPT_CONFIG={topSystem:"fixture",topSystemPov:"fixture",sceneRules:"fixture"};exports.PROMPT_TEMPLATE_VERSION=1;exports.normalizeNovelPromptGuideOverrides=()=>({});',
    'extensions.js': 'exports.getContext=()=>({chat:[],characters:[]});',
    'script.js': 'exports.getRequestHeaders=()=>({});',
    'utils.js': 'exports.uuidv4=()=>"fixture-id";',
    'user.js': 'exports.getCurrentUserHandle=()=>"fixture-user";',
    'event-manager.js': 'exports.createModuleEvents=()=>({});exports.event_types={};',
    'server-storage.js': 'exports.NovelDrawStorage={getStrict:(...args)=>globalThis.__quickTestHandler.storage.getStrict(...args),updateAndSave:(...args)=>globalThis.__quickTestHandler.storage.updateAndSave(...args)};',
    'gallery-cache.js': 'exports.storePreview=record=>globalThis.__quickTestHandler.store(record);exports.getSlotPreviewPage=(...args)=>globalThis.__quickTestHandler.page(...args);exports.deletePreview=id=>globalThis.__quickTestHandler.remove(id);exports.getPreview=id=>globalThis.__quickTestHandler.read(id);exports.getGalleryOverview=async()=>({stats:{count:1},summary:{}});',
    'scene-planner.js': 'module.exports={};',
    'worldbook-processor.js': 'module.exports={};',
    'draw-agent.js': 'module.exports={};',
    'draw-common.js': 'exports.DEFAULT_MESSAGE_FILTER_RULES=[];',
    'after-ai-gate.js': 'module.exports={};',
    'iframe-messaging.js': 'exports.isTrustedMessage=()=>true;exports.postToIframe=(_,message)=>globalThis.__quickTestHandler.messages.push(message);',
};
const bundle = await build({
    entryPoints: [fileURLToPath(new URL('../novel-draw.js', import.meta.url))],
    bundle: true, write: false, platform: 'node', format: 'esm',
    plugins: [{ name: 'quick-test-io', setup(builder) {
        builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
            const name = path.split('/').at(-1);
            return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
        });
        builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
        builder.onLoad({ filter: /[\\/]novel-draw\.js$/ }, async ({ path }) => ({
            contents: `${await readFile(path, 'utf8')}\ngenerateNovelImage = (...args) => globalThis.__quickTestHandler.generate(...args); export { handleFrameMessage, pushTestHistory }; export {loadSharedDrawSettings, getSharedDrawSettings, mergeNovelDrawProviderSettingsIntoStorageRoot} from '../../shared/draw-settings.js';`,
        }));
    } }],
});

test('handler restores an unsaved result after iframe close and retries storage without generating', async () => {
    const { document, window } = parseHTML('<html><body><iframe id="xiaobaix-novel-draw-iframe"></iframe></body></html>');
    Object.assign(globalThis, { document, window });
    host.messages = [];
    let requests = 0, writes = 0, fail = true, release;
    const persisted = [];
    host.generate = async () => { requests++; await new Promise(resolve => { release = resolve; }); return 'aGVsbG8='; };
    host.store = async record => { writes++; if (fail) throw new Error('quota'); persisted.push({ ...record, persistence: undefined }); };
    host.page = async () => { if (fail) throw new Error('read failed'); return { items: persisted, hasMore: false }; };
    // eslint-disable-next-line no-unsanitized/method -- Only local source and fixed offline I/O stubs enter this test bundle.
    const api = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text + '\n//# sourceURL=quick-test-handler-fixture.mjs').toString('base64'));
    const message = data => api.handleFrameMessage({ data });
    const first = message({ type: 'TEST_SINGLE' });
    await Promise.resolve();
    await message({ type: 'TEST_SINGLE' });
    document.getElementById('xiaobaix-novel-draw-iframe').remove();
    release();
    await first;
    const frame = document.createElement('iframe'); frame.id = 'xiaobaix-novel-draw-iframe'; document.body.append(frame);
    await message({ type: 'TEST_HISTORY' });
    const restored = host.messages.findLast(event => event.type === 'TEST_RESULT');
    assert.equal(restored.items[0].base64, 'aGVsbG8=');
    assert.equal(restored.items[0].persistence, 'unsaved');
    assert.equal(host.messages.at(-1).type, 'TEST_HISTORY_FAILED');
    const warning = new window.Event('beforeunload', { cancelable: true });
    window.dispatchEvent(warning);
    assert.equal(warning.defaultPrevented, true);
    fail = false;
    await message({ type: 'TEST_RETRY_SAVE', imgId: restored.items[0].imgId });
    assert.equal(requests, 1);
    assert.equal(writes, 2);
    assert.equal(host.messages.findLast(event => event.type === 'TEST_RESULT').items[0].imgId, restored.items[0].imgId);
    assert.equal(host.messages.at(-1).state, 'success');
    const settled = new window.Event('beforeunload', { cancelable: true });
    window.dispatchEvent(settled);
    assert.equal(settled.defaultPrevented, false);

    const reads = [];
    host.page = async (_slotId, options) => new Promise(resolve => reads.push({ options, resolve }));
    const oldPage = api.pushTestHistory(undefined, 0);
    const latestPage = api.pushTestHistory(undefined, 24);
    reads[1].resolve({ items: [{ imgId: 'page-two', savedUrl: '/image.png' }], hasMore: true });
    await latestPage;
    reads[0].resolve({ items: [{ imgId: 'page-one', savedUrl: '/image.png' }], hasMore: true });
    await oldPage;
    assert.equal(host.messages.at(-1).items[0].imgId, 'page-two');
    assert.equal(host.messages.at(-1).offset, 24);
});

// Acceptance: iframe commands must reach storage/export and settle with a receipt.
// Cost: lost image records, an unusable export, or a silently discarded save policy.
test('gallery host handles JPEG persistence, partial deletion, ZIP export and cancellation', async () => {
    const { document, window } = parseHTML('<html><body><iframe id="xiaobaix-novel-draw-iframe"></iframe></body></html>');
    Object.assign(globalThis, { document, window });
    host.messages = [];
    let root = { settings: { imageTitleMode: 'collapse', saveAsJpeg: false } };
    let failSave = false;
    host.storage = {
        getStrict: async key => structuredClone(root[key]),
        updateAndSave: async mutate => {
            const draft = structuredClone(root);
            await mutate(draft);
            if (failSave) return false;
            root = draft;
            return true;
        },
    };
    // eslint-disable-next-line no-unsanitized/method -- Local source and offline I/O stubs only.
    const api = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text + '\n//# sourceURL=gallery-handler-fixture.mjs').toString('base64'));
    await api.loadSharedDrawSettings();
    const send = data => api.handleFrameMessage({ data });
    await send({ type: 'SAVE_JPEG', saveAsJpeg: true });
    assert.equal(root.settings.saveAsJpeg, true);
    assert.equal(root.settings.imageTitleMode, 'collapse');
    assert.equal(api.getSharedDrawSettings().saveAsJpeg, true);
    assert.equal(api.mergeNovelDrawProviderSettingsIntoStorageRoot(root.settings, { mode: 'nai' }).saveAsJpeg, true);
    assert.equal(host.messages.at(-1).target, 'jpeg');
    assert.equal(host.messages.at(-1).state, 'success');
    failSave = true;
    await send({ type: 'SAVE_JPEG', saveAsJpeg: false });
    assert.equal(root.settings.saveAsJpeg, true);
    assert.equal(host.messages.at(-1).saveAsJpeg, true);
    assert.equal(host.messages.at(-1).state, 'error');
    failSave = false;
    await send({ type: 'SAVE_JPEG', saveAsJpeg: false });
    assert.equal(root.settings.saveAsJpeg, false);

    const removed = [];
    host.remove = async id => { if (id === 'blocked') throw new Error('write failed'); removed.push(id); };
    await send({ type: 'BATCH_DELETE', ids: ['one', 'blocked', 'one'], requestId: 'delete-1' });
    const receipt = host.messages.find(event => event.type === 'BATCH_DELETED');
    assert.deepEqual(removed, ['one']);
    assert.equal(receipt.requestId, 'delete-1');
    assert.deepEqual(receipt.deletedIds, ['one']);
    assert.deepEqual(receipt.failures.map(item => item.id), ['blocked']);

    host.read = async id => ({ imgId: id, base64: 'data:image/png;base64,aGVsbG8=' });
    await send({ type: 'BATCH_DOWNLOAD', ids: ['one'], requestId: 'zip-1' });
    const zip = host.messages.find(event => event.type === 'BATCH_DOWNLOADED');
    assert.equal(zip.requestId, 'zip-1');
    assert.deepEqual(zip.exportedIds, ['one']);
    assert.equal(zip.blob.type, 'application/zip');
    assert.ok(zip.blob.size > 0);
    const reading = Promise.withResolvers(), release = Promise.withResolvers();
    host.read = async () => { reading.resolve(); await release.promise; return { base64: 'aGVsbG8=' }; };
    const pending = send({ type: 'BATCH_DOWNLOAD', ids: ['one'], requestId: 'zip-cancelled' });
    await reading.promise;
    await send({ type: 'BATCH_CANCEL_EXPORT' });
    release.resolve();
    await pending;
    assert.equal(host.messages.some(event => event.requestId === 'zip-cancelled'), false);
});
