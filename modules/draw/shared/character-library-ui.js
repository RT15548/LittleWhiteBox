// 角色标签库界面（SD WebUI / ComfyUI 共用）：分组、折叠、多选与批量、复制、拖拽排序、导入导出。
// 与 NovelAI 面板的区别：这里的角色列表是“每个角色一张展开的整表单卡”，DOM 才是真值，点“保存角色”才落盘。
// 因此所有库操作都作用在“草稿”上：先 getLibrary() 从表单读出当前草稿（含未保存的编辑），
// 交给 character-library.js 的纯函数得到新库，再 render() 重绘；本模块从不写盘，保存由宿主页面完成。
//
// 不得 import 酒馆内部模块：只依赖同目录的纯模块，DOM 全部经传入的 document；
// 用户文本（分组名、角色名、文件名）只用 textContent / 属性赋值，不拼 innerHTML。
// 样式见 character-library-ui.css（由宿主页面自行引入）。

import {
    MAX_IMPORT_FILE_BYTES,
    UNGROUPED_ID,
    UNGROUPED_NAME,
    addCharacter as addLibraryCharacter,
    createGroup,
    deleteCharacters as deleteLibraryCharacters,
    deleteGroup,
    duplicateCharacters,
    exportCharacters,
    getGroupedView,
    isGroupEnabled,
    moveCharacters,
    moveGroup,
    parseCharacterImport,
    placeGroup,
    renameGroup,
    setCharactersEnabled,
    setGroupEnabled,
    shiftCharacter,
} from './character-library.js';
import { buildCharacterExportFileName, openCharacterExportDialog, openCharacterImportDialog } from './character-library-dialog.js';
import { getCharacterEnabledFromCard } from './character-enabled-control.js';
import { autoScrollForPointer } from './character-list-scroll.js';

// 与 NovelAI 面板共用同一个键：折叠状态按分组 id 记录，三个面板看到的分组一致。
export const GROUP_COLLAPSE_STORAGE_KEY = 'lwb.draw.charGroupCollapsed';
const UNGROUPED_COLLAPSE_KEY = '__ungrouped__';
const CARD_CLASS = 'sd-char-card';
const DRAG_START_THRESHOLD_PX = 3;
const DOWNLOAD_REVOKE_DELAY_MS = 1000;
// 分组开关的文案：开关是分组自己的状态，与组内各角色自己的启用开关互相独立（有效启用 = 分组开 且 角色开）。
const GROUP_SWITCH_TITLE_ON = '关闭分组：组内角色不再参与出图，各角色自己的开关保持不变';
const GROUP_SWITCH_TITLE_OFF = '开启分组：组内角色按各自的开关参与出图';
const GROUP_OFF_NOTE = '分组已关闭';
const GROUP_OFF_NOTE_TITLE = '本分组已关闭，组内角色当前不参与出图；角色自己的开关保持不变';

// ── 纯函数（可单测）──────────────────────────────────────

/**
 * 拖拽落点：在一组纵向排列的元素（卡片或分组）里，按指针 Y 坐标决定插到哪里。
 * 被拖动的元素自己不参与定位，所以悬停在自己身上或两张卡片之间的空隙里，结果依然稳定。
 * @param {{id: string, top: number, bottom: number}[]} items 按显示顺序排列
 * @param {number} pointerY
 * @param {string[]} draggingIds
 * @returns {{position: 'before'|'after'|'into', refId: string}}
 *   before：插到 refId 之前；after：放到最后（refId 为当前最后一个未被拖动的元素）；into：容器里没有可参照的元素
 */
export function resolveInsertion(items, pointerY, draggingIds = []) {
    const dragging = new Set(draggingIds);
    const others = (Array.isArray(items) ? items : []).filter(item => !dragging.has(item.id));
    if (!others.length) return { position: 'into', refId: '' };
    const next = others.find(item => pointerY < item.top + (item.bottom - item.top) / 2);
    if (next) return { position: 'before', refId: next.id };
    return { position: 'after', refId: others[others.length - 1].id };
}

/** 拖动角色手柄时实际移动的集合：多选模式下拖动已选中的某一项，整体移动所有已选项；否则只动被拖的那一个。 */
export function resolveDragIds({ kind, id, selectMode = false, selectedIds = [] } = {}) {
    if (kind !== 'char') return [id];
    const selected = new Set(selectedIds);
    return selectMode && selected.has(id) && selected.size > 1 ? [...selected] : [id];
}

function collapseKeyOf(groupId) {
    return groupId || UNGROUPED_COLLAPSE_KEY;
}

function create(document, tag, { className, text, attrs } = {}, children = []) {
    const node = document.createElement(tag);
    if (className) node.setAttribute('class', className);
    if (text !== undefined) node.textContent = String(text);
    for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, String(value));
    for (const child of children) node.appendChild(child);
    return node;
}

function iconNode(document, classes) {
    return create(document, 'i', { className: classes, attrs: { 'aria-hidden': 'true' } });
}

function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

function stripGroupId(character) {
    const rest = { ...character };
    delete rest.groupId;
    return rest;
}

