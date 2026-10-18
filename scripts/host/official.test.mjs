import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { blobHash, inspectHost, assertOfficialHost } from './official.mjs';

test('official verification detects modified, missing and injected code without touching user files', t => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lwb-host-'));
    t.after(() => fs.rmSync(directory, { recursive: true }));
    const files = { '.gitignore': '/data/\n/public/scripts/extensions/third-party/\n', 'public/script.js': 'export const ready = true;\n', 'src/server.js': 'start();\n' };
    const reference = { version: 'fixture', commit: 'fixture', ignoreRules: files['.gitignore'],
        entries: Object.entries(files).map(([file, value]) => ({ path: file, hash: blobHash(Buffer.from(value)) })) };
    function write(file, value) {
        fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
        fs.writeFileSync(path.join(directory, file), value);
    }
    for (const [file, content] of Object.entries(files)) write(file, content);
    write('data/settings.json', 'private settings');
    write('public/scripts/extensions/third-party/Other/plugin.js', 'other extension');
    assert.deepEqual(inspectHost(directory, reference), []);
    write('public/script.js', files['public/script.js'].replace(/\n/g, '\r\n'));
    assert.deepEqual(inspectHost(directory, reference), []);
    write('public/script.js', 'patched');
    fs.unlinkSync(path.join(directory, 'src/server.js'));
    write('public/injected.js', 'injected');
    write('.gitignore', '/public/\n');
    assert.deepEqual(inspectHost(directory, reference), [
        { path: '.gitignore', kind: 'modified' }, { path: 'public/script.js', kind: 'modified' },
        { path: 'src/server.js', kind: 'missing' }, { path: 'public/injected.js', kind: 'extra' },
    ]);
    assert.throws(() => assertOfficialHost(directory, reference), { code: 'HOST_NOT_OFFICIAL' });
    assert.equal(fs.readFileSync(path.join(directory, 'data/settings.json'), 'utf8'), 'private settings');
    assert.equal(fs.readFileSync(path.join(directory, 'public/script.js'), 'utf8'), 'patched');
});
