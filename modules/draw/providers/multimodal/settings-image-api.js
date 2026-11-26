import { observeAsyncCallback } from '../../../../shared/common/async-errors.js';
import { MULTIMODAL_COPY as COPY } from './copy.js';

export function bindImageApiFields({ document, provider, report, getSendMode,
    pullModels = (...args) => import('../../../agent-core/model-list.js').then(module => module.pullModelsForProvider(...args)) }) {
    if (provider !== 'openai') return { read: () => ({}), fill() {}, validate() { return true; }, clearLookup() {}, destroy() {} };
    const $ = id => document.getElementById(id);
    const field = name => document.querySelector(`[name="${name}"]`);
    const root = $('mm-image-api');
    const model = field('responsesModel');
    const options = $('mm-model-list');
    const pull = $('mm-pull-models');
    const buttons = [...root.querySelectorAll('[data-image-api]')];
    let imageApi, lookup;
    const modelStatus = (state, message) => report('mm-model-status', state, message);
    root.hidden = false;

    function clearLookup() {
        lookup?.abort();
        lookup = null;
        pull.disabled = false;
        options.hidden = true;
        options.replaceChildren();
        modelStatus('', '');
    }
    function clearInvalidModel() {
        if (!model.hasAttribute('aria-invalid')) return;
        model.removeAttribute('aria-invalid');
        report('mm-api-status', '', '');
    }
    function select(next) {
        imageApi = next;
        const editingModel = next === 'responses';
        for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.imageApi === next));
        $('mm-images-hint').hidden = editingModel;
        $('mm-responses-hint').hidden = !editingModel;
        $('mm-responses-model').hidden = !editingModel;
        model.required = editingModel;
        clearInvalidModel();
        clearLookup();
    }
    for (const button of buttons) button.addEventListener('click', () => {
        if (imageApi !== button.dataset.imageApi) select(button.dataset.imageApi);
    });
    for (const name of ['apiBaseUrl', 'apiKey']) field(name).addEventListener('input', clearLookup);
    model.addEventListener('input', clearInvalidModel);
    options.addEventListener('change', () => {
        if (!options.value) return;
        model.value = options.value;
        model.dispatchEvent(new document.defaultView.Event('input', { bubbles: true }));
    });
    pull.addEventListener('click', observeAsyncCallback(async () => {
        clearLookup();
        const baseUrl = field('apiBaseUrl').value.trim();
        try {
            const url = new URL(baseUrl);
            if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new TypeError(COPY.invalidUrl);
        } catch {
            modelStatus('error', COPY.invalidUrl);
            field('apiBaseUrl').focus();
            return;
        }
        lookup = new AbortController();
        const { signal } = lookup;
        pull.disabled = true;
        modelStatus('pending', COPY.pullingModels);
        try {
            const models = await pullModels({ provider: 'openai-responses', baseUrl, apiKey: field('apiKey').value.trim() },
                { baseUrlResolved: true, viaHost: getSendMode() === 'backend', filter: 'all', signal });
            if (signal.aborted) return;
            if (!models.length) { modelStatus('', COPY.noModels); return; }
            const Option = document.defaultView.Option;
            options.replaceChildren(new Option(COPY.chooseModel, ''), ...models.map(name => new Option(name, name)));
            options.hidden = false;
            modelStatus('', '');
            options.focus();
        } catch {
            if (!signal.aborted) modelStatus('error', COPY.pullModelsFailed);
        } finally {
            if (!signal.aborted) { lookup = null; pull.disabled = false; }
        }
    }, { source: import.meta.url, operation: 'pullResponseModels' }));

    return {
        read: () => ({ imageApi, responsesModel: model.value.trim() }),
        fill(config) { model.value = config.responsesModel; select(config.imageApi); },
        clearLookup,
        validate() {
            if (imageApi !== 'responses' || model.value.trim()) return true;
            model.setAttribute('aria-invalid', 'true');
            report('mm-api-status', 'error', COPY.missingResponsesModel);
            model.focus();
            return false;
        },
        destroy() { lookup?.abort(); },
    };
}
