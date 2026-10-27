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
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { Buffer } from 'node:buffer';
import { StorageFile } from '../../core/storage-file.js';
import { gzipSync, gunzipSync, strFromU8 } from '../../libs/fflate.mjs';

// Use the real supported host controller, not a browser AbortController substitute.
const controllerUrl = process.env.LWB_HOST_ROOT
    ? pathToFileURL(path.join(process.env.LWB_HOST_ROOT, 'public/scripts/slash-commands/SlashCommandAbortController.js'))
    : new URL('../../../../../slash-commands/SlashCommandAbortController.js', import.meta.url);
// eslint-disable-next-line no-unsanitized/method -- test runner selects a trusted local host checkout, not application input.
const { SlashCommandAbortController } = await import(controllerUrl.href);
// Exercise the host's awaited import event contract, not Node's synchronous emit.
const hostEventCode = transformSync(fs.readFileSync(new URL('../../lib/eventemitter.js', controllerUrl), 'utf8'), { format: 'cjs' }).code;
const hostPresetEndpointUrl = new URL('../../../src/endpoints/presets.js', controllerUrl);
const hostPresetEndpointCode = transformSync(fs.readFileSync(hostPresetEndpointUrl, 'utf8'), { format: 'cjs' }).code;
const hostRequire = createRequire(hostPresetEndpointUrl);

