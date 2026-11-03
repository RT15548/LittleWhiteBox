import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { EventEmitter } from 'node:events';
import { after, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';

const originalDocument = globalThis.document;
const originalDollar = globalThis.$;
let browserWindow;

// A DOM-backed adapter for the two delegated jQuery operations used here.
// Native and jQuery-triggered selection are also checked in the real host browser.
function installDocumentEvents(document) {
    const bindings = new Map();
    globalThis.$ = target => ({
        off(event, selector) {
            const key = `${event}:${selector}`;
            const listener = bindings.get(key);
            if (listener) target.removeEventListener(event.split('.')[0], listener);
            bindings.delete(key);
            return this;
        },
        on(event, selector, handler) {
            const listener = event => {
                if (event.target.matches(selector)) handler(event);
            };
            target.addEventListener(event.split('.')[0], listener);
            bindings.set(`${event}:${selector}`, listener);
            return this;
        },
    });
    globalThis.document = document;
}

const hostEvents = globalThis.__presetTaskTestEvents = new EventEmitter();
const bundle = await build({
    stdin: {
        resolveDir: fileURLToPath(new URL('../../../', import.meta.url)),
        contents: `
            export { initPresetTaskEvents } from './modules/scheduled-tasks/preset-task-events.js';
            export { EventCenter, createModuleEvents, event_types } from './core/event-manager.js';
        `,
    },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'host-events', setup(api) {
        api.onResolve({ filter: /(^|\/)script\.js$/ }, () => ({ path: 'script.js', namespace: 'host' }));
        api.onLoad({ filter: /.*/, namespace: 'host' }, () => ({ contents: `
            export const eventSource = globalThis.__presetTaskTestEvents;
            export const event_types = {
                OAI_PRESET_CHANGED_AFTER: 'oai-after',
                PRESET_CHANGED: 'preset',
                MAIN_API_CHANGED: 'api',
            };
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Local test bundle; only the host event bus is substituted.
const { initPresetTaskEvents, EventCenter, createModuleEvents, event_types } = await import(
    `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
);

beforeEach(() => {
    EventCenter.cleanupAll();
    hostEvents.removeAllListeners();
    const dom = parseHTML('<html><body><select id="settings_preset_openai"><option value="first" selected>1</option><option value="second">2</option></select><input id="unrelated"></body></html>');
    browserWindow = dom.window;
    installDocumentEvents(dom.document);
});

after(() => {
    EventCenter.cleanupAll();
    hostEvents.removeAllListeners();
    delete globalThis.__presetTaskTestEvents;
    globalThis.document = originalDocument;
    globalThis.$ = originalDollar;
});

test('settings refresh initially and on preset changes without starting task execution', () => {
    let refreshes = 0;
    initPresetTaskEvents(() => refreshes++);
    assert.equal(refreshes, 1);
    hostEvents.emit(event_types.OAI_PRESET_CHANGED_AFTER);
    hostEvents.emit(event_types.PRESET_CHANGED, { apiId: 'openai' });
    hostEvents.emit(event_types.MAIN_API_CHANGED, 'openai');
    assert.equal(refreshes, 4);
});

test('task disable and master cleanup do not stop preset settings synchronization', () => {
    let refreshes = 0;
    let executions = 0;
    const runtime = createModuleEvents('scheduledTasks');
    initPresetTaskEvents(() => refreshes++);
    runtime.on(event_types.PRESET_CHANGED, () => executions++);
    runtime.cleanup();
    hostEvents.emit(event_types.PRESET_CHANGED, { apiId: 'openai' });
    assert.equal(refreshes, 2);
    EventCenter.cleanupAll();
    hostEvents.emit(event_types.OAI_PRESET_CHANGED_AFTER);
    assert.equal(refreshes, 3);
    assert.equal(executions, 0);
});

test('other API presets do not invalidate OpenAI task settings', () => {
    let refreshes = 0;
    initPresetTaskEvents(() => refreshes++);
    hostEvents.emit(event_types.PRESET_CHANGED, { apiId: 'textgenerationwebui' });
    assert.equal(refreshes, 1);
});

test('settings remount replaces its callback without duplicate subscriptions', () => {
    let oldRefreshes = 0;
    let currentRefreshes = 0;
    initPresetTaskEvents(() => oldRefreshes++);
    initPresetTaskEvents(() => currentRefreshes++);
    hostEvents.emit(event_types.PRESET_CHANGED, { apiId: 'openai' });
    assert.equal(oldRefreshes, 1);
    assert.equal(currentRefreshes, 2);
    document.querySelector('select').dispatchEvent(new browserWindow.Event('change', { bubbles: true }));
    assert.equal(oldRefreshes, 1);
    assert.equal(currentRefreshes, 3);
});

test('ABC to DEF and back refreshes from selection without waiting for host completion events', () => {
    const tasks = { first: ['A', 'B', 'C'], second: ['D', 'E', 'F'] };
    const select = document.querySelector('select');
    let displayed;
    initPresetTaskEvents(() => {
        displayed = { preset: select.value, taskIds: tasks[select.value] };
    });
    assert.deepEqual(displayed, { preset: 'first', taskIds: tasks.first });
    for (const name of ['second', 'first']) {
        for (const option of select.options) option.removeAttribute('selected');
        select.querySelector(`option[value="${name}"]`).setAttribute('selected', '');
        select.dispatchEvent(new browserWindow.Event('change', { bubbles: true }));
        assert.deepEqual(displayed, { preset: name, taskIds: tasks[name] });
    }
});

test('unrelated setting changes do not refresh preset tasks', () => {
    let refreshes = 0;
    initPresetTaskEvents(() => refreshes++);
    document.querySelector('input').dispatchEvent(new browserWindow.Event('change', { bubbles: true }));
    assert.equal(refreshes, 1);
});
