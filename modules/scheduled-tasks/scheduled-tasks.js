// ═══════════════════════════════════════════════════════════════════════════
// 导入
// ═══════════════════════════════════════════════════════════════════════════

import { extension_settings, getContext } from "../../../../../extensions.js";
import { saveSettingsDebounced, characters, this_chid, chat, callPopup } from "../../../../../../script.js";
import { getPresetManager } from "../../../../../preset-manager.js";
import { oai_settings } from "../../../../../openai.js";
import { SlashCommandParser } from "../../../../../slash-commands/SlashCommandParser.js";
import { SlashCommand } from "../../../../../slash-commands/SlashCommand.js";
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from "../../../../../slash-commands/SlashCommandArgument.js";
import { callGenericPopup, POPUP_TYPE, POPUP_RESULT } from "../../../../../popup.js";
import { accountStorage } from "../../../../../util/AccountStorage.js";
import { download, getFileText, uuidv4, debounce, getSortableDelay } from "../../../../../utils.js";
import { executeSlashCommand } from "../../core/slash-command.js";
import { EXT_ID } from "../../core/constants.js";
import { createModuleEvents, event_types } from "../../core/event-manager.js";
import { xbLog, CacheRegistry } from "../../core/debug-core.js";
import { TasksStorage } from "../../core/server-storage.js";
import { initPresetTaskEvents, consumePresetTaskImport } from './preset-task-events.js';
import { observeAsyncCallback, observeBackgroundTask } from '../../shared/common/async-errors.js';
import { createTaskEditorSaveHandler } from './task-editor-save.js';
import { confirmTaskSettingsSave, saveCharacterTasksConfirmed, savePresetTaskContent } from './task-save-confirmation.js';
import { runTaskSave, waitTaskSave } from './task-save-operation.js';
import { prepareGlobalTaskScripts, retainUncertainGlobalScripts, finishGlobalTaskScripts, taskScriptId } from './global-task-scripts.js';
import { throwIfSignalAborted } from '../../shared/common/abort-utils.js';
import { TASK_SAVE_COPY } from './task-save-copy.js';
import { PRESET_START_TIMING, PRESET_START_LABEL, getTaskTriggerTiming, setTaskTriggerTiming } from './task-trigger.js';
import { PRESET_TASK_FIELD, PRESET_PROMPT_ORDER_CHARACTER_ID } from './task-storage-fields.js';


// ═══════════════════════════════════════════════════════════════════════════
// 常量和默认值
// ═══════════════════════════════════════════════════════════════════════════

const TASKS_MODULE_NAME = "xiaobaix-tasks";
const defaultSettings = { enabled: true, globalTasks: [], processedMessages: [], character_allowed_tasks: [] };
const CONFIG = { MAX_PROCESSED: 20, MAX_COOLDOWN: 10, CLEANUP_INTERVAL: 30000, TASK_COOLDOWN: 50 };
const events = createModuleEvents('scheduledTasks');

// ═══════════════════════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════════════════════

let state = {
    currentEditingTask: null, currentEditingIndex: -1, currentEditingId: null, currentEditingScope: 'global',
    lastChatId: null, chatJustChanged: false,
    isNewChat: false, lastTurnCount: 0, executingCount: 0, isCommandGenerated: false,
    executingRecords: new Map(),
    taskLastExecutionTime: new Map(), cleanupTimer: null, lastTasksHash: '', taskBarVisible: true,
    processedMessagesSet: new Set(),
    taskBarSignature: '',
    dynamicCallbacks: new Map(),
    qrObserver: null,
    initTimers: new Set(),
    isUpdatingTaskBar: false,
    lastPresetName: ''
};

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

const normalizeTaskKey = (name) => String(name || '').trim();
// A queued destructive edit stops automatic restarts without publishing draft
// metadata. Counts keep one pending edit from releasing another edit's hold.
const pendingTaskMutations = new Map();
const isTaskMutationPending = key => pendingTaskMutations.has(normalizeTaskKey(key));
function holdTaskMutation(key) {
    const taskKey = normalizeTaskKey(key);
    pendingTaskMutations.set(taskKey, (pendingTaskMutations.get(taskKey) || 0) + 1);
    return () => {
        const count = pendingTaskMutations.get(taskKey) || 0;
        if (count <= 1) pendingTaskMutations.delete(taskKey);
        else pendingTaskMutations.set(taskKey, count - 1);
    };
}
// Host work and cleanup keep their own receipts until they actually settle.
const isRetainedExecution = entry => entry?.source === 'host' || entry?.source === 'cleanup';
const refreshExecutionState = () => {
    const records = state.executingRecords instanceof Map ? state.executingRecords : new Map();
    state.executingRecords = records;
    state.executingCount = records.size;
    state.isCommandGenerated = Array.from(records.values()).some(entry => entry?.source === 'command' || isRetainedExecution(entry));
};
const startExecutionRecord = (taskName, source = 'command', signal = null) => {
    const token = uuidv4();
    const onAbort = () => finishExecutionRecord(token);
    state.executingRecords.set(token, { taskName: normalizeTaskKey(taskName), source, startedAt: Date.now(),
        release: () => signal?.removeEventListener('abort', onAbort) });
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) finishExecutionRecord(token);
    refreshExecutionState();
    return token;
};
const finishExecutionRecord = (token) => {
    if (!token) return;
    state.executingRecords.get(token)?.release();
    if (state.executingRecords.delete(token)) {
        refreshExecutionState();
        if (!state.executingRecords.size) requestPresetTaskStartup();
    }
};
const clearExecutionRecordsByTask = (taskName) => {
    const key = normalizeTaskKey(taskName);
    if (!key) return 0;
    let removed = 0;
    for (const [token, entry] of state.executingRecords.entries()) {
        if (entry?.taskName === key && !isRetainedExecution(entry)) {
            finishExecutionRecord(token);
            removed++;
        }
    }
    if (removed > 0) refreshExecutionState();
    return removed;
};
const clearAllExecutionRecords = () => {
    for (const [token, entry] of state.executingRecords) {
        if (!isRetainedExecution(entry)) finishExecutionRecord(token);
    }
    refreshExecutionState();
};
const isTaskExecutionActive = (taskName) => {
    const key = normalizeTaskKey(taskName);
    if (!key) return false;
    for (const entry of state.executingRecords.values()) {
        if (entry?.taskName === key) return true;
    }
    return false;
};
const isAnyTaskExecuting = () => state.executingRecords.size > 0;
const isGloballyEnabled = () => (window.isXiaobaixEnabled !== undefined ? window.isXiaobaixEnabled : true) && getSettings().enabled;
const clampInt = (v, min, max, d = 0) => (Number.isFinite(+v) ? Math.max(min, Math.min(max, +v)) : d);
const nowMs = () => Date.now();
const logExecutionLockSkip = (location, context = {}) => {
    const now = nowMs();
    const activeExecutions = Array.from(state.executingRecords.values(), entry => {
        const startedAt = Number.isFinite(entry?.startedAt) ? entry.startedAt : null;
        return {
            taskName: entry?.taskName || 'UnknownTask',
            source: entry?.source || 'unknown',
            startedAt,
            elapsedMs: startedAt === null ? null : Math.max(0, now - startedAt),
        };
    });
    const detail = { location, ...context, activeExecutions };
    console.warn('[循环任务] 触发因执行锁被跳过', detail);
    try { xbLog.warn('scheduledTasks', { event: 'execution_lock_skip', ...detail }); } catch (error) { console.warn({ source: import.meta.url, operation: 'log' }, error); }
};

const mapTiming = (task, scope) => ({ ...task, triggerTiming: getTaskTriggerTiming(task, scope) });

async function readGlobalTaskCommands(task) {
    if (task?.id) {
        let commands;
        try {
            commands = await TasksStorage.getStrict(taskScriptId(task), null);
        } catch (error) {
            throw new Error(`读取全局任务“${task.name || task.id}”失败：${error?.message || error}`);
        }
        if (commands === null && Object.prototype.hasOwnProperty.call(task, 'commands') && task.commands != null) {
            return String(task.commands);
        }
        if (commands === null) throw new Error(`全局任务“${task.name || task.id}”的脚本不存在`);
        return String(commands);
    }
    if (task && Object.prototype.hasOwnProperty.call(task, 'commands') && task.commands != null) {
        return String(task.commands);
    }
    throw new Error(`全局任务“${task?.name || '未命名任务'}”缺少 ID 和脚本`);
}

const allTasksMeta = () => [
    ...getSettings().globalTasks.map(mapTiming),
    ...getCharacterTasks().map(mapTiming),
    ...getPresetTasks().map(task => mapTiming(task, 'preset'))
];

const allTasks = allTasksMeta;

