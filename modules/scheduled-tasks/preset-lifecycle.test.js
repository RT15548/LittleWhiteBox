import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { transformSync } from 'esbuild';
import { parseHTML } from 'linkedom';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

// Use the real supported host controller, not a browser AbortController substitute.
const controllerUrl = process.env.LWB_HOST_ROOT
    ? pathToFileURL(path.join(process.env.LWB_HOST_ROOT, 'public/scripts/slash-commands/SlashCommandAbortController.js'))
    : new URL('../../../../../slash-commands/SlashCommandAbortController.js', import.meta.url);
// eslint-disable-next-line no-unsanitized/method -- test runner selects a trusted local host checkout, not application input.
const { SlashCommandAbortController } = await import(controllerUrl.href);

// Acceptance contracts (cost: stale interception / wrong prompts / blocked chat):
// - Leaving a preset releases its managed script resources, not same-name global work.
// - Manual and automatic execution have the same preset ownership, including API exit.
// - A pending command, script or floor callback cannot reattach after A -> B -> A.
// - Duplicate host notifications do not restart/stop the current visit; reentry preserves trigger semantics.
// - Editing, disabling and deleting still address the correct running task after key isolation.
// - Exit cleanup can undo injections, while ordinary stale continuations cannot issue commands (wrong prompts).
// - Host command cancellation preserves reentry suppression until the actual command settles (duplicate generation).
// - Unsubscribing a one-shot floor listener leaves its current callback alive until completion (lost actions).
// - Concurrent replacement has one owner, and stopping invalidates waiting starts (orphan scripts / blocked chat).
// - Reading tasks never writes presets or replaces live prompt switches (lost user settings).
// - Missing IDs never make a preset exit wait for storage (blocked destination chat).
// - Ordinary command results/concurrency and one-shot JavaScript remain unchanged (lost or duplicated actions).
// - Stop/edit/delete invalidate pending work before persistence finishes (scripts surviving user stop).
// - Waiting for script storage or executing empty input does not lock unrelated tasks (blocked chat).
// - After asynchronous global reads, use current preset task configuration only within the original visit (deleted/disabled or obsolete scripts running).
// - Saving an existing task preserves the editor text exactly, including empty content and whitespace; reopening/exporting must match and the old instance must stop (lost edits / stale scripts / wrong prompts).
const compile = (file, extra = '') => transformSync(fs.readFileSync(new URL(file, import.meta.url), 'utf8') + extra, {
    format: 'cjs', target: 'es2022', define: { 'import.meta.url': JSON.stringify(file) },
}).code;
// Expose private entry points to the harness without replacing their implementations.
const runtimeCode = compile('./scheduled-tasks.js', '\nexport { checkAndExecuteTasks, state, __taskRunMap, __taskExecutionMap, deleteTask, showTaskEditor, exportSingleTask, onMessageReceived };');
const eventCode = compile('./preset-task-events.js');
const slashCode = compile('../../core/slash-command.js');
const deferred = () => {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
};
const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function harness(t) {
    const { document } = parseHTML('<html><head></head><body></body></html>');
    const errors = [];
    const win = new EventTarget();
    Object.assign(win, { document, probes: {}, starts: {}, stops: {}, signals: {}, fetch: () => 'original' });
    const emitter = new EventEmitter();
    const event_types = Object.fromEntries(['OAI_PRESET_CHANGED_AFTER', 'PRESET_CHANGED', 'MAIN_API_CHANGED'].map(key => [key, key]));
    const context = { mainApi: 'openai', chatId: 'chat' };
    const liveSettings = { prompt_order: [{ character_id: 100000, order: [{ identifier: 'style', enabled: true }] }] };
    let selected = 'A';
    const data = new Map();
    const globals = [];
    const scripts = new Map();
    const timers = new Map(), intervals = new Map(), handlers = [];
    let timerId = 0;
    let editorCompletion;
    const editorResult = deferred();
    const editorFields = new Map();
    const editor = {
        clone() { return this; }, removeAttr() { return this; }, show() { return this; },
        find(selector) {
            if (!editorFields.has(selector)) {
                const field = { length: 1, value: '', props: {},
                    val(value) { if (!arguments.length) return this.value; this.value = value; return this; },
                    prop(key, value) { if (arguments.length === 1) return this.props[key]; this.props[key] = value; return this; },
                    on() { return this; }, css() { return this; }, html() { return this; },
                    show() { return this; }, hide() { return this; },
                };
                editorFields.set(selector, field);
            }
            return editorFields.get(selector);
        },
    };
    const $ = target => {
        if (target === '#task_editor_template') return editor;
        const chain = { 0: document.createElement('div'), length: 0 };
        for (const method of ['children', 'first', 'clone', 'attr', 'text', 'find', 'prop', 'empty', 'append']) chain[method] = () => chain;
        chain.sortable = () => null;
        chain.off = event => {
            for (let i = handlers.length - 1; i >= 0; i--) if (handlers[i].target === target && handlers[i].event === event) handlers.splice(i, 1);
            return chain;
        };
        chain.on = (event, selector, fn) => { handlers.push({ target, event, selector, fn }); return chain; };
        return chain;
    };
    const manager = {
        getSelectedPresetName: () => selected,
        getCompletionPresetByName: name => data.get(name),
        savePreset: async (name, value) => { data.set(name, structuredClone(value)); },
    };
    const settings = { enabled: true, globalTasks: globals, processedMessages: [], character_allowed_tasks: [] };
    const calls = [];
    const downloads = [];
    const host = {
        saveSettingsDebounced() {}, characters: [], this_chid: null,
        chat: [{ is_user: true }, { is_user: false }], callPopup: async () => true,
        eventSource: emitter, event_types,
    };
    const storage = { getStrict: async id => scripts.get(id), set: async (id, value) => scripts.set(id, value),
        delete: async id => scripts.delete(id), clearCache() {}, getCacheSize: () => 0, getCacheBytes: () => 0 };
    const extensions = {
        extension_settings: { test: { tasks: settings } }, getContext: () => context,
        writeExtensionField: async (id, key, value) => { host.characters[id].data.extensions[key] = value; },
    };
    let slash = async command => { calls.push(command); };
    Object.assign(context, {
        substituteParams: command => command,
        executeSlashCommands: (command, _parser, _scope, _execution, _flags, controller) => slash(command, controller),
    });
    const imports = {
        '../../../../../extensions.js': extensions,
        '../../../../../../script.js': host,
        '../../../../../popup.js': { POPUP_TYPE: { CONFIRM: 1 }, callGenericPopup: () => editorResult.promise },
        '../../../../../preset-manager.js': { getPresetManager: () => manager },
        '../../../../../openai.js': { oai_settings: liveSettings },
        '../../../../../utils.js': { uuidv4: randomUUID, debounce: fn => fn, download: data => downloads.push(JSON.parse(data)) },
        '../../core/constants.js': { EXT_ID: 'test' },
        '../../core/event-manager.js': { createModuleEvents: () => ({ cleanup() {} }), event_types },
        '../../core/debug-core.js': { CacheRegistry: { register() {} }, xbLog: console },
        '../../core/server-storage.js': { TasksStorage: storage },
        '../../../../extensions.js': { getContext: () => context },
        '../../../../slash-commands/SlashCommandAbortController.js': { SlashCommandAbortController },
        '../../shared/common/async-errors.js': { observeAsyncCallback: fn => fn, observeBackgroundTask: (work, context) => {
            const completion = Promise.resolve(work).catch(error => errors.push(error));
            if (context.operation === 'showTaskEditor') editorCompletion = completion;
            return completion;
        } },
    };
    const box = vm.createContext({
        window: win, document, $, console, AbortController, CustomEvent, structuredClone,
        toastr: { error: error => errors.push(error) },
        setTimeout: (fn, delay, ...args) => { const id = ++timerId; timers.set(id, { fn, delay, args }); return id; },
        clearTimeout: id => timers.delete(id),
        setInterval: (fn, delay) => { const id = ++timerId; intervals.set(id, { fn, delay }); return id; },
        clearInterval: id => intervals.delete(id),
        requestAnimationFrame: fn => fn(),
        require: name => {
            if (Object.hasOwn(imports, name)) return imports[name];
            if (name.includes('/slash-commands/') || name.endsWith('/popup.js') || name.endsWith('/AccountStorage.js')) return {};
            throw new Error(`Unexpected test dependency: ${name}`);
        },
    });
    function load(code) {
        box.module = { exports: {} };
        vm.runInContext(`(function(){${code}\n})();`, box);
        return box.module.exports;
    }
    imports['./preset-task-events.js'] = load(eventCode);
    imports['../../core/slash-command.js'] = load(slashCode);
    const api = load(runtimeCode);
    api.initTaskSettings();
    t.after(() => win.xbtaskreset());
    return {
        win, api, calls, downloads, timers, intervals, storage, emitter, event_types, manager, errors, liveSettings, extensions,
        storedTasks: name => data.get(name)?.prompt_order[0].xiaobai_ext.scheduledTasks,
        slash: imports['../../core/slash-command.js'].executeSlashCommand,
        async saveInEditor(task, scope, commands) {
            await api.showTaskEditor(task, true, scope);
            editor.find('.task_commands_edit').val(commands);
            editorResult.resolve(true);
            await editorCompletion;
        },
        flushRecords() {
            for (const [id, timer] of timers) if (timer.delay === 500) { timers.delete(id); timer.fn(...timer.args); }
        },
        setSlash(fn) { slash = fn; },
        preset(name, tasks) { data.set(name, { prompt_order: [{ character_id: 100000, order: [], xiaobai_ext: { scheduledTasks: tasks } }] }); },
        global(task) { globals.push(task); scripts.set(task.id, task.commands); },
        character(task) {
            host.this_chid = 0;
            host.characters[0] = { avatar: 'test.png', data: { extensions: { 'xiaobaix-tasks': { tasks: [task] } } } };
        },
        change(name, { mainApi = 'openai', dropdown = false } = {}) {
            selected = name;
            context.mainApi = mainApi;
            if (dropdown) {
                for (const handler of handlers) if (handler.selector === '#settings_preset_openai') handler.fn({});
            } else emitter.emit(mainApi === 'openai' ? event_types.OAI_PRESET_CHANGED_AFTER : event_types.MAIN_API_CHANGED, { apiId: mainApi });
        },
    };
}

