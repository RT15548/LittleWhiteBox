import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Acceptance contracts (cost: choosing 浅色 / 深色 in the theme menu but half the page still following the system theme):
// - Every light-theme override in the draw pages' sources is written as a pair: the system one (`@media (prefers-color-scheme: light)` + `:root:not([data-draw-theme="dark"])`)
//   and the forced one (`:root[data-draw-theme="light"]`) with the same declarations. Forced dark needs nothing extra: the dark defaults apply whenever the media block is excluded.
// - settings-shell.css sets color-scheme for each branch; no draw page source still has a bare (un-gated) light media block.

const drawRoot = fileURLToPath(new URL('../../', import.meta.url));
const SYSTEM_PREFIX = ':root:not([data-draw-theme="dark"])';
const FORCED_PREFIX = ':root[data-draw-theme="light"]';

function sources(directory = drawRoot) {
    const found = [];
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== 'tests' && entry.name !== 'node_modules') found.push(...sources(full));
        } else if (/\.(css|html)$/.test(entry.name)) {
            found.push(full);
        }
    }
    return found;
}

const strip = css => css.replace(/\/\*[\s\S]*?\*\//g, '');
const squash = text => text.replace(/\s+/g, ' ').trim();

function lightMediaBlocks(css) {
    const blocks = [];
    const marker = '@media (prefers-color-scheme: light)';
    for (let from = css.indexOf(marker); from >= 0; from = css.indexOf(marker, from + marker.length)) {
        const open = css.indexOf('{', from);
        let depth = 0;
        let end = open;
        for (; end < css.length; end += 1) {
            if (css[end] === '{') depth += 1;
            else if (css[end] === '}' && --depth === 0) break;
        }
        blocks.push(css.slice(open + 1, end));
    }
    return blocks;
}

function rulesOf(css) {
    return Array.from(strip(css).matchAll(/([^{}]+)\{([^{}]*)\}/g), ([, selector, body]) => ({ selector: squash(selector), body: squash(body) }));
}

const files = sources().filter(file => readFileSync(file, 'utf8').includes('prefers-color-scheme'));

test('the draw sources that follow the system theme are the ones this test knows about', () => {
    const names = files.map(file => path.basename(file)).sort();
    assert.deepEqual(names, ['character-library-ui.css', 'draw-theme.css', 'novel-draw.html', 'prompt-layout-editor.css']);
});

for (const file of files) {
    test(`${path.basename(file)}: every light override has a gated system version and an identical forced-light version`, () => {
        const css = readFileSync(file, 'utf8');
        const all = rulesOf(css);
        const blocks = lightMediaBlocks(strip(css));
        assert.ok(blocks.length > 0);
        let checked = 0;
        for (const block of blocks) {
            for (const { selector, body } of rulesOf(block)) {
                assert.ok(selector.startsWith(SYSTEM_PREFIX), `media rule must be gated by the system prefix: ${selector}`);
                const forcedSelector = squash(`${FORCED_PREFIX} ${selector.slice(SYSTEM_PREFIX.length)}`);
                const forced = all.filter(rule => rule.selector === forcedSelector);
                assert.ok(forced.length > 0, `a forced-light rule exists for ${selector}`);
                assert.ok(forced.some(rule => rule.body === body), `a forced-light rule has the same declarations as the system one for ${selector}`);
                checked += 1;
            }
        }
        assert.ok(checked > 0);
    });
}

test('draw-theme.css: dark defaults, system light, forced light all set color-scheme and define the same active token names', () => {
    const css = readFileSync(new URL('../draw-theme.css', import.meta.url), 'utf8');
    const rules = rulesOf(css);
    const dark = rules.find(rule => rule.selector === ':root');
    const system = rules.find(rule => rule.selector === SYSTEM_PREFIX);
    const forced = rules.find(rule => rule.selector === FORCED_PREFIX);
    assert.ok(dark && system && forced);
    assert.match(dark.body, /color-scheme: dark;/);
    assert.match(system.body, /color-scheme: light;/);
    assert.match(forced.body, /color-scheme: light;/);
    const names = body => Array.from(body.matchAll(/(--[a-z-]+):/g), match => match[1]).filter(name => !name.startsWith('--draw-light-')).sort();
    assert.ok(names(dark.body).length >= 14);
    assert.deepEqual(names(system.body), names(dark.body), 'every token has a light value');
    assert.deepEqual(names(forced.body), names(dark.body));
    assert.equal(forced.body, system.body);
    // 强制深色不需要额外一块：只要没有 data-draw-theme="dark" 以外的覆盖，缺省的深色就是强制深色的值。
    assert.ok(css.includes(`${SYSTEM_PREFIX} {`), 'the system light block is excluded when the dark choice is set');
    assert.equal(css.includes(':root[data-draw-theme="dark"] {'), false, 'no duplicated dark block to drift out of sync');
});
