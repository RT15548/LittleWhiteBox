import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { compileScript, parse } from '@vue/compiler-sfc';
import ts from 'typescript';
import { parseHTML } from 'linkedom';

// Component behavior is the cheapest boundary for KeepAlive, drafts and lost input events.
// Compile the real SFCs; replace only WebGL/asset loading, which this DOM test cannot render.
const presentation = new URL('../apps/game/island/presentation/', import.meta.url);
const substitutes = new Map([
    [new URL('scene.js', presentation).href, 'export const createIslandScene = () => ({ update() {}, setActive() {}, changeZoom() {}, dispose() {} });'],
    [new URL('character-loader.js', presentation).href, 'export const loadCharacters = async () => ({ dispose() {} });'],
    [new URL('character-media.js', presentation).href, 'export const playerCharacterKey = identity => `player-${identity.gender}-${identity.appearanceAge}`; export const characterPortrait = key => `/${key}.png`;'],
]);
const loader = registerHooks({
    resolve(specifier, context, next) {
        const local = context.parentURL && specifier.startsWith('.') ? new URL(specifier, context.parentURL) : null;
        const replacement = local && substitutes.get(local.href);
        if (replacement) { return { url: `data:text/javascript,${encodeURIComponent(replacement)}`, shortCircuit: true }; }
        if (local?.pathname.endsWith('.js') && !existsSync(local)) {
            const source = new URL(local.href.slice(0, -3) + '.ts');
            if (existsSync(source)) { return next(source.href, context); }
        }
        return next(specifier, context);
    },
    load(url, context, next) {
        if (url.endsWith('.vue') || url.endsWith('.ts')) {
            const filename = fileURLToPath(url), source = readFileSync(filename, 'utf8');
            const script = url.endsWith('.vue') ? compileScript(parse(source, { filename }).descriptor, { id: filename, inlineTemplate: true }).content : source;
            return { format: 'module', source: ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext } }).outputText, shortCircuit: true };
        }
        if (url.endsWith('.json')) { return { format: 'module', source: `export default ${readFileSync(new URL(url), 'utf8')};`, shortCircuit: true }; }
        if (url.endsWith('.css')) { return { format: 'module', source: 'export {};', shortCircuit: true }; }
        if (new URL(url).searchParams.has('url')) { return { format: 'module', source: `export default ${JSON.stringify(url)};`, shortCircuit: true }; }
        return next(url, context);
    },
});
const dom = parseHTML('<html><body></body></html>');
// Browser elements are not plain objects; Vue must not proxy the simulated DOM's internal node links.
Object.defineProperty(dom.window.HTMLElement.prototype, Symbol.toStringTag, { configurable: true, value: 'HTMLElement' });
const globals = new Map();
for (const [key, value] of Object.entries({ window: dom.window, document: dom.document, HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element, SVGElement: dom.window.SVGElement, Document: dom.window.Document,
    ResizeObserver: class { observe() {} disconnect() {} } })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
}
Object.defineProperty(document, 'hidden', { configurable: true, writable: true, value: false });
dom.window.HTMLElement.prototype.getClientRects = () => [];
const { createApp, h, KeepAlive, nextTick, ref, shallowRef } = await import('vue');
const { appNavigationKey } = await import('../shell/app-src/navigation/app-navigation.ts');
const { createBackStack } = await import('../shell/app-src/navigation/back-stack.ts');
const { default: IslandRoom } = await import('../apps/game/island/IslandRoom.vue');
const { default: IslandField } = await import('../apps/game/island/presentation/IslandField.vue');
const { default: GmFailure } = await import('../apps/game/island/presentation/GmFailure.vue');
const { createIslandClient } = await import('../apps/game/island/client.ts');
const { newJourney } = await import('../apps/game/island/world.ts');
const { LANDSCAPE } = await import('../apps/game/island/content.ts');
const { observe, openScene } = await import('../apps/game/island/scene.ts');
const { screenToWorld } = await import('../apps/game/island/presentation/camera.ts');
after(() => {
    loader.deregister();
    for (const [key, descriptor] of globals) {
        if (descriptor) { Object.defineProperty(globalThis, key, descriptor); }
        else { delete globalThis[key]; }
    }
});

