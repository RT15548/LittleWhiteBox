// ═══════════════════════════════════════════════════════════════════════════
// 导入
// ═══════════════════════════════════════════════════════════════════════════

import { extension_settings, getContext, writeExtensionField } from "../../../../../extensions.js";
import { saveSettingsDebounced, characters, this_chid, chat, callPopup } from "../../../../../../script.js";
import { getPresetManager } from "../../../../../preset-manager.js";
import { oai_settings } from "../../../../../openai.js";
import { SlashCommandParser } from "../../../../../slash-commands/SlashCommandParser.js";
import { SlashCommand } from "../../../../../slash-commands/SlashCommand.js";
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from "../../../../../slash-commands/SlashCommandArgument.js";
import { callGenericPopup, POPUP_TYPE } from "../../../../../popup.js";
import { accountStorage } from "../../../../../util/AccountStorage.js";
import { download, getFileText, uuidv4, debounce, getSortableDelay } from "../../../../../utils.js";
import { executeSlashCommand } from "../../core/slash-command.js";
import { EXT_ID } from "../../core/constants.js";
import { createModuleEvents, event_types } from "../../core/event-manager.js";
import { xbLog, CacheRegistry } from "../../core/debug-core.js";
import { TasksStorage } from "../../core/server-storage.js";
import { initPresetTaskEvents } from './preset-task-events.js';

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
const refreshExecutionState = () => {
    const records = state.executingRecords instanceof Map ? state.executingRecords : new Map();
    state.executingRecords = records;
    state.executingCount = records.size;
    state.isCommandGenerated = Array.from(records.values()).some(entry => entry?.source === 'command');
};
const startExecutionRecord = (taskName, source = 'command') => {
    const token = uuidv4();
    state.executingRecords.set(token, { taskName: normalizeTaskKey(taskName), source, startedAt: Date.now() });
    refreshExecutionState();
    return token;
};
const finishExecutionRecord = (token) => {
    if (!token) return;
    if (state.executingRecords.delete(token)) refreshExecutionState();
};
const clearExecutionRecordsByTask = (taskName) => {
    const key = normalizeTaskKey(taskName);
    if (!key) return 0;
    let removed = 0;
    for (const [token, entry] of state.executingRecords.entries()) {
        if (entry?.taskName === key) {
            state.executingRecords.delete(token);
            removed++;
        }
    }
    if (removed > 0) refreshExecutionState();
    return removed;
};
const clearAllExecutionRecords = () => {
    if (state.executingRecords.size > 0) state.executingRecords.clear();
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
    try { xbLog.warn('scheduledTasks', { event: 'execution_lock_skip', ...detail }); } catch {}
};

const normalizeTiming = (t) => (String(t || '').toLowerCase() === 'initialization' ? 'character_init' : t);
const mapTiming = (task) => ({ ...task, triggerTiming: normalizeTiming(task.triggerTiming) });

