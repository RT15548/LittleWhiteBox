/* global process */

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';

import { build } from 'esbuild';
import { resolveCapturePath, runGoldReaderOnly } from './gold-eval/reader-session.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(rootDir, 'scripts', 'story-summary-replay.local.json');
const cacheDir = path.join(rootDir, 'scripts', '.story-summary-replay-cache');
const bundlePath = path.join(cacheDir, 'story-summary-replay.bundle.mjs');
const execFileAsync = promisify(execFile);

function sha256(bytes) {
    return createHash('sha256').update(bytes).digest('hex');
}

async function hashProductionStorySummarySource() {
    const sourceRoot = path.join(rootDir, 'modules', 'story-summary');
    const files = [];
    const visit = async (directory) => {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory() && entry.name === 'tests') continue;
            const target = path.join(directory, entry.name);
            if (entry.isDirectory()) await visit(target);
            else if (entry.isFile()) files.push(target);
        }
    };
    await visit(sourceRoot);
    files.sort((left, right) => left.localeCompare(right));
    const hash = createHash('sha256');
    for (const filePath of files) {
        const relative = path.relative(rootDir, filePath).replace(/\\/g, '/');
        hash.update(relative, 'utf8');
        hash.update('\0');
        hash.update(await fs.readFile(filePath));
        hash.update('\0');
    }
    return { hash: hash.digest('hex'), files: files.length };
}

async function readCodeState() {
    try {
        const runnerPath = fileURLToPath(import.meta.url);
        const packageJsonPath = path.join(rootDir, 'package.json');
        const packageLockPath = path.join(rootDir, 'package-lock.json');
        const [{ stdout: commit }, { stdout: status }, bundleBytes, runnerBytes, packageLockBytes] = await Promise.all([
            execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: rootDir }),
            execFileAsync('git', ['status', '--porcelain'], { cwd: rootDir }),
            fs.readFile(bundlePath),
            fs.readFile(runnerPath),
            fs.readFile(packageLockPath),
        ]);
        const productionSource = await hashProductionStorySummarySource();
        return {
            complete: true,
            commit: commit.trim(),
            dirty: status.trim().length > 0,
            bundlePath,
            bundleHash: sha256(bundleBytes),
            bundleBytes: bundleBytes.length,
            runnerHash: sha256(runnerBytes),
            worktreeStatusHash: sha256(status),
            packageLockHash: sha256(packageLockBytes),
            productionSourceHash: productionSource.hash,
            productionSourceFiles: productionSource.files,
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            codeArtifacts: [
                { source: runnerPath, destination: 'story-summary-replay-runner.mjs' },
                { source: path.join(rootDir, 'scripts', 'gold-eval'), destination: 'gold-eval' },
                { source: path.join(rootDir, 'scripts', 'story-summary-replay', 'api-client.mjs'), destination: 'story-summary-replay/api-client.mjs' },
                { source: packageJsonPath, destination: 'package.json' },
                { source: packageLockPath, destination: 'package-lock.json' },
            ],
        };
    } catch (error) {
        return {
            complete: false,
            commit: 'unknown',
            dirty: true,
            bundlePath,
            error: String(error?.message || error),
        };
    }
}

async function readLocalConfig() {
    try {
        const raw = await fs.readFile(configPath, 'utf8');
        return JSON.parse(raw);
    } catch (error) {
        if (error?.code === 'ENOENT') {
            const examplePath = path.join(rootDir, 'scripts', 'story-summary-replay.config.example.json');
            throw new Error(
                `缺少本地配置文件: ${configPath}\n` +
                `请先复制 ${examplePath} 为 story-summary-replay.local.json，并填入样本路径与 API。`
            );
        }
        throw error;
    }
}

