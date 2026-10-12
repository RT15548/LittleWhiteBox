// 分组预设面板（共享 UI 组件，NovelAI / SD WebUI / ComfyUI 设置页共用）。
// 受控组件：数据全部来自宿主提供的 getter，用户操作时用 character-group-presets.js 的纯函数算出新预设数组，
// 交给 onPresetsChange(newPresets, { reason, presetId })，由宿主持久化后重新调用 render()。组件自己不碰存储和宿主全局。
// 只用 DOM API + textContent / 属性赋值，不拼 HTML 字符串；ID 一律放 data- 属性并用遍历比较，不拼选择器。
// 样式见 ./character-group-presets-ui.css（class 前缀 lwb-gp-，按钮 / 输入框沿用页面的 .btn .btn-sm .input）。

import {
    BINDING_TYPE_CHARACTER,
    MAX_PRESET_BINDINGS,
    MAX_PRESET_NAME_LENGTH,
    addBinding,
    captureGroupStatesFromLibrary,
    createPreset,
    deletePreset,
    duplicatePreset,
    findMatchingPreset,
    findPresetsBoundToAvatar,
    getPresetGroupRows,
    movePreset,
    removeBinding,
    renamePreset,
    setGroupState,
    setGroupStates,
} from './character-group-presets.js';

export const BADGE_MATCHED = '当前命中';
export const BADGE_APPLIED = '最近应用';

let instanceCounter = 0;

/**
 * 预设行上的徽标：matched=当前聊天命中该预设（多个预设命中时只有靠前的那个）；
 * applied=最近一次应用记录指向它；appliedStale=应用之后预设又被编辑过（revision 不一致）。
 */
export function describePresetBadges(preset, { activeAvatars = [], applied = null, presets = [] } = {}) {
    const id = preset?.id;
    const matched = Boolean(id) && findMatchingPreset(presets, activeAvatars)?.id === id;
    const isApplied = Boolean(id) && typeof applied?.presetId === 'string' && applied.presetId === id;
    const appliedStale = isApplied && applied.revision !== preset.revision;
    const labels = [];
    if (matched) labels.push(BADGE_MATCHED);
    if (isApplied) labels.push(BADGE_APPLIED);
    return { matched, applied: isApplied, appliedStale, labels };
}

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

function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

function lowerKey(value) {
    return String(value ?? '').trim().toLocaleLowerCase();
}

function errorMessage(error) {
    return error instanceof Error && error.message ? error.message : String(error || '操作失败');
}

