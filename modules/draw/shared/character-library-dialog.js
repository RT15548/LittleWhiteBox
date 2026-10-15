// 角色标签导入对话框：选项 → planCharacterImport 实时预览 → 确认。
// 只依赖传入的 document 与 ./character-library.js，不 import 酒馆内部模块；NovelAI 面板在 iframe 里动态 import 本文件。
// 所有用户可控文本（文件名、分组名、角色名、警告文案）一律走 textContent，不拼 innerHTML。
// 样式见 character-library-dialog.css（由宿主页面自行引入）。

import {
    BACKEND_ENABLED_CHARACTER_LIMIT,
    MAX_GROUP_NAME_LENGTH,
    UNGROUPED_ID,
    UNGROUPED_NAME,
    planCharacterImport,
} from './character-library.js';

const SAME_ID_POLICIES = Object.freeze([
    { value: 'replace', label: '用最新文件替换（并移入目标分组）', hint: '文件里的内容覆盖本地同 id 角色，并移入目标分组。' },
    { value: 'keep-both', label: '保留两者', hint: '导入的角色使用新 id 并加“副本”后缀，本地角色不变。' },
    { value: 'skip', label: '跳过', hint: '不导入这些角色，本地保持不变。' },
]);
const AUTO_POLICY_HINT = '替换，保留本地的启用状态、分组和位置。';
const FILE_NAME_FALLBACK = '导入的角色';
const EXPORT_NAME_MAX_CHARS = 64;

let dialogSeq = 0;

/** 去掉扩展名后作为“导入到新分组”的默认名，并截到分组名长度上限。 */
export function defaultGroupNameFromFileName(fileName) {
    const base = String(fileName ?? '').replace(/\.[A-Za-z0-9]{1,8}$/, '').trim();
    const name = Array.from(base).slice(0, MAX_GROUP_NAME_LENGTH).join('').trim();
    return name || FILE_NAME_FALLBACK;
}

/** 导出文件名：去掉 \ / : * ? " < > | 与控制字符，空则回退。scope 为 all / selection / group。 */
export function buildCharacterExportFileName({ scope = 'all', groupName = '' } = {}) {
    if (scope === 'all') return 'character-tags.json';
    if (scope === 'selection') return 'character-tags-selection.json';
    const safe = Array.from(String(groupName ?? '')
        // eslint-disable-next-line no-control-regex
        .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, '')
        .trim())
        .slice(0, EXPORT_NAME_MAX_CHARS)
        .join('')
        // Windows 不允许文件名以点或空格结尾
        .replace(/[. ]+$/, '');
    return `character-tags-${safe || 'group'}.json`;
}

function create(document, tag, { className, text, attrs } = {}, children = []) {
    const node = document.createElement(tag);
    if (className) node.setAttribute('class', className);
    if (text !== undefined) node.textContent = String(text);
    for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, String(value));
    for (const child of children) node.appendChild(child);
    return node;
}

function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

function readSelectValue(select) {
    const options = Array.from(select.querySelectorAll('option'));
    const picked = options.find(option => option.selected) || options[0];
    return picked ? picked.value : '';
}

function selectValue(select, value) {
    const match = Array.from(select.querySelectorAll('option')).find(option => option.value === value);
    if (match) match.selected = true;
}

function describeWarning(warning) {
    const base = String(warning?.message ?? '');
    const names = Array.isArray(warning?.names) ? warning.names.filter(Boolean) : [];
    if (!names.length) return base;
    const more = warning.count > names.length ? ' 等' : '';
    return `${base}（${names.join('、')}${more}）`;
}

/**
 * 打开导入对话框。
 * @param {object} params
 * @param {Document} params.document 宿主页面 document（所有 DOM 操作都经由它）
 * @param {object|function} params.library 当前角色库，或返回当前角色库的函数（每次重算预览时读取，避免对话框打开期间库已变化）
 * @param {object} params.parsed parseCharacterImport 的返回值
 * @param {string} params.fileName 文件名（仅用于展示与默认分组名）
 * @param {function} params.onConfirm 点击“导入”时以 { plan, options } 调用；抛错则对话框保持打开并显示错误
 * @param {function} [params.onClose] 对话框关闭（含取消、Esc、导入完成）时调用
 * @param {function} [params.makeId] 透传给 planCharacterImport（测试用）
 * @returns {{ element: Element, close: function, getPlan: function }}
 */
