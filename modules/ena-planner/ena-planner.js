import { resolveTextApi, generateFeatureText, handleTextApiRequest } from '../text-api/host.js';
import { getTextApiRepository } from '../text-api/repository.js';
import { extension_settings } from '../../../../../extensions.js';
import {
    saveSettingsDebounced,
    substituteParamsExtended,
} from '../../../../../../script.js';
import { extensionFolderPath } from '../../core/constants.js';
import { EnaPlannerStorage } from '../../core/server-storage.js';
import { filterPlannerResponse } from './ena-planner-filter.js';
import { postToIframe, isTrustedIframeEvent } from '../../core/iframe-messaging.js';
import { DEFAULT_PROMPT_BLOCKS, BUILTIN_TEMPLATES } from './ena-planner-presets.js';
import { migratePlannerPromptConfig } from './ena-planner-prompt-migration.js';
import { buildPlannerTurnMessages } from './ena-planner-messages.js';
import { renderPlannerEjs } from './ena-planner-ejs.js';
import { createPlannerHost } from './ena-planner-host.js';
import { formatPlannerContext } from './ena-planner-context.js';
import { PLANNER_COPY } from './ena-planner-copy.js';
import { assertPlannerPresetReady } from './ena-planner-api-config.js';
import {
    throwIfSignalAborted,
} from '../../shared/common/abort-utils.js';
import jsyaml from '../../libs/js-yaml.mjs';
import { observeAsyncCallback } from '../../shared/common/async-errors.js';

const handleIframeMessageEvent = observeAsyncCallback(handleIframeMessage, { source: import.meta.url, operation: "handleIframeMessage" });


const EXT_NAME = 'ena-planner';
const OVERLAY_ID = 'xiaobaix-ena-planner-overlay';
const HTML_PATH = `${extensionFolderPath}/modules/ena-planner/ena-planner.html`;
const PLANNER_REQUEST_TIMEOUT_MS = 180000;

/**
 * -------------------------
 * Default settings
 * --------------------------
 */
function getDefaultSettings() {
    return {
        enabled: true,
        mergeConsecutiveSystemMessages: false,

        // Planner response tags to keep, in source order (empty = keep full response)
        responseKeepTags: ['plot', 'note', 'plot-log', 'state'],

        // Planner prompts (designer)
        promptBlocks: structuredClone(DEFAULT_PROMPT_BLOCKS),
        // Saved prompt templates: { name: promptBlocks[] }
        promptTemplates: structuredClone(BUILTIN_TEMPLATES),
        // Currently selected prompt template name in UI
        activePromptTemplate: '',

        // Logs
        logsPersist: true,
        logsMax: 20
    };
}

/**
 * -------------------------
 * Local state
 * --------------------------
 */
const state = {
    logs: []
};

let config = null;
let configLoaded = false;
let overlay = null;
let iframeMessageBound = false;
let logsClearBuffer = null;
let lifecycleEpoch = 0;
let configSaveQueue = Promise.resolve();
const STALE_LIFECYCLE = Symbol('stale-lifecycle');

/**
 * -------------------------
 * Helpers
 * --------------------------
 */
function normalizeSettings(value) {
    const d = getDefaultSettings();
    const s = value || structuredClone(d);

    function deepMerge(target, src) {
        for (const k of Object.keys(src)) {
            if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k])) {
                target[k] = target[k] ?? {};
                deepMerge(target[k], src[k]);
            } else if (target[k] === undefined) {
                target[k] = src[k];
            }
        }
    }
    deepMerge(s, d);
    if (!Array.isArray(s.responseKeepTags)) s.responseKeepTags = structuredClone(d.responseKeepTags);
    else s.responseKeepTags = normalizeResponseKeepTags(s.responseKeepTags);
    if (!s.promptTemplates || typeof s.promptTemplates !== 'object' || Array.isArray(s.promptTemplates)) {
        s.promptTemplates = {};
    }
    for (const [name, blocks] of Object.entries(BUILTIN_TEMPLATES)) {
        if (s.promptTemplates[name] === undefined) {
            s.promptTemplates[name] = structuredClone(blocks);
        }
    }

    // Migration: remove old keys that are no longer needed
    delete s.includeCharacterLorebooks;
    delete s.includeCharDesc;
    delete s.includeCharPersonality;
    delete s.includeCharScenario;
    delete s.includeVectorRecall;
    delete s.historyMessageCount;
    delete s.worldbookActivationMode;
    delete s.skipIfPlotPresent;

    delete s.api;
    return s;
}

