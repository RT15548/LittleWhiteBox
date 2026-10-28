// 请求结构编辑器（共享 UI 组件）：跑在 linkedom 的真实 DOM 上，DOM / 回调全部注入。
// linkedom 没有布局和焦点：行矩形手写，focus() 与 activeElement 在测试里自己记录 / 设置。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import {
    createDefaultLayout,
    createPromptLayoutEditor,
    isDefaultLayout,
    layoutForStorage,
} from '../prompt-layout-editor.js';
import { BUILTIN_BLOCK_IDS, addBlock, createCustomBlock } from '../scene-planner-layout.js';

// 固定的"随机源"：每次返回不同的值，保证 id 唯一又可复现。
function sequenceRandom() {
    let n = 0;
    return () => { n += 1; return (n * 0.0137) % 1; };
}

function setup(t, options = {}) {
    const { document } = parseHTML('<!doctype html><html><body><div id="host"></div></body></html>');
    const host = document.getElementById('host');
    const changes = [];
    const confirms = [];
    const announced = [];
    const edits = [];
    const focused = [];
    let layout = options.layout ?? createDefaultLayout();
    const answers = [...(options.confirmAnswers || [])];
    const editor = createPromptLayoutEditor({
        document,
        container: host,
        getLayout: () => layout,
        getSavedLayout: options.getSavedLayout || (() => createDefaultLayout()),
        onChange: (next) => { layout = next; changes.push(next); },
        describeBuiltin: options.describeBuiltin || (id => ({ summary: `摘要-${id}`, action: ['frame', 'tools'].includes(id) ? 'view' : 'edit' })),
        onEditBuiltin: id => edits.push(id),
        confirm: (message) => { confirms.push(message); return answers.length ? answers.shift() : true; },
        announce: text => announced.push(text),
        getDisabledReason: options.getDisabledReason,
        random: sequenceRandom(),
    });
    // linkedom 的 focus() 是空操作：把它换成"记录并设置 activeElement"，才能验证焦点去向。
    const proto = Object.getPrototypeOf(host);
    const originalFocus = proto.focus;
    proto.focus = function focus() {
        focused.push(this.getAttribute('data-ple-drag') || this.getAttribute('data-ple-field') || this.tagName);
        Object.defineProperty(document, 'activeElement', { configurable: true, value: this });
    };
    t.after(() => {
        if (originalFocus) proto.focus = originalFocus; else delete proto.focus;
        editor.destroy();
    });
    editor.render();
    return {
        document, host, editor, changes, confirms, announced, edits, focused,
        getLayout: () => layout,
        setLayout: (next) => { layout = next; },
        rows: () => Array.from(host.querySelectorAll('.lwb-ple-row')),
        ids: () => Array.from(host.querySelectorAll('.lwb-ple-row')).map(row => row.getAttribute('data-block-id')),
        row: id => Array.from(host.querySelectorAll('.lwb-ple-row')).find(row => row.getAttribute('data-block-id') === id),
        field: (id, name) => Array.from(Array.from(host.querySelectorAll('.lwb-ple-row')).find(row => row.getAttribute('data-block-id') === id).querySelectorAll('[data-ple-field]')).find(node => node.getAttribute('data-ple-field') === name),
        fire(node, type, props = {}) {
            const event = new document.defaultView.Event(type, { bubbles: true, cancelable: true });
            Object.assign(event, props);
            node.dispatchEvent(event);
            return event;
        },
        click(node) { return this.fire(node, 'click'); },
        key(node, key) { return this.fire(node, 'keydown', { key }); },
        add() { this.click(host.querySelector('[data-ple-add]')); },
        status: () => host.querySelector('[data-ple-status]').textContent,
        dirty: () => !host.querySelector('[data-ple-dirty]').hasAttribute('hidden'),
        layoutHasNoUiState: () => !/selected|expanded/.test(JSON.stringify(layout)),
    };
}

function customIds(ctx) {
    return ctx.ids().filter(id => !BUILTIN_BLOCK_IDS.includes(id));
}

