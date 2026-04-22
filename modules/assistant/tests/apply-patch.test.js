import test from 'node:test';
import assert from 'node:assert/strict';

import { applyPatchUpdateToText, parseApplyPatch } from '../shared/apply-patch.js';

test('parseApplyPatch parses add, update, move and delete operations', () => {
    const patch = [
        '*** Begin Patch',
        '*** Add File: local/demo/new.txt',
        '+hello',
        '*** Update File: local/demo/app.js',
        '*** Move to: local/demo/main.js',
        '@@ function run()',
        ' console.log("before")',
        '-return 1;',
        '+return 2;',
        '*** Delete File: local/demo/old.txt',
        '*** End Patch',
    ].join('\n');

    const parsed = parseApplyPatch(patch);
    assert.equal(parsed.operations.length, 3);
    assert.equal(parsed.operations[0].type, 'add');
    assert.equal(parsed.operations[1].type, 'update');
    assert.equal(parsed.operations[1].moveTo, 'local/demo/main.js');
    assert.equal(parsed.operations[2].type, 'delete');
});

test('applyPatchUpdateToText applies multiple hunks in sequence', () => {
    const original = [
        'export function one() {',
        '  return 1;',
        '}',
        '',
        'export function two() {',
        '  return 2;',
        '}',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@ export function one()',
        ' export function one() {',
        '-  return 1;',
        '+  return 10;',
        ' }',
        '@@ export function two()',
        ' export function two() {',
        '-  return 2;',
        '+  return 20;',
        ' }',
        '*** End Patch',
    ].join('\n'));

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' });
    assert.equal(applied.hunksApplied, 2);
    assert.match(applied.content, /return 10;/);
    assert.match(applied.content, /return 20;/);
});

test('applyPatchUpdateToText fails on ambiguous matches', () => {
    const original = [
        'const value = 1;',
        'const value = 1;',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@',
        '-const value = 1;',
        '+const value = 2;',
        '*** End Patch',
    ].join('\n'));

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' }),
        /apply_patch_apply_error:.*matched multiple locations/,
    );
});
