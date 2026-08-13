/* global process */
// Durable per-cluster campaign executor. Valid attempts are immutable; status is derived from receipts.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

import { loadGoldCapture } from '../lib/run-store.mjs';
import { auditBaselinePlan, sanitizeExecutionProfile } from './plan.mjs';

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const replayRunner = path.join(rootDir, 'scripts', 'story-summary-replay-runner.mjs');
const localConfigPath = path.join(rootDir, 'scripts', 'story-summary-replay.local.json');

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

async function sha256File(filePath) {
    return sha256(await fs.readFile(filePath));
}

async function writeAtomic(filePath, content) {
    const temp = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(temp, content, 'utf8');
    await fs.rename(temp, filePath);
}

function attemptId() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

function posix(filePath) {
    return path.resolve(filePath).replace(/\\/g, '/');
}

function safeError(error) {
    const source = String(error?.stderr || error?.message || error || 'unknown');
    return source.slice(-4000)
        .replace(/Bearer\s+[^\s]+/gi, 'Bearer [redacted]')
        .replace(/\s+/g, ' ')
        .slice(0, 2000);
}

async function writeReceipt(filePath, receipt) {
    await writeAtomic(filePath, `${JSON.stringify(receipt, null, 2)}\n`);
}

async function artifactRef(filePath, name) {
    const bytes = await fs.readFile(filePath);
    return { name, path: posix(filePath), sha256: sha256(bytes), bytes: bytes.length };
}

async function verifyArtifacts(artifacts = []) {
    for (const artifact of artifacts) {
        try {
            if (await sha256File(artifact.path) !== artifact.sha256) return false;
        } catch {
            return false;
        }
    }
    return true;
}

async function listReceipts(stageDir) {
    try {
        const entries = await fs.readdir(stageDir, { withFileTypes: true });
        const receipts = [];
        for (const entry of entries.filter(item => item.isDirectory()).sort((a, b) => b.name.localeCompare(a.name))) {
            const receiptPath = path.join(stageDir, entry.name, 'receipt.json');
            try {
                receipts.push({ receiptPath, receipt: JSON.parse(await fs.readFile(receiptPath, 'utf8')) });
            } catch {}
        }
        return receipts;
    } catch (error) {
        if (error?.code === 'ENOENT') return [];
        throw error;
    }
}

async function findValidReceipt(campaignDir, job, stage, planHash) {
    const stageDir = path.join(campaignDir, 'jobs', job.id, stage);
    for (const item of await listReceipts(stageDir)) {
        const receipt = item.receipt;
        if (receipt.status !== 'valid' || receipt.planHash !== planHash || receipt.jobId !== job.id) continue;
        if (receipt.sampleHash !== job.sample.sha256 || receipt.casesHash !== job.cases.sha256) continue;
        if (!await verifyArtifacts(receipt.artifacts)) continue;
        if ((stage === 'capture' || stage === 'reader') && receipt.runDir) {
            try {
                const capture = await loadGoldCapture(receipt.runDir);
                if (capture.manifest.status !== 'valid' || capture.cases.length !== job.cases.count) continue;
            } catch {
                continue;
            }
        }
        return receipt;
    }
    return null;
}

async function runReplay(args) {
    return await execFileAsync(process.execPath, [replayRunner, ...args], {
        cwd: rootDir,
        windowsHide: true,
        maxBuffer: 100 * 1024 * 1024,
    });
}

async function listDirectories(root) {
    try {
        return (await fs.readdir(root, { withFileTypes: true })).filter(item => item.isDirectory()).map(item => item.name);
    } catch (error) {
        if (error?.code === 'ENOENT') return [];
        throw error;
    }
}

async function findNewGoldRun(runsRoot, before, runName) {
    const beforeSet = new Set(before);
    const candidates = (await listDirectories(runsRoot))
        .filter(name => !beforeSet.has(name) && name.endsWith(`-${runName}`))
        .sort();
    if (candidates.length !== 1) throw new Error(`无法唯一定位 Gold run: ${runName}, found=${candidates.length}`);
    return path.join(runsRoot, candidates[0]);
}