const identity = { name: 'UI test player', gender: 'female', appearanceAge: 'twenties' };
function hostView(journey = 'ui-journey') {
    const world = newJourney(journey, identity), scene = openScene(world, 'player', LANDSCAPE);
    return { revision: 1, generation: 1, stamp: 1, phase: 'living', journey, identity, lastRequest: null,
        player: observe(world, 'player', LANDSCAPE), scene: scene.mode, listeners: scene.audience.filter(id => id !== 'player'),
        needsDecision: false, recent: Array.from({ length: 12 }, (_, i) => speech(i + 1)), intent: null,
        busy: false, pending: false, writeState: 'ready', memoryPending: false, thinking: false, interpreting: false, planFault: null };
}
function speech(sequence) {
    return { sequence, at: sequence, position: { x: -726, y: 1 }, audience: ['player', 'lin'], shared: [],
        payload: { kind: 'speech', actor: 'lin', text: `utterance ${sequence}` } };
}
function bridgeFor(initial = hostView()) {
    let state = initial;
    const calls = [], subscribers = new Set();
    const bridge = {
        subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },
        async request(type, payload) {
            calls.push({ type, payload });
            if (type === 'game/island/start') { return bridge.start(payload); }
            if (type === 'game/island/context') { return { result: { usage: { used: 0, limit: 100, trim: 80, system: 0, rules: 0, story: 0 } } }; }
            return { result: state };
        },
    };
    return { bridge, calls, publish(next) {
        state = { ...next, stamp: state.stamp + 1 };
        for (const subscriber of subscribers) { subscriber({ type: 'game/island/state', payload: { chatIdentity: 'ui-chat', state } }); }
    } };
}
async function flush() { await nextTick(); await Promise.resolve(); await nextTick(); }
function event(target, type, properties = {}) {
    assert.ok(target, `missing event target for ${type}`);
    const value = new dom.window.Event(type, { bubbles: true, cancelable: true });
    Object.assign(value, properties); target.dispatchEvent(value);
}
async function click(target) { event(target, 'click'); await flush(); }
async function input(target, value) { target.value = value; event(target, 'input'); await flush(); }
function mount(t, component) {
    document.hidden = false;
    const root = document.createElement('div'); document.body.append(root);
    const active = ref(true), app = createApp({ render: () => h(KeepAlive, null, { default: () => active.value ? component() : null }) });
    const stack = createBackStack();
    app.provide(appNavigationKey, { root: ref(root), stack, layers: shallowRef([]) });
    app.mount(root);
    let mounted = true;
    const unmount = () => { if (mounted) { mounted = false; app.unmount(); root.remove(); } };
    t.after(() => { unmount(); document.hidden = false; });
    return { root, active, unmount, back: () => stack.back() };
}
async function room(t, connection = bridgeFor()) {
    const ui = mount(t, () => h(IslandRoom, { bridge: connection.bridge, chatIdentity: 'ui-chat', generationActive: false }));
    await flush();
    return { ...ui, ...connection };
}
function scrollMetrics(log) {
    let position = 0;
    Object.defineProperties(log, {
        scrollHeight: { get: () => log.querySelectorAll('[data-sequence]').length * 80 + 100 },
        clientHeight: { get: () => 200 },
        scrollTop: { get: () => position, set: value => { position = Math.max(0, Math.min(value, log.isConnected ? log.scrollHeight - log.clientHeight : 0)); } },
    });
    log.getBoundingClientRect = () => ({ top: 0, bottom: 200 });
    for (const [index, row] of [...log.querySelectorAll('[data-sequence]')].entries()) {
        row.getBoundingClientRect = () => ({ top: index * 80 - position, bottom: (index + 1) * 80 - position });
    }
}

