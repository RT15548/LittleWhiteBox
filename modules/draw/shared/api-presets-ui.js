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

export const API_PRESET_NONE_LABEL = '未保存为预设';
export const API_PRESET_COPY = Object.freeze({
    selectLabel: 'API 配置预设',
    saveAs: '另存为新预设',
    overwrite: '覆盖保存到当前预设',
    rename: '重命名预设',
    remove: '删除预设',
    promptNew: '输入新预设名称：',
    promptRename: '输入预设名称：',
    emptyList: '尚未保存预设，可把当前配置另存为预设',
    noActive: '当前配置未选择预设',
    saveFailed: '保存失败，请重试',
});

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
    return error instanceof Error && error.message ? error.message : String(error || '操作失败');
}

/**
 * options:
 *  document, container            挂载点（组件清空并重建 container 的内容；container 自带 .preset-bar 样式）
 *  fields                         API 配置字段白名单（由 Provider 传入）
 *  defaults                       缺省配置（可选，用于判断“没有东西可丢”）
 *  getState()                     → { apiPresets, activeApiPresetId }
 *  readConfig()                   → 表单里现在的 API 配置（已规范化）
 *  getEffectiveConfig()           → 已持久化、正在生效的 API 配置
 *  onCommit(change)               → Promise<boolean>；change = { reason, apiPresets, activeApiPresetId, config }
 *                                   reason: select | deselect | create | overwrite | rename | delete
 *                                   config: 需要作为生效配置写入的配置（select / create / overwrite），其余为 null
 *  confirm(message) / prompt(message, fallback)   可选，缺省用 document.defaultView 上的同名函数
 */
export function createApiPresetBar(options = {}) {
    const { document, container, fields, defaults, getState, readConfig, getEffectiveConfig, onCommit } = options;
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
        status.textContent = text || '';
        status.setAttribute('class', `status-text inline-status${kind ? ` ${kind}` : ''}`);
    }

    function describe(state) {
        const active = findApiPreset(state.apiPresets, state.activeApiPresetId);
        if (!active) return state.apiPresets.length ? API_PRESET_COPY.noActive : API_PRESET_COPY.emptyList;
        const same = isSameApiConfig(readConfig(), active.config, fields);
        return same ? `当前预设：${active.name}` : `当前预设：${active.name}（表单与预设不一致，点击保存或覆盖保存可同步）`;
    }

    function render() {
        if (destroyed) return;
        const state = readState();
        while (select.firstChild) select.removeChild(select.firstChild);
        select.appendChild(create(document, 'option', { text: API_PRESET_NONE_LABEL, attrs: { value: '' } }));
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
            setDisabled(button, busy || (needsActive && !hasActive));
        }
        setDisabled(select, busy);
        setStatus('', describe(state));
    }

    async function commit(change, successText) {
        if (busy) return false;
        busy = true;
        render();
        let ok = false;
        try {
            ok = (await onCommit(change)) !== false;
        } catch (error) {
            console.warn('[ApiPresets] 保存失败:', errorMessage(error));
            ok = false;
        }
        busy = false;
        render();
        setStatus(ok ? 'success' : 'error', ok ? successText : API_PRESET_COPY.saveFailed);
        return ok;
    }

    function suggestName(presets) {
        for (let n = presets.length + 1; n < presets.length + 100; n += 1) {
            const name = `API 预设 ${n}`;
            if (!presets.some(preset => preset.name === name)) return name;
        }
        return 'API 预设';
    }

    // 询问名称：取消返回 null；空名称给出错误提示并返回 null。
    function askName(message, fallback) {
        const answer = promptFn(message, fallback);
        if (answer === null || answer === undefined) return null;
        if (!String(answer).trim()) {
            setStatus('error', '预设名称不能为空');
            return null;
        }
        return String(answer).trim();
    }

    async function handleSelect() {
        const state = readState();
        const targetId = select.value;
        if (targetId === (state.activeApiPresetId || '')) return;
        if (!targetId) {
            await commit({ reason: 'deselect', apiPresets: state.apiPresets, activeApiPresetId: null, config: null }, '已取消选择预设，当前 API 配置不变');
            return;
        }
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
        if (unsaved && !confirmFn('当前 API 配置有尚未保存到预设的修改，切换预设会覆盖它们。确定切换吗？')) {
            render();
            return;
        }
        await commit({
            reason: 'select',
            apiPresets: state.apiPresets,
            activeApiPresetId: target.id,
            config: pickApiConfig(target.config, fields),
        }, `已切换到预设「${target.name}」，并作为当前 API 配置生效`);
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
        }, `已另存为预设「${name}」`);
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
        }, `已覆盖保存到预设「${active.name}」`);
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
        await commit({ reason: 'rename', apiPresets: next, activeApiPresetId: active.id, config: null }, `已重命名为「${name}」`);
    }

    async function handleDelete() {
        const state = readState();
        const active = findApiPreset(state.apiPresets, state.activeApiPresetId);
        if (!active) return;
        if (!confirmFn(`删除 API 预设「${active.name}」？当前正在使用的 API 配置不会改变。`)) return;
        await commit({
            reason: 'delete',
            apiPresets: deleteApiPreset(state.apiPresets, active.id),
            activeApiPresetId: null,
            config: null,
        }, `已删除预设「${active.name}」`);
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
        if (event.target === select && !busy) void handleSelect();
    }
    container.addEventListener('click', onClick);
    container.addEventListener('change', onChange);

    render();
    return {
        document,
        render,
        refresh: render,
        setStatus,
        isBusy: () => busy,
        destroy() {
            destroyed = true;
            container.removeEventListener('click', onClick);
            container.removeEventListener('change', onChange);
            while (container.firstChild) container.removeChild(container.firstChild);
        },
    };
}
