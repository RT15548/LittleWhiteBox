import {
    type AcceptedTurnChatSurface,
    type AcceptedTurnSource,
    captureAutomaticAcceptedTurn,
    captureManualAcceptedTurn,
    captureRebuildSource,
    matchesAcceptedTurnSource,
} from './accepted-turn-source.js';
import { createFifoCoordinator } from './fifo-coordinator.js';
import { createMaintenanceJobExecutor, type MaintenanceGateway, type MaintenanceJobExecutorHooks } from './job-executor.js';
import {
    cancelledJobOutcome,
    failedJobOutcome,
    jobParticipantIds,
    type MaintenanceQueuedJob,
    type MaintenanceSessionRun,
} from './job.js';
import { createMaintenanceOutcome, type MaintenanceRunOutcome } from './outcome.js';
import type { MaintenanceMode, MaintenanceParticipant, MaintenanceRegistry } from './registry.js';
import { ALWAYS_READY_WRITE_GATE, type MaintenanceRootWriteGate } from './root-write-gate.js';
import { observeBackgroundTask } from '../../../../shared/common/async-errors.js';


type MaintenanceState = 'idle' | 'running' | 'error';

export type { MaintenanceRunOutcome, MaintenanceParticipantOutcome } from './outcome.js';

export interface MaintenanceStatus {
    readonly state: MaintenanceState;
    readonly mode: MaintenanceMode | null;
    readonly message: string;
    readonly reason: string;
    readonly lastRunAt: number | null;
}

export type MaintenanceStartResult =
    | {
        readonly status: 'started';
        readonly mode: 'manual' | 'rebuild';
        readonly completion: Promise<MaintenanceRunOutcome>;
    }
    | {
        readonly status: 'busy';
        readonly mode: 'manual' | 'rebuild';
        readonly reason: 'participant-busy';
    }
    | {
        readonly status: 'skipped';
        readonly mode: 'manual' | 'rebuild';
        readonly reason: string;
        readonly outcome: MaintenanceRunOutcome;
    };

type MessageSentSubscription = (listener: (messageIndex: number) => void) => () => void;

export interface MaintenanceRunnerDependencies {
    readonly registry: MaintenanceRegistry;
    readonly gateway: MaintenanceGateway;
    readonly captureSurface: () => AcceptedTurnChatSurface | null;
    readonly isGenerationActive: () => boolean;
    readonly writeGate?: MaintenanceRootWriteGate;
    readonly schedule?: (callback: () => void) => void;
    readonly now?: () => number;
    readonly onError?: (error: unknown) => void;
    readonly captureBackground?: MaintenanceJobExecutorHooks['captureBackground'];
}

export interface MaintenanceRunner {
    startBackground: (subscribeMessageSent: MessageSentSubscription) => void;
    stopBackground: () => void;
    handleMessageSent: (messageIndex: number) => boolean;
    startManual: (participantId: string) => MaintenanceStartResult;
    startRebuild: (participantId: string) => MaintenanceStartResult;
    cancelRequested: (participantId: string, reason: string) => void;
    invalidateAutomatic: (participantId: string, reason: string) => void;
    handleChatChanged: () => void;
    cancelAll: (reason?: string) => void;
    getStatus: (participantId: string, chatIdentity: string) => MaintenanceStatus;
    subscribeStatus: (
        listener: (participantId: string, chatIdentity: string, status: MaintenanceStatus) => void,
    ) => () => void;
}

const IDLE_STATUS: MaintenanceStatus = Object.freeze({
    state: 'idle',
    mode: null,
    message: '',
    reason: '',
    lastRunAt: null,
});

