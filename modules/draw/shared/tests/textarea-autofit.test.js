import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import {
    AUTOFIT_MAX_LINES,
    autofitWithin,
    computeAutofitHeight,
    fitTextarea,
    installTextareaAutofit,
} from '../textarea-autofit.js';
import { renderCharacterFormSections, renderNamedTagEditorItem } from '../character-edit-form.js';

// Contracts (cost: one line of text sat at the top of a ~4-row box; a hidden textarea measured 0 and stayed that way after being shown):
// - Height follows the content: 1 line minimum, grows to AUTOFIT_MAX_LINES, then scrolls.
// - A textarea that cannot be measured (hidden / folded) is skipped without touching it, and gets measured once it is visible.
// - Typing, un-hiding a section / item / <details>, and width changes re-fit; an unchanged textarea is not re-measured (a manual resize survives).
// linkedom has no layout, so scrollHeight / clientWidth / computed style are stubbed.

const METRICS = { lineHeight: 18, paddingY: 16, borderY: 2 };
const computedStyle = () => ({
    fontSize: '12px', lineHeight: '18px', paddingTop: '8px', paddingBottom: '8px',
    borderTopWidth: '1px', borderBottomWidth: '1px', boxSizing: 'border-box',
});

function stubLayout(textarea, state) {
    Object.defineProperty(textarea, 'clientWidth', { get: () => state.clientWidth, configurable: true });
    Object.defineProperty(textarea, 'scrollHeight', {
        get() {
            state.measured += 1;
            return state.clientWidth ? state.lines * 18 + 16 : 0;
        },
        configurable: true,
    });
}

function makeDocument(html) {
    const { document, window } = parseHTML(`<html><body>${html}</body></html>`);
    const view = { getComputedStyle: computedStyle, requestAnimationFrame: callback => callback() };
    Object.defineProperty(document, 'defaultView', { value: view, configurable: true });
    return { document, window, view };
}

function makeTextarea(html = '<textarea data-autofit></textarea>') {
    const { document, window, view } = makeDocument(html);
    const textarea = document.querySelector('textarea');
    const state = { clientWidth: 300, lines: 1, measured: 0 };
    stubLayout(textarea, state);
    return { document, window, view, textarea, state };
}

test('height is one line for one line of content, grows with lines and caps at the maximum', () => {
    const at = lines => computeAutofitHeight({ scrollHeight: lines * 18 + 16, ...METRICS });
    assert.deepEqual(at(1), { height: 18 + 16 + 2, overflowing: false });
    assert.equal(at(3).height, 3 * 18 + 16 + 2);
    assert.equal(at(AUTOFIT_MAX_LINES).height, AUTOFIT_MAX_LINES * 18 + 16 + 2);
    assert.deepEqual(at(AUTOFIT_MAX_LINES + 5), { height: AUTOFIT_MAX_LINES * 18 + 16 + 2, overflowing: true });
    assert.equal(computeAutofitHeight({ scrollHeight: 16, ...METRICS }).height, 18 + 16 + 2, 'an empty box is still one line');
    assert.equal(computeAutofitHeight({ scrollHeight: 34, ...METRICS, boxSizing: 'content-box' }).height, 18, 'content-box heights exclude padding and border');
});

test('fitTextarea sizes to the content and switches the scrollbar on only past the cap', () => {
    const { textarea, state } = makeTextarea();
    textarea.value = 'one line';
    assert.equal(fitTextarea(textarea), true);
    assert.equal(textarea.style.height, '36px');
    assert.equal(textarea.style.overflowY, 'hidden');
    state.lines = 20;
    textarea.value = 'x'.repeat(500);
    fitTextarea(textarea);
    assert.equal(textarea.style.height, `${AUTOFIT_MAX_LINES * 18 + 18}px`);
    assert.equal(textarea.style.overflowY, 'auto');
});

test('a hidden textarea is left alone and fitted on first show', () => {
    const { textarea, state } = makeTextarea();
    state.clientWidth = 0;
    assert.equal(fitTextarea(textarea), false);
    assert.equal(textarea.style.height || '', '');
    state.clientWidth = 300;
    state.lines = 2;
    assert.equal(fitTextarea(textarea), true);
    assert.equal(textarea.style.height, `${2 * 18 + 18}px`);
});

test('an unchanged textarea is not measured again, so a manual resize survives; a width change or force re-measures', () => {
    const { textarea, state } = makeTextarea();
    textarea.value = 'abc';
    fitTextarea(textarea);
    const measured = state.measured;
    textarea.style.height = '200px';
    fitTextarea(textarea);
    assert.equal(state.measured, measured);
    assert.equal(textarea.style.height, '200px');
    state.clientWidth = 150;
    state.lines = 2;
    fitTextarea(textarea);
    assert.equal(textarea.style.height, '54px');
    state.lines = 3;
    fitTextarea(textarea, { force: true });
    assert.equal(textarea.style.height, '72px');
});

