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

test('parseApplyPatch allows rename-only update operations', () => {
    const patch = [
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '*** Move to: local/demo/main.js',
        '*** End Patch',
    ].join('\n');

    const parsed = parseApplyPatch(patch);
    assert.equal(parsed.operations.length, 1);
    assert.equal(parsed.operations[0].type, 'update');
    assert.equal(parsed.operations[0].moveTo, 'local/demo/main.js');
    assert.deepEqual(parsed.operations[0].hunks, []);
});

test('parseApplyPatch preserves end-of-file markers on hunks', () => {
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@ tail marker',
        ' line one',
        '+line two',
        '*** End of File',
        '*** End Patch',
    ].join('\n'));

    assert.equal(patch.operations[0].hunks.length, 1);
    assert.equal(patch.operations[0].hunks[0].endOfFile, true);
    assert.equal(patch.operations[0].hunks[0].header, 'tail marker');
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
        '@@ export function one() {',
        ' export function one() {',
        '-  return 1;',
        '+  return 10;',
        ' }',
        '@@ export function two() {',
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

test('applyPatchUpdateToText uses header to locate a unique nearby block match', () => {
    const original = [
        'function alpha() {',
        '  const value = 1;',
        '}',
        '',
        'function beta() {',
        '  const value = 1;',
        '}',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@ function beta() {',
        '-  const value = 1;',
        '+  const value = 2;',
        '*** End Patch',
    ].join('\n'));

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' });
    assert.match(applied.content, /function alpha\(\) \{\n\s{2}const value = 1;/);
    assert.match(applied.content, /function beta\(\) \{\n\s{2}const value = 2;/);
});

test('applyPatchUpdateToText fails when header does not match the current file', () => {
    const original = [
        'function alpha() {',
        '  return 1;',
        '}',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@ function beta() {',
        '-  return 1;',
        '+  return 2;',
        '*** End Patch',
    ].join('\n'));

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' }),
        /apply_patch_apply_error:.*header did not match the current file.*matchMode=all.*failureStage=header_not_found.*headerMatchCount=0.*oldBlockMatchCount=0/,
    );
});

test('applyPatchUpdateToText allows repeated headers when the old block is unique under one header', () => {
    const original = [
        'function wrapper() {',
        '  const item = "a";',
        '}',
        'function wrapper() {',
        '  const item = "b";',
        '}',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@ function wrapper() {',
        '-  const item = "b";',
        '+  const item = "c";',
        '*** End Patch',
    ].join('\n'));

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' });
    assert.match(applied.content, /const item = "a";/);
    assert.match(applied.content, /const item = "c";/);
});

test('applyPatchUpdateToText fails when header matches multiple locations and block is still ambiguous', () => {
    const original = [
        'function wrapper() {',
        'const value = 1;',
        '}',
        'function wrapper() {',
        'const value = 1;',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@ function wrapper() {',
        '-const value = 1;',
        '+const value = 2;',
        '*** End Patch',
    ].join('\n'));

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' }),
        /apply_patch_apply_error:.*matched multiple locations under header.*matchMode=exact.*failureStage=header_ambiguous.*headerMatchCount=2.*oldBlockMatchCount=2/,
    );
});

test('applyPatchUpdateToText fails when header matches but old block does not match under that header', () => {
    const original = [
        'function target() {',
        '  return 1;',
        '}',
        '',
        'function target() {',
        '  return 2;',
        '}',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@ function target() {',
        '-  return 3;',
        '+  return 4;',
        '*** End Patch',
    ].join('\n'));

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' }),
        /apply_patch_apply_error:.*header matched but old block did not match under that header.*matchMode=trim.*failureStage=header_found_block_not_found.*headerMatchCount=2.*oldBlockMatchCount=0/,
    );
});

test('applyPatchUpdateToText keeps old strict behavior without header when match is unique', () => {
    const original = [
        'const one = 1;',
        'const two = 2;',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@',
        '-const two = 2;',
        '+const two = 20;',
        '*** End Patch',
    ].join('\n'));

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' });
    assert.match(applied.content, /const two = 20;/);
});

