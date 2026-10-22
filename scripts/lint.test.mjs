import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ESLint } from 'eslint';

// Type-aware lint needs saved files in the root project, just like newly authored source.
const fixtureDirectory = fs.mkdtempSync(path.join(import.meta.dirname, 'lint-fixture-'));
after(() => fs.rmSync(fixtureDirectory, { recursive: true }));
const typedFixture = path.join(fixtureDirectory, 'fixture.ts');
const vueFixture = path.join(fixtureDirectory, 'fixture.vue');
const jsFixture = path.join(fixtureDirectory, 'fixture.js');
const mjsFixture = path.join(fixtureDirectory, 'fixture.mjs');
const cjsFixture = path.join(fixtureDirectory, 'fixture.cjs');
fs.writeFileSync(typedFixture, 'export {};');
fs.writeFileSync(vueFixture, '<script setup lang="ts"></script><template><div /></template>');
for (const file of [jsFixture, mjsFixture, cjsFixture]) fs.writeFileSync(file, '');

const eslint = new ESLint();
const unsafe = 'const view = {}; view.innerHTML = JSON.parse(\'"input"\');';
const safe = 'const view = {}; view.textContent = JSON.parse(\'"input"\');';

for (const [file, wrap] of [
    [jsFixture, text => text],
    [mjsFixture, text => text],
    [cjsFixture, text => text],
    [typedFixture, text => text],
    [vueFixture, text => `<script setup lang="ts">${text}</script><template><div /></template>`],
    ['lint-fixture.html', text => `<script>${text}</script>`],
]) {
    test(`the root lint catches unsafe HTML and accepts text rendering in ${file}`, async () => {
        assert.equal(await eslint.isPathIgnored(file), false);
        const [rejected] = await eslint.lintText(wrap(unsafe), { filePath: file });
        assert.equal(rejected.errorCount, 0);
        assert.equal(rejected.warningCount, 1);
        assert.equal(rejected.messages[0].ruleId, 'no-unsanitized/property');
        const [accepted] = await eslint.lintText(wrap(safe), { filePath: file });
        assert.deepEqual(accepted.messages, []);
    });
    // Contract: an unsupported UUID API must fail lint in every source format,
    // including new modules outside Phone OS (cost: broken pages on LAN HTTP).
    test(`the root lint rejects randomUUID in ${file}`, async () => {
        for (const source of [
            'crypto.randomUUID();',
            'window.crypto.randomUUID();',
            'globalThis.crypto?.randomUUID?.();',
            'crypto["randomUUID"]();',
            'const { randomUUID: makeId } = crypto; makeId();',
        ]) {
            const [result] = await eslint.lintText(wrap(source), { filePath: file });
            assert.ok(result.messages.some(message => message.ruleId === 'no-restricted-properties' && message.severity === 2), source);
            assert.ok(result.errorCount > 0);
        }
        const [accepted] = await eslint.lintText(wrap('crypto.getRandomValues(new Uint8Array(16));'), { filePath: file });
        assert.deepEqual(accepted.messages, []);
    });
}

test('typed scripts and Vue reject Promise callbacks passed to void-only APIs', async () => {
    for (const [filePath, wrap] of [
        [typedFixture, text => text],
        [vueFixture, text => `<script setup lang="ts">${text}</script><template><div /></template>`],
    ]) {
        const [rejected] = await eslint.lintText(wrap('declare function subscribe(handler: () => void): void; subscribe(async () => { await Promise.resolve(); });'), { filePath });
        assert.ok(rejected.messages.some(message => message.ruleId === '@typescript-eslint/no-misused-promises'));
        const [accepted] = await eslint.lintText(wrap('declare function run(handler: () => Promise<void>): void; run(async () => { await Promise.resolve(); });'), { filePath });
        assert.deepEqual(accepted.messages, []);
    }
});

test('lint exemptions must be local, rule-specific, justified and still necessary', async () => {
    for (const [source, rule] of [
        ['/* eslint-disable no-eval -- trusted fixture */\neval("0");', '@eslint-community/eslint-comments/no-use'],
        ['// eslint-disable-next-line -- trusted fixture\neval("0");', '@eslint-community/eslint-comments/no-unlimited-disable'],
        ['// eslint-disable-next-line no-eval\neval("0");', '@eslint-community/eslint-comments/require-description'],
        ['// eslint-disable-next-line no-eval -- trusted fixture\nconsole.log(0);', null],
        ['// @ts-nocheck\nconsole.log(0);', '@typescript-eslint/ban-ts-comment'],
        ['// @ts-ignore: bypass\nconsole.log(0);', '@typescript-eslint/ban-ts-comment'],
    ]) {
        const [result] = await eslint.lintText(source, { filePath: jsFixture });
        assert.ok(result.messages.some(message => message.ruleId === rule), String(rule));
    }
    const [accepted] = await eslint.lintText('// eslint-disable-next-line no-eval -- Executes only the fixed test expression.\neval("0");', { filePath: jsFixture });
    assert.deepEqual(accepted.messages, []);
});
