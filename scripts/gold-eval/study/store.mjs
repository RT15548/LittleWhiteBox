/* global process */
// Gold Eval study control plane - durable state, evidence audit and status view.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

import { loadGoldCapture } from '../lib/run-store.mjs';
import { parseAdjudicationJsonl, validateAdjudication } from '../lib/adjudication.mjs';
import { transitionStudy, validateStudy } from './schema.mjs';

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

async function writeAtomic(filePath, content) {
    const tempPath = path.join(
        path.dirname(filePath),
        `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
    );
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(tempPath, content, 'utf8');
    await fs.rename(tempPath, filePath);
}

export async function loadStudy(studyPath) {
    const text = await fs.readFile(studyPath, 'utf8');
    return {
        study: validateStudy(JSON.parse(text)),
        hash: sha256(text),
        path: path.resolve(studyPath),
    };
}

export async function saveStudy(studyPath, study, { expectedHash = null } = {}) {
    if (expectedHash != null) {
        const currentText = await fs.readFile(studyPath, 'utf8');
        const currentHash = sha256(currentText);
        if (currentHash !== expectedHash) throw new Error('STUDY.json 已被其他进程修改，拒绝覆盖');
    }
    const validated = validateStudy(study);
    const content = `${JSON.stringify(validated, null, 2)}\n`;
    await writeAtomic(studyPath, content);
    return { study: validated, hash: sha256(content), path: path.resolve(studyPath) };
}

async function auditFileRef(label, ref) {
    try {
        const bytes = await fs.readFile(ref.path);
        const actual = sha256(bytes);
        return {
            label,
            kind: 'file',
            ok: actual === ref.sha256,
            expected: ref.sha256,
            actual,
            path: ref.path,
            message: actual === ref.sha256 ? null : 'SHA-256 不匹配',
        };
    } catch (error) {
        return { label, kind: 'file', ok: false, path: ref.path, message: String(error?.message || error) };
    }
}

async function auditRunRef(label, ref, loadCapture) {
    try {
        const capture = await loadCapture(ref.runDir);
        const statusMatches = capture.manifest.status === ref.expectedStatus;
        const idMatches = capture.manifest.runId === ref.runId;
        const modeMatches = !ref.expectedMode || capture.manifest.mode === ref.expectedMode;
        return {
            label,
            kind: 'run',
            ok: statusMatches && idMatches && modeMatches,
            runId: capture.manifest.runId,
            status: capture.manifest.status,
            mode: capture.manifest.mode,
            runDir: ref.runDir,
            message: statusMatches && idMatches && modeMatches
                ? null
                : `run identity mismatch: id=${idMatches} status=${statusMatches} mode=${modeMatches}`,
        };
    } catch (error) {
        return { label, kind: 'run', ok: false, runDir: ref.runDir, message: String(error?.message || error) };
    }
}

async function auditAdjudicationRef(label, ref, readerRef, loadCapture) {
    const fileCheck = await auditFileRef(label, ref);
    if (!fileCheck.ok) return fileCheck;
    if (ref.sourceRunId !== readerRef.runId) {
        return { ...fileCheck, ok: false, message: 'adjudication sourceRunId 与 reader baseline 不一致' };
    }
    try {
        const [text, source] = await Promise.all([
            fs.readFile(ref.path, 'utf8'),
            loadCapture(readerRef.runDir),
        ]);
        const parsed = parseAdjudicationJsonl(text);
        const validated = validateAdjudication({
            cases: source.cases,
            stageTraces: source.stageTraces,
            rows: parsed.rows,
        });
        const errors = [...parsed.errors, ...validated.errors];
        return {
            ...fileCheck,
            ok: errors.length === 0,
            message: errors.length ? errors.slice(0, 5).join('; ') : null,
            summary: validated.summary,
        };
    } catch (error) {
        return { ...fileCheck, ok: false, message: String(error?.message || error) };
    }
}

function computeGates(study, checks) {
    const ok = label => checks.find(item => item.label === label)?.ok === true;
    const matrix = study.capabilityMatrix || {};
    const requiredCategories = study.gates?.devMatrix?.requiredCategories || [];
    const requiredSources = study.gates?.devMatrix?.requiredSources || [];
    const sourceById = new Map((study.devMatrix?.sources || []).map(source => [source.id, source]));
    const sourcesReady = requiredSources.every(sourceId => {
        const source = sourceById.get(sourceId);
        if (!source || source.status !== 'frozen' || !source.artifacts.length) return false;
        return source.artifacts.every(artifact => ok(`devMatrix.${source.id}.${artifact.name}`));
    });
    const devMatrixReady = sourcesReady
        && requiredCategories.every(category => Number(matrix[category] || 0) > 0);
    const adjudicationReady = study.evidence.adjudication
        ? ok('adjudication')
        : false;
    const baselineCampaign = study.evidence.baselineCampaign;
    const controlledBaseline = baselineCampaign
        ? ok('baselineCampaign.plan') && baselineCampaign.expectedJobIds.every(jobId => {
            const prefix = `baselineCampaign.${jobId}`;
            const adjudicationCheck = checks.find(item => item.label === `${prefix}.adjudication`);
            return ok(`${prefix}.bootstrapReceipt`)
                && ok(`${prefix}.capture`)
                && ok(`${prefix}.reader`)
                && adjudicationCheck?.ok === true
                && adjudicationCheck.summary?.semanticPass === adjudicationCheck.summary?.cases;
        })
        : false;
    return {
        controlPlane: checks.every(item => item.ok),
        devMatrix: devMatrixReady,
        baseline: ok('sourceCapture') && ok('readerBaseline') && adjudicationReady,
        controlledBaseline,
        holdoutSealed: study.inputs.holdout.consumed === false,
        productionFrozen: study.policy.productionBehavior === 'frozen',
    };
}

export async function auditStudy(study, { loadCapture = loadGoldCapture } = {}) {
    const validated = validateStudy(study);
    const matrixFileChecks = validated.devMatrix.sources.flatMap(source => (
        source.artifacts.map(artifact => auditFileRef(`devMatrix.${source.id}.${artifact.name}`, artifact))
    ));
    const campaign = validated.evidence.baselineCampaign;
    const campaignChecks = campaign ? [
        auditFileRef('baselineCampaign.plan', campaign.plan),
        ...campaign.jobs.flatMap(job => {
            const prefix = `baselineCampaign.${job.id}`;
            return [
                auditFileRef(`${prefix}.bootstrapReceipt`, job.bootstrapReceipt),
                auditRunRef(`${prefix}.capture`, job.capture, loadCapture),
                auditRunRef(`${prefix}.reader`, job.reader, loadCapture),
                auditAdjudicationRef(`${prefix}.adjudication`, job.adjudication, job.reader, loadCapture),
            ];
        }),
    ] : [];
    const checks = await Promise.all([
        auditFileRef('dev.sample', validated.inputs.dev.sample),
        auditFileRef('dev.cases', validated.inputs.dev.cases),
        auditFileRef('dev.snapshot', validated.inputs.dev.snapshot),
        auditFileRef('holdout.sample', validated.inputs.holdout.sample),
        auditRunRef('sourceCapture', validated.evidence.sourceCapture, loadCapture),
        auditRunRef('readerBaseline', validated.evidence.readerBaseline, loadCapture),
        ...(validated.evidence.adjudication
            ? [auditAdjudicationRef('adjudication', validated.evidence.adjudication, validated.evidence.readerBaseline, loadCapture)]
            : []),
        ...matrixFileChecks,
        ...campaignChecks,
    ]);
    const gates = computeGates(validated, checks);
    return {
        ok: checks.every(item => item.ok),
        checkedAt: new Date().toISOString(),
        checks,
        gates,
    };
}

export function renderStudyStatus(study, audit, { studyHash = null } = {}) {
    const lines = [
        '# 当前研究状态',
        '',
        '> 本文件由 `gold:study status <STUDY> <STATUS>` 生成。唯一可执行状态是 `STUDY.json`；历史证据只存在于不可变 runs 与追加式账本。',
        '',
        `- Study：\`${study.studyId}\``,
        `- 目标：${study.objective}`,
        `- 阶段：\`${study.phase}\``,
        `- 状态：\`${study.status}\``,
        `- 候选算法行为：\`${study.policy.productionBehavior}\``,
        `- Holdout：\`${study.inputs.holdout.consumed ? 'consumed' : 'sealed'}\``,
        `- STUDY hash：\`${studyHash || 'unknown'}\``,
        `- 审计时间：${audit.checkedAt}`,
        '',
        '## 闸门',
        '',
        '| 闸门 | 状态 |',
        '|---|---|',
        ...Object.entries(audit.gates).map(([key, value]) => `| ${key} | ${value ? 'PASS' : 'BLOCKED'} |`),
        '',
        '## 证据审计',
        '',
        '| 对象 | 状态 | 说明 |',
        '|---|---|---|',
        ...audit.checks.map(item => {
            const adjudicationSummary = item.summary
                ? `semantic=${item.summary.semanticPass}/${item.summary.cases}; evidence-present=${item.summary.evidencePresentSemanticPass}/${item.summary.evidencePresent}`
                : '';
            return `| ${item.label} | ${item.ok ? 'PASS' : 'FAIL'} | ${item.message || adjudicationSummary || item.runId || item.path || ''} |`;
        }),
        '',
        '## 假设队列',
        '',
        '| ID | 阶段 | 状态 | 单一变量 |',
        '|---|---|---|---|',
        ...study.hypotheses.map(item => `| ${item.id} | ${item.stage} | ${item.status} | ${item.variable} |`),
        '',
        '## Dev 来源矩阵',
        '',
        '| 来源 | 职责 | 状态 | 产物 |',
        '|---|---|---|---|',
        ...study.devMatrix.sources.map(source => `| ${source.id} | ${source.role} | ${source.status} | ${source.artifacts.map(item => item.name).join(', ') || '无'} |`),
        ...(study.evidence.baselineCampaign ? [
            '',
            '## Baseline Campaign',
            '',
            '| Job | Bootstrap | Capture | Reader | Adjudication |',
            '|---|---|---|---|---|',
            ...study.evidence.baselineCampaign.jobs.map(job => {
                const prefix = `baselineCampaign.${job.id}`;
                const state = suffix => audit.checks.find(item => item.label === `${prefix}.${suffix}`)?.ok ? 'PASS' : 'FAIL';
                return `| ${job.id} | ${state('bootstrapReceipt')} | ${state('capture')} | ${state('reader')} | ${state('adjudication')} |`;
            }),
        ] : []),
        '',
        '## 唯一下一步',
        '',
        `- 当前工作：${study.active.step}`,
        `- 下一动作：${study.active.nextAction}`,
        `- 活跃假设：${study.active.hypothesisId || '无'}`,
        '',
        '## 硬边界',
        '',
        '- 未通过 dev、组合、holdout 与 browser E2E 闸门前，不修改正式默认算法。',
        '- 外部错误按既有重试规则记录；耗尽后 run invalid，不评分 fallback。',
        '- Holdout 一旦消费，不允许根据其结果继续调参。',
        '',
    ];
    return lines.join('\n');
}

export async function writeStudyStatus(statusPath, study, audit, options = {}) {
    const markdown = renderStudyStatus(study, audit, options);
    await writeAtomic(statusPath, markdown);
    return path.resolve(statusPath);
}

export async function advanceStudy(studyPath, { expectedHash, expectedPhase, toPhase, nextAction }) {
    const loaded = await loadStudy(studyPath);
    if (loaded.hash !== expectedHash) throw new Error('STUDY hash 不匹配，拒绝 transition');
    const next = transitionStudy(loaded.study, { expectedPhase, toPhase, nextAction });
    return await saveStudy(studyPath, next, { expectedHash });
}
