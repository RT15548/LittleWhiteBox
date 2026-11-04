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
import { BUILTIN_BLOCK_IDS, addBlock, addBlockAfter, createCustomBlock } from '../scene-planner-layout.js';

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
    assert.deepEqual(ctx.getLayout().blocks.at(-1), { id, role: 'user', name: '', content: '', enabled: true, afterApproval: true });
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
    assert.equal(row.querySelector('[data-ple-role]').classList.contains('assistant'), true);

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
    for (const row of ctx.host.querySelectorAll('[data-ple-sort-id]')) {
        const rect = { top, bottom: top + 100, height: 100, left: 0, right: 300, width: 300 };
        row.getBoundingClientRect = () => rect;
        top += 100;
    }
}



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
    assert.equal(ctx.focused.at(-1), 'BUTTON', '最后一条删除后回到添加入口');
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


test('Ctrl click selects without expanding and Shift click selects custom messages without selecting built-ins', (t) => {
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
    assert.equal(selectedIds(ctx).includes('frame'), false, '内置块不参与消息选择');
    assert.equal(ctx.edits.length, edits, '没有触发“去编辑”');
    ctx.fire(ctx.field('frame', 'edit'), 'click', { ctrlKey: true });
    assert.equal(ctx.edits.at(-1), 'frame', '按钮本身不被当成选择');
});

