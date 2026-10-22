import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { inspect } from 'node:util';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createTestModuleUrl } from './helpers/bundle-module.js';

// Contract: large bundles retain useful error locations without dumping source,
// and leave no temporary files (cost: unreadable failures and test disk leaks).
test('bundle diagnostics stay bounded and temporary modules are removed', async t => {
    let moduleUrl;
    await t.test('load a large module and retain its error', async () => {
        moduleUrl = await createTestModuleUrl(`/*${'x'.repeat(1_000_000)}*/\nexport const url = import.meta.url;\nexport function fail() { throw new Error('fixture failure'); }`);
        // eslint-disable-next-line no-unsanitized/method -- Locally generated test module.
        const mod = await import(moduleUrl);
        assert.equal(mod.url, moduleUrl);
        assert.throws(mod.fail, error => {
            assert.equal(error.message, 'fixture failure');
            assert.match(error.stack, /bundle\.mjs:3:/);
            const diagnostic = inspect({ source: mod.url, error });
            assert.ok(diagnostic.length < 4000);
            assert.ok(!diagnostic.includes('data:text/javascript'));
            return true;
        });
    });
    await assert.rejects(access(fileURLToPath(moduleUrl)), { code: 'ENOENT' });
});
