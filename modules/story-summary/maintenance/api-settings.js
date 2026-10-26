import { normalizeAgentConfig } from '../../agent-core/config.js';
import { createAgentSettingsPanel } from '../../agent-core/ui/settings-panel.js';
import { buildAgentSettingsPanelMarkup, syncAgentSettingsPanelFeedback } from '../../agent-core/ui/settings-markup.js';
import { createIdentifier } from '../../../shared/common/identifier.js';
import { WORKSPACE_COPY } from '../workspace-copy.js';
import { createSaveFeedback } from '../../agent-core/ui/save-feedback.js';

export function createSummaryAgentSettings(root, send, setHtml) {
    const pending = new Map();
    const state = { config: normalizeAgentConfig({}), configDraft: null, configDirty: false,
        configFormSyncPending: true, configPage: 'main', configSave: { status: 'idle' },
        pullStateByProvider: {}, modelOptionsByProvider: {}, inlineToastText: '' };
    let mounted = false;
    let loading = false;
    const saveFeedback = createSaveFeedback(value => { state.configSave = value; render(); });
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    const retry = document.createElement('button');
    retry.type = 'button'; retry.textContent = WORKSPACE_COPY.retry; retry.hidden = true;
    const form = document.createElement('div');
    root.append(status, retry, form);
    function request(action, payload) {
        const requestId = createIdentifier();
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(WORKSPACE_COPY.timeout)); }, 120000);
            pending.set(requestId, { resolve, reject, timer });
            send('SUMMARY_AGENT_SETTINGS', { requestId, action, payload });
        });
    }
    function render() {
        if (!mounted) {
            setHtml(form, buildAgentSettingsPanelMarkup({ showAssistantPermissions: false, showDelegateSettings: false,
                showWebSettings: false, showInlineToast: true, configSave: state.configSave }));
            panel.bindSettingsPanelEvents(form);
            mounted = true;
        }
        if (state.configFormSyncPending) { panel.syncConfigToForm(form); state.configFormSyncPending = false; }
        syncAgentSettingsPanelFeedback(form, { configSave: state.configSave, inlineToastText: state.inlineToastText,
            isBusy: state.configSave.status === 'saving', canDeletePreset: Object.keys(state.config.presets).length > 1 });
    }
    const panel = createAgentSettingsPanel({ state, render,
        showToast: message => { state.inlineToastText = message; render(); },
        pullModels: payload => request('models', payload),
        saveConfig: async ({ requestId, payload }) => {
            saveFeedback.set({ status: 'saving', requestId });
            try {
                const result = await request('save', payload);
                if (!result.ok) throw new Error(result.error);
                if (!panel.completePresetSave(requestId, result)) {
                    state.config = normalizeAgentConfig(result.config); state.configDraft = null;
                    state.configDirty = false; state.configFormSyncPending = true;
                }
                saveFeedback.set({ status: 'success', requestId });
                return result;
            } catch (error) {
                panel.completePresetSave(requestId, { ok: false });
                saveFeedback.set({ status: 'error', requestId, error: error.message });
                return { ok: false };
            }
        },
    });
    form.addEventListener('input', () => saveFeedback.resetSuccess());
    form.addEventListener('change', () => saveFeedback.resetSuccess());
    async function open() {
        if (mounted || loading) return;
        loading = true;
        status.textContent = WORKSPACE_COPY.loading; retry.hidden = true;
        try { state.config = normalizeAgentConfig(await request('load')); render(); status.textContent = ''; }
        catch (error) { status.textContent = error.message; retry.hidden = false; }
        finally { loading = false; }
    }
    retry.onclick = open;
    return { open, receive(data) {
        if (data.type !== 'SUMMARY_AGENT_SETTINGS_RESULT') return;
        const item = pending.get(data.requestId); if (!item) return;
        clearTimeout(item.timer); pending.delete(data.requestId);
        if (data.error) item.reject(new Error(data.error)); else item.resolve(data.result);
    } };
}
