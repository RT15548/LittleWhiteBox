import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { normalizeSharedDrawSettings } from '../draw-settings.js';
import { bindImageSaveControls } from '../image-save-controls.js';
import { createImageSaver, dateFolder, formatFolderDate, IMAGE_SAVE_CAPABILITY, IMAGE_SAVE_COPY, OPEN_FOLDER_CAPABILITY,
    setAutoSaveImages } from '../image-save-core.js';

// 契约（出错代价：图片存到错误位置 / 没装插件时保存失败或丢图 / 勾选框与设置不一致）：
// - 未开“按日期保存”时与直接调用酒馆 saveBase64AsFile 完全一致，不探测插件。
// - 开了“按日期保存”且有插件：存到 角色名/年_月_日；没有插件：照常存到默认的角色名文件夹，只做限频提示，保存不失败。
// - 打开文件夹只打开图片根目录，需要插件且在本机，否则给出简短说明。
const DAY = new Date(2026, 9, 31, 23, 59).getTime();
const OK_SAVE = async () => ({ ok: true, status: 200, json: async () => ({ ok: true, path: '/user/images/a/b/x.png' }) });

function setup({ capabilities = [], settings = {}, post = OK_SAVE, clock = { value: DAY } } = {}) {
    const calls = { upload: [], post: [], status: 0, warnings: [] };
    const saver = createImageSaver({
        saveBase64AsFile: async (...args) => { calls.upload.push(args); return `/user/images/${args[1]}/${args[2]}.${args[3]}`; },
        fetchImpl: async (url, options) => { calls.post.push([url, JSON.parse(options.body)]); return post(url, options); },
        getHeaders: () => ({ 'X-CSRF-Token': 't' }),
        getStatus: async () => { calls.status++; return capabilities === null ? { ready: false } : { ready: true, capabilities }; },
        getSettings: () => settings,
        now: () => clock.value,
        warn: text => calls.warnings.push(text),
    });
    return { saver, calls, clock };
}
const image = { base64: 'AAAA', charName: '苍玄界', fileName: 'novel_img.1', format: 'png' };

test('folder names use local date', () => {
    assert.equal(formatFolderDate(new Date(2026, 0, 5)), '2026_01_05');
    assert.deepEqual(dateFolder('A', new Date(DAY)), ['A', '2026_10_31']);
});

test('both switches default to off and only an explicit true turns them on', () => {
    const defaults = normalizeSharedDrawSettings({});
    assert.deepEqual([defaults.autoSaveImages, defaults.saveImagesByFolder, defaults.autoSaveImagesSince], [false, false, 0]);
    const stored = normalizeSharedDrawSettings({ autoSaveImages: true, saveImagesByFolder: 'yes', autoSaveImagesSince: 123.9 });
    assert.deepEqual([stored.autoSaveImages, stored.saveImagesByFolder, stored.autoSaveImagesSince], [true, false, 123]);
    assert.equal(normalizeSharedDrawSettings({ autoSaveImagesSince: 'x' }).autoSaveImagesSince, 0);
});

test('turning the auto-save switch on records the time, off clears it, and re-saving the same value keeps it', () => {
    const draft = { autoSaveImages: false, autoSaveImagesSince: 0 };
    setAutoSaveImages(draft, true, 500);
    assert.deepEqual(draft, { autoSaveImages: true, autoSaveImagesSince: 500 });
    setAutoSaveImages(draft, true, 900);
    assert.equal(draft.autoSaveImagesSince, 500);
    setAutoSaveImages(draft, false, 900);
    assert.deepEqual(draft, { autoSaveImages: false, autoSaveImagesSince: 0 });
});

test('switch off keeps the Tavern upload and never probes the plugin', async () => {
    const { saver, calls } = setup({ capabilities: [IMAGE_SAVE_CAPABILITY] });
    assert.equal(await saver.save(image), '/user/images/苍玄界/novel_img.1.png');
    assert.deepEqual(calls.upload, [['AAAA', '苍玄界', 'novel_img.1', 'png']]);
    assert.deepEqual([calls.status, calls.post.length, calls.warnings.length], [0, 0, 0]);
});

test('date saving uses the plugin route for the two-level folder and caches the capability probe', async () => {
    const { saver, calls } = setup({ capabilities: [IMAGE_SAVE_CAPABILITY], settings: { saveImagesByFolder: true } });
    assert.equal(await saver.save(image), '/user/images/a/b/x.png');
    await saver.save(image);
    assert.deepEqual(calls.post[0], ['/api/plugins/littlewhitebox-server/v1/images/save',
        { image: 'AAAA', format: 'png', filename: 'novel_img_1', folder: ['苍玄界', '2026_10_31'] }]);
    assert.deepEqual([calls.status, calls.upload.length, calls.warnings.length], [1, 0, 0]);
});