test('a late new-journey acknowledgement cannot resume a deactivated room', async t => {
    const connection = bridgeFor();
    let finishStart;
    connection.bridge.start = payload => new Promise(resolve => { finishStart = () => resolve({ result: { ...hostView('ui-next-journey'), stamp: 2, lastRequest: payload.actionId } }); });
    const ui = await room(t, connection);
    await click(ui.root.querySelector('.island-entry-new'));
    const confirmation = ui.root.querySelector('input[type=checkbox]');
    confirmation.checked = true; event(confirmation, 'change'); await flush();
    event(ui.root.querySelector('form'), 'submit'); await flush();
    assert.equal(typeof finishStart, 'function');
    ui.active.value = false; await flush();
    const before = ui.calls.length;
    finishStart(); await flush();
    assert.equal(ui.calls.slice(before).some(call => call.type === 'game/island/live' && call.payload.active), false);
    ui.active.value = true; await flush();
    assert.equal(ui.calls.filter(call => call.type === 'game/island/live').at(-1).payload.active, true);
    ui.active.value = false; await flush();
    assert.equal(ui.calls.filter(call => call.type === 'game/island/live').at(-1).payload.active, false);
});

test('folding conversation, visiting panels and continuing the same journey retain both drafts and the reading position', async t => {
    const ui = await room(t);
    await click(ui.root.querySelector('.island-entry-start'));
    await click(ui.root.querySelector('.island-chat-button'));
    const text = () => ui.root.querySelector('.island-composer textarea');
    const modes = () => ui.root.querySelectorAll('.island-input-mode button');
    await input(text(), 'unsent speech');
    await click(modes()[1]); await input(text(), 'unconfirmed action');
    const log = ui.root.querySelector('[role=log]'); scrollMetrics(log);
    log.scrollTop = 120; event(log, 'scroll'); await flush();
    for (const cover of ['fold', 'people', 'inventory', 'entry']) {
        if (cover === 'fold') { await click(ui.root.querySelector('.island-conversation-close')); }
        if (cover === 'people') { await click(ui.root.querySelector('.island-presence button')); }
        if (cover === 'inventory') { await click(ui.root.querySelector('.island-bottom nav button')); }
        if (cover === 'entry') { ui.back(); await flush(); ui.back(); await flush(); }
        assert.equal(ui.root.querySelector('.island-composer'), null);
        log.scrollTop = 0; // Detached browser content may lose its layout/scroll offset.
        const next = hostView(); next.recent.push(speech(13)); ui.publish(next); await flush();
        if (cover === 'people' || cover === 'inventory') { await click(ui.root.querySelector('.island-panel > header button')); }
        if (cover === 'entry') { await click(ui.root.querySelector('.island-entry-start')); }
        if (!ui.root.querySelector('.island-composer')) { await click(ui.root.querySelector('.island-chat-button')); }
        assert.equal(text().value, 'unconfirmed action');
        assert.equal(ui.root.querySelector('[role=log]').scrollTop, 120);
        await click(modes()[0]); assert.equal(text().value, 'unsent speech');
        await click(modes()[1]);
    }
    await click(ui.root.querySelector('.island-conversation-close'));
    ui.publish(hostView('ui-other-journey')); await flush();
    await click(ui.root.querySelector('.island-chat-button'));
    assert.equal(text().value, '');
    await click(modes()[1]); assert.equal(text().value, '');
});

test('a conversation following the latest line resumes at the latest line after folding', async t => {
    const ui = await room(t);
    await click(ui.root.querySelector('.island-entry-start'));
    await click(ui.root.querySelector('.island-chat-button'));
    const log = ui.root.querySelector('[role=log]'); scrollMetrics(log);
    log.scrollTop = log.scrollHeight; event(log, 'scroll'); await flush();
    await click(ui.root.querySelector('.island-conversation-close'));
    log.scrollTop = 0;
    const next = hostView(); next.recent.push(speech(13)); ui.publish(next); await flush();
    await click(ui.root.querySelector('.island-chat-button'));
    assert.equal(ui.root.querySelector('[role=log]').scrollTop, log.scrollHeight - log.clientHeight);
    assert.equal(ui.root.querySelector('.island-latest'), null);
});

test('a failed character response stays inside conversation, never the island entry, map or ending', async t => {
    const failed = { ...hostView(), planFault: 'island_context_full' }, ui = await room(t, bridgeFor(failed));
    assert.ok(!ui.root.querySelector('.island-gm-failure'));
    await click(ui.root.querySelector('.island-entry-start'));
    assert.ok(!ui.root.querySelector('.island-gm-failure'));
    await click(ui.root.querySelector('.island-chat-button'));
    assert.equal(ui.root.querySelectorAll('.island-gm-failure').length, 1);
    assert.ok(ui.root.querySelector('.island-conversation .island-gm-failure'));
    await click(ui.root.querySelector('.island-conversation-close'));
    assert.ok(!ui.root.querySelector('.island-gm-failure'));
    ui.back(); await flush();
    assert.ok(ui.root.querySelector('.island-entry-start'));
    assert.ok(!ui.root.querySelector('.island-gm-failure'));
    await click(ui.root.querySelector('.island-entry-start'));
    ui.publish({ ...failed, phase: 'ended' }); await flush();
    assert.ok(!ui.root.querySelector('.island-gm-failure'));
});

