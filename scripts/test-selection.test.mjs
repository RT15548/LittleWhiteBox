import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { discoverTests, gitChanges, sourceGraph, typescriptTests, selectTests } from './test-selection.mjs';

// Contracts: selection must retain affected consumers; loader choice must retain
// execution and failure status. Violations silently admit broken product changes.
// CI groups must cover every test exactly once per applicable environment (missed regressions).
const projectRoot = path.resolve(import.meta.dirname, '..');
function fixture(t) {
    fs.mkdirSync(path.join(projectRoot, 'output'), { recursive: true });
    const root = fs.mkdtempSync(path.join(projectRoot, 'output/test-selection-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const write = (name, content = '') => {
        const file = path.join(root, name);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
        return file;
    };
    write('.gitignore', 'output/\nnode_modules/\n');
    write('.sourceignore', '/dist/**\n');
    write('package.json', '{"type":"module"}');
    return { root, write };
}

test('full retains all discoveries; scopes include new modules and reject empty selections', t => {
    const { root, write } = fixture(t);
    const a = write('modules/new/nested/a.test.ts');
    const b = write('modules/other/b.test.js');
    const host = write('modules/other/serializer.host.test.mjs');
    write('dist/generated.test.js');
    write('output/private.test.js');
    const tests = discoverTests(root);
    assert.deepEqual(tests, [a, b, host]);
    assert.deepEqual(selectTests(root, tests, []).files, tests);
    assert.deepEqual(selectTests(root, tests, ['full']).files, tests);
    assert.deepEqual(selectTests(root, tests, ['new/nested', b]).files, [a, b]);
    const standalone = selectTests(root, tests, ['standalone']).files;
    const hosted = selectTests(root, tests, ['host']).files;
    assert.deepEqual(standalone, [a, b]);
    assert.deepEqual(hosted, [host]);
    assert.deepEqual([...standalone, ...hosted].sort(), tests);
    assert.throws(() => selectTests(root, standalone, ['host']));
    assert.throws(() => selectTests(root, hosted, ['standalone']));
    for (const scopes of [['ne'], ['new', 'missing'], ['changed', 'new'], ['standalone', 'host'], ['host', 'new']]) assert.throws(() => selectTests(root, tests, scopes));
});

test('changed includes owners, transitive consumers and generated-bundle integration tests', t => {
    const { root, write } = fixture(t);
    write('modules/model/value.ts', 'export const value = 1;');
    write('modules/consumer/use.js', 'export { value } from "../model/deleted.js";');
    write('modules/indirect/use.js', 'export { value } from "../consumer/use.js";');
    const a = write('modules/model/a.test.ts');
    const b = write('modules/consumer/b.test.js');
    const c = write('modules/indirect/c.test.js');
    const integration = write('server-plugin/backend/bundle.test.js');
    write('modules/unrelated/d.test.js');
    const tests = discoverTests(root);
    const selected = selectTests(root, tests, ['changed'], { changes: ['modules/model/deleted.ts'], graph: sourceGraph(root) });
    assert.deepEqual(new Set(selected.files), new Set([a, b, c, integration]));
    for (const file of ['core/shared.js', 'dist/new.js', 'package.json', 'modules/agent-core/runtime.js']) {
        assert.deepEqual(selectTests(root, tests, ['changed'], { changes: [file] }).files, tests);
    }
    assert.deepEqual(selectTests(root, tests, ['changed'], { changes: [] }).files, []);
    write('core/bridge.js', 'export { value } from "../modules/model/value.js";');
    assert.deepEqual(selectTests(root, tests, ['changed'], { changes: ['modules/model/value.ts'], graph: sourceGraph(root) }).files, tests);
});

test('Git selection includes staged, unstaged, untracked and both sides of moves', t => {
    const { root, write } = fixture(t);
    const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    git(['init', '-q']);
    write('modules/a/base.js');
    write('modules/b/deleted.js');
    git(['add', '.']);
    git(['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'fixture']);
    write('modules/a/base.js', 'changed');
    write('modules/c/staged.js');
    git(['add', 'modules/c/staged.js']);
    write('modules/d/untracked.js');
    fs.renameSync(path.join(root, 'modules/b/deleted.js'), path.join(root, 'modules/b/moved.js'));
    write('output/private.js');
    assert.deepEqual(new Set(gitChanges(root)), new Set([
        'modules/a/base.js', 'modules/b/deleted.js', 'modules/b/moved.js', 'modules/c/staged.js', 'modules/d/untracked.js',
    ]));
});

test('typed classification follows js-to-ts imports through cycles without classifying plain JS', t => {
    const { root, write } = fixture(t);
    const plain = write('modules/a/plain.test.js', 'import "./plain.js";');
    write('modules/a/plain.js', 'export const a = 1;');
    const direct = write('modules/a/direct.test.ts');
    const indirect = write('modules/a/indirect.test.js', 'import "./cycle.js";');
    write('modules/a/cycle.js', 'import "./back.js";');
    write('modules/a/back.js', 'import "./cycle.js"; import "./typed.js";');
    write('modules/a/typed.ts', 'export enum Value { One = 1 }');
    const tests = discoverTests(root);
    assert.ok(tests.includes(plain));
    assert.deepEqual(new Set(typescriptTests(tests, sourceGraph(root))), new Set([direct, indirect]));
});

test('selective preload runs plain and indirect typed tests and preserves failing exit status', t => {
    const { write } = fixture(t);
    const plain = write('plain.test.js', 'import test from "node:test"; test("plain", () => {});');
    const typed = write('typed.test.js', 'import test from "node:test"; import assert from "node:assert/strict"; import { Value } from "./value.js"; test("typed", () => assert.equal(Value.One, 1));');
    write('value.ts', 'export enum Value { One = 1 }');
    const failed = write('failed.test.js', 'import test from "node:test"; test("failed", () => { throw new Error("fixture failure"); });');
    const reporter = write('reporter.mjs', 'export default async function* (source) { for await (const e of source) if (e.type === "test:summary" && !e.data.file) yield JSON.stringify(e.data); }');
    const env = { ...process.env, LWB_TEST_TYPESCRIPT: JSON.stringify([typed]) };
    delete env.NODE_TEST_CONTEXT;
    const run = files => spawnSync(process.execPath, [
        '--import', pathToFileURL(path.join(projectRoot, 'scripts/test-preload.mjs')).href, '--test', '--test-concurrency=2', `--test-reporter=${pathToFileURL(reporter).href}`, ...files,
    ], { cwd: projectRoot, encoding: 'utf8', env });
    const success = run([plain, typed]);
    assert.equal(success.status, 0, success.stderr);
    assert.equal(JSON.parse(success.stdout).counts.passed, 2);
    const failure = run([plain, typed, failed]);
    assert.equal(failure.status, 1, failure.stderr);
    assert.equal(JSON.parse(failure.stdout).counts.passed, 2);
    assert.equal(JSON.parse(failure.stdout).counts.failed, 1);
});
