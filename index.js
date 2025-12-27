import { extension_settings, getContext } from "../../../extensions.js";
import { saveSettingsDebounced, eventSource, event_types, getRequestHeaders } from "../../../../script.js";
import { EXT_ID, EXT_NAME, extensionFolderPath } from "./core/constants.js";
import { executeSlashCommand } from "./core/slash-command.js";
import { EventCenter } from "./core/event-manager.js";
import { initTasks } from "./modules/scheduled-tasks/scheduled-tasks.js";
import { initScriptAssistant } from "./modules/script-assistant.js";
import { initMessagePreview, addHistoryButtonsDebounced } from "./modules/message-preview.js";
import { initImmersiveMode } from "./modules/immersive-mode.js";
import { initTemplateEditor, templateSettings } from "./modules/template-editor/template-editor.js";
import { initFourthWall, fourthWallCleanup } from "./modules/fourth-wall/fourth-wall.js";
import { initButtonCollapse } from "./modules/button-collapse.js";
import { initVariablesPanel, getVariablesPanelInstance, cleanupVariablesPanel } from "./modules/variables/variables-panel.js";
import { initStreamingGeneration } from "./modules/streaming-generation.js";
import { initVariablesCore, cleanupVariablesCore } from "./modules/variables/variables-core.js";
import { initControlAudio } from "./modules/control-audio.js";
import {
    initRenderer,
    cleanupRenderer,
    processExistingMessages,
    processMessageById,
    invalidateAll,
    clearBlobCaches,
    renderHtmlInIframe,
    shrinkRenderedWindowFull
} from "./modules/iframe-renderer.js";
import { initVarCommands, cleanupVarCommands } from "./modules/variables/var-commands.js";
import { initVareventEditor, cleanupVareventEditor } from "./modules/variables/varevent-editor.js";
import { initNovelDraw, cleanupNovelDraw } from "./modules/novel-draw/novel-draw.js";
import "./modules/story-summary/story-summary.js";
import "./modules/story-outline/story-outline.js";

const MODULE_NAME = "xiaobaix-memory";

extension_settings[EXT_ID] = extension_settings[EXT_ID] || {
    enabled: true,
    sandboxMode: false,
    recorded: { enabled: true },
    templateEditor: { enabled: true, characterBindings: {} },
    tasks: { enabled: true, globalTasks: [], processedMessages: [], character_allowed_tasks: [] },
    scriptAssistant: { enabled: false },
    preview: { enabled: false },
    immersive: { enabled: false },
    fourthWall: { enabled: false },
    audio: { enabled: true },
    variablesPanel: { enabled: false },
    variablesCore: { enabled: true },
    storySummary: { enabled: true },
    storyOutline: { enabled: false },
    novelDraw: { enabled: false },
    useBlob: false,
    wrapperIframe: true,
    renderEnabled: true,
    maxRenderedMessages: 5,
};

const settings = extension_settings[EXT_ID];
if (settings.dynamicPrompt && !settings.fourthWall) settings.fourthWall = settings.dynamicPrompt;

const DEPRECATED_KEYS = [
    'characterUpdater',
    'promptSections', 
    'promptPresets',
    'relationshipGuidelines'
];

function cleanupDeprecatedData() {
    const s = extension_settings[EXT_ID];
    if (!s) return;
    
    let cleaned = false;
    for (const key of DEPRECATED_KEYS) {
        if (key in s) {
            delete s[key];
            cleaned = true;
            console.log(`[LittleWhiteBox] Cleaned deprecated data: ${key}`);
        }
    }
    
    if (cleaned) {
        saveSettingsDebounced();
        console.log('[LittleWhiteBox] Deprecated data cleanup complete');
    }
}

let isXiaobaixEnabled = settings.enabled;
let moduleCleanupFunctions = new Map();
let updateCheckPerformed = false;

window.isXiaobaixEnabled = isXiaobaixEnabled;
window.testLittleWhiteBoxUpdate = async () => {
    updateCheckPerformed = false;
    await performExtensionUpdateCheck();
};
window.testUpdateUI = () => {
    updateExtensionHeaderWithUpdateNotice();
};
window.testRemoveUpdateUI = () => {
    removeAllUpdateNotices();
};