// 契约：展开、折叠与重排请求结构后，内置文本草稿及绑定必须保留，否则保存会丢用户编辑。
test('inline builtin editors retain draft nodes and input bindings across collapse and reorder', () => {
    const { document } = parseHTML('<html><body><div id="host"></div><div id="parking" hidden><div id="opening"><textarea id="draft"></textarea></div><div id="guide"><textarea></textarea></div></div></body></html>');
    const host = document.getElementById('host');
    const parking = document.getElementById('parking');
    const opening = document.getElementById('opening');
    const guide = document.getElementById('guide');
    const draft = document.getElementById('draft');
    let inputCount = 0;
    draft.addEventListener('input', () => { inputCount += 1; });
    draft.value = '未保存的角色与场景要求';
    const editor = createPromptLayoutEditor({ document, container: host, onChange: () => {},
        builtinEditors: { opening, guide }, editorParking: parking,
        describeBuiltin: () => ({ action: 'edit' }),
    });
    const click = id => host.querySelector(`[data-block-id="${id}"] [data-ple-field="edit"]`)
        .dispatchEvent(new document.defaultView.Event('click', { bubbles: true }));
    editor.render();
    click('opening');
    assert.equal(host.contains(opening), true);
    click('guide');
    assert.equal(parking.contains(opening), true);
    assert.equal(host.contains(guide), true);
    const layout = createDefaultLayout();
    layout.blocks.reverse();
    editor.setLayout(layout);
    assert.equal(document.getElementById('draft'), draft);
    assert.equal(draft.value, '未保存的角色与场景要求');
    draft.dispatchEvent(new document.defaultView.Event('input', { bubbles: true }));
    assert.equal(inputCount, 1);
    editor.destroy();
    assert.equal(parking.contains(opening), true);
    assert.equal(parking.contains(guide), true);
});

// ── 纯函数 ──────────────────────────────────────────────




// ── 默认外观 ────────────────────────────────────────────


test('built-in actions call back with their block id without modifying the layout', (t) => {
    const ctx = setup(t, { describeBuiltin: id => ({ summary: `摘要-${id}`, action: id === 'frame' ? 'view' : id === 'limits' ? null : 'edit', label: id === 'guide' ? '模型TAG指南' : undefined }) });
    assert.equal(ctx.row('opening').querySelector('[data-ple-summary]').textContent, '摘要-opening');
    assert.equal(ctx.field('limits', 'edit'), undefined, 'action 为 null 时不显示按钮');
    assert.equal(ctx.row('guide').querySelector('.lwb-ple-label').textContent, '模型TAG指南', 'label 可由宿主覆盖');
    ctx.click(ctx.field('rules', 'edit'));
    ctx.click(ctx.field('frame', 'edit'));
    assert.deepEqual(ctx.edits, ['rules', 'frame']);
    assert.equal(ctx.changes.length, 0, '跳转不改布局');
});

// ── 添加 / 编辑 ─────────────────────────────────────────

test('add appends an expanded custom block, focuses its content box, announces it and marks the draft as unsaved', (t) => {
    const ctx = setup(t);
    ctx.add();
    assert.equal(ctx.changes.length, 1);
    const [id] = customIds(ctx);
    assert.ok(id);
    assert.equal(ctx.ids().at(-1), id, '加在末尾');
    assert.deepEqual(ctx.getLayout().blocks.at(-1), { id, role: 'user', name: '', content: '', enabled: true });
    assert.equal(ctx.row(id).querySelector('.lwb-ple-main').getAttribute('aria-expanded'), 'true');
    assert.ok(ctx.field(id, 'content'), '展开后有编辑区');
    assert.equal(ctx.focused.at(-1), 'content');
    assert.equal(ctx.dirty(), true);
    assert.equal(ctx.host.querySelector('[data-ple-reset]').hasAttribute('disabled'), false);
});

test('typing never rebuilds: same row and textarea nodes, data updated, title and count patched in place', (t) => {
    const ctx = setup(t);
    ctx.add();
    const [id] = customIds(ctx);
    const row = ctx.row(id);
    const textarea = ctx.field(id, 'content');
    const nameInput = ctx.field(id, 'name');
    const before = ctx.changes.length;

    textarea.value = '第一行内容\n第二行';
    ctx.fire(textarea, 'input');
    assert.equal(ctx.row(id), row, '行没有被重建');
    assert.equal(ctx.field(id, 'content'), textarea, '文本框没有被重建');
    assert.equal(ctx.changes.length, before + 1);
    assert.equal(ctx.getLayout().blocks.at(-1).content, '第一行内容\n第二行');
    assert.equal(row.querySelector('[data-ple-title]').textContent, '第一行内容', '没有名称时标题是内容预览');

    nameInput.value = '提示 ';
    ctx.fire(nameInput, 'input');
    assert.equal(ctx.field(id, 'name'), nameInput);
    assert.equal(nameInput.value, '提示 ', '输入框里的尾随空格保留');
    assert.equal(row.querySelector('[data-ple-title]').textContent, '提示');
    assert.equal(ctx.dirty(), true);
});

