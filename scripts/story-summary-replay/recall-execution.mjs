import { performance } from 'node:perf_hooks';
import { withExternalCallTrace } from '../gold-eval/lib/transport-cassette.mjs';

function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function serializePromptRecallInput(value) {
    const { l1ByFloor, ...rest } = value;
    return { ...clone(rest), l1ByFloorEntries: [...(l1ByFloor || new Map())].map(([floor, item]) => [floor, clone(item)]) };
}

// No recall, eligibility or wrapping policy here: observe the product computation.
export async function executeRecallCase(modules, recallCase, stageObserver = null, transportCassette = null) {
    const startedAt = performance.now();
    const counted = await withExternalCallTrace(() => modules.buildVectorPromptText(!!recallCase.excludeLastAi, {
        signal: recallCase.signal || null,
        stageObserver,
        captureEvidenceTrace: true,
    }), { cassette: transportCassette });
    const result = counted.value;
    const { recallResult, meta, assembly } = result.observation;
    const normalizedRecall = recallResult || { events: [], l0Selected: [], l1ByFloor: new Map(), causalChain: [] };
    const panel = modules.getSummaryPanelConfig();
    const metrics = assembly?.metrics || normalizedRecall.metrics || null;
    const promptText = result.text;
    return {
        normalizedRecall,
        promptText,
        promptInput: {
            schemaVersion: 1,
            recallResult: serializePromptRecallInput(normalizedRecall),
            meta: clone(meta),
            skipped: !assembly,
            reason: result.diagnostics.reason,
            wrapperHead: panel.trigger.wrapperHead,
            wrapperTail: panel.trigger.wrapperTail,
        },
        evidenceTrace: assembly?.evidenceTrace || { final: [], prompt: [], eventEvidence: [] },
        recallMs: Math.round(performance.now() - startedAt),
        externalCalls: counted.calls,
        externalRequests: counted.requestCount,
        transportTrace: counted.trace,
        reportCase: {
            label: String(recallCase.label || 'recall-case'),
            excludeLastAi: !!recallCase.excludeLastAi,
            querySource: String(recallCase.querySource || 'chat-tail'),
            promptChars: promptText.length,
            externalCalls: counted.calls,
            externalRequests: counted.requestCount,
            promptPreview: promptText.replace(/\s+/g, ' ').slice(0, 300),
            diagnostics: clone(result.diagnostics),
            metrics: clone(metrics),
            injectionStats: clone(assembly?.injectionStats || null),
            resultCounts: {
                events: normalizedRecall.events.length,
                l0Selected: normalizedRecall.l0Selected.length,
                l1Floors: normalizedRecall.l1ByFloor.size,
                causalChain: normalizedRecall.causalChain.length,
                mustKeepFloors: normalizedRecall.mustKeepFloors?.length || 0,
            },
            logText: modules.formatMetricsLog(metrics || modules.createMetrics()),
        },
    };
}