async function checkLittleWhiteBoxUpdate() {
    try {
        const timestamp = Date.now();
        const localRes = await fetch(`${extensionFolderPath}/manifest.json?t=${timestamp}`, { cache: 'no-cache' });
        if (!localRes.ok) return null;
        const localManifest = await localRes.json();
        const localVersion = localManifest.version;
        const remoteRes = await fetch(`https://api.github.com/repos/RT15548/LittleWhiteBox/contents/manifest.json?t=${timestamp}`, { cache: 'no-cache' });
        if (!remoteRes.ok) return null;
        const remoteData = await remoteRes.json();
        const remoteManifest = JSON.parse(atob(remoteData.content));
        const remoteVersion = remoteManifest.version;
        return localVersion !== remoteVersion ? { isUpToDate: false, localVersion, remoteVersion } : { isUpToDate: true, localVersion, remoteVersion };
    } catch (e) {
        return null;
    }
}

async function updateLittleWhiteBoxExtension() {
    try {
        const response = await fetch('/api/extensions/update', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ extensionName: 'LittleWhiteBox', global: true }),
        });
        if (!response.ok) {
            const text = await response.text();
            toastr.error(text || response.statusText, 'LittleWhiteBox update failed', { timeOut: 5000 });
            return false;
        }
        const data = await response.json();
        const message = data.isUpToDate ? 'LittleWhiteBox is up to date' : `LittleWhiteBox updated`;
        const title = data.isUpToDate ? '' : '请刷新页面以应用更新';
        toastr.success(message, title);
        return true;
    } catch (error) {
        toastr.error('Error during update', 'LittleWhiteBox update failed');
        return false;
    }
}

function updateExtensionHeaderWithUpdateNotice() {
    addUpdateTextNotice();
    addUpdateDownloadButton();
}

function addUpdateTextNotice() {
    const selectors = [
        '.inline-drawer-toggle.inline-drawer-header b',
        '.inline-drawer-header b',
        '.littlewhitebox .inline-drawer-header b',
        'div[class*="inline-drawer"] b'
    ];
    let headerElement = null;
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            if (element.textContent && element.textContent.includes('小白X')) {
                headerElement = element;
                break;
            }
        }
        if (headerElement) break;
    }
    if (!headerElement) {
        setTimeout(() => addUpdateTextNotice(), 1000);
        return;
    }
    if (headerElement.querySelector('.littlewhitebox-update-text')) return;
    const updateTextSmall = document.createElement('small');
    updateTextSmall.className = 'littlewhitebox-update-text';
    updateTextSmall.textContent = '(有可用更新)';
    headerElement.appendChild(updateTextSmall);
}

function addUpdateDownloadButton() {
    const sectionDividers = document.querySelectorAll('.section-divider');
    let totalSwitchDivider = null;
    for (const divider of sectionDividers) {
        if (divider.textContent && divider.textContent.includes('总开关')) {
            totalSwitchDivider = divider;
            break;
        }
    }
    if (!totalSwitchDivider) {
        setTimeout(() => addUpdateDownloadButton(), 1000);
        return;
    }
    if (document.querySelector('#littlewhitebox-update-extension')) return;
    const updateButton = document.createElement('div');
    updateButton.id = 'littlewhitebox-update-extension';
    updateButton.className = 'menu_button fa-solid fa-cloud-arrow-down interactable has-update';
    updateButton.title = '下载并安装小白X的更新';
    updateButton.tabIndex = 0;
    try {
        totalSwitchDivider.style.display = 'flex';
        totalSwitchDivider.style.alignItems = 'center';
        totalSwitchDivider.style.justifyContent = 'flex-start';
    } catch (e) {}
    totalSwitchDivider.appendChild(updateButton);
    try {
        if (window.setupUpdateButtonInSettings) {
            window.setupUpdateButtonInSettings();
        }
    } catch (e) {}
}

