// 后台生图任务的交付日志。
//
// 唯一职责：让「后端任务已经存在、浏览器却没了」这件事可恢复。后端任务的生命周期独立于
// 页面（TTL 内一直活着），而 jobId 只活在内存里，刷新或断网就再也认不回来，已经花钱跑出来
// 的图会连同后端配额一起烂到 TTL 结束。
//
// 边界：
// - 不保存任何密钥或请求正文。恢复只需要 jobId，重新提交由 requestId 幂等保证。
// - 不保存排版信息。楼层正文里的 [image:slotId] 就是持久化的排版事实，本模块只记录
//   jobId 到槽位的交付映射，以及每张图预先分配的 imgId（让重复落库天然幂等）。
// - 独占自己的 IndexedDB，不寄居在画廊库里：画廊的 clearAllCache 会清空整库，
//   活跃任务的恢复记录绝不能被「清理图片缓存」这个动作静默带走。
// - 生命周期：提交后端任务之前写入，全部结果落库并 ACK 之后删除；后端返回 404
//   （TTL 已回收或从未创建成功）时也删除。
// - 没有模块级缓存：多标签页下缓存必然读到脏数据，而记录数最多只有后端的每用户任务上限，
//   每次读一遍的代价远小于状态不一致的代价。
//
// 租约即所有权：每条记录任一时刻只有一个流程有权推进它。leaseId 标识持有者，
// leaseExpiresAt 标识这份所有权何时失效。持有者在推进期间续租；只有租约过期的记录
// 才允许被其他页面接管，接管会换发新的 leaseId，原持有者随后的任何写入都会被拒绝。
// 这是「页面冻结很久后解冻继续跑」和「多标签页同时接管」两个场景唯一的判定依据：
// 光看状态或时间戳都不足以区分「我还持有」和「已经易主」。

const DB_NAME = 'xb_image_backend_jobs';
const DB_VERSION = 1;
const DB_STORE = 'jobs';

// 事务状态机：
//
//   preparing → active → settling → 删除记录
//                  ↑
//              cancelling
//
// preparing 存在的唯一理由是「记录已落盘、POST 还没确认」这个真实窗口：此时后端查不到
// 这个 jobId，但提交上下文可能还在重试。如果把 404 直接当成「任务不存在」而删掉记录并清槽，
// 原页面随后完成 POST，任务就成了没人认领的孤儿。所以必须等租约过期才允许作废。
// settling 表示结果都处理完了、但槽位清理或后端删除还没落盘；记录必须留到清理真正完成，
// 否则刷新后正文里会永久留下失效占位卡。
export const PendingJobState = {
    PREPARING: 'preparing',
    ACTIVE: 'active',
    CANCELLING: 'cancelling',
    SETTLING: 'settling',
};

// 租约时长，也是「原持有者已经没了」的检测延迟上限。
//
// 持有者必须在每一个可观察进展点续租（轮询到状态、创建重试、交付一张图）。两次续租机会
// 之间最坏的间隔来自「轮询间隔上限 30s + 单请求超时 15s」，约 45 秒；创建重试路径上是
// 「退避上限 10s + 请求超时 15s」，约 25 秒。取 120 秒留出 2.6 倍余量：既不会让正常运行的
// 记录被误判成可接管，也不会让崩溃后重开的用户白等太久才接回图片。
//
// 不要为了「更安全」把它调大：这个值直接就是用户看着占位卡等待的时间。真正的安全来自
// 续租覆盖了所有进展点，而不是把租约拉长。
export const PENDING_JOB_LEASE_MS = 120 * 1000;

const PENDING_JOB_STATES = new Set(Object.values(PendingJobState));
const SETTLEMENT_MODES = new Set(['complete', 'discard', 'fail']);