async function readGlobalTaskCommands(task) {
    if (task?.id) {
        let commands;
        try {
            commands = await TasksStorage.getStrict(task.id, null);
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
    ...getPresetTasks().map(mapTiming)
];

const allTasks = allTasksMeta;

async function allTasksFull() {
    const globalMeta = getSettings().globalTasks || [];
    const globalTasks = (await Promise.all(globalMeta.map(async (task) => {
        try {
            return { ...task, commands: await readGlobalTaskCommands(task) };
        } catch (error) {
            console.error(`[循环任务] 已跳过无法读取的全局任务“${task?.name || '未命名任务'}”`, error);
            return null;
        }
    }))).filter(Boolean);
    return [
        ...globalTasks.map(mapTiming),
        ...getCharacterTasks().map(mapTiming),
        ...getPresetTasks().map(mapTiming)
    ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 设置管理
// ═══════════════════════════════════════════════════════════════════════════

function getSettings() {
    const ext = extension_settings[EXT_ID] || (extension_settings[EXT_ID] = {});
    if (!ext.tasks) ext.tasks = structuredClone(defaultSettings);
    const t = ext.tasks;
    if (typeof t.enabled !== 'boolean') t.enabled = defaultSettings.enabled;
    if (!Array.isArray(t.globalTasks)) t.globalTasks = [];
    if (!Array.isArray(t.processedMessages)) t.processedMessages = [];
    if (!Array.isArray(t.character_allowed_tasks)) t.character_allowed_tasks = [];
    return t;
}

function hydrateProcessedSetFromSettings() {
    try {
        state.processedMessagesSet = new Set(getSettings().processedMessages || []);
    } catch {}
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

function getCharacterTasks() {
    if (this_chid == null || !characters[this_chid]) return [];
    const c = characters[this_chid];
    if (!c.data) c.data = {};
    if (!c.data.extensions) c.data.extensions = {};
    if (!c.data.extensions[TASKS_MODULE_NAME]) c.data.extensions[TASKS_MODULE_NAME] = { tasks: [] };
    const list = c.data.extensions[TASKS_MODULE_NAME].tasks;
    if (!Array.isArray(list)) c.data.extensions[TASKS_MODULE_NAME].tasks = [];
    return c.data.extensions[TASKS_MODULE_NAME].tasks;
}

async function saveCharacterTasks(tasks) {
    if (this_chid == null || !characters[this_chid]) return;
    await writeExtensionField(Number(this_chid), TASKS_MODULE_NAME, { tasks });
    try {
        if (!characters[this_chid].data) characters[this_chid].data = {};
        if (!characters[this_chid].data.extensions) characters[this_chid].data.extensions = {};
        if (!characters[this_chid].data.extensions[TASKS_MODULE_NAME]) characters[this_chid].data.extensions[TASKS_MODULE_NAME] = { tasks: [] };
        characters[this_chid].data.extensions[TASKS_MODULE_NAME].tasks = tasks;
    } catch {}
    const settings = getSettings();
    const avatar = characters[this_chid].avatar;
    if (avatar && !settings.character_allowed_tasks?.includes(avatar)) {
        settings.character_allowed_tasks ??= [];
        settings.character_allowed_tasks.push(avatar);
        saveSettingsDebounced();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 预设任务
// ═══════════════════════════════════════════════════════════════════════════

const PRESET_TASK_FIELD = 'scheduledTasks';
const PRESET_PROMPT_ORDER_CHARACTER_ID = 100000;
const presetTasksState = { name: '', tasks: [] };

const PresetTasksStore = (() => {
    const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
    const deepClone = (value) => {
        if (value === undefined) return undefined;
        if (typeof structuredClone === 'function') {
            try { return structuredClone(value); } catch {}
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
        } catch {}
        if (!source) {
            try { source = manager.getPresetSettings?.(name) || null; } catch { source = null; }
        }
        if (!source) return { source: null, clone: null };
        return { source, clone: deepClone(source) };
    };

    const syncTarget = (target, source) => {
        if (!target || !source) return;
        Object.keys(target).forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(source, key)) delete target[key];
        });
        Object.assign(target, source);
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
        try { return getPresetManagerSafe()?.getSelectedPresetName?.() || ''; } catch { return ''; }
    };

    const read = (name) => {
        if (!name) return [];
        const manager = getPresetManagerSafe();
        if (!manager) return [];
        const { clone } = getPresetSnapshot(manager, name);
        if (!clone) return [];
        const entry = ensurePromptOrderEntry(clone, false);
        if (!entry || !isPlainObject(entry.xiaobai_ext)) return [];
        const tasks = entry.xiaobai_ext[PRESET_TASK_FIELD];
        return Array.isArray(tasks) ? deepClone(tasks) : [];
    };

    const write = async (name, tasks) => {
        if (!name) return;
        const manager = getPresetManagerSafe();
        if (!manager) return;
        const { source, clone } = getPresetSnapshot(manager, name);
        if (!clone) return;
        const shouldCreate = Array.isArray(tasks) && tasks.length > 0;
        const entry = ensurePromptOrderEntry(clone, shouldCreate);
        if (entry) {
            entry.xiaobai_ext = isPlainObject(entry.xiaobai_ext) ? entry.xiaobai_ext : {};
            if (shouldCreate) {
                entry.xiaobai_ext[PRESET_TASK_FIELD] = deepClone(tasks);
            } else {
                if (entry.xiaobai_ext) delete entry.xiaobai_ext[PRESET_TASK_FIELD];
                if (entry.xiaobai_ext && Object.keys(entry.xiaobai_ext).length === 0) delete entry.xiaobai_ext;
            }
        }
        await manager.savePreset(name, clone, { skipUpdate: true });
        syncTarget(source, clone);
        const activeName = manager.getSelectedPresetName?.();
        if (activeName && activeName === name && Object.prototype.hasOwnProperty.call(clone, 'prompt_order')) {
            try { oai_settings.prompt_order = structuredClone(clone.prompt_order); } catch { oai_settings.prompt_order = clone.prompt_order; }
        }
    };

    return { currentName, read, write };
})();

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
    if (presetTasksState.name !== name || !presetTasksState.tasks.length) {
        const loaded = PresetTasksStore.read(name) || [];
        ensurePresetTaskIds(loaded);
        presetTasksState.name = name;
        presetTasksState.tasks = Array.isArray(loaded) ? loaded : [];
    }
    return presetTasksState.tasks;
}

async function savePresetTasks(tasks) {
    const name = PresetTasksStore.currentName();
    if (!name) return;
    const list = Array.isArray(tasks) ? tasks : [];
    ensurePresetTaskIds(list);
    presetTasksState.name = name;
    presetTasksState.tasks = list;
    await PresetTasksStore.write(name, list);
    state.lastTasksHash = '';
    updatePresetTaskHint();
}

// ═══════════════════════════════════════════════════════════════════════════
// 任务列表操作
// ═══════════════════════════════════════════════════════════════════════════

const getTaskListByScope = (scope) => {
    if (scope === 'character') return getCharacterTasks();
    if (scope === 'preset') return getPresetTasks();
    return getSettings().globalTasks;
};

async function persistTaskListByScope(scope, tasks) {
    if (scope === 'character') return await saveCharacterTasks(tasks);
    if (scope === 'preset') return await savePresetTasks(tasks);

    const metaOnly = [];
    for (const task of tasks) {
        if (!task) continue;
        if (!task.id) task.id = uuidv4();

        if (Object.prototype.hasOwnProperty.call(task, 'commands')) {
            await TasksStorage.set(task.id, String(task.commands ?? ''));
        }

        const meta = { ...task };
        delete meta.commands;
        metaOnly.push(meta);
    }

    getSettings().globalTasks = metaOnly;
    saveSettingsDebounced();
}

async function removeTaskByScope(scope, taskId, fallbackIndex = -1) {
    const list = getTaskListByScope(scope);
    const idx = taskId ? list.findIndex(t => t?.id === taskId) : fallbackIndex;
    if (idx < 0 || idx >= list.length) return;
    
    const task = list[idx];
    if (scope === 'global' && task?.id) {
        await TasksStorage.delete(task.id);
    }
    
    list.splice(idx, 1);
    await persistTaskListByScope(scope, [...list]);
}

// ═══════════════════════════════════════════════════════════════════════════
// 任务运行管理
// ═══════════════════════════════════════════════════════════════════════════

const __taskRunMap = new Map();
const __taskDynamicCallbackPrefix = (taskName) => `${normalizeTaskKey(taskName)}_fl_`;

function cleanupTaskRunOwner(taskKey, entry) {
    if (!entry || entry.cleaned) return false;
    entry.cleaned = true;

    for (const callbackId of Array.from(entry.callbackIds || [])) {
        const callbackEntry = state.dynamicCallbacks.get(callbackId);
        if (callbackEntry?.owner === entry) {
            try { callbackEntry.abortController?.abort?.(); } catch {}
            state.dynamicCallbacks.delete(callbackId);
        }
        entry.callbackIds.delete(callbackId);
    }

    try { entry.abort?.abort?.(); } catch {}
    try { entry.timers?.forEach?.((id) => clearTimeout(id)); } catch {}
    try { entry.intervals?.forEach?.((id) => clearInterval(id)); } catch {}
    for (const listener of Array.from(entry.listeners || [])) {
        try { listener.target?.removeEventListener?.(listener.type, listener.wrapped, listener.capture); } catch {}
        entry.listeners.delete(listener);
    }
    entry.timers?.clear?.();
    entry.intervals?.clear?.();
    if (__taskRunMap.get(taskKey) === entry) __taskRunMap.delete(taskKey);
    return true;
}

function releaseTaskRunOwnerIfIdle(entry) {
    if (!entry || entry.cleaned || !entry.bodySettled) return false;
    if (entry.inFlightCallbacks > 0 || entry.callbackIds.size > 0 ||
        entry.timers.size > 0 || entry.intervals.size > 0 || entry.listeners.size > 0) return false;
    return cleanupTaskRunOwner(entry.taskKey, entry);
}

function removeFloorCallback(owner, callbackId) {
    const callbackEntry = state.dynamicCallbacks.get(callbackId);
    if (callbackEntry?.owner === owner) {
        try { callbackEntry.abortController?.abort?.(); } catch {}
        state.dynamicCallbacks.delete(callbackId);
    }
    owner?.callbackIds?.delete?.(callbackId);
    releaseTaskRunOwnerIfIdle(owner);
}

function abortTaskRunEntry(entry) {
    return cleanupTaskRunOwner(entry?.taskKey, entry);
}

function resetTaskRun(taskName) {
    const taskKey = normalizeTaskKey(taskName);
    if (!taskKey) return { taskKey, clearedRuns: 0, clearedCallbacks: 0, clearedExecutions: 0 };

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
        try { entry?.abortController?.abort?.(); } catch {}
        state.dynamicCallbacks.delete(id);
        clearedCallbacks++;
    }

    clearTaskCooldown(taskKey);
    const clearedExecutions = clearExecutionRecordsByTask(taskKey);
    return { taskKey, clearedRuns, clearedCallbacks, clearedExecutions };
}

function resetAllTaskRuns() {
    for (const entry of Array.from(__taskRunMap.values())) abortTaskRunEntry(entry);

    for (const [id, entry] of state.dynamicCallbacks.entries()) {
        try { entry?.abortController?.abort?.(); } catch {}
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
                try { addStr(entry?.callback?.toString?.()); } catch {}
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
        } catch {}
        try { resetAllTaskRuns(); } catch {}
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

async function __runTaskSingleInstance(taskName, jsRunner, signature = null) {
    const existing = __taskRunMap.get(taskName);
    if (existing) {
        abortTaskRunEntry(existing);
        try { await Promise.resolve(existing.completion).catch(() => {}); } catch {}
    }

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
        bodySettled: false,
        inFlightCallbacks: 0,
        cleaned: false,
    };
    __taskRunMap.set(taskName, entry);

    const reportCallbackError = (kind, error) => {
        console.error(`[任务${kind}回调错误]`, taskName, error);
    };

    const invokeOwnedCallback = (kind, callback, thisArg, args) => {
        if (entry.cleaned) return;
        if (typeof callback !== 'function') {
            releaseTaskRunOwnerIfIdle(entry);
            return;
        }
        entry.inFlightCallbacks++;
        let result;
        try {
            result = callback.apply(thisArg, args);
        } catch (error) {
            reportCallbackError(kind, error);
            entry.inFlightCallbacks = Math.max(0, entry.inFlightCallbacks - 1);
            releaseTaskRunOwnerIfIdle(entry);
            return;
        }
        Promise.resolve(result).catch(error => reportCallbackError(kind, error)).finally(() => {
            entry.inFlightCallbacks = Math.max(0, entry.inFlightCallbacks - 1);
            releaseTaskRunOwnerIfIdle(entry);
        });
    };

    const removeOwnedListener = (listener) => {
        if (!listener || !listeners.delete(listener)) return false;
        try { listener.target?.removeEventListener?.(listener.type, listener.wrapped, listener.capture); } catch {}
        releaseTaskRunOwnerIfIdle(entry);
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
        try { target?.removeEventListener?.(type, handler, capture); } catch {}
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
        releaseTaskRunOwnerIfIdle(entry);
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
        releaseTaskRunOwnerIfIdle(entry);
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
            entry.bodySettled = true;
            if (succeeded) releaseTaskRunOwnerIfIdle(entry);
            else cleanupTaskRunOwner(taskName, entry);
            try { window?.dispatchEvent?.(new CustomEvent('xiaobaix-task-cleaned', { detail: { taskName, signature } })); } catch {}
        }
        return jsRunnerResult;
    })();

    return entry.completion;
}

