import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
    CHARACTER_EDITOR_NOTE_LINES,
    createCharacterEditorNote,
    renderCharacterEditorNote,
} from '../character-editor-copy.js';
import { renderCharacterFormSections, renderFormsSection } from '../character-edit-form.js';
import { createFixedAppearanceGroup, createFormBlock } from '../character-forms-dom.js';

// Acceptance contracts (cost: users see two names for one list, or a long hint repeated on every section / every form):
// - The dynamicStates list is called 动态标签 everywhere in the UI; "动态外貌" never appears in a shipped template.
// - Each form has exactly three sections (固定外貌 with 正向 + 负向 inside, 服装, 动态标签); there is no separate 负向 section.
// - The explanation text appears once at the end of the whole card, not once per form or per section.

const NOTE = [
    '形态、服装、动态标签的名称不是触发关键词，而是会发给 LLM 的描述，可用自然语言写',
    '形态（只选其一）：人形；兽形；男性；女性...',
    '服装（只选其一）：常服，家居穿 / white shirt, pleated skirt；礼服，正式场合 / evening dress, lace gloves',
    '动态标签（按画面选若干）：草帽 / straw hat；脸红 / blush, looking away；尾巴 / tail',
].join('\n');

const drawDir = fileURLToPath(new URL('../..', import.meta.url));

function sourceFiles(dir) {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return name === 'tests' || name === 'node_modules' ? [] : sourceFiles(path);
        return /\.(js|html|css)$/.test(name) && !/\.test\.js$/.test(name) ? [path] : [];
    });
}

const countOf = (text, needle) => text.split(needle).length - 1;

test('the explanation block carries the exact wording with its line breaks', () => {
    assert.equal(CHARACTER_EDITOR_NOTE_LINES.join('\n'), NOTE);
    const { document } = parseHTML(`<html><body>${renderCharacterEditorNote()}</body></html>`);
    const html = document.querySelector('.char-edit-note');
    assert.equal(document.querySelectorAll('.char-edit-note').length, 1);
    assert.equal(html.querySelectorAll('br').length, 3);
    assert.equal(html.innerHTML.split('<br>').join('\n'), NOTE);

    const dom = createCharacterEditorNote(document);
    assert.equal(dom.textContent, NOTE);
    assert.ok(dom.classList.contains('char-edit-note'));
});

test('the sections and form rows never render the explanation (it belongs to the card, not to a section or form)', () => {
    const models = [
        { key: 'main', name: '人形', appearance: 'a', negativeTags: 'n' },
        { key: 'f2', name: '兽形', appearance: 'b' },
    ];
    const html = `${renderCharacterFormSections(models[0], { charId: 'c1' })}${renderFormsSection(models, { charId: 'c1' })}`;
    assert.equal(countOf(html, 'char-edit-note'), 0);
    assert.equal(countOf(html, '非关键词调用'), 0);
});

test('each form has three sections; 固定外貌 holds the 正向 and 负向 inputs and the one-line hint', () => {
    const { document } = parseHTML(`<html><body>${renderCharacterFormSections({ appearance: 'long hair', negativeTags: 'bad hands', outfits: [], dynamicStates: [] }, { charId: 'c1' })}</body></html>`);
    const sections = Array.from(document.querySelectorAll('.char-edit-section'));
    assert.deepEqual(sections.map(node => node.dataset.section), ['appearance', 'outfits', 'dynamicStates']);
    assert.deepEqual(sections.map(node => node.querySelector('.char-section-title').textContent), ['固定外貌', '服装', '动态标签']);
    assert.equal(document.querySelector('[data-section="negative"]'), null);

    const [appearance] = sections;
    assert.equal(appearance.querySelector('.char-section-hint').textContent, '静态外貌描述固定输入，动作由LLM完成。');
    assert.deepEqual(Array.from(appearance.querySelectorAll('.char-section-body label.form-label')).map(node => node.textContent), ['正向', '负向（可选）']);
    assert.equal(appearance.querySelector('textarea.char-edit-appearance').textContent, 'long hair');
    assert.equal(appearance.querySelector('textarea.char-edit-neg').textContent, 'bad hands');
    assert.ok(appearance.querySelector('[data-action="search-danbooru"]'));
    assert.equal(document.querySelectorAll('.char-section-hint').length, 1);
    assert.equal(document.querySelector('[data-action="add-dynstate"]').textContent.trim(), '添加动态标签');
    assert.equal(document.querySelector('.char-dynstate-editor-empty').textContent, '暂无');
});

