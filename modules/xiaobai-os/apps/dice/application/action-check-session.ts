import { prepareActionCheck } from './prepare-action-check.js';
import { MAX_ACTION_CHECKS, referencedActionChecks, isCheckContinuationPoint, parseDiceRecords, type DiceMessageRecords } from '../domain/check-records.js';
import { parseActionCheck } from '../protocol/request.js';
import type { ActionCheckRule } from '../types.js';
import { COC7_SHEET_ERRORS, type Coc7Sheet } from '../domain/coc7-sheet.js';
import type { DiceHostWait } from './host-wait.js';
import { DiceOperationError } from './operation-error.js';

export interface ActionCheckTarget { body: string; records: unknown; generatedFrom: number; rule: ActionCheckRule; coc7Sheet?: Coc7Sheet | null }
export interface DiceCandidate { body: string; records: DiceMessageRecords }

type Phase = { kind: 'waiting' }
    | { kind: 'settling'; candidate?: DiceCandidate }
    | { kind: 'awaiting-choice' | 'continuing'; candidate: DiceCandidate }
    | { kind: 'revealing'; candidate: DiceCandidate; revealId: string; placement: 'new' | 'replace' }
    | { kind: 'continue-error'; candidate: DiceCandidate; error: string }
    | { kind: 'invalid'; error: string };
interface Run<T> { controller: AbortController; target: T; phase: Phase; wait: DiceHostWait | null }
export interface DiceSessionPort<T extends ActionCheckTarget> {
    enabled(): boolean;
    current(target: T): boolean;
    ready(target: T, signal: AbortSignal, inGroup: boolean, report: (wait: DiceHostWait) => void): Promise<void>;
    apply(target: T, candidate: DiceCandidate): void;
    /** Only a manual first roll has missed the originating native save. */
    saveRecovered(target: T): Promise<void>;
    reveal(target: T, candidate: DiceCandidate, signal: AbortSignal): Promise<void>;
    /** Null means the host did not complete the continuation; its own UI owns provider errors. */
    continue(target: T, candidate: DiceCandidate, signal: AbortSignal): Promise<T | null>;
    changed(): void;
    random?: () => number;
    id(): string;
}

const errors: Record<string, string> = {
    dice_check_limit: `本条回复已检定 ${MAX_ACTION_CHECKS} 次，不再继续掷骰。`,
    [COC7_SHEET_ERRORS.missing]: '请先在 Dice 中分配并保存人物能力，未掷骰。',
    [COC7_SHEET_ERRORS.invalid]: '人物能力分配无效，未掷骰。请在 Dice 中重新分配或重置。',
};
const invalidRequest = '这次检定信息不完整或格式无效，未掷骰。';