// 记录已经不属于当前流程：被别的页面接管，或已被清理。持有者遇到它必须立刻停手，
// 既不能继续向后端提交，也不能再动正文或删记录——那些都归新持有者负责。
export class PendingImageJobLostError extends Error {
    constructor(jobId, reason) {
        super(`后台生图恢复记录 ${jobId} 已不属于当前流程（${reason}）`);
        this.name = 'PendingImageJobLostError';
        this.code = 'PENDING_JOB_LEASE_LOST';
        this.jobId = jobId;
        this.reason = reason;
    }
}

let dbOpening = null;

function openPendingJobsDB() {
    if (dbOpening) return dbOpening;
    dbOpening = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => {
            dbOpening = null;
            reject(request.error);
        };
        request.onsuccess = () => {
            const database = request.result;
            database.onclose = () => { dbOpening = null; };
            database.onversionchange = () => { database.close(); dbOpening = null; };
            resolve(database);
        };
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(DB_STORE)) {
                database.createObjectStore(DB_STORE, { keyPath: 'jobId' });
            }
        };
    });
    return dbOpening;
}

function runTransaction(mode, work) {
    return openPendingJobsDB().then(database => new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(DB_STORE, mode);
            const store = tx.objectStore(DB_STORE);
            let output;
            let workError = null;
            work(
                store,
                (value) => { output = value; },
                (error) => {
                    workError = error;
                    tx.abort();
                },
            );
            tx.oncomplete = () => resolve(output);
            tx.onerror = () => reject(workError || tx.error);
            tx.onabort = () => reject(workError || tx.error);
        } catch (error) {
            reject(error);
        }
    }));
}

function normalizeText(value) {
    return typeof value === 'string' ? value : '';
}

function normalizeItem(source) {
    const index = Number(source?.index);
    const slotId = normalizeText(source?.slotId).trim();
    const imgId = normalizeText(source?.imgId).trim();
    if (!Number.isSafeInteger(index) || index < 0 || !slotId || !imgId) return null;
    const metadata = source?.previewMetadata || {};
    return {
        index,
        slotId,
        imgId,
        previewMetadata: {
            tags: normalizeText(metadata.tags),
            positive: normalizeText(metadata.positive),
            characterPrompts: metadata.characterPrompts ?? null,
            negativePrompt: metadata.negativePrompt ?? null,
        },
    };
}

function normalizeSettlement(source) {
    const mode = normalizeText(source?.mode).trim();
    if (!SETTLEMENT_MODES.has(mode)) return null;
    const errorType = source?.errorType || {};
    return {
        mode,
        errorType: {
            code: normalizeText(errorType.code),
            label: normalizeText(errorType.label),
            desc: normalizeText(errorType.desc),
        },
    };
}

// 任何字段缺失的记录都无法安全恢复，直接当脏数据丢弃，绝不让它进入 reconcile。
// 没有 leaseId 的记录同样是脏数据：所有权无法判定，就没法安全地决定谁来推进它。
export function normalizePendingImageJob(source) {
    const jobId = normalizeText(source?.jobId).trim();
    const provider = normalizeText(source?.provider).trim();
    const leaseId = normalizeText(source?.leaseId).trim();
    if (!jobId || !provider || !leaseId) return null;
    const items = (Array.isArray(source?.items) ? source.items : []).map(normalizeItem).filter(Boolean);
    if (items.length === 0) return null;
    const state = PENDING_JOB_STATES.has(source?.state) ? source.state : PendingJobState.PREPARING;
    const lease = Number(source?.leaseExpiresAt);
    return {
        jobId,
        provider,
        leaseId,
        chatId: normalizeText(source?.chatId),
        messageId: normalizeText(source?.messageId),
        replacedSlotIds: [...new Set((Array.isArray(source?.replacedSlotIds) ? source.replacedSlotIds : [])
            .map(value => normalizeText(value).trim())
            .filter(Boolean))],
        state,
        leaseExpiresAt: Number.isFinite(lease) ? lease : 0,
        createdAt: Number.isFinite(Number(source?.createdAt)) ? Number(source.createdAt) : Date.now(),
        gallery: { ...(source?.gallery || {}) },
        items,
        settlement: normalizeSettlement(source?.settlement),
    };
}

