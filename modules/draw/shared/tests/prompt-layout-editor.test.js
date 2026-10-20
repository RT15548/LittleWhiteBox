// 消息布局编辑器（共享 UI 组件）：跑在 linkedom 的真实 DOM 上，DOM / 回调全部注入。
// linkedom 没有布局和焦点：行矩形手写，focus() 与 activeElement 在测试里自己记录 / 设置。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

import {
    createDefaultLayout,
    createPromptLayoutEditor,
    findMovedId,
    isDefaultLayout,
    layoutFingerprint,
    layoutForStorage,
    previewText,
} from '../prompt-layout-editor.js';
import { BUILTIN_BLOCK_IDS, addBlock, createCustomBlock } from '../scene-planner-layout.js';

const CSS = new URL('../prompt-layout-editor.css', import.meta.url);

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
    };
}

function customIds(ctx) {
    return ctx.ids().filter(id => !BUILTIN_BLOCK_IDS.includes(id));
}

// ── 纯函数 ──────────────────────────────────────────────

test('previewText takes the first non-empty line, collapses it and truncates by characters', () => {
    assert.equal(previewText('\n\n  hello  \nworld'), 'hello');
    assert.equal(previewText(''), '');
    assert.equal(previewText(undefined), '');
    assert.equal(previewText('a'.repeat(50), 10), `${'a'.repeat(10)}…`);
    assert.equal(previewText('你好世界', 2), '你好…');
});

test('findMovedId finds the one item whose removal makes both orders equal', () => {
    assert.equal(findMovedId(['a', 'b', 'c'], ['a', 'b', 'c']), null);
    assert.equal(findMovedId(['a', 'b', 'c'], ['b', 'c', 'a']), 'a');
    assert.equal(findMovedId(['a', 'b', 'c'], ['c', 'a', 'b']), 'c');
    assert.equal(findMovedId(['a', 'b', 'c', 'd'], ['a', 'c', 'b', 'd']), 'b', 'adjacent swap: either is valid, the earlier one is reported');
    assert.equal(findMovedId(['a', 'b', 'c'], ['a', 'x', 'c']), null, 'not a move');
});

test('the module re-exports the contract helpers a classic-script page needs', () => {
    assert.equal(isDefaultLayout(createDefaultLayout()), true);
    assert.equal(layoutForStorage(createDefaultLayout()), undefined);
    assert.equal(typeof layoutFingerprint(createDefaultLayout()), 'string');
});

// ── 默认外观 ────────────────────────────────────────────

test('renders the default layout as eight locked built-in rows in contract order', (t) => {
    const ctx = setup(t);
    assert.deepEqual(ctx.ids(), BUILTIN_BLOCK_IDS);
    for (const row of ctx.rows()) {
        assert.equal(row.getAttribute('data-builtin'), 'true');
        assert.equal(row.getAttribute('role'), 'listitem');
        assert.ok(row.querySelector('.lwb-ple-lock'), '带锁');
        assert.match(row.querySelector('.lwb-ple-role').className, /system|user/);
        const handle = row.querySelector('[data-ple-drag]');
        assert.equal(handle.getAttribute('role'), 'button');
        assert.equal(handle.getAttribute('tabindex'), '0');
        assert.match(handle.getAttribute('aria-label'), /拖动调整/);
        assert.equal(row.querySelector('input'), null, '内置块没有启用开关');
        assert.equal(row.querySelector('textarea'), null, '内置块不在这里编辑');
    }
    assert.equal(ctx.host.querySelector('.lwb-ple-list').getAttribute('role'), 'list');
    assert.equal(ctx.host.querySelector('.lwb-ple-title').textContent, '消息布局');
    assert.equal(ctx.dirty(), false);
    assert.equal(ctx.host.querySelector('[data-ple-reset]').hasAttribute('disabled'), true, '已是默认结构时无需恢复');
    assert.equal(ctx.host.querySelector('[data-ple-add]').textContent, '添加消息');
    assert.equal(ctx.host.querySelector('[data-ple-reset]').textContent, '恢复默认结构');
});