test('dismissing a response failure survives pushes, panel switches, entry and KeepAlive without a model call', async t => {
    const failed = { ...hostView(), planFault: 'island_context_full' }, ui = await room(t, bridgeFor(failed));
    await click(ui.root.querySelector('.island-entry-start'));
    await click(ui.root.querySelector('.island-chat-button'));
    const before = ui.calls.length;
    await click(ui.root.querySelector('.island-gm-failure-close'));
    assert.equal(ui.calls.length, before);
    assert.ok(!ui.root.querySelector('.island-gm-failure'));
    for (let i = 0; i < 3; i++) { ui.publish(failed); await flush(); }
    await click(ui.root.querySelector('.island-presence button'));
    await click(ui.root.querySelector('.island-panel > header button'));
    assert.ok(!ui.root.querySelector('.island-gm-failure'));
    ui.back(); await flush(); ui.back(); await flush();
    await click(ui.root.querySelector('.island-entry-start'));
    await click(ui.root.querySelector('.island-chat-button'));
    ui.active.value = false; await flush(); ui.active.value = true; await flush();
    assert.ok(!ui.root.querySelector('.island-gm-failure'));
    assert.equal(ui.calls.some(call => ['game/island/think', 'game/island/cancel'].includes(call.type)), false);
    // A distinct attempt can fail with the same code within one Vue render tick.
    ui.publish(hostView()); ui.publish(failed); await flush();
    assert.ok(ui.root.querySelector('.island-gm-failure'));
    await click(ui.root.querySelector('.island-gm-failure-close'));
    ui.publish({ ...hostView('next-journey'), planFault: failed.planFault }); await flush();
    assert.ok(ui.root.querySelector('.island-gm-failure'));
});

test('the response failure close button remains usable while model actions are disabled', async t => {
    let dismissed = 0;
    const ui = mount(t, () => h(GmFailure, { error: 'test failure', busy: true, disabled: true, onDismiss: () => dismissed++ }));
    await flush();
    const close = ui.root.querySelector('.island-gm-failure-close');
    assert.ok(close);
    assert.equal(close.disabled, false);
    await click(close); assert.equal(dismissed, 1);
    assert.equal(ui.root.querySelectorAll('button[disabled]').length, 2);
});

test('save and memory recovery remain visible on entry and cannot be dismissed as a character failure', async t => {
    for (const flag of ['pending', 'memoryPending']) {
        const failed = { ...hostView(), planFault: 'island_memory_save', [flag]: true };
        const ui = await room(t, bridgeFor(failed));
        assert.match(ui.root.querySelector('.island-recovery-save').textContent, /确认保存状态/);
        assert.ok(!ui.root.querySelector('.island-gm-failure'));
        await click(ui.root.querySelector('.island-entry-start'));
        await click(ui.root.querySelector('.island-chat-button'));
        assert.ok(ui.root.querySelector('.island-recovery-save'));
        assert.ok(!ui.root.querySelector('.island-gm-failure'));
        await click(ui.root.querySelector('.island-recovery-save button'));
        assert.ok(ui.calls.some(call => call.type === 'game/island/confirm'));
    }
});

test('response retry and settings remain available within conversation', async t => {
    const failed = { ...hostView(), planFault: 'island_context_full' }, ui = await room(t, bridgeFor(failed));
    await click(ui.root.querySelector('.island-entry-start'));
    await click(ui.root.querySelector('.island-chat-button'));
    const action = label => [...ui.root.querySelectorAll('.island-gm-failure button')].find(button => button.textContent === label);
    await click(action('模型设置'));
    assert.ok(ui.calls.some(call => call.type === 'game/island/settings'));
    await click(action('重试人物回应'));
    assert.ok(ui.calls.some(call => call.type === 'game/island/think'));
    assert.ok(ui.root.querySelector('.island-gm-failure'));
});

