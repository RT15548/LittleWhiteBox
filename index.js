import { extension_settings, getContext } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";
import { statsTracker } from "./relationship-metrics.js";
import { initTasks } from "./scheduledTasks.js";
import { initScriptAssistant } from "./scriptAssistant.js";
import { initMessagePreview, addHistoryButtonsDebounced } from "./message-preview.js";
import { initImmersiveMode } from "./immersive-mode.js";
import { initTemplateEditor, templateSettings } from "./template-editor.js";
import { initWallhavenBackground } from "./wallhaven-background.js";

const EXT_ID = "LittleWhiteBox";
const EXT_NAME = "小白X";
const MODULE_NAME = "xiaobaix-memory";
const extensionFolderPath = `scripts/extensions/third-party/${EXT_ID}`;

extension_settings[EXT_ID] = extension_settings[EXT_ID] || {
    enabled: true,
    sandboxMode: false,
    memoryEnabled: true,
    memoryInjectEnabled: true,
    memoryInjectDepth: 2
};

const settings = extension_settings[EXT_ID];
let isXiaobaixEnabled = settings.enabled;
let moduleInstances = { statsTracker: null };
let savedSettings = {};
let globalEventListeners = [];
let globalTimers = [];
let moduleCleanupFunctions = new Map();

window.isXiaobaixEnabled = isXiaobaixEnabled;

function registerModuleCleanup(moduleName, cleanupFunction) {
    moduleCleanupFunctions.set(moduleName, cleanupFunction);
}

function addGlobalEventListener(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    globalEventListeners.push({ target, event, handler, options });
}

function addGlobalTimer(timerId) {
    globalTimers.push(timerId);
}