async function allTasksFull() {
    const preset = syncPresetTaskBinding();
    const globalMeta = getSettings().globalTasks || [];
    const globalTasks = (await Promise.all(globalMeta.map(async (task) => {
        try {
            return { ...task, commands: await readGlobalTaskCommands(task) };
        } catch (error) {
            console.error(`[循环任务] 已跳过无法读取的全局任务“${task?.name || '未命名任务'}”`, error);
            return null;
        }
    }))).filter(Boolean);
    // Keep the visit identity across I/O, not a stale snapshot of its tasks.
    const presetTasks = isTaskRuntimeActive({ preset })
        ? getPresetTasks().map(task => ({ ...mapTiming(task, 'preset'), __runtime: captureTaskRuntime(task, 'preset') }))
        : [];
    return [
        ...globalTasks.map(mapTiming),
        ...getCharacterTasks().map(mapTiming),
        ...presetTasks
    ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 设置管理
// ═══════════════════════════════════════════════════════════════════════════

let pendingGlobalSettings = null;

function getStoredTaskSettings() {
    const ext = extension_settings[EXT_ID] || (extension_settings[EXT_ID] = {});
    if (!ext.tasks) ext.tasks = structuredClone(defaultSettings);
    const t = ext.tasks;
    if (typeof t.enabled !== 'boolean') t.enabled = defaultSettings.enabled;
    if (!Array.isArray(t.globalTasks)) t.globalTasks = [];
    if (!Array.isArray(t.processedMessages)) t.processedMessages = [];
    if (!Array.isArray(t.character_allowed_tasks)) t.character_allowed_tasks = [];
    return t;
}

// The native serializer sees the candidate, while every task reader continues
// to see the committed definition until its matching acknowledgement arrives.
function getSettings() {
    const settings = getStoredTaskSettings();
    if (!pendingGlobalSettings) return settings;
    return new Proxy(settings, {
        get(target, key) { return key === 'globalTasks' ? pendingGlobalSettings || target.globalTasks : target[key]; },
    });
}

function hydrateProcessedSetFromSettings() {
    try {
        state.processedMessagesSet = new Set(getSettings().processedMessages || []);
    } catch (caughtError) { console.warn({ source: import.meta.url, operation: "hydrateProcessedSetFromSettings" }, caughtError); }
}

function scheduleCleanup() {
    if (state.cleanupTimer) return;
    state.cleanupTimer = setInterval(() => {
        const n = nowMs();
        for (const [taskName, lastTime] of state.taskLastExecutionTime.entries()) {
            if (n - lastTime > CONFIG.TASK_COOLDOWN * 2) state.taskLastExecutionTime.delete(taskName);
        }
        if (state.taskLastExecutionTime.size > CONFIG.MAX_COOLDOWN) {
            const entries = [...state.taskLastExecutionTime.entries()].sort((a, b) => b[1] - a[1]).slice(0, CONFIG.MAX_COOLDOWN);
            state.taskLastExecutionTime.clear();
            entries.forEach(([k, v]) => state.taskLastExecutionTime.set(k, v));
        }
        const settings = getSettings();
        if (settings.processedMessages.length > CONFIG.MAX_PROCESSED) {
            settings.processedMessages = settings.processedMessages.slice(-CONFIG.MAX_PROCESSED);
            state.processedMessagesSet = new Set(settings.processedMessages);
            saveSettingsDebounced();
        }
    }, CONFIG.CLEANUP_INTERVAL);
}

const isTaskInCooldown = (name, t = nowMs()) => {
    const last = state.taskLastExecutionTime.get(name);
    return last && (t - last) < CONFIG.TASK_COOLDOWN;
};

const setTaskCooldown = (name) => state.taskLastExecutionTime.set(name, nowMs());

const isMessageProcessed = (key) => state.processedMessagesSet.has(key);

function markMessageAsProcessed(key) {
    if (state.processedMessagesSet.has(key)) return;
    state.processedMessagesSet.add(key);
    const settings = getSettings();
    settings.processedMessages.push(key);
    if (settings.processedMessages.length > CONFIG.MAX_PROCESSED) {
        settings.processedMessages = settings.processedMessages.slice(-Math.floor(CONFIG.MAX_PROCESSED / 2));
        state.processedMessagesSet = new Set(settings.processedMessages);
    }
    saveSettingsDebounced();
}

// ═══════════════════════════════════════════════════════════════════════════
// 角色任务
// ═══════════════════════════════════════════════════════════════════════════

function getCharacterTasks(c = characters[this_chid]) {
    if (!c) return [];
    if (!c.data) c.data = {};
    if (!c.data.extensions) c.data.extensions = {};
    if (!c.data.extensions[TASKS_MODULE_NAME]) c.data.extensions[TASKS_MODULE_NAME] = { tasks: [] };
    const list = c.data.extensions[TASKS_MODULE_NAME].tasks;
    if (!Array.isArray(list)) c.data.extensions[TASKS_MODULE_NAME].tasks = [];
    return c.data.extensions[TASKS_MODULE_NAME].tasks;
}

async function saveCharacterTasks(tasks, { signal, target } = {}) {
    const characterId = this_chid;
    const character = target?.character || characters[characterId];
    if (!character) throw new Error(TASK_SAVE_COPY.characterRequired);
    {
        await saveCharacterTasksConfirmed(character.avatar, TASKS_MODULE_NAME, tasks, signal);
        // Match the host's two in-memory representations only after confirmation.
        if (character.json_data) {
            const json = JSON.parse(character.json_data);
            json.data ??= {};
            json.data.extensions ??= {};
            json.data.extensions[TASKS_MODULE_NAME] = { tasks };
            character.json_data = JSON.stringify(json);
            if (characters[this_chid] === character) $('#character_json_data').val(character.json_data);
        }
    }
    character.data ??= {};
    character.data.extensions ??= {};
    character.data.extensions[TASKS_MODULE_NAME] = { tasks };
    const settings = getSettings();
    const avatar = character.avatar;
    if (!avatar || settings.character_allowed_tasks?.includes(avatar)) return;
    settings.character_allowed_tasks = [...(settings.character_allowed_tasks || []), avatar];
    saveSettingsDebounced();
}

// ═══════════════════════════════════════════════════════════════════════════
// 预设任务
// ═══════════════════════════════════════════════════════════════════════════

const presetTasksState = { name: '', tasks: [] };

const PresetTasksStore = (() => {
    // Only in-flight saves live here. Serialize our writes to each preset; a host
    // import/delete invalidates their memory publication, not ordinary preset edits.
    const writes = new Map();
    const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
    const deepClone = (value) => {
        if (value === undefined) return undefined;
        if (typeof structuredClone === 'function') {
            try { return structuredClone(value); } catch (caughtError) { console.debug({ source: import.meta.url, operation: "deepClone" }, caughtError); }
        }
        try { return JSON.parse(JSON.stringify(value)); } catch { return value; }
    };

    const getPresetManagerSafe = () => {
        try { return getPresetManager('openai'); } catch { return null; }
    };

    const getPresetSnapshot = (manager, name) => {
        if (!manager || !name) return { source: null, clone: null };
        let source = null;
        try {
            if (typeof manager.getCompletionPresetByName === 'function') {
                source = manager.getCompletionPresetByName(name) || null;
            }
        } catch (caughtError) { console.warn({ source: import.meta.url, operation: "getPresetSnapshot" }, caughtError); }
        if (!source && typeof manager.getCompletionPresetByName !== 'function') {
            try { source = manager.getPresetSettings?.(name) || null; } catch { source = null; }
        }
        if (!source) return { source: null, clone: null };
        return { source, clone: deepClone(source) };
    };

    const ensurePromptOrderEntry = (preset, create = false) => {
        if (!preset) return null;
        if (!Array.isArray(preset.prompt_order)) {
            if (!create) return null;
            preset.prompt_order = [];
        }
        let entry = preset.prompt_order.find(item => Number(item?.character_id) === PRESET_PROMPT_ORDER_CHARACTER_ID);
        if (!entry && create) {
            entry = { character_id: PRESET_PROMPT_ORDER_CHARACTER_ID, order: [] };
            preset.prompt_order.push(entry);
        }
        return entry || null;
    };

    const currentName = () => {
        if (getContext().mainApi !== 'openai') return '';
        try { return getPresetManagerSafe()?.getSelectedPresetName?.() || ''; } catch { return ''; }
    };

    const isCurrentBatch = (manager, name, batch) => {
        const { source } = getPresetSnapshot(manager, name);
        return !!batch?.valid && writes.get(name) === batch && source === batch.source;
    };

    const read = (name) => {
        if (!name) return [];
        const manager = getPresetManagerSafe();
        if (!manager) return [];
        const pending = writes.get(name);
        const { clone } = getPresetSnapshot(manager, name);
        if (!clone) return [];
        const entry = ensurePromptOrderEntry(clone, false);
        if (!entry || !isPlainObject(entry.xiaobai_ext)) return [];
        const tasks = entry.xiaobai_ext[PRESET_TASK_FIELD];
        const committed = Array.isArray(tasks) ? deepClone(tasks) : [];
        if (!isCurrentBatch(manager, name, pending)) return committed;
        // Explicit deletion/disable takes effect immediately. Draft names and
        // scripts must not run before their write succeeds.
        const findPending = task => pending.tasks.find(next => task.id ? next.id === task.id : next.name === task.name);
        return committed.filter(task => findPending(task))
            .map(task => findPending(task)?.disabled ? { ...task, disabled: true } : task);
    };

    const writeTasks = (preset, tasks) => {
        const entry = ensurePromptOrderEntry(preset, tasks.length > 0);
        if (!entry) return;
        if (tasks.length) {
            entry.xiaobai_ext = isPlainObject(entry.xiaobai_ext) ? entry.xiaobai_ext : {};
            entry.xiaobai_ext[PRESET_TASK_FIELD] = deepClone(tasks);
        } else if (entry.xiaobai_ext) {
            delete entry.xiaobai_ext[PRESET_TASK_FIELD];
            if (!Object.keys(entry.xiaobai_ext).length) delete entry.xiaobai_ext;
        }
    };

    const write = async (name, tasks, signal) => {
        throwIfSignalAborted(signal);
        if (!name) return false;
        const manager = getPresetManagerSafe();
        if (!manager) return false;
        const { source } = getPresetSnapshot(manager, name);
        if (!source) return false;
        const previous = writes.get(name);
        let batch = previous;
        if (!batch || !batch.valid || batch.source !== source) {
            batch = { source, valid: true, latest: 0, tail: previous?.tail || Promise.resolve() };
            writes.set(name, batch);
        }
        const ticket = ++batch.latest;
        const savedTasks = deepClone(tasks);
        batch.tasks = savedTasks;
        const isCurrent = () => isCurrentBatch(manager, name, batch);
        const previousWrite = batch.tail;
        const save = async saveSignal => {
            await waitTaskSave(() => previousWrite, saveSignal);
            throwIfSignalAborted(saveSignal);
            if (!isCurrent()) return false;
            const { clone } = getPresetSnapshot(manager, name);
            writeTasks(clone, savedTasks);
            // Equivalent to host savePreset(skipUpdate), with cancellable transport.
            await savePresetTaskContent(name, clone, savedTasks, saveSignal);
            if (!isCurrent()) return false;
            // Publish only the field this feature owns. Never roll back live prompt switches.
            writeTasks(getPresetSnapshot(manager, name).source, savedTasks);
            if (ticket === batch.latest && PresetTasksStore.currentName() === name) writeTasks(oai_settings, savedTasks);
            return true;
        };
        const work = signal ? save(signal) : runTaskSave(save);
        // The caller receives save errors; a later explicit save may still proceed.
        batch.tail = work.then(() => {}, () => {});
        try { return await work; }
        finally { if (writes.get(name) === batch && ticket === batch.latest) writes.delete(name); }
    };

    const flush = async name => {
        let batch;
        while ((batch = writes.get(name))) {
            const tail = batch.tail;
            await tail;
            // An edit can join the queue while we wait. Drain it too before the
            // host sends its import, without retaining a lock after this event.
            if (writes.get(name) === batch && batch.tail === tail) break;
        }
    };

    const currentSource = () => getPresetSnapshot(getPresetManagerSafe(), currentName()).source;
    const imported = name => { const batch = writes.get(name); if (batch) batch.valid = false; };
    return { currentName, read, write, currentSource, imported, flush };
})();

// A preset visit owns its running work. This is runtime-only: leaving and returning
// creates a new signal, so an old asynchronous continuation cannot reattach itself.
let presetTaskBinding = null;
function syncPresetTaskBinding() {
    const name = PresetTasksStore.currentName();
    if (!presetTaskBinding || presetTaskBinding.name !== name) {
        const previous = presetTaskBinding;
        presetTaskBinding = { name, abort: new AbortController() };
        previous?.abort.abort();
    }
    return presetTaskBinding;
}

function captureTaskRuntime(task, scope) {
    if (scope !== 'preset') return { key: normalizeTaskKey(task.name), preset: null };
    const preset = syncPresetTaskBinding();
    // Names already identify task execution; preset scope prevents cross-preset
    // collisions without making a read depend on saving generated task IDs.
    return { key: JSON.stringify(['preset', preset.name, normalizeTaskKey(task.name)]), preset };
}

function isTaskRuntimeActive(runtime) {
    if (runtime?.abort?.signal.aborted) return false;
    if (!runtime?.preset) return true;
    return syncPresetTaskBinding() === runtime.preset && !!runtime.preset.name && !runtime.preset.abort.signal.aborted;
}

function waitForTaskSignal(work, signal) {
    if (!signal) return work;
    return new Promise((resolve, reject) => {
        const onAbort = () => resolve(undefined);
        signal.addEventListener('abort', onAbort, { once: true });
        if (signal.aborted) onAbort();
        Promise.resolve(work).then(value => {
            signal.removeEventListener('abort', onAbort);
            resolve(value);
        }, error => {
            signal.removeEventListener('abort', onAbort);
            if (signal.aborted && error?.name !== 'AbortError') {
                console.error({ source: import.meta.url, operation: 'waitForTaskSignal' }, error);
            }
            reject(error);
        });
    });
}

const ensurePresetTaskIds = (tasks) => {
    let mutated = false;
    tasks?.forEach(task => {
        if (task && !task.id) {
            task.id = uuidv4();
            mutated = true;
        }
    });
    return mutated;
};

function resetPresetTasksCache() {
    presetTasksState.name = '';
    presetTasksState.tasks = [];
}

function getPresetTasks() {
    const name = PresetTasksStore.currentName();
    if (!name) {
        resetPresetTasksCache();
        return presetTasksState.tasks;
    }
    if (presetTasksState.name !== name) {
        const loaded = PresetTasksStore.read(name) || [];
        ensurePresetTaskIds(loaded);
        presetTasksState.name = name;
        presetTasksState.tasks = Array.isArray(loaded) ? loaded : [];
    }
    return presetTasksState.tasks;
}

async function savePresetTasks(tasks, { signal, target } = {}) {
    const name = target?.name || PresetTasksStore.currentName();
    if (!name) throw new Error(TASK_SAVE_COPY.presetRequired);
    const list = Array.isArray(tasks) ? tasks.map(task => getTaskTriggerTiming(task, 'preset') === PRESET_START_TIMING
        ? setTaskTriggerTiming(task, PRESET_START_TIMING, 'preset') : task) : [];
    ensurePresetTaskIds(list);
    try {
        const saving = PresetTasksStore.write(name, list, signal);
        if (presetTasksState.name === name) resetPresetTasksCache();
        const applied = await saving;
        if (applied === false) throw new Error(TASK_SAVE_COPY.presetChanged);
    } catch (error) {
        // Host refresh/reentry can cache a clone of the pending list. Invalidate
        // by preset, then read the store's latest pending or committed definition;
        // an older failure must not restore its snapshot over a newer save.
        if (presetTasksState.name === name) resetPresetTasksCache();
        throw error;
    }
    if (presetTasksState.name === name) resetPresetTasksCache();
    state.lastTasksHash = '';
    updatePresetTaskHint();
}

// ═══════════════════════════════════════════════════════════════════════════
// 任务列表操作
// ═══════════════════════════════════════════════════════════════════════════

const getTaskListByScope = (scope, target) => {
    if (scope === 'character') return getCharacterTasks(target?.character);
    if (scope === 'preset') return target?.name && target.name !== PresetTasksStore.currentName()
        ? PresetTasksStore.read(target.name) : getPresetTasks();
    return getSettings().globalTasks;
};

// Serialize task commits, not independent permission preferences.
let globalTaskWriteTail = Promise.resolve();

async function persistTaskListByScope(scope, tasks, { signal, target } = {}) {
    throwIfSignalAborted(signal);
    if (scope === 'character') return await saveCharacterTasks(tasks, { signal, target });
    if (scope === 'preset') return await savePresetTasks(tasks, { signal, target });
    const base = structuredClone(getSettings().globalTasks);
    const snapshot = tasks.filter(Boolean).map(task => ({ ...task, id: task.id || uuidv4() }));
    const work = globalTaskWriteTail.then(async () => {
        // Another editor/API may have queued a change to a different task.
        // Apply this list's changes rather than replaying an old full snapshot.
        const current = getSettings().globalTasks;
        const before = new Map(base.map(task => [task.id, task]));
        const desiredIds = new Set(snapshot.map(task => task.id));
        const merged = snapshot.map(task => JSON.stringify(task) === JSON.stringify(before.get(task.id))
            ? current.find(item => item.id === task.id) : task).filter(Boolean);
        for (const task of current) {
            if (!before.has(task.id) && !desiredIds.has(task.id)) merged.push(task);
        }
        await persistGlobalTaskList(merged, signal);
    });
    globalTaskWriteTail = work.then(() => {}, () => {});
    return await waitTaskSave(() => work, signal);
}

async function persistGlobalTaskList(tasks, signal) {
    const metadata = await prepareGlobalTaskScripts(tasks, signal);
    const settings = getStoredTaskSettings();
    const previous = settings.globalTasks;
    pendingGlobalSettings = previous;
    settings.globalTasks = metadata;
    try {
        await confirmTaskSettingsSave({ globalTasks: metadata }, signal);
    } catch (error) {
        retainUncertainGlobalScripts(previous, metadata, error);
        settings.globalTasks = previous;
        throw error;
    } finally {
        pendingGlobalSettings = null;
    }
    finishGlobalTaskScripts(previous, metadata, () => getSettings().globalTasks);
}

async function removeTaskByScope(scope, taskId, fallbackIndex = -1, { signal, target } = {}) {
    const list = [...getTaskListByScope(scope, target)];
    const idx = taskId ? list.findIndex(t => t?.id === taskId) : fallbackIndex;
    if (idx >= 0 && idx < list.length) list.splice(idx, 1);
    await persistTaskListByScope(scope, list, { signal, target });
}

// ═══════════════════════════════════════════════════════════════════════════
// 任务运行管理
// ═══════════════════════════════════════════════════════════════════════════

// Startup completion releases the execution record, not the script's capabilities.
// Native listeners and detached async work are not observable here. Keep one
// current owner per task until explicit stop/replacement (or startup failure).
const __taskRunMap = new Map();
// A command pipeline owns its request before any asynchronous work. It remains
// cancellable while waiting for reads or a previous instance's cleanup. Resident
// script resources are owned separately by __taskRunMap after the pipeline ends.
const __taskExecutionMap = new Map();
const __taskDynamicCallbackPrefix = (taskName) => `${normalizeTaskKey(taskName)}_fl_`;

function cleanupTaskRunOwner(taskKey, entry) {
    if (!entry || entry.cleaned) return false;
    entry.cleaned = true;
    entry.releasePreset?.();

    // Publish the completion before dispatching abort: an abort callback can
    // synchronously request a replacement which must wait for this cleanup too.
    let resolveCleanup, rejectCleanup;
    entry.cleanupCompletion = new Promise((resolve, reject) => {
        resolveCleanup = resolve;
        rejectCleanup = reject;
    });
    observeBackgroundTask(entry.cleanupCompletion, { source: import.meta.url, operation: 'cleanupTaskRunOwner', taskKey });

    for (const callbackId of Array.from(entry.callbackIds || [])) {
        const callbackEntry = state.dynamicCallbacks.get(callbackId);
        if (callbackEntry?.owner === entry) {
            try { callbackEntry.abortController?.abort?.(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "cleanupTaskRunOwner" }, caughtError); }
            state.dynamicCallbacks.delete(callbackId);
        }
        entry.callbackIds.delete(callbackId);
    }

    // Native abort handlers run synchronously. Only commands started inside that
    // dispatch are cleanup; unrelated continuations never get a blanket bypass.
    entry.dispatchingAbort = true;
    try { entry.abort.abort(); } finally { entry.dispatchingAbort = false; }
    try { entry.timers?.forEach?.((id) => clearTimeout(id)); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "cleanupTaskRunOwner" }, caughtError); }
    try { entry.intervals?.forEach?.((id) => clearInterval(id)); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "cleanupTaskRunOwner" }, caughtError); }
    for (const listener of Array.from(entry.listeners || [])) {
        try { listener.target?.removeEventListener?.(listener.type, listener.wrapped, listener.capture); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "cleanupTaskRunOwner" }, caughtError); }
        entry.listeners.delete(listener);
    }
    entry.timers?.clear?.();
    entry.intervals?.clear?.();
    for (const callback of entry.cleanupCallbacks) {
        entry.cleanupWork.push(Promise.resolve().then(callback));
    }
    entry.cleanupCallbacks.clear();
    const removeEntry = () => {
        if (__taskRunMap.get(taskKey) === entry) __taskRunMap.delete(taskKey);
    };
    if (entry.cleanupWork.length) {
        const token = startExecutionRecord(taskKey, 'cleanup');
        Promise.allSettled(entry.cleanupWork).then(results => {
            const errors = results.filter(result => result.status === 'rejected').map(result => result.reason);
            finishExecutionRecord(token);
            removeEntry();
            if (errors.length) rejectCleanup(new AggregateError(errors, 'Task cleanup failed'));
            else resolveCleanup();
        }).catch(error => rejectCleanup(error));
    } else {
        removeEntry();
        resolveCleanup();
    }
    return true;
}

