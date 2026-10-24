import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Acceptance contracts (cost: the grey layering leaking onto other pages, or the type badges going back to a thin weight):
// - Every type badge (summary bar, library rows, per-form header) shares one .char-type-badge rule, and it is bold.
// - The 角色标签 grey hierarchy is scoped: every selector in the NovelAI block starts with #nd_char_list, every selector in the SD / ComfyUI block with .lwb-cl-group.
// - Tones come from the page variables, with a light-theme override block; no hard-coded colour except the shadows.

const novel = readFileSync(new URL('../../providers/novelai/novel-draw.html', import.meta.url), 'utf8');
const library = readFileSync(new URL('../character-library-ui.css', import.meta.url), 'utf8');

function blockAfter(text, marker) {
    const start = text.indexOf(marker);
    assert.ok(start >= 0, `marker not found: ${marker}`);
    return text.slice(start);
}

function selectorsOf(css) {
    const selectors = [];
    for (const match of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(^|\})\s*([^{}@]+)\{/g)) {
        for (const part of match[2].split(',')) if (part.trim()) selectors.push(part.trim());
    }
    return selectors;
}

test('the type badge is bold and is the only badge rule (summary bar, library rows and form headers share it)', () => {
    const rule = novel.match(/\.char-type-badge\s*\{([^}]*)\}/);
    assert.ok(rule);
    assert.match(rule[1], /font-weight:\s*(600|700)/);
    assert.match(rule[1], /font-size:\s*10px/, 'still smaller than the 13px name');
    assert.equal((novel.match(/\n\.char-type-badge\s*\{/g) || []).length, 1);
    assert.match(novel, /\.char-form-type\s*\{[^}]*flex-shrink: 0/, 'the form header badge only adds sizing on top of the shared look');
    assert.doesNotMatch(novel.match(/\.char-form-type\s*\{([^}]*)\}/)[1], /font-weight/);
});

test('NovelAI: the grey hierarchy only touches #nd_char_list', () => {
    const start = novel.indexOf('/* ── 角色标签页的明暗层次（只作用于 #nd_char_list');
    const own = novel.slice(start, novel.indexOf('/* ── 角色标签页层次结束 ── */'));
    assert.ok(start > 0 && own.length > 500);
    const selectors = selectorsOf(own).filter(selector => !/^(color-scheme|--)/.test(selector));
    assert.ok(selectors.length > 10);
    for (const selector of selectors) {
        assert.match(selector, /^#nd_char_list\b/, `unscoped selector: ${selector}`);
    }
    assert.match(own, /@media \(prefers-color-scheme: light\)\s*\{\s*#nd_char_list\s*\{/);
    for (const token of ['--ct-group', '--ct-group-head', '--ct-card', '--ct-edit-bar', '--ct-edit-body', '--ct-form', '--ct-item', '--ct-band']) {
        assert.equal((own.match(new RegExp(`${token}:`, 'g')) || []).length, 2, `${token} has a dark and a light value`);
    }
    assert.doesNotMatch(own.replace(/--ct-shadow:[^;]+;/g, ''), /#[0-9a-fA-F]{3,8}\b|rgb\(/, 'no hard-coded colours outside the shadows');
});

test('SD / ComfyUI: the same hierarchy is scoped to the library groups', () => {
    const block = blockAfter(library, '/* ── 角色标签页的明暗层次（SD WebUI / ComfyUI');
    const selectors = selectorsOf(block.slice(block.indexOf('.lwb-cl-group {')));
    for (const selector of selectors) {
        assert.match(selector, /^\.lwb-cl-group\b/, `unscoped selector: ${selector}`);
    }
    assert.match(block, /@media \(prefers-color-scheme: light\)/);
    assert.match(block, /\.lwb-cl-group-body > \.sd-char-card\[open\]/);
});
