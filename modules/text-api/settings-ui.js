import './settings-ui.css';
import { createIdentifier } from '../../shared/common/identifier.js';
import { buildPresetActionIcon, syncConfigSaveButton } from '../agent-core/ui/settings-markup.js';
import { createSaveFeedback } from '../agent-core/ui/save-feedback.js';
import { PROVIDER_OPTIONS } from '../agent-core/provider-resolution.js';
import { samplingParametersFor } from '../agent-core/sampling.js';
import { resolveReasoningCapability, getReasoningModeOptions, getReasoningEffortOptions } from '../agent-core/reasoning-capabilities.js';
import { getModelListAuthOptions, normalizeModelListAuth, supportsModelListAuth } from '../agent-core/model-list-auth.js';
import { createPreset, HOST_BINDING, HOST_PROVIDER } from './model.js';
import { TEXT_API_COPY as COPY, deletionMessage } from './copy.js';

export function mountTextApiSettings(root, { feature, namespace }) {
    const doc = root.ownerDocument;
    const win = doc.defaultView;
    const origin = new URL(doc.referrer || win.location.href).origin;
    let settings, draft, selected, busy = false, revision = 0, networkBusy = false;
    const requests = new Map();
    const element = (tag, text, className) => {
        const node = doc.createElement(tag); if (text != null) node.textContent = text;
        if (className) node.className = className; return node;
    };
    root.classList.add('text-api');
    const fields = element('fieldset');
    const status = element('div', '', 'text-api-status'); status.setAttribute('role', 'status');
    const retry = element('button', COPY.retry); retry.type = 'button'; retry.hidden = true;
    root.replaceChildren(fields, status, retry);
    const saveFeedback = createSaveFeedback(syncSaveButton);
    function syncSaveButton(value = saveFeedback.current) {
        const button = fields.querySelector('[data-save]');
        if (button) syncConfigSaveButton(button, value, { className: 'text-api-icon', disabled: !draft });
    }
    fields.addEventListener('input', () => saveFeedback.resetSuccess());
    fields.addEventListener('change', () => saveFeedback.resetSuccess());
    function cancelRequests() {
        for (const [requestId, pending] of requests) {
            if (!['models', 'test'].includes(pending.action)) continue;
            win.parent.postMessage({ source: namespace, type: 'TEXT_API_REQUEST', action: 'cancel', targetRequestId: requestId }, origin);
            requests.delete(requestId); win.clearTimeout(pending.timer);
            pending.reject(new Error(COPY.cancelled));
        }
    }
    function feedback(text, error = false) { status.textContent = text; status.dataset.error = String(error); }
    function request(action, extra = {}) {
        const requestId = createIdentifier();
        return new Promise((resolve, reject) => {
            const timer = win.setTimeout(() => { requests.delete(requestId); reject(new Error(COPY.timeout)); }, 190000);
            requests.set(requestId, { resolve, reject, timer, action });
            win.parent.postMessage({ source: namespace, type: 'TEXT_API_REQUEST', requestId, action, ...extra }, origin);
        });
    }
    function receive(event) {
        if (event.origin !== origin || event.source !== win.parent || event.data?.type !== 'TEXT_API_RESULT') return;
        const pending = requests.get(event.data.requestId); if (!pending) return;
        requests.delete(event.data.requestId); win.clearTimeout(pending.timer);
        if (event.data.error) pending.reject(new Error(event.data.error)); else pending.resolve(event.data.result);
    }
    // eslint-disable-next-line no-restricted-syntax -- Checks parent window and exact origin before reading a response.
    win.addEventListener('message', receive);
    function control(label, input, container = fields) {
        const wrapper = element('label'); wrapper.append(element('span', label), input); container.append(wrapper); return wrapper;
    }
    function input(key, type = 'text', source = draft) {
        const node = element('input'); node.type = type; node.value = source[key] ?? '';
        if (type === 'number') { node.step = 'any'; node.placeholder = COPY.inherit; }
        if (type === 'password') node.autocomplete = 'off';
        node.oninput = () => { source[key] = type === 'number' ? (node.value === '' ? null : Number(node.value)) : node.value; revision++; feedback(''); };
        return node;
    }
    function select(options, value, change) {
        const node = element('select');
        for (const option of options) {
            const item = element('option', option.label); item.value = option.value; item.disabled = !!option.disabled; node.append(item);
        }
        node.value = value ?? '';
        node.onchange = () => { revision++; feedback(''); change(node.value); };
        return node;
    }
    function button(label, run, icon) {
        const node = element('button', icon ? '' : label, icon ? 'text-api-icon' : ''); node.type = 'button';
        if (icon) {
            node.title = label; node.setAttribute('aria-label', label);
            const range = doc.createRange(); range.selectNodeContents(node);
            // eslint-disable-next-line no-unsanitized/method -- First-party static SVG selected by a fixed action name.
            node.append(range.createContextualFragment(buildPresetActionIcon(icon)));
        }
        node.onclick = () => { Promise.resolve().then(run).catch(error => feedback(error.message, true)); };
        return node;
    }
    function choose(id) {
        revision++; cancelRequests(); selected = id;
        draft = id === HOST_BINDING ? createPreset(id, COPY.host) : structuredClone(settings.presets.find(preset => preset.id === id));
        render();
    }
    async function mutate(mutation, selection = null) {
        if (busy) return;
        busy = true; fields.disabled = true;
        saveFeedback.set({ status: 'idle' });
        feedback(COPY.saving);
        try {
            settings = await request('mutate', { mutation });
            choose(selection || settings.bindings[feature]);
            feedback(COPY.saved);
        } finally {
            busy = false; fields.disabled = false;
            fields.querySelector('.text-api-presets').disabled = false;
        }
    }
    async function save() {
        if (busy) return;
        busy = true;
        const stamp = revision;
        fields.querySelector('.text-api-presets').disabled = true;
        saveFeedback.set({ status: 'saving' });
        feedback(COPY.saving);
        try {
            const mutation = selected === HOST_BINDING ? { type: 'select-host' }
                : { type: 'save', id: selected, preset: structuredClone(draft) };
            settings = await request('mutate', { mutation });
            // Keep the live draft and its input bindings, including edits made
            // while the submitted snapshot was being saved.
            feedback(stamp === revision ? COPY.saved : '');
            saveFeedback.set({ status: stamp === revision ? 'success' : 'idle' });
        } catch (error) {
            saveFeedback.set({ status: 'error', error: error.message });
            throw error;
        } finally {
            busy = false;
            fields.querySelector('.text-api-presets').disabled = false;
        }
    }
    async function add() {
        const name = win.prompt(COPY.name, draft ? `${draft.name} 副本` : COPY.title);
        if (!name?.trim()) return;
        await mutate({ type: 'add', id: createIdentifier(), afterId: selected, name, preset: draft || createPreset('', '') });
    }
    async function rename() {
        const saved = settings.presets.find(preset => preset.id === selected);
        const name = win.prompt(COPY.name, saved.name); if (!name?.trim() || name === saved.name) return;
        const preservedDraft = structuredClone(draft);
        const oldSelection = selected;
        await mutate({ type: 'rename', id: selected, name });
        selected = oldSelection; draft = { ...preservedDraft, name: name.trim() }; render();
    }
    async function remove() {
        if (settings.presets.length === 1) throw new Error(COPY.last);
        const index = settings.presets.findIndex(preset => preset.id === selected);
        const remaining = settings.presets.filter(preset => preset.id !== selected);
        const replacement = remaining[Math.min(index, remaining.length - 1)];
        const affected = Object.keys(settings.bindings).filter(key => settings.bindings[key] === selected);
        if (!win.confirm(deletionMessage(settings.presets[index].name, replacement.name, affected))) return;
        await mutate({ type: 'delete', id: selected }, replacement.id);
    }
    function render() {
        const parametersOpen = fields.querySelector('details')?.open || false;
        fields.replaceChildren();
        const toolbar = element('fieldset', null, 'text-api-presets');
        toolbar.disabled = busy;
        const choices = [{ value: '', label: COPY.unset, disabled: true }, { value: HOST_BINDING, label: COPY.host },
            ...settings.presets.map(preset => ({ value: preset.id, label: preset.name }))];
        const selector = select(choices, selected, value => {
            mutate(value === HOST_BINDING ? { type: 'select-host' } : { type: 'select', id: value })
                .catch(error => { selector.value = selected || ''; feedback(error.message, true); });
        }); selector.setAttribute('aria-label', COPY.title);
        const actions = element('div', null, 'text-api-tools');
        for (const [label, run, icon] of [[COPY.add, add, 'add'], [COPY.rename, rename, 'rename'], [COPY.save, save, 'save'], [COPY.remove, remove, 'delete']]) {
            const item = button(label, run, icon);
            item.disabled = icon !== 'add' && (!draft || (selected === HOST_BINDING && icon !== 'save') || (icon === 'delete' && settings.presets.length === 1));
            if (icon === 'save') item.dataset.save = '';
            actions.append(item);
        }
        toolbar.append(selector, actions); fields.append(toolbar);
        syncSaveButton();
        if (!draft) return;
        if (selected === HOST_BINDING) {
            fields.append(button(COPY.test, async () => {
                if (networkBusy) return;
                networkBusy = true; const stamp = revision; feedback(COPY.testing);
                try { await request('test', { preset: structuredClone(draft) }); if (stamp === revision) feedback(COPY.testOk); }
                catch (error) { if (stamp === revision) feedback(error.message, true); }
                finally { networkBusy = false; }
            }));
            if (feature === 'planner') fields.append(element('p', COPY.plannerKey, 'text-api-status'));
            return;
        }
        control(COPY.provider, select([{ value: HOST_PROVIDER, label: COPY.host }, ...PROVIDER_OPTIONS], draft.provider, value => { draft.provider = value; render(); }));
        if (draft.provider !== HOST_PROVIDER) {
            control(COPY.url, input('baseUrl'));
            const prefix = element('div', null, 'text-api-grid');
            control(COPY.prefix, select([{ value: 'auto', label: COPY.autoPrefix }, { value: 'custom', label: COPY.customPrefix }], draft.prefixMode, value => { draft.prefixMode = value; render(); }), prefix);
            if (draft.prefixMode === 'custom') control(COPY.customPrefix, input('customPrefix'), prefix);
            fields.append(prefix);
            const key = input('apiKey', 'password'); const keyRow = element('div', null, 'text-api-inline');
            const reveal = button(COPY.show, () => { key.type = key.type === 'password' ? 'text' : 'password'; reveal.textContent = key.type === 'password' ? COPY.show : COPY.hide; });
            keyRow.append(key, reveal); control(COPY.key, keyRow);
            const modelInput = input('model');
            modelInput.onchange = () => renderParameters();
            control(COPY.model, modelInput);
            if (supportsModelListAuth(draft.provider)) control(COPY.modelListAuth, select(getModelListAuthOptions(draft.provider), normalizeModelListAuth(draft.modelListAuth, draft.provider), value => { draft.modelListAuth = value; }));
        }
        const modelList = select([{ value: '', label: COPY.manual }], '', value => { if (value) { draft.model = value; render(); } });
        modelList.hidden = true; modelList.setAttribute('aria-label', COPY.pull);
        const networkActions = element('div', null, 'text-api-inline');
        async function connect(action) {
            if (networkBusy) return;
            networkBusy = true;
            networkActions.querySelectorAll('button').forEach(node => { node.disabled = true; });
            const stamp = revision; feedback(action === 'models' ? COPY.pulling : COPY.testing);
            try {
            const result = await request(action, { preset: structuredClone(draft) });
            if (stamp !== revision) return;
            if (action === 'models') {
                modelList.replaceChildren(...[{ value: '', label: COPY.manual }, ...result.map(value => ({ value, label: value }))].map(option => {
                    const node = element('option', option.label); node.value = option.value; return node;
                })); modelList.hidden = false; feedback(COPY.modelCount(result.length));
            } else feedback(COPY.testOk);
            } catch (error) {
                if (stamp === revision) feedback(error.message, true);
            } finally {
                networkBusy = false;
                fields.querySelectorAll('[data-network]').forEach(node => { node.disabled = false; });
            }
        }
        if (draft.provider !== HOST_PROVIDER) networkActions.append(button(COPY.pull, () => connect('models')));
        networkActions.append(button(COPY.test, () => connect('test'))); networkActions.querySelectorAll('button').forEach(node => { node.dataset.network = ''; node.disabled = networkBusy; }); fields.append(networkActions, modelList);
        function renderParameters() {
            const existing = fields.querySelector('details');
            const details = element('details'); details.open = existing?.open ?? parametersOpen;
            details.append(element('summary', COPY.sampling));
            const grid = element('div', null, 'text-api-grid');
            control(COPY.temperature, input('temperature', 'number'), grid); control(COPY.maxTokens, input('maxTokens', 'number'), grid);
            const stream = element('input'); stream.type = 'checkbox'; stream.checked = draft.stream;
            stream.onchange = () => { draft.stream = stream.checked; revision++; feedback(''); };
            control(COPY.stream, stream, details).classList.add('text-api-check'); details.append(grid);
            for (const parameter of samplingParametersFor(draft.provider === HOST_PROVIDER ? 'sillytavern-openai-compatible' : draft.provider)) {
                const value = input(parameter.key, 'number', { [parameter.key]: draft.sampling[parameter.key]?.enabled ? draft.sampling[parameter.key].value : null });
                value.min = parameter.min; if (parameter.max != null) value.max = parameter.max;
                value.oninput = () => { revision++; feedback(''); draft.sampling[parameter.key] = { enabled: value.value !== '', value: value.value === '' ? parameter.value : Number(value.value) }; };
                control(parameter.label, value, grid);
            }
            const capability = resolveReasoningCapability(draft);
            if (draft.provider !== HOST_PROVIDER) control(COPY.reasoning, select(getReasoningModeOptions(capability), draft.reasoning.mode || 'inherit', value => { draft.reasoning.mode = value; renderParameters(); }), details);
            if (draft.reasoning.mode === 'on') {
                const efforts = getReasoningEffortOptions(capability);
                if (efforts.length) control(COPY.effort, select([{ value: '', label: COPY.inherit }, ...efforts], draft.reasoning.effort, value => { draft.reasoning.effort = value; }), details);
                if (capability.intensity?.kind === 'budget') control(COPY.budget, input('budgetTokens', 'number', draft.reasoning), details);
            }
            if (existing) existing.replaceWith(details); else fields.append(details);
        }
        renderParameters();
        if (feature === 'planner' && !draft.apiKey.trim()) fields.append(element('p', COPY.plannerKey, 'text-api-status'));
    }
    async function refresh() {
        if (busy) return;
        fields.disabled = true; retry.hidden = true; feedback(COPY.load);
        try { settings = await request('load'); choose(settings.bindings[feature]); feedback(''); }
        catch (error) { feedback(error.message, true); retry.hidden = false; }
        finally { fields.disabled = !settings; }
    }
    retry.onclick = refresh;
    return { refresh() { refresh().catch(error => feedback(error.message, true)); }, destroy() { revision++; cancelRequests(); saveFeedback.destroy(); win.removeEventListener('message', receive); for (const pending of requests.values()) { win.clearTimeout(pending.timer); pending.reject(new Error(COPY.cancelled)); } requests.clear(); } };
}
