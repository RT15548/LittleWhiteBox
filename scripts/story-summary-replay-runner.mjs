/* global process */

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { build } from 'esbuild';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(rootDir, 'scripts', 'story-summary-replay.local.json');
const cacheDir = path.join(rootDir, 'scripts', '.story-summary-replay-cache');
const bundlePath = path.join(cacheDir, 'story-summary-replay.bundle.mjs');

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
    if (['full', 'bootstrap', 'recall', 'recall-only'].includes(mode)) {
        return mode === 'recall' ? 'recall-only' : mode;
    }
    throw new Error(`不支持的模式: ${rawMode}。可用模式: full | bootstrap | recall-only`);
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
    const cliMode = parseCliMode(process.argv.slice(2));
    if (cliMode) {
        localConfig.mode = cliMode;
    }
    await buildBundle();

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