function removeFloorCallback(owner, callbackId) {
    const callbackEntry = state.dynamicCallbacks.get(callbackId);
    if (callbackEntry?.owner === owner) {
        try { callbackEntry.abortController?.abort?.(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "removeFloorCallback" }, caughtError); }
        state.dynamicCallbacks.delete(callbackId);
    }
    owner?.callbackIds?.delete?.(callbackId);
}

function abortTaskRunEntry(entry) {
    return cleanupTaskRunOwner(entry?.taskKey, entry);
}

function resetTaskRun(taskName) {
    const taskKey = normalizeTaskKey(taskName);
    if (!taskKey) return { taskKey, clearedRuns: 0, clearedCallbacks: 0, clearedExecutions: 0 };
    for (const execution of Array.from(__taskExecutionMap.get(taskKey) || [])) execution.abort.abort();

    let clearedRuns = 0;
    const runEntry = __taskRunMap.get(taskKey);
    if (runEntry) {
        abortTaskRunEntry(runEntry);
        clearedRuns = 1;
    }

    let clearedCallbacks = 0;
    const callbackPrefix = __taskDynamicCallbackPrefix(taskKey);
    for (const [id, entry] of state.dynamicCallbacks.entries()) {
        if (!id.startsWith(callbackPrefix)) continue;
        try { entry?.abortController?.abort?.(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "resetTaskRun" }, caughtError); }
        state.dynamicCallbacks.delete(id);
        clearedCallbacks++;
    }

    clearTaskCooldown(taskKey);
    const clearedExecutions = clearExecutionRecordsByTask(taskKey);
    return { taskKey, clearedRuns, clearedCallbacks, clearedExecutions };
}

function resetAllTaskRuns() {
    if (presetTaskStartup) presetTaskStartup.pending = false;
    for (const executions of Array.from(__taskExecutionMap.values())) {
        for (const execution of Array.from(executions)) execution.abort.abort();
    }
    presetTaskBinding?.abort.abort();
    presetTaskBinding = null;
    for (const entry of Array.from(__taskRunMap.values())) abortTaskRunEntry(entry);

    for (const [id, entry] of state.dynamicCallbacks.entries()) {
        try { entry?.abortController?.abort?.(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "resetAllTaskRuns" }, caughtError); }
        state.dynamicCallbacks.delete(id);
    }

    clearTaskCooldown();
    clearAllExecutionRecords();
    return { ok: true };
}

CacheRegistry.register('scheduledTasks', {
    name: '循环任务状态',
    getSize: () => {
        try {
            const a = state.processedMessagesSet?.size || 0;
            const b = state.taskLastExecutionTime?.size || 0;
            const c = state.dynamicCallbacks?.size || 0;
            const d = __taskRunMap.size || 0;
            const e = state.executingRecords?.size || 0;
            const f = TasksStorage.getCacheSize() || 0;
            return a + b + c + d + e + f;
        } catch { return 0; }
    },
    getBytes: () => {
        try {
            let total = 0;
            const addStr = (v) => { total += String(v ?? '').length * 2; };
            const addSet = (s) => { if (!s?.forEach) return; s.forEach(v => addStr(v)); };
            const addMap = (m, addValue = null) => {
                if (!m?.forEach) return;
                m.forEach((v, k) => { addStr(k); if (typeof addValue === 'function') addValue(v); });
            };
            addSet(state.processedMessagesSet);
            addMap(state.taskLastExecutionTime, (v) => addStr(v));
            addMap(state.dynamicCallbacks, (entry) => {
                addStr(entry?.options?.timing);
                addStr(entry?.options?.floorType);
                addStr(entry?.options?.interval);
                try { addStr(entry?.callback?.toString?.()); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "getBytes" }, caughtError); }
            });
            addMap(__taskRunMap, (entry) => {
                addStr(entry?.signature);
                total += (entry?.timers?.size || 0) * 8;
                total += (entry?.intervals?.size || 0) * 8;
            });
            addMap(state.executingRecords, (entry) => {
                addStr(entry?.taskName);
                addStr(entry?.source);
            });
            total += TasksStorage.getCacheBytes();
            return total;
        } catch { return 0; }
    },
    clear: () => {
        try {
            state.processedMessagesSet?.clear?.();
            state.taskLastExecutionTime?.clear?.();
            TasksStorage.clearCache();
            const s = getSettings();
            if (s?.processedMessages) s.processedMessages = [];
            saveSettingsDebounced();
        } catch (caughtError) { console.warn({ source: import.meta.url, operation: "clear" }, caughtError); }
        try { resetAllTaskRuns(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "clear" }, caughtError); }
    },
    getDetail: () => {
        try {
            return {
                processedMessages: state.processedMessagesSet?.size || 0,
                cooldown: state.taskLastExecutionTime?.size || 0,
                dynamicCallbacks: state.dynamicCallbacks?.size || 0,
                runningSingleInstances: __taskRunMap.size || 0,
                executingTasks: state.executingRecords?.size || 0,
                scriptCache: TasksStorage.getCacheSize() || 0,
            };
        } catch { return {}; }
    },
});

async function __runTaskSingleInstance(taskName, jsRunner, signature = null, runtime = null, isLightTask = false) {
    if (!isTaskRuntimeActive(runtime)) return;
    // Only JavaScript instances replace one another. Plain slash-command tasks
    // retain their existing concurrency; an explicit stop cancels either kind.
    for (const pending of __taskExecutionMap.get(taskName) || []) {
        if (pending === runtime) break;
        pending.abort.abort();
    }
    const existing = __taskRunMap.get(taskName);
    if (existing) {
        const wasStopped = existing.cleaned;
        abortTaskRunEntry(existing);
        if (!wasStopped && !isLightTask) {
            try { await waitForTaskSignal(existing.completion, runtime?.abort.signal); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "__runTaskSingleInstance" }, caughtError); }
        }
        await waitForTaskSignal(existing.cleanupCompletion, runtime?.abort.signal);
    }

    if (!isTaskRuntimeActive(runtime)) return;

    const abort = new AbortController();
    const timers = new Set();
    const intervals = new Set();
    const listeners = new Set();
    const entry = {
        taskKey: taskName,
        abort,
        timers,
        intervals,
        listeners,
        signature,
        completion: null,
        callbackIds: new Set(),
        cleaned: false,
        dispatchingAbort: false,
        cleanupCallbacks: new Set(),
        cleanupWork: [],
        cleanupCompletion: null,
    };
    __taskRunMap.set(taskName, entry);
    if (runtime?.preset) {
        const signal = runtime.preset.abort.signal;
        const onPresetExit = () => {
            cleanupTaskRunOwner(taskName, entry);
            clearTaskCooldown(taskName);
        };
        signal.addEventListener('abort', onPresetExit, { once: true });
        entry.releasePreset = () => signal.removeEventListener('abort', onPresetExit);
    }

    const reportCallbackError = (kind, error) => {
        console.error(`[任务${kind}回调错误]`, taskName, error);
    };

    const invokeOwnedCallback = (kind, callback, thisArg, args) => {
        if (entry.cleaned) return;
        if (typeof callback !== 'function') return;
        let result;
        try {
            result = callback.apply(thisArg, args);
        } catch (error) {
            reportCallbackError(kind, error);
            return;
        }
        Promise.resolve(result).catch(error => reportCallbackError(kind, error));
    };

    const removeOwnedListener = (listener) => {
        if (!listener || !listeners.delete(listener)) return false;
        try { listener.target?.removeEventListener?.(listener.type, listener.wrapped, listener.capture); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "removeOwnedListener" }, caughtError); }
        return true;
    };

    const addListener = (target, type, handler, opts = {}) => {
        if (!target?.addEventListener || typeof handler !== 'function' || entry.cleaned) return () => {};
        const normalized = typeof opts === 'boolean' ? { capture: opts } : { ...(opts || {}) };
        const capture = !!normalized.capture;
        const duplicate = Array.from(listeners).find(listener =>
            listener.target === target && listener.type === type && listener.handler === handler && listener.capture === capture
        );
        if (duplicate) return () => removeOwnedListener(duplicate);

        const listener = { target, type, handler, capture, wrapped: null };
        listener.wrapped = function (...args) {
            if (normalized.once) listeners.delete(listener);
            invokeOwnedCallback('监听器', handler, this, args);
        };
        try {
            target.addEventListener(type, listener.wrapped, { ...normalized, signal: abort.signal });
            listeners.add(listener);
        } catch (error) {
            reportCallbackError('监听器注册', error);
            return () => {};
        }
        return () => removeOwnedListener(listener);
    };
    const removeListener = (target, type, handler, opts = {}) => {
        const capture = !!(opts === true || opts?.capture);
        for (const listener of listeners) {
            if (listener.target === target && listener.type === type && listener.capture === capture &&
                (listener.handler === handler || listener.wrapped === handler)) {
                removeOwnedListener(listener);
                return;
            }
        }
        try { target?.removeEventListener?.(type, handler, capture); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "removeListener" }, caughtError); }
    };
    const setTimeoutSafe = (fn, t, ...a) => {
        if (entry.cleaned) return null;
        const id = setTimeout(() => {
            timers.delete(id);
            invokeOwnedCallback('定时器', fn, undefined, a);
        }, t);
        timers.add(id);
        return id;
    };
    const clearTimeoutSafe = (id) => {
        clearTimeout(id);
        timers.delete(id);
    };
    const setIntervalSafe = (fn, t, ...a) => {
        if (entry.cleaned) return null;
        const id = setInterval(() => invokeOwnedCallback('定时器', fn, undefined, a), t);
        intervals.add(id);
        return id;
    };
    const clearIntervalSafe = (id) => {
        clearInterval(id);
        intervals.delete(id);
    };

    let jsRunnerResult;
    entry.completion = (async () => {
        let succeeded = false;
        try {
            jsRunnerResult = await jsRunner({
                addListener,
                removeListener,
                setTimeoutSafe,
                clearTimeoutSafe,
                setIntervalSafe,
                clearIntervalSafe,
                abortSignal: abort.signal,
                owner: entry,
            });
            succeeded = true;
        } finally {
            if (!succeeded) cleanupTaskRunOwner(taskName, entry);
            try { window?.dispatchEvent?.(new CustomEvent('xiaobaix-task-cleaned', { detail: { taskName, signature } })); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "__runTaskSingleInstance" }, caughtError); }
        }
        return jsRunnerResult;
    })();

    return entry.completion;
}

// ═══════════════════════════════════════════════════════════════════════════
// 命令执行
// ═══════════════════════════════════════════════════════════════════════════

async function executeCommands(commands, taskName, runtime = null) {
    if (!isTaskRuntimeActive(runtime)) return null;
    if (typeof commands !== 'function' && !String(commands || '').trim()) return null;
    const key = runtime?.key || normalizeTaskKey(taskName) || 'AnonymousTask';
    const execution = { ...runtime, key, abort: new AbortController() };
    let executions = __taskExecutionMap.get(key);
    if (!executions) __taskExecutionMap.set(key, executions = new Set());
    executions.add(execution);
    const onPresetExit = () => execution.abort.abort();
    const presetSignal = execution.preset?.abort.signal;
    presetSignal?.addEventListener('abort', onPresetExit, { once: true });
    if (presetSignal?.aborted) onPresetExit();
    let execToken;
    try {
        if (typeof commands === 'function') commands = await waitForTaskSignal(commands(), execution.abort.signal);
        if (!String(commands || '').trim() || !isTaskRuntimeActive(execution)) return null;
        execToken = startExecutionRecord(key, 'command', execution.abort.signal);
        return await waitForTaskSignal(processTaskCommands(commands, taskName, execution), execution.abort.signal);
    } finally {
        presetSignal?.removeEventListener('abort', onPresetExit);
        executions.delete(execution);
        if (!executions.size && __taskExecutionMap.get(key) === executions) __taskExecutionMap.delete(key);
        if (execToken) setTimeout(() => finishExecutionRecord(execToken), 500);
    }
}

async function executeTaskSlashCommand(command, taskKey, signal) {
    if (signal?.aborted) return;
    const token = startExecutionRecord(taskKey, 'host');
    try {
        return await executeSlashCommand(command, { signal });
    } finally {
        setTimeout(() => finishExecutionRecord(token), 500);
    }
}

async function processTaskCommands(commands, taskName, runtime = null) {
    const jsTagRegex = /<<taskjs>>([\s\S]*?)<<\/taskjs>>/g;
    let lastIndex = 0, result = null, match;
    const slash = command => executeTaskSlashCommand(command, runtime?.key || taskName, runtime?.abort.signal);

    while ((match = jsTagRegex.exec(commands)) !== null) {
        if (!isTaskRuntimeActive(runtime)) return result;
        const beforeJs = commands.slice(lastIndex, match.index).trim();
        if (beforeJs) result = await slash(beforeJs);
        if (!isTaskRuntimeActive(runtime)) return result;
        const jsCode = match[1].trim();
        if (jsCode) {
            try { result = await executeTaskJS(jsCode, taskName || 'AnonymousTask', runtime); }
            catch (error) {
                console.error(`[任务JS执行错误] ${error.message}`);
                try { xbLog.error('scheduledTasks', `taskjs error task=${String(taskName || 'AnonymousTask')}`, error); } catch (error) { console.warn({ source: import.meta.url, operation: 'processTaskCommands' }, error); }
            }
        }
        lastIndex = match.index + match[0].length;
    }

    if (!isTaskRuntimeActive(runtime)) return result;
    if (lastIndex === 0) {
        result = await slash(commands);
    } else {
        const remaining = commands.slice(lastIndex).trim();
        if (remaining) result = await slash(remaining);
    }
    return result;
}

function __hashStringForKey(str) {
    try {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
        }
        return (hash >>> 0).toString(36);
    } catch { return Math.random().toString(36).slice(2); }
}