function runtimeAliasPlugin() {
    const replayDir = path.join(rootDir, 'scripts', 'story-summary-replay');
    const shimExtensions = path.join(replayDir, 'shims', 'extensions.js');
    const shimOpenAi = path.join(replayDir, 'shims', 'openai.js');
    const shimHostChatCompletions = path.join(replayDir, 'shims', 'host-chat-completions-client.js');
    const shimScript = path.join(replayDir, 'shims', 'script.js');
    const shimUtils = path.join(replayDir, 'shims', 'utils.js');

    return {
        name: 'story-summary-replay-alias',
        setup(buildApi) {
            buildApi.onResolve({ filter: /extensions\.js$/ }, (args) => {
                if (!args.importer) return null;
                return { path: shimExtensions };
            });

            buildApi.onResolve({ filter: /script\.js$/ }, (args) => {
                if (!args.importer) return null;
                return { path: shimScript };
            });

            buildApi.onResolve({ filter: /openai\.js$/ }, (args) => {
                if (!args.importer.endsWith(`${path.sep}modules${path.sep}story-summary${path.sep}generate${path.sep}llm.js`)) {
                    return null;
                }
                return { path: shimOpenAi };
            });

            buildApi.onResolve({ filter: /host-llm[\\/]chat-completions[\\/]client\.js$/ }, (args) => {
                if (!args.importer.endsWith(`${path.sep}modules${path.sep}story-summary${path.sep}generate${path.sep}llm.js`)) {
                    return null;
                }
                return { path: shimHostChatCompletions };
            });

            buildApi.onResolve({ filter: /utils\.js$/ }, (args) => {
                if (!args.importer.includes(`${path.sep}core${path.sep}server-storage.js`)) {
                    return null;
                }
                return { path: shimUtils };
            });
        },
    };
}

async function buildBundle() {
    await fs.mkdir(cacheDir, { recursive: true });

    await build({
        entryPoints: [path.join(rootDir, 'scripts', 'story-summary-replay', 'entry.mjs')],
        bundle: true,
        format: 'esm',
        platform: 'node',
        external: ['@google/genai'],
        outfile: bundlePath,
        sourcemap: 'inline',
        plugins: [runtimeAliasPlugin()],
    });
}

function parseCliMode(argv) {
    const rawMode = argv.find((arg) => !arg.startsWith('--'))
        || argv.find((arg) => arg.startsWith('--mode='))?.split('=')[1]
        || null;
    if (!rawMode) return null;

    const mode = String(rawMode).trim().toLowerCase();
    if (['full', 'bootstrap', 'recall', 'recall-only', 'recall-cassette', 'reader-only', 'prompt-only', 'natural-capture', 'natural-resume', 'natural-recall', 'event-rerank-gate'].includes(mode)) {
        return mode === 'recall' ? 'recall-only' : mode;
    }
    throw new Error(`不支持的模式: ${rawMode}。可用模式: full | bootstrap | recall-only | recall-cassette | reader-only | prompt-only | natural-capture | natural-resume | natural-recall | event-rerank-gate`);
}

function readFlag(argv, name) {
    const prefix = `--${name}=`;
    const value = argv.find(arg => arg.startsWith(prefix));
    return value ? value.slice(prefix.length) : null;
}