test('role select and enable toggle patch the row in place and write through onChange', (t) => {
    const ctx = setup(t);
    ctx.add();
    const [id] = customIds(ctx);
    const row = ctx.row(id);

    const select = ctx.field(id, 'role');
    Array.from(select.querySelectorAll('option')).find(option => option.getAttribute('value') === 'assistant').selected = true;
    ctx.fire(select, 'change');
    assert.equal(ctx.getLayout().blocks.at(-1).role, 'assistant');
    assert.equal(row.querySelector('[data-ple-role]').textContent, 'assistant');

    const toggle = ctx.field(id, 'toggle');
    toggle.checked = false;
    ctx.fire(toggle, 'change');
    assert.equal(ctx.getLayout().blocks.at(-1).enabled, false);
    assert.equal(row.classList.contains('off'), true);
    assert.equal(ctx.row(id), row, '没有重建');
    toggle.checked = true;
    ctx.fire(toggle, 'change');
    assert.equal(ctx.getLayout().blocks.at(-1).enabled, true);
    assert.equal(row.classList.contains('off'), false);
});

test('collapsing and expanding rebuilds the list but keeps the typed data and returns focus to the toggle button', (t) => {
    const ctx = setup(t);
    ctx.add();
    const [id] = customIds(ctx);
    const textarea = ctx.field(id, 'content');
    textarea.value = 'keep me';
    ctx.fire(textarea, 'input');

    ctx.click(ctx.field(id, 'main'));
    assert.equal(ctx.field(id, 'content'), undefined, '收起后没有编辑区');
    assert.equal(ctx.row(id).querySelector('.lwb-ple-main').getAttribute('aria-expanded'), 'false');
    assert.equal(ctx.focused.at(-1), 'main');
    ctx.click(ctx.field(id, 'main'));
    assert.equal(ctx.field(id, 'content').value, 'keep me');
});

test('user text is rendered as text, never parsed as markup', (t) => {
    const ctx = setup(t);
    ctx.add();
    const [id] = customIds(ctx);
    const nameInput = ctx.field(id, 'name');
    nameInput.value = '<img src=x onerror=alert(1)><b>粗</b>';
    ctx.fire(nameInput, 'input');
    assert.equal(ctx.row(id).querySelector('[data-ple-title]').textContent, '<img src=x onerror=alert(1)><b>粗</b>');
    assert.equal(ctx.host.querySelectorAll('img, b').length, 0);
    ctx.click(ctx.field(id, 'main'));
    ctx.click(ctx.field(id, 'main'));
    assert.equal(ctx.host.querySelectorAll('img, b').length, 0);
});

// ── 排序 ────────────────────────────────────────────────

function layoutRows(ctx) {
    let top = 0;
    for (const row of ctx.rows()) {
        const rect = { top, bottom: top + 100, height: 100, left: 0, right: 300, width: 300 };
        row.getBoundingClientRect = () => rect;
        top += 100;
    }
}

test('keyboard: arrows on a handle move the block one step, keep focus on that handle and announce the new position', (t) => {
    const ctx = setup(t);
    const down = ctx.key(ctx.field('opening', 'handle'), 'ArrowDown');
    assert.equal(down.defaultPrevented, true);
    assert.deepEqual(ctx.ids().slice(0, 3), ['frame', 'opening', 'guide']);
    assert.deepEqual(ctx.getLayout().blocks.slice(0, 2).map(block => block.id), ['frame', 'opening']);
    assert.equal(ctx.focused.at(-1), 'opening');

    const before = ctx.changes.length;
    ctx.key(ctx.field('frame', 'handle'), 'ArrowUp'); // 已在最前
    ctx.key(ctx.field('limits', 'handle'), 'ArrowDown'); // 已在最后
    assert.equal(ctx.changes.length, before, '边界处不动');
    assert.equal(ctx.key(ctx.field('opening', 'handle'), 'a').defaultPrevented, false);
});

test('dragging a handle reorders through onChange; built-in and custom blocks sort together', (t) => {
    const ctx = setup(t);
    ctx.add();
    const [id] = customIds(ctx);
    layoutRows(ctx);
    const handle = ctx.field(id, 'handle');
    ctx.fire(handle, 'pointerdown', { button: 0, pointerId: 1, clientX: 10, clientY: 850 });
    ctx.fire(ctx.document, 'pointermove', { pointerId: 1, clientY: 10 });
    assert.equal(ctx.row('opening').classList.contains('drop-before'), true);
    ctx.fire(ctx.document, 'pointerup', { pointerId: 1, clientY: 10 });
    assert.equal(ctx.ids()[0], id);
    assert.equal(ctx.getLayout().blocks[0].id, id);
    assert.equal(ctx.host.querySelectorAll('.dragging, .drop-before, .drop-after').length, 0);
});

// ── 删除 / 恢复默认 ─────────────────────────────────────

