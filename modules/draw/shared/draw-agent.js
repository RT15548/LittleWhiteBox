import { SUBMIT_SCENE_PLAN_TOOL_NAME, ScenePlannerError } from './scene-plan-contract.js';
import { normalizeAgentConfig } from '../../agent-core/config.js';
import { redactRequestSecrets } from '../../agent-core/adapters/request-inspection.js';
import {
    getProviderLabel,
    getToolModeLabel,
    isSillyTavernProvider,
    resolveActiveProviderConfig,
} from '../../agent-core/provider-resolution.js';

const AGENT_SETTINGS_FILE_KEY = 'settings';
const DEFAULT_SCENE_PLANNER_TIMEOUT_MS = 120000;

let agentCoreModulePromise = null;
let agentSettingsReaderPromise = null;
let requestHeadersProviderPromise = null;
let lastDrawAgentDiagnostic = null;
let diagnosticSequence = 0;
let activeDiagnosticId = 0;

function cloneJson(value) {
    if (value === undefined) return undefined;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return undefined;
    }
}

function normalizeTimeout(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0
        ? Math.floor(number)
        : DEFAULT_SCENE_PLANNER_TIMEOUT_MS;
}

function buildInspectionDiagnosticPatch(inspection) {
    const notices = Array.isArray(inspection?.notices)
        ? inspection.notices.map((notice) => String(notice || '').trim()).filter(Boolean)
        : [];
    const effectiveConfig = inspection?.effectiveConfig;
    const patch = {
        request: cloneJson(inspection),
        notices,
    };
    if (typeof effectiveConfig?.reasoningEnabled === 'boolean') {
        patch.reasoningEnabled = effectiveConfig.reasoningEnabled;
        patch.reasoningEffort = effectiveConfig.reasoningEnabled
            ? String(effectiveConfig.reasoningEffort || '')
            : '';
    }
    if (effectiveConfig?.toolChoice !== undefined) {
        patch.toolChoice = String(effectiveConfig.toolChoice || '');
    }
    return patch;
}

function diagnosticMatchesProviderConfig(diagnostic, providerConfig) {
    if (!diagnostic || !providerConfig) return false;
    return String(diagnostic.presetName || '') === String(providerConfig.currentPresetName || '')
        && String(diagnostic.provider || '') === String(providerConfig.provider || '')
        && String(diagnostic.model || '') === String(providerConfig.model || '');
}

async function loadDefaultAgentSettingsReader() {
    agentSettingsReaderPromise ||= import('../../../core/server-storage.js')
        .then((storageModule) => () => storageModule.AssistantStorage.get(AGENT_SETTINGS_FILE_KEY, null))
        .catch((error) => {
            agentSettingsReaderPromise = null;
            throw error;
        });
    return agentSettingsReaderPromise;
}

async function loadDefaultRequestHeadersProvider() {
    requestHeadersProviderPromise ||= import('../../../../../../../script.js')
        .then((hostModule) => () => hostModule.getRequestHeaders())
        .catch((error) => {
            requestHeadersProviderPromise = null;
            throw error;
        });
    return requestHeadersProviderPromise;
}

export async function loadAgentCoreBrowser() {
    agentCoreModulePromise ||= import('../../agent-core/dist/agent-core-browser.js');
    try {
        return await agentCoreModulePromise;
    } catch (error) {
        agentCoreModulePromise = null;
        throw new ScenePlannerError(
            `AgentCore 浏览器组件加载失败：${error?.message || '未知错误'}`,
            'AGENT_CORE_LOAD_FAILED',
            null,
            { cause: error },
        );
    }
}

async function readAgentSettings(overrides = {}) {
    try {
        const reader = typeof overrides.getAgentSettings === 'function'
            ? overrides.getAgentSettings
            : await loadDefaultAgentSettingsReader();
        return await reader();
    } catch (error) {
        throw new ScenePlannerError(
            `共享 Agent 设置读取失败：${error?.message || '未知错误'}`,
            'AGENT_SETTINGS_LOAD_FAILED',
            null,
            { cause: error },
        );
    }
}

