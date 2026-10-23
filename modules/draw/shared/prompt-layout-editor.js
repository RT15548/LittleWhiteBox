// 提示词"请求结构"编辑器（后端无关的共享 UI 组件；NovelAI 先用，SD WebUI / ComfyUI 之后接入）。
// 受控组件：布局数据由宿主页面持有（草稿 / 已保存版本经 getLayout / getSavedLayout 取），
// 用户操作时用 scene-planner-layout.js 的纯操作算出新布局，交给 onChange(newLayout)，由页面决定怎么存草稿。
// 组件自己不碰存储、不发消息、不依赖页面全局；DOM、confirm、滚动、跳转到"去编辑"的目标全部经参数注入。
// 只用 createElement / textContent / 属性赋值，不拼 HTML 字符串，用户文本不会被当成标记解析。
// 样式见 ./prompt-layout-editor.css（class 前缀 lwb-ple-，不依赖页面样式）。
//
// 重绘规则（输入法与焦点）：input / change 只改数据和原地更新文字，绝不重建 DOM；
// 只有结构变化（添加 / 删除 / 移动 / 恢复默认 / 展开收起）才重建列表，且重建前后会还原焦点与选区。
//
// 展开与选择是两件独立的事，都只存在于本页面、不进布局数据：
// - 展开（手风琴）：同一时间最多编辑一条消息；内置表单由宿主提供，折叠时保留原节点。
// - 选择（多选）：“多选”按钮或 Ctrl / Shift 点击行头；选中的行拖动时整组一起动，选择条里可批量复制 / 删除 / 启用 / 停用。
//   复制与删除只针对自定义块，内置块自动跳过。删除和批量复制后出现“撤销”条，还原操作前的整份布局。
// - 附带工具：自定义消息展开后可以勾“附带工具”，多出一个代码框；消息启用，工具才注册。编辑器只做文本层面的提示
//   （从代码里读出 name），不执行代码；“试运行”经 onTestTool 交给宿主在沙盒里跑，结果显示在块里。
//   取消勾选只是把工具从布局里拿掉，代码留在本页面的内存里，再勾上会恢复（保存 / 刷新后不保留）。

import {
    CUSTOM_BLOCK_ROLES,
    MAX_TOOLS,
    addBlockAfter,
    createCustomBlock,
    createDefaultLayout,
    describeBlock,
    duplicateBlocks,
    getToolCodeLengthError,
    hasTool,
    isDefaultLayout,
    layoutFingerprint,
    layoutForStorage,
    moveBlocks,
    normalizeLayout,
    removeBlock,
    removeBlocks,
    reorderBlocks,
    setBlocksEnabled,
    updateBlock,
} from './scene-planner-layout.js';
import { createSortableList, moveIdToIndex } from './sortable-list.js';
import { DEFAULT_TOOL_CODE, extractToolName } from './custom-tools.js';

// 页面是普通脚本、拿不到 scene-planner-layout.js，经本模块转手（指纹 / 默认判断 / 存储形态都以契约模块为准）。
export { createDefaultLayout, isDefaultLayout, layoutFingerprint, layoutForStorage, normalizeLayout };

const PREVIEW_LENGTH = 40;
const EMPTY_TITLE = '（空消息）';
const ROW_SELECTOR = '.lwb-ple-row';
const HANDLE_SELECTOR = '[data-ple-drag]';
// 点这些控件时即使按着 Ctrl / Shift 也不当作“选择行”。
const MODIFIER_IGNORE_SELECTOR = 'textarea, select, input[type="text"], [data-ple-field="toggle"], [data-ple-field="tool-toggle"], [data-ple-field="select"], [data-ple-field="edit"], [data-ple-field="delete"]';

/** 标题里的内容预览：取第一个非空行，压成单行并截断。 */
export function previewText(content, limit = PREVIEW_LENGTH) {
    const firstLine = String(content ?? '').split(/\r?\n/).map(line => line.trim()).find(Boolean) || '';
    const chars = Array.from(firstLine);
    return chars.length > limit ? `${chars.slice(0, limit).join('')}…` : firstLine;
}

/**
 * 排序后哪一项被移动了：新旧顺序里各自拿掉某一项后其余相同的那一项。
 * 拖拽 / 键盘排序的回调只给完整的新顺序，播报"谁移到了第几位"要靠它反推。
 */