function presetFile(t) {
    const directory = fs.mkdtempSync(path.join(tmpdir(), 'lwb-preset-import-'));
    const file = path.join(directory, 'A.json');
    t.after(() => { if (fs.existsSync(file)) fs.unlinkSync(file); fs.rmdirSync(directory); });
    const routes = new Map();
    // Run the actual host save handler. Unrelated restore/content routes are not called.
    vm.runInNewContext(hostPresetEndpointCode, {
        module: { exports: {} },
        require(name) {
            if (name === 'express') return { Router: () => ({ post: (url, handler) => routes.set(url, handler) }) };
            if (name === './content-manager.js') return {};
            return hostRequire(name);
        },
    });
    return {
        write(preset) {
            return routes.get('/save')({ body: { apiId: 'openai', name: 'A', preset }, user: { directories: { openAI_Settings: directory } } }, {
                send: value => value,
                sendStatus: status => { throw new Error(`Preset write failed: ${status}`); },
            });
        },
        read: () => JSON.parse(fs.readFileSync(file, 'utf8')),
    };
}

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
// - Returning from startup does not cancel detached initialization, native UI handlers or returned capabilities; idle UI never locks chat (broken panels / lost actions).
// - Explicit stop/replacement revokes those capabilities even after startup returns, with only one current instance per task (stale writes / duplicate generation).
// - Stop/delete invalidate pending work immediately; edits retire the old instance only after success (scripts surviving stop / lost running tasks).
// - Waiting for script storage or executing empty input does not lock unrelated tasks (blocked chat).
// - After asynchronous global reads, use current preset task configuration only within the original visit (deleted/disabled or obsolete scripts running).
// - Saving an existing task preserves the editor text exactly, including empty content and whitespace; reopening/exporting must match and the old instance must stop (lost edits / stale scripts / wrong prompts).
// - Ordered preset saves publish only task fields; superseded saves cannot restore imported/deleted definitions or revert live prompt switches (lost edits).
// - Opted-in preset entry runs once after host/module readiness, including import and return; existing timings never gain new triggers (unexpected script execution).
// - Pending preset entry survives existing work/cleanup but is cancelled by exit/reset; it reads current task definitions when runnable (stale scripts / blocked chat).
// - Host import waits for earlier queued task writes before writing its file; a failed import does not discard earlier edits (lost preset data).
// - While saving, host notifications cannot revive deleted/disabled tasks or execute draft scripts (uncommitted code running).
// - All three editors wait for acknowledged persistence before closing; errors preserve text and retries do not duplicate tasks (lost edits).
// - Moving a task saves its destination before removing its source; a failed destination leaves the original intact (lost tasks).
// - Failed migration retries, including changing the target back, confirm every old location is removed (duplicate/stale tasks).
// - Individual request deadlines allow one recovery read; a closed editor's delayed outcome cannot alter another editor (lost edits/tasks).
// - Ordinary preset edits preserve queued task edits and their own fields; only import/delete supersede a batch (lost edits).
// - Failed character writes leave data/json_data untouched; successful edits publish the same task field to both (lost edits).
// - 已确认角色内容不因允许记录失败而回滚或阻塞本次迁移，已获准角色不重复写设置（误报结果、丢修改）。
// - 回执丢失只查询一次；仍未知时保留候选及旧脚本，重试不丢源任务、不重复创建（丢任务）。
// - 许可设置卡住不阻塞任何类型的任务保存（无法保存用户修改）。
const compile = (file, extra = '') => transformSync(fs.readFileSync(new URL(file, import.meta.url), 'utf8') + extra, {
    format: 'cjs', target: 'es2022', define: { 'import.meta.url': JSON.stringify(file) },
}).code;
// Expose private entry points to the harness without replacing their implementations.
const runtimeCode = compile('./scheduled-tasks.js', '\nexport { checkAndExecuteTasks, state, __taskRunMap, __taskExecutionMap, deleteTask, showTaskEditor, exportSingleTask, importGlobalTasks, onMessageReceived, refreshPresetTasks, beginPresetTaskInitialization, finishPresetTaskInitialization, PresetTasksStore };');
const eventCode = compile('./preset-task-events.js');
const slashCode = compile('../../core/slash-command.js');
const deferred = () => {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
};
const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function harness(t, { taskStorage } = {}) {
    const { document } = parseHTML('<html><head></head><body></body></html>');
    const errors = [], warnings = [], permissionWrites = [];
    const win = new EventTarget();
    Object.assign(win, { document, probes: {}, starts: {}, stops: {}, signals: {}, fetch: () => 'original' });
    const emitter = new EventEmitter();
    const event_types = Object.fromEntries(['OAI_PRESET_CHANGED_AFTER', 'PRESET_CHANGED', 'MAIN_API_CHANGED', 'APP_READY', 'OAI_PRESET_IMPORT_READY', 'PRESET_DELETED'].map(key => [key, key]));
    const context = { mainApi: 'openai', chatId: 'chat' };
    const liveSettings = { prompt_order: [{ character_id: 100000, order: [{ identifier: 'style', enabled: true }] }] };
    let selected = 'A';
    const data = new Map();
    const globals = [];
    const scripts = new Map();
    const timers = new Map(), intervals = new Map(), handlers = [];
    let timerId = 0;
    let editorCompletion;
    let editorResult = deferred();
    let editorPopup;
    let editor;
    const makeEditor = () => {
    const editorFields = new Map();
    return {
        0: document.createElement('div'),
        clone() { return this; }, removeAttr() { return this; }, show() { return this; },
        find(selector) {
            if (!editorFields.has(selector)) {
                const field = { length: 1, value: '', props: {},
                    val(value) { if (!arguments.length) return this.value; this.value = value; return this; },
                    prop(key, value) { if (arguments.length === 1) return this.props[key]; this.props[key] = value; return this; },
                    on(event, fn) { (this.handlers ||= new Map()).set(event, fn); return this; },
                    fire(event) { this.handlers?.get(event)?.(); return this; },
                    css() { return this; }, html() { return this; }, append() { return this; },
                    show() { return this; }, hide() { return this; },
                };
                editorFields.set(selector, field);
            }
            return editorFields.get(selector);
        },
    };
    };
    const $ = target => {
        if (target === '#task_editor_template') return { clone() { editor = makeEditor(); return editor; } };
        const chain = { 0: document.createElement('div'), length: 0 };
        for (const method of ['children', 'first', 'clone', 'attr', 'text', 'find', 'prop', 'empty', 'append', 'val']) chain[method] = () => chain;
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
        savePreset: async (name, value, { skipUpdate } = {}) => { if (!skipUpdate) data.set(name, structuredClone(value)); },
    };
    const settings = { enabled: true, globalTasks: globals, processedMessages: [], character_allowed_tasks: [] };
    const calls = [];
    const downloads = [];
    const host = {
        saveSettingsDebounced() {}, saveSettings: async () => { await box.fetch('/api/settings/save', { method: 'POST', body: JSON.stringify({ extension_settings: extensions.extension_settings }) }); },
        getRequestHeaders: () => ({}), characters: [], this_chid: null,
        chat: [{ is_user: true }, { is_user: false }], callPopup: async () => true,
        eventSource: emitter, event_types,
    };
    let savedSettings;
    const savedPresets = new Map();
    const requests = [];
    const savedCharacters = new Map();
    const transport = {
        character: async (avatar, data) => {
            const saved = savedCharacters.get(avatar);
            Object.assign(saved.data.extensions, structuredClone(data.extensions));
        },
    };
    const storage = taskStorage || { getStrict: async id => scripts.get(id), set: async (id, value) => scripts.set(id, value),
        updateAndSave: async update => { const draft = Object.fromEntries(scripts); await update(draft); scripts.clear(); for (const [id, value] of Object.entries(draft)) scripts.set(id, value); },
        delete: async id => scripts.delete(id), clearCache() {}, getCacheSize: () => 0, getCacheBytes: () => 0 };
    const extensions = {
        extension_settings: { test: { tasks: settings } }, getContext: () => context,
        writeExtensionField: async (id, key, value) => {
            host.characters[id].data.extensions[key] = value;
            savedCharacters.set(host.characters[id].avatar, structuredClone(host.characters[id]));
        },
    };
    let slash = async command => { calls.push(command); };
    Object.assign(context, {
        substituteParams: command => command,
        executeSlashCommands: (command, _parser, _scope, _execution, _flags, controller) => slash(command, controller),
    });
    const imports = {
        '../../../../../extensions.js': extensions,
        '../../../../../../script.js': host,
        '../../../../../popup.js': { POPUP_TYPE: { CONFIRM: 1 }, POPUP_RESULT: { AFFIRMATIVE: 1 }, callGenericPopup: (_content, _type, _input, options) => {
            editorResult = deferred();
            const completion = editorResult;
            const dlg = document.createElement('div');
            const okButton = document.createElement('button');
            okButton.className = 'popup-button'; okButton.textContent = options.okButton;
            const buttonControls = document.createElement('div'); buttonControls.append(okButton);
            dlg.append(editor[0], buttonControls);
            editorPopup = { dlg, okButton, buttonControls, closed: false, async complete(result) {
                this.result = result; this.value = result;
                if (!await options.onClosing(this)) { this.result = undefined; this.value = undefined; return; }
                this.closed = true; completion.resolve(this.value);
            } };
            return editorResult.promise;
        } },
        '../../../../../preset-manager.js': { getPresetManager: () => manager },
        '../../../../../openai.js': { oai_settings: liveSettings },
        '../../../../../utils.js': { uuidv4: randomUUID, debounce: fn => fn, download: data => downloads.push(JSON.parse(data)), getFileText: async file => file },
        '../../core/constants.js': { EXT_ID: 'test' },
        '../../core/event-manager.js': { createModuleEvents: () => ({ cleanup() {} }), event_types },
        '../../core/debug-core.js': { CacheRegistry: { register() {} }, xbLog: console },
        '../../core/server-storage.js': { TasksStorage: storage },
        '../../../../extensions.js': { getContext: () => context },
        '../../../../slash-commands/SlashCommandAbortController.js': { SlashCommandAbortController },
        '../../shared/common/async-errors.js': { observeAsyncCallback: fn => fn, observeBackgroundTask: (work, context) => {
            const completion = Promise.resolve(work).catch(error => errors.push(error));
            if (context.operation === 'showTaskEditor') editorCompletion = completion;
            if (context.operation === 'rememberCharacterTaskPermission') permissionWrites.push(completion);
            return completion;
        } },
    };
    const box = vm.createContext({
        window: win, document, $, console, AbortController, AbortSignal, CustomEvent, structuredClone, Headers, Request, Response, URL, TextEncoder, TextDecoder, Uint8Array, ArrayBuffer,
        localStorage: { getItem: () => null },
        toastr: { error: error => errors.push(error), warning: warning => warnings.push(warning), success() {}, info() {} },
        setTimeout: (fn, delay, ...args) => { const id = ++timerId; timers.set(id, { fn, delay, args }); return id; },
        clearTimeout: id => timers.delete(id),
        setInterval: (fn, delay) => { const id = ++timerId; intervals.set(id, { fn, delay }); return id; },
        clearInterval: id => intervals.delete(id),
        requestAnimationFrame: fn => fn(),
        fetch: async (url, options) => {
            requests.push(url);
            if (url === '/api/settings/save') {
                savedSettings = options.body;
                return Response.json({ result: 'ok' });
            }
            if (url === '/api/settings/get') return Response.json({ settings: savedSettings,
                openai_setting_names: [...savedPresets.keys()], openai_settings: [...savedPresets.values()].map(preset => JSON.stringify(preset)),
            });
            if (url === '/api/characters/get') return { ok: true, json: async () => savedCharacters.get(JSON.parse(options.body).avatar_url) };
            if (url === '/api/characters/merge-attributes') {
                const { avatar, data } = JSON.parse(options.body);
                await transport.character(avatar, data);
                return { ok: true };
            }
            if (url === '/api/presets/save') {
                const { name, preset } = JSON.parse(options.body);
                await manager.savePreset(name, preset, { skipUpdate: true });
                savedPresets.set(name, structuredClone(preset));
                return { ok: true, json: async () => ({ name }) };
            }
            throw new Error(`Unexpected request: ${url}`);
        },
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
    const { EventEmitter: HostEventEmitter } = load(hostEventCode);
    imports['../../shared/common/abort-utils.js'] = load(compile('../../shared/common/abort-utils.js'));
    imports['./preset-task-events.js'] = load(eventCode);
    imports['./task-save-copy.js'] = load(compile('./task-save-copy.js'));
    imports['./task-trigger.js'] = load(compile('./task-trigger.js'));
    imports['./task-save-operation.js'] = load(compile('./task-save-operation.js'));
    imports['./task-editor-save.js'] = load(compile('./task-editor-save.js'));
    imports['../../libs/fflate.mjs'] = { gzipSync, gunzipSync, strFromU8 };
    imports['./host-settings-save.js'] = load(compile('./host-settings-save.js'));
    imports['./task-storage-fields.js'] = load(compile('./task-storage-fields.js'));
    imports['./task-save-confirmation.js'] = load(compile('./task-save-confirmation.js'));
    imports['./global-task-scripts.js'] = load(compile('./global-task-scripts.js'));
    imports['../../core/slash-command.js'] = load(slashCode);
    const api = load(runtimeCode);
    api.initTaskSettings();
    t.after(() => win.xbtaskreset());
    return {
        win, api, calls, downloads, timers, intervals, storage, emitter, event_types, manager, errors, warnings, liveSettings, extensions, host, get editor() { return editor; }, transport, requests,
        savedSettings: () => JSON.parse(savedSettings),
        waitForPermissions: () => Promise.all(permissionWrites),
        setFetch: fetch => { box.fetch = fetch; },
        getFetch: () => box.fetch,
        savedCharacter: avatar => savedCharacters.get(avatar),
        expireSave() {
            for (const [id, timer] of [...timers]) if (timer.delay === 5000) { timers.delete(id); timer.fn(...timer.args); }
        },
        popup: () => editorPopup,
        async ready() {
            win.__XB_TASKS_INITIALIZED__ = true;
            const initialization = api.beginPresetTaskInitialization();
            api.refreshPresetTasks({ initialize: true });
            emitter.emit(event_types.APP_READY);
            api.finishPresetTaskInitialization(initialization);
            await settle();
        },
        async importPreset(name, tasks, { save = async () => {}, fail = false } = {}) {
            const imported = { prompt_order: [{ character_id: 100000, order: [], xiaobai_ext: { scheduledTasks: tasks } }] };
            const importEvents = new HostEventEmitter();
            for (const listener of emitter.listeners(event_types.OAI_PRESET_IMPORT_READY)) {
                importEvents.on(event_types.OAI_PRESET_IMPORT_READY, listener);
            }
            await importEvents.emit(event_types.OAI_PRESET_IMPORT_READY, { data: imported, presetName: name });
            await save(name, imported);
            if (fail) return;
            if (data.has(name)) Object.assign(data.get(name), imported);
            else data.set(name, imported);
            selected = name; context.mainApi = 'openai';
            for (const handler of handlers) if (handler.selector === '#settings_preset_openai') handler.fn({});
            emitter.emit(event_types.OAI_PRESET_CHANGED_AFTER);
            emitter.emit(event_types.PRESET_CHANGED, { apiId: 'openai', name });
        },
        storedTasks: name => data.get(name)?.prompt_order[0].xiaobai_ext?.scheduledTasks,
        slash: imports['../../core/slash-command.js'].executeSlashCommand,
        async saveInEditor(task, scope, commands) {
            await api.showTaskEditor(task, true, scope);
            editor.find('.task_commands_edit').val(commands);
            await editorPopup.complete(1);
            if (editorPopup.closed) await editorCompletion;
        },
        flushRecords() {
            for (const [id, timer] of timers) if (timer.delay === 500) { timers.delete(id); timer.fn(...timer.args); }
        },
        setSlash(fn) { slash = fn; },
        preset(name, tasks) {
            data.set(name, { prompt_order: [{ character_id: 100000, order: [], xiaobai_ext: { scheduledTasks: tasks } }] });
            savedPresets.set(name, structuredClone(data.get(name)));
            if (name === selected) emitter.emit(event_types.PRESET_CHANGED, { apiId: 'openai', name });
        },
        global(task) { globals.push(task); scripts.set(task.id, task.commands); savedSettings = JSON.stringify({ extension_settings: extensions.extension_settings }); },
        character(task, avatar = 'test.png', index = 0) {
            host.this_chid = index;
            host.characters[index] = { avatar, data: { extensions: { 'xiaobaix-tasks': { tasks: [task] } } } };
            savedCharacters.set(avatar, structuredClone(host.characters[index]));
        },
        change(name, { mainApi = 'openai', dropdown = false } = {}) {
            selected = name;
            context.mainApi = mainApi;
            if (dropdown) {
                for (const handler of handlers) if (handler.selector === '#settings_preset_openai') handler.fn({});
            } else {
                emitter.emit(mainApi === 'openai' ? event_types.OAI_PRESET_CHANGED_AFTER : event_types.MAIN_API_CHANGED, { apiId: mainApi });
                if (mainApi === 'openai') emitter.emit(event_types.PRESET_CHANGED, { apiId: mainApi, name });
            }
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

const entered = (name, code = resident(name)) => ({ ...task(name, code), interval: 0, triggerTiming: 'chat_changed', x: { presetStart: true } });

test('preset writes serialize, preserve live switches and finish for the original preset after switching', async t => {
    const h = harness(t), first = deferred();
    h.preset('A', [task('panel', 'old')]); h.change('A');
    const sent = [];
    h.manager.savePreset = async (_name, value) => { sent.push(structuredClone(value)); if (sent.length === 1) await first.promise; };
    const one = h.win.XBTasks.setJS('panel', 'first', { scope: 'preset' }); await settle();
    const two = h.win.XBTasks.setJS('panel', 'second', { scope: 'preset' }); await settle();
    assert.equal(sent.length, 1);
    const liveOrder = h.liveSettings.prompt_order;
    liveOrder[0].order[0].enabled = false;
    first.resolve(); await Promise.all([one, two]);
    assert.equal(sent.length, 2);
    assert.equal(h.storedTasks('A')[0].commands, '<<taskjs>>second<</taskjs>>');
    assert.equal(h.liveSettings.prompt_order, liveOrder);
    assert.equal(liveOrder[0].order[0].enabled, false);
    const next = deferred(); h.manager.savePreset = async () => next.promise;
    const saving = h.win.XBTasks.setJS('panel', 'after-switch', { scope: 'preset' }); await settle();
    h.change('B'); next.resolve(); await saving;
    assert.equal(h.storedTasks('A')[0].commands, '<<taskjs>>after-switch<</taskjs>>');
    assert.equal(liveOrder[0].xiaobai_ext.scheduledTasks[0].commands, '<<taskjs>>second<</taskjs>>');
});

test('imported task definitions win over earlier saves, including identical imports', async t => {
    for (const replacement of ['removed', 'identical']) await t.test(replacement, async t => {
        const h = harness(t), gate = deferred();
        const original = task('panel', 'old');
        h.preset('A', [original]); h.change('A');
        h.manager.savePreset = async () => gate.promise;
        const pending = h.win.XBTasks.setJS('panel', 'stale-edit', { scope: 'preset' }); await settle();
        const importing = h.importPreset('A', replacement === 'removed' ? [] : [original]);
        h.change('B'); gate.resolve(); await pending; await importing;
        h.change('A');
        const tasks = await h.win.XBTasks.dump('preset');
        assert.equal(tasks.length, replacement === 'removed' ? 0 : 1);
        if (tasks.length) assert.equal(tasks[0].commands, original.commands);
        assert.equal(h.api.__taskRunMap.size, 0);
    });
});

test('external replacement cancels queued old saves, but a subsequent new edit still saves', async t => {
    const h = harness(t), gate = deferred();
    h.preset('A', [task('panel', 'old')]); h.change('A');
    const writes = [];
    h.manager.savePreset = async (_name, value) => { writes.push(structuredClone(value)); if (writes.length === 1) await gate.promise; };
    const one = h.win.XBTasks.setJS('panel', 'old-first', { scope: 'preset' }); await settle();
    const two = h.win.XBTasks.setJS('panel', 'old-queued', { scope: 'preset' });
    h.preset('A', [task('panel', 'imported')]);
    const latest = h.win.XBTasks.setJS('panel', 'new-edit', { scope: 'preset' });
    const outcomes = Promise.allSettled([one, two, latest]);
    gate.resolve();
    assert.deepEqual((await outcomes).map(result => result.status), ['rejected', 'rejected', 'fulfilled']);
    assert.equal(writes.length, 2);
    assert.equal(h.storedTasks('A')[0].commands, '<<taskjs>>new-edit<</taskjs>>');
    assert.equal((await h.win.XBTasks.dump('preset'))[0].commands, '<<taskjs>>new-edit<</taskjs>>');
});

test('failed preset save rejects without poisoning a later explicit save', async t => {
    const h = harness(t); h.preset('A', [task('panel', 'old')]); h.change('A');
    h.manager.savePreset = async () => { throw new Error('offline'); };
    await assert.rejects(h.win.XBTasks.setJS('panel', 'failed', { scope: 'preset' }), /offline/);
    assert.equal(h.storedTasks('A')[0].commands, '<<taskjs>>old<</taskjs>>');
    h.manager.savePreset = async () => {};
    await h.win.XBTasks.setJS('panel', 'success', { scope: 'preset' });
    assert.equal(h.storedTasks('A')[0].commands, '<<taskjs>>success<</taskjs>>');
});

test('failed preset saves discard pending cache copies after refresh or return', async t => {
    for (const refresh of ['host', 'return']) await t.test(refresh, async t => {
        const h = harness(t), gate = deferred();
        h.preset('A', [task('panel', 'window.starts.old = 1;')]); h.change('A');
        h.manager.savePreset = async () => { await gate.promise; throw new Error('offline'); };
        const saving = h.win.XBTasks.setJS('panel', 'window.starts.failed = 1;', { scope: 'preset' });
        const failed = assert.rejects(saving, /offline/);
        await settle();
        if (refresh === 'return') h.change('B');
        h.change('A');
        assert.match((await h.win.XBTasks.dump('preset'))[0].commands, /starts.old/);
        gate.resolve(); await failed;
        assert.match((await h.win.XBTasks.dump('preset'))[0].commands, /starts.old/);
        assert.match(h.storedTasks('A')[0].commands, /starts.old/);
        await h.api.checkAndExecuteTasks('plugin_initialized');
        assert.equal(h.win.starts.old, 1);
        assert.equal(h.win.starts.failed, undefined);
    });
});

test('an older preset failure reloads the newer pending edit, then drops it if it fails too', async t => {
    for (const latestFails of [false, true]) await t.test(String(latestFails), async t => {
        const h = harness(t), first = deferred(), second = deferred(), secondStarted = deferred();
        h.preset('A', [task('panel', 'old')]); h.change('A');
        let writes = 0;
        h.manager.savePreset = async () => {
            if (++writes === 1) { await first.promise; throw new Error('first failed'); }
            secondStarted.resolve();
            await second.promise;
            if (latestFails) throw new Error('latest failed');
        };
        const one = h.win.XBTasks.setJS('panel', 'first', { scope: 'preset' });
        const failed = assert.rejects(one, /first failed/); await settle();
        const two = h.win.XBTasks.setJS('panel', 'latest', { scope: 'preset' });
        const outcome = latestFails ? assert.rejects(two, /latest failed/) : two;
        h.change('B'); h.change('A');
        first.resolve(); await failed; await secondStarted.promise;
        assert.equal((await h.win.XBTasks.dump('preset'))[0].commands, '<<taskjs>>old<</taskjs>>');
        second.resolve(); await outcome;
        const expected = latestFails ? '<<taskjs>>old<</taskjs>>' : '<<taskjs>>latest<</taskjs>>';
        assert.equal((await h.win.XBTasks.dump('preset'))[0].commands, expected);
        assert.equal(h.storedTasks('A')[0].commands, expected);
    });
});

test('a failed save for an inactive preset leaves the active preset cache intact', async t => {
    const h = harness(t), gate = deferred();
    h.preset('A', [task('panel', 'old')]); h.preset('B', [task('other', 'keep')]); h.change('A');
    h.manager.savePreset = async () => { await gate.promise; throw new Error('offline'); };
    const saving = h.win.XBTasks.setJS('panel', 'failed', { scope: 'preset' });
    const failed = assert.rejects(saving, /offline/); await settle();
    h.change('B');
    const active = h.win.XBTasks.find('other', 'preset').task;
    gate.resolve(); await failed;
    assert.equal(h.win.XBTasks.find('other', 'preset').task, active);
    h.change('A');
    assert.equal((await h.win.XBTasks.dump('preset'))[0].commands, '<<taskjs>>old<</taskjs>>');
});

test('preset-start editor saves a legacy-readable timing without rewriting script or unrelated metadata', async t => {
    const h = harness(t);
    const original = { ...task('panel', 'old'), x: { authorNote: 'keep' } };
    h.preset('A', [original]); h.change('A');
    await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'preset').task, true, 'preset');
    const commands = '  <<taskjs>>\n// Keep whitespace and native startup code as written.\n<</taskjs>>  ';
    h.editor.find('.task_commands_edit').val(commands);
    h.editor.find('.task_interval_edit').val(0);
    h.editor.find('.task_trigger_timing_edit').val('preset_enter');
    h.editor.find('.task_trigger_timing_edit').fire('change');
    await h.popup().complete(1);
    const saved = h.storedTasks('A')[0];
    assert.equal(saved.triggerTiming, 'chat_changed');
    assert.equal(saved.interval, 1);
    assert.equal(saved.x.presetStart, true);
    assert.equal(saved.x.authorNote, 'keep');
    assert.equal(saved.commands, commands);
    assert.equal(h.win.XBTasks.list('preset')[0].timing, 'preset_enter');
    await h.api.exportSingleTask(0, 'preset');
    assert.deepEqual(h.downloads[0].tasks[0], JSON.parse(JSON.stringify(saved)));
    await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'preset').task, true, 'preset');
    assert.equal(h.editor.find('.task_trigger_timing_edit').val(), 'preset_enter');
    h.editor.find('.task_trigger_timing_edit').val('chat_changed');
    h.editor.find('.task_trigger_timing_edit').fire('change');
    await h.popup().complete(1);
    assert.equal(h.storedTasks('A')[0].x.presetStart, undefined);
    assert.equal(h.storedTasks('A')[0].x.authorNote, 'keep');
    assert.equal(h.win.XBTasks.list('preset')[0].timing, 'chat_changed');
});

test('preset-start API and standalone task import keep the same wire format', async t => {
    const h = harness(t);
    h.preset('A', [task('panel', 'old')]); h.change('A');
    await h.win.XBTasks.setProps('panel', { triggerTiming: 'preset_enter', interval: 0 }, 'preset');
    const saved = h.storedTasks('A')[0];
    assert.equal(saved.triggerTiming, 'chat_changed');
    assert.equal(saved.interval, 1);
    assert.equal(saved.x.presetStart, true);
    h.preset('B', []); h.change('B');
    await h.api.importGlobalTasks(JSON.stringify({ type: 'preset', tasks: [saved] }));
    assert.equal(h.storedTasks('B')[0].triggerTiming, 'chat_changed');
    assert.equal(h.storedTasks('B')[0].x.presetStart, true);
    assert.equal(h.win.XBTasks.list('preset')[0].timing, 'preset_enter');
    await h.win.XBTasks.setProps('panel', { triggerTiming: 'chat_changed' }, 'preset');
    assert.equal(h.storedTasks('B')[0].x.presetStart, undefined);
    assert.equal(h.win.XBTasks.list('preset')[0].timing, 'chat_changed');
});

test('saving or deleting an old preset editor target never stops the current same-name task', async t => {
    for (const operation of ['save', 'delete']) await t.test(operation, async t => {
        const h = harness(t), gate = deferred();
        h.preset('A', [task('panel', resident('A'), 'shared-id')]);
        h.preset('B', [task('panel', resident('B'), 'shared-id')]); h.change('A');
        let deleting;
        if (operation === 'save') await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'preset').task, true, 'preset');
        else {
            h.host.callPopup = () => gate.promise;
            deleting = h.api.deleteTask(0, 'preset');
            await settle();
        }
        h.change('B'); await h.win.xbqte('panel');
        if (operation === 'save') {
            h.editor.find('.task_commands_edit').val('new A code');
            await h.popup().complete(1);
            assert.equal(h.storedTasks('A')[0].commands, 'new A code');
        } else {
            gate.resolve(true); await deleting;
            assert.equal(h.storedTasks('A'), undefined);
        }
        assert.equal(h.win.signals.B.aborted, false);
        assert.equal(h.win.stops.B, undefined);
        assert.equal(h.storedTasks('B')[0].commands, task('panel', resident('B')).commands);
    });
});