function baseReceipt({ stage, planHash, job, executionProfile }) {
    return {
        schemaVersion: 1,
        stage,
        status: 'running',
        planHash,
        profileFingerprint: executionProfile.fingerprint,
        jobId: job.id,
        source: job.source,
        lane: job.lane,
        sampleHash: job.sample.sha256,
        casesHash: job.cases.sha256,
        startedAt: new Date().toISOString(),
        completedAt: null,
        artifacts: [],
    };
}

async function runBootstrap({ campaignDir, planHash, plan, job, summaryKeyEnv }) {
    if (!String(process.env[summaryKeyEnv] || '')) {
        throw new Error(`Summary Key 环境变量不存在或为空: ${summaryKeyEnv}`);
    }
    const id = attemptId();
    const attemptDir = path.join(campaignDir, 'jobs', job.id, 'bootstrap', id);
    const outputDir = path.join(attemptDir, 'output');
    const snapshotPath = path.join(attemptDir, 'snapshot.json');
    const receiptPath = path.join(attemptDir, 'receipt.json');
    const receipt = baseReceipt({ stage: 'bootstrap', planHash, job, executionProfile: plan.executionProfile });
    await writeReceipt(receiptPath, receipt);
    try {
        await runReplay([
            'bootstrap',
            `--sample=${job.sample.path}`,
            `--snapshot=${snapshotPath}`,
            `--output=${outputDir}`,
            `--max-floors=${job.boundaryFloor + 1}`,
            `--summary-api-provider=${plan.executionProfile.summary.provider}`,
            `--summary-api-url=${plan.executionProfile.summary.url}`,
            `--summary-api-model=${plan.executionProfile.summary.model}`,
            `--summary-api-key-env=${summaryKeyEnv}`,
        ]);
        const reportPath = path.join(outputDir, 'story-summary-replay-report.json');
        const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
        if (!report.meta?.snapshotWritten || !report.vector?.health) throw new Error('bootstrap report 缺少有效 health/snapshot');
        if (report.summary?.totalBatches !== job.estimate.summary.requests) {
            throw new Error(`Summary 请求数偏离计划: ${report.summary?.totalBatches}/${job.estimate.summary.requests}`);
        }
        receipt.status = 'valid';
        receipt.completedAt = new Date().toISOString();
        receipt.artifacts = await Promise.all([
            artifactRef(snapshotPath, 'snapshot'),
            artifactRef(reportPath, 'report'),
        ]);
        receipt.snapshotPath = posix(snapshotPath);
        receipt.observed = {
            summaryBatches: report.summary.totalBatches,
            vectorHealth: report.vector.health,
            anomalies: report.anomalies || [],
        };
        await writeReceipt(receiptPath, receipt);
        return receipt;
    } catch (error) {
        receipt.status = 'invalid';
        receipt.completedAt = new Date().toISOString();
        receipt.error = safeError(error);
        await writeReceipt(receiptPath, receipt);
        throw new Error(`bootstrap invalid job=${job.id}: ${receipt.error}`);
    }
}

function deterministicInterval(planHash, jobId, minMs, maxMs) {
    const span = Math.max(0, maxMs - minMs);
    if (!span) return minMs;
    return minMs + (parseInt(sha256(`${planHash}:${jobId}`).slice(0, 8), 16) % (span + 1));
}

async function waitForGlobalCadence({ campaignDir, jobs, planHash, profile, nextJob }) {
    const prior = [];
    for (const job of jobs) {
        const receipt = await findValidReceipt(campaignDir, job, 'capture', planHash);
        if (receipt?.completedAt) prior.push(Date.parse(receipt.completedAt));
    }
    const last = Math.max(0, ...prior.filter(Number.isFinite));
    if (!last) return;
    const waitMs = deterministicInterval(planHash, nextJob.id, profile.recallPacing.minMs, profile.recallPacing.maxMs)
        - (Date.now() - last);
    if (waitMs > 0) await new Promise(resolve => setTimeout(resolve, waitMs));
}

