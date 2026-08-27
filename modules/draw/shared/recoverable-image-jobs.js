import {
    fencePendingImageJobLease,
    forgetPendingImageJob,
    markPendingImageJobActive,
    markPendingImageJobCancelling,
    markPendingImageJobSettling,
    PendingImageJobLostError,
    recordPendingImageJob,
    releasePendingImageJobLease,
    renewPendingImageJobLease,
} from './pending-image-jobs.js';

// 可恢复的后台批量生图：提交顺序的唯一所有者。
//
// 「先落交付日志、再 CAS 持久化占位符、复核租约、最后提交后端」这套顺序就是整个恢复闭环
// 的正确性所在，任何一步错位都会产生一类无法自愈的坏状态：
//   - 日志晚于 POST → 后端任务已创建但本地无归属，一批花过钱的图烂到 TTL。
//   - 占位符晚于 POST → 崩溃后正文里没有槽位，图接回来了却无处安放。
//   - POST 前不复核租约 → 冻结很久的页面解冻后继续提交，造出槽位已被清理的孤儿任务。
// 三家 provider 各写一遍就是三份漏掉某一步的机会，所以顺序收在这里，provider 只注入
// 它才知道的两件事：怎么把占位符 CAS 写进这条正文，以及怎么把一张图落库。
//
// 这一层不碰 DOM、不碰 message、不认识聊天结构；它只负责「什么必须发生在什么之前」。

// 交付日志的注入口。默认就是真实模块，测试用假实现替换——
// IndexedDB 不存在于 Node，而这套顺序恰恰是最需要被证明的部分。
const defaultJournal = {
    record: recordPendingImageJob,
    fenceLease: fencePendingImageJobLease,
    renewLease: renewPendingImageJobLease,
    markActive: markPendingImageJobActive,
    markCancelling: markPendingImageJobCancelling,
    markSettling: markPendingImageJobSettling,
    releaseLease: releasePendingImageJobLease,
    forget: forgetPendingImageJob,
};

export function isPendingJobLeaseLost(error) {
    return error instanceof PendingImageJobLostError || error?.code === 'PENDING_JOB_LEASE_LOST';
}

// 占位符没能写进正文：用户在这段时间里改了这条消息，规划已经不适用了。
// 这不是故障，是正常的竞争结果，调用方按「本次没配图」处理即可。
export class PlacementNotCommittedError extends Error {
    constructor(message = '正文已变化，未写入图片占位符。') {
        super(message);
        this.name = 'PlacementNotCommittedError';
        this.code = 'PLACEMENT_NOT_COMMITTED';
    }
}

