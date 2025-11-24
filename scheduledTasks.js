import { extension_settings, getContext, writeExtensionField, renderExtensionTemplateAsync } from "../../../extensions.js";
import { saveSettingsDebounced, eventSource, event_types, characters, this_chid, chat, callPopup } from "../../../../script.js";
import { getPresetManager } from "../../../preset-manager.js";
import { oai_settings } from "../../../openai.js";
import { SlashCommandParser } from "../../../slash-commands/SlashCommandParser.js";
import { SlashCommand } from "../../../slash-commands/SlashCommand.js";
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from "../../../slash-commands/SlashCommandArgument.js";
import { callGenericPopup, POPUP_TYPE } from "../../../popup.js";
import { accountStorage } from "../../../util/AccountStorage.js";
import { download, getFileText, uuidv4, debounce, getSortableDelay } from "../../../utils.js";
import { executeSlashCommand } from "./index.js";

const TASKS_MODULE_NAME = "xiaobaix-tasks";
const EXT_ID = "LittleWhiteBox";
const defaultSettings = { enabled: true, globalTasks: [], processedMessages: [], character_allowed_tasks: [] };
const CONFIG = { MAX_PROCESSED: 20, MAX_COOLDOWN: 10, CLEANUP_INTERVAL: 30000, TASK_COOLDOWN: 50, DEBOUNCE_DELAY: 1000 };

let state = {
    currentEditingTask: null, currentEditingIndex: -1, currentEditingId: null, currentEditingScope: 'global',
    lastChatId: null, chatJustChanged: false,
    isNewChat: false, lastTurnCount: 0, isExecutingTask: false, isCommandGenerated: false,
    taskLastExecutionTime: new Map(), cleanupTimer: null, lastTasksHash: '', taskBarVisible: true,
    processedMessagesSet: new Set(),
    taskBarSignature: '',
    floorCounts: { all: 0, user: 0, llm: 0 },
    dynamicCallbacks: new Map(),
    qrObserver: null,
    isUpdatingTaskBar: false,
    lastPresetName: ''
};
const debouncedSave = debounce(() => saveSettingsDebounced(), CONFIG.DEBOUNCE_DELAY);

const isGloballyEnabled = () => (window.isXiaobaixEnabled !== undefined ? window.isXiaobaixEnabled : true) && getSettings().enabled;
const allTasks = () => {
    const normalizeTiming = (t) => (String(t || '').toLowerCase() === 'initialization' ? 'character_init' : t);
    const mapTiming = (task) => ({ ...task, triggerTiming: normalizeTiming(task.triggerTiming) });
    return [
        ...getSettings().globalTasks.map(mapTiming),
        ...getCharacterTasks().map(mapTiming),
        ...getPresetTasks().map(mapTiming)
    ];
};
const clampInt = (v, min, max, d = 0) => (Number.isFinite(+v) ? Math.max(min, Math.min(max, +v)) : d);
const nowMs = () => Date.now();

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
            debouncedSave();
        }
    }, CONFIG.CLEANUP_INTERVAL);
}

const isTaskInCooldown = (name, t = nowMs()) => {
    const last = state.taskLastExecutionTime.get(name);
    return last && (t - last) < CONFIG.TASK_COOLDOWN;
};
const setTaskCooldown = (name) => state.taskLastExecutionTime.set(name, nowMs());

// ------------- Message processed cache ---
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
    debouncedSave();
}

// ------------- Character tasks -----------
function getCharacterTasks() {
    if (!this_chid || !characters[this_chid]) return [];
    const c = characters[this_chid];
    if (!c.data) c.data = {};
    if (!c.data.extensions) c.data.extensions = {};
    if (!c.data.extensions[TASKS_MODULE_NAME]) c.data.extensions[TASKS_MODULE_NAME] = { tasks: [] };

    const list = c.data.extensions[TASKS_MODULE_NAME].tasks;
    if (!Array.isArray(list)) c.data.extensions[TASKS_MODULE_NAME].tasks = [];
    return c.data.extensions[TASKS_MODULE_NAME].tasks;
}