// Exercise the production storage queue/cache against a deterministic server file.
function taskFile(initial) {
    let disk = structuredClone(initial);
    const uploads = [];
    const server = { failUpload: false, loseReceipt: false, reads: 0 };
    const storage = new StorageFile('tasks-test.json', { fetch: async (url, options) => {
        if (url.startsWith('/user/files/')) { server.reads++; return { ok: true, text: async () => JSON.stringify(disk) }; }
        assert.equal(url, '/api/files/upload');
        assert.equal(options.signal.aborted, false);
        if (server.failUpload) return { ok: false, status: 503 };
        disk = JSON.parse(Buffer.from(JSON.parse(options.body).data, 'base64').toString('utf8'));
        uploads.push(structuredClone(disk));
        if (server.loseReceipt) throw new TypeError('upload receipt lost');
        return { ok: true };
    } });
    return { storage, server, uploads, read: () => structuredClone(disk) };
}


test('normal saves use write receipts without readback and keep task identity and exact content', async t => {
    for (const scope of ['global', 'character', 'preset']) await t.test(scope, async t => {
        const h = harness(t);
        const original = { ...task('panel', 'old'), disabled: true, interval: 4 };
        if (scope === 'preset') { h.preset('A', [original]); h.change('A'); }
        else h[scope](original);
        await h.api.showTaskEditor(h.win.XBTasks.find('panel', scope).task, true, scope);
        h.editor.find('.task_name_edit').val('renamed');
        h.editor.find('.task_commands_edit').val('\n new code \t');
        h.editor.find('.task_enabled_edit').prop('checked', true);
        h.editor.find('.task_interval_edit').val(7);
        await h.popup().complete(1);
        assert.equal(h.popup().closed, true);
        assert.equal(h.requests.some(url => url.endsWith('/get')), false);
        const saved = (await h.win.XBTasks.dump(scope))[0];
        assert.equal(saved.id, original.id);
        assert.equal(saved.commands, '\n new code \t');
        assert.equal(saved.name, 'renamed');
        assert.equal(saved.disabled, false);
        assert.equal(saved.interval, 7);
        if (scope === 'global') {
            const metadata = h.savedSettings().extension_settings.test.tasks.globalTasks[0];
            assert.equal(await h.storage.getStrict(metadata.scriptId), saved.commands);
            assert.equal(saved.scriptId, undefined);
        }
    });
});

