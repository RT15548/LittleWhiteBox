/* global process */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    finalizeAuthoringRun,
    getAuthoringStatus,
    prepareAuthoringRun,
    runDiscovery,
    runSupplements,
    runSynthesis,
    runVerification,
} from './authoring/session.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const defaultConfigPath = path.join(rootDir, 'scripts', 'story-summary-replay.local.json');

function parseArgs(argv) {
    const [command = 'help', ...rest] = argv;
    const flags = {};
    for (const arg of rest) {
        if (!arg.startsWith('--')) throw new Error(`无法识别参数: ${arg}`);
        const equal = arg.indexOf('=');
        const key = equal < 0 ? arg.slice(2) : arg.slice(2, equal);
        flags[key] = equal < 0 ? true : arg.slice(equal + 1);
    }
    return { command, flags };
}

function required(flags, name) {
    const value = flags[name];
    if (value == null || value === true || String(value).trim() === '') throw new Error(`缺少 --${name}=...`);
    return String(value);
}

function limitFrom(flags) {
    if (flags.limit == null) return Infinity;
    const value = Number(flags.limit);
    if (!Number.isInteger(value) || value < 1) throw new Error('--limit 必须是正整数');
    return value;
}

function apiOverrideFrom(flags) {
    return {
        provider: flags['api-provider'] ? String(flags['api-provider']) : '',
        url: flags['api-url'] ? String(flags['api-url']) : '',
        model: flags['api-model'] ? String(flags['api-model']) : '',
        keyEnv: flags['api-key-env'] ? String(flags['api-key-env']) : '',
    };
}

function print(value) {
    console.log(JSON.stringify(value, null, 2));
}

function printHelp() {
    console.log(`Gold Eval source-first authoring

prepare（零网络）:
  node scripts/gold-eval/authoring-runner.mjs prepare --sample=<jsonl> --workspace=<总结测试> --dataset=real-800 --split=dev [--run-name=real-800-dev-v1] [--api-provider=custom --api-url=<base> --api-model=<model> --api-key-env=<ENV>]

后续阶段（会调用现有 summaryApi）:
  node scripts/gold-eval/authoring-runner.mjs discover --run-dir=<authoring run> [--limit=1]
  node scripts/gold-eval/authoring-runner.mjs synthesize --run-dir=<authoring run>
  node scripts/gold-eval/authoring-runner.mjs supplement --run-dir=<authoring run> [--limit=1]
  node scripts/gold-eval/authoring-runner.mjs verify --run-dir=<authoring run> [--limit=1]

离线阶段:
  node scripts/gold-eval/authoring-runner.mjs status --run-dir=<authoring run>
  node scripts/gold-eval/authoring-runner.mjs finalize --run-dir=<authoring run>

所有 API 阶段默认读取 scripts/story-summary-replay.local.json；可用 --config=<path> 覆盖。`);
}

async function main() {
    const { command, flags } = parseArgs(process.argv.slice(2));
    const configPath = path.resolve(String(flags.config || defaultConfigPath));

    if (command === 'help' || flags.help) {
        printHelp();
        return;
    }
    if (command === 'prepare') {
        const result = await prepareAuthoringRun({
            samplePath: required(flags, 'sample'),
            workspaceRoot: required(flags, 'workspace'),
            dataset: required(flags, 'dataset'),
            split: flags.split || 'dev',
            runName: flags['run-name'],
            configPath,
            atFloor: flags['at-floor'],
            windowSize: flags['window-size'],
            overlap: flags.overlap,
            maxCandidates: flags['max-candidates'],
            maxClaims: flags['max-claims'],
            synthesisMaxCandidates: flags['synthesis-max-candidates'],
            apiOverride: apiOverrideFrom(flags),
        });
        print({ runDir: result.runDir, alreadyPrepared: result.alreadyPrepared, manifest: result.manifest });
        return;
    }

    const runDir = path.resolve(required(flags, 'run-dir'));
    if (command === 'status') print(await getAuthoringStatus(runDir));
    else if (command === 'discover') print(await runDiscovery({ runDir, configPath, limit: limitFrom(flags) }));
    else if (command === 'synthesize') print(await runSynthesis({ runDir, configPath }));
    else if (command === 'supplement') print(await runSupplements({ runDir, configPath, limit: limitFrom(flags) }));
    else if (command === 'verify') print(await runVerification({ runDir, configPath, limit: limitFrom(flags) }));
    else if (command === 'finalize') print(await finalizeAuthoringRun({ runDir }));
    else throw new Error(`未知命令: ${command}`);
}

main().catch(error => {
    console.error(`[gold-authoring] ${error?.stack || error}`);
    process.exitCode = 1;
});
