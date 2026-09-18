import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { build } from 'esbuild';
import { createActionCheckRecord } from '../apps/dice/domain/check-records.ts';

// Exercise the real display; only native chat/event access is replaced.
const compiled = await build({
    stdin: { contents: `export { createDiceMessageDisplay } from '../apps/dice/host/message-display.ts'; export { source } from 'dice-display-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'dice-display-host', setup(builder) {
        builder.onResolve({ filter: /^js-sha256$/ }, () => ({ path: import.meta.resolve('js-sha256'), external: true }));
        builder.onResolve({ filter: /(?:^dice-display-host$|\/(?:script|group-chats|event-manager|sillytavern-port)\.js$)/ }, () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            export const source = { chat: [] };
            export const captureDiceChat = () => source;
            export const is_send_press = true;
            export const is_group_generating = false;
            export const updateMessageBlock = () => { throw new Error('Unexpected native repaint'); };
            export const event_types = {};
            export const createModuleEvents = () => ({ on() {}, cleanup() {} });
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Repository component with isolated native I/O.
const { createDiceMessageDisplay, source } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

test('card redraws leave scrolling to the host, even when a temporary layout appears at the bottom', t => {
    const { document, window } = parseHTML('<html><head></head><body><div id="chat"><div class="mes" mesid="0"><div class="mes_text"></div></div></div></body></html>');
    const previous = new Map(), frames = new Map();
    let frameId = 0, display;
    const globals = { document, MutationObserver: window.MutationObserver,
        requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; }, cancelAnimationFrame: id => frames.delete(id) };
    for (const [key, value] of Object.entries(globals)) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value, configurable: true });
    }
    t.after(() => { display?.stop(); for (const [key, descriptor] of previous) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    } });
    const render = () => { const work = [...frames.values()]; frames.clear(); for (const fn of work) fn(); };
    const chat = document.getElementById('chat');
    const content = document.querySelector('.mes_text');
    const writes = [];
    let scrollTop = 500;
    // This checks scroll ownership, not browser layout/anchoring (covered in browser verification).
    Object.defineProperties(chat, {
        scrollHeight: { get: () => 1000 }, clientHeight: { get: () => 500 },
        scrollTop: { get: () => scrollTop, set: value => { writes.push(value); scrollTop = value; } },
    });
    const record = createActionCheckRecord('Before ', 'one', { character: 'Test', action: 'Climb', stat: 'Ability', difficulty: 'hard' },
        { dc: 12, roll: 14, outcome: 'success' });
    const records = { schemaVersion: 1, checks: [record] };
    const message = { mes: 'Before [dice:one]', extra: { xiaobaiOsDice: records }, swipe_id: 0 };
    source.chat = [message];
    const target = { message, swipe: 0, index: 0, source };
    const candidate = { body: message.mes, records };
    let active = { target, phase: { kind: 'continuing', candidate } };
    display = createDiceMessageDisplay({ view: () => active, readConfirmed: () => records, cancel() {}, retry: async () => {} }, () => true);
    content.textContent = message.mes;
    display.start(); render();
    const card = content.querySelector('[data-dice-record="one"]');
    assert.ok(card);
    for (const gap of [0, 10, 80, 400]) {
        for (const kind of ['saving', 'revealing', 'continuing', 'continue-error', null]) {
            scrollTop = 500 - gap;
            active = kind ? { target, phase: { kind, candidate, error: kind === 'continue-error' ? 'Retry' : '' } } : null;
            content.textContent = message.mes;
            display.refresh(); render();
            assert.equal(content.querySelector('[data-dice-record="one"]'), card, 'stream repaint reuses the same card');
            assert.equal(scrollTop, 500 - gap);
            assert.deepEqual(writes, [], 'repaint must not override the host scroll lock');
        }
    }
    display.refresh(); display.stop(); render();
    assert.equal(content.textContent, message.mes, 'stopping restores the marker');
    assert.deepEqual(writes, []);
});
