import { PendingJobState } from './pending-image-jobs.js';
import {
    findJobPageFarewell,
    PAGE_FAREWELL_PREPARING_GRACE_MS,
} from './page-farewell.js';

// 重连恢复的决策核心。
//
// 刻意做成纯函数：所有「该接回 / 该作废 / 该继续等」的判断都只依赖三个输入
// （本地交付日志、后端任务快照、时间基准），不碰 IndexedDB、不碰 DOM、不发请求。
// 这样四种边界场景可以在最便宜的一层被证明，而执行层只负责照单干活。

export const ReattachAction = {
    // 后端仍然有这个任务：接回，逐张交付到原槽位。
    ATTACH: 'attach',
    // 用户已显式取消但取消没送达：补发取消，再按取消结果清槽。
    CANCEL: 'cancel',
    // 上一轮的槽位清理或后端删除没能落盘：继续把清理做完。
    SETTLE: 'settle',
    // 用户已显式取消且后端任务也不在了：删除未完成的槽位并作废记录。
    // 这是唯一允许删槽位的路径——取消是用户亲手表达的「不要这些图了」。
    DISCARD: 'discard',
    // 任务消失但用户没有取消（preparing 从未提交成功，或 active 被后端 TTL 回收）：
    // 槽位必须保留，转成可重试的失败卡明确告知，然后作废记录。
    // 具体文案由执行层按 record.state 区分（未提交 vs 已失效）。
    FAIL: 'fail',
    // 租约仍然有效：另一个流程正持有这条记录，什么都不许做。
    WAIT: 'wait',
};

function resolveReattachDecision(record, job, now, farewell) {
    // 租约是唯一的所有权凭证，因此它先于一切状态判断。
    //
    // 租约未过期就说明另一个流程还在推进这条记录：可能它刚写完日志正在提交（此时后端还
    // 查不到 jobId，按「任务已消失」清槽会在它提交成功后留下无人认领的孤儿任务），也可能
    // 它已经接回并在逐张交付（此时抢着接管会让两个流程同时交付、同时改同一段正文）。
    // 两种情况都只有一个正确动作：不动。
    if (now < record.leaseExpiresAt && !farewell) return { action: ReattachAction.WAIT };
    if (farewell && record.state === PendingJobState.PREPARING && !job) {
        const retryAt = farewell.at + PAGE_FAREWELL_PREPARING_GRACE_MS;
        if (now < retryAt) return { action: ReattachAction.WAIT, retryAt };
    }
    // 以下记录要么租约已过期，要么原页面留下了与当前 leaseId 精确匹配的遗言，可以安全接管。
    // 清理没做完的记录优先收尾，与后端任务是否还在无关。
    if (record.state === PendingJobState.SETTLING) return { action: ReattachAction.SETTLE };
    if (record.state === PendingJobState.CANCELLING) {
        return { action: job ? ReattachAction.CANCEL : ReattachAction.DISCARD };
    }
    if (job) return { action: ReattachAction.ATTACH };
    return { action: ReattachAction.FAIL };
}

export function planImageJobReattach({
    records = [],
    backendJobs = [],
    farewells = [],
    now = Date.now(),
} = {}) {
    const jobsById = new Map((Array.isArray(backendJobs) ? backendJobs : [])
        .filter(job => typeof job?.id === 'string' && job.id.length > 0)
        .map(job => [job.id, job]));
    const claimed = new Set();
    const plan = [];
    for (const record of Array.isArray(records) ? records : []) {
        if (!record?.jobId) continue;
        const job = jobsById.get(record.jobId) || null;
        if (job) claimed.add(job.id);
        // adopting 的 child 已由 Draw Run 创建，但正文槽位是否真正落盘尚未确认。
        // 第一刀恢复器对它零动作，租约过期后也不能越权收图；只有 Draw Run 恢复器能推进。
        if (record.state === PendingJobState.ADOPTING) continue;
        const farewell = findJobPageFarewell(farewells, record.jobId, record.leaseId);
        const decision = resolveReattachDecision(record, job, now, farewell);
        plan.push({ record, job, farewell, ...decision });
    }
    // 后端有、本地没有记录的任务一律不动：同一浏览器的其他标签页共享同一份日志，
    // 所以这类任务只可能来自别的设备或别的浏览器配置，替它们取消或删除等于破坏别人的任务。
    // 只上报，交给后端 TTL 或人工清理。
    const unclaimed = [...jobsById.values()].filter(job => !claimed.has(job.id));
    return { plan, unclaimed };
}
