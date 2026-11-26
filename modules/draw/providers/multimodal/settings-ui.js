import { extensionFolderPath } from '../../../../core/constants.js';
import { getRequestHeaders } from '../../../../../../../../script.js';
import { observeAsyncCallback, observeBackgroundTask } from '../../../../shared/common/async-errors.js';
import { DRAW_LAYERS } from '../../shared/draw-visuals.js';
import { drawNotify } from '../../shared/draw-toast.js';
import { captureEditSave, installHostPanelEscape } from '../../shared/panel-escape.js';
import { resolveInitialTab, saveLastTab } from '../../shared/last-tab.js';
import { createApiPresetPage } from '../../shared/api-preset-page.js';
import { isSameApiConfig } from '../../shared/api-presets.js';
import { attachDrawAgentSettingsSurface } from '../../shared/agent-settings-surface.js';
import { mountServerPluginGuide } from '../../../../shared/server-plugin/installation-guide.js';
import { fetchImageBackendJobsStatus, hasImageBackendJobsCapability, REQUIRED_IMAGE_JOBS_PLUGIN_VERSION } from '../../shared/backend-image-jobs.js';
import { DRAW_BACKEND_COPY, createDrawBackendStatusCopy } from '../../shared/draw-backend-copy.js';
import { isDrawingRuntimeHostCompatible } from '../../shared/drawing-runtime-client.js';
import { invalidateDrawPreviews } from '../../shared/draw-common.js';
import { mountProviderSettingsSections } from '../../shared/provider-settings-markup.js';
import { createProviderSettingsSections } from '../../shared/provider-settings-sections.js';
import { createFilterRuleSortable } from '../../shared/filter-rule-sort.js';
import { DEFAULT_MESSAGE_FILTER_RULES } from '../../shared/message-filter-rules.js';
import { getSharedDrawSettings, loadSharedDrawSettings, updateSharedDrawSettingsPersistent } from '../../shared/draw-settings.js';
import { markNewGroupsOff } from '../../shared/character-group-presets.js';
import { normalizePlannerRetry } from '../../shared/planner-retry.js';
import { MAX_IMAGES_OVERRIDE_MIN, MAX_IMAGES_OVERRIDE_MAX } from '../../shared/max-images-override.js';
import { apiFieldsFor, createDefaultSettings, defaultParams, GEMINI_ASPECT_RATIOS, GEMINI_IMAGE_SIZES,
    OPENAI_BACKGROUNDS, OPENAI_OUTPUT_FORMATS, OPENAI_QUALITIES, OPENAI_SIZES, providerDefinition } from './settings-model.js';
import { getSettings, loadSettings, subscribeSettings, updateSettingsPersistent } from './settings.js';
import { bindPromptEditor } from './settings-prompt-editor.js';
import { bindSettingsPresetList } from './settings-preset-list.js';
import { bindTestView } from './settings-test-view.js';
import { bindImageApiFields } from './settings-image-api.js';
import { MULTIMODAL_COPY as COPY } from './copy.js';

const SETTINGS_PATH = `${extensionFolderPath}/modules/draw/providers/multimodal/settings.html`;
const NAVIGATION = [
    ['test', 'flask', 'test', 'testShort'], ['api', 'key', 'apiPage', 'apiShort'],
    ['params', 'sliders', 'parameters', 'paramsShort'], ['llm', 'robot', 'agent', 'agentShort'],
    ['prompts', 'file-code', 'prompts', 'promptsShort'], ['worldbook', 'book-atlas', 'worldbook', 'worldbook'],
    ['characters', 'user-group', 'characters', 'charactersShort'], ['gallery', 'images', 'gallery', 'gallery'],
];
const TABS = NAVIGATION.map(([tab]) => tab);
const MODEL_OPTIONS = {
    gemini: { aspectRatio: GEMINI_ASPECT_RATIOS, imageSize: GEMINI_IMAGE_SIZES },
    openai: { size: OPENAI_SIZES, quality: OPENAI_QUALITIES, background: OPENAI_BACKGROUNDS, outputFormat: OPENAI_OUTPUT_FORMATS },
};
const optionLabel = value => COPY[value === 'auto' ? 'autoValue' : value] || value;
const sessions = new Map();