const isCurrentLifecycle = (epoch) => epoch === lifecycleEpoch;
const assertCurrentLifecycle = (epoch) => {
    if (!isCurrentLifecycle(epoch)) throw STALE_LIFECYCLE;
};
const createLifecycleAbortError = () => {
    const error = new Error('Ena Planner lifecycle changed');
    error.name = 'AbortError';
    return error;
};

function ensureSettings() {
    config = normalizeSettings(config);
    return config;
}

function normalizeResponseKeepTags(tags) {
    const src = Array.isArray(tags) ? tags : [];
    const cleaned = [];
    for (const raw of src) {
        const t = String(raw || '')
            .trim()
            .replace(/^<+|>+$/g, '')
            .toLowerCase();
        if (!/^[a-z][a-z0-9_-]*$/.test(t)) continue;
        if (!cleaned.includes(t)) cleaned.push(t);
    }
    return cleaned;
}

async function loadConfig(epoch = lifecycleEpoch) {
    try {
        const data = await EnaPlannerStorage.load({ strict: true });
        if (!isCurrentLifecycle(epoch)) return false;
        const loaded = data.config;
        const loadedConfig = (loaded && typeof loaded === 'object' && !Array.isArray(loaded))
            ? structuredClone(loaded)
            : getDefaultSettings();
        config = normalizeSettings(migratePlannerPromptConfig(loadedConfig));
        state.logs = Array.isArray(data.logs) ? structuredClone(data.logs) : [];

        if (extension_settings?.[EXT_NAME]) {
            delete extension_settings[EXT_NAME];
            saveSettingsDebounced?.();
        }
        configLoaded = true;
        return config;
    } catch (error) {
        if (!isCurrentLifecycle(epoch)) return false;
        config = null;
        configLoaded = false;
        state.logs = [];
        console.error('[EnaPlanner] 配置加载失败:', error);
        toastErr('无法读取剧情规划配置，已禁止保存，请稍后重试');
        throw error;
    }
}

async function saveConfigNow(updateConfig) {
    const operationEpoch = lifecycleEpoch;
    const operation = async () => {
        try {
            assertCurrentLifecycle(operationEpoch);
            if (!configLoaded || !config) throw new Error('配置尚未成功加载');
            await (await getTextApiRepository()).load();
            let nextConfig = structuredClone(config);
            const updated = typeof updateConfig === 'function' ? updateConfig(nextConfig) : updateConfig;
            if (updated !== undefined) nextConfig = updated;
            const normalizedConfig = normalizeSettings(migratePlannerPromptConfig(structuredClone(nextConfig)));
            await EnaPlannerStorage.updateAndSave(draft => {
                assertCurrentLifecycle(operationEpoch);
                draft.config = normalizedConfig;
            }, { silent: false });
            assertCurrentLifecycle(operationEpoch);
            config = normalizedConfig;
            return true;
        } catch (error) {
            if (error === STALE_LIFECYCLE || !isCurrentLifecycle(operationEpoch)) return false;
            console.error('[EnaPlanner] 配置保存失败:', error);
            return false;
        }
    };
    const pending = configSaveQueue.then(operation, operation);
    configSaveQueue = pending.then(() => {});
    return await pending;
}

async function saveLogsNow(nextLogs) {
    const operationEpoch = lifecycleEpoch;
    try {
        assertCurrentLifecycle(operationEpoch);
        if (!configLoaded || !config) throw new Error('配置尚未成功加载');
        const normalizedLogs = Array.isArray(nextLogs) ? structuredClone(nextLogs) : [];
        await EnaPlannerStorage.updateAndSave(draft => {
            assertCurrentLifecycle(operationEpoch);
            draft.logs = normalizedLogs;
        }, { silent: false });
        assertCurrentLifecycle(operationEpoch);
        return true;
    } catch (error) {
        if (error === STALE_LIFECYCLE || !isCurrentLifecycle(operationEpoch)) return false;
        console.error('[EnaPlanner] 日志保存失败:', error);
        return false;
    }
}

function toastErr(msg) {
    if (window.toastr?.error) return window.toastr.error(msg);
    console.error('[EnaPlanner]', msg);
}

function clampLogs() {
    const s = ensureSettings();
    if (state.logs.length > s.logsMax) state.logs = state.logs.slice(0, s.logsMax);
}