function removeAllUpdateNotices() {
    const textNotice = document.querySelector('.littlewhitebox-update-text');
    const downloadButton = document.querySelector('#littlewhitebox-update-extension');
    if (textNotice) textNotice.remove();
    if (downloadButton) downloadButton.remove();
}

async function performExtensionUpdateCheck() {
    if (updateCheckPerformed) return;
    updateCheckPerformed = true;
    try {
        const versionData = await checkLittleWhiteBoxUpdate();
        if (versionData && versionData.isUpToDate === false) {
            updateExtensionHeaderWithUpdateNotice();
        }
    } catch (error) {}
}

function registerModuleCleanup(moduleName, cleanupFunction) {
    moduleCleanupFunctions.set(moduleName, cleanupFunction);
}

function removeSkeletonStyles() {
    try {
        document.querySelectorAll('.xiaobaix-skel').forEach(el => {
            try { el.remove(); } catch (e) {}
        });
        document.getElementById('xiaobaix-skeleton-style')?.remove();
    } catch (e) {}
}

function cleanupAllResources() {
    try {
        EventCenter.cleanupAll();
    } catch (e) {}
    try { window.xbDebugPanelClose?.(); } catch (e) {}
    moduleCleanupFunctions.forEach((cleanupFn) => {
        try {
            cleanupFn();
        } catch (e) {}
    });
    moduleCleanupFunctions.clear();
    try {
        cleanupRenderer();
    } catch (e) {}
    document.querySelectorAll('.memory-button, .mes_history_preview').forEach(btn => btn.remove());
    document.querySelectorAll('#message_preview_btn').forEach(btn => {
        if (btn instanceof HTMLElement) {
            btn.style.display = 'none';
        }
    });
    removeSkeletonStyles();
}

async function waitForElement(selector, root = document, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const element = root.querySelector(selector);
        if (element) return element;
        await new Promise(r => setTimeout(r, 100));
    }
    return null;
}

function toggleSettingsControls(enabled) {
    const controls = [
        'xiaobaix_sandbox', 'xiaobaix_recorded_enabled', 'xiaobaix_preview_enabled',
        'xiaobaix_script_assistant', 'scheduled_tasks_enabled', 'xiaobaix_template_enabled',
        'xiaobaix_immersive_enabled', 'xiaobaix_fourth_wall_enabled',
        'xiaobaix_audio_enabled', 'xiaobaix_variables_panel_enabled',
        'xiaobaix_use_blob', 'xiaobaix_variables_core_enabled', 'Wrapperiframe', 'xiaobaix_render_enabled',
        'xiaobaix_max_rendered', 'xiaobaix_story_outline_enabled', 'xiaobaix_story_summary_enabled',
        'xiaobaix_novel_draw_enabled', 'xiaobaix_novel_draw_open_settings'
    ];
    controls.forEach(id => {
        $(`#${id}`).prop('disabled', !enabled).closest('.flex-container').toggleClass('disabled-control', !enabled);
    });
    const styleId = 'xiaobaix-disabled-style';
    if (!enabled && !document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `.disabled-control, .disabled-control * { opacity: 0.4 !important; pointer-events: none !important; cursor: not-allowed !important; }`;
        document.head.appendChild(style);
    } else if (enabled) {
        document.getElementById(styleId)?.remove();
    }
}

