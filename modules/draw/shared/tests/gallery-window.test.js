import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createGalleryImageWindow } from '../gallery-image-window.js';
import { createGalleryImageRequests } from '../../providers/novelai/gallery-image-requests.js';

// Acceptance: scene-planner-design.md / gallery resource window. Resource
// lifetime, stale delivery and retry are invisible failures that can crash a tab.
const settle = () => new Promise(resolve => setTimeout(resolve, 0));
function fixture(load) {
    const { document } = parseHTML('<html><body></body></html>');
    let observer;
    globalThis.IntersectionObserver = class {
        constructor(callback) { observer = callback; }
        observe() {} unobserve() {} disconnect() {}
    };
    const errors = [];
    const view = createGalleryImageWindow({ load, onError: error => errors.push(error) });
    const image = id => { const el = document.createElement('img'); el.dataset.galleryId = id; document.body.append(el); return el; };
    const visible = (on, off = []) => observer([...on.map(target => ({ target, isIntersecting: true })), ...off.map(target => ({ target, isIntersecting: false }))]);
    return { view, image, visible, errors };
}
const record = imgId => ({ imgId, base64: 'aGVsbG8=' });

test('32 positions retain only the visible images; returning rereads released originals', async () => {
    const reads = [];
    const h = fixture(async id => { reads.push(id); return record(id); });
    const nodes = Array.from({ length: 32 }, (_, i) => h.image(String(i)));
    h.view.sync(nodes);
    assert.equal(reads.length, 0);
    h.visible(nodes.slice(0, 4));
    await settle();
    const firstUrls = nodes.slice(0, 4).map(node => node.src);
    assert.equal(reads.length, 4);
    h.visible(nodes.slice(28), nodes.slice(0, 4));
    await settle();
    assert.equal(nodes.filter(node => node.getAttribute('src')).length, 4);
    for (const url of firstUrls) await assert.rejects(fetch(url));
    h.visible(nodes.slice(0, 4), nodes.slice(28));
    await settle();
    assert.equal(reads.length, 12);
    assert.equal(await (await fetch(nodes[0].src)).text(), 'hello');
    h.view.dispose();
    assert.ok(nodes.every(node => !node.getAttribute('src')));
});

test('late read cannot restore an offscreen image and reads never run as a batch', async () => {
    let release;
    const reads = [];
    const h = fixture(async id => { reads.push(id); if (id === 'old') await new Promise(resolve => { release = resolve; }); return record(id); });
    const old = h.image('old'), next = h.image('next');
    h.view.sync([old, next]);
    h.visible([old, next]);
    assert.deepEqual(reads, ['old']);
    h.visible([], [old]);
    release();
    await settle();
    assert.equal(old.getAttribute('src'), null);
    assert.equal(await (await fetch(next.src)).text(), 'hello');
    h.view.dispose();
});

test('closing a pending view ignores late results; failed visible image can retry', async () => {
    let release;
    const h = fixture(async id => { await new Promise(resolve => { release = resolve; }); return record(id); });
    const image = h.image('closed');
    h.view.sync([image]); h.visible([image]); h.view.dispose(); release();
    await settle();
    assert.equal(image.getAttribute('src'), null);
    let fail = true;
    const retry = fixture(async id => { if (fail) throw new Error('read'); return record(id); });
    const target = retry.image('retry');
    retry.view.sync([target]); retry.visible([target]); await settle();
    assert.equal(retry.errors.length, 1);
    fail = false; target.click(); await settle();
    assert.equal(await (await fetch(target.src)).text(), 'hello');
    retry.view.dispose();
});

test('leaving an image with a pending browser decode must not stall the next visible image', async () => {
    const h = fixture(async id => record(id));
    const old = h.image('decoding'), next = h.image('next');
    old.decode = () => new Promise(() => {});
    h.view.sync([old, next]); h.visible([old]); await settle();
    h.visible([next], [old]); await settle();
    assert.equal(await (await fetch(next.src)).text(), 'hello');
    h.view.dispose();
});