test('deleting a block with content asks first, declining keeps it, accepting removes it and focuses a neighbour handle', (t) => {
    const ctx = setup(t, { confirmAnswers: [false, true] });
    ctx.add();
    const [id] = customIds(ctx);
    const textarea = ctx.field(id, 'content');
    textarea.value = '重要内容';
    ctx.fire(textarea, 'input');

    ctx.click(ctx.field(id, 'delete'));
    assert.equal(ctx.confirms.length, 1);
    assert.deepEqual(customIds(ctx), [id], '拒绝后还在');

    ctx.click(ctx.field(id, 'delete'));
    assert.equal(ctx.confirms.length, 2);
    assert.deepEqual(customIds(ctx), []);
    assert.equal(ctx.getLayout().blocks.length, 8);
    assert.equal(ctx.focused.at(-1), 'limits', '焦点落到相邻块的手柄');
    assert.equal(ctx.dirty(), false, '回到与已保存一致');
});

test('deleting an empty block does not ask', (t) => {
    const ctx = setup(t);
    ctx.add();
    const [id] = customIds(ctx);
    ctx.click(ctx.field(id, 'delete'));
    assert.equal(ctx.confirms.length, 0);
    assert.deepEqual(customIds(ctx), []);
});

test('reset asks only when custom blocks would be lost, and it changes the draft only', (t) => {
    const ctx = setup(t, { confirmAnswers: [false, true] });
    // 只调了内置块顺序：不弹确认
    ctx.key(ctx.field('opening', 'handle'), 'ArrowDown');
    const reset = ctx.host.querySelector('[data-ple-reset]');
    assert.equal(reset.hasAttribute('disabled'), false);
    ctx.click(reset);
    assert.equal(ctx.confirms.length, 0);
    assert.deepEqual(ctx.ids(), BUILTIN_BLOCK_IDS);
    assert.equal(isDefaultLayout(ctx.getLayout()), true);

    // 有自定义块：先确认
    ctx.add();
    ctx.add();
    ctx.click(reset);
    assert.equal(ctx.confirms.length, 1);
    assert.equal(customIds(ctx).length, 2, '拒绝后不变');
    ctx.click(reset);
    assert.deepEqual(ctx.ids(), BUILTIN_BLOCK_IDS);
    assert.equal(ctx.focused.at(-1), 'BUTTON', '焦点回到“添加消息”按钮');
    assert.equal(reset.hasAttribute('disabled'), true);
});

// ── 重绘策略 ────────────────────────────────────────────

test('render() without changes keeps every node (focus and IME safe); force and collapse rebuild', (t) => {
    const ctx = setup(t);
    ctx.add();
    const [id] = customIds(ctx);
    const row = ctx.row(id);
    const textarea = ctx.field(id, 'content');
    textarea.value = 'typed';
    ctx.fire(textarea, 'input');

    ctx.editor.render();
    assert.equal(ctx.row(id), row, '内容没变：不重建');
    assert.equal(ctx.field(id, 'content'), textarea);

    ctx.editor.render({ force: true });
    assert.notEqual(ctx.row(id), row, 'force 才重建');
    assert.equal(ctx.field(id, 'content').value, 'typed');

    ctx.editor.render({ collapse: true });
    assert.equal(ctx.field(id, 'content'), undefined, 'collapse 收起所有展开项');
});

test('a layout change from outside (preset switch) is picked up by render()', (t) => {
    const ctx = setup(t);
    const other = addBlock(createDefaultLayout(), createCustomBlock({ name: '另一个预设的块', role: 'system' }, [], () => 0.5));
    ctx.setLayout(other);
    ctx.editor.render();
    assert.equal(ctx.ids().length, 9);
    assert.equal(ctx.dirty(), true, '与已保存的默认布局不同');
    ctx.setLayout(createDefaultLayout());
    ctx.editor.render();
    assert.equal(ctx.ids().length, 8);
    assert.equal(ctx.dirty(), false);
});

test('rebuilding restores focus and selection to the same field of the same block', (t) => {
    const ctx = setup(t);
    ctx.add();
    const [id] = customIds(ctx);
    const textarea = ctx.field(id, 'content');
    textarea.value = 'hello world';
    ctx.fire(textarea, 'input');
    // 模拟用户正聚焦在文本框、光标选中 2..5
    Object.defineProperty(ctx.document, 'activeElement', { configurable: true, value: textarea });
    textarea.selectionStart = 2;
    textarea.selectionEnd = 5;
    const selections = [];
    const proto = Object.getPrototypeOf(textarea);
    proto.setSelectionRange = function setSelectionRange(start, end) { selections.push([start, end]); };
    t.after(() => { delete proto.setSelectionRange; });

    ctx.editor.render({ force: true });
    assert.equal(ctx.focused.at(-1), 'content');
    assert.deepEqual(selections.at(-1), [2, 5]);
});

