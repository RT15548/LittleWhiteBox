import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { bindMaxImagesInput, syncMaxImagesInput } from '../max-images-input.js';

// Two reproduced failures need controlled save ordering; lint/build cannot see
// either lost edit. No provider bundle, host storage, network or real-time waits.
function fixture(t, size = 1) {
    const { document, window } = parseHTML('<html><body></body></html>');
    const inputs = Array.from({ length: size }, () => document.body.appendChild(document.createElement('input')));
    let count = 2, release, started;
    const pending = new Promise(resolve => { release = resolve; });
    const saving = new Promise(resolve => { started = resolve; });
    const saves = [];
    const refresh = (input, force = false) => syncMaxImagesInput(input, { override: count, force });
    const bindings = inputs.map(input => bindMaxImagesInput(input, {
        getOverride: () => count, refresh,
        save: async next => {
            saves.push(next);
            if (saves.length === 1) { started(); await pending; }
            count = next;
            inputs.forEach(element => refresh(element));
            return true;
        },
    }));
    inputs.forEach(input => refresh(input));
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