for (const departure of ['reuse', 'remove', 'offscreen']) {
    for (const outcome of ['resolve', 'reject']) {
        test(`${departure} during decode preserves the visible duplicate and ignores late ${outcome}`, async (t) => {
            const reads = [];
            const h = fixture(async id => { reads.push(id); return record(id); });
            t.after(() => h.view.dispose());
            const main = h.image('A'), thumb = h.image('A'), next = h.image('B');
            let finishDecode;
            main.decode = () => new Promise((resolve, reject) => {
                finishDecode = () => outcome === 'resolve' ? resolve() : reject(new DOMException('decode', 'EncodingError'));
            });
            h.view.sync([main, thumb, next]); h.visible([main, thumb]); await settle();
            const thumbUrl = thumb.src;
            assert.deepEqual(reads, ['A']);
            if (departure === 'reuse') {
                main.dataset.galleryId = 'B';
                main.decode = async () => {};
                h.view.sync([main, thumb, next]); h.visible([main, next]);
            } else if (departure === 'remove') {
                h.view.sync([thumb, next]); h.visible([next]);
            } else {
                h.visible([next], [main]);
            }
            await settle();
            assert.deepEqual(reads, ['A', 'B']);
            assert.equal(await (await fetch(next.src)).text(), 'hello');
            finishDecode(); await settle();
            assert.deepEqual(h.errors, []);
            assert.equal(thumb.src, thumbUrl);
            assert.equal(await (await fetch(thumbUrl)).text(), 'hello');
            if (departure === 'reuse') assert.equal(main.src, next.src);
            else assert.equal(main.getAttribute('src'), null);
            h.view.dispose();
            await assert.rejects(fetch(thumbUrl));
        });
    }
}

test('a current image decode failure is reported and can be retried', async (t) => {
    const h = fixture(async id => record(id));
    t.after(() => h.view.dispose());
    const image = h.image('broken');
    const error = new DOMException('decode', 'EncodingError');
    image.decode = async () => { throw error; };
    h.view.sync([image]); h.visible([image]); await settle();
    assert.deepEqual(h.errors, [error]);
    assert.equal(image.getAttribute('src'), null);
    image.decode = async () => {};
    image.click(); await settle();
    assert.equal(await (await fetch(image.src)).text(), 'hello');
});

test('separate views and duplicate visible nodes do not revoke each other', async () => {
    const a = fixture(async id => record(id)), b = fixture(async id => record(id));
    const first = a.image('same'), second = a.image('same'), other = b.image('same');
    a.view.sync([first, second]); b.view.sync([other]);
    a.visible([first, second]); b.visible([other]); await settle();
    assert.equal(first.src, second.src);
    assert.notEqual(first.src, other.src);
    a.visible([], [first]);
    assert.equal(await (await fetch(second.src)).text(), 'hello');
    a.view.dispose();
    assert.equal(await (await fetch(other.src)).text(), 'hello');
    b.view.dispose();
});

test('iframe delivery cannot satisfy a cancelled or newer image request', async () => {
    const messages = [];
    const requests = createGalleryImageRequests(message => messages.push(message));
    const old = new AbortController();
    const read = requests.load('old', old.signal);
    old.abort(); await assert.rejects(read, { name: 'AbortError' });
    const next = requests.load('new', new AbortController().signal);
    requests.receive({ requestId: messages[0].requestId, image: record('old') });
    requests.receive({ requestId: messages[1].requestId, image: record('new') });
    assert.equal((await next).imgId, 'new');
    const reopened = createGalleryImageRequests(message => messages.push(message));
    const current = reopened.load('reopened', new AbortController().signal);
    assert.notEqual(messages[0].requestId, messages[2].requestId);
    reopened.receive({ requestId: messages[0].requestId, image: record('old') });
    reopened.receive({ requestId: messages[2].requestId, image: record('reopened') });
    assert.equal((await current).imgId, 'reopened');
});