async function runCapture({ campaignDir, planHash, plan, job, bootstrap, runsRoot }) {
    const id = attemptId();
    const attemptDir = path.join(campaignDir, 'jobs', job.id, 'capture', id);
    const outputDir = path.join(attemptDir, 'output');
    const receiptPath = path.join(attemptDir, 'receipt.json');
    const runName = `baseline-${job.id}-${id}`;
    const receipt = baseReceipt({ stage: 'capture', planHash, job, executionProfile: plan.executionProfile });
    receipt.sourceBootstrap = { completedAt: bootstrap.completedAt, snapshotHash: bootstrap.artifacts.find(item => item.name === 'snapshot')?.sha256 };
    await writeReceipt(receiptPath, receipt);
    const before = await listDirectories(runsRoot);
    try {
        await runReplay([
            'recall-only',
            `--sample=${job.sample.path}`,
            `--snapshot=${bootstrap.snapshotPath}`,
            `--output=${outputDir}`,
            `--max-floors=${job.boundaryFloor + 1}`,
            `--gold-cases=${job.cases.path}`,
            `--gold-runs-root=${runsRoot}`,
            '--gold-split=dev',
            `--gold-run-name=${runName}`,
            `--gold-case-interval-min-ms=${plan.executionProfile.recallPacing.minMs}`,
            `--gold-case-interval-max-ms=${plan.executionProfile.recallPacing.maxMs}`,
            '--gold-reader=false',
        ]);
        const runDir = await findNewGoldRun(runsRoot, before, runName);
        const capture = await loadGoldCapture(runDir);
        if (capture.manifest.status !== 'valid' || capture.cases.length !== job.cases.count) {
            throw new Error(`capture 不完整: status=${capture.manifest.status} cases=${capture.cases.length}/${job.cases.count}`);
        }
        const reportPath = path.join(outputDir, 'story-summary-replay-report.json');
        receipt.status = 'valid';
        receipt.completedAt = new Date().toISOString();
        receipt.runDir = posix(runDir);
        receipt.runId = capture.manifest.runId;
        receipt.artifacts = await Promise.all([
            artifactRef(path.join(runDir, 'manifest.json'), 'run-manifest'),
            artifactRef(reportPath, 'replay-report'),
        ]);
        receipt.observed = {
            cases: capture.cases.length,
            productionExternalCalls: capture.manifest.counts?.productionExternalCalls ?? null,
            productionTransportRequests: capture.manifest.counts?.productionTransportRequests ?? null,
        };
        await writeReceipt(receiptPath, receipt);
        return receipt;
    } catch (error) {
        receipt.status = 'invalid';
        receipt.completedAt = new Date().toISOString();
        receipt.error = safeError(error);
        await writeReceipt(receiptPath, receipt);
        throw new Error(`capture invalid job=${job.id}: ${receipt.error}`);
    }
}

async function runReader({ campaignDir, planHash, plan, job, capture, runsRoot, readerKeyEnv }) {
    const key = String(process.env[readerKeyEnv] || '');
    if (!key) throw new Error(`reader Key 环境变量不存在或为空: ${readerKeyEnv}`);
    const id = attemptId();
    const attemptDir = path.join(campaignDir, 'jobs', job.id, 'reader', id);
    const receiptPath = path.join(attemptDir, 'receipt.json');
    const runName = `baseline-reader-${job.id}-${id}`;
    const receipt = baseReceipt({ stage: 'reader', planHash, job, executionProfile: plan.executionProfile });
    receipt.sourceCapture = { runId: capture.runId, runDir: capture.runDir };
    await writeReceipt(receiptPath, receipt);
    const before = await listDirectories(runsRoot);
    const reader = plan.executionProfile.reader;
    try {
        await runReplay([
            'reader-only',
            `--gold-runs-root=${runsRoot}`,
            `--gold-run-name=${runName}`,
            `--gold-capture-run=${capture.runDir}`,
            '--gold-reader=true',
            `--gold-reader-max-tokens=${reader.maxTokens}`,
            `--gold-reader-reasoning-effort=${reader.reasoningEffort}`,
            `--gold-reader-max-attempts=${reader.maxAttempts}`,
            `--gold-reader-concurrency=${reader.concurrency}`,
            `--summary-api-provider=${reader.api.provider}`,
            `--summary-api-url=${reader.api.url}`,
            `--summary-api-model=${reader.api.model}`,
            `--summary-api-key-env=${readerKeyEnv}`,
        ]);
        const runDir = await findNewGoldRun(runsRoot, before, runName);
        const readerRun = await loadGoldCapture(runDir);
        if (readerRun.manifest.status !== 'valid' || readerRun.cases.length !== job.cases.count) {
            throw new Error(`reader 不完整: status=${readerRun.manifest.status} cases=${readerRun.cases.length}/${job.cases.count}`);
        }
        receipt.status = 'valid';
        receipt.completedAt = new Date().toISOString();
        receipt.runDir = posix(runDir);
        receipt.runId = readerRun.manifest.runId;
        receipt.artifacts = [await artifactRef(path.join(runDir, 'manifest.json'), 'run-manifest')];
        receipt.observed = {
            cases: readerRun.cases.length,
            readerExternalCalls: readerRun.manifest.counts?.readerExternalCalls ?? null,
        };
        await writeReceipt(receiptPath, receipt);
        return receipt;
    } catch (error) {
        receipt.status = 'invalid';
        receipt.completedAt = new Date().toISOString();
        receipt.error = safeError(error);
        await writeReceipt(receiptPath, receipt);
        throw new Error(`reader invalid job=${job.id}: ${receipt.error}`);
    }
}

