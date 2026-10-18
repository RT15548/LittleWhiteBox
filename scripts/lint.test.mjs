import test from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';

const eslint = new ESLint();
const unsafe = 'const view = {}; view.innerHTML = JSON.parse(\'"input"\');';
const safe = 'const view = {}; view.textContent = JSON.parse(\'"input"\');';

for (const [file, wrap] of [
    ['core/lint-fixture.js', text => text],
    ['scripts/lint-fixture.mjs', text => text],
    ['lint-fixture.cjs', text => text],
    ['modules/new-feature/lint-fixture.ts', text => text],
    ['modules/new-feature/lint-fixture.vue', text => `<script setup lang="ts">${text}</script><template><div /></template>`],
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
}
