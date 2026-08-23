import {
    claimPendingImageJob,
    createAdoptingPendingImageJob,
    fencePendingImageJobLease,
    getPendingImageJob,
    markPendingImageJobAdoptionReady,
    markPendingImageJobAdoptionPlacing,
    PendingJobAdoptionPhase,
    PendingJobState,
    releasePendingImageJobLease,
} from './pending-image-jobs.js';
import { deriveDrawRunChildJobId, deriveDrawRunItemIds } from './draw-run-identifiers.js';
import { DRAW_RUN_MARKER_VERSION, getDrawRunMarkerText, setDrawRunMarkerText } from './draw-run-markers.js';
import { getSceneSlotIds, insertScenePlacementsPreservingSlots, isSceneSlotAlive } from './scene-placement.js';
import { hashSceneSource, normalizeMessageSceneSourceText } from './scene-source.js';

const defaultJournal = {
    claim: claimPendingImageJob,
    create: createAdoptingPendingImageJob,
    fence: fencePendingImageJobLease,
    get: getPendingImageJob,
    markReady: markPendingImageJobAdoptionReady,
    markPlacing: markPendingImageJobAdoptionPlacing,
    release: releasePendingImageJobLease,
};

export class DrawRunAdoptionError extends Error {
    constructor(message, code = 'DRAW_RUN_ADOPTION_INVALID') {
        super(message);
        this.name = 'DrawRunAdoptionError';
        this.code = code;
    }
}

function text(value) {
    return typeof value === 'string' ? value : '';
}

function normalizeMetadata(source) {
    return {
        tags: text(source?.tags),
        positive: text(source?.positive),
        characterPrompts: source?.characterPrompts ?? null,
        negativePrompt: source?.negativePrompt ?? null,
    };
}

export function normalizeDrawRunHandoff(run, marker) {
    const runId = text(run?.id).trim();
    const provider = text(run?.provider).trim();
    const sourceHash = text(run?.sourceHash).trim();
    const manifest = run?.handoffManifest;
    if (!runId || !['dispatched', 'child_expired'].includes(run?.state)
        || !provider || !sourceHash || !manifest) {
        throw new DrawRunAdoptionError('Draw Run 尚未产生可接管的图片任务');
    }
    if (marker?.version !== DRAW_RUN_MARKER_VERSION
        || marker?.provider !== provider
        || marker?.sourceHash !== sourceHash
        || !Number.isFinite(Number(marker?.createdAt))
        || Number(marker.createdAt) <= 0) {
        throw new DrawRunAdoptionError('Draw Run 与聊天标记不属于同一次规划', 'DRAW_RUN_MARKER_MISMATCH');
    }
    const childJobId = text(manifest.childJobId).trim();
    if (childJobId !== deriveDrawRunChildJobId(runId)
        || manifest.provider !== provider
        || manifest.sourceHash !== sourceHash
        || manifest.placementContract !== 1) {
        throw new DrawRunAdoptionError('Draw Run handoff manifest 不符合当前契约');
    }
    if (!Array.isArray(manifest.items) || manifest.items.length === 0) {
        throw new DrawRunAdoptionError('Draw Run handoff manifest 没有图片项');
    }
    const items = manifest.items.map((item, index) => {
        const ids = deriveDrawRunItemIds(runId, index);
        const insertOffset = Number(item?.insertOffset);
        if (item?.index !== index || item?.slotId !== ids.slotId || item?.imgId !== ids.imgId
            || !Number.isSafeInteger(insertOffset) || insertOffset < 0) {
            throw new DrawRunAdoptionError(`Draw Run 第 ${index + 1} 项 handoff 无效`);
        }
        return {
            index,
            slotId: ids.slotId,
            imgId: ids.imgId,
            insertOffset,
            previewMetadata: normalizeMetadata(item.displayMetadata),
        };
    });
    return {
        runId,
        childJobId,
        provider,
        sourceHash,
        items,
        cancelling: Number(run.cancelRequestedAt) > 0,
    };
}

function currentTarget(resolveTarget, runId, marker) {
    const target = resolveTarget?.(runId) || null;
    if (!target || target.runId !== runId
        || target.marker?.provider !== marker.provider
        || target.marker?.sourceHash !== marker.sourceHash) return null;
    const sourceText = getDrawRunMarkerText(target);
    return typeof sourceText === 'string' ? { ...target, sourceText } : null;
}

function livingSlots(sourceText, items) {
    return items.filter(item => isSceneSlotAlive(sourceText, item.slotId)).map(item => item.slotId);
}

async function acquireRecord({ handoff, marker, resolveTarget, chatTarget, journal, now }) {
    let record = await journal.get(handoff.childJobId);
    if (record) {
        if (record.originRunId !== handoff.runId || record.provider !== handoff.provider) {
            throw new DrawRunAdoptionError('图片任务已被另一条恢复记录占用', 'DRAW_RUN_CHILD_CONFLICT');
        }
        if (record.state !== PendingJobState.ADOPTING) return { record, owned: false };
        if (record.leaseExpiresAt > now()) return { record, owned: false };
        record = await journal.claim(record.jobId, { now: now() });
        return { record, owned: Boolean(record) };
    }

    const target = currentTarget(resolveTarget, handoff.runId, marker);
    if (!target) return { record: null, owned: false };
    const manifestSlots = new Set(handoff.items.map(item => item.slotId));
    record = await journal.create({
        jobId: handoff.childJobId,
        provider: handoff.provider,
        originRunId: handoff.runId,
        chatTarget,
        sourceHash: handoff.sourceHash,
        cancelRequested: handoff.cancelling,
        delivery: {
            mode: 'slots',
            chatId: String(target.chatId || ''),
            messageId: String(target.messageId),
            swipeIndex: target.swipeIndex,
        },
        replacedSlotIds: getSceneSlotIds(target.sourceText).filter(slotId => !manifestSlots.has(slotId)),
        gallery: {
            chatId: String(target.chatId || ''),
            messageId: String(target.messageId),
            characterName: String(target.message?.name || ''),
        },
        items: handoff.items,
    });
    return { record, owned: Boolean(record) };
}

