import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';
import { AUTOFIT_MAX_LINES } from '../textarea-autofit.js';

// Contract (cost: in the chat's 编辑 TAG panel every box - 场景 and each 角色 - was a fixed 100-240px tall even for four lines of tags,
// so a card with several characters needed a lot of scrolling; origin: d595c26c raised the 60px minimum to 240px for phones, 0617d415 clamped it):
// - The boxes are built by one shared function and fit their content: one line minimum, AUTOFIT_MAX_LINES then a scrollbar.
// - The stylesheet no longer pins a minimum height (the manual resize handle and the panel's own max-height / scroll stay).
// - The Tavern (xiaobai) variant uses the same helper and has no minimum height either.
// linkedom has no layout: clientWidth / scrollHeight are stubbed per textarea; unmeasurable computed style falls back to 12px / 1.4.
const LINE = 12 * 1.4;

function stubLayout(textarea, state) {
    Object.defineProperty(textarea, 'clientWidth', { get: () => 300, configurable: true });
    Object.defineProperty(textarea, 'scrollHeight', { get: () => Math.max(1, state.lines) * LINE, configurable: true });
}

async function openPanel(t, groups) {
    const h = await fixture(['[image:slot]']);
    t.after(() => h.stop());
    const panel = document.createElement('div');
    panel.className = 'xb-nd-edit';
    panel.scrollIntoView = () => {};
    const scroll = document.createElement('div');
    scroll.className = 'xb-nd-edit-scroll';
    panel.append(scroll);
    document.body.append(panel);
    for (const group of groups) h.api.appendTagEditGroup(scroll, group);
    const states = new Map();
    for (const textarea of panel.querySelectorAll('textarea')) {
        const state = { lines: 1 };
        states.set(textarea, state);
        stubLayout(textarea, state);
    }
    return { h, panel, scroll, states };
}

test('appendTagEditGroup builds a labelled, auto-fit textarea carrying type and index', async (t) => {
    const { panel } = await openPanel(t, [
        { label: '场景', value: '1girl, solo', type: 'scene' },
        { label: '角色 1', value: 'red dress', type: 'char', index: 0 },
    ]);
    const [scene, char] = panel.querySelectorAll('textarea');
    assert.equal(panel.querySelectorAll('.xb-nd-edit-group').length, 2);
    assert.equal(scene.value, '1girl, solo');
    assert.equal(scene.getAttribute('aria-label'), '场景');
    assert.equal(scene.dataset.type, 'scene');
    assert.equal(scene.dataset.index, undefined);
    assert.equal(char.dataset.index, '0');
    assert.equal(char.previousElementSibling.textContent, '角色 1');
    for (const textarea of [scene, char]) {
        assert.equal(textarea.hasAttribute('data-autofit'), true);
        assert.equal(textarea.rows, 1, '一行起步：不是默认的两行');
    }
});

test('showing the panel fits every box to its own content; typing and a changed set of boxes re-fit', async (t) => {
    const { h, panel, scroll, states } = await openPanel(t, [
        { label: '场景', value: 'a\nb\nc\nd', type: 'scene' },
        { label: '角色 1', value: 'short', type: 'char', index: 0 },
        { label: '角色 2', value: 'x', type: 'char', index: 1 },
    ]);
    const [scene, first, second] = panel.querySelectorAll('textarea');
    states.get(scene).lines = 4;
    states.get(first).lines = 1;
    states.get(second).lines = 40;

    h.api.showDrawTagEditor(panel);
    assert.equal(panel.style.display, 'flex');
    assert.equal(scene.style.height, `${Math.ceil(4 * LINE)}px`, '四行内容就是四行高，不再是整块固定高度');
    assert.equal(first.style.height, `${Math.ceil(LINE)}px`, '一行内容就是一行高');
    assert.equal(second.style.height, `${Math.ceil(AUTOFIT_MAX_LINES * LINE)}px`, '内容很多时封顶');
    assert.equal(second.style.overflowY, 'auto');
    assert.equal(first.style.overflowY, 'hidden');

    // 输入时重量
    states.get(first).lines = 3;
    first.value = 'a\nb\nc';
    first.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(first.style.height, `${Math.ceil(3 * LINE)}px`);

    // 再次打开（滚动区被重建，新的文本框）：同一个面板只装一次观察器，但会重新量
    scroll.replaceChildren();
    h.api.appendTagEditGroup(scroll, { label: '场景', value: 'new', type: 'scene' });
    const fresh = panel.querySelector('textarea');
    stubLayout(fresh, { lines: 2 });
    h.api.showDrawTagEditor(panel);
    assert.equal(fresh.style.height, `${Math.ceil(2 * LINE)}px`);
});

test('no stylesheet pins a minimum height on the tag boxes any more, and the resize handle and the panel scroll stay', () => {
    const drawCommon = readFileSync(new URL('../draw-common.js', import.meta.url), 'utf8');
    const rule = drawCommon.match(/\.xb-nd-edit-input\{[^}]*\}/)?.[0] || '';
    assert.ok(rule, 'the rule exists');
    assert.doesNotMatch(rule, /min-height/);
    assert.match(rule, /resize:vertical/);
    assert.match(drawCommon, /\.xb-nd-edit-scroll\{[^}]*overflow-y:auto/);
    assert.match(drawCommon, /\.xb-nd-edit\{[^}]*max-height:/);
    assert.match(drawCommon, /<textarea class="xb-nd-edit-input" data-autofit rows="1" /, 'the single-box editor of a failed card fits too');

    const tavernCss = readFileSync(new URL('../../../tavern/app-src/styles/chat/markdown.css', import.meta.url), 'utf8');
    const tavernRule = tavernCss.match(/\.xb-tavern-image-edit-input\s*\{[^}]*\}/)?.[0] || '';
    assert.ok(tavernRule);
    assert.doesNotMatch(tavernRule, /min-height/);
    assert.match(tavernRule, /resize:\s*vertical/);
});

test('the Tavern editor marks its boxes for the shared helper and refits whenever the panel opens', () => {
    const source = readFileSync(new URL('../../../tavern/app-src/features/draw/draw-markdown-images.ts', import.meta.url), 'utf8');
    assert.match(source, /from '\.\.\/\.\.\/\.\.\/\.\.\/draw\/shared\/textarea-autofit\.js'/);
    assert.match(source, /textarea\.className = 'xb-tavern-image-edit-input';\s*\n\s*textarea\.setAttribute\('data-autofit', ''\)/);
    assert.match(source, /textarea\.rows = 1;/);
    assert.match(source, /installTextareaAutofit\(editPanel\)/);
    assert.match(source, /if \(open\) \{autofit\.refit\(\);\}/);
});