test('the selection bar copies, deletes, toggles and clears; copy and delete need at least one custom block', (t) => {
    const ctx = withCustoms(t);
    const [a, b] = customIds(ctx);
    ctx.fire(ctx.row('opening').querySelector('.lwb-ple-label'), 'click', { ctrlKey: true });
    assert.equal(bulk(ctx, 'copy').hasAttribute('disabled'), true, '内置块不参与选择，没有消息可复制');
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

test('bulk copy duplicates only custom messages, selects the copies and can be undone', (t) => {
    const ctx = withCustoms(t);
    const [a, b, c] = customIds(ctx);
    const before = ctx.getLayout();
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.field(c, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.row('guide').querySelector('.lwb-ple-label'), 'click', { ctrlKey: true });
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

test('clicking built-in blocks leaves bulk copy disabled and the layout unchanged', (t) => {
    const ctx = setup(t);
    ctx.fire(ctx.row('guide').querySelector('.lwb-ple-label'), 'click', { ctrlKey: true });
    const before = ctx.changes.length;
    ctx.click(bulk(ctx, 'copy'));
    assert.equal(bulk(ctx, 'copy').hasAttribute('disabled'), true, '按钮本来就不可用');
    ctx.fire(bulk(ctx, 'copy'), 'click'); // 即使强行触发也不改
    assert.equal(ctx.changes.length, before);
});

test('bulk delete removes only custom messages, preserves built-ins, and the 撤销 bar restores everything', (t) => {
    const ctx = withCustoms(t);
    const [a, b, c] = customIds(ctx);
    const before = ctx.getLayout();
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.field(b, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.row('rules').querySelector('.lwb-ple-label'), 'click', { ctrlKey: true });
    const confirmsBefore = ctx.confirms.length;
    ctx.click(bulk(ctx, 'delete'));
    assert.equal(ctx.confirms.length, confirmsBefore, '有撤销，不再逐个确认');
    assert.deepEqual(customIds(ctx), [c]);
    assert.ok(ctx.ids().includes('rules'), '内置块保留');
    assert.deepEqual(selectedIds(ctx), [], '固定阶段不参与选择');

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



test('selection and expansion never leak into the stored layout or the draft', (t) => {
    const ctx = withCustoms(t);
    const [a, b] = customIds(ctx);
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.field(b, 'main'), 'click', { shiftKey: true });
    ctx.click(ctx.host.querySelector('[data-ple-select-mode]'));
    const json = JSON.stringify(ctx.getLayout());
    assert.doesNotMatch(json, /selected|expanded|select|anchor/);
    assert.deepEqual(Object.keys(ctx.getLayout()), ['version', 'blocks']);
    assert.deepEqual(Object.keys(ctx.getLayout().blocks.find(block => block.id === a)).sort(), ['afterApproval', 'content', 'enabled', 'id', 'name', 'role']);
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

// Contracts: stage boundaries shown by the editor are the positions used by the saved request.
test('fixed stages have no drag handles; messages cross whole stages with keyboard and pointer input', t => {
    const layout = addBlockAfter(createDefaultLayout(), createCustomBlock({ role: 'user' }, [], () => 0.5), 'tools');
    const ctx = setup(t, { layout });
    for (const id of BUILTIN_BLOCK_IDS) {
        assert.equal(ctx.field(id, 'handle'), undefined);
        assert.equal(ctx.field(id, 'select'), undefined);
    }
    const [id] = customIds(ctx);
    ctx.fire(ctx.field(id, 'main'), 'click');
    const area = ctx.field(id, 'content');
    area.value = '保留这条消息';
    ctx.fire(area, 'input');
    assert.equal(ctx.ids().indexOf(id), ctx.ids().indexOf('tools') + 1);
    ctx.key(ctx.field(id, 'handle'), 'ArrowDown');
    assert.equal(ctx.ids().indexOf(id), ctx.ids().indexOf('content') + 1);
    assert.equal(ctx.field(id, 'content').value, '保留这条消息');
    layoutRows(ctx);
    ctx.fire(ctx.field(id, 'handle'), 'pointerdown', { button: 0, pointerId: 1, clientY: 150 });
    ctx.fire(ctx.document, 'pointermove', { pointerId: 1, clientY: 0 });
    ctx.fire(ctx.document, 'pointerup', { pointerId: 1, clientY: 0 });
    assert.equal(ctx.ids().indexOf(id), 0);
    assert.deepEqual(ctx.ids().filter(value => BUILTIN_BLOCK_IDS.includes(value)), BUILTIN_BLOCK_IDS);
    assert.equal(ctx.field(id, 'content').value, '保留这条消息');
});

test('there are no insert buttons between groups; a new message goes after the approval group and can move before it', t => {
    const ctx = setup(t);
    assert.equal(ctx.host.querySelector('[data-ple-insert-after]'), null);
    ctx.add();
    const [id] = customIds(ctx);
    const order = () => Array.from(ctx.host.querySelectorAll('[data-ple-stage], .lwb-ple-row'), node => (node.hasAttribute('data-ple-stage') ? `组:${node.getAttribute('data-ple-stage')}` : node.getAttribute('data-block-id')));
    assert.deepEqual(order().filter(name => name.startsWith('组:')), ['组:setup', '组:materials', '组:guide', '组:approval']);
    assert.ok(order().indexOf(id) > order().indexOf('组:approval'), '新消息排在提交确认之后');
    ctx.key(ctx.field(id, 'handle'), 'ArrowUp');
    assert.equal(ctx.getLayout().blocks.find(block => block.id === id).afterApproval, undefined);
    assert.ok(order().indexOf(id) < order().indexOf('组:approval'), '上移一格后排在提交确认之前');
});

test('multi-selected messages move together without selecting or splitting the fixed stages', t => {
    const ctx = withCustoms(t);
    const [a, b, c] = customIds(ctx);
    ctx.fire(ctx.field(a, 'main'), 'click', { ctrlKey: true });
    ctx.fire(ctx.field(b, 'main'), 'click', { shiftKey: true });
    ctx.fire(ctx.row('guide').querySelector('.lwb-ple-label'), 'click', { ctrlKey: true });
    assert.deepEqual(selectedIds(ctx), [a, b]);
    ctx.key(ctx.field(a, 'handle'), 'ArrowUp');
    const flag = id => ctx.getLayout().blocks.find(block => block.id === id).afterApproval;
    assert.deepEqual(ctx.ids().slice(ctx.ids().indexOf('limits') + 1), [a, b, c]);
    assert.deepEqual([flag(a), flag(b), flag(c)], [undefined, undefined, true]);
    assert.deepEqual(ctx.ids().filter(value => BUILTIN_BLOCK_IDS.includes(value)), BUILTIN_BLOCK_IDS);
    assert.equal(ctx.getLayout().blocks.find(block => block.id === a).content, '内容 1');
    assert.equal(ctx.getLayout().blocks.find(block => block.id === b).content, '内容 2');
});

test('explicit reset still asks before removing custom messages and declining preserves the draft', t => {
    const ctx = setup(t, { confirmAnswers: [false, true] });
    ctx.add();
    const [id] = customIds(ctx);
    const area = ctx.field(id, 'content');
    area.value = '不可丢失';
    ctx.fire(area, 'input');
    const reset = ctx.host.querySelector('[data-ple-reset]');
    ctx.click(reset);
    assert.equal(ctx.field(id, 'content').value, '不可丢失');
    ctx.click(reset);
    assert.deepEqual(ctx.ids(), BUILTIN_BLOCK_IDS);
    assert.equal(isDefaultLayout(ctx.getLayout()), true);
});

test('the request structure shows every fixed prebuilt message, including the approval pair, and previews any row in place', t => {
    const ctx = setup(t, { describeBuiltin: id => ({ summary: `摘要-${id}`, action: null, ...(id === 'frame' ? { preview: 'FRAME-TEXT' } : {}) }) });
    const fixed = Array.from(ctx.host.querySelectorAll('[data-ple-fixed]'), node => node.getAttribute('data-ple-fixed'));
    assert.deepEqual(fixed, ['fixed-action', 'fixed-materials-call', 'fixed-guide-call', 'fixed-approval-call', 'fixed-approval-result']);
    assert.equal(ctx.host.querySelector('[data-ple-fixed] [data-ple-drag]'), null);
    assert.deepEqual(ctx.ids().filter(id => fixed.includes(id)), []);
    const body = id => ctx.host.querySelector(`[data-ple-fixed="${id}"] [data-ple-preview-body]`);
    const toggle = id => ctx.host.querySelector(`[data-ple-preview="${id}"]`);
    assert.equal(body('fixed-approval-result').hasAttribute('hidden'), true);
    ctx.click(toggle('fixed-approval-result'));
    assert.equal(body('fixed-approval-result').hasAttribute('hidden'), false);
    assert.match(body('fixed-approval-result').textContent, /APPROVED/);
    // 预览显示真正发出去的包装，而不只是里面那句话。
    assert.deepEqual(JSON.parse(body('fixed-approval-result').textContent), { approved: true, content: 'APPROVED. Proceed with `submit_scene_plan`.' });
    ctx.click(toggle('fixed-approval-result'));
    assert.equal(body('fixed-approval-result').hasAttribute('hidden'), true);
    // 行里的灰字只放包装里面那句话（并截到和别的行一样长），不把整串 JSON 挤进一行。
    const summaryOf = id => ctx.host.querySelector(`[data-ple-fixed="${id}"] .lwb-ple-summary`).textContent;
    assert.ok(!summaryOf('fixed-approval-result').includes('{'));
    assert.match(summaryOf('fixed-approval-result'), /^APPROVED\./);
    for (const id of fixed) assert.ok(Array.from(summaryOf(id)).length <= 41, `${id} summary too long`);
    assert.equal(toggle('opening'), null);
    ctx.click(toggle('frame'));
    assert.equal(ctx.row('frame').querySelector('[data-ple-preview-body]').textContent, 'FRAME-TEXT');
    assert.deepEqual(ctx.changes, []);
});

// 契约：预览回包更新当前只读数据，不能重建或覆盖正在编辑的消息；否则会丢失未保存草稿。
test('preview refresh updates open data in place without changing drafts or opening closed previews', t => {
    let preview = 'request-a';
    const ctx = setup(t, { describeBuiltin: id => ({ action: null, preview: id === 'frame' ? preview : '' }) });
    ctx.add();
    const [id] = customIds(ctx);
    const draft = ctx.field(id, 'content');
    draft.value = 'unsaved draft';
    ctx.fire(draft, 'input');
    const toggle = ctx.host.querySelector('[data-ple-preview="frame"]');
    const body = ctx.row('frame').querySelector('[data-ple-preview-body]');
    ctx.click(toggle);
    draft.focus();
    const layout = structuredClone(ctx.getLayout());
    const changeCount = ctx.changes.length;

    for (const next of ['request-b', 'request-b', 'request-c']) {
        preview = next;
        ctx.editor.refreshPreviews();
        assert.equal(body.value, next);
        assert.ok(ctx.row('frame').querySelector('[data-ple-preview-body]') === body);
        assert.ok(ctx.field(id, 'content') === draft);
        assert.ok(ctx.document.activeElement === draft);
        assert.equal(draft.value, 'unsaved draft');
        assert.deepEqual(ctx.getLayout(), layout);
        assert.equal(ctx.changes.length, changeCount);
    }

    ctx.click(toggle);
    preview = 'request-d';
    ctx.editor.refreshPreviews();
    assert.equal(body.hasAttribute('hidden'), true);
    ctx.click(toggle);
    assert.equal(body.value, preview);
});

test('tool-role rows are badged 工具返回 (not 工具), and only rows with an inline editor are marked editable', () => {
    const { document } = parseHTML('<html><body><div id="host"></div><div id="parking" hidden><div id="opening"><textarea></textarea></div><div id="guide"><textarea></textarea></div></div></body></html>');
    const host = document.getElementById('host');
    const editor = createPromptLayoutEditor({
        document, container: host, onChange: () => {},
        builtinEditors: { opening: document.getElementById('opening'), guide: document.getElementById('guide') },
        editorParking: document.getElementById('parking'),
        describeBuiltin: () => ({ summary: '摘要', action: 'edit' }),
    });
    editor.render();
    const row = id => host.querySelector(`[data-block-id="${id}"]`);
    const badge = node => node.querySelector('[data-ple-role]');
    const approvalResult = host.querySelector('[data-ple-fixed="fixed-approval-result"]');
    assert.equal(badge(approvalResult).textContent, '工具返回');
    assert.equal(badge(row('worldInfo')).textContent, '工具返回');
    assert.equal(badge(row('limits')).textContent, '工具返回');
    assert.equal(badge(row('opening')).textContent, '系统');
    assert.match(badge(row('limits')).getAttribute('title'), /不是工具定义/);
    assert.equal(badge(row('opening')).hasAttribute('title'), false);
    // 只有 opening / guide 提供了就地编辑器：只有它们带 editable，其余内置行与固定消息行都不带。
    assert.equal(row('opening').classList.contains('lwb-ple-editable'), true);
    assert.equal(row('guide').classList.contains('lwb-ple-editable'), true);
    assert.equal(row('worldInfo').classList.contains('lwb-ple-editable'), false);
    assert.equal(approvalResult.classList.contains('lwb-ple-editable'), false);
    // 内置行与固定消息行的末尾永远是两个按钮格（预览格、设置/编辑格），缺的一格留空，按钮才能上下对齐。
    for (const line of host.querySelectorAll('.lwb-ple-builtin > .lwb-ple-line, .lwb-ple-fixed > .lwb-ple-line')) {
        const tail = Array.from(line.children).slice(-2);
        assert.deepEqual(tail.map(node => node.classList.contains('lwb-ple-slot')), [true, true]);
    }
    assert.equal(row('opening').querySelector('.lwb-ple-slot [data-ple-field="edit"]') !== null, true);
    assert.equal(approvalResult.querySelectorAll('.lwb-ple-slot')[1].classList.contains('empty'), true);
    editor.destroy();
});

test('each fixed group, including the approval one, is dragged as one unit by its name (pointer only, not focusable)', t => {
    const layout = addBlockAfter(createDefaultLayout(), createCustomBlock({ role: 'user' }, [], () => 0.5), 'tools');
    const ctx = setup(t, { layout });
    const handles = Array.from(ctx.host.querySelectorAll('.lwb-ple-group-label[data-ple-drag]'), node => node.getAttribute('data-ple-drag'));
    assert.deepEqual(handles, ['tools', 'content', 'limits', 'approval']);
    // 组名不能聚焦：没有 tabindex / role，提示里也不再提键盘。
    for (const node of ctx.host.querySelectorAll('.lwb-ple-group-label[data-ple-drag]')) {
        assert.equal(node.hasAttribute('tabindex'), false);
        assert.equal(node.hasAttribute('role'), false);
        assert.doesNotMatch(node.getAttribute('title'), /↑|↓|聚焦/);
    }
    const [id] = customIds(ctx);
    layoutRows(ctx);
    ctx.fire(ctx.host.querySelector('[data-ple-drag="tools"]'), 'pointerdown', { button: 0, pointerId: 1, clientY: 50 });
    ctx.fire(ctx.document, 'pointermove', { pointerId: 1, clientY: 190 });
    ctx.fire(ctx.document, 'pointerup', { pointerId: 1, clientY: 190 });
    assert.equal(ctx.ids()[0], id);
    assert.deepEqual(ctx.ids().filter(value => BUILTIN_BLOCK_IDS.includes(value)), BUILTIN_BLOCK_IDS);
});

test('dragging the approval group below a message that follows it moves that message in front of the approval pair, and the move is announced', t => {
    const layout = addBlockAfter(createDefaultLayout(), createCustomBlock({ role: 'user' }, [], () => 0.5));
    const ctx = setup(t, { layout });
    const [id] = customIds(ctx);
    assert.equal(ctx.getLayout().blocks.find(block => block.id === id).afterApproval, true);
    layoutRows(ctx);
    // 排序行依次是 4 个固定组 + 末尾这条消息；“提交确认”是第 4 行（300–400），消息是第 5 行（400–500）。
    ctx.fire(ctx.host.querySelector('[data-ple-drag="approval"]'), 'pointerdown', { button: 0, pointerId: 1, clientY: 350 });
    ctx.fire(ctx.document, 'pointermove', { pointerId: 1, clientY: 480 });
    ctx.fire(ctx.document, 'pointerup', { pointerId: 1, clientY: 480 });
    assert.equal(ctx.getLayout().blocks.find(block => block.id === id).afterApproval, undefined);
    assert.deepEqual(ctx.announced, ['“提交确认”已移动位置']);
});

test('moving a message announces its new position among the blocks, not counting the approval marker', t => {
    const layout = addBlockAfter(createDefaultLayout(), createCustomBlock({ role: 'user' }, [], () => 0.5), 'tools');
    const ctx = setup(t, { layout });
    const [id] = customIds(ctx);
    layoutRows(ctx);
    ctx.fire(ctx.field(id, 'handle'), 'pointerdown', { button: 0, pointerId: 1, clientY: 150 });
    ctx.fire(ctx.document, 'pointermove', { pointerId: 1, clientY: 0 });
    ctx.fire(ctx.document, 'pointerup', { pointerId: 1, clientY: 0 });
    assert.equal(ctx.announced.length, 1);
    assert.match(ctx.announced[0], new RegExp(`已移到第 1 位，共 ${BUILTIN_BLOCK_IDS.length + 1} 位`));
});