test('failed script or metadata writes preserve the running old task and retry reuses one candidate', async t => {
    for (const failure of ['script', 'settings']) await t.test(failure, async t => {
        const file = taskFile({ panel: task('panel', resident('old')).commands });
        const h = harness(t, { taskStorage: file.storage });
        h.global(task('panel', resident('old')));
        await h.win.XBTasks.exec('panel');
        const originalFetch = h.getFetch();
        if (failure === 'script') file.server.failUpload = true;
        else h.setFetch((url, options) => url === '/api/settings/save' ? Promise.resolve(Response.json({ error: true })) : originalFetch(url, options));
        await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'global').task, true, 'global');
        h.editor.find('.task_name_edit').val('renamed');
        h.editor.find('.task_commands_edit').val('new code');
        await h.popup().complete(1);
        assert.equal(h.popup().closed, false);
        assert.equal(h.win.signals.old.aborted, false);
        assert.equal((await h.win.XBTasks.dump('global'))[0].name, 'panel');
        assert.equal(file.read().panel, task('panel', resident('old')).commands);
        const candidateIds = Object.keys(file.read()).filter(id => id !== 'panel');
        file.server.failUpload = false;
        h.setFetch(originalFetch);
        await h.popup().complete(1);
        assert.equal(h.popup().closed, true);
        assert.equal(h.win.signals.old.aborted, true);
        const saved = h.savedSettings().extension_settings.test.tasks.globalTasks;
        assert.equal(saved.length, 1);
        assert.equal(saved[0].id, 'panel');
        if (candidateIds.length) assert.equal(saved[0].scriptId, candidateIds[0]);
        assert.equal(file.read()[saved[0].scriptId], 'new code');
    });
});

test('lost settings receipt recovers once, without rolling back a server commit', async t => {
    for (const readFails of [false, true]) await t.test(String(readFails), async t => {
        const file = taskFile({ panel: 'old code' });
        const h = harness(t, { taskStorage: file.storage });
        h.global({ ...task('panel', ''), commands: 'old code' });
        const fetch = h.getFetch(); let reads = 0, candidate;
        h.setFetch(async (url, options) => {
            if (url === '/api/settings/save') {
                candidate = JSON.parse(options.body).extension_settings.test.tasks.globalTasks[0].scriptId;
                await fetch(url, options); throw new TypeError('receipt lost');
            }
            if (url === '/api/settings/get') { reads++; if (readFails) throw new TypeError('offline'); }
            return fetch(url, options);
        });
        await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'global').task, true, 'global');
        h.editor.find('.task_commands_edit').val('new code');
        await h.popup().complete(1);
        assert.equal(reads, 1);
        assert.equal(h.popup().closed, !readFails);
        assert.equal(h.savedSettings().extension_settings.test.tasks.globalTasks[0].scriptId, candidate);
        assert.equal(file.read()[candidate], 'new code');
        if (readFails) {
            assert.equal(file.read().panel, 'old code');
            assert.equal((await h.win.XBTasks.dump('global'))[0].commands, 'old code');
            h.setFetch(fetch);
            await h.popup().complete(1);
            assert.equal(h.popup().closed, true);
            assert.equal(h.savedSettings().extension_settings.test.tasks.globalTasks[0].scriptId, candidate);
        }
    });
});

