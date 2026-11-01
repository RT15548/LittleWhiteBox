'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { resolveImageFolder, sanitizeSegment, toClientPath } = require('../image-files/paths.js');
const { isLocalRequest, launchFileManager, registerImageFileRoutes } = require('../image-files/routes.js');

// 契约（出错代价：图片写到图片目录之外 / 远程请求在服务器上弹出窗口）：
// - 文件夹名逐级清理，空、`.`、`..`、分隔符、绝对路径一律拒绝，结果必须仍在用户图片目录内。
// - 保存返回与酒馆上传接口同形的相对路径；打开文件夹只在本机请求时执行，且只传参数数组。
const PNG = Buffer.from([1, 2, 3, 4]).toString('base64');

function makeUser(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lwb-images-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    return { profile: { handle: 'fixture' }, directories: { root, userImages: path.join(root, 'user', 'images') } };
}

function harness(user, options) {
    const routes = {};
    registerImageFileRoutes({ post(route, handler) { routes[route] = handler; } }, options);
    const call = async (route, body, extra = {}) => {
        const req = { user, body, headers: {}, socket: { remoteAddress: '127.0.0.1' }, ...extra };
        const res = { headers: {}, setHeader(name, value) { this.headers[name] = value; },
            status(code) { this.statusCode = code; return this; }, send(payload) { this.body = payload; return this; } };
        await routes[route](req, res);
        return res;
    };
    return { save: (body, extra) => call('/v1/images/save', body, extra), open: (body, extra) => call('/v1/images/open-folder', body, extra) };
}

test('segments are sanitized like the Tavern upload endpoint and unsafe names are rejected', () => {
    assert.equal(sanitizeSegment('2026_10_31'), '2026_10_31');
    assert.equal(sanitizeSegment('a:b*c?.'), 'abc');
    for (const bad of ['', '.', '..', '...', '/', '\\', ' ', 'CON', 'nul.txt', 7, null, undefined]) assert.equal(sanitizeSegment(bad), null);
    assert.equal(sanitizeSegment('../x'), '..x');

    const base = path.resolve('images-root');
    assert.deepEqual(resolveImageFolder(base, ['苍玄界', '2026_10_31']).segments, ['苍玄界', '2026_10_31']);
    for (const folder of [[], [''], ['..'], ['a', '..'], ['a', 'b', 'c'], 'a/b', null, [{}]]) assert.equal(resolveImageFolder(base, folder), null);
    assert.equal(toClientPath(path.resolve('data', 'u'), path.resolve('data', 'u', 'user', 'images', 'a', 'b.png')), '/user/images/a/b.png');
    assert.equal(toClientPath(path.resolve('data', 'u'), path.resolve('data', 'ux', 'b.png')), null);
});

test('save writes a two-level folder and returns the upload-shaped path', async t => {
    const user = makeUser(t);
    const h = harness(user);
    const res = await h.save({ image: PNG, format: 'png', filename: 'novel_img.1', folder: ['苍玄界', '2026_10_31'] });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.path, '/user/images/苍玄界/2026_10_31/novel_img_1.png');
    assert.equal(res.headers['Cache-Control'], 'no-store');
    const file = path.join(user.directories.userImages, '苍玄界', '2026_10_31', 'novel_img_1.png');
    assert.deepEqual([...fs.readFileSync(file)], [1, 2, 3, 4]);
    // 单级也可用（与酒馆自带接口的文件夹结构一致）。
    assert.equal((await h.save({ image: PNG, format: 'webp', folder: ['苍玄界'] })).body.path.startsWith('/user/images/苍玄界/'), true);
});

test('save rejects unauthenticated, malformed and escaping requests before writing', async t => {
    const user = makeUser(t);
    const h = harness(user);
    const ok = { image: PNG, format: 'png', filename: 'a', folder: ['x'] };
    const cases = [
        [{ user: null }, ok, 403, 'authenticated_profile_required'],
        [{}, { ...ok, image: '' }, 400, 'invalid_image'],
        [{}, { ...ok, image: 5 }, 400, 'invalid_image'],
        [{}, { ...ok, format: 'exe' }, 400, 'invalid_format'],
        [{}, { ...ok, folder: ['..', 'x'] }, 400, 'invalid_folder'],
        [{}, { ...ok, folder: ['x', 'y', 'z'] }, 400, 'invalid_folder'],
        [{}, { ...ok, folder: '../escape' }, 400, 'invalid_folder'],
        [{}, { ...ok, filename: ':' }, 400, 'invalid_filename'],
    ];
    for (const [extra, body, status, code] of cases) {
        const res = await h.save(body, extra);
        assert.deepEqual([res.statusCode, res.body.code], [status, code]);
    }
    assert.equal(fs.existsSync(user.directories.userImages), false);
    // 文件名里的路径分隔符被清理，不会跳出文件夹。
    const res = await h.save({ ...ok, filename: '../../evil' });
    assert.equal(res.body.path, '/user/images/x/____evil.png');
});

