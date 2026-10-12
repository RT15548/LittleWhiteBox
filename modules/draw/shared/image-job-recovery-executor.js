import { createBackendItemError } from './backend-image-jobs.js';
import {
    claimPendingImageJob,
    commitPendingImageJobItem,
    fencePendingImageJobLease,
    forgetPendingImageJob,
    getPendingImageJob,
    markPendingImageJobActive,
    markPendingImageJobCancelling,
    markPendingImageJobSettling,
    PendingJobState,
    releasePendingImageJobLease,
    renewPendingImageJobLease,
} from './pending-image-jobs.js';
import { ReattachAction } from './image-job-reattach.js';
import { createImageJobItemDelivery, reattachRecoverableImageJob } from './recoverable-image-jobs.js';

const defaultJournal = {
    commitItem: commitPendingImageJobItem,
    fenceLease: fencePendingImageJobLease,
    claim: claimPendingImageJob,
    forget: forgetPendingImageJob,
    get: getPendingImageJob,
    markActive: markPendingImageJobActive,
    markCancelling: markPendingImageJobCancelling,
    markSettling: markPendingImageJobSettling,
    releaseLease: releasePendingImageJobLease,
    renewLease: renewPendingImageJobLease,
};

function describeSettlement(delivery, record, { error, mode } = {}) {
    if (mode) return { mode };
    if (!error) return { mode: 'complete' };
    return {
        mode: 'fail',
        errorType: delivery.describeError?.(error, record) || null,
    };
}

async function claimEntry(entry, journal) {
    const claimed = await journal.claim(entry.record.jobId, { farewell: entry.farewell });
    return claimed?.leaseId ? claimed : null;
}

async function runAttachment({ client, record, journal, delivery, cancelled }) {
    let settlement = null;
    const guard = () => journal.fenceLease(record.jobId, record.leaseId);
    const controller = cancelled ? new AbortController() : null;
    if (controller) controller.abort();

    return reattachRecoverableImageJob({
        client,
        record,
        journal,
        cancelSignal: controller?.signal,
        onStateChange: (state, data) => delivery.onStateChange?.(record, state, data),
        onItemReady: async ({ record: current, item, ...payload }) => {
            await guard();
            await delivery.deliver(current, item, payload, guard);
        },
        onItemSettled: async (details) => {
            if (details.alreadyDelivered === true) return;
            if (details.state === 'cancelled') return false;
            const error = details.source === 'frontend' ? details.error : createBackendItemError(details);
            await guard();
            await delivery.failItem(details.record, details.item, error, guard, details.commitDelivery);
        },
        resolveSettlement: async ({ error, result }) => {
            const current = typeof journal.get === 'function'
                ? await journal.get(record.jobId).catch(() => null)
                : null;
            const cancellationRequested = cancelled
                || result?.job?.state === 'cancelled'
                || current?.state === PendingJobState.CANCELLING
                || current?.cancelRequested === true;
            settlement = describeSettlement(delivery, record, {
                error,
                mode: cancellationRequested ? 'discard' : '',
            });
            return settlement;
        },
        settlePlacements: async (details) => {
            await guard();
            await delivery.settle(record, settlement || { mode: 'complete' }, details, guard);
        },
        beforeForget: async (details) => {
            await guard();
            await delivery.beforeForget?.(record, settlement || { mode: 'complete' }, details, guard);
        },
        afterForget: details => delivery.afterForget?.(
            record,
            settlement || { mode: 'complete' },
            details,
        ),
    });
}

// Executes one already-planned action. Planning stays pure in image-job-reattach.js; this layer owns
// lease acquisition and action ordering, while the host delivery adapter owns chat/cache/DOM effects.
export async function executeImageJobReattachEntry({
    entry,
    client,
    delivery,
    journal = defaultJournal,
} = {}) {
    if (!entry?.record || !entry.action) return false;
    if (entry.action === ReattachAction.WAIT) return false;
    if (!client) throw new Error('缺少后台生图客户端');
    if (!delivery) throw new Error('缺少后台生图交付适配器');

    let record = await claimEntry(entry, journal);
    if (!record) return false;
    const guard = () => journal.fenceLease(record.jobId, record.leaseId);

    if (entry.action === ReattachAction.ATTACH) {
        await runAttachment({ client, record, journal, delivery, cancelled: false });
        return true;
    }
    if (entry.action === ReattachAction.CANCEL) {
        await runAttachment({ client, record, journal, delivery, cancelled: true });
        return true;
    }

    let settlement = record.settlement;
    if (entry.action === ReattachAction.DISCARD) settlement = { mode: 'discard' };
    if (entry.action === ReattachAction.FAIL) {
        settlement = {
            mode: 'fail',
            errorType: delivery.describeMissingJob?.(record) || null,
        };
    }
    if (entry.action !== ReattachAction.SETTLE) {
        record = await journal.markSettling(record.jobId, record.leaseId, settlement);
        settlement = record.settlement;
    }
    await guard();
    const deliverItem = createImageJobItemDelivery({ journal, jobId: record.jobId, leaseId: record.leaseId, guard });
    await delivery.settle(record, settlement || { mode: 'complete' }, { deliverItem }, guard);
    await guard();
    await delivery.beforeForget?.(record, settlement || { mode: 'complete' }, {}, guard);
    await journal.forget(record.jobId, record.leaseId);
    try {
        await delivery.afterForget?.(record, settlement || { mode: 'complete' }, {});
    } catch (error) {
        console.warn(`[ImageJobs] 后台生图任务 ${record.jobId} 已完成，但最终界面刷新失败:`, error);
    }
    return true;
}
