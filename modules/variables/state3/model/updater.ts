import type { PublicAgentSession, AgentChatResult } from '../../../agent-core/public-api.js';
import { correctionTask } from '../../updater/correction.js';
import { handoffReceipt } from '../../updater/handoff.js';
import type { Diagnostic, Failure, Result, RunOptions, UpdateStage, Json } from '../types.js';
import type { SettlementService } from '../runtime/service.js';
import { state3Context as getContext, latestUserIndex, type createHostAdapter } from '../runtime/host.js';
import { exposeVariableReads } from '../../var-commands.js';
import { captureContext } from '../../shared/context-capture.js';
import { passageText } from '../../shared/passage.js';
import { buildUpdateTask } from './prompts.js';
import { SUBMIT_TOOL } from './tools.js';
import { readSettings } from '../runtime/settings.js';
import { reject, diagnostic } from '../engine/diagnostics.js';
import { modelSource } from '../definition/stages.js';
import { digest } from '../definition/digest.js';
import { beforeFloorOutcome } from '../runtime/before-result.js';
import { mergeAbortSignals } from '../../../../shared/common/abort-utils.js';
import { activeTools, TOOL_CALL_LIMIT } from '../extensions/definition.js';

export function parseSubmission(response: AgentChatResult): unknown[] {
    if (response.truncated || response.completion !== 'complete') {reject('model-submission', { completion: response.completion, truncated: response.truncated, response: response.text });}
    if (response.toolCalls?.length !== 1 || response.toolCalls[0].name !== SUBMIT_TOOL) {reject('model-submission', {
        response: response.text, message: 'Nothing in this batch executed. Submit write alone, with no other tool calls in the same batch.' });}
    let args;
    try { args = JSON.parse(response.toolCalls[0].arguments); }
    catch (error) { reject('model-submission', { reason: 'invalid-json', arguments: response.toolCalls[0].arguments, cause: diagnostic(error) }); }
    if (!args || Object.keys(args).length !== 1 || !Array.isArray(args.state)) {
        reject('model-submission', { reason: 'invalid-shape', actual: args, expected: { state: 'array', additionalProperties: false } });
    }
    return args.state;
}

// The Agent API has already redacted credentials. Keep provider diagnostics as a
// cause, never as settlement codes: a provider may use a code like "constraint".
async function modelRequest<T>(request: () => Promise<T>): Promise<T> {
    try { return await request(); }
    catch (error) { reject('model-request', { cause: diagnostic(error) }); }
}

function correctionErrors(result: Failure): unknown[] {
    const project = (issue: Diagnostic) => {
        const detail = { ...issue }; delete detail.actionTitle; delete detail.operation; return detail;
    };
    if (!result.items) {return result.diagnostics.map(project);}
    const diagnostics = result.diagnostics.filter(issue => issue.operation === undefined).map(project);
    return [{ items: result.items.map(({ item, status, diagnostics }) => ({ item, status,
        ...(diagnostics ? { diagnostics: diagnostics.map(project) } : {}) })),
    ...(diagnostics.length ? { diagnostics } : {}) }];
}