export function createMaintenanceRunner({
    registry,
    gateway,
    captureSurface,
    isGenerationActive,
    writeGate = ALWAYS_READY_WRITE_GATE,
    schedule = callback => queueMicrotask(callback),
    now = () => Date.now(),
    onError = () => undefined,
    captureBackground = async () => [],
}: MaintenanceRunnerDependencies): MaintenanceRunner {
    const queue = createFifoCoordinator<MaintenanceQueuedJob>();
    const statuses = new Map<string, Map<string, MaintenanceStatus>>();
    const manualTokens: Record<string, number> = Object.create(null) as Record<string, number>;
    const automaticTokens: Record<string, number> = Object.create(null) as Record<string, number>;
    const statusListeners = new Set<(
        participantId: string,
        chatIdentity: string,
        status: MaintenanceStatus,
    ) => void>();
    let epoch = 0;
    let scheduled = false;
    let processing = false;
    let activeJob: MaintenanceQueuedJob | null = null;
    let unsubscribeMessageSent: (() => void) | null = null;

    const report = (error: unknown): void => {
        try {onError(error);} catch (caughtError) { console.warn({ source: import.meta.url, operation: "report" }, caughtError); }
    };
    const token = (tokens: Record<string, number>, id: string): number => tokens[id] || 0;
    const sourceIsCurrent = (job: MaintenanceQueuedJob): boolean => {
        try {return matchesAcceptedTurnSource(captureSurface(), job.source);}
        catch (error) {report(error); return false;}
    };
    const currentChatIdentity = (): string => {
        try {return String(captureSurface()?.identityKey || '').trim();}
        catch (error) {report(error); return '';}
    };
    const updateStatus = (
        chatIdentity: string,
        participantId: string,
        patch: Partial<MaintenanceStatus>,
    ): void => {
        if (!chatIdentity || !participantId) {return;}
        let chatStatuses = statuses.get(chatIdentity);
        if (!chatStatuses) {
            chatStatuses = new Map<string, MaintenanceStatus>();
            statuses.set(chatIdentity, chatStatuses);
        }
        const previous = chatStatuses.get(participantId) || IDLE_STATUS;
        const next = Object.freeze({ ...previous, ...patch });
        chatStatuses.set(participantId, next);
        for (const listener of statusListeners) {
            try {listener(participantId, chatIdentity, next);} catch (error) {report(error);}
        }
    };
    const settle = (job: MaintenanceQueuedJob, outcome: MaintenanceRunOutcome): void => {
        if (job.settled) {return;}
        job.settled = true;
        job.resolve?.(outcome);
    };
    const invalidate = (run: MaintenanceSessionRun, reason: string): void => {
        if (run.invalid) {return;}
        run.invalid = true;
        run.invalidReason = reason;
        try {run.session.invalidate?.(reason);} catch (error) {report(error);}
    };
    const enabled = (run: MaintenanceSessionRun, mode: MaintenanceMode): boolean => {
        try {return run.participant.isEnabled(mode);}
        catch (error) {report(error); return false;}
    };

    function jobGuard(job: MaintenanceQueuedJob): boolean {
        return !job.cancelledReason
            && !job.controller.signal.aborted
            && job.epoch === epoch
            && sourceIsCurrent(job);
    }

    function runGuard(job: MaintenanceQueuedJob, run: MaintenanceSessionRun): boolean {
        return jobGuard(job)
            && !run.invalid
            && !job.excludedParticipantIds.has(run.participant.id)
            && enabled(run, job.mode)
            && (job.mode === 'automatic'
                ? run.automaticToken === token(automaticTokens, run.participant.id)
                : job.manualToken === token(manualTokens, run.participant.id));
    }

    function cancelJob(job: MaintenanceQueuedJob, reason: string): void {
        if (job.cancelledReason) {return;}
        job.cancelledReason = reason || 'cancelled';
        job.controller.abort(job.cancelledReason);
        for (const run of job.sessions) {invalidate(run, job.cancelledReason);}
        for (const id of jobParticipantIds(job)) {
            updateStatus(job.source.chatIdentity, id, {
                state: 'idle', mode: job.mode, message: 'cancelled', reason: job.cancelledReason,
            });
        }
        if (!job.committing) {settle(job, cancelledJobOutcome(job, job.cancelledReason));}
    }

    const executeJob = createMaintenanceJobExecutor(registry, gateway, writeGate, {
        guardJob: jobGuard,
        guardRun: runGuard,
        invalidate,
        automaticToken: participantId => token(automaticTokens, participantId),
        updateStatus: (job, participantId, patch) => updateStatus(job.source.chatIdentity, participantId, patch),
        captureBackground,
        report,
    });

    async function drain(): Promise<void> {
        scheduled = false;
        if (processing) {return;}
        processing = true;
        try {
            while (queue.size) {
                const job = queue.shift();
                if (!job) {continue;}
                activeJob = job;
                let outcome: MaintenanceRunOutcome;
                try {outcome = await executeJob(job);}
                catch (error) {
                    report(error);
                    outcome = job.cancelledReason
                        ? cancelledJobOutcome(job, job.cancelledReason)
                        : failedJobOutcome(job, jobParticipantIds(job), 'maintenance-failed');
                }
                const completedAt = now();
                for (const id of outcome.participantIds) {
                    const result = outcome.participantResults.find(candidate => candidate.participantId === id);
                    updateStatus(job.source.chatIdentity, id, {
                        state: result?.status === 'failed' ? 'error' : 'idle',
                        mode: job.mode,
                        message: result?.status || outcome.status,
                        reason: result?.reason || outcome.reason || '',
                        ...(result && ['updated', 'unchanged', 'partial'].includes(result.status)
                            ? { lastRunAt: completedAt }
                            : {}),
                    });
                }
                settle(job, outcome);
                activeJob = null;
            }
        } finally {
            activeJob = null;
            processing = false;
            if (queue.size) {scheduleDrain();}
        }
    }

    function scheduleDrain(): void {
        if (scheduled || processing) {return;}
        scheduled = true;
        schedule(() => {observeBackgroundTask(drain(), { source: import.meta.url, operation: "callback" });});
    }

    function enqueue(job: MaintenanceQueuedJob): void {
        queue.enqueue(job);
        scheduleDrain();
    }

    function makeJob(mode: MaintenanceMode, source: AcceptedTurnSource, participantId: string | null): MaintenanceQueuedJob {
        const one = participantId ? registry.selectById(participantId, mode) : undefined;
        const participants = participantId ? one ? [one] : [] : registry.selectByMode(mode);
        const preparedSessions = new Map(participants.map(participant => [participant.id,
            participant.prepareSession?.(source, mode) ?? (() => participant.createSession(source, mode))]));
        return {
            mode,
            source,
            preparedSessions,
            participantId,
            epoch,
            manualToken: participantId ? token(manualTokens, participantId) : 0,
            excludedParticipantIds: new Set(),
            controller: new AbortController(),
            sessions: [],
            earlyResults: [],
            backgroundMessages: [],
            cancelledReason: '',
            committing: false,
            settled: false,
        };
    }

    function skippedStart(
        mode: 'manual' | 'rebuild',
        participantId: string,
        reason: string,
        chatIdentity = '',
    ): MaintenanceStartResult {
        const outcome = createMaintenanceOutcome({
            mode,
            status: 'skipped',
            participantIds: participantId ? [participantId] : [],
            reason,
        });
        if (participantId && chatIdentity) {
            updateStatus(chatIdentity, participantId, { state: 'idle', mode, message: 'skipped', reason });
        }
        return { status: 'skipped', mode, reason, outcome };
    }

    function startRequestedRun(mode: 'manual' | 'rebuild', participantIdValue: string): MaintenanceStartResult {
        const participantId = String(participantIdValue || '').trim();
        let participant: MaintenanceParticipant | undefined;
        try {participant = registry.selectById(participantId, mode);}
        catch (error) {report(error);}
        if (!participant) {
            return skippedStart(mode, participantId, 'participant-disabled', currentChatIdentity());
        }
        let capture;
        try {
            const surface = captureSurface();
            capture = mode === 'manual'
                ? captureManualAcceptedTurn(surface, { generationActive: isGenerationActive() })
                : captureRebuildSource(surface, { generationActive: isGenerationActive() });
        } catch (error) {
            report(error);
            return skippedStart(mode, participantId, 'capture-failed');
        }
        if (!capture.ok) {
            return skippedStart(mode, participantId, capture.reason, currentChatIdentity());
        }
        if (getStatus(participantId, capture.source.chatIdentity).state === 'running') {
            return { status: 'busy', mode, reason: 'participant-busy' };
        }
        let resolveCompletion!: (outcome: MaintenanceRunOutcome) => void;
        const completion = new Promise<MaintenanceRunOutcome>(resolve => {resolveCompletion = resolve;});
        let job: MaintenanceQueuedJob;
        try {job = makeJob(mode, capture.source, participantId);}
        catch (error) {report(error); return skippedStart(mode, participantId, 'capture-failed', capture.source.chatIdentity);}
        job.resolve = resolveCompletion;
        updateStatus(capture.source.chatIdentity, participantId, {
            state: 'running', mode, message: '', reason: '',
        });
        enqueue(job);
        return { status: 'started', mode, completion };
    }

    function getStatus(participantIdValue: string, chatIdentityValue: string): MaintenanceStatus {
        const participantId = String(participantIdValue || '').trim();
        const chatIdentity = String(chatIdentityValue || '').trim();
        return statuses.get(chatIdentity)?.get(participantId) || IDLE_STATUS;
    }

    function handleMessageSent(messageIndex: number): boolean {
        let participants: readonly MaintenanceParticipant[];
        try {participants = registry.selectByMode('automatic');}
        catch (error) {report(error); return false;}
        if (!participants.length) {return false;}
        let source: AcceptedTurnSource | null;
        try {source = captureAutomaticAcceptedTurn(captureSurface(), messageIndex);}
        catch (error) {report(error); return false;}
        if (!source) {return false;}
        try {enqueue(makeJob('automatic', source, null));}
        catch (error) {report(error); return false;}
        return true;
    }

    function cancelAll(reason = 'cancelled'): void {
        epoch += 1;
        if (activeJob) {cancelJob(activeJob, reason);}
        for (const job of queue.drain()) {cancelJob(job, reason);}
    }

    return Object.freeze({
        startBackground(subscribeMessageSent: MessageSentSubscription) {
            if (!unsubscribeMessageSent) {unsubscribeMessageSent = subscribeMessageSent(handleMessageSent);}
        },
        stopBackground() {
            unsubscribeMessageSent?.();
            unsubscribeMessageSent = null;
            cancelAll('stopped');
        },
        handleMessageSent,
        startManual: (participantId: string) => startRequestedRun('manual', participantId),
        startRebuild: (participantId: string) => startRequestedRun('rebuild', participantId),
        cancelRequested(participantIdValue: string, reason: string) {
            const participantId = String(participantIdValue || '').trim();
            manualTokens[participantId] = token(manualTokens, participantId) + 1;
            if (activeJob?.mode !== 'automatic' && activeJob?.participantId === participantId) {cancelJob(activeJob, reason);}
            for (const job of queue.removeWhere(item => item.mode !== 'automatic' && item.participantId === participantId)) {
                cancelJob(job, reason);
            }
        },
        invalidateAutomatic(participantIdValue: string, reason: string) {
            const participantId = String(participantIdValue || '').trim();
            automaticTokens[participantId] = token(automaticTokens, participantId) + 1;
            queue.forEach(job => {
                if (job.mode === 'automatic') {job.excludedParticipantIds.add(participantId);}
            });
            if (activeJob?.mode === 'automatic') {
                activeJob.excludedParticipantIds.add(participantId);
                const run = activeJob.sessions.find(candidate => candidate.participant.id === participantId);
                if (run) {invalidate(run, reason || 'automatic-invalidated');}
                if (activeJob.sessions.length && activeJob.sessions.every(candidate => candidate.invalid)) {
                    cancelJob(activeJob, reason || 'automatic-invalidated');
                }
            }
        },
        handleChatChanged: () => cancelAll('chat-changed'),
        cancelAll,
        getStatus,
        subscribeStatus(listener: (
            participantId: string,
            chatIdentity: string,
            status: MaintenanceStatus,
        ) => void) {
            statusListeners.add(listener);
            return () => statusListeners.delete(listener);
        },
    });
}
