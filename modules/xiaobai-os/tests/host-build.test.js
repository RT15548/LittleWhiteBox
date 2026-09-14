import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = fileURLToPath(new URL('../../../', import.meta.url));

// Check actual build outputs: source tests can pass locally while published
// users cannot load the host because npm package internals were left external.
test('the published host bundles package dependencies and preserves host/shared imports', async () => {
    const outDir = path.join(root, 'modules/xiaobai-os/dist');
    const result = await build({
        root,
        configFile: path.join(root, 'vite.xiaobai-os.config.mjs'),
        mode: 'xiaobai-os-host',
        logLevel: 'silent',
        build: { write: false, outDir },
    });
    const chunks = [result].flat().flatMap(bundle => bundle.output).filter(item => item.type === 'chunk');
    assert.ok(chunks.some(chunk => chunk.isEntry), 'host entry was built');
    const imports = chunks.flatMap(chunk => [...chunk.imports, ...chunk.dynamicImports]);
    assert.deepEqual(imports.filter(id => id.replace(/\\/g, '/').split('/').includes('node_modules')), [],
        'a published host must not request unshipped npm files');
    const importedPaths = new Set(imports.map(id => path.resolve(outDir, id)));
    assert.ok(importedPaths.has(path.resolve(root, '../../../../script.js')),
        'SillyTavern runtime must remain external');
    assert.ok(importedPaths.has(path.join(root, 'core/iframe-messaging.js')),
        'plugin shared runtime must remain external');
});