test('a new explicit response re-arms dismissal even when the same-code final snapshot overtakes its acknowledgement', async t => {
    let state = { ...hostView(), planFault: 'island_context_full' }, subscriber;
    const bridge = {
        subscribe(fn) { subscriber = fn; return () => {}; },
        async request(type) {
            if (type === 'game/island/think') {
                const earlier = { ...state, stamp: state.stamp + 1, planFault: null, thinking: true };
                state = { ...state, stamp: state.stamp + 2 };
                subscriber({ type: 'game/island/state', payload: { chatIdentity: 'ui-chat', state } });
                return { result: earlier };
            }
            return { result: state };
        },
    };
    const client = createIslandClient(bridge, 'ui-chat'); t.after(() => client.dispose());
    await client.read(); assert.ok(client.gmFailure.value);
    client.dismissGmFailure(); assert.equal(client.gmFailure.value, '');
    await client.read(); assert.equal(client.gmFailure.value, '');
    await client.think(); assert.ok(client.gmFailure.value);
    assert.equal(client.view.value.planFault, 'island_context_full');
    client.dismissGmFailure();
    subscriber({ type: 'game/island/state', payload: { chatIdentity: 'ui-chat', state: { ...state, stamp: 1, planFault: null } } });
    assert.equal(client.gmFailure.value, '');
    subscriber({ type: 'game/island/error', payload: { chatIdentity: 'ui-chat', code: 'island_save_unconfirmed' } });
    assert.equal(client.uncertain.value, true);
    const error = client.error.value;
    client.dismissGmFailure();
    assert.equal(client.uncertain.value, true); assert.equal(client.error.value, error);
});

for (const control of ['keyboard', 'stick']) {
    for (const interruption of ['element-blur', 'window-blur', 'hidden', 'deactivated', 'disabled', 'unmounted']) {
        test(`${control} releases on ${interruption} and never revives a stale direction`, async t => {
            const disabled = ref(false), directions = [], view = hostView();
            const ui = mount(t, () => h(IslandField, { observation: view.player, identity, disabled: disabled.value,
                onSteer: (x, y) => directions.push({ x, y }) }));
            await flush();
            const field = ui.root.querySelector('.island-field'), stick = ui.root.querySelector('.island-stick');
            let captured = false;
            stick.setPointerCapture = () => { captured = true; }; stick.hasPointerCapture = () => captured;
            stick.releasePointerCapture = () => { captured = false; };
            stick.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
            const pointer = { pointerId: 1, button: 0, clientX: 86, clientY: 50 };
            if (control === 'keyboard') { event(field, 'keydown', { key: 'w' }); }
            else { event(stick, 'pointerdown', pointer); }
            assert.notDeepEqual(directions.at(-1), { x: 0, y: 0 });
            if (interruption === 'element-blur') { event(field, 'blur'); }
            if (interruption === 'window-blur') { event(window, 'blur'); }
            if (interruption === 'hidden') { document.hidden = true; event(document, 'visibilitychange'); }
            if (interruption === 'deactivated') { ui.active.value = false; }
            if (interruption === 'disabled') { disabled.value = true; }
            if (interruption === 'unmounted') { ui.unmount(); }
            await flush();
            assert.deepEqual(directions.at(-1), { x: 0, y: 0 });
            assert.equal(captured, false);
            if (interruption === 'unmounted') { return; }
            if (interruption === 'disabled' || interruption === 'deactivated' || interruption === 'hidden') {
                event(field, 'keydown', { key: 'w' }); event(stick, 'pointerdown', pointer);
                assert.equal(captured, false);
                assert.deepEqual(directions.at(-1), { x: 0, y: 0 });
            }
            document.hidden = false; event(document, 'visibilitychange'); disabled.value = false; ui.active.value = true; await flush();
            event(stick, 'pointermove', pointer);
            assert.deepEqual(directions.at(-1), { x: 0, y: 0 });
            event(field, 'keydown', { key: 'd' });
            assert.deepEqual(directions.at(-1), screenToWorld(1, 0));
            event(field, 'keyup', { key: 'd' });
            assert.deepEqual(directions.at(-1), { x: 0, y: 0 });
        });
    }
}
