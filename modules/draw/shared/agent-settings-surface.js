import { normalizeAgentConfig } from '../../agent-core/config.js';
import { getProviderLabel } from '../../agent-core/provider-resolution.js';
import {
    loadSharedAgentSettings,
    saveSharedAgentSettings,
    subscribeSharedAgentSettingsChanged,
} from '../../agent-core/settings-repository.js';
import { createAgentSettingsPanel } from '../../agent-core/ui/settings-panel.js';
import {
    buildAgentSettingsPanelMarkup,
    syncAgentSettingsPanelFeedback,
} from '../../agent-core/ui/settings-markup.js';

const SAVE_STATE_RESET_MS = 1800;

function describeError(error) {
    return error instanceof Error ? error.message : String(error || 'unknown_error');
}

function escapeHtml(text = '') {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildRuntimeSummary({ draft = {}, providerLabel = '' } = {}) {
    const presetName = String(draft.currentPresetName || '默认');
    const model = String(draft.model || '').trim() || '未选择模型';
    return `预设「${presetName}」 · ${providerLabel || getProviderLabel(draft.provider)} / ${model}`;
}

export function buildDrawAgentSettingsSurfaceMarkup(state = {}) {
    if (state.loading) {
        return '<div class="draw-agent-settings-state"><i class="fa-solid fa-spinner fa-spin"></i><span>正在读取共享 Agent API 配置…</span></div>';
    }
    if (state.loadError) {
        return `<div class="draw-agent-settings-state is-error"><i class="fa-solid fa-triangle-exclamation"></i><span>${escapeHtml(state.loadError)}</span><button type="button" data-draw-agent-settings-retry>重新读取</button></div>`;
    }
    return `
        <div class="draw-agent-settings-conflict" data-draw-agent-settings-conflict hidden>
            <span>共享配置已在其他页面更新。当前未保存编辑仍保留；重新载入后才能继续保存。</span>
            <button type="button" data-draw-agent-settings-reload>重新载入</button>
        </div>
        ${buildAgentSettingsPanelMarkup({
            configSave: state.configSave,
            runtimeText: '',
            inlineToastText: state.inlineToastText,
            showInlineToast: true,
            showAssistantPermissions: false,
            showDelegateSettings: false,
            activePage: 'main',
            isBusy: state.configSave?.status === 'saving',
            canDeletePreset: Object.keys(state.config?.presets || {}).length > 1,
        })}`;
}

export function createDrawAgentSettingsSurface(options = {}) {
    const getRoot = options.getRoot;
    const source = String(options.source || 'draw-agent-settings');
    const saveStateResetMs = Number.isFinite(Number(options.saveStateResetMs))
        ? Math.max(0, Number(options.saveStateResetMs))
        : SAVE_STATE_RESET_MS;
    const loadSettings = options.loadSettings || (() => loadSharedAgentSettings(options));
    const persistSettings = options.saveSettings || ((patch) => saveSharedAgentSettings(patch, {
        ...options,
        source,
    }));
    const state = {
        config: normalizeAgentConfig({}),
        configDraft: null,
        configDirty: false,
        configFormSyncPending: true,
        configPage: 'main',
        configSave: { status: 'idle', requestId: '', error: '' },
        pullStateByProvider: {},
        modelOptionsByProvider: {},
        inlineToastText: '',
        externalChangePending: false,
        loading: true,
        loadError: '',
    };
    let resetTimer = null;
    let destroyed = false;
    let boundRoot = null;
    let boundPanel = null;
    let renderedMode = '';
    let refreshSequence = 0;

    const settingsPanel = createAgentSettingsPanel({
        state,
        render,
        showToast: options.showToast,
        saveConfig: async ({ requestId, payload }) => {
            beginSave(requestId);
            state.configDirty = true;
            if (state.externalChangePending) {
                completeSave(requestId, {
                    ok: false,
                    error: '共享配置已变化，请先重新载入。',
                });
                return { ok: false };
            }

            let result;
            try {
                result = await persistSettings(payload);
            } catch (error) {
                completeSave(requestId, { ok: false, error: describeError(error) });
                return { ok: false };
            }
            if (!result?.ok) {
                if (result?.conflict) state.externalChangePending = true;
                completeSave(requestId, {
                    ok: false,
                    error: String(result?.error || '共享 Agent API 配置保存失败'),
                });
                return { ok: false };
            }

            state.config = normalizeAgentConfig(result.config || payload || {});
            state.configDraft = null;
            state.configDirty = false;
            state.externalChangePending = false;
            state.configFormSyncPending = true;
            completeSave(requestId, { ok: true });
            options.onSaved?.(state.config);
            return { ok: true, config: state.config };
        },
        getRuntimeSummaryText: buildRuntimeSummary,
    });

    const unsubscribeSettingsChanged = subscribeSharedAgentSettingsChanged((detail) => {
        if (destroyed || String(detail?.source || '') === source) return;
        if (state.configDirty || state.configSave.status === 'saving') {
            state.externalChangePending = true;
            syncTransientUi();
            return;
        }
        void refresh({ background: true }).catch(() => {});
    }, options);

    function clearResetTimer() {
        if (!resetTimer) return;
        clearTimeout(resetTimer);
        resetTimer = null;
    }

    function scheduleSaveStateReset() {
        clearResetTimer();
        resetTimer = setTimeout(() => {
            state.configSave = { status: 'idle', requestId: '', error: '' };
            state.inlineToastText = '';
            syncTransientUi();
        }, saveStateResetMs);
    }

    function beginSave(requestId) {
        clearResetTimer();
        state.configSave = { status: 'saving', requestId, error: '' };
        state.inlineToastText = '正在保存共享 API 配置…';
        syncTransientUi();
    }

    function completeSave(requestId, { ok, error = '' } = {}) {
        if (requestId && state.configSave.requestId && requestId !== state.configSave.requestId) return;
        state.configSave = {
            status: ok ? 'success' : 'error',
            requestId: requestId || state.configSave.requestId || '',
            error: ok ? '' : String(error || '保存失败'),
        };
        state.inlineToastText = ok ? '配置已保存' : state.configSave.error;
        render();
        scheduleSaveStateReset();
    }

    function markConfigDirty(event) {
        if (!event?.target?.closest?.('.xb-assistant-config')) return;
        state.configDirty = true;
        if (state.configSave.status === 'success') {
            clearResetTimer();
            state.configSave = { status: 'idle', requestId: '', error: '' };
            state.inlineToastText = '';
            syncTransientUi();
        }
    }

    function handleRootClick(event) {
        if (event?.target?.closest?.('[data-draw-agent-settings-retry]')) {
            void refresh({ force: true }).catch(() => {});
            return;
        }
        if (event?.target?.closest?.('[data-draw-agent-settings-reload]')) {
            void refresh({ force: true }).catch(() => {});
        }
    }

    function bindRoot(root) {
        if (boundRoot === root) return;
        boundRoot?.removeEventListener?.('click', handleRootClick);
        boundRoot?.removeEventListener?.('input', markConfigDirty, true);
        boundRoot?.removeEventListener?.('change', markConfigDirty, true);
        boundRoot = root;
        boundRoot?.addEventListener?.('click', handleRootClick);
        boundRoot?.addEventListener?.('input', markConfigDirty, true);
        boundRoot?.addEventListener?.('change', markConfigDirty, true);
    }

    function syncTransientUi() {
        const root = typeof getRoot === 'function' ? getRoot() : null;
        if (!root || state.loading || state.loadError) return;
        syncAgentSettingsPanelFeedback(root, {
            configSave: state.configSave,
            inlineToastText: state.inlineToastText,
            isBusy: state.configSave.status === 'saving',
            canDeletePreset: Object.keys(state.config?.presets || {}).length > 1,
        });
        const conflict = root.querySelector?.('[data-draw-agent-settings-conflict]');
        conflict?.toggleAttribute?.('hidden', !state.externalChangePending);
    }

    function render() {
        if (destroyed) return false;
        const root = typeof getRoot === 'function' ? getRoot() : null;
        if (!root) return false;
        bindRoot(root);
        const mode = state.loading ? 'loading' : state.loadError ? 'error' : 'panel';
        if (mode !== renderedMode) {
            // The markup comes exclusively from our first-party AgentCore renderer.
            // eslint-disable-next-line no-unsanitized/property
            root.innerHTML = buildDrawAgentSettingsSurfaceMarkup(state);
            renderedMode = mode;
            boundPanel = null;
        }
        if (mode !== 'panel') return true;

        const panel = root.querySelector?.('.xb-assistant-config');
        if (!panel) return false;
        if (state.configFormSyncPending) {
            settingsPanel.syncConfigToForm(root);
            state.configFormSyncPending = false;
        }
        if (boundPanel !== panel) {
            settingsPanel.bindSettingsPanelEvents(root);
            boundPanel = panel;
        }
        syncTransientUi();
        return true;
    }

    async function refresh(refreshOptions = {}) {
        if (destroyed) return null;
        refreshSequence += 1;
        const sequence = refreshSequence;
        const force = refreshOptions.force === true;
        if (state.configDirty && !force) return state.config;
        const background = refreshOptions.background === true && !state.loading && !state.loadError;
        if (force) {
            state.configDirty = false;
            state.externalChangePending = false;
        }
        if (!background) {
            state.loading = true;
            state.loadError = '';
            renderedMode = '';
            render();
        }
        try {
            const config = normalizeAgentConfig(await loadSettings());
            if (destroyed || sequence !== refreshSequence) return null;
            if (background && state.configDirty) {
                state.externalChangePending = true;
                syncTransientUi();
                return state.config;
            }
            state.config = config;
            state.configDraft = null;
            state.configDirty = false;
            state.externalChangePending = false;
            state.configFormSyncPending = true;
            state.loading = false;
            state.loadError = '';
            render();
            return state.config;
        } catch (error) {
            if (destroyed || sequence !== refreshSequence) return null;
            if (background) {
                state.inlineToastText = `共享 Agent API 配置刷新失败：${describeError(error)}`;
                syncTransientUi();
            } else {
                state.loading = false;
                state.loadError = `共享 Agent API 配置读取失败：${describeError(error)}`;
                renderedMode = '';
                render();
            }
            throw error;
        }
    }

    function destroy() {
        destroyed = true;
        clearResetTimer();
        unsubscribeSettingsChanged();
        boundRoot?.removeEventListener?.('click', handleRootClick);
        boundRoot?.removeEventListener?.('input', markConfigDirty, true);
        boundRoot?.removeEventListener?.('change', markConfigDirty, true);
        boundRoot = null;
        boundPanel = null;
    }

    return {
        destroy,
        getState: () => state,
        refresh,
        render,
    };
}

export function attachDrawAgentSettingsSurface(options = {}) {
    if (options.surface) {
        void options.surface.refresh({ background: true }).catch((error) => {
            console.error(`[${options.logPrefix || 'DrawAgent'}] 共享 Agent API 配置刷新失败:`, error);
        });
        return options.surface;
    }
    if (typeof options.getRoot !== 'function' || !options.getRoot()) return null;
    const surface = createDrawAgentSettingsSurface(options);
    void surface.refresh({ force: true }).catch((error) => {
        console.error(`[${options.logPrefix || 'DrawAgent'}] 共享 Agent API 配置读取失败:`, error);
    });
    return surface;
}
