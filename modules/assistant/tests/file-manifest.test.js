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