async function toggleAllFeatures(enabled) {
    if (enabled) {
        toggleSettingsControls(true);
        try { window.XB_applyPrevStates && window.XB_applyPrevStates(); } catch (e) {}
        saveSettingsDebounced();
        initRenderer();
        try { initVarCommands(); } catch (e) {}
        try { initVareventEditor(); } catch (e) {}
        if (extension_settings[EXT_ID].tasks?.enabled) {
            await initTasks();
        }
        const moduleInits = [
            { condition: extension_settings[EXT_ID].scriptAssistant?.enabled, init: initScriptAssistant },
            { condition: extension_settings[EXT_ID].immersive?.enabled, init: initImmersiveMode },
            { condition: extension_settings[EXT_ID].templateEditor?.enabled, init: initTemplateEditor },
            { condition: extension_settings[EXT_ID].fourthWall?.enabled, init: initFourthWall },
            { condition: extension_settings[EXT_ID].variablesPanel?.enabled, init: initVariablesPanel },
            { condition: extension_settings[EXT_ID].variablesCore?.enabled, init: initVariablesCore },
            { condition: extension_settings[EXT_ID].novelDraw?.enabled, init: initNovelDraw },
            { condition: true, init: initStreamingGeneration },
            { condition: true, init: initButtonCollapse }
        ];
        moduleInits.forEach(({ condition, init }) => {
            if (condition) init();
        });
        if (extension_settings[EXT_ID].preview?.enabled || extension_settings[EXT_ID].recorded?.enabled) {
            setTimeout(initMessagePreview, 200);
        }
        if (extension_settings[EXT_ID].scriptAssistant?.enabled && window.injectScriptDocs)
            setTimeout(() => window.injectScriptDocs(), 400);
        if (extension_settings[EXT_ID].preview?.enabled)
            setTimeout(() => { document.querySelectorAll('#message_preview_btn').forEach(btn => btn.style.display = ''); }, 500);
        if (extension_settings[EXT_ID].recorded?.enabled)
            setTimeout(() => addHistoryButtonsDebounced(), 600);
        try {
            if (isXiaobaixEnabled && settings.wrapperIframe && !document.getElementById('xb-callgen'))
                document.head.appendChild(Object.assign(document.createElement('script'), { id: 'xb-callgen', type: 'module', src: `${extensionFolderPath}/bridges/call-generate-service.js` }));
        } catch (e) {}
        try {
            if (isXiaobaixEnabled && !document.getElementById('xb-worldbook'))
                document.head.appendChild(Object.assign(document.createElement('script'), { id: 'xb-worldbook', type: 'module', src: `${extensionFolderPath}/bridges/worldbook-bridge.js` }));
        } catch (e) {}
        document.dispatchEvent(new CustomEvent('xiaobaixEnabledChanged', { detail: { enabled: true } }));
        $(document).trigger('xiaobaix:enabled:toggle', [true]);
    } else {
        try { window.XB_captureAndStoreStates && window.XB_captureAndStoreStates(); } catch (e) {}
        cleanupAllResources();
        if (window.messagePreviewCleanup) try { window.messagePreviewCleanup(); } catch (e) {}
        if (window.fourthWallCleanup) try { window.fourthWallCleanup(); } catch (e) {}
        if (window.buttonCollapseCleanup) try { window.buttonCollapseCleanup(); } catch (e) {}
        try { cleanupVariablesPanel(); } catch (e) {}
        try { cleanupVariablesCore(); } catch (e) {}
        try { cleanupVarCommands(); } catch (e) {}
        try { cleanupVareventEditor(); } catch (e) {}
        try { cleanupNovelDraw(); } catch (e) {}
        try { clearBlobCaches(); } catch (e) {}
        toggleSettingsControls(false);
        window.removeScriptDocs?.();
        try { window.cleanupWorldbookHostBridge && window.cleanupWorldbookHostBridge(); document.getElementById('xb-worldbook')?.remove(); } catch (e) {}
        try { window.cleanupCallGenerateHostBridge && window.cleanupCallGenerateHostBridge(); document.getElementById('xb-callgen')?.remove(); } catch (e) {}
        document.dispatchEvent(new CustomEvent('xiaobaixEnabledChanged', { detail: { enabled: false } }));
        $(document).trigger('xiaobaix:enabled:toggle', [false]);
    }
}

