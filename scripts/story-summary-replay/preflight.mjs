import fs from 'node:fs/promises';
import { parseReplaySample } from './sample.mjs';
import { applyReplayConfig } from './config.mjs';
import { verifyPreparedInputs, verifyPreparedApiIdentity } from './prepared-config.mjs';
import { validateSummaryRequestOverride } from './summary-request.mjs';
import { loadResponseArchive } from './response-archive.mjs';
import { prepareNaturalCapturePlan } from '../gold-eval/natural-replay-session.mjs';
import { getAutoSummaryPlan } from '../../modules/story-summary/generate/summary-trigger.js';

// Estimate only input-determined work. Generated atoms/events and provider retries
// are unknown until the authorized run and must not be presented as exact counts.
export function describeNaturalWorkload({ messages, cases, trigger, chunkMessage, summarySlice, setHistory }) {
    const lastQueryFloor = Math.max(...cases.map(item => item.atFloor));
    let lastSummary = -1;
    let lastIndexed = -1;
    let userTurns = 0;
    let aiTurns = 0;
    let chunks = 0;
    let chunkBatches = 0;
    const summaryBatches = [];
    for (let floor = 0; floor <= lastQueryFloor; floor++) {
        const message = messages[floor];
        const visible = messages.slice(0, message.is_user ? floor : floor + 1);
        setHistory(visible);
        if (message.is_user) userTurns++;
        else {
            aiTurns++;
            let newChunks = 0;
            for (let i = lastIndexed + 1; i <= floor; i++) newChunks += chunkMessage(i, messages[i]).length;
            chunks += newChunks;
            // The current product incremental builder dispatches 20 chunks per batch.
            chunkBatches += Math.ceil(newChunks / 20);
            lastIndexed = floor;
        }
        const reason = message.is_user ? 'before_user' : 'after_ai';
        const plan = getAutoSummaryPlan(visible, lastSummary, trigger, reason);
        if (plan.triggered) {
            const slice = summarySlice(plan.target, lastSummary, trigger.maxPerRun, trigger.delayFloors);
            if (slice.count) {
                summaryBatches.push({ atFloor: floor, start: lastSummary + 1, end: slice.endMesId, count: slice.count });
                lastSummary = slice.endMesId;
            }
        }
    }
    return { lastQueryFloor, userTurns, aiTurns, chunks, chunkBatches, summaryBatches,
        queryFloors: cases.map(item => item.atFloor) };
}

export async function preflightNaturalReplay({ rootDir, config, modules, setHistory }) {
    validateSummaryRequestOverride(config.evaluationSummaryRequest);
    if (config.mode !== 'natural-capture') throw new Error('Prepared preflight only supports natural-capture');
    await verifyPreparedInputs(config);
    const archive = await loadResponseArchive(config.responseArchive);
    const applied = applyReplayConfig(config, modules);
    verifyPreparedApiIdentity(config, applied.config);
    if (!applied.panel.vector.enabled) throw new Error('This baseline requires vector retrieval');
    const sample = parseReplaySample(await fs.readFile(config.samplePath, 'utf8'), config);
    const plan = await prepareNaturalCapturePlan({ rootDir, config: applied.config, sample });
    const workload = describeNaturalWorkload({ messages: sample.messages, cases: plan.cases,
        trigger: applied.panel.trigger, chunkMessage: modules.chunkMessage,
        summarySlice: modules.buildIncrementalSlice, setHistory });
    return {
        job: config.preparedJobId,
        inputBindingsValid: true,
        sampleMessages: sample.messages.length,
        selectedCases: plan.cases.length,
        sampleSha256: config.prepared.sampleSha256,
        casesSha256: plan.casesHash,
        effectivePanel: applied.config.effectivePanel,
        evaluationSummaryRequest: config.evaluationSummaryRequest || null,
        responseArchive: archive.stats,
        workload,
        requestBudget: {
            recovery: config.requestRecovery || null,
            summaryNominal: workload.summaryBatches.length,
            l0NominalUpper: workload.aiTurns,
            l1EmbeddingNominal: workload.chunkBatches,
            outputDependent: ['L0 atom embeddings', 'L2 event embeddings', 'recall embedding/rerank batches', 'retries'],
            hardMaxRequests: config.prepared.maxRequests,
        },
        credentialsChecked: false,
        networkCalls: 0,
        qualityMeasured: false,
    };
}
