import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createContinuityMemoryPanel, limitEntries, parseMemoryLimit, parseScanLimit, sortEntriesByOrder } from '../continuity-memory-panel.js';

// Acceptance contracts (cost: the user edits a remembered outfit and the edit is lost, wrong, or wipes what they are typing):
// - The panel starts collapsed, and every character starts folded; the host is only asked when the panel is opened / refreshed,
//   and a character's input boxes only exist once that character is opened (nothing folded costs DOM or work).
// - Editing form or costume sends the whole entry back (appear preserved); remove / reset go through as ops.
// - Characters can be reordered (drag or ↑ / ↓ on the handle); the order is a saved display preference, applied again on every reply;
//   "sort by latest" clears it so the host order (most recent first) shows again.
// - Only the first N characters (default 10, 0 / empty = all) are shown, after sorting; the rest stay remembered and a line says how many are hidden.
// - How far back the host reads (floors) and how many characters it remembers are plain positive numbers kept in the plugin settings; the panel says what the last read covered.
// - A later host reply updates rows in place, in the host's order, without recreating rows or overwriting a field being typed in.

function setup({ confirm, order = [], limit = null, scan = undefined } = {}) {
    const { document, Event } = parseHTML('<html><body><div id="mount"></div></body></html>');
    const calls = { request: 0, edits: [] };
    const saved = [];
    const limits = [];
    const scans = [];
    const panel = createContinuityMemoryPanel({
        document,
        container: document.getElementById('mount'),
        requestMemory: () => { calls.request += 1; },
        editMemory: payload => calls.edits.push(payload),
        confirm,
        getOrder: () => order,
        onOrderChange: names => saved.push(names),
        getLimit: () => limit,
        onLimitChange: value => limits.push(value),
        getScanLimits: () => scan,
        onScanLimitsChange: value => scans.push(value),
    });
    const fire = (node, type) => node.dispatchEvent(new Event(type, { bubbles: true }));
    const open = (name) => fire(document.querySelector(`[data-name="${name}"] .named-tag-toggle`), 'click');
    return { document, panel, calls, fire, open, saved, limits, scans };
}
const entry = (name, extra = {}) => ({ name, form: '', appear: '', costume: '', known: true, edited: false, ...extra });
const toggleOf = document => document.querySelector('.char-section-toggle');

test('starts collapsed, asks the host only when opened or refreshed', () => {
    const { document, calls, fire } = setup();
    assert.equal(document.querySelector('.cm-panel').classList.contains('is-collapsed'), true);
    assert.equal(document.querySelector('.char-section-body').hidden, true);
    assert.equal(calls.request, 0);
    fire(toggleOf(document), 'click');
    assert.equal(calls.request, 1);
    assert.equal(document.querySelector('.cm-panel').classList.contains('is-collapsed'), false);
    fire(toggleOf(document), 'click');
    assert.equal(calls.request, 1, 'closing does not ask again');
    fire(document.querySelectorAll('.char-section-actions button')[0], 'click');
    assert.equal(calls.request, 2);
});