test('item inputs are labelled 标签 and the name inputs use the new placeholders', () => {
    const { document } = parseHTML(`<html><body>${renderCharacterFormSections({ outfits: [{ name: 'a', tags: 'x' }], dynamicStates: [{ name: 'b', tags: 'y' }] }, { charId: 'c1' })}</body></html>`);
    assert.equal(document.querySelector('.char-outfit-name').getAttribute('placeholder'), '服装名称');
    assert.equal(document.querySelector('.char-dynstate-name').getAttribute('placeholder'), '动态标签名称');
    const labels = Array.from(document.querySelectorAll('.named-tag-body label')).map(node => node.textContent);
    assert.deepEqual(labels, ['标签', '标签']);
    assert.match(document.querySelector('.char-dynstate-editor-item .char-menu-button').getAttribute('aria-label'), /^更多操作 动态标签 1/);
});

test('SD / ComfyUI: the fixed-appearance group keeps both fields on the existing field names and data keys', () => {
    const { document } = parseHTML('<html><body></body></html>');
    const calls = [];
    const createField = (label, field, value, placeholder, options = {}) => {
        calls.push({ label, field, value, dataKey: options.dataKey, multiline: options.multiline });
        const node = document.createElement('div');
        node.className = 'form-group';
        node.textContent = label;
        return node;
    };
    const group = createFixedAppearanceGroup({ document, createField, values: { appearance: 'a', negativeTags: 'n' } });
    assert.deepEqual(calls.map(call => [call.label, call.field, call.value, call.dataKey, call.multiline]), [
        ['正向', 'appearance', 'a', undefined, true],
        ['负向（可选）', 'negativeTags', 'n', undefined, true],
    ]);
    assert.equal(group.querySelector('.char-section-hint').textContent, '静态外貌描述固定输入，动作由LLM完成。');

    calls.length = 0;
    const block = createFormBlock({ document, form: { appearance: 'a2', negativeTags: 'n2' }, createField });
    assert.deepEqual(calls.filter(call => call.field === 'appearance' || call.field === 'negativeTags').map(call => [call.label, call.field, call.dataKey]), [
        ['正向', 'appearance', 'sdFormField'],
        ['负向（可选）', 'negativeTags', 'sdFormField'],
    ]);
    assert.equal(block.querySelectorAll('.sd-char-fieldgroup').length, 1);
});

test('every card template appends the explanation exactly once', () => {
    const read = rel => readFileSync(join(drawDir, rel), 'utf8');
    assert.equal(countOf(read('providers/novelai/novel-draw-page.js'), '${renderCharacterEditorNote()}'), 1);
    assert.equal(countOf(read('providers/sd-webui/sd-draw.js'), 'createCharacterEditorNote(document)'), 1);
    assert.equal(countOf(read('providers/comfyui/comfy-draw.js'), 'createCharacterEditorNote(document)'), 1);
});

test('no shipped source or template still says 动态外貌, 附加标签, 状态 TAG, 服装 TAG or 添加状态', () => {
    const files = sourceFiles(drawDir);
    assert.ok(files.length > 20);
    for (const file of files) {
        const text = readFileSync(file, 'utf8');
        for (const banned of ['动态外貌', '附加标签', '状态 TAG', '服装 TAG', '添加状态', '状态名称']) {
            assert.equal(text.includes(banned), false, `${file} still contains ${banned}`);
        }
    }
});