/** One ephemeral choice. Generation is entered only by continueCheck, never by draining a roll. */
export function createActionCheckSession<T extends ActionCheckTarget>(port: DiceSessionPort<T>) {
    let run: Run<T> | null = null;
    const owns = (current: Run<T>) => run === current && !current.controller.signal.aborted && port.enabled();
    const publish = () => port.changed();

    function cancel(): void {
        const previous = run;
        run = null;
        previous?.controller.abort();
        publish();
    }

    function pendingPhase(target: T, preparationError = ''): Phase | null {
        const parsed = parseActionCheck(target.body, target.generatedFrom, target.rule);
        if (parsed.kind === 'none') { return null; }
        if (preparationError) { return { kind: 'invalid', error: preparationError }; }
        return parsed.kind === 'request' ? { kind: 'waiting' }
            : { kind: 'invalid', error: errors[parsed.error] ?? invalidRequest };
    }

    function accept(target: T, preparationError = ''): void {
        // MESSAGE_RECEIVED belongs to the still-unwinding native call. Do not abort it
        // when its next check replaces the previous choice.
        if (run?.phase.kind === 'continuing') { run = null; }
        else { cancel(); }
        if (!port.enabled() || !port.current(target)) { return; }
        const phase = pendingPhase(target, preparationError);
        if (!phase) { return; }
        run = { controller: new AbortController(), target, phase, wait: null };
        publish();
    }

    async function execute(current: Run<T>, inGroup: boolean, operation: 'roll' | 'retry' | 'continue' = 'roll'): Promise<void> {
        try {
            while (owns(current)) {
                const retained = 'candidate' in current.phase ? current.phase.candidate : undefined;
                current.phase = { kind: 'settling', candidate: retained };
                current.wait = null;
                publish();
                if (operation !== 'roll') {
                    await port.ready(current.target, current.controller.signal, inGroup, wait => {
                        if (!owns(current)) { return; }
                        current.wait = wait;
                        publish();
                    });
                }
                if (!owns(current)) { return; }
                if (!port.current(current.target)) { cancel(); return; }
                current.wait = null;
                let candidate: DiceCandidate;
                if (retained) { candidate = retained; }
                else {
                    const prepared = prepareActionCheck({ body: current.target.body, records: current.target.records,
                        generatedFrom: current.target.generatedFrom, rule: current.target.rule, coc7Sheet: current.target.coc7Sheet, id: port.id(), random: port.random });
                    if (prepared.kind === 'none') { run = null; return; }
                    if (prepared.kind === 'invalid') {
                        current.phase = { kind: 'invalid', error: errors[prepared.error] ?? invalidRequest };
                        return;
                    }
                    candidate = prepared;
                }
                if (!retained) {
                    port.apply(current.target, candidate);
                    current.target = { ...current.target, body: candidate.body, records: candidate.records };
                }
                if (!port.current(current.target)) { cancel(); return; }
                if (operation !== 'continue') {
                    const saving = operation === 'retry' ? port.saveRecovered(current.target) : undefined;
                    // Synchronous apply precedes MESSAGE_RECEIVED returning to native saving.
                    current.phase = { kind: 'revealing', candidate, revealId: candidate.records.checks.at(-1)!.id, placement: 'new' };
                    publish();
                    await port.reveal(current.target, candidate, current.controller.signal);
                    await saving;
                    if (!owns(current)) { return; }
                    if (!port.current(current.target)) { cancel(); return; }
                    current.phase = { kind: 'awaiting-choice', candidate };
                    return;
                }
                current.phase = { kind: 'continuing', candidate };
                publish();
                const next = await port.continue(current.target, candidate, current.controller.signal);
                if (!owns(current)) { return; }
                if (!next || !next.body.startsWith(candidate.body) || !next.body.slice(candidate.body.length).trim()) {
                    current.phase = port.current(current.target)
                        ? { kind: 'continue-error', candidate, error: '' }
                        : { kind: 'invalid', error: '' };
                    return;
                }
                current.target = next;
                const nextPhase = pendingPhase(next);
                if (!nextPhase) { run = null; return; }
                current.phase = nextPhase;
                if (nextPhase.kind === 'invalid') { return; }
                operation = 'roll';
            }
        } catch (error) {
            if (!owns(current)) { return; }
            const phase = current.phase;
            console.error('[LittleWhiteBox] Dice check failed', error);
            if (phase.kind === 'revealing') {
                current.phase = port.current(current.target)
                    ? { kind: 'awaiting-choice', candidate: phase.candidate } : { kind: 'invalid', error: '' };
            } else if (phase.kind === 'continuing') {
                current.phase = port.current(current.target)
                    ? { kind: 'continue-error', candidate: phase.candidate, error: new DiceOperationError('dice_continue_failed').message }
                    : { kind: 'invalid', error: new DiceOperationError('dice_target_changed').message };
            } else if (!port.current(current.target)) { cancel(); }
            else if (phase.kind === 'settling' && phase.candidate) {
                // A failed readiness wait does not invalidate the retained roll or its retry route.
                current.phase = { kind: 'continue-error', candidate: phase.candidate, error: new DiceOperationError('dice_continue_failed').message };
            } else { current.phase = { kind: 'invalid', error: new DiceOperationError('dice_check_failed').message }; }
        } finally {
            publish();
        }
    }

    function drain(inGroup = false): Promise<void> {
        const current = run;
        if (!current || current.phase.kind !== 'waiting') { return Promise.resolve(); }
        // Consume once, including repeated MESSAGE_RECEIVED or wrapper-finished events.
        current.phase = { kind: 'settling' };
        return execute(current, inGroup);
    }

    async function retryRequest(target: T): Promise<void> {
        if (!port.enabled()) { throw new DiceOperationError('dice_disabled'); }
        const current = run;
        // An unrolled request is itself the recovery source, including after a reload.
        // Merely displaying it never rolls; the user must explicitly choose retry.
        if (!current && parseActionCheck(target.body, target.generatedFrom, target.rule).kind === 'request') {
            accept(target);
            if (run) { await execute(run, false, 'retry'); }
            return;
        }
        throw new DiceOperationError('dice_target_changed');
    }

    // A finished invalid run may be replaced after the caller captures a current continuation point.
    function canContinue(): boolean {
        return !run || ['revealing', 'awaiting-choice', 'continue-error', 'invalid'].includes(run.phase.kind);
    }

    async function continueCheck(target: T): Promise<void> {
        if (!port.enabled()) { throw new DiceOperationError('dice_disabled'); }
        if (!port.current(target)) { throw new DiceOperationError('dice_target_changed'); }
        if (!canContinue()) { return; }
        const records = parseDiceRecords(target.records);
        const last = referencedActionChecks(target.body, records.checks).at(-1);
        if (!last || !isCheckContinuationPoint(target.body, last)) {
            throw new DiceOperationError('dice_target_changed');
        }
        cancel();
        const restored: Run<T> = { controller: new AbortController(), target,
            phase: { kind: 'awaiting-choice', candidate: { body: target.body, records } }, wait: null };
        run = restored;
        await execute(restored, false, 'continue');
    }

    async function showResult(target: T, candidate: DiceCandidate, revealId: string): Promise<void> {
        if (!port.enabled() || !port.current(target)) { return; }
        cancel();
        const current: Run<T> = { controller: new AbortController(), target, phase: { kind: 'revealing', candidate, revealId, placement: 'replace' }, wait: null };
        run = current;
        publish();
        try { await port.reveal(target, candidate, current.controller.signal); }
        finally {
            if (owns(current) && port.current(target)) { current.phase = { kind: 'awaiting-choice', candidate }; }
            publish();
        }
    }

    return { accept, drain, cancel, retryRequest, canContinue, continueCheck, showResult,
        view: () => run ? { target: run.target, phase: run.phase, wait: run.wait } : null };
}