test('without getLayout the editor holds the layout itself: setLayout seeds it and is the saved baseline', (t) => {
    const { document } = parseHTML('<!doctype html><html><body><div id="host"></div></body></html>');
    const host = document.getElementById('host');
    const changes = [];
    const editor = createPromptLayoutEditor({ document, container: host, onChange: next => changes.push(next), random: sequenceRandom() });
    t.after(() => editor.destroy());
    editor.setLayout(addBlock(createDefaultLayout(), createCustomBlock({ name: 'seed' }, [], () => 0.3)));
    assert.equal(host.querySelectorAll('.lwb-ple-row').length, 9);
    assert.equal(host.querySelector('[data-ple-dirty]').hasAttribute('hidden'), true);
    host.querySelector('[data-ple-add]').dispatchEvent(new document.defaultView.Event('click', { bubbles: true }));
    assert.equal(host.querySelectorAll('.lwb-ple-row').length, 10);
    assert.equal(editor.getLayout().blocks.length, 10);
    assert.equal(host.querySelector('[data-ple-dirty]').hasAttribute('hidden'), false);
});

test('a disabled editor shows only the reason: no rows, add and reset disabled', (t) => {
    const ctx = setup(t, { getDisabledReason: () => '宿主版本过旧，请刷新页面' });
    assert.equal(ctx.rows().length, 0);
    const notice = ctx.host.querySelector('[data-ple-notice]');
    assert.equal(notice.hasAttribute('hidden'), false);
    assert.equal(notice.textContent, '宿主版本过旧，请刷新页面');
    assert.equal(ctx.host.querySelector('[data-ple-add]').hasAttribute('disabled'), true);
    assert.equal(ctx.host.querySelector('[data-ple-reset]').hasAttribute('disabled'), true);
    assert.equal(ctx.dirty(), false);
    ctx.add();
    assert.equal(ctx.changes.length, 0);
});

test('destroy removes the editor and stops reacting', (t) => {
    const ctx = setup(t);
    const add = ctx.host.querySelector('[data-ple-add]');
    ctx.editor.destroy();
    assert.equal(ctx.host.querySelector('.lwb-ple'), null);
    ctx.click(add);
    assert.equal(ctx.changes.length, 0);
});

// ── 样式 ────────────────────────────────────────────────


// ── 手风琴：一次只展开一条 ───────────────────────────────

const expandedIds = ctx => customIds(ctx).filter(id => ctx.row(id).querySelector('.lwb-ple-main').getAttribute('aria-expanded') === 'true');

test('accordion: adding a message collapses the previous one, expanding another collapses the open one, and data survives', (t) => {
    const ctx = setup(t);
    ctx.add();
    const [first] = customIds(ctx);
    const textarea = ctx.field(first, 'content');
    textarea.value = '第一条的内容';
    ctx.fire(textarea, 'input');
    ctx.add();
    const [, second] = customIds(ctx);
    assert.deepEqual(expandedIds(ctx), [second], '新加的展开，旧的收起');
    assert.equal(ctx.field(first, 'content'), undefined);

    ctx.click(ctx.field(first, 'main'));
    assert.deepEqual(expandedIds(ctx), [first], '展开另一条会收起当前这条');
    assert.equal(ctx.field(first, 'content').value, '第一条的内容', '未保存的编辑没有丢');
    ctx.click(ctx.field(first, 'main'));
    assert.deepEqual(expandedIds(ctx), [], '点已展开的一条可以全部收起');
    assert.equal(ctx.getLayout().blocks.find(block => block.id === first).content, '第一条的内容');
});

// ── 新消息的插入位置 ─────────────────────────────────────

test('add inserts below the expanded message, becomes the expanded one, and consecutive adds chain downward', (t) => {
    const ctx = setup(t);
    ctx.add();
    const [first] = customIds(ctx);
    ctx.click(ctx.field('rules', 'handle')); // 没有展开项变化，先让第一条展开着
    ctx.add();
    const [, second] = customIds(ctx);
    assert.equal(ctx.ids().indexOf(second), ctx.ids().indexOf(first) + 1, '紧贴在展开那条下方');
    ctx.add();
    const third = customIds(ctx).find(id => ![first, second].includes(id));
    assert.deepEqual(ctx.ids().slice(-3), [first, second, third], '连续添加一条条往下排（此时展开项一直在最后一条）');

    ctx.click(ctx.field(first, 'main')); // 展开第一条，再加：插到它下面，而不是末尾
    ctx.add();
    const fourth = customIds(ctx).find(id => ![first, second, third].includes(id));
    assert.equal(ctx.ids().indexOf(fourth), ctx.ids().indexOf(first) + 1);
    assert.deepEqual(expandedIds(ctx), [fourth]);
});