test('characters start folded: one header line each, and the input boxes do not exist until opened', () => {
    const { document, panel, open } = setup();
    panel.render({ hasChat: true, entries: [entry('司盈昃', { form: '人形', costume: 'topless, bare chest', edited: true }), entry('路人乙', { known: false, appear: 'short hair', costume: 'grey coat', floor: 11 }), entry('龙', { costume: '' })] });
    const rows = [...document.querySelectorAll('.cm-entry')];
    assert.equal(rows.length, 3);
    assert.ok(rows.every(row => row.classList.contains('is-folded')), 'all folded');
    assert.equal(document.querySelectorAll('.cm-entry input, .cm-entry textarea').length, 0, 'no input boxes in any folded character');
    assert.equal(rows[0].querySelector('.named-tag-preview').textContent, '人形｜topless, bare chest');
    assert.equal(rows[2].querySelector('.named-tag-preview').textContent, '（空＝没穿）');
    assert.equal(rows[0].querySelector('.cm-edited').hidden, false);
    assert.equal(rows[1].querySelector('.cm-edited').hidden, true);
    assert.equal(rows[0].querySelector('.cm-floor').textContent, '', 'an edited row belongs to no floor');
    assert.equal(rows[1].querySelector('.cm-floor').textContent, '（第 11 层）');
    assert.equal(document.querySelector('.char-section-count').textContent, '（3）');

    open('司盈昃');
    assert.equal(rows[0].classList.contains('is-folded'), false);
    assert.equal(rows[0].querySelector('.cm-form').value, '人形');
    assert.equal(rows[0].querySelector('.cm-costume').value, 'topless, bare chest');
    assert.equal(rows[0].querySelector('.cm-costume').tagName, 'TEXTAREA');
    assert.ok(rows[0].querySelector('.cm-costume').hasAttribute('data-autofit'), 'the costume box grows with its content');
    assert.match(rows[0].querySelector('.cm-costume').placeholder, /留空＝没穿/);
    assert.equal(document.querySelectorAll('textarea').length, 1, 'only the opened character has boxes');
    open('司盈昃');
    assert.equal(rows[0].classList.contains('is-folded'), true, 'opening again folds it');
});

test('editing sends the whole entry back; remove sends a remove', () => {
    const { document, panel, calls, fire, open } = setup();
    panel.render({ hasChat: true, entries: [entry('司盈昃', { form: '人形', costume: 'grey robe' }), entry('路人乙', { known: false, appear: 'short hair', costume: 'grey coat' })] });
    open('路人乙');
    const costume = document.querySelector('[data-name="路人乙"] .cm-costume');
    costume.value = '  black coat ';
    fire(costume, 'change');
    assert.deepEqual(calls.edits.at(-1), { op: 'set', name: '路人乙', form: '', appear: 'short hair', costume: 'black coat' });
    fire(document.querySelector('[data-name="司盈昃"] .cm-remove'), 'click');
    assert.deepEqual(calls.edits.at(-1), { op: 'remove', name: '司盈昃' });
    assert.equal(document.querySelector('[data-name="司盈昃"]').classList.contains('is-folded'), true, 'remove does not open the row');
});

test('editing only the form box sends the new form with the costume unchanged', () => {
    const { document, panel, calls, fire, open } = setup();
    panel.render({ hasChat: true, entries: [entry('司盈昃', { form: '人形', appear: 'long hair', costume: 'grey robe' })] });
    open('司盈昃');
    const form = document.querySelector('[data-name="司盈昃"] .cm-form');
    form.value = ' 龙形 ';
    fire(form, 'change');
    assert.deepEqual(calls.edits, [{ op: 'set', name: '司盈昃', form: '龙形', appear: 'long hair', costume: 'grey robe' }]);
});

test('reset needs the confirmation to pass', () => {
    let answer = false;
    const { document, panel, calls, fire } = setup({ confirm: () => answer });
    panel.render({ hasChat: true, entries: [entry('A', { costume: 'x' })] });
    const reset = document.querySelectorAll('.char-section-actions button')[1];
    fire(reset, 'click');
    assert.equal(calls.edits.length, 0);
    answer = true;
    fire(reset, 'click');
    assert.deepEqual(calls.edits, [{ op: 'reset' }]);
});