export async function campaignStatus({ planPath, campaignDir, lane = null }) {
    const audit = await auditBaselinePlan(planPath);
    if (!audit.ok) throw new Error('baseline plan audit 失败');
    const jobs = audit.plan.jobs.filter(job => !lane || job.lane === lane);
    const rows = [];
    for (const job of jobs) {
        const bootstrap = await findValidReceipt(campaignDir, job, 'bootstrap', audit.planHash);
        const capture = await findValidReceipt(campaignDir, job, 'capture', audit.planHash);
        const reader = await findValidReceipt(campaignDir, job, 'reader', audit.planHash);
        rows.push({ jobId: job.id, source: job.source, lane: job.lane, bootstrap: !!bootstrap, capture: !!capture, reader: !!reader });
    }
    const count = key => rows.filter(row => row[key]).length;
    return {
        planHash: audit.planHash,
        jobs: rows.length,
        completed: { bootstrap: count('bootstrap'), capture: count('capture'), reader: count('reader') },
        next: rows.find(row => !row.bootstrap)
            || rows.find(row => !row.capture)
            || rows.find(row => !row.reader)
            || null,
        rows,
    };
}

export async function runCampaignStage({
    planPath,
    campaignDir,
    runsRoot,
    lane,
    stage,
    readerKeyEnv = '',
    summaryKeyEnv = '',
    all = false,
}) {
    const audit = await auditBaselinePlan(planPath);
    if (!audit.ok) throw new Error('baseline plan audit 失败');
    if (lane !== 'screening') throw new Error('baseline phase 只允许 screening lane；full-dev/stress 在组合 candidate 后解锁');
    const config = JSON.parse(await fs.readFile(localConfigPath, 'utf8'));
    const currentProfile = sanitizeExecutionProfile(config, audit.plan.executionProfile.reader);
    if (currentProfile.fingerprint !== audit.plan.executionProfile.fingerprint) {
        throw new Error('本地 API/生成配置与冻结 baseline plan 不一致');
    }
    const jobs = audit.plan.jobs.filter(job => job.lane === lane);
    const completed = [];
    for (const job of jobs) {
        if (await findValidReceipt(campaignDir, job, stage, audit.planHash)) continue;
        if (stage === 'bootstrap') {
            completed.push(await runBootstrap({
                campaignDir,
                planHash: audit.planHash,
                plan: audit.plan,
                job,
                summaryKeyEnv,
            }));
        } else if (stage === 'capture') {
            const bootstrap = await findValidReceipt(campaignDir, job, 'bootstrap', audit.planHash);
            if (!bootstrap) throw new Error(`capture 缺少 valid bootstrap: ${job.id}`);
            await waitForGlobalCadence({ campaignDir, jobs, planHash: audit.planHash, profile: audit.plan.executionProfile, nextJob: job });
            completed.push(await runCapture({ campaignDir, planHash: audit.planHash, plan: audit.plan, job, bootstrap, runsRoot }));
        } else if (stage === 'reader') {
            const capture = await findValidReceipt(campaignDir, job, 'capture', audit.planHash);
            if (!capture) throw new Error(`reader 缺少 valid capture: ${job.id}`);
            completed.push(await runReader({ campaignDir, planHash: audit.planHash, plan: audit.plan, job, capture, runsRoot, readerKeyEnv }));
        } else {
            throw new Error(`未知 campaign stage: ${stage}`);
        }
        if (!all) break;
    }
    return { stage, lane, completed: completed.map(item => ({ jobId: item.jobId, status: item.status, runId: item.runId || null })) };
}
