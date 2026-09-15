import { prepareActionCheck } from './prepare-action-check.js';
import { hasValidCheckAnchor, isCheckContinuationPoint, parseDiceRecords, type DiceMessageRecords } from '../domain/check-records.js';
import { parseActionCheck } from '../protocol/request.js';

export interface ActionCheckTarget { body: string; records: unknown; generatedFrom: number }
export interface DiceCandidate { body: string; records: DiceMessageRecords }
export type DiceSaveResult = { status: 'confirmed' } | { status: 'failed' | 'unconfirmed' | 'conflict'; error: string };

type Phase = { kind: 'waiting' | 'settling' }
    | { kind: 'saving' | 'revealing' | 'continuing'; candidate: DiceCandidate }
    | { kind: 'save-error' | 'continue-error'; candidate: DiceCandidate; error: string }
    | { kind: 'invalid'; error: string };
interface Run<T> { controller: AbortController; target: T; phase: Phase }
export interface DiceSessionPort<T extends ActionCheckTarget> {
    enabled(): boolean;
    current(target: T): boolean;
    same(left: T, right: T): boolean;
    ready(target: T, signal: AbortSignal, inGroup: boolean): Promise<void>;
    save(target: T, candidate: DiceCandidate, signal: AbortSignal, retry: boolean): Promise<DiceSaveResult>;
    reveal(target: T, candidate: DiceCandidate, signal: AbortSignal): Promise<void>;
    /** Null means the host did not complete the continuation; its own UI owns provider errors. */
    continue(target: T, candidate: DiceCandidate, signal: AbortSignal): Promise<T | null>;
    busy?(busy: boolean, signal: AbortSignal): void;
    changed(): void;
    random?: () => number;
    id(): string;
}

const errors: Record<string, string> = {
    dice_check_limit: '本条回复已检定 8 次，不再继续掷骰。',
    dice_body_changed: '原文已修改，本次不再掷骰。',
};

/** One ephemeral chain. Rendering, reload and retry never enter the random source. */
export function createActionCheckSession<T extends ActionCheckTarget>(port: DiceSessionPort<T>) {
    let run: Run<T> | null = null;
    const owns = (current: Run<T>) => run === current && !current.controller.signal.aborted && port.enabled();
    const publish = () => port.changed();

    function cancel(): void {
        const previous = run;
        run = null;
        previous?.controller.abort();
        if (previous) { port.busy?.(false, previous.controller.signal); }
        publish();
    }

    function pendingPhase(target: T, preparationError = ''): Phase | null {
        const parsed = parseActionCheck(target.body, target.generatedFrom);
        if (parsed.kind === 'none') { return null; }
        if (preparationError) { return { kind: 'invalid', error: preparationError }; }
        return parsed.kind === 'request' ? { kind: 'waiting' }
            : { kind: 'invalid', error: '这次检定信息不完整，未掷骰。' };
    }

    function accept(target: T, preparationError = ''): void {
        cancel();
        if (!port.enabled() || !port.current(target)) { return; }
        const phase = pendingPhase(target, preparationError);
        if (!phase) { return; }
        run = { controller: new AbortController(), target, phase };
        if (phase.kind === 'waiting') { port.busy?.(true, run.controller.signal); }
        publish();
    }

    async function execute(current: Run<T>, inGroup: boolean, retry = false): Promise<void> {
        let recovery = retry;
        try {
            port.busy?.(true, current.controller.signal);
            while (owns(current)) {
                await port.ready(current.target, current.controller.signal, inGroup);
                if (!owns(current)) { return; }
                if (!port.current(current.target)) { cancel(); return; }
                const phase = current.phase;
                let candidate: DiceCandidate;
                if (phase.kind === 'save-error' || phase.kind === 'continue-error') { candidate = phase.candidate; }
                else {
                    const prepared = prepareActionCheck({ body: current.target.body, records: current.target.records,
                        generatedFrom: current.target.generatedFrom, id: port.id(), random: port.random });
                    if (prepared.kind === 'none') { run = null; return; }
                    if (prepared.kind === 'invalid') {
                        current.phase = { kind: 'invalid', error: errors[prepared.error] ?? '这次检定信息不完整，未掷骰。' };
                        return;
                    }
                    candidate = prepared;
                }
                if (phase.kind !== 'continue-error') {
                    current.phase = { kind: 'saving', candidate };
                    publish();
                    const saved = await port.save(current.target, candidate, current.controller.signal, recovery);
                    if (!owns(current)) { return; }
                    if (saved.status !== 'confirmed') {
                        console.error('[LittleWhiteBox] Dice result save not confirmed', saved);
                        current.phase = saved.status === 'conflict' ? { kind: 'invalid', error: saved.error }
                            : { kind: 'save-error', candidate, error: '骰点还未确认保存，暂不续写。' };
                        return;
                    }
                    current.target = { ...current.target, body: candidate.body, records: candidate.records };
                }
                if (!port.current(current.target)) { cancel(); return; }
                if (!recovery) {
                    current.phase = { kind: 'revealing', candidate };
                    publish();
                    await port.reveal(current.target, candidate, current.controller.signal);
                    if (!owns(current)) { return; }
                    if (!port.current(current.target)) { cancel(); return; }
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
                recovery = false;
            }
        } catch (error) {
            if (!owns(current)) { return; }
            const phase = current.phase;
            console.error('[LittleWhiteBox] Dice check failed', error);
            if (phase.kind === 'continuing' || phase.kind === 'revealing') {
                current.phase = port.current(current.target)
                    ? { kind: 'continue-error', candidate: phase.candidate, error: '骰点已保留，暂时无法自动续写。' }
                    : { kind: 'invalid', error: '回复已有变化，请用酒馆的「继续」接着写。' };
            } else if (!port.current(current.target)) { cancel(); }
            else if (phase.kind === 'save-error' || phase.kind === 'continue-error') {
                // A failed readiness wait does not invalidate the retained roll or its retry route.
                current.phase = { ...phase, error: '暂时无法继续检定，请稍后重试。' };
            } else { current.phase = { kind: 'invalid', error: '本次未完成行动检定。' }; }
        } finally {
            port.busy?.(false, current.controller.signal);
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

    async function retry(target: T): Promise<void> {
        if (!port.enabled()) { throw new Error('请先开启行动检定。'); }
        const current = run;
        if (current && port.same(current.target, target)
            && (current.phase.kind === 'save-error' || current.phase.kind === 'continue-error')) {
            if (!port.current(current.target)) { cancel(); throw new Error('原回复已变更。'); }
            const replacement: Run<T> = { ...current, controller: new AbortController() };
            run = replacement;
            await execute(replacement, false, true);
            return;
        }
        if (current && ['saving', 'revealing', 'continuing', 'waiting', 'settling'].includes(current.phase.kind)) { return; }
        const records = parseDiceRecords(target.records);
        const last = records.checks.at(-1);
        if (!last || !isCheckContinuationPoint(target.body, last) || records.checks.some(record => !hasValidCheckAnchor(target.body, record))) {
            throw new Error('回复已有变化，请用酒馆的「继续」接着写。');
        }
        cancel();
        const restored: Run<T> = { controller: new AbortController(), target,
            phase: { kind: 'continue-error', candidate: { body: target.body, records }, error: '' } };
        run = restored;
        await execute(restored, false, true);
    }

    return { accept, drain, cancel, retry, view: () => run ? { target: run.target, phase: run.phase } : null };
}