function renderCopy(document, label) {
    const title = COPY.title(label);
    document.title = title;
    document.getElementById('mm-title').textContent = title;
    document.querySelectorAll('[data-copy]').forEach(node => { node.textContent = COPY[node.dataset.copy]; });
    document.querySelectorAll('[data-label]').forEach(node => { node.setAttribute('aria-label', COPY[node.dataset.label]); });
    for (const [selector, mobile] of [['.app-sidebar', false], ['.mobile-nav-inner', true]]) {
        const parent = document.querySelector(selector);
        for (const [page, name, long, short] of NAVIGATION) {
            if (!mobile && ['params', 'characters'].includes(page)) {
                const divider = document.createElement('div');
                divider.className = 'nav-divider';
                parent.append(divider);
            }
            const item = document.createElement('div');
            item.className = mobile ? 'mobile-nav-item' : 'nav-item';
            item.tabIndex = 0;
            item.setAttribute('role', 'button');
            item.dataset.tab = page;
            const icon = document.createElement('i');
            icon.className = `fa-solid fa-${name}`;
            icon.setAttribute('aria-hidden', 'true');
            const text = document.createElement('span');
            text.textContent = COPY[mobile ? short : long];
            item.append(icon, text);
            parent.append(item);
        }
    }
}

function constructField(document, key) {
    const label = document.createElement('label');
    label.className = 'form-group';
    const title = document.createElement('span');
    title.className = 'form-label';
    title.textContent = COPY[key];
    const field = document.createElement('select');
    field.name = key;
    field.className = 'input';
    label.append(title, field);
    return { label, field };
}