function cleanupAllResources() {
    globalEventListeners.forEach(({ target, event, handler, options, isEventSource }) => {
        try {
            if (isEventSource) {
                if (target.removeListener) {
                    target.removeListener(event, handler);
                }
            } else {
                target.removeEventListener(event, handler, options);
            }
        } catch (e) {
            console.warn('[小白X] 清理事件監聽器失敗:', e);
        }
    });
    globalEventListeners.length = 0;

    globalTimers.forEach(timerId => {
        try {
            clearTimeout(timerId);
            clearInterval(timerId);
        } catch (e) {
            console.warn('[小白X] 清理計時器失敗:', e);
        }
    });
    globalTimers.length = 0;

    moduleCleanupFunctions.forEach((cleanupFn, moduleName) => {
        try {
            cleanupFn();
        } catch (e) {
            console.warn(`[小白X] 清理模塊 ${moduleName} 失敗:`, e);
        }
    });

    document.querySelectorAll('iframe.xiaobaix-iframe').forEach(iframe => iframe.remove());
    document.querySelectorAll('.xiaobaix-iframe-wrapper').forEach(wrapper => wrapper.remove());

    document.querySelectorAll('.memory-button, .mes_history_preview').forEach(btn => btn.remove());
    document.querySelectorAll('#message_preview_btn').forEach(btn => {
        if (btn instanceof HTMLElement) {
            btn.style.display = 'none';
        }
    });
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

function generateUniqueId() {
    return `xiaobaix-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function shouldRenderContent(content) {
    if (!content || typeof content !== 'string') return false;
    const htmlTags = ['<html', '<!DOCTYPE', '<script'];
    return htmlTags.some(tag => content.includes(tag));
}

function createIframeApi() {
    return `
    const originalGetElementById = document.getElementById;
    document.getElementById = function(id) {
        try {
            return originalGetElementById.call(document, id);
        } catch(e) {
            console.warn('Element not found:', id);
            return null;
        }
    };

    window.STBridge = {
        sendMessageToST: function(type, data = {}) {
            try {
                window.parent.postMessage({
                    source: 'xiaobaix-iframe',
                    type: type,
                    ...data
                }, '*');
            } catch(e) {}
        },

        updateHeight: function() {
            try {
                const height = document.body.scrollHeight;
                if (height > 0) {
                    this.sendMessageToST('resize', { height });
                }
            } catch(e) {}
        }
    };

    window.STscript = async function(command) {
        return new Promise((resolve, reject) => {
            try {
                const id = Date.now().toString() + Math.random().toString(36).substring(2);

                window.STBridge.sendMessageToST('runCommand', { command, id });

                const listener = function(event) {
                    if (!event.data || event.data.source !== 'xiaobaix-host') return;

                    const data = event.data;
                    if ((data.type === 'commandResult' || data.type === 'commandError') && data.id === id) {
                        window.removeEventListener('message', listener);

                        if (data.type === 'commandResult') {
                            resolve(data.result);
                        } else {
                            reject(new Error(data.error));
                        }
                    }
                };

                window.addEventListener('message', listener);

                setTimeout(() => {
                    window.removeEventListener('message', listener);
                    reject(new Error('Command timeout'));
                }, 180000);
            } catch(e) {
                reject(e);
            }
        });
    };

    function setupAutoResize() {
        window.STBridge.updateHeight();

        window.addEventListener('resize', () => window.STBridge.updateHeight());
        window.addEventListener('load', () => window.STBridge.updateHeight());

        try {
            const observer = new MutationObserver(() => window.STBridge.updateHeight());
            observer.observe(document.body, {
                attributes: true,
                childList: true,
                subtree: true,
                characterData: true
            });
        } catch(e) {}

        setInterval(() => window.STBridge.updateHeight(), 1000);

        window.addEventListener('load', function() {
            Array.from(document.images).forEach(img => {
                if (!img.complete) {
                    img.addEventListener('load', () => window.STBridge.updateHeight());
                    img.addEventListener('error', () => window.STBridge.updateHeight());
                }
            });
        });
    }

    function setupSecurity() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.href && link.href.startsWith('http')) {
                if (link.target !== '_blank') {
                    e.preventDefault();
                    window.open(link.href, '_blank');
                }
            }
        });
    }

    window.addEventListener('error', function(e) {
        console.warn('Iframe error caught:', e.message);
        return true;
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setupAutoResize();
            setupSecurity();
        });
    } else {
        setupAutoResize();
        setupSecurity();
    }
    `;
}

async function executeSlashCommand(command) {
    try {
        if (!command) return { error: "命令为空" };
        if (!command.startsWith('/')) command = '/' + command;

        const { executeSlashCommands, substituteParams } = getContext();
        if (typeof executeSlashCommands !== 'function') {
            throw new Error("executeSlashCommands 函数不可用");
        }

        command = substituteParams(command);
        const result = await executeSlashCommands(command, true);

        if (result && typeof result === 'object' && result.pipe !== undefined) {
            const pipeValue = result.pipe;
            if (typeof pipeValue === 'string') {
                try { return JSON.parse(pipeValue); } catch { return pipeValue; }
            }
            return pipeValue;
        }

        if (typeof result === 'string' && result.trim()) {
            try { return JSON.parse(result); } catch { return result; }
        }

        return result === undefined ? "" : result;
    } catch (err) {
        throw err;
    }
}

function handleIframeMessage(event) {
    if (!event.data || event.data.source !== 'xiaobaix-iframe') return;

    const { type, height, command, id } = event.data;

    if (type === 'resize') {
        const iframes = document.querySelectorAll('iframe.xiaobaix-iframe');
        for (const iframe of iframes) {
            if (iframe.contentWindow === event.source) {
                iframe.style.height = `${height}px`;
                break;
            }
        }
    } else if (type === 'runCommand') {
        executeSlashCommand(command)
            .then(result => event.source.postMessage({
                source: 'xiaobaix-host', type: 'commandResult', id, result
            }, '*'))
            .catch(err => event.source.postMessage({
                source: 'xiaobaix-host', type: 'commandError', id, error: err.message || String(err)
            }, '*'));
    }
}

function prepareHtmlContent(htmlContent) {
    const apiScript = `<script>${createIframeApi()}</script>`;

    if (htmlContent.includes('<html') && htmlContent.includes('</html>')) {
        return htmlContent.replace('</head>', `${apiScript}</head>`);
    }

    const baseTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 10px; font-family: inherit; color: inherit; background: transparent; }
    </style>
    ${apiScript}
</head>`;

    if (htmlContent.includes('<body') && htmlContent.includes('</body>')) {
        return baseTemplate + htmlContent + '</html>';
    }

    return baseTemplate + `<body>${htmlContent}</body></html>`;
}

