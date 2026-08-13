import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { parseCasesJsonl } from '../lib/cases.mjs';
import { buildWorld, WORLDS, writeControlledMatrix } from '../dev-matrix/controlled-cn.mjs';

test('controlled-cn 先定义证据楼层并生成两世界 48 个契约', () => {
    assert.equal(WORLDS.length, 2);
    for (const world of WORLDS) {
        const built = buildWorld(world);
        assert.equal(built.cases.length, 24);
        assert.ok(built.messages.length >= 60);
        const parsed = parseCasesJsonl(built.cases.map(item => JSON.stringify(item)).join('\n'));
        assert.deepEqual(parsed.errors, []);
        assert.deepEqual(parsed.stats.byCategory, {
            fact: 3,
            update: 3,
            temporal: 3,
            causal: 3,
            associative: 3,
            alias: 3,
            global: 3,
            abstention: 3,
        });
        for (const goldCase of parsed.cases) {
            assert.equal(goldCase.atFloor, built.messages.length - 1);
            for (const field of ['requiredAll', 'requiredAny', 'supporting', 'forbiddenAsCurrent']) {
                assert.ok(goldCase.evidence[field].every(floor => floor <= goldCase.atFloor));
            }
        }
    }
});

test('controlled-cn update 契约明确冻结旧状态', () => {
    for (const world of WORLDS) {
        const built = buildWorld(world);
        const updateCases = built.cases.filter(item => item.category === 'update');
        assert.equal(updateCases.length, 3);
        assert.ok(updateCases.slice(0, 2).every(item => item.evidence.forbiddenAsCurrent.length === 1));
        assert.equal(updateCases[2].expectedAnswer.values[0], '尚未确定');
    }
});

test('controlled-cn 产物可重建且 manifest 记录全部 hash', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'controlled-cn-'));
    try {
        const result = await writeControlledMatrix(root);
        assert.equal(result.cases, 48);
        assert.equal(result.artifacts.length, 4);
        assert.equal(Object.values(result.categoryCounts).every(count => count === 6), true);
        for (const artifact of result.artifacts) await fs.access(artifact.path);
        await fs.access(result.manifestPath);
    } finally {
        await fs.rm(root, { recursive: true, force: true });
    }
});
