'use strict';

const { createHash } = require('node:crypto');
const TERMINAL_JOB_STATES = new Set(['completed', 'cancelled']);
const DEFAULT_RETENTION_MS = 60 * 60 * 1000;
const DEFAULT_MAX_JOBS = 200;
const DEFAULT_MAX_JOBS_PER_OWNER = 20;
const DEFAULT_MAX_CONCURRENT_ITEMS = 4;
const DEFAULT_MAX_JOB_INPUT_BYTES = 8 * 1024 * 1024;
const DEFAULT_MAX_STORED_INPUT_BYTES = 64 * 1024 * 1024;
const DEFAULT_MAX_STORED_RESULT_BYTES = 512 * 1024 * 1024;
const MAX_RETAINED_ERROR_CHARS = 2048;

function errorMessage(error) {
    return String(error?.message || error || 'Image request failed');
}

function toItemError(error, fallbackCode = 'request_failed') {
    return {
        code: String(error?.code || fallbackCode).slice(0, 128),
        ...(Number.isInteger(error?.status) ? { status: error.status } : {}),
        message: errorMessage(error).slice(0, MAX_RETAINED_ERROR_CHARS),
    };
}

function createManagerError(message, code, status) {
    const error = new Error(message);
    error.code = code;
    error.status = status;
    return error;
}

function describeRequest({ provider, context, delay, items }) {
    const serialized = JSON.stringify({ provider, context, delay, items });
    return {
        inputBytes: Buffer.byteLength(serialized),
        signature: createHash('sha256').update(serialized).digest('hex'),
    };
}

function randomDelay({ min, max }, random) {
    if (min === max) return min;
    return Math.floor(min + random() * (max - min + 1));
}

class AsyncImageJobManager {
    // adapters: Record<provider, { normalize, execute }>。
    // execute({ owner, context, item, signal }) 必须在 signal abort 后 settle：
    // 取消和单项超时都只做 controller.abort()，adapter 若永不 settle，会永久占用一个
    // 并发槽并把 job 钉死在 running 状态——既不能被 deleteJob 删除，也不会进入 TTL 回收。
    constructor({
        adapters = {},
        now = Date.now,
        random = Math.random,
        retentionMs = DEFAULT_RETENTION_MS,
        maxJobs = DEFAULT_MAX_JOBS,
        maxJobsPerOwner = DEFAULT_MAX_JOBS_PER_OWNER,
        maxConcurrentItems = DEFAULT_MAX_CONCURRENT_ITEMS,
        maxJobInputBytes = DEFAULT_MAX_JOB_INPUT_BYTES,
        maxStoredInputBytes = DEFAULT_MAX_STORED_INPUT_BYTES,
        maxStoredResultBytes = DEFAULT_MAX_STORED_RESULT_BYTES,
    } = {}) {
        this.adapters = Object.assign(Object.create(null), adapters);
        this.now = now;
        this.random = random;
        this.retentionMs = retentionMs;
        this.maxJobs = maxJobs;
        this.maxJobsPerOwner = maxJobsPerOwner;
        this.maxConcurrentItems = Math.max(1, maxConcurrentItems);
        this.maxJobInputBytes = maxJobInputBytes;
        this.maxStoredInputBytes = maxStoredInputBytes;
        this.maxStoredResultBytes = maxStoredResultBytes;
        this.activeItems = 0;
        this.storedInputBytes = 0;
        this.storedResultBytes = 0;
        this.jobs = new Map();
        this.schedulers = new Map();
        this.closed = false;
    }