export function openCharacterImportDialog({ document, library, parsed, fileName = '', onConfirm, onClose, makeId } = {}) {
    if (!document?.body) throw new TypeError('缺少 document');
    if (!parsed || !Array.isArray(parsed.entries)) throw new TypeError('缺少解析后的导入数据');
    const getLibrary = typeof library === 'function' ? library : () => library;
    const seq = (dialogSeq += 1);
    const initialLibrary = getLibrary();
    const groups = initialLibrary.groups || [];

    const state = {
        mode: 'auto',
        groupId: groups[0]?.id || '',
        newGroupName: defaultGroupNameFromFileName(fileName),
        policy: 'replace',
        importNewAsDisabled: false,
        plan: null,
        error: '',
        closed: false,
    };

    // ── 结构 ──────────────────────────────────────────────
    const titleId = `lwb-cid-title-${seq}`;
    const overlay = create(document, 'div', { className: 'lwb-cid-overlay', attrs: { 'data-role': 'overlay' } });
    const panel = create(document, 'div', {
        className: 'lwb-cid-panel',
        attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId, 'data-role': 'dialog' },
    });
    overlay.appendChild(panel);
    panel.appendChild(create(document, 'h3', { className: 'lwb-cid-title', text: '导入角色标签', attrs: { id: titleId } }));
    const body = create(document, 'div', { className: 'lwb-cid-body' });
    panel.appendChild(body);

    // 顶部信息
    const meta = create(document, 'dl', { className: 'lwb-cid-meta', attrs: { 'data-role': 'meta' } });
    const addMeta = (key, label, value, wide = false) => {
        const item = create(document, 'div', { className: `lwb-cid-meta-item${wide ? ' is-wide' : ''}` });
        item.appendChild(create(document, 'dt', { className: 'lwb-cid-meta-label', text: label }));
        item.appendChild(create(document, 'dd', { className: 'lwb-cid-meta-value', text: value, attrs: { 'data-meta': key } }));
        meta.appendChild(item);
    };
    addMeta('file', '文件', fileName || '（未命名）', true);
    addMeta('version', '版本', `v${parsed.version}`);
    addMeta('characters', '角色数', parsed.entries.length);
    addMeta('groups', '分组数', (parsed.groups || []).length);
    addMeta('skipped', '已跳过', parsed.skipped || 0);
    body.appendChild(meta);

    // 目标位置
    const modeSection = create(document, 'fieldset', { className: 'lwb-cid-section', attrs: { 'data-role': 'mode-section' } });
    modeSection.appendChild(create(document, 'legend', { className: 'lwb-cid-section-title', text: '目标位置' }));
    const radioName = `lwb-cid-mode-${seq}`;
    const modeRows = {};
    const radios = {};
    const makeRadioRow = (mode, label, hint) => {
        const row = create(document, 'div', { className: 'lwb-cid-mode', attrs: { 'data-mode-row': mode } });
        const input = create(document, 'input', { attrs: { type: 'radio', name: radioName, value: mode, 'data-role': `mode-${mode}` } });
        const choice = create(document, 'label', { className: 'lwb-cid-choice' }, [
            input,
            create(document, 'span', { text: label }),
        ]);
        row.appendChild(choice);
        if (hint) row.appendChild(create(document, 'p', { className: 'lwb-cid-hint', text: hint }));
        modeSection.appendChild(row);
        modeRows[mode] = { row, choice };
        radios[mode] = input;
        return row;
    };

    makeRadioRow('auto', '自动：按 id 替换已有角色', '文件里的新角色按文件中的分组名归位（同名并入，没有则新建）。');

    const existingRow = makeRadioRow('existing-group', '导入到已有分组');
    const groupSelect = create(document, 'select', {
        className: 'lwb-cid-input',
        attrs: { 'aria-label': '目标分组', 'data-role': 'group-select' },
    });
    for (const group of groups) {
        groupSelect.appendChild(create(document, 'option', { text: group.name, attrs: { value: group.id } }));
    }
    existingRow.appendChild(groupSelect);
    const existingHint = create(document, 'p', {
        className: 'lwb-cid-hint',
        text: '当前没有任何分组，请先新建分组或选择其他方式。',
        attrs: { 'data-role': 'existing-empty-hint' },
    });
    existingRow.appendChild(existingHint);

    const newRow = makeRadioRow('new-group', '导入到新分组');
    const nameInput = create(document, 'input', {
        className: 'lwb-cid-input',
        attrs: { type: 'text', 'aria-label': '新分组名称', 'data-role': 'new-group-name', placeholder: '新分组名称', autocomplete: 'off' },
    });
    nameInput.value = state.newGroupName;
    newRow.appendChild(nameInput);

    body.appendChild(modeSection);

    // 相同 id 处理
    const policyField = create(document, 'div', { className: 'lwb-cid-field' });
    const policyId = `lwb-cid-policy-${seq}`;
    policyField.appendChild(create(document, 'label', { className: 'lwb-cid-label', text: '遇到相同 id', attrs: { for: policyId } }));
    const policySelect = create(document, 'select', { className: 'lwb-cid-input', attrs: { id: policyId, 'data-role': 'policy-select' } });
    for (const policy of SAME_ID_POLICIES) {
        policySelect.appendChild(create(document, 'option', { text: policy.label, attrs: { value: policy.value } }));
    }
    policyField.appendChild(policySelect);
    const policyHint = create(document, 'p', { className: 'lwb-cid-hint', attrs: { 'data-role': 'policy-hint' } });
    policyField.appendChild(policyHint);
    body.appendChild(policyField);

    // 导入为停用
    const disabledField = create(document, 'div', { className: 'lwb-cid-field' });
    const disabledBox = create(document, 'input', { attrs: { type: 'checkbox', 'data-role': 'import-disabled' } });
    disabledField.appendChild(create(document, 'label', { className: 'lwb-cid-choice' }, [
        disabledBox,
        create(document, 'span', { text: '新增的角色导入为停用' }),
    ]));
    disabledField.appendChild(create(document, 'p', { className: 'lwb-cid-hint', text: '已有角色的替换不受影响。' }));
    body.appendChild(disabledField);

    // 预览
    const preview = create(document, 'div', { className: 'lwb-cid-preview', attrs: { 'data-role': 'preview', 'aria-live': 'polite' } });
    const errorBox = create(document, 'p', { className: 'lwb-cid-alert', attrs: { role: 'alert', 'data-role': 'error' } });
    const chips = create(document, 'div', { className: 'lwb-cid-chips', attrs: { 'data-role': 'summary' } });
    const total = create(document, 'p', { className: 'lwb-cid-total', attrs: { 'data-role': 'total' } });
    const warningList = create(document, 'ul', { className: 'lwb-cid-warnings', attrs: { 'data-role': 'warnings' } });
    const limitAlert = create(document, 'p', { className: 'lwb-cid-alert', attrs: { role: 'alert', 'data-role': 'limit-warning' } });
    [errorBox, chips, total, limitAlert, warningList].forEach(node => preview.appendChild(node));
    // 预览固定在滚动区下方：改选项时始终能看到摘要与警告
    panel.appendChild(preview);

    // 按钮
    const footer = create(document, 'div', { className: 'lwb-cid-footer' });
    footer.appendChild(create(document, 'p', { className: 'lwb-cid-tip', text: '建议先导出全部再导入。', attrs: { 'data-role': 'tip' } }));
    const cancelBtn = create(document, 'button', { className: 'lwb-cid-btn', text: '取消', attrs: { type: 'button', 'data-role': 'cancel' } });
    const confirmBtn = create(document, 'button', { className: 'lwb-cid-btn lwb-cid-btn-primary', text: '导入', attrs: { type: 'button', 'data-role': 'confirm' } });
    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);
    panel.appendChild(footer);

    // ── 逻辑 ──────────────────────────────────────────────
    const buildOptions = () => ({
        mode: state.mode,
        groupId: state.groupId,
        newGroupName: state.newGroupName,
        sameIdPolicy: state.policy,
        importNewAsDisabled: state.importNewAsDisabled,
    });

    const computePlan = () => {
        const options = buildOptions();
        try {
            return { plan: planCharacterImport(getLibrary(), parsed, options, { makeId }), options, error: '' };
        } catch (error) {
            return { plan: null, options, error: String(error?.message || '无法计算导入结果') };
        }
    };

    const setShown = (node, shown) => {
        if (shown) node.removeAttribute('hidden');
        else node.setAttribute('hidden', '');
    };

    const refresh = () => {
        // 控件状态
        const noGroups = groups.length === 0;
        for (const [mode, input] of Object.entries(radios)) {
            const unavailable = mode === 'existing-group' && noGroups;
            input.disabled = unavailable;
            input.checked = state.mode === mode;
            modeRows[mode].row.classList.toggle('is-selected', state.mode === mode);
            modeRows[mode].row.classList.toggle('is-disabled', unavailable);
            modeRows[mode].choice.classList.toggle('is-disabled', unavailable);
        }
        groupSelect.disabled = noGroups;
        setShown(existingHint, noGroups);
        const auto = state.mode === 'auto';
        policySelect.disabled = auto;
        policyHint.textContent = auto
            ? AUTO_POLICY_HINT
            : (SAME_ID_POLICIES.find(policy => policy.value === state.policy)?.hint || '');

        // 预览
        const result = computePlan();
        state.plan = result.plan;
        state.error = result.error;
        nameInput.setAttribute('aria-invalid', state.mode === 'new-group' && result.error ? 'true' : 'false');

        clearNode(chips);
        clearNode(warningList);
        if (!result.plan) {
            errorBox.textContent = result.error;
            setShown(errorBox, true);
            setShown(chips, false);
            setShown(total, false);
            setShown(limitAlert, false);
            setShown(warningList, false);
            confirmBtn.disabled = true;
            return;
        }

        const { summary, warnings } = result.plan;
        setShown(errorBox, false);
        errorBox.textContent = '';
        const addChip = (key, text) => chips.appendChild(create(document, 'span', { className: 'lwb-cid-chip', text, attrs: { 'data-summary': key } }));
        addChip('added', `新增 ${summary.added}`);
        addChip('replaced', `替换 ${summary.replaced}`);
        addChip('skipped', `跳过 ${summary.skipped}`);
        if (summary.keptBoth) addChip('keptBoth', `保留两者 ${summary.keptBoth}`);
        if (summary.groupsCreated) addChip('groupsCreated', `新建分组 ${summary.groupsCreated}`);
        setShown(chips, true);
        total.textContent = `导入后共 ${summary.totalAfter} 个角色，已启用 ${summary.enabledAfter} 个`;
        setShown(total, true);

        const overLimit = summary.enabledAfter > BACKEND_ENABLED_CHARACTER_LIMIT;
        limitAlert.textContent = overLimit
            ? `导入后已启用角色 ${summary.enabledAfter} 个，超过 ${BACKEND_ENABLED_CHARACTER_LIMIT}：使用后台出图时请求会被拒绝。可勾选“导入为停用”`
            : '';
        setShown(limitAlert, overLimit);

        for (const warning of warnings) {
            warningList.appendChild(create(document, 'li', {
                text: describeWarning(warning),
                attrs: { 'data-warning': warning.code || '' },
            }));
        }
        setShown(warningList, warnings.length > 0);

        // 没有任何会写入的内容时不允许点“导入”
        const changes = summary.added + summary.replaced + summary.keptBoth;
        if (changes === 0) {
            errorBox.textContent = '没有可导入的角色（全部被跳过或文件为空）';
            setShown(errorBox, true);
        }
        confirmBtn.disabled = changes === 0;
    };

    const selectMode = (mode) => {
        // 无分组时该模式不可选：重绘以把被强行勾上的单选框恢复
        if (!(mode === 'existing-group' && groups.length === 0)) state.mode = mode;
        refresh();
    };

    for (const [mode, input] of Object.entries(radios)) {
        input.addEventListener('change', () => selectMode(mode));
    }
    // 操作某个模式的子控件时顺带选中该模式，省去先点单选框
    groupSelect.addEventListener('change', () => {
        state.groupId = readSelectValue(groupSelect);
        selectMode('existing-group');
    });
    nameInput.addEventListener('input', () => {
        state.newGroupName = nameInput.value;
        selectMode('new-group');
    });
    policySelect.addEventListener('change', () => {
        state.policy = readSelectValue(policySelect);
        refresh();
    });
    disabledBox.addEventListener('change', () => {
        state.importNewAsDisabled = Boolean(disabledBox.checked);
        refresh();
    });

    // ── 关闭 / 键盘 / 焦点 ─────────────────────────────────
    const previousFocus = document.activeElement || null;

    const focusables = () => Array.from(panel.querySelectorAll('input, select, button'))
        .filter(node => !node.disabled);

    const onKeydown = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault?.();
            event.stopPropagation?.();
            close();
            return;
        }
        if (event.key === 'Tab') {
            const items = focusables();
            if (!items.length) return;
            const active = document.activeElement;
            const index = items.indexOf(active);
            if (event.shiftKey && (index <= 0)) {
                event.preventDefault?.();
                items[items.length - 1].focus();
            } else if (!event.shiftKey && (index === items.length - 1 || index < 0)) {
                event.preventDefault?.();
                items[0].focus();
            }
        }
    };

    function close() {
        if (state.closed) return;
        state.closed = true;
        document.removeEventListener('keydown', onKeydown, true);
        overlay.parentNode?.removeChild(overlay);
        try { previousFocus?.focus?.(); } catch { /* 原焦点元素已不在文档中时忽略 */ }
        onClose?.();
    }

    cancelBtn.addEventListener('click', close);
    confirmBtn.addEventListener('click', () => {
        if (confirmBtn.disabled) return;
        // 以点击瞬间的库重算一次，保证采用的结果与最新本地数据一致
        const result = computePlan();
        if (!result.plan) {
            state.error = result.error;
            errorBox.textContent = result.error;
            setShown(errorBox, true);
            confirmBtn.disabled = true;
            return;
        }
        try {
            onConfirm?.({ plan: result.plan, options: result.options });
        } catch (error) {
            errorBox.textContent = String(error?.message || '导入失败');
            setShown(errorBox, true);
            return;
        }
        close();
    });
    // 点遮罩不关闭：误触会丢掉已调好的选项

    selectValue(policySelect, state.policy);
    selectValue(groupSelect, state.groupId);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKeydown, true);
    refresh();
    try { radios.auto.focus(); } catch { /* 不可聚焦环境（如无头 DOM）忽略 */ }

    return {
        element: overlay,
        close,
        getPlan: () => state.plan,
    };
}