// Draw Run 唯一的 child adoption 入口。它只负责把服务端 handoff 变成第一刀当前 journal；
// marker 清理、Draw Run ACK 与 child attach 由外层恢复协调器按各自生命周期处理。
export async function adoptExistingJobFromDrawRun({
    run,
    marker,
    resolveTarget,
    isMessageBeingEdited = () => false,
    chatTarget,
    confirmSlots,
    syncSlots = async () => {},
    journal = defaultJournal,
    now = Date.now,
} = {}) {
    if (typeof resolveTarget !== 'function') throw new TypeError('Draw Run adoption 缺少 marker 定位器');
    if (typeof confirmSlots !== 'function') throw new TypeError('Draw Run adoption 缺少可确认保存');
    if (!chatTarget?.endpoint || !chatTarget?.body) throw new TypeError('Draw Run adoption 缺少持久化聊天目标');
    if (typeof syncSlots !== 'function') throw new TypeError('Draw Run adoption 缺少楼层渲染同步器');
    const handoff = normalizeDrawRunHandoff(run, marker);
    const initialTarget = currentTarget(resolveTarget, handoff.runId, marker);
    if (!initialTarget) return { status: 'wait', reason: 'target_unavailable', owned: false };
    if (isMessageBeingEdited(initialTarget.messageId)) {
        return { status: 'wait', reason: 'message_editing', owned: false };
    }
    const acquired = await acquireRecord({ handoff, marker, resolveTarget, chatTarget, journal, now });
    let { record } = acquired;
    if (!record) return { status: 'wait', reason: 'owned_elsewhere', owned: false };
    if (record.state !== PendingJobState.ADOPTING) return { status: 'active', record, owned: false };
    if (!acquired.owned) return { status: 'wait', reason: 'lease_active', record, owned: false };

    const releaseOwned = async () => journal.release(record.jobId, record.leaseId).catch(() => {});
    try {
        const guard = () => journal.fence(record.jobId, record.leaseId);
        if (record.adoptionPhase === PendingJobAdoptionPhase.READY) {
            return { status: 'ready', record, delivery: record.delivery.mode, inserted: false, owned: true };
        }
        let target = currentTarget(resolveTarget, handoff.runId, marker);
        if (!target || isMessageBeingEdited(target.messageId)) {
            await releaseOwned();
            return { status: 'wait', reason: 'target_unavailable', record, owned: false };
        }

        const alive = livingSlots(target.sourceText, handoff.items);
        if (alive.length > 0) {
            await guard();
            await confirmSlots({ runId: handoff.runId, slotIds: alive, target });
            await guard();
            await syncSlots({ target, slotIds: alive });
            await guard();
            record = await journal.markReady(record.jobId, record.leaseId, record.delivery);
            return { status: 'ready', record, delivery: 'slots', inserted: false, owned: true };
        }

        if (record.delivery.mode === 'gallery'
            || record.adoptionPhase === PendingJobAdoptionPhase.PLACING) {
            record = await journal.markReady(record.jobId, record.leaseId, {
                mode: 'gallery',
                reason: record.delivery.reason || 'slots_missing',
            });
            return { status: 'ready', record, delivery: 'gallery', inserted: false, owned: true };
        }

        const currentSourceHash = hashSceneSource(normalizeMessageSceneSourceText(target.sourceText));
        if (currentSourceHash !== handoff.sourceHash) {
            record = await journal.markReady(record.jobId, record.leaseId, {
                mode: 'gallery',
                reason: 'source_changed',
            });
            return { status: 'ready', record, delivery: 'gallery', inserted: false, owned: true };
        }

        record = await journal.markPlacing(record.jobId, record.leaseId);
        await guard();
        target = currentTarget(resolveTarget, handoff.runId, marker);
        if (!target || isMessageBeingEdited(target.messageId)) {
            await releaseOwned();
            return { status: 'wait', reason: 'target_changed', record, owned: false };
        }
        if (hashSceneSource(normalizeMessageSceneSourceText(target.sourceText)) !== handoff.sourceHash) {
            record = await journal.markReady(record.jobId, record.leaseId, {
                mode: 'gallery',
                reason: 'source_changed',
            });
            return { status: 'ready', record, delivery: 'gallery', inserted: false, owned: true };
        }

        const plannedText = insertScenePlacementsPreservingSlots(
            target.sourceText,
            handoff.items.map(item => ({
                placement: { mode: 'source', sourceHash: handoff.sourceHash, offset: item.insertOffset },
                content: `[image:${item.slotId}]`,
            })),
            { block: true },
        );
        if (!setDrawRunMarkerText(target, plannedText)) {
            await releaseOwned();
            return { status: 'wait', reason: 'target_changed', record, owned: false };
        }
        await guard();
        await confirmSlots({ runId: handoff.runId, slotIds: handoff.items.map(item => item.slotId), target });
        await guard();
        await syncSlots({ target, slotIds: handoff.items.map(item => item.slotId) });
        await guard();
        record = await journal.markReady(record.jobId, record.leaseId, record.delivery);
        return { status: 'ready', record, delivery: 'slots', inserted: true, owned: true };
    } catch (error) {
        await releaseOwned();
        throw error;
    }
}