test('add falls back to the last selected message, and to the end when nothing is expanded or selected', (t) => {
    const ctx = setup(t);
    ctx.add();
    ctx.add();
    const [a, b] = customIds(ctx);
    ctx.click(ctx.field(b, 'main')); // 全部收起
    ctx.add();
    assert.equal(ctx.ids().at(-1), customIds(ctx).at(-1), '没有展开也没有选中：加在末尾');

    const c = customIds(ctx).at(-1);
    ctx.click(ctx.field(c, 'main'));
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true }); // 选中 a，不展开
    assert.deepEqual(expandedIds(ctx), []);
    ctx.add();
    const added = customIds(ctx).find(id => ![a, b, c].includes(id));
    assert.equal(ctx.ids().indexOf(added), ctx.ids().indexOf(a) + 1, '没有展开项时加在最近选中的消息下方');
});

// ── 多选 ─────────────────────────────────────────────────

const selectedIds = ctx => ctx.rows().filter(row => row.classList.contains('selected')).map(row => row.getAttribute('data-block-id'));
const bar = ctx => ctx.host.querySelector('[data-ple-selection-bar]');
const bulk = (ctx, name) => ctx.host.querySelector(`[data-ple-bulk="${name}"]`);

function withCustoms(t, count = 3) {
    const ctx = setup(t);
    for (let i = 0; i < count; i += 1) {
        ctx.add();
        const id = customIds(ctx).at(-1);
        const area = ctx.field(id, 'content');
        area.value = `内容 ${i + 1}`;
        ctx.fire(area, 'input');
    }
    return ctx;
}

test('the 多选 button toggles selection mode: checkboxes appear, a click selects, leaving clears the selection', (t) => {
    const ctx = setup(t);
    const button = ctx.host.querySelector('[data-ple-select-mode]');
    assert.equal(ctx.host.querySelector('.lwb-ple').classList.contains('select-mode'), false);
    assert.equal(bar(ctx).hasAttribute('hidden'), true);

    ctx.click(button);
    assert.equal(ctx.host.querySelector('.lwb-ple').classList.contains('select-mode'), true);
    assert.equal(button.getAttribute('aria-pressed'), 'true');
    assert.equal(ctx.host.querySelectorAll('[data-ple-field="select"]').length, 8, '每行一个选择框');

    const box = ctx.field('guide', 'select');
    box.checked = true;
    ctx.click(box);
    assert.deepEqual(selectedIds(ctx), ['guide']);
    assert.equal(bar(ctx).hasAttribute('hidden'), false);
    assert.equal(ctx.changes.length, 0, '选择不改布局');
    assert.equal(ctx.dirty(), false);

    box.checked = false;
    ctx.click(box);
    assert.deepEqual(selectedIds(ctx), []);
    assert.equal(bar(ctx).hasAttribute('hidden'), true);

    ctx.click(ctx.field('rules', 'select'));
    ctx.click(button);
    assert.deepEqual(selectedIds(ctx), [], '退出多选清空选择');
    assert.equal(ctx.host.querySelector('.lwb-ple').classList.contains('select-mode'), false);
});

test('Ctrl click selects without expanding, Shift click selects a range, built-in rows are selectable too', (t) => {
    const ctx = withCustoms(t);
    const [a, b, c] = customIds(ctx);
    assert.deepEqual(expandedIds(ctx), [c]);

    const edits = ctx.edits.length;
    const ctrl = ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    assert.equal(ctrl.defaultPrevented, true);
    assert.deepEqual(selectedIds(ctx), [a]);
    assert.deepEqual(expandedIds(ctx), [c], '选择不影响展开');
    assert.equal(ctx.host.querySelector('.lwb-ple').classList.contains('select-mode'), true, '选择后自动进入多选模式');

    ctx.fire(ctx.field(c, 'main'), 'click', { shiftKey: true }); // 范围：a 到 c
    assert.deepEqual(selectedIds(ctx), customIds(ctx).length ? ctx.ids().filter(id => ctx.ids().indexOf(id) >= ctx.ids().indexOf(a) && ctx.ids().indexOf(id) <= ctx.ids().indexOf(c)) : []);
    assert.ok(selectedIds(ctx).includes(b));

    ctx.fire(ctx.row('frame').querySelector('.lwb-ple-label'), 'click', { ctrlKey: true });
    assert.ok(selectedIds(ctx).includes('frame'), '内置块也能选');
    assert.equal(ctx.edits.length, edits, '没有触发“去编辑”');
    ctx.fire(ctx.field('frame', 'edit'), 'click', { ctrlKey: true });
    assert.equal(ctx.edits.at(-1), 'frame', '按钮本身不被当成选择');
});