function appendLog(log) {
    if (logsClearBuffer !== null) {
        logsClearBuffer.unshift(log);
        const maxLogs = ensureSettings().logsMax;
        if (logsClearBuffer.length > maxLogs) logsClearBuffer.length = maxLogs;
        return;
    }

    state.logs.unshift(log);
    clampLogs();
    persistLogsMaybe();
}

function persistLogsMaybe() {
    if (!configLoaded) return;
    const s = ensureSettings();
    if (!s.logsPersist) return;
    state.logs = state.logs.slice(0, s.logsMax);
    EnaPlannerStorage.set('logs', structuredClone(state.logs)).catch((caughtError) => { console.warn({ source: import.meta.url, operation: "persistLogsMaybe" }, caughtError); });
}

function loadPersistedLogsMaybe() {
    const s = ensureSettings();
    if (!s.logsPersist) state.logs = [];
}

function nowISO() {
    return new Date().toISOString();
}

function safeStringify(val) {
    if (val == null) return '';
    if (typeof val === 'string') return val;
    try { return JSON.stringify(val, null, 2); } catch { return String(val); }
}

/**
 * -------------------------
 * ST context helpers
 * --------------------------
 */
function getContextSafe() {
    try { return window.SillyTavern?.getContext?.() ?? null; } catch { return null; }
}

function getCurrentCharSafe() {
    try {
        // Method 1: via getContext()
        const ctx = getContextSafe();
        if (ctx) {
            const cid = ctx.characterId ?? ctx.this_chid;
            const chars = ctx.characters;
            if (chars && cid != null && chars[cid]) return chars[cid];
        }
        // Method 2: global this_chid + characters
        const st = window.SillyTavern;
        if (st) {
            const chid = st.this_chid ?? window.this_chid;
            const chars = st.characters ?? window.characters;
            if (chars && chid != null && chars[chid]) return chars[chid];
        }
        // Method 3: bare globals (some ST versions)
        if (window.this_chid != null && window.characters) {
            return window.characters[window.this_chid] ?? null;
        }
    } catch (caughtError) { console.warn({ source: import.meta.url, operation: "getCurrentCharSafe" }, caughtError); }
    return null;
}

/**
 * -------------------------
 * Character card — always include desc/personality/scenario
 * --------------------------
 */
function formatCharCardBlock(charObj) {
    if (!charObj) return '';
    const name = charObj?.name ?? '';
    const description = charObj?.description ?? '';
    const personality = charObj?.personality ?? '';
    const scenario = charObj?.scenario ?? '';

    const parts = [];
    parts.push(`【角色卡】${name}`.trim());
    if (description) parts.push(`【description】\n${description}`);
    if (personality) parts.push(`【personality】\n${personality}`);
    if (scenario) parts.push(`【scenario】\n${scenario}`);
    return parts.join('\n\n');
}

function substituteMacrosViaST(text) {
    try { return substituteParamsExtended(text); } catch { return text; }
}

function deepGet(obj, path) {
    if (!obj || !path) return undefined;
    const parts = path.split('.').filter(Boolean);
    let cur = obj;
    for (const p of parts) {
        if (cur == null) return undefined;
        cur = cur[p];
    }
    return cur;
}

function resolveGetMessageVariableMacros(text, messageVars) {
    return text.replace(/{{\s*get_message_variable::([^}]+)\s*}}/g, (_, rawPath) => {
        const path = String(rawPath || '').trim();
        if (!path) return '';
        return safeStringify(deepGet(messageVars, path));
    });
}

function resolveFormatMessageVariableMacros(text, messageVars) {
    return text.replace(/{{\s*format_message_variable::([^}]+)\s*}}/g, (_, rawPath) => {
        const path = String(rawPath || '').trim();
        if (!path) return '';
        const val = deepGet(messageVars, path);
        if (val == null) return '';
        if (typeof val === 'string') return val;
        try { return jsyaml.dump(val, { lineWidth: -1, noRefs: true }); } catch { return safeStringify(val); }
    });
}

function getLatestMessageVarTable() {
    try {
        if (window.Mvu?.getMvuData) {
            return window.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
        }
    } catch (caughtError) { console.warn({ source: import.meta.url, operation: "getLatestMessageVarTable" }, caughtError); }
    try {
        const getVars = window.TavernHelper?.getVariables || window.Mvu?.getMvuData;
        if (typeof getVars === 'function') {
            return getVars({ type: 'message', message_id: 'latest' });
        }
    } catch (caughtError) { console.warn({ source: import.meta.url, operation: "getLatestMessageVarTable" }, caughtError); }
    return {};
}

