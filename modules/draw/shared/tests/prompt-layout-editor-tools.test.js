// 请求结构编辑器里消息的“附带工具”：勾选、代码编辑、读到的工具名、试运行、数量上限、复制。linkedom 的真实 DOM，回调全部注入。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import { createDefaultLayout, createPromptLayoutEditor } from '../prompt-layout-editor.js';
import { MAX_TOOLS, MAX_TOOL_CODE_CHARS, addBlockAfter, hasTool, layoutForStorage } from '../scene-planner-layout.js';
import { DEFAULT_TOOL_CODE } from '../custom-tools.js';
import { createToolBlock } from './helpers/tool-block.js';

function sequenceRandom() {
    let n = 0;
    return () => { n += 1; return (n * 0.0137) % 1; };
}

function setup(t, { layout = createDefaultLayout(), onTestTool } = {}) {
    const { document } = parseHTML('<!doctype html><html><body><div id="host"></div></body></html>');
    const host = document.getElementById('host');
    let current = layout;
    const editor = createPromptLayoutEditor({
        document,
        container: host,
        getLayout: () => current,
        getSavedLayout: () => createDefaultLayout(),
        onChange: (next) => { current = next; },
        onTestTool,
        random: sequenceRandom(),
    });
    t.after(() => editor.destroy());
    editor.render();
    const fire = (node, type) => node.dispatchEvent(new document.defaultView.Event(type, { bubbles: true, cancelable: true }));
    const ui = {
        document, host, editor, fire,
        layout: () => current,
        customRows: () => Array.from(host.querySelectorAll('.lwb-ple-custom')),
        toolRows: () => Array.from(host.querySelectorAll('.lwb-ple-row')).filter(row => row.querySelector('[data-ple-tool-tag]')),
        field: (row, name) => Array.from(row.querySelectorAll('[data-ple-field]')).find(node => node.getAttribute('data-ple-field') === name),
        addMessage() { fire(host.querySelector('[data-ple-add]'), 'click'); return ui.customRows().at(-1) ?? null; },
        // 勾上 / 取消“附带工具”；行会重建，所以返回重建后的同一块的行。
        setTool(row, on) {
            const id = row.getAttribute('data-block-id');
            const box = ui.field(row, 'tool-toggle');
            box.checked = on;
            fire(box, 'change');
            return ui.customRows().find(item => item.getAttribute('data-block-id') === id);
        },
        toolBlocks: () => current.blocks.filter(hasTool),
    };
    return ui;
}

// An invalid-length edit stays intact across rerenders and remains editable after rejected storage (lost user edits).
test('oversize tool code remains visible and editable after validation failure', t => {
    const ui = setup(t);
    let row = ui.setTool(ui.addMessage(), true);
    let codeBox = ui.field(row, 'code');
    const code = 'x'.repeat(MAX_TOOL_CODE_CHARS + 47);
    codeBox.value = code;
    ui.fire(codeBox, 'input');
    assert.equal(ui.toolBlocks()[0].tool.code, code);
    assert.equal(codeBox.value, code);
    assert.equal(codeBox.getAttribute('aria-invalid'), 'true');
    assert.equal(row.querySelector('[data-ple-code-error]').hidden, false);
    assert.throws(() => layoutForStorage(ui.layout()), { code: 'CUSTOM_TOOL_CODE_TOO_LONG' });
    ui.editor.render({ force: true });
    row = ui.toolRows()[0];
    codeBox = ui.field(row, 'code');
    assert.equal(codeBox.value, code);
    codeBox.value = DEFAULT_TOOL_CODE;
    ui.fire(codeBox, 'input');
    assert.equal(codeBox.getAttribute('aria-invalid'), 'false');
    assert.equal(row.querySelector('[data-ple-code-error]').hidden, true);
    assert.equal(layoutForStorage(ui.layout()).blocks.at(-1).tool.code, DEFAULT_TOOL_CODE);
});

test('在消息上勾“附带工具”：带 Reborn 同款代码模板，消息本身不变，并读出工具名', (t) => {
    const ui = setup(t);
    const message = ui.addMessage();
    const content = ui.field(message, 'content');
    content.value = '请先调用 note';
    ui.fire(content, 'input');
    assert.equal(ui.toolRows().length, 0);
    assert.equal(ui.field(message, 'code'), undefined, '没勾时没有代码框');

    const row = ui.setTool(message, true);
    const [block] = ui.toolBlocks();
    assert.equal(block.tool.code, DEFAULT_TOOL_CODE);
    assert.equal(block.content, '请先调用 note');
    assert.equal(block.role, 'user');
    assert.equal(block.enabled, true);
    assert.ok(row.classList.contains('expanded'));
    assert.equal(ui.field(row, 'code').value, DEFAULT_TOOL_CODE);
    assert.equal(ui.field(row, 'tool-toggle').checked, true);
});

test('编辑工具代码保留输入并更新工具名，不重建行', (t) => {
    const ui = setup(t);
    const row = ui.setTool(ui.addMessage(), true);
    const code = ui.field(row, 'code');
    code.value = 'return { name: "game_content", action: async () => "ok" };';
    ui.fire(code, 'input');
    assert.equal(ui.toolBlocks()[0].tool.code, code.value);
    assert.equal(ui.toolRows()[0], row, '行节点没有被重建');
    assert.match(row.querySelector('[data-ple-tool-name]').textContent, /game_content/);
    assert.match(row.querySelector('[data-ple-tool-tag]').textContent, /game_content/);
});