test('pending global metadata is not executable, and closing cannot affect a newer editor', async t => {
    const h = harness(t), gate = deferred(), entered = deferred();
    h.global(task('panel', resident('old'))); h.global(task('other', 'old'));
    await h.win.XBTasks.exec('panel');
    const fetch = h.getFetch();
    h.setFetch(async (url, options) => {
        if (url === '/api/settings/save') { entered.resolve(); await gate.promise; }
        return fetch(url, options);
    });
    await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'global').task, true, 'global');
    h.editor.find('.task_commands_edit').val('new code');
    h.editor.find('.task_name_edit').val('renamed');
    const first = h.popup(), pending = first.complete(1);
    await entered.promise;
    assert.equal(h.win.XBTasks.find('renamed', 'global'), null);
    assert.equal(h.win.signals.old.aborted, false);
    await first.complete(1);
    await first.complete(0);
    assert.equal(first.closed, true);
    await h.api.showTaskEditor(h.win.XBTasks.find('other', 'global').task, true, 'global');
    const second = h.popup();
    h.editor.find('.task_commands_edit').val('unsaved other input');
    gate.resolve(); await pending;
    assert.equal(second.closed, false);
    assert.equal(h.api.state.currentEditingId, 'other');
    assert.equal(h.editor.find('.task_commands_edit').val(), 'unsaved other input');
    assert.equal(h.win.signals.old.aborted, true);
});

test('permission preferences never join the content save queue', async t => {
    const h = harness(t), permission = deferred();
    let permissionWrites = 0;
    h.host.saveSettingsDebounced = () => { permissionWrites++; permission.promise.catch(error => h.errors.push(error)); };
    h.character(task('card', 'old')); h.global(task('global', 'old')); h.preset('A', [task('preset', 'old')]); h.change('A');
    await h.saveInEditor(h.win.XBTasks.find('card', 'character').task, 'character', 'card edit');
    assert.equal(h.popup().closed, true);
    assert.equal(permissionWrites, 1);
    for (const [name, scope] of [['global', 'global'], ['preset', 'preset'], ['card', 'character']]) {
        await h.saveInEditor(h.win.XBTasks.find(name, scope).task, scope, 'edited again');
        assert.equal(h.popup().closed, true);
    }
    assert.equal(permissionWrites, 1);
    permission.resolve();
});

test('character and preset write failures preserve the old instance; retry commits exactly once', async t => {
    for (const scope of ['character', 'preset']) await t.test(scope, async t => {
        const h = harness(t), original = task('panel', resident('old'));
        if (scope === 'character') h.character(original);
        else { h.preset('A', [original]); h.change('A'); }
        await h.win.XBTasks.exec('panel');
        const fetch = h.getFetch(), endpoint = scope === 'character' ? '/api/characters/merge-attributes' : '/api/presets/save';
        h.setFetch((url, options) => url === endpoint ? Promise.resolve(Response.json({}, { status: 503 })) : fetch(url, options));
        await h.saveInEditor(h.win.XBTasks.find('panel', scope).task, scope, 'replacement');
        assert.equal(h.popup().closed, false);
        assert.equal(h.win.signals.old.aborted, false);
        assert.equal((await h.win.XBTasks.dump(scope))[0].commands, original.commands);
        assert.equal(h.requests.some(url => url.endsWith('/get')), false);
        h.setFetch(fetch); await h.popup().complete(1);
        assert.equal(h.popup().closed, true);
        assert.equal(h.win.signals.old.aborted, true);
        const saved = await h.win.XBTasks.dump(scope);
        assert.equal(saved.length, 1);
        assert.equal(saved[0].id, original.id);
        assert.equal(saved[0].commands, 'replacement');
    });
});

test('character and preset lost receipts reconcile only their task field once', async t => {
    for (const scope of ['character', 'preset']) await t.test(scope, async t => {
        const h = harness(t), original = task('panel', 'old');
        if (scope === 'character') h.character(original);
        else { h.preset('A', [original]); h.change('A'); }
        const fetch = h.getFetch(), endpoint = scope === 'character' ? '/api/characters/merge-attributes' : '/api/presets/save';
        h.setFetch(async (url, options) => {
            const result = await fetch(url, options);
            if (url === endpoint) { h.liveSettings.temperature = 0.85; throw new TypeError('receipt lost'); }
            return result;
        });
        await h.saveInEditor(h.win.XBTasks.find('panel', scope).task, scope, 'replacement');
        assert.equal(h.popup().closed, true);
        assert.equal((await h.win.XBTasks.dump(scope))[0].commands, 'replacement');
        assert.equal(h.requests.filter(url => url.endsWith('/get')).length, 1);
        assert.equal(h.liveSettings.temperature, 0.85);
    });
});

test('an unrelated queued API edit does not publish a failed global editor draft', async t => {
    const h = harness(t), entered = deferred(), gate = deferred();
    h.global(task('panel', 'old')); h.global(task('other', resident('other')));
    await h.win.XBTasks.exec('other');
    const fetch = h.getFetch(); let writes = 0;
    h.setFetch(async (url, options) => {
        if (url === '/api/settings/save' && ++writes === 1) {
            entered.resolve(); await gate.promise;
            return Response.json({ error: true });
        }
        return fetch(url, options);
    });
    await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'global').task, true, 'global');
    h.editor.find('.task_name_edit').val('failed name');
    const saving = h.popup().complete(1); await entered.promise;
    const queued = h.win.XBTasks.setCommands('other', 'other updated', { scope: 'global' });
    assert.equal(h.win.signals.other.aborted, false);
    gate.resolve(); await saving; await queued;
    const saved = await h.win.XBTasks.dump('global');
    assert.equal(saved.length, 2);
    assert.equal(saved.find(item => item.id === 'panel').name, 'panel');
    assert.equal(saved.find(item => item.id === 'other').commands, 'other updated');
    assert.equal(h.win.signals.other.aborted, true);
});

test('a lost script upload receipt is recovered without overwriting the original script', async t => {
    const file = taskFile({ panel: 'old code' });
    const h = harness(t, { taskStorage: file.storage });
    h.global({ ...task('panel', ''), commands: 'old code' });
    file.server.loseReceipt = true;
    await h.saveInEditor(h.win.XBTasks.find('panel', 'global').task, 'global', 'new code');
    assert.equal(h.popup().closed, true);
    const saved = h.savedSettings().extension_settings.test.tasks.globalTasks[0];
    assert.equal(file.read()[saved.scriptId], 'new code');
    assert.equal(file.uploads[0].panel, 'old code');
    assert.equal(file.server.reads, 2); // initial load and one uncertain-upload read
});

test('script cleanup failure does not undo success or poison the next task save', async t => {
    const file = taskFile({ panel: 'old code', other: 'other old' });
    const h = harness(t, { taskStorage: file.storage });
    h.global({ ...task('panel', ''), commands: 'old code' });
    h.global({ ...task('other', ''), commands: 'other old' });
    const fetch = h.getFetch();
    h.setFetch(async (url, options) => {
        const result = await fetch(url, options);
        if (url === '/api/settings/save') file.server.failUpload = true;
        return result;
    });
    await h.saveInEditor(h.win.XBTasks.find('panel', 'global').task, 'global', 'new code');
    assert.equal(h.popup().closed, true);
    await file.storage.waitForQueuedWrites();
    assert.equal((await h.win.XBTasks.dump('global'))[0].commands, 'new code');
    file.server.failUpload = false; h.setFetch(fetch);
    await h.win.XBTasks.setCommands('other', 'other new', { scope: 'global' });
    assert.equal((await h.win.XBTasks.dump('global')).find(item => item.id === 'other').commands, 'other new');
});

test('a refused preset save keeps its editor open rather than reporting success', async t => {
    const h = harness(t), gate = deferred();
    h.preset('A', [task('panel', 'old')]); h.change('A');
    h.manager.savePreset = () => gate.promise;
    await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'preset').task, true, 'preset');
    h.editor.find('.task_commands_edit').val('new');
    const pending = h.popup().complete(1); await settle();
    h.preset('A', [task('panel', 'replacement')]);
    gate.resolve(); await pending;
    assert.equal(h.popup().closed, false);
    assert.equal(h.popup().dlg.querySelector('[role="alert"]').hidden, false);
    assert.equal(h.storedTasks('A')[0].commands, '<<taskjs>>replacement<</taskjs>>');
});