const task = (name, code, id = name) => ({ id, name, commands: `<<taskjs>>${code}<</taskjs>>`, interval: 1, triggerTiming: 'plugin_init' });
const resident = label => `
    const label = ${JSON.stringify(label)};
    window.starts[label] = (window.starts[label] || 0) + 1;
    window.signals[label] = abortSignal;
    const node = document.createElement('div'); node.id = label; document.body.append(node);
    const original = window.fetch; const wrapped = () => label; window.fetch = wrapped;
    abortSignal.addEventListener('abort', () => {
        window.stops[label] = (window.stops[label] || 0) + 1;
        node.remove(); if (window.fetch === wrapped) window.fetch = original;
    }, { once: true });
    addListener(window, 'probe', () => { window.probes[label] = (window.probes[label] || 0) + 1; });
    setTimeoutSafe(() => {}, 60000); setIntervalSafe(() => {}, 60000);
    addFloorListener(() => {}, { interval: 1, timing: 'after_ai' });
`;

test('automatic preset exit removes owned UI/fetch/listeners/timers/floor hooks but preserves same-name global task', async t => {
    const h = harness(t);
    h.global(task('same', resident('global'), 'global-id'));
    h.preset('A', [task('same', resident('preset'), 'preset-id')]);
    h.change('A');
    await h.api.checkAndExecuteTasks('plugin_initialized');
    assert.equal(h.api.__taskRunMap.size, 2);
    h.flushRecords();
    h.change('B', { dropdown: true });
    assert.equal(h.win.signals.preset.aborted, true);
    assert.equal(h.win.signals.global.aborted, false);
    assert.equal(h.win.document.getElementById('preset'), null);
    assert.ok(h.win.document.getElementById('global'));
    assert.equal(h.win.fetch(), 'global');
    assert.equal(h.api.__taskRunMap.size, 1);
    assert.equal(h.api.state.dynamicCallbacks.size, 1);
    assert.equal(h.intervals.size, 1);
    assert.equal(h.timers.size, 1);
    h.win.dispatchEvent(new Event('probe'));
    await settle();
    assert.equal(h.win.probes.global, 1);
    assert.equal(h.win.probes.preset, undefined);
});

