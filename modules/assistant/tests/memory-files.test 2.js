import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeMemoryFileRecord, normalizeMemoryFiles } from '../app-src/memory/memory-files.js';

test('normalizeMemoryFileRecord preserves notes relativePath and file name', () => {
    const file = normalizeMemoryFileRecord({
        path: 'memory/notes/Identity.md',
        relativePath: 'notes/Identity.md',
        filename: 'Identity.md',
        name: 'Identity.md',
        content: 'test',
        originalContent: 'test',
        memorySection: 'notes',
        noteKind: 'identity',
    });

    assert(file);
    assert.equal(file.path, 'memory/notes/Identity.md');
    assert.equal(file.relativePath, 'notes/Identity.md');
    assert.equal(file.name, 'Identity.md');
    assert.equal(file.memorySection, 'notes');
    assert.equal(file.noteKind, 'identity');
});

test('normalizeMemoryFileRecord upgrades legacy skills paths into memory namespace', () => {
    const file = normalizeMemoryFileRecord({
        path: 'skills/LittleWhiteBox_Assistant_Skill_Test.md',
        filename: 'LittleWhiteBox_Assistant_Skill_Test.md',
        content: 'test',
        originalContent: 'test',
    });

    assert(file);
    assert.equal(file.path, 'memory/skills/LittleWhiteBox_Assistant_Skill_Test.md');
    assert.equal(file.relativePath, 'skills/LittleWhiteBox_Assistant_Skill_Test.md');
    assert.equal(file.memorySection, 'skills');
});

test('normalizeMemoryFiles keeps both skills and notes entries', () => {
    const files = normalizeMemoryFiles([
        {
            path: 'memory/skills/SkillA.md',
            relativePath: 'skills/SkillA.md',
            filename: 'SkillA.md',
            content: 'A',
            originalContent: 'A',
        },
        {
            path: 'memory/notes/Worklog.md',
            relativePath: 'notes/Worklog.md',
            filename: 'Worklog.md',
            content: 'B',
            originalContent: 'B',
            memorySection: 'notes',
            noteKind: 'worklog',
        },
    ]);

    assert.equal(files.length, 2);
    assert.deepEqual(files.map((item) => item.relativePath), ['skills/SkillA.md', 'notes/Worklog.md']);
});