async function executeTaskJS(jsCode, taskName = 'AnonymousTask', runtime = null) {
    if (!isTaskRuntimeActive(runtime)) return;
    const codeSig = __hashStringForKey(String(jsCode || ''));
    const stableKey = runtime?.key || (String(taskName || '').trim()) || `js-${codeSig}`;
    const isLightTask = String(taskName).startsWith('[x]');
    let runOwner;
    const STscript = (command) => {
        if (runOwner?.dispatchingAbort) {
            const work = executeTaskSlashCommand(command, stableKey);
            runOwner.cleanupWork.push(work);
            return work;
        }
        if (runOwner?.abort.signal.aborted || !isTaskRuntimeActive(runtime)) return Promise.resolve();
        return executeTaskSlashCommand(command, stableKey, runOwner?.abort.signal);
    };

    const taskContext = {
        taskName: String(taskName || 'AnonymousTask'),
        stableKey,
        codeSig,
        log: (msg, extra) => { try { xbLog.info('scheduledTasks', { task: stableKey, msg: String(msg ?? ''), extra }); } catch (error) { console.warn({ source: import.meta.url, operation: 'executeTaskJS' }, error); } },
        warn: (msg, extra) => { try { xbLog.warn('scheduledTasks', { task: stableKey, msg: String(msg ?? ''), extra }); } catch (error) { console.warn({ source: import.meta.url, operation: 'executeTaskJS' }, error); } },
        error: (msg, err, extra) => { try { xbLog.error('scheduledTasks', { task: stableKey, msg: String(msg ?? ''), extra }, err || null); } catch (error) { console.warn({ source: import.meta.url, operation: 'executeTaskJS' }, error); } }
    };

    const jsRunner = async (utils) => {
        const {
            addListener,
            removeListener,
            setTimeoutSafe,
            clearTimeoutSafe,
            setIntervalSafe,
            clearIntervalSafe,
            abortSignal,
            owner
        } = utils;
        runOwner = owner;

        // Async cleanup must use the supplied STscript, not the cancelled normal
        // capability captured by the task body: onCleanup(async ({ STscript }) => ...).
        const onCleanup = callback => {
            if (typeof callback !== 'function') throw new TypeError('onCleanup callback must be a function');
            if (owner.cleaned) return () => {};
            const cleanup = () => callback({ STscript: command => executeTaskSlashCommand(command, stableKey) });
            owner.cleanupCallbacks.add(cleanup);
            return () => {
                owner.cleanupCallbacks.delete(cleanup);
            };
        };

        const addFloorListener = (callback, options = {}) => {
            if (typeof callback !== 'function') throw new Error('callback 必须是函数');
            if (!owner || owner.cleaned || abortSignal?.aborted) return () => {};
            const callbackId = `${stableKey}_fl_${uuidv4()}`;
            const entryAbort = new AbortController();
            owner.callbackIds.add(callbackId);
            try {
                abortSignal.addEventListener('abort', () => {
                    try { entryAbort.abort(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "addFloorListener" }, caughtError); }
                    state.dynamicCallbacks.delete(callbackId);
                    owner.callbackIds.delete(callbackId);
                }, { once: true });
            } catch (caughtError) { console.warn({ source: import.meta.url, operation: "addFloorListener" }, caughtError); }
            state.dynamicCallbacks.set(callbackId, {
                callback,
                options: {
                    interval: Number.isFinite(parseInt(options.interval)) ? parseInt(options.interval) : 0,
                    timing: options.timing || 'after_ai',
                    floorType: options.floorType || 'all'
                },
                abortController: entryAbort,
                owner
            });
            return () => removeFloorCallback(owner, callbackId);
        };

        const runInScope = async (code) => {
            // eslint-disable-next-line no-new-func -- intentional: user-defined task expression
            const fn = new Function(
                'taskContext', 'ctx', 'STscript', 'addFloorListener',
                'addListener', 'removeListener', 'setTimeoutSafe', 'clearTimeoutSafe', 'setIntervalSafe', 'clearIntervalSafe', 'abortSignal', 'onCleanup',
                `return (async () => { ${code} })();`
            );
            return await fn(taskContext, taskContext, STscript, addFloorListener, addListener, removeListener, setTimeoutSafe, clearTimeoutSafe, setIntervalSafe, clearIntervalSafe, abortSignal, onCleanup);
        };

        return await runInScope(jsCode);
    };

    return await __runTaskSingleInstance(stableKey, jsRunner, codeSig, runtime, isLightTask);
}

function handleTaskMessage(event) {
    if (!event.data || event.data.source !== 'xiaobaix-iframe' || event.data.type !== 'executeTaskJS') return;
    try {
        const script = document.createElement('script');
        script.textContent = event.data.code;
        event.source.document.head.appendChild(script);
        event.source.document.head.removeChild(script);
    } catch (error) { console.error('执行任务JS失败:', error); }
}

// ═══════════════════════════════════════════════════════════════════════════
// 楼层计数
// ═══════════════════════════════════════════════════════════════════════════

function getFloorCounts() {
    const messages = Array.isArray(chat) ? chat : [];
    let user = 0;
    let llm = 0;
    for (const message of messages) {
        if (message.is_system) continue;
        if (message.is_user) user++;
        else llm++;
    }
    return { all: messages.length, user, llm };
}

function pickFloorByType(floorType, counts) {
    switch (floorType) {
        case 'user': return Math.max(0, counts.user - 1);
        case 'llm': return Math.max(0, counts.llm - 1);
        default: return Math.max(0, counts.all - 1);
    }
}

function calculateTurnCount() {
    if (!Array.isArray(chat) || chat.length === 0) return 0;
    const userMessages = chat.filter(msg => msg.is_user && !msg.is_system).length;
    const aiMessages = chat.filter(msg => !msg.is_user && !msg.is_system).length;
    return Math.min(userMessages, aiMessages);
}

// ═══════════════════════════════════════════════════════════════════════════
// 任务触发
// ═══════════════════════════════════════════════════════════════════════════

function shouldSkipByContext(taskTriggerTiming, triggerContext) {
    if (taskTriggerTiming === 'character_init') return triggerContext !== 'chat_created';
    if (taskTriggerTiming === 'plugin_init') return triggerContext !== 'plugin_initialized';
    if (taskTriggerTiming === 'chat_changed') return triggerContext !== 'chat_changed';
    if (taskTriggerTiming === 'only_this_floor' || taskTriggerTiming === 'any_message') {
        return triggerContext !== 'before_user' && triggerContext !== 'after_ai';
    }
    return taskTriggerTiming !== triggerContext;
}

function matchInterval(task, counts, triggerContext) {
    const currentFloor = pickFloorByType(task.floorType || 'all', counts);
    if (currentFloor <= 0) return false;
    if (task.triggerTiming === 'only_this_floor') return currentFloor === task.interval;
    if (task.triggerTiming === 'any_message') return currentFloor % task.interval === 0;
    return currentFloor % task.interval === 0;
}

async function checkAndExecuteTasks(triggerContext = 'after_ai', overrideChatChanged = null, overrideNewChat = null) {
    if (!isGloballyEnabled()) return;
    syncPresetTaskBinding();
    if (isAnyTaskExecuting()) {
        logExecutionLockSkip('checkAndExecuteTasks', { triggerContext, commandGenerated: state.isCommandGenerated });
        return;
    }

    const tasks = await allTasksFull();
    const n = nowMs();
    const counts = getFloorCounts();

    const dynamicTaskList = [];
    if (state.dynamicCallbacks?.size > 0) {
        for (const [callbackId, entry] of state.dynamicCallbacks.entries()) {
            const { callback, options, abortController, owner } = entry || {};
            if (!callback || abortController?.signal?.aborted) {
                removeFloorCallback(owner, callbackId);
                continue;
            }
            const interval = Number.isFinite(parseInt(options?.interval)) ? parseInt(options.interval) : 0;
            dynamicTaskList.push({
                name: callbackId,
                disabled: false,
                interval,
                floorType: options?.floorType || 'all',
                triggerTiming: options?.timing || 'after_ai',
                __dynamic: true,
                __callback: callback,
                __callbackEntry: entry
            });
        }
    }

    const combined = [...tasks, ...dynamicTaskList];
    if (combined.length === 0) return;

    const tasksToExecute = combined.filter(task => {
        if (task.disabled) return false;
        if (isTaskMutationPending(task.__runtime?.key || task.name)) return false;
        if (!isTaskRuntimeActive(task.__runtime)) return false;
        if (isTaskInCooldown(task.__runtime?.key || task.name, n)) return false;
        const tt = task.triggerTiming || 'after_ai';
        if (tt === 'chat_changed') {
            if (shouldSkipByContext(tt, triggerContext)) return false;
            return true;
        }
        if (tt === 'character_init') return triggerContext === 'chat_created';
        if (tt === 'plugin_init') return triggerContext === 'plugin_initialized';
        if ((overrideChatChanged ?? state.chatJustChanged) || (overrideNewChat ?? state.isNewChat)) return false;
        if (task.interval <= 0) return false;
        if (shouldSkipByContext(tt, triggerContext)) return false;
        return matchInterval(task, counts, triggerContext);
    });

    if (tasksToExecute.length === 0) return;

    const execToken = startExecutionRecord(`__trigger__${triggerContext}`, 'system');
    try {
        for (const task of tasksToExecute) {
            if (!isTaskRuntimeActive(task.__runtime)) continue;
            if (isTaskMutationPending(task.__runtime?.key || task.name)) continue;
            state.taskLastExecutionTime.set(task.__runtime?.key || task.name, n);
            if (task.__dynamic) {
                const callbackEntry = state.dynamicCallbacks.get(task.name);
                if (callbackEntry !== task.__callbackEntry || callbackEntry.abortController?.signal?.aborted) continue;
                const owner = callbackEntry.owner;
                if (owner?.cleaned) continue;
                try {
                    const currentFloor = pickFloorByType(task.floorType || 'all', counts);
                    const work = Promise.resolve().then(() => {
                        if (callbackEntry.abortController?.signal?.aborted) return;
                        return task.__callback({
                            timing: triggerContext,
                            floors: counts,
                            currentFloor,
                            interval: task.interval,
                            floorType: task.floorType || 'all'
                        });
                    });
                    await waitForTaskSignal(work, owner?.abort.signal);
                } catch (e) {
                    console.error('[动态回调错误]', task.name, e);
                }
            } else {
                await executeCommands(task.commands, task.name, task.__runtime);
            }
        }
    } finally {
        finishExecutionRecord(execToken);
    }

    if (triggerContext === 'after_ai') state.lastTurnCount = calculateTurnCount();
}

// ═══════════════════════════════════════════════════════════════════════════
// 事件处理
// ═══════════════════════════════════════════════════════════════════════════

async function onMessageReceived(messageId) {
    if (typeof messageId !== 'number' || messageId < 0 || !chat[messageId]) return;
    const message = chat[messageId];
    if (message.is_user || message.is_system || message.mes === '...' ||
        (message.swipe_id !== undefined && message.swipe_id > 0)) return;
    if (!isGloballyEnabled()) return;
    if (state.isCommandGenerated || isAnyTaskExecuting()) {
        logExecutionLockSkip('onMessageReceived', { triggerContext: 'after_ai', messageId, commandGenerated: state.isCommandGenerated });
        return;
    }
    const messageKey = `${getContext().chatId}_${messageId}_${message.send_date || nowMs()}`;
    if (isMessageProcessed(messageKey)) return;
    markMessageAsProcessed(messageKey);
    await checkAndExecuteTasks('after_ai');
    state.chatJustChanged = state.isNewChat = false;
}

async function onGenerationEnded(chatLen) {
    const len = Number(chatLen);
    if (!Number.isFinite(len) || len <= 0) return;
    await onMessageReceived(len - 1);
}

async function onUserMessage() {
    if (!isGloballyEnabled()) return;
    const messageKey = `${getContext().chatId}_user_${chat.length}`;
    if (isMessageProcessed(messageKey)) return;
    markMessageAsProcessed(messageKey);
    await checkAndExecuteTasks('before_user');
    state.chatJustChanged = state.isNewChat = false;
}

function onMessageDeleted() {
    const settings = getSettings();
    const chatId = getContext().chatId;
    settings.processedMessages = settings.processedMessages.filter(key => !key.startsWith(`${chatId}_`));
    state.processedMessagesSet = new Set(settings.processedMessages);
    clearAllExecutionRecords();
    saveSettingsDebounced();
}

async function onChatChanged(chatId) {
    Object.assign(state, {
        chatJustChanged: true,
        isNewChat: state.lastChatId !== chatId && chat.length <= 1,
        lastChatId: chatId,
        lastTurnCount: 0,
    });
    clearAllExecutionRecords();
    state.taskLastExecutionTime.clear();
    TasksStorage.clearCache();

    requestAnimationFrame(() => {
        state.processedMessagesSet.clear();
        const settings = getSettings();
        settings.processedMessages = [];
        observeBackgroundTask(checkEmbeddedTasks(), { source: import.meta.url, operation: "callback" });
        refreshUI();
        observeBackgroundTask(checkAndExecuteTasks('chat_changed', false, false), { source: import.meta.url, operation: "callback" });
        requestAnimationFrame(() => requestAnimationFrame(() => { try { updateTaskBar(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "onChatChanged" }, caughtError); } }));
    });

    setTimeout(() => { state.chatJustChanged = state.isNewChat = false; }, 2000);
}

async function onChatCreated() {
    Object.assign(state, { isNewChat: true, chatJustChanged: true });
    await checkAndExecuteTasks('chat_created', false, false);
}

// This entry point is opt-in and separate from legacy message/init scheduling.
// Pending activation waits for host readiness and existing work, never drops the event.
let presetTaskHostReady = false;
let presetTaskInitialization = null;
let presetTaskStartup = null;
let presetTaskStartupQueued = false;
let presetTaskStartupRunning = false;

function beginPresetTaskInitialization() {
    return presetTaskInitialization = { ready: false };
}

function finishPresetTaskInitialization(initialization) {
    if (presetTaskInitialization !== initialization) return;
    initialization.ready = true;
    requestPresetTaskStartup();
}

function requestPresetTaskStartup() {
    if (!presetTaskStartup?.pending || presetTaskStartupQueued || presetTaskStartupRunning) return;
    presetTaskStartupQueued = true;
    observeBackgroundTask(Promise.resolve().then(async () => {
        presetTaskStartupQueued = false;
        const activation = presetTaskStartup;
        if (!activation?.pending || !activation.ready || !presetTaskHostReady || !presetTaskInitialization?.ready || !window.__XB_TASKS_INITIALIZED__
            || !isGloballyEnabled() || isAnyTaskExecuting()) return;
        if (!isTaskRuntimeActive({ preset: activation.preset })) return;
        activation.pending = false;
        presetTaskStartupRunning = true;
        try {
            const names = getPresetTasks().filter(task => getTaskTriggerTiming(task, 'preset') === PRESET_START_TIMING).map(task => task.name);
            for (const name of names) {
                if (!isTaskRuntimeActive({ preset: activation.preset })) break;
                // An earlier startup may await. Read the next task only when it can run.
                const task = getPresetTasks().find(item => item.name === name && getTaskTriggerTiming(item, 'preset') === PRESET_START_TIMING && !item.disabled);
                if (!task) continue;
                const runtime = captureTaskRuntime(task, 'preset');
                if (isTaskMutationPending(runtime.key) || (__taskRunMap.get(runtime.key) && !__taskRunMap.get(runtime.key).cleaned)) continue;
                await executeCommands(task.commands, task.name, runtime);
            }
        } finally {
            presetTaskStartupRunning = false;
            requestPresetTaskStartup();
        }
    }), { source: import.meta.url, operation: 'presetStartup' });
}

