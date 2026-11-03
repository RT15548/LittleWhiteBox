import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { parse, compileScript } from 'vue/compiler-sfc';
import { build } from 'esbuild';
import { readCoc7Sheet } from '../apps/dice/domain/coc7-sheet.ts';
import { emptyCoc7Draft } from '../apps/dice/domain/coc7-creation.ts';

// Mount the actual SFC. Only the bridge is replaced, returning the host's public {ok,result} envelope.
test('Dice switches accept confirmed settings, keep newer preference pushes and unsubscribe on exit', async t => {
    const dom = parseHTML('<html><body><div id="app"></div></body></html>');
    // Layout is supplied only for the shared dialog's focus availability check.
    const elementPrototype = dom.window.HTMLElement.prototype;
    const rects = Object.getOwnPropertyDescriptor(elementPrototype, 'getClientRects');
    Object.defineProperty(elementPrototype, 'getClientRects', { configurable: true, value: () => [{ width: 100, height: 44 }] });
    t.after(() => { if (rects) { Object.defineProperty(elementPrototype, 'getClientRects', rects); } else { delete elementPrototype.getClientRects; } });
    const previous = new Map();
    for (const key of ['window', 'document', 'Document', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'getComputedStyle']) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value: key === 'getComputedStyle' ? () => ({ visibility: 'visible' }) : dom.window[key], configurable: true });
    }
    t.after(() => { for (const [key, descriptor] of previous) {
        if (descriptor) { Object.defineProperty(globalThis, key, descriptor); } else { delete globalThis[key]; }
    } });
    const { createApp, nextTick } = await import('vue');
    const path = new URL('../apps/dice/ui/DiceApp.vue', import.meta.url);
    const { descriptor } = parse(readFileSync(path, 'utf8'), { filename: fileURLToPath(path) });
    const script = compileScript(descriptor, { id: 'dice-test', inlineTemplate: true });
    const compiled = await build({ stdin: { contents: script.content, loader: 'ts', resolveDir: fileURLToPath(new URL('.', path)) },
        bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
        plugins: [{ name: 'shared-vue-runtime', setup(builder) {
            builder.onResolve({ filter: /^vue$/ }, () => ({ path: import.meta.resolve('vue'), external: true }));
            builder.onLoad({ filter: /\.vue$/ }, args => {
                const { descriptor } = parse(readFileSync(args.path, 'utf8'), { filename: args.path });
                return { contents: compileScript(descriptor, { id: 'dice-child', inlineTemplate: true }).content, loader: 'ts' };
            });
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Compiled repository Vue component, not user content.
    const { default: DiceApp } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
    let state = { chatIdentity: 'chat-a', actionChecksEnabled: false, actionCheckFrequency: 'standard', actionCheckRule: 'd20', encountersEnabled: false, coc7Sheet: { kind: 'empty' }, sheetStorage: 'ready' };
    const listeners = new Set();
    let calls = 0;
    let release;
    let failFrequency = false;
    let failSheet = false;
    let unconfirmedSheet = false;
    let failConfirmation = false;
    let pendingSheet;
    const sheets = [];
    const push = patch => {
        state = { ...state, ...patch };
        for (const listener of listeners) { listener({ type: 'dice/state', payload: { state: structuredClone(state) } }); }
    };
    const confirmPending = async () => {
        // The store notification precedes the global file-ready notification.
        if (pendingSheet !== undefined) { push({ coc7Sheet: readCoc7Sheet(pendingSheet) }); }
        await Promise.resolve();
        pendingSheet = undefined;
        push({ sheetStorage: 'ready' });
    };
    const bridge = {
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
        async request(type, payload) {
            assert.equal(payload.chatIdentity, 'chat-a');
            if (type === 'dice/set-coc7-sheet') {
                sheets.push(structuredClone(payload.sheet));
                if (failSheet) { throw new Error('save failed'); }
                if (unconfirmedSheet) {
                    pendingSheet = structuredClone(payload.sheet);
                    push({ sheetStorage: 'unconfirmed' });
                    throw new Error('save acknowledgement unknown');
                }
                state = { ...state, coc7Sheet: readCoc7Sheet(payload.sheet) };
                return { ok: true, result: state };
            }
            if (type === 'dice/confirm-sheet-save') {
                if (failConfirmation) { throw new Error('confirmation failed'); }
                await confirmPending();
                return { ok: true, result: state };
            }
            if (type === 'dice/set-rule') {
                state = { ...state, actionCheckRule: payload.rule };
                return { ok: true, result: state };
            }
            if (type === 'dice/set-frequency') {
                if (failFrequency) { throw new Error('save failed'); }
                state = { ...state, actionCheckFrequency: payload.frequency };
                return { ok: true, result: state };
            }
            assert.equal(type, 'dice/set-feature');
            calls++;
            state = { ...state, [payload.feature]: payload.enabled };
            if (calls === 3) { await new Promise(resolve => { release = resolve; }); }
            return { ok: true, result: state };
        },
    };
    const app = createApp(DiceApp, { bridge, initialState: state });
    app.mount(dom.document.getElementById('app'));
    t.after(() => app.unmount());
    const button = dom.document.querySelector('[role="switch"]');
    const choices = () => [...dom.document.querySelectorAll('[aria-describedby="dice-frequency-description"] button[aria-pressed]')];
    assert.equal(choices().length, 0, 'frequency choices stay hidden until action checks are enabled');
    for (const expected of ['true', 'false']) {
        button.click();
        await Promise.resolve(); await nextTick();
        assert.equal(button.getAttribute('aria-checked'), expected);
        assert.equal(button.disabled, false);
    }
    button.click();
    for (const listener of listeners) { listener({ type: 'dice/state', payload: { state: { ...state, actionChecksEnabled: false } } }); }
    release();
    await Promise.resolve(); await Promise.resolve(); await nextTick();
    assert.equal(button.getAttribute('aria-checked'), 'false', 'late request reply cannot replace newer confirmed preferences');
    for (const listener of listeners) { listener({ type: 'dice/state', payload: { state } }); }
    await nextTick();
    assert.equal(button.disabled, false);
    const encounterButton = dom.document.querySelector('[aria-labelledby="dice-encounter-label"] button') || dom.document.querySelector('button[aria-labelledby="dice-encounter-label"]');
    encounterButton.click();
    await Promise.resolve(); await nextTick();
    assert.equal(encounterButton.getAttribute('aria-checked'), 'true');
    assert.equal(button.getAttribute('aria-checked'), 'true', 'enabling encounters leaves action checks unchanged');
    assert.equal(choices().length, 2);
    assert.deepEqual(choices().map(choice => choice.getAttribute('aria-pressed')), ['true', 'false']);
    choices()[1].click();
    await Promise.resolve(); await nextTick();
    assert.deepEqual(choices().map(choice => choice.getAttribute('aria-pressed')), ['false', 'true']);
    assert.equal(state.actionCheckFrequency, 'active');
    for (const expected of ['false', 'true']) {
        button.click();
        await Promise.resolve(); await nextTick();
        assert.equal(button.getAttribute('aria-checked'), expected);
    }
    assert.equal(choices()[1].getAttribute('aria-pressed'), 'true', 'turning checks off and on retains the selected frequency');
    failFrequency = true;
    choices()[0].click();
    await Promise.resolve(); await nextTick();
    assert.equal(choices()[1].getAttribute('aria-pressed'), 'true', 'failed saves keep the confirmed selection');
    assert.ok(dom.document.querySelector('.dice-recovery[aria-live="polite"]'));
    failFrequency = false;
    choices()[0].click();
    await Promise.resolve(); await nextTick();
    assert.equal(choices()[0].getAttribute('aria-pressed'), 'true', 'a failed choice can be retried');
    assert.equal(state.actionCheckFrequency, 'standard');
    assert.equal(dom.document.querySelector('.dice-recovery'), null);
    assert.equal(encounterButton.getAttribute('aria-checked'), 'true', 'frequency changes do not affect encounters');
    const rules = () => [...dom.document.querySelectorAll('[aria-describedby="dice-rule-description"] button')];
    rules()[1].click();
    await Promise.resolve(); await nextTick();
    assert.equal(state.actionCheckRule, 'coc7');
    assert.equal(choices().length, 0, 'CoC does not expose D20 frequency');
    assert.deepEqual(rules().map(choice => choice.getAttribute('aria-pressed')), ['false', 'true']);
    const flush = async () => { for (let n = 0; n < 6; n++) { await Promise.resolve(); await nextTick(); } };
    const action = id => dom.document.querySelector('[data-sheet-action="' + id + '"]');
    const scores = () => [...dom.document.querySelectorAll('[data-stat]')];
    const statValue = id => Number(dom.document.querySelector('[data-stat="' + id + '"] output').textContent);
    const step = (id, direction) => dom.document.querySelector('[data-stat="' + id + '"] [data-step="' + direction + '"]');
    assert.equal(scores().length, 0, 'the main page only exposes the sheet entry');
    assert.equal(dom.document.querySelector('[role="dialog"]'), null);
    action('open').click(); await flush();
    assert.ok(dom.document.querySelector('[role="dialog"]'));
    assert.equal(scores().length, 16, 'all capabilities exist before randomization');
    assert.equal(action('save').disabled, false, 'minimum scores can be saved without randomization or edits');
    step('body', 'increase').click(); await flush();
    assert.equal(statValue('body'), 25, 'manual creation does not require randomization');
    assert.equal(sheets.length, 0);
    assert.equal(action('save').disabled, false, 'unspent allocation can be submitted');
    action('close').click(); await flush();
    assert.equal(dom.document.querySelector('[role="dialog"]'), null);
    action('open').click(); await flush();
    assert.equal(statValue('body'), 25, 'closing and reopening the dialog retains the local draft');
    action('cancel').click(); await flush();
    const minimum = emptyCoc7Draft();
    for (const [id, value] of Object.entries({ ...minimum.attributes, ...minimum.skills })) assert.equal(statValue(id), value);
    action('generate').click(); await flush();
    assert.equal(sheets.length, 0, 'random allocation is a draft until explicitly saved');
    assert.equal(action('save').disabled, false);
    failSheet = true;
    action('save').click(); await flush();
    assert.deepEqual(state.coc7Sheet, { kind: 'empty' });
    assert.equal(action('save').disabled, false, 'failed save retains the complete draft');
    assert.ok(dom.document.querySelector('[role="alert"]'));
    const original = sheets[0];
    failSheet = false;
    action('save').click(); await flush();
    assert.deepEqual(sheets[1], original, 'save retries do not rerandomize');
    assert.deepEqual(state.coc7Sheet, { kind: 'ready', sheet: original });
    assert.equal(action('save').disabled, true);
    assert.ok(scores().every(element => element.querySelector('[data-step="increase"]').disabled));
    const bodyBefore = statValue('body');
    const willBefore = statValue('will');
    step('body', 'decrease').click(); await flush();
    assert.equal(step('athletics', 'increase').disabled, true, 'attribute points cannot pay for skills');
    step('will', 'increase').click(); await flush();
    let escaped = 0;
    dom.document.getElementById('app').addEventListener('keydown', event => { if (event.key === 'Escape') escaped++; });
    const escape = new dom.window.Event('keydown', { bubbles: true, cancelable: true });
    Object.defineProperty(escape, 'key', { value: 'Escape' });
    step('body', 'decrease').dispatchEvent(escape); await flush();
    assert.equal(escaped, 0);
    assert.equal(escape.defaultPrevented, true);
    assert.equal(dom.document.querySelector('[role="dialog"]'), null);
    action('open').click(); await flush();
    assert.equal(statValue('body'), bodyBefore - 5, 'Escape closes only the dialog and retains the draft');
    action('save').click(); await flush();
    assert.equal(state.coc7Sheet.sheet.attributes.body, bodyBefore - 5);
    assert.equal(state.coc7Sheet.sheet.attributes.will, willBefore + 5);
    const confirmed = structuredClone(state.coc7Sheet);
    action('generate').click(); await flush();
    action('cancel').click(); await flush();
    assert.deepEqual(state.coc7Sheet, confirmed, 'cancelling random allocation preserves saved values');
    action('reset').click(); await flush();
    action('confirm-reset').click(); await flush();
    assert.deepEqual(state.coc7Sheet, { kind: 'empty' });
    assert.equal(scores().length, 16);
    action('save').click(); await flush();
    assert.deepEqual(state.coc7Sheet, { kind: 'ready', sheet: minimum }, 'all-minimum sheet saves without a draft edit');
    step('mind', 'increase').click(); await flush();
    action('save').click(); await flush();
    assert.equal(state.coc7Sheet.sheet.attributes.mind, 25, 'partial allocation saves with unspent points in both pools');
    action('close').click(); await flush();
    rules()[0].click();
    await Promise.resolve(); await nextTick();
    assert.equal(choices()[0].getAttribute('aria-pressed'), 'true', 'returning to D20 retains its frequency');
    state = { ...state, actionChecksEnabled: false, coc7Sheet: { kind: 'invalid' } };
    for (const listener of listeners) { listener({ type: 'dice/state', payload: { state } }); }
    await flush();
    assert.ok(dom.document.querySelector('[data-sheet-state="invalid"][role="alert"]'));
    action('open').click(); await flush();
    assert.ok(action('generate'), 'recovery remains accessible with checks off and D20 selected');
    const beforeReplace = sheets.length;
    action('generate').click(); await flush();
    assert.equal(sheets.length, beforeReplace, 'a replacement is only a draft until saved');
    action('cancel').click(); await flush();
    assert.deepEqual(state.coc7Sheet, { kind: 'invalid' });
    failSheet = true;
    action('reset').click(); await flush();
    action('confirm-reset').click(); await flush();
    assert.deepEqual(state.coc7Sheet, { kind: 'invalid' });
    assert.ok(dom.document.querySelector('[role="alert"]'));
    failSheet = false;
    action('confirm-reset').click(); await flush();
    assert.deepEqual(state.coc7Sheet, { kind: 'empty' });

    const noFailure = () => {
        assert.ok(!dom.document.querySelector('.coc-footer [role="alert"]'));
        assert.ok(!dom.document.querySelector('.dice-recovery'), 'the parent error also clears');
    };
    for (const scenario of ['minimum', 'edited', 'reset-ready', 'reset-invalid', 'external-confirmation']) {
        await t.test(`uncertain ${scenario} submission finishes when its saved data is confirmed`, async () => {
            push({ actionChecksEnabled: true, actionCheckRule: 'coc7', sheetStorage: 'ready',
                coc7Sheet: scenario === 'reset-ready' ? readCoc7Sheet(minimum) : { kind: scenario === 'reset-invalid' ? 'invalid' : 'empty' } });
            await flush();
            action('open').click(); await flush();
            const resetting = scenario.startsWith('reset-');
            if (scenario !== 'minimum') { step('body', 'increase').click(); await flush(); }
            if (resetting) { action('reset').click(); await flush(); }
            unconfirmedSheet = true;
            action(resetting ? 'confirm-reset' : 'save').click(); await flush();
            const submitted = structuredClone(pendingSheet);
            const count = sheets.length;
            assert.ok(action('check-save'));
            assert.ok(dom.document.querySelector('.coc-footer [role="alert"]'));
            failConfirmation = true;
            action('check-save').click(); await flush();
            assert.ok(action('check-save'), 'failed checks remain recoverable');
            assert.ok(dom.document.querySelector('.coc-footer [role="alert"]'));
            assert.equal(statValue('body'), scenario === 'minimum' ? 20 : 25, 'failure keeps the draft');
            failConfirmation = false;
            unconfirmedSheet = false;
            if (scenario === 'external-confirmation') { await confirmPending(); }
            else { action('check-save').click(); }
            await flush();
            assert.deepEqual(state.coc7Sheet, readCoc7Sheet(submitted));
            assert.equal(sheets.length, count, 'confirmation does not submit or charge again');
            assert.ok(!action('check-save'));
            assert.ok(!action('cancel'), 'the confirmed draft is no longer unsaved');
            assert.ok(!action('confirm-reset'), 'a confirmed reset does not ask for payment again');
            assert.equal(action('save').disabled, !resetting);
            assert.equal(statValue('body'), resetting || scenario === 'minimum' ? 20 : 25);
            noFailure();
            action('close').click(); await flush();
        });
    }
    await t.test('confirming another operation preserves an unsubmitted draft', async () => {
        push({ coc7Sheet: readCoc7Sheet(minimum), sheetStorage: 'ready' }); await flush();
        action('open').click(); await flush();
        step('body', 'increase').click(); await flush();
        push({ sheetStorage: 'unconfirmed' }); await flush();
        action('check-save').click(); await flush();
        assert.equal(statValue('body'), 25);
        assert.ok(action('cancel'));
        assert.equal(action('save').disabled, false);
        assert.deepEqual(state.coc7Sheet, readCoc7Sheet(minimum));
        noFailure();
        action('cancel').click(); await flush();
    });
    await t.test('a different confirmed sheet does not discard the failed submission', async () => {
        step('body', 'increase').click(); await flush();
        unconfirmedSheet = true;
        action('save').click(); await flush();
        pendingSheet = { ...minimum, attributes: { ...minimum.attributes, mind: 30 } };
        unconfirmedSheet = false;
        action('check-save').click(); await flush();
        assert.equal(state.coc7Sheet.sheet.attributes.mind, 30);
        assert.equal(statValue('body'), 25);
        assert.equal(statValue('mind'), 20);
        assert.ok(action('cancel'));
        assert.equal(action('save').disabled, false);
        assert.ok(dom.document.querySelector('.coc-footer [role="alert"]'));
        action('save').click(); await flush();
        assert.equal(state.coc7Sheet.sheet.attributes.body, 25);
        noFailure();
    });
    app.unmount();
    assert.equal(listeners.size, 0);
});
