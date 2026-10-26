import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import {
    GROUP_HEIGHT_MAX,
    GROUP_HEIGHT_MIN,
    GROUP_HEIGHT_STORAGE_KEY,
    UNGROUPED_HEIGHT_KEY,
    clampGroupHeight,
    createGroupHeightController,
    groupHeightKey,
    loadGroupHeights,
    nextGroupHeightForKey,
    normalizeGroupHeights,
    pruneGroupHeights,
    saveGroupHeights,
    setGroupHeight,
} from '../character-group-height.js';

// Acceptance contracts (cost: a layout preference lost, leaking into character data, or breaking the list):
// - The per-group height is a local UI preference keyed by group id (ungrouped has a reserved key), clamped to sane bounds,
//   garbage in storage is ignored, and it is stored under its own lwb.draw.* key - never in the character library.
// - Drag, keyboard (Up / Down / Shift / Home) and double-click all go through the same save path.

function fakeStorage(initial = {}) {
    const data = new Map(Object.entries(initial));
    return {
        data,
        getItem: key => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => { data.set(key, String(value)); },
        removeItem: (key) => { data.delete(key); },
    };
}

test('heights are clamped, rounded and keyed by group id (ungrouped uses the reserved key)', () => {
    assert.equal(clampGroupHeight(10), GROUP_HEIGHT_MIN);
    assert.equal(clampGroupHeight(99999), GROUP_HEIGHT_MAX);
    assert.equal(clampGroupHeight('400.6'), 401);
    for (const bad of [null, undefined, '', 'abc', NaN, Infinity]) assert.equal(clampGroupHeight(bad), null);
    assert.equal(groupHeightKey(''), UNGROUPED_HEIGHT_KEY);
    assert.equal(groupHeightKey('grp-1'), 'grp-1');
    assert.equal(UNGROUPED_HEIGHT_KEY, '__ungrouped__'); // 与折叠状态的未分组键一致
});

test('normalize drops garbage; set/clear/prune return new objects and keep other groups untouched', () => {
    assert.deepEqual(normalizeGroupHeights({ a: 300, b: 'x', c: null, d: 5, e: [1] }), { a: 300, d: GROUP_HEIGHT_MIN });
    for (const bad of [null, undefined, 'x', 7, [300]]) assert.deepEqual(normalizeGroupHeights(bad), {});

    const base = { a: 300 };
    const withB = setGroupHeight(base, 'b', 480);
    assert.deepEqual(withB, { a: 300, b: 480 });
    assert.deepEqual(base, { a: 300 });
    assert.deepEqual(setGroupHeight(withB, '', 500), { a: 300, b: 480, [UNGROUPED_HEIGHT_KEY]: 500 });
    assert.deepEqual(setGroupHeight(withB, 'a', null), { b: 480 });
    assert.deepEqual(setGroupHeight(withB, 'zzz', null), withB);

    assert.deepEqual(pruneGroupHeights({ a: 300, gone: 400, [UNGROUPED_HEIGHT_KEY]: 500 }, ['a']), { a: 300, [UNGROUPED_HEIGHT_KEY]: 500 });
});

test('load / save round trip uses its own key; an empty table removes the key; broken JSON loads as empty', () => {
    const storage = fakeStorage();
    assert.deepEqual(loadGroupHeights(storage), {});
    assert.equal(saveGroupHeights(storage, { a: 321 }), true);
    assert.deepEqual([...storage.data.keys()], [GROUP_HEIGHT_STORAGE_KEY]);
    assert.equal(GROUP_HEIGHT_STORAGE_KEY, 'lwb.draw.charGroupHeights');
    assert.deepEqual(loadGroupHeights(storage), { a: 321 });
    saveGroupHeights(storage, {});
    assert.equal(storage.data.size, 0);

    assert.deepEqual(loadGroupHeights(fakeStorage({ [GROUP_HEIGHT_STORAGE_KEY]: '{not json' })), {});
    assert.deepEqual(loadGroupHeights(null), {});
    assert.deepEqual(loadGroupHeights({ getItem() { throw new Error('blocked'); } }), {});
    // 存储不可写（隐私模式等）：不抛错
    const warn = console.warn;
    console.warn = () => {};
    try {
        assert.equal(saveGroupHeights({ setItem() { throw new Error('quota'); } }, { a: 300 }), false);
    } finally { console.warn = warn; }
});

test('keyboard mapping: Up / Down step, Shift is a large step, Home resets, other keys are ignored', () => {
    assert.equal(nextGroupHeightForKey(400, 'ArrowDown'), 440);
    assert.equal(nextGroupHeightForKey(400, 'ArrowUp'), 360);
    assert.equal(nextGroupHeightForKey(400, 'ArrowDown', { shift: true }), 560);
    assert.equal(nextGroupHeightForKey(GROUP_HEIGHT_MIN, 'ArrowUp'), GROUP_HEIGHT_MIN);
    assert.equal(nextGroupHeightForKey(GROUP_HEIGHT_MAX, 'ArrowDown'), GROUP_HEIGHT_MAX);
    assert.equal(nextGroupHeightForKey(400, 'Home'), null);
    assert.equal(nextGroupHeightForKey(400, 'Enter'), undefined);
});

