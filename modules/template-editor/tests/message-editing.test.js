import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import { parse } from 'acorn';
import { parseHTML } from 'linkedom';

const sourceUrl = new URL('../template-editor.js', import.meta.url);
const source = readFileSync(sourceUrl, 'utf8');
const declarations = parse(source, { sourceType: 'module', ecmaVersion: 'latest' }).body.filter(node =>
    node.type === 'ClassDeclaration' && ['TemplateProcessor', 'MessageHandler'].includes(node.id.name)
    || node.type === 'VariableDeclaration' && node.declarations.some(item => ['state', 'eventHandlers'].includes(item.id.name)));

function fixture() {
    const { document } = parseHTML('<div id="chat"><div class="mes" mesid="0"><div class="mes_text"></div></div></div>');
    const message = { mes: '**original**', name: 'Character', is_user: false, extra: {} };
    const timers = [], frames = [], rendered = [];
    const settings = { enabled: true };
    const context = vm.createContext({
        document, getContext: () => ({ chat: [message] }),
        TemplateSettings: { get: () => settings, getCharTemplate: () => ({ disableParsers: true, template: 'Template [[body]]' }) },
        utils: { getCharAvatar: () => 'character.png', isCustomTemplate: () => false },
        observeAsyncCallback: callback => callback,
        setTimeout: (callback, delay) => timers.push({ callback, delay }),
        requestAnimationFrame: callback => frames.push(callback),
        IframeManager: { sendUpdate: async () => {} },
        updateMessageBlock: (id, item) => {
            rendered.push(id);
            // The host replaces this element's children; an active textarea
            // would be lost just as in SillyTavern's updateMessageBlock.
            document.querySelector('.mes_text').textContent = item.extra?.display_text ?? item.mes;
        },
    });
    vm.runInContext(declarations.map(node => source.slice(node.start, node.end)).join('\n')
        .replaceAll('import.meta.url', JSON.stringify(sourceUrl.href))
        + '\nglobalThis.handler = MessageHandler; globalThis.events = eventHandlers;', context);
    const beginEdit = () => {
        const editor = document.createElement('textarea');
        editor.className = 'edit_textarea';
        editor.value = '**unsaved edit**';
        document.querySelector('.mes_text').replaceChildren(editor);
        return editor;
    };
    const runMessageRefresh = async () => {
        const index = timers.findIndex(timer => timer.delay === 150);
        assert.notEqual(index, -1);
        await timers.splice(index, 1)[0].callback();
    };
    return { document, message, settings, context, beginEdit, runMessageRefresh, frames, rendered };
}

// Acceptance: a delayed template refresh must preserve an active editor and its
// unsaved text, then resume on the saved message. Cost: irreversible prose loss.
for (const action of ['save', 'cancel']) test(`delayed template refresh preserves the editor and resumes after ${action}`, async () => {
    const f = fixture();
    f.context.events.MESSAGE_UPDATED(0);
    const editor = f.beginEdit();
    await f.runMessageRefresh();
    assert.equal(f.document.querySelector('.edit_textarea') === editor, true);
    assert.equal(editor.value, '**unsaved edit**');
    assert.equal(f.message.mes, '**original**');
    assert.deepEqual(f.rendered, []);

    if (action === 'save') f.message.mes = editor.value;
    f.document.querySelector('.mes_text').textContent = f.message.mes;
    f.context.events.MESSAGE_UPDATED(0);
    await f.runMessageRefresh();
    assert.deepEqual(f.rendered, [0]);
    assert.ok(f.message.extra.display_text.includes(f.message.mes));
    assert.equal(f.message.mes, action === 'save' ? '**unsaved edit**' : '**original**');
});

// Acceptance: clearing templates, including an already queued frame, must not
// remove an editor opened before execution. Cost: irreversible prose loss.
for (const action of ['clearTemplate', 'clearAll']) {
    test(`${action} preserves unsaved prose while removing the template projection`, () => {
        const f = fixture();
        f.message.extra.display_text = 'old template projection';
        if (action === 'clearAll') f.context.handler.clearAll();
        const editor = f.beginEdit();
        if (action === 'clearAll') f.frames.shift()();
        else f.context.handler.clearTemplate(0, f.message);
        assert.equal(f.document.querySelector('.edit_textarea') === editor, true);
        assert.equal(editor.value, '**unsaved edit**');
        assert.equal(f.message.mes, '**original**');
        assert.equal(f.message.extra.display_text, undefined);
        assert.deepEqual(f.rendered, []);
    });
}
