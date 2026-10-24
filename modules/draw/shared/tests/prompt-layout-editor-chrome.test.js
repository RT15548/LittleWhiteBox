// 请求结构编辑器的外壳：整个面板可折叠（偏好记在 localStorage）、内置块的深色行、编辑按钮的笔形图标。linkedom 的真实 DOM，回调全部注入。
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createPromptLayoutEditor } from '../prompt-layout-editor.js';
import { BUILTIN_BLOCK_IDS, createDefaultLayout } from '../scene-planner-layout.js';
import { renderCharacterActionIcon } from '../character-action-icons.js';

// Acceptance contracts (cost: a user who folded the panel finds it open again after every reload, a custom message mistaken for a fixed block, or 编辑 turning back into a text button):
// - The chevron on the title row folds everything but the title row and shows 共 N 条; the choice survives a reload (same xb-draw-list-collapsed:<id> convention as the preset lists).
// - Adding a message or entering multi-select while folded unfolds first, so the user never edits something they cannot see.
// - Built-in rows carry .lwb-ple-builtin (the CSS gives them the darker background); custom messages never do.
// - Rows with an inline editor show the shared pen icon with title 编辑; 查看 / 设置 stay text.

function setup(t, { storage = new Map(), collapseId = 'prompt-layout', layout = createDefaultLayout(), builtinEditors = null, describeBuiltin } = {}) {
    const { document, window } = parseHTML('<!doctype html><html><body><div id="host"></div><div id="parking" hidden></div></body></html>');
    Object.defineProperty(window, 'localStorage', {
        configurable: true,
        value: {
            getItem: key => (storage.has(key) ? storage.get(key) : null),
            setItem: (key, value) => storage.set(key, String(value)),
        },
    });
    const host = document.getElementById('host');
    const editors = builtinEditors
        ? Object.fromEntries(builtinEditors.map((id) => {
            const node = document.createElement('div');
            node.id = `editor-${id}`;
            return [id, node];
        }))
        : {};
    let current = layout;
    const changes = [];
    const editor = createPromptLayoutEditor({
        document,
        container: host,
        getLayout: () => current,
        getSavedLayout: () => createDefaultLayout(),
        onChange: (next) => { current = next; changes.push(next); },
        describeBuiltin: describeBuiltin || (id => ({ summary: `摘要-${id}`, action: id === 'frame' ? 'view' : 'edit' })),
        builtinEditors: editors,
        editorParking: document.getElementById('parking'),
        collapseId,
        random: () => 0.123,
    });
    t.after(() => editor.destroy());
    editor.render();
    const click = node => node.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
    return {
        document, host, editor, storage, changes, click,
        root: () => host.querySelector('.lwb-ple'),
        toggle: () => host.querySelector('[data-ple-collapse]'),
        count: () => host.querySelector('[data-ple-collapsed-count]'),
        rows: () => Array.from(host.querySelectorAll('.lwb-ple-row')),
        row: id => host.querySelector(`[data-block-id="${id}"]`),
    };
}

test('the chevron sits first on the title row and folds the panel; 共 N 条 shows only while folded', (t) => {
    const ctx = setup(t);
    const headline = ctx.host.querySelector('.lwb-ple-headline');
    assert.equal(headline.firstElementChild, ctx.toggle(), 'chevron comes first on the title row');
    assert.ok(ctx.toggle().classList.contains('preset-list-toggle'), 'same toggle look as the preset lists');
    assert.equal(ctx.toggle().querySelector('i').getAttribute('class'), 'fa-solid fa-chevron-down');
    assert.ok(ctx.host.querySelector('.lwb-ple-actions').contains(ctx.host.querySelector('[data-ple-add]')), 'the buttons stay on the title row');

    assert.equal(ctx.editor.isCollapsed(), false);
    assert.equal(ctx.root().classList.contains('collapsed'), false);
    assert.equal(ctx.toggle().getAttribute('aria-expanded'), 'true');
    assert.equal(ctx.toggle().getAttribute('aria-label'), '折叠请求结构');
    assert.equal(ctx.count().hasAttribute('hidden'), true);

    ctx.click(ctx.toggle());
    assert.equal(ctx.editor.isCollapsed(), true);
    assert.ok(ctx.root().classList.contains('collapsed'));
    assert.ok(ctx.toggle().classList.contains('collapsed'));
    assert.equal(ctx.toggle().getAttribute('aria-expanded'), 'false');
    assert.equal(ctx.toggle().getAttribute('aria-label'), '展开请求结构');
    assert.equal(ctx.count().hasAttribute('hidden'), false);
    assert.equal(ctx.count().textContent, `共 ${BUILTIN_BLOCK_IDS.length} 条`);
    assert.equal(ctx.changes.length, 0, 'folding never touches the layout');

    ctx.click(ctx.toggle());
    assert.equal(ctx.root().classList.contains('collapsed'), false);
    assert.equal(ctx.count().hasAttribute('hidden'), true);
});