test('the selection bar copies, deletes, toggles and clears; copy and delete need at least one custom block', (t) => {
    const ctx = withCustoms(t);
    const [a, b] = customIds(ctx);
    ctx.fire(ctx.field('opening', 'handle'), 'click', { ctrlKey: true });
    assert.equal(bulk(ctx, 'copy').hasAttribute('disabled'), true, '只选了内置块时不能复制');
    assert.equal(bulk(ctx, 'delete').hasAttribute('disabled'), true);
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    assert.equal(bulk(ctx, 'copy').hasAttribute('disabled'), false);

    ctx.click(bulk(ctx, 'enable'));
    assert.equal(ctx.getLayout().blocks.find(block => block.id === a).enabled, false);
    ctx.click(bulk(ctx, 'enable'));
    assert.equal(ctx.getLayout().blocks.find(block => block.id === a).enabled, true);

    ctx.click(bulk(ctx, 'clear'));
    assert.deepEqual(selectedIds(ctx), []);
    assert.equal(bar(ctx).hasAttribute('hidden'), true);
    assert.equal(ctx.layoutHasNoUiState(), true);
    assert.ok(b);
});

test('bulk copy duplicates custom blocks right below their originals, skips built-ins with a notice, selects the copies and can be undone', (t) => {
    const ctx = withCustoms(t);
    const [a, b, c] = customIds(ctx);
    const before = ctx.getLayout();
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.field(c, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.field('guide', 'handle'), 'click', { ctrlKey: true });
    ctx.click(bulk(ctx, 'copy'));

    const ids = ctx.ids();
    assert.equal(ids.length, before.blocks.length + 2);
    const copyA = ids[ids.indexOf(a) + 1];
    const copyC = ids[ids.indexOf(c) + 1];
    assert.ok(!before.blocks.some(block => block.id === copyA) && !before.blocks.some(block => block.id === copyC));
    assert.equal(ctx.getLayout().blocks.find(block => block.id === copyA).content, '内容 1');
    assert.deepEqual(selectedIds(ctx).sort(), [copyA, copyC].sort(), '选中的是副本');
    const undo = ctx.host.querySelector('[data-ple-undo-bar]');
    assert.equal(undo.hasAttribute('hidden'), false);

    ctx.click(ctx.host.querySelector('[data-ple-undo]'));
    assert.deepEqual(ctx.ids(), before.blocks.map(block => block.id), '撤销回到复制之前');
    assert.equal(undo.hasAttribute('hidden'), true);
    assert.ok(b);
});

test('bulk copy of only built-in blocks changes nothing and explains why', (t) => {
    const ctx = setup(t);
    ctx.fire(ctx.field('guide', 'handle'), 'click', { ctrlKey: true });
    const before = ctx.changes.length;
    ctx.click(bulk(ctx, 'copy'));
    assert.equal(bulk(ctx, 'copy').hasAttribute('disabled'), true, '按钮本来就不可用');
    ctx.fire(bulk(ctx, 'copy'), 'click'); // 即使强行触发也不改
    assert.equal(ctx.changes.length, before);
});

test('bulk delete removes only custom blocks, keeps selected built-ins, and the 撤销 bar restores everything', (t) => {
    const ctx = withCustoms(t);
    const [a, b, c] = customIds(ctx);
    const before = ctx.getLayout();
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.field(b, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.field('rules', 'handle'), 'click', { ctrlKey: true });
    const confirmsBefore = ctx.confirms.length;
    ctx.click(bulk(ctx, 'delete'));
    assert.equal(ctx.confirms.length, confirmsBefore, '有撤销，不再逐个确认');
    assert.deepEqual(customIds(ctx), [c]);
    assert.ok(ctx.ids().includes('rules'), '内置块保留');
    assert.deepEqual(selectedIds(ctx), ['rules'], '内置块仍然选中');

    ctx.click(ctx.host.querySelector('[data-ple-undo]'));
    assert.deepEqual(ctx.getLayout(), before);
});