async function saveCharacterTasks(tasks) {
    if (!this_chid || !characters[this_chid]) return;

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
        debouncedSave();
    }
}

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
        try { return JSON.parse(JSON.stringify(value)); }
        catch { return value; }
    };

    const getPresetManagerSafe = () => {
        try { return getPresetManager('openai'); }
        catch { return null; }
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
            try {
                source = manager.getPresetSettings?.(name) || null;
            } catch {
                source = null;
            }
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
        try { return getPresetManagerSafe()?.getSelectedPresetName?.() || ''; }
        catch { return ''; }
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
            try { oai_settings.prompt_order = structuredClone(clone.prompt_order); }
            catch { oai_settings.prompt_order = clone.prompt_order; }
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

const getTaskListByScope = (scope) => {
    if (scope === 'character') return getCharacterTasks();
    if (scope === 'preset') return getPresetTasks();
    return getSettings().globalTasks;
};

async function persistTaskListByScope(scope, tasks) {
    if (scope === 'character') {
        await saveCharacterTasks(tasks);
        return;
    }
    if (scope === 'preset') {
        await savePresetTasks(tasks);
        return;
    }
    getSettings().globalTasks = [...tasks];
    debouncedSave();
}

async function removeTaskByScope(scope, taskId, fallbackIndex = -1) {
    const list = getTaskListByScope(scope);
    const idx = taskId
        ? list.findIndex(t => t?.id === taskId)
        : fallbackIndex;
    if (idx < 0 || idx >= list.length) return;
    list.splice(idx, 1);
    await persistTaskListByScope(scope, [...list]);
}

const __taskRunMap = new Map();

async function __runTaskSingleInstance(taskName, jsRunner, signature = null) {
    const existing = __taskRunMap.get(taskName);
    if (existing) {
        try { existing.abort?.abort?.(); } catch {}
        try {
            await Promise.resolve(existing.completion).catch(() => {});
        } catch {}
        __taskRunMap.delete(taskName);
        try { console.log(`[任务清理完成] ${taskName}`); } catch {}
    }

    const abort = new AbortController();
    const timers = new Set();
    const intervals = new Set();

    const entry = { abort, timers, intervals, signature, completion: null };
    __taskRunMap.set(taskName, entry);

    const addListener = (target, type, handler, opts = {}) => {
        if (!target?.addEventListener) return;
        target.addEventListener(type, handler, { ...opts, signal: abort.signal });
    };
    const setTimeoutSafe = (fn, t, ...a) => {
        const id = setTimeout(() => {
            timers.delete(id);
            try { fn(...a); } catch (e) { console.error(e); }
        }, t);
        timers.add(id);
        return id;
    };
    const clearTimeoutSafe = (id) => { clearTimeout(id); timers.delete(id); };
    const setIntervalSafe = (fn, t, ...a) => {
        const id = setInterval(fn, t, ...a);
        intervals.add(id);
        return id;
    };
    const clearIntervalSafe = (id) => { clearInterval(id); intervals.delete(id); };

    entry.completion = (async () => {
        try {
            await jsRunner({ addListener, setTimeoutSafe, clearTimeoutSafe, setIntervalSafe, clearIntervalSafe, abortSignal: abort.signal });
        } finally {
            try { abort.abort(); } catch {}
            try {
                timers.forEach((id) => clearTimeout(id));
                intervals.forEach((id) => clearInterval(id));
            } catch {}
            try { window?.dispatchEvent?.(new CustomEvent('xiaobaix-task-cleaned', { detail: { taskName, signature } })); } catch {}
            __taskRunMap.delete(taskName);
        }
    })();

    return entry.completion;
}

// ------------- Command execution ---------
async function executeCommands(commands, taskName) {
    if (!String(commands || '').trim()) return null;
    state.isCommandGenerated = state.isExecutingTask = true;
    try {
        return await processTaskCommands(commands, taskName);
    } finally {
        setTimeout(() => { state.isCommandGenerated = state.isExecutingTask = false; }, 500);
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
            try { await executeTaskJS(jsCode, taskName || 'AnonymousTask'); }
            catch (error) { console.error(`[任务JS执行错误] ${error.message}`); }
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
    } catch {
        return Math.random().toString(36).slice(2);
    }
}

async function executeTaskJS(jsCode, taskName = 'AnonymousTask') {
    const STscript = async (command) => {
        if (!command) return { error: "命令为空" };
        if (!command.startsWith('/')) command = '/' + command;
        return await executeSlashCommand(command);
    };

    const codeSig = __hashStringForKey(String(jsCode || ''));
    const stableKey = (String(taskName || '').trim()) || `js-${codeSig}`;
    const isLightTask = stableKey.startsWith('[x]');

    const old = __taskRunMap.get(stableKey);
    if (old) {
        console.log(`[强制清理旧任务] ${stableKey}`);
        try { old.abort?.abort?.(); } catch {}
        if (!isLightTask) {
            try {
                await Promise.resolve(old.completion).catch(() => {});
            } catch (e) {
                console.warn('[任务调度] 等待旧实例 completion 出错：', stableKey, e);
            }
        }
        __taskRunMap.delete(stableKey);
    }

    const callbackPrefix = `${stableKey}_fl_`;
    for (const [id, entry] of state.dynamicCallbacks.entries()) {
        if (id.startsWith(callbackPrefix)) {
            try { entry?.abortController?.abort(); } catch {}
            state.dynamicCallbacks.delete(id);
            console.log(`[清理旧监听器] ${id}`);
        }
    }

    const jsRunner = async (utils) => {
        const {
            addListener,
            setTimeoutSafe,
            clearTimeoutSafe,
            setIntervalSafe,
            clearIntervalSafe,
            abortSignal
        } = utils;

        const originalWindowFns = {
            setTimeout: window.setTimeout,
            clearTimeout: window.clearTimeout,
            setInterval: window.setInterval,
            clearInterval: window.clearInterval,
        };

        const originals = {
            setTimeout: originalWindowFns.setTimeout.bind(window),
            clearTimeout: originalWindowFns.clearTimeout.bind(window),
            setInterval: originalWindowFns.setInterval.bind(window),
            clearInterval: originalWindowFns.clearInterval.bind(window),
            addEventListener: EventTarget.prototype.addEventListener,
            removeEventListener: EventTarget.prototype.removeEventListener,
            appendChild: Node.prototype.appendChild,
            insertBefore: Node.prototype.insertBefore,
            replaceChild: Node.prototype.replaceChild,
        };

        const timeouts = new Set();
        const intervals = new Set();
        const listeners = new Set();
        const createdNodes = new Set();
        const waiters = new Set();

        const notifyActivityChange = () => {
            if (waiters.size === 0) return;
            for (const cb of Array.from(waiters)) {
                try { cb(); } catch {}
            }
        };

        const normalizeListenerOptions = (options) => (
            typeof options === 'boolean' ? options : !!options?.capture
        );

        window.setTimeout = function(fn, t, ...args) {
            const id = originals.setTimeout(function(...inner) {
                try { fn?.(...inner); }
                finally {
                    timeouts.delete(id);
                    notifyActivityChange();
                }
            }, t, ...args);
            timeouts.add(id);
            notifyActivityChange();
            return id;
        };
        window.clearTimeout = function(id) {
            originals.clearTimeout(id);
            timeouts.delete(id);
            notifyActivityChange();
        };

        window.setInterval = function(fn, t, ...args) {
            const id = originals.setInterval(fn, t, ...args);
            intervals.add(id);
            notifyActivityChange();
            return id;
        };
        window.clearInterval = function(id) {
            originals.clearInterval(id);
            intervals.delete(id);
            notifyActivityChange();
        };

        const addListenerEntry = (entry) => {
            listeners.add(entry);
            notifyActivityChange();
        };
        const removeListenerEntry = (target, type, listener, options) => {
            let removed = false;
            for (const entry of listeners) {
                if (entry.target === target && entry.type === type && entry.listener === listener && entry.capture === normalizeListenerOptions(options)) {
                    listeners.delete(entry);
                    removed = true;
                    break;
                }
            }
            if (removed) notifyActivityChange();
        };

        EventTarget.prototype.addEventListener = function(type, listener, options) {
            addListenerEntry({ target: this, type, listener, capture: normalizeListenerOptions(options) });
            return originals.addEventListener.call(this, type, listener, options);
        };
        EventTarget.prototype.removeEventListener = function(type, listener, options) {
            removeListenerEntry(this, type, listener, options);
            return originals.removeEventListener.call(this, type, listener, options);
        };

        const trackNode = (node) => { try { if (node && node.nodeType === 1) createdNodes.add(node); } catch {} };
        Node.prototype.appendChild = function(child) { trackNode(child); return originals.appendChild.call(this, child); };
        Node.prototype.insertBefore = function(newNode, refNode) { trackNode(newNode); return originals.insertBefore.call(this, newNode, refNode); };
        Node.prototype.replaceChild = function(newNode, oldNode) { trackNode(newNode); return originals.replaceChild.call(this, newNode, oldNode); };

        const restoreGlobals = () => {
            window.setTimeout = originalWindowFns.setTimeout;
            window.clearTimeout = originalWindowFns.clearTimeout;
            window.setInterval = originalWindowFns.setInterval;
            window.clearInterval = originalWindowFns.clearInterval;
            EventTarget.prototype.addEventListener = originals.addEventListener;
            EventTarget.prototype.removeEventListener = originals.removeEventListener;
            Node.prototype.appendChild = originals.appendChild;
            Node.prototype.insertBefore = originals.insertBefore;
            Node.prototype.replaceChild = originals.replaceChild;
        };

        const hardCleanup = () => {
            try { timeouts.forEach(id => originals.clearTimeout(id)); } catch {}
            try { intervals.forEach(id => originals.clearInterval(id)); } catch {}
            try {
                for (const entry of listeners) {
                    const { target, type, listener, capture } = entry;
                    originals.removeEventListener.call(target, type, listener, capture);
                }
            } catch {}
            try {
                createdNodes.forEach(node => {
                    if (!node?.parentNode) return;
                    if (node.id?.startsWith('xiaobaix_') || node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
                        try { node.parentNode.removeChild(node); } catch {}
                    }
                });
            } catch {}
            listeners.clear();
            waiters.clear();
        };

        const addFloorListener = (callback, options = {}) => {
            if (typeof callback !== 'function') throw new Error('callback 必须是函数');

            const callbackId = `${stableKey}_fl_${uuidv4()}`;
            const entryAbort = new AbortController();

            try {
                abortSignal.addEventListener('abort', () => {
                    try { entryAbort.abort(); } catch {}
                    state.dynamicCallbacks.delete(callbackId);
                });
            } catch {}

            state.dynamicCallbacks.set(callbackId, {
                callback,
                options: {
                    interval: Number.isFinite(parseInt(options.interval)) ? parseInt(options.interval) : 0,
                    timing: options.timing || 'after_ai',
                    floorType: options.floorType || 'all'
                },
                abortController: entryAbort
            });

            console.log(`[注册新监听器] ${callbackId}`, options);

            return () => {
                try { entryAbort.abort(); } catch {}
                state.dynamicCallbacks.delete(callbackId);
            };
        };

        const runInScope = async (code) => {
            const fn = new Function(
                'STscript',
                'addFloorListener',
                'addListener', 'setTimeoutSafe', 'clearTimeoutSafe', 'setIntervalSafe', 'clearIntervalSafe', 'abortSignal',
                `return (async () => { ${code} })();`
            );
            return await fn(
                STscript,
                addFloorListener,
                addListener,
                setTimeoutSafe,
                clearTimeoutSafe,
                setIntervalSafe,
                clearIntervalSafe,
                abortSignal
            );
        };

        const hasActiveResources = () => (
            timeouts.size > 0 ||
            intervals.size > 0 ||
            listeners.size > 0
        );

        const waitForAsyncSettled = () => new Promise((resolve) => {
            if (abortSignal?.aborted) return resolve();
            if (!hasActiveResources()) return resolve();

            let finished = false;

            const finalize = () => {
                if (finished) return;
                finished = true;
                waiters.delete(checkStatus);
                try { abortSignal?.removeEventListener?.('abort', finalize); } catch {}
                resolve();
            };

            const checkStatus = () => {
                if (finished) return;
                if (abortSignal?.aborted) return finalize();
                if (!hasActiveResources()) finalize();
            };

            waiters.add(checkStatus);
            try { abortSignal?.addEventListener?.('abort', finalize, { once: true }); } catch {}
            checkStatus();
        });

        try {
            await runInScope(jsCode);
            await waitForAsyncSettled();
        } finally {
            try { hardCleanup(); } finally { restoreGlobals(); }
        }
    };

    if (isLightTask) {
        __runTaskSingleInstance(stableKey, jsRunner, codeSig);
        return;
    }

    await __runTaskSingleInstance(stableKey, jsRunner, codeSig);
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

// ------------- Chat metrics --------------
function getFloorCounts() {
    return state.floorCounts || { all: 0, user: 0, llm: 0 };
}
function pickFloorByType(floorType, counts) {
    switch (floorType) {
        case 'user': return Math.max(0, counts.user - 1);
        case 'llm': return Math.max(0, counts.llm - 1);
        default:     return Math.max(0, counts.all - 1);
    }
}
function calculateTurnCount() {
    if (!Array.isArray(chat) || chat.length === 0) return 0;
    const userMessages = chat.filter(msg => msg.is_user && !msg.is_system).length;
    const aiMessages = chat.filter(msg => !msg.is_user && !msg.is_system).length;
    return Math.min(userMessages, aiMessages);
}

// ------------- Task trigger core ---------
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
	if (!isGloballyEnabled() || state.isExecutingTask) return;

	const tasks = allTasks();
	const n = nowMs();
	const counts = getFloorCounts();

	const dynamicTaskList = [];
	if (state.dynamicCallbacks?.size > 0) {
		for (const [callbackId, entry] of state.dynamicCallbacks.entries()) {
			const { callback, options, abortController } = entry || {};
			if (!callback) { state.dynamicCallbacks.delete(callbackId); continue; }
			if (abortController?.signal?.aborted) { state.dynamicCallbacks.delete(callbackId); continue; }
			const interval = Number.isFinite(parseInt(options?.interval)) ? parseInt(options.interval) : 0;
			dynamicTaskList.push({
				name: callbackId,
				disabled: false,
				interval,
				floorType: options?.floorType || 'all',
				triggerTiming: options?.timing || 'after_ai',
				__dynamic: true,
				__callback: callback
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

	for (const task of tasksToExecute) {
		state.taskLastExecutionTime.set(task.name, n);
		if (task.__dynamic) {
			try {
				const currentFloor = pickFloorByType(task.floorType || 'all', counts);
				await Promise.resolve().then(() => task.__callback({
					timing: triggerContext,
					floors: counts,
					currentFloor,
					interval: task.interval,
					floorType: task.floorType || 'all'
				}));
			} catch (e) { console.error('[动态回调错误]', task.name, e); }
		} else {
			await executeCommands(task.commands, task.name);
		}
	}

    if (triggerContext === 'after_ai') state.lastTurnCount = calculateTurnCount();
}

// ------------- Event handlers ------------
async function onMessageReceived(messageId) {
    if (typeof messageId !== 'number' || messageId < 0 || !chat[messageId]) return;
    const message = chat[messageId];
    if (message.is_user || message.is_system || message.mes === '...' ||
        state.isCommandGenerated || state.isExecutingTask ||
        (message.swipe_id !== undefined && message.swipe_id > 0)) return;

    if (!isGloballyEnabled()) return;

    const messageKey = `${getContext().chatId}_${messageId}_${message.send_date || nowMs()}`;
    if (isMessageProcessed(messageKey)) return;

    markMessageAsProcessed(messageKey);
    try { state.floorCounts.all = Math.max(0, (state.floorCounts.all || 0) + 1); state.floorCounts.llm = Math.max(0, (state.floorCounts.llm || 0) + 1); } catch {}
    await checkAndExecuteTasks('after_ai');
    state.chatJustChanged = state.isNewChat = false;
}

async function onUserMessage() {
    if (!isGloballyEnabled()) return;
    const messageKey = `${getContext().chatId}_user_${chat.length}`;
    if (isMessageProcessed(messageKey)) return;

    markMessageAsProcessed(messageKey);
    try { state.floorCounts.all = Math.max(0, (state.floorCounts.all || 0) + 1); state.floorCounts.user = Math.max(0, (state.floorCounts.user || 0) + 1); } catch {}
    await checkAndExecuteTasks('before_user');
    state.chatJustChanged = state.isNewChat = false;
}

function onMessageDeleted() {
    const settings = getSettings();
    const chatId = getContext().chatId;
    settings.processedMessages = settings.processedMessages.filter(key => !key.startsWith(`${chatId}_`));
    state.processedMessagesSet = new Set(settings.processedMessages);
    state.isExecutingTask = state.isCommandGenerated = false;
    try {
        let user = 0, llm = 0, all = 0;
        if (Array.isArray(chat)) {
            for (const m of chat) {
                all++;
                if (m.is_system) continue;
                if (m.is_user) user++; else llm++;
            }
        }
        state.floorCounts = { all, user, llm };
    } catch {}
    debouncedSave();
}

async function onChatChanged(chatId) {
    Object.assign(state, {
        chatJustChanged: true,
        isNewChat: state.lastChatId !== chatId && chat.length <= 1,
        lastChatId: chatId,
        lastTurnCount: 0,
        isExecutingTask: false,
        isCommandGenerated: false
    });
    state.taskLastExecutionTime.clear();

    requestAnimationFrame(() => {
        state.processedMessagesSet.clear();
        const settings = getSettings();
        settings.processedMessages = [];

        checkEmbeddedTasks();
        refreshUI();
        checkAndExecuteTasks('chat_changed', false, false);
        requestAnimationFrame(() => requestAnimationFrame(() => { try { updateTaskBar(); } catch {} }));
    });

    try {
        let user = 0, llm = 0, all = 0;
        if (Array.isArray(chat)) {
            for (const m of chat) {
                all++;
                if (m.is_system) continue;
                if (m.is_user) user++; else llm++;
            }
        }
        state.floorCounts = { all, user, llm };
    } catch {}

    setTimeout(() => { state.chatJustChanged = state.isNewChat = false; }, 2000);
}

async function onChatCreated() {
    Object.assign(state, { isNewChat: true, chatJustChanged: true });	
    try {
        let user = 0, llm = 0, all = 0;
        if (Array.isArray(chat)) {
            for (const m of chat) {
                all++;
                if (m.is_system) continue;
                if (m.is_user) user++; else llm++;
            }
        }
        state.floorCounts = { all, user, llm };
    } catch {}
    await checkAndExecuteTasks('chat_created', false, false);
}

function onPresetChanged(event) {
    const apiId = event?.apiId;
    if (apiId && apiId !== 'openai') return;
    resetPresetTasksCache();
    state.lastTasksHash = '';
    refreshUI();
}

function onMainApiChanged() {
    resetPresetTasksCache();
    state.lastTasksHash = '';
    refreshUI();
}

// ------------- UI: lists & items ----------
function getTasksHash() {
    const globalTasks = getSettings().globalTasks;
    const characterTasks = getCharacterTasks();
    const presetTasks = getPresetTasks();
    const presetName = PresetTasksStore.currentName();
    const all = [...globalTasks, ...characterTasks, ...presetTasks];
    return `${presetName || ''}|${all.map(t => `${t.id}_${t.disabled}_${t.name}_${t.interval}_${t.floorType}_${t.triggerTiming || 'after_ai'}_${(t.commands || '').length}`).join('|')}`;
}

function createTaskItemSimple(task, index, scope = 'global') {
    if (!task.id) task.id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const taskType = scope || 'global';
    const floorTypeText = { user: '用户楼层', llm: 'LLM楼层' }[task.floorType] || '全部楼层';
    const triggerTimingText = {
        before_user: '用户前',
        any_message: '任意对话',
        initialization: '角色卡初始化',
        plugin_init: '插件初始化',
        only_this_floor: '仅该楼层',
        chat_changed: '切换聊天后'
    }[task.triggerTiming] || 'AI后';

    let displayName;
    if (task.interval === 0) displayName = `${task.name} (手动触发)`;
    else if (task.triggerTiming === 'initialization' || task.triggerTiming === 'character_init') displayName = `${task.name} (角色卡初始化)`;
    else if (task.triggerTiming === 'plugin_init') displayName = `${task.name} (插件初始化)`;
    else if (task.triggerTiming === 'chat_changed') displayName = `${task.name} (切换聊天后)`;
    else if (task.triggerTiming === 'only_this_floor') displayName = `${task.name} (仅第${task.interval}${floorTypeText})`;
    else displayName = `${task.name} (每${task.interval}${floorTypeText}·${triggerTimingText})`;

    const taskElement = $('#task_item_template').children().first().clone();
    taskElement.attr({ id: task.id, 'data-index': index, 'data-type': taskType });
    taskElement.find('.task_name').attr('title', task.commands).text(displayName);
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
    globalTasks.forEach((task, i) => {
        const el = createTaskItemSimple(task, i, 'global');
        globalFragment.appendChild(el[0]);
    });
    $globalList.empty().append(globalFragment);

    const charFragment = document.createDocumentFragment();
    characterTasks.forEach((task, i) => {
        const el = createTaskItemSimple(task, i, 'character');
        charFragment.appendChild(el[0]);
    });
    $charList.empty().append(charFragment);

    if ($presetList.length) {
        const presetFragment = document.createDocumentFragment();
        presetTasks.forEach((task, i) => {
            const el = createTaskItemSimple(task, i, 'preset');
            presetFragment.appendChild(el[0]);
        });
        $presetList.empty().append(presetFragment);
    }

    initSortable($globalList, function () {
        const newOrderIds = $globalList.sortable('toArray');
        const current = getSettings().globalTasks;
        const idToTask = new Map(current.map(t => [t.id, t]));
        const reordered = newOrderIds.map(id => idToTask.get(id)).filter(Boolean);
        const leftovers = current.filter(t => !newOrderIds.includes(t.id));
        getSettings().globalTasks = [...reordered, ...leftovers];
        debouncedSave();
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

// ------------- Task bar-------------------
const cache = { bar: null, btns: null, sig: '', ts: 0 };

const getActivatedTasks = () => isGloballyEnabled()
    ? allTasks().filter(t => t.buttonActivated && !t.disabled)
    : [];

const getBar = () => {
    if (cache.bar?.isConnected) return cache.bar;
    
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
    }
    
    cache.btns = cache.bar?.querySelector('.qr--buttons');
    return cache.bar;
};

function createTaskBar() {
    const tasks = getActivatedTasks();
    const sig = state.taskBarVisible ? tasks.map(t => t.name).join() : '';
    
    if (sig === cache.sig && Date.now() - cache.ts < 100) return;
    
    const bar = getBar();
    if (!bar) return;
    
    bar.style.display = state.taskBarVisible ? '' : 'none';
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
    cache.sig = sig;
    cache.ts = Date.now();
}

const updateTaskBar = debounce(createTaskBar, 100);

function toggleTaskBarVisibility() {
    state.taskBarVisible = !state.taskBarVisible;
    const bar = getBar();
    bar && (bar.style.display = state.taskBarVisible ? '' : 'none');
    createTaskBar();
    
    const btn = document.getElementById('toggle_task_bar');
    const txt = btn?.querySelector('small');
    if (txt) {
        txt.style.cssText = state.taskBarVisible ? 
            'opacity:1;text-decoration:none' : 
            'opacity:.5;text-decoration:line-through';
        btn.title = state.taskBarVisible ? '隐藏任务栏' : '显示任务栏';
    }
}

document.addEventListener('click', e => {
    const btn = e.target.closest('.xiaobaix-task-button');
    if (!btn) return;
    if (!isGloballyEnabled()) return;
    window.xbqte(btn.dataset.taskName).catch(console.error);
});


new MutationObserver(updateTaskBar).observe(document.body, { childList: true, subtree: true });


// ------------- Editor ---------------------
function showTaskEditor(task = null, isEdit = false, scope = 'global') {
    const initialScope = scope || 'global';
    const sourceList = getTaskListByScope(initialScope);
    state.currentEditingTask = task;
    state.currentEditingScope = initialScope;
    state.currentEditingIndex = isEdit ? sourceList.indexOf(task) : -1;
    state.currentEditingId = task?.id || null;

    const editorTemplate = $('#task_editor_template').clone().removeAttr('id').show();
    editorTemplate.find('.task_name_edit').val(task?.name || '');
    editorTemplate.find('.task_commands_edit').val(task?.commands || '');
    editorTemplate.find('.task_interval_edit').val(task?.interval ?? 3);
    editorTemplate.find('.task_floor_type_edit').val(task?.floorType || 'all');
    editorTemplate.find('.task_trigger_timing_edit').val(task?.triggerTiming || 'after_ai');
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

        const shouldShowWarning = interval > 0 && floorType === 'all' &&
                                 (triggerTiming === 'after_ai' || triggerTiming === 'before_user');
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
            const newTask = {
                ...base,
                id: base.id || `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                name: uniqueName,
                commands: String(editorTemplate.find('.task_commands_edit').val() || '').trim(),
                interval: parseInt(String(editorTemplate.find('.task_interval_edit').val() || '0'), 10) || 0,
                floorType: editorTemplate.find('.task_floor_type_edit').val() || 'all',
                triggerTiming: editorTemplate.find('.task_trigger_timing_edit').val() || 'after_ai',
                disabled: !editorTemplate.find('.task_enabled_edit').prop('checked'),
                buttonActivated: editorTemplate.find('.task_button_activated_edit').prop('checked'),
                createdAt: base.createdAt || new Date().toISOString(),
            };
            const targetScope = String(editorTemplate.find('.task_type_edit').val() || initialScope);
            await saveTaskFromEditor(newTask, targetScope);
        }
    });
}

async function saveTaskFromEditor(task, scope) {
    const targetScope = scope === 'character' || scope === 'preset' ? scope : 'global';
    const isManual = (task?.interval === 0);
    if (!task.name || (!isManual && !task.commands)) return;

    const isEditingExistingTask = state.currentEditingIndex >= 0 || !!state.currentEditingId;
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
    if (idx >= 0 && idx < list.length) list[idx] = task; else list.push(task);
    await persistTaskListByScope(targetScope, [...list]);

    state.currentEditingScope = targetScope;
    state.lastTasksHash = '';
    refreshUI();
}

function saveTask(task, index, scope) {
    const list = getTaskListByScope(scope);
    if (index >= 0 && index < list.length) list[index] = task;
    persistTaskListByScope(scope, [...list]);
    refreshUI();
}

async function testTask(index, scope) {
    const list = getTaskListByScope(scope);
    const task = list[index];
    if (task) await executeCommands(task.commands, task.name);
}

function editTask(index, scope) {
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
            refreshUI();
        }
    } catch (error) {
        console.error('删除任务时出错:', error);
        document.getElementById('temp-dialog-style')?.remove();
    }
}

const getAllTaskNames = () => allTasks().filter(t => !t.disabled).map(t => t.name);

// ------------- Embedded tasks -------------
async function checkEmbeddedTasks() {
    if (!this_chid) return;
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
                    const templateFilePath = `scripts/extensions/third-party/LittleWhiteBox/embeddedTasks.html`;
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
                    debouncedSave();
                }
            }
        }
    }
    refreshTaskLists();
}

// ------------- Cloud Tasks ---------------
const CLOUD_TASKS_API = 'https://task.whitelittlebox.qzz.io/';

async function fetchCloudTasks() {
    try {
        const response = await fetch(CLOUD_TASKS_API, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Plugin-Key': 'xbaix',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
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

    const popup = callGenericPopup(modalTemplate, POPUP_TYPE.TEXT, '', { okButton: '关闭'});

    try {
        const cloudTasks = await fetchCloudTasks();

        if (!cloudTasks || cloudTasks.length === 0) {
            throw new Error('云端没有可用的任务');
        }

        const globalTasks = cloudTasks.filter(t => t.type === 'global');
        const characterTasks = cloudTasks.filter(t => t.type === 'character');

        const globalList = modalTemplate.find('.cloud-global-tasks');
        if (globalTasks.length === 0) {
            globalList.html('<div style="color: #888; padding: 10px;">暂无全局任务</div>');
        } else {
            globalTasks.forEach(task => {
                const item = createCloudTaskItem(task);
                globalList.append(item);
            });
        }

        const characterList = modalTemplate.find('.cloud-character-tasks');
        if (characterTasks.length === 0) {
            characterList.html('<div style="color: #888; padding: 10px;">暂无角色任务</div>');
        } else {
            characterTasks.forEach(task => {
                const item = createCloudTaskItem(task);
                characterList.append(item);
            });
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
    item.find('.cloud-task-intro').text(taskInfo.简介 || '无简介');

    item.find('.cloud-task-download').on('click', async function() {
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

// ------------- Import/Export --------------
async function exportGlobalTasks() {
    const tasks = getSettings().globalTasks;
    if (tasks.length === 0) return;
    const fileName = `global_tasks_${new Date().toISOString().split('T')[0]}.json`;
    const fileData = JSON.stringify({ type: 'global', exportDate: new Date().toISOString(), tasks }, null, 4);
    download(fileData, fileName, 'application/json');
}

function exportSingleTask(index, scope) {
    const tasks = getTaskListByScope(scope);
    if (index < 0 || index >= tasks.length) return;
    const task = tasks[index];
    const type = scope;
    const fileName = `${type}_task_${task?.name || 'unnamed'}_${new Date().toISOString().split('T')[0]}.json`;
    const fileData = JSON.stringify({ type, exportDate: new Date().toISOString(), tasks: [task] }, null, 4);
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
            if (raw.type === 'character' || raw.type === 'global' || raw.type === 'preset') {
                fileType = raw.type;
            }
        } else if (raw && typeof raw === 'object' && raw.name && (raw.commands || raw.interval !== undefined)) {
            incomingTasks = [raw];
            if (raw.type === 'character' || raw.type === 'global' || raw.type === 'preset') {
                fileType = raw.type;
            }
        } else {
            throw new Error('无效的任务文件格式');
        }

        const VALID_FLOOR = ['all', 'user', 'llm'];
        const VALID_TIMING = [
            'after_ai', 'before_user', 'any_message',
            'initialization', 'character_init', 'plugin_init',
            'only_this_floor', 'chat_changed'
        ];
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

        if (!tasksToImport.length) {
            throw new Error('没有可导入的任务');
        }

        if (fileType === 'character') {
            if (!this_chid || !characters[this_chid]) {
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
            const settings = getSettings();
            settings.globalTasks = [...settings.globalTasks, ...tasksToImport];
            debouncedSave();
        }

        refreshTaskLists();
        toastr?.success?.(`已导入 ${tasksToImport.length} 个任务`);
    } catch (error) {
        console.error('任务导入失败:', error);
        toastr?.error?.(`导入失败：${error.message}`);
    }
}

// ------------- Tools / Debug -------------
function clearProcessedMessages() {
    getSettings().processedMessages = [];
    state.processedMessagesSet.clear();
    debouncedSave();
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
        maxProcessedMessages: CONFIG.MAX_PROCESSED,
        maxCooldownEntries: CONFIG.MAX_COOLDOWN
    };
}

// ------------- UI Refresh/Cleanup --------
function refreshUI() {
    refreshTaskLists();
    updateTaskBar();
}

function onMessageSwiped() {
    state.isExecutingTask = state.isCommandGenerated = false;
}

function onCharacterDeleted({ character }) {
    const avatar = character?.avatar;
    const settings = getSettings();
    if (avatar && settings.character_allowed_tasks?.includes(avatar)) {
        const index = settings.character_allowed_tasks.indexOf(avatar);
        if (index !== -1) {
            settings.character_allowed_tasks.splice(index, 1);
            debouncedSave();
        }
    }
}

function cleanup() {
    if (state.cleanupTimer) {
        clearInterval(state.cleanupTimer);
        state.cleanupTimer = null;
    }
    state.taskLastExecutionTime.clear();

    try {
        if (state.dynamicCallbacks && state.dynamicCallbacks.size > 0) {
            for (const [id, entry] of state.dynamicCallbacks.entries()) {
                try { entry?.abortController?.abort(); } catch {}
            }
            state.dynamicCallbacks.clear();
        }
    } catch {}

    eventSource.removeListener(event_types.CHARACTER_MESSAGE_RENDERED, onMessageReceived);
    eventSource.removeListener(event_types.USER_MESSAGE_RENDERED, onUserMessage);
    eventSource.removeListener(event_types.CHAT_CHANGED, onChatChanged);
    eventSource.removeListener(event_types.CHAT_CREATED, onChatCreated);
    eventSource.removeListener(event_types.MESSAGE_DELETED, onMessageDeleted);
    eventSource.removeListener(event_types.MESSAGE_SWIPED, onMessageSwiped);
    eventSource.removeListener(event_types.CHARACTER_DELETED, onCharacterDeleted);
    eventSource.removeListener(event_types.PRESET_CHANGED, onPresetChanged);
    eventSource.removeListener(event_types.OAI_PRESET_CHANGED_AFTER, onPresetChanged);
    eventSource.removeListener(event_types.MAIN_API_CHANGED, onMainApiChanged);

    window.removeEventListener('message', handleTaskMessage);
    $(window).off('beforeunload', cleanup);

    try {
        const $qrButtons = $('#qr--bar .qr--buttons, #qr--bar, #qr-bar');
        $qrButtons.off('click.xb');
        $qrButtons.find('.xiaobaix-task-button').remove();
    } catch {}

    try { state.qrObserver?.disconnect(); } catch {}
    state.qrObserver = null;

    resetPresetTasksCache();
    delete window.__XB_TASKS_INITIALIZED__;
}

// ------------- Public API ----------------
(function(){
  if (window.__XB_TASKS_FACADE__) return;

  const norm = s => String(s ?? '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase();

  function list(scope='all'){
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

  function find(name, scope='all'){
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

  async function setCommands(name, commands, opts = {}){
    const { mode='replace', scope='all' } = opts;
    const hit = find(name, scope);
    if (!hit) throw new Error(`任务未找到: ${name}`);
    const old = String(hit.task.commands || '');
    const body = String(commands ?? '');
    if (mode === 'append') hit.task.commands = old ? (old + '\n' + body) : body;
    else if (mode === 'prepend') hit.task.commands = old ? (body + '\n' + old) : body;
    else hit.task.commands = body;

    if (hit.scope === 'character') {
      await saveCharacterTasks(hit.list);
    } else if (hit.scope === 'preset') {
      await savePresetTasks(hit.list);
    } else {
      debouncedSave();
    }
    refreshTaskLists();
    return { ok: true, scope: hit.scope, name: hit.task.name };
  }

  async function setJS(name, jsCode, opts = {}){
    const commands = `<<taskjs>>${jsCode}<</taskjs>>`;
    return await setCommands(name, commands, opts);
  }

  async function setProps(name, props, scope='all'){
    const hit = find(name, scope);
    if (!hit) throw new Error(`任务未找到: ${name}`);
    Object.assign(hit.task, props || {});
    if (hit.scope === 'character') {
      await saveCharacterTasks(hit.list);
    } else if (hit.scope === 'preset') {
      await savePresetTasks(hit.list);
    } else {
      debouncedSave();
    }
    refreshTaskLists();
    return { ok: true, scope: hit.scope, name: hit.task.name };
  }

  async function exec(name){
    const hit = find(name, 'all');
    if (!hit) throw new Error(`任务未找到: ${name}`);
    return await executeCommands(hit.task.commands, hit.task.name);
  }

  function dump(scope='all'){
    const g = structuredClone(getSettings().globalTasks || []);
    const c = structuredClone(getCharacterTasks() || []);
    const p = structuredClone(getPresetTasks() || []);
    if (scope === 'global') return g;
    if (scope === 'character') return c;
    if (scope === 'preset') return p;
    return { global: g, character: c, preset: p };
  }

  window.XBTasks = {
    list, dump, find,
    setCommands, setJS, setProps, exec,
    get global(){ return getSettings().globalTasks; },
    get character(){ return getCharacterTasks(); },
    get preset(){ return getPresetTasks(); },
  };

  try { if (window.top && window.top !== window) window.top.XBTasks = window.XBTasks; } catch {}
  window.__XB_TASKS_FACADE__ = true;
})();

window.xbqte = async (name) => {
    try {
        if (!name?.trim()) throw new Error('请提供任务名称');
        const task = allTasks().find(t => t.name.toLowerCase() === name.toLowerCase());
        if (!task) throw new Error(`找不到名为 "${name}" 的任务`);
        if (task.disabled) throw new Error(`任务 "${name}" 已被禁用`);
        if (isTaskInCooldown(task.name)) {
            const cd = getTaskCooldownStatus()[task.name];
            throw new Error(`任务 "${name}" 仍在冷却中，剩余 ${cd.remainingCooldown}ms`);
        }
        setTaskCooldown(task.name);
        const result = await executeCommands(task.commands, task.name);
        return result || `已执行任务: ${task.name}`;
    } catch (error) {
        console.error(`执行任务失败: ${error.message}`);
        throw error;
    }
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
        debouncedSave();
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

// ------------- Slash commands -------------
function registerSlashCommands() {
    try {
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'xbqte',
            callback: async (args, value) => {
                if (!value) return '请提供任务名称。用法: /xbqte 任务名称';
                try { return await window.xbqte(value); }
                catch (error) { return `错误: ${error.message}`; }
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

                if (namedArgs.status !== undefined) {
                    const val = String(namedArgs.status).toLowerCase();
                    if (val === 'on' || val === 'true') {
                        task.disabled = false;
                        changed.push('状态=启用');
                    } else if (val === 'off' || val === 'false') {
                        task.disabled = true;
                        changed.push('状态=禁用');
                    } else throw new Error('status 仅支持 on/off');
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
                else debouncedSave();
                refreshTaskLists();

                return `已更新任务 "${name}": ${changed.join(', ')}`;
            },
            namedArgumentList: [
                SlashCommandNamedArgument.fromProps({
                    name: 'status',
                    description: '启用/禁用',
                    typeList: [ARGUMENT_TYPE.STRING],
                    enumList: ['on', 'off'],
                }),
                SlashCommandNamedArgument.fromProps({
                    name: 'interval',
                    description: '楼层间隔(0=手动)',
                    typeList: [ARGUMENT_TYPE.NUMBER],
                }),
                SlashCommandNamedArgument.fromProps({
                    name: 'timing',
                    description: '触发时机',
                    typeList: [ARGUMENT_TYPE.STRING],
                    enumList: ['after_ai', 'before_user', 'any_message', 'initialization', 'character_init', 'plugin_init', 'only_this_floor', 'chat_changed'],
                }),
                SlashCommandNamedArgument.fromProps({
                    name: 'floorType',
                    description: '楼层类型',
                    typeList: [ARGUMENT_TYPE.STRING],
                    enumList: ['all', 'user', 'llm'],
                }),
            ],
            unnamedArgumentList: [
                SlashCommandArgument.fromProps({
                    description: '任务名称',
                    typeList: [ARGUMENT_TYPE.STRING],
                    isRequired: true,
                    enumProvider: getAllTaskNames
                })
            ],
            helpString: `设置任务属性
        用法: /xbset status=on/off interval=数字 timing=时机 floorType=类型 任务名
        示例:
        /xbset status=off 我的任务
        /xbset interval=5 timing=before_user 我的任务`
        }));
    } catch (error) {
        console.error("Error registering slash commands:", error);
    }
}

// ------------- Init -----------------------
function initTasks() {
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
        window.registerModuleCleanup('scheduledTasks', cleanup);
    }

    window.addEventListener('message', handleTaskMessage);

    $('#scheduled_tasks_enabled').on('input', e => {
        const enabled = $(e.target).prop('checked');
        getSettings().enabled = enabled;
        debouncedSave();
        try { createTaskBar(); } catch {}
    });

    $('#add_global_task').on('click', () => showTaskEditor(null, false, 'global'));
    $('#add_character_task').on('click', () => showTaskEditor(null, false, 'character'));
    $('#add_preset_task').on('click', () => showTaskEditor(null, false, 'preset'));
    $('#toggle_task_bar').on('click', toggleTaskBarVisibility);
    $('#import_global_tasks').on('click', () => $('#import_tasks_file').trigger('click'));
    $('#cloud_tasks_button').on('click', () => showCloudTasksModal());
    $('#import_tasks_file').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            importGlobalTasks(file);
            $(this).val('');
        }
    });

    $('#global_tasks_list')
        .on('input', '.disable_task', function() {
            const $item = $(this).closest('.task-item');
            const idx = parseInt($item.attr('data-index'), 10);
            const list = getSettings().globalTasks;
            if (list[idx]) {
                list[idx].disabled = $(this).prop('checked');
                debouncedSave();
                state.lastTasksHash = '';
                refreshTaskLists();
            }
        })
        .on('click', '.edit_task', function() {
            const idx = parseInt($(this).closest('.task-item').attr('data-index'));
            editTask(idx, 'global');
        })
        .on('click', '.export_task', function() {
            const idx = parseInt($(this).closest('.task-item').attr('data-index'));
            exportSingleTask(idx, 'global');
        })
        .on('click', '.delete_task', function() {
            const idx = parseInt($(this).closest('.task-item').attr('data-index'));
            deleteTask(idx, 'global');
        });

    $('#character_tasks_list')
        .on('input', '.disable_task', function() {
            const $item = $(this).closest('.task-item');
            const idx = parseInt($item.attr('data-index'), 10);
            const tasks = getCharacterTasks();
            if (tasks[idx]) {
                tasks[idx].disabled = $(this).prop('checked');
                saveCharacterTasks(tasks);
                state.lastTasksHash = '';
                refreshTaskLists();
            }
        })
        .on('click', '.edit_task', function() {
            const idx = parseInt($(this).closest('.task-item').attr('data-index'));
            editTask(idx, 'character');
        })
        .on('click', '.export_task', function() {
            const idx = parseInt($(this).closest('.task-item').attr('data-index'));
            exportSingleTask(idx, 'character');
        })
        .on('click', '.delete_task', function() {
            const idx = parseInt($(this).closest('.task-item').attr('data-index'));
            deleteTask(idx, 'character');
        });

    $('#preset_tasks_list')
        .on('input', '.disable_task', async function() {
            const $item = $(this).closest('.task-item');
            const idx = parseInt($item.attr('data-index'), 10);
            const tasks = getPresetTasks();
            if (tasks[idx]) {
                tasks[idx].disabled = $(this).prop('checked');
                await savePresetTasks([...tasks]);
                state.lastTasksHash = '';
                refreshTaskLists();
            }
        })
        .on('click', '.edit_task', function() {
            const idx = parseInt($(this).closest('.task-item').attr('data-index'));
            editTask(idx, 'preset');
        })
        .on('click', '.export_task', function() {
            const idx = parseInt($(this).closest('.task-item').attr('data-index'));
            exportSingleTask(idx, 'preset');
        })
        .on('click', '.delete_task', function() {
            const idx = parseInt($(this).closest('.task-item').attr('data-index'));
            deleteTask(idx, 'preset');
        });

    $('#scheduled_tasks_enabled').prop('checked', getSettings().enabled);
    refreshTaskLists();

    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, onMessageReceived);
    eventSource.on(event_types.USER_MESSAGE_RENDERED, onUserMessage);
    eventSource.on(event_types.CHAT_CHANGED, onChatChanged);
    eventSource.on(event_types.CHAT_CREATED, onChatCreated);
    eventSource.on(event_types.MESSAGE_DELETED, onMessageDeleted);
    eventSource.on(event_types.MESSAGE_SWIPED, onMessageSwiped);
    eventSource.on(event_types.CHARACTER_DELETED, onCharacterDeleted);
    eventSource.on(event_types.PRESET_CHANGED, onPresetChanged);
    eventSource.on(event_types.OAI_PRESET_CHANGED_AFTER, onPresetChanged);
    eventSource.on(event_types.MAIN_API_CHANGED, onMainApiChanged);

    $(window).on('beforeunload', cleanup);
    registerSlashCommands();
    setTimeout(() => checkEmbeddedTasks(), 1000);

    setTimeout(() => {
        try { checkAndExecuteTasks('plugin_initialized', false, false); }
        catch (e) { console.debug(e); }
    }, 0);
}

export { initTasks };