function createJobId() {
    return `xbimg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function preserveUndeliveredResults(result, jobId) {
    const pendingIndexes = new Set(result?.preserved instanceof Set ? result.preserved : []);
    if (result?.deliveryErrors instanceof Map) {
        for (const index of result.deliveryErrors.keys()) pendingIndexes.add(index);
    }
    const pendingCount = pendingIndexes.size;
    if (pendingCount === 0) return;
    const error = new Error(`后台生图任务 ${jobId} 有 ${pendingCount} 张结果尚未落库`);
    error.code = 'backend_results_preserved';
    error.detached = true;
    error.jobId = jobId;
    throw error;
}

// 当前流程已经明确停止推进、但后端任务与 journal 仍需保留时，主动让出租约。
// release 失败不能覆盖原始 detached 错误；最坏只会退回租约自然过期的旧行为。
async function releaseStoppedFlowLease(journal, jobId, leaseId) {
    try {
        await journal.releaseLease(jobId, leaseId);
    } catch (error) {
        if (isPendingJobLeaseLost(error)) return;
        console.warn(`[ImageJobs] 后台生图恢复记录 ${jobId} 未能主动让出租约:`, error);
    }
}

// 把日志维护挂在客户端本来就会发的状态通知上，不新增钩子：
// - 'created'：后端已确认收下任务，此后 404 才真正等于「任务已消失」，可以转 active。
// - 其余每一次通知都是一个可观察进展点，顺带续租，让正常运行的记录永不过期。
//
// 续租失败返回 null 表示所有权已易主。这里不抛错：抢占方已经在接管了，本流程要做的是
// 在下一个 assert 点安静地停手，而不是把一个已经有人负责的任务搅成失败。
function createJournalKeeper({ journal, jobId, leaseId }) {
    let activated = false;
    let lost = false;
    return {
        get lost() { return lost; },
        async onStateChange(state) {
            if (lost) return;
            try {
                if (state === 'created' && !activated) {
                    await journal.markActive(jobId, leaseId);
                    activated = true;
                    return;
                }
                const renewed = await journal.renewLease(jobId, leaseId);
                if (!renewed) lost = true;
            } catch (error) {
                if (isPendingJobLeaseLost(error)) {
                    lost = true;
                    return;
                }
                // 日志写不进去不该让一批已经在跑的图失败：最坏结果是租约到期后被别的页面
                // 接管，那条路径本身是安全的。
                console.warn(`[ImageJobs] 后台生图恢复记录 ${jobId} 维护失败:`, error);
            }
        },
    };
}

// 提交一批可恢复的后台生图任务。
//
// plan 描述「这批任务的槽位事实」：{ chatId, messageId, replacedSlotIds, gallery, items }，
// 其中 items 的 slotId 必须与 commitPlacements 即将写入正文的占位符一致，imgId 必须预先
// 分配好——预分配是重复落库天然幂等的前提，接回时按同一个 imgId 落库不会产生重复图片。
//
// commitPlacements 是真正持久化占位符的那一次写入，必须自己在写入的同一刻做严格 CAS
// （读取当前正文、比对、赋值三步之间不得有 await），并在 CAS 失败时返回 false。
// 把它设计成回调而不是参数，是因为只有 provider 知道这条正文该怎么读写和保存。
export async function submitRecoverableImageJob({
    client,
    provider,
    request,
    plan,
    commitPlacements,
    journal = defaultJournal,
    cancelSignal,
    detachSignal,
    onStateChange,
    onItemReady,
    onItemSettled,
    settlePlacements,
    resolveSettlement,
    beforeForget,
    afterForget,
} = {}) {
    if (!client) throw new Error('缺少后台生图客户端');
    if (typeof commitPlacements !== 'function') throw new Error('缺少占位符持久化回调');

    const jobId = createJobId();
    // 第一步必须是落日志：从这一刻起，无论页面怎么死，这批槽位都有归属。
    const record = await journal.record({ ...plan, jobId, provider });
    const { leaseId } = record;
    const fenceLease = () => journal.fenceLease(jobId, leaseId);

    await fenceLease();
    const committed = (await commitPlacements({ jobId, leaseId, record })) !== false;
    if (!committed) {
        // 占位符没写进去，正文里不存在这批槽位，日志也就没有任何意义了。
        // 此时还没 POST，直接作废是唯一干净的收尾。
        await journal.forget(jobId, leaseId).catch(() => {});
        throw new PlacementNotCommittedError();
    }

    // 跨过了持久化与保存的多次 await，页面完全可能在这中间被冻结很久。
    // POST 之前必须证明这条记录还属于本流程：记录已被接管或清理时继续提交，
    // 就会凭一个没人认领的 requestId 在后端造出孤儿任务。
    await fenceLease();

    const keeper = createJournalKeeper({ journal, jobId, leaseId });
    let cancelIntentPromise = null;
    const markCancelIntent = () => {
        cancelIntentPromise ??= journal.markCancelling(jobId, leaseId);
    };
    if (cancelSignal?.aborted) markCancelIntent();
    cancelSignal?.addEventListener('abort', markCancelIntent, { once: true });
    const waitForCancelIntent = async () => {
        if (cancelIntentPromise) await cancelIntentPromise;
    };
    const forwardStateChange = async (state, data) => {
        await keeper.onStateChange(state);
        onStateChange?.(state, data);
    };

    try {
        const result = await client.runJob(request, {
            requestId: jobId,
            cancelSignal,
            detachSignal,
            beforeIrreversible: fenceLease,
            beforeCancel: async () => {
                await waitForCancelIntent();
                await fenceLease();
            },
            onStateChange: forwardStateChange,
            onItemReady: async (details) => {
                await fenceLease();
                await onItemReady?.({ ...details, guard: fenceLease });
            },
            onItemSettled: async (details) => {
                await fenceLease();
                await onItemSettled?.({ ...details, guard: fenceLease });
            },
        });
        cancelSignal?.removeEventListener('abort', markCancelIntent);
        await waitForCancelIntent();
        // 客户端刻意保留结果表示落库没有成功，后端副本仍是唯一可信来源。
        // 这时绝不能进入 settling 或删 journal；下一次 reconcile 必须还能按同一 jobId 重试。
        preserveUndeliveredResults(result, jobId);
        await finishRecoverableImageJob({
            journal, jobId, leaseId, settlePlacements, resolveSettlement, beforeForget, afterForget, result,
        });
        return { ...result, jobId, leaseId };
    } catch (error) {
        cancelSignal?.removeEventListener('abort', markCancelIntent);
        await waitForCancelIntent();
        if (isPendingJobLeaseLost(error)) throw error;
        error.jobId ||= jobId;
        // 任务是否还活在后端由 client 判定（只有 404 才算真的没了）。detached 的任务必须
        // 保留日志和槽位：它还在跑，图还会出来，交给下一次 reconcile 接回。
        if (error?.detached === true) {
            await releaseStoppedFlowLease(journal, jobId, leaseId);
            throw error;
        }
        await finishRecoverableImageJob({
            journal, jobId, leaseId, settlePlacements, resolveSettlement, beforeForget, afterForget, result: null, error,
        });
        throw error;
    } finally {
        cancelSignal?.removeEventListener('abort', markCancelIntent);
    }
}

// 收尾：先把记录推进到 settling，再清槽，最后才删记录。
//
// 顺序同样是本质的：清槽发生在标记之后，所以清槽中途崩溃时下一次 reconcile 会看到
// settling 并把清理做完；删记录发生在清槽之后，所以记录消失就等于正文已经干净了。
// 反过来先删记录，正文里会永久留下一批没人负责的失效占位卡。
async function finishRecoverableImageJob({
    journal,
    jobId,
    leaseId,
    settlePlacements,
    resolveSettlement,
    beforeForget,
    afterForget,
    result,
    error,
}) {
    try {
        const settlement = typeof resolveSettlement === 'function'
            ? await resolveSettlement({ jobId, leaseId, result, error })
            : null;
        await journal.markSettling(jobId, leaseId, settlement);
        if (typeof settlePlacements === 'function') {
            const guard = () => journal.fenceLease(jobId, leaseId);
            await guard();
            await settlePlacements({ jobId, leaseId, result, error, guard });
        }
        if (typeof beforeForget === 'function') {
            const guard = () => journal.fenceLease(jobId, leaseId);
            await guard();
            await beforeForget({ jobId, leaseId, result, error, settlement, guard });
        }
        await journal.forget(jobId, leaseId);
        try {
            await afterForget?.({ jobId, result, error, settlement });
        } catch (renderError) {
            console.warn(`[ImageJobs] 后台生图任务 ${jobId} 已完成，但最终界面刷新失败:`, renderError);
        }
    } catch (settleError) {
        if (isPendingJobLeaseLost(settleError)) return;
        // 记录留在 settling，正文里的失效占位卡由下一次 reconcile 清掉。
        console.warn(`[ImageJobs] 后台生图任务 ${jobId} 收尾未完成，已留待下次恢复:`, settleError);
    }
}

// 接回一条已存在的记录：由 reconcile 在租约过期后调用，语义与首次提交的后半段完全一致。
// 这里不再有 CAS——占位符早就在正文里了，接回要做的只是把图放回原槽位。
export async function reattachRecoverableImageJob({
    client,
    record,
    journal = defaultJournal,
    cancelSignal,
    detachSignal,
    onStateChange,
    onItemReady,
    onItemSettled,
    settlePlacements,
    resolveSettlement,
    beforeForget,
    afterForget,
} = {}) {
    if (!client) throw new Error('缺少后台生图客户端');
    const { jobId, leaseId } = record || {};
    if (!jobId || !leaseId) throw new Error('恢复记录缺少 jobId 或 leaseId');

    const keeper = createJournalKeeper({ journal, jobId, leaseId });
    const fenceLease = () => journal.fenceLease(jobId, leaseId);
    const forwardStateChange = async (state, data) => {
        await keeper.onStateChange(state);
        onStateChange?.(state, data);
    };

    try {
        const result = await client.attachJob(jobId, {
            cancelSignal,
            detachSignal,
            beforeIrreversible: fenceLease,
            beforeCancel: fenceLease,
            onStateChange: forwardStateChange,
            onItemReady: async (details) => {
                await fenceLease();
                await onItemReady?.({ ...details, guard: fenceLease });
            },
            onItemSettled: async (details) => {
                await fenceLease();
                await onItemSettled?.({ ...details, guard: fenceLease });
            },
        });
        preserveUndeliveredResults(result, jobId);
        await finishRecoverableImageJob({
            journal, jobId, leaseId, settlePlacements, resolveSettlement, beforeForget, afterForget, result,
        });
        return { ...result, jobId, leaseId };
    } catch (error) {
        if (isPendingJobLeaseLost(error)) throw error;
        if (error?.detached === true) {
            await releaseStoppedFlowLease(journal, jobId, leaseId);
            throw error;
        }
        await finishRecoverableImageJob({
            journal, jobId, leaseId, settlePlacements, resolveSettlement, beforeForget, afterForget, result: null, error,
        });
        throw error;
    }
}

// 用户显式取消但取消请求没能送达后端：这个意图必须跨刷新存活，
// 否则刷新后 reconcile 会把一个用户已经放弃的任务重新接回来继续出图。
export async function markRecoverableImageJobCancelling(jobId, leaseId, journal = defaultJournal) {
    try {
        await journal.markCancelling(jobId, leaseId);
        return true;
    } catch (error) {
        if (isPendingJobLeaseLost(error)) return false;
        throw error;
    }
}