test('a later reply updates rows in place, keeps what is open, follows the host order and drops removed characters', () => {
    const { document, panel, open } = setup();
    panel.render({ hasChat: true, entries: [entry('A', { costume: 'one' }), entry('B', { costume: 'two' })] });
    open('A');
    const rowA = document.querySelector('[data-name="A"]');
    panel.render({ hasChat: true, entries: [entry('B', { costume: 'two!' }), entry('A', { costume: 'one!' }), entry('C')] });
    assert.deepEqual([...document.querySelectorAll('.cm-entry')].map(row => row.getAttribute('data-name')), ['B', 'A', 'C']);
    assert.equal(document.querySelector('[data-name="A"]'), rowA, 'the row node is reused');
    assert.equal(rowA.classList.contains('is-folded'), false, 'an opened row stays open');
    assert.equal(rowA.querySelector('.cm-costume').value, 'one!');
    assert.equal(rowA.querySelector('.named-tag-preview').textContent, 'one!');
    panel.render({ hasChat: true, entries: [entry('C')] });
    assert.deepEqual([...document.querySelectorAll('.cm-entry')].map(row => row.getAttribute('data-name')), ['C']);
});

// linkedom 的 document.activeElement 不随 focus() 变化，这里直接指定“当前焦点”。
const focusOn = (document, node) => Object.defineProperty(document, 'activeElement', { configurable: true, get: () => node });

test('a host reply does not overwrite the field being typed in, while the other fields still update', () => {
    const { document, panel, open } = setup();
    panel.render({ hasChat: true, entries: [entry('A', { form: 'f1', costume: 'c1' })] });
    open('A');
    const form = document.querySelector('[data-name="A"] .cm-form');
    const costume = document.querySelector('[data-name="A"] .cm-costume');
    form.value = 'typing…';
    focusOn(document, form);
    panel.render({ hasChat: true, entries: [entry('A', { form: 'f2', costume: 'c2' })] });
    assert.equal(form.value, 'typing…', 'the focused box keeps what the user typed');
    assert.equal(costume.value, 'c2', 'the other box follows the host');
    costume.value = 'typing too';
    focusOn(document, costume);
    panel.render({ hasChat: true, entries: [entry('A', { form: 'f3', costume: 'c3' })] });
    assert.equal(costume.value, 'typing too');
    assert.equal(form.value, 'f3', 'the box that lost focus follows the host again');
});

test('host-pushed scan limits do not overwrite the scan box being typed in', () => {
    const { document, panel } = setup();
    const [floors, entries] = [...document.querySelectorAll('.cm-scan-limits input')];
    floors.value = '12';
    focusOn(document, floors);
    panel.setScanLimits({ maxFloors: 300, maxEntries: 40 });
    assert.equal(floors.value, '12', 'the focused box is left alone');
    assert.equal(entries.value, '40', 'the other box updates');
    focusOn(document, entries);
    entries.value = '7';
    panel.setScanLimits({ maxFloors: 301, maxEntries: 41 });
    assert.equal(entries.value, '7');
    assert.equal(floors.value, '301');
});

test('the footer for hidden characters names the box to raise', () => {
    const { document, panel } = setup();
    panel.render({ hasChat: true, entries: many(12) });
    assert.match(document.querySelector('.cm-more').textContent, /“显示前”/);
});

test('no chat / nothing remembered shows a message instead of rows', () => {
    const { document, panel } = setup();
    panel.render({ hasChat: false, entries: [] });
    assert.match(document.querySelector('.cm-empty').textContent, /没有打开聊天/);
    panel.render({ hasChat: true, entries: [] });
    assert.match(document.querySelector('.cm-empty').textContent, /还没有记下/);
    assert.equal(document.querySelectorAll('.cm-entry').length, 0);
});

test('the saved order wins over the host order; characters it does not know keep the host order after them', () => {
    const names = list => list.map(item => item.name);
    assert.deepEqual(names(sortEntriesByOrder([entry('A'), entry('B'), entry('C'), entry('D')], ['C', 'A'])), ['C', 'A', 'B', 'D']);
    assert.deepEqual(names(sortEntriesByOrder([entry('A'), entry('B')], undefined)), ['A', 'B']);
    assert.deepEqual(names(sortEntriesByOrder([entry('A'), entry('B')], ['ghost', 7, 'B'])), ['B', 'A']);
    const { document, panel } = setup({ order: ['B'] });
    panel.render({ hasChat: true, entries: [entry('A'), entry('B')] });
    assert.deepEqual([...document.querySelectorAll('.cm-entry')].map(row => row.getAttribute('data-name')), ['B', 'A']);
});