test('the folded stylesheet hides the list and the other panels but keeps the title row', () => {
    const css = readFileSync(new URL('../prompt-layout-editor.css', import.meta.url), 'utf8');
    for (const part of ['hint', 'selection-bar', 'list', 'undo-bar', 'status']) {
        assert.match(css, new RegExp(`\\.lwb-ple\\.collapsed > \\.lwb-ple-${part}\\b`), `${part} is hidden while folded`);
    }
    assert.doesNotMatch(css, /\.lwb-ple\.collapsed > \.lwb-ple-head\b/);
});

test('the choice is remembered per collapseId in localStorage (xb-draw-list-collapsed:<id>) and survives a new editor', (t) => {
    const storage = new Map();
    const first = setup(t, { storage });
    first.click(first.toggle());
    assert.equal(storage.get('xb-draw-list-collapsed:prompt-layout'), '1');

    const reopened = setup(t, { storage });
    assert.equal(reopened.editor.isCollapsed(), true, 'a reloaded page starts folded');
    assert.ok(reopened.root().classList.contains('collapsed'));
    assert.equal(reopened.toggle().getAttribute('aria-expanded'), 'false');
    assert.equal(reopened.count().textContent, `共 ${BUILTIN_BLOCK_IDS.length} 条`);

    reopened.click(reopened.toggle());
    assert.equal(storage.get('xb-draw-list-collapsed:prompt-layout'), '0');
    assert.equal(setup(t, { storage }).editor.isCollapsed(), false);
});

test('other ids and a missing id do not share or write the preference; unavailable storage still folds for this session', (t) => {
    const storage = new Map([['xb-draw-list-collapsed:somewhere-else', '1']]);
    assert.equal(setup(t, { storage }).editor.isCollapsed(), false);

    const noId = setup(t, { storage: new Map(), collapseId: '' });
    noId.click(noId.toggle());
    assert.equal(noId.editor.isCollapsed(), true);
    assert.equal(noId.storage.size, 0, 'no id, nothing remembered');

    const { document, window } = parseHTML('<!doctype html><html><body><div id="host"></div></body></html>');
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
    const originalWarn = console.warn;
    console.warn = () => {}; // 存储被拦时编辑器会 warn 一次，这里是预期内的
    try {
        const editor = createPromptLayoutEditor({ document, container: document.getElementById('host'), onChange: () => {}, collapseId: 'prompt-layout' });
        t.after(() => editor.destroy());
        editor.render();
        document.querySelector('[data-ple-collapse]').dispatchEvent(new window.Event('click', { bubbles: true }));
        assert.equal(editor.isCollapsed(), true);
    } finally {
        console.warn = originalWarn;
    }
});

test('adding a message or entering multi-select while folded unfolds the panel first', (t) => {
    const ctx = setup(t);
    ctx.click(ctx.toggle());
    assert.equal(ctx.editor.isCollapsed(), true);
    ctx.click(ctx.host.querySelector('[data-ple-add]'));
    assert.equal(ctx.editor.isCollapsed(), false);
    assert.equal(ctx.changes.length, 1);
    assert.equal(ctx.storage.get('xb-draw-list-collapsed:prompt-layout'), '0');
    assert.equal(ctx.count().hasAttribute('hidden'), true);

    ctx.click(ctx.toggle());
    ctx.click(ctx.host.querySelector('[data-ple-select-mode]'));
    assert.equal(ctx.editor.isCollapsed(), false);
    assert.ok(ctx.root().classList.contains('select-mode'));
});