async function setupSettings() {
    try {
        const settingsContainer = await waitForElement("#extensions_settings");
        if (!settingsContainer) return;
        const response = await fetch(`${extensionFolderPath}/settings.html`);
        const settingsHtml = await response.text();
        $(settingsContainer).append(settingsHtml);

        setupDebugButtonInSettings();

        $("#xiaobaix_enabled").prop("checked", settings.enabled).on("change", async function () {
            const wasEnabled = settings.enabled;
            settings.enabled = $(this).prop("checked");
            isXiaobaixEnabled = settings.enabled;
            window.isXiaobaixEnabled = isXiaobaixEnabled;
            saveSettingsDebounced();
            if (settings.enabled !== wasEnabled) {
                await toggleAllFeatures(settings.enabled);
            }
        });

        if (!settings.enabled) toggleSettingsControls(false);

        $("#xiaobaix_sandbox").prop("checked", settings.sandboxMode).on("change", async function () {
            if (!isXiaobaixEnabled) return;
            settings.sandboxMode = $(this).prop("checked");
            saveSettingsDebounced();
        });

        const moduleConfigs = [
            { id: 'xiaobaix_recorded_enabled', key: 'recorded' },
            { id: 'xiaobaix_immersive_enabled', key: 'immersive', init: initImmersiveMode },
            { id: 'xiaobaix_preview_enabled', key: 'preview', init: initMessagePreview },
            { id: 'xiaobaix_script_assistant', key: 'scriptAssistant', init: initScriptAssistant },
            { id: 'scheduled_tasks_enabled', key: 'tasks', init: initTasks },
            { id: 'xiaobaix_template_enabled', key: 'templateEditor', init: initTemplateEditor },
            { id: 'xiaobaix_fourth_wall_enabled', key: 'fourthWall', init: initFourthWall },
            { id: 'xiaobaix_variables_panel_enabled', key: 'variablesPanel', init: initVariablesPanel },
            { id: 'xiaobaix_variables_core_enabled', key: 'variablesCore', init: initVariablesCore },
            { id: 'xiaobaix_story_summary_enabled', key: 'storySummary' },
            { id: 'xiaobaix_story_outline_enabled', key: 'storyOutline' },
            { id: 'xiaobaix_novel_draw_enabled', key: 'novelDraw', init: initNovelDraw }
        ];

        moduleConfigs.forEach(({ id, key, init }) => {
            $(`#${id}`).prop("checked", settings[key]?.enabled || false).on("change", async function () {
                if (!isXiaobaixEnabled) return;
                const enabled = $(this).prop('checked');
                if (!enabled && key === 'fourthWall') {
                    try { fourthWallCleanup(); } catch (e) {}
                }
                if (!enabled && key === 'novelDraw') {
                    try { cleanupNovelDraw(); } catch (e) {}
                }
                settings[key] = extension_settings[EXT_ID][key] || {};
                settings[key].enabled = enabled;
                extension_settings[EXT_ID][key] = settings[key];
                saveSettingsDebounced();
                if (moduleCleanupFunctions.has(key)) {
                    moduleCleanupFunctions.get(key)();
                    moduleCleanupFunctions.delete(key);
                }
                if (enabled && init) await init();
                if (key === 'storySummary') {
                    $(document).trigger('xiaobaix:storySummary:toggle', [enabled]);
                }
                if (key === 'storyOutline') {
                    $(document).trigger('xiaobaix:storyOutline:toggle', [enabled]);
                }
            });
        });

        $("#xiaobaix_novel_draw_open_settings").on("click", function () {
            if (!isXiaobaixEnabled) return;
            if (settings.novelDraw?.enabled && window.xiaobaixNovelDraw?.openSettings) {
                window.xiaobaixNovelDraw.openSettings();
            }
        });

        $("#xiaobaix_use_blob").prop("checked", !!settings.useBlob).on("change", async function () {
            if (!isXiaobaixEnabled) return;
            settings.useBlob = $(this).prop("checked");
            saveSettingsDebounced();
        });

        $("#Wrapperiframe").prop("checked", !!settings.wrapperIframe).on("change", async function () {
            if (!isXiaobaixEnabled) return;
            settings.wrapperIframe = $(this).prop("checked");
            saveSettingsDebounced();
            try {
                settings.wrapperIframe
                    ? (!document.getElementById('xb-callgen') && document.head.appendChild(Object.assign(document.createElement('script'), { id: 'xb-callgen', type: 'module', src: `${extensionFolderPath}/bridges/call-generate-service.js` })))
                    : (window.cleanupCallGenerateHostBridge && window.cleanupCallGenerateHostBridge(), document.getElementById('xb-callgen')?.remove());
            } catch (e) {}
        });

        $("#xiaobaix_render_enabled").prop("checked", settings.renderEnabled !== false).on("change", async function () {
            if (!isXiaobaixEnabled) return;
            const wasEnabled = settings.renderEnabled !== false;
            settings.renderEnabled = $(this).prop("checked");
            saveSettingsDebounced();
            if (!settings.renderEnabled && wasEnabled) {
                cleanupRenderer();
            } else if (settings.renderEnabled && !wasEnabled) {
            	 initRenderer();
                setTimeout(() => processExistingMessages(), 100);
            }
        });

        const normalizeMaxRendered = (raw) => {
            let v = parseInt(raw, 10);
            if (!Number.isFinite(v) || v < 1) v = 1;
            if (v > 9999) v = 9999;
            return v;
        };

        $("#xiaobaix_max_rendered")
            .val(Number.isFinite(settings.maxRenderedMessages) ? settings.maxRenderedMessages : 5)
            .on("input change", function () {
                if (!isXiaobaixEnabled) return;
                const v = normalizeMaxRendered($(this).val());
                $(this).val(v);
                settings.maxRenderedMessages = v;
                saveSettingsDebounced();
                try { shrinkRenderedWindowFull(); } catch (e) {}
            });

        $(document).off('click.xbreset', '#xiaobaix_reset_btn').on('click.xbreset', '#xiaobaix_reset_btn', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const MAP = {
                recorded: 'xiaobaix_recorded_enabled',
                immersive: 'xiaobaix_immersive_enabled',
                preview: 'xiaobaix_preview_enabled',
                scriptAssistant: 'xiaobaix_script_assistant',
                tasks: 'scheduled_tasks_enabled',
                templateEditor: 'xiaobaix_template_enabled',
                fourthWall: 'xiaobaix_fourth_wall_enabled',
                variablesPanel: 'xiaobaix_variables_panel_enabled',
                variablesCore: 'xiaobaix_variables_core_enabled',
                novelDraw: 'xiaobaix_novel_draw_enabled'
            };
            const ON = ['templateEditor', 'tasks', 'variablesCore', 'audio', 'storySummary', 'recorded'];
            const OFF = ['preview', 'scriptAssistant', 'immersive', 'variablesPanel', 'fourthWall', 'storyOutline', 'novelDraw'];
            function setChecked(id, val) {
                const el = document.getElementById(id);
                if (el) {
                    el.checked = !!val;
                    try { $(el).trigger('change'); } catch {}
                }
            }
            ON.forEach(k => setChecked(MAP[k], true));
            OFF.forEach(k => setChecked(MAP[k], false));
            setChecked('xiaobaix_sandbox', false);
            setChecked('xiaobaix_use_blob', false);
            setChecked('Wrapperiframe', true);
            try { saveSettingsDebounced(); } catch (e) {}
        });
    } catch (err) {}
}

