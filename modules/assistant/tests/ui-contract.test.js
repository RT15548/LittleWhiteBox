import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '../../..');

function readRepoFile(path) {
    return readFileSync(resolve(root, path), 'utf8');
}

test('assistant compose starts as a single-line input', () => {
    const shellSource = readRepoFile('modules/assistant/app-src/ui/app-shell.js');
    const stylesSource = readRepoFile('modules/assistant/app-src/styles.js');

    assert.match(shellSource, /<textarea id="xb-assistant-input" rows="1" placeholder=""><\/textarea>/);
    assert.match(stylesSource, /\.xb-assistant-compose textarea \{[\s\S]*min-height: 42px;[\s\S]*resize: vertical;/);
    assert.match(stylesSource, /@media \(max-width: 900px\) \{[\s\S]*\.xb-assistant-compose textarea \{[\s\S]*min-height: 42px;[\s\S]*resize: none;/);
    assert.doesNotMatch(stylesSource, /min-height: 6[06]px;/);
});

test('assistant markdown headings stay inside message typography', () => {
    const stylesSource = readRepoFile('modules/assistant/app-src/styles.js');

    assert.match(stylesSource, /\.xb-assistant-markdown h1,[\s\S]*?\.xb-assistant-markdown h6 \{[\s\S]*?font: inherit;[\s\S]*?font-weight: 700;[\s\S]*?line-height: inherit;/);
});

test('assistant approval panel stays reachable as a scrollable modal', () => {
    const chatUiSource = readRepoFile('modules/assistant/app-src/ui/chat-ui.js');
    const stylesSource = readRepoFile('modules/assistant/app-src/styles.js');

    assert.match(chatUiSource, /panel\.setAttribute\('role', 'alertdialog'\);/);
    assert.match(chatUiSource, /panel\.setAttribute\('aria-modal', 'true'\);/);
    assert.match(stylesSource, /\.xb-assistant-approval-slot \{[\s\S]*position: fixed;[\s\S]*inset: 0;[\s\S]*z-index: 80;[\s\S]*backdrop-filter: blur\(8px\);/);
    assert.match(stylesSource, /\.xb-assistant-approval \{[\s\S]*grid-template-rows: auto minmax\(0, 1fr\) auto auto;[\s\S]*max-height: min\(760px, calc\(100dvh - 36px\)\);[\s\S]*overflow: hidden;/);
    assert.match(stylesSource, /\.xb-assistant-approval-command \{[\s\S]*overflow: auto;[\s\S]*overscroll-behavior: contain;[\s\S]*-webkit-overflow-scrolling: touch;/);
    assert.match(stylesSource, /@media \(max-width: 900px\) \{[\s\S]*\.xb-assistant-approval \{[\s\S]*max-height: calc\(100dvh - 20px\);[\s\S]*\.xb-assistant-approval-actions \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
});
