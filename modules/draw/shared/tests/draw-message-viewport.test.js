import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { createDrawMessageViewport } from '../draw-message-viewport.js';

// Acceptance contracts (failure cost: blocked chat interaction / stale controls):
// - Opening a long chat never projects cold history before it approaches view.
// - Streaming and host repaints invalidate only the changed floor, once per frame.
// - Leaving/reentering view preserves dirty work without repeating unchanged work.
// - Unmount/cleanup revokes queued work; Draw's own UI cannot start a repaint loop.
function setup(t, count = 1000) {
    const { document, window } = parseHTML('<html><body><div id="chat"></div></body></html>');
    const frames = new Map();
    const observers = [];
    const mutations = [];
    let frameId = 0;
    const previous = Object.fromEntries(['document', 'window', 'MutationObserver', 'IntersectionObserver',
        'requestAnimationFrame', 'cancelAnimationFrame'].map(key => [key, globalThis[key]]));
    Object.assign(globalThis, { document, window,
        // linkedom reports the observer root as childList.target and does not
        // implement characterData records. Supply the browser's actual contract.
        MutationObserver: class {
            constructor(callback) { this.callback = callback; this.records = []; mutations.push(this); }
            observe(target) { this.target = target; }
            disconnect() { this.target = null; this.records.length = 0; }
            takeRecords() { return this.records.splice(0); }
        },
        IntersectionObserver: class {
            constructor(callback) { this.callback = callback; this.targets = new Set(); observers.push(this); }
            observe(node) { this.targets.add(node); }
            unobserve(node) { this.targets.delete(node); }
            disconnect() { this.targets.clear(); }
        },
        requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
        cancelAnimationFrame: id => frames.delete(id),
    });
    const chat = document.getElementById('chat');
    function floor(id) {
        const element = document.createElement('div'); element.className = 'mes'; element.setAttribute('mesid', id);
        const content = document.createElement('div'); content.className = 'mes_text'; content.textContent = `story ${id}`;
        element.append(content); return element;
    }
    for (let id = 0; id < count; id++) chat.append(floor(id));
    const viewport = createDrawMessageViewport();
    const refreshed = [], released = [];
    const unsubscribe = viewport.subscribe({ refresh: (_content, id) => refreshed.push(id), release: content => released.push(content) });
    t.after(() => { unsubscribe(); Object.assign(globalThis, previous); });
    async function drain() {
        for (let i = 0; i < 30; i++) {
            for (const observer of mutations) if (observer.records.length) observer.callback(observer.takeRecords());
            await setImmediate();
            if (!frames.size) return;
            const batch = [...frames.values()]; frames.clear();
            for (const run of batch) run();
        }
        assert.fail('view work did not settle');
    }
    function mutation(target, { type = 'childList', addedNodes = [], removedNodes = [] } = {}) {
        for (const observer of mutations) if (observer.target?.contains(target)) {
            observer.records.push({ target, type, addedNodes, removedNodes });
        }
    }
    const body = id => chat.querySelector(`.mes[mesid="${id}"] .mes_text`);
    function near(id, isIntersecting) {
        const target = body(id);
        for (const observer of observers) if (observer.targets.has(target)) observer.callback([{ target, isIntersecting }]);
    }
    return { document, chat, floor, viewport, refreshed, released, body, near, drain, unsubscribe, mutation };
}

test('1000 cold floors register without projecting history; scrolling admits only nearby floors', async t => {
    const h = setup(t);
    await h.drain();
    assert.deepEqual(h.refreshed, [999]);
    h.near(998, true); h.near(997, true);
    await h.drain();
    assert.deepEqual(h.refreshed, [999, 998, 997]);
    h.near(997, false); h.near(997, true);
    await h.drain();
    assert.equal(h.refreshed.length, 3);
});

test('streaming one floor never refreshes unchanged historical floors', async t => {
    const h = setup(t);
    h.near(10, true);
    await h.drain(); h.refreshed.length = 0;
    for (let batch = 0; batch < 20; batch++) {
        for (let token = 0; token < 4; token++) {
            h.body(999).firstChild.nodeValue += 'x';
            h.mutation(h.body(999).firstChild, { type: 'characterData' });
        }
        await h.drain();
    }
    assert.deepEqual(h.refreshed, Array(20).fill(999));
});

test('cold updates coalesce and unchanged history is not redone on discovery', async t => {
    const h = setup(t);
    await h.drain(); h.refreshed.length = 0;
    h.body(20).textContent = 'changed';
    h.viewport.invalidate(h.body(20)); h.viewport.invalidate(h.body(20));
    h.chat.prepend(h.floor(-1)); h.viewport.refresh();
    await h.drain();
    assert.deepEqual(h.refreshed, []);
    h.near(20, true);
    await h.drain();
    assert.deepEqual(h.refreshed, [20]);
});

test('own writes are ignored without discarding already queued host changes', async t => {
    const h = setup(t, 2);
    await h.drain(); h.refreshed.length = 0;
    h.body(1).textContent = 'host repaint';
    h.mutation(h.body(1));
    const ownWrite = () => { h.body(1).append(h.document.createElement('span')); h.mutation(h.body(1)); };
    h.viewport.write(ownWrite);
    await h.drain();
    assert.deepEqual(h.refreshed, [1]);
    h.viewport.write(ownWrite);
    await h.drain();
    assert.deepEqual(h.refreshed, [1]);
});

test('detached/replaced content and shutdown revoke queued view work', async t => {
    const h = setup(t, 2);
    await h.drain(); h.refreshed.length = 0;
    const old = h.body(1);
    h.viewport.invalidate(old);
    const oldFloor = old.parentElement, nextFloor = h.floor(1);
    oldFloor.replaceWith(nextFloor);
    h.mutation(h.chat, { removedNodes: [oldFloor], addedNodes: [nextFloor] });
    await h.drain();
    assert.deepEqual(h.refreshed, [1]);
    assert.ok(h.released.includes(old));
    h.viewport.invalidate(h.body(1));
    h.unsubscribe();
    await h.drain();
    assert.deepEqual(h.refreshed, [1]);
});

test('an old host lease cannot release a remounted content owner', async t => {
    const h = setup(t, 2);
    await h.drain(); h.refreshed.length = 0;
    const content = h.body(1);
    const releaseOld = h.viewport.mount(content, 1);
    const releaseCurrent = h.viewport.mount(content, 1);
    releaseOld();
    h.viewport.invalidate(content);
    await h.drain();
    assert.deepEqual(h.refreshed, [1]);
    assert.ok(!h.released.includes(content));
    releaseCurrent();
    assert.ok(h.released.includes(content));
});

test('replacing the chat root discards pending old work and observes the new root', async t => {
    const h = setup(t, 2);
    await h.drain(); h.refreshed.length = 0;
    const old = h.body(1);
    h.viewport.invalidate(old);
    const chat = h.document.createElement('div'); chat.id = 'chat';
    const next = h.floor(2); chat.append(next);
    h.chat.replaceWith(chat);
    h.viewport.refresh();
    await h.drain();
    assert.deepEqual(h.refreshed, [2]);
    assert.ok(h.released.includes(old));
    h.mutation(next.querySelector('.mes_text'));
    await h.drain();
    assert.deepEqual(h.refreshed, [2, 2]);
});
