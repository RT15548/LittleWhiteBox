import test from 'node:test';
import assert from 'node:assert/strict';

import { parseApplyPatch } from '../shared/apply-patch.js';
import { buildPatchFailureResult, runPatchValidationAndApply } from '../shared/apply-patch-execution.js';

function createState(files = {}) {
    return Object.entries(files).map(([path, content]) => ({
        publicPath: path,
        content,
        originalContent: content,
    })).sort((left, right) => left.publicPath.localeCompare(right.publicPath, 'en'));
}

function cloneState(state = []) {
    return state.map((file) => ({ ...file }));
}

function normalizeTestPath(rawPath = '') {
    const normalized = String(rawPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalized.startsWith('local/') || normalized.endsWith('/') || normalized.includes('..')) return '';
    return normalized;
}

function getPathError(rawPath = '') {
    return normalizeTestPath(rawPath) ? '' : 'local_path_required';
}

function findFile(state = [], publicPath = '') {
    return cloneState(state).find((file) => file.publicPath === publicPath) || null;
}

function writeFile(state = [], publicPath = '', content = '') {
    const normalizedPath = normalizeTestPath(publicPath);
    if (!normalizedPath) {
        throw new Error(getPathError(publicPath));
    }
    const nextFile = {
        publicPath: normalizedPath,
        content: String(content || ''),
        originalContent: findFile(state, normalizedPath)?.originalContent ?? null,
    };
    const withoutExisting = cloneState(state).filter((file) => file.publicPath !== normalizedPath);
    withoutExisting.push(nextFile);
    withoutExisting.sort((left, right) => left.publicPath.localeCompare(right.publicPath, 'en'));
    return {
        nextState: withoutExisting,
        file: nextFile,
    };
}

function addFile(state = [], publicPath = '', content = '') {
    if (findFile(state, publicPath)) {
        throw new Error('local_destination_exists');
    }
    return writeFile(state, publicPath, content);
}

function removeFile(state = [], publicPath = '') {
    const existing = findFile(state, publicPath);
    if (!existing) {
        throw new Error('local_file_not_found');
    }
    return {
        nextState: cloneState(state).filter((file) => file.publicPath !== publicPath),
        file: existing,
    };
}

function moveFile(state = [], fromPath = '', toPath = '', options = {}) {
    const source = findFile(state, fromPath);
    if (!source) {
        throw new Error('local_file_not_found');
    }
    const destination = findFile(state, toPath);
    if (destination && toPath !== fromPath && !options.overwrite) {
        throw new Error('local_destination_exists');
    }
    const nextState = cloneState(state).filter((file) => file.publicPath !== fromPath && file.publicPath !== toPath);
    const moved = {
        ...source,
        publicPath: toPath,
    };
    nextState.push(moved);
    nextState.sort((left, right) => left.publicPath.localeCompare(right.publicPath, 'en'));
    return {
        nextState,
        fromFile: source,
        file: moved,
        overwritten: !!destination && toPath !== fromPath,
    };
}

function createAdapter() {
    return {
        cloneState,
        normalizePath: normalizeTestPath,
        getPathError,
        findFile,
        addFile,
        removeFile,
        moveFile,
        writeFile,
    };
}

function patch(lines = []) {
    return parseApplyPatch([
        '*** Begin Patch',
        ...lines,
        '*** End Patch',
    ].join('\n'));
}

test('runPatchValidationAndApply applies a validated multi-file patch in one commit', () => {
    const initialState = createState({
        'local/demo/app.js': 'const value = 1;\n',
        'local/demo/old.js': 'export default "old";\n',
    });
    const parsed = patch([
        '*** Add File: local/demo/new.js',
        '+export default "new";',
        '*** Update File: local/demo/app.js',
        '@@',
        '-const value = 1;',
        '+const value = 2;',
        '*** Delete File: local/demo/old.js',
    ]);

    const result = runPatchValidationAndApply(parsed, initialState, createAdapter());

    assert.equal(result.ok, true);
    assert.equal(result.phase, 'applied');
    assert.equal(result.filesChanged, 3);
    assert.equal(result.addedCount, 1);
    assert.equal(result.updatedCount, 1);
    assert.equal(result.deletedCount, 1);
    assert.equal(result.movedCount, 0);
    assert.equal(result.hunksApplied, 1);
    assert.equal(result.validation.operationsValidated, 3);
    assert.equal(result.validation.hunksValidated, 1);
    assert.match(result.summary, /已先校验再应用补丁/);
    assert.equal(findFile(result.nextState, 'local/demo/new.js')?.content, 'export default "new";');
    assert.equal(findFile(result.nextState, 'local/demo/app.js')?.content, 'const value = 2;\n');
    assert.equal(findFile(result.nextState, 'local/demo/old.js'), null);
});

test('runPatchValidationAndApply validates later hunks against earlier simulated content', () => {
    const initialState = createState({
        'local/demo/app.js': [
            'function demo() {',
            '  const value = 1;',
            '  return value;',
            '}',
        ].join('\n'),
    });
    const parsed = patch([
        '*** Update File: local/demo/app.js',
        '@@ function demo() {',
        '-  const value = 1;',
        '+  const value = 2;',
        '@@ function demo() {',
        '-  return value;',
        '+  return value + 1;',
    ]);

    const result = runPatchValidationAndApply(parsed, initialState, createAdapter());
    assert.equal(result.validation.hunksValidated, 2);
    assert.match(findFile(result.nextState, 'local/demo/app.js')?.content || '', /const value = 2;/);
    assert.match(findFile(result.nextState, 'local/demo/app.js')?.content || '', /return value \+ 1;/);
});