function assertCurrentPreset(rawSettings, normalizedSettings) {
    if (!rawSettings || typeof rawSettings !== 'object' || Array.isArray(rawSettings)) return;
    const requestedName = String(rawSettings.currentPresetName || '').trim();
    const rawPresets = rawSettings.presets;
    const hasRequestedPreset = rawPresets
        && typeof rawPresets === 'object'
        && !Array.isArray(rawPresets)
        && Object.prototype.hasOwnProperty.call(rawPresets, requestedName);
    if (requestedName && !hasRequestedPreset) {
        throw new ScenePlannerError(
            `共享 Agent 当前主预设「${requestedName}」不存在。`,
            'AGENT_PRESET_INVALID',
        );
    }
    const normalizedName = String(normalizedSettings?.currentPresetName || '').trim();
    if (!normalizedName || !normalizedSettings?.presets?.[normalizedName]) {
        throw new ScenePlannerError('共享 Agent 当前主预设无法解析。', 'AGENT_PRESET_INVALID');
    }
}

export async function resolveDrawAgentContext(options = {}) {
    const dependencies = options.dependencies || {};
    const rawSettings = await readAgentSettings(dependencies);
    const { settings, providerConfig } = resolveDrawProviderConfig(rawSettings, options.timeout);

    const loadAgentCore = options.loadAgentCore || loadAgentCoreBrowser;
    let agentCore;
    try {
        agentCore = await loadAgentCore();
    } catch (error) {
        if (error instanceof ScenePlannerError) throw error;
        throw new ScenePlannerError(
            `AgentCore 浏览器组件加载失败：${error?.message || '未知错误'}`,
            'AGENT_CORE_LOAD_FAILED',
            null,
            { cause: error },
        );
    }

    if (isSillyTavernProvider(providerConfig.provider)) {
        try {
            const requestHeadersProvider = typeof dependencies.requestHeadersProvider === 'function'
                ? dependencies.requestHeadersProvider
                : await loadDefaultRequestHeadersProvider();
            agentCore.setHostChatCompletionsRequestHeadersProvider(requestHeadersProvider);
        } catch (error) {
            if (error instanceof ScenePlannerError) throw error;
            throw new ScenePlannerError(
                `酒馆请求头组件加载失败：${error?.message || '未知错误'}`,
                'HOST_REQUEST_HEADERS_LOAD_FAILED',
                null,
                { cause: error },
            );
        }
    }
    return { agentCore, settings, providerConfig };
}

function resolveDrawProviderConfig(rawSettings, timeout) {
    let settings;
    let providerConfig;
    try {
        settings = normalizeAgentConfig(rawSettings || {});
        assertCurrentPreset(rawSettings, settings);
        providerConfig = resolveActiveProviderConfig(settings, {
            timeoutMs: normalizeTimeout(timeout),
        });
    } catch (error) {
        if (error instanceof ScenePlannerError) throw error;
        throw new ScenePlannerError(
            `共享 Agent 当前主预设无法解析：${error?.message || '未知错误'}`,
            'AGENT_PRESET_INVALID',
            null,
            { cause: error },
        );
    }

    if (!String(providerConfig.model || '').trim()) {
        throw new ScenePlannerError(
            `共享主预设「${providerConfig.currentPresetName || settings.currentPresetName}」尚未选择模型。`,
            'MODEL_MISSING',
        );
    }
    if (!isSillyTavernProvider(providerConfig.provider)
        && !String(providerConfig.apiKey || '').trim()) {
        throw new ScenePlannerError(
            `共享主预设「${providerConfig.currentPresetName || settings.currentPresetName}」缺少 API Key。`,
            'API_KEY_MISSING',
        );
    }

    return { settings, providerConfig };
}

function createAbortScope(timeout, upstreamSignal) {
    const controller = new AbortController();
    let timedOut = false;
    const abortFromUpstream = () => controller.abort();
    if (upstreamSignal?.aborted) abortFromUpstream();
    upstreamSignal?.addEventListener?.('abort', abortFromUpstream, { once: true });
    const timer = setTimeout(() => {
        if (controller.signal.aborted) return;
        timedOut = true;
        controller.abort();
    }, normalizeTimeout(timeout));
    return {
        signal: controller.signal,
        isTimedOut: () => timedOut,
        cleanup() {
            clearTimeout(timer);
            upstreamSignal?.removeEventListener?.('abort', abortFromUpstream);
        },
    };
}

/**
 * A request-scoped diagnostic handle is created at the Scene Planner entry, before any prompt
 * or configuration work, so prompt-expansion, preset, credential and bundle failures are all
 * observable. The request id keeps a slow older request from overwriting a newer one.
 */