function refreshPresetTasks({ hostReady = false, initialize = false, selection = false, appliedName, apiChanged = false } = {}) {
    if (hostReady) presetTaskHostReady = true;
    const imported = consumePresetTaskImport(PresetTasksStore.currentSource());
    if (imported) {
        PresetTasksStore.imported(PresetTasksStore.currentName());
        presetTaskBinding?.abort.abort();
        presetTaskBinding = null;
    }
    syncPresetTaskBinding();
    resetPresetTasksCache();
    state.lastTasksHash = '';
    refreshUI();
    if (initialize || imported || presetTaskStartup?.preset.name !== presetTaskBinding.name) {
        presetTaskStartup = { preset: presetTaskBinding, pending: !!presetTaskBinding.name, ready: false };
    }
    // Selection stops the previous visit immediately. Startup waits for the host
    // to finish applying this preset's settings, rather than an earlier AFTER event.
    if (selection && presetTaskStartup.pending) presetTaskStartup.ready = false;
    if (hostReady || initialize || apiChanged || appliedName === presetTaskBinding.name) presetTaskStartup.ready = true;
    requestPresetTaskStartup();
}

// ═══════════════════════════════════════════════════════════════════════════
// UI 列表
// ═══════════════════════════════════════════════════════════════════════════

function getTasksHash() {
    const globalTasks = getSettings().globalTasks;
    const characterTasks = getCharacterTasks();
    const presetTasks = getPresetTasks();
    const presetName = PresetTasksStore.currentName();
    const all = [...globalTasks, ...characterTasks, ...presetTasks];
    return `${presetName || ''}|${all.map(t => `${t.id}_${t.disabled}_${t.name}_${t.interval}_${t.floorType}_${t.triggerTiming || 'after_ai'}`).join('|')}`;
}

function createTaskItemSimple(task, scope = 'global') {
    if (!task.id) task.id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const taskType = scope || 'global';
    const floorTypeText = { user: '用户楼层', llm: 'LLM楼层' }[task.floorType] || '全部楼层';
    const triggerTimingText = {
        before_user: '用户前',
        any_message: '任意对话',
        initialization: '角色卡初始化',
        character_init: '角色卡初始化',
        plugin_init: '插件初始化',
        only_this_floor: '仅该楼层',
        chat_changed: '切换聊天后'
    }[task.triggerTiming] || 'AI后';

    let displayName;
    if (taskType === 'preset' && getTaskTriggerTiming(task, 'preset') === PRESET_START_TIMING) {
        displayName = `${task.name} (${PRESET_START_LABEL})`;
    } else if (task.interval === 0) {
        displayName = `${task.name} (手动触发)`;
    } else if (task.triggerTiming === 'initialization' || task.triggerTiming === 'character_init') {
        displayName = `${task.name} (角色卡初始化)`;
    } else if (task.triggerTiming === 'plugin_init') {
        displayName = `${task.name} (插件初始化)`;
    } else if (task.triggerTiming === 'chat_changed') {
        displayName = `${task.name} (切换聊天后)`;
    } else if (task.triggerTiming === 'only_this_floor') {
        displayName = `${task.name} (仅第${task.interval}${floorTypeText})`;
    } else {
        displayName = `${task.name} (每${task.interval}${floorTypeText}·${triggerTimingText})`;
    }

    const taskElement = $('#task_item_template').children().first().clone();
    taskElement.attr({ id: task.id, 'data-task-id': task.id, 'data-type': taskType });
    taskElement.find('.task_name').attr('title', task.name).text(displayName);
    taskElement.find('.disable_task').attr('id', `task_disable_${task.id}`).prop('checked', task.disabled);
    taskElement.find('label.checkbox').attr('for', `task_disable_${task.id}`);
    return taskElement;
}

function initSortable($list, onUpdate) {
    const inst = (() => { try { return $list.sortable('instance'); } catch { return undefined; } })();
    if (inst) return;
    $list.sortable({
        delay: getSortableDelay?.() || 0,
        handle: '.drag-handle.menu-handle',
        items: '> .task-item',
        update: onUpdate
    });
}

function updateTaskCounts(globalCount, characterCount, presetCount) {
    const globalEl = document.getElementById('global_task_count');
    const characterEl = document.getElementById('character_task_count');
    const presetEl = document.getElementById('preset_task_count');
    if (globalEl) globalEl.textContent = globalCount > 0 ? `(${globalCount})` : '';
    if (characterEl) characterEl.textContent = characterCount > 0 ? `(${characterCount})` : '';
    if (presetEl) presetEl.textContent = presetCount > 0 ? `(${presetCount})` : '';
}

function refreshTaskLists() {
    updatePresetTaskHint();
    const currentHash = getTasksHash();
    if (currentHash === state.lastTasksHash) {
        updateTaskBar();
        return;
    }
    state.lastTasksHash = currentHash;

    const $globalList = $('#global_tasks_list');
    const $charList = $('#character_tasks_list');
    const $presetList = $('#preset_tasks_list');

    const globalTasks = getSettings().globalTasks;
    const characterTasks = getCharacterTasks();
    const presetTasks = getPresetTasks();

    updateTaskCounts(globalTasks.length, characterTasks.length, presetTasks.length);

    const globalFragment = document.createDocumentFragment();
    globalTasks.forEach((task) => { globalFragment.appendChild(createTaskItemSimple(task, 'global')[0]); });
    $globalList.empty().append(globalFragment);

    const charFragment = document.createDocumentFragment();
    characterTasks.forEach((task) => { charFragment.appendChild(createTaskItemSimple(task, 'character')[0]); });
    $charList.empty().append(charFragment);

    if ($presetList.length) {
        const presetFragment = document.createDocumentFragment();
        presetTasks.forEach((task) => { presetFragment.appendChild(createTaskItemSimple(task, 'preset')[0]); });
        $presetList.empty().append(presetFragment);
    }

    initSortable($globalList, async function () {
        const newOrderIds = $globalList.sortable('toArray');
        const current = getSettings().globalTasks;
        const idToTask = new Map(current.map(t => [t.id, t]));
        const reordered = newOrderIds.map(id => idToTask.get(id)).filter(Boolean);
        const leftovers = current.filter(t => !newOrderIds.includes(t.id));
        await persistTaskListByScope('global', [...reordered, ...leftovers]);
        refreshTaskLists();
    });

    initSortable($charList, async function () {
        const newOrderIds = $charList.sortable('toArray');
        const current = getCharacterTasks();
        const idToTask = new Map(current.map(t => [t.id, t]));
        const reordered = newOrderIds.map(id => idToTask.get(id)).filter(Boolean);
        const leftovers = current.filter(t => !newOrderIds.includes(t.id));
        await saveCharacterTasks([...reordered, ...leftovers]);
        refreshTaskLists();
    });

    if ($presetList.length) {
        initSortable($presetList, async function () {
            const newOrderIds = $presetList.sortable('toArray');
            const current = getPresetTasks();
            const idToTask = new Map(current.map(t => [t.id, t]));
            const reordered = newOrderIds.map(id => idToTask.get(id)).filter(Boolean);
            const leftovers = current.filter(t => !newOrderIds.includes(t.id));
            await savePresetTasks([...reordered, ...leftovers]);
            refreshTaskLists();
        });
    }

    updateTaskBar();
}

