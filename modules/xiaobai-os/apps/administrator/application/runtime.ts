import type { XiaobaiOsAgentGateway } from '../../../capabilities/agent/gateway.js';
import type { ManagementRegistry } from '../../../capabilities/management/index.js';
import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import { createAdministratorToolExecutor, type AdministratorToolExecutor, type AdministratorConfirmation } from '../agent/tool-executor.js';
import { runAdministratorLoop } from '../agent/provider-loop.js';
import { administratorContext, contextUsage, historyBefore, type AdministratorHistory } from '../agent/history.js';
import { ADMINISTRATOR_PROMPT } from '../agent/prompt.js';
import { administratorReferenceMessage } from '../agent/reference-data.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';
import { settledOperations } from '../domain/data.js';
import type { AdministratorContextUsage, AdministratorLive, AdministratorOperation, AdministratorTurn } from '../domain/types.js';
import { createAdministratorChatReader, type AdministratorChatSurface } from '../host/chat-reader.js';
import type { AdministratorRepository } from '../storage/repository.js';
import { parseAdministratorUpload, type AdministratorImages, type AdministratorUpload } from '../storage/images.js';
import type { AdministratorConversation } from './conversation.js';
import { administratorError, ADMINISTRATOR_COPY } from '../ui/copy.js';
import { createAdministratorId } from './identity.js';
import { administratorProcess } from './process.js';
import type { AdministratorEnvironmentReader } from '../domain/environment.js';

