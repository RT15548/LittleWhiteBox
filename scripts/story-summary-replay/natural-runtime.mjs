// Natural replay adapter: reproduce the plugin's incremental history behavior
// without changing production code or treating a retryable L0 floor as final.

import { withExternalCallTrace } from '../gold-eval/lib/transport-cassette.mjs';

export function throwNaturalStageFailure(stage, caseId, message, external = null) {
    const error = new Error(message);
    error.goldFailure = {
        stage,
        kind: 'natural-preparation-failure',
        status: null,
        caseId: caseId || null,
        message,
    };
    if (external) {
        error.externalTrace = external.trace || [];
        error.externalCalls = external.calls || 0;
        error.externalRequests = external.requestCount || 0;
    }
    throw error;
}

export function mergeCountedExternal(...items) {
    return {
        externalCalls: items.reduce((sum, item) => sum + Number(item?.calls || 0), 0),
        externalRequests: items.reduce((sum, item) => sum + Number(item?.requestCount || 0), 0),
        transportTrace: items.flatMap(item => item?.trace || []),
    };
}

export async function maintainNaturalHistoryAfterAi({
    modules,
    chatId,
    panelConfig,
    floor,
    visibleMessages,
    nextCaseId,
}) {
    let countedChunks;
    try {
        countedChunks = await withExternalCallTrace(() => modules.buildIncrementalChunks({
            vectorConfig: panelConfig.vector,
        }));
    } catch (error) {
        error.goldFailure = error.goldFailure || {
            stage: 'l1-index',
            kind: 'request',
            status: null,
            caseId: nextCaseId || null,
            message: String(error?.message || error),
        };
        throw error;
    }

    let countedL0;
    try {
        countedL0 = await withExternalCallTrace(() => modules.incrementalExtractAtoms(
            chatId,
            visibleMessages,
            null,
            { maxFloors: 20, preferredFloors: [floor] },
        ));
    } catch (error) {
        error.goldFailure = error.goldFailure || {
            stage: 'l0-index',
            kind: 'request',
            status: null,
            caseId: nextCaseId || null,
            message: String(error?.message || error),
        };
        throw error;
    }

    const meta = await modules.getMeta(chatId);
    if (Number(meta?.lastChunkFloor ?? -1) < floor) {
        throwNaturalStageFailure('l1-index', nextCaseId, `L1 boundary 未推进到 floor ${floor}`);
    }
    const floorStatus = modules.getL0FloorStatus(floor);
    const status = String(floorStatus?.status || 'missing');
    if (!['ok', 'empty', 'fail'].includes(status)) {
        throwNaturalStageFailure(
            'l0-index',
            nextCaseId,
            `L0 floor ${floor} 状态无效: ${status}`,
            countedL0,
        );
    }
    if (status === 'ok') {
        const atoms = modules.getStateAtoms().filter(atom => Number(atom?.floor) === floor);
        const vectors = await modules.getAllStateVectors(chatId);
        const vectorIds = new Set(vectors.map(item => item?.atomId).filter(Boolean));
        const missing = atoms.filter(atom => !vectorIds.has(atom?.atomId));
        if (!atoms.length || missing.length) {
            throwNaturalStageFailure(
                'l0-embedding',
                nextCaseId,
                `L0 floor ${floor} atom/vector 不完整: atoms=${atoms.length} missing=${missing.length}`,
                countedL0,
            );
        }
    }
    if (countedChunks.value?.built > 0 || countedL0.value?.built > 0) {
        modules.invalidateLexicalIndex();
    }

    return {
        floor,
        ...mergeCountedExternal(countedChunks, countedL0),
        allowUnrecoveredTransient: status === 'fail',
        result: {
            l1Built: countedChunks.value?.built || 0,
            l0Built: countedL0.value?.built || 0,
            l0Status: status,
            l0Reason: floorStatus?.reason || null,
            l0Attempts: Number(floorStatus?.attempts || 0),
            l0PendingRetry: status === 'fail',
        },
    };
}

export async function assertNaturalHistoryHealthy({
    modules,
    chatId,
    floor,
    visibleMessages,
    nextCaseId,
}) {
    const aiFloors = [];
    for (let index = 0; index < visibleMessages.length; index++) {
        if (!visibleMessages[index]?.is_user) aiFloors.push(index);
    }
    const latestAiFloor = aiFloors.at(-1) ?? -1;
    const meta = await modules.getMeta(chatId);
    if (latestAiFloor >= 0 && Number(meta?.lastChunkFloor ?? -1) < latestAiFloor) {
        throwNaturalStageFailure(
            'l1-index',
            nextCaseId,
            `query floor ${floor} 前 L1 boundary=${meta?.lastChunkFloor ?? 'missing'}，应至少到 ${latestAiFloor}`,
        );
    }

    const statuses = aiFloors.map(aiFloor => ({
        floor: aiFloor,
        record: modules.getL0FloorStatus(aiFloor),
    }));
    const unresolved = statuses.filter(({ record }) => !['ok', 'empty'].includes(String(record?.status || '')));
    if (unresolved.length) {
        const detail = unresolved.slice(0, 12).map(({ floor: aiFloor, record }) => (
            `${aiFloor}:${record?.status || 'missing'}${record?.reason ? `(${record.reason})` : ''}`
        )).join(', ');
        throwNaturalStageFailure(
            'l0-index',
            nextCaseId,
            `query floor ${floor} 前仍有未恢复 L0: ${detail}`,
        );
    }

    const okFloors = new Set(statuses
        .filter(({ record }) => record?.status === 'ok')
        .map(item => item.floor));
    const atoms = modules.getStateAtoms().filter(atom => okFloors.has(Number(atom?.floor)));
    const atomsByFloor = new Map();
    for (const atom of atoms) {
        const atomFloor = Number(atom?.floor);
        if (!atomsByFloor.has(atomFloor)) atomsByFloor.set(atomFloor, []);
        atomsByFloor.get(atomFloor).push(atom);
    }
    const vectors = await modules.getAllStateVectors(chatId);
    const vectorIds = new Set(vectors.map(item => item?.atomId).filter(Boolean));
    const incomplete = [...okFloors].flatMap(aiFloor => {
        const floorAtoms = atomsByFloor.get(aiFloor) || [];
        const missing = floorAtoms.filter(atom => !vectorIds.has(atom?.atomId));
        return !floorAtoms.length || missing.length
            ? [{ floor: aiFloor, atoms: floorAtoms.length, missing: missing.length }]
            : [];
    });
    if (incomplete.length) {
        const detail = incomplete.slice(0, 12)
            .map(item => `${item.floor}:atoms=${item.atoms}/missing=${item.missing}`)
            .join(', ');
        throwNaturalStageFailure(
            'l0-embedding',
            nextCaseId,
            `query floor ${floor} 前 L0 atom/vector 不完整: ${detail}`,
        );
    }

    return {
        floor,
        externalCalls: 0,
        externalRequests: 0,
        transportTrace: [],
        result: {
            latestAiFloor,
            aiFloors: aiFloors.length,
            l0Ok: okFloors.size,
            l0Empty: statuses.length - okFloors.size,
        },
    };
}