export function beginDrawScenePlannerDiagnostic(initial = {}) {
    diagnosticSequence += 1;
    const id = diagnosticSequence;
    activeDiagnosticId = id;
    const record = {
        id,
        timestamp: Date.now(),
        durationMs: 0,
        stage: 'prompt',
        status: 'running',
        presetName: '',
        provider: '',
        model: '',
        toolMode: '',
        reasoningEnabled: false,
        reasoningEffort: '',
        toolChoice: 'required',
        toolsCount: 1,
        notices: [],
        ...initial,
    };

    const publish = () => {
        if (id !== activeDiagnosticId) return;
        lastDrawAgentDiagnostic = redactRequestSecrets({
            ...record,
            durationMs: Math.max(0, Date.now() - record.timestamp),
        });
    };
    publish();

    return {
        id,
        update(patch = {}) {
            Object.assign(record, patch);
            publish();
        },
        applyProviderConfig(providerConfig = {}) {
            Object.assign(record, {
                presetName: String(providerConfig.currentPresetName || ''),
                provider: String(providerConfig.provider || ''),
                model: String(providerConfig.model || ''),
                toolMode: String(providerConfig.toolMode || 'native'),
                reasoningEnabled: providerConfig.reasoningEnabled === true,
                reasoningEffort: providerConfig.reasoningEnabled === true
                    ? String(providerConfig.reasoningEffort || '')
                    : '',
                notices: [],
            });
            publish();
        },
        succeed(patch = {}) {
            Object.assign(record, { status: 'success' }, patch);
            publish();
        },
        fail(error, patch = {}) {
            Object.assign(record, {
                status: 'error',
                errorCode: String(error?.code || 'SCENE_PLANNER_ERROR'),
                errorMessage: String(error?.message || '场景规划失败'),
            }, patch);
            publish();
        },
        snapshot() {
            return cloneJson(record);
        },
    };
}

/**
 * Classification order is fixed: an already typed domain error wins, then user cancellation,
 * then the Draw timeout flag, then an explicit provider timeout, then a generic provider error.
 */
function mapProviderError(error, abortScope, upstreamSignal) {
    if (error instanceof ScenePlannerError) return error;
    if (upstreamSignal?.aborted) {
        return new ScenePlannerError('场景规划已取消。', 'REQUEST_ABORTED', null, { cause: error });
    }
    if (abortScope.isTimedOut()) {
        return new ScenePlannerError('场景规划请求超时。', 'REQUEST_TIMEOUT', null, { cause: error });
    }
    if (error?.name === 'AbortError' || error?.code === 'ABORT_ERR') {
        return new ScenePlannerError('场景规划已取消。', 'REQUEST_ABORTED', null, { cause: error });
    }
    const timeoutText = `${error?.name || ''} ${error?.code || ''} ${error?.message || ''}`;
    if (/(?:time[ -]?out|timedout|etimedout)/i.test(timeoutText)) {
        return new ScenePlannerError('场景规划请求超时。', 'REQUEST_TIMEOUT', null, { cause: error });
    }
    return new ScenePlannerError(
        `Provider 请求失败：${error?.message || '未知错误'}`,
        'PROVIDER_REQUEST_FAILED',
        null,
        { cause: error },
    );
}

