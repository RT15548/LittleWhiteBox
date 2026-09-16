import { selectRecallRuntimeL1Evidence } from '../runtime/runtime.js';

export async function selectDirectEvidence(selectedEvents, context) {
    if (!context?.runtimeLease || !context?.chatId || !selectedEvents?.length) {
        return { items: [], status: 'skipped', stats: {} };
    }
    return await selectRecallRuntimeL1Evidence(context.chatId, selectedEvents, {
        queryVector: context.queryVector,
        lexicalScores: context.lexicalScores,
        temporalCarrier: context.temporalCarrier,
        signal: context.signal,
    });
}