function updatePresetTaskHint() {
    const hint = document.getElementById('preset_tasks_hint');
    if (!hint) return;
    const presetName = PresetTasksStore.currentName();
    state.lastPresetName = presetName || '';
    if (!presetName) {
        hint.textContent = '未选择';
        hint.classList.add('no-preset');
        hint.title = '请在OpenAI设置中选择预设';
    } else {
        hint.textContent = `${presetName}`;
        hint.classList.remove('no-preset');
        hint.title = `当前OpenAI预设：${presetName}`;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 任务栏
// ═══════════════════════════════════════════════════════════════════════════

const cache = { bar: null, btns: null, ownsBar: false, sig: '', ts: 0 };

const getActivatedTasks = () => isGloballyEnabled() ? allTasks().filter(t => t.buttonActivated && !t.disabled) : [];

const getBar = () => {
    if (cache.bar?.isConnected) return cache.bar;
    cache.bar = null;
    cache.btns = null;
    cache.ownsBar = false;
    cache.bar = document.getElementById('qr--bar') || document.getElementById('qr-bar');
    if (!cache.bar && !(window.quickReplyApi?.settings?.isEnabled || extension_settings?.quickReplyV2?.isEnabled)) {
        const parent = document.getElementById('send_form') || document.body;
        cache.bar = parent.insertBefore(
            Object.assign(document.createElement('div'), {
                id: 'qr-bar',
                className: 'flex-container flexGap5',
                innerHTML: '<div class="qr--buttons" style="display:flex;flex-wrap:wrap;justify-content:center"></div>'
            }),
            parent.firstChild
        );
        cache.ownsBar = true;
    }
    cache.btns = cache.bar?.querySelector('.qr--buttons');
    return cache.bar;
};

function applyTaskBarVisibility() {
    const bar = cache.bar;
    if (!bar) return;
    if (cache.ownsBar) bar.style.display = state.taskBarVisible ? '' : 'none';
    bar.querySelectorAll('.xiaobaix-task-button').forEach(button => {
        button.style.display = state.taskBarVisible ? '' : 'none';
    });
}

function createTaskBar() {
    if (!window.__XB_TASKS_INITIALIZED__) return;
    const tasks = getActivatedTasks();
    const sig = state.taskBarVisible ? tasks.map(t => t.name).join() : '';
    if (sig === cache.sig && Date.now() - cache.ts < 100) return;
    const bar = getBar();
    if (!bar) return;
    applyTaskBarVisibility();
    if (!state.taskBarVisible) return;
    const btns = cache.btns || bar;
    const exist = new Map([...btns.querySelectorAll('.xiaobaix-task-button')].map(el => [el.dataset.taskName, el]));
    const names = new Set(tasks.map(t => t.name));
    exist.forEach((el, name) => !names.has(name) && el.remove());
    const frag = document.createDocumentFragment();
    tasks.forEach(t => {
        if (!exist.has(t.name)) {
            const btn = Object.assign(document.createElement('button'), {
                className: 'menu_button menu_button_icon xiaobaix-task-button interactable',
                innerHTML: `<span>${t.name}</span>`
            });
            btn.dataset.taskName = t.name;
            frag.appendChild(btn);
        }
    });
    frag.childNodes.length && btns.appendChild(frag);
    applyTaskBarVisibility();
    cache.sig = sig;
    cache.ts = Date.now();
}

const updateTaskBar = debounce(createTaskBar, 100);

function toggleTaskBarVisibility() {
    state.taskBarVisible = !state.taskBarVisible;
    getBar();
    applyTaskBarVisibility();
    createTaskBar();
    const btn = document.getElementById('toggle_task_bar');
    const txt = btn?.querySelector('small');
    if (txt) {
        txt.style.cssText = state.taskBarVisible ? 'opacity:1;text-decoration:none' : 'opacity:.5;text-decoration:line-through';
        btn.title = state.taskBarVisible ? '隐藏任务栏' : '显示任务栏';
    }
}

function handleTaskBarClick(e) {
    const btn = e.target.closest('.xiaobaix-task-button');
    if (!btn) return;
    if (!isGloballyEnabled()) return;
    window.xbqte(btn.dataset.taskName).catch(console.error);
}

// ═══════════════════════════════════════════════════════════════════════════
// 任务编辑器
// ═══════════════════════════════════════════════════════════════════════════

async function showTaskEditor(task = null, isEdit = false, scope = 'global') {
    const editorToken = Symbol('task-editor');
    const initialScope = scope || 'global';
    const initialTarget = captureTaskSaveTarget(initialScope);
    const sourceList = getTaskListByScope(initialScope);
    const sourceIndex = sourceList.indexOf(task);
    
    if (task && scope === 'global') {
        try {
            task = { ...task, commands: await readGlobalTaskCommands(task) };
        } catch (error) {
            console.error('[循环任务] 打开任务失败', error);
            toastr?.error?.(`打开任务失败：${error?.message || error}`);
            return;
        }
    }
    
    state.currentEditingTask = task;
    state.currentEditingScope = initialScope;
    state.currentEditingIndex = isEdit ? sourceIndex : -1;
    state.currentEditingId = task?.id || null;
    state.currentEditorToken = editorToken;

    const editorTemplate = $('#task_editor_template').clone().removeAttr('id').show();
    editorTemplate.find('.task_name_edit').val(task?.name || '');
    editorTemplate.find('.task_commands_edit').val(task?.commands || '');
    editorTemplate.find('.task_interval_edit').val(task?.interval ?? 3);
    editorTemplate.find('.task_floor_type_edit').val(task?.floorType || 'all');
    const presetStartOption = document.createElement('option');
    presetStartOption.value = PRESET_START_TIMING;
    presetStartOption.textContent = PRESET_START_LABEL;
    editorTemplate.find('.task_trigger_timing_edit').append(presetStartOption);
    const initialTiming = getTaskTriggerTiming(task, initialScope) || 'after_ai';
    editorTemplate.find('.task_trigger_timing_edit').val(initialTiming === 'character_init' ? 'initialization' : initialTiming);
    editorTemplate.find('.task_type_edit').val(initialScope);
    editorTemplate.find('.task_enabled_edit').prop('checked', !task?.disabled);
    editorTemplate.find('.task_button_activated_edit').prop('checked', task?.buttonActivated || false);

    function updateWarningDisplay() {
        const interval = parseInt(editorTemplate.find('.task_interval_edit').val()) || 0;
        const triggerTiming = editorTemplate.find('.task_trigger_timing_edit').val();
        const floorType = editorTemplate.find('.task_floor_type_edit').val();
        let warningElement = editorTemplate.find('.trigger-timing-warning');
        if (warningElement.length === 0) {
            warningElement = $('<div class="trigger-timing-warning" style="color:#ff6b6b;font-size:.8em;margin-top:4px;"></div>');
            editorTemplate.find('.task_trigger_timing_edit').parent().append(warningElement);
        }
        const shouldShowWarning = interval > 0 && floorType === 'all' && (triggerTiming === 'after_ai' || triggerTiming === 'before_user');
        if (shouldShowWarning) {
            warningElement.html('⚠️ 警告：选择"全部楼层"配合"AI消息后"或"用户消息前"可能因楼层编号不匹配而不触发').show();
        } else {
            warningElement.hide();
        }
    }

    function updateControlStates() {
        const isPreset = editorTemplate.find('.task_type_edit').val() === 'preset';
        presetStartOption.hidden = !isPreset;
        presetStartOption.disabled = !isPreset;
        if (!isPreset && editorTemplate.find('.task_trigger_timing_edit').val() === PRESET_START_TIMING) {
            editorTemplate.find('.task_trigger_timing_edit').val('chat_changed');
        }
        const interval = parseInt(editorTemplate.find('.task_interval_edit').val()) || 0;
        const triggerTiming = editorTemplate.find('.task_trigger_timing_edit').val();
        const intervalControl = editorTemplate.find('.task_interval_edit');
        const floorTypeControl = editorTemplate.find('.task_floor_type_edit');
        const triggerTimingControl = editorTemplate.find('.task_trigger_timing_edit');
        editorTemplate.find('.task_interval_edit + small, .task_floor_type_edit + small')
            .css('display', isPreset && triggerTiming === PRESET_START_TIMING ? 'none' : '');

        if (isPreset && triggerTiming === PRESET_START_TIMING) {
            intervalControl.prop('disabled', true).css('opacity', '0.5');
            floorTypeControl.prop('disabled', true).css('opacity', '0.5');
            triggerTimingControl.prop('disabled', false).css('opacity', '1');
            editorTemplate.find('.manual-trigger-hint').hide();
        } else if (interval === 0) {
            intervalControl.prop('disabled', false).css('opacity', '1');
            floorTypeControl.prop('disabled', true).css('opacity', '0.5');
            triggerTimingControl.prop('disabled', !isPreset).css('opacity', isPreset ? '1' : '0.5');
            let manualTriggerHint = editorTemplate.find('.manual-trigger-hint');
            if (manualTriggerHint.length === 0) {
                manualTriggerHint = $('<small class="manual-trigger-hint" style="color:#888;">手动触发</small>');
                triggerTimingControl.parent().append(manualTriggerHint);
            }
            manualTriggerHint.show();
        } else {
            floorTypeControl.prop('disabled', false).css('opacity', '1');
            triggerTimingControl.prop('disabled', false).css('opacity', '1');
            editorTemplate.find('.manual-trigger-hint').hide();
            if (triggerTiming === 'initialization' || triggerTiming === 'plugin_init' || triggerTiming === 'chat_changed') {
                intervalControl.prop('disabled', true).css('opacity', '0.5');
                floorTypeControl.prop('disabled', true).css('opacity', '0.5');
            } else {
                intervalControl.prop('disabled', false).css('opacity', '1');
                floorTypeControl.prop('disabled', false).css('opacity', '1');
            }
        }
        updateWarningDisplay();
    }

    editorTemplate.find('.task_interval_edit').on('input', updateControlStates);
    editorTemplate.find('.task_trigger_timing_edit').on('change', updateControlStates);
    editorTemplate.find('.task_floor_type_edit').on('change', updateControlStates);
    editorTemplate.find('.task_type_edit').on('change', updateControlStates);
    updateControlStates();

    // A failed attempt must retry the same task, not create another identity.
    const draftId = task?.id || uuidv4();
    // Only this open editor owns its migration receipts. Include attempted writes:
    // a failed confirmation can still mean the server accepted the destination.
    const edit = { task, isEdit, scope: initialScope,
        runtime: task ? captureTaskRuntime(task, initialScope) : null,
        locations: new Map(isEdit ? [[initialScope, initialTarget]] : []),
    };
    const onClosing = createTaskEditorSaveHandler(editorTemplate[0], async signal => {
        const desiredName = String(editorTemplate.find('.task_name_edit').val() || '').trim();
        const existingNames = new Set(allTasks().filter(t => t.id !== draftId).map(t => (t?.name || '').trim().toLowerCase()));
        let uniqueName = desiredName;
        if (desiredName && (!isEdit || (isEdit && task?.name?.toLowerCase() !== desiredName.toLowerCase()))) {
            if (existingNames.has(desiredName.toLowerCase())) {
                let idx = 1;
                while (existingNames.has(`${desiredName}${idx}`.toLowerCase())) idx++;
                uniqueName = `${desiredName}${idx}`;
            }
        }

        const base = edit.task ? structuredClone(edit.task) : {};
        const selectedTriggerTiming = editorTemplate.find('.task_trigger_timing_edit').val() || 'after_ai';
        const newTask = {
            ...base,
            id: draftId,
            name: uniqueName,
            commands: String(editorTemplate.find('.task_commands_edit').val() || ''),
            interval: parseInt(String(editorTemplate.find('.task_interval_edit').val() || '0'), 10) || 0,
            floorType: editorTemplate.find('.task_floor_type_edit').val() || 'all',
            triggerTiming: task?.triggerTiming === 'character_init' && selectedTriggerTiming === 'initialization'
                ? 'character_init'
                : selectedTriggerTiming,
            disabled: !editorTemplate.find('.task_enabled_edit').prop('checked'),
            buttonActivated: editorTemplate.find('.task_button_activated_edit').prop('checked'),
            createdAt: base.createdAt || new Date().toISOString(),
        };
        const targetScope = String(editorTemplate.find('.task_type_edit').val() || initialScope);
        await saveTaskFromEditor(setTaskTriggerTiming(newTask, newTask.triggerTiming, targetScope), targetScope, edit, signal);
    }, POPUP_RESULT.AFFIRMATIVE);
    observeBackgroundTask(callGenericPopup(editorTemplate, POPUP_TYPE.CONFIRM, '', {
        okButton: TASK_SAVE_COPY.save, cancelButton: TASK_SAVE_COPY.cancel, onClosing,
    }).then(() => {
        if (state.currentEditorToken === editorToken) resetTaskEditorState();
    }), { source: import.meta.url, operation: 'showTaskEditor' });
}

function resetTaskEditorState() {
    state.currentEditingTask = null;
    state.currentEditingIndex = -1;
    state.currentEditingId = null;
    state.currentEditingScope = 'global';
    state.currentEditorToken = null;
}

function captureTaskSaveTarget(scope) {
    if (scope === 'character') return { character: characters[this_chid] };
    if (scope === 'preset') return { name: PresetTasksStore.currentName() };
    return {};
}

async function saveTaskFromEditor(task, scope, edit, signal) {
    const targetScope = scope === 'character' || scope === 'preset' ? scope : 'global';
    if (targetScope !== 'global') {
        task = { ...task };
        delete task.scriptId;
    }
    const isManual = (task?.interval === 0);
    const isEditingExistingTask = edit.isEdit;
    if (!task.name) throw new Error(TASK_SAVE_COPY.nameRequired);
    if (!isEditingExistingTask && !isManual && !task.commands) throw new Error(TASK_SAVE_COPY.commandsRequired);

    const previousTask = isEditingExistingTask ? edit.task : null;
    const previousName = previousTask?.name;
    const previousRuntime = edit.runtime;
    const shouldResetPreviousRun = !!previousName && (
        normalizeTaskKey(previousName) !== normalizeTaskKey(task.name)
        || String(previousTask?.commands ?? '') !== String(task.commands ?? '')
        || (!previousTask?.disabled && task.disabled === true)
    );
    const previousScope = edit.scope;
    const taskTypeChanged = isEditingExistingTask && previousScope !== targetScope;

    const target = edit.locations.get(targetScope) || captureTaskSaveTarget(targetScope);
    if (targetScope === 'preset' && !target.name) {
        throw new Error(TASK_SAVE_COPY.presetRequired);
    }
    if (targetScope === 'character' && !target.character) throw new Error(TASK_SAVE_COPY.characterRequired);
    if (!previousTask?.disabled && task.disabled) resetTaskRun(previousRuntime?.key);
    const list = [...getTaskListByScope(targetScope, target)];
    const idx = list.findIndex(t => t?.id === task.id);
    
    if (idx >= 0 && idx < list.length) {
        list[idx] = task;
    } else {
        list.push(task);
    }

    edit.locations.set(targetScope, target);
    await persistTaskListByScope(targetScope, list, { signal, target });
    // Keep the source until the destination has acknowledged the new definition.
    // Retry every recorded old location, even if its local list is already empty.
    for (const [oldScope, oldTarget] of edit.locations) {
        if (oldScope === targetScope) continue;
        await removeTaskByScope(oldScope, task.id, -1, { signal, target: oldTarget });
        edit.locations.delete(oldScope);
    }

    // A failed save/source removal leaves the original instance usable.
    if (shouldResetPreviousRun || taskTypeChanged) resetTaskRun(previousRuntime?.key);
    edit.task = task;
    edit.scope = targetScope;
    edit.isEdit = true;
    edit.runtime = captureTaskRuntime(task, targetScope);

    state.lastTasksHash = '';
    refreshUI();
}


async function editTask(index, scope) {
    const list = getTaskListByScope(scope);
    const task = list[index];
    if (task) observeBackgroundTask(showTaskEditor(task, true, scope), { source: import.meta.url, operation: 'editTask' });
}

async function deleteTask(index, scope) {
    const list = getTaskListByScope(scope);
    const task = list[index];
    if (!task) return;
    const runtime = captureTaskRuntime(task, scope);
    const target = scope === 'preset' ? captureTaskSaveTarget(scope) : undefined;

    try {
        const styleId = 'temp-dialog-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = '#dialogue_popup_ok, #dialogue_popup_cancel { width: auto !important; }';
            document.head.appendChild(style);
        }
        const result = await callPopup(`确定要删除任务 "${task.name}" 吗？`, 'confirm');
        document.getElementById(styleId)?.remove();
        if (result) {
            const release = holdTaskMutation(runtime.key);
            resetTaskRun(runtime.key);
            try { await removeTaskByScope(scope, task.id, index, { target }); }
            finally { release(); }
            if (state.currentEditingId === task.id || (state.currentEditingScope === scope && state.currentEditingIndex === index)) {
                resetTaskEditorState();
            }
            refreshUI();
        }
    } catch (error) {
        console.error('删除任务时出错:', error);
        document.getElementById('temp-dialog-style')?.remove();
    }
}

const getAllTaskNames = () => allTasks().filter(t => !t.disabled).map(t => t.name);

// ═══════════════════════════════════════════════════════════════════════════
// 嵌入式任务
// ═══════════════════════════════════════════════════════════════════════════

async function checkEmbeddedTasks() {
    if (this_chid == null || !characters[this_chid]) return;
    const avatar = characters[this_chid]?.avatar;
    const tasks = characters[this_chid]?.data?.extensions?.[TASKS_MODULE_NAME]?.tasks;

    if (Array.isArray(tasks) && tasks.length > 0 && avatar) {
        const settings = getSettings();
        settings.character_allowed_tasks ??= [];

        if (!settings.character_allowed_tasks.includes(avatar)) {
            const checkKey = `AlertTasks_${avatar}`;
            if (!accountStorage.getItem(checkKey)) {
                accountStorage.setItem(checkKey, 'true');
                let result;
                try {
                    const templateFilePath = `scripts/extensions/third-party/LittleWhiteBox/modules/scheduled-tasks/embedded-tasks.html`;
                    const templateContent = await fetch(templateFilePath).then(r => r.text());
                    const templateElement = $(templateContent);
                    const taskListContainer = templateElement.find('#embedded-tasks-list');
                    tasks.forEach(task => {
                        const taskPreview = $('#task_preview_template').children().first().clone();
                        taskPreview.find('.task-preview-name').text(task.name);
                        taskPreview.find('.task-preview-interval').text(`(每${task.interval}回合)`);
                        taskPreview.find('.task-preview-commands').text(task.commands);
                        taskListContainer.append(taskPreview);
                    });
                    result = await callGenericPopup(templateElement, POPUP_TYPE.CONFIRM, '', { okButton: '允许' });
                } catch {
                    result = await callGenericPopup(`此角色包含 ${tasks.length} 个定时任务。是否允许使用？`, POPUP_TYPE.CONFIRM, '', { okButton: '允许' });
                }
                if (result) {
                    settings.character_allowed_tasks.push(avatar);
                    saveSettingsDebounced();
                }
            }
        }
    }
    refreshTaskLists();
}

// ═══════════════════════════════════════════════════════════════════════════
// 云端任务
// ═══════════════════════════════════════════════════════════════════════════

const CLOUD_TASKS_API = 'https://task.whitelittlebox.qzz.io/';

async function fetchCloudTasks() {
    try {
        const response = await fetch(CLOUD_TASKS_API, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'X-Plugin-Key': 'xbaix', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
            cache: 'no-store'
        });
        if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('获取云端任务失败:', error);
        throw error;
    }
}

async function downloadAndImportCloudTask(taskUrl, taskType) {
    try {
        const response = await fetch(taskUrl);
        if (!response.ok) throw new Error(`下载失败: ${response.status}`);
        const taskData = await response.json();
        const jsonString = JSON.stringify(taskData);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const file = new File([blob], 'cloud_task.json', { type: 'application/json' });
        await importGlobalTasks(file);
    } catch (error) {
        console.error('下载并导入云端任务失败:', error);
        await callGenericPopup(`导入失败: ${error.message}`, POPUP_TYPE.TEXT, '', { okButton: '确定' });
    }
}

async function showCloudTasksModal() {
    const modalTemplate = $('#cloud_tasks_modal_template').children().first().clone();
    const loadingEl = modalTemplate.find('.cloud-tasks-loading');
    const contentEl = modalTemplate.find('.cloud-tasks-content');
    const errorEl = modalTemplate.find('.cloud-tasks-error');

    // The popup promise settles when the user closes it, not when it becomes visible.
    observeBackgroundTask(callGenericPopup(modalTemplate, POPUP_TYPE.TEXT, '', { okButton: '关闭' }), {
        source: import.meta.url, operation: 'showCloudTasksModal',
    });

    try {
        const cloudTasks = await fetchCloudTasks();
        if (!cloudTasks || cloudTasks.length === 0) throw new Error('云端没有可用的任务');
        const globalTasks = cloudTasks.filter(t => t.type === 'global');
        const characterTasks = cloudTasks.filter(t => t.type === 'character');

        const globalList = modalTemplate.find('.cloud-global-tasks');
        if (globalTasks.length === 0) {
            globalList.html('<div style="color: #888; padding: 10px;">暂无全局任务</div>');
        } else {
            globalTasks.forEach(task => { globalList.append(createCloudTaskItem(task)); });
        }

        const characterList = modalTemplate.find('.cloud-character-tasks');
        if (characterTasks.length === 0) {
            characterList.html('<div style="color: #888; padding: 10px;">暂无角色任务</div>');
        } else {
            characterTasks.forEach(task => { characterList.append(createCloudTaskItem(task)); });
        }

        loadingEl.hide();
        contentEl.show();
    } catch (error) {
        loadingEl.hide();
        errorEl.text(`加载失败: ${error.message}`).show();
    }
}

