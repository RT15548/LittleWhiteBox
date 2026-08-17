import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ignore from 'ignore';
import test from 'node:test';

const manifestUrl = new URL('../assistant-file-manifest.json', import.meta.url);
const pluginRoot = fileURLToPath(new URL('../../../', import.meta.url));
const stRoot = path.resolve(pluginRoot, '../../../../..');

function readIgnoreMatcher(root) {
    return ignore().add(readFileSync(path.join(root, '.gitignore'), 'utf8'));
}

test('assistant manifest excludes developer-local files', () => {
    const manifest = JSON.parse(readFileSync(manifestUrl, 'utf8'));
    const pluginPaths = (manifest.files || [])
        .filter(item => item?.source === 'littlewhitebox')
        .map(item => String(item?.relativePath || '').replace(/\\/g, '/'));
    const publicPaths = (manifest.files || [])
        .filter(item => item?.source === 'sillytavern-public')
        .map(item => `public/${String(item?.relativePath || '').replace(/\\/g, '/')}`);
    const pluginMatcher = readIgnoreMatcher(pluginRoot);
    const publicMatcher = readIgnoreMatcher(stRoot);
    const pluginOverlap = pluginPaths.filter(value => pluginMatcher.ignores(value));
    const publicOverlap = publicPaths.filter(value => publicMatcher.ignores(value));

    assert.deepEqual(pluginOverlap, []);
    assert.deepEqual(publicOverlap, []);
});

test('assistant manifest excludes generated dists and includes draw scene planner sources', () => {
    const manifest = JSON.parse(readFileSync(manifestUrl, 'utf8'));
    const pluginPaths = (manifest.files || [])
        .filter(item => item?.source === 'littlewhitebox')
        .map(item => String(item?.relativePath || '').replace(/\\/g, '/'));

    assert.deepEqual(pluginPaths.filter(value => value.startsWith('modules/assistant/dist/')), []);
    assert.deepEqual(pluginPaths.filter(value => value.startsWith('modules/agent-core/dist/')), []);

    for (const expected of [
        'modules/draw/shared/scene-planner.js',
        'modules/draw/shared/scene-plan-contract.js',
        'modules/draw/shared/scene-prompt-expansion.js',
        'modules/draw/shared/scene-planner-error-ui.js',
        'modules/draw/shared/draw-agent.js',
        'modules/agent-core/browser-entry.js',
        'modules/agent-core/provider-resolution.js',
    ]) {
        assert.ok(pluginPaths.includes(expected), `${expected} 必须在 manifest 中`);
    }
});
