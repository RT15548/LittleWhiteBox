import { classifyMissingDrawRun } from './draw-run-coordinator.js';
import {
    findDrawRunPageFarewell,
    findJobPageFarewell,
    PAGE_FAREWELL_PREPARING_GRACE_MS,
} from './page-farewell.js';
import { PendingJobAdoptionPhase, PendingJobState } from './pending-image-jobs.js';

export const DrawRunRecoveryAction = Object.freeze({
    WAIT: 'wait',
    ADOPT: 'adopt',
    RECOVER_ADOPTION: 'recover_adoption',
    ABANDON_ADOPTION: 'abandon_adoption',
    DROP_STALE_LOCAL_MARKER: 'drop_stale_local_marker',
    REQUEST_CANCEL: 'request_cancel',
    CLEAR_MISSING_MARKER: 'clear_missing_marker',
    SETTLE_TERMINAL: 'settle_terminal',
});

export const DrawRunAdoptionRecoveryStatus = Object.freeze({
    COMPLETED: 'completed',
    LEASE_ACTIVE: 'lease_active',
    BLOCKED: 'blocked',
});

export const DrawRunPendingAdoptionAction = Object.freeze({
    WAIT_FOR_TARGET: 'wait_for_target',
    FALLBACK_TO_GALLERY: 'fallback_to_gallery',
});

export const DRAW_RUN_BLOCKED_RETRY_MS = 15_000;
export const DRAW_RUN_PROGRESS_POLL_MS = 3_000;

const TERMINAL_STATES = new Set(['failed', 'cancelled']);
const HANDOFF_STATES = new Set(['dispatched', 'child_expired']);

function targetsInactiveChat(record, activeChatId) {
    const targetChatId = String(record?.chatTarget?.chatId || '');
    return Boolean(activeChatId && targetChatId && targetChatId !== activeChatId);
}

function planPendingAdoption({ markerEntry, run, record, runFarewell, now }) {
    if (run && HANDOFF_STATES.has(run.state) && run.handoffManifest) {
        return markerEntry
            ? { action: DrawRunRecoveryAction.ADOPT }
            : { action: DrawRunRecoveryAction.RECOVER_ADOPTION };
    }
    if (!run) {
        const createdAt = markerEntry?.marker?.createdAt ?? record?.createdAt;
        return classifyMissingDrawRun(createdAt, now, runFarewell) === 'wait'
            ? {
                action: DrawRunRecoveryAction.WAIT,
                reason: 'missing_run_uncertain',
                ...(runFarewell ? {
                    retryAt: runFarewell.at + PAGE_FAREWELL_PREPARING_GRACE_MS,
                } : {}),
            }
            : { action: DrawRunRecoveryAction.ABANDON_ADOPTION, reason: 'run_missing' };
    }
    if (run.state === 'dispatched' && run.childJobId) {
        // 正常服务端会原子地暴露 childJobId 与 manifest；若契约被破坏，宁可等待
        // child 终态也不能 ACK Draw Run，让仍在运行的生图任务成为无人接管的孤儿。
        return { action: DrawRunRecoveryAction.WAIT, reason: 'handoff_manifest_missing' };
    }
    if (TERMINAL_STATES.has(run.state) || HANDOFF_STATES.has(run.state)) {
        return { action: DrawRunRecoveryAction.ABANDON_ADOPTION, reason: 'run_has_no_handoff' };
    }
    return { action: DrawRunRecoveryAction.WAIT, reason: 'run_in_progress' };
}

