import { buildWebSettingsMarkup } from './web-settings.js';
import { buildSamplingSettingsMarkup } from './sampling-settings.js';
function escapeHtml(text = '') {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildModelListAuthMarkup(scope = 'main') {
    const prefix = scope === 'delegate' ? 'xb-assistant-delegate' : 'xb-assistant';
    return `<label id="${prefix}-model-list-auth-wrap" style="display: none">
        <span>模型列表鉴权</span>
        <select id="${prefix}-model-list-auth"></select>
    </label>`;
}

export function buildPresetActionIcon(name) {
    const paths = {
        add: '<path d="M12 5v14" /><path d="M5 12h14" />',
        rename: '<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />',
        save: '<path d="M5 21h14a1 1 0 0 0 1-1V7.5L16.5 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" /><path d="M8 21v-7h8v7" /><path d="M8 4v5h7" />',
        saving: '<path class="xb-assistant-save-spinner" d="M12 3a9 9 0 1 1-8.2 5.3" />',
        success: '<path d="M20 6 9 17l-5-5" />',
        error: '<path d="M18 6 6 18" /><path d="M6 6l12 12" />',
        delete: '<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />',
        // 以下两个只给列表布局的行菜单用
        more: '<circle cx="5" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="19" cy="12" r="1.4" fill="currentColor" />',
        copy: '<rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" />',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`;
}

// 预设列表布局（opt-in：presetLayout: 'list'）。每个预设一行 = 拖动手柄 + 名称按钮（点选）+ “…”菜单。
// 预设本来就以名称为键，所以名称同时用作行 id，一律经 escapeHtml 再进属性 / 文本。
function buildPresetMenuItem(action, label, icon, { disabled = false, danger = false } = {}) {
    return `<button type="button" role="menuitem" class="xb-assistant-preset-menu-item${danger ? ' is-danger' : ''}" data-preset-action="${action}" title="${label}"${disabled ? ' disabled' : ''}>${buildPresetActionIcon(icon)}<span>${label}</span></button>`;
}

export function buildPresetListRowsMarkup({ names = [], selectedName = '', isBusy = false, canDeletePreset = true } = {}) {
    return names.map((rawName) => {
        const name = String(rawName);
        const safe = escapeHtml(name);
        const selected = name === selectedName;
        return `
                <div class="xb-assistant-preset-item${selected ? ' is-selected' : ''}" role="listitem" data-preset-item data-preset-name="${safe}">
                    <span class="xb-assistant-preset-drag" role="button" tabindex="0" data-preset-drag title="拖动调整顺序，也可聚焦后按 ↑ / ↓" aria-label="拖动调整预设 ${safe} 的顺序">⋮⋮</span>
                    <button type="button" class="xb-assistant-preset-name" data-preset-action="select" title="${safe}"${selected ? ' aria-current="true"' : ''}>${safe}</button>
                    <span class="xb-assistant-preset-menu-wrap" data-card-menu>
                        <button type="button" class="xb-assistant-icon-button xb-assistant-preset-menu-button" data-preset-action="menu" title="更多操作" aria-label="更多操作 ${safe}" aria-haspopup="menu" aria-expanded="false">${buildPresetActionIcon('more')}</button>
                        <div class="xb-assistant-preset-menu" role="menu" aria-label="更多操作 ${safe}" hidden>
                            ${buildPresetMenuItem('rename', '重命名', 'rename', { disabled: isBusy })}
                            ${buildPresetMenuItem('duplicate', '复制', 'copy', { disabled: isBusy })}
                            ${buildPresetMenuItem('delete', '删除', 'delete', { disabled: isBusy || !canDeletePreset, danger: true })}
                        </div>
                    </span>
                </div>`;
    }).join('');
}

/** 只同步列表里菜单项的可用状态（忙碌时不可改；只剩一套时不可删），不重绘行。 */
export function syncPresetListControls(root, { isBusy = false, canDeletePreset = true } = {}) {
    ['rename', 'duplicate'].forEach((action) => {
        root?.querySelectorAll?.(`[data-preset-action="${action}"]`)
            ?.forEach?.(item => item.toggleAttribute('disabled', isBusy));
    });
    root?.querySelectorAll?.('[data-preset-action="delete"]')
        ?.forEach?.(item => item.toggleAttribute('disabled', isBusy || !canDeletePreset));
}

function buildPresetListSectionMarkup({ names, selectedName, isBusy, canDeletePreset, saveButton, saveIcon, saveDisabled }) {
    return `<div class="xb-assistant-preset-row is-list">
                <div class="xb-assistant-preset-header">
                    <span class="xb-assistant-preset-title" id="xb-assistant-preset-title">已存预设</span>
                    <input id="xb-assistant-preset-name" type="hidden" />
                    <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                        <button id="xb-assistant-new-preset" type="button" class="xb-assistant-text-button" title="新增预设" aria-label="新增预设" ${isBusy ? 'disabled' : ''}>${buildPresetActionIcon('add')}<span>新建</span></button>
                        <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${saveButton.className}" title="${saveButton.title}" aria-label="${saveButton.title}" ${saveDisabled}>${buildPresetActionIcon(saveIcon)}</button>
                    </div>
                </div>
                <div id="xb-assistant-preset-list" class="xb-assistant-preset-list" role="list" aria-labelledby="xb-assistant-preset-title">${buildPresetListRowsMarkup({ names, selectedName, isBusy, canDeletePreset })}</div>
            </div>`;
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

export function syncAgentSettingsPanelFeedback(root, options = {}) {
    if (!root?.querySelector) return;
    const {
        configSave = {},
        inlineToastText = '',
        isBusy = false,
        canDeletePreset = true,
        configLoadError = '',
    } = options;
    const normalizedLoadError = String(configLoadError || '').trim();
    const saveButton = getAgentConfigSaveButtonState(configSave);
    const saveIcon = getAgentConfigSaveIconName(configSave);
    const saveDisabled = isBusy || !!normalizedLoadError || String(configSave?.status || '') === 'saving';

    ['#xb-assistant-save', '#xb-assistant-delegate-save'].forEach((selector) => {
        const button = root.querySelector(selector);
        if (!button) return;
        button.className = `xb-assistant-icon-button ${saveButton.className}`;
        button.title = saveButton.title;
        button.setAttribute('aria-label', saveButton.title);
        button.toggleAttribute('disabled', saveDisabled);
        // eslint-disable-next-line no-unsanitized/property -- Static first-party SVG generated by this module.
        button.innerHTML = buildPresetActionIcon(saveIcon);
    });

    [
        '#xb-assistant-preset-select',
        '#xb-assistant-new-preset',
        '#xb-assistant-rename-preset',
        '#xb-assistant-pull-models',
        '#xb-assistant-delegate-pull-models',
    ].forEach((selector) => {
        root.querySelector(selector)?.toggleAttribute('disabled', isBusy);
    });
    root.querySelector('#xb-assistant-delete-preset')
        ?.toggleAttribute('disabled', isBusy || !canDeletePreset);
    syncPresetListControls(root, { isBusy, canDeletePreset });
    const toast = root.querySelector('#xb-assistant-toast');
    if (toast) toast.textContent = normalizedLoadError || String(inlineToastText || '');
    const fields = root.querySelector('[data-xb-agent-config-fields]');
    fields?.toggleAttribute('disabled', !!normalizedLoadError);
}

export function buildAgentSettingsPanelMarkup(options = {}) {
    const {
        configSave = {},
        runtimeText = '',
        inlineToastText = '',
        showInlineToast = true,
        showAssistantPermissions = true,
        showDelegateSettings = true,
        showWebSettings = true,
        activePage = 'main',
        delegatePresetHint = 'DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。',
        isBusy = false,
        canDeletePreset = true,
        configLoadError = '',
        presetLayout = 'select',
        presetNames = [],
        currentPresetName = '',
    } = options;
    const normalizedLoadError = String(configLoadError || '').trim();
    const saveButton = getAgentConfigSaveButtonState(configSave);
    const saveIcon = getAgentConfigSaveIconName(configSave);
    const saveDisabled = isBusy || !!normalizedLoadError || String(configSave?.status || '') === 'saving' ? 'disabled' : '';
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
                ${buildModelListAuthMarkup('delegate')}
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
                <label>
                    <span>最大输出 Token</span>
                    <input id="xb-assistant-delegate-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
                </label>
                ${buildSamplingSettingsMarkup('delegate')}
                <label id="xb-assistant-delegate-tool-mode-wrap">
                    <span>Tool 调用格式</span>
                    <select id="xb-assistant-delegate-tool-mode"></select>
                </label>
                <label>
                    <span>Reasoning 模式</span>
                    <select id="xb-assistant-delegate-reasoning-mode"></select>
                    <small id="xb-assistant-delegate-reasoning-capability"></small>
                </label>
                <label id="xb-assistant-delegate-reasoning-effort-wrap">
                    <span>思考强度</span>
                    <select id="xb-assistant-delegate-reasoning-effort"></select>
                </label>
                <label id="xb-assistant-delegate-reasoning-budget-wrap">
                    <span>思考 Token 预算</span>
                    <input id="xb-assistant-delegate-reasoning-budget" type="number" step="1" inputmode="numeric" />
                    <small>支持 -1 时表示由模型自动决定</small>
                </label>
            </div>` : '';

    const presetRowMarkup = presetLayout === 'list'
        ? buildPresetListSectionMarkup({
            names: presetNames,
            selectedName: presetNames.includes(currentPresetName) ? currentPresetName : (presetNames[0] ?? ''),
            isBusy,
            canDeletePreset,
            saveButton,
            saveIcon,
            saveDisabled,
        })
        : `<div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${isBusy ? 'disabled' : ''}>${buildPresetActionIcon('add')}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${isBusy ? 'disabled' : ''}>${buildPresetActionIcon('rename')}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${saveButton.className}" title="${saveButton.title}" aria-label="${saveButton.title}" ${saveDisabled}>${buildPresetActionIcon(saveIcon)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${deleteDisabled}>${buildPresetActionIcon('delete')}</button>
                </div>
            </div>`;

    return `
        <section class="xb-assistant-config">
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${normalizedLoadError ? 'disabled' : ''}>
            ${tabsMarkup}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${mainActive ? '' : 'hidden'}>
            ${presetRowMarkup}
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
            ${buildModelListAuthMarkup()}
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
            <label>
                <span>最大输出 Token</span>
                <input id="xb-assistant-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
            </label>
            ${buildSamplingSettingsMarkup('main')}
            ${showWebSettings ? buildWebSettingsMarkup() : ''}
            <label id="xb-assistant-tool-mode-wrap">
                <span>Tool 调用格式</span>
                <select id="xb-assistant-tool-mode"></select>
            </label>
            ${assistantPermissionMarkup}
            <label>
                <span>Reasoning 模式</span>
                <select id="xb-assistant-reasoning-mode"></select>
                <small id="xb-assistant-reasoning-capability"></small>
            </label>
            <label id="xb-assistant-reasoning-effort-wrap">
                <span>思考强度</span>
                <select id="xb-assistant-reasoning-effort"></select>
            </label>
            <label id="xb-assistant-reasoning-budget-wrap">
                <span>思考 Token 预算</span>
                <input id="xb-assistant-reasoning-budget" type="number" step="1" inputmode="numeric" />
                <small>支持 -1 时表示由模型自动决定</small>
            </label>
            </div>
            ${delegatePageMarkup}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${escapeHtml(runtimeText)}</div>
            </fieldset>
            ${showInlineToast ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${escapeHtml(normalizedLoadError || inlineToastText)}</div>` : ''}
        </section>
    `;
}