// ── 导出对话框 ─────────────────────────────────────────────

/**
 * 导出范围的统计：全部 / 各分组（含未分组，仅当其中有角色）/ 当前已选（只算库里真实存在的 id，去重）。
 * 对话框的可选项以此为准；单独导出以便测试。
 */
export function describeExportScopes(library, selectedIds = []) {
    const characters = Array.isArray(library?.characters) ? library.characters : [];
    const groups = Array.isArray(library?.groups) ? library.groups : [];
    const known = new Set(groups.map(group => group.id));
    const counts = new Map();
    for (const character of characters) {
        const key = known.has(character.groupId) ? character.groupId : UNGROUPED_ID;
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    const options = [];
    if (counts.get(UNGROUPED_ID)) options.push({ id: UNGROUPED_ID, name: UNGROUPED_NAME, count: counts.get(UNGROUPED_ID) });
    for (const group of groups) options.push({ id: group.id, name: group.name, count: counts.get(group.id) || 0 });
    const existing = new Set(characters.map(character => character.id));
    const selected = [...new Set(Array.isArray(selectedIds) ? selectedIds : [])].filter(id => existing.has(id));
    return { total: characters.length, groups: options, selected };
}

/**
 * 打开导出对话框：选择导出范围（全部 / 某个分组 / 当前已选），确认后调用 onConfirm，由调用方负责真正导出。
 * 默认范围：有已选角色时为“当前已选”，否则“全部”。取消、Esc、点遮罩都不会导出。
 * @param {object} params
 * @param {Document} params.document 宿主页面 document
 * @param {object|function} params.library 当前角色库，或返回它的函数（打开时读取）
 * @param {string[]|function} [params.selectedIds] 当前已选的角色 id，或返回它们的函数（打开时读取）
 * @param {function} params.onConfirm 点击“导出”时以 { scope, groupId, groupName, ids, count, request } 调用；
 *        request 可直接传给 exportCharacters；抛错则对话框保持打开并显示错误
 * @param {function} [params.onClose] 对话框关闭（含取消、Esc、点遮罩、导出完成）时调用
 * @returns {{ element: Element, close: function, getChoice: function }}
 */
export function openCharacterExportDialog({ document, library, selectedIds, onConfirm, onClose } = {}) {
    if (!document?.body) throw new TypeError('缺少 document');
    const read = value => (typeof value === 'function' ? value() : value);
    const seq = (dialogSeq += 1);
    const info = describeExportScopes(read(library), read(selectedIds));
    const groupChoices = info.groups.filter(group => group.count > 0);

    const available = {
        all: info.total > 0,
        // 可选（含角色）的分组里至少要有一个真正的分组；只剩“未分组”一项时它与“全部”等价，不单独开放。
        // 空分组不可选，所以“只有未分组有角色、另有空分组”同样算只剩“未分组”。
        group: groupChoices.some(group => group.id !== UNGROUPED_ID),
        selection: info.selected.length > 0,
    };
    const state = {
        mode: info.selected.length > 0 ? 'selection' : (available.all ? 'all' : ''),
        groupId: groupChoices[0]?.id ?? UNGROUPED_ID,
        closed: false,
    };

    const titleId = `lwb-cid-title-${seq}`;
    const overlay = create(document, 'div', { className: 'lwb-cid-overlay', attrs: { 'data-role': 'overlay' } });
    const panel = create(document, 'div', {
        className: 'lwb-cid-panel lwb-cid-panel-compact',
        attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId, 'data-role': 'dialog' },
    });
    overlay.appendChild(panel);
    panel.appendChild(create(document, 'h3', { className: 'lwb-cid-title', text: '导出角色标签', attrs: { id: titleId } }));
    const body = create(document, 'div', { className: 'lwb-cid-body' });
    panel.appendChild(body);

    const section = create(document, 'fieldset', { className: 'lwb-cid-section', attrs: { 'data-role': 'scope-section' } });
    section.appendChild(create(document, 'legend', { className: 'lwb-cid-section-title', text: '导出范围' }));
    const radioName = `lwb-cid-scope-${seq}`;
    const radios = {};
    const rows = {};
    const makeRow = (mode, label, hint) => {
        const row = create(document, 'div', { className: 'lwb-cid-mode', attrs: { 'data-scope-row': mode } });
        const input = create(document, 'input', { attrs: { type: 'radio', name: radioName, value: mode, 'data-role': `scope-${mode}` } });
        const choice = create(document, 'label', { className: 'lwb-cid-choice' }, [
            input,
            create(document, 'span', { text: label, attrs: { 'data-role': `scope-${mode}-label` } }),
        ]);
        row.appendChild(choice);
        const hintNode = create(document, 'p', { className: 'lwb-cid-hint', text: hint, attrs: { 'data-role': `scope-${mode}-hint` } });
        row.appendChild(hintNode);
        section.appendChild(row);
        radios[mode] = input;
        rows[mode] = { row, choice, hintNode };
        return row;
    };

    makeRow('all', `全部（${info.total} 个角色）`, '当前没有可导出的角色。');

    const groupRow = makeRow('group', '某个分组', '当前没有包含角色的分组。');
    const groupSelect = create(document, 'select', {
        className: 'lwb-cid-input',
        attrs: { 'aria-label': '导出的分组', 'data-role': 'group-select' },
    });
    for (const group of info.groups) {
        const option = create(document, 'option', {
            text: group.count > 0 ? `${group.name}（${group.count} 个）` : `${group.name}（0 个，无可导出）`,
            attrs: { value: group.id },
        });
        if (group.count === 0) option.setAttribute('disabled', '');
        groupSelect.appendChild(option);
    }
    groupRow.insertBefore(groupSelect, rows.group.hintNode);

    makeRow('selection', `当前已选（${info.selected.length} 个）`, '没有多选的角色：先进入“多选”并勾选角色。');
    body.appendChild(section);

    const errorBox = create(document, 'p', { className: 'lwb-cid-alert', attrs: { role: 'alert', 'data-role': 'error', hidden: '' } });
    body.appendChild(errorBox);

    const footer = create(document, 'div', { className: 'lwb-cid-footer' });
    footer.appendChild(create(document, 'p', { className: 'lwb-cid-tip', text: '分组导出只包含该分组的角色。', attrs: { 'data-role': 'tip' } }));
    const cancelBtn = create(document, 'button', { className: 'lwb-cid-btn', text: '取消', attrs: { type: 'button', 'data-role': 'cancel' } });
    const confirmBtn = create(document, 'button', { className: 'lwb-cid-btn lwb-cid-btn-primary', text: '导出', attrs: { type: 'button', 'data-role': 'confirm' } });
    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);
    panel.appendChild(footer);

    const setShown = (node, shown) => {
        if (shown) node.removeAttribute('hidden');
        else node.setAttribute('hidden', '');
    };

    const refresh = () => {
        for (const [mode, input] of Object.entries(radios)) {
            const unavailable = !available[mode];
            input.disabled = unavailable;
            input.checked = state.mode === mode;
            rows[mode].row.classList.toggle('is-selected', state.mode === mode);
            rows[mode].row.classList.toggle('is-disabled', unavailable);
            rows[mode].choice.classList.toggle('is-disabled', unavailable);
            // 选项被禁用时才显示原因；“当前已选”的原因与计数无关，所以不在可用时露出
            setShown(rows[mode].hintNode, unavailable);
        }
        groupSelect.disabled = !available.group;
        confirmBtn.disabled = !state.mode || !available[state.mode];
    };

    const buildChoice = () => {
        if (state.mode === 'all') {
            return { scope: 'all', groupId: '', groupName: '', ids: [], count: info.total, request: { scope: 'all' } };
        }
        if (state.mode === 'group') {
            const group = info.groups.find(item => item.id === state.groupId);
            return {
                scope: 'group',
                groupId: state.groupId,
                groupName: group?.name || '',
                ids: [],
                count: group?.count || 0,
                request: { scope: 'group', groupId: state.groupId },
            };
        }
        const ids = [...info.selected];
        return { scope: 'selection', groupId: '', groupName: '', ids, count: ids.length, request: { scope: 'selection', ids } };
    };

    const selectMode = (mode) => {
        if (available[mode]) state.mode = mode;
        refresh();
    };
    for (const [mode, input] of Object.entries(radios)) input.addEventListener('change', () => selectMode(mode));
    groupSelect.addEventListener('change', () => {
        state.groupId = readSelectValue(groupSelect);
        selectMode('group');
    });

    const previousFocus = document.activeElement || null;
    const focusables = () => Array.from(panel.querySelectorAll('input, select, button')).filter(node => !node.disabled);

    const onKeydown = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault?.();
            event.stopPropagation?.();
            close();
            return;
        }
        if (event.key === 'Tab') {
            const items = focusables();
            if (!items.length) return;
            const index = items.indexOf(document.activeElement);
            if (event.shiftKey && index <= 0) {
                event.preventDefault?.();
                items[items.length - 1].focus();
            } else if (!event.shiftKey && (index === items.length - 1 || index < 0)) {
                event.preventDefault?.();
                items[0].focus();
            }
        }
    };

    function close() {
        if (state.closed) return;
        state.closed = true;
        document.removeEventListener('keydown', onKeydown, true);
        overlay.parentNode?.removeChild(overlay);
        try { previousFocus?.focus?.(); } catch { /* 原焦点元素已不在文档中时忽略 */ }
        onClose?.();
    }

    cancelBtn.addEventListener('click', close);
    // 只有直接点在遮罩上才关闭；面板内的点击不会冒泡成关闭
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) close();
    });
    confirmBtn.addEventListener('click', () => {
        if (confirmBtn.disabled) return;
        try {
            onConfirm?.(buildChoice());
        } catch (error) {
            errorBox.textContent = String(error?.message || '导出失败');
            setShown(errorBox, true);
            return;
        }
        close();
    });

    selectValue(groupSelect, state.groupId);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKeydown, true);
    refresh();
    try { (radios[state.mode] || cancelBtn).focus(); } catch { /* 不可聚焦环境（如无头 DOM）忽略 */ }

    return {
        element: overlay,
        close,
        getChoice: () => (state.mode ? buildChoice() : null),
    };
}