export function findMovedId(oldIds, newIds) {
    const at = oldIds.findIndex((id, index) => id !== newIds[index]);
    if (at < 0) return null;
    const same = (a, b) => a.length === b.length && a.every((id, index) => id === b[index]);
    for (const candidate of [oldIds[at], newIds[at]]) {
        if (same(oldIds.filter(id => id !== candidate), newIds.filter(id => id !== candidate))) return candidate;
    }
    return null;
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

function setHidden(node, hidden) {
    if (hidden) node.setAttribute('hidden', '');
    else node.removeAttribute('hidden');
}

function blocksOf(layout) {
    return Array.isArray(layout?.blocks) ? layout.blocks : normalizeLayout(layout).layout.blocks;
}

/**
 * @param {object} options
 * @param {Document} options.document
 * @param {Element} options.container 编辑器画在这里面（卡片的内容区）；组件只改它的内容
 * @param {function(): object} [options.getLayout] 当前生效的布局（草稿优先）。不传则组件自己持有布局，经 setLayout 设置
 * @param {function(): string} [options.getOwnerKey] 当前预设的稳定标识；切换时清理撤销、选择和展开状态
 * @param {function(): (object|null)} [options.getSavedLayout] 已保存的布局，用来判断"未保存"徽标；缺省时拿 setLayout 最近一次设置的值比
 * @param {function(object): void} options.onChange 每次用户修改后的新布局（已规范化）。输入框打字也会调，但不会因此重绘
 * @param {function(string): ({summary?: string, label?: string, action?: ('edit'|'view'|null)}|null)} [options.describeBuiltin]
 *        内置块的一行摘要；action 决定按钮动作；label 可覆盖契约里的显示名
 * @param {Object<string, Element>} [options.builtinEditors] 宿主拥有的内置文本表单节点
 * @param {Element} [options.editorParking] 折叠时保留表单的隐藏容器
 * @param {function(string): void} [options.onEditBuiltin] 点内置块的按钮（去编辑 / 查看）
 * @param {function(string): boolean} [options.confirm] 危险操作前的确认；缺省一律视为确认
 * @param {function(string): void} [options.announce] 额外的播报通道（组件自带一条 aria-live 状态行，这里是可选的镜像）
 * @param {function(PointerEvent, Element): void} [options.autoScroll] 拖拽中靠近边缘时滚动（第二个参数是列表容器）
 * @param {function(): string} [options.getDisabledReason] 返回非空字符串 = 编辑器停用并显示这段说明（例如宿主版本太旧）
 * @param {function(object): Promise<{ok: boolean, message: string}>} [options.onTestTool] 工具块“试运行”：宿主在沙盒里读出这个块的工具定义，返回要显示的结果；不传则不显示按钮
 * @param {function(): number} [options.random] 自定义块 id 的随机源，默认 Math.random
 * @returns {{render: function(object=): void, setLayout: function(object): void, refreshSummaries: function(): void, refreshStatus: function(): void, getLayout: function(): object, destroy: function(): void}}
 */
export function createPromptLayoutEditor({
    document,
    container,
    getLayout = null,
    getOwnerKey = () => null,
    getSavedLayout = null,
    onChange,
    describeBuiltin = null,
    onEditBuiltin = null,
    builtinEditors = {},
    editorParking = null,
    confirm = null,
    announce = null,
    autoScroll = null,
    getDisabledReason = null,
    onTestTool = null,
    random = Math.random,
} = {}) {
    if (!document || !container || typeof onChange !== 'function') throw new TypeError('缺少 document / container / onChange');

    // 自持模式：没给 getLayout 时，布局存在组件里。
    let ownLayout = createDefaultLayout();
    let ownSaved = ownLayout;
    const readLayout = () => (getLayout ? getLayout() : ownLayout);
    const readSaved = () => (getSavedLayout ? getSavedLayout() : ownSaved);

    const expanded = new Set(); // 正在编辑的块 id（最多一个）；只存在于本页面，不进布局数据
    const selected = new Set(); // 选中的块 id（内置块也可以选，用于整组拖动）；同样不进布局数据
    let selectMode = false; // “多选”模式：每行前出现选择框
    let anchorId = null; // Shift 选范围的起点
    let lastSelectedId = null; // 最近一次选中的块：没有展开项时，新消息插在它下方
    let undoState = null; // { layout } 删除 / 批量复制前的整份布局
    let pendingFocus = null; // 重建后要聚焦的 { id, field }
    let lastSignature = null;
    let renderedOwnerKey = getOwnerKey();
    let sortable = null;
    let mounted = false;
    const toolDrafts = new Map(); // 预设与块 id → 本页面内取消勾选前的代码
    const listeners = [];

    // ── 外壳：只建一次，列表在里面重建，状态行（aria-live）因此不会被换掉 ──
    const root = create(document, 'div', { className: 'lwb-ple', attrs: { 'data-ple': '' } });
    const titleIcon = create(document, 'i', { className: 'fa-solid fa-link lwb-ple-title-icon', attrs: { 'aria-hidden': 'true' } });
    const titleNode = create(document, 'span', { className: 'lwb-ple-title', text: '请求结构' });
    const dirtyBadge = create(document, 'span', { className: 'lwb-ple-dirty', text: '未保存', attrs: { hidden: true, 'data-ple-dirty': '' } });
    const addButton = create(document, 'button', { className: 'lwb-ple-btn lwb-ple-btn-primary', text: '添加消息', attrs: { type: 'button', 'data-ple-add': '', title: '在当前展开的消息下方添加一条自定义消息（没有展开项时，加在最近选中的消息下方，再没有就加在末尾）' } });
    const selectModeButton = create(document, 'button', { className: 'lwb-ple-btn', text: '多选', attrs: { type: 'button', 'data-ple-select-mode': '', 'aria-pressed': 'false', title: '显示选择框；也可以按住 Ctrl / Shift 点击消息行选择（Shift 选范围）' } });
    const resetButton = create(document, 'button', { className: 'lwb-ple-btn', text: '恢复默认结构', attrs: { type: 'button', 'data-ple-reset': '', title: '恢复内置块的默认顺序并移除自定义消息（只改草稿，保存后才生效）' } });
    const hint = create(document, 'p', {
        className: 'lwb-ple-hint',
        text: '按发送顺序排列。点击编辑，拖动手柄调整顺序。',
    });
    const notice = create(document, 'p', { className: 'lwb-ple-notice', attrs: { hidden: true, role: 'alert', 'data-ple-notice': '' } });
    const selectionCount = create(document, 'span', { className: 'lwb-ple-selection-count', attrs: { 'data-ple-selection-count': '' } });
    const copyButton = create(document, 'button', { className: 'lwb-ple-btn lwb-ple-btn-small', text: '复制', attrs: { type: 'button', 'data-ple-bulk': 'copy', title: '复制选中的自定义消息，副本放在原消息下方（内置块不能复制）' } });
    const bulkDeleteButton = create(document, 'button', { className: 'lwb-ple-btn lwb-ple-btn-small lwb-ple-btn-danger', text: '删除', attrs: { type: 'button', 'data-ple-bulk': 'delete', title: '删除选中的自定义消息（内置块不能删除）' } });
    const bulkEnableButton = create(document, 'button', { className: 'lwb-ple-btn lwb-ple-btn-small', text: '停用', attrs: { type: 'button', 'data-ple-bulk': 'enable' } });
    const clearSelectionButton = create(document, 'button', { className: 'lwb-ple-btn lwb-ple-btn-small', text: '取消选择', attrs: { type: 'button', 'data-ple-bulk': 'clear' } });
    const selectionNote = create(document, 'span', { className: 'lwb-ple-selection-note', attrs: { 'data-ple-selection-note': '' } });
    const selectionBar = create(document, 'div', { className: 'lwb-ple-selection-bar', attrs: { hidden: true, 'data-ple-selection-bar': '' } }, [
        selectionCount, copyButton, bulkDeleteButton, bulkEnableButton, clearSelectionButton, selectionNote,
    ]);
    const list = create(document, 'div', { className: 'lwb-ple-list', attrs: { role: 'list', 'aria-label': '请求结构' } });
    const undoText = create(document, 'span', { className: 'lwb-ple-undo-text', attrs: { 'data-ple-undo-text': '' } });
    const undoButton = create(document, 'button', { className: 'lwb-ple-btn lwb-ple-btn-small', text: '撤销', attrs: { type: 'button', 'data-ple-undo': '' } });
    const undoClose = create(document, 'button', { className: 'lwb-ple-btn lwb-ple-btn-small', text: '×', attrs: { type: 'button', 'data-ple-undo-close': '', 'aria-label': '关闭撤销提示' } });
    const undoBar = create(document, 'div', { className: 'lwb-ple-undo-bar', attrs: { hidden: true, role: 'status', 'data-ple-undo-bar': '' } }, [undoText, undoButton, undoClose]);
    const status = create(document, 'div', { className: 'lwb-ple-status', attrs: { role: 'status', 'aria-live': 'polite', 'data-ple-status': '' } });
    root.appendChild(create(document, 'div', { className: 'lwb-ple-head' }, [
        create(document, 'div', { className: 'lwb-ple-headline' }, [titleIcon, titleNode, dirtyBadge]),
        create(document, 'div', { className: 'lwb-ple-actions' }, [addButton, selectModeButton, resetButton]),
    ]));
    root.appendChild(hint);
    root.appendChild(notice);
    root.appendChild(selectionBar);
    root.appendChild(list);
    root.appendChild(undoBar);
    root.appendChild(status);

    function say(text) {
        status.textContent = text;
        announce?.(text);
    }

    function listen(target, type, handler) {
        target.addEventListener(type, handler);
        listeners.push(() => target.removeEventListener(type, handler));
    }

    const disabledReason = () => String(getDisabledReason?.() || '');

    function builtinInfo(id) {
        const described = describeBuiltin?.(id) || {};
        return {
            summary: String(described.summary ?? ''),
            label: described.label ? String(described.label) : '',
            action: described.action === null ? null : (described.action === 'view' ? 'view' : 'edit'),
        };
    }

    // ── 行 ──

    function roleBadge(role) {
        return create(document, 'span', { className: `lwb-ple-role ${role}`, text: role, attrs: { 'data-ple-role': '' } });
    }

    function customTitle(block) {
        const name = String(block.name || '').trim();
        if (name) return name;
        return previewText(block.content) || (hasTool(block) && extractToolName(block.tool.code)) || EMPTY_TITLE;
    }

    // 折叠行上的小徽标：🛠 + 从代码读到的工具名（只是文本匹配）。
    function toolTagText(block) {
        return `🛠 ${extractToolName(block.tool.code) || '工具'}`;
    }

    function countText(block) {
        return hasTool(block) ? `${block.content.length} 字 · ${block.tool.code.length} 字代码` : `${block.content.length} 字`;
    }

    // “读到的工具名”提示：只是文本匹配，不代表代码能跑通。
    function toolNameText(block) {
        const found = extractToolName(block.tool.code);
        return found
            ? `从代码读到的工具名：${found}（试运行或实际规划时才会真正校验）`
            : '没有从代码里读到 name，请检查 return 的对象里是否写了 name: "…"';
    }

    function buildHandle(block, label) {
        return create(document, 'span', {
            className: 'lwb-ple-handle',
            text: '⋮⋮',
            attrs: {
                role: 'button',
                tabindex: '0',
                'data-ple-drag': block.id,
                'data-ple-field': 'handle',
                title: '拖动调整顺序，也可聚焦后按 ↑ / ↓',
                'aria-label': `拖动调整 ${label} 的顺序`,
            },
        });
    }

    function buildSelectBox(block, label) {
        const box = create(document, 'input', {
            attrs: { type: 'checkbox', 'data-ple-field': 'select', 'aria-label': `选择 ${label}`, title: '选中（Shift 点击选范围）' },
        });
        return create(document, 'label', { className: 'lwb-ple-select-box' }, [box]);
    }

    function buildBuiltinRow(block) {
        const meta = describeBlock(block);
        const info = builtinInfo(block.id);
        const label = info.label || meta.label;
        const editor = builtinEditors[block.id];
        const open = expanded.has(block.id);
        const row = create(document, 'div', {
            className: `lwb-ple-row lwb-ple-builtin${open ? ' expanded' : ''}`,
            attrs: { role: 'listitem', 'data-block-id': block.id, 'data-builtin': 'true' },
        });
        const line = create(document, 'div', { className: 'lwb-ple-line' }, [
            buildHandle(block, label),
            buildSelectBox(block, label),
            create(document, 'span', { className: 'lwb-ple-lock', attrs: { title: '内置块：内容固定，只能移动，不能删除', role: 'img', 'aria-label': '内置块' } }, [
                create(document, 'i', { className: 'fa-solid fa-lock', attrs: { 'aria-hidden': 'true' } }),
            ]),
            roleBadge(meta.role),
            create(document, editor ? 'button' : 'span', {
                className: editor ? 'lwb-ple-main lwb-ple-label' : 'lwb-ple-label', text: label,
                attrs: editor ? { type: 'button', 'data-ple-field': 'main', 'aria-expanded': String(open) } : {},
            }),
            create(document, 'span', { className: 'lwb-ple-summary', text: info.summary, attrs: { 'data-ple-summary': '' } }),
        ]);
        if (info.action) {
            const verb = editor ? (open ? '收起' : '编辑') : info.action === 'view' ? '查看' : '设置';
            line.appendChild(create(document, 'button', {
                className: 'lwb-ple-btn lwb-ple-btn-small',
                text: verb,
                attrs: { type: 'button', 'data-ple-field': 'edit', 'aria-label': `${verb}：${label}` },
            }));
        }
        row.appendChild(line);
        if (editor && open) row.appendChild(editor);
        return row;
    }

    function buildCustomBody(block) {
        const roleSelect = create(document, 'select', { className: 'lwb-ple-select', attrs: { 'data-ple-field': 'role' } });
        for (const role of CUSTOM_BLOCK_ROLES) {
            const option = create(document, 'option', { text: role, attrs: { value: role } });
            if (role === block.role) option.setAttribute('selected', '');
            roleSelect.appendChild(option);
        }
        const nameInput = create(document, 'input', {
            className: 'lwb-ple-input',
            attrs: { type: 'text', 'data-ple-field': 'name', placeholder: '名称（可选，仅用于区分，会作为消息的 name 发送）', autocomplete: 'off' },
        });
        nameInput.value = block.name || '';
        const tool = hasTool(block);
        const textarea = create(document, 'textarea', {
            className: 'lwb-ple-textarea',
            attrs: { rows: '6', 'data-ple-field': 'content', placeholder: tool ? '消息内容（随请求发给模型；可以在这里告诉它怎么用下面的工具）' : '消息内容' },
        });
        textarea.value = block.content || '';
        const toolToggle = create(document, 'input', { attrs: { type: 'checkbox', 'data-ple-field': 'tool-toggle' } });
        toolToggle.checked = tool;
        if (tool) toolToggle.setAttribute('checked', '');
        const children = [
            create(document, 'div', { className: 'lwb-ple-fields' }, [
                create(document, 'label', { className: 'lwb-ple-field' }, [create(document, 'span', { text: '角色' }), roleSelect]),
                create(document, 'label', { className: 'lwb-ple-field lwb-ple-field-grow' }, [create(document, 'span', { text: '名称' }), nameInput]),
            ]),
            create(document, 'label', { className: 'lwb-ple-field' }, [create(document, 'span', { text: '内容' }), textarea]),
            create(document, 'label', {
                className: 'lwb-ple-tool-toggle',
                attrs: { title: `给这条消息附带一个工具：写一段 JS 定义它，模型规划时可以调用（最多 ${MAX_TOOLS} 个）。消息启用，工具才会注册；代码在浏览器沙盒里运行` },
            }, [toolToggle, create(document, 'span', { text: '附带工具' })]),
        ];
        if (tool) {
            const codeError = getToolCodeLengthError(block.tool.code);
            const code = create(document, 'textarea', {
                className: 'lwb-ple-textarea lwb-ple-code',
                attrs: { rows: '12', 'data-ple-field': 'code', 'aria-invalid': String(Boolean(codeError)), placeholder: 'return { name, description, parameters, action: async (args) => … };', spellcheck: 'false', autocomplete: 'off' },
            });
            code.value = block.tool.code || '';
            const errorNode = create(document, 'p', { className: 'lwb-ple-tool-result', text: codeError, attrs: { 'data-ple-code-error': '', 'data-ok': 'false', role: 'alert' } });
            setHidden(errorNode, !codeError);
            children.push(
                create(document, 'label', { className: 'lwb-ple-field' }, [create(document, 'span', { text: '工具代码' }), code]),
                errorNode,
                create(document, 'p', { className: 'lwb-ple-tool-name', text: toolNameText(block), attrs: { 'data-ple-tool-name': '' } }),
                create(document, 'p', { className: 'lwb-ple-tool-warning', text: '代码在浏览器的沙盒里运行，读不到酒馆页面和存储，但仍可联网。只启用你信任的代码；导入带工具代码的模板时会先问你是否启用。' }),
            );
            if (onTestTool) {
                children.push(create(document, 'div', { className: 'lwb-ple-body-actions' }, [
                    create(document, 'button', { className: 'lwb-ple-btn', text: '试运行（读取工具定义）', attrs: { type: 'button', 'data-ple-field': 'test' } }),
                    create(document, 'span', { className: 'lwb-ple-tool-result', attrs: { 'data-ple-tool-result': '', role: 'status' } }),
                ]));
            }
        }
        children.push(create(document, 'div', { className: 'lwb-ple-body-actions' }, [
            create(document, 'button', { className: 'lwb-ple-btn lwb-ple-btn-danger', text: '删除此消息', attrs: { type: 'button', 'data-ple-field': 'delete' } }),
        ]));
        return create(document, 'div', { className: 'lwb-ple-body' }, children);
    }

    function buildCustomRow(block) {
        const open = expanded.has(block.id);
        const title = customTitle(block);
        const row = create(document, 'div', {
            className: `lwb-ple-row lwb-ple-custom${open ? ' expanded' : ''}${block.enabled ? '' : ' off'}`,
            attrs: { role: 'listitem', 'data-block-id': block.id, 'data-builtin': 'false' },
        });
        const toggle = create(document, 'input', {
            attrs: { type: 'checkbox', 'data-ple-field': 'toggle', 'aria-label': `启用 ${title}`, title: '关闭后这条消息（和它附带的工具）不会发送，但内容保留' },
        });
        toggle.checked = block.enabled;
        if (block.enabled) toggle.setAttribute('checked', '');
        const main = create(document, 'button', {
            className: 'lwb-ple-main',
            attrs: { type: 'button', 'data-ple-field': 'main', 'aria-expanded': open ? 'true' : 'false', title: open ? '收起' : '展开编辑' },
        }, [
            create(document, 'span', { className: `lwb-ple-label${String(block.name || '').trim() ? '' : ' muted'}`, text: title, attrs: { 'data-ple-title': '' } }),
            create(document, 'span', { className: 'lwb-ple-count', text: countText(block), attrs: { 'data-ple-count': '' } }),
            create(document, 'span', { className: 'lwb-ple-chevron', text: open ? '▾' : '▸', attrs: { 'aria-hidden': 'true' } }),
        ]);
        row.appendChild(create(document, 'div', { className: 'lwb-ple-line' }, [
            buildHandle(block, title),
            buildSelectBox(block, title),
            roleBadge(block.role),
            ...(hasTool(block) ? [create(document, 'span', { className: 'lwb-ple-tool-tag', text: toolTagText(block), attrs: { title: '这条消息附带了一个工具：带一段在沙盒里运行的代码', 'data-ple-tool-tag': '' } })] : []),
            create(document, 'label', { className: 'lwb-ple-toggle' }, [toggle]),
            main,
        ]));
        if (open) row.appendChild(buildCustomBody(block));
        return row;
    }

    // 输入时只改这一行的文字，不重建（保住输入法组字和焦点）。
    function patchCustomRow(row, block) {
        const title = customTitle(block);
        const hasName = Boolean(String(block.name || '').trim());
        const titleNode = row.querySelector('[data-ple-title]');
        if (titleNode) {
            titleNode.textContent = title;
            titleNode.setAttribute('class', `lwb-ple-label${hasName ? '' : ' muted'}`);
        }
        const count = row.querySelector('[data-ple-count]');
        if (count) count.textContent = countText(block);
        const toolTag = row.querySelector('[data-ple-tool-tag]');
        if (toolTag && hasTool(block)) toolTag.textContent = toolTagText(block);
        const toolName = row.querySelector('[data-ple-tool-name]');
        if (toolName) toolName.textContent = toolNameText(block);
        const codeError = getToolCodeLengthError(block.tool?.code);
        const errorNode = row.querySelector('[data-ple-code-error]');
        if (errorNode) {
            errorNode.textContent = codeError;
            setHidden(errorNode, !codeError);
            row.querySelector('[data-ple-field="code"]')?.setAttribute('aria-invalid', String(Boolean(codeError)));
        }
        const badge = row.querySelector('[data-ple-role]');
        if (badge) {
            badge.setAttribute('class', `lwb-ple-role ${block.role}`);
            badge.textContent = block.role;
        }
        row.classList.toggle('off', !block.enabled);
        row.querySelector('[data-ple-field="toggle"]')?.setAttribute('aria-label', `启用 ${title}`);
        row.querySelector('[data-ple-drag]')?.setAttribute('aria-label', `拖动调整 ${title} 的顺序`);
        row.querySelector('[data-ple-field="select"]')?.setAttribute('aria-label', `选择 ${title}`);
    }

    // ── 焦点保持 ──

    function captureFocus() {
        const active = document.activeElement;
        if (!active || !list.contains(active)) return null;
        const row = active.closest?.(ROW_SELECTOR);
        const field = active.getAttribute?.('data-ple-field');
        if (!row || !field) return null;
        return { id: row.getAttribute('data-block-id'), field, start: active.selectionStart, end: active.selectionEnd };
    }

    function restoreFocus(target) {
        if (!target) return;
        const row = Array.from(list.querySelectorAll(ROW_SELECTOR)).find(item => item.getAttribute('data-block-id') === target.id);
        const node = row && Array.from(row.querySelectorAll('[data-ple-field]')).find(item => item.getAttribute('data-ple-field') === target.field);
        if (!node) return;
        node.focus?.();
        if (typeof target.start === 'number' && typeof node.setSelectionRange === 'function') {
            node.setSelectionRange(target.start, target.end ?? target.start);
        }
    }

    // ── 重建与刷新 ──

    function rebuildList() {
        const layout = readLayout();
        const blocks = blocksOf(layout);
        const focusTarget = pendingFocus || captureFocus();
        pendingFocus = null;
        const known = new Set(blocks.map(block => block.id));
        for (const id of Array.from(expanded)) if (!known.has(id)) expanded.delete(id);
        for (const id of Array.from(selected)) if (!known.has(id)) selected.delete(id);
        if (!known.has(anchorId)) anchorId = null;
        if (!known.has(lastSelectedId)) lastSelectedId = null;
        parkBuiltinEditors();
        clearNode(list);
        const reason = disabledReason();
        if (!reason) {
            for (const block of blocks) {
                list.appendChild(describeBlock(block).builtin ? buildBuiltinRow(block) : buildCustomRow(block));
            }
        }
        lastSignature = signatureOf(layout, reason);
        refreshStatus();
        refreshSelectionUi();
        restoreFocus(focusTarget);
    }

    // 保留原表单节点，折叠、排序、切换预设均不销毁输入值或事件绑定。
    function parkBuiltinEditors() {
        if (editorParking) {
            for (const editor of Object.values(builtinEditors)) editorParking.appendChild(editor);
        }
    }

    function signatureOf(layout, reason) {
        return `${reason}|${layoutFingerprint(layout)}|${Array.from(expanded).sort().join(',')}`;
    }

    /** 未保存徽标、按钮可用性、停用说明——不动列表。 */
    function refreshStatus(layoutOverride) {
        const layout = layoutOverride || readLayout();
        const reason = disabledReason();
        const saved = readSaved();
        const dirty = !reason && saved != null && layoutFingerprint(layout) !== layoutFingerprint(saved);
        setHidden(dirtyBadge, !dirty);
        notice.textContent = reason;
        setHidden(notice, !reason);
        setHidden(hint, Boolean(reason));
        addButton.disabled = Boolean(reason);
        selectModeButton.disabled = Boolean(reason);
        resetButton.disabled = Boolean(reason) || isDefaultLayout(layout);
        for (const button of [addButton, selectModeButton, resetButton]) {
            if (button.disabled) button.setAttribute('disabled', ''); else button.removeAttribute('disabled');
        }
    }

    /** 内置块的摘要随文本框内容变化：原地改字，不重建。 */
    function refreshSummaries() {
        for (const row of list.querySelectorAll(ROW_SELECTOR)) {
            if (row.getAttribute('data-builtin') !== 'true') continue;
            const node = row.querySelector('[data-ple-summary]');
            if (node) node.textContent = builtinInfo(row.getAttribute('data-block-id')).summary;
        }
    }

    function ensureSortable() {
        if (sortable) return;
        sortable = createSortableList({
            container: list,
            rowSelector: ROW_SELECTOR,
            handleSelector: HANDLE_SELECTOR,
            getId: row => row.getAttribute('data-block-id'),
            onReorder: handleReorder,
            moveStep: (ids, id, direction) => {
                const from = ids.indexOf(id);
                return from < 0 ? ids : moveIdToIndex(ids, id, from + (direction < 0 ? -1 : 1));
            },
            // 拖动 / 键盘移动选中的行之一时，整组一起动。
            getGroupIds: id => (selected.size > 1 && selected.has(id) ? selectedInOrder() : null),
            moveGroupStep: (ids, group, direction) => blocksOf(moveBlocks(readLayout(), group, direction)).map(block => block.id),
            autoScroll: autoScroll ? event => autoScroll(event, list) : null,
            document,
            draggingClass: 'dragging',
            beforeClass: 'drop-before',
            afterClass: 'drop-after',
            bodyClass: 'lwb-ple-dragging',
        });
    }

    /**
     * 画出（或在没有变化时只刷新状态）。
     * 内容没变（INIT_DATA 之类无关推送）时不重建，输入框的焦点与输入法状态不受影响。
     * @param {{force?: boolean, collapse?: boolean}} [options] force=无论如何重建；collapse=先收起所有展开项（切换预设时用）
     */
    function render({ force = false, collapse = false } = {}) {
        if (!mounted) {
            container.appendChild(root);
            mounted = true;
            ensureSortable();
        }
        const ownerKey = getOwnerKey();
        if (collapse || ownerKey !== renderedOwnerKey) {
            expanded.clear();
            clearSelection({ leaveMode: true });
            clearUndo();
            lastSignature = null;
            renderedOwnerKey = ownerKey;
        }
        const layout = readLayout();
        if (!force && !collapse && lastSignature === signatureOf(layout, disabledReason())) {
            refreshStatus(layout);
            refreshSummaries();
            return;
        }
        rebuildList();
    }

    // ── 用户操作 ──

    function commit(next, { rebuild = true } = {}) {
        clearUndo();
        if (!getLayout) ownLayout = next;
        onChange(next);
        if (rebuild) {
            rebuildList();
        } else {
            // 原地更新的路径也要同步签名：否则之后一次无关的 render() 会误以为布局变了而白白重建、打断输入。
            lastSignature = signatureOf(readLayout(), disabledReason());
            refreshStatus(readLayout());
        }
    }

    function labelOf(block) {
        const meta = describeBlock(block);
        return meta.builtin ? (builtinInfo(block.id).label || meta.label) : customTitle(block);
    }

    const orderedIds = () => blocksOf(readLayout()).map(block => block.id);
    const selectedInOrder = () => orderedIds().filter(id => selected.has(id));
    const selectedCustomIds = () => blocksOf(readLayout()).filter(block => selected.has(block.id) && !describeBlock(block).builtin).map(block => block.id);

    // ── 展开（手风琴）──

    function expandOnly(id) {
        expanded.clear();
        if (id) expanded.add(id);
    }

    function toggleExpanded(id) {
        if (expanded.has(id)) expanded.delete(id); else expandOnly(id);
        pendingFocus = { id, field: 'main' };
        rebuildList();
    }

    // ── 选择 ──

    function refreshSelectionUi() {
        root.classList.toggle('select-mode', selectMode);
        selectModeButton.setAttribute('aria-pressed', selectMode ? 'true' : 'false');
        for (const row of list.querySelectorAll(ROW_SELECTOR)) {
            const on = selected.has(row.getAttribute('data-block-id'));
            row.classList.toggle('selected', on);
            const box = row.querySelector('[data-ple-field="select"]');
            if (box) {
                box.checked = on;
                if (on) box.setAttribute('checked', ''); else box.removeAttribute('checked');
            }
        }
        const blocks = blocksOf(readLayout());
        const customSelected = blocks.filter(block => selected.has(block.id) && !describeBlock(block).builtin);
        setHidden(selectionBar, selected.size === 0);
        selectionCount.textContent = `已选 ${selected.size} 项`;
        const noCustom = customSelected.length === 0;
        const anyEnabled = customSelected.some(block => block.enabled);
        bulkEnableButton.textContent = anyEnabled || noCustom ? '停用' : '启用';
        bulkEnableButton.title = anyEnabled ? '停用选中的自定义消息（内容保留，但不发送）' : '启用选中的自定义消息';
        for (const button of [copyButton, bulkDeleteButton, bulkEnableButton]) {
            if (noCustom) button.setAttribute('disabled', ''); else button.removeAttribute('disabled');
        }
        if (selected.size === 0) selectionNote.textContent = '';
    }

    function clearSelection({ leaveMode = false } = {}) {
        selected.clear();
        anchorId = null;
        lastSelectedId = null;
        if (!leaveMode) selectMode = false;
        selectionNote.textContent = '';
        refreshSelectionUi();
    }

    function afterSelectionChange() {
        if (selected.size > 0) selectMode = true;
        selectionNote.textContent = '';
        refreshSelectionUi();
        say(selected.size ? `已选 ${selected.size} 项` : '已取消选择');
    }

    function selectOne(id, on = null) {
        const shouldAdd = on === null ? !selected.has(id) : on;
        if (shouldAdd) {
            selected.add(id);
            lastSelectedId = id;
        } else {
            selected.delete(id);
            if (lastSelectedId === id) lastSelectedId = selectedInOrder().at(-1) || null;
        }
        anchorId = id;
        afterSelectionChange();
    }

    function selectRangeTo(id) {
        const ids = orderedIds();
        const from = ids.indexOf(anchorId ?? id);
        const to = ids.indexOf(id);
        if (to < 0) return;
        const [lo, hi] = from < 0 ? [to, to] : [Math.min(from, to), Math.max(from, to)];
        for (const item of ids.slice(lo, hi + 1)) selected.add(item);
        lastSelectedId = id;
        if (anchorId === null) anchorId = id;
        afterSelectionChange();
    }

    function toggleSelectMode() {
        if (disabledReason()) return;
        if (selectMode) {
            clearSelection();
            say('已退出多选');
        } else {
            selectMode = true;
            refreshSelectionUi();
            say('已进入多选：点选择框，或按住 Shift 点击选范围');
        }
    }

    // ── 撤销条 ──

    function clearUndo() {
        undoState = null;
        setHidden(undoBar, true);
        undoText.textContent = '';
    }

    function showUndo(text, previousLayout) {
        undoState = { layout: previousLayout, ownerKey: getOwnerKey() };
        undoText.textContent = text;
        setHidden(undoBar, false);
    }

    function handleUndo() {
        if (!undoState) return;
        if (undoState.ownerKey !== getOwnerKey()) {
            clearUndo();
            return;
        }
        const previous = undoState.layout;
        commit(previous);
        say('已撤销，布局恢复到操作之前');
    }

    // ── 添加 / 恢复 / 删除 / 排序 ──

    /** 新消息插在谁的下方：当前展开的消息 → 最近选中的消息 → 末尾（null）。 */
    function insertionAnchorId(blocks) {
        const known = new Set(blocks.map(block => block.id));
        const open = Array.from(expanded).find(id => known.has(id));
        if (open) return open;
        if (lastSelectedId && known.has(lastSelectedId)) return lastSelectedId;
        return selectedInOrder().at(-1) || null;
    }

    function handleAdd() {
        if (disabledReason()) return;
        const layout = readLayout();
        const blocks = blocksOf(layout);
        const anchorBlock = blocks.find(block => block.id === insertionAnchorId(blocks)) || null;
        const block = createCustomBlock({ role: 'user' }, blocks.map(item => item.id), random);
        expandOnly(block.id);
        pendingFocus = { id: block.id, field: 'content' };
        commit(addBlockAfter(layout, block, anchorBlock?.id));
        const row = Array.from(list.querySelectorAll(ROW_SELECTOR)).find(item => item.getAttribute('data-block-id') === block.id);
        row?.scrollIntoView?.({ block: 'nearest' });
        const total = list.querySelectorAll(ROW_SELECTOR).length;
        say(anchorBlock
            ? `已在“${labelOf(anchorBlock)}”下方添加一条自定义消息，共 ${total} 项`
            : `已在末尾添加一条自定义消息，共 ${total} 项`);
    }

    // 勾选 / 取消“附带工具”：取消时代码先存进本页面的内存，勾回来恢复；数量上限在这里拦。
    function handleToolToggle(id, checked, row) {
        const layout = readLayout();
        const blocks = blocksOf(layout);
        const block = blocks.find(item => item.id === id);
        if (!block) return;
        if (checked && blocks.filter(hasTool).length >= MAX_TOOLS) {
            const box = row?.querySelector?.('[data-ple-field="tool-toggle"]');
            if (box) { box.checked = false; box.removeAttribute('checked'); }
            say(`附带工具最多 ${MAX_TOOLS} 个，请先取消别的消息上的工具`);
            return;
        }
        const draftKey = JSON.stringify([getOwnerKey(), id]);
        if (!checked && hasTool(block)) toolDrafts.set(draftKey, block.tool.code);
        const code = checked ? (toolDrafts.get(draftKey) ?? DEFAULT_TOOL_CODE) : null;
        pendingFocus = { id, field: 'tool-toggle' };
        commit(updateBlock(layout, id, { tool: checked ? { code } : null }));
        say(checked
            ? `已给“${labelOf(block)}”附带工具，看看代码再保存`
            : `已取消“${labelOf(block)}”的附带工具（代码暂存在本页面，再勾上可恢复）`);
    }

    async function handleTestTool(id, row) {
        const block = blocksOf(readLayout()).find(item => item.id === id);
        const output = row?.querySelector?.('[data-ple-tool-result]');
        if (!block || !onTestTool || !output) return;
        output.textContent = '读取中…';
        try {
            const outcome = await onTestTool(block);
            output.textContent = String(outcome?.message || (outcome?.ok ? '可用' : '不可用'));
            output.setAttribute('data-ok', outcome?.ok ? 'true' : 'false');
        } catch (error) {
            output.textContent = String(error?.message || '试运行失败');
            output.setAttribute('data-ok', 'false');
        }
    }

    function handleReset() {
        if (disabledReason()) return;
        const layout = readLayout();
        const customCount = blocksOf(layout).filter(block => !describeBlock(block).builtin).length;
        if (customCount > 0 && confirm
            && !confirm(`恢复默认结构会移除全部 ${customCount} 条自定义消息，并把内置块恢复到默认顺序。\n只改当前草稿，点击保存后才会生效。确定吗？`)) return;
        expanded.clear();
        clearSelection({ leaveMode: true });
        commit(createDefaultLayout());
        addButton.focus?.();
        say(customCount > 0 ? `已恢复默认结构，移除了 ${customCount} 条自定义消息` : '已恢复默认结构');
    }

    function handleDelete(id) {
        const layout = readLayout();
        const blocks = blocksOf(layout);
        const index = blocks.findIndex(block => block.id === id);
        const block = blocks[index];
        if (!block || describeBlock(block).builtin) return;
        if (String(block.content || '').trim() && confirm
            && !confirm(`确定删除“${customTitle(block)}”吗？其中的内容会一并丢失。`)) return;
        const name = customTitle(block);
        expanded.delete(id);
        selected.delete(id);
        // 删完后焦点落到原位置的下一项（没有就上一项）的手柄，键盘用户不至于丢到页面顶部。
        const neighbor = blocks[index + 1] || blocks[index - 1];
        pendingFocus = neighbor ? { id: neighbor.id, field: 'handle' } : null;
        commit(removeBlock(layout, id));
        showUndo(`已删除“${name}”`, layout);
        say(`已删除“${name}”`);
    }

    function handleBulkCopy() {
        const ids = selectedInOrder();
        const layout = readLayout();
        const { layout: next, copies, skipped } = duplicateBlocks(layout, ids, random);
        if (!copies.length) {
            selectionNote.textContent = '选中的都是内置块，内置块不能复制';
            say(selectionNote.textContent);
            return;
        }
        selected.clear();
        for (const copy of copies) selected.add(copy.id);
        lastSelectedId = copies.at(-1).id;
        anchorId = lastSelectedId;
        commit(next);
        const skippedText = (skipped.length ? `；跳过 ${skipped.length} 个内置块（内置块不能复制）` : '')
            + (copies.some(copy => copy.droppedTool) ? '；副本不带附带工具（同名工具会冲突），需要的话在副本上重新勾选' : '');
        selectionNote.textContent = skipped.length ? `跳过 ${skipped.length} 个内置块` : '';
        showUndo(`已复制 ${copies.length} 条消息${skippedText}`, layout);
        say(`已复制 ${copies.length} 条消息，副本放在原消息下方并已选中${skippedText}`);
    }

    function handleBulkDelete() {
        const layout = readLayout();
        const { layout: next, removedIds, skipped } = removeBlocks(layout, selectedInOrder());
        if (!removedIds.length) {
            selectionNote.textContent = '选中的都是内置块，内置块不能删除';
            say(selectionNote.textContent);
            return;
        }
        for (const id of removedIds) {
            selected.delete(id);
            expanded.delete(id);
        }
        commit(next);
        const skippedText = skipped.length ? `；${skipped.length} 个内置块保留` : '';
        selectionNote.textContent = skipped.length ? `${skipped.length} 个内置块保留` : '';
        showUndo(`已删除 ${removedIds.length} 条消息${skippedText}`, layout);
        say(`已删除 ${removedIds.length} 条消息${skippedText}`);
    }

    function handleBulkEnable() {
        const ids = selectedCustomIds();
        if (!ids.length) return;
        const layout = readLayout();
        const anyEnabled = blocksOf(layout).some(block => ids.includes(block.id) && block.enabled);
        commit(setBlocksEnabled(layout, ids, !anyEnabled));
        say(anyEnabled ? `已停用 ${ids.length} 条消息` : `已启用 ${ids.length} 条消息`);
    }

    function handleReorder(orderedIdsNext, meta = {}) {
        const oldIds = orderedIds();
        const next = reorderBlocks(readLayout(), orderedIdsNext);
        const nextIds = blocksOf(next).map(block => block.id);
        commit(next);
        if (meta?.group?.length > 1) {
            const positions = meta.group.map(id => nextIds.indexOf(id) + 1).filter(position => position > 0);
            say(`已移动 ${meta.group.length} 项，现在位于第 ${Math.min(...positions)}–${Math.max(...positions)} 位，共 ${orderedIdsNext.length} 位`);
            return;
        }
        const movedId = findMovedId(oldIds, orderedIdsNext);
        if (movedId) {
            const blocks = blocksOf(next);
            const block = blocks.find(item => item.id === movedId);
            const position = blocks.findIndex(item => item.id === movedId) + 1;
            say(`“${block ? labelOf(block) : movedId}”已移到第 ${position} 位，共 ${orderedIdsNext.length} 位`);
        }
    }

    function handlePatch(id, patch, row) {
        const next = updateBlock(readLayout(), id, patch);
        commit(next, { rebuild: false });
        const block = blocksOf(next).find(item => item.id === id);
        if (block && row) patchCustomRow(row, block);
    }

    function fieldOf(event) {
        const node = event.target?.closest?.('[data-ple-field]');
        const row = node?.closest?.(ROW_SELECTOR);
        if (!node || !row || !list.contains(row)) return null;
        return { node, row, field: node.getAttribute('data-ple-field'), id: row.getAttribute('data-block-id') };
    }

    listen(list, 'click', async (event) => {
        // Ctrl / ⌘ / Shift 点击行头 = 选择（Shift 选范围），不触发展开、编辑等原有操作。
        const modifier = event.ctrlKey || event.metaKey || event.shiftKey;
        const row = event.target?.closest?.(ROW_SELECTOR);
        if (modifier && row && list.contains(row) && event.target.closest('.lwb-ple-line') && !event.target.closest(MODIFIER_IGNORE_SELECTOR)) {
            event.preventDefault?.();
            const id = row.getAttribute('data-block-id');
            if (event.shiftKey) selectRangeTo(id); else selectOne(id);
            return;
        }
        const hit = fieldOf(event);
        if (!hit) return;
        if (hit.field === 'select') {
            if (event.shiftKey) selectRangeTo(hit.id); else selectOne(hit.id, Boolean(hit.node.checked));
        } else if (hit.field === 'main') toggleExpanded(hit.id);
        else if (hit.field === 'edit') {
            if (builtinEditors[hit.id]) toggleExpanded(hit.id);
            else onEditBuiltin?.(hit.id);
        }
        else if (hit.field === 'delete') handleDelete(hit.id);
        else if (hit.field === 'test') await handleTestTool(hit.id, hit.row);
    });
    listen(list, 'input', (event) => {
        const hit = fieldOf(event);
        if (!hit) return;
        if (hit.field === 'name') handlePatch(hit.id, { name: hit.node.value }, hit.row);
        else if (hit.field === 'content') handlePatch(hit.id, { content: hit.node.value }, hit.row);
        else if (hit.field === 'code') handlePatch(hit.id, { tool: { code: hit.node.value } }, hit.row);
    });
    listen(list, 'change', (event) => {
        const hit = fieldOf(event);
        if (!hit) return;
        if (hit.field === 'toggle') handlePatch(hit.id, { enabled: Boolean(hit.node.checked) }, hit.row);
        else if (hit.field === 'role') handlePatch(hit.id, { role: hit.node.value }, hit.row);
        else if (hit.field === 'tool-toggle') handleToolToggle(hit.id, Boolean(hit.node.checked), hit.row);
    });
    listen(addButton, 'click', handleAdd);
    listen(resetButton, 'click', handleReset);
    listen(selectModeButton, 'click', toggleSelectMode);
    listen(copyButton, 'click', handleBulkCopy);
    listen(bulkDeleteButton, 'click', handleBulkDelete);
    listen(bulkEnableButton, 'click', handleBulkEnable);
    listen(clearSelectionButton, 'click', () => { clearSelection({ leaveMode: true }); say('已取消选择'); });
    listen(undoButton, 'click', handleUndo);
    listen(undoClose, 'click', clearUndo);

    return {
        render,
        openBuiltin(id) {
            if (!builtinEditors[id]) return;
            expandOnly(id);
            rebuildList();
        },
        /** 自持模式：设置布局（同时当作"已保存"的基准）并重绘。 */
        setLayout(layout) {
            clearUndo();
            ownLayout = normalizeLayout(layout).layout;
            ownSaved = ownLayout;
            render({ force: true });
        },
        refreshSummaries,
        refreshStatus: () => refreshStatus(),
        getLayout: () => readLayout(),
        destroy() {
            parkBuiltinEditors();
            sortable?.destroy?.();
            sortable = null;
            listeners.splice(0).forEach(off => off());
            if (root.parentNode) root.parentNode.removeChild(root);
            mounted = false;
            lastSignature = null;
        },
    };
}