export function createState3Updater({ service, adapter, available, changed, rewound }: { service: SettlementService; adapter: ReturnType<typeof createHostAdapter>; available(): void; changed?(): void; rewound?(): Promise<void> }) {
    let controller: AbortController | undefined, phase = 'ready', activeIndex: number | undefined;
    // An interrupted calculation keeps its current run, including already acquired
    // facts. Cancel, context changes and a new update release this in-memory slot.
    let pending: { input: unknown[]; stage: UpdateStage; index: number; basis: string; staged: Awaited<ReturnType<SettlementService['stage']>> } | undefined;
    const environmentFailure = (result: Result) => !result.ok && result.diagnostics.length > 0 && result.diagnostics.every(issue =>
        ['function_startup_failed', 'function_worker_error', 'function_worker_unresponsive', 'function_message_error'].includes(issue.code === 'extension-calculation' ? (issue.cause as Diagnostic).code : issue.code));
    const correctable = (result: Result) => !result.ok && result.diagnostics.every(issue => [
        'model-submission', 'input-shape', 'input-number', 'path', 'missing-parent', 'array-index', 'action-missing', 'action-parameters',
        'action-precondition', 'direct-other-stage', 'action-other-stage', 'direct-not-allowed', 'derived-write', 'state-schema', 'constraint', 'increment-target', 'increment-overflow',
    ].includes(issue.code));
    function retryIndex() {
        if (pending && adapter.submissionBasis(pending.index) !== pending.basis) {pending = undefined;}
        return pending?.index;
    }
    const setPhase = (value: string) => { phase = value; changed?.(); };
    const interrupt = () => { controller?.abort(); };
    const cancel = () => { pending = undefined; interrupt(); };
    async function prepare(stage: UpdateStage, index?: number, signal?: AbortSignal) {
        available();
        const staged = await service.stage({ index, replace: true, signal });
        const ctx = getContext(), message = ctx.chat[staged.target.floor];
        if (!message || Boolean(message.is_user) !== (stage === 'before') || message.is_system || !message.mes?.trim()) {reject('target-missing');}
        const snapshot = adapter.capture(staged.target.floor);
        const compiled = service.compiled(staged);
        if (!compiled.definition.updates.includes(stage)) {reject('stage-disabled', { stage });}
        const inputDigest = digest(message.mes);
        const userIndex = latestUserIndex(ctx.chat, staged.target.floor);
        const prior = stage === 'after' ? beforeFloorOutcome(snapshot, userIndex) : undefined;
        const preceding = prior ? { beforeUpdate: prior } : {};
        const reservation = buildUpdateTask(compiled, staged.snapshot, { target: staged.target, messages: [], ...preceding }, stage);
        const context = await captureContext(ctx, { ...staged.target, message }, reservation,
            passageText, signal,
            () => exposeVariableReads(staged.snapshot, staged.roots));
        staged.assertCurrent();
        if (!adapter.isCurrent(snapshot)) {reject('stale-target');}
        return { staged, inputDigest, task: buildUpdateTask(compiled, staged.snapshot, { ...context, ...preceding }, stage) };
    }
    return {
        cancel, interrupt,
        status: () => ({ phase, busy: Boolean(controller), index: activeIndex, retryIndex: retryIndex() }),
        async previewRequest({ signal, stage = 'after', index }: RunOptions & { index?: number } = {}) {
            if (stage === 'before' && index === undefined) {index = latestUserIndex(getContext().chat);}
            const prepared = await prepare(stage, index, signal);
            return prepared.task;
        },
        async update({ stage = 'after', index, signal: outerSignal }: RunOptions & { index?: number } = {}): Promise<Result> {
            if (controller) {reject('commit-busy');}
            const own = new AbortController(); controller = own; activeIndex = index;
            const signal = mergeAbortSignals(own.signal, outerSignal)!;
            let session: PublicAgentSession | undefined;
            let modelRequests = 0;
            let details: ((result: Result) => Result) = result => result;
            try {
                setPhase('preparing');
                available();
                const target = index ?? (stage === 'before' ? latestUserIndex(getContext().chat) : adapter.capture().index);
                activeIndex = target;
                const message = getContext().chat[target];
                if (!message || Boolean(message.is_user) !== (stage === 'before') || message.is_system || !message.mes?.trim()) {reject('target-missing');}
                adapter.assertMutable(adapter.capture(target));
                if (!adapter.bundle().definition.updates.includes(stage)) {reject('stage-disabled', { stage });}
                await service.authorize({ signal, stage });
                const retry = retryIndex() === target && pending?.stage === stage ? pending : undefined;
                pending = undefined;
                if (!retry) {
                    setPhase('saving');
                    const rolledBack = await service.rollback({ index: target, signal });
                    if (rolledBack.committed) {await rewound?.();}
                    if (rolledBack.saved === false) {setPhase('unsaved'); return rolledBack;}
                    signal.throwIfAborted(); setPhase('preparing');
                }
                if (getContext().chat[target] !== message) {reject('stale-target');}
                const finish = async (staged: Awaited<ReturnType<SettlementService['stage']>>, input: unknown[], inputDigest: string): Promise<Result> => {
                    const preparation = await staged.prepare(input, stage, signal);
                    if (!preparation.ok) {return preparation;}
                    let preview: Result;
                    for (let execution = 0; ; execution++) {
                        setPhase('calculating');
                        preview = await staged.run(input, { preview: true, stage, signal, prepared: preparation.prepared });
                        signal.throwIfAborted(); staged.assertCurrent();
                        if (!environmentFailure(preview) || execution === 1) {break;}
                    }
                    if (environmentFailure(preview)) {
                        pending = { input: structuredClone(input), stage, index: target, basis: adapter.submissionBasis(target), staged };
                        return preview;
                    }
                    if (!preview.ok) {return preview;}
                    setPhase('saving');
                    return staged.run(input, { preview: false, source: modelSource(stage), stage, signal,
                        ...(stage === 'before' ? { beforeUpdate: { inputDigest, outcome: 'applied' as const, diagnostics: [] } } : {}) });
                };
                if (retry) {
                    activeIndex = target;
                    const staged = retry.staged;
                    const result = await finish(staged, retry.input, digest(getContext().chat[target].mes));
                    setPhase(result.ok ? result.saved === false ? 'unsaved' : 'success' : 'failed');
                    return result;
                }
                const prepared = await prepare(stage, index, signal);
                if (!window.xiaobaixAgent?.openSession) {reject('agent-unavailable');}
                session = await modelRequest(() => window.xiaobaixAgent!.openSession({ api: readSettings().source, signal }));
                let task = prepared.task;
                const customNames = new Set(activeTools(prepared.staged.bundle, stage).map(([name]) => name));
                let toolCalls = 0, attempt = 0;
                const detailed = details = (result: Result): Result => {
                    const calls = result.extensions?.calls || prepared.staged.extensions.calls;
                    if (calls.length || customNames.size) {result.extensions = { calls: structuredClone(calls), modelRequests };}
                    return result;
                };
                while (attempt < 2) {
                    setPhase(attempt ? 'correcting' : 'requesting');
                    modelRequests++;
                    const response = await modelRequest(() => session!.chat({ ...task, signal }));
                    prepared.staged.assertCurrent(); signal.throwIfAborted();
                    const calls = response.toolCalls || [];
                    const toolBatch = calls.length > 0 && calls.every(call => customNames.has(call.name) || handoffReceipt(call.name));
                    const custom = calls.some(call => customNames.has(call.name));
                    // Repeated handoff calls alone past the limit become a rejected submission.
                    if (!response.truncated && response.completion === 'complete' && toolBatch && (custom || toolCalls + calls.length <= TOOL_CALL_LIMIT)) {
                        if (toolCalls + calls.length > TOOL_CALL_LIMIT) {setPhase('failed'); return detailed({ ok: false, diagnostics: [{ code: 'extension-limit' }] });}
                        task = { ...task, messages: [...task.messages, response.reply] };
                        for (const call of calls) {
                            toolCalls++;
                            const receipt = handoffReceipt(call.name);
                            if (receipt) { task.messages.push(session.toolResult(call, receipt)); continue; }
                            let output: Json;
                            try {
                                const args = JSON.parse(call.arguments) as Json;
                                setPhase('tool');
                                output = await prepared.staged.extensions.tool(call.name, args, stage, signal);
                            } catch (error) {
                                signal.throwIfAborted();
                                const issue = diagnostic(error);
                                if (!['extension-parameters', 'extension-execution'].includes(issue.code) && !(error instanceof SyntaxError)) {
                                    setPhase('failed'); return detailed({ ok: false, diagnostics: [issue] });
                                }
                                output = { ok: false, error: error instanceof SyntaxError ? error.message : JSON.stringify(issue) };
                            }
                            prepared.staged.assertCurrent(); signal.throwIfAborted();
                            task.messages.push(session.toolResult(call, output));
                        }
                        continue;
                    }
                    let preview: Result;
                    try {
                        preview = await finish(prepared.staged, parseSubmission(response), prepared.inputDigest);
                    } catch (error) { signal.throwIfAborted(); preview = { ok: false, diagnostics: [diagnostic(error)] }; }
                    if (preview.ok) {
                        setPhase(preview.saved === false ? 'unsaved' : 'success');
                        return detailed(preview);
                    }
                    if (!correctable(preview)) { setPhase('failed'); return detailed(preview); }
                    if (attempt) {
                        // Only a valid action rejected by its authored precondition
                        // is a story failure. Bad submissions/VM/schema errors are not.
                        if (stage === 'before' && preview.diagnostics.every(issue => issue.code === 'action-precondition')) {
                            signal.throwIfAborted(); setPhase('saving');
                            const result = await prepared.staged.recordBefore({ inputDigest: prepared.inputDigest, outcome: 'rejected', diagnostics: preview.diagnostics });
                            setPhase(result.saved === false ? 'unsaved' : 'success'); return detailed(result);
                        }
                        setPhase('failed'); return detailed(preview);
                    }
                    const submission = { text: response.text, toolCalls: response.toolCalls, completion: response.completion, truncated: response.truncated };
                    task = correctionTask(task, submission, correctionErrors(preview), 'state');
                    attempt++;
                }
                return { ok: false, diagnostics: [{ code: 'model-submission' }] };
            } catch (error) {
                setPhase(signal.aborted ? 'cancelled' : 'failed');
                return details({ ok: false, diagnostics: [signal.aborted ? { code: 'cancelled' } : diagnostic(error)] });
            } finally { session?.dispose(); controller = undefined; activeIndex = undefined; changed?.(); }
        },
    };
}
