import { PreviewStatus, DRAW_SLOT_COPY, DRAW_SLOT_ERRORS } from './image-record.js';
import { isPendingJobLeaseLost } from './recoverable-image-jobs.js';
import { deliverPreparedImage } from './prepared-image-delivery.js';
import { discardPendingImageSlot } from './pending-image-jobs.js';
import { ImageRequestOutcome } from './image-request-outcome.js';

// Both prepared scene plans and shorthand tags use this lifecycle. The host owns
// placement; providers own transport; neither may acknowledge an unstored image.
export async function executePreparedSlots({ items, backend, store, remove, select, commit,
    run, resolveTarget, render, activity, signal, classifyError, onStateChange,
    nativeMessage = false, onPrepared, clearSelection,
    onRenderError = error => console.error(DRAW_SLOT_COPY.renderFailed, error) }) {
    const results = new Map();
    const deliveryErrors = new Set();
    let committed = false;
    let uncertain = false;
    const started = new Set();
    const setActivity = (item, index, phase) => activity(item.slotId, { index, total: items.length,
        phase, label: DRAW_SLOT_COPY[phase], discard: () => { item.discarded = true; } });
    const refresh = async () => { try { await render(); } catch (error) { onRenderError(error); } };
    const commitOnce = async () => {
        if (committed) return true;
        signal?.throwIfAborted();
        try {
            if (await commit() === false) throw new Error(DRAW_SLOT_COPY.sourceChanged);
            committed = true;
        } catch (error) {
            committed = error?.placementsCommitted === true;
            uncertain = error?.uncertain === true;
            throw error;
        }
        if (!nativeMessage) await refresh();
        return true;
    };
    const deliver = async (index, patch, guard = async () => {}) => {
        const item = items[index];
        const delivered = await deliverPreparedImage({
            guard, retainWithoutSlot: item.delivery?.retainWithoutSlot,
            isDiscarded: record => item.discarded || record?.items?.some(entry => entry.imgId === item.imgId && entry.discarded),
            resolveTarget: () => resolveTarget(item.slotId),
            persist: target => store({ ...item, ...patch, messageId: target?.messageId ?? item.messageId }),
            remove: () => remove(item.imgId),
            clearSelection: () => clearSelection?.(item.slotId),
            select: () => select(item.slotId, item.imgId),
        });
        if (!delivered) {
            results.set(index, { slotId: item.slotId, imgId: item.imgId, success: false, discarded: true });
            activity(item.slotId, null);
            return;
        }
        results.set(index, { slotId: item.slotId, imgId: item.imgId, tags: item.tags,
            success: patch.status === PreviewStatus.SUCCESS, status: patch.status });
        activity(item.slotId, null);
        await refresh();
    };
    const fail = async (index, error, guard) => {
        if (results.has(index) || deliveryErrors.has(index)) return;
        const kind = signal?.aborted ? DRAW_SLOT_ERRORS.interrupted : classifyError(error);
        const unknown = !backend && started.has(index)
            && ![ImageRequestOutcome.NOT_SUBMITTED, ImageRequestOutcome.REJECTED].includes(error?.imageRequestOutcome);
        const problem = unknown ? DRAW_SLOT_ERRORS.unknown : kind;
        await deliver(index, { status: unknown ? PreviewStatus.UNKNOWN : PreviewStatus.FAILED,
            errorType: problem.label, errorMessage: unknown ? problem.desc : error?.message || problem.desc }, guard);
    };
    try {
        for (const [index, item] of items.entries()) {
            setActivity(item, index, 'preparing');
            await store({ ...item, status: PreviewStatus.PENDING });
        }
        if (!backend || nativeMessage) await commitOnce();
        onPrepared?.();
        for (const [index, item] of items.entries()) setActivity(item, index, 'queued');
        if (nativeMessage) void refresh();
        else await refresh();
        onStateChange?.('gen', { current: 0, total: items.length });
        await run({
            signal,
            // Called by the real provider queue immediately before transport.
            // Queued/unsubmitted inputs remain distinct from possibly billed ones.
            onItemStarting: async ({ index }) => {
                if (items[index].discarded) { await deliver(index, {}); return false; }
                await store({ ...items[index], status: PreviewStatus.UNKNOWN,
                    errorType: DRAW_SLOT_ERRORS.unknown.label, errorMessage: DRAW_SLOT_ERRORS.unknown.desc });
                started.add(index);
                if (items[index].discarded) { await deliver(index, {}); return false; }
                setActivity(items[index], index, 'generating');
                void refresh();
                return true;
            },
            recoverable: {
                plan: {
                    delivery: { ...items[0].delivery, preserveSlotsOnCancel: true },
                    gallery: { chatId: items[0].chatId, messageId: String(items[0].messageId),
                        characterName: items[0].characterName },
                    items: items.map((item, index) => ({ index, slotId: item.slotId, imgId: item.imgId, discarded: item.discarded,
                        previewMetadata: { tags: item.tags, positive: item.positive,
                            characterPrompts: item.characterPrompts, negativePrompt: item.negativePrompt } })),
                },
                commitPlacements: async () => {
                    // Deletion may precede journal creation while this batch waits
                    // in the request queue. Carry it into that newly created record.
                    for (const item of items) if (item.discarded) await discardPendingImageSlot(item.slotId);
                    return commitOnce();
                },
                settlePlacements: async ({ error, guard } = {}) => {
                    if (error && committed) for (const index of items.keys()) await fail(index, error, guard);
                },
                resolveSettlement: ({ error } = {}) => error
                    ? { mode: 'fail', errorType: classifyError(error) } : { mode: 'complete' },
                afterForget: refresh,
            },
            onStateChange: (state, data) => {
                for (const [index, item] of items.entries()) {
                    const generating = backend
                        ? state === 'delivering' || state === 'progress' && data.current === index + 1
                        : started.has(index);
                    if (!results.has(index)) setActivity(item, index, generating ? 'generating' : 'queued');
                }
                onStateChange?.(state, data);
                void refresh();
            },
            onItemReady: async ({ index, base64, guard }) => {
                if (!base64) throw new Error(DRAW_SLOT_COPY.emptyResult);
                try {
                    await deliver(index, { base64, status: PreviewStatus.SUCCESS, errorType: null, errorMessage: null }, guard);
                } catch (error) {
                    deliveryErrors.add(index);
                    error.preserveBackendResult = true;
                    throw error;
                }
            },
            onItemSettled: async ({ index, state, error, guard }) => {
                if (state !== 'ready' && state !== 'consumed') await fail(index, error, guard);
            },
        });
        if (deliveryErrors.size) throw new Error(DRAW_SLOT_COPY.storageFailed);
        for (const index of items.keys()) {
            if (!results.has(index)) await fail(index, new Error(DRAW_SLOT_COPY.emptyResult));
        }
        const output = { success: [...results.values()].filter(item => item.success).length,
            unknown: [...results.values()].filter(item => item.status === PreviewStatus.UNKNOWN).length,
            total: items.length, results: [...results.values()], aborted: signal?.aborted === true };
        onStateChange?.('success', output);
        return output;
    } catch (error) {
        if (!backend && !committed && uncertain) {
            // Chat persistence is uncertain, but image submission is not: the
            // local transport has not run. Retain the input as a failed attempt,
            // not as a backend job waiting for a recovery worker that cannot exist.
            const problem = DRAW_SLOT_ERRORS.placement;
            const failure = new Error(problem.desc, { cause: error });
            failure.code = problem.code;
            for (const item of items) await store({ ...item, status: PreviewStatus.FAILED,
                errorType: problem.label, errorMessage: problem.desc });
            throw failure;
        }
        if (!committed && !uncertain) {
            for (const item of items) await remove(item.imgId);
        } else if (committed && !error?.detached && !isPendingJobLeaseLost(error)
            && !error?.preserveBackendResult && !deliveryErrors.size) {
            for (const index of items.keys()) await fail(index, error);
        }
        throw error;
    } finally {
        for (const item of items) activity(item.slotId, null);
        if (committed || uncertain) await refresh();
    }
}