function renderHtmlInIframe(htmlContent, container, preElement) {
    try {
        const iframe = document.createElement('iframe');
        iframe.id = generateUniqueId();
        iframe.className = 'xiaobaix-iframe';
        iframe.style.cssText = `
            width: 100%; border: none; background: transparent; overflow: hidden;
            height: 0; margin: 0; padding: 0; display: block;
        `;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');

        if (settings.sandboxMode) {
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'xiaobaix-iframe-wrapper';
        wrapper.style.cssText = 'margin: 10px 0;';


        preElement.parentNode.insertBefore(wrapper, preElement);

        wrapper.appendChild(iframe);

        preElement.style.display = 'none';

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();

        try {
            iframeDoc.write(prepareHtmlContent(htmlContent));
        } catch (writeError) {
            console.warn('[小白X] iframe 内容写入警告:', writeError.message);
            iframeDoc.write(`<html><body><p>内容渲染出现问题，请检查HTML格式</p></body></html>`);
        }

        iframeDoc.close();

        return iframe;
    } catch (err) {
        console.error('[小白X] 渲染iframe失败:', err);
        return null;
    }
}

function toggleSettingsControls(enabled) {
    const controls = [
        'xiaobaix_sandbox', 'xiaobaix_memory_enabled', 'xiaobaix_memory_inject',
        'xiaobaix_memory_depth', 'xiaobaix_recorded_enabled', 'xiaobaix_preview_enabled',
        'xiaobaix_script_assistant', 'scheduled_tasks_enabled', 'xiaobaix_template_enabled',
        'wallhaven_enabled', 'wallhaven_bg_mode', 'wallhaven_category',
        'wallhaven_purity', 'wallhaven_opacity',
        'xiaobaix_immersive_enabled'
    ];

    controls.forEach(id => {
        $(`#${id}`).prop('disabled', !enabled).toggleClass('disabled-control', !enabled);
    });

    const styleId = 'xiaobaix-disabled-style';
    if (!enabled && !document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .disabled-control, .disabled-control + label {
                opacity: 0.4 !important; pointer-events: none !important; cursor: not-allowed !important;
            }
        `;
        document.head.appendChild(style);
    } else if (enabled) {
        document.getElementById(styleId)?.remove();
    }
}

function saveCurrentSettings() {
    savedSettings = {
        sandboxMode: settings.sandboxMode,
        memoryEnabled: settings.memoryEnabled,
        memoryInjectEnabled: settings.memoryInjectEnabled,
        memoryInjectDepth: settings.memoryInjectDepth,
        recordedEnabled: extension_settings[EXT_ID].recorded?.enabled,
        previewEnabled: extension_settings[EXT_ID].preview?.enabled,
        scriptAssistantEnabled: extension_settings[EXT_ID].scriptAssistant?.enabled,
        scheduledTasksEnabled: extension_settings[EXT_ID].tasks?.enabled,
        templateEnabled: extension_settings[EXT_ID].templateEditor?.enabled
    };
}

function restoreSettings() {
    if (savedSettings.sandboxMode !== null) {
        settings.sandboxMode = savedSettings.sandboxMode;
        $("#xiaobaix_sandbox").prop("checked", savedSettings.sandboxMode);
    }
    if (savedSettings.memoryEnabled !== null) {
        settings.memoryEnabled = savedSettings.memoryEnabled;
        $("#xiaobaix_memory_enabled").prop("checked", savedSettings.memoryEnabled);
    }
    if (savedSettings.memoryInjectEnabled !== null) {
        settings.memoryInjectEnabled = savedSettings.memoryInjectEnabled;
        $("#xiaobaix_memory_inject").prop("checked", savedSettings.memoryInjectEnabled);
    }
    if (savedSettings.memoryInjectDepth !== null) {
        settings.memoryInjectDepth = savedSettings.memoryInjectDepth;
        $("#xiaobaix_memory_depth").val(savedSettings.memoryInjectDepth);
    }

    const moduleSettings = [
        { key: 'recordedEnabled', module: 'recorded', control: 'xiaobaix_recorded_enabled' },
        { key: 'previewEnabled', module: 'preview', control: 'xiaobaix_preview_enabled' },
        { key: 'scriptAssistantEnabled', module: 'scriptAssistant', control: 'xiaobaix_script_assistant' },
        { key: 'scheduledTasksEnabled', module: 'tasks', control: 'scheduled_tasks_enabled' },
        { key: 'templateEnabled', module: 'templateEditor', control: 'xiaobaix_template_enabled' }
    ];

    moduleSettings.forEach(({ key, module, control }) => {
        if (savedSettings[key] !== null) {
            if (!extension_settings[EXT_ID][module]) extension_settings[EXT_ID][module] = {};
            extension_settings[EXT_ID][module].enabled = savedSettings[key];
            $(`#${control}`).prop("checked", savedSettings[key]);
        }
    });
}

