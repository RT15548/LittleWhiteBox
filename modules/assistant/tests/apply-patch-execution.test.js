import test from 'node:test';
import assert from 'node:assert/strict';

import { parseApplyPatch } from '../../agent-core/tools/apply-patch.js';
import { buildPatchFailureResult, runPatchValidationAndApply } from '../../agent-core/tools/apply-patch-execution.js';
import {
    findLocalSourceFileByPath, getWritableLocalPathError, moveLocalSourceFile,
    normalizeWritableLocalPath, removeLocalSourceFile, upsertLocalSourceFile,
} from '../shared/local-workspace-kernel.js';

const path = 'local/demo/app.js';
const other = 'local/demo/other.js';
const adapter = {
    normalizePath: normalizeWritableLocalPath,
    getPathError: getWritableLocalPathError,
    findFile: (sources, path) => findLocalSourceFileByPath(path, sources),
    addFile: upsertLocalSourceFile,
    writeFile: upsertLocalSourceFile,
    removeFile: removeLocalSourceFile,
    moveFile: moveLocalSourceFile,
};
const state = (files) => Object.entries(files).reduce((sources, [path, text]) => upsertLocalSourceFile(sources, path, text).nextSources, []);
const run = (state, files) => runPatchValidationAndApply(parseApplyPatch({ files }), state, adapter);

test('line edits use original positions and preview their final positions', () => {
    const before = state({ [path]: 'one\ntwo\nthree\nfour\nfive\n' });
    const result = run(before, [{ path, edits: [
        { startLine: 4, endLine: 5, newString: 'FOUR' },
        { insertAtLine: 2, newString: 'new\nlines' },
    ] }]);
    assert.equal(result.phase, 'applied');
    assert.equal(adapter.findFile(result.nextState, path).content, 'one\nnew\nlines\ntwo\nthree\nFOUR\n');
    assert.equal(result.editsApplied, 2);
    assert.match(result.changes[0].edits[0].newPreview, /^6: FOUR/);
    assert.equal(adapter.findFile(before, path).content, 'one\ntwo\nthree\nfour\nfive\n');
});

test('a failed later edit identifies its original file and edit indices', () => {
    const before = state({ [path]: 'one', [other]: 'a\nb\nc' });
    const files = [
        { path, edits: [{ oldString: 'one', newString: 'ONE' }] },
        { path: other, edits: [{ startLine: 2, endLine: 2, newString: 'B' }, { insertAtLine: 5, newString: 'out' }] },
    ];
    assert.throws(() => run(before, files), (error) => {
        const result = buildPatchFailureResult(error);
        assert.equal(result.ok, false);
        assert.equal(result.phase, 'failed');
        assert.equal(result.error, 'insert_line_out_of_bounds');
        assert.equal(result.issue.path, other);
        assert.equal(result.issue.fileIndex, 1);
        assert.equal(result.issue.editIndex, 1);
        return true;
    });
    assert.equal(adapter.findFile(before, path).content, 'one');
    assert.equal(adapter.findFile(before, other).content, 'a\nb\nc');
});

test('existing files cannot be overwritten by adding or moving in a patch', () => {
    const before = state({ [path]: 'one', [other]: 'two' });
    for (const file of [{ path: other, content: 'new' }, { path, moveTo: other }]) {
        assert.throws(() => run(before, [file]), error => error.patchIssue?.code === 'local_destination_exists');
    }
    assert.throws(() => run(before, [{ path: 'local/demo/missing.js', delete: true }]), error => error.patchIssue?.code === 'local_file_not_found');
});

test('no-op edit does not rewrite the file', () => {
    const before = state({ [path]: 'one\r\ntwo\r\n' });
    const result = run(before, [{ path, edits: [{ startLine: 1, endLine: 1, newString: 'one' }] }]);
    assert.equal(result.phase, 'unchanged');
    assert.equal(result.filesChanged, 0);
    assert.equal(adapter.findFile(result.nextState, path).content, 'one\r\ntwo\r\n');
});
