// Gold Eval study control plane - schema and state transitions.

export const STUDY_SCHEMA_VERSION = 1;

export const STUDY_PHASES = Object.freeze([
    'architecture',
    'dev-matrix',
    'baseline',
    'experiments',
    'candidate',
    'holdout',
    'browser-e2e',
    'recommendation',
    'complete',
]);

export const HYPOTHESIS_STATUSES = Object.freeze([
    'observed',
    'preregistered',
    'screening',
    'rejected',
    'dev-passed',
    'combined',
    'frozen',
    'holdout-passed',
    'holdout-failed',
]);

const PHASE_TRANSITIONS = Object.freeze({
    architecture: ['dev-matrix'],
    'dev-matrix': ['baseline'],
    baseline: ['experiments'],
    experiments: ['candidate'],
    candidate: ['experiments', 'holdout'],
    holdout: ['browser-e2e', 'recommendation'],
    'browser-e2e': ['recommendation'],
    recommendation: ['complete'],
    complete: [],
});

function requireObject(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} 必须是对象`);
    }
    return value;
}

function requireString(value, label) {
    const normalized = String(value || '').trim();
    if (!normalized) throw new Error(`${label} 不能为空`);
    return normalized;
}

function validateFileRef(value, label, { optional = false } = {}) {
    if (value == null && optional) return null;
    const ref = requireObject(value, label);
    const sha256 = requireString(ref.sha256, `${label}.sha256`).toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(sha256)) throw new Error(`${label}.sha256 格式无效`);
    return {
        path: requireString(ref.path, `${label}.path`),
        sha256,
    };
}

function validateRunRef(value, label, { optional = false } = {}) {
    if (value == null && optional) return null;
    const ref = requireObject(value, label);
    return {
        runId: requireString(ref.runId, `${label}.runId`),
        runDir: requireString(ref.runDir, `${label}.runDir`),
        expectedStatus: String(ref.expectedStatus || 'valid'),
        expectedMode: ref.expectedMode == null ? null : requireString(ref.expectedMode, `${label}.expectedMode`),
    };
}

function validateAdjudicationRef(value, label, { optional = false } = {}) {
    if (value == null && optional) return null;
    const file = validateFileRef(value, label);
    return {
        ...file,
        sourceRunId: requireString(value.sourceRunId, `${label}.sourceRunId`),
    };
}

function validateBaselineCampaign(value) {
    if (value == null) return null;
    const campaign = requireObject(value, 'evidence.baselineCampaign');
    const expectedJobIds = (campaign.expectedJobIds || []).map((item, index) => (
        requireString(item, `evidence.baselineCampaign.expectedJobIds[${index}]`)
    ));
    if (!expectedJobIds.length || new Set(expectedJobIds).size !== expectedJobIds.length) {
        throw new Error('evidence.baselineCampaign.expectedJobIds 必须非空且唯一');
    }
    const jobs = (campaign.jobs || []).map((raw, index) => {
        const label = `evidence.baselineCampaign.jobs[${index}]`;
        const job = requireObject(raw, label);
        return {
            id: requireString(job.id, `${label}.id`),
            bootstrapReceipt: validateFileRef(job.bootstrapReceipt, `${label}.bootstrapReceipt`),
            capture: validateRunRef(job.capture, `${label}.capture`),
            reader: validateRunRef(job.reader, `${label}.reader`),
            adjudication: validateAdjudicationRef(job.adjudication, `${label}.adjudication`),
        };
    });
    if (new Set(jobs.map(job => job.id)).size !== jobs.length) {
        throw new Error('evidence.baselineCampaign job id 不允许重复');
    }
    if (expectedJobIds.some(id => !jobs.some(job => job.id === id))) {
        throw new Error('evidence.baselineCampaign 缺少 expected job');
    }
    return {
        plan: validateFileRef(campaign.plan, 'evidence.baselineCampaign.plan'),
        campaignDir: requireString(campaign.campaignDir, 'evidence.baselineCampaign.campaignDir'),
        expectedJobIds,
        jobs,
    };
}

function validateHypothesis(value, index) {
    const label = `hypotheses[${index}]`;
    const item = requireObject(value, label);
    const status = requireString(item.status, `${label}.status`);
    if (!HYPOTHESIS_STATUSES.includes(status)) {
        throw new Error(`${label}.status 无效: ${status}`);
    }
    return {
        id: requireString(item.id, `${label}.id`),
        stage: requireString(item.stage, `${label}.stage`),
        statement: requireString(item.statement, `${label}.statement`),
        variable: requireString(item.variable, `${label}.variable`),
        status,
        evidence: Array.isArray(item.evidence) ? item.evidence.map(String) : [],
        nextGate: item.nextGate == null ? null : String(item.nextGate),
    };
}

function validateDevMatrixSource(value, index) {
    const label = `devMatrix.sources[${index}]`;
    const source = requireObject(value, label);
    return {
        ...source,
        id: requireString(source.id, `${label}.id`),
        role: requireString(source.role, `${label}.role`),
        status: requireString(source.status, `${label}.status`),
        artifacts: (source.artifacts || []).map((artifact, artifactIndex) => ({
            name: requireString(artifact?.name, `${label}.artifacts[${artifactIndex}].name`),
            ...validateFileRef(artifact, `${label}.artifacts[${artifactIndex}]`),
        })),
    };
}

export function validateStudy(raw) {
    const input = requireObject(raw, 'study');
    if (input.schemaVersion !== STUDY_SCHEMA_VERSION) {
        throw new Error(`不支持的 study schema: ${input.schemaVersion}`);
    }

    const phase = requireString(input.phase, 'phase');
    if (!STUDY_PHASES.includes(phase)) throw new Error(`未知 study phase: ${phase}`);

    const policy = requireObject(input.policy, 'policy');
    if (policy.productionBehavior !== 'frozen' && phase !== 'complete') {
        throw new Error('候选算法行为在研究完成前必须保持 frozen');
    }

    const inputs = requireObject(input.inputs, 'inputs');
    const dev = requireObject(inputs.dev, 'inputs.dev');
    const holdout = requireObject(inputs.holdout, 'inputs.holdout');
    const hypotheses = (input.hypotheses || []).map(validateHypothesis);
    const hypothesisIds = new Set();
    for (const hypothesis of hypotheses) {
        if (hypothesisIds.has(hypothesis.id)) throw new Error(`hypothesis id 重复: ${hypothesis.id}`);
        hypothesisIds.add(hypothesis.id);
    }

    const active = requireObject(input.active, 'active');
    const activeHypothesisId = active.hypothesisId == null ? null : String(active.hypothesisId);
    if (activeHypothesisId && !hypothesisIds.has(activeHypothesisId)) {
        throw new Error(`active.hypothesisId 不存在: ${activeHypothesisId}`);
    }
    if (holdout.consumed === true && STUDY_PHASES.indexOf(phase) < STUDY_PHASES.indexOf('holdout')) {
        throw new Error('方案冻结并进入 holdout phase 前不得消费 holdout');
    }
    const devMatrix = requireObject(input.devMatrix, 'devMatrix');
    const devMatrixSources = (devMatrix.sources || []).map(validateDevMatrixSource);
    if (new Set(devMatrixSources.map(source => source.id)).size !== devMatrixSources.length) {
        throw new Error('devMatrix source id 不允许重复');
    }

    return {
        ...input,
        schemaVersion: STUDY_SCHEMA_VERSION,
        studyId: requireString(input.studyId, 'studyId'),
        objective: requireString(input.objective, 'objective'),
        phase,
        status: requireString(input.status, 'status'),
        updatedAt: requireString(input.updatedAt, 'updatedAt'),
        policy: {
            ...policy,
            productionBehavior: policy.productionBehavior,
            holdout: requireString(policy.holdout, 'policy.holdout'),
        },
        inputs: {
            dev: {
                ...dev,
                sample: validateFileRef(dev.sample, 'inputs.dev.sample'),
                cases: validateFileRef(dev.cases, 'inputs.dev.cases'),
                snapshot: validateFileRef(dev.snapshot, 'inputs.dev.snapshot'),
            },
            holdout: {
                ...holdout,
                sample: validateFileRef(holdout.sample, 'inputs.holdout.sample'),
                cases: validateFileRef(holdout.cases, 'inputs.holdout.cases', { optional: true }),
                consumed: holdout.consumed === true,
            },
        },
        evidence: {
            sourceCapture: validateRunRef(input.evidence?.sourceCapture, 'evidence.sourceCapture'),
            readerBaseline: validateRunRef(input.evidence?.readerBaseline, 'evidence.readerBaseline'),
            adjudication: validateAdjudicationRef(input.evidence?.adjudication, 'evidence.adjudication', { optional: true }),
            baselineCampaign: validateBaselineCampaign(input.evidence?.baselineCampaign),
        },
        devMatrix: {
            ...devMatrix,
            sources: devMatrixSources,
        },
        hypotheses,
        active: {
            ...active,
            hypothesisId: activeHypothesisId,
            step: requireString(active.step, 'active.step'),
            nextAction: requireString(active.nextAction, 'active.nextAction'),
        },
    };
}

export function transitionStudy(study, { expectedPhase, toPhase, nextAction, now = new Date() }) {
    const current = validateStudy(study);
    if (current.phase !== expectedPhase) {
        throw new Error(`study phase 已变化：expected=${expectedPhase} actual=${current.phase}`);
    }
    if (!(PHASE_TRANSITIONS[current.phase] || []).includes(toPhase)) {
        throw new Error(`禁止越级 transition: ${current.phase} -> ${toPhase}`);
    }
    return validateStudy({
        ...current,
        phase: toPhase,
        updatedAt: now.toISOString(),
        active: {
            ...current.active,
            step: toPhase,
            nextAction: requireString(nextAction, 'nextAction'),
        },
    });
}