function toggleAllFeatures(enabled) {
    if (enabled) {
        toggleSettingsControls(true);
        restoreSettings();
        saveSettingsDebounced();
        setTimeout(() => processExistingMessages(), 100);
        setupEventListeners();

        if (settings.memoryEnabled && moduleInstances.statsTracker?.updateMemoryPrompt) {
            setTimeout(() => moduleInstances.statsTracker.updateMemoryPrompt(), 200);
        }
        if (extension_settings[EXT_ID].scriptAssistant?.enabled && window.injectScriptDocs) {
            setTimeout(() => window.injectScriptDocs(), 300);
        }
        if (extension_settings[EXT_ID].preview?.enabled) {
            setTimeout(() => {
                document.querySelectorAll('#message_preview_btn').forEach(btn => btn.style.display = '');
            }, 400);
        }
        if (extension_settings[EXT_ID].recorded?.enabled) {
            setTimeout(() => addHistoryButtonsDebounced(), 500);
        }

        document.dispatchEvent(new CustomEvent('xiaobaixEnabledChanged', {
            detail: { enabled: true }
        }));
    } else {
        saveCurrentSettings();

        cleanupAllResources();

        if (window.messagePreviewCleanup) {
            try {
                window.messagePreviewCleanup();
            } catch (e) {
                console.warn('[小白X] 清理消息预览模块失败:', e);
            }
        }

        Object.assign(settings, {
            sandboxMode: false, memoryEnabled: false, memoryInjectEnabled: false
        });

        ['recorded', 'preview', 'scriptAssistant', 'tasks', 'immersive', 'templateEditor', 'wallhaven'].forEach(module => {
            if (!extension_settings[EXT_ID][module]) extension_settings[EXT_ID][module] = {};
            extension_settings[EXT_ID][module].enabled = false;
        });

        ["xiaobaix_sandbox", "xiaobaix_memory_enabled", "xiaobaix_memory_inject",
         "xiaobaix_recorded_enabled", "xiaobaix_preview_enabled", "xiaobaix_script_assistant",
         "scheduled_tasks_enabled", "xiaobaix_template_enabled", "wallhaven_enabled",
         "xiaobaix_immersive_enabled"].forEach(id => $(`#${id}`).prop("checked", false));

        toggleSettingsControls(false);

        document.querySelectorAll('pre[data-xiaobaix-bound="true"]').forEach(pre => {
            pre.style.display = '';
            delete pre.dataset.xiaobaixBound;
        });

        moduleInstances.statsTracker?.removeMemoryPrompt?.();
        window.removeScriptDocs?.();

        document.dispatchEvent(new CustomEvent('xiaobaixEnabledChanged', {
            detail: { enabled: false }
        }));
    }
}

function processCodeBlocks(messageElement) {
    if (!settings.enabled || !isXiaobaixEnabled) return;

    try {
        const codeBlocks = messageElement.querySelectorAll('pre > code');
        codeBlocks.forEach(codeBlock => {
            const preElement = codeBlock.parentElement;
            if (preElement.dataset.xiaobaixBound === 'true') return;

            const oldIframe = preElement.parentNode.querySelector('iframe.xiaobaix-iframe');
            if (oldIframe) oldIframe.remove();
            const oldWrapper = preElement.parentNode.querySelector('.xiaobaix-iframe-wrapper');
            if (oldWrapper) oldWrapper.remove();

            preElement.dataset.xiaobaixBound = 'true';
            const codeContent = codeBlock.textContent || '';

            if (shouldRenderContent(codeContent)) {
                renderHtmlInIframe(codeContent, preElement.parentNode, preElement);
            }
        });
    } catch (err) {}
}

