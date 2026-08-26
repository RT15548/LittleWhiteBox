// Gold Eval - execute and score one natural query against an already frozen
// history boundary. Chronological capture and snapshot replay share this exact
// adapter so their observable scoring contract cannot drift.

import {
    buildEvidenceCatalog,
    createReplayObservationCollector,
    selectEvidenceCatalogForCase,
} from './replay-adapter.mjs';
import { GOLD_CAPTURE_SCHEMA_VERSION, sha256Text } from './run-store.mjs';
import { scoreCase } from './scorer.mjs';
import { assertSuccessfulExternalTrace } from './transport-cassette.mjs';
import { withProductRecallTurn } from './product-recall-turn.mjs';
import { assertGoldExternalStagesHealthy } from '../replay-session.mjs';

export function emptyNaturalPreparation() {
    return {
        externalCalls: 0,
        externalRequests: 0,
        transportTrace: [],
        steps: [],
    };
}

function queryText(goldCase) {
    return String(goldCase?.query?.text || goldCase?.queryText || '');
}

export async function executeNaturalBoundaryCase({
    modules,
    goldCase,
    visibleMessages,
    focusMessage,
    snapshotRef,
    preparation = emptyNaturalPreparation(),
    executeRecallCase,
    transportCassette = null,
    expectedCorePrompt = null,
}) {
    const store = modules.getSummaryStore();
    const chunks = await modules.getAllChunks(modules.getContext().chatId);
    const catalog = buildEvidenceCatalog({
        messages: visibleMessages,
        stateAtoms: modules.getStateAtoms(),
        chunks,
        events: store?.json?.events || [],
        facts: store?.json?.facts || [],
    });
    const expectedQuery = queryText(goldCase);
    if (String(focusMessage?.mes || '') !== expectedQuery) {
        throw new Error(`natural recall query 与真实 USER 楼层不一致: ${goldCase.id}`);
    }
    const collector = createReplayObservationCollector();
    const execution = await withProductRecallTurn({
        modules,
        historyMessages: visibleMessages,
        focusMessage,
        label: goldCase.id,
        execute: () => executeRecallCase({
            label: goldCase.id,
            querySource: 'natural-chat-floor',
            excludeLastAi: false,
        }, collector.observe, transportCassette),
    });
    try {
        assertGoldExternalStagesHealthy(execution, goldCase.id);
        assertSuccessfulExternalTrace(execution.transportTrace || [], {
            caseId: goldCase.id,
            stage: 'recall',
            allowEmpty: false,
            allowRecoveredTransient: true,
        });
        if (!execution.promptInput) throw new Error(`natural recall 缺少 Prompt 输入: ${goldCase.id}`);
        if (expectedCorePrompt) {
            const actualCoreText = String(execution.corePromptText || '');
            const actualCoreHash = sha256Text(actualCoreText);
            if (expectedCorePrompt.caseId !== goldCase.id
                || actualCoreHash !== expectedCorePrompt.promptHash
                || actualCoreText !== String(expectedCorePrompt.promptText || '')) {
                const error = new Error(`natural recall core Prompt 漂移: ${goldCase.id}`);
                error.goldFailure = {
                    stage: 'paired-core',
                    kind: 'core-prompt-mismatch',
                    status: null,
                    caseId: goldCase.id,
                    message: `expected=${expectedCorePrompt.promptHash || 'unknown'} actual=${actualCoreHash}`,
                };
                throw error;
            }
        }
    } catch (error) {
        error.naturalExecution = execution;
        throw error;
    }

    const externalCalls = Number(execution.externalCalls);
    const logicalRequests = Number(execution.externalRequests ?? execution.transportTrace?.length);
    const transportRows = execution.transportTrace || [];
    const networkRequests = transportRows.filter(row => row?.source === 'network').length;
    const cassetteRequests = transportRows.filter(row => row?.source === 'cassette' && row?.cassetteHit).length;
    const invalidLiveAccounting = !transportCassette && externalCalls !== logicalRequests;
    const invalidPairedAccounting = !!transportCassette
        && (externalCalls !== networkRequests
            || cassetteRequests !== transportCassette.sourceRequestCount);
    if (!Number.isInteger(externalCalls) || externalCalls < 0
        || !Number.isInteger(logicalRequests) || logicalRequests < 0
        || logicalRequests !== transportRows.length
        || invalidLiveAccounting
        || invalidPairedAccounting) {
        const error = new Error(`natural recall transport 计数不一致: ${goldCase.id}`);
        error.naturalExecution = execution;
        throw error;
    }

    const evidenceTextsByFloor = selectEvidenceCatalogForCase(catalog, goldCase);
    const efficiency = {
        recallMs: execution.recallMs,
        externalCalls,
        readerMs: null,
        readerCalls: 0,
        promptChars: execution.promptText.length,
    };
    const observationBase = collector.build({
        extractedFloors: catalog.extractedFloors,
        evidenceTextsByFloor,
        efficiency,
    });
    collector.observe({ stage: 'final', ranked: execution.evidenceTrace.final });
    collector.observe({ stage: 'prompt', ranked: execution.evidenceTrace.prompt });
    const observation = collector.build({
        extractedFloors: catalog.extractedFloors,
        promptFloors: execution.evidenceTrace.prompt.map(item => item.floor),
        promptText: execution.promptText,
        evidenceTextsByFloor,
        answerText: null,
        efficiency,
    });
    const scored = scoreCase({ case: goldCase, observation });
    const promptRow = {
        schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
        caseId: goldCase.id,
        promptText: execution.promptText,
        promptHash: sha256Text(execution.promptText),
        promptChars: execution.promptText.length,
        evidenceTrace: execution.evidenceTrace,
    };
    const promptInputRow = {
        schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
        caseId: goldCase.id,
        boundarySnapshot: snapshotRef,
        production: execution.promptInput,
        observationBase,
    };
    const transportRow = {
        schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
        caseId: goldCase.id,
        preparation: preparation.transportTrace || [],
        production: execution.transportTrace || [],
        reader: [],
    };
    const replayCase = {
        ...execution.reportCase,
        goldCaseId: goldCase.id,
        querySource: 'natural-chat-floor',
        queryFloor: goldCase.atFloor,
        historyThroughFloor: goldCase.historyThroughFloor,
        preparation: preparation.steps || [],
    };
    const productionExternalCalls = Number(preparation.externalCalls || 0) + externalCalls;
    const productionTransportRequests = Number(preparation.externalRequests || 0) + logicalRequests;

    return {
        execution,
        scored,
        promptRow,
        promptInputRow,
        transportRow,
        replayCase,
        productionExternalCalls,
        productionTransportRequests,
        capture: {
            schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
            caseId: goldCase.id,
            boundarySnapshot: snapshotRef,
            prompt: promptRow,
            promptInput: promptInputRow,
            transport: transportRow,
            stageTrace: scored.stageTraceRow,
            failure: scored.failureRow,
            replayCase,
        },
    };
}