test('concurrent replacements leave exactly one owned instance, and reset removes all resources', async t => {
    const h = harness(t), gate = deferred();
    h.win.gate = gate.promise;
    h.win.instances = [];
    h.global(task('parallel', `
        window.instances.push(abortSignal);
        setIntervalSafe(() => {}, 1000);
        onCleanup(() => window.gate);
    `));
    await h.win.XBTasks.exec('parallel');
    const replacements = Array.from({ length: 3 }, () => h.win.XBTasks.exec('parallel'));
    await settle(); gate.resolve(); await Promise.all(replacements);
    assert.equal(h.win.instances.filter(signal => !signal.aborted).length, 1);
    assert.equal(h.intervals.size, 1);
    assert.equal(h.api.__taskRunMap.size, 1);
    await h.win.xbtaskreset();
    assert.equal(h.win.instances.filter(signal => !signal.aborted).length, 0);
    assert.equal(h.intervals.size, 0);
});

test('stopping during cleanup invalidates the already waiting replacement', async t => {
    for (const action of ['disable', 'reset']) {
        await t.test(action, async t => {
            const h = harness(t), gate = deferred();
            h.win.gate = gate.promise;
            const panel = task('queued', `
                window.starts.queued = (window.starts.queued || 0) + 1;
                setIntervalSafe(() => {}, 1000);
                onCleanup(() => window.gate);
            `);
            if (action === 'disable') { h.preset('A', [panel]); h.change('A'); }
            else h.global(panel);
            await h.win.XBTasks.exec('queued');
            const replacement = h.win.XBTasks.exec('queued');
            await settle();
            const stop = action === 'disable'
                ? h.win.XBTasks.setProps('queued', { disabled: true }, 'preset')
                : h.win.xbtaskreset();
            await settle(); gate.resolve();
            await Promise.all([stop, replacement]);
            assert.equal(h.win.starts.queued, 1);
            assert.equal(h.api.__taskRunMap.size, 0);
            assert.equal(h.intervals.size, 0);
        });
    }
});

test('reading a missing-ID task does not write a preset or overwrite live prompt switches', async t => {
    const h = harness(t), gate = deferred();
    const save = h.manager.savePreset;
    let saves = 0;
    h.manager.savePreset = async (...args) => { saves++; await gate.promise; return save(...args); };
    const panel = task('idless', resident('idless')); delete panel.id;
    h.preset('A', [panel]); h.change('A');
    h.win.XBTasks.list('preset');
    const order = h.liveSettings.prompt_order;
    order[0].order[0].enabled = false;
    gate.resolve(); await settle();
    assert.equal(saves, 0);
    assert.equal(h.liveSettings.prompt_order, order);
    assert.equal(order[0].order[0].enabled, false);
});

test('missing task IDs cannot keep the old preset trigger locked behind a storage wait', async t => {
    const h = harness(t), gate = deferred();
    h.manager.savePreset = async () => { await gate.promise; };
    const a = task('idless', resident('A')); delete a.id;
    const b = task('next', 'window.starts.B = (window.starts.B || 0) + 1;'); b.triggerTiming = 'after_ai';
    h.preset('A', [a]); h.preset('B', [b]); h.change('A');
    const trigger = h.api.checkAndExecuteTasks('plugin_initialized');
    await settle(); h.change('B'); await settle(); h.flushRecords();
    await h.api.checkAndExecuteTasks('after_ai');
    // Resolve the diagnostic gate even when the assertion below fails.
    gate.resolve(); await trigger;
    assert.equal(h.win.starts.B, 1);
});

