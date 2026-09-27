import { DRAW_SLOT_COPY, DRAW_SLOT_ERRORS } from './image-record.js';
import { isPendingJobLeaseLost } from './recoverable-image-jobs.js';
import { subscribeDrawRunActivity } from './draw-run-activity.js';

export class FloorImageBusyError extends Error {
    constructor() { super(DRAW_SLOT_COPY.floorBusy); }
}

// The provider's existing registry owns every batch, including capsule planning.
// Settled siblings stay here only until the last batch of that message releases.
export function getFloorImageJobs(jobs, ctx, messageId, target) {
    const message = target?.message ?? ctx.chat?.[messageId];
    return message ? [...jobs.values()].filter(job => !job.released && job.message === message
        && job.chatId === (target?.chatId ?? String(ctx.chatId))
        && job.swipeIndex === (target?.swipeIndex ?? message.swipe_id ?? 0)) : [];
}

export function getFloorImageJob(jobs, ctx, messageId) {
    return getFloorImageJobs(jobs, ctx, messageId)[0];
}

// SillyTavern splices swipes before emitting MESSAGE_SWIPE_DELETED. Rebase
// runtime jobs once at that boundary; a removed branch must never alias its
// replacement. Keep its in-flight result owned until normal settlement.
export function rebaseFloorImageJobsAfterSwipeDeletion(jobs, ctx, { messageId, swipeId }) {
    const message = ctx.chat?.[messageId];
    for (const job of jobs.values()) {
        if (!message || job.message !== message || job.chatId !== String(ctx.chatId)) continue;
        if (job.swipeIndex === swipeId) job.swipeIndex = -1;
        else if (job.swipeIndex > swipeId) job.swipeIndex--;
    }
}

export function resolveFloorImageJobTarget(job, ctx) {
    const messageId = ctx.chat?.indexOf(job.message) ?? -1;
    if (String(ctx.chatId) !== job.chatId || messageId < 0
        || (job.message.swipe_id ?? 0) !== job.swipeIndex) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    return { ctx, message: job.message, messageId };
}

export function acquireFloorImageJob(jobs, ctx, messageId, create, { join = false, scope = 'floor' } = {}) {
    const message = scope === 'floor' ? ctx.chat?.[messageId] : null;
    if (scope === 'floor' && !message) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    if (message && !join && getFloorImageJob(jobs, ctx, messageId)) throw new FloorImageBusyError();
    const job = { ...create(), registry: jobs, chatId: String(ctx.chatId), message, messageId,
        swipeIndex: message?.swipe_id ?? 0, state: 'queued', current: 0, total: 0, success: 0,
        unknown: 0, aborted: false, settled: false, released: false };
    jobs.set(job, job);
    return job;
}

function siblings(job) {
    return [...job.registry.values()].filter(item => item === job || job.message
        && item.message === job.message && item.chatId === job.chatId);
}

export function getFloorImageState(jobs, ctx, messageId) {
    const message = ctx.chat?.[messageId];
    const visible = [...jobs.values()].filter(item => message && item.message === message
        && item.chatId === String(ctx.chatId) && item.swipeIndex === (message.swipe_id ?? 0));
    if (!visible.length) return null;
    const summary = visible.reduce((sum, item) => ({ total: sum.total + item.total,
        current: sum.current + item.current, success: sum.success + item.success,
        unknown: sum.unknown + item.unknown, aborted: sum.aborted || item.aborted,
    }), { total: 0, current: 0, success: 0, unknown: 0, aborted: false });
    const active = visible.find(item => !item.settled && !item.released && item.state !== 'queued')
        ?? visible.find(item => !item.settled && !item.released);
    const uncertain = visible.find(item => item.state === 'uncertain');
    const failed = visible.find(item => item.state === 'error');
    const state = active ? active.state : summary.unknown ? 'error' : uncertain ? 'uncertain' : failed ? 'error'
        : summary.aborted && summary.success === 0 ? 'idle'
            : summary.success < summary.total ? 'partial' : 'success';
    return { state, data: { ...(active?.data || uncertain?.data || failed?.data), ...summary,
        ...(!active && summary.unknown ? { error: DRAW_SLOT_ERRORS.unknown } : {}) } };
}

function publish(job) {
    if (!job.registry.has(job)) return;
    const live = job.context?.();
    if (!live || !job.message || String(live.chatId) !== job.chatId) return;
    const messageId = live.chat?.indexOf(job.message) ?? -1;
    const snapshot = getFloorImageState(job.registry, live, messageId);
    if (!snapshot) return;
    // Each consumer receives the same projection, never its private batch count.
    for (const item of siblings(job)) if (item.swipeIndex === (job.message.swipe_id ?? 0)) {
        item.report?.(snapshot.state, snapshot.data, messageId);
    }
}

export function observeFloorImageJob(job, { getCurrentContext, onStateChange, classifyError }) {
    job.context = getCurrentContext;
    job.report = onStateChange;
    job.classifyError = classifyError;
    if (siblings(job).filter(item => item.swipeIndex === job.swipeIndex).length === 1) {
        onStateChange?.('idle', {}, job.messageId);
    }
    publish(job);
    const update = (state, data = {}) => {
        if (data.runId && !job.runId) {
            job.runId = data.runId;
            job.unsubscribe = subscribeDrawRunActivity(detail => {
                if (detail.runId !== job.runId || String(detail.chatId) !== job.chatId) return;
                if (detail.phase === 'completed') {
                    update('success', detail);
                    releaseFloorImageJob(job.registry, job);
                } else if (detail.phase === 'reconciled') {
                    job.settled = true;
                    job.aborted = job.controller.signal.aborted;
                    job.state = job.aborted ? 'idle' : 'error';
                    releaseFloorImageJob(job.registry, job);
                } else {
                    update(detail.phase === 'active' ? 'accepted' : detail.phase === 'cancel_failed' ? 'accepted' : detail.phase, detail);
                }
            });
        }
        job.current = data.current ?? job.current;
        job.total = data.total ?? job.total;
        job.data = data;
        job.state = state === 'progress' ? 'gen' : state === 'delivering' ? 'accepted' : state;
        if (state === 'success') {
            Object.assign(job, { current: job.total, success: data.success ?? 0,
                unknown: data.unknown ?? 0, aborted: data.aborted === true, settled: true });
            if (job.unknown) job.state = 'uncertain';
        }
        publish(job);
    };
    return update;
}

export function failFloorImageJob(job, error) {
    error.drawTaskReported = true;
    job.settled = !job.runId || !error?.uncertain;
    if (error?.detached || error?.uncertain || isPendingJobLeaseLost(error)) job.state = 'uncertain';
    else if (job.controller.signal.aborted) job.aborted = true;
    else { job.state = 'error'; job.data = { error: job.classifyError?.(error) }; }
    publish(job);
}

export function getFloorImagePhase(job) {
    return job && !job.settled && !job.released ? job.runId ? job.state : job.phase ?? job.state : null;
}

export function releaseFloorImageJob(jobs, job) {
    if (!job || job.released) return;
    // An accepted/unknown Draw Run is still owned by its existing recovery flow.
    // Its transient batch projection must not turn handoff into 0/0 success.
    if (job.runId && !job.settled) { publish(job); return; }
    job.unsubscribe?.();
    job.released = true;
    publish(job);
    const cohort = siblings(job);
    if (cohort.every(item => item.released)) for (const item of cohort) jobs.delete(item);
}

export function clearFloorImageJobs(jobs) {
    for (const job of jobs.values()) job.unsubscribe?.();
    jobs.clear();
}
