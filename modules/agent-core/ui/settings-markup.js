function escapeHtml(text = '') {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildPresetActionIcon(name) {
    const paths = {
        add: '<path d="M12 5v14" /><path d="M5 12h14" />',
        rename: '<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />',
        save: '<path d="M5 21h14a1 1 0 0 0 1-1V7.5L16.5 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" /><path d="M8 21v-7h8v7" /><path d="M8 4v5h7" />',
        saving: '<path class="xb-assistant-save-spinner" d="M12 3a9 9 0 1 1-8.2 5.3" />',
        success: '<path d="M20 6 9 17l-5-5" />',
        error: '<path d="M18 6 6 18" /><path d="M6 6l12 12" />',
        delete: '<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`;
}

function getAgentConfigSaveIconName(configSave = {}) {
    const status = String(configSave?.status || 'idle');
    if (status === 'saving') {return 'saving';}
    if (status === 'success') {return 'success';}
    if (status === 'error') {return 'error';}
    return 'save';
}

export function getAgentConfigSaveButtonState(configSave = {}) {
    const status = String(configSave?.status || 'idle');
    if (status === 'saving') {
        return {
            className: 'xb-assistant-save-button is-saving',
            title: '正在保存配置',
        };
    }
    if (status === 'success') {
        return {
            className: 'xb-assistant-save-button is-success',
            title: '配置已保存',
        };
    }
    if (status === 'error') {
        return {
            className: 'xb-assistant-save-button is-error',
            title: escapeHtml(configSave?.error || '保存失败'),
        };
    }
    return {
        className: 'xb-assistant-save-button',
        title: '保存配置',
    };
}

export function buildAgentSettingsPanelMarkup(options = {}) {
    const {
        configSave = {},
        runtimeText = '',
        inlineToastText = '',
        showInlineToast = true,
        showAssistantPermissions = true,
        showDelegateSettings = true,
        activePage = 'main',
        delegatePresetHint = 'DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。',
        isBusy = false,
        canDeletePreset = true,
    } = options;
    const saveButton = getAgentConfigSaveButtonState(configSave);
    const saveIcon = getAgentConfigSaveIconName(configSave);
    const saveDisabled = isBusy || String(configSave?.status || '') === 'saving' ? 'disabled' : '';
    const deleteDisabled = isBusy || !canDeletePreset ? 'disabled' : '';
    const normalizedPage = activePage === 'delegate' ? 'delegate' : 'main';
    const mainActive = normalizedPage === 'main';
    const delegateActive = normalizedPage === 'delegate';
    const assistantPermissionMarkup = showAssistantPermissions ? `
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>` : '';
    const tabsMarkup = showDelegateSettings ? `
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${mainActive ? 'is-active' : ''}" data-config-page="main" role="tab" aria-selected="${mainActive ? 'true' : 'false'}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${delegateActive ? 'is-active' : ''}" data-config-page="delegate" role="tab" aria-selected="${delegateActive ? 'true' : 'false'}">分身 API</button>
            </div>` : '';
    const delegatePageMarkup = showDelegateSettings ? `
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${delegateActive ? '' : 'hidden'}>
                <p class="xb-assistant-config-note">${escapeHtml(delegatePresetHint)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${saveButton.className}" title="${saveButton.title}" aria-label="${saveButton.title}" ${saveDisabled}>${buildPresetActionIcon(saveIcon)}</button>
                    </div>
                </div>
                <label>
                    <span>Provider</span>
                    <select id="xb-assistant-delegate-provider">
                        <option value="openai-responses">OpenAI Responses</option>
                        <option value="openai-compatible">OpenAI 兼容</option>
                        <option value="sillytavern-openai-compatible">酒馆 OpenAI 兼容</option>
                        <option value="sillytavern-claude">酒馆 Claude</option>
                        <option value="sillytavern-google">酒馆 Google AI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google AI</option>
                    </select>
                </label>
                <label>
                    <span>Base URL</span>
                    <input id="xb-assistant-delegate-base-url" type="text" />
                </label>
                <label>
                    <span>API Key</span>
                    <div class="xb-assistant-inline-input">
                        <input id="xb-assistant-delegate-api-key" type="password" />
                        <button id="xb-assistant-delegate-toggle-key" type="button" class="secondary ghost">显示</button>
                    </div>
                </label>
                <label>
                    <span>Model</span>
                    <input id="xb-assistant-delegate-model" type="text" />
                </label>
                <div class="xb-assistant-inline-input xb-assistant-model-row">
                    <label class="xb-assistant-grow">
                        <span>已拉取模型</span>
                        <select id="xb-assistant-delegate-model-pulled">
                            <option value="">手动填写</option>
                        </select>
                    </label>
                    <button id="xb-assistant-delegate-pull-models" type="button" class="secondary" ${isBusy ? 'disabled' : ''}>拉取模型</button>
                </div>
                <div class="xb-assistant-inline-status" id="xb-assistant-delegate-model-pull-status" aria-live="polite" hidden></div>
                <div class="xb-assistant-temperature-row">
                    <label>
                        <span>温度</span>
                        <input id="xb-assistant-delegate-temperature" type="number" min="0" max="2" step="0.05" />
                    </label>
                    <label class="xb-assistant-checkbox-row">
                        <span>允许传参</span>
                        <span class="xb-assistant-checkbox-control">
                            <input id="xb-assistant-delegate-send-temperature" type="checkbox" />
                        </span>
                    </label>
                </div>
                <label id="xb-assistant-delegate-tool-mode-wrap">
                    <span>Tool 调用格式</span>
                    <select id="xb-assistant-delegate-tool-mode"></select>
                </label>
                <label class="xb-assistant-checkbox-row">
                    <span>
                        Reasoning参数
                        <small>需 API 支持，否则报错</small>
                    </span>
                    <span class="xb-assistant-checkbox-control">
                        <input id="xb-assistant-delegate-reasoning-enabled" type="checkbox" />
                        <span>开启</span>
                    </span>
                </label>
                <label id="xb-assistant-delegate-reasoning-effort-wrap">
                    <span>思考强度</span>
                    <select id="xb-assistant-delegate-reasoning-effort"></select>
                </label>
            </div>` : '';

    return `
        <section class="xb-assistant-config">
            ${tabsMarkup}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${mainActive ? '' : 'hidden'}>
            <div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${isBusy ? 'disabled' : ''}>${buildPresetActionIcon('add')}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${isBusy ? 'disabled' : ''}>${buildPresetActionIcon('rename')}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${saveButton.className}" title="${saveButton.title}" aria-label="${saveButton.title}" ${saveDisabled}>${buildPresetActionIcon(saveIcon)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${deleteDisabled}>${buildPresetActionIcon('delete')}</button>
                </div>
            </div>
            <label>
                <span>Provider</span>
                <select id="xb-assistant-provider">
                    <option value="openai-responses">OpenAI Responses</option>
                    <option value="openai-compatible">OpenAI 兼容</option>
                    <option value="sillytavern-openai-compatible">酒馆 OpenAI 兼容</option>
                    <option value="sillytavern-claude">酒馆 Claude</option>
                    <option value="sillytavern-google">酒馆 Google AI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google AI</option>
                </select>
            </label>
            <label>
                <span>Base URL</span>
                <input id="xb-assistant-base-url" type="text" />
            </label>
            <label>
                <span>API Key</span>
                <div class="xb-assistant-inline-input">
                    <input id="xb-assistant-api-key" type="password" />
                    <button id="xb-assistant-toggle-key" type="button" class="secondary ghost">显示</button>
                </div>
            </label>
            <label>
                <span>Model</span>
                <input id="xb-assistant-model" type="text" />
            </label>
            <div class="xb-assistant-inline-input xb-assistant-model-row">
                <label class="xb-assistant-grow">
                    <span>已拉取模型</span>
                    <select id="xb-assistant-model-pulled">
                        <option value="">手动填写</option>
                    </select>
                </label>
                <button id="xb-assistant-pull-models" type="button" class="secondary" ${isBusy ? 'disabled' : ''}>拉取模型</button>
            </div>
            <div class="xb-assistant-inline-status" id="xb-assistant-model-pull-status" aria-live="polite" hidden></div>
            <div class="xb-assistant-temperature-row">
                <label>
                    <span>温度</span>
                    <input id="xb-assistant-temperature" type="number" min="0" max="2" step="0.05" />
                </label>
                <label class="xb-assistant-checkbox-row">
                    <span>允许传参</span>
                    <span class="xb-assistant-checkbox-control">
                        <input id="xb-assistant-send-temperature" type="checkbox" />
                    </span>
                </label>
            </div>
            <label>
                <span>Tavily API Key（全局）</span>
                <div class="xb-assistant-inline-input">
                    <input id="xb-assistant-tavily-api-key" type="password" />
                    <button id="xb-assistant-toggle-tavily-key" type="button" class="secondary ghost">显示</button>
                </div>
            </label>
            <label id="xb-assistant-tool-mode-wrap">
                <span>Tool 调用格式</span>
                <select id="xb-assistant-tool-mode"></select>
            </label>
            ${assistantPermissionMarkup}
            <label class="xb-assistant-checkbox-row">
                <span>
                    Reasoning参数
                    <small>需 API 支持，否则报错</small>
                </span>
                <span class="xb-assistant-checkbox-control">
                    <input id="xb-assistant-reasoning-enabled" type="checkbox" />
                    <span>开启</span>
                </span>
            </label>
            <label id="xb-assistant-reasoning-effort-wrap">
                <span>思考强度</span>
                <select id="xb-assistant-reasoning-effort"></select>
            </label>
            </div>
            ${delegatePageMarkup}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${escapeHtml(runtimeText)}</div>
            ${showInlineToast ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${escapeHtml(inlineToastText)}</div>` : ''}
        </section>
    `;
}
