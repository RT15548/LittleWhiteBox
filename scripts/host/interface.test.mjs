import test from 'node:test';
import assert from 'node:assert/strict';
import { createHostInterface } from './interface.mjs';

test('host compatibility checks the selected official module interface, not the local patched exports', () => {
    const sources = { 'public/script.js': 'export const settings = {}; export function save() {}',
        'public/bridge.js': 'export * from "./script.js"; export default 1;' };
    const host = createHostInterface({ version: 'fixture', entries: Object.keys(sources).map(file => ({ path: file })) }, file => sources[file]);
    assert.equal(host.hasFile('public/extra.js'), false);
    host.assertImports('public/bridge.js', [{ type: 'ImportDefaultSpecifier' }, { type: 'ImportSpecifier', imported: { name: 'save' } }]);
    assert.throws(() => host.assertImports('public/script.js', [{ type: 'ImportSpecifier', imported: { name: 'patchedSave' } }]), { code: 'HOST_EXPORT_MISSING' });
});
