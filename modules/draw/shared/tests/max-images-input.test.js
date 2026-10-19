import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { bindMaxImagesInput, createMaxImagesInputRow, syncMaxImagesInput } from '../max-images-input.js';

// Contract: an old persistence result cannot erase a newer draft, and failed
// writes must retain the stored count while allowing the next edit to succeed.
function fixture(t, persist = async () => true) {
    const { document, window } = parseHTML('<html><body></body></html>');
    const row = createMaxImagesInputRow(document); document.body.append(row);
    const input = row.querySelector('input');
    const state = { count: 2, saves: [], warnings: [] };
    const refresh = (element = input, force = false) => syncMaxImagesInput(element, {
        override: state.count, presetMaxImages: 2, force,
    });
    const controller = bindMaxImagesInput(input, {
        getOverride: () => state.count, refresh, notify: warning => state.warnings.push(warning),
        save: async count => {
            state.saves.push(count);
            const ok = await persist(count);
            if (ok) state.count = count;
            refresh(); // Provider broadcasts the saved setting to every menu.
            return ok;
        },
    });
    t.after(() => controller.destroy());
    refresh();
    const fire = (type, props = {}) => {
        const event = new window.Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, props); input.dispatchEvent(event);
    };
    const type = value => { input.value = value; fire('input'); };
    return { input, state, controller, fire, type };
}

for (const next of ['8', '', '25']) test(`late save preserves a newer draft (${next || 'empty'}) even after focus moves`, async t => {
    let release;
    let first = true;
    const h = fixture(t, async () => {
        if (first) { first = false; await new Promise(resolve => { release = resolve; }); }
        return true;
    });
    t.mock.timers.enable({ apis: ['setTimeout'] });
    h.type('5');
    const saving = h.controller.flush(); await setImmediate();
    h.type(next);
    release(); await saving;
    assert.equal(h.input.value, next);
    assert.equal(h.state.count, 5);
    if (next === '8') {
        t.mock.timers.tick(350); await setImmediate();
        assert.equal(h.state.count, 8);
        assert.equal(h.input.value, '8');
    } else {
        t.mock.timers.tick(350); await setImmediate();
        assert.equal(h.state.count, 5);
        await h.controller.flush();
        assert.equal(h.state.count, next === '' ? null : 5);
        assert.equal(h.state.warnings.length, next === '' ? 0 : 1);
    }
});

test('a final newer edit remains visible while both saves are serialized', async t => {
    const releases = [];
    const h = fixture(t, () => new Promise(resolve => releases.push(resolve)));
    h.type('5'); const first = h.controller.flush(); await setImmediate();
    h.type('8'); const second = h.controller.flush();
    releases[0](true); await first; await setImmediate();
    assert.equal(h.input.value, '8');
    assert.deepEqual(h.state.saves, [5, 8]);
    releases[1](true); await second;
    assert.equal(h.state.count, 8);
});

for (const failure of ['false', 'throw']) test(`a ${failure} persistence result restores the real value and permits retry`, async t => {
    let fail = true;
    const h = fixture(t, async () => {
        if (fail && failure === 'throw') throw new Error('offline');
        return !fail;
    });
    const observed = [];
    t.mock.method(console, 'warn', (...args) => observed.push(args));
    h.type('6'); await h.controller.flush();
    assert.equal(h.state.count, 2);
    assert.equal(h.input.value, '2');
    assert.equal(observed.length, failure === 'throw' ? 1 : 0);
    assert.equal(h.state.warnings.length, failure === 'throw' ? 1 : 0);
    fail = false;
    h.type('7'); await h.controller.flush();
    assert.equal(h.state.count, 7);
});

test('invalid browser number input cannot accidentally clear the override', async t => {
    const h = fixture(t);
    Object.defineProperty(h.input, 'validity', { value: { badInput: true } });
    h.type(''); await h.controller.flush();
    assert.equal(h.state.count, 2);
    assert.equal(h.input.value, '2');
    assert.equal(h.state.warnings.length, 1);
    assert.deepEqual(h.state.saves, []);
});

for (const edited of [false, true]) test(`another menu's save updates a focused control only when it has no draft (${edited})`, async t => {
    const { document, window } = parseHTML('<html><body></body></html>');
    const inputs = [0, 1].map(() => {
        const row = createMaxImagesInputRow(document); document.body.append(row);
        return row.querySelector('input');
    });
    let focused;
    Object.defineProperty(document, 'activeElement', { get: () => focused });
    let count = 2, release;
    const saves = [];
    const refresh = (input, force = false) => syncMaxImagesInput(input, { override: count, presetMaxImages: 2, force });
    inputs.forEach(input => refresh(input));
    const bindings = inputs.map(input => bindMaxImagesInput(input, {
        getOverride: () => count, refresh,
        save: async next => {
            saves.push(next);
            if (saves.length === 1) await new Promise(resolve => { release = resolve; });
            count = next;
            inputs.forEach(element => refresh(element));
            return true;
        },
    }));
    t.after(() => bindings.forEach(binding => binding.destroy()));
    const type = (input, text) => { input.value = text; input.dispatchEvent(new window.Event('input')); };
    type(inputs[0], '5');
    const first = bindings[0].flush(); await setImmediate();
    focused = inputs[1];
    if (edited) type(inputs[1], '8');
    release(); await first;
    assert.equal(inputs[1].value, edited ? '8' : '5');
    focused = null;
    await bindings[1].flush();
    assert.equal(count, edited ? 8 : 5);
    assert.deepEqual(saves, edited ? [5, 8] : [5]);
});

test('destroy cancels queued edits without cancelling an already submitted write', async t => {
    let release;
    const h = fixture(t, () => new Promise(resolve => { release = resolve; }));
    h.type('5'); const first = h.controller.flush(); await setImmediate();
    h.type('8'); const second = h.controller.flush();
    h.controller.destroy(); h.input.remove();
    release(true); await Promise.all([first, second]);
    assert.deepEqual(h.state.saves, [5]);
});
