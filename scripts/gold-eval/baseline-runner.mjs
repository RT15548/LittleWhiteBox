/* global process */
// Baseline campaign preparation/audit. No command in this file calls a model API.

import fs from 'node:fs/promises';
import path from 'node:path';

import { loadGoldCapture } from './lib/run-store.mjs';
import { auditBaselinePlan, prepareBaselinePlan, sanitizeExecutionProfile } from './baseline/plan.mjs';
import { auditStudy, loadStudy } from './study/store.mjs';

function parseFlags(argv) {
    const flags = {};
    for (const item of argv) {
        if (!item.startsWith('--')) continue;
        const [key, ...rest] = item.slice(2).split('=');
        flags[key] = rest.length ? rest.join('=') : true;
    }
    return flags;
}

function requireFlag(flags, name) {
    const value = String(flags[name] || '').trim();
    if (!value) throw new Error(`缺少 --${name}=...`);
    return value;
}

function readCommandFlag(command, name) {
    const prefix = `--${name}=`;
    return String(command || '').split(/\s+/).find(item => item.startsWith(prefix))?.slice(prefix.length) || '';
}

function readerFromCapture(capture) {
    const api = capture.manifest.apis?.reader || {};
    const generation = capture.manifest.reader || {};
    const command = capture.manifest.execution?.command || '';
    return {
        api: {
            provider: api.provider,
            url: readCommandFlag(command, 'summary-api-url'),
            model: api.model,
        },
        maxTokens: generation.maxTokens,
        reasoningEffort: generation.reasoningEffort,
        concurrency: generation.concurrency,
        maxAttempts: generation.maxAttempts,
    };
}

async function prepare(flags) {
    const workspace = path.resolve(requireFlag(flags, 'workspace'));
    const studyPath = path.resolve(flags.study || path.join(workspace, 'STUDY.json'));
    const configPath = path.resolve(requireFlag(flags, 'config'));
    const outputDir = path.resolve(flags.output || path.join(workspace, 'datasets', 'baseline-runnable-v1'));
    const loadedStudy = await loadStudy(studyPath);
    if (loadedStudy.study.phase !== 'baseline') throw new Error(`prepare 只允许 baseline phase，当前=${loadedStudy.study.phase}`);
    const studyAudit = await auditStudy(loadedStudy.study);
    if (!studyAudit.ok || !studyAudit.gates.devMatrix || !studyAudit.gates.holdoutSealed || !studyAudit.gates.productionFrozen) {
        throw new Error('STUDY audit/闸门未通过，拒绝生成 baseline plan');
    }
    const [configText, readerCapture] = await Promise.all([
        fs.readFile(configPath, 'utf8'),
        loadGoldCapture(loadedStudy.study.evidence.readerBaseline.runDir),
    ]);
    const config = JSON.parse(configText);
    const executionProfile = sanitizeExecutionProfile(config, readerFromCapture(readerCapture));
    const studyRef = {
        path: studyPath.replace(/\\/g, '/'),
        sha256: loadedStudy.hash,
        phase: loadedStudy.study.phase,
        existingBaseline: {
            sourceCapture: loadedStudy.study.evidence.sourceCapture,
            readerBaseline: loadedStudy.study.evidence.readerBaseline,
            adjudication: loadedStudy.study.evidence.adjudication,
        },
    };
    const result = await prepareBaselinePlan({
        outputDir,
        controlledDir: path.join(workspace, 'datasets', 'controlled-cn-v1'),
        publicDir: path.join(workspace, 'datasets', 'public-v1'),
        studyRef,
        executionProfile,
    });
    process.stdout.write(`${JSON.stringify({
        path: result.path,
        sha256: result.sha256,
        profile: executionProfile,
        summary: result.plan.summary,
    }, null, 2)}\n`);
}

async function audit(flags) {
    const planPath = path.resolve(requireFlag(flags, 'plan'));
    const result = await auditBaselinePlan(planPath);
    process.stdout.write(`${JSON.stringify({
        ok: result.ok,
        planHash: result.planHash,
        jobs: result.jobs,
        cases: result.cases,
        invariants: result.invariants,
        summary: result.plan.summary,
        failedFiles: result.checks.filter(item => !item.ok),
    }, null, 2)}\n`);
    if (!result.ok) process.exitCode = 2;
}

async function main() {
    const command = String(process.argv[2] || '').toLowerCase();
    const flags = parseFlags(process.argv.slice(3));
    if (command === 'prepare') await prepare(flags);
    else if (command === 'audit' || command === 'status') await audit(flags);
    else throw new Error('用法: baseline-runner.mjs prepare --workspace=<总结测试> --config=<local config> [--study=...] [--output=...] | audit --plan=<plan.json>');
}

main().catch(error => {
    process.stderr.write(`[gold-baseline] ${error?.stack || error}\n`);
    process.exitCode = 1;
});
