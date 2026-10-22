// 画图 API 配置预设栏（共享 UI 组件，NovelAI / SD WebUI / ComfyUI 设置页的“API 配置”页共用）。
// 受控组件：预设数据与表单读写都来自宿主提供的函数；用户操作时用 api-presets.js 的纯函数算出新预设数组，
// 交给 onCommit({ reason, apiPresets, activeApiPresetId, config })，由宿主持久化（并在需要时把 config 填进表单）后返回是否成功。
// 组件自己不碰存储和宿主全局；只用 DOM API + textContent，不拼 HTML 字符串。
// 外观沿用页面已有的 .preset-bar / .input / .btn / .btn-icon / .btn-primary / .btn-danger / .status-text.inline-status。
// 预设里含 API Key 等敏感字段：状态文字、确认框、提示框都只出现预设名称，不出现任何配置内容。

import {
    createApiPreset,
    deleteApiPreset,
    findApiPreset,
    hasUnsavedApiConfig,
    isSameApiConfig,
    overwriteApiPreset,
    pickApiConfig,
    renameApiPreset,
} from './api-presets.js';

import { API_PRESET_COPY } from './api-presets-copy.js';
import { observeBackgroundTask } from '../../../shared/common/async-errors.js';


const ACTIONS = [
    { action: 'save-as', icon: 'fa-plus', title: API_PRESET_COPY.saveAs, className: 'btn btn-icon' },
    { action: 'overwrite', icon: 'fa-floppy-disk', title: API_PRESET_COPY.overwrite, className: 'btn btn-icon btn-primary' },
    { action: 'rename', icon: 'fa-pen', title: API_PRESET_COPY.rename, className: 'btn btn-icon' },
    { action: 'delete', icon: 'fa-trash', title: API_PRESET_COPY.remove, className: 'btn btn-icon btn-danger' },
];

function create(document, tag, { className, text, attrs } = {}, children = []) {
    const node = document.createElement(tag);
    if (className) node.setAttribute('class', className);
    if (text !== undefined) node.textContent = String(text);
    for (const [key, value] of Object.entries(attrs || {})) {
        if (value === undefined || value === null || value === false) continue;
        node.setAttribute(key, value === true ? '' : String(value));
    }
    for (const child of children) if (child) node.appendChild(child);
    return node;
}

function setDisabled(node, disabled) {
    if (disabled) node.setAttribute('disabled', '');
    else node.removeAttribute('disabled');
}

function errorMessage(error) {
    return error instanceof Error && error.message ? error.message : String(error || API_PRESET_COPY.operationFailed);
}

/**
 * options:
 *  document, container            挂载点（组件清空并重建 container 的内容；container 自带 .preset-bar 样式）
 *  form                           API 页的 fieldset；预设操作和 runSave 中的普通保存共用禁用范围
 *  fields                         API 配置字段白名单（由 Provider 传入）
 *  defaults                       缺省配置（可选，用于判断“没有东西可丢”）
 *  getState()                     → { apiPresets, activeApiPresetId }
 *  readConfig()                   → 表单里现在的 API 配置（已规范化）
 *  getEffectiveConfig()           → 已持久化、正在生效的 API 配置
 *  onCommit(change)               → Promise<boolean>；change = { reason, apiPresets, activeApiPresetId, config }
 *                                   reason: select | create | overwrite | rename | delete
 *                                   config: 需要作为生效配置写入的配置，重命名时为 null
 *  confirm(message) / prompt(message, fallback)   可选，缺省用 document.defaultView 上的同名函数
 */