test('取消勾选把工具从布局里拿掉但不动消息；勾回来恢复刚才改过的代码（只在本页面内存里）', (t) => {
    const ui = setup(t);
    let row = ui.setTool(ui.addMessage(), true);
    const id = row.getAttribute('data-block-id');
    const content = ui.field(row, 'content');
    content.value = '说明文字';
    ui.fire(content, 'input');
    const code = ui.field(row, 'code');
    code.value = 'return { name: "mine", action() {} };';
    ui.fire(code, 'input');

    row = ui.setTool(row, false);
    assert.equal(ui.toolBlocks().length, 0);
    assert.equal(Object.hasOwn(ui.layout().blocks.find(block => block.id === id), 'tool'), false);
    assert.equal(ui.layout().blocks.find(block => block.id === id).content, '说明文字');
    assert.equal(ui.field(row, 'code'), undefined);
    assert.equal(row.querySelector('[data-ple-tool-tag]'), null);

    row = ui.setTool(row, true);
    assert.equal(ui.toolBlocks()[0].tool.code, 'return { name: "mine", action() {} };');
    assert.equal(ui.field(row, 'code').value, 'return { name: "mine", action() {} };');
});

test('带工具的消息可以像别的消息一样启用、停用、删除（删除后可撤销，工具跟着回来）', (t) => {
    const ui = setup(t);
    const row = ui.setTool(ui.addMessage(), true);
    const toggle = ui.field(row, 'toggle');
    toggle.checked = false;
    ui.fire(toggle, 'change');
    assert.equal(ui.toolBlocks()[0].enabled, false);
    ui.fire(ui.field(ui.toolRows()[0], 'delete'), 'click');
    assert.equal(ui.toolBlocks().length, 0);
    ui.fire(ui.host.querySelector('[data-ple-undo]'), 'click');
    assert.equal(ui.toolBlocks().length, 1);
});

test('“试运行”把块交给宿主，结果显示在块里；没有宿主回调时不出现按钮', async (t) => {
    const seen = [];
    const ui = setup(t, { onTestTool: async (block) => { seen.push(block); return { ok: true, message: '可用：工具名 note' }; } });
    const row = ui.setTool(ui.addMessage(), true);
    ui.fire(ui.field(row, 'test'), 'click');
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(seen.length, 1);
    assert.equal(seen[0].tool.code, DEFAULT_TOOL_CODE);
    const output = row.querySelector('[data-ple-tool-result]');
    assert.equal(output.textContent, '可用：工具名 note');
    assert.equal(output.getAttribute('data-ok'), 'true');

    const plain = setup(t);
    const plainRow = plain.setTool(plain.addMessage(), true);
    assert.equal(plain.field(plainRow, 'test'), undefined);
});

test('试运行失败时显示原因', async (t) => {
    const ui = setup(t, { onTestTool: async () => { throw new Error('工具名无效：“1x”'); } });
    const row = ui.setTool(ui.addMessage(), true);
    ui.fire(ui.field(row, 'test'), 'click');
    await new Promise(resolve => setTimeout(resolve, 0));
    const output = row.querySelector('[data-ple-tool-result]');
    assert.match(output.textContent, /工具名无效/);
    assert.equal(output.getAttribute('data-ok'), 'false');
});

test(`附带工具最多 ${MAX_TOOLS} 个：第 ${MAX_TOOLS + 1} 个被拦下，勾选框退回`, (t) => {
    let layout = createDefaultLayout();
    for (let index = 0; index < MAX_TOOLS; index += 1) {
        layout = addBlockAfter(layout, createToolBlock({ code: `return { name: "t${index}", action() {} };` }, layout.blocks.map(block => block.id), () => (index + 1) / 20));
    }
    const ui = setup(t, { layout });
    const message = ui.addMessage();
    const row = ui.setTool(message, true);
    assert.equal(ui.toolBlocks().length, MAX_TOOLS);
    assert.equal(ui.field(row, 'tool-toggle').checked, false);
});

test('普通消息没有代码框，也没有 🛠 标记；顶栏没有单独的“添加工具”按钮', (t) => {
    const ui = setup(t);
    const row = ui.addMessage();
    assert.equal(ui.customRows().length, 1);
    assert.equal(ui.field(row, 'code'), undefined);
    assert.equal(row.querySelector('[data-ple-tool-tag]'), null);
    assert.equal(ui.host.querySelector('[data-ple-add-tool]'), null);
    assert.equal(ui.field(row, 'tool-toggle').checked, false);
});

test('多选复制带工具的消息：副本不带工具，并在提示里说明', (t) => {
    const ui = setup(t);
    const row = ui.setTool(ui.addMessage(), true);
    const id = row.getAttribute('data-block-id');
    ui.fire(ui.host.querySelector('[data-ple-select-mode]'), 'click');
    const select = ui.field(ui.host.querySelector(`[data-block-id="${id}"]`), 'select');
    select.checked = true;
    ui.fire(select, 'click');
    ui.fire(ui.host.querySelector('[data-ple-bulk="copy"]'), 'click');
    assert.equal(ui.toolBlocks().length, 1, '只有原消息带工具');
    assert.equal(ui.customRows().length, 2, '原消息 + 一个副本');
});
