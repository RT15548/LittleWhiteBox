import { observeAsyncCallback, observeBackgroundTask } from '../../../../shared/common/async-errors.js';
import { createPromptLayoutEditor, normalizeLayout } from '../../shared/prompt-layout-editor.js';
import { parseFieldDescriptions } from '../../shared/scene-plan-descriptions.js';
import { NATURAL_PROMPT_DEFAULTS } from './prompts.js';
import { previewDirectInput } from './planning.js';
import { bindSettingsPresetList } from './settings-preset-list.js';
import { MULTIMODAL_COPY as COPY } from './copy.js';

const TEMPLATE_FILE_TYPE = 'lwb-natural-draw-prompt';
const TEMPLATE_FILE_VERSION = 1;
const FIELD_KEYS = Object.keys(NATURAL_PROMPT_DEFAULTS);

export function bindPromptEditor({ document, provider, getState, persist, getPreview,
    buildPreview = previewDirectInput }) {
    const view = document.defaultView;
    const parking = document.getElementById('mm-prompt-editors');
    const container = document.getElementById('mm-layout');
    const extra = document.getElementById('mm-extra-prompt-fields');
    const fields = {};
    const editors = {};
    const blocks = { opening: ['topSystem'], guide: ['tagGuideContent'], rules: ['sceneRules'], tools: ['fieldDescriptions'] };
    let draftLayout;
    let owner;
    const readFields = () => ({ ...Object.fromEntries(FIELD_KEYS.map(key => [key, fields[key].value])), layout: draftLayout });
    const create = (tag, classes, text = '') => {
        const node = document.createElement(tag);
        if (classes) node.className = classes;
        if (text) node.textContent = text;
        return node;
    };
    const button = (label, action) => {
        const node = create('button', 'btn btn-sm', label);
        node.type = 'button';
        node.addEventListener('click', action);
        return node;
    };
    const preview = create('details', 'card prompt-advanced-card');
    const summary = create('summary', 'prompt-card-header');
    summary.append(create('div', 'card-title', COPY.requestPreview));
    const fixed = create('details', 'draw-disclosure');
    const system = create('pre', 'mm-system-rule');
    fixed.append(create('summary', '', COPY.fixedSystemRule), system);
    const chainRoot = create('pre', 'mm-request-preview');
    const status = create('div', 'status-text');
    const previewNote = create('p', 'form-hint');
    const draftNotice = create('p', 'form-hint', COPY.previewUnsaved);
    draftNotice.hidden = true;
    preview.append(summary, previewNote, draftNotice, fixed, status, chainRoot);
    let previewSequence = 0;

    async function renderPreview() {
        const sequence = ++previewSequence;
        if (!preview.open || !owner) return;
        status.textContent = '';
        chainRoot.textContent = '';
        try {
            const settings = getState();
            const { input, sentRequest } = getPreview(settings);
            previewNote.textContent = sentRequest ? COPY.previewSent : input.prompt ? COPY.previewTemplate : COPY.previewSample;
            const { systemPrompt, ...request } = sentRequest
                ?? await buildPreview(provider, { ...input, prompt: input.prompt || COPY.samplePrompt }, settings);
            if (sequence !== previewSequence) return;
            system.textContent = systemPrompt;
            chainRoot.textContent = JSON.stringify(request, null, 2);
        } catch (error) {
            if (sequence !== previewSequence) return;
            status.className = 'status-text error';
            status.textContent = error.message;
            system.textContent = '';
        }
    }
    const refreshPreview = () => observeBackgroundTask(renderPreview(), { source: import.meta.url, operation: 'renderRequestPreview' });
    const updateDraftNotice = () => { draftNotice.hidden = !bar.isDirty(); };
    preview.addEventListener('toggle', refreshPreview);
    for (const [id, keys] of Object.entries(blocks)) {
        const editor = create('div');
        editors[id] = editor;
        for (const key of keys) {
            const label = create('label', 'form-group');
            const field = create('textarea', 'prompt-textarea');
            field.rows = 5;
            fields[key] = field;
            label.append(create('span', 'form-label', COPY[key]), field);
            field.addEventListener('input', () => { layoutEditor.refreshSummaries(); updateDraftNotice(); });
            editor.append(label, button(COPY.restoreDefault, () => {
                field.value = NATURAL_PROMPT_DEFAULTS[key];
                layoutEditor.refreshSummaries();
                updateDraftNotice();
            }));
        }
        parking.append(editor);
    }
    const layoutEditor = createPromptLayoutEditor({
        document, container, builtinEditors: editors, editorParking: parking,
        getOwnerKey: () => owner, getLayout: () => draftLayout,
        getSavedLayout: () => getState().promptPresets.find(item => item.id === owner)?.layout,
        onChange: next => { draftLayout = next; updateDraftNotice(); },
        confirm: text => view.confirm(text),
        describeBuiltin: id => editors[id] ? {
            label: id === 'guide' ? COPY.tagGuideContent : undefined,
            summary: fields[blocks[id][0]].value,
            action: 'edit',
        } : null,
        collapseId: 'prompt-layout',
    });
    const bar = bindSettingsPresetList({
        root: document.querySelector('[data-presets="prompt"]'), label: COPY.prompts, getState, persist,
        listKey: 'promptPresets', selectionKey: 'selectedPromptPresetId', readFields,
        onDraftPreserved: updateDraftNotice,
        validateFields: value => parseFieldDescriptions(value.fieldDescriptions),
        fillFields: (value, id) => {
            owner = id;
            draftLayout = value.layout;
            draftNotice.hidden = true;
            for (const key of FIELD_KEYS) fields[key].value = value[key];
            layoutEditor.render();
            refreshPreview();
        },
    });
    const tools = create('div', 'btn-group');
    const file = create('input');
    file.type = 'file';
    file.accept = '.json';
    file.hidden = true;
    file.addEventListener('change', observeAsyncCallback(async () => {
        const selected = file.files[0];
        file.value = '';
        if (!selected) return;
        try {
            const { type, version, name, ...value } = JSON.parse(await selected.text());
            if (type !== TEMPLATE_FILE_TYPE || version !== TEMPLATE_FILE_VERSION || typeof name !== 'string' || !name.trim()
                || FIELD_KEYS.some(key => typeof value[key] !== 'string')) throw new Error(COPY.invalidPromptImport);
            const layout = value.layout === undefined ? undefined : normalizeLayout(value.layout).layout;
            await bar.saveAs(name.trim(), { ...Object.fromEntries(FIELD_KEYS.map(key => [key, value[key]])), layout });
        } catch (error) {
            bar.report('error', error instanceof SyntaxError ? COPY.invalidPromptImport : error.message || COPY.invalidPromptImport);
        }
    }, { source: import.meta.url, operation: 'importPromptPreset' }));
    tools.append(
        file, button(COPY.importPrompt, () => file.click()),
        button(COPY.exportPrompt, () => {
            const name = bar.currentName();
            const data = { type: TEMPLATE_FILE_TYPE, version: TEMPLATE_FILE_VERSION, name, ...readFields() };
            const url = view.URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
            const link = create('a');
            link.href = url;
            link.download = `${name}.json`;
            link.click();
            setTimeout(() => view.URL.revokeObjectURL(url), 0);
        }),
        button(COPY.restorePrompt, () => {
            if (!view.confirm(COPY.resetPromptConfirm)) return;
            draftLayout = undefined;
            for (const key of FIELD_KEYS) fields[key].value = NATURAL_PROMPT_DEFAULTS[key];
            layoutEditor.render();
            updateDraftNotice();
        }),
    );
    extra.append(tools, preview);
    return { render() { bar.render(); updateDraftNotice(); refreshPreview(); }, isDirty: bar.isDirty, refreshPreview,
        destroy() { ++previewSequence; bar.destroy(); layoutEditor.destroy(); },
    };
}