function processExistingMessages() {
    if (!settings.enabled || !isXiaobaixEnabled) return;

    document.querySelectorAll('.mes_text').forEach(processCodeBlocks);

    if (settings.memoryEnabled) {
        $('#chat .mes').each(function() {
            const messageId = $(this).attr('mesid');
            if (messageId) statsTracker.addMemoryButtonToMessage(messageId);
        });
    }

    if (templateSettings.get().enabled) {
    }
}

async function setupSettings() {
    try {
        const settingsContainer = await waitForElement("#extensions_settings");
        if (!settingsContainer) return;

        const response = await fetch(`${extensionFolderPath}/settings.html`);
        const settingsHtml = await response.text();
        $(settingsContainer).append(settingsHtml);

        $("#xiaobaix_enabled").prop("checked", settings.enabled).on("change", function() {
            const wasEnabled = settings.enabled;
            settings.enabled = $(this).prop("checked");
            isXiaobaixEnabled = settings.enabled;
            window.isXiaobaixEnabled = isXiaobaixEnabled;
            saveSettingsDebounced();

            if (settings.enabled !== wasEnabled) {
                toggleAllFeatures(settings.enabled);
            }
        });

        if (!settings.enabled) toggleSettingsControls(false);

        $("#xiaobaix_sandbox").prop("checked", settings.sandboxMode).on("change", function() {
            if (!isXiaobaixEnabled) return;
            settings.sandboxMode = $(this).prop("checked");
            saveSettingsDebounced();
        });

        $("#xiaobaix_memory_enabled").prop("checked", settings.memoryEnabled).on("change", function() {
            if (!isXiaobaixEnabled) return;
            settings.memoryEnabled = $(this).prop("checked");
            saveSettingsDebounced();
            if (!settings.memoryEnabled) {
                $('.memory-button').remove();
                statsTracker.removeMemoryPrompt();
            } else if (settings.memoryEnabled && settings.memoryInjectEnabled) {
                statsTracker.updateMemoryPrompt();
            }
        });

        $("#xiaobaix_memory_inject").prop("checked", settings.memoryInjectEnabled).on("change", function() {
            if (!isXiaobaixEnabled) return;
            settings.memoryInjectEnabled = $(this).prop("checked");
            saveSettingsDebounced();

            statsTracker.removeMemoryPrompt();

            if (settings.memoryEnabled && settings.memoryInjectEnabled) {
                statsTracker.updateMemoryPrompt();
            }
        });

        $("#xiaobaix_memory_depth").val(settings.memoryInjectDepth).on("change", function() {
            if (!isXiaobaixEnabled) return;
            settings.memoryInjectDepth = parseInt($(this).val()) || 2;
            saveSettingsDebounced();

            if (settings.memoryEnabled && settings.memoryInjectEnabled) {
                statsTracker.updateMemoryPrompt();
            }
        });

        $('#xiaobaix_immersive_enabled').on('change', function() {
            if (!isXiaobaixEnabled) return;
            const enabled = $(this).prop('checked');
            extension_settings[EXT_ID].immersive = extension_settings[EXT_ID].immersive || {};
            extension_settings[EXT_ID].immersive.enabled = enabled;
            saveSettingsDebounced();
            if (moduleCleanupFunctions.has('immersiveMode')) {
                moduleCleanupFunctions.get('immersiveMode')();
            }
            if (enabled) {
                initImmersiveMode();
            }
        });

        $('#xiaobaix_preview_enabled').on('change', function() {
            if (!isXiaobaixEnabled) return;
            extension_settings[EXT_ID].preview = extension_settings[EXT_ID].preview || {};
            const enabled = $(this).prop('checked');
            extension_settings[EXT_ID].preview.enabled = enabled;
            saveSettingsDebounced();
            if (moduleCleanupFunctions.has('messagePreview')) {
                moduleCleanupFunctions.get('messagePreview')();
            }
            if (enabled) {
                initMessagePreview();
            }
        });

        $('#xiaobaix_script_assistant').on('change', function() {
            if (!isXiaobaixEnabled) return;
            extension_settings[EXT_ID].scriptAssistant = extension_settings[EXT_ID].scriptAssistant || {};
            const enabled = $(this).prop('checked');
            extension_settings[EXT_ID].scriptAssistant.enabled = enabled;
            saveSettingsDebounced();
            if (moduleCleanupFunctions.has('scriptAssistant')) {
                moduleCleanupFunctions.get('scriptAssistant')();
            }
            if (enabled) {
                initScriptAssistant();
            }
        });

        $('#scheduled_tasks_enabled').on('change', function() {
            if (!isXiaobaixEnabled) return;
            extension_settings[EXT_ID].tasks = extension_settings[EXT_ID].tasks || {};
            const enabled = $(this).prop('checked');
            extension_settings[EXT_ID].tasks.enabled = enabled;
            saveSettingsDebounced();
            if (moduleCleanupFunctions.has('scheduledTasks')) {
                moduleCleanupFunctions.get('scheduledTasks')();
            }
            if (enabled) {
                initTasks();
            }
        });

        $('#xiaobaix_template_enabled').on('change', function() {
            if (!isXiaobaixEnabled) return;
            extension_settings[EXT_ID].templateEditor = extension_settings[EXT_ID].templateEditor || {};
            const enabled = $(this).prop('checked');
            extension_settings[EXT_ID].templateEditor.enabled = enabled;
            saveSettingsDebounced();
            if (moduleCleanupFunctions.has('templateEditor')) {
                moduleCleanupFunctions.get('templateEditor')();
            }
            if (enabled) {
                initTemplateEditor();
            }
        });

        $('#wallhaven_enabled').on('change', function() {
            if (!isXiaobaixEnabled) return;
            extension_settings[EXT_ID].wallhaven = extension_settings[EXT_ID].wallhaven || {};
            const enabled = $(this).prop('checked');
            extension_settings[EXT_ID].wallhaven.enabled = enabled;
            saveSettingsDebounced();
            if (moduleCleanupFunctions.has('wallhavenBackground')) {
                moduleCleanupFunctions.get('wallhavenBackground')();
            }
            if (enabled) {
                initWallhavenBackground();
            }
        });
    } catch (err) {}
}

