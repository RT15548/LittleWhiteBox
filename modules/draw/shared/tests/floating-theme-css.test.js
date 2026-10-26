import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');
const theme = read('../draw-theme.css');

test('drawing theme does not change host native controls or leave host text shadows on popup text', () => {
    for (const [, selector, body] of theme.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (selector.trim().startsWith(':root')) assert.doesNotMatch(body, /(?:^|[;\s])color-scheme:/);
    }
    assert.match(theme, /\.nd-float, \.nd-float \*, \.nd-float input::placeholder\s*\{\s*text-shadow: none;/);
    assert.match(theme, /:where\([^}]*\.nd-float[^}]*\)\s*\{ color-scheme: var\(--draw-color-scheme\)/);
    assert.match(theme, /\.nd-float\s*\{[^}]*--nd-bg-solid: var\(--draw-bg-secondary\)/);
    assert.match(read('../max-images-input.js'), /color-scheme: var\(--draw-color-scheme\)/);
});

for (const provider of ['novelai', 'sd-webui', 'comfyui']) {
    test(`${provider}: menus use solid themed surfaces, no text scaling or permanent compositor hints, and mount both theme buttons`, () => {
        const source = read(`../../providers/${provider}/floating-panel.js`);
        const css = source.split('const STYLES = `')[1].split('\n`;')[0];
        assert.doesNotMatch(css, /backdrop-filter|will-change/);
        const menus = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
            .filter(([, selector]) => /\.(nd-menu|nd-detail)\s*$/.test(selector.trim()));
        assert.ok(menus.length >= 6);
        for (const [, , body] of menus) {
            assert.doesNotMatch(body, /scale\(|translateY\(/);
            if (body.includes('background:')) assert.match(body, /background: var\(--nd-bg-solid\)/);
        }
        assert.doesNotMatch(css, /--nd-text-primary:/, 'palette comes from the shared stylesheet');
        assert.doesNotMatch(css, /color:\s*#fff\b/);
        assert.match(css, /\.nd-layer-active\s*\{[^}]*color: var\(--nd-text-primary\)/);
        assert.match(source, /ensureDrawVisuals\(\)/);
        assert.equal((source.match(/mountThemeSwitch\(\{/g) || []).length, 2);
        assert.equal((source.match(/themeSwitch\?\.destroy\(\)/g) || []).length, 2);
    });
}