test('moving a task keeps its source when the destination save fails', async t => {
    const h = harness(t);
    h.global(task('panel', 'original'));
    h.preset('A', []); h.change('A');
    h.manager.savePreset = async () => { throw new Error('offline'); };
    await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'global').task, true, 'global');
    h.editor.find('.task_type_edit').val('preset');
    await h.popup().complete(1);
    assert.equal(h.popup().closed, false);
    assert.equal((await h.win.XBTasks.dump('global'))[0].commands, '<<taskjs>>original<</taskjs>>');
    h.manager.savePreset = async () => {};
    await h.popup().complete(1);
    assert.equal(h.popup().closed, true);
    assert.equal((await h.win.XBTasks.dump('global')).length, 0);
    assert.equal((await h.win.XBTasks.dump('preset')).length, 1);
});

test('ordinary preset edits do not cancel queued task saves or get overwritten', async t => {
    const h = harness(t), gate = deferred();
    h.preset('A', [task('panel', 'old')]); h.change('A');
    const sent = [];
    h.manager.savePreset = async (_name, value) => { sent.push(structuredClone(value)); if (sent.length === 1) await gate.promise; };
    const one = h.win.XBTasks.setJS('panel', 'first', { scope: 'preset' }); await settle();
    const two = h.win.XBTasks.setJS('panel', 'latest', { scope: 'preset' });
    const source = h.manager.getCompletionPresetByName('A');
    source.temperature = 0.75;
    source.prompt_order[0].order = [{ identifier: 'style', enabled: false }];
    const results = Promise.allSettled([one, two]);
    gate.resolve();
    assert.deepEqual((await results).map(result => result.status), ['fulfilled', 'fulfilled']);
    assert.equal(sent.length, 2);
    assert.equal(sent[1].temperature, 0.75);
    assert.equal(sent[1].prompt_order[0].order[0].enabled, false);
    assert.equal(h.storedTasks('A')[0].commands, '<<taskjs>>latest<</taskjs>>');
});

test('failed source deletion can be retried even after its local list lost the task', async t => {
    const h = harness(t);
    h.character(task('panel', 'original'));
    let attempts = 0;
    const original = h.transport.character;
    h.transport.character = async (avatar, data) => {
        if (!data.extensions['xiaobaix-tasks'].tasks.length && ++attempts === 1) {
            h.host.characters[0].data.extensions['xiaobaix-tasks'] = { tasks: [] };
            throw new Error('source delete failed');
        }
        return original(avatar, data);
    };
    await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'character').task, true, 'character');
    h.editor.find('.task_type_edit').val('global');
    await h.popup().complete(1);
    assert.equal(h.popup().closed, false);
    await h.popup().complete(1);
    assert.equal(h.popup().closed, true);
    assert.equal(attempts, 2);
    assert.equal(h.savedCharacter('test.png').data.extensions['xiaobaix-tasks'].tasks.length, 0);
});

test('changing the target back after partial migration removes the previous destination', async t => {
    const h = harness(t);
    h.global(task('panel', 'original')); h.preset('A', []); h.change('A');
    await h.host.saveSettings();
    const original = h.host.saveSettings;
    h.host.saveSettings = async () => { throw new Error('offline'); };
    await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'global').task, true, 'global');
    h.editor.find('.task_type_edit').val('preset');
    await h.popup().complete(1);
    assert.equal(h.popup().closed, false);
    assert.equal(h.storedTasks('A').length, 1);
    h.host.saveSettings = original;
    h.editor.find('.task_type_edit').val('global');
    await h.popup().complete(1);
    assert.equal(h.popup().closed, true);
    assert.equal((await h.win.XBTasks.dump('preset')).length, 0);
    assert.equal((await h.win.XBTasks.dump('global')).length, 1);
});

test('character failures preserve both local representations and retry publishes only task fields', async t => {
    const h = harness(t);
    h.character(task('panel', 'original'));
    const character = h.host.characters[0];
    character.data.extensions.other = { keep: true };
    character.json_data = JSON.stringify({ data: structuredClone(character.data), description: 'keep' });
    const before = JSON.stringify(character);
    const original = h.transport.character;
    h.transport.character = async () => { throw new Error('offline'); };
    await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'character').task, true, 'character');
    h.editor.find('.task_commands_edit').val('changed');
    await h.popup().complete(1);
    assert.equal(h.popup().closed, false);
    assert.equal(JSON.stringify(character), before);
    h.transport.character = original;
    await h.popup().complete(1);
    assert.equal(h.popup().closed, true);
    assert.equal(character.data.extensions['xiaobaix-tasks'].tasks[0].commands, 'changed');
    const json = JSON.parse(character.json_data);
    assert.equal(json.data.extensions['xiaobaix-tasks'].tasks[0].commands, 'changed');
    assert.equal(json.data.extensions.other.keep, true);
    assert.equal(json.description, 'keep');
});


test('request deadlines allow one fresh reconciliation, then preserve the editor for retry', async t => {
    const h = harness(t), gate = deferred(), entered = deferred();
    h.global(task('panel', 'old'));
    const fetch = h.getFetch();
    h.setFetch(async (url, options) => {
        if (url === '/api/settings/save') { entered.resolve(); await gate.promise; }
        return fetch(url, options);
    });
    await h.api.showTaskEditor(h.win.XBTasks.find('panel', 'global').task, true, 'global');
    h.editor.find('.task_commands_edit').val('new');
    const saving = h.popup().complete(1);
    await entered.promise; h.expireSave(); await saving;
    assert.equal(h.popup().closed, false);
    assert.equal(h.popup().dlg.querySelector('[role="alert"]').hidden, false);
    assert.equal(h.requests.filter(url => url === '/api/settings/get').length, 1);
    gate.resolve(); await settle();
    assert.equal((await h.win.XBTasks.dump('global'))[0].commands, task('panel', 'old').commands);
    h.setFetch(fetch); await h.popup().complete(1);
    assert.equal(h.popup().closed, true);
});

test('host replacement or deletion cancels a queued task save explicitly', async t => {
    for (const deleted of [false, true]) await t.test(String(deleted), async t => {
        const h = harness(t), gate = deferred();
        h.preset('A', [task('panel', 'original')]); h.change('A');
        h.manager.savePreset = () => gate.promise;
        const pending = h.win.XBTasks.setJS('panel', 'new', { scope: 'preset' }); await settle();
        const replacement = structuredClone(h.manager.getCompletionPresetByName('A'));
        replacement.temperature = 0.25;
        h.manager.getCompletionPresetByName = () => replacement;
        if (deleted) h.emitter.emit(h.event_types.PRESET_DELETED, { apiId: 'openai', name: 'A' });
        const result = Promise.allSettled([pending]);
        gate.resolve();
        assert.equal((await result)[0].status, 'rejected');
        assert.equal(replacement.prompt_order[0].xiaobai_ext.scheduledTasks[0].commands, '<<taskjs>>original<</taskjs>>');
        assert.equal(replacement.temperature, 0.25);
    });
});

test('a missing preset cannot be recreated from the host current-settings fallback', async t => {
    const h = harness(t), gate = deferred();
    h.preset('A', [task('panel', 'original')]); h.change('A');
    let sends = 0;
    h.manager.savePreset = async () => { sends++; await gate.promise; };
    const first = h.win.XBTasks.setJS('panel', 'first', { scope: 'preset' }); await settle();
    const second = h.win.XBTasks.setJS('panel', 'queued', { scope: 'preset' });
    // The host removes it from its list before its delete request completes.
    h.manager.getCompletionPresetByName = () => null;
    h.manager.getPresetSettings = () => ({ temperature: 0.8 });
    const results = Promise.allSettled([first, second]);
    gate.resolve();
    assert.deepEqual((await results).map(result => result.status), ['rejected', 'rejected']);
    assert.equal(sends, 1);
});

test('host import writes last after all earlier queued task saves have settled', async t => {
    const h = harness(t), first = deferred(), second = deferred();
    h.preset('A', [task('panel', 'old')]); h.change('A');
    const disk = presetFile(t);
    const receipts = [];
    h.manager.savePreset = async (_name, value) => {
        disk.write(value); receipts.push('task-save');
        await (receipts.length === 1 ? first.promise : second.promise);
    };
    const one = h.win.XBTasks.setJS('panel', 'edit-one', { scope: 'preset' }); await settle();
    const two = h.win.XBTasks.setJS('panel', 'edit-two', { scope: 'preset' }); await settle();
    const importing = h.importPreset('A', [task('panel', 'imported')], { save: async (_name, value) => {
        disk.write(value); receipts.push('import');
    } });
    await settle(); assert.deepEqual(receipts, ['task-save']);
    first.resolve(); await one; await settle();
    assert.deepEqual(receipts, ['task-save', 'task-save']);
    // This edit joined during the import's preflight wait and must also settle first.
    const three = h.win.XBTasks.setJS('panel', 'edit-three', { scope: 'preset' });
    second.resolve(); await Promise.all([two, three, importing]);
    assert.deepEqual(receipts, ['task-save', 'task-save', 'task-save', 'import']);
    assert.equal(disk.read().prompt_order[0].xiaobai_ext.scheduledTasks[0].commands, '<<taskjs>>imported<</taskjs>>');
    assert.equal((await h.win.XBTasks.dump('preset'))[0].commands, '<<taskjs>>imported<</taskjs>>');
});