function applyCliOverrides(config, argv) {
    const samplePath = readFlag(argv, 'sample');
    const snapshotPath = readFlag(argv, 'snapshot');
    const outputPath = readFlag(argv, 'output');
    const summaryProvider = readFlag(argv, 'summary-api-provider');
    const summaryUrl = readFlag(argv, 'summary-api-url');
    const summaryModel = readFlag(argv, 'summary-api-model');
    const summaryKeyEnv = readFlag(argv, 'summary-api-key-env');
    const summaryReasoningEffort = readFlag(argv, 'summary-api-reasoning-effort');
    const summaryMaxTokens = readFlag(argv, 'summary-api-max-tokens');
    const summaryPrefillMode = readFlag(argv, 'summary-api-prefill-mode');
    const eventRerankEnabled = readFlag(argv, 'event-rerank');
    const maxFloors = readFlag(argv, 'max-floors');
    const casesPath = readFlag(argv, 'gold-cases');
    const runsRoot = readFlag(argv, 'gold-runs-root');
    const split = readFlag(argv, 'gold-split');
    const runName = readFlag(argv, 'gold-run-name');
    const goldCaptureRun = readFlag(argv, 'gold-capture-run');
    const goldLimit = readFlag(argv, 'gold-limit');
    const goldCaseId = readFlag(argv, 'gold-case-id');
    const goldCaseIntervalMinMs = readFlag(argv, 'gold-case-interval-min-ms');
    const goldCaseIntervalMaxMs = readFlag(argv, 'gold-case-interval-max-ms');
    const goldMinEvidenceDistanceFloors = readFlag(argv, 'gold-min-evidence-distance-floors');
    const expectedProductionSourceHash = readFlag(argv, 'gold-production-source-hash');
    const resumeUnarchivedAttempts = readFlag(argv, 'gold-resume-unarchived-attempts');
    const resumeMisattributedAttempts = readFlag(argv, 'gold-resume-misattributed-attempts');
    const readerEnabled = readFlag(argv, 'gold-reader');
    const readerMaxTokens = readFlag(argv, 'gold-reader-max-tokens');
    const readerReasoningEffort = readFlag(argv, 'gold-reader-reasoning-effort');
    const readerMaxAttempts = readFlag(argv, 'gold-reader-max-attempts');
    const readerRetryDelayMs = readFlag(argv, 'gold-reader-retry-delay-ms');
    const readerConcurrency = readFlag(argv, 'gold-reader-concurrency');
    const readerResumeRun = readFlag(argv, 'gold-reader-resume-run');

    if (samplePath) config.samplePath = samplePath;
    if (snapshotPath) config.snapshotPath = snapshotPath;
    if (outputPath) config.outputPath = outputPath;
    if (summaryProvider || summaryUrl || summaryModel || summaryKeyEnv || summaryReasoningEffort || summaryMaxTokens || summaryPrefillMode) {
        const environmentKey = summaryKeyEnv ? String(process.env[summaryKeyEnv] || '') : '';
        if (summaryKeyEnv && !environmentKey) throw new Error(`环境变量 ${summaryKeyEnv} 不存在或为空`);
        const parsedMaxTokens = summaryMaxTokens == null ? null : Number(summaryMaxTokens);
        if (summaryMaxTokens != null && (!Number.isInteger(parsedMaxTokens) || parsedMaxTokens < 1)) {
            throw new Error('--summary-api-max-tokens 必须是正整数');
        }
        config.summaryApi = {
            ...(config.summaryApi || {}),
            ...(summaryProvider ? { provider: summaryProvider } : {}),
            ...(summaryUrl ? { url: summaryUrl } : {}),
            ...(summaryModel ? { model: summaryModel } : {}),
            ...(summaryKeyEnv ? { key: environmentKey, keyEnv: summaryKeyEnv } : {}),
            ...(summaryReasoningEffort ? { reasoningEffort: summaryReasoningEffort } : {}),
            ...(parsedMaxTokens ? { maxTokens: parsedMaxTokens } : {}),
            ...(summaryPrefillMode ? { prefillMode: summaryPrefillMode } : {}),
        };
    }
    if (eventRerankEnabled != null) {
        const normalized = String(eventRerankEnabled).trim().toLowerCase();
        if (!['0', '1', 'false', 'true', 'no', 'yes', 'off', 'on'].includes(normalized)) {
            throw new Error('--event-rerank 必须是 true 或 false');
        }
        config.vectorConfig = {
            ...(config.vectorConfig || {}),
            eventRerankEnabled: ['1', 'true', 'yes', 'on'].includes(normalized),
        };
    }
    if (maxFloors != null) {
        const parsed = Number(maxFloors);
        if (!Number.isInteger(parsed) || parsed < 1) throw new Error('--max-floors 必须是正整数');
        config.maxFloors = parsed;
    }
    const parsedGoldLimit = goldLimit == null ? null : Number(goldLimit);
    if (goldLimit != null && (!Number.isInteger(parsedGoldLimit) || parsedGoldLimit < 1)) {
        throw new Error('--gold-limit 必须是正整数');
    }
    const parsedGoldCaseIntervalMinMs = goldCaseIntervalMinMs == null ? null : Number(goldCaseIntervalMinMs);
    const parsedGoldCaseIntervalMaxMs = goldCaseIntervalMaxMs == null ? null : Number(goldCaseIntervalMaxMs);
    const parsedGoldMinEvidenceDistanceFloors = goldMinEvidenceDistanceFloors == null
        ? null
        : Number(goldMinEvidenceDistanceFloors);
    if (goldCaseIntervalMinMs != null
        && (!Number.isInteger(parsedGoldCaseIntervalMinMs) || parsedGoldCaseIntervalMinMs < 1)) {
        throw new Error('--gold-case-interval-min-ms 必须是正整数');
    }
    if (goldCaseIntervalMaxMs != null
        && (!Number.isInteger(parsedGoldCaseIntervalMaxMs) || parsedGoldCaseIntervalMaxMs < 1)) {
        throw new Error('--gold-case-interval-max-ms 必须是正整数');
    }
    if (goldMinEvidenceDistanceFloors != null
        && (!Number.isInteger(parsedGoldMinEvidenceDistanceFloors) || parsedGoldMinEvidenceDistanceFloors < 1)) {
        throw new Error('--gold-min-evidence-distance-floors 必须是正整数');
    }
    const parsedReaderMaxAttempts = readerMaxAttempts == null ? null : Number(readerMaxAttempts);
    const parsedReaderRetryDelayMs = readerRetryDelayMs == null ? null : Number(readerRetryDelayMs);
    const parsedReaderConcurrency = readerConcurrency == null ? null : Number(readerConcurrency);
    const parsedResumeUnarchivedAttempts = resumeUnarchivedAttempts == null
        ? null
        : Number(resumeUnarchivedAttempts);
    const parsedResumeMisattributedAttempts = resumeMisattributedAttempts == null
        ? null
        : Number(resumeMisattributedAttempts);
    if (resumeUnarchivedAttempts != null
        && (!Number.isInteger(parsedResumeUnarchivedAttempts) || parsedResumeUnarchivedAttempts < 0)) {
        throw new Error('--gold-resume-unarchived-attempts 必须是非负整数');
    }
    if (resumeMisattributedAttempts != null
        && (!Number.isInteger(parsedResumeMisattributedAttempts) || parsedResumeMisattributedAttempts < 0)) {
        throw new Error('--gold-resume-misattributed-attempts 必须是非负整数');
    }
    if (readerMaxAttempts != null
        && (!Number.isInteger(parsedReaderMaxAttempts) || parsedReaderMaxAttempts < 1)) {
        throw new Error('--gold-reader-max-attempts 必须是正整数');
    }
    if (readerRetryDelayMs != null
        && (!Number.isInteger(parsedReaderRetryDelayMs) || parsedReaderRetryDelayMs < 0)) {
        throw new Error('--gold-reader-retry-delay-ms 必须是非负整数');
    }
    if (readerConcurrency != null
        && (!Number.isInteger(parsedReaderConcurrency) || parsedReaderConcurrency < 1 || parsedReaderConcurrency > 8)) {
        throw new Error('--gold-reader-concurrency 必须是 1–8 的整数');
    }
    const effectiveGoldCaseIntervalMinMs = parsedGoldCaseIntervalMinMs
        ?? config.goldEval?.caseIntervalMinMs
        ?? 12000;
    const effectiveGoldCaseIntervalMaxMs = parsedGoldCaseIntervalMaxMs
        ?? config.goldEval?.caseIntervalMaxMs
        ?? 15000;
    if (effectiveGoldCaseIntervalMaxMs < effectiveGoldCaseIntervalMinMs) {
        throw new Error('--gold-case-interval-max-ms 必须大于等于 --gold-case-interval-min-ms');
    }
    if (casesPath || runsRoot || split || runName || goldCaptureRun || goldLimit != null || goldCaseId
        || goldCaseIntervalMinMs != null || goldCaseIntervalMaxMs != null || goldMinEvidenceDistanceFloors != null
        || expectedProductionSourceHash || resumeUnarchivedAttempts != null || resumeMisattributedAttempts != null
        || readerEnabled != null || readerMaxTokens || readerReasoningEffort
        || readerMaxAttempts != null || readerRetryDelayMs != null || readerConcurrency != null || readerResumeRun) {
        const parsedReaderEnabled = readerEnabled == null
            ? null
            : ['1', 'true', 'yes', 'on'].includes(String(readerEnabled).trim().toLowerCase());
        const parsedReaderMaxTokens = readerMaxTokens == null ? null : Number(readerMaxTokens);
        if (readerMaxTokens != null && (!Number.isInteger(parsedReaderMaxTokens) || parsedReaderMaxTokens < 1)) {
            throw new Error('--gold-reader-max-tokens 必须是正整数');
        }
        config.goldEval = {
            ...(config.goldEval || {}),
            enabled: true,
            ...(casesPath ? { casesPath } : {}),
            ...(runsRoot ? { runsRoot } : {}),
            ...(split ? { split } : {}),
            ...(runName ? { runName } : {}),
            ...(goldCaptureRun ? { captureRunDir: goldCaptureRun } : {}),
            ...(parsedGoldLimit ? { limit: parsedGoldLimit } : {}),
            ...(goldCaseId ? {
                caseIds: String(goldCaseId).split(',').map(value => value.trim()).filter(Boolean),
            } : {}),
            ...(parsedGoldCaseIntervalMinMs ? { caseIntervalMinMs: parsedGoldCaseIntervalMinMs } : {}),
            ...(parsedGoldCaseIntervalMaxMs ? { caseIntervalMaxMs: parsedGoldCaseIntervalMaxMs } : {}),
            ...(parsedGoldMinEvidenceDistanceFloors ? { minEvidenceDistanceFloors: parsedGoldMinEvidenceDistanceFloors } : {}),
            ...(expectedProductionSourceHash ? { expectedProductionSourceHash } : {}),
            ...(parsedResumeUnarchivedAttempts != null
                ? { resumeUnarchivedTerminalAttempts: parsedResumeUnarchivedAttempts }
                : {}),
            ...(parsedResumeMisattributedAttempts != null
                ? { resumeMisattributedAttempts: parsedResumeMisattributedAttempts }
                : {}),
            reader: {
                ...(config.goldEval?.reader || {}),
                ...(parsedReaderEnabled != null ? { enabled: parsedReaderEnabled } : {}),
                ...(parsedReaderMaxTokens ? { maxTokens: parsedReaderMaxTokens } : {}),
                ...(readerReasoningEffort ? { reasoningEffort: readerReasoningEffort } : {}),
                ...(parsedReaderMaxAttempts != null ? { maxAttempts: parsedReaderMaxAttempts } : {}),
                ...(parsedReaderRetryDelayMs != null ? { retryDelayMs: parsedReaderRetryDelayMs } : {}),
                ...(parsedReaderConcurrency != null ? { concurrency: parsedReaderConcurrency } : {}),
                ...(readerResumeRun ? { resumeRunDir: readerResumeRun } : {}),
            },
        };
    }
}

