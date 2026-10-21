// 请求结构编辑器里的“工具块”：添加、代码编辑、读到的工具名、试运行、数量上限。linkedom 的真实 DOM，回调全部注入。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import { createDefaultLayout, createPromptLayoutEditor } from '../prompt-layout-editor.js';
import { MAX_TOOL_BLOCKS, addBlockAfter, createToolBlock } from '../scene-planner-layout.js';
import { DEFAULT_TOOL_CODE } from '../custom-tools.js';

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
    return {
        document, host, editor, fire,
        layout: () => current,
        toolRows: () => Array.from(host.querySelectorAll('.lwb-ple-row')).filter(row => row.querySelector('[data-ple-tool-tag]')),
        field: (row, name) => Array.from(row.querySelectorAll('[data-ple-field]')).find(node => node.getAttribute('data-ple-field') === name),
        addTool() { fire(host.querySelector('[data-ple-add-tool]'), 'click'); },
    };
}

test('“添加工具”新建一个展开的工具块，带 Reborn 同款的代码模板，并读出工具名', (t) => {
    const ui = setup(t);
    ui.addTool();
    const blocks = ui.layout().blocks.filter(block => block.kind === 'tool');
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].code, DEFAULT_TOOL_CODE);
    assert.equal(blocks[0].role, 'system');
    assert.equal(blocks[0].enabled, true);
    const [row] = ui.toolRows();
    assert.ok(row.classList.contains('expanded'));
    assert.equal(ui.field(row, 'code').value, DEFAULT_TOOL_CODE);
    assert.match(row.querySelector('[data-ple-tool-name]').textContent, /从代码读到的工具名：note/);
    assert.match(row.querySelector('.lwb-ple-label').textContent, /note/);
    assert.match(row.querySelector('[data-ple-count]').textContent, /字代码/);
    assert.match(row.textContent, /沙盒/);
});

test('改代码只原地更新工具名提示和字数，不重建行；读不到 name 时给出提示', (t) => {
    const ui = setup(t);
    ui.addTool();
    const [row] = ui.toolRows();
    const code = ui.field(row, 'code');
    code.value = 'return { name: "game_content", action: async () => "ok" };';
    ui.fire(code, 'input');
    assert.equal(ui.layout().blocks.find(block => block.kind === 'tool').code, code.value);
    assert.equal(ui.toolRows()[0], row, '行节点没有被重建');
    assert.match(row.querySelector('[data-ple-tool-name]').textContent, /game_content/);
    code.value = 'return { action() {} };';
    ui.fire(code, 'input');
    assert.match(row.querySelector('[data-ple-tool-name]').textContent, /没有从代码里读到 name/);
});

test('工具块可以和消息块一样启用、停用、删除（删除后可撤销）', (t) => {
    const ui = setup(t);
    ui.addTool();
    const [row] = ui.toolRows();
    const toggle = ui.field(row, 'toggle');
    toggle.checked = false;
    ui.fire(toggle, 'change');
    assert.equal(ui.layout().blocks.find(block => block.kind === 'tool').enabled, false);
    ui.fire(ui.field(ui.toolRows()[0], 'delete'), 'click');
    assert.equal(ui.layout().blocks.some(block => block.kind === 'tool'), false);
    ui.fire(ui.host.querySelector('[data-ple-undo]'), 'click');
    assert.equal(ui.layout().blocks.filter(block => block.kind === 'tool').length, 1);
});

test('“试运行”把块交给宿主，结果显示在块里；没有宿主回调时不出现按钮', async (t) => {
    const seen = [];
    const ui = setup(t, { onTestTool: async (block) => { seen.push(block); return { ok: true, message: '可用：工具名 note' }; } });
    ui.addTool();
    const [row] = ui.toolRows();
    ui.fire(ui.field(row, 'test'), 'click');
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(seen.length, 1);
    assert.equal(seen[0].kind, 'tool');
    const output = row.querySelector('[data-ple-tool-result]');
    assert.equal(output.textContent, '可用：工具名 note');
    assert.equal(output.getAttribute('data-ok'), 'true');

    const plain = setup(t);
    plain.addTool();
    assert.equal(plain.field(plain.toolRows()[0], 'test'), undefined);
});

test('试运行失败时显示原因', async (t) => {
    const ui = setup(t, { onTestTool: async () => { throw new Error('工具名无效：“1x”'); } });
    ui.addTool();
    const [row] = ui.toolRows();
    ui.fire(ui.field(row, 'test'), 'click');
    await new Promise(resolve => setTimeout(resolve, 0));
    const output = row.querySelector('[data-ple-tool-result]');
    assert.match(output.textContent, /工具名无效/);
    assert.equal(output.getAttribute('data-ok'), 'false');
});

test(`工具块最多 ${MAX_TOOL_BLOCKS} 个`, (t) => {
    let layout = createDefaultLayout();
    for (let index = 0; index < MAX_TOOL_BLOCKS; index += 1) {
        layout = addBlockAfter(layout, createToolBlock({ code: `return { name: "t${index}", action() {} };` }, layout.blocks.map(block => block.id), () => (index + 1) / 20));
    }
    const ui = setup(t, { layout });
    ui.addTool();
    assert.equal(ui.layout().blocks.filter(block => block.kind === 'tool').length, MAX_TOOL_BLOCKS);
    assert.match(ui.host.querySelector('[data-ple-status]').textContent, /最多/);
});

test('普通消息块没有代码框，也没有“工具”标记', (t) => {
    const ui = setup(t);
    ui.host.querySelector('[data-ple-add]').dispatchEvent(new ui.document.defaultView.Event('click', { bubbles: true }));
    const rows = Array.from(ui.host.querySelectorAll('.lwb-ple-custom'));
    assert.equal(rows.length, 1);
    assert.equal(ui.field(rows[0], 'code'), undefined);
    assert.equal(rows[0].querySelector('[data-ple-tool-tag]'), null);
});