export async function callDrawScenePlannerAgent(options = {}) {
    const task = options.task || {};
    const diagnostic = options.diagnostic || beginDrawScenePlannerDiagnostic();
    if (!Array.isArray(task.tools)
        || task.tools.length !== 1
        || task.tools[0]?.function?.name !== SUBMIT_SCENE_PLAN_TOOL_NAME) {
        const error = new ScenePlannerError(
            'Scene Planner 必须且只能注册 submit_scene_plan。',
            'TOOL_CONTRACT_INVALID',
        );
        diagnostic.fail(error, { stage: 'config' });
        throw error;
    }

    diagnostic.update({ stage: 'config' });
    let agentCore;
    let providerConfig;
    try {
        ({ agentCore, providerConfig } = await resolveDrawAgentContext(options));
    } catch (error) {
        diagnostic.fail(error, { stage: 'config' });
        throw error;
    }
    diagnostic.applyProviderConfig(providerConfig);

    let adapter;
    try {
        adapter = agentCore.createAgentAdapter(providerConfig, {
            missingApiKeyMessage: '请先在共享 Agent API 配置中填写当前主预设的 API Key。',
        });
    } catch (rawError) {
        const error = new ScenePlannerError(
            rawError?.message || '共享 Agent Adapter 创建失败。',
            'AGENT_PRESET_INVALID',
            null,
            { cause: rawError },
        );
        diagnostic.fail(error, { stage: 'config' });
        throw error;
    }

    const abortScope = createAbortScope(options.timeout, options.signal);
    const agentTask = {
        ...task,
        toolChoice: 'required',
        temperature: providerConfig.temperature,
        maxTokens: providerConfig.maxTokens,
        reasoning: {
            enabled: providerConfig.reasoningEnabled,
            effort: providerConfig.reasoningEffort,
        },
        signal: abortScope.signal,
        allowToolProtocolFallback: false,
    };
    delete agentTask.onStreamProgress;
    delete agentTask.onToolProtocolFallback;

    diagnostic.update({ stage: 'request' });
    try {
        const result = await adapter.chat(agentTask);
        const inspection = cloneJson(result?.requestInspection);
        diagnostic.update({
            stage: 'request',
            ...buildInspectionDiagnosticPatch(inspection),
            toolCallCount: Array.isArray(result?.toolCalls) ? result.toolCalls.length : 0,
            toolNames: (Array.isArray(result?.toolCalls) ? result.toolCalls : [])
                .map((toolCall) => String(toolCall?.name || ''))
                .filter(Boolean),
            finishReason: String(result?.finishReason || ''),
        });
        return { result, providerConfig, diagnostic };
    } catch (rawError) {
        const error = mapProviderError(rawError, abortScope, options.signal);
        const inspection = cloneJson(rawError?.requestInspection);
        diagnostic.fail(error, {
            stage: 'request',
            ...buildInspectionDiagnosticPatch(inspection),
        });
        throw error;
    } finally {
        abortScope.cleanup();
    }
}

export function getLastDrawAgentDiagnostic() {
    return cloneJson(lastDrawAgentDiagnostic);
}

export async function getDrawAgentViewModel(options = {}) {
    const diagnostic = getLastDrawAgentDiagnostic();
    try {
        const rawSettings = await readAgentSettings(options.dependencies || {});
        const { providerConfig } = resolveDrawProviderConfig(rawSettings, options.timeout);
        const currentDiagnostic = diagnosticMatchesProviderConfig(diagnostic, providerConfig)
            ? diagnostic
            : null;
        const runtimeNotices = Array.isArray(currentDiagnostic?.notices)
            ? currentDiagnostic.notices
            : [];
        const reasoningEnabled = currentDiagnostic
            ? currentDiagnostic.reasoningEnabled === true
            : providerConfig.reasoningEnabled === true;
        return {
            ready: true,
            presetName: providerConfig.currentPresetName,
            provider: providerConfig.provider,
            providerLabel: getProviderLabel(providerConfig.provider),
            model: providerConfig.model,
            toolMode: providerConfig.toolMode,
            toolModeLabel: getToolModeLabel(providerConfig),
            reasoningEnabled,
            reasoningEffort: reasoningEnabled
                ? String(currentDiagnostic?.reasoningEffort || providerConfig.reasoningEffort || '')
                : '',
            compatibilityNotice: [
                providerConfig.toolMode === 'tagged-json'
                    ? '当前使用 Tagged JSON 兼容模式；模型仍会通过 submit_scene_plan 提交结构化结果。'
                    : '当前模型必须支持 Tool Calling；若不支持，请在共享 Agent API 配置中切换为 Tagged JSON 兼容模式。',
                ...runtimeNotices,
            ].join('\n'),
            runtimeNotices,
            diagnostic: currentDiagnostic,
            error: null,
        };
    } catch (error) {
        return {
            ready: false,
            presetName: '',
            provider: '',
            providerLabel: '未配置',
            model: '',
            toolMode: '',
            toolModeLabel: '不可用',
            reasoningEnabled: false,
            reasoningEffort: '',
            compatibilityNotice: '请先完成共享 Agent 主预设配置。',
            runtimeNotices: [],
            diagnostic: null,
            error: {
                code: String(error?.code || 'AGENT_PRESET_INVALID'),
                message: String(error?.message || '共享 Agent 配置不可用'),
            },
        };
    }
}

export function openSharedAgentSettings() {
    if (typeof window?.xiaobaixAssistant?.openSettings === 'function') {
        window.xiaobaixAssistant.openSettings();
        return true;
    }
    return false;
}

export function resetDrawAgentRuntimeForTests() {
    agentCoreModulePromise = null;
    agentSettingsReaderPromise = null;
    requestHeadersProviderPromise = null;
    lastDrawAgentDiagnostic = null;
    diagnosticSequence = 0;
    activeDiagnosticId = 0;
}
