/* global process */
// Gold Eval - versioned private run storage and lifecycle.

import path from 'node:path';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

export const GOLD_CAPTURE_SCHEMA_VERSION = 1;

function toPosix(input) {
    return String(input || '').replace(/\\/g, '/');
}

function jsonl(rows = []) {
    return rows.length ? `${rows.map(row => JSON.stringify(row)).join('\n')}\n` : '';
}

function safeName(value) {
    return String(value || 'case').replace(/[^\w一-龥-]+/g, '-').slice(0, 100);
}

export function sha256Text(value) {
    return createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

export function sha256JsonlRows(rows) {
    return sha256Text(jsonl(rows));
}

export async function sha256File(filePath) {
    const bytes = await fs.readFile(filePath);
    return createHash('sha256').update(bytes).digest('hex');
}

async function sha256Directory(directoryPath) {
    const files = [];
    const visit = async (currentPath, relativePath = '') => {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const childPath = path.join(currentPath, entry.name);
            const childRelative = path.join(relativePath, entry.name).replace(/\\/g, '/');
            if (entry.isDirectory()) await visit(childPath, childRelative);
            else if (entry.isFile()) files.push({ path: childPath, relative: childRelative });
        }
    };
    await visit(directoryPath);
    files.sort((a, b) => a.relative.localeCompare(b.relative));
    const hash = createHash('sha256');
    for (const file of files) {
        hash.update(file.relative, 'utf8');
        hash.update('\0');
        hash.update(await fs.readFile(file.path));
        hash.update('\0');
    }
    return hash.digest('hex');
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

async function copyAtomic(sourcePath, destinationPath) {
    const bytes = await fs.readFile(sourcePath);
    const tempPath = path.join(
        path.dirname(destinationPath),
        `.${path.basename(destinationPath)}.${process.pid}.${Date.now()}.tmp`,
    );
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.writeFile(tempPath, bytes);
    await fs.rename(tempPath, destinationPath);
}

function manifestJson(manifest) {
    return `${JSON.stringify(manifest, null, 2)}\n`;
}

function publicPaths(runDir) {
    return {
        manifest: path.join(runDir, 'manifest.json'),
        cases: path.join(runDir, 'cases.jsonl'),
        prompts: path.join(runDir, 'prompts.jsonl'),
        promptInputs: path.join(runDir, 'prompt-inputs.jsonl'),
        transportTrace: path.join(runDir, 'transport-trace.jsonl'),
        stageTrace: path.join(runDir, 'stage-trace.jsonl'),
        metrics: path.join(runDir, 'metrics.json'),
        failures: path.join(runDir, 'failures.jsonl'),
        report: path.join(runDir, 'report.md'),
        invalid: path.join(runDir, 'INVALID.md'),
        code: path.join(runDir, 'code'),
        bundle: path.join(runDir, 'code', 'story-summary-replay.bundle.mjs'),
        checkpoints: path.join(runDir, 'checkpoints'),
        boundarySnapshots: path.join(runDir, 'boundary-snapshots'),
        recovery: path.join(runDir, 'recovery'),
    };
}

function isInsideDirectory(parentPath, childPath) {
    const relative = path.relative(path.resolve(parentPath), path.resolve(childPath));
    return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function sanitizeFailure(failure = {}) {
    return {
        stage: String(failure.stage || 'unknown'),
        kind: String(failure.kind || 'unknown'),
        status: Number.isInteger(failure.status) ? failure.status : null,
        caseId: failure.caseId ? String(failure.caseId) : null,
        batchIndex: Number.isInteger(failure.batchIndex) ? failure.batchIndex : null,
        readerExternalCalls: Number.isInteger(failure.readerExternalCalls)
            ? failure.readerExternalCalls
            : 0,
        batchAttempts: Array.isArray(failure.batchAttempts)
            ? failure.batchAttempts.slice(0, 8).map(attempt => ({
                caseId: attempt?.caseId ? String(attempt.caseId) : null,
                status: String(attempt?.status || 'unknown'),
                kind: attempt?.kind ? String(attempt.kind) : null,
                httpStatus: Number.isInteger(attempt?.httpStatus) ? attempt.httpStatus : null,
                readerExternalCalls: Number.isInteger(attempt?.readerExternalCalls)
                    ? attempt.readerExternalCalls
                    : 0,
            }))
            : [],
        message: String(failure.message || '').slice(0, 500),
    };
}

export async function beginGoldRun({
    runsRoot,
    runId,
    manifest,
    cases,
    bundlePath,
    codeArtifacts = [],
}) {
    const runDir = path.join(runsRoot, runId);
    const paths = publicPaths(runDir);
    await fs.mkdir(runsRoot, { recursive: true });
    await fs.mkdir(runDir, { recursive: false });
    await fs.mkdir(paths.checkpoints, { recursive: false });
    await fs.mkdir(paths.code, { recursive: false });

    const state = {
        ...manifest,
        schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
        status: 'running',
        startedAt: manifest.startedAt || new Date().toISOString(),
        completedAt: null,
        progress: {
            completedCases: 0,
            totalCases: cases.length,
            reusedCases: 0,
            checkpointHashes: {},
            productionExternalCalls: 0,
            productionTransportRequests: 0,
            readerExternalCalls: 0,
        },
        capture: {
            ...(manifest.capture || {}),
            executedCasesHash: sha256Text(jsonl(cases)),
        },
    };

    await writeAtomic(paths.manifest, manifestJson(state));
    await writeAtomic(paths.cases, jsonl(cases));
    if (bundlePath) await copyAtomic(bundlePath, paths.bundle);
    for (const artifact of codeArtifacts) {
        const source = String(artifact?.source || '');
        const destination = String(artifact?.destination || '');
        if (!source || !destination) continue;
        const target = path.join(paths.code, destination);
        const stat = await fs.stat(source);
        if (stat.isDirectory()) {
            await fs.cp(source, target, { recursive: true, force: false });
        } else {
            await copyAtomic(source, target);
        }
    }

    const persistManifest = async () => {
        await writeAtomic(paths.manifest, manifestJson(state));
    };

    return {
        runId,
        runDir: toPosix(runDir),
        paths,
        manifest: state,
        async commitCase({
            index,
            caseId,
            capture,
            productionExternalCalls = 0,
            productionTransportRequests = 0,
            readerExternalCalls = 0,
            reusedCase = false,
        }) {
            const checkpointPath = path.join(
                paths.checkpoints,
                `${String(index + 1).padStart(4, '0')}-${safeName(caseId)}.json`,
            );
            const checkpointContent = `${JSON.stringify(capture, null, 2)}\n`;
            await writeAtomic(checkpointPath, checkpointContent);
            state.progress.checkpointHashes[String(caseId)] = sha256Text(checkpointContent);
            state.progress.completedCases = index + 1;
            if (reusedCase) state.progress.reusedCases += 1;
            state.progress.productionExternalCalls += productionExternalCalls;
            state.progress.productionTransportRequests += productionTransportRequests;
            state.progress.readerExternalCalls += readerExternalCalls;
            state.progress.lastCaseId = String(caseId);
            await persistManifest();
        },
        async recordFailedCase({
            index,
            caseId,
            capture,
            productionExternalCalls = 0,
            productionTransportRequests = 0,
            readerExternalCalls = 0,
        }) {
            const checkpointPath = path.join(
                paths.checkpoints,
                `${String(index + 1).padStart(4, '0')}-${safeName(caseId)}-FAILED.json`,
            );
            const checkpointContent = `${JSON.stringify(capture, null, 2)}\n`;
            await writeAtomic(checkpointPath, checkpointContent);
            state.progress.checkpointHashes[`FAILED:${String(caseId)}`] = sha256Text(checkpointContent);
            state.progress.productionExternalCalls += productionExternalCalls;
            state.progress.productionTransportRequests += productionTransportRequests;
            state.progress.readerExternalCalls += readerExternalCalls;
            state.progress.attemptedCaseId = String(caseId);
            await persistManifest();
        },
        async recordRecoveryPoint(recoveryPoint) {
            state.progress.recoveryPoint = {
                kind: String(recoveryPoint.kind || 'natural-operational-recovery'),
                path: toPosix(recoveryPoint.path),
                sha256: String(recoveryPoint.sha256),
                resumeFloor: Number(recoveryPoint.resumeFloor),
                messageCount: Number(recoveryPoint.messageCount),
                preparationExternalCalls: Number(recoveryPoint.preparationExternalCalls || 0),
                preparationExternalRequests: Number(recoveryPoint.preparationExternalRequests || 0),
                generatedAt: String(recoveryPoint.generatedAt || new Date().toISOString()),
            };
            await persistManifest();
        },
        async complete({ manifestPatch = {}, prompts, promptInputs, transportTrace, stageTraces, metrics, failures, reportMarkdown }) {
            await Promise.all([
                writeAtomic(paths.prompts, jsonl(prompts)),
                writeAtomic(paths.promptInputs, jsonl(promptInputs)),
                writeAtomic(paths.transportTrace, jsonl(transportTrace)),
                writeAtomic(paths.stageTrace, jsonl(stageTraces)),
                writeAtomic(paths.metrics, `${JSON.stringify(metrics, null, 2)}\n`),
                writeAtomic(paths.failures, jsonl(failures)),
                writeAtomic(paths.report, reportMarkdown),
            ]);
            const artifactHashes = {};
            for (const [key, filePath] of Object.entries({
                cases: paths.cases,
                prompts: paths.prompts,
                promptInputs: paths.promptInputs,
                transportTrace: paths.transportTrace,
                stageTrace: paths.stageTrace,
                metrics: paths.metrics,
                failures: paths.failures,
                report: paths.report,
                ...(bundlePath ? { bundle: paths.bundle } : {}),
            })) {
                artifactHashes[key] = await sha256File(filePath);
            }
            artifactHashes.codeArchive = await sha256Directory(paths.code);
            if (manifest.capture?.containsBoundarySnapshots) {
                artifactHashes.boundarySnapshots = await sha256Directory(paths.boundarySnapshots);
            }
            if (manifest.capture?.containsRecoveryPoints) {
                artifactHashes.recovery = await sha256Directory(paths.recovery);
            }
            Object.assign(state, manifestPatch, {
                status: 'valid',
                completedAt: new Date().toISOString(),
                artifactHashes,
            });
            await persistManifest();
        },
        async invalidate(failure) {
            const safeFailure = sanitizeFailure(failure);
            Object.assign(state, {
                status: 'invalid',
                completedAt: new Date().toISOString(),
                invalidReason: safeFailure,
            });
            await persistManifest();
            const lines = [
                '# INVALID',
                '',
                `- Run: \`${runId}\``,
                `- 已完成 cases: ${state.progress.completedCases}/${state.progress.totalCases}`,
                `- 失败 case: ${safeFailure.caseId || 'unknown'}`,
                `- 阶段: ${safeFailure.stage}`,
                `- 类型: ${safeFailure.kind}`,
                `- HTTP status: ${safeFailure.status ?? 'n/a'}`,
                `- reader 尝试数: ${safeFailure.readerExternalCalls}`,
                `- 并发批次摘要: ${JSON.stringify(safeFailure.batchAttempts)}`,
                `- 批次: ${safeFailure.batchIndex ?? 'n/a'}`,
                `- 说明: ${safeFailure.message || 'n/a'}`,
                '- 结论: 本 run 不得用于质量指标或算法比较；禁止继续后续 case。',
                '',
            ];
            await writeAtomic(paths.invalid, lines.join('\n'));
        },
        artifacts() {
            return {
                runDir: toPosix(runDir),
                files: Object.fromEntries(
                    Object.entries(paths)
                        .filter(([key]) => key !== 'checkpoints')
                        .map(([key, value]) => [key, toPosix(value)]),
                ),
            };
        },
    };
}

export async function invalidateGoldRun({ runStore, failure, failedCase = null }) {
    let checkpointError = null;
    let invalidationError = null;
    if (failedCase) {
        try {
            await runStore.recordFailedCase(failedCase);
        } catch (error) {
            checkpointError = error;
        }
    }
    try {
        await runStore.invalidate(failure);
    } catch (error) {
        invalidationError = error;
    }
    return { checkpointError, invalidationError };
}

export async function abortRunningGoldRun(runDir, failure) {
    const paths = publicPaths(runDir);
    const manifest = await readJson(paths.manifest);
    if (manifest.schemaVersion !== GOLD_CAPTURE_SCHEMA_VERSION) {
        throw new Error(`不支持的 abort run schema: ${manifest.schemaVersion}`);
    }
    if (manifest.status !== 'running') {
        throw new Error(`只能abort running run: ${manifest.status || 'unknown'}`);
    }
    const safeFailure = sanitizeFailure(failure);
    const next = {
        ...manifest,
        status: 'invalid',
        completedAt: new Date().toISOString(),
        invalidReason: safeFailure,
    };
    await writeAtomic(paths.manifest, manifestJson(next));
    const lines = [
        '# INVALID',
        '',
        `- Run: \`${manifest.runId || path.basename(runDir)}\``,
        `- 已完成 cases: ${manifest.progress?.completedCases || 0}/${manifest.progress?.totalCases || 0}`,
        `- 失败 case: ${safeFailure.caseId || 'unknown'}`,
        `- 阶段: ${safeFailure.stage}`,
        `- 类型: ${safeFailure.kind}`,
        `- 说明: ${safeFailure.message || 'n/a'}`,
        '- 结论: 本 run 由控制面主动终止并作废，不得用于质量指标或算法比较。',
        '',
    ];
    await writeAtomic(paths.invalid, lines.join('\n'));
    return next;
}

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function readJsonl(filePath) {
    const text = await fs.readFile(filePath, 'utf8');
    return text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => JSON.parse(line));
}

export async function loadGoldReaderResume(runDir) {
    const paths = publicPaths(runDir);
    const [manifest, cases] = await Promise.all([
        readJson(paths.manifest),
        readJsonl(paths.cases),
    ]);
    if (manifest.schemaVersion !== GOLD_CAPTURE_SCHEMA_VERSION) {
        throw new Error(`不支持的 reader resume schema: ${manifest.schemaVersion}`);
    }
    if (manifest.mode !== 'gold-reader-only') {
        throw new Error(`resume 来源不是 reader-only: ${manifest.mode || 'unknown'}`);
    }
    if (manifest.status !== 'invalid') {
        throw new Error(`reader resume 来源必须是 invalid: ${manifest.status || 'unknown'}`);
    }
    if (manifest.capture?.executedCasesHash !== sha256Text(jsonl(cases))) {
        throw new Error('reader resume cases hash 不匹配');
    }

    const capturesByCaseId = new Map();
    const entries = await fs.readdir(paths.checkpoints, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.json') || entry.name.endsWith('-FAILED.json')) continue;
        const matched = entry.name.match(/^(\d+)-/);
        if (!matched) throw new Error(`reader resume checkpoint 文件名无效: ${entry.name}`);
        const index = Number(matched[1]) - 1;
        const goldCase = cases[index];
        if (!goldCase) throw new Error(`reader resume checkpoint 越界: ${entry.name}`);
        const checkpointPath = path.join(paths.checkpoints, entry.name);
        const checkpointContent = await fs.readFile(checkpointPath, 'utf8');
        const capture = JSON.parse(checkpointContent);
        if (capture.schemaVersion !== GOLD_CAPTURE_SCHEMA_VERSION || capture.caseId !== goldCase.id) {
            throw new Error(`reader resume checkpoint case 不匹配: index=${index}`);
        }
        if (!capture.sourcePromptHash || typeof capture.readerAnswer?.text !== 'string'
            || !capture.readerTransport || !capture.stageTrace) {
            throw new Error(`reader resume checkpoint 不完整: case=${goldCase.id}`);
        }
        if (manifest.progress?.checkpointHashes?.[goldCase.id] !== sha256Text(checkpointContent)) {
            throw new Error(`reader resume checkpoint hash 不匹配: case=${goldCase.id}`);
        }
        if (capturesByCaseId.has(goldCase.id)) {
            throw new Error(`reader resume checkpoint 重复: case=${goldCase.id}`);
        }
        capturesByCaseId.set(goldCase.id, { index, capture });
    }

    if (manifest.code?.bundleHash) {
        if (manifest.code.bundleHash !== await sha256File(paths.bundle)) {
            throw new Error('reader resume bundle hash 不匹配');
        }
    }

    return {
        runDir: toPosix(runDir),
        manifest,
        cases,
        capturesByCaseId,
    };
}

function validateStoredNaturalPreparation(preparation, label) {
    const calls = Number(preparation?.externalCalls);
    const requests = Number(preparation?.externalRequests);
    const trace = Array.isArray(preparation?.transportTrace) ? preparation.transportTrace : null;
    const steps = Array.isArray(preparation?.steps) ? preparation.steps : null;
    if (!Number.isInteger(calls) || calls < 0
        || !Number.isInteger(requests) || requests < 0
        || calls !== requests || !trace || trace.length !== requests || !steps) {
        throw new Error(`${label} preparation账本无效`);
    }
    return { calls, requests, trace, steps };
}

async function loadNaturalRecoveryPoint(paths, manifest, cases, completedCases, prefix) {
    const ref = manifest.progress?.recoveryPoint;
    if (!ref) return null;
    if (ref.kind !== 'natural-operational-recovery') {
        throw new Error(`natural resume recovery类型无效: ${ref.kind || 'missing'}`);
    }
    const snapshotPath = path.resolve(String(ref.path || ''));
    if (!isInsideDirectory(paths.recovery, snapshotPath)) {
        throw new Error('natural resume recovery越出来源run');
    }
    const snapshotHash = await sha256File(snapshotPath);
    if (snapshotHash !== ref.sha256) {
        throw new Error('natural resume recovery snapshot hash不匹配');
    }
    const snapshot = await readJson(snapshotPath);
    const resumeFloor = Number(ref.resumeFloor);
    const messageCount = Number(ref.messageCount);
    if (!Number.isInteger(resumeFloor) || resumeFloor < 0
        || !Number.isInteger(messageCount) || messageCount !== resumeFloor + 1
        || snapshot?.kind !== 'natural-operational-recovery'
        || snapshot?.boundary?.resumeFloor !== resumeFloor
        || snapshot?.boundary?.historyThroughFloor !== resumeFloor
        || snapshot?.sample?.messageCount !== messageCount) {
        throw new Error('natural resume recovery boundary无效');
    }
    const preparation = snapshot?.recovery?.preparation;
    const audited = validateStoredNaturalPreparation(preparation, 'natural resume recovery');
    if (Number(ref.preparationExternalCalls) !== audited.calls
        || Number(ref.preparationExternalRequests) !== audited.requests) {
        throw new Error('natural resume recovery manifest账本不匹配');
    }
    const lastCommittedFloor = Number(prefix.at(-1)?.goldCase?.query?.floor);
    const nextCaseFloor = Number(cases[completedCases]?.query?.floor);
    if (resumeFloor >= nextCaseFloor) {
        throw new Error(`natural resume recovery越过未完成query: ${resumeFloor} >= ${nextCaseFloor}`);
    }
    return {
        kind: 'natural-operational-recovery',
        snapshotPath: toPosix(snapshotPath),
        snapshotHash,
        resumeFloor,
        messageCount,
        preparation,
        generatedAt: snapshot.generatedAt || ref.generatedAt || null,
        usable: resumeFloor > lastCommittedFloor,
    };
}

export async function loadNaturalCaptureResumePrefix(runDir) {
    const paths = publicPaths(runDir);
    const [manifest, cases] = await Promise.all([
        readJson(paths.manifest),
        readJsonl(paths.cases),
    ]);
    if (manifest.schemaVersion !== GOLD_CAPTURE_SCHEMA_VERSION) {
        throw new Error(`不支持的 natural resume schema: ${manifest.schemaVersion}`);
    }
    if (!['story-summary-replay-natural-capture', 'story-summary-replay-natural-resume'].includes(manifest.mode)) {
        throw new Error(`natural resume 来源类型无效: ${manifest.mode || 'unknown'}`);
    }
    if (manifest.status !== 'invalid') {
        throw new Error(`natural resume 来源必须是 invalid: ${manifest.status || 'unknown'}`);
    }
    if (manifest.capture?.executedCasesHash !== sha256Text(jsonl(cases))) {
        throw new Error('natural resume cases hash 不匹配');
    }
    const completedCases = Number(manifest.progress?.completedCases ?? 0);
    if (!Number.isInteger(completedCases) || completedCases < 1 || completedCases >= cases.length) {
        throw new Error(`natural resume completedCases 无效: ${completedCases}/${cases.length}`);
    }
    if (manifest.progress?.attemptedCaseId !== cases[completedCases]?.id) {
        throw new Error('natural resume attemptedCaseId 不是首个未完成 case');
    }

    const checkpointEntries = (await fs.readdir(paths.checkpoints, { withFileTypes: true }))
        .filter(entry => entry.isFile() && entry.name.endsWith('.json') && !entry.name.endsWith('-FAILED.json'));
    const prefix = [];
    let productionExternalCalls = 0;
    let productionTransportRequests = 0;
    for (let index = 0; index < completedCases; index++) {
        const prefixName = `${String(index + 1).padStart(4, '0')}-`;
        const matches = checkpointEntries.filter(entry => entry.name.startsWith(prefixName));
        if (matches.length !== 1) {
            throw new Error(`natural resume checkpoint 缺失或重复: index=${index}`);
        }
        const checkpointPath = path.join(paths.checkpoints, matches[0].name);
        const checkpointContent = await fs.readFile(checkpointPath, 'utf8');
        const capture = JSON.parse(checkpointContent);
        const goldCase = cases[index];
        if (capture.schemaVersion !== GOLD_CAPTURE_SCHEMA_VERSION || capture.caseId !== goldCase?.id) {
            throw new Error(`natural resume checkpoint case 不匹配: index=${index}`);
        }
        if (!capture.prompt || !capture.promptInput || !capture.transport || !capture.stageTrace
            || !capture.boundarySnapshot || !capture.replayCase) {
            throw new Error(`natural resume checkpoint 不完整: case=${goldCase?.id || index}`);
        }
        if (manifest.progress?.checkpointHashes?.[goldCase.id] !== sha256Text(checkpointContent)) {
            throw new Error(`natural resume checkpoint hash 不匹配: case=${goldCase.id}`);
        }
        if (capture.prompt.promptHash !== sha256Text(String(capture.prompt.promptText || ''))) {
            throw new Error(`natural resume Prompt hash 不匹配: case=${goldCase.id}`);
        }
        const preparation = Array.isArray(capture.transport.preparation) ? capture.transport.preparation : null;
        const production = Array.isArray(capture.transport.production) ? capture.transport.production : null;
        const reader = Array.isArray(capture.transport.reader) ? capture.transport.reader : null;
        if (!preparation || !production || !reader || reader.length !== 0) {
            throw new Error(`natural resume transport 不完整: case=${goldCase.id}`);
        }
        const calls = preparation.length + production.length;
        productionExternalCalls += calls;
        productionTransportRequests += calls;

        const snapshotPath = path.resolve(String(capture.boundarySnapshot.path || ''));
        if (!isInsideDirectory(paths.boundarySnapshots, snapshotPath)) {
            throw new Error(`natural resume boundary snapshot 越出来源run: case=${goldCase.id}`);
        }
        const snapshotHash = await sha256File(snapshotPath);
        if (snapshotHash !== capture.boundarySnapshot.sha256) {
            throw new Error(`natural resume boundary snapshot hash 不匹配: case=${goldCase.id}`);
        }
        const snapshot = await readJson(snapshotPath);
        if (snapshot?.kind !== 'natural-query-boundary'
            || snapshot?.boundary?.queryFloor !== goldCase.query?.floor
            || snapshot?.boundary?.historyThroughFloor !== goldCase.historyThroughFloor
            || snapshot?.sample?.messageCount !== goldCase.query?.floor) {
            throw new Error(`natural resume boundary snapshot 边界无效: case=${goldCase.id}`);
        }
        prefix.push({
            index,
            goldCase,
            capture,
            sourceCheckpointPath: toPosix(checkpointPath),
            sourceCheckpointHash: sha256Text(checkpointContent),
            productionExternalCalls: calls,
            productionTransportRequests: calls,
            snapshotPath: toPosix(snapshotPath),
            snapshotHash,
        });
    }
    if (manifest.progress?.productionExternalCalls < productionExternalCalls
        || manifest.progress?.productionTransportRequests < productionTransportRequests) {
        throw new Error('natural resume prefix请求计数超过来源manifest');
    }
    if (manifest.code?.bundleHash && manifest.code.bundleHash !== await sha256File(paths.bundle)) {
        throw new Error('natural resume 来源 bundle hash 不匹配');
    }
    const recoveryPoint = await loadNaturalRecoveryPoint(paths, manifest, cases, completedCases, prefix);
    const lastBoundary = prefix.at(-1);
    const resumePoint = recoveryPoint?.usable
        ? recoveryPoint
        : {
            kind: 'natural-query-boundary',
            snapshotPath: lastBoundary.snapshotPath,
            snapshotHash: lastBoundary.snapshotHash,
            resumeFloor: Number(lastBoundary.goldCase.query.floor),
            messageCount: Number(lastBoundary.goldCase.query.floor),
            preparation: {
                externalCalls: 0,
                externalRequests: 0,
                transportTrace: [],
                steps: [],
            },
            goldCase: lastBoundary.goldCase,
        };

    return {
        runDir: toPosix(runDir),
        paths,
        manifest,
        cases,
        completedCases,
        prefix,
        productionExternalCalls,
        productionTransportRequests,
        resumeBoundary: lastBoundary,
        recoveryPoint,
        resumePoint,
    };
}

export async function loadGoldCapture(runDir) {
    const paths = publicPaths(runDir);
    const [manifest, cases, prompts, promptInputs, transportTrace, stageTraces] = await Promise.all([
        readJson(paths.manifest),
        readJsonl(paths.cases),
        readJsonl(paths.prompts),
        readJsonl(paths.promptInputs),
        readJsonl(paths.transportTrace),
        readJsonl(paths.stageTrace),
    ]);
    if (manifest.schemaVersion !== GOLD_CAPTURE_SCHEMA_VERSION) {
        throw new Error(`不支持的 Gold capture schema: ${manifest.schemaVersion}`);
    }
    if (manifest.status !== 'valid') {
        throw new Error(`Gold capture 不是 valid: ${manifest.status}`);
    }
    if (!manifest.capture?.containsFullPrompts
        || !manifest.capture?.containsPromptInputs
        || !manifest.capture?.containsTransportTrace) {
        throw new Error('Gold capture manifest 缺少必需的完整产物声明');
    }
    if (manifest.capture?.executedCasesHash !== sha256Text(jsonl(cases))) {
        throw new Error('Gold capture cases hash 不匹配');
    }
    const expected = cases.length;
    if (prompts.length !== expected || promptInputs.length !== expected
        || transportTrace.length !== expected || stageTraces.length !== expected) {
        throw new Error(
            `Gold capture 行数不完整: cases=${expected} prompts=${prompts.length} promptInputs=${promptInputs.length} transport=${transportTrace.length} stageTraces=${stageTraces.length}`,
        );
    }
    for (let index = 0; index < expected; index++) {
        const caseId = cases[index]?.id;
        if (prompts[index]?.caseId !== caseId || promptInputs[index]?.caseId !== caseId
            || transportTrace[index]?.caseId !== caseId || stageTraces[index]?.id !== caseId) {
            throw new Error(`Gold capture case 顺序不一致: index=${index} case=${caseId}`);
        }
        const promptText = String(prompts[index]?.promptText || '');
        if (prompts[index]?.promptHash !== sha256Text(promptText)) {
            throw new Error(`Gold capture Prompt hash 不匹配: case=${caseId}`);
        }
    }
    for (const [key, filePath] of Object.entries({
        cases: paths.cases,
        prompts: paths.prompts,
        promptInputs: paths.promptInputs,
        transportTrace: paths.transportTrace,
        stageTrace: paths.stageTrace,
        metrics: paths.metrics,
        failures: paths.failures,
        report: paths.report,
        ...(manifest.artifactHashes?.bundle ? { bundle: paths.bundle } : {}),
    })) {
        if (manifest.artifactHashes?.[key] !== await sha256File(filePath)) {
            throw new Error(`Gold capture artifact hash 不匹配: ${key}`);
        }
    }
    if (manifest.artifactHashes?.codeArchive !== await sha256Directory(paths.code)) {
        throw new Error('Gold capture artifact hash 不匹配: codeArchive');
    }
    if (manifest.artifactHashes?.boundarySnapshots
        && manifest.artifactHashes.boundarySnapshots !== await sha256Directory(paths.boundarySnapshots)) {
        throw new Error('Gold capture artifact hash 不匹配: boundarySnapshots');
    }
    if (manifest.artifactHashes?.recovery
        && manifest.artifactHashes.recovery !== await sha256Directory(paths.recovery)) {
        throw new Error('Gold capture artifact hash 不匹配: recovery');
    }
    if (manifest.artifactHashes?.bundle
        && manifest.code?.bundleHash !== manifest.artifactHashes.bundle) {
        throw new Error('Gold capture manifest bundleHash 与归档 bundle 不一致');
    }
    return {
        runDir: toPosix(runDir),
        paths,
        manifest,
        cases,
        prompts,
        promptInputs,
        transportTrace,
        stageTraces,
    };
}

export function assertSyntheticProbeCapture(source) {
    if (source?.manifest?.mode !== 'story-summary-replay-synthetic-probe-capture') {
        throw new Error(`Gold capture 不是 synthetic probe capture: ${source?.manifest?.mode || 'unknown'}`);
    }
}

export function assertReaderSourceCapture(source) {
    const mode = source?.manifest?.mode;
    if (mode === 'story-summary-replay-synthetic-probe-capture') return;
    if (mode !== 'gold-prompt-only-paired') {
        throw new Error(`reader source 类型无效: ${mode || 'unknown'}`);
    }
    if (!source?.manifest?.sourceCapture?.runId || !source?.manifest?.sourceCapture?.runDir) {
        throw new Error('prompt-only reader source 缺少 production source provenance');
    }
    if (source?.manifest?.progress?.productionExternalCalls !== 0
        || source?.manifest?.progress?.productionTransportRequests !== 0) {
        throw new Error('prompt-only reader source 必须是零 production network');
    }
    if (source?.manifest?.paired?.totalPrompts !== source.cases.length) {
        throw new Error('prompt-only reader source paired case 数不完整');
    }
    for (const prompt of source.prompts || []) {
        if (!/^[a-f0-9]{64}$/.test(String(prompt?.sourcePromptHash || ''))) {
            throw new Error(`prompt-only reader source 缺少 sourcePromptHash: ${prompt?.caseId || 'unknown'}`);
        }
    }
}

export function assertGoldCaptureInputs(source, {
    sampleHash = null,
    snapshotHash = null,
    cases = null,
} = {}) {
    if (sampleHash && source?.manifest?.data?.sampleHash !== sampleHash) {
        throw new Error('Gold capture 与当前 sample hash 不一致');
    }
    if (snapshotHash && source?.manifest?.data?.snapshotHash !== snapshotHash) {
        throw new Error('Gold capture 与当前 snapshot hash 不一致');
    }
    if (cases) {
        const sourceCases = Array.isArray(source?.cases) ? source.cases : [];
        const sourceById = new Map(sourceCases.map(goldCase => [goldCase?.id, goldCase]));
        const seen = new Set();
        for (const goldCase of cases) {
            const caseId = String(goldCase?.id || '');
            if (!caseId || seen.has(caseId)) {
                throw new Error('当前执行 cases 含空或重复 id');
            }
            seen.add(caseId);
            const sourceCase = sourceById.get(caseId);
            if (!sourceCase || sha256JsonlRows([sourceCase]) !== sha256JsonlRows([goldCase])) {
                throw new Error(`Gold capture 不包含一致的 case: ${caseId || 'unknown'}`);
            }
        }
    }
}