test('runPatchValidationAndApply fails validation without mutating the original state', () => {
    const initialState = createState({
        'local/demo/app.js': 'const value = 1;\n',
    });
    const beforeSnapshot = JSON.stringify(initialState);
    const parsed = patch([
        '*** Update File: local/demo/app.js',
        '@@',
        '-const missing = 3;',
        '+const missing = 4;',
    ]);

    assert.throws(
        () => runPatchValidationAndApply(parsed, initialState, createAdapter()),
        /apply_patch_apply_error:/,
    );
    assert.equal(JSON.stringify(initialState), beforeSnapshot);
});

test('runPatchValidationAndApply rejects multi-file patches atomically when a later operation fails', () => {
    const initialState = createState({
        'local/demo/app.js': 'const value = 1;\n',
        'local/demo/existing.js': 'export default 1;\n',
    });
    const beforeSnapshot = JSON.stringify(initialState);
    const parsed = patch([
        '*** Add File: local/demo/new.js',
        '+export default "new";',
        '*** Update File: local/demo/app.js',
        '@@',
        '-const value = 1;',
        '+const value = 2;',
        '*** Add File: local/demo/existing.js',
        '+export default "duplicate";',
    ]);

    assert.throws(
        () => runPatchValidationAndApply(parsed, initialState, createAdapter()),
        /local_destination_exists/,
    );
    assert.equal(JSON.stringify(initialState), beforeSnapshot);
});

test('runPatchValidationAndApply rejects add to an existing path', () => {
    const initialState = createState({
        'local/demo/existing.js': 'export default 1;\n',
    });
    const parsed = patch([
        '*** Add File: local/demo/existing.js',
        '+export default 2;',
    ]);

    assert.throws(
        () => runPatchValidationAndApply(parsed, initialState, createAdapter()),
        /local_destination_exists/,
    );
});

test('runPatchValidationAndApply rejects delete when the file is missing', () => {
    const parsed = patch([
        '*** Delete File: local/demo/missing.js',
    ]);

    assert.throws(
        () => runPatchValidationAndApply(parsed, createState({}), createAdapter()),
        /local_file_not_found/,
    );
});

test('runPatchValidationAndApply rejects move when the destination already exists', () => {
    const initialState = createState({
        'local/demo/app.js': 'const value = 1;\n',
        'local/demo/existing.js': 'export default 1;\n',
    });
    const parsed = patch([
        '*** Update File: local/demo/app.js',
        '*** Move to: local/demo/existing.js',
    ]);

    assert.throws(
        () => runPatchValidationAndApply(parsed, initialState, createAdapter()),
        /local_destination_exists/,
    );
});

test('runPatchValidationAndApply preserves move-only updates inside validate/apply flow', () => {
    const initialState = createState({
        'local/demo/app.js': 'const value = 1;\n',
    });
    const parsed = patch([
        '*** Update File: local/demo/app.js',
        '*** Move to: local/demo/renamed.js',
    ]);

    const result = runPatchValidationAndApply(parsed, initialState, createAdapter());

    assert.equal(result.movedCount, 1);
    assert.equal(result.updatedCount, 0);
    assert.equal(result.validation.operationsValidated, 1);
    assert.equal(findFile(result.nextState, 'local/demo/renamed.js')?.content, 'const value = 1;\n');
    assert.equal(findFile(result.nextState, 'local/demo/app.js'), null);
});

test('runPatchValidationAndApply calls adapter findFile with state first and path second', () => {
    const initialState = createState({
        'local/demo/app.js': 'const value = 1;\n',
    });
    const parsed = patch([
        '*** Update File: local/demo/app.js',
        '@@',
        '-const value = 1;',
        '+const value = 2;',
    ]);
    const calls = [];
    const adapter = {
        ...createAdapter(),
        findFile: (state, publicPath) => {
            calls.push({
                isArrayState: Array.isArray(state),
                publicPath,
            });
            return findFile(state, publicPath);
        },
    };

    const result = runPatchValidationAndApply(parsed, initialState, adapter);

    assert.equal(result.ok, true);
    assert.ok(calls.length >= 2);
    assert.equal(calls[0]?.isArrayState, true);
    assert.equal(calls[0]?.publicPath, 'local/demo/app.js');
});

test('runPatchValidationAndApply also accepts adapter mutations that return nextSources', () => {
    const initialState = createState({
        'local/demo/app.js': 'const value = 1;\n',
    });
    const parsed = patch([
        '*** Update File: local/demo/app.js',
        '@@',
        '-const value = 1;',
        '+const value = 2;',
    ]);
    const adapter = {
        ...createAdapter(),
        writeFile: (state, publicPath, content) => {
            const result = writeFile(state, publicPath, content);
            return {
                nextSources: result.nextState,
                file: result.file,
            };
        },
    };

    const result = runPatchValidationAndApply(parsed, initialState, adapter);

    assert.equal(result.ok, true);
    assert.equal(findFile(result.nextState, 'local/demo/app.js')?.content, 'const value = 2;\n');
});

test('buildPatchFailureResult produces a structured failed result', () => {
    const error = new Error('apply_patch_apply_error:hunk 1 for local/demo/app.js old block did not match the current file');
    error.patchValidation = {
        operationsValidated: 2,
        hunksValidated: 1,
    };

    const result = buildPatchFailureResult(error);

    assert.equal(result.ok, false);
    assert.equal(result.phase, 'failed');
    assert.match(result.summary, /未修改任何文件/);
    assert.equal(result.validation.operationsValidated, 2);
    assert.equal(result.validation.hunksValidated, 1);
    assert.match(result.error, /apply_patch_apply_error:/);
});