async function renderTemplateAll(text, signal, messageVars) {
    let out = String(text ?? '');
    throwIfSignalAborted(signal);
    out = await renderPlannerEjs(out);
    throwIfSignalAborted(signal);
    out = substituteMacrosViaST(out);
    out = resolveGetMessageVariableMacros(out, messageVars);
    out = resolveFormatMessageVariableMacros(out, messageVars);
    return out;
}

/**
 * -------------------------
 * Planner response filtering
 * --------------------------
 */

/**
 * -------------------------
 * Planner API calls
 * --------------------------
 */
async function callPlanner(messages, options, snapshot) {
    return (await generateFeatureText('planner', { ...options,
        messages, timeoutMs: PLANNER_REQUEST_TIMEOUT_MS }, { ...snapshot, stream: true })).text;
}

function debugWorldbookForUi() {
    const context = enaPlannerSend.context();
    return context ? JSON.stringify(context, null, 2) : PLANNER_COPY.noContext;
}

function debugCharForUi() {
    const charObj = getCurrentCharSafe();
    if (!charObj) {
        const ctx = getContextSafe();
        return [
            '⚠️ 未检测到角色。',
            `ctx: ${!!ctx}, ctx.characterId: ${ctx?.characterId}, ctx.this_chid: ${ctx?.this_chid}`,
            `window.this_chid: ${window.this_chid}`,
            `window.characters count: ${window.characters?.length ?? 'N/A'}`
        ].join('\n');
    }
    const block = formatCharCardBlock(charObj);
    return [
        `角色名: ${charObj?.name}`,
        `desc长度: ${(charObj?.description ?? '').length}`,
        `personality长度: ${(charObj?.personality ?? '').length}`,
        `scenario长度: ${(charObj?.scenario ?? '').length}`,
        `world: ${charObj?.world ?? charObj?.data?.extensions?.world ?? '(无)'}`,
        `---\n${block.slice(0, 500)}...`
    ].join('\n');
}

/**
 * -------------------------
 * Build planner messages
 * --------------------------
 */
function getPromptBlocksByRole(role) {
    const s = ensureSettings();
    return (s.promptBlocks || []).filter(b => b?.role === role && String(b?.content ?? '').trim());
}

function mergeConsecutiveSystemMessages(messages) {
    const merged = [];
    for (const message of messages) {
        const role = String(message?.role || '').trim();
        const content = typeof message?.content === 'string' ? message.content : '';
        if (!role) continue;

        if (role === 'system' && merged.length > 0 && merged[merged.length - 1]?.role === 'system') {
            merged[merged.length - 1].content = `${merged[merged.length - 1].content}\n\n${content}`;
            continue;
        }

        merged.push({ ...message, role, content });
    }
    return merged;
}

async function buildPlannerMessages(context, options = {}) {
    const s = ensureSettings();
    const signal = options.signal;
    const messageVars = getLatestMessageVarTable();
    throwIfSignalAborted(signal);
    const messages = [];
    for (const block of getPromptBlocksByRole('system')) {
        messages.push({ role: 'system', content: await renderTemplateAll(block.content, signal, messageVars) });
    }
    // Story Summary's adopted recall is already in the host request. Neither
    // fetch canonical memory nor run retrieval/EJS again on captured materials.
    messages.push(...await buildPlannerTurnMessages(
        formatPlannerContext(context), s.promptBlocks,
        content => renderTemplateAll(content, signal, messageVars),
    ));
    throwIfSignalAborted(signal);
    return s.mergeConsecutiveSystemMessages ? mergeConsecutiveSystemMessages(messages) : messages;
}

/**
 * -------------------------
 * Planning runner + logging
 * --------------------------
 */