test('without the plugin date saving still saves to the default folder and warns at a limited rate', async () => {
    for (const capabilities of [[], null]) {
        const { saver, calls, clock } = setup({ capabilities, settings: { saveImagesByFolder: true } });
        assert.equal(await saver.save(image), '/user/images/苍玄界/novel_img.1.png');
        await saver.save(image);
        assert.deepEqual(calls.upload.map(call => call[1]), ['苍玄界', '苍玄界']);
        assert.deepEqual([calls.post.length, calls.warnings], [0, [IMAGE_SAVE_COPY.dateSaveInactive]]);
        clock.value += 31_000;
        await saver.save(image);
        assert.equal(calls.warnings.length, 2);
    }
});

test('plugin failures are reported, but a vanished route falls back to the default folder', async () => {
    const failing = setup({ capabilities: [IMAGE_SAVE_CAPABILITY], settings: { saveImagesByFolder: true },
        post: async () => ({ ok: false, status: 500, json: async () => ({ ok: false, error: 'Failed to save the image' }) }) });
    await assert.rejects(failing.saver.save(image), /Failed to save the image/);
    assert.equal(failing.calls.upload.length, 0);

    const missing = setup({ capabilities: [IMAGE_SAVE_CAPABILITY], settings: { saveImagesByFolder: true },
        post: async () => ({ ok: false, status: 404, json: async () => null }) });
    assert.equal(await missing.saver.save(image), '/user/images/苍玄界/novel_img.1.png');
    assert.equal(missing.calls.warnings.length, 1);
    await missing.saver.save(image);
    assert.equal(missing.calls.status, 2);
});

test('open folder targets the images root only, needs the plugin and a local Tavern', async () => {
    const opened = setup({ capabilities: [OPEN_FOLDER_CAPABILITY],
        post: async () => ({ ok: true, status: 200, json: async () => ({ ok: true, path: '/user/images', exact: true }) }) });
    assert.deepEqual(await opened.saver.openFolder(), { state: 'success', text: '已打开图片目录' });
    assert.deepEqual(opened.calls.post, [['/api/plugins/littlewhitebox-server/v1/images/open-folder', {}]]);

    const notLocal = setup({ capabilities: [OPEN_FOLDER_CAPABILITY],
        post: async () => ({ ok: false, status: 403, json: async () => ({ ok: false, code: 'not_local' }) }) });
    assert.deepEqual(await notLocal.saver.openFolder(), { state: 'error', text: '酒馆不在本机，无法直接打开' });

    const failed = setup({ capabilities: [OPEN_FOLDER_CAPABILITY],
        post: async () => ({ ok: false, status: 500, json: async () => ({ ok: false, code: 'open_failed' }) }) });
    assert.equal((await failed.saver.openFolder()).state, 'error');

    for (const capabilities of [[], [IMAGE_SAVE_CAPABILITY], null]) {
        const noPlugin = setup({ capabilities });
        assert.deepEqual(await noPlugin.saver.openFolder(), { state: 'error', text: '打开文件夹需要安装 littlewhitebox-server 插件' });
        assert.equal(noPlugin.calls.post.length, 0);
    }
});

function control() {
    const handlers = {};
    // 监听器经 observeAsyncCallback 包装后不返回 Promise，所以触发后让出一轮事件循环等它完成。
    return { checked: false, disabled: false, addEventListener(name, handler) { handlers[name] = handler; },
        fire: async name => { handlers[name](); await setImmediate(); } };
}

test('controls persist each switch, report the receipt and restore from stored settings', async () => {
    const [autoSave, folder, openButton] = [control(), control(), control()];
    const stored = { autoSaveImages: false, saveImagesByFolder: false };
    const reports = [];
    let failNext = false;
    bindImageSaveControls({ autoSave, folder, openButton, getSettings: () => stored,
        saveSettings: async mutate => { if (failNext) return false; mutate(stored); return true; },
        report: (state, text) => reports.push([state, text]),
        openFolder: async () => ({ state: 'info', text: 'path' }) });

    autoSave.checked = true;
    await autoSave.fire('change');
    assert.deepEqual([stored.autoSaveImages, autoSave.checked, autoSave.disabled, reports.at(-1)], [true, true, false, ['success', '已保存']]);
    assert.equal(stored.autoSaveImagesSince > 0, true);
    failNext = true;
    folder.checked = true;
    await folder.fire('change');
    assert.deepEqual([stored.saveImagesByFolder, folder.checked, reports.at(-1)[0]], [false, false, 'error']);
    await openButton.fire('click');
    assert.deepEqual([reports.at(-1), openButton.disabled], [['info', 'path'], false]);
});
