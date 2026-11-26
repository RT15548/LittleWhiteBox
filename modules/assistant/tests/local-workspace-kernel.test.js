import test from 'node:test';
import assert from 'node:assert/strict';
import { findLocalDirectoryByPath, moveLocalPathInSources, upsertLocalSourceDirectory, upsertLocalSourceFile } from '../shared/local-workspace-kernel.js';

for (const children of [[], ['nested/only.md'], ['first.md', 'nested/second.md']]) {
    test(`Move reports directory paths when the directory has ${children.length} file(s)`, () => {
        const fromPath = 'local/project/drafts/', toPath = 'local/archive/renamed/';
        let { nextSources: sources } = upsertLocalSourceDirectory([], `${fromPath}empty/`);
        for (const child of children) {
            sources = upsertLocalSourceFile(sources, `${fromPath}${child}`, child).nextSources;
        }

        const move = moveLocalPathInSources(sources, fromPath, toPath);

        assert.equal(move.mode, 'directory');
        assert.equal(move.fromPath, fromPath);
        assert.equal(move.toPath, toPath);
        assert.deepEqual(move.movedFiles.map(file => file.path).sort(), children.map(child => `${toPath}${child}`).sort());
        assert.equal(findLocalDirectoryByPath(move.nextSources, fromPath), null);
        assert.ok(findLocalDirectoryByPath(move.nextSources, `${toPath}empty/`));
    });
}

test('Move reports file paths when moving a file into an existing directory', () => {
    const fromPath = 'local/project/drafts/only.md', destination = 'local/archive/';
    const { nextSources: sources } = upsertLocalSourceDirectory(upsertLocalSourceFile([], fromPath, 'draft').nextSources, destination);

    const move = moveLocalPathInSources(sources, fromPath, destination);

    assert.equal(move.mode, 'file');
    assert.equal(move.fromPath, fromPath);
    assert.equal(move.toPath, `${destination}only.md`);
});