test('failed import preserves queued edits, while another preset import is not blocked', async t => {
    const h = harness(t), saved = deferred();
    h.preset('A', [task('panel', 'old')]); h.preset('B', []); h.change('A');
    let disk;
    h.manager.savePreset = async (_name, value) => { disk = structuredClone(value); await saved.promise; };
    const editing = h.win.XBTasks.setJS('panel', 'edited', { scope: 'preset' }); await settle();
    await h.importPreset('B', []);
    const failedImport = h.importPreset('A', [task('panel', 'unwritten')], { fail: true });
    saved.resolve(); await editing; await failedImport;
    h.change('A');
    assert.equal(disk.prompt_order[0].xiaobai_ext.scheduledTasks[0].commands, '<<taskjs>>edited<</taskjs>>');
    assert.equal((await h.win.XBTasks.dump('preset'))[0].commands, '<<taskjs>>edited<</taskjs>>');
    h.manager.savePreset = async () => {};
    await h.win.XBTasks.setJS('panel', 'retry', { scope: 'preset' });
    assert.equal(h.storedTasks('A')[0].commands, '<<taskjs>>retry<</taskjs>>');
});

test('opted-in entry waits for readiness, starts once, stops on exit and starts anew on return', async t => {
    const h = harness(t);
    h.preset('A', [entered('A'), task('legacy-init', resident('legacy')), { ...task('manual', resident('manual')), interval: 0, triggerTiming: 'after_ai' }]);
    h.preset('B', [entered('B')]); h.change('A'); await settle();
    assert.equal(h.win.starts.A, undefined);
    await h.ready();
    assert.equal(h.win.starts.A, 1);
    assert.equal(h.win.starts.legacy, undefined); assert.equal(h.win.starts.manual, undefined);
    h.change('A'); h.emitter.emit(h.event_types.PRESET_CHANGED, { apiId: 'openai' });
    await settle(); assert.equal(h.win.starts.A, 1);
    h.change('B'); h.flushRecords(); await settle();
    assert.equal(h.win.stops.A, 1); assert.equal(h.win.starts.B, 1);
    h.change('A'); h.flushRecords(); await settle();
    assert.equal(h.win.stops.B, 1); assert.equal(h.win.starts.A, 2);
    h.change('A', { mainApi: 'textgenerationwebui' });
    assert.equal(h.win.stops.A, 2);
    h.change('A'); h.flushRecords(); await settle(); assert.equal(h.win.starts.A, 3);
});

test('same-name completed import replaces the instance once; a failed import does nothing', async t => {
    const h = harness(t); h.preset('A', [entered('panel', resident('old'))]); h.change('A'); await h.ready(); h.flushRecords();
    await h.importPreset('A', [entered('panel', resident('new'))], { fail: true });
    h.change('A'); await settle();
    assert.equal(h.win.stops.old, undefined); assert.equal(h.win.starts.new, undefined);
    await h.importPreset('A', [entered('panel', resident('new'))]); h.flushRecords(); await settle();
    assert.equal(h.win.stops.old, 1); assert.equal(h.win.starts.new, 1);
    assert.equal(h.api.__taskRunMap.size, 1);
    h.change('A'); await settle(); assert.equal(h.win.starts.new, 1);
    await h.importPreset('A', [entered('panel', resident('new'))]); h.flushRecords(); await settle();
    assert.equal(h.win.stops.new, 1); assert.equal(h.win.starts.new, 2);
});

test('entry waits for host work and old async cleanup, then loads current task configuration', async t => {
    const h = harness(t), gate = deferred(), cleanup = deferred();
    h.win.cleanupGate = cleanup.promise;
    h.preset('A', [entered('A', resident('A') + 'onCleanup(() => window.cleanupGate);')]);
    h.preset('B', [entered('B', resident('old-B'))]); h.change('A'); await h.ready(); h.flushRecords();
    h.setSlash(async () => gate.promise);
    h.global({ ...task('host', ''), commands: '/wait' });
    const hostWork = h.win.XBTasks.exec('host'); await settle();
    h.change('B'); await settle(); assert.equal(h.win.starts['old-B'], undefined);
    await h.win.XBTasks.setJS('B', resident('new-B'), { scope: 'preset' });
    gate.resolve(); await hostWork; h.flushRecords(); await settle();
    assert.equal(h.win.starts['new-B'], undefined);
    cleanup.resolve(); await settle(); h.flushRecords(); await settle();
    assert.equal(h.win.starts['old-B'], undefined); assert.equal(h.win.starts['new-B'], 1);
    assert.equal(h.api.__taskRunMap.size, 1);
});

test('pending entry cannot start deleted/disabled tasks, or restart after reset/exit', async t => {
    for (const action of ['delete', 'disable', 'reset', 'exit']) await t.test(action, async t => {
        const h = harness(t), gate = deferred();
        h.setSlash(async () => gate.promise);
        h.global({ ...task('busy', ''), commands: '/wait' });
        const busy = h.win.XBTasks.exec('busy'); await settle();
        h.preset('A', [entered('panel')]); h.change('A'); await h.ready();
        if (action === 'delete') await h.api.deleteTask(0, 'preset');
        if (action === 'disable') await h.win.XBTasks.setProps('panel', { disabled: true }, 'preset');
        const resetting = action === 'reset' ? h.win.xbtaskreset() : null;
        if (action === 'exit') h.change('B');
        gate.resolve(); await busy; await resetting; h.flushRecords(); await settle();
        assert.equal(h.win.starts.panel, undefined);
        if (action === 'reset') { h.change('A'); await settle(); assert.equal(h.win.starts.panel, undefined); }
    });
});

test('preset selected after APP_READY starts without requiring a different chat', async t => {
    const h = harness(t); h.change(''); await h.ready();
    h.preset('A', [entered('late')]); h.change('A'); await settle();
    assert.equal(h.win.starts.late, 1);
});

test('preset entry waits for matching host application and never steals legacy initialization', async t => {
    const h = harness(t), gate = deferred(); h.win.gate = gate.promise;
    h.global(task('legacy', 'await window.gate; window.starts.legacy = 1;'));
    h.preset('A', [entered('A')]); h.preset('B', [entered('B')]);
    h.win.__XB_TASKS_INITIALIZED__ = true;
    const initialization = h.api.beginPresetTaskInitialization();
    h.emitter.emit(h.event_types.APP_READY); h.api.refreshPresetTasks({ initialize: true }); await settle();
    assert.equal(h.win.starts.A, undefined);
    const legacy = h.api.checkAndExecuteTasks('plugin_initialized'); await settle();
    gate.resolve(); await legacy; h.api.finishPresetTaskInitialization(initialization); h.flushRecords(); await settle();
    assert.equal(h.win.starts.legacy, 1); assert.equal(h.win.starts.A, 1);
    h.change('B', { dropdown: true }); h.flushRecords(); await settle();
    assert.equal(h.win.stops.A, 1); assert.equal(h.win.starts.B, undefined);
    h.emitter.emit(h.event_types.PRESET_CHANGED, { apiId: 'openai', name: 'A' }); await settle();
    assert.equal(h.win.starts.B, undefined);
    h.emitter.emit(h.event_types.PRESET_CHANGED, { apiId: 'openai', name: 'B' }); await settle();
    assert.equal(h.win.starts.B, 1);
});

test('a previous module initialization cannot release entry waiting on the new initialization', async t => {
    const h = harness(t); h.preset('A', [entered('panel')]);
    h.win.__XB_TASKS_INITIALIZED__ = true;
    const old = h.api.beginPresetTaskInitialization();
    const current = h.api.beginPresetTaskInitialization();
    h.api.refreshPresetTasks({ initialize: true }); h.emitter.emit(h.event_types.APP_READY);
    h.api.finishPresetTaskInitialization(old); await settle();
    assert.equal(h.win.starts.panel, undefined);
    h.api.finishPresetTaskInitialization(current); await settle();
    assert.equal(h.win.starts.panel, 1);
});

