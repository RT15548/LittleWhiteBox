// 画图 API 配置预设列表（共享 UI 组件，NovelAI / SD WebUI / ComfyUI 设置页的“API 配置”页共用）。
// 预设显示在与绘图参数页同一套共享列表视图里（preset-list-view.js）：拖动手柄（或聚焦后 ↑ / ↓）调整顺序、点名称切换、
// 名称就地改名、“…”菜单删除、标题旁的按钮折叠成只显示当前预设；顺序就是 apiPresets 数组的顺序，和其他预设改动一样经 onCommit 落盘。
// 受控组件：预设数据与表单读写都来自宿主提供的函数；用户操作时用 api-presets.js 的纯函数算出新预设数组，
// 交给 onCommit({ reason, apiPresets, activeApiPresetId, config })，由宿主持久化（并在需要时把 config 填进表单）后返回是否成功。
// 组件自己不碰存储和宿主全局；只用 DOM API + textContent，不拼 HTML 字符串。
// 外观沿用共享的 preset-list-view.css 与页面已有的 .btn / .btn-primary / .status-text.inline-status。
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
import { createPresetListKit } from './preset-list-kit.js';
import { pickNeighborAfterRemoval, reorderPresetsByIds } from './preset-order.js';
import { observeBackgroundTask } from '../../../shared/common/async-errors.js';


