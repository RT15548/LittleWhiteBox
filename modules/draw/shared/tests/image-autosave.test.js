import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// 契约（出错代价：重复保存同一张图 / 自动保存失败拖垮出图 / 把“已保存”写进别的聊天）：
// - 开关关闭不动图库；开关只对此后生成的新图生效（旧缓存、开关打开前提交的任务不保存）；已有 savedUrl 的图不再保存；保存失败只返回 false 并轻提示，不抛错。
// - 保存成功后，仅当这张图仍是槽位当前显示的图且聊天目标仍在时，才把“已保存”写回聊天并刷新楼层。
const host = { settings: {}, previews: new Map(), selections: new Map(), saved: [], synced: [], rendered: [], warnings: [], failSave: false };
globalThis.__autoSaveTest = host;

const stubs = {
    'gallery-cache.js': `
        const host = globalThis.__autoSaveTest;
        export const getPreview = async id => { host.beforePreview?.(); return host.previews.get(id); };
        export const getSlotSelection = async slot => host.selections.get(slot) ?? null;
        export const savePreviewImage = async (id, prefix) => {
            if (host.failSave) throw new Error('upload failed');
            const url = '/user/images/' + prefix + '_' + id + '.png';
            host.saved.push(url);
            host.previews.set(id, { ...host.previews.get(id), base64: null, savedUrl: url });
            return url;
        };
    `,
    'draw-common.js': `
        const host = globalThis.__autoSaveTest;
        export const syncDrawSavedFromPreview = async (messageId, preview, overrides) => { host.synced.push([messageId, preview.savedUrl, overrides.slotId, overrides.savedUrl]); };
        export const renderPreviewsForMessage = async (messageId, options) => { host.rendered.push([messageId, options.refreshSlotIds]); };
    `,
    'draw-settings.js': 'export const getSharedDrawSettings = () => globalThis.__autoSaveTest.settings;',
};
const bundle = await build({
    stdin: { contents: "export * from './image-autosave.js';", resolveDir: fileURLToPath(new URL('..', import.meta.url)) },
    bundle: true, write: false, platform: 'node', format: 'esm',
    plugins: [{
        name: 'autosave-host-boundaries',
        setup(builder) {
            builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
                const name = path.split('/').at(-1);
                return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
            });
            builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
        },
    }],
});
// eslint-disable-next-line no-unsanitized/method -- 只执行本测试现场构建的本地模块，没有外部输入。
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text + '\n//# sourceURL=image-autosave-test.mjs').toString('base64')}`);

function reset(t, settings = { autoSaveImages: true, autoSaveImagesSince: 0 }) {
    Object.assign(host, { settings, saved: [], synced: [], rendered: [], warnings: [], failSave: false, beforePreview: null });
    host.previews = new Map([['img-1', { imgId: 'img-1', base64: 'data', savedUrl: null }]]);
    host.selections = new Map([['slot-1', 'img-1']]);
    t.mock.method(console, 'warn', () => {});
    globalThis.toastr = { warning: text => host.warnings.push(text) };
}
const options = (extra = {}) => ({ imgId: 'img-1', slotId: 'slot-1', filePrefix: 'sd', ...extra });

test('file prefixes follow the manual save names per provider', () => {
    assert.deepEqual(['novelai', 'sd-webui', 'comfyui', 'other'].map(api.imageFilePrefix), ['novel', 'sd', 'comfy', 'draw']);
});

test('switch off or an already saved image never uploads', async t => {
    reset(t, { autoSaveImages: false });
    assert.equal(await api.autoSaveDeliveredImage(options()), false);
    reset(t);
    host.previews.set('img-1', { imgId: 'img-1', base64: null, savedUrl: '/user/images/old.png' });
    assert.equal(await api.autoSaveDeliveredImage(options()), false);
    assert.deepEqual(host.saved, []);
});

test('switching on never touches cached previews; only an image delivered afterwards is saved', async t => {
    reset(t, { autoSaveImages: false, autoSaveImagesSince: 0 });
    host.previews.set('old-1', { imgId: 'old-1', base64: 'old', savedUrl: null });
    host.previews.set('old-2', { imgId: 'old-2', base64: 'old', savedUrl: null });
    // 打开开关只改设置：没有任何地方会因此去扫描图库，所以不会有保存。
    host.settings = { autoSaveImages: true, autoSaveImagesSince: Date.now() };
    await new Promise(resolve => setTimeout(resolve, 5));
    assert.deepEqual(host.saved, []);
    assert.equal(host.previews.get('old-1').savedUrl, null);
    // 之后新送达的图才保存，旧缓存依旧不动。
    assert.equal(await api.autoSaveDeliveredImage(options({ imgId: 'img-1' })), true);
    assert.deepEqual(host.saved, ['/user/images/sd_img-1.png']);
    assert.equal(host.previews.get('old-1').savedUrl, null);
});

test('a recovered job submitted before the switch was turned on is not saved, a later one is', async t => {
    reset(t, { autoSaveImages: true, autoSaveImagesSince: 1000 });
    assert.equal(await api.autoSaveDeliveredImage(options({ generatedAt: 999 })), false);
    assert.deepEqual(host.saved, []);
    assert.equal(await api.autoSaveDeliveredImage(options({ generatedAt: 1000 })), true);
    assert.equal(host.saved.length, 1);
});

test('a delivered image is saved once and written back to the floor that still shows it', async t => {
    reset(t);
    assert.equal(await api.autoSaveDeliveredImage(options({ chatTarget: () => ({ messageId: 3 }) })), true);
    assert.deepEqual(host.saved, ['/user/images/sd_img-1.png']);
    assert.deepEqual(host.synced, [[3, '/user/images/sd_img-1.png', 'slot-1', '/user/images/sd_img-1.png']]);
    assert.deepEqual(host.rendered, [[3, ['slot-1']]]);
    // 再次调用（例如接回与送达各触发一次）不会重复保存。
    assert.equal(await api.autoSaveDeliveredImage(options({ chatTarget: () => ({ messageId: 3 }) })), false);
    assert.equal(host.saved.length, 1);
});

test('no chat target or a different selected image saves the file without touching the chat', async t => {
    reset(t);
    assert.equal(await api.autoSaveDeliveredImage(options()), true);
    reset(t);
    host.selections.set('slot-1', 'img-2');
    assert.equal(await api.autoSaveDeliveredImage(options({ chatTarget: () => ({ messageId: 3 }) })), true);
    assert.deepEqual([host.synced, host.rendered], [[], []]);
});

test('a failed upload is swallowed, warns gently and leaves the preview for manual saving', async t => {
    reset(t);
    host.failSave = true;
    assert.equal(await api.autoSaveDeliveredImage(options({ chatTarget: () => ({ messageId: 3 }) })), false);
    assert.deepEqual(host.warnings, ['自动保存图片失败，图片仍在图库里，可手动保存']);
    assert.equal(host.previews.get('img-1').savedUrl, null);
    // 短时间内连续失败只提示一次，避免整批失败时刷屏。
    await api.autoSaveDeliveredImage(options());
    assert.equal(host.warnings.length, 1);
});

// Cost: writing saved-image metadata into another chat or replacing a newly selected image.
test('navigation or a new selection during gallery reads cannot receive the saved entry', async t => {
    for (const change of ['chat', 'selection']) {
        reset(t);
        let reads = 0;
        let target = { messageId: 3 };
        host.beforePreview = () => {
            if (++reads !== 2) return;
            if (change === 'chat') target = null;
            else host.selections.set('slot-1', 'img-2');
        };
        assert.equal(await api.autoSaveDeliveredImage(options({ chatTarget: () => target })), true);
        assert.deepEqual([host.synced, host.rendered], [[], []]);
    }
});

// Cost: saving after the user has disabled automatic saving but before upload has begun.
test('turning automatic saving off during the preview read prevents the upload', async t => {
    reset(t);
    host.beforePreview = () => { host.settings.autoSaveImages = false; };
    assert.equal(await api.autoSaveDeliveredImage(options()), false);
    assert.deepEqual(host.saved, []);
});
