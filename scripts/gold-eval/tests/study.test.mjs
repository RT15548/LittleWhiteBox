import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createHash } from 'node:crypto';

import { auditStudy, loadStudy, saveStudy } from '../study/store.mjs';
import { transitionStudy, validateStudy } from '../study/schema.mjs';

function hash(value) {
    return createHash('sha256').update(value).digest('hex');
}

function buildStudy(root, fileHash) {
    const file = name => ({ path: path.join(root, name), sha256: fileHash });
    const run = name => ({ runId: name, runDir: path.join(root, name), expectedStatus: 'valid' });
    return {
        schemaVersion: 1,
        studyId: 'study-v1',
        objective: '验证研究控制面',
        phase: 'architecture',
        status: 'active',
        updatedAt: '2026-08-05T00:00:00.000Z',
        policy: { productionBehavior: 'frozen', holdout: 'sealed' },
        inputs: {
            dev: { sample: file('sample'), cases: file('cases'), snapshot: file('snapshot') },
            holdout: { sample: file('holdout'), cases: null, consumed: false },
        },
        evidence: {
            sourceCapture: run('capture'),
            readerBaseline: run('reader'),
            adjudication: null,
        },
        capabilityMatrix: { fact: 1 },
        devMatrix: {
            sources: [{ id: 'real-dev', role: 'product', status: 'frozen', artifacts: [] }],
        },
        gates: { devMatrix: { requiredCategories: ['fact', 'update'], requiredSources: ['real-dev'] } },
        hypotheses: [{
            id: 'H-Q', stage: 'query', status: 'observed',
            statement: '问题向量可能被上下文稀释', variable: 'query construction',
        }],
        active: { hypothesisId: null, step: 'control-plane', nextAction: '完成架构审计' },
    };
}

test('study schema 冻结生产行为并禁止越级 phase', () => {
    const study = buildStudy('C:/tmp', 'a'.repeat(64));
    assert.equal(validateStudy(study).phase, 'architecture');
    assert.throws(() => validateStudy({
        ...study,
        policy: { ...study.policy, productionBehavior: 'candidate' },
    }), /必须保持 frozen/);
    assert.throws(() => transitionStudy(study, {
        expectedPhase: 'architecture',
        toPhase: 'experiments',
        nextAction: 'skip',
    }), /禁止越级/);
});

test('study audit 校验输入 hash、run 身份与未满足闸门', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gold-study-'));
    try {
        const content = 'frozen';
        const fileHash = hash(content);
        for (const name of ['sample', 'cases', 'snapshot', 'holdout']) {
            await fs.writeFile(path.join(root, name), content);
        }
        const study = buildStudy(root, fileHash);
        const audit = await auditStudy(study, {
            loadCapture: async runDir => ({
                manifest: {
                    runId: path.basename(runDir),
                    status: 'valid',
                    mode: 'test',
                },
            }),
        });
        assert.equal(audit.ok, true);
        assert.equal(audit.gates.controlPlane, true);
        assert.equal(audit.gates.devMatrix, false);
        assert.equal(audit.gates.baseline, false);
        assert.equal(audit.gates.holdoutSealed, true);
    } finally {
        await fs.rm(root, { recursive: true, force: true });
    }
});

test('study store 使用 expected hash 防止并发覆盖', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gold-study-store-'));
    try {
        const filePath = path.join(root, 'STUDY.json');
        const study = buildStudy(root, 'b'.repeat(64));
        await saveStudy(filePath, study);
        const loaded = await loadStudy(filePath);
        await fs.writeFile(filePath, `${JSON.stringify({ ...study, status: 'changed' }, null, 2)}\n`);
        await assert.rejects(() => saveStudy(filePath, loaded.study, { expectedHash: loaded.hash }), /其他进程修改/);
    } finally {
        await fs.rm(root, { recursive: true, force: true });
    }
});
