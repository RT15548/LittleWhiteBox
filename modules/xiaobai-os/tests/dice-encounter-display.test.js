import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { build } from 'esbuild';

// Keep the actual display and DOM cache; replace only native chat/event access.
const compiled = await build({
    stdin: { contents: `export { createEncounterDisplay } from '../apps/dice/host/encounter-display.ts'; export { source } from 'encounter-display-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    footer: { js: '//# sourceURL=encounter-display-fixture.js' },
    plugins: [{ name: 'encounter-display-host', setup(builder) {
        builder.onResolve({ filter: /^js-sha256$/ }, () => ({ path: import.meta.resolve('js-sha256'), external: true }));
        builder.onResolve({ filter: /(?:^encounter-display-host$|\/(?:event-manager|sillytavern-port)\.js$)/ }, () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            export const source = { chat: [] };
            export const captureDiceChat = () => source;
            export const event_types = {};
            export const createModuleEvents = () => ({ on() {}, cleanup() {} });
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Compiled repository component with isolated native I/O.
const { createEncounterDisplay, source } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

test('local results render once without a save/retry UI, and history restores without replay', t => {
    const dom = parseHTML('<html><head></head><body><div id="chat"><div class="mes" mesid="0"><div class="mes_text">My turn</div></div></div></body></html>');
    const previous = new Map(), frames = new Map();
    let display, frameId = 0;
    const globals = { document: dom.document, MutationObserver: dom.window.MutationObserver,
        requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; }, cancelAnimationFrame: id => frames.delete(id) };
    for (const [key, value] of Object.entries(globals)) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value, configurable: true });
    }
    t.after(() => { display?.stop(); for (const [key, descriptor] of previous) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    } });
    const render = () => { const work = [...frames.values()]; frames.clear(); for (const fn of work) fn(); };
    source.chat = [{ is_user: true, mes: 'My turn', extra: {} }];
    let issue = null;
    display = createEncounterDisplay({ view: () => issue });
    display.start(); render();
    assert.equal(dom.document.querySelector('.xb-dice-encounter'), null);
    source.chat[0].extra.xiaobaiOsDice = { schemaVersion: 1, encounter: { outcome: 'medium' } };
    display.refresh(source.chat[0]);
    const label = dom.document.querySelector('.xb-dice-encounter');
    assert.equal(label.dataset.level, 'medium');
    assert.equal(label.dataset.fresh, 'true');
    assert.equal(label.previousSibling.className, 'mes_text');
    assert.equal(dom.document.querySelector('button'), null);
    display.refresh(); render();
    assert.equal(dom.document.querySelector('.xb-dice-encounter'), label, 'cached redraw must not remount the animation');

    issue = { target: { message: source.chat[0] }, error: 'reference unavailable' };
    display.refresh(); render();
    assert.equal(dom.document.querySelectorAll('.xb-dice-encounter').length, 0, 'a skipped encounter must not also display a success label');
    assert.ok(dom.document.querySelector('.xb-dice-encounter-error'));
    assert.equal(dom.document.querySelector('button'), null, 'preparation errors are not save failures');

    display.stop();
    assert.equal(dom.document.querySelector('.xb-dice-encounter'), null);
    issue = null;
    display.start(); render();
    assert.equal(dom.document.querySelector('.xb-dice-encounter').dataset.fresh, undefined);
    source.chat.length = 0;
    display.refresh(); render();
    assert.equal(dom.document.querySelector('.xb-dice-encounter'), null);
    assert.equal(dom.document.querySelector('.xb-dice-encounter-error'), null);
});