function setupDebugButtonInSettings() {
    try {
        if (document.getElementById('xiaobaix-debug-btn')) return;
        const enableCheckbox = document.getElementById('xiaobaix_enabled');
        if (!enableCheckbox) {
            setTimeout(setupDebugButtonInSettings, 800);
            return;
        }
        const row = enableCheckbox.closest('.flex-container') || enableCheckbox.parentElement;
        if (!row) return;

        const btn = document.createElement('div');
        btn.id = 'xiaobaix-debug-btn';
        btn.className = 'menu_button';
        btn.title = '切换调试监控';
        btn.tabIndex = 0;
        btn.style.marginLeft = 'auto';
        btn.style.whiteSpace = 'nowrap';
        btn.innerHTML = '<span class="dbg-light"></span><span>监控</span>';

        const onActivate = async () => {
            try {
                const mod = await import('./modules/debug-panel/debug-panel.js');
                if (mod?.toggleDebugPanel) await mod.toggleDebugPanel();
            } catch (e) {}
        };
        btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onActivate(); });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onActivate(); }
        });

        row.appendChild(btn);
    } catch (e) {}
}

function setupMenuTabs() {
    $(document).on('click', '.menu-tab', function () {
        const targetId = $(this).attr('data-target');
        $('.menu-tab').removeClass('active');
        $('.settings-section').hide();
        $(this).addClass('active');
        $('.' + targetId).show();
    });
    setTimeout(() => {
        $('.js-memory').show();
        $('.task, .instructions').hide();
        $('.menu-tab[data-target="js-memory"]').addClass('active');
        $('.menu-tab[data-target="task"], .menu-tab[data-target="instructions"]').removeClass('active');
    }, 300);
}