test('deleting the final task while entry is waiting takes effect before its save returns', async t => {
    const h = harness(t), busy = deferred(), saved = deferred();
    h.setSlash(() => busy.promise); h.global({ ...task('busy', ''), commands: '/wait' });
    const work = h.win.XBTasks.exec('busy'); await settle();
    h.preset('A', [entered('panel')]); h.change('A'); await h.ready();
    h.manager.savePreset = () => saved.promise;
    const deleting = h.api.deleteTask(0, 'preset'); await settle();
    busy.resolve(); await work; h.flushRecords(); await settle();
    const starts = h.win.starts.panel;
    saved.resolve(); await deleting;
    assert.equal(starts, undefined);
});

test('preset apply notifications cannot replace pending deletion, disable or script edits with the stored version', async t => {
    for (const action of ['delete', 'disable', 'edit']) await t.test(action, async t => {
        const h = harness(t), saved = deferred();
        h.preset('A', [entered('panel', resident('old'))]); h.preset('B', []);
        h.change('B'); await h.ready(); h.change('A', { dropdown: true });
        h.manager.savePreset = () => saved.promise;
        const edit = action === 'delete' ? h.api.deleteTask(0, 'preset')
            : action === 'disable' ? h.win.XBTasks.setProps('panel', { disabled: true }, 'preset')
                : h.win.XBTasks.setJS('panel', resident('new'), { scope: 'preset' });
        await settle();
        h.emitter.emit(h.event_types.OAI_PRESET_CHANGED_AFTER);
        h.emitter.emit(h.event_types.PRESET_CHANGED, { apiId: 'openai', name: 'A' });
        await settle();
        assert.equal(h.win.starts.old || 0, action === 'edit' ? 1 : 0);
        assert.equal(h.win.starts.new, undefined);
        saved.resolve(); await edit;
        const tasks = await h.win.XBTasks.dump('preset');
        assert.equal(tasks.length, action === 'delete' ? 0 : 1);
        if (action === 'disable') assert.equal(tasks[0].disabled, true);
        if (action === 'edit') assert.ok(tasks[0].commands.includes('"new"'));
        assert.equal(h.api.__taskRunMap.size, 0);
    });
});

test('leaving and returning while deletion saves still reads the pending empty list', async t => {
    const h = harness(t), saved = deferred();
    h.preset('A', [entered('panel')]); h.preset('B', []); h.change('B'); await h.ready();
    h.change('A', { dropdown: true }); h.manager.savePreset = () => saved.promise;
    const deleting = h.api.deleteTask(0, 'preset'); await settle();
    h.change('B'); h.change('A'); await settle();
    assert.equal((await h.win.XBTasks.dump('preset')).length, 0);
    assert.equal(h.win.starts.panel, undefined);
    saved.resolve(); await deleting;
    assert.equal(h.storedTasks('A'), undefined);
});


test('next entry task uses current definition after an earlier startup awaits', async t => {
    const h = harness(t), gate = deferred(); h.win.gate = gate.promise;
    h.preset('A', [entered('first', 'await window.gate;'), entered('second', resident('old'))]);
    h.change('A'); await h.ready();
    await h.win.XBTasks.setJS('second', resident('new'), { scope: 'preset' });
    gate.resolve(); await settle(); h.flushRecords(); await settle();
    assert.equal(h.win.starts.old, undefined); assert.equal(h.win.starts.new, 1);
});

test('detached panel startup and native clicks survive body return without locking unrelated tasks', async t => {
    const h = harness(t), gate = deferred();
    h.win.gate = gate.promise;
    h.preset('A', [task('panel', `
        window.signal = abortSignal;
        window.ready = (async () => {
            await window.gate;
            const button = document.createElement('button'); button.id = 'native-panel';
            button.addEventListener('click', () => { window.clicked = STscript('/run'); });
            document.body.append(button);
            window.output = await STscript('/read');
        })();
    `), { ...task('other', 'window.otherRan = true;'), triggerTiming: 'after_ai' }]);
    h.setSlash(async command => { h.calls.push(command); return { pipe: 'saved-output' }; });
    await h.win.xbqte('panel'); h.flushRecords();
    assert.equal(h.win.signal.aborted, false);
    assert.equal(h.api.state.executingRecords.size, 0);
    await h.api.checkAndExecuteTasks('after_ai'); h.flushRecords();
    assert.equal(h.win.otherRan, true);
    gate.resolve(); await h.win.ready;
    assert.equal(h.win.output, 'saved-output');
    const button = h.win.document.getElementById('native-panel');
    button.click(); await h.win.clicked;
    button.click(); await h.win.clicked;
    h.flushRecords();
    assert.deepEqual(h.calls, ['/read', '/run', '/run']);
    assert.equal(h.api.state.executingRecords.size, 0);
    h.change('B');
    button.click(); await h.win.clicked;
    assert.deepEqual(h.calls, ['/read', '/run', '/run']);
    assert.equal(h.win.signal.aborted, true);
    assert.equal(h.api.__taskRunMap.size, 0);
});

test('returned task capabilities remain usable until replacement or reset, without accumulating instances', async t => {
    const h = harness(t);
    h.global(task('capability', 'return { signal: abortSignal, run: STscript };'));
    let previous;
    for (let i = 0; i < 5; i++) {
        const current = await h.win.XBTasks.exec('capability');
        if (previous) {
            assert.equal(previous.signal.aborted, true);
            await previous.run('/stale');
        }
        assert.equal(current.signal.aborted, false);
        await current.run('/current');
        assert.equal(h.api.__taskRunMap.size, 1);
        previous = current;
    }
    await h.win.xbtaskreset();
    await previous.run('/stale');
    assert.deepEqual(h.calls, Array(5).fill('/current'));
    assert.equal(h.api.__taskRunMap.size, 0);
});

test('explicit stops revoke native callbacks and detached continuations after startup has returned', async t => {
    for (const scope of ['global', 'character', 'preset']) {
        const actions = ['disable', 'delete', 'edit', 'rename', 'reset', 'rerun'];
        if (scope === 'preset') actions.push('exit', 'api-exit');
        for (const action of actions) {
            await t.test(`${scope}/${action}`, async t => {
                const h = harness(t), gate = deferred(); h.win.gate = gate.promise;
                h.win.instances = [];
                const panel = task('panel', `
                    const instance = { signal: abortSignal, click: () => STscript('/click') };
                    instance.ready = (async () => { await window.gate; await STscript('/late'); })();
                    window.instances.push(instance);
                `);
                if (scope === 'preset') h.preset('A', [panel]);
                else h[scope](panel);
                await h.win.XBTasks.exec('panel'); h.flushRecords();
                const old = h.win.instances[0];
                assert.equal(old.signal.aborted, false);
                if (action === 'disable') await h.win.XBTasks.setProps('panel', { disabled: true }, scope);
                if (action === 'delete') await h.api.deleteTask(0, scope);
                if (action === 'edit') await h.win.XBTasks.setJS('panel', '', { scope });
                if (action === 'rename') await h.win.XBTasks.setProps('panel', { name: 'renamed' }, scope);
                if (action === 'reset') await h.win.xbtaskreset();
                if (action === 'rerun') await h.win.xbqte('panel');
                if (action === 'exit') { h.change('B'); h.change('A'); }
                if (action === 'api-exit') h.change('A', { mainApi: 'textgenerationwebui' });
                assert.equal(old.signal.aborted, true);
                await old.click();
                gate.resolve(); await Promise.all(h.win.instances.map(instance => instance.ready));
                assert.deepEqual(h.calls, action === 'rerun' ? ['/late'] : []);
                assert.equal(h.api.__taskRunMap.size, action === 'rerun' ? 1 : 0);
            });
        }
    }
});

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
            assert.equal(h.api.__taskRunMap.has('global'), true);
            assert.equal(h.api.__taskRunMap.size, action === 'edit' ? 2 : 1);
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
                    const metadata = h.win.XBTasks.find(old.name, 'global').task;
                    assert.equal(await h.storage.getStrict(metadata.scriptId || metadata.id), commands);
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

test('detached STscript settles without cancelling its owner or retaining the execution lock', async t => {
    const h = harness(t), gate = deferred();
    let controller;
    h.setSlash(async (_command, hostController) => { controller = hostController; await gate.promise; });
    h.global(task('detached', `void STscript('/pending');`));
    await h.win.XBTasks.exec('detached');
    assert.equal(controller.signal.aborted, false);
    assert.equal(h.api.__taskRunMap.size, 1);
    gate.resolve(); await settle(); h.flushRecords();
    assert.equal(h.api.__taskRunMap.size, 1);
    assert.equal(h.api.state.executingRecords.size, 0);
    assert.equal(controller.signal.aborted, false);
    await h.win.xbtaskreset();
    assert.equal(h.api.__taskRunMap.size, 0);
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
            assert.equal(h.api.__taskRunMap.size, 1);
            await h.api.checkAndExecuteTasks('after_ai');
            assert.deepEqual(h.calls, ['/first', '/second']);
            await h.win.xbtaskreset();
            assert.equal(h.api.__taskRunMap.size, 0);
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
                if (action !== 'edit' && action !== 'rename') assert.equal(h.win.starts.queued, 1);
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