function bindFrame(document, provider) {
    const label = providerDefinition(provider).label;
    const $ = id => document.getElementById(id);
    const q = selector => document.querySelector(selector);
    const field = name => q(`[name="${name}"]`);
    const getState = () => getSettings(provider);
    const persist = mutator => updateSettingsPersistent(provider, mutator);
    const report = (id, state, text) => {
        const node = $(id);
        if (!node) return;
        node.textContent = text;
        node.classList.remove('success', 'error', 'pending', 'modified');
        if (state) node.classList.add(state);
    };
    const on = (selector, event, task) => q(selector).addEventListener(event,
        observeAsyncCallback(task, { source: import.meta.url, operation: selector }));
    const runSaveButtonTask = async (button, operation, { statusElementId, pendingText = COPY.saving, successText = COPY.saved, errorText = COPY.saveFailed } = {}) => {
        button.disabled = true;
        report(statusElementId, 'pending', pendingText);
        try {
            const ok = await operation();
            report(statusElementId, ok ? 'success' : 'error', ok ? successText : errorText);
            return ok;
        } catch (error) {
            report(statusElementId, 'error', error.message || errorText);
            return false;
        } finally {
            button.disabled = false;
        }
    };
    const saveShared = mutator => updateSharedDrawSettingsPersistent(mutator, COPY.saved, { notify: false, silent: false });
    const shared = getSharedDrawSettings();
    let worldbooks = structuredClone(shared.worldbooks);
    let savedBooks = JSON.stringify(worldbooks);
    let savedRules;
    let savedLibrary;
    let agentSurface = null;
    let forceClosing = false;
    let globalBusy = 0;

    mountProviderSettingsSections(document);
    renderCopy(document, label);
    for (const [name, choices] of Object.entries(MODEL_OPTIONS[provider])) {
        const { label, field } = constructField(document, name);
        field.replaceChildren(...choices.map(value => new document.defaultView.Option(optionLabel(value), value)));
        $('mm-model-options').append(label);
    }
    const paramKeys = Object.keys(defaultParams(provider));
    field('maxImages').min = String(MAX_IMAGES_OVERRIDE_MIN);
    field('maxImages').max = String(MAX_IMAGES_OVERRIDE_MAX);
    const params = bindSettingsPresetList({
        root: q('[data-presets="params"]'), label: COPY.parameters, getState, persist,
        fieldset: $('mm-params-form'), listKey: 'paramsPresets', selectionKey: 'selectedParamsPresetId',
        readFields: () => ({ positivePrefix: field('positivePrefix').value, params: Object.fromEntries(paramKeys.map(key => [key, field(key).value])), maxImages: field('maxImages').value === '' ? null : Number(field('maxImages').value) }),
        fillFields: ({ positivePrefix, params, maxImages }) => {
            field('positivePrefix').value = positivePrefix;
            field('maxImages').value = maxImages;
            for (const key of paramKeys) field(key).value = params[key];
        },
    });
    const test = bindTestView({ document, provider, getSettings: getState, report,
        onPreviewChange: () => promptEditor.refreshPreview() });
    const promptEditor = bindPromptEditor({ document, provider, getState, persist, getPreview: test.getPreview });
    const apiDefaults = createDefaultSettings(provider);
    const apiFields = apiFieldsFor(provider);
    const sendButtons = [...document.querySelectorAll('[data-send-mode]')];
    let sendMode;
    const imageApi = bindImageApiFields({ document, provider, report, getSendMode: () => sendMode });
    let statusCheck;
    mountServerPluginGuide($('mm-backend-guide'), 'mm-backend');
    function setSendMode(next) {
        if (sendMode === next) return;
        sendMode = next;
        imageApi.clearLookup();
        const backend = next === 'backend';
        for (const button of sendButtons) button.setAttribute('aria-pressed', String(button.dataset.sendMode === next));
        $('mm-backend-status').hidden = !backend;
        $('mm-frontend-hint').hidden = backend;
        statusCheck?.abort();
        if (!backend) return;
        statusCheck = new AbortController();
        const { signal } = statusCheck;
        $('mm-backend-message').textContent = DRAW_BACKEND_COPY.checking;
        observeBackgroundTask(fetchImageBackendJobsStatus({ getHeaders: getRequestHeaders, signal }).then(status => {
            if (signal.aborted) return;
            const copy = createDrawBackendStatusCopy({ version: status.version, minimumVersion: REQUIRED_IMAGE_JOBS_PLUGIN_VERSION });
            $('mm-backend-message').textContent = !status.ready ? copy.notInstalled
                : !isDrawingRuntimeHostCompatible(status) ? copy.outdated
                    : hasImageBackendJobsCapability(status) ? copy.ready : copy.backgroundUnsupported;
        }).catch(error => { if (!signal.aborted) throw error; }), { source: import.meta.url, operation: 'checkBackend' });
    }
    const readConfig = () => ({ apiBaseUrl: field('apiBaseUrl').value.trim(), apiKey: field('apiKey').value.trim(),
        timeout: Number(field('timeout').value) * 1000, sendMode, ...imageApi.read() });
    const fillConfig = config => {
        field('apiBaseUrl').value = config.apiBaseUrl;
        field('apiKey').value = config.apiKey;
        field('timeout').value = config.timeout / 1000;
        setSendMode(config.sendMode);
        imageApi.fill(config);
    };
    const api = createApiPresetPage({
        presetOptions: { fields: apiFields, normalizeConfig: value => Object.fromEntries(apiFields.map(key => [key, value[key] ?? apiDefaults[key]])) },
        getSettings: getState, getSettingsDocument: () => document, querySettings: q,
        containerSelector: '#mm-api-presets', panelSelector: '[data-page="api"]', formSelector: '#mm-api-form',
        readConfig, fillConfig, validateForm: imageApi.validate,
        persist: async mutator => { await persist(mutator); return true; },
        prompt: (message, fallback) => document.defaultView.prompt(message, fallback),
        confirm: message => document.defaultView.confirm(message),
    });
    fillConfig(getState());
    api.ensureBar();
    api.bindFormRefresh();
    for (const button of sendButtons) button.addEventListener('click', () => setSendMode(button.dataset.sendMode));
    on('#mm-api-save', 'click', async event => {
        if (!imageApi.validate()) return;
        globalBusy++;
        try { await runSaveButtonTask(event.currentTarget, api.save, { statusElementId: 'mm-api-status' }); }
        finally { globalBusy--; }
    });
    const imageTitle = field('imageTitleMode');
    imageTitle.value = shared.imageTitleMode;
    on('[name="imageTitleMode"]', 'change', event => {
        const value = event.currentTarget.value;
        return runSaveButtonTask(event.currentTarget, async () => {
            const ok = await saveShared(settings => { settings.imageTitleMode = value; });
            imageTitle.value = getSharedDrawSettings().imageTitleMode;
            if (ok) invalidateDrawPreviews();
            return ok;
        }, { statusElementId: 'mm-image-title-status' });
    });
    const retry = $('mm-planner-retries');
    retry.value = shared.plannerMaxRetries;
    on('#mm-planner-retries', 'change', async () => {
        const { maxRetries } = normalizePlannerRetry({ maxRetries: retry.value === '' ? getSharedDrawSettings().plannerMaxRetries : Number(retry.value) });
        retry.disabled = true;
        const ok = await saveShared(settings => { settings.plannerMaxRetries = maxRetries; });
        report('mm-agent-status', ok ? 'success' : 'error', ok ? COPY.saved : COPY.saveFailed);
        retry.value = getSharedDrawSettings().plannerMaxRetries;
        retry.disabled = false;
    });
    const sections = createProviderSettingsSections({
        getSettingsDocument: () => document, updateStatusText: report,
        runSaveButtonTask, withSaveTimeout: task => task,
        onCharacterChange: refreshCharacterCounts,
        getWorldbooks: () => worldbooks,
        setWorldbooks: next => { worldbooks = next; },
    });
    function refreshCharacterCounts() {
        const ui = sections.characterLibraryUi;
        const count = ui?.getCardCount() ?? 0;
        $('sd-draw-summary-characters-side').textContent = count;
        $('sd-draw-character-result-count').textContent = `${ui?.getVisibleCardCount() ?? count} / ${count}`;
        const state = getState();
        $('sd-draw-summary-preset').textContent = state.paramsPresets.find(item => item.id === state.selectedParamsPresetId).name;
    }
    sections.bindGallery();
    $('sd-gallery-save-as-jpeg').checked = shared.saveAsJpeg === true;
    $('sd-gallery-auto-save').checked = shared.autoSaveImages === true;
    $('sd-gallery-save-by-folder').checked = shared.saveImagesByFolder === true;
    $('sd-shared-use-worldinfo').checked = shared.useWorldInfo === true;
    $('sd-wb-enabled').checked = worldbooks.enabled === true;
    $('sd-wb-filter-mode').value = worldbooks.keywordFilterMode;
    sections.bindWorldbookUploadEvents();
    sections.renderUploadedBooks(worldbooks.uploadedBooks);
    sections.renderFilterRules(shared.messageFilterRules);
    savedRules = JSON.stringify(sections.collectFilterRules());
    const sorting = createFilterRuleSortable({ container: $('sd-filter-rules-list'), document });
    sections.renderCharacterTagList(shared.characterTags, shared.characterGroups);
    sections.ensureGroupPresetBinding();
    refreshCharacterCounts();
    const readLibrary = () => ({ characterTags: sections.getSharedCharacterTagsFromForm(), characterGroups: sections.getSharedCharacterGroupsFromForm() });
    savedLibrary = JSON.stringify(readLibrary());
    const readWorldbook = () => ({ ...worldbooks, enabled: $('sd-wb-enabled').checked, keywordFilterMode: $('sd-wb-filter-mode').value });
    let savedUseWorldInfo = shared.useWorldInfo === true;
    on('#sd-filter-add', 'click', () => sections.renderFilterRuleRow());
    on('#sd-filter-reset', 'click', () => sections.renderFilterRules(DEFAULT_MESSAGE_FILTER_RULES));
    on('#sd-filter-save', 'click', event => {
        const rules = sections.collectFilterRules();
        return runSaveButtonTask(event.currentTarget, async () => {
            const ok = await saveShared(settings => { settings.messageFilterRules = rules; });
            if (ok) savedRules = JSON.stringify(rules);
            return ok;
        }, { statusElementId: 'sd-filter-status' });
    });
    on('[data-sd-status="sd-worldbook-status"]', 'click', event => {
        const books = readWorldbook();
        const useWorldInfo = $('sd-shared-use-worldinfo').checked;
        return runSaveButtonTask(event.currentTarget, async () => {
            const ok = await saveShared(settings => { settings.useWorldInfo = useWorldInfo; settings.worldbooks = books; });
            if (ok) { savedBooks = JSON.stringify(books); savedUseWorldInfo = useWorldInfo; }
            return ok;
        }, { statusElementId: 'sd-worldbook-status' });
    });
    on('#sd-shared-char-add', 'click', () => sections.addCharacterTagDraft());
    on('#sd-shared-char-clear', 'click', () => sections.clearCharacterTagsDraft());
    on('#sd-shared-char-export', 'click', () => sections.exportSharedCharacterTags());
    on('#sd-shared-char-import', 'change', event => sections.importSharedCharacterTags(event.currentTarget));
    on('#sd-shared-character-list', 'click', event => {
        const target = event.target.closest('[data-sd-char-delete]');
        if (target) sections.deleteCharacterTagDraft(target.dataset.sdCharDelete);
    });
    on('[data-page="characters"] [data-sd-save-shared]', 'click', async event => {
        const library = readLibrary();
        const acknowledge = captureEditSave(document);
        const ok = await runSaveButtonTask(event.currentTarget, () => saveShared(settings => {
            const { characterTags, characterGroups } = library;
            settings.characterGroupPresets = markNewGroupsOff(settings.characterGroupPresets, settings.characterGroups, characterGroups);
            settings.characterTags = characterTags;
            settings.characterGroups = characterGroups;
        }), { statusElementId: 'mm-global-status' });
        if (ok) { savedLibrary = JSON.stringify(library); acknowledge(); }
    });

    function syncHeader(state) {
        field('showFloorButton').checked = state.showFloorButton;
        field('showFloatingButton').checked = state.showFloatingButton;
        document.querySelectorAll('[data-mode]').forEach(node => {
            const selected = state.mode === node.dataset.mode;
            node.classList.toggle('active', selected);
            node.setAttribute('aria-pressed', String(selected));
        });
    }
    function syncSettings(state) {
        syncHeader(state);
        params.render();
        promptEditor.render();
        refreshCharacterCounts();
    }
    const unsubscribe = subscribeSettings(provider, syncSettings);
    syncHeader(getState());
    const changeHeader = async (key, value) => {
        const header = q('.app-header');
        header.querySelectorAll('[data-mode], .header-toggle input').forEach(node => { node.disabled = true; });
        try { await persist(draft => { draft[key] = value; }); }
        catch (error) { report('mm-global-status', 'error', error.message || COPY.saveFailed); }
        finally {
            syncHeader(getState());
            header.querySelectorAll('[data-mode], .header-toggle input').forEach(node => { node.disabled = false; });
        }
    };
    for (const name of ['showFloorButton', 'showFloatingButton']) {
        on(`[name="${name}"]`, 'change', event => changeHeader(name, event.currentTarget.checked));
    }
    for (const mode of ['manual', 'auto']) on(`[data-mode="${mode}"]`, 'click', () => changeHeader('mode', mode));

    function switchView(view) {
        saveLastTab(provider, view);
        document.querySelectorAll('[data-tab]').forEach(node => {
            const selected = node.dataset.tab === view;
            node.classList.toggle('active', selected);
            if (selected) node.setAttribute('aria-current', 'page'); else node.removeAttribute('aria-current');
        });
        document.querySelectorAll('[data-page]').forEach(node => node.classList.toggle('active', node.dataset.page === view));
        if (view === 'llm') agentSurface = attachDrawAgentSettingsSurface({ surface: agentSurface, getRoot: () => $('mm-agent'), logPrefix: label });
        if (view === 'prompts') promptEditor.refreshPreview();
        if (view === 'gallery') observeBackgroundTask(sections.renderGalleryManagement(), { source: import.meta.url, operation: 'openGallery' });
    }
    document.addEventListener('click', event => {
        const tab = event.target.closest('[data-tab]');
        if (tab) switchView(tab.dataset.tab);
    });
    function requestClose() {
        if (forceClosing || globalBusy) return;
        const dirty = !isSameApiConfig(readConfig(), getState(), apiFields) || params.isDirty() || promptEditor.isDirty()
            || agentSurface?.getState().configDirty || savedRules !== JSON.stringify(sections.collectFilterRules())
            || savedLibrary !== JSON.stringify(readLibrary()) || savedBooks !== JSON.stringify(readWorldbook())
            || savedUseWorldInfo !== $('sd-shared-use-worldinfo').checked;
        if (dirty && !document.defaultView.confirm(COPY.discardConfirm)) return;
        closeSettings(provider);
    }
    on('.header-close', 'click', requestClose);
    return {
        switchView, requestClose,
        destroy() {
            forceClosing = true;
            unsubscribe();
            sorting.destroy();
            sections.destroyCharacterLibraryUi();
            agentSurface?.destroy();
            statusCheck?.abort();
            imageApi.destroy();
            params.destroy();
            promptEditor.destroy();
            test.destroy();
            api.destroy();
        },
    };
}

