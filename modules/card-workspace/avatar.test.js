import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { COPY } from './copy.js';
import { runWithAbortDeadline } from '../../shared/common/abort-utils.js';

const source = readFileSync(new URL('./avatar.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
const avatar = '测试 角色.png';
const sourcePath = 'local/images/封面.webp';
const cover = new Blob([Uint8Array.of(1, 20, 3, 255)], { type: 'image/webp' });
const thumbnail = file => '/thumbnail?type=avatar&file=' + encodeURIComponent(file);

function imageElement(src) {
    const writes = [];
    return {
        get src() { return src; },
        getAttribute: () => src,
        removeAttribute: () => { src = null; },
        setAttribute: (_, value) => { src = value; writes.push(value); },
        writes,
    };
}

function harness({ read, selectedAvatar = avatar, saved = cover, thumbnailOK = true } = {}) {
    const requests = [], warnings = [];
    let selected = selectedAvatar;
    const image = imageElement(thumbnail(avatar));
    const fullImage = imageElement('/characters/' + encodeURIComponent(avatar));
    const other = imageElement(thumbnail('other.png'));
    const invalid = imageElement('http://[/thumbnail?broken');
    const context = {
        COPY, FormData, URL, runWithAbortDeadline, location: { origin: 'http://localhost', href: 'http://localhost/' },
        console: { warn() {} },
        toastr: { warning: message => { warnings.push(message); } },
        getRequestHeaders: options => { assert.equal(options.omitContentType, true); return {}; },
        getThumbnailUrl: (_, file) => thumbnail(file),
        currentCard: () => ({ avatar: selected, name: '测试角色' }),
        readWorkspaceImage: async path => ({ file: { path }, blob: read ? await read(() => { selected = 'other.png'; }) : cover }),
        createImageBitmap: async blob => {
            const pixels = new Uint8ClampedArray(await blob.arrayBuffer());
            if (pixels.length !== 4) throw new Error('Invalid image');
            return { width: 1, height: 1, pixels, close() {} };
        },
        document: {
            createElement() {
                let pixels;
                return {
                    getContext: () => ({ drawImage: bitmap => { pixels = bitmap.pixels; }, getImageData: () => ({ data: pixels }) }),
                    toBlob: callback => callback(new Blob([pixels], { type: 'image/png' })),
                };
            },
            querySelectorAll: () => [invalid, image, fullImage, other],
        },
        fetch: async (url, options) => {
            requests.push({ url, ...options });
            return { ok: !url.startsWith('/thumbnail?') || thumbnailOK, blob: async () => saved };
        },
    };
    return { set: runInNewContext(source + '\nsetCardAvatar', context), requests, image, fullImage, other, invalid, warnings };
}

test('an existing workspace picture goes straight to the avatar endpoint and only the target avatar refreshes (no draw charge or card-data overwrite)', async () => {
    const { set, requests, image, fullImage, other, invalid, warnings } = harness();
    const result = await set(avatar, sourcePath);
    assert.deepEqual({ ...result }, { ok: true, avatar, name: '测试角色', sourcePath });
    assert.deepEqual(requests.map(request => [request.method, request.url]), [
        ['POST', '/api/characters/edit-avatar'], [undefined, '/characters/' + encodeURIComponent(avatar)],
        [undefined, thumbnail(avatar)],
    ]);
    const form = requests[0].body;
    assert.deepEqual([...form.keys()], ['avatar_url', 'avatar']);
    assert.equal(form.get('avatar_url'), avatar);
    assert.equal(form.get('avatar').type, 'image/png');
    assert.deepEqual(new Uint8Array(await form.get('avatar').arrayBuffer()), new Uint8Array(await cover.arrayBuffer()));
    assert.equal(requests[2].cache, 'reload');
    assert.deepEqual(image.writes, [thumbnail(avatar)]);
    assert.deepEqual(fullImage.writes, ['/characters/' + encodeURIComponent(avatar)]);
    assert.deepEqual(other.writes, []);
    assert.deepEqual(invalid.writes, []);
    assert.deepEqual(warnings, []);
});

test('a card name the host would write to a different file sends no upload (wrong card overwrite)', async () => {
    const selectedAvatar = 'A.png备份.png';
    const { set, requests } = harness({ selectedAvatar });
    await assert.rejects(set(selectedAvatar, sourcePath), { message: COPY.avatarUnsafeFileName });
    assert.deepEqual(requests, []);
});

test('a failed thumbnail reload is reported with the save receipt and sends no toast', async () => {
    const { set, requests, image, warnings } = harness({ thumbnailOK: false });
    const result = await set(avatar, sourcePath);
    assert.equal(result.ok, true);
    assert.equal(result.previewRefreshFailed, true);
    assert.equal(requests.filter(request => request.method === 'POST').length, 1);
    assert.deepEqual(image.writes, []);
    assert.deepEqual(warnings, []);
});

test('switching cards while the image loads, or choosing an unreadable picture, sends no replacement (wrong card or lost cover)', async () => {
    for (const read of [switchCard => { switchCard(); return cover; }, () => new Blob(['broken']), () => { throw new Error('missing'); }]) {
        const { set, requests } = harness({ read });
        await assert.rejects(set(avatar, sourcePath));
        assert.deepEqual(requests, []);
    }
});

test('HTTP 200 with unchanged pixels does not claim a saved cover (silent failure)', async () => {
    const { set, requests, image } = harness({ saved: new Blob([Uint8Array.of(0, 0, 0, 255)], { type: 'image/png' }) });
    await assert.rejects(set(avatar, sourcePath), { message: COPY.avatarUnconfirmed });
    assert.equal(requests.filter(request => request.method === 'POST').length, 1);
    assert.deepEqual(image.writes, []);
});
