import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Keep the original header flow: mode, theme and close share the main row.
// Do not turn the phone header into a two-row grid to accommodate the theme button.
test('mobile settings keeps the original header instead of moving mode controls to a second grid row', () => {
    const css = readFileSync(new URL('../settings-shell.css', import.meta.url), 'utf8');
    const mobile = css.slice(css.indexOf('@media (max-width: 768px)'));
    assert.match(css, /\.app-header\s*\{\s*display: flex;/);
    assert.match(mobile, /\.app-header\s*\{ padding: 10px 12px; gap: 8px; \}/);
    assert.doesNotMatch(mobile, /\.app-header\s*\{[^}]*display: grid/);
    assert.doesNotMatch(mobile, /\.(?:header-mode|header-close|draw-theme-toggle)\s*\{[^}]*grid-row:/);
});
