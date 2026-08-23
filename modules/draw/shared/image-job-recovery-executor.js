import { createBackendItemError } from './backend-image-jobs.js';
import {
    claimPendingImageJob,
    fencePendingImageJobLease,
    forgetPendingImageJob,
    markPendingImageJobActive,
    markPendingImageJobCancelling,
    markPendingImageJobSettling,
    renewPendingImageJobLease,
} from './pending-image-jobs.js';
import { ReattachAction } from './image-job-reattach.js';
import { reattachRecoverableImageJob } from './recoverable-image-jobs.js';

const defaultJournal = {
    fenceLease: fencePendingImageJobLease,
    claim: claimPendingImageJob,
    forget: forgetPendingImageJob,
    markActive: markPendingImageJobActive,
    markCancelling: markPendingImageJobCancelling,
    markSettling: markPendingImageJobSettling,
    renewLease: renewPendingImageJobLease,
};

function getRecordItem(record, index) {
    return record.items.find(item => item.index === index) || null;
}

function describeSettlement(delivery, record, { error, mode } = {}) {
    if (mode) return { mode };
    if (!error) return { mode: 'complete' };
    return {
        mode: 'fail',
        errorType: delivery.describeError?.(error, record) || null,
    };
}

async function claimEntry(entry, journal) {
    const claimed = await journal.claim(entry.record.jobId);
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
        onItemReady: async ({ index, ...payload }) => {
            const item = getRecordItem(record, index);
            if (!item) throw new Error(`后台任务返回了未知图片索引 ${index}`);
            await guard();
            await delivery.deliver(record, item, payload, guard);
        },
        onItemSettled: async (details) => {
            if (details.alreadyDelivered === true || details.state === 'cancelled') return;
            const item = getRecordItem(record, details.index);
            if (!item) return;
            const error = details.source === 'frontend' ? details.error : createBackendItemError(details);
            await guard();
            await delivery.failItem(record, item, error, guard);
        },
        resolveSettlement: ({ error }) => {
            settlement = describeSettlement(delivery, record, {
                error,
                mode: cancelled ? 'discard' : '',
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
        afterForget: () => delivery.afterForget?.(record, settlement || { mode: 'complete' }),
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

    const record = await claimEntry(entry, journal);
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
        await journal.markSettling(record.jobId, record.leaseId, settlement);
    }
    await guard();
    await delivery.settle(record, settlement || { mode: 'complete' }, {}, guard);
    await guard();
    await delivery.beforeForget?.(record, settlement || { mode: 'complete' }, {}, guard);
    await journal.forget(record.jobId, record.leaseId);
    try {
        await delivery.afterForget?.(record, settlement || { mode: 'complete' });
    } catch (error) {
        console.warn(`[ImageJobs] 后台生图任务 ${record.jobId} 已完成，但最终界面刷新失败:`, error);
    }
    return true;
}