test('autofitWithin only touches textareas marked data-autofit', () => {
    const { document } = makeDocument('<div id="root"><textarea data-autofit></textarea><textarea id="plain"></textarea></div>');
    const root = document.querySelector('#root');
    for (const area of root.querySelectorAll('textarea')) stubLayout(area, { clientWidth: 300, lines: 1, measured: 0 });
    autofitWithin(root);
    assert.equal(root.querySelector('[data-autofit]').style.height, '36px');
    assert.equal(root.querySelector('#plain').style.height || '', '');
});

test('installTextareaAutofit re-fits on input, after a hidden section is shown (mutation callback) and on width change', () => {
    const { document, window, view } = makeDocument('<div id="root"><textarea data-autofit></textarea></div>');
    const root = document.querySelector('#root');
    const textarea = root.querySelector('textarea');
    const state = { clientWidth: 0, lines: 1, measured: 0 };
    stubLayout(textarea, state);
    const observers = [];
    class FakeObserver {
        constructor(callback) { this.callback = callback; observers.push(this); }
        observe() {}
        disconnect() {}
    }
    const handle = installTextareaAutofit(root, { view: { ...view, MutationObserver: FakeObserver, ResizeObserver: FakeObserver } });
    const [mutations, resizes] = observers;
    assert.equal(textarea.style.height || '', '', 'hidden at install time: nothing measured');
    state.clientWidth = 300;
    state.lines = 3;
    mutations.callback([]);
    assert.equal(textarea.style.height, `${3 * 18 + 18}px`, 'shown later: measured by the mutation callback');
    state.lines = 5;
    textarea.value = 'a\nb\nc\nd\ne';
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(textarea.style.height, `${5 * 18 + 18}px`, 'typing re-fits');
    state.clientWidth = 120;
    state.lines = 7;
    Object.defineProperty(root, 'clientWidth', { value: 120, configurable: true });
    resizes.callback([]);
    assert.equal(textarea.style.height, `${7 * 18 + 18}px`, 'width change re-fits');
    handle.dispose();
});

test('the character editor renders its textareas as one-row, auto-fitting boxes', () => {
    const item = renderNamedTagEditorItem({ name: '白裙', tags: 'white dress' }, 0, 'outfit', { total: 2 });
    assert.match(item, /<textarea class="input char-outfit-tags" rows="1" data-autofit /);
    const stateItem = renderNamedTagEditorItem({ name: '害羞', tags: 'blush' }, 0, 'dynstate', { total: 1 });
    assert.match(stateItem, /<textarea class="input char-dynstate-tags" rows="1" data-autofit /);
    const sections = renderCharacterFormSections({ appearance: 'a', negativeTags: 'n' }, { charId: 'c1' });
    assert.match(sections, /<textarea class="input char-edit-appearance" rows="1" data-autofit /);
    assert.match(sections, /<textarea class="input char-edit-neg" rows="1" data-autofit /);
});

test('NovelAI stylesheet: folded rows add no min-height / margin, and no fixed textarea heights remain (CSS text only, not visually measured here)', () => {
    const html = readFileSync(new URL('../../providers/novelai/novel-draw.html', import.meta.url), 'utf8');
    const style = html.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/\/\*[\s\S]*?\*\//g, '');
    const rules = [...style.matchAll(/([^{}@]+)\{([^{}]*)\}/g)].map(match => ({ selector: match[1].trim(), body: match[2] }));
    const folded = rules.filter(rule => /is-folded/.test(rule.selector));
    assert.ok(folded.length > 0);
    for (const rule of folded) {
        assert.doesNotMatch(rule.body, /(^|;|\s)margin(-top)?\s*:\s*[1-9]/, `${rule.selector} adds a margin`);
        const minHeight = rule.body.match(/min-height\s*:\s*(\d+)px/);
        if (minHeight) assert.ok(Number(minHeight[1]) <= 30, `${rule.selector} has min-height ${minHeight[1]}px`);
        for (const padding of rule.body.matchAll(/padding-(?:top|bottom)\s*:\s*(\d+)px/g)) assert.ok(Number(padding[1]) <= 6, `${rule.selector} pads ${padding[1]}px`);
    }
    assert.ok(!rules.some(rule => /char-outfit-tags|char-dynstate-tags/.test(rule.selector) && /min-height/.test(rule.body)), 'item tag textareas keep no fixed minimum height');
    assert.ok(!rules.some(rule => /char-edit-form textarea/.test(rule.selector) && /min-height/.test(rule.body)), 'editor textareas keep no fixed minimum height');
    const shell = readFileSync(new URL('../settings-shell.css', import.meta.url), 'utf8');
    assert.match(shell, /textarea\.input\[data-autofit\]\s*\{[^}]*min-height:\s*0/);
});