test('manual facade and quick execution bind to each visit; duplicate events do not stop it, API exit does', async t => {
    const h = harness(t);
    h.preset('A', [task('panel', resident('panel'))]);
    h.change('A');
    await h.win.XBTasks.exec('panel');
    h.change('A');
    h.emitter.emit(h.event_types.PRESET_CHANGED, { apiId: 'openai', name: 'A' });
    assert.equal(h.win.stops.panel, undefined);
    h.change('A', { mainApi: 'textgenerationwebui' });
    assert.equal(h.win.signals.panel.aborted, true);
    assert.equal(h.api.__taskRunMap.size, 0);
    h.change('A');
    assert.equal(h.win.starts.panel, 1); // plugin_init is not preset-enter.
    await h.win.xbqte('panel');
    assert.equal(h.win.starts.panel, 2);
    h.change('B');
    assert.equal(h.win.stops.panel, 2);
});

test('A -> B -> A cancels the old sequence but retains its host receipt until settlement', async t => {
    const h = harness(t), gate = deferred();
    h.setSlash(async command => { h.calls.push(command); if (command === '/pause') await gate.promise; });
    const delayed = task('delayed', resident('stale'));
    delayed.commands = '/pause\n' + delayed.commands + '\n/late';
    h.preset('A', [delayed]); h.change('A');
    const running = h.win.XBTasks.exec('delayed');
    h.change('B'); h.change('A');
    await running;
    assert.equal(h.api.state.isCommandGenerated, true);
    gate.resolve(); await settle();
    h.flushRecords();
    assert.equal(h.api.state.executingRecords.size, 0);
    assert.equal(h.api.__taskRunMap.size, 0);
    assert.equal(h.win.starts.stale, undefined);
    assert.deepEqual(h.calls, ['/pause']);
});

test('pending taskjs cannot register new managed resources or issue STscript after its preset exits', async t => {
    const h = harness(t), gate = deferred();
    h.win.gate = gate.promise;
    h.preset('A', [task('pending', resident('pending') + `
        await window.gate;
        addListener(window, 'late', () => {}); setIntervalSafe(() => {}, 50000);
        addFloorListener(() => {}, { interval: 1 }); await STscript('/late');
    `)]);
    h.change('A');
    const running = h.win.XBTasks.exec('pending');
    await settle();
    h.change('B'); await running;
    assert.equal(h.api.state.executingRecords.size, 0);
    gate.resolve(); await settle(); h.flushRecords();
    assert.equal(h.api.__taskRunMap.size, 0);
    assert.equal(h.api.state.dynamicCallbacks.size, 0);
    assert.equal(h.intervals.size, 0);
    assert.equal(h.timers.size, 0);
    assert.deepEqual(h.calls, []);
});

test('a queued replacement from an old visit cannot replace the new visit after its previous body settles', async t => {
    const h = harness(t), gate = deferred();
    h.win.gate = gate.promise;
    h.preset('A', [task('panel', resident('panel') + 'if (window.starts.panel === 1) await window.gate;')]);
    h.change('A');
    const first = h.win.XBTasks.exec('panel');
    await settle();
    const replacement = h.win.XBTasks.exec('panel');
    await settle();
    h.change('B'); h.change('A');
    await h.win.XBTasks.exec('panel');
    const currentSignal = h.win.signals.panel;
    gate.resolve(); await first; await replacement; await settle();
    assert.equal(h.win.starts.panel, 2);
    assert.equal(currentSignal.aborted, false);
    assert.equal(h.api.__taskRunMap.size, 1);
});

test('an in-flight floor callback is cancelled without blocking subsequent triggers', async t => {
    const h = harness(t), gate = deferred();
    h.win.gate = gate.promise;
    h.preset('A', [task('floor', `addFloorListener(async () => {
        window.floorStarted = true; await window.gate; await STscript('/late-floor');
    }, { interval: 1 });`)]);
    h.change('A'); await h.win.XBTasks.exec('floor'); h.flushRecords();
    const running = h.api.checkAndExecuteTasks('after_ai');
    await settle(); assert.equal(h.win.floorStarted, true);
    h.change('B'); await running;
    assert.equal(h.api.state.executingRecords.size, 0);
    gate.resolve(); await settle();
    assert.deepEqual(h.calls, []);
});

test('an asynchronous global read cannot transfer preset scheduling to a different visit', async t => {
    for (const reenter of [false, true]) {
        await t.test(reenter ? 'A -> B -> A' : 'A -> B', async t => {
            const h = harness(t), gate = deferred();
            h.global(task('global', 'window.globalStarted = true;'));
            h.storage.getStrict = async () => { await gate.promise; return '<<taskjs>>window.globalStarted = true;<</taskjs>>'; };
            h.preset('A', [task('panel', resident('A'))]);
            h.preset('B', [task('panel', resident('B'))]);
            h.change('A'); const running = h.api.checkAndExecuteTasks('plugin_initialized');
            h.change('B'); if (reenter) h.change('A');
            gate.resolve(); await running;
            assert.equal(h.win.globalStarted, true);
            assert.deepEqual(h.win.starts, {});
        });
    }
});

