import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { contextMeterMarkup, renderContextMeter, bindContextMeter } from '../app-src/ui/context-meter.js';

function fixture() {
    const { document, window } = parseHTML(`<html><body><main>${contextMeterMarkup()}<button id="outside"></button></main></body></html>`);
    const root = document.querySelector('main');
    const state = { contextStats: { usedTokens: 0, budgetTokens: 1000, summaryActive: false }, isBusy: false, progressLabel: '' };
    const update = () => renderContextMeter(root, state, { summaryTriggerTokens: 800, buildContextMeterLabel: () => String(state.contextStats.usedTokens) });
    return { root, state, update, window, details: root.querySelector('details'), meter: root.querySelector('summary') };
}

test('context ring follows usage and warning threshold without replacing or closing an open reading panel', () => {
    const f = fixture();
    f.update();
    assert.equal(f.meter.style.getPropertyValue('--context-fill'), '0');
    assert.equal(f.meter.classList.contains('is-warning'), false);
    const phase = f.root.querySelector('[role="status"]');
    assert.equal(phase.hidden, true);
    f.details.open = true;
    f.state.contextStats.usedTokens = 500;
    f.update();
    assert.equal(f.meter.style.getPropertyValue('--context-fill'), '50');
    assert.equal(f.meter.classList.contains('is-warning'), false);
    f.state.contextStats.usedTokens = 800;
    f.state.contextStats.summaryActive = true;
    f.state.isBusy = true;
    f.state.progressLabel = 'fixture-phase';
    f.update();
    assert.equal(f.meter.classList.contains('is-warning'), true);
    assert.equal(phase.hidden, false);
    assert.equal(f.root.querySelector('#xb-assistant-context-summary').hidden, false);
    assert.equal(f.root.querySelector('summary'), f.meter);
    assert.equal(f.details.open, true);
    f.state.contextStats.usedTokens = 1200;
    f.update();
    assert.equal(f.meter.style.getPropertyValue('--context-fill'), '100');
    f.state.contextStats.usedTokens = 100;
    f.state.isBusy = false;
    f.update();
    assert.equal(f.meter.classList.contains('is-warning'), false);
    assert.equal(phase.hidden, true);
});

test('context details close on explicit dismissal, outside press and Escape without clearing conversation state', () => {
    const f = fixture();
    bindContextMeter(f.root);
    const state = structuredClone(f.state);
    const open = () => { f.details.open = true; f.details.dispatchEvent(new f.window.Event('toggle')); };
    open();
    assert.equal(f.meter.getAttribute('aria-expanded'), 'true');
    f.root.querySelector('#xb-assistant-context-close').click();
    assert.equal(f.details.open, false);
    assert.equal(f.meter.getAttribute('aria-expanded'), 'false');
    open();
    f.root.querySelector('#outside').dispatchEvent(new f.window.Event('pointerdown', { bubbles: true }));
    assert.equal(f.details.open, false);
    open();
    const escape = new f.window.Event('keydown', { bubbles: true, cancelable: true });
    escape.key = 'Escape';
    f.meter.dispatchEvent(escape);
    assert.equal(f.details.open, false);
    assert.equal(escape.defaultPrevented, true);
    assert.deepEqual(f.state, state);
});