test('deleting one block also offers 撤销, and any later change hides the undo bar', (t) => {
    const ctx = withCustoms(t, 2);
    const [a, b] = customIds(ctx);
    ctx.click(ctx.field(b, 'delete'));
    const undo = ctx.host.querySelector('[data-ple-undo-bar]');
    assert.equal(undo.hasAttribute('hidden'), false);
    ctx.click(ctx.host.querySelector('[data-ple-undo-close]'));
    assert.equal(undo.hasAttribute('hidden'), true, '可以直接关掉');

    ctx.click(ctx.field(a, 'main')); // 删除按钮在展开的消息里
    ctx.click(ctx.field(a, 'delete'));
    assert.equal(undo.hasAttribute('hidden'), false);
    ctx.add();
    assert.equal(undo.hasAttribute('hidden'), true, '之后任何修改都会收起撤销条（撤销只还原最近一次）');
});

test('dragging one selected row moves the whole selected group; keyboard moves it one step', (t) => {
    const ctx = withCustoms(t);
    const [a, b, c] = customIds(ctx);
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.field(b, 'main'), 'click', { ctrlKey: true });
    layoutRows(ctx);
    const top = ctx.ids().indexOf(a);
    const handle = ctx.field(a, 'handle');
    ctx.fire(handle, 'pointerdown', { button: 0, pointerId: 1, clientX: 10, clientY: top * 100 + 10 });
    assert.equal(ctx.row(b).classList.contains('dragging'), true, '整组都标记为拖动中');
    ctx.fire(ctx.document, 'pointermove', { pointerId: 1, clientY: 10 }); // 拖到最顶
    assert.equal(ctx.row('opening').classList.contains('drop-before'), true);
    ctx.fire(ctx.document, 'pointerup', { pointerId: 1, clientY: 10 });
    assert.deepEqual(ctx.ids().slice(0, 3), [a, b, 'opening'], '两条一起移到最前，保持相对顺序');
    assert.equal(ctx.host.querySelectorAll('.dragging, .drop-before, .drop-after').length, 0);
    assert.deepEqual(selectedIds(ctx), [a, b], '移动后选择还在');

    ctx.key(ctx.field(b, 'handle'), 'ArrowDown');
    assert.deepEqual(ctx.ids().slice(0, 3), ['opening', a, b], '键盘：整组下移一格');
    assert.ok(c);
});

test('dragging a row that is not selected moves only that row', (t) => {
    const ctx = withCustoms(t);
    const [a, b, c] = customIds(ctx);
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.field(b, 'main'), 'click', { ctrlKey: true });
    layoutRows(ctx);
    const handle = ctx.field(c, 'handle');
    ctx.fire(handle, 'pointerdown', { button: 0, pointerId: 1, clientX: 10, clientY: ctx.ids().indexOf(c) * 100 + 10 });
    ctx.fire(ctx.document, 'pointermove', { pointerId: 1, clientY: 10 });
    ctx.fire(ctx.document, 'pointerup', { pointerId: 1, clientY: 10 });
    assert.equal(ctx.ids()[0], c);
    assert.ok(ctx.ids().indexOf(a) > 0 && ctx.ids().indexOf(b) > 0, '没选中的行单独移动，选中的行留在原处');
});

test('selection and expansion never leak into the stored layout or the draft', (t) => {
    const ctx = withCustoms(t);
    const [a, b] = customIds(ctx);
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.field(b, 'main'), 'click', { shiftKey: true });
    ctx.click(ctx.host.querySelector('[data-ple-select-mode]'));
    const json = JSON.stringify(ctx.getLayout());
    assert.doesNotMatch(json, /selected|expanded|select|anchor/);
    assert.deepEqual(Object.keys(ctx.getLayout()), ['version', 'blocks']);
    assert.deepEqual(Object.keys(ctx.getLayout().blocks.find(block => block.id === a)).sort(), ['content', 'enabled', 'id', 'name', 'role']);
    assert.deepEqual(layoutForStorage(createDefaultLayout()), undefined);
});

test('reset and render({collapse}) clear the selection and the undo bar; stale ids are dropped when the layout changes outside', (t) => {
    const ctx = withCustoms(t);
    const [a, b] = customIds(ctx);
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    ctx.click(ctx.field(b, 'main'));
    ctx.click(ctx.field(b, 'delete'));
    assert.equal(ctx.host.querySelector('[data-ple-undo-bar]').hasAttribute('hidden'), false);
    ctx.editor.render({ collapse: true });
    assert.deepEqual(selectedIds(ctx), []);
    assert.equal(ctx.host.querySelector('[data-ple-undo-bar]').hasAttribute('hidden'), true);
    assert.deepEqual(expandedIds(ctx), []);

    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    ctx.setLayout(createDefaultLayout()); // 预设切换：a 不存在了
    ctx.editor.render();
    assert.deepEqual(selectedIds(ctx), []);
    assert.equal(bar(ctx).hasAttribute('hidden'), true);
});