/**
 * 创建角色库界面。
 * @param {object} options
 * @param {Document} options.document 宿主页面（设置 iframe）的 document
 * @param {Element} options.listElement 角色列表容器；本模块在其中渲染分组与卡片
 * @param {Element} options.toolbarElement 工具栏容器；本模块在其中渲染“新建分组 / 多选”和批量栏
 * @param {function} options.readCharacters ({ keepEmpty }) => 从表单读出的角色数组。每个角色必须带 id（卡片的 dataset.characterId）；
 *        keepEmpty 为 true 时不丢弃全空的新卡片（库操作期间要保留它们，只有保存时才丢弃）
 * @param {function} options.renderCard ({ character, ordinal }) => 卡片元素。根节点 class 含 sd-char-card、dataset.characterId 为角色 id；
 *        头部含 .sd-char-card-header > .sd-char-card-title 与 .btn-group，本模块往里加拖拽手柄、复选框与复制按钮
 * @param {function} options.renderEmpty () => 没有任何角色也没有分组时显示的占位元素
 * @param {function} [options.onChange] 列表重绘或卡片增删后调用，参数 { count }
 * @param {{success: function, warning: function, error: function}} [options.notify] 提示（toastr）
 * @param {function} [options.confirm] 默认 document.defaultView.confirm
 * @param {function} [options.prompt] 默认 document.defaultView.prompt
 * @param {function} [options.getStorage] 返回 Storage（折叠状态用），默认 window.localStorage；任何异常都会被忽略
 * @param {function} [options.makeId] 透传给 character-library.js（测试用）
 * @param {function} [options.hitTest] (x, y) => Element，默认 document.elementFromPoint（测试用）
 * @param {function} [options.getRect] (element) => { top, bottom }，默认 getBoundingClientRect（测试用）
 * @param {function} [options.download] (fileName, data) => 触发下载，默认用 Blob + a[download]（测试用）
 * @param {string} [options.nameFieldSelector] 新建角色后聚焦的输入框选择器
 */