async function main() {
    if (process.argv.includes('--check-cancel')) {
        await buildBundle();
        const bundleUrl = `${pathToFileURL(bundlePath).href}?t=${Date.now()}`;
        // eslint-disable-next-line no-unsanitized/method -- URL points to the bundle path created above.
        const replayModule = await import(bundleUrl);
        const result = await replayModule.runStorySummaryCancellationCheck();
        if (!result.cancelled || !result.cancelledSessions.includes('summary-cancel-check')) {
            throw new Error(`总结取消检查失败: ${JSON.stringify(result)}`);
        }
        const postCommit = await replayModule.runStorySummaryPostCommitCancellationCheck();
        if (
            !postCommit.onCompleteCalled
            || !postCommit.result?.cancelled
            || !postCommit.result?.committed
            || postCommit.result?.success !== true
            || postCommit.immediateMetadataSaveCalls !== 1
            || postCommit.debouncedMetadataSaveCalls !== 0
        ) {
            throw new Error(`总结提交后取消检查失败: ${JSON.stringify(postCommit)}`);
        }
        const ownership = await replayModule.runStorySummaryOwnershipCheck();
        if (
            !ownership.result?.cancelled
            || ownership.result?.committed
            || ownership.metadataSaveCalls !== 0
            || ownership.lastSummarizedMesId != null
        ) {
            throw new Error(`总结聊天所有权检查失败: ${JSON.stringify(ownership)}`);
        }
        const sourceMutation = await replayModule.runStorySummarySourceMutationCheck();
        if (
            !sourceMutation.result?.stale
            || sourceMutation.result?.success
            || sourceMutation.metadataSaveCalls !== 0
            || sourceMutation.lastSummarizedMesId != null
        ) {
            throw new Error(`总结源内容变更检查失败: ${JSON.stringify(sourceMutation)}`);
        }
        const rollbackIntegrity = await replayModule.runStorySummaryRollbackIntegrityCheck();
        if (
            rollbackIntegrity.firstResult?.status !== 'rolled_back'
            || rollbackIntegrity.firstBoundary !== -1
            || !rollbackIntegrity.firstPendingBoundary
            || JSON.stringify(rollbackIntegrity.firstEventIds) !== JSON.stringify(['evt-manual'])
            || rollbackIntegrity.touchedResult?.status !== 'failed'
            || rollbackIntegrity.touchedSummary !== '人工改写生成事件'
            || rollbackIntegrity.invalidResult?.status !== 'failed'
            || !rollbackIntegrity.summaryInvalid
            || rollbackIntegrity.consumableAfterRegrowth
            || !rollbackIntegrity.legacyEnaCacheRemoved
        ) {
            throw new Error(`总结回滚完整性检查失败: ${JSON.stringify(rollbackIntegrity)}`);
        }
        console.log('[story-summary-replay] cancellation check completed');
        return;
    }

    if (process.argv.includes('--build-only')) {
        await buildBundle();
        console.log('[story-summary-replay] bundle build completed');
        return;
    }

    const localConfig = await readLocalConfig();
    localConfig.__command = ['node', 'scripts/story-summary-replay-runner.mjs', ...process.argv.slice(2)].join(' ');
    applyCliOverrides(localConfig, process.argv.slice(2));
    const cliMode = parseCliMode(process.argv.slice(2));
    if (cliMode) {
        localConfig.mode = cliMode;
    }
    await buildBundle();
    localConfig.__codeState = await readCodeState();
    if (localConfig.goldEval?.enabled && !localConfig.__codeState.complete) {
        throw new Error(`Gold Eval 无法归档本次执行代码，拒绝运行: ${localConfig.__codeState.error || 'unknown'}`);
    }

    if (cliMode === 'reader-only') {
        const captureRunDir = resolveCapturePath(rootDir, localConfig.goldEval?.captureRunDir || '');
        const runsRoot = resolveCapturePath(rootDir, localConfig.goldEval?.runsRoot || '');
        const resumeRunDir = localConfig.goldEval?.reader?.resumeRunDir
            ? resolveCapturePath(rootDir, localConfig.goldEval.reader.resumeRunDir)
            : '';
        if (!localConfig.goldEval?.captureRunDir) throw new Error('reader-only 需要 --gold-capture-run');
        if (!localConfig.goldEval?.runsRoot) throw new Error('reader-only 需要 --gold-runs-root');
        const result = await runGoldReaderOnly({
            captureRunDir,
            runsRoot,
            runName: String(localConfig.goldEval?.runName || 'gold-reader-only'),
            resumeRunDir,
            config: localConfig,
        });
        console.log('[gold-reader-only] completed');
        console.log(`gold eval:   ${result.artifacts.runDir}`);
        return;
    }

    const bundleUrl = `${pathToFileURL(bundlePath).href}?t=${Date.now()}`;
    // eslint-disable-next-line no-unsanitized/method -- URL points to the bundle path created above.
    const replayModule = await import(bundleUrl);
    const result = await replayModule.runStorySummaryReplay({
        rootDir,
        config: localConfig,
        configPath,
    });

    console.log('[story-summary-replay] completed');
    console.log(`report.json: ${result.reportJsonPath}`);
    console.log(`report.md:   ${result.reportMdPath}`);
    if (result.snapshotPath) {
        console.log(`snapshot:    ${result.snapshotPath}`);
    }
    if (result.goldEval?.artifacts?.runDir) {
        console.log(`gold eval:   ${result.goldEval.artifacts.runDir}`);
    }
    if (result.baselineWritten) {
        console.log(`baseline:    ${result.baselinePath} (created)`);
    } else if (result.report?.baselineComparison?.available) {
        console.log(`baseline:    ${result.baselinePath}`);
    }
    if (result.report?.anomalies?.length) {
        console.log('anomalies:');
        for (const anomaly of result.report.anomalies) {
            console.log(`- ${anomaly}`);
        }
    }
}

main().catch((error) => {
    console.error('[story-summary-replay] failed');
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
});