interface ActiveRun {
    current(): boolean;
    identity: string; sourceIdentity: string; turn: AdministratorTurn;
    abort: AbortController; context: AdministratorHistory | null; executor: AdministratorToolExecutor | null;
    reader: ReturnType<typeof createAdministratorChatReader>; text: string;
    phase: AdministratorLive['phase']; promise: Promise<void> | null;
    preview: AdministratorOperation[];
    failed: boolean;
}
interface PendingSend {
    turn: AdministratorTurn;
    input: AdministratorUpload | null;
    current(): boolean;
    stopped: boolean;
    preparing: boolean;
}
export function createAdministratorRuntime(deps: {
    conversation: AdministratorConversation; repository: AdministratorRepository; images: AdministratorImages;
    gateway: XiaobaiOsAgentGateway; management: ManagementRegistry; capture(): AdministratorChatSurface | null;
    readEnvironment: AdministratorEnvironmentReader;
    changed(): void;
}) {
    const { conversation, repository } = deps;
    let run: ActiveRun | null = null;
    let pendingSend: PendingSend | null = null;
    let submission: { id: string; turnId: string; current(): boolean } | null = null;
    let error = '';
    let usage: AdministratorContextUsage = { used: 0, limit: POLICY.inputBudget, trigger: POLICY.summaryTrigger, rules: 0, tools: 0, history: 0, images: 0, runtime: 0 };
    let streamTimer: ReturnType<typeof setTimeout> | null = null;
    const sameChat = (active: ActiveRun) => active.current() && repository.identity() === active.identity && deps.capture()?.identityKey === active.sourceIdentity;
    // A failed run owns its unsaved display until confirmation, abandonment or chat reset.
    // This never replaces confirmed conversation data or starts another dispatch.
    const unsavedRun = () => run?.failed && !run.promise && sameChat(run) && conversation.unsaved() ? run : null;
    function changed(immediate = false) {
        if (immediate) { if (streamTimer) { clearTimeout(streamTimer); streamTimer = null; } deps.changed(); }
        else if (!streamTimer) { streamTimer = setTimeout(() => { streamTimer = null; deps.changed(); }, POLICY.streamInterval); }
    }
    async function persistTurn(active: ActiveRun, confirmation?: AdministratorConfirmation) {
        if (!sameChat(active)) { throw new Error('administrator_context_changed'); }
        const candidate = structuredClone(conversation.read());
        const index = candidate.turns.findIndex(turn => turn.id === active.turn.id);
        if (index < 0) { throw new Error('administrator_message_missing'); }
        if (confirmation) {
            const target = candidate.turns[index], { messageIndex, result } = confirmation;
            const operationIndex = target.operations.findIndex(operation => operation.id === result.receipt.id);
            // Adoption may have removed this attempt. Confirmation never recreates it.
            if (operationIndex < 0) { return; }
            const message = target.toolMessages[messageIndex], original = active.turn.toolMessages[messageIndex];
            if (!message || message.role !== 'tool' || message.toolCallId !== original?.toolCallId || message.toolName !== original.toolName) { throw new Error('administrator_history_conflict'); }
            message.content = original.content = safePromptJson(result);
            target.operations[operationIndex] = { ...result.receipt };
            const boundary = candidate.summary && candidate.turns.findIndex(turn => turn.id === candidate.summary!.throughId);
            if (boundary !== null && (boundary > index || boundary === index && (candidate.summary!.throughToolMessage === null || candidate.summary!.throughToolMessage! > messageIndex))) { candidate.summary = null; }
            if (JSON.stringify(target) === JSON.stringify(conversation.read().turns[index]) && JSON.stringify(candidate.summary) === JSON.stringify(conversation.read().summary)) { return; }
            await conversation.save(candidate, () => sameChat(active)); return;
        }
        candidate.turns[index] = { ...structuredClone(active.turn), operations: settledOperations(active.turn.operations) };
        if (active.context) { candidate.summary = structuredClone(active.context.summary); }
        await conversation.save(candidate, () => sameChat(active));
    }
    async function perform(active: ActiveRun) {
        try {
            const config = await deps.gateway.loadConfig();
            active.executor = await createAdministratorToolExecutor({ registry: deps.management, reader: active.reader,
                readEnvironment: deps.readEnvironment,
                operations: active.turn.operations,
                guard: () => sameChat(active) && active.reader.isCurrent(), onChange: () => { if (sameChat(active)) { changed(true); } },
                saveReceipts: confirmation => persistTurn(active, confirmation),
            });
            active.abort.signal.throwIfAborted();
            const image = active.turn.user?.image;
            const dataUrl = image ? await deps.images.load(repository.osId()!, image, active.abort.signal) : null;
            const userText = active.turn.user?.text ?? '';
            const text = await runAdministratorLoop({ gateway: deps.gateway, config, state: active.context!,
                system: [ADMINISTRATOR_PROMPT, active.executor.prompt].join('\n\n'),
                prefix: [administratorReferenceMessage(active.executor.data)],
                request: { role: 'user', content: dataUrl ? [{ type: 'text', text: userText || ADMINISTRATOR_COPY.imageRequest }, { type: 'image_url', image_url: { url: dataUrl } }] : userText },
                requestForCounting: { role: 'user', content: userText }, imageCount: dataUrl ? 1 : 0,
                getTools: active.executor.getTools, signal: active.abort.signal, execute: active.executor.execute, save: () => persistTurn(active),
                onText: value => { active.text = value; if (sameChat(active)) { changed(); } },
                onPhase: value => { active.phase = value; if (sameChat(active)) { changed(true); } },
                onContext: value => { if (sameChat(active)) { usage = value; changed(); } },
                onToolPreview: names => { active.preview = active.executor!.preview(names); if (sameChat(active)) { changed(); } },
            });
            active.turn.assistant = text; active.turn.status = 'finished'; active.turn.error = '';
            active.phase = 'saving'; changed(true);
            await persistTurn(active);
            active.failed = false;
            active.reader.releaseEvidence();
            if (run === active) { error = ''; }
        } catch (cause) {
            active.failed = true;
            const reason = active.abort.signal.aborted ? ADMINISTRATOR_COPY.stopped : administratorError(cause);
            if (run === active) { error = reason; }
            if (sameChat(active)) {
                active.turn.status = active.abort.signal.aborted ? 'interrupted' : 'failed';
                active.turn.error = reason;
                // Partial prose is visible as interrupted, never as a completed reply.
                active.turn.assistant = active.text || null;
                if (!conversation.unsaved()) {
                    try { await persistTurn(active); }
                    catch (saveError) { if (run === active) { error = `${reason}\n${administratorError(saveError)}`; } }
                }
            }
        } finally {
            active.context = null;
            active.promise = null;
            if (run === active && sameChat(active)) { changed(true); }
        }
    }
    async function launch(turnId: string) {
        if (run?.promise || conversation.unsaved()) { throw new Error('administrator_busy'); }
        const turn = conversation.read().turns.find(t => t.id === turnId);
        if (!turn?.user) { throw new Error('administrator_message_missing'); }
        const source = deps.capture();
        if (!source) { throw new Error('administrator_chat_unavailable'); }
        const history = historyBefore(conversation.read(), turn.id);
        const currentTurn = structuredClone(turn);
        const active: ActiveRun = { current: conversation.capture(), identity: repository.identity(), sourceIdentity: source.identityKey, turn: currentTurn,
            abort: new AbortController(), context: { turns: [...history.turns, currentTurn], summary: history.summary }, executor: null,
            text: '', phase: 'preparing', promise: null, preview: [], failed: false, reader: createAdministratorChatReader(deps.capture, () => active.abort.signal) };
        run = active; error = '';
        active.promise = perform(active); changed(true);
    }
    async function continueSend(sending: PendingSend) {
        const guard = () => !sending.stopped && sending.current() && pendingSend === sending;
        const assertCurrent = () => { if (!guard()) { throw new Error(sending.stopped ? 'administrator_stopped' : 'administrator_context_changed'); } };
        sending.preparing = true; changed(true);
        try {
            assertCurrent();
            if (sending.input && !repository.osId()) { await conversation.save(conversation.read(), guard); }
            assertCurrent();
            if (sending.input && !sending.turn.user!.image) {
                const osId = repository.osId()!;
                const image = await deps.images.save(osId, sending.input);
                if (!guard()) { await deps.images.remove(osId, image); assertCurrent(); }
                sending.turn.user!.image = image;
                sending.input = null;
            }
            assertCurrent();
            await conversation.prepareTurn(sending.turn, guard);
            assertCurrent();
            pendingSend = null;
            await launch(sending.turn.id);
        } catch (cause) {
            // Only an unconfirmed save needs a live continuation. Upload failure leaves the UI draft resendable.
            if (pendingSend === sending && !conversation.unsaved()) { pendingSend = null; }
            throw cause;
        } finally { sending.preparing = false; changed(true); }
        return sending.turn.id;
    }
    function start(request: Pick<AdministratorTurn, 'id' | 'createdAt' | 'user'>, input: AdministratorUpload | null = null, submissionId: string | null = null) {
        const identity = repository.identity(), source = deps.capture()?.identityKey;
        const current = conversation.capture();
        const guard = () => current() && identity === repository.identity() && !!source && source === deps.capture()?.identityKey;
        run = null; error = '';
        submission = submissionId ? { id: submissionId, turnId: request.id, current: guard } : null;
        const turn: AdministratorTurn = { id: request.id, createdAt: request.createdAt, user: structuredClone(request.user),
            assistant: null, toolMessages: [], operations: [], status: 'interrupted', error: '' };
        const sending: PendingSend = { turn, input, current: guard, stopped: false, preparing: false };
        pendingSend = sending;
        return continueSend(sending);
    }
    return {
        busy: () => !!run?.promise || !!pendingSend?.preparing,
        submission: () => submission?.current() ? { id: submission.id, turnId: submission.turnId,
            accepted: conversation.read().turns.some(turn => turn.id === submission!.turnId && !!turn.user) } : null,
        error: () => error,
        context: () => usage,
        async prepareContext() {
            if (run?.promise || conversation.corrupted()) { return; }
            const sourceIdentity = deps.capture()?.identityKey;
            if (!sourceIdentity) { return; }
            const current = conversation.capture();
            const agent = await deps.gateway.openSession(await deps.gateway.loadConfig());
            if (!current() || run?.promise || deps.capture()?.identityKey !== sourceIdentity) { return; }
            const abort = new AbortController();
            const reader = createAdministratorChatReader(deps.capture, () => abort.signal);
            const executor = await createAdministratorToolExecutor({ registry: deps.management, reader, readEnvironment: deps.readEnvironment, operations: [], guard: () => false, onChange() {}, async saveReceipts() {} });
            if (!current() || run?.promise || deps.capture()?.identityKey !== sourceIdentity) { return; }
            const projected = administratorContext(conversation.read());
            usage = contextUsage([ADMINISTRATOR_PROMPT, executor.prompt].join('\n\n'), executor.getTools(),
                [administratorReferenceMessage(executor.data)],
                projected, 0, agent.providerConfig);
            changed(true);
        },
        async confirmed(resumeSend = true) {
            if (conversation.unsaved()) { return; }
            const sending = pendingSend;
            if (sending?.current()) {
                if (resumeSend && !sending.stopped) {
                    await continueSend(sending); return;
                }
                pendingSend = null;
            }
            if (run && sameChat(run) && conversation.read().turns.some(turn => turn.id === run!.turn.id)) {
                const active = run;
                const inspection = await active.executor?.confirmSaved();
                if (run === active && sameChat(active)) {
                    if (inspection?.status === 'superseded') { error = administratorError(new Error('management_request_superseded')); }
                    if (inspection?.status === 'unverifiable') { error = administratorError(inspection.error); }
                }
            }
            if (run?.failed && !conversation.unsaved()) {
                const actual = conversation.read().turns.find(turn => turn.id === run!.turn.id);
                if (actual?.status === 'finished' && actual.assistant === run.turn.assistant) {
                    run.failed = false; run.reader.releaseEvidence(); error = '';
                }
            }
            await this.prepareContext();
        },
        live(): AdministratorLive | null {
            if (pendingSend?.preparing && pendingSend.current()) {
                return { turnId: pendingSend.turn.id, text: '', totalChars: 0, process: [], preview: [], phase: pendingSend.stopped ? 'stopping' : 'preparing' };
            }
            return run?.promise && sameChat(run) ? { turnId: run.turn.id, text: run.text.slice(0, POLICY.textBlock), totalChars: run.text.length,
                process: administratorProcess(run.turn, true), preview: run.preview, phase: run.abort.signal.aborted ? 'stopping' : run.phase } : null;
        },
        unsavedProcess() {
            const active = unsavedRun();
            return active ? { turnId: active.turn.id, rounds: administratorProcess(active.turn) } : null;
        },
        process(turnId: string) {
            const visible = run?.promise && sameChat(run) ? run : unsavedRun();
            const active = visible?.turn.id === turnId ? visible : null;
            const turn = active?.turn ?? conversation.read().turns.find(item => item.id === turnId);
            if (!turn) { throw new Error('administrator_message_missing'); }
            return administratorProcess(turn, !!active?.promise);
        },
        async send(submissionId: unknown, text: string, upload?: unknown) {
            if (run?.promise || conversation.unsaved()) { throw new Error('administrator_busy'); }
            if (typeof submissionId !== 'string' || !submissionId || submissionId.length > 128) { throw new Error('administrator_input_invalid'); }
            if (typeof text !== 'string' || text.length > 16000 || !text.trim() && !upload) { throw new Error('administrator_input_invalid'); }
            const input: AdministratorUpload | null = upload ? parseAdministratorUpload(upload) : null;
            return start({ id: createAdministratorId(), createdAt: Date.now(), user: { text: text.trim() } }, input, submissionId);
        },
        async regenerate(turnId: string) {
            if (run?.promise || conversation.unsaved()) { throw new Error('administrator_busy'); }
            const turn = conversation.read().turns.find(item => item.id === turnId);
            if (!turn?.user) { throw new Error('administrator_message_missing'); }
            return start(turn);
        },
        evidence(reference: string, offset?: unknown) {
            if (!run?.executor || !sameChat(run)) { throw new Error('administrator_evidence_expired'); }
            return run.executor.evidence(reference, offset);
        },
        stop() { run?.abort.abort(); if (pendingSend) { pendingSend.stopped = true; } changed(true); },
        async reset() {
            if (pendingSend) { pendingSend.stopped = true; }
            const previous = run; run = null; pendingSend = null; submission = null; previous?.abort.abort();
            error = ''; usage = { ...usage, used: 0, history: 0, rules: 0, tools: 0, images: 0, runtime: 0 };
            if (streamTimer) { clearTimeout(streamTimer); streamTimer = null; }
            if (previous?.promise) { await previous.promise; }
        },
    };
}
export type AdministratorRuntime = ReturnType<typeof createAdministratorRuntime>;