export function createApiPresetBar(options = {}) {
    const { document, container, form, fields, defaults, getState, readConfig, getEffectiveConfig, onCommit } = options;
    if (!document || !container) throw new TypeError('createApiPresetBar 需要 document 和 container');
    const view = document.defaultView;
    const confirmFn = options.confirm || (message => (typeof view?.confirm === 'function' ? view.confirm(message) : true));
    const promptFn = options.prompt || ((message, fallback) => (typeof view?.prompt === 'function' ? view.prompt(message, fallback) : null));

    let busy = false;
    let destroyed = false;

    const select = create(document, 'select', {
        className: 'input',
        attrs: { 'aria-label': API_PRESET_COPY.selectLabel, title: API_PRESET_COPY.selectLabel },
    });
    const buttons = new Map();
    const group = create(document, 'div', { className: 'btn-group' });
    for (const item of ACTIONS) {
        const button = create(document, 'button', {
            className: item.className,
            attrs: { type: 'button', title: item.title, 'aria-label': item.title, 'data-action': item.action },
        }, [create(document, 'i', { className: `fa-solid ${item.icon}` })]);
        buttons.set(item.action, button);
        group.appendChild(button);
    }
    const status = create(document, 'div', { className: 'status-text inline-status', attrs: { role: 'status' } });
    while (container.firstChild) container.removeChild(container.firstChild);
    container.append(select, group, status);

    function readState() {
        const state = getState() || {};
        const apiPresets = Array.isArray(state.apiPresets) ? state.apiPresets : [];
        return { apiPresets, activeApiPresetId: findApiPreset(apiPresets, state.activeApiPresetId)?.id || null };
    }

    function setStatus(kind, text) {
        if (destroyed) return;
        status.textContent = text || '';
        status.setAttribute('class', `status-text inline-status${kind ? ` ${kind}` : ''}`);
        status.dataset.state = kind || 'idle';
    }

    function describe(state) {
        const active = findApiPreset(state.apiPresets, state.activeApiPresetId);
        if (!active) return '';
        const same = isSameApiConfig(readConfig(), active.config, fields);
        return same ? API_PRESET_COPY.current(active.name) : API_PRESET_COPY.modified(active.name);
    }

    function render() {
        if (destroyed) return;
        const state = readState();
        while (select.firstChild) select.removeChild(select.firstChild);
        for (const preset of state.apiPresets) {
            select.appendChild(create(document, 'option', { text: preset.name, attrs: { value: preset.id } }));
        }
        // 用 selected / disabled 属性而不是赋值属性：两者在浏览器里等价，属性写法在没有 value setter 的 DOM 实现里也能用。
        const wanted = state.activeApiPresetId || '';
        for (const option of select.children) {
            if (option.getAttribute('value') === wanted) option.setAttribute('selected', '');
        }
        const hasActive = Boolean(state.activeApiPresetId);
        for (const [action, button] of buttons) {
            const needsActive = action !== 'save-as';
            setDisabled(button, busy || (needsActive && !hasActive) || (action === 'delete' && state.apiPresets.length < 2));
        }
        setDisabled(select, busy);
        if (form) {
            setDisabled(form, busy);
            form.setAttribute('aria-busy', String(busy));
        }
        if (!busy) {
            const active = findApiPreset(state.apiPresets, state.activeApiPresetId);
            const modified = active && !isSameApiConfig(readConfig(), active.config, fields);
            setStatus(modified ? 'modified' : '', describe(state));
        }
    }

    // 所有会改变当前 API 的入口都用此门禁；fieldset 不改动控件自身的业务 disabled 状态。
    async function runSave(operation, successText = API_PRESET_COPY.saved) {
        if (busy || destroyed) return false;
        busy = true;
        render();
        setStatus('pending', API_PRESET_COPY.saving);
        let ok = false;
        try {
            ok = (await operation()) !== false;
        } catch (error) {
            console.warn('[ApiPresets] 保存失败:', errorMessage(error));
            ok = false;
        }
        busy = false;
        render();
        setStatus(ok ? 'success' : 'error', ok ? (typeof successText === 'function' ? successText() : successText) : API_PRESET_COPY.saveFailed);
        return ok;
    }

    const commit = (change, successText) => runSave(() => onCommit(change), successText);

    function suggestName(presets) {
        for (let n = presets.length + 1; n < presets.length + 100; n += 1) {
            const name = API_PRESET_COPY.defaultName(n);
            if (!presets.some(preset => preset.name === name)) return name;
        }
        return API_PRESET_COPY.unnamed;
    }

    // 询问名称：取消返回 null；空名称给出错误提示并返回 null。
    function askName(message, fallback) {
        const answer = promptFn(message, fallback);
        if (answer === null || answer === undefined) return null;
        if (!String(answer).trim()) {
            setStatus('error', API_PRESET_COPY.emptyName);
            return null;
        }
        return String(answer).trim();
    }

    async function handleSelect() {
        const state = readState();
        const targetId = select.value;
        if (targetId === (state.activeApiPresetId || '')) return;
        const target = findApiPreset(state.apiPresets, targetId);
        if (!target) { render(); return; }
        const unsaved = hasUnsavedApiConfig({
            presets: state.apiPresets,
            activeApiPresetId: state.activeApiPresetId,
            formConfig: readConfig(),
            effectiveConfig: getEffectiveConfig(),
            defaults,
            fields,
        });
        if (unsaved && !confirmFn(API_PRESET_COPY.confirmSwitch)) {
            render();
            return;
        }
        await commit({
            reason: 'select',
            apiPresets: state.apiPresets,
            activeApiPresetId: target.id,
            config: pickApiConfig(target.config, fields),
        }, API_PRESET_COPY.selected(target.name));
    }

    async function handleSaveAs() {
        const state = readState();
        const name = askName(API_PRESET_COPY.promptNew, suggestName(state.apiPresets));
        if (name === null) return;
        const config = pickApiConfig(readConfig(), fields);
        let created;
        try {
            created = createApiPreset(state.apiPresets, name, config, { fields });
        } catch (error) {
            setStatus('error', errorMessage(error));
            return;
        }
        await commit({
            reason: 'create',
            apiPresets: created.presets,
            activeApiPresetId: created.presetId,
            config,
        }, API_PRESET_COPY.created(name));
    }

    async function handleOverwrite() {
        const state = readState();
        const active = findApiPreset(state.apiPresets, state.activeApiPresetId);
        if (!active) return;
        const config = pickApiConfig(readConfig(), fields);
        await commit({
            reason: 'overwrite',
            apiPresets: overwriteApiPreset(state.apiPresets, active.id, config, { fields }),
            activeApiPresetId: active.id,
            config,
        }, API_PRESET_COPY.overwritten(active.name));
    }

    async function handleRename() {
        const state = readState();
        const active = findApiPreset(state.apiPresets, state.activeApiPresetId);
        if (!active) return;
        const name = askName(API_PRESET_COPY.promptRename, active.name);
        if (name === null || name === active.name) return;
        let next;
        try {
            next = renameApiPreset(state.apiPresets, active.id, name);
        } catch (error) {
            setStatus('error', errorMessage(error));
            return;
        }
        await commit({ reason: 'rename', apiPresets: next, activeApiPresetId: active.id, config: null }, API_PRESET_COPY.renamed(name));
    }

    async function handleDelete() {
        const state = readState();
        const active = findApiPreset(state.apiPresets, state.activeApiPresetId);
        if (!active) return;
        const next = state.apiPresets.find(preset => preset.id !== active.id);
        if (!next) return;
        if (!confirmFn(API_PRESET_COPY.confirmDelete(active.name, next.name))) return;
        await commit({
            reason: 'delete',
            apiPresets: deleteApiPreset(state.apiPresets, active.id),
            activeApiPresetId: next.id,
            config: pickApiConfig(next.config, fields),
        }, API_PRESET_COPY.deleted(active.name));
    }

    const handlers = {
        'save-as': handleSaveAs,
        overwrite: handleOverwrite,
        rename: handleRename,
        delete: handleDelete,
    };

    function onClick(event) {
        const button = event.target?.closest?.('[data-action]');
        if (!button || !container.contains(button) || busy || button.hasAttribute('disabled')) return;
        const handler = handlers[button.getAttribute('data-action')];
        if (handler) void handler();
    }
    function onChange(event) {
        if (event.target === select && !busy) observeBackgroundTask(handleSelect(), { source: "modules/draw/shared/api-presets-ui.js", operation: "onChange" });
    }
    container.addEventListener('click', onClick);
    container.addEventListener('change', onChange);

    render();
    return {
        document,
        render,
        refresh: render,
        setStatus,
        runSave,
        isBusy: () => busy,
        destroy() {
            destroyed = true;
            container.removeEventListener('click', onClick);
            container.removeEventListener('change', onChange);
            while (container.firstChild) container.removeChild(container.firstChild);
        },
    };
}