    createJob({ owner, provider, requestId, context, delay, items }) {
        if (this.closed) throw new Error('Image job manager is closed');
        if (!this.adapters[provider]) throw createManagerError('Unknown image job provider', 'invalid_provider', 400);
        if (typeof requestId !== 'string' || requestId.length === 0) {
            throw createManagerError('requestId is required', 'invalid_request', 400);
        }
        const { inputBytes, signature: requestSignature } = describeRequest({ provider, context, delay, items });
        const storageKey = this.#jobKey(owner, requestId);
        const existing = this.jobs.get(storageKey);
        if (existing) {
            if (existing.requestSignature !== requestSignature) {
                throw createManagerError('requestId was already used for a different image job', 'request_id_conflict', 409);
            }
            return this.#snapshot(existing);
        }
        if (this.jobs.size >= this.maxJobs || this.#ownerJobs(owner).length >= this.maxJobsPerOwner) {
            throw createManagerError('Too many retained image jobs', 'job_limit', 429);
        }
        if (inputBytes > this.maxJobInputBytes) {
            throw createManagerError('Image job input is too large', 'job_input_limit', 413);
        }
        if (this.storedInputBytes + inputBytes > this.maxStoredInputBytes) {
            throw createManagerError('Image job queued input storage limit reached', 'job_input_limit', 429);
        }
        const timestamp = this.now();
        const job = {
            id: requestId,
            storageKey,
            owner,
            provider,
            requestSignature,
            inputBytes,
            state: 'queued',
            createdAt: timestamp,
            updatedAt: timestamp,
            finishedAt: null,
            cooldownUntil: null,
            delay: { min: delay.min, max: delay.max },
            context,
            cancelRequested: false,
            expiryTimer: null,
            items: items.map((item, index) => ({
                index,
                kind: item.kind,
                request: item.request,
                timeout: item.timeout,
                state: 'queued',
                result: null,
                error: null,
            })),
        };
        this.jobs.set(storageKey, job);
        this.storedInputBytes += inputBytes;
        this.#enqueueJob(job);
        queueMicrotask(() => this.#pump(owner));
        return this.#snapshot(job);
    }

    // 客户端重连后用来发现自己名下仍然存活的任务：浏览器可能刷新、断网或换标签页，
    // 只有 owner 作用域的列表才能把 jobId 重新对上本地的交付日志。
    listJobs(owner) {
        return this.#ownerJobs(owner)
            .sort((left, right) => left.createdAt - right.createdAt || (left.id < right.id ? -1 : 1))
            .map(job => this.#snapshot(job));
    }

    getJob(owner, jobId) {
        const job = this.#ownedJob(owner, jobId);
        return job ? this.#snapshot(job) : null;
    }

    getResult(owner, jobId, index) {
        const job = this.#ownedJob(owner, jobId);
        if (!job) return null;
        const item = job.items[index];
        if (!item || item.index !== index) return null;
        if (item.state === 'ready') {
            return { state: 'ready', buffer: item.result.buffer, mime: item.result.mime };
        }
        return { state: item.state, error: item.error };
    }

    consumeResult(owner, jobId, index) {
        const job = this.#ownedJob(owner, jobId);
        if (!job) return null;
        const item = job.items[index];
        if (!item || item.index !== index) return null;
        if (item.state === 'consumed') return { ok: true, consumed: true };
        if (item.state !== 'ready') return { ok: false, state: item.state, error: item.error };
        this.#releaseResult(item);
        item.state = 'consumed';
        job.updatedAt = this.now();
        return { ok: true, consumed: true };
    }

    cancelJob(owner, jobId) {
        const job = this.#ownedJob(owner, jobId);
        if (!job) return null;
        if (TERMINAL_JOB_STATES.has(job.state) && !this.#isRunning(job)) {
            return this.#snapshot(job);
        }

        job.cancelRequested = true;
        job.updatedAt = this.now();
        this.#discardSecrets(job, true);
        const scheduler = this.schedulers.get(owner);
        if (scheduler) {
            scheduler.queue = scheduler.queue.filter(key => key !== job.storageKey);
            if (scheduler.active?.jobId === job.id) scheduler.active.controller.abort();
        }
        if (!this.#isRunning(job)) {
            this.#finalizeJob(job, 'cancelled');
        }
        queueMicrotask(() => this.#pump(owner));
        return this.#snapshot(job);
    }

    deleteJob(owner, jobId) {
        const job = this.#ownedJob(owner, jobId);
        if (!job) return null;
        if (!TERMINAL_JOB_STATES.has(job.state) || this.#isRunning(job)) {
            return { ok: false, state: job.state };
        }
        this.#deleteStoredJob(job);
        return { ok: true };
    }

    close() {
        if (this.closed) return;
        this.closed = true;
        for (const scheduler of this.schedulers.values()) {
            if (scheduler.timer) clearTimeout(scheduler.timer);
            scheduler.active?.controller.abort();
        }
        for (const job of this.jobs.values()) {
            if (job.expiryTimer) clearTimeout(job.expiryTimer);
            this.#discardSecrets(job, true);
            for (const item of job.items) this.#releaseResult(item);
        }
        this.jobs.clear();
        this.schedulers.clear();
        this.activeItems = 0;
        this.storedInputBytes = 0;
        this.storedResultBytes = 0;
    }

    #jobKey(owner, jobId) {
        return `${owner}\0${jobId}`;
    }

    #ownedJob(owner, jobId) {
        return this.jobs.get(this.#jobKey(owner, jobId)) || null;
    }

    #ownerJobs(owner) {
        return [...this.jobs.values()].filter(job => job.owner === owner);
    }

    #getScheduler(owner) {
        let scheduler = this.schedulers.get(owner);
        if (!scheduler) {
            scheduler = {
                owner,
                queue: [],
                active: null,
                timer: null,
                cooldownUntil: null,
            };
            this.schedulers.set(owner, scheduler);
        }
        return scheduler;
    }