test('built-in rows show the injected summary and a 去编辑 / 查看 button that calls back with the id', (t) => {
    const ctx = setup(t, { describeBuiltin: id => ({ summary: `摘要-${id}`, action: id === 'frame' ? 'view' : id === 'limits' ? null : 'edit', label: id === 'guide' ? '模型TAG指南' : undefined }) });
    assert.equal(ctx.row('opening').querySelector('[data-ple-summary]').textContent, '摘要-opening');
    assert.equal(ctx.field('opening', 'edit').textContent, '去编辑');
    assert.equal(ctx.field('frame', 'edit').textContent, '查看');
    assert.equal(ctx.field('limits', 'edit'), undefined, 'action 为 null 时不显示按钮');
    assert.equal(ctx.row('guide').querySelector('.lwb-ple-label').textContent, '模型TAG指南', 'label 可由宿主覆盖');
    assert.equal(ctx.row('rules').querySelector('.lwb-ple-label').textContent, '场景规则');
    ctx.click(ctx.field('rules', 'edit'));
    ctx.click(ctx.field('frame', 'edit'));
    assert.deepEqual(ctx.edits, ['rules', 'frame']);
    assert.equal(ctx.changes.length, 0, '跳转不改布局');
});

test('refreshSummaries rewrites the summary text in place without rebuilding rows', (t) => {
    let summary = 'v1';
    const ctx = setup(t, { describeBuiltin: () => ({ summary }) });
    const row = ctx.row('opening');
    summary = 'v2';
    ctx.editor.refreshSummaries();
    assert.equal(ctx.row('opening'), row);
    assert.equal(row.querySelector('[data-ple-summary]').textContent, 'v2');
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
    assert.match(ctx.status(), /已在末尾添加/);
    assert.match(ctx.announced.at(-1), /已在末尾添加/);
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
    assert.equal(row.querySelector('[data-ple-count]').textContent, '9 字');

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
    assert.match(row.querySelector('[data-ple-role]').className, /assistant/);

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
    assert.equal(ctx.row(id).querySelector('[data-ple-count]').textContent, '7 字');
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
    assert.match(ctx.status(), /“开场与视角”已移到第 2 位，共 8 位/);

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
    assert.match(ctx.status(), /已移到第 1 位，共 9 位/);
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
    assert.match(ctx.confirms[0], /确定删除/);
    assert.deepEqual(customIds(ctx), [id], '拒绝后还在');

    ctx.click(ctx.field(id, 'delete'));
    assert.equal(ctx.confirms.length, 2);
    assert.deepEqual(customIds(ctx), []);
    assert.equal(ctx.getLayout().blocks.length, 8);
    assert.equal(ctx.focused.at(-1), 'limits', '焦点落到相邻块的手柄');
    assert.match(ctx.status(), /已删除/);
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
    assert.match(ctx.confirms[0], /2 条自定义消息/);
    assert.match(ctx.confirms[0], /保存后才会生效/);
    assert.equal(customIds(ctx).length, 2, '拒绝后不变');
    ctx.click(reset);
    assert.deepEqual(ctx.ids(), BUILTIN_BLOCK_IDS);
    assert.match(ctx.status(), /已恢复默认结构/);
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

test('createPromptLayoutEditor validates its required inputs', () => {
    assert.throws(() => createPromptLayoutEditor({}), /缺少/);
});

// ── 样式 ────────────────────────────────────────────────

test('stylesheet is self-contained: every CSS variable has a fallback and touch targets reach 44px', () => {
    const css = fs.readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const vars = css.match(/var\(--[^)]*\)/g) || [];
    assert.ok(vars.length > 10);
    for (const use of vars) assert.match(use, /var\(--[\w-]+\s*,/, `${use} 缺少缺省值`);
    const media = css.match(/@media \(max-width: 768px\)\s*\{([\s\S]*?)\n\}/);
    assert.ok(media, '有窄屏规则');
    assert.match(media[1], /\.lwb-ple-btn\s*\{[^}]*min-height:\s*44px/);
    assert.match(media[1], /\.lwb-ple-handle\s*\{[^}]*min-height:\s*44px/);
    assert.match(css, /\.lwb-ple-handle\s*\{[^}]*touch-action:\s*none/);
    assert.doesNotMatch(css, /\.btn\b|\.input\b/, '不依赖页面的 .btn / .input');
});
