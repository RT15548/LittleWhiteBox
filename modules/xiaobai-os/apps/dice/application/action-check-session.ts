import { prepareActionCheck } from './prepare-action-check.js';
import { hasValidCheckAnchor, parseDiceRecords, type DiceMessageRecords } from '../domain/check-records.js';

export interface ActionCheckTarget { body: string; records: unknown; generatedFrom: number }
export interface DiceCandidate { body: string; records: DiceMessageRecords }
export type DiceSaveResult = { status: 'confirmed' } | { status: 'failed' | 'unconfirmed' | 'conflict'; error: string };

type Phase = { kind: 'waiting' | 'settling' }
    | { kind: 'saving' | 'continuing'; candidate: DiceCandidate }
    | { kind: 'save-error' | 'continue-error'; candidate: DiceCandidate; error: string }
    | { kind: 'invalid'; error: string };
interface Run<T> { controller: AbortController; target: T; phase: Phase }
export interface DiceSessionPort<T extends ActionCheckTarget> {
    enabled(): boolean;
    current(target: T): boolean;
    same(left: T, right: T): boolean;
    ready(target: T, signal: AbortSignal, inGroup: boolean): Promise<void>;
    save(target: T, candidate: DiceCandidate, signal: AbortSignal, retry: boolean): Promise<DiceSaveResult>;
    continue(target: T, candidate: DiceCandidate, signal: AbortSignal): Promise<T | null>;
    changed(): void;
    random?: () => number;
    id(): string;
}

const errors: Record<string, string> = {
    dice_check_limit: '本条回复已完成 8 次检定，新的检定未执行。',
    dice_body_changed: '原文已变更，未执行新的检定。',
};

/** One ephemeral chain. Rendering, reload and retry never enter the random source. */
export function createActionCheckSession<T extends ActionCheckTarget>(port: DiceSessionPort<T>) {
    let run: Run<T> | null = null;
    const owns = (current: Run<T>) => run === current && !current.controller.signal.aborted && port.enabled();
    const publish = () => port.changed();

    function cancel(): void {
        run?.controller.abort();
        run = null;
        publish();
    }

    function accept(target: T): void {
        cancel();
        if (!port.enabled()) { return; }
        run = { controller: new AbortController(), target, phase: { kind: 'waiting' } };
    }

    async function execute(current: Run<T>, inGroup: boolean, retry = false): Promise<void> {
        let recovery = retry;
        try {
            while (owns(current)) {
                await port.ready(current.target, current.controller.signal, inGroup);
                if (!owns(current) || !port.current(current.target)) { return; }
                const phase = current.phase;
                let candidate: DiceCandidate;
                if (phase.kind === 'save-error' || phase.kind === 'continue-error') { candidate = phase.candidate; }
                else {
                    const prepared = prepareActionCheck({ body: current.target.body, records: current.target.records,
                        generatedFrom: current.target.generatedFrom, id: port.id(), random: port.random });
                    if (prepared.kind === 'none') { run = null; return; }
                    if (prepared.kind === 'invalid') {
                        current.phase = { kind: 'invalid', error: errors[prepared.error] ?? '检定请求不完整或格式无效，本次未投骰。' };
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
                        current.phase = saved.status === 'conflict' ? { kind: 'invalid', error: saved.error }
                            : { kind: 'save-error', candidate, error: `骰点尚未确认保存：${saved.error}` };
                        return;
                    }
                    current.target = { ...current.target, body: candidate.body, records: candidate.records };
                }
                if (!port.current(current.target)) { cancel(); return; }
                current.phase = { kind: 'continuing', candidate };
                publish();
                const next = await port.continue(current.target, candidate, current.controller.signal);
                if (!owns(current)) { return; }
                if (!next || !next.body.startsWith(candidate.body) || !next.body.slice(candidate.body.length).trim()) {
                    current.phase = { kind: 'continue-error', candidate, error: '骰点已保存，但没有收到后续正文。' };
                    return;
                }
                current.target = next;
                current.phase = { kind: 'waiting' };
                recovery = false;
            }
        } catch (error) {
            if (!owns(current)) { return; }
            const phase = current.phase;
            const message = error instanceof Error ? error.message : String(error);
            if (phase.kind === 'continuing') {
                current.phase = port.current(current.target)
                    ? { kind: 'continue-error', candidate: phase.candidate, error: `骰点已保存，续写失败：${message}` }
                    : { kind: 'invalid', error: '骰点已保存，续写中断；原回复已有后文或已变更，请使用酒馆的普通继续操作。' };
            } else if (!port.current(current.target)) { cancel(); }
            else if (phase.kind === 'save-error' || phase.kind === 'continue-error') {
                // A failed readiness wait does not invalidate the retained roll or its retry route.
                current.phase = { ...phase, error: message };
            } else { current.phase = { kind: 'invalid', error: message }; }
        } finally { publish(); }
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
        if (current && ['saving', 'continuing', 'waiting', 'settling'].includes(current.phase.kind)) { return; }
        const records = parseDiceRecords(target.records);
        const last = records.checks.at(-1);
        if (!last || target.body.length !== last.offset || records.checks.some(record => !hasValidCheckAnchor(target.body, record))) {
            throw new Error('原回复已有后文或已变更，请使用酒馆的普通继续操作。');
        }
        cancel();
        const restored: Run<T> = { controller: new AbortController(), target,
            phase: { kind: 'continue-error', candidate: { body: target.body, records }, error: '' } };
        run = restored;
        await execute(restored, false, true);
    }

    return { accept, drain, cancel, retry, view: () => run ? { target: run.target, phase: run.phase } : null };
}