export function createCharacterLibraryUi(options = {}) {
    const {
        document,
        listElement: list,
        toolbarElement: toolbar,
        readCharacters,
        renderCard,
        renderEmpty,
        onChange,
        makeId,
        nameFieldSelector = '[data-sd-char-field="name"]',
    } = options;
    if (!document?.body) throw new TypeError('缺少 document');
    if (!list || !toolbar) throw new TypeError('缺少列表或工具栏容器');
    if (typeof readCharacters !== 'function' || typeof renderCard !== 'function') {
        throw new TypeError('缺少 readCharacters / renderCard');
    }
    const win = document.defaultView || null;
    const notify = {
        success: () => {},
        warning: () => {},
        error: () => {},
        ...(options.notify || {}),
    };
    const askConfirm = options.confirm || ((message) => win?.confirm?.(message) ?? false);
    const askPrompt = options.prompt || ((message, initial) => win?.prompt?.(message, initial) ?? null);
    const hitTest = options.hitTest || ((x, y) => document.elementFromPoint?.(x, y) ?? null);
    const getRect = options.getRect || (element => element.getBoundingClientRect());
    const download = options.download || ((fileName, data) => downloadJson(fileName, data));

    const state = {
        groups: [],
        order: [], // 角色 id，按库数组顺序；排序的唯一事实来源，读取草稿时据此还原数组顺序
        selectMode: false,
        selected: new Set(),
        collapsed: loadCollapsed(),
        rendered: false,
        drag: null,
        destroyed: false,
    };

    // ── 折叠状态（localStorage，全程 try/catch）──────────────
    function storage() {
        try {
            return options.getStorage ? options.getStorage() : (win?.localStorage ?? null);
        } catch {
            return null;
        }
    }

    function loadCollapsed() {
        try {
            const value = JSON.parse(storage()?.getItem(GROUP_COLLAPSE_STORAGE_KEY) || '{}');
            return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        } catch {
            return {};
        }
    }

    function saveCollapsed() {
        try { storage()?.setItem(GROUP_COLLAPSE_STORAGE_KEY, JSON.stringify(state.collapsed)); } catch { /* 隐私模式等 */ }
    }

    // ── 草稿读取 ─────────────────────────────────────────
    function cardsIn(root = list) {
        return Array.from(root.querySelectorAll(`.${CARD_CLASS}`));
    }

    function cardId(card) {
        return String(card?.dataset?.characterId || '');
    }

    function groupIdOfCard(card) {
        const section = card.closest?.('.lwb-cl-group');
        return section && list.contains(section) ? String(section.dataset.groupId || '') : UNGROUPED_ID;
    }

    function findCard(id) {
        return cardsIn().find(card => cardId(card) === id) || null;
    }

    /** 当前草稿：表单里的所有字段（含未保存的编辑）+ 卡片所在分组 + 记录的数组顺序。 */
    function getLibrary({ keepEmpty = true } = {}) {
        const groupOf = new Map(cardsIn().map(card => [cardId(card), groupIdOfCard(card)]));
        const rank = new Map(state.order.map((id, index) => [id, index]));
        const characters = readCharacters({ keepEmpty })
            .map((character, domIndex) => {
                const id = String(character.id || '');
                const groupId = groupOf.get(id) || UNGROUPED_ID;
                const base = stripGroupId(character);
                return {
                    character: groupId ? { ...base, groupId } : base,
                    rank: rank.has(id) ? rank.get(id) : Number.MAX_SAFE_INTEGER,
                    domIndex,
                };
            })
            .sort((a, b) => (a.rank - b.rank) || (a.domIndex - b.domIndex))
            .map(item => item.character);
        return { characters, groups: state.groups.map(group => ({ ...group })) };
    }

    // ── 渲染 ─────────────────────────────────────────────
    // 每个展开的分组有自己的滚动区（样式里的 max-height + overflow-y: auto）。整体重绘会换掉这些节点，
    // 滚动位置随之归零：重绘前记下各组的 scrollTop，重绘后恢复（例如在大分组中间点一下启用开关，不应该跳回组顶）。
    function captureGroupScroll() {
        const positions = new Map();
        list.querySelectorAll('.lwb-cl-group').forEach((section) => {
            const top = Number(section.querySelector('.lwb-cl-group-body')?.scrollTop) || 0;
            if (top > 0) positions.set(section.dataset.groupId || '', top);
        });
        return positions;
    }

    function restoreGroupScroll(positions) {
        if (!positions.size) return;
        list.querySelectorAll('.lwb-cl-group').forEach((section) => {
            const top = positions.get(section.dataset.groupId || '');
            const body = section.querySelector('.lwb-cl-group-body');
            if (top && body) body.scrollTop = top;
        });
    }

    function render(library) {
        const groupScroll = captureGroupScroll();
        const characters = Array.isArray(library?.characters) ? library.characters : [];
        // 分组开关 enabled 随分组一起带着，只在关闭时保留该键（与 character-library.js 的规范化一致）。
        state.groups = (Array.isArray(library?.groups) ? library.groups : []).map(group => (
            group.enabled === false ? { id: group.id, name: group.name, enabled: false } : { id: group.id, name: group.name }
        ));
        state.order = characters.map(character => String(character.id || ''));
        const existing = new Set(state.order);
        for (const id of [...state.selected]) if (!existing.has(id)) state.selected.delete(id);

        clearNode(list);
        state.rendered = true;
        const full = { characters, groups: state.groups };
        let ordinal = 0;
        const buildCard = (character) => {
            ordinal += 1;
            const card = renderCard({ character, ordinal });
            decorateCard(card, character);
            return card;
        };

        if (!characters.length && !state.groups.length) {
            list.appendChild(renderEmpty());
        } else if (!state.groups.length) {
            // 没有分组时保持原来的平铺外观
            characters.forEach(character => list.appendChild(buildCard(character)));
        } else {
            for (const group of getGroupedView(full)) {
                if (group.virtual && !group.total) continue;
                list.appendChild(buildGroupSection(group, buildCard));
            }
        }
        restoreGroupScroll(groupScroll);
        renderToolbar();
        syncSelectionControls();
        emitChange();
    }

    function emitChange() {
        onChange?.({ count: cardsIn().length });
    }

    function buildGroupSection(group, buildCard) {
        const collapsed = state.collapsed[collapseKeyOf(group.id)] === true;
        const section = create(document, 'section', {
            className: `lwb-cl-group${collapsed ? ' collapsed' : ''}`,
            attrs: { 'data-group-id': group.id },
        });

        const header = create(document, 'div', { className: 'lwb-cl-group-header' });
        const collapseButton = create(document, 'button', {
            className: 'lwb-cl-group-collapse',
            attrs: {
                type: 'button',
                'data-lwb-group-action': 'collapse',
                'aria-expanded': String(!collapsed),
                'aria-label': `${collapsed ? '展开' : '折叠'}分组 ${group.name}`,
                title: collapsed ? '展开' : '折叠',
            },
        }, [iconNode(document, `fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-down'}`)]);
        header.appendChild(collapseButton);
        if (state.selectMode) {
            header.appendChild(create(document, 'input', {
                className: 'lwb-cl-group-select',
                attrs: { type: 'checkbox', 'aria-label': `选择分组 ${group.name} 的全部角色` },
            }));
        }
        if (!group.virtual) {
            header.appendChild(create(document, 'span', {
                className: 'lwb-cl-handle',
                text: '⋮⋮',
                attrs: {
                    role: 'button',
                    tabindex: '0',
                    'data-drag-group': group.id,
                    title: '拖动调整分组顺序，也可聚焦后按 ↑ / ↓',
                    'aria-label': `拖动调整分组 ${group.name} 的顺序`,
                },
            }));
        }
        header.appendChild(create(document, 'span', { className: 'lwb-cl-group-name', text: group.name, attrs: { title: group.name } }));
        // 窄栏里分组名优先：计数只写“自己开着数/总数”，完整含义放在 title 里（updateGroupHeader 会按卡片当前状态刷新）。
        header.appendChild(create(document, 'span', {
            className: 'lwb-cl-group-count',
            text: `${group.own}/${group.total}`,
            attrs: { 'data-role': 'group-count' },
        }));

        const actions = create(document, 'div', { className: 'lwb-cl-group-actions' });
        const addAction = (action, title, icon, extraClass = '') => {
            actions.appendChild(create(document, 'button', {
                className: `lwb-cl-icon-btn${extraClass}`,
                attrs: {
                    type: 'button',
                    'data-lwb-group-action': action,
                    title,
                    'aria-label': `${title} ${group.name}`,
                },
            }, [iconNode(document, icon)]));
        };
        // 分组开关只给真实分组：未分组没有开关，始终参与出图。文案与状态由 updateGroupHeader 填。
        if (!group.virtual) addAction('toggle-enabled', '', 'fa-solid fa-toggle-on', ' lwb-cl-group-switch');
        addAction('add', '在本组添加角色', 'fa-solid fa-plus');
        if (!group.virtual) {
            addAction('rename', '重命名分组', 'fa-solid fa-pen');
            addAction('delete', '删除分组', 'fa-solid fa-trash');
        }
        header.appendChild(actions);
        section.appendChild(header);

        const body = create(document, 'div', { className: 'lwb-cl-group-body' });
        if (collapsed) body.setAttribute('hidden', '');
        if (group.characters.length) {
            group.characters.forEach(character => body.appendChild(buildCard(character)));
        } else {
            body.appendChild(create(document, 'div', { className: 'lwb-cl-group-empty', text: '本组暂无角色' }));
        }
        section.appendChild(body);
        updateGroupHeader(section);
        return section;
    }

    /**
     * 刷新分组头：计数（组内自己开着的角色数 / 总数，从卡片当前的启用开关推算，含尚未保存的切换）、
     * 分组开关（两态，读 state.groups）以及整组的“已关闭”外观。
     */
    function updateGroupHeader(section) {
        const cards = cardsIn(section);
        const own = cards.filter(card => getCharacterEnabledFromCard(card)).length;
        const groupId = String(section.dataset.groupId || '');
        const enabled = isGroupEnabled({ characters: [], groups: state.groups }, groupId);
        const name = section.querySelector('.lwb-cl-group-name')?.textContent || UNGROUPED_NAME;
        section.classList.toggle('lwb-cl-group-disabled', !enabled);
        const count = section.querySelector('[data-role="group-count"]');
        if (count) {
            count.textContent = `${own}/${cards.length}`;
            count.setAttribute('title', `组内自己开着的角色 ${own} 个，共 ${cards.length} 个${enabled ? '' : '；分组已关闭，组内角色当前都不参与出图'}`);
        }
        const toggle = section.querySelector('.lwb-cl-group-switch');
        if (toggle) {
            const title = enabled ? GROUP_SWITCH_TITLE_ON : GROUP_SWITCH_TITLE_OFF;
            toggle.setAttribute('title', title);
            toggle.setAttribute('aria-label', `${title} ${name}`);
            toggle.setAttribute('aria-pressed', String(enabled));
            toggle.classList.toggle('active', enabled);
            toggle.querySelector('i')?.setAttribute('class', `fa-solid ${enabled ? 'fa-toggle-on' : 'fa-toggle-off'}`);
        }
    }

    function refreshGroupHeaders() {
        list.querySelectorAll('.lwb-cl-group').forEach(section => updateGroupHeader(section));
    }

    /** 给卡片加上拖拽手柄、选择框、所属分组下拉与复制按钮。卡片本身的字段与既有事件不受影响。 */
    function decorateCard(card, character) {
        const id = cardId(card);
        const label = String(character?.name || '').trim() || '新角色';
        const title = card.querySelector('.sd-char-card-title');
        if (title) {
            const tools = create(document, 'span', { className: 'lwb-cl-card-tools' });
            tools.appendChild(create(document, 'span', {
                className: 'lwb-cl-handle',
                text: '⋮⋮',
                attrs: {
                    role: 'button',
                    tabindex: '0',
                    'data-drag-char': id,
                    title: '拖动排序，也可聚焦后按 ↑ / ↓',
                    'aria-label': `拖动排序 ${label}`,
                },
            }));
            if (state.selectMode) {
                tools.appendChild(create(document, 'input', {
                    className: 'lwb-cl-select',
                    attrs: { type: 'checkbox', 'data-select-char': id, 'aria-label': `选择 ${label}` },
                }));
            }
            title.insertBefore(tools, title.firstChild);
        }
        const actions = card.querySelector('.sd-char-card-header .btn-group');
        if (actions) {
            const duplicate = create(document, 'button', {
                className: 'btn btn-sm',
                attrs: { type: 'button', 'data-lwb-card-action': 'duplicate', 'data-id': id, title: '复制人设', 'aria-label': `复制 ${label}` },
            }, [iconNode(document, 'fa-solid fa-clone'), create(document, 'span', { text: '复制' })]);
            const remove = actions.querySelector('[data-sd-char-delete]');
            actions.insertBefore(duplicate, remove || null);
        }
        // 所在分组已关闭：卡片上给一个“分组已关闭”提示（启用复选框仍可点，仅表示当前不参与出图）。
        const ownGroup = state.groups.find(group => group.id === String(character?.groupId || ''));
        if (title && ownGroup && ownGroup.enabled === false) {
            title.appendChild(create(document, 'span', {
                className: 'lwb-cl-group-off-note',
                text: GROUP_OFF_NOTE,
                attrs: { title: GROUP_OFF_NOTE_TITLE },
            }));
        }
        if (state.groups.length) {
            const select = create(document, 'select', {
                className: 'input lwb-cl-card-group',
                attrs: { 'aria-label': `所属分组 ${label}`, 'data-card-group': id },
            });
            const options = [{ id: UNGROUPED_ID, name: UNGROUPED_NAME }, ...state.groups];
            for (const group of options) {
                const option = create(document, 'option', { text: group.name, attrs: { value: group.id } });
                if (group.id === String(character?.groupId || '')) option.setAttribute('selected', '');
                select.appendChild(option);
            }
            const row = create(document, 'div', { className: 'lwb-cl-card-group-row' }, [
                create(document, 'span', { className: 'lwb-cl-card-group-label', text: '所属分组' }),
                select,
            ]);
            const header = card.querySelector('.sd-char-card-header');
            if (header?.parentNode === card) card.insertBefore(row, header.nextSibling);
            else card.insertBefore(row, card.firstChild);
        }
    }

    // ── 工具栏与批量栏 ───────────────────────────────────
    let toolbarNodes = null;

    function buildToolbar() {
        clearNode(toolbar);
        const bar = create(document, 'div', { className: 'lwb-cl-toolbar' });
        const addGroup = create(document, 'button', {
            className: 'btn btn-sm',
            attrs: { type: 'button', 'data-role': 'group-add' },
        }, [iconNode(document, 'fa-solid fa-folder-plus'), create(document, 'span', { text: ' 新建分组' })]);
        const selectToggle = create(document, 'button', {
            className: 'btn btn-sm',
            attrs: { type: 'button', 'data-role': 'select-toggle', 'aria-pressed': 'false' },
        }, [iconNode(document, 'fa-regular fa-square-check'), create(document, 'span', { text: ' 多选' })]);
        const hint = create(document, 'span', {
            className: 'form-hint lwb-cl-toolbar-hint',
            text: '拖动 ⋮⋮ 调整顺序或分组；分组与排序同样需要点击“保存角色”后生效',
        });
        bar.append(addGroup, selectToggle, hint);

        const batch = create(document, 'div', { className: 'lwb-cl-batch-bar', attrs: { 'data-role': 'batch-bar', hidden: '' } });
        const count = create(document, 'span', { className: 'lwb-cl-batch-count', text: '已选 0 个', attrs: { 'data-role': 'batch-count' } });
        batch.appendChild(count);
        const batchButton = (action, text, { needsSelection = true, danger = false, title = '' } = {}) => {
            const button = create(document, 'button', {
                className: `btn btn-sm${danger ? ' btn-danger' : ''}`,
                text,
                attrs: { type: 'button', 'data-batch': action, ...(title ? { title } : {}) },
            });
            if (needsSelection) button.setAttribute('data-needs-selection', '');
            return button;
        };
        const target = create(document, 'select', {
            className: 'input lwb-cl-batch-target',
            attrs: { 'aria-label': '目标分组', 'data-role': 'batch-target' },
        });
        batch.append(
            batchButton('select-all', '全选', { needsSelection: false }),
            batchButton('enable', '启用'),
            batchButton('disable', '停用'),
            target,
            batchButton('move', '移到'),
            batchButton('copy-to', '复制到'),
            batchButton('copy', '就地复制'),
            batchButton('export', '导出所选', { title: '把所选角色（可跨组）导出为文件' }),
            batchButton('delete', '删除', { danger: true }),
            batchButton('exit', '完成', { needsSelection: false }),
        );
        toolbar.append(bar, batch);
        toolbarNodes = { addGroup, selectToggle, batch, count, target };
    }

    function renderToolbar() {
        if (!toolbarNodes) buildToolbar();
        const { selectToggle, batch, count, target } = toolbarNodes;
        selectToggle.classList.toggle('active', state.selectMode);
        selectToggle.setAttribute('aria-pressed', String(state.selectMode));
        if (state.selectMode) batch.removeAttribute('hidden');
        else batch.setAttribute('hidden', '');
        count.textContent = `已选 ${state.selected.size} 个`;
        const previous = readSelectValue(target);
        clearNode(target);
        for (const group of [{ id: UNGROUPED_ID, name: UNGROUPED_NAME }, ...state.groups]) {
            target.appendChild(create(document, 'option', { text: group.name, attrs: { value: group.id } }));
        }
        selectValue(target, state.groups.some(group => group.id === previous) ? previous : UNGROUPED_ID);
        batch.querySelectorAll('[data-needs-selection]').forEach((button) => {
            if (state.selected.size === 0) button.setAttribute('disabled', '');
            else button.removeAttribute('disabled');
        });
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

    /** 把选中集合同步回复选框（含分组复选框的半选态）与批量栏计数。 */
    function syncSelectionControls() {
        list.querySelectorAll('.lwb-cl-select').forEach((box) => {
            box.checked = state.selected.has(box.dataset.selectChar);
        });
        list.querySelectorAll('.lwb-cl-group-select').forEach((box) => {
            const section = box.closest('.lwb-cl-group');
            const ids = cardsIn(section).map(cardId);
            const picked = ids.filter(id => state.selected.has(id)).length;
            box.checked = ids.length > 0 && picked === ids.length;
            box.indeterminate = picked > 0 && picked < ids.length;
            box.disabled = ids.length === 0;
        });
        if (toolbarNodes) {
            toolbarNodes.count.textContent = `已选 ${state.selected.size} 个`;
            toolbarNodes.batch.querySelectorAll('[data-needs-selection]').forEach((button) => {
                if (state.selected.size === 0) button.setAttribute('disabled', '');
                else button.removeAttribute('disabled');
            });
        }
    }

    // ── 操作 ─────────────────────────────────────────────
    /** 统一错误出口：纯函数对非法输入会抛 TypeError，这里转成提示而不是让界面卡死。 */
    function run(action) {
        try {
            return action();
        } catch (error) {
            notify.error(error?.message || '操作失败');
            return undefined;
        }
    }

    function apply(nextLibrary) {
        render(nextLibrary);
    }

    function focusCard(id, { focusName = false } = {}) {
        const card = findCard(id);
        if (!card) return;
        card.scrollIntoView?.({ block: 'nearest' });
        if (focusName) card.querySelector(nameFieldSelector)?.focus?.();
    }

    function setCollapsedDom(section, collapsed) {
        section.classList.toggle('collapsed', collapsed);
        const body = section.querySelector('.lwb-cl-group-body');
        if (body) {
            if (collapsed) body.setAttribute('hidden', '');
            else body.removeAttribute('hidden');
        }
        const button = section.querySelector('[data-lwb-group-action="collapse"]');
        if (button) {
            const name = section.querySelector('.lwb-cl-group-name')?.textContent || '';
            button.setAttribute('aria-expanded', String(!collapsed));
            button.setAttribute('title', collapsed ? '展开' : '折叠');
            button.setAttribute('aria-label', `${collapsed ? '展开' : '折叠'}分组 ${name}`);
            button.querySelector('i')?.setAttribute('class', `fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-down'}`);
        }
    }

    function addCharacter({ groupId = UNGROUPED_ID } = {}) {
        return run(() => {
            const { library, id } = addLibraryCharacter(getLibrary(), { name: '' }, { groupId, makeId });
            if (groupId) {
                state.collapsed[collapseKeyOf(groupId)] = false;
                saveCollapsed();
            }
            apply(library);
            focusCard(id, { focusName: true });
            return id;
        });
    }

    function deleteCharacters(ids) {
        run(() => {
            ids.forEach(id => state.selected.delete(id));
            apply(deleteLibraryCharacters(getLibrary(), ids));
        });
    }

    function clearCharacters() {
        run(() => {
            state.selected.clear();
            apply({ characters: [], groups: getLibrary().groups });
        });
    }

    function duplicate(ids, { toGroupId } = {}) {
        return run(() => {
            const { library, newIds } = duplicateCharacters(
                getLibrary(),
                ids,
                toGroupId === undefined ? { makeId } : { toGroupId, makeId },
            );
            apply(library);
            if (newIds[0]) focusCard(newIds[0]);
            return newIds;
        });
    }

    function handleGroupAction(action, groupId, trigger) {
        if (action === 'collapse') {
            // 只改 DOM，不重绘：其他卡片里尚未保存的编辑完全不受影响。
            const section = trigger.closest('.lwb-cl-group');
            if (!section) return;
            const collapsed = !section.classList.contains('collapsed');
            state.collapsed[collapseKeyOf(groupId)] = collapsed;
            saveCollapsed();
            setCollapsedDom(section, collapsed);
            return;
        }
        run(() => {
            const library = getLibrary();
            const members = library.characters.filter(character => String(character.groupId || '') === groupId);
            const group = library.groups.find(item => item.id === groupId);
            if (action === 'toggle-enabled') {
                // 只切换分组自己的开关：不改任何角色的 enabled。
                apply(setGroupEnabled(library, groupId, !isGroupEnabled(library, groupId)));
            } else if (action === 'add') {
                addCharacter({ groupId });
            } else if (action === 'rename') {
                const name = askPrompt('分组名称', group?.name || '');
                if (name === null || name === undefined) return;
                apply(renameGroup(library, groupId, name));
            } else if (action === 'delete') {
                if (!askConfirm(`确定删除分组“${group?.name || ''}”？`)) return;
                let removeMembers = false;
                if (members.length) {
                    removeMembers = askConfirm(`该分组有 ${members.length} 个角色。\n\n确定：连同角色一起删除\n取消：保留角色，移到“未分组”`);
                }
                if (removeMembers) members.forEach(character => state.selected.delete(character.id));
                apply(deleteGroup(library, groupId, { deleteCharacters: removeMembers }));
            }
        });
    }

    function createNewGroup() {
        run(() => {
            const name = askPrompt('新分组名称', '');
            if (name === null || name === undefined) return;
            apply(createGroup(getLibrary(), name, { makeId }).library);
        });
    }

    function setSelectMode(on) {
        state.selectMode = Boolean(on);
        if (!state.selectMode) state.selected.clear();
        render(getLibrary());
    }

    function runBatchAction(action) {
        if (action === 'exit') { setSelectMode(false); return; }
        if (action === 'select-all') {
            cardsIn().forEach(card => state.selected.add(cardId(card)));
            syncSelectionControls();
            return;
        }
        const ids = [...state.selected];
        if (!ids.length) return;
        const target = toolbarNodes ? readSelectValue(toolbarNodes.target) : UNGROUPED_ID;
        run(() => {
            const library = getLibrary();
            if (action === 'enable' || action === 'disable') {
                apply(setCharactersEnabled(library, ids, action === 'enable'));
            } else if (action === 'move') {
                apply(moveCharacters(library, ids, { groupId: target }));
            } else if (action === 'copy' || action === 'copy-to') {
                const { library: next, newIds } = action === 'copy'
                    ? duplicateCharacters(library, ids, { makeId })
                    : duplicateCharacters(library, ids, { toGroupId: target, makeId });
                state.selected.clear();
                newIds.forEach(id => state.selected.add(id));
                apply(next);
            } else if (action === 'export') {
                exportFile({ scope: 'selection', ids });
            } else if (action === 'delete') {
                if (!askConfirm(`确定删除选中的 ${ids.length} 个角色？`)) return;
                deleteCharacters(ids);
            }
        });
    }

    // ── 导出 / 导入 ──────────────────────────────────────
    function downloadJson(fileName, data) {
        const blob = new win.Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = win.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // 延后释放：部分浏览器在 click 返回时尚未开始读取 blob
        win.setTimeout(() => win.URL.revokeObjectURL(url), DOWNLOAD_REVOKE_DELAY_MS);
    }

    /** request 见 exportCharacters；groupName 仅用于生成文件名。导出的是草稿（含未保存的编辑），且不含全空的新卡片。 */
    function exportFile(request, groupName = '') {
        try {
            const data = exportCharacters(getLibrary({ keepEmpty: false }), request);
            download(buildCharacterExportFileName({ scope: request.scope, groupName }), data);
            return data;
        } catch (error) {
            if (error instanceof TypeError) notify.warning(error.message);
            else notify.error(`导出失败：${error?.message || '未知错误'}`);
            return null;
        }
    }

    let exportDialog = null;

    /** “导出”入口：先选导出范围（全部 / 某个分组 / 当前已选），确认后才下载；取消不导出。导出的是草稿，且不含全空的新卡片。 */
    function openExportDialog() {
        if (!getLibrary({ keepEmpty: false }).characters.length) {
            notify.warning('没有可导出的角色');
            return null;
        }
        exportDialog?.close();
        exportDialog = openCharacterExportDialog({
            document,
            library: () => getLibrary({ keepEmpty: false }),
            selectedIds: () => [...state.selected],
            onConfirm: ({ request, groupName }) => { exportFile(request, groupName); },
            onClose: () => { exportDialog = null; },
        });
        return exportDialog;
    }

    let importDialog = null;

    /** 读取并校验文件，通过后打开导入对话框；确认后只改草稿，仍需用户点“保存角色”。 */
    async function importFile(file) {
        if (!file) return;
        if (file.size > MAX_IMPORT_FILE_BYTES) {
            const limitMb = MAX_IMPORT_FILE_BYTES / 1024 / 1024;
            const sizeMb = Math.ceil(file.size / 1024 / 1024 * 10) / 10;
            notify.error(`导入失败：文件过大（${sizeMb.toFixed(1)} MB），不能超过 ${limitMb} MB`);
            return;
        }
        let payload;
        try {
            payload = JSON.parse(await file.text());
        } catch {
            notify.error('导入失败：不是有效的 JSON 文件');
            return;
        }
        let parsed;
        try {
            parsed = parseCharacterImport(payload, { makeId });
        } catch (error) {
            notify.error(`导入失败：${error instanceof TypeError ? error.message : '无法识别的文件'}`);
            return;
        }
        importDialog?.close();
        importDialog = openCharacterImportDialog({
            document,
            library: () => getLibrary(),
            parsed,
            fileName: file.name,
            makeId,
            onConfirm: ({ plan }) => {
                const { added, replaced, keptBoth, groupsCreated } = plan.summary;
                apply(plan.library);
                const parts = [`新增 ${added}`, `替换 ${replaced}`];
                if (keptBoth) parts.push(`保留两者 ${keptBoth}`);
                if (groupsCreated) parts.push(`新建分组 ${groupsCreated}`);
                notify.success(`已导入：${parts.join('、')}。尚未保存，请点击“保存角色”`);
            },
            onClose: () => { importDialog = null; },
        });
    }

    // ── 拖拽排序（Pointer 事件：鼠标与触屏通用）──────────────
    function clearDropMarks() {
        document.querySelectorAll('.lwb-cl-drop-before, .lwb-cl-drop-after, .lwb-cl-drop-into').forEach((node) => {
            node.classList.remove('lwb-cl-drop-before', 'lwb-cl-drop-after', 'lwb-cl-drop-into');
        });
    }

    function startDrag(event, kind, id) {
        if (event.button !== undefined && event.button !== 0) return;
        const ids = resolveDragIds({ kind, id, selectMode: state.selectMode, selectedIds: [...state.selected] });
        state.drag = {
            kind,
            ids,
            pointerId: event.pointerId,
            target: null,
            moved: false,
            startY: event.clientY,
        };
        event.preventDefault?.();
        try { event.target.setPointerCapture?.(event.pointerId); } catch { /* 指针已失效时忽略，仍可用文档级监听完成拖拽 */ }
        document.body.classList.add('lwb-cl-is-dragging');
        for (const dragId of ids) {
            const node = kind === 'char'
                ? findCard(dragId)
                : Array.from(list.querySelectorAll('.lwb-cl-group')).find(section => section.dataset.groupId === dragId);
            node?.classList.add('lwb-cl-dragging');
        }
    }

    function rectOf(element) {
        const rect = getRect(element);
        return { top: rect.top, bottom: rect.bottom };
    }

    /** 根据指针位置算出落点：{ node（画标记的元素）, mark, groupId, beforeId, beforeGroupId }；无效位置返回 null。 */
    function resolveDropTarget(event) {
        const hit = hitTest(event.clientX, event.clientY);
        if (!hit || !list.contains(hit)) return null;
        const y = event.clientY;

        if (state.drag.kind === 'group') {
            const sections = Array.from(list.querySelectorAll('.lwb-cl-group')).filter(section => section.dataset.groupId);
            const items = sections.map(section => ({ id: section.dataset.groupId, ...rectOf(section) }));
            const result = resolveInsertion(items, y, state.drag.ids);
            if (result.position === 'into') return null;
            const node = sections.find(section => section.dataset.groupId === result.refId);
            return result.position === 'before'
                ? { node, mark: 'lwb-cl-drop-before', beforeGroupId: result.refId }
                : { node, mark: 'lwb-cl-drop-after', beforeGroupId: '' };
        }

        const section = hit.closest('.lwb-cl-group');
        // 有分组时，命中列表本身（分组之间的缝隙）不属于任何分组：取消落点，而不是当成“未分组”。
        if (!section && state.groups.length) return null;
        if (section && hit.closest('.lwb-cl-group-header')) {
            return { node: section.querySelector('.lwb-cl-group-header'), mark: 'lwb-cl-drop-into', groupId: section.dataset.groupId || '' };
        }
        const container = section ? section.querySelector('.lwb-cl-group-body') : list;
        const groupId = section ? (section.dataset.groupId || '') : '';
        const cards = cardsIn(container).filter(card => groupIdOfCard(card) === groupId);
        const items = cards.map(card => ({ id: cardId(card), ...rectOf(card) }));
        const result = resolveInsertion(items, y, state.drag.ids);
        if (result.position === 'into') {
            return section
                ? { node: section.querySelector('.lwb-cl-group-header'), mark: 'lwb-cl-drop-into', groupId }
                : null;
        }
        const node = cards.find(card => cardId(card) === result.refId);
        return result.position === 'before'
            ? { node, mark: 'lwb-cl-drop-before', groupId, beforeId: result.refId }
            : { node, mark: 'lwb-cl-drop-after', groupId };
    }

    function onDragMove(event) {
        const drag = state.drag;
        if (!drag || event.pointerId !== drag.pointerId) return;
        if (Math.abs(event.clientY - drag.startY) > DRAG_START_THRESHOLD_PX) drag.moved = true;
        // 靠近滚动区上下缘时先自动滚动（最近的分组滚动区 → 外层容器 → 整页），再按滚动后的实时位置算落点。
        autoScrollForPointer({
            start: hitTest(event.clientX, event.clientY) || list,
            pointerY: event.clientY,
            getStyle: element => win?.getComputedStyle?.(element),
            getRect: element => rectOf(element),
            viewport: { top: 0, bottom: win?.innerHeight ?? 0 },
            pageScroller: document.scrollingElement || document.documentElement,
            // 拖动“分组”时落点只看分组头，不依赖组内容：不去滚分组内部，直接带动外层 / 整页。
            skipContainer: drag.kind === 'group' ? (element => element.classList?.contains('lwb-cl-group-body')) : null,
        });
        clearDropMarks();
        drag.target = resolveDropTarget(event);
        drag.target?.node?.classList.add(drag.target.mark);
    }

    function endDrag(event, cancelled = false) {
        const drag = state.drag;
        if (!drag || (event && event.pointerId !== drag.pointerId)) return;
        state.drag = null;
        clearDropMarks();
        document.body.classList.remove('lwb-cl-is-dragging');
        document.querySelectorAll('.lwb-cl-dragging').forEach(node => node.classList.remove('lwb-cl-dragging'));
        if (cancelled || !drag.moved || !drag.target) return;
        run(() => {
            const library = getLibrary();
            if (drag.kind === 'group') {
                const next = placeGroup(library, drag.ids[0], drag.target.beforeGroupId || '');
                if (next !== library) apply(next);
            } else {
                apply(moveCharacters(library, drag.ids, {
                    groupId: drag.target.groupId || '',
                    beforeId: drag.target.beforeId || '',
                }));
            }
        });
    }

    // 手柄聚焦后按 ↑ / ↓：角色在同组内移动一位，分组在分组之间移动一位；已在边界时不动。
    function handleHandleKeydown(event) {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        const charHandle = event.target.closest?.('[data-drag-char]');
        const groupHandle = charHandle ? null : event.target.closest?.('[data-drag-group]');
        if (!charHandle && !groupHandle) return;
        event.preventDefault?.();
        const delta = event.key === 'ArrowUp' ? -1 : 1;
        run(() => {
            const library = getLibrary();
            if (charHandle) {
                const id = charHandle.dataset.dragChar;
                const next = shiftCharacter(library, id, delta);
                if (next === library) return;
                apply(next);
                // 重绘后把焦点还给同一个手柄，便于连续按键；被移动的卡保持在分组滚动区的可视范围内
                const moved = findCard(id);
                moved?.querySelector('[data-drag-char]')?.focus?.();
                moved?.scrollIntoView?.({ block: 'nearest' });
            } else {
                const id = groupHandle.dataset.dragGroup;
                const next = moveGroup(library, id, delta);
                if (next === library) return;
                apply(next);
                const handle = Array.from(list.querySelectorAll('[data-drag-group]')).find(node => node.dataset.dragGroup === id);
                handle?.focus?.();
                handle?.closest?.('.lwb-cl-group')?.scrollIntoView?.({ block: 'nearest' });
            }
        });
    }

    // ── 事件绑定 ─────────────────────────────────────────
    const listeners = [];
    function listen(target, type, handler, capture) {
        target.addEventListener(type, handler, capture);
        listeners.push(() => target.removeEventListener(type, handler, capture));
    }

    listen(list, 'click', (event) => {
        const groupButton = event.target.closest?.('[data-lwb-group-action]');
        if (groupButton) {
            const section = groupButton.closest('.lwb-cl-group');
            handleGroupAction(groupButton.dataset.lwbGroupAction, section?.dataset.groupId || '', groupButton);
            return;
        }
        const duplicateButton = event.target.closest?.('[data-lwb-card-action="duplicate"]');
        if (duplicateButton) duplicate([duplicateButton.dataset.id]);
    });

    listen(list, 'change', (event) => {
        const box = event.target;
        if (box.classList?.contains('lwb-cl-select')) {
            if (box.checked) state.selected.add(box.dataset.selectChar); else state.selected.delete(box.dataset.selectChar);
            syncSelectionControls();
        } else if (box.classList?.contains('lwb-cl-group-select')) {
            const section = box.closest('.lwb-cl-group');
            cardsIn(section).forEach((card) => {
                if (box.checked) state.selected.add(cardId(card)); else state.selected.delete(cardId(card));
            });
            syncSelectionControls();
        } else if (box.classList?.contains('lwb-cl-card-group')) {
            run(() => apply(moveCharacters(getLibrary(), [box.dataset.cardGroup], { groupId: readSelectValue(box) })));
        } else if (box.hasAttribute?.('data-character-enabled-control')) {
            // 卡片自己的启用开关变了：不重绘，只刷新分组头的计数（分组开关不受角色开关影响）
            refreshGroupHeaders();
        }
    });

    listen(list, 'pointerdown', (event) => {
        const charHandle = event.target.closest?.('[data-drag-char]');
        const groupHandle = event.target.closest?.('[data-drag-group]');
        if (charHandle) startDrag(event, 'char', charHandle.dataset.dragChar);
        else if (groupHandle) startDrag(event, 'group', groupHandle.dataset.dragGroup);
    });
    listen(list, 'keydown', handleHandleKeydown);
    listen(document, 'pointermove', onDragMove);
    listen(document, 'pointerup', event => endDrag(event));
    listen(document, 'pointercancel', event => endDrag(event, true));

    buildToolbar();
    listen(toolbar, 'click', (event) => {
        const button = event.target.closest?.('button');
        if (!button) return;
        if (button.dataset.role === 'group-add') createNewGroup();
        else if (button.dataset.role === 'select-toggle') setSelectMode(!state.selectMode);
        else if (button.dataset.batch && !button.disabled) runBatchAction(button.dataset.batch);
    });

    return {
        document,
        render,
        /** 以当前草稿重绘（表单内容原样保留）。 */
        rerender: () => render(getLibrary()),
        /**
         * 只把草稿里分组的开关同步成 latestGroups 里的值（预设在面板外改了分组开关时用，避免之后“保存角色”写回旧值）。
         * groupIds 给定时只同步这些分组，缺省同步全部同 id 分组；角色、分组名、顺序等其它草稿内容不动。
         * 有开关变化才重绘（表单内容原样保留），返回是否变化。
         */
        syncGroupEnabled(latestGroups, groupIds) {
            if (!state.rendered || !Array.isArray(latestGroups)) return false;
            const only = Array.isArray(groupIds) ? new Set(groupIds) : null;
            const latest = new Map(latestGroups.map(group => [group?.id, group?.enabled !== false]));
            let changed = false;
            const groups = state.groups.map((group) => {
                if ((only && !only.has(group.id)) || !latest.has(group.id)) return group;
                const enabled = latest.get(group.id);
                if ((group.enabled !== false) === enabled) return group;
                changed = true;
                return { ...group, enabled };
            });
            if (!changed) return false;
            render({ ...getLibrary(), groups });
            return true;
        },
        getLibrary,
        /** 保存用：全空的新卡片会被丢弃（与旧版“保存角色”行为一致）。 */
        getCharacters: ({ keepEmpty = false } = {}) => getLibrary({ keepEmpty }).characters,
        getGroups: () => state.groups.map(group => ({ ...group })),
        getCardCount: () => cardsIn().length,
        isRendered: () => state.rendered,
        getSelectedIds: () => [...state.selected],
        isSelectMode: () => state.selectMode,
        addCharacter,
        deleteCharacters,
        clearCharacters,
        duplicate,
        openExportDialog,
        importFile,
        destroy() {
            if (state.destroyed) return;
            state.destroyed = true;
            importDialog?.close();
            exportDialog?.close();
            listeners.splice(0).forEach(off => off());
            document.body?.classList?.remove('lwb-cl-is-dragging');
        },
    };
}
