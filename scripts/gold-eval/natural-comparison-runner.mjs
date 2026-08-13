/* global process */
// CLI: compare valid natural baseline/candidate runs by conversation.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    aggregateNaturalConversationMacro,
    compareNaturalPair,
} from './lib/natural-comparison.mjs';
import { loadGoldCapture, sha256File } from './lib/run-store.mjs';

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeAtomic(filePath, value) {
    const destination = path.resolve(filePath);
    const temporary = path.join(
        path.dirname(destination),
        `.${path.basename(destination)}.${process.pid}.${Date.now()}.tmp`,
    );
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    await fs.rename(temporary, destination);
}

export async function runNaturalComparisonPlan(planPath, outputPath = null) {
    const resolvedPlanPath = path.resolve(planPath);
    const plan = await readJson(resolvedPlanPath);
    if (!Array.isArray(plan?.pairs) || !plan.pairs.length) {
        throw new Error('natural comparison plan需要非空pairs');
    }
    const comparisons = [];
    const inputs = [];
    for (const [index, item] of plan.pairs.entries()) {
        const corpusId = String(item?.corpusId || '').trim();
        const baselineRunDir = path.resolve(String(item?.baselineRunDir || ''));
        const candidateRunDir = path.resolve(String(item?.candidateRunDir || ''));
        if (!corpusId || !item?.baselineRunDir || !item?.candidateRunDir) {
            throw new Error(`pairs[${index}]缺少corpusId/baselineRunDir/candidateRunDir`);
        }
        const [baseline, candidate] = await Promise.all([
            loadGoldCapture(baselineRunDir),
            loadGoldCapture(candidateRunDir),
        ]);
        comparisons.push(compareNaturalPair({ baseline, candidate, corpusId }));
        inputs.push({
            corpusId,
            baselineRunDir: baseline.runDir,
            baselineManifestHash: await sha256File(baseline.paths.manifest),
            candidateRunDir: candidate.runDir,
            candidateManifestHash: await sha256File(candidate.paths.manifest),
        });
    }
    const macro = aggregateNaturalConversationMacro(comparisons, {
        bootstrapIterations: Number(plan.bootstrapIterations || 10000),
        bootstrapSeed: Number(plan.bootstrapSeed ?? 0x4c5742),
    });
    const result = {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        planPath: resolvedPlanPath.replace(/\\/g, '/'),
        planHash: await sha256File(resolvedPlanPath),
        inputs,
        comparisons,
        macro,
    };
    const destination = outputPath || plan.outputPath;
    if (destination) await writeAtomic(destination, result);
    return result;
}

async function main() {
    const planPath = process.argv[2];
    const outputPath = process.argv[3] || null;
    if (!planPath) {
        throw new Error('用法: natural-comparison-runner.mjs <plan.json> [output.json]');
    }
    const result = await runNaturalComparisonPlan(planPath, outputPath);
    process.stdout.write(`${JSON.stringify({
        conversations: result.macro.conversations,
        delta: result.macro.delta,
        passed: result.macro.passed,
        outputPath: outputPath || result.outputPath || null,
    }, null, 2)}\n`);
}

const isMain = process.argv[1]
    && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
    main().catch(error => {
        process.stderr.write(`${error?.stack || error}\n`);
        process.exitCode = 1;
    });
}