test('moving a character with the keyboard reorders the rows, saves the order and keeps it on the next reply', () => {
    const { document, panel, fire, saved } = setup();
    panel.render({ hasChat: true, entries: [entry('A'), entry('B'), entry('C')] });
    const handle = document.querySelector('[data-name="A"] [data-cm-drag]');
    const Event = document.defaultView.Event;
    handle.dispatchEvent(Object.assign(new Event('keydown', { bubbles: true }), { key: 'ArrowDown' }));
    assert.deepEqual([...document.querySelectorAll('.cm-entry')].map(row => row.getAttribute('data-name')), ['B', 'A', 'C']);
    assert.deepEqual(saved.at(-1), ['B', 'A', 'C']);
    panel.render({ hasChat: true, entries: [entry('A'), entry('B'), entry('C'), entry('D')] });
    assert.deepEqual([...document.querySelectorAll('.cm-entry')].map(row => row.getAttribute('data-name')), ['B', 'A', 'C', 'D']);
    fire(handle, 'click');
    assert.equal(document.querySelector('[data-name="A"]').classList.contains('is-folded'), true, 'the handle does not fold or unfold the row');
});

test('"sort by latest" clears the saved order and shows the host order again', () => {
    const { document, panel, fire, saved } = setup({ order: ['B', 'A'] });
    panel.render({ hasChat: true, entries: [entry('A'), entry('B'), entry('C')] });
    assert.deepEqual([...document.querySelectorAll('.cm-entry')].map(row => row.getAttribute('data-name')), ['B', 'A', 'C']);
    fire(document.querySelectorAll('.char-section-actions button')[2], 'click');
    assert.deepEqual(saved.at(-1), []);
    assert.deepEqual([...document.querySelectorAll('.cm-entry')].map(row => row.getAttribute('data-name')), ['A', 'B', 'C']);
});

const many = count => Array.from({ length: count }, (_, index) => entry(`C${index + 1}`));
const shownNames = document => [...document.querySelectorAll('.cm-entry')].map(row => row.getAttribute('data-name'));

test('parsing the limit box: empty or 0 means all, only plain non-negative integers are accepted', () => {
    assert.deepEqual(['', ' ', '0', '10', '007', '5000'].map(parseMemoryLimit), [0, 0, 0, 10, 7, 999]);
    assert.deepEqual(['-1', '2.5', 'abc', '1e3', '١٢'].map(parseMemoryLimit), [null, null, null, null, null]);
    assert.deepEqual(limitEntries(many(5), 2).shown.map(item => item.name), ['C1', 'C2']);
    assert.deepEqual([limitEntries(many(5), 0).hiddenCount, limitEntries(many(5), 9).hiddenCount, limitEntries(many(5), 2).hiddenCount], [0, 0, 3]);
});

test('by default only the first ten are shown, with a count and a note about the hidden ones', () => {
    const { document, panel } = setup();
    panel.render({ hasChat: true, entries: many(12) });
    assert.equal(shownNames(document).length, 10);
    assert.deepEqual(shownNames(document).slice(0, 2), ['C1', 'C2']);
    assert.equal(document.querySelector('.char-section-count').textContent, '（显示 10/12）');
    assert.equal(document.querySelector('.cm-more').hidden, false);
    assert.match(document.querySelector('.cm-more').textContent, /还有 2 个没显示/);
    assert.equal(document.querySelector('.cm-limit-input').value, '10');
    assert.match(document.querySelector('.cm-limit-total').textContent, /共 12 个/);
    panel.render({ hasChat: true, entries: many(4) });
    assert.equal(document.querySelector('.char-section-count').textContent, '（4）');
    assert.equal(document.querySelector('.cm-more').hidden, true);
});

