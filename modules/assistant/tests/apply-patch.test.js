import test from 'node:test';
import assert from 'node:assert/strict';

import { applyPatchUpdateToText, parseApplyPatch } from '../../agent-core/tools/apply-patch.js';

const path = 'local/docs/example.js';
const replace = (content, oldString, newString) => applyPatchUpdateToText(content, [{ oldString, newString }], path).content;

test('one workspace patch can add, edit, delete and move, including move with edits', () => {
    const patch = parseApplyPatch({ files: [
        { path: 'local/empty.txt', content: '' },
        { path, edits: [{ startLine: 2, endLine: 3, newString: 'x' }, { insertAtLine: 6, newString: 'y' }] },
        { path: 'local/delete.txt', delete: true },
        { path: 'local/old.txt', moveTo: 'local/new.txt', edits: [{ oldString: 'old', newString: 'new' }] },
    ] });
    assert.deepEqual(patch.operations.map(({ type }) => type), ['add', 'update', 'delete', 'update']);
    assert.equal(patch.operations[0].content, '');
    assert.equal(patch.operations[3].moveTo, 'local/new.txt');
});

test('invalid and conflicting operation fields identify the offending entry', () => {
    for (const file of [
        { path, delete: false },
        { path, content: '', edits: [{ oldString: 'old', newString: 'new' }] },
        { path, delete: true, moveTo: 'local/new.js' },
        { path, edits: [] },
        { path, edits: [{ startLine: 1, endLine: 1, newString: '' }, { oldString: 'x', newString: '' }] },
    ]) {
        assert.throws(() => parseApplyPatch({ files: [file] }), error => (
            error.patchIssue?.code === 'apply_patch_invalid_input' && error.patchIssue.path === path && error.patchIssue.fileIndex === 0
        ));
    }
    for (const edit of [
        { startLine: 1, newString: 'x' },
        { insertAtLine: 1.5, newString: 'x' },
        { oldString: '', newString: '' },
        { oldString: 'x', insertAtLine: 1, newString: 'x' },
    ]) {
        assert.throws(() => parseApplyPatch({ files: [{ path, edits: [edit] }] }), error => (
            error.patchIssue?.code === 'apply_patch_invalid_input' && error.patchIssue.editIndex === 0
        ));
    }
    assert.throws(() => parseApplyPatch({ patchText: '*** Begin Patch' }), error => error.patchIssue?.code === 'apply_patch_invalid_input');
});

test('replace a fragment without altering its surrounding code', () => {
    assert.equal(replace('  const output = foo();  \r\n// end\n', 'foo()', 'bar()'), '  const output = bar();  \r\n// end\n');
    assert.equal(replace('before start\r\nfinish after\n', 'start\nfinish', 'first\nlast'), 'before first\r\nlast after\n');
});

test('whole-line matching retains the existing whitespace and punctuation profiles', () => {
    assert.equal(replace('head\n  old  \nend\n', 'old', 'new'), 'head\n  new  \nend\n');
    assert.equal(replace('head\n  old  \n  tail  \nend\n', 'old\ntail', '  new'), 'head\n  new\nend\n');
    assert.equal(replace('head\n  say(“old…”)\nend\n', 'say("old...")', '  say("new")'), 'head\n  say("new")\nend\n');
    assert.equal(replace('  say(“old…”)\nsay("old...")\n', 'say("old...")', 'new'), '  say(“old…”)\nnew\n');
});

test('missing or ambiguous replacements report the index without selecting a location', () => {
    for (const [content, oldString, code] of [
        ['x x\n', 'x', 'ambiguous_block_match'],
        ['aaaa', 'aaa', 'ambiguous_block_match'],
        ['say(“x”)\nsay(„x”)\n', 'say("x")', 'ambiguous_block_match'],
        ['missing\n', 'old', 'missing_block_match'],
        ['line\n', ' ', 'missing_block_match'],
        ['', ' ', 'missing_block_match'],
    ]) {
        assert.throws(() => replace(content, oldString, 'new'), error => (
            error.patchIssue?.code === code && error.patchIssue.path === path && error.patchIssue.editIndex === 0
        ));
    }
});