test('applyPatchUpdateToText keeps strict multiple-match failure without header', () => {
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
        /apply_patch_apply_error:.*old block matched multiple locations.*usesHeader=no.*matchMode=exact.*failureStage=block_ambiguous.*oldBlockMatchCount=2/,
    );
});

test('applyPatchUpdateToText keeps strict not-found failure without header', () => {
    const original = [
        'const one = 1;',
        'const two = 2;',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@',
        '-const three = 3;',
        '+const three = 30;',
        '*** End Patch',
    ].join('\n'));

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' }),
        /apply_patch_apply_error:.*old block did not match the current file.*usesHeader=no.*matchMode=all.*failureStage=block_not_found.*oldBlockMatchCount=0/,
    );
});

test('applyPatchUpdateToText matches trailing whitespace differences in trim_end mode', () => {
    const original = [
        'const alpha = 1;   ',
        'const beta = 2;',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@',
        '-const alpha = 1;',
        '+const alpha = 10;',
        '*** End Patch',
    ].join('\n'));

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' });
    assert.match(applied.content, /const alpha = 10;/);
    assert.doesNotMatch(applied.content, /const alpha = 1;\s*$/m);
});

test('applyPatchUpdateToText matches leading and trailing whitespace differences in trim mode', () => {
    const original = [
        '    const alpha = 1;   ',
        'const beta = 2;',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@',
        '-const alpha = 1;',
        '+const alpha = 10;',
        '*** End Patch',
    ].join('\n'));

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' });
    assert.match(applied.content, /const alpha = 10;/);
});

test('applyPatchUpdateToText matches limited unicode punctuation differences in unicode_trim mode', () => {
    const original = [
        'title:\u00A0“hello”…',
        'separator: a — b',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/doc.txt',
        '@@',
        '-title: "hello"...',
        '+title: "hello world"...',
        '*** End Patch',
    ].join('\n'));

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/doc.txt' });
    assert.match(applied.content, /title: "hello world"\.\.\./);
    assert.match(applied.content, /separator: a — b/);
});

test('applyPatchUpdateToText prefers exact matches before looser modes', () => {
    const original = [
        'const alpha = 1;',
        'const alpha = 1;   ',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@',
        '-const alpha = 1;',
        '+const alpha = 10;',
        '*** End Patch',
    ].join('\n'));

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' });
    assert.equal(applied.content, [
        'const alpha = 10;',
        'const alpha = 1;   ',
    ].join('\n'));
});

test('applyPatchUpdateToText uses the same tolerant mode for header and old block', () => {
    const original = [
        'function beta() {   ',
        '  const value = 1;   ',
        '}',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@ function beta() {',
        '-  const value = 1;',
        '+  const value = 2;',
        '*** End Patch',
    ].join('\n'));

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' });
    assert.equal(applied.content, [
        'function beta() {   ',
        '  const value = 2;',
        '}',
    ].join('\n'));
});

test('applyPatchUpdateToText keeps trying wider modes when header matched but block needs trim_end', () => {
    const original = [
        'function beta() {',
        '  const value = 1;   ',
        '}',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@ function beta() {',
        '-  const value = 1;',
        '+  const value = 2;',
        '*** End Patch',
    ].join('\n'));

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' });
    assert.equal(applied.content, [
        'function beta() {',
        '  const value = 2;',
        '}',
    ].join('\n'));
});

test('applyPatchUpdateToText does not use unicode_trim when only plain ascii lines are involved', () => {
    const original = [
        'const alpha = 1;',
        'const beta = 2;',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@',
        '-const gamma = 3;',
        '+const gamma = 30;',
        '*** End Patch',
    ].join('\n'));

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' }),
        /apply_patch_apply_error:.*old block did not match the current file.*matchMode=all.*failureStage=block_not_found/,
    );
});

test('applyPatchUpdateToText still rejects insert-only hunks', () => {
    const original = [
        'const one = 1;',
    ].join('\n');
    const patch = parseApplyPatch([
        '*** Begin Patch',
        '*** Update File: local/demo/app.js',
        '@@ const one = 1;',
        '+const two = 2;',
        '*** End Patch',
    ].join('\n'));

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo/app.js' }),
        /apply_patch_apply_error:.*has no match context/,
    );
});