function createCloudTaskItem(taskInfo) {
    const item = $('#cloud_task_item_template').children().first().clone();
    item.find('.cloud-task-name').text(taskInfo.name || '未命名任务');
    item.find('.cloud-task-intro').text(taskInfo.简介 || taskInfo.intro || '无简介');
    item.find('.cloud-task-download').on('click', observeAsyncCallback(async function () {
        $(this).prop('disabled', true).find('i').removeClass('fa-download').addClass('fa-spinner fa-spin');
        try {
            await downloadAndImportCloudTask(taskInfo.url, taskInfo.type);
            $(this).find('i').removeClass('fa-spinner fa-spin').addClass('fa-check');
            $(this).find('small').text('已导入');
            setTimeout(() => {
                $(this).find('i').removeClass('fa-check').addClass('fa-download');
                $(this).find('small').text('导入');
                $(this).prop('disabled', false);
            }, 2000);
        } catch (error) {
            $(this).find('i').removeClass('fa-spinner fa-spin').addClass('fa-download');
            $(this).prop('disabled', false);
        }
    }, { source: import.meta.url, operation: "callback" }));
    return item;
}

// ═══════════════════════════════════════════════════════════════════════════
// 导入导出
// ═══════════════════════════════════════════════════════════════════════════


async function exportSingleTask(index, scope) {
    const list = getTaskListByScope(scope);
    if (index < 0 || index >= list.length) return;
    
    let task = list[index];
    if (scope === 'global') {
        try {
            task = { ...task, commands: await readGlobalTaskCommands(task) };
        } catch (error) {
            console.error('[循环任务] 导出任务失败', error);
            toastr?.error?.(`导出任务失败：${error?.message || error}`);
            return;
        }
    }
    
    task = { ...task };
    delete task.scriptId;
    const fileName = `${scope}_task_${task?.name || 'unnamed'}_${new Date().toISOString().split('T')[0]}.json`;
    const fileData = JSON.stringify({ type: scope, exportDate: new Date().toISOString(), tasks: [task] }, null, 4);
    download(fileData, fileName, 'application/json');
}