test('open-folder is local-only, opens the nearest existing folder and passes a single argument', async t => {
    const user = makeUser(t);
    const opened = [];
    const h = harness(user, { launch: async directory => { opened.push(directory); } });
    const folder = ['苍玄界', '2026_10_31'];

    assert.equal((await h.open({ folder })).body.code, 'folder_missing');
    fs.mkdirSync(path.join(user.directories.userImages, '苍玄界'), { recursive: true });
    const parent = await h.open({ folder });
    assert.deepEqual([parent.statusCode, parent.body.path, parent.body.exact], [200, '/user/images/苍玄界', false]);
    fs.mkdirSync(path.join(user.directories.userImages, '苍玄界', '2026_10_31'));
    const exact = await h.open({ folder });
    assert.deepEqual([exact.body.path, exact.body.exact], ['/user/images/苍玄界/2026_10_31', true]);
    assert.deepEqual(opened, [path.join(user.directories.userImages, '苍玄界'), path.join(user.directories.userImages, '苍玄界', '2026_10_31')]);

    const before = opened.length;
    for (const [extra, body, status, code] of [
        [{ socket: { remoteAddress: '203.0.113.9' } }, { folder }, 403, 'not_local'],
        [{ headers: { 'x-forwarded-for': '203.0.113.9' } }, { folder }, 403, 'not_local'],
        [{ user: null }, { folder }, 403, 'authenticated_profile_required'],
        [{}, { folder: ['..'] }, 400, 'invalid_folder'],
    ]) {
        const res = await h.open(body, extra);
        assert.deepEqual([res.statusCode, res.body.code], [status, code]);
    }
    assert.equal(opened.length, before);
});

test('open-folder without a folder opens the images root, creating it, and still refuses non-local callers', async t => {
    const user = makeUser(t);
    const opened = [];
    const h = harness(user, { launch: async directory => { opened.push(directory); } });
    for (const body of [{}, undefined]) {
        const res = await h.open(body);
        assert.deepEqual([res.statusCode, res.body.path, res.body.exact], [200, '/user/images', true]);
    }
    assert.deepEqual(opened, [user.directories.userImages, user.directories.userImages]);
    const remote = await h.open({}, { socket: { remoteAddress: '203.0.113.9' } });
    assert.deepEqual([remote.statusCode, remote.body.code, opened.length], [403, 'not_local', 2]);
});

test('open-folder reports a file manager that cannot start', async t => {
    const user = makeUser(t);
    fs.mkdirSync(path.join(user.directories.userImages, 'x'), { recursive: true });
    t.mock.method(console, 'error', () => {});
    const h = harness(user, { launch: async () => { throw new Error('spawn xdg-open ENOENT'); } });
    const res = await h.open({ folder: ['x'] });
    assert.deepEqual([res.statusCode, res.body.code], [500, 'open_failed']);
});

test('local detection trusts the socket address, not headers, and accepts the machine\'s own addresses', () => {
    const own = () => ({ Ethernet: [{ address: '192.168.1.20' }] });
    const request = (remoteAddress, headers = {}) => ({ socket: { remoteAddress }, headers });
    assert.equal(isLocalRequest(request('::ffff:127.0.0.1'), own), true);
    assert.equal(isLocalRequest(request('::1'), own), true);
    assert.equal(isLocalRequest(request('192.168.1.20'), own), true);
    assert.equal(isLocalRequest(request('192.168.1.99'), own), false);
    assert.equal(isLocalRequest(request('127.0.0.1', { 'x-forwarded-for': '1.2.3.4' }), own), false);
    assert.equal(isLocalRequest({ headers: {} }, own), false);
});

test('the file manager is started without a shell, one directory argument and detached', async () => {
    for (const [platform, command] of [['win32', 'explorer.exe'], ['darwin', 'open'], ['linux', 'xdg-open']]) {
        const calls = [];
        await launchFileManager('/d', { platform, spawnImpl: (...args) => {
            calls.push(args);
            const handlers = {};
            queueMicrotask(() => handlers.spawn());
            return { once(name, handler) { handlers[name] = handler; return this; }, unref() {} };
        } });
        assert.deepEqual(calls, [[command, ['/d'], { detached: true, stdio: 'ignore' }]]);
    }
    await assert.rejects(launchFileManager('/d', { spawnImpl: () => {
        const handlers = {};
        queueMicrotask(() => handlers.error(new Error('ENOENT')));
        return { once(name, handler) { handlers[name] = handler; return this; } };
    } }), /ENOENT/);
});