// ═══════════════════════════════════════════════════════════════════════════
// 命令执行
// ═══════════════════════════════════════════════════════════════════════════

async function executeCommands(commands, taskName) {
    if (!String(commands || '').trim()) return null;
    const execToken = startExecutionRecord(taskName || 'AnonymousTask', 'command');
    try {
        return await processTaskCommands(commands, taskName);
    } finally {
        setTimeout(() => finishExecutionRecord(execToken), 500);
    }
}

async function processTaskCommands(commands, taskName) {
    const jsTagRegex = /<<taskjs>>([\s\S]*?)<<\/taskjs>>/g;
    let lastIndex = 0, result = null, match;

    while ((match = jsTagRegex.exec(commands)) !== null) {
        const beforeJs = commands.slice(lastIndex, match.index).trim();
        if (beforeJs) result = await executeSlashCommand(beforeJs);
        const jsCode = match[1].trim();
        if (jsCode) {
            try { result = await executeTaskJS(jsCode, taskName || 'AnonymousTask'); }
            catch (error) {
                console.error(`[任务JS执行错误] ${error.message}`);
                try { xbLog.error('scheduledTasks', `taskjs error task=${String(taskName || 'AnonymousTask')}`, error); } catch {}
            }
        }
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex === 0) {
        result = await executeSlashCommand(commands);
    } else {
        const remaining = commands.slice(lastIndex).trim();
        if (remaining) result = await executeSlashCommand(remaining);
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

async function executeTaskJS(jsCode, taskName = 'AnonymousTask') {
    const codeSig = __hashStringForKey(String(jsCode || ''));
    const stableKey = (String(taskName || '').trim()) || `js-${codeSig}`;
    const isLightTask = stableKey.startsWith('[x]');
    const STscript = async (command) => {
        if (!command) return { error: "命令为空" };
        if (!command.startsWith('/')) command = '/' + command;
        const execToken = startExecutionRecord(stableKey, 'command');
        try {
            return await executeSlashCommand(command);
        } finally {
            setTimeout(() => finishExecutionRecord(execToken), 500);
        }
    };

    const taskContext = {
        taskName: String(taskName || 'AnonymousTask'),
        stableKey,
        codeSig,
        log: (msg, extra) => { try { xbLog.info('scheduledTasks', { task: stableKey, msg: String(msg ?? ''), extra }); } catch {} },
        warn: (msg, extra) => { try { xbLog.warn('scheduledTasks', { task: stableKey, msg: String(msg ?? ''), extra }); } catch {} },
        error: (msg, err, extra) => { try { xbLog.error('scheduledTasks', { task: stableKey, msg: String(msg ?? ''), extra }, err || null); } catch {} }
    };

    const old = __taskRunMap.get(stableKey);
    if (old) {
        abortTaskRunEntry(old);
        if (!isLightTask) {
            try { await Promise.resolve(old.completion).catch(() => {}); } catch {}
        }
    }

    const callbackPrefix = `${stableKey}_fl_`;
    for (const [id, entry] of state.dynamicCallbacks.entries()) {
        if (id.startsWith(callbackPrefix)) {
            try { entry?.abortController?.abort(); } catch {}
            state.dynamicCallbacks.delete(id);
        }
    }

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

        const addFloorListener = (callback, options = {}) => {
            if (typeof callback !== 'function') throw new Error('callback 必须是函数');
            if (!owner || owner.cleaned || abortSignal?.aborted) return () => {};
            const callbackId = `${stableKey}_fl_${uuidv4()}`;
            const entryAbort = new AbortController();
            owner.callbackIds.add(callbackId);
            try {
                abortSignal.addEventListener('abort', () => {
                    try { entryAbort.abort(); } catch {}
                    state.dynamicCallbacks.delete(callbackId);
                    owner.callbackIds.delete(callbackId);
                }, { once: true });
            } catch {}
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
                'addListener', 'removeListener', 'setTimeoutSafe', 'clearTimeoutSafe', 'setIntervalSafe', 'clearIntervalSafe', 'abortSignal',
                `return (async () => { ${code} })();`
            );
            return await fn(taskContext, taskContext, STscript, addFloorListener, addListener, removeListener, setTimeoutSafe, clearTimeoutSafe, setIntervalSafe, clearIntervalSafe, abortSignal);
        };

        return await runInScope(jsCode);
    };

    if (isLightTask) {
        return __runTaskSingleInstance(stableKey, jsRunner, codeSig);
    }

    return await __runTaskSingleInstance(stableKey, jsRunner, codeSig);
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
        if (isTaskInCooldown(task.name, n)) return false;
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
            state.taskLastExecutionTime.set(task.name, n);
            if (task.__dynamic) {
                const callbackEntry = state.dynamicCallbacks.get(task.name);
                if (callbackEntry !== task.__callbackEntry || callbackEntry.abortController?.signal?.aborted) continue;
                const owner = callbackEntry.owner;
                if (owner?.cleaned) continue;
                if (owner) owner.inFlightCallbacks++;
                try {
                    const currentFloor = pickFloorByType(task.floorType || 'all', counts);
                    await Promise.resolve().then(() => task.__callback({
                        timing: triggerContext,
                        floors: counts,
                        currentFloor,
                        interval: task.interval,
                        floorType: task.floorType || 'all'
                    }));
                } catch (e) {
                    console.error('[动态回调错误]', task.name, e);
                } finally {
                    if (owner) {
                        owner.inFlightCallbacks = Math.max(0, owner.inFlightCallbacks - 1);
                        releaseTaskRunOwnerIfIdle(owner);
                    }
                }
            } else {
                await executeCommands(task.commands, task.name);
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
        checkEmbeddedTasks();
        refreshUI();
        checkAndExecuteTasks('chat_changed', false, false);
        requestAnimationFrame(() => requestAnimationFrame(() => { try { updateTaskBar(); } catch {} }));
    });

    setTimeout(() => { state.chatJustChanged = state.isNewChat = false; }, 2000);
}