async function importGlobalTasks(file) {
    if (!file) return;
    try {
        const fileText = await getFileText(file);
        const raw = JSON.parse(fileText);
        let incomingTasks = [];
        let fileType = 'global';

        if (Array.isArray(raw)) {
            incomingTasks = raw;
            fileType = 'global';
        } else if (raw && Array.isArray(raw.tasks)) {
            incomingTasks = raw.tasks;
            if (raw.type === 'character' || raw.type === 'global' || raw.type === 'preset') fileType = raw.type;
        } else if (raw && typeof raw === 'object' && raw.name && (raw.commands || raw.interval !== undefined)) {
            incomingTasks = [raw];
            if (raw.type === 'character' || raw.type === 'global' || raw.type === 'preset') fileType = raw.type;
        } else {
            throw new Error('无效的任务文件格式');
        }

        const VALID_FLOOR = ['all', 'user', 'llm'];
        const VALID_TIMING = ['after_ai', 'before_user', 'any_message', 'initialization', 'character_init', 'plugin_init', 'only_this_floor', 'chat_changed'];
        const deepClone = (o) => JSON.parse(JSON.stringify(o || {}));
        
        const tasksToImport = incomingTasks
            .filter(t => (t?.name || '').trim() && (String(t?.commands || '').trim() || t.interval === 0))
            .map(src => ({
                id: uuidv4(),
                name: String(src.name || '').trim(),
                commands: String(src.commands || '').trim(),
                interval: clampInt(src.interval, 0, 99999, 0),
                floorType: VALID_FLOOR.includes(src.floorType) ? src.floorType : 'all',
                triggerTiming: VALID_TIMING.includes(src.triggerTiming) ? src.triggerTiming : 'after_ai',
                disabled: !!src.disabled,
                buttonActivated: !!src.buttonActivated,
                createdAt: src.createdAt || new Date().toISOString(),
                importedAt: new Date().toISOString(),
                x: (src.x && typeof src.x === 'object') ? deepClone(src.x) : {}
            }));

        if (!tasksToImport.length) throw new Error('没有可导入的任务');

        if (fileType === 'character') {
            if (this_chid == null || !characters[this_chid]) {
                toastr?.warning?.('角色任务请先在角色聊天界面导入。');
                return;
            }
            const current = getCharacterTasks();
            await saveCharacterTasks([...current, ...tasksToImport]);
        } else if (fileType === 'preset') {
            const presetName = PresetTasksStore.currentName();
            if (!presetName) {
                toastr?.warning?.('请先选择一个OpenAI预设后再导入预设任务。');
                return;
            }
            const current = getPresetTasks();
            await savePresetTasks([...current, ...tasksToImport]);
        } else {
            const currentMeta = getSettings().globalTasks;
            const merged = [...currentMeta, ...tasksToImport];
            await persistTaskListByScope('global', merged);
        }

        refreshTaskLists();
        toastr?.success?.(`已导入 ${tasksToImport.length} 个任务`);
    } catch (error) {
        console.error('任务导入失败:', error);
        toastr?.error?.(`导入失败：${error.message}`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 调试工具
// ═══════════════════════════════════════════════════════════════════════════

function clearProcessedMessages() {
    getSettings().processedMessages = [];
    state.processedMessagesSet.clear();
    saveSettingsDebounced();
}

function clearTaskCooldown(taskName = null) {
    taskName ? state.taskLastExecutionTime.delete(taskName) : state.taskLastExecutionTime.clear();
}

function getTaskCooldownStatus() {
    const status = {};
    for (const [taskName, lastTime] of state.taskLastExecutionTime.entries()) {
        const remaining = Math.max(0, CONFIG.TASK_COOLDOWN - (nowMs() - lastTime));
        status[taskName] = { lastExecutionTime: lastTime, remainingCooldown: remaining, isInCooldown: remaining > 0 };
    }
    return status;
}

function getMemoryUsage() {
    return {
        processedMessages: getSettings().processedMessages.length,
        taskCooldowns: state.taskLastExecutionTime.size,
        globalTasks: getSettings().globalTasks.length,
        characterTasks: getCharacterTasks().length,
        scriptCache: TasksStorage.getCacheSize(),
        maxProcessedMessages: CONFIG.MAX_PROCESSED,
        maxCooldownEntries: CONFIG.MAX_COOLDOWN
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// UI 刷新和清理
// ═══════════════════════════════════════════════════════════════════════════

function refreshUI() {
    refreshTaskLists();
    updateTaskBar();
}

function onMessageSwiped() {
    clearAllExecutionRecords();
}

function onCharacterDeleted({ character }) {
    const avatar = character?.avatar;
    const settings = getSettings();
    if (avatar && settings.character_allowed_tasks?.includes(avatar)) {
        const index = settings.character_allowed_tasks.indexOf(avatar);
        if (index !== -1) {
            settings.character_allowed_tasks.splice(index, 1);
            saveSettingsDebounced();
        }
    }
}

function cleanup() {
    presetTaskInitialization = null;
    delete window.__XB_TASKS_INITIALIZED__;
    if (state.cleanupTimer) {
        clearInterval(state.cleanupTimer);
        state.cleanupTimer = null;
    }
    state.initTimers.forEach(timer => clearTimeout(timer));
    state.initTimers.clear();
    resetAllTaskRuns();
    TasksStorage.clearCache();

    events.cleanup();
    window.removeEventListener('message', handleTaskMessage);
    document.removeEventListener('click', handleTaskBarClick);
    $(window).off('.xbTasks');

    $('#scheduled_tasks_enabled, #add_global_task, #add_character_task, #add_preset_task, #toggle_task_bar, #import_global_tasks, #cloud_tasks_button, #import_tasks_file').off('.xbTasks');
    $('#global_tasks_list, #character_tasks_list, #preset_tasks_list').off('.xbTasks');

    try {
        document.querySelectorAll('.xiaobaix-task-button').forEach(button => button.remove());
        if (cache.ownsBar) cache.bar?.remove();
    } catch (caughtError) { console.warn({ source: import.meta.url, operation: "cleanup" }, caughtError); }

    try { state.qrObserver?.disconnect(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "cleanup" }, caughtError); }
    state.qrObserver = null;
    cache.bar = null;
    cache.btns = null;
    cache.ownsBar = false;
    cache.sig = '';
    cache.ts = 0;
    resetPresetTasksCache();
}

// ═══════════════════════════════════════════════════════════════════════════
// 公共 API
// ═══════════════════════════════════════════════════════════════════════════

(function () {
    if (window.__XB_TASKS_FACADE__) return;

    const norm = s => String(s ?? '').normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '').trim().toLowerCase();

    function list(scope = 'all') {
        const g = getSettings().globalTasks || [];
        const c = getCharacterTasks() || [];
        const p = getPresetTasks() || [];
        const map = t => ({
            id: t.id, name: t.name, interval: t.interval,
            floorType: t.floorType, timing: t.triggerTiming, disabled: !!t.disabled
        });
        const mapPreset = task => ({ ...map(task), timing: getTaskTriggerTiming(task, 'preset') === PRESET_START_TIMING
            ? PRESET_START_TIMING : task.triggerTiming });
        if (scope === 'global') return g.map(map);
        if (scope === 'character') return c.map(map);
        if (scope === 'preset') return p.map(mapPreset);
        return { global: g.map(map), character: c.map(map), preset: p.map(mapPreset) };
    }

    function find(name, scope = 'all') {
        const n = norm(name);
        if (scope !== 'character' && scope !== 'preset') {
            const g = getSettings().globalTasks || [];
            const gi = g.findIndex(t => norm(t?.name) === n);
            if (gi !== -1) return { scope: 'global', list: g, index: gi, task: g[gi] };
        }
        if (scope !== 'global' && scope !== 'preset') {
            const c = getCharacterTasks() || [];
            const ci = c.findIndex(t => norm(t?.name) === n);
            if (ci !== -1) return { scope: 'character', list: c, index: ci, task: c[ci] };
        }
        if (scope !== 'global' && scope !== 'character') {
            const p = getPresetTasks() || [];
            const pi = p.findIndex(t => norm(t?.name) === n);
            if (pi !== -1) return { scope: 'preset', list: p, index: pi, task: p[pi] };
        }
        return null;
    }

    async function setCommands(name, commands, opts = {}) {
        const { mode = 'replace', scope = 'all' } = opts;
        if (find(name, scope)?.scope === 'global') await globalTaskWriteTail;
        const hit = find(name, scope);
        if (!hit) throw new Error(`找不到任务: ${name}`);
        const body = String(commands ?? '');
        const old = mode === 'append' || mode === 'prepend'
            ? (hit.scope === 'global' ? await readGlobalTaskCommands(hit.task) : String(hit.task.commands || '')) : '';
        const value = mode === 'append' ? (old ? `${old}\n${body}` : body)
            : mode === 'prepend' ? (old ? `${body}\n${old}` : body) : body;
        return await setProps(name, { commands: value }, hit.scope);
    }

    async function setJS(name, jsCode, opts = {}) {
        return await setCommands(name, `<<taskjs>>${jsCode}<</taskjs>>`, opts);
    }

    async function setProps(name, props, scope = 'all') {
        const patch = props || {};
        const initialHit = find(name, scope);
        const disabling = !!patch.disabled && initialHit && !initialHit.task.disabled;
        const initialKey = initialHit ? captureTaskRuntime(initialHit.task, initialHit.scope).key : null;
        const release = disabling ? holdTaskMutation(initialKey) : null;
        // Explicit stop remains immediate, even if another save is in flight.
        if (disabling) resetTaskRun(initialKey);
        try {
            if (initialHit?.scope === 'global') await globalTaskWriteTail;
            const hit = find(name, scope);
            if (!hit) throw new Error(`找不到任务: ${name}`);
            const previousKey = captureTaskRuntime(hit.task, hit.scope).key;
            const updated = { ...hit.task, ...patch };
            const task = Object.hasOwn(patch, 'triggerTiming')
                ? setTaskTriggerTiming(updated, patch.triggerTiming, hit.scope) : updated;
            const list = hit.list.map((entry, index) => index === hit.index ? task : entry);
            await persistTaskListByScope(hit.scope, list);
            if (Object.hasOwn(patch, 'commands') || normalizeTaskKey(task.name) !== normalizeTaskKey(hit.task.name)) {
                resetTaskRun(previousKey);
            }
            refreshTaskLists();
            return { ok: true, scope: hit.scope, name: task.name };
        } finally {
            release?.();
        }
    }

    async function exec(name) {
        const hit = find(name, 'all');
        if (!hit) throw new Error(`找不到任务: ${name}`);
        const runtime = captureTaskRuntime(hit.task, hit.scope);
        const commands = hit.scope === 'global'
            ? () => readGlobalTaskCommands(hit.task)
            : String(hit.task.commands || '');
        return await executeCommands(commands, hit.task.name, runtime);
    }

    async function dump(scope = 'all') {
        if (scope === 'character') return structuredClone(getCharacterTasks() || []);
        if (scope === 'preset') return structuredClone(getPresetTasks() || []);
        const g = await Promise.all((getSettings().globalTasks || []).map(async t => ({
            ...structuredClone(t),
            commands: await readGlobalTaskCommands(t)
        })));
        for (const task of g) delete task.scriptId;
        if (scope === 'global') return g;
        const c = structuredClone(getCharacterTasks() || []);
        const p = structuredClone(getPresetTasks() || []);
        return { global: g, character: c, preset: p };
    }

    window.XBTasks = {
        list, dump, find, setCommands, setJS, setProps, exec,
        get global() { return getSettings().globalTasks; },
        get character() { return getCharacterTasks(); },
        get preset() { return getPresetTasks(); },
    };

    try { if (window.top && window.top !== window) window.top.XBTasks = window.XBTasks; } catch (caughtError) { console.warn({ source: import.meta.url, operation: "module" }, caughtError); }
    window.__XB_TASKS_FACADE__ = true;
})();

window.xbqte = async (name) => {
    try {
        if (!name?.trim()) throw new Error('请提供任务名称');
        const expected = name.toLowerCase();
        const globalTask = getSettings().globalTasks.find(task => task.name.toLowerCase() === expected);
        const characterTask = globalTask ? null : getCharacterTasks().find(item => item.name.toLowerCase() === expected);
        const task = globalTask
            || characterTask
            || getPresetTasks().find(item => item.name.toLowerCase() === expected);
        if (!task) throw new Error(`找不到名为 "${name}" 的任务`);
        if (task.disabled) throw new Error(`任务 "${name}" 已被禁用`);
        const runtime = captureTaskRuntime(task, globalTask || characterTask ? 'global' : 'preset');
        const commands = task === globalTask
            ? () => readGlobalTaskCommands(task)
            : String(task.commands || '');
        if (!isTaskRuntimeActive(runtime)) return;
        if (isTaskExecutionActive(runtime.key) || __taskRunMap.has(runtime.key) || __taskExecutionMap.has(runtime.key)) {
            resetTaskRun(runtime.key);
        }
        if (isTaskInCooldown(runtime.key)) {
            const cd = getTaskCooldownStatus()[runtime.key];
            throw new Error(`任务 "${name}" 仍在冷却中，剩余 ${cd.remainingCooldown}ms`);
        }
        setTaskCooldown(runtime.key);
        const result = await executeCommands(commands, task.name, runtime);
        if (!isTaskRuntimeActive(runtime)) return;
        return result || `已执行任务: ${task.name}`;
    } catch (error) {
        console.error(`执行任务失败: ${error.message}`);
        throw error;
    }
};

window.xbtaskreset = async () => {
    resetAllTaskRuns();
    await Promise.all(Array.from(__taskRunMap.values(), entry => entry.cleanupCompletion));
    return '已清理所有运行中任务、动态回调、冷却和执行状态';
};

window.setScheduledTaskInterval = async (name, interval) => {
    if (!name?.trim()) throw new Error('请提供任务名称');
    const intervalNum = parseInt(interval);
    if (isNaN(intervalNum) || intervalNum < 0 || intervalNum > 99999) {
        throw new Error('间隔必须是 0-99999 之间的数字');
    }

    const settings = getSettings();
    const gi = settings.globalTasks.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
    if (gi !== -1) {
        await window.XBTasks.setProps(settings.globalTasks[gi].name, { interval: intervalNum }, 'global');
        refreshTaskLists();
        return `已设置全局任务 "${name}" 的间隔为 ${intervalNum === 0 ? '手动激活' : `每${intervalNum}楼层`}`;
    }

    const cts = getCharacterTasks();
    const ci = cts.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
    if (ci !== -1) {
        await window.XBTasks.setProps(cts[ci].name, { interval: intervalNum }, 'character');
        refreshTaskLists();
        return `已设置角色任务 "${name}" 的间隔为 ${intervalNum === 0 ? '手动激活' : `每${intervalNum}楼层`}`;
    }
    throw new Error(`找不到名为 "${name}" 的任务`);
};

Object.assign(window, {
    clearTasksProcessedMessages: clearProcessedMessages,
    clearTaskCooldown,
    getTaskCooldownStatus,
    getTasksMemoryUsage: getMemoryUsage
});

// ═══════════════════════════════════════════════════════════════════════════
// 斜杠命令
// ═══════════════════════════════════════════════════════════════════════════

let slashCommandsRegistered = false;

function registerSlashCommands() {
    if (slashCommandsRegistered) return;
    try {
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'xbqte',
            callback: async (args, value) => {
                if (!value) return '请提供任务名称。用法: /xbqte 任务名称';
                try { return await window.xbqte(value); } catch (error) { return `错误: ${error.message}`; }
            },
            unnamedArgumentList: [SlashCommandArgument.fromProps({
                description: '要执行的任务名称',
                typeList: [ARGUMENT_TYPE.STRING],
                isRequired: true,
                enumProvider: getAllTaskNames
            })],
            helpString: '执行指定名称的定时任务。例如: /xbqte 我的任务名称'
        }));

        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'xbtaskreset',
            callback: async () => {
                try { return await window.xbtaskreset(); } catch (error) { return `错误: ${error.message}`; }
            },
            helpString: '清理所有运行中任务、动态回调、冷却和执行状态'
        }));

        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'xbset',
            callback: async (namedArgs, taskName) => {
                const name = String(taskName || '').trim();
                if (!name) throw new Error('请提供任务名称');

                const settings = getSettings();
                let task = null, isCharacter = false, taskIndex = -1;

                taskIndex = settings.globalTasks.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
                if (taskIndex !== -1) {
                    task = settings.globalTasks[taskIndex];
                } else {
                    const cts = getCharacterTasks();
                    taskIndex = cts.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
                    if (taskIndex !== -1) {
                        task = cts[taskIndex];
                        isCharacter = true;
                    }
                }
                if (!task) throw new Error(`找不到任务 "${name}"`);

                const changed = [];
                task = { ...task };

                if (namedArgs.status !== undefined) {
                    const val = String(namedArgs.status).toLowerCase();
                    if (val === 'on' || val === 'true') { task.disabled = false; changed.push('状态=启用'); }
                    else if (val === 'off' || val === 'false') { task.disabled = true; changed.push('状态=禁用'); }
                    else throw new Error('status 仅支持 on/off');
                }

                if (namedArgs.interval !== undefined) {
                    const num = parseInt(namedArgs.interval);
                    if (isNaN(num) || num < 0 || num > 99999) throw new Error('interval 必须为 0-99999');
                    task.interval = num;
                    changed.push(`间隔=${num}`);
                }

                if (namedArgs.timing !== undefined) {
                    const val = String(namedArgs.timing).toLowerCase();
                    const valid = ['after_ai', 'before_user', 'any_message', 'initialization', 'character_init', 'plugin_init', 'only_this_floor', 'chat_changed'];
                    if (!valid.includes(val)) throw new Error(`timing 必须为: ${valid.join(', ')}`);
                    task.triggerTiming = val;
                    changed.push(`时机=${val}`);
                }

                if (namedArgs.floorType !== undefined) {
                    const val = String(namedArgs.floorType).toLowerCase();
                    if (!['all', 'user', 'llm'].includes(val)) throw new Error('floorType 必须为: all, user, llm');
                    task.floorType = val;
                    changed.push(`楼层=${val}`);
                }

                if (changed.length === 0) throw new Error('未提供要修改的参数');

                await window.XBTasks.setProps(name, task, isCharacter ? 'character' : 'global');
                refreshTaskLists();

                return `已更新任务 "${name}": ${changed.join(', ')}`;
            },
            namedArgumentList: [
                SlashCommandNamedArgument.fromProps({ name: 'status', description: '启用/禁用', typeList: [ARGUMENT_TYPE.STRING], enumList: ['on', 'off'] }),
                SlashCommandNamedArgument.fromProps({ name: 'interval', description: '楼层间隔(0=手动)', typeList: [ARGUMENT_TYPE.NUMBER] }),
                SlashCommandNamedArgument.fromProps({ name: 'timing', description: '触发时机', typeList: [ARGUMENT_TYPE.STRING], enumList: ['after_ai', 'before_user', 'any_message', 'initialization', 'character_init', 'plugin_init', 'only_this_floor', 'chat_changed'] }),
                SlashCommandNamedArgument.fromProps({ name: 'floorType', description: '楼层类型', typeList: [ARGUMENT_TYPE.STRING], enumList: ['all', 'user', 'llm'] }),
            ],
            unnamedArgumentList: [SlashCommandArgument.fromProps({ description: '任务名称', typeList: [ARGUMENT_TYPE.STRING], isRequired: true, enumProvider: getAllTaskNames })],
            helpString: `设置任务属性。用法: /xbset status=on/off interval=数字 timing=时机 floorType=类型 任务名`
        }));
        slashCommandsRegistered = true;
    } catch (error) {
        console.error("注册斜杠命令时出错:", error);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 初始化
// ═══════════════════════════════════════════════════════════════════════════

export function initTaskSettings() {
    initPresetTaskEvents(refreshPresetTasks, PresetTasksStore.flush, PresetTasksStore.imported);
}

async function initTasks() {
    if (window.__XB_TASKS_INITIALIZED__) {
        console.log('[小白X任务] 已经初始化，跳过重复注册');
        return;
    }
    window.__XB_TASKS_INITIALIZED__ = true;
    const initialization = beginPresetTaskInitialization();

    hydrateProcessedSetFromSettings();
    scheduleCleanup();

    if (!extension_settings[EXT_ID].tasks) {
        extension_settings[EXT_ID].tasks = structuredClone(defaultSettings);
    }

    if (window.registerModuleCleanup) {
        window.registerModuleCleanup('tasks', cleanup);
    }

    window.removeEventListener('message', handleTaskMessage);
    // eslint-disable-next-line no-restricted-syntax -- legacy task bridge; keep behavior unchanged.
    window.addEventListener('message', handleTaskMessage);
    document.removeEventListener('click', handleTaskBarClick);
    document.addEventListener('click', handleTaskBarClick);

    state.qrObserver?.disconnect();
    state.qrObserver = new MutationObserver(updateTaskBar);
    state.qrObserver.observe(document.body, { childList: true, subtree: true });

    $('#scheduled_tasks_enabled').off('.xbTasks').on('input.xbTasks', e => {
        const enabled = $(e.target).prop('checked');
        getSettings().enabled = enabled;
        saveSettingsDebounced();
        try { createTaskBar(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "initTasks" }, caughtError); }
    });

    $('#add_global_task').off('.xbTasks').on('click.xbTasks', observeAsyncCallback(() => showTaskEditor(null, false, 'global'), { source: import.meta.url, operation: "callback" }));
    $('#add_character_task').off('.xbTasks').on('click.xbTasks', observeAsyncCallback(() => showTaskEditor(null, false, 'character'), { source: import.meta.url, operation: "callback" }));
    $('#add_preset_task').off('.xbTasks').on('click.xbTasks', observeAsyncCallback(() => showTaskEditor(null, false, 'preset'), { source: import.meta.url, operation: "callback" }));
    $('#toggle_task_bar').off('.xbTasks').on('click.xbTasks', toggleTaskBarVisibility);
    $('#import_global_tasks').off('.xbTasks').on('click.xbTasks', () => $('#import_tasks_file').trigger('click'));
    $('#cloud_tasks_button').off('.xbTasks').on('click.xbTasks', observeAsyncCallback(() => showCloudTasksModal(), { source: import.meta.url, operation: "callback" }));
    $('#import_tasks_file').off('.xbTasks').on('change.xbTasks', function (e) {
        const file = e.target.files[0];
        if (file) { observeBackgroundTask(importGlobalTasks(file), { source: import.meta.url, operation: "callback" }); $(this).val(''); }
    });

    $('#global_tasks_list').off('.xbTasks')
        .on('input.xbTasks', '.disable_task', observeAsyncCallback(async function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const task = getSettings().globalTasks.find(item => item?.id === id);
            if (task) {
                await window.XBTasks.setProps(task.name, { disabled: $(this).prop('checked') }, 'global');
                state.lastTasksHash = '';
                refreshTaskLists();
            }
        }, { source: import.meta.url, operation: 'toggleGlobalTask' }))
        .on('click.xbTasks', '.edit_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getSettings().globalTasks;
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) observeBackgroundTask(editTask(idx, 'global'), { source: import.meta.url, operation: "callback" });
        })
        .on('click.xbTasks', '.export_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getSettings().globalTasks;
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) observeBackgroundTask(exportSingleTask(idx, 'global'), { source: import.meta.url, operation: "callback" });
        })
        .on('click.xbTasks', '.delete_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getSettings().globalTasks;
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) observeBackgroundTask(deleteTask(idx, 'global'), { source: import.meta.url, operation: "callback" });
        });

    $('#character_tasks_list').off('.xbTasks')
        .on('input.xbTasks', '.disable_task', observeAsyncCallback(async function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getCharacterTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) {
                const taskName = list[idx].name;
                const wasDisabled = !!list[idx].disabled;
                const disabled = $(this).prop('checked');
                list[idx].disabled = disabled;
                if (!wasDisabled && disabled) resetTaskRun(taskName);
                await saveCharacterTasks(list);
                state.lastTasksHash = '';
                refreshTaskLists();
            }
        }, { source: import.meta.url, operation: "callback" }))
        .on('click.xbTasks', '.edit_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getCharacterTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) observeBackgroundTask(editTask(idx, 'character'), { source: import.meta.url, operation: "callback" });
        })
        .on('click.xbTasks', '.export_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getCharacterTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) observeBackgroundTask(exportSingleTask(idx, 'character'), { source: import.meta.url, operation: "callback" });
        })
        .on('click.xbTasks', '.delete_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getCharacterTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) observeBackgroundTask(deleteTask(idx, 'character'), { source: import.meta.url, operation: "callback" });
        });

    $('#preset_tasks_list').off('.xbTasks')
        .on('input.xbTasks', '.disable_task', observeAsyncCallback(async function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getPresetTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) {
                const taskKey = captureTaskRuntime(list[idx], 'preset').key;
                const wasDisabled = !!list[idx].disabled;
                const disabled = $(this).prop('checked');
                list[idx].disabled = disabled;
                if (!wasDisabled && disabled) resetTaskRun(taskKey);
                await savePresetTasks([...list]);
                state.lastTasksHash = '';
                refreshTaskLists();
            }
        }, { source: import.meta.url, operation: "callback" }))
        .on('click.xbTasks', '.edit_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getPresetTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) observeBackgroundTask(editTask(idx, 'preset'), { source: import.meta.url, operation: "callback" });
        })
        .on('click.xbTasks', '.export_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getPresetTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) observeBackgroundTask(exportSingleTask(idx, 'preset'), { source: import.meta.url, operation: "callback" });
        })
        .on('click.xbTasks', '.delete_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getPresetTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) observeBackgroundTask(deleteTask(idx, 'preset'), { source: import.meta.url, operation: "callback" });
        });

    $('#scheduled_tasks_enabled').prop('checked', getSettings().enabled);
    refreshTaskLists();

    if (event_types.GENERATION_ENDED) {
        events.on(event_types.GENERATION_ENDED, onGenerationEnded);
    } else {
        events.on(event_types.CHARACTER_MESSAGE_RENDERED, onMessageReceived);
    }
    events.on(event_types.USER_MESSAGE_RENDERED, onUserMessage);
    events.on(event_types.CHAT_CHANGED, onChatChanged);
    events.on(event_types.CHAT_CREATED, onChatCreated);
    events.on(event_types.MESSAGE_DELETED, onMessageDeleted);
    events.on(event_types.MESSAGE_SWIPED, onMessageSwiped);
    events.on(event_types.CHARACTER_DELETED, onCharacterDeleted);

    $(window).off('beforeunload.xbTasks').on('beforeunload.xbTasks', cleanup);
    registerSlashCommands();
    const embeddedTasksTimer = setTimeout(() => {
        state.initTimers.delete(embeddedTasksTimer);
        if (window.__XB_TASKS_INITIALIZED__) observeBackgroundTask(checkEmbeddedTasks(), { source: import.meta.url, operation: "callback" });
    }, 1000);
    state.initTimers.add(embeddedTasksTimer);

    const pluginInitTimer = setTimeout(() => {
        state.initTimers.delete(pluginInitTimer);
        if (!window.__XB_TASKS_INITIALIZED__) return;
        observeBackgroundTask(checkAndExecuteTasks('plugin_initialized', false, false).finally(() => finishPresetTaskInitialization(initialization)),
            { source: import.meta.url, operation: 'pluginInitialization' });
    }, 0);
    state.initTimers.add(pluginInitTimer);
    refreshPresetTasks({ initialize: true });
}

export { initTasks };