test('automatic scheduling reads current preset tasks after asynchronous global reads', async t => {
    for (const action of ['delete', 'disable', 'edit']) {
        await t.test(action, async t => {
            const h = harness(t), gate = deferred();
            const global = task('global', 'window.globalStarted = true;');
            h.global(global);
            h.storage.getStrict = async () => { await gate.promise; return global.commands; };
            h.preset('A', [task('panel', resident('old'))]); h.change('A');
            const running = h.api.checkAndExecuteTasks('plugin_initialized');
            if (action === 'delete') await h.api.deleteTask(0, 'preset');
            if (action === 'disable') await h.win.XBTasks.setProps('panel', { disabled: true }, 'preset');
            if (action === 'edit') await h.win.XBTasks.setJS('panel', resident('new'), { scope: 'preset' });
            gate.resolve(); await running;
            assert.equal(h.win.globalStarted, true);
            assert.equal(h.win.starts.old, undefined);
            assert.equal(h.win.document.getElementById('old'), null);
            assert.equal(h.win.starts.new, action === 'edit' ? 1 : undefined);
            assert.equal(h.api.__taskRunMap.size, action === 'edit' ? 1 : 0);
            assert.equal(h.intervals.size, action === 'edit' ? 1 : 0);
        });
    }
});

test('disabling, replacing and deleting a preset task still cleans its isolated run', async t => {
    const h = harness(t);
    h.preset('A', [task('panel', resident('panel'))]); h.change('A');
    await h.win.XBTasks.exec('panel');
    await h.win.XBTasks.setProps('panel', { disabled: true }, 'preset');
    assert.equal(h.api.__taskRunMap.size, 0);
    await h.win.XBTasks.setProps('panel', { disabled: false }, 'preset');
    await h.win.XBTasks.exec('panel');
    await h.win.XBTasks.setJS('panel', resident('replacement'), { scope: 'preset' });
    assert.equal(h.api.__taskRunMap.size, 0);
    await h.win.XBTasks.exec('panel');
    await h.api.deleteTask(0, 'preset');
    assert.equal(h.api.__taskRunMap.size, 0);
    assert.equal(h.win.XBTasks.preset.length, 0);
});

test('editor saves commands verbatim without retaining the old instance', async t => {
    for (const scope of ['preset', 'global', 'character']) {
        for (const [label, commands] of [
            ['clear', ''],
            ['blank lines', '\n\n'],
            ['spaces and tabs', ' \t\n  \n\t '],
            ['replace', '<<taskjs>>\nwindow.replacementRan = true;\n<</taskjs>>'],
            ['padded script', '\n \t<<taskjs>>\nwindow.replacementRan = true;\n<</taskjs>> \t\n\n'],
        ]) {
            await t.test(`${scope}: ${label}`, async t => {
                const h = harness(t);
                const old = { ...task('editable', resident('old')), interval: 3 };
                if (scope === 'preset') { h.preset('A', [old]); h.change('A'); }
                else h[scope](old);
                await h.win.XBTasks.exec('editable'); h.flushRecords();
                const hit = h.win.XBTasks.find('editable', scope);
                await h.saveInEditor(hit.task, scope, commands);

                assert.equal(h.win.signals.old.aborted, true);
                assert.equal(h.win.stops.old, 1);
                assert.equal(h.api.__taskRunMap.size, 0);
                assert.equal(h.api.state.dynamicCallbacks.size, 0);
                assert.equal(h.intervals.size, 0);
                assert.equal(h.win.document.getElementById('old'), null);
                if (scope === 'preset') {
                    assert.equal(h.storedTasks('A')[0].commands, commands);
                    h.change('B'); h.change('A');
                } else if (scope === 'global') {
                    assert.equal(await h.storage.getStrict(old.id), commands);
                }
                const [reopened] = await h.win.XBTasks.dump(scope);
                assert.equal(reopened.commands, commands);
                assert.equal(reopened.id, old.id);
                assert.equal(reopened.interval, 3);
                assert.equal(reopened.triggerTiming, 'plugin_init');
                await h.api.exportSingleTask(0, scope);
                assert.equal(h.downloads[0].tasks[0].commands, commands);
                await h.win.XBTasks.exec('editable');
                assert.equal(h.win.starts.old, 1);
                assert.equal(h.win.replacementRan, commands.trim() ? true : undefined);
                assert.equal(h.errors.length, 0);
            });
        }
    }
});

test('native abort cleanup still issues STscript on disable, delete, rerun, preset exit and global reset', async t => {
    for (const action of ['disable', 'delete', 'rerun', 'exit', 'global-reset']) {
        await t.test(action, async t => {
            const h = harness(t);
            const script = task('injection', `
                await STscript('/inject id=review test');
                abortSignal.addEventListener('abort', () => STscript('/flushinject review'), { once: true });
                setIntervalSafe(() => {}, 60000);
            `);
            if (action === 'global-reset') h.global(script);
            else { h.preset('A', [script]); h.change('A'); }
            await h.win.XBTasks.exec('injection');
            if (action === 'disable') await h.win.XBTasks.setProps('injection', { disabled: true }, 'preset');
            if (action === 'delete') await h.api.deleteTask(0, 'preset');
            if (action === 'rerun') await h.win.XBTasks.exec('injection');
            if (action === 'exit') h.change('B');
            if (action === 'global-reset') await h.win.xbtaskreset();
            await settle();
            assert.deepEqual(h.calls, action === 'rerun'
                ? ['/inject id=review test', '/flushinject review', '/inject id=review test']
                : ['/inject id=review test', '/flushinject review']);
            assert.equal(h.errors.length, 0);
        });
    }
});