function createLeaseId() {
    return `lease-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// 必须在向后端提交任务之前调用：requestId 就是 jobId，先落盘才不会出现
// 「后端已创建、本地没有归属」的窗口。落盘即 preparing，POST 确认后才转 active。
// 返回的记录带 leaseId，调用方必须全程持有它：之后每一次跨 await 的推进都要凭它复核所有权。
export async function recordPendingImageJob(record) {
    const normalized = normalizePendingImageJob({ ...record, leaseId: createLeaseId() });
    if (!normalized) throw new Error('后台生图恢复记录不完整，拒绝落盘');
    normalized.state = PendingJobState.PREPARING;
    normalized.leaseExpiresAt = Date.now() + PENDING_JOB_LEASE_MS;
    await runTransaction('readwrite', store => store.put(normalized));
    return normalized;
}

// 接管一条租约已过期的记录，换发新 leaseId。返回 null 表示不该接管：记录已消失，
// 或它的租约仍然有效（另一个流程正在推进，重复接管会让两边同时交付、同时改正文）。
export async function claimPendingImageJob(jobId, { now = Date.now() } = {}) {
    const key = normalizeText(jobId).trim();
    if (!key) return null;
    return runTransaction('readwrite', (store, setOutput) => {
        const request = store.get(key);
        request.onsuccess = () => {
            const record = normalizePendingImageJob(request.result);
            if (!record || record.leaseExpiresAt > now) {
                setOutput(null);
                return;
            }
            const claimed = { ...record, leaseId: createLeaseId(), leaseExpiresAt: now + PENDING_JOB_LEASE_MS };
            store.put(claimed);
            setOutput(claimed);
        };
    });
}

// 跨过任何 await 之后、尤其在向后端提交之前必须调用。
//
// 页面可能被冻结远超租约时长，解冻后原地继续执行；这段时间里另一个页面完全可能已经
// 接管或清理了这条记录。此时旧流程若继续 POST，就会凭一个已经没人认领的 requestId
// 在后端造出孤儿任务，而它对应的槽位早已从正文里删掉了。所以每一步推进都必须先证明
// 「这条记录还是我的」，而不是假设时间没有流逝。
export async function assertPendingImageJobLease(jobId, leaseId) {
    return fencePendingImageJobLease(jobId, leaseId);
}

// 持有者续租。返回 null 表示所有权已经易主，调用方不应把它当成错误抛出——
// 停手就够了，收尾归新持有者。
export async function renewPendingImageJobLease(jobId, leaseId, { now = Date.now() } = {}) {
    const key = normalizeText(jobId).trim();
    if (!key) return null;
    return runTransaction('readwrite', (store, setOutput) => {
        const request = store.get(key);
        request.onsuccess = () => {
            const record = normalizePendingImageJob(request.result);
            if (!record || record.leaseId !== leaseId) {
                setOutput(null);
                return;
            }
            const renewed = { ...record, leaseExpiresAt: now + PENDING_JOB_LEASE_MS };
            store.put(renewed);
            setOutput(renewed);
        };
    });
}

// 不可逆操作前的所有权栅栏。续租和 claim 共用同一类 readwrite 事务，因此两者并发时
// 只有先提交的一方能继续：续租成功会把接管时间推后，接管成功则旧 leaseId 立即失效。
export async function fencePendingImageJobLease(jobId, leaseId, options) {
    const renewed = await renewPendingImageJobLease(jobId, leaseId, options);
    if (renewed) return renewed;
    const current = await getPendingImageJob(jobId);
    throw new PendingImageJobLostError(
        jobId,
        current ? '记录已被其他页面接管' : '记录已被清理',
    );
}

export async function listPendingImageJobs() {
    const records = await runTransaction('readonly', (store, setOutput) => {
        const request = store.getAll();
        request.onsuccess = () => setOutput(request.result || []);
    });
    return (records || []).map(normalizePendingImageJob).filter(Boolean);
}

export async function getPendingImageJob(jobId) {
    const key = normalizeText(jobId).trim();
    if (!key) return null;
    const record = await runTransaction('readonly', (store, setOutput) => {
        const request = store.get(key);
        request.onsuccess = () => setOutput(request.result || null);
    });
    return normalizePendingImageJob(record);
}

// 状态迁移与删除都只有租约持有者有权执行，因此一律要求 leaseId：
// 让易主后的旧流程写不进任何东西，是这套所有权模型唯一有意义的落点。

// 用户显式取消但取消请求没能送达后端时调用：这个事实必须跨刷新存活。
export async function markPendingImageJobCancelling(jobId, leaseId) {
    return setPendingImageJobState(jobId, leaseId, PendingJobState.CANCELLING);
}

// POST 得到确认后调用：此后后端查不到这个 jobId 就确实等于任务已消失。
export async function markPendingImageJobActive(jobId, leaseId) {
    return setPendingImageJobState(jobId, leaseId, PendingJobState.ACTIVE);
}

// 结果都处理完但槽位清理或后端删除还没落盘时调用。
export async function markPendingImageJobSettling(jobId, leaseId, settlement = null) {
    return setPendingImageJobState(jobId, leaseId, PendingJobState.SETTLING, {
        settlement: normalizeSettlement(settlement),
    });
}

async function setPendingImageJobState(jobId, leaseId, state, patch = {}) {
    const key = normalizeText(jobId).trim();
    return runTransaction('readwrite', (store, setOutput, fail) => {
        const request = store.get(key);
        request.onsuccess = () => {
            const record = normalizePendingImageJob(request.result);
            if (!record) return fail(new PendingImageJobLostError(key, '记录已被清理'));
            if (record.leaseId !== leaseId) {
                return fail(new PendingImageJobLostError(key, '记录已被其他页面接管'));
            }
            // 迁移状态本身就是一次推进，顺带续租：正常运行的记录不该因为跑得久而变成可接管。
            const statePatch = { ...patch };
            if (state === PendingJobState.SETTLING && !statePatch.settlement && record.state === PendingJobState.CANCELLING) {
                statePatch.settlement = normalizeSettlement({ mode: 'discard' });
            }
            let nextState = state;
            // Late async notifications must never move the journal backwards. In particular, a delayed
            // 'created' response cannot erase a cancellation intent, and a late abort cannot reopen settling.
            if (record.state === PendingJobState.SETTLING) nextState = PendingJobState.SETTLING;
            if (record.state === PendingJobState.CANCELLING && state === PendingJobState.ACTIVE) {
                nextState = PendingJobState.CANCELLING;
            }
            const updated = { ...record, ...statePatch, state: nextState, leaseExpiresAt: Date.now() + PENDING_JOB_LEASE_MS };
            store.put(updated);
            setOutput(updated);
        };
    });
}

export async function forgetPendingImageJob(jobId, leaseId) {
    const key = normalizeText(jobId).trim();
    if (!key) return false;
    return runTransaction('readwrite', (store, setOutput, fail) => {
        const request = store.get(key);
        request.onsuccess = () => {
            const record = normalizePendingImageJob(request.result);
            if (!record) return fail(new PendingImageJobLostError(key, '记录已被清理'));
            if (record.leaseId !== leaseId) {
                return fail(new PendingImageJobLostError(key, '记录已被其他页面接管'));
            }
            store.delete(key);
            setOutput(true);
        };
    });
}

// 渲染层用来区分「后台还在生成」和「画廊缓存真的丢了」。
// 每次渲染读一遍全量记录：条数受后端每用户任务上限约束，且必须是最新值。
export async function getPendingImageJobSlots() {
    const slots = new Map();
    const records = await listPendingImageJobs().catch(() => []);
    for (const record of records) {
        for (const item of record.items) {
            slots.set(item.slotId, {
                jobId: record.jobId,
                provider: record.provider,
                state: record.state,
                index: item.index,
                total: record.items.length,
            });
        }
    }
    return slots;
}