    #enqueueJob(job) {
        const scheduler = this.#getScheduler(job.owner);
        if (!scheduler.queue.includes(job.storageKey)) scheduler.queue.push(job.storageKey);
    }

    #pump(owner) {
        if (this.closed) return;
        const scheduler = this.schedulers.get(owner);
        if (!scheduler || scheduler.active || scheduler.timer) return;
        if (this.activeItems >= this.maxConcurrentItems) return;

        while (scheduler.queue.length > 0) {
            const storageKey = scheduler.queue.shift();
            const job = this.jobs.get(storageKey);
            if (!job || job.owner !== owner || job.cancelRequested || TERMINAL_JOB_STATES.has(job.state)) continue;
            const item = job.items.find(candidate => candidate.state === 'queued');
            if (!item) {
                this.#finalizeJob(job, 'completed');
                continue;
            }
            this.activeItems++;
            void this.#runItem(scheduler, job, item);
            return;
        }

        if (!scheduler.active && !scheduler.timer) this.schedulers.delete(owner);
    }

    async #runItem(scheduler, job, item) {
        const controller = new AbortController();
        const execution = {
            owner: job.owner,
            context: job.context,
            item: { kind: item.kind, request: item.request, timeout: item.timeout },
            signal: controller.signal,
        };
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, item.timeout);
        timeoutId.unref?.();

        scheduler.active = { jobId: job.id, itemIndex: item.index, controller };
        job.state = 'running';
        job.updatedAt = this.now();
        item.state = 'running';

        try {
            const result = await this.adapters[job.provider].execute(execution);
            if (job.cancelRequested) {
                item.state = 'cancelled';
            } else if (timedOut) {
                item.state = 'failed';
                item.error = { code: 'timeout', message: 'Image request timed out' };
            } else if (!result || !Buffer.isBuffer(result.buffer) || !String(result.mime || '')) {
                throw new Error('Image job adapter returned an invalid result');
            } else if (this.storedResultBytes + result.buffer.length > this.maxStoredResultBytes) {
                item.state = 'failed';
                item.error = {
                    code: 'result_storage_limit',
                    message: 'Image result storage limit reached',
                };
            } else {
                item.state = 'ready';
                item.result = { buffer: result.buffer, mime: String(result.mime) };
                this.storedResultBytes += result.buffer.length;
            }
        } catch (error) {
            if (job.cancelRequested) {
                item.state = 'cancelled';
            } else if (timedOut) {
                item.state = 'failed';
                item.error = { code: 'timeout', message: 'Image request timed out' };
            } else {
                item.state = 'failed';
                item.error = toItemError(error);
            }
        } finally {
            clearTimeout(timeoutId);
            item.request = null;
            job.updatedAt = this.now();
            scheduler.active = null;
            this.activeItems = Math.max(0, this.activeItems - 1);
        }

        if (this.closed || !this.jobs.has(job.storageKey)) {
            this.#releaseResult(item);
            return;
        }

        const hasQueuedItems = job.items.some(candidate => candidate.state === 'queued');
        if (job.cancelRequested) {
            this.#finalizeJob(job, 'cancelled');
        } else if (!hasQueuedItems) {
            this.#finalizeJob(job, 'completed');
        }
        this.#startCooldown(scheduler, job, hasQueuedItems && !job.cancelRequested);
        this.#pumpAll();
    }

    #startCooldown(scheduler, job, requeueJob) {
        if (this.closed) return;
        const duration = randomDelay(job.delay, this.random);
        if (requeueJob && this.jobs.has(job.storageKey) && !job.cancelRequested) {
            job.state = 'cooldown';
            job.updatedAt = this.now();
            this.#enqueueJob(job);
        }
        const finishCooldown = () => {
            if (this.closed) return;
            scheduler.timer = null;
            scheduler.cooldownUntil = null;
            const storedJob = this.jobs.get(job.storageKey);
            if (storedJob) storedJob.cooldownUntil = null;
            if (requeueJob && storedJob && !storedJob.cancelRequested && !TERMINAL_JOB_STATES.has(storedJob.state)) {
                storedJob.state = 'queued';
                storedJob.updatedAt = this.now();
            }
            this.#pump(scheduler.owner);
        };

        if (duration <= 0) {
            queueMicrotask(finishCooldown);
            return;
        }

        const cooldownUntil = this.now() + duration;
        scheduler.cooldownUntil = cooldownUntil;
        if (requeueJob) job.cooldownUntil = cooldownUntil;
        scheduler.timer = setTimeout(finishCooldown, duration);
        scheduler.timer.unref?.();
    }

    #isRunning(job) {
        return this.schedulers.get(job.owner)?.active?.jobId === job.id;
    }

    #pumpAll() {
        if (this.closed) return;
        for (const owner of this.schedulers.keys()) this.#pump(owner);
    }

    #discardSecrets(job, cancelQueued) {
        job.context = null;
        for (const item of job.items) {
            if (cancelQueued && item.state === 'queued') item.state = 'cancelled';
            if (item.state !== 'running') {
                item.request = null;
            }
        }
    }

    #finalizeJob(job, state) {
        job.state = state;
        job.updatedAt = this.now();
        if (job.finishedAt === null) job.finishedAt = job.updatedAt;
        this.#discardSecrets(job, state === 'cancelled');
        this.#releaseInput(job);
        if (job.expiryTimer || this.retentionMs < 0) return;
        job.expiryTimer = setTimeout(() => this.#deleteStoredJob(job), this.retentionMs);
        job.expiryTimer.unref?.();
    }

    #deleteStoredJob(job) {
        if (job.expiryTimer) clearTimeout(job.expiryTimer);
        for (const item of job.items) this.#releaseResult(item);
        this.#releaseInput(job);
        this.jobs.delete(job.storageKey);
        const scheduler = this.schedulers.get(job.owner);
        if (scheduler) scheduler.queue = scheduler.queue.filter(key => key !== job.storageKey);
    }

    #releaseInput(job) {
        if (!job.inputBytes) return;
        this.storedInputBytes = Math.max(0, this.storedInputBytes - job.inputBytes);
        job.inputBytes = 0;
    }

    #releaseResult(item) {
        if (item.result?.buffer) {
            this.storedResultBytes = Math.max(0, this.storedResultBytes - item.result.buffer.length);
        }
        item.result = null;
    }

    #queueAhead(job) {
        const scheduler = this.schedulers.get(job.owner);
        if (!scheduler || scheduler.active?.jobId === job.id) return 0;
        const index = scheduler.queue.indexOf(job.storageKey);
        if (index < 0) return 0;
        // #pump 会把正在执行的任务移出 queue，但它确实排在等待者前面，不计入就会少报一个。
        return scheduler.active ? index + 1 : index;
    }

    #snapshot(job) {
        const count = state => job.items.filter(item => item.state === state).length;
        const scheduler = this.schedulers.get(job.owner);
        const waitingForOwnerCooldown = job.state === 'queued'
            && scheduler?.timer
            && scheduler.queue[0] === job.storageKey;
        return {
            id: job.id,
            provider: job.provider,
            state: waitingForOwnerCooldown ? 'cooldown' : job.state,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            cooldownUntil: waitingForOwnerCooldown ? scheduler.cooldownUntil : job.cooldownUntil,
            total: job.items.length,
            ready: count('ready'),
            consumed: count('consumed'),
            failed: count('failed'),
            cancelled: count('cancelled'),
            queueAhead: this.#queueAhead(job),
            items: job.items.map(item => ({
                index: item.index,
                state: item.state,
                kind: item.kind,
                ...(item.error ? { error: { ...item.error } } : {}),
            })),
        };
    }
}

function createAsyncImageJobManager(options) {
    return new AsyncImageJobManager(options);
}

module.exports = {
    createAsyncImageJobManager,
};