async function runPlanningOnce(context, silent = false, options = {}) {
    const operationEpoch = lifecycleEpoch;
    const log = {
        time: nowISO(), ok: false, model: '',
        requestMessages: [], rawReply: '', filteredReply: '', error: ''
    };

    try {
        const snapshot = options.api || await resolveTextApi('planner');
        assertPlannerPresetReady(snapshot);
        log.model = snapshot.model;
        const messages = await buildPlannerMessages(context, { signal: options.signal });
        log.requestMessages = messages;

        const tags = [...ensureSettings().responseKeepTags];
        const rawReply = await callPlanner(messages, { ...options,
            onDelta(_delta, full) {
                options.onPreview?.(filterPlannerResponse(full, tags, { partial: true }));
            },
        }, snapshot);
        log.rawReply = rawReply;

        const filtered = filterPlannerResponse(rawReply, tags);
        log.filteredReply = filtered;
        log.ok = true;

        if (!isCurrentLifecycle(operationEpoch)) throw createLifecycleAbortError();
        if (!options.transient) appendLog(log);
        return { rawReply, filtered };
    } catch (e) {
        if (options.signal?.aborted || e?.name === 'AbortError') throw e;
        if (!isCurrentLifecycle(operationEpoch)) throw createLifecycleAbortError();
        log.error = String(e?.message ?? e);
        if (!options.transient) appendLog(log);
        if (!silent) toastErr(log.error);
        throw e;
    }
}

function getEnaChatIdentity() {
    const context = getContextSafe();
    const chatId = context?.chatId;
    if (chatId === null || chatId === undefined || chatId === '') return '';
    const groupId = context?.groupId;
    const owner = groupId === null || groupId === undefined
        ? `character:${context?.characterId ?? context?.this_chid ?? ''}`
        : `group:${groupId}`;
    return `${owner}:${chatId}`;
}

const enaPlannerSend = createPlannerHost({
    getContext: getContextSafe,
    identity: getEnaChatIdentity,
    enabled: () => ensureSettings().enabled,
    async resolveApi() {
        const api = await resolveTextApi('planner');
        assertPlannerPresetReady(api);
        return api;
    },
    plan: (context, options) => runPlanningOnce(context, true, { ...options, transient: true }),
    onError(error) {
        console.warn('[EnaPlanner] Planning failed:', error);
        toastErr(String(error?.message ?? error));
    },
});


function getIframeConfigPayload() {
    const s = ensureSettings();
    return {
        ...s,
        logs: state.logs,
    };
}

