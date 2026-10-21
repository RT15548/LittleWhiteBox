import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createMaxImagesController } from '../max-images-input.js';

// Acceptance: late receipts must not erase newer edits; untouched menus must not
// resubmit stale counts; failed saves restore confirmed values without erasing
// another menu's draft. Lost edits can silently change paid image request counts.
function fixture(t, size = 1, { saveSucceeds = true } = {}) {
    const { document, window } = parseHTML('<html><body></body></html>');
    const inputs = Array.from({ length: size }, () => document.body.appendChild(document.createElement('input')));
    let count = 2, release, started;
    let providerQueue = Promise.resolve();
    const pending = new Promise(resolve => { release = resolve; });
    const saving = new Promise(resolve => { started = resolve; });
    const saves = [];
    const controller = createMaxImagesController({
        getOverride: () => count,
        getPresetMaxImages: () => 0,
        listInputs: () => inputs,
        persistOverride: next => {
            const result = providerQueue.then(async () => {
                saves.push(next);
                if (saves.length === 1) { started(); await pending; }
                if (saveSucceeds) count = next;
                return saveSucceeds;
            });
            providerQueue = result;
            return result;
        },
    });
    const bindings = inputs.map(input => controller.bind(input));
    inputs.forEach(input => controller.fill(input));
    t.after(() => bindings.forEach(binding => binding.destroy()));
    const type = (index, value) => { inputs[index].value = value; inputs[index].dispatchEvent(new window.Event('input')); };
    return { document, inputs, bindings, type, saving, release, saves, count: () => count };
}

test('an old save cannot erase a newer count before it is submitted', async t => {
    const h = fixture(t);
    h.type(0, '5');
    const first = h.bindings[0].flush(); await h.saving;
    h.type(0, '8');
    h.release(); await first;
    assert.equal(h.inputs[0].value, '8');
    await h.bindings[0].flush();
    assert.equal(h.count(), 8);
    assert.deepEqual(h.saves, [5, 8]);
});

test('focusing an untouched second menu cannot undo a saved count on blur', async t => {
    const h = fixture(t, 2);
    let focused;
    Object.defineProperty(h.document, 'activeElement', { get: () => focused });
    h.type(0, '5');
    const first = h.bindings[0].flush(); await h.saving;
    focused = h.inputs[1];
    h.release(); await first;
    assert.equal(h.inputs[1].value, '5');
    focused = null;
    await h.bindings[1].flush();
    assert.equal(h.count(), 5);
    assert.deepEqual(h.saves, [5]);
});

test('a failed count save restores the confirmed value without erasing another menu draft', async t => {
    const h = fixture(t, 2, { saveSucceeds: false });
    h.type(0, '5');
    const saving = h.bindings[0].flush(); await h.saving;
    h.type(1, '8');
    h.release(); await saving;
    assert.equal(h.count(), 2);
    assert.deepEqual(h.inputs.map(input => input.value), ['2', '8']);
    assert.deepEqual(h.saves, [5]);
});

for (const latest of ['10', '2']) test(`submissions across menus keep their order, including returning to ${latest}`, async t => {
    const h = fixture(t, 2);
    h.type(0, '5');
    const first = h.bindings[0].flush(); await h.saving;
    h.type(0, '8');
    const second = h.bindings[0].flush();
    h.type(1, latest);
    const third = h.bindings[1].flush();
    // Enter followed by blur is not another edit; it must not enqueue stale 8
    // after the second menu's later submission while saves are still pending.
    const blur = h.bindings[0].flush();
    h.release();
    await Promise.all([first, second, third, blur]);
    assert.deepEqual(h.saves, [5, 8, Number(latest)]);
    assert.equal(h.count(), Number(latest));
    assert.deepEqual(h.inputs.map(input => input.value), [latest, latest]);
});