test('async cleanup is awaited before replacement without admitting stale ordinary commands', async t => {
    const h = harness(t), gate = deferred();
    h.win.gate = gate.promise;
    h.preset('A', [task('injection', `
        window.starts.injection = (window.starts.injection || 0) + 1;
        window.oldSTscript = STscript;
        await STscript('/inject');
        onCleanup(async ({ STscript }) => { await window.gate; await STscript('/flush'); });
    `)]);
    h.change('A');
    await h.win.XBTasks.exec('injection'); h.flushRecords();
    const oldSTscript = h.win.oldSTscript;
    const replacement = h.win.XBTasks.exec('injection');
    await settle();
    assert.equal(h.win.starts.injection, 1);
    assert.equal(h.api.state.isCommandGenerated, true);
    await oldSTscript('/stale');
    assert.deepEqual(h.calls, ['/inject']);
    gate.resolve(); await replacement;
    assert.deepEqual(h.calls, ['/inject', '/flush', '/inject']);
    assert.equal(h.win.starts.injection, 2);
});

test('preset reentry waits for old cleanup, not an unrelated cancelled JavaScript wait', async t => {
    const h = harness(t), body = deferred(), cleanup = deferred();
    h.win.body = body.promise; h.win.cleanup = cleanup.promise;
    h.preset('A', [task('panel', `
        window.starts.panel = (window.starts.panel || 0) + 1;
        onCleanup(async ({ STscript }) => { await window.cleanup; await STscript('/flush'); });
        if (window.starts.panel === 1) await window.body;
    `)]);
    h.change('A'); const old = h.win.XBTasks.exec('panel'); await settle();
    h.change('B'); h.change('A');
    const current = h.win.XBTasks.exec('panel'); await settle();
    assert.equal(h.win.starts.panel, 1);
    cleanup.resolve(); await current; await old;
    assert.equal(h.win.starts.panel, 2);
    assert.deepEqual(h.calls, ['/flush']);
    body.resolve(); await settle();
    assert.equal(h.api.__taskRunMap.size, 1);
});

test('cleanup failures are reported and do not skip other registered cleanups', async t => {
    const h = harness(t);
    h.global(task('cleanup', `
        onCleanup(async () => { throw new Error('cleanup failure'); });
        onCleanup(async ({ STscript }) => { await STscript('/flush'); });
    `));
    await h.win.XBTasks.exec('cleanup');
    await assert.rejects(h.win.xbtaskreset(), { name: 'AggregateError' });
    await settle();
    assert.deepEqual(h.calls, ['/flush']);
    assert.ok(h.errors.some(error => error?.name === 'AggregateError'));
    assert.equal(h.api.__taskRunMap.size, 0);
});

test('host command receives cancellation but keeps reentry suppression until it really settles', async t => {
    const h = harness(t), gate = deferred();
    let controller;
    h.setSlash(async (command, hostController) => {
        h.calls.push(command);
        controller = hostController;
        await gate.promise;
        // A command already in progress may still render a message while stopping.
        await h.api.onMessageReceived(1);
        if (!hostController.signal.aborted) h.calls.push('/trigger');
    });
    const a = task('old', ''); a.commands = '/delay 1000 | /trigger await=true';
    const b = task('new', 'window.bRuns = (window.bRuns || 0) + 1;'); b.triggerTiming = 'after_ai';
    h.preset('A', [a]); h.preset('B', [b]); h.change('A');
    const running = h.win.XBTasks.exec('old');
    await settle(); h.change('B'); await running;
    assert.ok(controller instanceof SlashCommandAbortController);
    assert.equal(controller.signal.aborted, true);
    await h.win.xbtaskreset(); h.flushRecords();
    assert.equal(h.api.state.isCommandGenerated, true);
    gate.resolve(); await settle(); h.flushRecords();
    assert.equal(h.win.bRuns, undefined);
    assert.deepEqual(h.calls, ['/delay 1000 | /trigger await=true']);
    assert.equal(h.api.state.executingRecords.size, 0);
    await h.api.onMessageReceived(1);
    assert.equal(h.win.bRuns, 1);
});

test('host bridge preserves result/error behavior and releases cancellation listeners', async t => {
    const h = harness(t), abort = new AbortController();
    let controller;
    h.setSlash(async (_command, hostController) => { controller = hostController; return { pipe: '{"value":7}' }; });
    assert.equal((await h.slash('/result', { signal: abort.signal })).value, 7);
    abort.abort();
    assert.equal(controller.signal.aborted, false);
    h.setSlash(async command => { h.calls.push(command); throw new Error('host failed'); });
    await h.slash('/cancelled', { signal: abort.signal });
    assert.deepEqual(h.calls, []);
    await assert.rejects(h.slash('/error'), /host failed/);
});

test('detached STscript keeps its owner alive until its host command settles normally', async t => {
    const h = harness(t), gate = deferred();
    let controller;
    h.setSlash(async (_command, hostController) => { controller = hostController; await gate.promise; });
    h.global(task('detached', `void STscript('/pending');`));
    await h.win.XBTasks.exec('detached');
    assert.equal(controller.signal.aborted, false);
    assert.equal(h.api.__taskRunMap.size, 1);
    gate.resolve(); await settle(); h.flushRecords();
    assert.equal(h.api.__taskRunMap.size, 0);
    assert.equal(h.api.state.executingRecords.size, 0);
});