export function closeSettings(provider) {
    const session = sessions.get(provider);
    if (!session) return;
    sessions.delete(provider);
    session.dispose();
}

export async function openSettings(provider, { view } = {}) {
    providerDefinition(provider);
    const requested = resolveInitialTab({ provider, tabs: TABS, requested: view });
    const existing = sessions.get(provider);
    if (existing) { (await existing.ready)?.switchView(requested); return; }
    const overlay = document.createElement('div');
    overlay.id = `xiaobaix-${provider}-draw-overlay`;
    overlay.style.cssText = `position:fixed;inset:0;width:100vw;z-index:${DRAW_LAYERS.settings};overflow:hidden;background:#0d1117;`;
    const iframe = document.createElement('iframe');
    iframe.title = COPY.title(providerDefinition(provider).label);
    const desktop = window.matchMedia('(min-width:769px)');
    const resize = () => {
        overlay.style.height = `${window.innerHeight}px`;
        iframe.style.cssText = desktop.matches
            ? 'position:absolute;inset:12px;width:calc(100% - 24px);height:calc(100% - 24px);border:none;border-radius:12px;background:#0d1117;'
            : 'position:absolute;inset:0;width:100%;height:100%;border:none;background:#0d1117;';
    };
    const pending = new AbortController();
    const session = {
        dispose() {
            pending.abort();
            session.binding?.destroy();
            removeEscape();
            window.removeEventListener('resize', resize);
            window.visualViewport?.removeEventListener('resize', resize);
            overlay.remove();
        },
    };
    const removeEscape = installHostPanelEscape({ hostWindow: window, getOverlay: () => overlay, getFrame: () => iframe });
    const loaded = new Promise((resolve, reject) => {
        iframe.addEventListener('load', () => resolve(iframe.contentDocument), { once: true, signal: pending.signal });
        iframe.addEventListener('error', () => reject(new Error(COPY.loadError)), { once: true, signal: pending.signal });
        pending.signal.addEventListener('abort', () => resolve(null), { once: true });
    });
    overlay.addEventListener('click', event => { if (event.target === overlay) session.binding?.requestClose(); });
    resize();
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    iframe.src = SETTINGS_PATH;
    overlay.append(iframe);
    sessions.set(provider, session);
    document.body.append(overlay);
    session.ready = Promise.all([loaded, loadSettings(provider), loadSharedDrawSettings()]).then(([frameDocument]) => {
        if (pending.signal.aborted) return null;
        if (!frameDocument?.querySelector('.app-container')) throw new Error(COPY.loadError);
        session.binding = bindFrame(frameDocument, provider);
        return session.binding;
    });
    try { (await session.ready)?.switchView(requested); }
    catch (error) {
        if (sessions.get(provider) !== session) return;
        closeSettings(provider);
        console.error({ source: import.meta.url, operation: 'openSettings' }, error);
        drawNotify.error(`${COPY.loadError}：${error.message}`);
    }
}