window.processExistingMessages = processExistingMessages;
window.renderHtmlInIframe = renderHtmlInIframe;
window.registerModuleCleanup = registerModuleCleanup;
window.updateLittleWhiteBoxExtension = updateLittleWhiteBoxExtension;
window.removeAllUpdateNotices = removeAllUpdateNotices;

jQuery(async () => {
    try {
        cleanupDeprecatedData();
        isXiaobaixEnabled = settings.enabled;
        window.isXiaobaixEnabled = isXiaobaixEnabled;

        if (!document.getElementById('xiaobaix-skeleton-style')) {
            const skelStyle = document.createElement('style');
            skelStyle.id = 'xiaobaix-skeleton-style';
            skelStyle.textContent = `.xiaobaix-iframe-wrapper{position:relative}`;
            document.head.appendChild(skelStyle);
        }

        const response = await fetch(`${extensionFolderPath}/style.css`);
        const styleElement = document.createElement('style');
        styleElement.textContent = await response.text();
        document.head.appendChild(styleElement);

        await setupSettings();

        try { initControlAudio(); } catch (e) {}

        if (isXiaobaixEnabled) {
            initRenderer();
        }

        try {
            if (isXiaobaixEnabled && settings.wrapperIframe && !document.getElementById('xb-callgen'))
                document.head.appendChild(Object.assign(document.createElement('script'), { id: 'xb-callgen', type: 'module', src: `${extensionFolderPath}/bridges/call-generate-service.js` }));
        } catch (e) {}

        try {
            if (isXiaobaixEnabled && !document.getElementById('xb-worldbook'))
                document.head.appendChild(Object.assign(document.createElement('script'), { id: 'xb-worldbook', type: 'module', src: `${extensionFolderPath}/bridges/worldbook-bridge.js` }));
        } catch (e) {}

        eventSource.on(event_types.APP_READY, () => {
            setTimeout(performExtensionUpdateCheck, 2000);
        });

        if (isXiaobaixEnabled) {
            try { initVarCommands(); } catch (e) {}
            try { initVareventEditor(); } catch (e) {}

            if (settings.tasks?.enabled) {
                try { await initTasks(); } catch (e) { console.error('[Tasks] Init failed:', e); }
            }

            const moduleInits = [
                { condition: settings.scriptAssistant?.enabled, init: initScriptAssistant },
                { condition: settings.immersive?.enabled, init: initImmersiveMode },
                { condition: settings.templateEditor?.enabled, init: initTemplateEditor },
                { condition: settings.fourthWall?.enabled, init: initFourthWall },
                { condition: settings.variablesPanel?.enabled, init: initVariablesPanel },
                { condition: settings.variablesCore?.enabled, init: initVariablesCore },
                { condition: settings.novelDraw?.enabled, init: initNovelDraw },
                { condition: true, init: initStreamingGeneration },
                { condition: true, init: initButtonCollapse }
            ];
            moduleInits.forEach(({ condition, init }) => { if (condition) init(); });

            if (settings.preview?.enabled || settings.recorded?.enabled) {
                setTimeout(initMessagePreview, 1500);
            }
        }

        setTimeout(setupMenuTabs, 500);

        setTimeout(() => {
            if (window.messagePreviewCleanup) {
                registerModuleCleanup('messagePreview', window.messagePreviewCleanup);
            }
        }, 2000);

        setInterval(() => {
            if (isXiaobaixEnabled) processExistingMessages();
        }, 30000);
    } catch (err) {}
});

export { executeSlashCommand };