export function planDrawRunRecovery({
    markers = [],
    runs = [],
    records = [],
    farewells = [],
    currentChatId = '',
    now = Date.now(),
} = {}) {
    const activeChatId = String(currentChatId || '');
    const runsById = new Map((Array.isArray(runs) ? runs : [])
        .filter(run => typeof run?.id === 'string' && run.id)
        .map(run => [run.id, run]));
    const recordsByOrigin = new Map((Array.isArray(records) ? records : [])
        .filter(record => typeof record?.originRunId === 'string' && record.originRunId)
        .map(record => [record.originRunId, record]));
    const claimedRuns = new Set();
    const plan = [];

    for (const markerEntry of Array.isArray(markers) ? markers : []) {
        const runId = markerEntry?.runId;
        if (!runId) continue;
        const run = runsById.get(runId) || null;
        const record = recordsByOrigin.get(runId) || null;
        const runFarewell = findDrawRunPageFarewell(farewells, runId);
        const jobFarewell = record
            ? findJobPageFarewell(farewells, record.jobId, record.leaseId)
            : null;
        if (run) claimedRuns.add(runId);

        const cancellationRequested = Number(markerEntry.marker?.cancelRequestedAt) > 0;
        const cancellationReachedBackend = Number(run?.cancelRequestedAt) > 0;
        if (cancellationRequested && run && !cancellationReachedBackend
            && !TERMINAL_STATES.has(run.state) && run.state !== 'child_expired') {
            plan.push({
                action: DrawRunRecoveryAction.REQUEST_CANCEL,
                markerEntry,
                run,
                record,
                runFarewell,
                jobFarewell,
            });
            continue;
        }

        if (record && record.state !== PendingJobState.ADOPTING) {
            plan.push({
                action: DrawRunRecoveryAction.DROP_STALE_LOCAL_MARKER,
                markerEntry,
                run,
                record,
                runFarewell,
                jobFarewell,
            });
            continue;
        }
        if (record?.state === PendingJobState.ADOPTING) {
            if (targetsInactiveChat(record, activeChatId)) {
                plan.push({
                    action: DrawRunRecoveryAction.WAIT,
                    reason: 'target_chat_inactive',
                    markerEntry,
                    run,
                    record,
                    runFarewell,
                    jobFarewell,
                });
                continue;
            }
            const decision = record.adoptionPhase === PendingJobAdoptionPhase.PENDING
                ? planPendingAdoption({ markerEntry, run, record, runFarewell, now })
                : { action: DrawRunRecoveryAction.RECOVER_ADOPTION };
            plan.push({ ...decision, markerEntry, run, record, runFarewell, jobFarewell });
            continue;
        }
        if (!run) {
            const waiting = classifyMissingDrawRun(markerEntry.marker?.createdAt, now, runFarewell) === 'wait';
            plan.push({
                action: waiting
                    ? DrawRunRecoveryAction.WAIT
                    : DrawRunRecoveryAction.CLEAR_MISSING_MARKER,
                ...(waiting && runFarewell ? {
                    retryAt: runFarewell.at + PAGE_FAREWELL_PREPARING_GRACE_MS,
                } : {}),
                markerEntry,
                run: null,
                record: null,
                runFarewell,
                jobFarewell: null,
            });
            continue;
        }
        if (HANDOFF_STATES.has(run.state) && run.handoffManifest) {
            plan.push({
                action: DrawRunRecoveryAction.ADOPT,
                markerEntry,
                run,
                record: null,
                runFarewell,
                jobFarewell: null,
            });
            continue;
        }
        if (TERMINAL_STATES.has(run.state) || run.state === 'child_expired') {
            plan.push({
                action: DrawRunRecoveryAction.SETTLE_TERMINAL,
                markerEntry,
                run,
                record,
                runFarewell,
                jobFarewell,
            });
            continue;
        }
        plan.push({
            action: DrawRunRecoveryAction.WAIT,
            reason: 'run_in_progress',
            markerEntry,
            run,
            record,
            runFarewell,
            jobFarewell,
        });
    }

    const markerRunIds = new Set((Array.isArray(markers) ? markers : []).map(entry => entry?.runId).filter(Boolean));
    for (const record of recordsByOrigin.values()) {
        if (markerRunIds.has(record.originRunId) || record.state !== PendingJobState.ADOPTING) continue;
        const run = runsById.get(record.originRunId) || null;
        const runFarewell = findDrawRunPageFarewell(farewells, record.originRunId);
        const jobFarewell = findJobPageFarewell(farewells, record.jobId, record.leaseId);
        if (run) claimedRuns.add(run.id);
        if (targetsInactiveChat(record, activeChatId)) {
            plan.push({
                action: DrawRunRecoveryAction.WAIT,
                reason: 'target_chat_inactive',
                markerEntry: null,
                run,
                record,
                runFarewell,
                jobFarewell,
            });
            continue;
        }
        const decision = record.adoptionPhase === PendingJobAdoptionPhase.PENDING
            ? planPendingAdoption({ markerEntry: null, run, record, runFarewell, now })
            : { action: DrawRunRecoveryAction.RECOVER_ADOPTION };
        plan.push({
            ...decision,
            markerEntry: null,
            run,
            record,
            runFarewell,
            jobFarewell,
        });
    }

    const unclaimed = [...runsById.values()].filter(run => (
        !claimedRuns.has(run.id) && !recordsByOrigin.has(run.id)
    ));
    return { plan, unclaimed };
}

export function planPendingAdoptionRecovery({ persistedMarkerPresent } = {}) {
    if (typeof persistedMarkerPresent !== 'boolean') {
        throw new TypeError('Draw Run pending adoption 缺少持久化 marker 判定');
    }
    return persistedMarkerPresent
        ? { action: DrawRunPendingAdoptionAction.WAIT_FOR_TARGET, reason: 'marker_present' }
        : {
            action: DrawRunPendingAdoptionAction.FALLBACK_TO_GALLERY,
            delivery: { mode: 'gallery', reason: 'target_missing' },
        };
}

export function planDrawRunAdoptionRetry(outcome, { now = Date.now() } = {}) {
    if (outcome?.status === DrawRunAdoptionRecoveryStatus.COMPLETED) return null;
    if (outcome?.status === DrawRunAdoptionRecoveryStatus.LEASE_ACTIVE) {
        const leaseExpiresAt = Number(outcome.leaseExpiresAt);
        if (Number.isFinite(leaseExpiresAt) && leaseExpiresAt > now) {
            return Math.max(100, leaseExpiresAt - now + 10);
        }
    }
    return DRAW_RUN_BLOCKED_RETRY_MS;
}

export function planDrawRunPollDelay(plan = [], { now = Date.now() } = {}) {
    const waits = (Array.isArray(plan) ? plan : []).filter(entry => (
        entry?.action === DrawRunRecoveryAction.WAIT
        && entry.reason !== 'target_chat_inactive'
    ));
    if (waits.length === 0) return null;
    return Math.min(...waits.map((entry) => {
        if (entry.reason === 'run_in_progress') return DRAW_RUN_PROGRESS_POLL_MS;
        const retryAt = Number(entry.retryAt);
        if (Number.isFinite(retryAt)) return Math.max(100, retryAt - now + 10);
        return DRAW_RUN_BLOCKED_RETRY_MS;
    }));
}