export function createGroupPresetPanel(options = {}) {
    const {
        document,
        container,
        getLibrary,
        getPresets,
        getApplied,
        getActiveAvatars,
        listHostCharacters,
        onPresetsChange,
        onApply,
        onCapture,
        toast,
    } = options;
    if (!document || !container) throw new TypeError('createGroupPresetPanel 需要 document 和 container');

    const uid = ++instanceCounter;
    const root = create(document, 'div', { className: 'lwb-gp', attrs: { role: 'region', 'aria-label': '分组预设' } });
    clearNode(container);
    container.appendChild(root);

    // ── 界面状态（不含业务数据；业务数据每次渲染都从 getter 取）──
    const expanded = new Set();
    const drafts = new Map(); // data-draft-key -> 用户输入（与 data-baseline 不同才保留）
    const errors = new Map(); // 'save' | 'p:<id>' -> message
    let saveFormOpen = false;
    let pending = null; // { kind: 'delete' | 'overwrite' | 'bind-active', presetId, avatars? }
    let focusKey = '';
    let destroyed = false;

    // ── 数据读取（getter 抛错或返回异常值时降级为空，不崩）──
    function readPresets() {
        try {
            const list = getPresets?.();
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    }
    function readLibrary() {
        try {
            const library = getLibrary?.();
            return {
                characters: Array.isArray(library?.characters) ? library.characters : [],
                groups: Array.isArray(library?.groups) ? library.groups : [],
            };
        } catch {
            return { characters: [], groups: [] };
        }
    }
    function readApplied() {
        try {
            return getApplied?.() ?? null;
        } catch {
            return null;
        }
    }
    function readActiveAvatars() {
        try {
            const list = getActiveAvatars?.();
            return Array.isArray(list) ? list.filter(item => typeof item === 'string' && item) : [];
        } catch {
            return [];
        }
    }
    /** 宿主角色列表；读取失败返回 null（此时不把已绑定的 avatar 标成“角色卡不存在”）。 */
    function readHostCharacters() {
        try {
            const list = listHostCharacters?.();
            if (!Array.isArray(list)) return [];
            const seen = new Set();
            const result = [];
            for (const item of list) {
                if (typeof item?.avatar !== 'string' || !item.avatar || seen.has(item.avatar)) continue;
                seen.add(item.avatar);
                result.push({ avatar: item.avatar, name: typeof item.name === 'string' ? item.name : '' });
            }
            return result;
        } catch {
            return null;
        }
    }

    function notify(message, level = 'info') {
        try {
            toast?.(message, level);
        } catch { /* 提示失败不影响操作 */ }
    }

    // ── 重渲染时保留输入与焦点 ──
    function captureView() {
        for (const node of root.querySelectorAll('[data-draft-key]')) {
            const key = node.getAttribute('data-draft-key');
            const baseline = node.getAttribute('data-baseline') ?? '';
            const value = String(node.value ?? '');
            if (value !== baseline) drafts.set(key, value);
            else drafts.delete(key);
        }
        if (!focusKey) {
            const active = document.activeElement;
            if (active && root.contains(active)) focusKey = active.getAttribute?.('data-focus-key') || '';
        }
    }

    function restoreFocus() {
        if (!focusKey) return;
        const key = focusKey;
        focusKey = '';
        for (const node of root.querySelectorAll('[data-focus-key]')) {
            if (node.getAttribute('data-focus-key') !== key) continue;
            if (node.hasAttribute('disabled')) return;
            try {
                node.focus();
                if (node.getAttribute('type') === 'text' && typeof node.setSelectionRange === 'function') {
                    const end = String(node.value ?? '').length;
                    node.setSelectionRange(end, end);
                }
            } catch { /* 焦点恢复失败不影响使用 */ }
            return;
        }
    }

    function draftValue(key, fallback) {
        return drafts.has(key) ? drafts.get(key) : fallback;
    }

    // ── 通用控件 ──
    function button(text, action, { focus, className = '', title, label, disabled = false, expandedState, attrs: extra } = {}) {
        return create(document, 'button', {
            className: `btn btn-sm lwb-gp-btn ${className}`.trim(),
            text,
            attrs: {
                type: 'button',
                'data-action': action,
                'data-focus-key': focus,
                title,
                'aria-label': label,
                'aria-expanded': expandedState === undefined ? undefined : String(expandedState),
                disabled,
                ...extra,
            },
        });
    }

    function textInput(role, draftKey, baseline, { placeholder, label, type = 'text', maxLength } = {}) {
        const input = create(document, 'input', {
            className: 'input lwb-gp-input',
            attrs: {
                type,
                'data-role': role,
                'data-draft-key': draftKey,
                'data-focus-key': draftKey,
                'data-baseline': baseline,
                placeholder,
                'aria-label': label,
                maxlength: maxLength,
                autocomplete: 'off',
            },
        });
        input.value = draftValue(draftKey, baseline);
        return input;
    }

    function errorNode(scope) {
        const message = errors.get(scope);
        return message ? create(document, 'div', { className: 'lwb-gp-error', text: message, attrs: { role: 'alert' } }) : null;
    }

    function confirmBar(text, confirmAction, confirmLabel, { danger = false } = {}) {
        const cancel = button('取消', 'pending-cancel', { focus: 'pending-cancel' });
        return create(document, 'div', { className: 'lwb-gp-confirm', attrs: { role: 'alert' } }, [
            create(document, 'span', { className: 'lwb-gp-confirm-text', text }),
            create(document, 'span', { className: 'lwb-gp-confirm-actions' }, [
                button(confirmLabel, confirmAction, { focus: 'pending-confirm', className: danger ? 'btn-danger' : 'btn-primary' }),
                cancel,
            ]),
        ]);
    }

    // ── 变更：纯函数算新数组 → onPresetsChange ──
    /**
     * compute(presets) 返回新数组或 { presets, presetId }；抛错时在 scope 下显示 message。
     * 返回 true=已回调宿主；false=失败或没有变化。
     */
    function commit(compute, reason, presetId, scope) {
        const current = readPresets();
        let result;
        try {
            result = compute(current);
        } catch (error) {
            errors.set(scope, errorMessage(error));
            render();
            return false;
        }
        const next = Array.isArray(result) ? result : result?.presets;
        if (!Array.isArray(next) || next === current) {
            render();
            return false;
        }
        const targetId = (Array.isArray(result) ? undefined : result?.presetId) ?? presetId;
        if (reason === 'create' && targetId) expanded.add(targetId);
        onPresetsChange?.(next, { reason, presetId: targetId });
        render();
        return true;
    }

    function groupIdsOf(library) {
        return library.groups.map(group => group.id);
    }

    // ── 各个操作 ──
    function defaultPresetName(presets) {
        const used = new Set(presets.map(preset => lowerKey(preset.name)));
        for (let n = presets.length + 1; n < presets.length + 200; n += 1) {
            if (!used.has(lowerKey(`预设 ${n}`))) return `预设 ${n}`;
        }
        return `预设 ${presets.length + 1}`;
    }

    function openSaveForm() {
        if (saveFormOpen) {
            focusKey = 'save-name';
            render();
            return;
        }
        errors.clear();
        pending = null;
        saveFormOpen = true;
        drafts.set('save-name', defaultPresetName(readPresets()));
        focusKey = 'save-name';
        render();
    }

    function closeSaveForm() {
        saveFormOpen = false;
        drafts.delete('save-name');
        errors.delete('save');
        focusKey = 'save-open';
        render();
    }

    function captureStates(library) {
        if (typeof onCapture === 'function') {
            try {
                const custom = onCapture();
                const states = custom?.groupStates ?? custom;
                if (states && typeof states === 'object') return states;
            } catch { /* 回退到从库里取 */ }
        }
        return captureGroupStatesFromLibrary(library).groupStates;
    }

    function confirmSave() {
        const input = root.querySelector('[data-role="save-name"]');
        const name = input ? String(input.value) : draftValue('save-name', '');
        errors.clear();
        const library = readLibrary();
        const groupStates = captureStates(library);
        const created = commit(
            presets => createPreset(presets, name, { groupStates, groupIds: groupIdsOf(library) }),
            'create',
            '',
            'save',
        );
        if (created) {
            saveFormOpen = false;
            drafts.delete('save-name');
            errors.delete('save');
            focusKey = 'save-open';
            render();
        } else {
            focusKey = 'save-name';
            render();
        }
    }

    async function applyPreset(presetId) {
        const preset = readPresets().find(item => item.id === presetId);
        if (!preset || typeof onApply !== 'function') return;
        let result;
        try {
            result = await onApply(presetId);
        } catch (error) {
            notify(`应用失败：${errorMessage(error)}`, 'error');
            return;
        }
        const status = result?.status;
        if (status === 'applied') {
            notify(result.changed
                ? `已应用“${preset.name}”（${result.changedCount} 个分组开关变化）`
                : `“${preset.name}”的分组开关已是目标状态`, 'success');
        } else if (status === 'save-failed' || status === 'error') {
            notify(`应用“${preset.name}”失败${result.message ? `：${result.message}` : ''}`, 'error');
        }
    }

    function commitRename(input) {
        const presetId = presetIdOf(input);
        if (!presetId) return;
        const scope = `r:${presetId}`;
        errors.delete(scope);
        commit(presets => renamePreset(presets, presetId, input.value), 'rename', presetId, scope);
    }

    function setState(presetId, groupId, value) {
        const library = readLibrary();
        const scope = `p:${presetId}`;
        errors.delete(scope);
        commit(
            presets => setGroupState(presets, presetId, groupId, value, { groupIds: groupIdsOf(library) }),
            'group-state',
            presetId,
            scope,
        );
    }

    function addBindingFor(presetId, avatars) {
        const hostList = readHostCharacters() || [];
        const names = new Map(hostList.map(item => [item.avatar, item.name]));
        const scope = `b:${presetId}`;
        errors.delete(scope);
        const ok = commit(presets => avatars.reduce(
            (list, avatar) => addBinding(list, presetId, { type: BINDING_TYPE_CHARACTER, avatar, name: names.get(avatar) || '' }),
            presets,
        ), 'binding-add', presetId, scope);
        if (ok) {
            drafts.delete(`select:${presetId}`);
            drafts.delete(`filter:${presetId}`);
        }
    }

    function handleBindActive(presetId) {
        const preset = readPresets().find(item => item.id === presetId);
        if (!preset) return;
        const bound = new Set(preset.bindings.map(binding => binding.avatar));
        const candidates = readActiveAvatars().filter(avatar => !bound.has(avatar));
        errors.delete(`b:${presetId}`);
        if (!candidates.length) {
            render();
        } else if (candidates.length === 1) {
            pending = null;
            addBindingFor(presetId, candidates);
        } else {
            // 群聊里有多个未绑定的成员：先内联确认，避免一次点击悄悄绑上一批。
            pending = { kind: 'bind-active', presetId, avatars: candidates };
            focusKey = 'pending-cancel';
            render();
        }
    }

    // ── 事件委托 ──
    function presetIdOf(node) {
        return node?.closest?.('[data-preset-id]')?.getAttribute('data-preset-id') || '';
    }

    function setPending(kind, presetId, extra = {}) {
        errors.clear();
        pending = { kind, presetId, ...extra };
        focusKey = 'pending-cancel';
        render();
    }

    function onClick(event) {
        const target = event.target?.closest?.('[data-action]');
        if (!target || !root.contains(target) || target.hasAttribute('disabled')) return;
        const action = target.getAttribute('data-action');
        const presetId = presetIdOf(target);
        switch (action) {
            case 'save-open': openSaveForm(); break;
            case 'save-cancel': closeSaveForm(); break;
            case 'save-confirm': confirmSave(); break;
            case 'apply': applyPreset(presetId); break;
            case 'toggle':
                errors.clear();
                if (expanded.has(presetId)) expanded.delete(presetId);
                else expanded.add(presetId);
                focusKey = `toggle:${presetId}`;
                render();
                break;
            case 'delete': setPending('delete', presetId); break;
            case 'overwrite': setPending('overwrite', presetId); break;
            case 'pending-cancel': {
                const back = { delete: 'delete', overwrite: 'overwrite', 'bind-active': 'bindactive' }[pending?.kind];
                focusKey = back ? `${back}:${pending.presetId}` : '';
                pending = null;
                errors.clear();
                render();
                break;
            }
            case 'delete-confirm': {
                pending = null;
                errors.clear();
                if (commit(presets => deletePreset(presets, presetId), 'delete', presetId, `p:${presetId}`)) {
                    expanded.delete(presetId);
                    for (const key of [...drafts.keys()]) if (key.endsWith(`:${presetId}`)) drafts.delete(key);
                }
                break;
            }
            case 'overwrite-confirm': {
                pending = null;
                errors.clear();
                const library = readLibrary();
                const groupStates = captureStates(library);
                commit(
                    presets => setGroupStates(presets, presetId, groupStates, { groupIds: groupIdsOf(library), replace: true }),
                    'overwrite-states',
                    presetId,
                    `p:${presetId}`,
                );
                break;
            }
            case 'move-up':
            case 'move-down':
                errors.clear();
                focusKey = `${action}:${presetId}`;
                commit(presets => movePreset(presets, presetId, action === 'move-up' ? -1 : 1), action, presetId, `p:${presetId}`);
                break;
            case 'duplicate':
                errors.clear();
                commit(presets => duplicatePreset(presets, presetId), 'duplicate', presetId, `p:${presetId}`);
                break;
            case 'binding-add': {
                const select = target.closest('[data-preset-id]')?.querySelector('[data-role="add-select"]');
                const avatar = select ? String(select.value || '') : '';
                if (avatar) addBindingFor(presetId, [avatar]);
                break;
            }
            case 'bind-active': handleBindActive(presetId); break;
            case 'bind-active-confirm': {
                const avatars = pending?.kind === 'bind-active' && pending.presetId === presetId ? pending.avatars : [];
                pending = null;
                if (avatars.length) addBindingFor(presetId, avatars);
                else render();
                break;
            }
            case 'binding-remove': {
                const avatar = target.getAttribute('data-avatar') || '';
                errors.delete(`b:${presetId}`);
                commit(presets => removeBinding(presets, presetId, { avatar }), 'binding-remove', presetId, `b:${presetId}`);
                break;
            }
            default: break;
        }
    }

    function onChange(event) {
        const target = event.target;
        const role = target?.getAttribute?.('data-role');
        if (role === 'group-state') {
            const raw = target.getAttribute('data-state');
            const value = raw === 'true' ? true : raw === 'false' ? false : null;
            setState(presetIdOf(target), target.getAttribute('data-group-id') || '', value);
        } else if (role === 'rename') {
            commitRename(target);
        }
    }

    function onInput(event) {
        const target = event.target;
        if (target?.getAttribute?.('data-role') !== 'filter') return;
        const detail = target.closest?.('[data-preset-id]');
        const select = detail?.querySelector('[data-role="add-select"]');
        const presetId = presetIdOf(target);
        const preset = readPresets().find(item => item.id === presetId);
        if (!select || !preset) return;
        const count = fillAddOptions(select, preset, String(target.value || ''), readHostCharacters() || []);
        const addButton = detail.querySelector('[data-action="binding-add"]');
        if (addButton) {
            if (count) addButton.removeAttribute('disabled');
            else addButton.setAttribute('disabled', '');
        }
    }

    function onKeydown(event) {
        const target = event.target;
        const role = target?.getAttribute?.('data-role');
        if (event.key === 'Enter' && !event.isComposing) {
            if (role === 'save-name') {
                event.preventDefault();
                confirmSave();
            } else if (role === 'rename') {
                event.preventDefault();
                commitRename(target);
            } else if (role === 'filter') {
                event.preventDefault();
            }
            return;
        }
        if (event.key !== 'Escape') return;
        if (role === 'rename') {
            target.value = target.getAttribute('data-baseline') ?? '';
            errors.delete(`r:${presetIdOf(target)}`);
            drafts.delete(target.getAttribute('data-draft-key'));
            event.preventDefault();
            event.stopPropagation();
            render();
        } else if (saveFormOpen && (role === 'save-name' || root.querySelector('.lwb-gp-saveform')?.contains(target))) {
            event.preventDefault();
            event.stopPropagation();
            closeSaveForm();
        } else if (pending) {
            event.preventDefault();
            event.stopPropagation();
            pending = null;
            render();
        }
    }

    // ── 构建界面 ──
    function fillAddOptions(select, preset, filterText, hostList) {
        const previous = String(select.value || '') || '';
        const wanted = previous || drafts.get(`select:${preset.id}`) || '';
        const bound = new Set(preset.bindings.map(binding => binding.avatar));
        const needle = lowerKey(filterText);
        const nameCount = new Map();
        for (const item of hostList) nameCount.set(item.name, (nameCount.get(item.name) || 0) + 1);
        clearNode(select);
        const optionNodes = new Map();
        let count = 0;
        for (const item of hostList) {
            if (bound.has(item.avatar)) continue;
            if (needle && !lowerKey(item.name).includes(needle) && !lowerKey(item.avatar).includes(needle)) continue;
            const duplicated = !item.name || nameCount.get(item.name) > 1;
            const label = item.name ? (duplicated ? `${item.name}（${item.avatar}）` : item.name) : item.avatar;
            const option = create(document, 'option', { text: label, attrs: { value: item.avatar, title: item.avatar } });
            select.appendChild(option);
            optionNodes.set(item.avatar, option);
            count += 1;
        }
        if (!count) {
            const empty = create(document, 'option', {
                text: hostList.length && !needle ? '角色卡都已绑定' : (needle ? '没有匹配的角色卡' : '没有可添加的角色卡'),
                attrs: { value: '' },
            });
            select.appendChild(empty);
        }
        // 用 selected 属性而不是赋值 value：两者在浏览器里等价，属性写法在没有 value setter 的 DOM 实现里也能用。
        (optionNodes.get(wanted) || select.firstChild).setAttribute('selected', '');
        if (count) select.removeAttribute('disabled');
        else select.setAttribute('disabled', '');
        return count;
    }

    function buildGroupSection(preset, library, presetIndex) {
        const rows = getPresetGroupRows(library, preset);
        const section = create(document, 'div', { className: 'lwb-gp-section' }, [
            create(document, 'div', { className: 'lwb-gp-section-title', text: '分组开关' }),
            create(document, 'div', { className: 'form-hint lwb-gp-hint', text: '应用时把分组的开关切到所选状态；选“不管”的分组保持现状。预设不会改动任何角色卡。' }),
        ]);
        if (!rows.length) {
            section.appendChild(create(document, 'div', { className: 'lwb-gp-empty', text: '角色库里还没有分组。先在角色库里新建分组，再回来设置开关。' }));
            return section;
        }
        const list = create(document, 'div', { className: 'lwb-gp-grows' });
        rows.forEach((row, rowIndex) => {
            const group = create(document, 'div', {
                className: 'lwb-gp-seg-group',
                attrs: { role: 'radiogroup', 'aria-label': `${row.name} 的目标开关` },
            });
            const options = [['true', '开', 'lwb-gp-seg-on', true], ['false', '关', 'lwb-gp-seg-off', false], ['null', '不管', 'lwb-gp-seg-skip', null]];
            for (const [stateText, text, cls, value] of options) {
                const input = create(document, 'input', {
                    attrs: {
                        type: 'radio',
                        name: `lwb-gp-${uid}-${presetIndex}-${rowIndex}`,
                        value: stateText,
                        'data-role': 'group-state',
                        'data-state': stateText,
                        'data-group-id': row.key,
                        'data-focus-key': `gs:${preset.id}:${rowIndex}:${stateText}`,
                    },
                });
                if (row.state === value) {
                    input.setAttribute('checked', '');
                    try { input.checked = true; } catch { /* 属性已设置 */ }
                }
                group.appendChild(create(document, 'label', {
                    className: 'lwb-gp-seg',
                    attrs: { title: value === null ? '应用时保持这个分组现状' : undefined },
                }, [input, create(document, 'span', { className: `lwb-gp-seg-text ${cls}`, text })]));
            }
            list.appendChild(create(document, 'div', { className: 'lwb-gp-grow' }, [
                create(document, 'span', { className: 'lwb-gp-gname', text: row.name, attrs: { title: row.name } }),
                create(document, 'span', {
                    className: 'lwb-gp-gcount',
                    text: `角色 ${row.enabledCount}/${row.total} 开`,
                    attrs: { title: '这个分组里目前自己开着的角色数 / 总数（仅供参考）' },
                }),
                group,
            ]));
        });
        section.appendChild(list);
        return section;
    }

    function buildBindingSection(preset, presets, hostList) {
        const hostByAvatar = new Map((hostList || []).map(item => [item.avatar, item]));
        const section = create(document, 'div', { className: 'lwb-gp-section' }, [
            create(document, 'div', { className: 'lwb-gp-section-title', text: '绑定角色卡' }),
            create(document, 'div', {
                className: 'form-hint lwb-gp-hint',
                text: '聊天里出现任一绑定的角色卡（群聊看全体成员）就套用这个预设。',
            }),
        ]);
        if (!preset.bindings.length) {
            section.appendChild(create(document, 'div', { className: 'lwb-gp-empty', text: '还没有绑定角色卡：不会自动套用，只能手动点“应用”。' }));
        } else {
            const list = create(document, 'ul', { className: 'lwb-gp-bindings' });
            for (const binding of preset.bindings) {
                const host = hostByAvatar.get(binding.avatar);
                const missing = hostList !== null && !host;
                const label = host?.name || binding.name || binding.avatar;
                const others = findPresetsBoundToAvatar(presets, binding.avatar).filter(item => item.id !== preset.id);
                const item = create(document, 'li', { className: 'lwb-gp-binding', attrs: { 'data-avatar': binding.avatar } }, [
                    create(document, 'span', { className: 'lwb-gp-bname', text: label, attrs: { title: binding.avatar } }),
                ]);
                if (missing) {
                    item.appendChild(create(document, 'span', { className: 'lwb-gp-missing', text: '（角色卡不存在）' }));
                    item.appendChild(create(document, 'span', { className: 'lwb-gp-bavatar', text: binding.avatar, attrs: { title: binding.avatar } }));
                }
                if (others.length) {
                    item.appendChild(create(document, 'span', {
                        className: 'lwb-gp-warn',
                        text: '另一个预设也绑定了它，靠前的优先',
                        attrs: { title: `也绑定了它的预设：${others.map(other => other.name).join('、')}` },
                    }));
                }
                item.appendChild(button('移除', 'binding-remove', {
                    className: 'lwb-gp-remove',
                    label: `移除绑定 ${label}`,
                    focus: `rm:${preset.id}:${binding.avatar}`,
                    attrs: { 'data-avatar': binding.avatar },
                }));
                list.appendChild(item);
            }
            section.appendChild(list);
        }

        const select = create(document, 'select', {
            className: 'input lwb-gp-select',
            attrs: {
                'data-role': 'add-select',
                'data-draft-key': `select:${preset.id}`,
                'data-focus-key': `select:${preset.id}`,
                'data-baseline': '',
                'aria-label': '选择要绑定的角色卡',
            },
        });
        const filter = textInput('filter', `filter:${preset.id}`, '', { placeholder: '筛选角色卡', label: '按名称或文件名筛选角色卡', type: 'search' });
        const optionCount = fillAddOptions(select, preset, filter.value, hostList || []);
        const addRow = create(document, 'div', { className: 'lwb-gp-add' }, [
            filter,
            select,
            button('添加', 'binding-add', { focus: `add:${preset.id}`, className: 'btn-primary', disabled: !optionCount }),
        ]);
        section.appendChild(addRow);
        const active = readActiveAvatars();
        const bound = new Set(preset.bindings.map(binding => binding.avatar));
        const unbound = active.filter(avatar => !bound.has(avatar));
        section.appendChild(create(document, 'div', { className: 'lwb-gp-add-active' }, [
            button('绑定当前角色卡', 'bind-active', {
                focus: `bindactive:${preset.id}`,
                disabled: !unbound.length,
                title: unbound.length ? '把当前聊天里还没绑定的角色卡加进来' : (active.length ? '当前聊天的角色卡都已绑定' : '当前没有打开角色聊天'),
            }),
        ]));
        if (pending?.kind === 'bind-active' && pending.presetId === preset.id) {
            const names = pending.avatars.map(avatar => hostByAvatar.get(avatar)?.name || avatar);
            section.appendChild(confirmBar(`当前聊天有 ${names.length} 张未绑定的角色卡：${names.join('、')}。全部绑定到此预设？`, 'bind-active-confirm', '全部绑定', {}));
        }
        const bindingError = errorNode(`b:${preset.id}`);
        if (bindingError) section.appendChild(bindingError);
        if (preset.bindings.length >= MAX_PRESET_BINDINGS) {
            section.appendChild(create(document, 'div', { className: 'form-hint lwb-gp-hint', text: `单个预设最多绑定 ${MAX_PRESET_BINDINGS} 张角色卡。` }));
        }
        return section;
    }

    function buildDetail(preset, index, presets, library, hostList) {
        const detail = create(document, 'div', {
            className: 'lwb-gp-detail',
            attrs: { id: `lwb-gp-${uid}-detail-${index}` },
        });
        const rename = textInput('rename', `rename:${preset.id}`, preset.name, {
            label: '预设名称',
            maxLength: MAX_PRESET_NAME_LENGTH * 2,
        });
        detail.appendChild(create(document, 'div', { className: 'lwb-gp-section' }, [
            create(document, 'div', { className: 'lwb-gp-section-title', text: '名称' }),
            rename,
            errorNode(`r:${preset.id}`),
        ]));
        detail.appendChild(buildGroupSection(preset, library, index));
        detail.appendChild(buildBindingSection(preset, presets, hostList));

        const footer = create(document, 'div', { className: 'lwb-gp-footer' }, [
            button('提高优先级', 'move-up', { focus: `move-up:${preset.id}`, disabled: index === 0, title: index === 0 ? '已经是最靠前的预设' : '往前移一位' }),
            button('降低优先级', 'move-down', { focus: `move-down:${preset.id}`, disabled: index === presets.length - 1, title: index === presets.length - 1 ? '已经是最靠后的预设' : '往后移一位' }),
            button('复制', 'duplicate', { focus: `dup:${preset.id}` }),
            button('用当前分组开关覆盖此预设', 'overwrite', { focus: `overwrite:${preset.id}` }),
        ]);
        detail.appendChild(footer);
        if (pending?.kind === 'overwrite' && pending.presetId === preset.id) {
            detail.appendChild(confirmBar(
                `把此预设的分组开关全部改成角色库里当前的状态（共 ${library.groups.length} 个分组）？`,
                'overwrite-confirm',
                '确认覆盖',
            ));
        }
        return detail;
    }

    function buildItem(preset, index, presets, library, hostList, context) {
        const isOpen = expanded.has(preset.id);
        const badges = describePresetBadges(preset, context);
        const item = create(document, 'div', {
            className: `lwb-gp-item${isOpen ? ' expanded' : ''}`,
            attrs: { role: 'listitem', 'data-preset-id': preset.id },
        });
        const meta = create(document, 'span', { className: 'lwb-gp-meta' });
        if (badges.matched) {
            meta.appendChild(create(document, 'span', { className: 'lwb-gp-badge lwb-gp-badge-matched', text: BADGE_MATCHED, attrs: { title: '当前聊天的角色卡命中了这个预设' } }));
        }
        if (badges.applied) {
            meta.appendChild(create(document, 'span', {
                className: 'lwb-gp-badge lwb-gp-badge-applied',
                text: BADGE_APPLIED,
                attrs: { title: badges.appliedStale ? '应用之后这个预设又被编辑过，需要重新应用才会生效' : '最近一次应用的是这个预设' },
            }));
        }
        meta.appendChild(create(document, 'span', { className: 'lwb-gp-bound', text: `绑定 ${preset.bindings.length} 张角色卡` }));

        const row = create(document, 'div', { className: 'lwb-gp-row' }, [
            create(document, 'span', { className: 'lwb-gp-prio', text: String(index + 1), attrs: { title: `优先级第 ${index + 1}（靠前优先）` } }),
            create(document, 'span', { className: 'lwb-gp-name', text: preset.name, attrs: { title: preset.name } }),
            meta,
            create(document, 'span', { className: 'lwb-gp-actions' }, [
                button('应用', 'apply', { focus: `apply:${preset.id}`, title: '立即把这个预设的分组开关应用到角色库', label: `应用预设 ${preset.name}` }),
                button(isOpen ? '收起' : '编辑', 'toggle', {
                    focus: `toggle:${preset.id}`,
                    expandedState: isOpen,
                    label: `${isOpen ? '收起' : '编辑'}预设 ${preset.name}`,
                }),
                button('删除', 'delete', { focus: `delete:${preset.id}`, className: 'btn-danger', label: `删除预设 ${preset.name}` }),
            ]),
        ]);
        const toggle = row.querySelector('[data-action="toggle"]');
        if (toggle && isOpen) toggle.setAttribute('aria-controls', `lwb-gp-${uid}-detail-${index}`);
        item.appendChild(row);
        if (pending?.kind === 'delete' && pending.presetId === preset.id) {
            item.appendChild(confirmBar(`确定删除预设“${preset.name}”？`, 'delete-confirm', '确认删除', { danger: true }));
        }
        const rowError = errorNode(`p:${preset.id}`);
        if (rowError) item.appendChild(rowError);
        if (isOpen) item.appendChild(buildDetail(preset, index, presets, library, hostList));
        return item;
    }

    function render() {
        if (destroyed) return;
        captureView();
        const presets = readPresets();
        const library = readLibrary();
        const applied = readApplied();
        const activeAvatars = readActiveAvatars();
        const hostList = readHostCharacters();
        const ids = new Set(presets.map(preset => preset.id));
        for (const id of [...expanded]) if (!ids.has(id)) expanded.delete(id);
        if (pending && !ids.has(pending.presetId)) pending = null;
        for (const key of [...drafts.keys()]) {
            const at = key.indexOf(':');
            if (at > 0 && !ids.has(key.slice(at + 1))) drafts.delete(key);
        }

        clearNode(root);
        const context = { activeAvatars, applied, presets };
        const matched = findMatchingPreset(presets, activeAvatars);

        root.appendChild(create(document, 'div', { className: 'lwb-gp-head' }, [
            create(document, 'div', { className: 'lwb-gp-headline' }, [
                create(document, 'div', { className: 'lwb-gp-title', text: '分组预设' }),
                button('存为预设', 'save-open', { focus: 'save-open', className: 'btn-primary', title: '把角色库里各分组当前的开关存成一个新预设' }),
            ]),
            create(document, 'div', { className: 'form-hint lwb-gp-hint', text: '按角色卡自动切换分组开关；没命中任何预设时保持现状。' }),
            create(document, 'div', {
                className: `lwb-gp-status${matched ? ' matched' : ''}`,
                text: !presets.length ? '还没有预设' : (matched ? `当前聊天命中预设：“${matched.name}”` : '当前聊天未命中任何预设'),
                attrs: { role: 'status', 'aria-live': 'polite' },
            }),
        ]));

        if (saveFormOpen) {
            const form = create(document, 'div', { className: 'lwb-gp-saveform' }, [
                textInput('save-name', 'save-name', '', { label: '新预设名称', placeholder: '预设名称', maxLength: MAX_PRESET_NAME_LENGTH * 2 }),
                create(document, 'span', { className: 'lwb-gp-saveform-actions' }, [
                    button('保存', 'save-confirm', { focus: 'save-confirm', className: 'btn-primary' }),
                    button('取消', 'save-cancel', { focus: 'save-cancel' }),
                ]),
            ]);
            root.appendChild(form);
            const saveError = errorNode('save');
            if (saveError) root.appendChild(saveError);
            root.appendChild(create(document, 'div', { className: 'form-hint lwb-gp-hint', text: '会记录角色库里每个分组此刻的开/关状态。' }));
        }

        if (!presets.length) {
            root.appendChild(create(document, 'div', {
                className: 'lwb-gp-empty lwb-gp-empty-block',
                text: '还没有分组预设。先把各分组的开关调到想要的状态，点“存为预设”，再给它绑定角色卡，之后进入这些角色卡的聊天时就会自动套用。',
            }));
        } else {
            root.appendChild(create(document, 'div', { className: 'lwb-gp-list-head' }, [
                create(document, 'span', { className: 'lwb-gp-list-title', text: `预设（${presets.length}）` }),
                create(document, 'span', { className: 'form-hint lwb-gp-hint', text: '顺序即优先级，靠前优先：多个预设同时命中时，用排在最前面的。' }),
            ]));
            const list = create(document, 'div', { className: 'lwb-gp-list', attrs: { role: 'list' } });
            presets.forEach((preset, index) => list.appendChild(buildItem(preset, index, presets, library, hostList, context)));
            root.appendChild(list);
        }

        restoreFocus();
    }

    // ── 监听 ──
    const listeners = [];
    function listen(type, handler) {
        root.addEventListener(type, handler);
        listeners.push(() => root.removeEventListener(type, handler));
    }
    listen('click', onClick);
    listen('change', onChange);
    listen('input', onInput);
    listen('keydown', onKeydown);

    render();

    return {
        render,
        /** 展开指定预设的编辑区（例如“存为预设”之后或外部跳转）。 */
        expand(presetId) {
            if (destroyed || typeof presetId !== 'string' || !presetId) return;
            expanded.add(presetId);
            render();
        },
        destroy() {
            if (destroyed) return;
            destroyed = true;
            listeners.splice(0).forEach(off => off());
            expanded.clear();
            drafts.clear();
            errors.clear();
            clearNode(root);
            if (root.parentNode) root.parentNode.removeChild(root);
            clearNode(container);
        },
    };
}
