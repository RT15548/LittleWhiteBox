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
    resetPendingImageJobAdoptionPlacement,
} from './pending-image-jobs.js';
import { deriveDrawRunChildJobId, deriveDrawRunItemIds } from './draw-run-identifiers.js';
import { createConfirmableChatSnapshot } from './confirmable-chat-save.js';
import {
    DRAW_RUN_MARKER_VERSION,
    getDrawRunMarkerText,
    setDrawRunMarkerText,
} from './draw-run-markers.js';
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
    resetPlacing: resetPendingImageJobAdoptionPlacement,
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
    const providerMetadata = source?.providerMetadata
        && typeof source.providerMetadata === 'object'
        && !Array.isArray(source.providerMetadata)
        ? JSON.parse(JSON.stringify(source.providerMetadata))
        : null;
    return {
        tags: text(source?.tags),
        positive: text(source?.positive),
        characterPrompts: source?.characterPrompts ?? null,
        negativePrompt: source?.negativePrompt ?? null,
        providerMetadata,
    };
}

export function normalizeDrawRunHandoff(run, marker) {
    const runId = text(run?.id).trim();
    const provider = text(run?.provider).trim();
    const sourceHash = text(run?.sourceHash).trim();
    const targetHash = text(marker?.targetHash).trim();
    const manifest = run?.handoffManifest;
    if (!runId || !['dispatched', 'child_expired'].includes(run?.state)
        || !provider || !sourceHash || !targetHash || !manifest) {
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
        targetHash,
        items,
        cancelling: Number(run.cancelRequestedAt) > 0,
    };
}

function currentTarget(resolveTarget, runId, marker) {
    const target = resolveTarget?.(runId) || null;
    if (!target || target.runId !== runId
        || target.marker?.provider !== marker.provider
        || target.marker?.sourceHash !== marker.sourceHash
        || target.marker?.targetHash !== marker.targetHash) return null;
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
            const snapshot = createConfirmableChatSnapshot({ chat: target.chat });
            await guard();
            await confirmSlots({ runId: handoff.runId, slotIds: alive, target, snapshot });
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
        if (currentSourceHash !== handoff.sourceHash
            || hashSceneSource(target.sourceText) !== handoff.targetHash) {
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
            // placing 只是“下一步可能写正文”的意图；此处尚未修改任何文本。
            // 目标在两个 await 之间切走或进入编辑态时可确定地退回 pending，
            // 不能让恢复器把这个零写入窗口误判成槽位丢失并永久降级画廊。
            record = await journal.resetPlacing(record.jobId, record.leaseId);
            await releaseOwned();
            return { status: 'wait', reason: 'target_changed', record, owned: false };
        }
        if (hashSceneSource(normalizeMessageSceneSourceText(target.sourceText)) !== handoff.sourceHash
            || hashSceneSource(target.sourceText) !== handoff.targetHash) {
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
        const originalText = target.sourceText;
        const snapshot = createConfirmableChatSnapshot({ chat: target.chat });
        if (!setDrawRunMarkerText(target, plannedText)) {
            await releaseOwned();
            return { status: 'wait', reason: 'target_changed', record, owned: false };
        }
        try {
            await guard();
        } catch (error) {
            // 页面可能在内存写入后冻结到租约失效。此时保存尚未开始，旧持有者
            // 只能撤销自己的本地文本，不能再推进已经由其他页面接管的 journal。
            if (getDrawRunMarkerText(target) === plannedText) {
                setDrawRunMarkerText(target, originalText);
            }
            throw error;
        }
        try {
            await confirmSlots({
                runId: handoff.runId,
                slotIds: handoff.items.map(item => item.slotId),
                target,
                snapshot,
            });
        } catch (error) {
            // 写前核对失败意味着 saveChat 根本没有执行，恢复内存中的原文是确定安全的；
            // 保存后读回不确定时则保留 plannedText，交给 PLACING 恢复判定。
            if (error?.saveAttempted === false && getDrawRunMarkerText(target) === plannedText) {
                setDrawRunMarkerText(target, originalText);
                record = await journal.resetPlacing(record.jobId, record.leaseId);
            }
            throw error;
        }
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