// 标题行右侧的按钮；改名是行内名称输入框，删除是每一行“…”菜单里的项（都作用于那一行）。
const ACTIONS = [
    { action: 'save-as', icon: 'fa-plus', label: '新建', title: API_PRESET_COPY.saveAs, className: 'btn' },
    { action: 'overwrite', icon: 'fa-floppy-disk', label: '覆盖保存', title: API_PRESET_COPY.overwrite, className: 'btn btn-primary' },
];
const MENU_ITEMS = [
    { action: 'delete', label: '删除', icon: 'fa-trash', danger: true },
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
 *  document, container            挂载点（组件清空并重建 container 的内容）
 *  form                           API 页的 fieldset；预设操作和 runSave 中的普通保存共用禁用范围
 *  fields                         API 配置字段白名单（由 Provider 传入）
 *  defaults                       缺省配置（可选，用于判断“没有东西可丢”）
 *  getState()                     → { apiPresets, activeApiPresetId }
 *  readConfig()                   → 表单里现在的 API 配置（已规范化）
 *  getEffectiveConfig()           → 已持久化、正在生效的 API 配置
 *  onCommit(change)               → Promise<boolean>；change = { reason, apiPresets, activeApiPresetId, config }
 *                                   reason: select | create | overwrite | rename | delete | reorder
 *                                   config: 需要作为生效配置写入的配置，重命名时为 null
 *  confirm(message) / prompt(message, fallback)   可选，缺省用 document.defaultView 上的同名函数
 *  createListView(options)        可选，创建列表视图（选项同 preset-list-view.js 的 createPresetListView）；
 *                                 页面想让列表与自己的其他菜单共用一个菜单控制器时传入，缺省用 preset-list-kit.js 的一份
 */
export function createApiPresetBar(options = {}) {
    const { document, container, form, fields, defaults, getState, readConfig, getEffectiveConfig, onCommit } = options;
    if (!document || !container) throw new TypeError('createApiPresetBar 需要 document 和 container');
    const view = document.defaultView;
    const confirmFn = options.confirm || (message => (typeof view?.confirm === 'function' ? view.confirm(message) : true));
    const promptFn = options.prompt || ((message, fallback) => (typeof view?.prompt === 'function' ? view.prompt(message, fallback) : null));

    let busy = false;
    let destroyed = false;

    const buttons = new Map();
    const group = create(document, 'div', { className: 'btn-group' });
    for (const item of ACTIONS) {
        const button = create(document, 'button', {
            className: item.className,
            attrs: { type: 'button', title: item.title, 'aria-label': item.title, 'data-action': item.action },
        }, [create(document, 'i', { className: `fa-solid ${item.icon}`, attrs: { 'aria-hidden': 'true' } }), create(document, 'span', { text: ` ${item.label}` })]);
        buttons.set(item.action, button);
        group.appendChild(button);
    }
    const toggle = create(document, 'button', {
        className: 'preset-list-toggle',
        attrs: { type: 'button', title: '折叠 / 展开', 'aria-label': '折叠 API 配置预设列表', 'aria-expanded': 'true' },
    }, [create(document, 'i', { className: 'fa-solid fa-chevron-down', attrs: { 'aria-hidden': 'true' } })]);
    const header = create(document, 'div', { className: 'preset-list-header' }, [
        create(document, 'div', { className: 'preset-list-title' }, [toggle, create(document, 'div', { className: 'card-title', text: API_PRESET_COPY.selectLabel })]),
        group,
    ]);
    const list = create(document, 'div', { className: 'preset-list', attrs: { role: 'list', 'aria-label': API_PRESET_COPY.selectLabel } });
    const status = create(document, 'div', { className: 'status-text inline-status', attrs: { role: 'status' } });
    while (container.firstChild) container.removeChild(container.firstChild);
    container.append(header, list, status);

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
        listView.refresh();
        list.classList.toggle('is-busy', busy);
        const hasActive = Boolean(state.activeApiPresetId);
        for (const [action, button] of buttons) {
            setDisabled(button, busy || (action === 'overwrite' && !hasActive));
        }
        setDisabled(toggle, busy);
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

    async function handleSelect(targetId) {
        const state = readState();
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

    // 重命名 / 删除作用于被点的那一行，不一定是当前使用的预设。
    async function handleRename(presetId, name) {
        const state = readState();
        const target = findApiPreset(state.apiPresets, presetId);
        if (!target || name === target.name) return;
        let next;
        try {
            next = renameApiPreset(state.apiPresets, target.id, name);
        } catch (error) {
            setStatus('error', errorMessage(error));
            return;
        }
        await commit({ reason: 'rename', apiPresets: next, activeApiPresetId: state.activeApiPresetId, config: null }, API_PRESET_COPY.renamed(name));
    }

    async function handleDelete(presetId) {
        const state = readState();
        const target = findApiPreset(state.apiPresets, presetId);
        if (!target) return;
        if (state.apiPresets.length < 2) {
            setStatus('error', API_PRESET_COPY.lastPreset);
            return;
        }
        const removingActive = target.id === state.activeApiPresetId;
        // 删的是当前预设：切到原位置上顶上来的那一个（配置一并换上）；删别的预设不影响当前表单和选择。
        const next = removingActive
            ? findApiPreset(state.apiPresets, pickNeighborAfterRemoval(state.apiPresets.map(preset => preset.id), target.id))
            : null;
        if (!confirmFn(next ? API_PRESET_COPY.confirmDelete(target.name, next.name) : API_PRESET_COPY.confirmDeleteOther(target.name))) return;
        await commit({
            reason: 'delete',
            apiPresets: deleteApiPreset(state.apiPresets, target.id),
            activeApiPresetId: next ? next.id : state.activeApiPresetId,
            config: next ? pickApiConfig(next.config, fields) : null,
        }, API_PRESET_COPY.deleted(target.name));
    }

    // 拖拽 / 键盘排序：只改数组顺序，当前选择和表单都不动。
    async function handleReorder(orderedIds) {
        const state = readState();
        const reordered = reorderPresetsByIds(state.apiPresets, orderedIds);
        if (reordered.every((preset, index) => preset === state.apiPresets[index])) return;
        await commit({ reason: 'reorder', apiPresets: reordered, activeApiPresetId: state.activeApiPresetId, config: null }, API_PRESET_COPY.reordered);
    }

    const handlers = {
        'save-as': handleSaveAs,
        overwrite: handleOverwrite,
    };

    function onClick(event) {
        const button = event.target?.closest?.('[data-action]');
        if (!button || !container.contains(button) || busy || button.hasAttribute('disabled')) return;
        const handler = handlers[button.getAttribute('data-action')];
        if (handler) void handler();
    }
    container.addEventListener('click', onClick);

    const task = (promise, operation) => observeBackgroundTask(promise, { source: 'modules/draw/shared/api-presets-ui.js', operation });
    const ownKit = options.createListView ? null : createPresetListKit();
    const listView = (options.createListView || (viewOptions => ownKit.createPresetListView(viewOptions)))({
        document,
        getList: () => list,
        getToggle: () => toggle,
        getPresets: () => readState().apiPresets,
        getCurrentId: () => readState().activeApiPresetId,
        noun: 'API 配置预设',
        listId: 'api-presets',
        menuItems: MENU_ITEMS,
        onSelect: (id) => { if (!busy) task(handleSelect(id), 'select'); },
        onAction: (action, id) => {
            if (busy) return;
            if (action === 'delete') task(handleDelete(id), 'delete');
        },
        onRename: (id, name) => {
            if (busy) return false;
            const done = handleRename(id, name);
            task(done, 'rename');
            return done; // 失败由 task 记录；列表在落定（成功或失败）后核对名称，被拒绝的名字还原
        },
        onReorder: (ids) => { if (!busy) task(handleReorder(ids), 'reorder'); },
    });

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
            listView.destroy();
            ownKit?.destroy();
            while (container.firstChild) container.removeChild(container.firstChild);
        },
    };
}
