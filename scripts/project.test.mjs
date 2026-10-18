import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { root, discoverPages } from './build/browser-entries.mjs';
import { generators } from './build/targets.mjs';
import { checkProject } from './check-project.mjs';
import { discoverTests, runTests } from './test.mjs';
import { checkTypes } from './typecheck.mjs';

function fixture(t) {
    fs.mkdirSync(path.join(root, 'output'), { recursive: true });
    const directory = fs.mkdtempSync(path.join(root, 'output/project-test-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const write = (relative, text) => {
        const file = path.join(directory, relative);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, text);
        return file;
    };
    write('.gitignore', 'output/\nnode_modules/\n');
    write('.eslintignore', '/dist/**\nlibs/**\n');
    write('package.json', '{"type":"module"}');
    return { directory, write };
}

test('a new nested module test is automatically run and its failure fails the whole test command', t => {
    const { directory, write } = fixture(t);
    const file = 'modules/brand-new/nested/feature.test.ts';
    const testFile = write(file, 'import test from "node:test"; test("new feature", () => {});');
    write('dist/generated.test.js', 'throw new Error();');
    assert.deepEqual(discoverTests(directory), [testFile]);
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const options = { stdio: 'pipe', encoding: 'utf8', env };
    assert.equal(runTests(directory, options).status, 0);
    write(file, 'import test from "node:test"; test("new feature", () => { throw new Error(); });');
    assert.notEqual(runTests(directory, options).status, 0);
});

test('new TS and Vue files receive the root strict type check without module registration', t => {
    const { directory, write } = fixture(t);
    const ts = 'modules/brand-new/model.ts', vue = 'modules/brand-new/View.vue';
    write(ts, 'export const value: string = "valid";');
    write(vue, '<script setup lang="ts">const value: number = 1;</script><template><div>{{ value }}</div></template>');
    const options = { stdio: 'pipe', encoding: 'utf8' };
    const good = checkTypes(directory, options);
    assert.equal(good.status, 0, good.stdout + good.stderr);
    write(ts, 'export const value: string = 1;');
    assert.notEqual(checkTypes(directory, options).status, 0);
    write(ts, 'export const value: string = "valid";');
    write(vue, '<script setup lang="ts">const value: number = "invalid";</script><template><div>{{ value }}</div></template>');
    const bad = checkTypes(directory, options);
    assert.notEqual(bad.status, 0);
});

test('independent module pipelines and unregistered page entries fail project validation', t => {
    const { directory, write } = fixture(t);
    write('main.js', 'export {};');
    const entries = { app: 'main.js' };
    checkProject(directory, entries);
    for (const [file, content] of [
        ['modules/new/vite.config.ts', 'export default {};'],
        ['modules/new/tsconfig.json', '{}'],
        ['modules/new/.eslintrc.cjs', 'module.exports = {};'],
        ['modules/new/package.json', '{"scripts":{"build":"vite build"}}'],
        ['modules/new/dist/app.css', 'body {}'],
    ]) {
        const created = write(file, content);
        assert.throws(() => checkProject(directory, entries));
        fs.unlinkSync(created);
    }
    write('modules/new/page.html', '<script type="module">import { loadBuildEntry } from "../../core/build-assets.js"; await loadBuildEntry("missing");</script>');
    assert.deepEqual(discoverPages(directory), ['modules/new/page.html']);
    assert.throws(() => checkProject(directory, entries));
    write('modules/new/page.html', '<script type="module" src="./raw.js"></script>');
    assert.throws(() => checkProject(directory, entries));
    write('modules/new/page.html', '<script type="module">import { loadBuildEntry } from "../../core/build-assets.js"; await loadBuildEntry("app");</script>');
    checkProject(directory, entries);
});

test('internal generators cannot write installed outputs outside total-build staging', () => {
    const env = { ...process.env };
    delete env.LWB_BUILD_STAGE;
    const files = ['dist/manifest.json', 'server-plugin/littlewhitebox-server/draw-runs/vendor/agent-core-node.cjs', 'modules/assistant/assistant-file-manifest.json'];
    const hashes = () => files.map(file => createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex'));
    const before = hashes();
    const probe = 'try { await import(process.argv[1]); } catch (error) { process.stdout.write(JSON.stringify({code:error.code})); process.exitCode=1; }';
    for (const script of [...generators, 'scripts/build-assistant-file-manifest.mjs', 'vite.plugin.config.mjs']) {
        const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', probe, pathToFileURL(path.join(root, script)).href], {
            cwd: root, env, encoding: 'utf8',
        });
        assert.equal(result.status, 1, result.stderr);
        assert.equal(JSON.parse(result.stdout).code, 'BUILD_STAGE_REQUIRED', script);
    }
    const outside = spawnSync(process.execPath, ['--input-type=module', '-e', probe, pathToFileURL(path.join(root, 'scripts/build/output-root.mjs')).href], {
        cwd: root, env: { ...env, LWB_BUILD_STAGE: root }, encoding: 'utf8',
    });
    assert.equal(outside.status, 1);
    assert.equal(JSON.parse(outside.stdout).code, 'BUILD_STAGE_OUTSIDE_OUTPUT');
    assert.deepEqual(hashes(), before);
});