function setupMenuTabs() {
    $(document).on('click', '.menu-tab', function() {
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

function setupEventListeners() {
    if (!isXiaobaixEnabled) return;

    const { eventSource, event_types } = getContext();

    const handleMessage = async (data, isReceived = false) => {
        if (!settings.enabled || !isXiaobaixEnabled) return;

        setTimeout(async () => {
            const messageId = typeof data === 'object' ? data.messageId : data;
            if (!messageId) return;

            const messageElement = document.querySelector(`div.mes[mesid="${messageId}"] .mes_text`);
            if (!messageElement) return;

            processCodeBlocks(messageElement);

            if (settings.memoryEnabled) {
                statsTracker.addMemoryButtonToMessage(messageId);

                if (isReceived) {
                    await statsTracker.updateStatisticsForNewMessage();
                    $(`.mes[mesid="${messageId}"] .memory-button`).addClass('has-memory');
                }
            }
        }, isReceived ? 300 : 100);
    };

    const messageReceivedHandler = (data) => handleMessage(data, true);
    eventSource.on(event_types.MESSAGE_RECEIVED, messageReceivedHandler);
    globalEventListeners.push({ target: eventSource, event: event_types.MESSAGE_RECEIVED, handler: messageReceivedHandler, isEventSource: true });

    eventSource.on(event_types.USER_MESSAGE_RENDERED, handleMessage);
    globalEventListeners.push({ target: eventSource, event: event_types.USER_MESSAGE_RENDERED, handler: handleMessage, isEventSource: true });

    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, handleMessage);
    globalEventListeners.push({ target: eventSource, event: event_types.CHARACTER_MESSAGE_RENDERED, handler: handleMessage, isEventSource: true });

    if (event_types.MESSAGE_SWIPED) {
        eventSource.on(event_types.MESSAGE_SWIPED, handleMessage);
        globalEventListeners.push({ target: eventSource, event: event_types.MESSAGE_SWIPED, handler: handleMessage, isEventSource: true });
    }
    if (event_types.MESSAGE_EDITED) {
        eventSource.on(event_types.MESSAGE_EDITED, handleMessage);
        globalEventListeners.push({ target: eventSource, event: event_types.MESSAGE_EDITED, handler: handleMessage, isEventSource: true });
    }
    if (event_types.MESSAGE_UPDATED) {
        eventSource.on(event_types.MESSAGE_UPDATED, handleMessage);
        globalEventListeners.push({ target: eventSource, event: event_types.MESSAGE_UPDATED, handler: handleMessage, isEventSource: true });
    }

    const chatChangedHandler = async () => {
        if (!isXiaobaixEnabled) return;

        const timer1 = setTimeout(() => processExistingMessages(), 200);
        addGlobalTimer(timer1);

        if (!settings.memoryEnabled) return;
        const timer2 = setTimeout(async () => {
            try {
                let stats = await executeSlashCommand('/getvar xiaobaix_stats');

                if (!stats || stats === "undefined") {
                    const messagesText = await executeSlashCommand('/messages names=on');
                    if (messagesText) {
                        const newStats = statsTracker.dataManager.createEmptyStats();

                        const messageBlocks = messagesText.split('\n\n');
                        for (const block of messageBlocks) {
                            const colonIndex = block.indexOf(':');
                            if (colonIndex !== -1) {
                                const name = block.substring(0, colonIndex).trim();
                                const content = block.substring(colonIndex + 1).trim();

                                if (name !== getContext().name1 && content) {
                                    statsTracker.textAnalysis.updateStatsFromText(newStats, content, name);
                                }
                            }
                        }

                        await executeSlashCommand(`/setvar key=xiaobaix_stats ${JSON.stringify(newStats)}`);
                        if (settings.memoryInjectEnabled) statsTracker.updateMemoryPrompt();
                    }
                } else if (settings.memoryInjectEnabled) {
                    statsTracker.updateMemoryPrompt();
                }
            } catch (error) {
                console.error('[小白X] 处理聊天历史出错:', error);
            }
        }, 500);
        addGlobalTimer(timer2);
    };

    eventSource.on(event_types.CHAT_CHANGED, chatChangedHandler);
    globalEventListeners.push({ target: eventSource, event: event_types.CHAT_CHANGED, handler: chatChangedHandler, isEventSource: true });

    addGlobalEventListener(window, 'message', handleIframeMessage);
}

window.processExistingMessages = processExistingMessages;
window.renderHtmlInIframe = renderHtmlInIframe;
window.registerModuleCleanup = registerModuleCleanup;
window.addGlobalEventListener = addGlobalEventListener;
window.addGlobalTimer = addGlobalTimer;

jQuery(async () => {
    try {
        isXiaobaixEnabled = settings.enabled;
        window.isXiaobaixEnabled = isXiaobaixEnabled;

        const response = await fetch(`${extensionFolderPath}/style.css`);
        const styleElement = document.createElement('style');
        styleElement.textContent = await response.text();
        document.head.appendChild(styleElement);

        moduleInstances.statsTracker = statsTracker;
        statsTracker.init(EXT_ID, MODULE_NAME, settings, executeSlashCommand);

        await setupSettings();
        setupEventListeners();
        initTasks();
        initScriptAssistant();
        initImmersiveMode();
        initTemplateEditor();
        initWallhavenBackground();

        const timer1 = setTimeout(setupMenuTabs, 500);
        addGlobalTimer(timer1);

        const timer2 = setTimeout(initMessagePreview, 1500);
        addGlobalTimer(timer2);

        setTimeout(() => {
            if (window.messagePreviewCleanup) {
                registerModuleCleanup('messagePreview', window.messagePreviewCleanup);
            }
        }, 2000);
        addGlobalTimer(setTimeout(() => {}, 2000));

        const timer3 = setTimeout(async () => {
            if (isXiaobaixEnabled) {
                processExistingMessages();

                if (settings.memoryEnabled) {
                    const messages = await statsTracker.dataManager.processMessageHistory();
                    if (messages?.length > 0) {
                        const stats = statsTracker.dataManager.createEmptyStats();
                        messages.forEach(message => {
                            statsTracker.textAnalysis.updateStatsFromText(stats, message.content, message.name);
                        });

                        await executeSlashCommand(`/setvar key=xiaobaix_stats ${JSON.stringify(stats)}`);
                        if (settings.memoryInjectEnabled) statsTracker.updateMemoryPrompt();
                    }
                }
            }
        }, 1000);
        addGlobalTimer(timer3);

        const intervalId = setInterval(() => {
            if (isXiaobaixEnabled) processExistingMessages();
        }, 5000);
        addGlobalTimer(intervalId);

    } catch (err) {
        console.error('[小白X] 初始化出错:', err);
    }
});

export { executeSlashCommand };
