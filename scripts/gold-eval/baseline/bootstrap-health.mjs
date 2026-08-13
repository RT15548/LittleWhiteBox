// Bootstrap validity gate for evaluation snapshots. Pure and network-free.

function nonNegativeInteger(value, label) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0) throw new Error(`${label} 不是非负整数`);
    return number;
}

export function assertBootstrapHealthy({
    targetFloor,
    summaryStore,
    l0Result,
    l0Stats,
    l1Result,
    l2Result,
    stateAtomsCount,
    stateVectorsCount,
    storageStats,
}) {
    const failures = [];
    const expectedFloor = nonNegativeInteger(targetFloor, 'targetFloor');
    const summarizedFloor = Number(summaryStore?.lastSummarizedMesId ?? -1);
    if (summarizedFloor !== expectedFloor) {
        failures.push(`summary boundary ${summarizedFloor}/${expectedFloor}`);
    }

    if (l0Result?.cancelled === true) failures.push('L0 cancelled');
    const pending = nonNegativeInteger(l0Stats?.pending ?? 0, 'l0Stats.pending');
    const failed = nonNegativeInteger(l0Stats?.fail ?? 0, 'l0Stats.fail');
    if (pending > 0 || failed > 0) failures.push(`L0 incomplete pending=${pending} fail=${failed}`);

    const atoms = nonNegativeInteger(stateAtomsCount, 'stateAtomsCount');
    const stateVectors = nonNegativeInteger(stateVectorsCount, 'stateVectorsCount');
    if (atoms !== stateVectors) failures.push(`L0 vector mismatch atoms=${atoms} vectors=${stateVectors}`);

    const l1Errors = nonNegativeInteger(l1Result?.errors ?? 0, 'l1Result.errors');
    if (l1Errors > 0) failures.push(`L1 embedding batches failed=${l1Errors}`);
    const chunks = nonNegativeInteger(storageStats?.chunks ?? 0, 'storageStats.chunks');
    const chunkVectors = nonNegativeInteger(storageStats?.chunkVectors ?? 0, 'storageStats.chunkVectors');
    if (chunks !== chunkVectors) failures.push(`L1 vector mismatch chunks=${chunks} vectors=${chunkVectors}`);

    const l2Built = nonNegativeInteger(l2Result?.built ?? 0, 'l2Result.built');
    const eventVectors = nonNegativeInteger(storageStats?.eventVectors ?? 0, 'storageStats.eventVectors');
    if (l2Built !== eventVectors) failures.push(`L2 vector mismatch built=${l2Built} stored=${eventVectors}`);

    if (failures.length) {
        throw new Error(`evaluation_bootstrap_invalid: ${failures.join('; ')}`);
    }
    return {
        summaryBoundary: summarizedFloor,
        l0: { atoms, vectors: stateVectors, pending, failed },
        l1: { chunks, vectors: chunkVectors, failedBatches: l1Errors },
        l2: { vectors: eventVectors },
    };
}