function mountList(storage, extra = {}) {
    const { document, window } = parseHTML(`<html><body><div id="list">
        <section class="grp" data-group-id=""><div class="body">a</div></section>
        <section class="grp" data-group-id="g1"><div class="body">b</div></section>
        <section class="grp collapsed" data-group-id="g2"><div class="body" hidden>c</div></section>
    </div></body></html>`);
    const list = document.querySelector('#list');
    const controller = createGroupHeightController({
        list, document, getStorage: () => storage, groupSelector: '.grp', bodySelector: '.body', measure: () => 333, ...extra,
    });
    const section = id => list.querySelector(`.grp[data-group-id="${id}"]`);
    const event = (type, init = {}) => {
        const e = new window.Event(type, { bubbles: true, cancelable: true });
        Object.assign(e, init);
        return e;
    };
    return { document, window, list, controller, section, event, handle: id => section(id).querySelector('.lwb-group-resize'), body: id => section(id).querySelector('.body') };
}

test('apply adds one handle after each scroll area (idempotent) and writes only the saved heights as a CSS variable', () => {
    const storage = fakeStorage({ [GROUP_HEIGHT_STORAGE_KEY]: JSON.stringify({ g1: 520, gone: 400 }) });
    const m = mountList(storage);
    m.controller.apply({ validGroupIds: ['g1', 'g2'] });
    m.controller.apply();
    assert.equal(m.list.querySelectorAll('.lwb-group-resize').length, 3);
    assert.equal(m.body('g1').nextElementSibling, m.handle('g1'));
    assert.equal(m.body('g1').style.getPropertyValue('--lwb-group-height'), '520px');
    assert.equal(m.body('').style.getPropertyValue('--lwb-group-height'), '');
    assert.equal(m.handle('g1').getAttribute('role'), 'separator');
    assert.equal(m.handle('g1').getAttribute('tabindex'), '0');
    // 已删除分组的记录被清掉并写回
    assert.deepEqual(loadGroupHeights(storage), { g1: 520 });
});

test('keyboard resize saves per group; Home resets only that group', () => {
    const storage = fakeStorage();
    const m = mountList(storage);
    m.controller.apply();
    // 没有保存值时从当前实际高度（333）起步
    const down = m.event('keydown', { key: 'ArrowDown' });
    m.handle('g1').dispatchEvent(down);
    assert.equal(down.defaultPrevented, true);
    assert.equal(m.body('g1').style.getPropertyValue('--lwb-group-height'), '373px');
    m.handle('').dispatchEvent(m.event('keydown', { key: 'ArrowUp', shiftKey: true }));
    assert.deepEqual(loadGroupHeights(storage), { g1: 373, [UNGROUPED_HEIGHT_KEY]: 173 });
    m.handle('g1').dispatchEvent(m.event('keydown', { key: 'Home' }));
    assert.deepEqual(loadGroupHeights(storage), { [UNGROUPED_HEIGHT_KEY]: 173 });
    assert.equal(m.body('g1').style.getPropertyValue('--lwb-group-height'), '');
    const other = m.event('keydown', { key: 'a' });
    m.handle('g1').dispatchEvent(other);
    assert.equal(other.defaultPrevented, false);
});

test('double-click resets to the default', () => {
    const storage = fakeStorage({ [GROUP_HEIGHT_STORAGE_KEY]: JSON.stringify({ g1: 600 }) });
    const m = mountList(storage);
    m.controller.apply();
    m.handle('g1').dispatchEvent(m.event('dblclick'));
    assert.equal(storage.data.size, 0);
    assert.equal(m.body('g1').style.getPropertyValue('--lwb-group-height'), '');
});

test('pointer drag follows the pointer live, clamps, and saves once on release; Esc-like cancel restores', () => {
    const storage = fakeStorage();
    const m = mountList(storage);
    m.controller.apply();
    const pointer = (type, y, target = m.document) => target.dispatchEvent(m.event(type, { pointerId: 7, clientY: y, button: 0 }));
    pointer('pointerdown', 100, m.handle('g1'));
    pointer('pointermove', 180);
    assert.equal(m.body('g1').style.getPropertyValue('--lwb-group-height'), '413px'); // 333 + 80
    assert.equal(storage.data.size, 0); // 拖动过程中不写存储
    pointer('pointermove', -5000);
    assert.equal(m.body('g1').style.getPropertyValue('--lwb-group-height'), `${GROUP_HEIGHT_MIN}px`);
    pointer('pointermove', 250);
    pointer('pointerup', 250);
    assert.deepEqual(loadGroupHeights(storage), { g1: 483 });
    // 松手后移动不再有效
    pointer('pointermove', 900);
    assert.equal(m.body('g1').style.getPropertyValue('--lwb-group-height'), '483px');

    pointer('pointerdown', 100, m.handle('g1'));
    pointer('pointermove', 200);
    pointer('pointercancel', 200);
    assert.equal(m.body('g1').style.getPropertyValue('--lwb-group-height'), '483px'); // 取消：回到拖动前保存的值
    assert.deepEqual(loadGroupHeights(storage), { g1: 483 });
});

test('a new controller (page reload) reads the saved heights back', () => {
    const storage = fakeStorage();
    const first = mountList(storage);
    first.controller.apply();
    first.handle('g1').dispatchEvent(first.event('keydown', { key: 'ArrowDown', shiftKey: true }));
    first.controller.destroy();

    const second = mountList(storage);
    second.controller.apply();
    assert.equal(second.body('g1').style.getPropertyValue('--lwb-group-height'), '493px');
});