function openSettings() {
    if (document.getElementById(OVERLAY_ID)) return;

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: ${window.innerHeight}px;
        background: rgba(0,0,0,0.5);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    `;

    const iframe = document.createElement('iframe');
    iframe.src = HTML_PATH;
    iframe.style.cssText = `
        width: min(1200px, 96vw);
        height: min(980px, 94vh);
        max-height: calc(100% - 24px);
        border: none;
        border-radius: 12px;
        background: #1a1a1a;
    `;

    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    if (!iframeMessageBound) {
        // eslint-disable-next-line no-restricted-syntax -- Guarded by isTrustedIframeEvent (origin + source).
        window.addEventListener('message', handleIframeMessageEvent);
        iframeMessageBound = true;
    }
}

function closeSettings() {
    const overlayEl = document.getElementById(OVERLAY_ID);
    if (overlayEl) overlayEl.remove();
    overlay = null;
}

async function handleIframeMessage(ev) {
    const iframe = overlay?.querySelector('iframe');
    if (!isTrustedIframeEvent(ev, iframe)) return;
    if (ev.data?.type === 'TEXT_API_REQUEST') {
        await handleTextApiRequest(ev.data, 'planner', message => postToIframe(iframe, message));
        return;
    }
    if (!ev.data?.type?.startsWith('xb-ena:')) return;

    const messageEpoch = lifecycleEpoch;
    const { type, payload } = ev.data;
    switch (type) {
        case 'xb-ena:ready':
            postToIframe(iframe, { type: 'xb-ena:config', payload: getIframeConfigPayload() });
            break;
        case 'xb-ena:close':
            closeSettings();
            break;
        case 'xb-ena:save-config': {
            const requestId = payload?.requestId || '';
            const patch = (payload && typeof payload.patch === 'object') ? payload.patch : payload;
            const configPatch = structuredClone(patch || {});
            const ok = await saveConfigNow(nextConfig => Object.assign(nextConfig, configPatch));
            if (!isCurrentLifecycle(messageEpoch)) return;
            if (ok) {
                if (!config.enabled) enaPlannerSend.cancel();
                postToIframe(iframe, {
                    type: 'xb-ena:config-saved',
                    payload: {
                        ...getIframeConfigPayload(),
                        requestId
                    }
                });
            } else {
                postToIframe(iframe, {
                    type: 'xb-ena:config-save-error',
                    payload: {
                        message: '保存失败',
                        requestId,
                        config: getIframeConfigPayload(),
                    }
                });
            }
            break;
        }
        case 'xb-ena:reset-prompt-default': {
            const requestId = payload?.requestId || '';
            const defaultPromptBlocks = structuredClone(getDefaultSettings().promptBlocks);
            const ok = await saveConfigNow(nextConfig => {
                nextConfig.promptBlocks = defaultPromptBlocks;
            });
            if (!isCurrentLifecycle(messageEpoch)) return;
            if (ok) {
                postToIframe(iframe, {
                    type: 'xb-ena:config-saved',
                    payload: {
                        ...getIframeConfigPayload(),
                        requestId
                    }
                });
            } else {
                postToIframe(iframe, {
                    type: 'xb-ena:config-save-error',
                    payload: {
                        message: '重置失败',
                        requestId,
                        config: getIframeConfigPayload(),
                    }
                });
            }
            break;
        }
        case 'xb-ena:run-test': {
            try {
                const api = await resolveTextApi('planner');
                assertPlannerPresetReady(api);
                await callPlanner([{ role: 'user', content: PLANNER_COPY.test }], {}, api);
                if (!isCurrentLifecycle(messageEpoch)) return;
                postToIframe(iframe, { type: 'xb-ena:test-done' });
                postToIframe(iframe, { type: 'xb-ena:logs', payload: { logs: state.logs } });
            } catch (err) {
                if (!isCurrentLifecycle(messageEpoch)) return;
                postToIframe(iframe, { type: 'xb-ena:test-error', payload: { message: String(err?.message ?? err) } });
            }
            break;
        }
        case 'xb-ena:logs-request':
            postToIframe(iframe, { type: 'xb-ena:logs', payload: { logs: state.logs } });
            break;
        case 'xb-ena:logs-clear': {
            if (logsClearBuffer !== null) {
                postToIframe(iframe, {
                    type: 'xb-ena:logs-clear-error',
                    payload: { message: '日志正在清空，请稍候', logs: state.logs },
                });
                break;
            }

            const previousLogs = structuredClone(state.logs);
            const bufferedLogs = [];
            logsClearBuffer = bufferedLogs;
            const ok = await saveLogsNow([]);
            if (!isCurrentLifecycle(messageEpoch)) return;
            if (logsClearBuffer === bufferedLogs) logsClearBuffer = null;
            if (ok) {
                state.logs = bufferedLogs;
                clampLogs();
                if (state.logs.length > 0) persistLogsMaybe();
                postToIframe(iframe, { type: 'xb-ena:logs', payload: { logs: state.logs } });
            } else {
                state.logs = [...bufferedLogs, ...previousLogs];
                clampLogs();
                if (bufferedLogs.length > 0) persistLogsMaybe();
                postToIframe(iframe, {
                    type: 'xb-ena:logs-clear-error',
                    payload: { message: '日志清空保存失败', logs: state.logs },
                });
            }
            break;
        }

        case 'xb-ena:debug-worldbook': {
            try {
                const output = await debugWorldbookForUi();
                if (!isCurrentLifecycle(messageEpoch)) return;
                postToIframe(iframe, { type: 'xb-ena:debug-output', payload: { output } });
            } catch (err) {
                if (!isCurrentLifecycle(messageEpoch)) return;
                postToIframe(iframe, { type: 'xb-ena:debug-output', payload: { output: String(err?.message ?? err) } });
            }
            break;
        }
        case 'xb-ena:debug-char': {
            const output = debugCharForUi();
            postToIframe(iframe, { type: 'xb-ena:debug-output', payload: { output } });
            break;
        }
    }
}

export async function initEnaPlanner() {
    const initEpoch = lifecycleEpoch;
    try {
        await configSaveQueue;
        await EnaPlannerStorage.waitForQueuedWrites();
        if (!isCurrentLifecycle(initEpoch)) return false;
        const loaded = await loadConfig(initEpoch);
        if (!loaded || !isCurrentLifecycle(initEpoch)) return false;
    } catch {
        return false;
    }
    loadPersistedLogsMaybe();
    enaPlannerSend.install();

    window.xiaobaixEnaPlanner = { openSettings, closeSettings };
    return true;
}

export function cleanupEnaPlanner() {
    lifecycleEpoch++;
    configLoaded = false;
    config = null;
    state.logs = [];
    logsClearBuffer = null;
    enaPlannerSend.cleanup();
    closeSettings();
    if (iframeMessageBound) {
        window.removeEventListener('message', handleIframeMessageEvent);
        iframeMessageBound = false;
    }
    delete window.xiaobaixEnaPlanner;
}