test('the count follows the layout while folded', (t) => {
    const ctx = setup(t);
    ctx.click(ctx.toggle());
    ctx.editor.setCollapsed(false);
    ctx.click(ctx.host.querySelector('[data-ple-add]'));
    ctx.editor.setCollapsed(true);
    assert.equal(ctx.count().textContent, `共 ${BUILTIN_BLOCK_IDS.length + 1} 条`);
});

test('built-in rows carry the fixed-structure class and custom messages never do; the stylesheet makes them darker from the theme variables', (t) => {
    const ctx = setup(t);
    ctx.click(ctx.host.querySelector('[data-ple-add]'));
    const rows = ctx.rows();
    assert.equal(rows.length, BUILTIN_BLOCK_IDS.length + 1);
    for (const row of rows) {
        const builtin = row.getAttribute('data-builtin') === 'true';
        assert.equal(row.classList.contains('lwb-ple-builtin'), builtin, row.getAttribute('data-block-id'));
        assert.equal(row.classList.contains('lwb-ple-custom'), !builtin);
    }
    assert.deepEqual(rows.filter(row => row.classList.contains('lwb-ple-builtin')).map(row => row.getAttribute('data-block-id')), BUILTIN_BLOCK_IDS);

    const css = readFileSync(new URL('../prompt-layout-editor.css', import.meta.url), 'utf8');
    assert.match(css, /\.lwb-ple-row\.lwb-ple-builtin\s*\{[^}]*background:\s*var\(--lwb-ple-builtin-bg\)/);
    // 深色（缺省）与浅色主题各有一档：都由页面的 --bg-primary 混入黑色得到，不写死颜色。
    const darkMix = css.match(/color-mix\(in srgb, var\(--bg-primary, #171922\) (\d+)%, #000\)/);
    const lightMix = css.match(/prefers-color-scheme: light\)\s*\{\s*\.lwb-ple\s*\{[^}]*color-mix\(in srgb, var\(--bg-primary, #fcfaf6\) (\d+)%, #000\)/);
    assert.ok(darkMix && lightMix, 'both themes define the builtin background');
    assert.ok(Number(darkMix[1]) < 100 && Number(lightMix[1]) < 100, 'each mixes in black, so both are darker than the page');
    assert.match(css, /\.lwb-ple-row\.lwb-ple-builtin:hover/);
});

test('rows with an inline editor get the shared pen icon button titled 编辑; 查看 and 设置 stay text buttons', (t) => {
    const ctx = setup(t, { builtinEditors: ['opening', 'guide'] });
    const edit = ctx.row('opening').querySelector('[data-ple-field="edit"]');
    assert.equal(edit.textContent, '', 'no text label any more');
    assert.equal(edit.getAttribute('title'), '编辑');
    assert.match(edit.getAttribute('aria-label'), /^编辑/);
    assert.ok(edit.classList.contains('char-action-button'), 'same button as the character cards');
    assert.equal(edit.tagName, 'BUTTON');
    assert.equal(edit.getAttribute('type'), 'button');
    const svg = edit.querySelector('svg');
    assert.ok(svg && edit.querySelectorAll('svg').length === 1);
    assert.equal(svg.getAttribute('viewBox'), '0 0 24 24');
    assert.equal(svg.getAttribute('aria-hidden'), 'true');
    // 图形与角色卡用的是同一份数据
    const penPaths = Array.from(svg.querySelectorAll('path')).map(path => path.getAttribute('d'));
    const cardPaths = Array.from(renderCharacterActionIcon('edit').matchAll(/ d="([^"]+)"/g), match => match[1]);
    assert.deepEqual(penPaths, cardPaths);

    // 查看 / 设置 仍是文字按钮（没有内联编辑器的行）
    assert.equal(ctx.row('frame').querySelector('[data-ple-field="edit"]').textContent, '查看');
    assert.equal(ctx.row('rules').querySelector('[data-ple-field="edit"]').textContent, '设置');
    assert.equal(ctx.row('rules').querySelector('[data-ple-field="edit"] svg'), null);

    // 展开后同一个按钮变成“收起”文字按钮，点击行为不变
    ctx.click(edit);
    const open = ctx.row('opening').querySelector('[data-ple-field="edit"]');
    assert.equal(open.textContent, '收起');
    assert.equal(ctx.row('opening').querySelector('#editor-opening') !== null, true);
});