test('one-shot floor unsubscription preserves the in-flight callback and its subsequent STscript', async t => {
    for (const scope of ['global', 'preset']) {
        await t.test(scope, async t => {
            const h = harness(t), gate = deferred();
            h.win.gate = gate.promise;
            const once = task('once', `
                const off = addFloorListener(async () => {
                    off(); await window.gate;
                    await STscript('/first'); await STscript('/second');
                }, { interval: 1 });
            `);
            if (scope === 'global') h.global(once);
            else { h.preset('A', [once]); h.change('A'); }
            await h.win.XBTasks.exec('once'); h.flushRecords();
            const run = h.api.checkAndExecuteTasks('after_ai');
            await settle();
            assert.equal(h.api.state.dynamicCallbacks.size, 0);
            assert.equal(h.api.__taskRunMap.size, 1);
            assert.equal(h.api.state.executingRecords.size, 1);
            gate.resolve(); await run; h.flushRecords();
            assert.deepEqual(h.calls, ['/first', '/second']);
            assert.equal(h.api.__taskRunMap.size, 0);
            await h.api.checkAndExecuteTasks('after_ai');
            assert.deepEqual(h.calls, ['/first', '/second']);
        });
    }
});

test('missing IDs and repeated refreshes do not orphan an existing preset run', async t => {
    const h = harness(t);
    const panel = task('panel', resident('panel')); delete panel.id;
    h.preset('A', [panel]); h.change('A');
    await h.win.XBTasks.exec('panel');
    h.change('A');
    await h.win.XBTasks.exec('panel');
    assert.equal(h.api.__taskRunMap.size, 1);
    assert.equal(h.intervals.size, 1);
    h.change('A');
    await h.win.XBTasks.setProps('panel', { disabled: true }, 'preset');
    assert.equal(h.api.__taskRunMap.size, 0);
    assert.equal(h.win.stops.panel, 2);
    assert.equal(h.intervals.size, 0);
});

test('executing a missing-ID task does not depend on preset write availability', async t => {
    const h = harness(t);
    h.manager.savePreset = async () => { throw new Error('save failed'); };
    const panel = task('panel', resident('panel')); delete panel.id;
    h.preset('A', [panel]); h.change('A');
    await h.win.XBTasks.exec('panel');
    assert.equal(h.win.starts.panel, 1);
    assert.equal(h.storedTasks('A')[0].id, undefined);
    assert.equal(h.errors.length, 0);
    h.change('B');
    assert.equal(h.win.stops.panel, 1);
});

test('missing-ID tasks are isolated from same-name tasks in the next preset', async t => {
    const h = harness(t);
    const panel = task('panel', resident('A')); delete panel.id;
    h.preset('A', [panel]); h.preset('B', [task('panel', resident('B'), 'B-id')]);
    h.change('A'); await h.win.XBTasks.exec('panel');
    h.change('B'); await h.win.XBTasks.exec('panel');
    assert.equal(h.win.stops.A, 1);
    assert.equal(h.win.starts.B, 1);
    assert.equal(h.api.__taskRunMap.size, 1);
    assert.equal(h.win.XBTasks.preset[0].id, 'B-id');
    assert.equal(h.storedTasks('B')[0].id, 'B-id');
});

test('pending replacement respects stop, edit and deletion in every task scope', async t => {
    for (const scope of ['global', 'character', 'preset']) {
        for (const action of ['disable', 'delete', 'edit', 'rename', 'reset']) {
            await t.test(`${scope}/${action}`, async t => {
                const h = harness(t), gate = deferred(); h.win.gate = gate.promise;
                const panel = task('queued', `
                    window.starts.queued = (window.starts.queued || 0) + 1;
                    setIntervalSafe(() => {}, 1000);
                    onCleanup(() => window.gate);
                `);
                if (scope === 'preset') { h.preset('A', [panel]); h.change('A'); }
                else h[scope](panel);
                await h.win.XBTasks.exec('queued');
                const queued = Array.from({ length: 3 }, () => h.win.XBTasks.exec('queued'));
                await settle();
                let stop;
                if (action === 'disable') stop = h.win.XBTasks.setProps('queued', { disabled: true }, scope);
                if (action === 'delete') stop = h.api.deleteTask(0, scope);
                if (action === 'edit') stop = h.win.XBTasks.setJS('queued', 'window.replaced = true;', { scope });
                if (action === 'rename') stop = h.win.XBTasks.setProps('queued', { name: 'renamed' }, scope);
                if (action === 'reset') stop = h.win.xbtaskreset();
                await settle(); gate.resolve(); await stop; await Promise.all(queued); h.flushRecords();
                assert.equal(h.win.starts.queued, 1);
                assert.equal(h.win.replaced, undefined);
                assert.equal(h.api.__taskRunMap.size, 0);
                assert.equal(h.api.__taskExecutionMap.size, 0);
                assert.equal(h.intervals.size, 0);
                assert.equal(h.api.state.executingRecords.size, 0);
            });
        }
    }
});