async function onChatCreated() {
    Object.assign(state, { isNewChat: true, chatJustChanged: true });
    await checkAndExecuteTasks('chat_created', false, false);
}

function refreshPresetTasks() {
    resetPresetTasksCache();
    state.lastTasksHash = '';
    refreshUI();
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
    if (task.interval === 0) {
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
    const initialScope = scope || 'global';
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

    const editorTemplate = $('#task_editor_template').clone().removeAttr('id').show();
    editorTemplate.find('.task_name_edit').val(task?.name || '');
    editorTemplate.find('.task_commands_edit').val(task?.commands || '');
    editorTemplate.find('.task_interval_edit').val(task?.interval ?? 3);
    editorTemplate.find('.task_floor_type_edit').val(task?.floorType || 'all');
    editorTemplate.find('.task_trigger_timing_edit').val(task?.triggerTiming === 'character_init' ? 'initialization' : (task?.triggerTiming || 'after_ai'));
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
        const interval = parseInt(editorTemplate.find('.task_interval_edit').val()) || 0;
        const triggerTiming = editorTemplate.find('.task_trigger_timing_edit').val();
        const intervalControl = editorTemplate.find('.task_interval_edit');
        const floorTypeControl = editorTemplate.find('.task_floor_type_edit');
        const triggerTimingControl = editorTemplate.find('.task_trigger_timing_edit');

        if (interval === 0) {
            floorTypeControl.prop('disabled', true).css('opacity', '0.5');
            triggerTimingControl.prop('disabled', true).css('opacity', '0.5');
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
    updateControlStates();

    callGenericPopup(editorTemplate, POPUP_TYPE.CONFIRM, '', { okButton: '保存' }).then(async (result) => {
        if (result) {
            const desiredName = String(editorTemplate.find('.task_name_edit').val() || '').trim();
            const existingNames = new Set(allTasks().map(t => (t?.name || '').trim().toLowerCase()));
            let uniqueName = desiredName;
            if (desiredName && (!isEdit || (isEdit && task?.name?.toLowerCase() !== desiredName.toLowerCase()))) {
                if (existingNames.has(desiredName.toLowerCase())) {
                    let idx = 1;
                    while (existingNames.has(`${desiredName}${idx}`.toLowerCase())) idx++;
                    uniqueName = `${desiredName}${idx}`;
                }
            }

            const base = task ? structuredClone(task) : {};
            const selectedTriggerTiming = editorTemplate.find('.task_trigger_timing_edit').val() || 'after_ai';
            const newTask = {
                ...base,
                id: base.id || `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                name: uniqueName,
                commands: String(editorTemplate.find('.task_commands_edit').val() || '').trim(),
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
            await saveTaskFromEditor(newTask, targetScope);
        }
    });
}

function resetTaskEditorState() {
    state.currentEditingTask = null;
    state.currentEditingIndex = -1;
    state.currentEditingId = null;
    state.currentEditingScope = 'global';
}

async function saveTaskFromEditor(task, scope) {
    const targetScope = scope === 'character' || scope === 'preset' ? scope : 'global';
    const isManual = (task?.interval === 0);
    if (!task.name || (!isManual && !task.commands)) return;

    const isEditingExistingTask = state.currentEditingIndex >= 0 || !!state.currentEditingId;
    const previousTask = isEditingExistingTask ? state.currentEditingTask : null;
    const previousName = previousTask?.name;
    const shouldResetPreviousRun = !!previousName && (
        normalizeTaskKey(previousName) !== normalizeTaskKey(task.name)
        || String(previousTask?.commands ?? '') !== String(task.commands ?? '')
        || (!previousTask?.disabled && task.disabled === true)
    );
    const previousScope = state.currentEditingScope || 'global';
    const taskTypeChanged = isEditingExistingTask && previousScope !== targetScope;

    if (targetScope === 'preset' && !PresetTasksStore.currentName()) {
        toastr?.warning?.('请先选择一个OpenAI预设。');
        return;
    }

    if (taskTypeChanged) {
        await removeTaskByScope(previousScope, state.currentEditingId, state.currentEditingIndex);
        state.lastTasksHash = '';
        state.currentEditingIndex = -1;
        state.currentEditingId = null;
    }

    const list = getTaskListByScope(targetScope);
    let idx = state.currentEditingId ? list.findIndex(t => t?.id === state.currentEditingId) : state.currentEditingIndex;
    
    if (idx >= 0 && idx < list.length) {
        list[idx] = task;
    } else {
        list.push(task);
    }

    await persistTaskListByScope(targetScope, [...list]);
    if (shouldResetPreviousRun) resetTaskRun(previousName);

    resetTaskEditorState();
    state.lastTasksHash = '';
    refreshUI();
}


async function editTask(index, scope) {
    const list = getTaskListByScope(scope);
    const task = list[index];
    if (task) showTaskEditor(task, true, scope);
}

async function deleteTask(index, scope) {
    const list = getTaskListByScope(scope);
    const task = list[index];
    if (!task) return;

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
            await removeTaskByScope(scope, task.id, index);
            resetTaskRun(task.name);
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

    callGenericPopup(modalTemplate, POPUP_TYPE.TEXT, '', { okButton: '关闭' });

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
    item.find('.cloud-task-download').on('click', async function () {
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
    });
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
    } catch {}

    try { state.qrObserver?.disconnect(); } catch {}
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
        if (scope === 'global') return g.map(map);
        if (scope === 'character') return c.map(map);
        if (scope === 'preset') return p.map(map);
        return { global: g.map(map), character: c.map(map), preset: p.map(map) };
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
        const hit = find(name, scope);
        if (!hit) throw new Error(`找不到任务: ${name}`);

        const body = String(commands ?? '');
        let newCommands;
        if (mode === 'append' || mode === 'prepend') {
            const old = hit.scope === 'global'
                ? await readGlobalTaskCommands(hit.task)
                : String(hit.task.commands || '');
            newCommands = mode === 'append'
                ? (old ? `${old}\n${body}` : body)
                : (old ? `${body}\n${old}` : body);
        } else {
            newCommands = body;
        }

        const previousName = hit.task.name;
        hit.task.commands = newCommands;
        await persistTaskListByScope(hit.scope, hit.list);
        resetTaskRun(previousName);
        refreshTaskLists();
        return { ok: true, scope: hit.scope, name: hit.task.name };
    }

    async function setJS(name, jsCode, opts = {}) {
        const commands = `<<taskjs>>${jsCode}<</taskjs>>`;
        return await setCommands(name, commands, opts);
    }

    async function setProps(name, props, scope = 'all') {
        const hit = find(name, scope);
        if (!hit) throw new Error(`找不到任务: ${name}`);
        const patch = props || {};
        const previousName = hit.task.name;
        const wasDisabled = !!hit.task.disabled;
        const shouldResetPreviousRun = (
            (Object.prototype.hasOwnProperty.call(patch, 'name')
                && normalizeTaskKey(previousName) !== normalizeTaskKey(patch.name))
            || Object.prototype.hasOwnProperty.call(patch, 'commands')
            || (!wasDisabled
                && Object.prototype.hasOwnProperty.call(patch, 'disabled')
                && !!patch.disabled)
        );
        Object.assign(hit.task, patch);
        await persistTaskListByScope(hit.scope, hit.list);
        if (shouldResetPreviousRun) resetTaskRun(previousName);
        refreshTaskLists();
        return { ok: true, scope: hit.scope, name: hit.task.name };
    }

    async function exec(name) {
        const hit = find(name, 'all');
        if (!hit) throw new Error(`找不到任务: ${name}`);
        const commands = hit.scope === 'global'
            ? await readGlobalTaskCommands(hit.task)
            : String(hit.task.commands || '');
        return await executeCommands(commands, hit.task.name);
    }

    async function dump(scope = 'all') {
        if (scope === 'character') return structuredClone(getCharacterTasks() || []);
        if (scope === 'preset') return structuredClone(getPresetTasks() || []);
        const g = await Promise.all((getSettings().globalTasks || []).map(async t => ({
            ...structuredClone(t),
            commands: await readGlobalTaskCommands(t)
        })));
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

    try { if (window.top && window.top !== window) window.top.XBTasks = window.XBTasks; } catch {}
    window.__XB_TASKS_FACADE__ = true;
})();

window.xbqte = async (name) => {
    try {
        if (!name?.trim()) throw new Error('请提供任务名称');
        const expected = name.toLowerCase();
        const globalTask = getSettings().globalTasks.find(task => task.name.toLowerCase() === expected);
        const task = globalTask
            || getCharacterTasks().find(item => item.name.toLowerCase() === expected)
            || getPresetTasks().find(item => item.name.toLowerCase() === expected);
        if (!task) throw new Error(`找不到名为 "${name}" 的任务`);
        if (task.disabled) throw new Error(`任务 "${name}" 已被禁用`);
        const commands = task === globalTask
            ? await readGlobalTaskCommands(task)
            : String(task.commands || '');
        if (isTaskExecutionActive(task.name) || __taskRunMap.has(normalizeTaskKey(task.name))) {
            resetTaskRun(task.name);
        }
        if (isTaskInCooldown(task.name)) {
            const cd = getTaskCooldownStatus()[task.name];
            throw new Error(`任务 "${name}" 仍在冷却中，剩余 ${cd.remainingCooldown}ms`);
        }
        setTaskCooldown(task.name);
        const result = await executeCommands(commands, task.name);
        return result || `已执行任务: ${task.name}`;
    } catch (error) {
        console.error(`执行任务失败: ${error.message}`);
        throw error;
    }
};

window.xbtaskreset = async () => {
    resetAllTaskRuns();
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
        settings.globalTasks[gi].interval = intervalNum;
        saveSettingsDebounced();
        refreshTaskLists();
        return `已设置全局任务 "${name}" 的间隔为 ${intervalNum === 0 ? '手动激活' : `每${intervalNum}楼层`}`;
    }

    const cts = getCharacterTasks();
    const ci = cts.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
    if (ci !== -1) {
        cts[ci].interval = intervalNum;
        await saveCharacterTasks(cts);
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
                const previousTaskName = task.name;
                const wasDisabled = !!task.disabled;

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

                if (isCharacter) await saveCharacterTasks(getCharacterTasks());
                else saveSettingsDebounced();
                if (!wasDisabled && task.disabled === true) resetTaskRun(previousTaskName);
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
    initPresetTaskEvents(refreshPresetTasks);
}

async function initTasks() {
    if (window.__XB_TASKS_INITIALIZED__) {
        console.log('[小白X任务] 已经初始化，跳过重复注册');
        return;
    }
    window.__XB_TASKS_INITIALIZED__ = true;

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
        try { createTaskBar(); } catch {}
    });

    $('#add_global_task').off('.xbTasks').on('click.xbTasks', () => showTaskEditor(null, false, 'global'));
    $('#add_character_task').off('.xbTasks').on('click.xbTasks', () => showTaskEditor(null, false, 'character'));
    $('#add_preset_task').off('.xbTasks').on('click.xbTasks', () => showTaskEditor(null, false, 'preset'));
    $('#toggle_task_bar').off('.xbTasks').on('click.xbTasks', toggleTaskBarVisibility);
    $('#import_global_tasks').off('.xbTasks').on('click.xbTasks', () => $('#import_tasks_file').trigger('click'));
    $('#cloud_tasks_button').off('.xbTasks').on('click.xbTasks', () => showCloudTasksModal());
    $('#import_tasks_file').off('.xbTasks').on('change.xbTasks', function (e) {
        const file = e.target.files[0];
        if (file) { importGlobalTasks(file); $(this).val(''); }
    });

    $('#global_tasks_list').off('.xbTasks')
        .on('input.xbTasks', '.disable_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getSettings().globalTasks;
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) {
                const taskName = list[idx].name;
                const wasDisabled = !!list[idx].disabled;
                const disabled = $(this).prop('checked');
                list[idx].disabled = disabled;
                saveSettingsDebounced();
                if (!wasDisabled && disabled) resetTaskRun(taskName);
                state.lastTasksHash = '';
                refreshTaskLists();
            }
        })
        .on('click.xbTasks', '.edit_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getSettings().globalTasks;
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) editTask(idx, 'global');
        })
        .on('click.xbTasks', '.export_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getSettings().globalTasks;
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) exportSingleTask(idx, 'global');
        })
        .on('click.xbTasks', '.delete_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getSettings().globalTasks;
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) deleteTask(idx, 'global');
        });

    $('#character_tasks_list').off('.xbTasks')
        .on('input.xbTasks', '.disable_task', async function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getCharacterTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) {
                const taskName = list[idx].name;
                const wasDisabled = !!list[idx].disabled;
                const disabled = $(this).prop('checked');
                list[idx].disabled = disabled;
                await saveCharacterTasks(list);
                if (!wasDisabled && disabled) resetTaskRun(taskName);
                state.lastTasksHash = '';
                refreshTaskLists();
            }
        })
        .on('click.xbTasks', '.edit_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getCharacterTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) editTask(idx, 'character');
        })
        .on('click.xbTasks', '.export_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getCharacterTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) exportSingleTask(idx, 'character');
        })
        .on('click.xbTasks', '.delete_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getCharacterTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) deleteTask(idx, 'character');
        });

    $('#preset_tasks_list').off('.xbTasks')
        .on('input.xbTasks', '.disable_task', async function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getPresetTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) {
                const taskName = list[idx].name;
                const wasDisabled = !!list[idx].disabled;
                const disabled = $(this).prop('checked');
                list[idx].disabled = disabled;
                await savePresetTasks([...list]);
                if (!wasDisabled && disabled) resetTaskRun(taskName);
                state.lastTasksHash = '';
                refreshTaskLists();
            }
        })
        .on('click.xbTasks', '.edit_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getPresetTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) editTask(idx, 'preset');
        })
        .on('click.xbTasks', '.export_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getPresetTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) exportSingleTask(idx, 'preset');
        })
        .on('click.xbTasks', '.delete_task', function () {
            const id = $(this).closest('.task-item').attr('data-task-id');
            const list = getPresetTasks();
            const idx = list.findIndex(t => t?.id === id);
            if (idx !== -1) deleteTask(idx, 'preset');
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
        if (window.__XB_TASKS_INITIALIZED__) checkEmbeddedTasks();
    }, 1000);
    state.initTimers.add(embeddedTasksTimer);

    const pluginInitTimer = setTimeout(() => {
        state.initTimers.delete(pluginInitTimer);
        if (!window.__XB_TASKS_INITIALIZED__) return;
        try { checkAndExecuteTasks('plugin_initialized', false, false); } catch (e) { console.debug(e); }
    }, 0);
    state.initTimers.add(pluginInitTimer);
}

export { initTasks };