test('changing the box re-renders at once, saves the number, and ignores invalid input', () => {
    const { document, panel, fire, limits } = setup();
    panel.render({ hasChat: true, entries: many(12) });
    const input = document.querySelector('.cm-limit-input');
    input.value = '3';
    fire(input, 'change');
    assert.deepEqual(shownNames(document), ['C1', 'C2', 'C3']);
    assert.deepEqual(limits, [3]);
    input.value = '';
    fire(input, 'change');
    assert.equal(shownNames(document).length, 12, 'empty = all');
    assert.deepEqual(limits, [3, 0]);
    input.value = '-1';
    fire(input, 'change');
    assert.equal(input.value, '', 'an invalid entry goes back to the current value');
    assert.deepEqual(limits, [3, 0], 'and is not saved');
    input.value = '50';
    fire(input, 'change');
    assert.equal(shownNames(document).length, 12, 'bigger than the total shows everything');
});

test('a saved limit is used on open (0 = all), and the limit applies after the saved order', () => {
    const all = setup({ limit: 0 });
    all.panel.render({ hasChat: true, entries: many(12) });
    assert.equal(shownNames(all.document).length, 12);
    assert.equal(all.document.querySelector('.cm-limit-input').value, '');
    const sorted = setup({ limit: 2, order: ['C5'] });
    sorted.panel.render({ hasChat: true, entries: many(6) });
    assert.deepEqual(shownNames(sorted.document), ['C5', 'C1']);
});

test('scan limits: positive integers only, invalid input goes back, a valid change is handed to the host', () => {
    assert.deepEqual(['1', ' 500 ', '007', '1000000'].map(parseScanLimit), [1, 500, 7, 99999]);
    assert.deepEqual(['', '0', '-3', '2.5', 'abc'].map(parseScanLimit), [null, null, null, null, null]);
    const { document, fire, scans } = setup({ scan: { maxFloors: 500, maxEntries: 200 } });
    const [floors, entries] = [...document.querySelectorAll('.cm-scan-limits input')];
    assert.deepEqual([floors.value, entries.value], ['500', '200']);
    floors.value = '1200';
    fire(floors, 'change');
    assert.deepEqual(scans.at(-1), { maxFloors: 1200, maxEntries: 200 });
    entries.value = '0';
    fire(entries, 'change');
    assert.equal(entries.value, '200', 'an invalid entry goes back');
    assert.equal(scans.length, 1, 'and is not saved');
    entries.value = '80';
    fire(entries, 'change');
    assert.deepEqual(scans.at(-1), { maxFloors: 1200, maxEntries: 80 });
});

test('the host can push new scan limits in, and the panel reports what the last read covered', () => {
    const { document, panel } = setup();
    const [floors, entries] = [...document.querySelectorAll('.cm-scan-limits input')];
    assert.deepEqual([floors.value, entries.value], ['100', '50'], 'defaults without saved settings');
    panel.setScanLimits({ maxFloors: 300, maxEntries: 40 });
    assert.deepEqual([floors.value, entries.value], ['300', '40']);
    panel.setScanLimits({ maxFloors: 'x', maxEntries: -1 });
    assert.deepEqual([floors.value, entries.value], ['300', '40'], 'bad values from outside are ignored');
    panel.render({ hasChat: true, entries: [], scan: { floors: 500, slots: 123, ms: 842, truncated: true, maxFloors: 500 } });
    assert.match(document.querySelector('.cm-scan').textContent, /读取了最近 500 层里的 123 个图位，用时 842 毫秒；更早的楼层没有读（上限 500 层）/);
    panel.render({ hasChat: true, entries: [], scan: { floors: 80, slots: 12, ms: 40, truncated: false, maxFloors: 500 } });
    assert.ok(!document.querySelector('.cm-scan').textContent.includes('更早'), 'no warning when everything was read');
    panel.render({ hasChat: false, entries: [], scan: null });
    assert.equal(document.querySelector('.cm-scan').hidden, true);
});