test('disable invalidates pending work immediately even while saving is still in flight', async t => {
    for (const scope of ['global', 'character', 'preset']) {
        await t.test(scope, async t => {
            const h = harness(t), cleanup = deferred(), save = deferred();
            h.win.gate = cleanup.promise;
            const panel = task('queued', `
                window.starts.queued = (window.starts.queued || 0) + 1;
                onCleanup(() => window.gate);
            `);
            if (scope === 'preset') { h.preset('A', [panel]); h.change('A'); }
            else h[scope](panel);
            await h.win.XBTasks.exec('queued');
            const queued = h.win.XBTasks.exec('queued'); await settle();
            if (scope === 'global') h.storage.set = () => save.promise;
            if (scope === 'character') h.extensions.writeExtensionField = () => save.promise;
            if (scope === 'preset') h.manager.savePreset = () => save.promise;
            const disabling = h.win.XBTasks.setProps('queued', { disabled: true }, scope);
            cleanup.resolve(); await queued; await settle();
            const startsBeforeSave = h.win.starts.queued;
            save.resolve(); await disabling;
            assert.equal(startsBeforeSave, 1);
            assert.equal(h.api.__taskRunMap.size, 0);
        });
    }
});

test('plain command tasks retain concurrent calls and return values', async t => {
    const h = harness(t), gate = deferred();
    const command = task('command', ''); command.commands = '/work'; h.global(command);
    const controllers = [];
    h.setSlash(async (_command, controller) => { controllers.push(controller); await gate.promise; return { pipe: '{"ok":true}' }; });
    const jobs = Array.from({ length: 3 }, () => h.win.XBTasks.exec('command'));
    await settle(); assert.equal(controllers.length, 3);
    assert.ok(controllers.every(controller => !controller.signal.aborted));
    gate.resolve(); const results = await Promise.all(jobs);
    assert.ok(results.every(result => result.ok === true));
    assert.equal(h.api.__taskExecutionMap.size, 0);
});

test('reset cancels a pending script read and the rest of a mixed command pipeline', async t => {
    for (const stage of ['read', 'command', 'script']) {
        await t.test(stage, async t => {
            const h = harness(t), gate = deferred(); h.win.gate = gate.promise;
            const mixed = task('mixed', 'await window.gate;');
            mixed.commands = '/prefix\n' + mixed.commands + '\n/after';
            h.global(mixed);
            if (stage === 'read') h.storage.getStrict = async () => { await gate.promise; return mixed.commands; };
            if (stage === 'command') h.setSlash(async command => { h.calls.push(command); await gate.promise; });
            const job = h.win.XBTasks.exec('mixed'); await settle();
            await h.win.xbtaskreset(); await job;
            gate.resolve(); await settle(); h.flushRecords();
            assert.ok(!h.calls.includes('/after'));
            assert.equal(h.api.__taskRunMap.size, 0);
            assert.equal(h.api.__taskExecutionMap.size, 0);
            assert.equal(h.api.state.executingRecords.size, 0);
        });
    }
});

test('a replacement requested by an abort handler still waits for cleanup and has one owner', async t => {
    const h = harness(t), gate = deferred(); h.win.gate = gate.promise;
    h.preset('A', [task('reentrant', `
        window.starts.reentrant = (window.starts.reentrant || 0) + 1;
        setIntervalSafe(() => {}, 1000);
        if (window.starts.reentrant === 1) {
            abortSignal.addEventListener('abort', () => { window.reentrant = window.XBTasks.exec('reentrant'); }, { once: true });
            onCleanup(() => window.gate);
        }
    `)]); h.change('A');
    await h.win.XBTasks.exec('reentrant');
    const replacement = h.win.XBTasks.exec('reentrant'); await settle();
    assert.equal(h.win.starts.reentrant, 1);
    gate.resolve(); await replacement; await h.win.reentrant;
    assert.equal(h.win.starts.reentrant, 2);
    assert.equal(h.intervals.size, 1);
    await h.win.xbtaskreset();
    assert.equal(h.intervals.size, 0);
});

test('pending reads and empty tasks do not hold the automatic execution lock', async t => {
    const h = harness(t), gate = deferred();
    const pending = task('loading', 'window.starts.loading = 1;');
    h.global(pending);
    h.storage.getStrict = async () => { await gate.promise; return pending.commands; };
    const job = h.win.XBTasks.exec('loading'); await settle();
    assert.equal(h.api.__taskExecutionMap.size, 1);
    assert.equal(h.api.state.executingRecords.size, 0);
    await h.win.xbtaskreset(); await job;
    gate.resolve(); await settle();
    assert.equal(h.win.starts.loading, undefined);

    const empty = task('empty', ''); empty.commands = '';
    h.preset('A', [empty]); h.change('A');
    assert.equal(await h.win.XBTasks.exec('empty'), null);
    assert.equal(h.api.state.executingRecords.size, 0);
    assert.equal(h.api.__taskExecutionMap.size, 0);
});

test('quick execution replaces a request still waiting for its script read', async t => {
    const h = harness(t), gate = deferred();
    const panel = task('loading', resident('loading')); h.global(panel);
    let reads = 0;
    h.storage.getStrict = async () => { if (++reads === 1) await gate.promise; return panel.commands; };
    const first = h.win.xbqte('loading'); await settle();
    await h.win.xbqte('loading');
    gate.resolve(); await first; await settle();
    assert.equal(h.win.starts.loading, 1);
    assert.equal(h.api.__taskRunMap.size, 1);
    assert.equal(h.intervals.size, 1);
});
