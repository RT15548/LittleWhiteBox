import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const pluginRoot = path.resolve(import.meta.dirname, '..', '..', '..');
const manifestPath = path.join(pluginRoot, 'modules/assistant/st-jsapi-manifest.json');

function readManifest() {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

test('assistant JS API manifest keeps critical allowed paths populated', () => {
    const manifest = readManifest();

    assert(Array.isArray(manifest.allowedPaths));
    assert(manifest.allowedPaths.length > 0);
    assert(manifest.allowedPaths.includes('ctx.chatMetadata'));
    assert(manifest.allowedPaths.includes('ctx.eventSource'));
    assert(manifest.allowedPaths.includes('ctx.eventTypes'));
    assert(manifest.allowedPaths.includes('st.extensions.getContext'));
    assert(manifest.allowedPaths.includes('st.slash.executeSlashCommandsWithOptions'));
    assert(manifest.allowedPaths.includes('st.script.getRequestHeaders'));
});

test('assistant JS API manifest keeps callable paths inside allowed paths', () => {
    const manifest = readManifest();
    const allowedPaths = new Set(manifest.allowedPaths || []);

    assert(Array.isArray(manifest.callablePaths));
    manifest.callablePaths.forEach((item) => {
        assert(allowedPaths.has(item), `callable path must also be allowed: ${item}`);
    });
});
