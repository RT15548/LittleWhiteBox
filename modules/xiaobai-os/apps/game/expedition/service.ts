import { ECONOMY_TRANSACTION_CAPABILITY, type EconomyReadCapability } from '../../../capabilities/economy/index.js';
import type { PartitionStore, XiaobaiOsFileControls, XiaobaiOsFileState } from '../../../kernel/contracts.js';
import { advanceExpedition, emptyExpedition, expeditionProgress } from './domain.js';
import { expeditionRights, postExpeditionMoney, validateEconomy } from './economy.js';
import { EXPEDITION_PARTITION, expeditionId, parseCommand, boundedText } from './partition.js';
import { fault } from './random.js';
import type { Command, ExpeditionData } from './types.js';
import type { AgentCapability } from '../../../capabilities/agent/index.js';
import type { Participant } from './content/participants.js';
import { canTalk, CAMPAIGN_RULES } from './campaign/rules.js';
import { prepareRegeneration } from './campaign/reply-checkpoint.js';
import { applyReply } from './narrative/apply-reply.js';
import { generateConversation, type ConversationOptions, type ConversationPhase } from './narrative/conversation.js';
import { createMemoryJobs, type MemoryJobState } from './narrative/memory-jobs.js';
import { memoryBoundary, sameMemory } from './narrative/history.js';
import { expeditionFailure, type ExpeditionFailure } from './failure.js';

export interface ExpeditionView {
    data: ExpeditionData & ReturnType<typeof expeditionProgress>; balance: number; ready: boolean; pending: boolean; writeState: XiaobaiOsFileState;
    fileRevision: number;
    conversation: { actionId: string; person: Participant; text: string; regenerating: boolean; phase: ConversationPhase; startedAt: number } | null;
    replyFailure: ({ actionId: string; person: Participant; playerText: string; regenerating: boolean; text: string | null } & ExpeditionFailure) | null;
    memories: Partial<Record<Participant, MemoryJobState>>;
}
export interface ExpeditionRequest { actionId: string; revision: number; command: Command }
export function createExpeditionService(store: PartitionStore<ExpeditionData>, files: XiaobaiOsFileControls, economy: EconomyReadCapability,
    dependencies: { seed?: () => number; idle?: () => boolean; agent?: AgentCapability } & Partial<Pick<ConversationOptions, 'loadCanon' | 'countTokens'>> = {}) {
    let conversation: ExpeditionView['conversation'] = null, replyFailure: ExpeditionView['replyFailure'] = null;
    const listeners = new Set<() => void>();
    const memories = createMemoryJobs({ countTokens: dependencies.countTokens, changed: () => listeners.forEach(listener => listener()),
        async save(snapshot, person, memory, signal) {
            let accepted = false;
            const result = await store.transact(transaction => {
                if (signal.aborted) { fault('cancelled'); }
                const data = transaction.current, active = data?.active;
                if (!active || active.id !== snapshot.id) { fault('stale'); }
                const boundary = memoryBoundary(snapshot.conversations[person], memory);
                if (!sameMemory(active.memories[person], snapshot.memories[person])
                    || JSON.stringify(active.conversations[person].slice(0, boundary)) !== JSON.stringify(snapshot.conversations[person].slice(0, boundary))) { fault('stale'); }
                const next = structuredClone(data!); next.active!.memories[person] = memory;
                // Memory maintenance is not a game move: preserve action revision,
                // last action and all turns received since the snapshot was taken.
                transaction.replace(next); accepted = true;
            }, { retainFailedCandidate: true, commitGuard: () => accepted || !signal.aborted });
            if (result.status !== 'confirmed' && result.status !== 'unchanged') { fault(`save_${result.status}`); }
        },
    });
    function view(): ExpeditionView {
        let data: ExpeditionData, fileRevision: number;
        try {
            const snapshot = store.peekCurrent();
            data = structuredClone(snapshot?.value ?? emptyExpedition()); fileRevision = snapshot?.envelopeRevision ?? 0;
        }
        catch (error) {
            if (error && typeof error === 'object' && 'code' in error && error.code === 'partition_invalid') {
                if (files.hasPendingCommit(EXPEDITION_PARTITION.key)) {
                    fault(files.getFileState() === 'failed' ? 'save_failed' : files.getFileState() === 'conflict' ? 'save_conflict' : 'save_unconfirmed', error);
                }
                fault('data_invalid', error);
            }
            throw error;
        }
        return { data: { ...data, ...expeditionProgress(data) }, fileRevision, balance: economy.getPlayerBalance(), ready: economy.isOpen(),
            pending: files.hasPendingCommit(EXPEDITION_PARTITION.key), writeState: files.getFileState(), conversation, replyFailure, memories: memories.states(data.active?.id) };
    }
    async function refresh() { await economy.refresh(); await store.readRaw(); return view(); }
    async function act(input: ExpeditionRequest, guard: () => boolean): Promise<ExpeditionView> {
        expeditionId(input.actionId); const command = parseCommand(input.command);
        if (!Number.isSafeInteger(input.revision) || input.revision < 0) { fault('invalid'); }
        const allowed = () => guard() && (dependencies.idle?.() ?? true);
        if (!allowed()) { fault('unavailable'); }
        let accepted = false;
        const result = await store.transact(transaction => {
            if (!allowed()) { fault('unavailable'); }
            const data = transaction.current ?? emptyExpedition(), money = transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
            validateEconomy(data, money);
            if (data.last?.id === input.actionId) { if (JSON.stringify(data.last.command) !== JSON.stringify(command)) { fault('identity'); } return; }
            if (data.revision !== input.revision) { fault('stale'); }
            const seed = command.type === 'start' || command.type === 'restart' ? (dependencies.seed?.() ?? crypto.getRandomValues(new Uint32Array(1))[0]) : 0;
            const next = advanceExpedition(data, command, input.actionId, seed);
            postExpeditionMoney(data, next, money); validateEconomy(next, money); transaction.replace(next); accepted = true;
        }, { retainFailedCandidate: true, commitGuard: () => (accepted || guard()) && (dependencies.idle?.() ?? true) });
        if (result.status !== 'confirmed' && result.status !== 'unchanged') { throw Object.assign(new Error(`expedition_save_${result.status}`), { code: `expedition_save_${result.status}` }); }
        if (command.type === 'start' || command.type === 'restart') { replyFailure = null; memories.stop(); }
        return view();
    }
    async function converse(input: { actionId: string; revision: number; person: Participant; text: string; regenerate?: string }, guard: () => boolean, signal: AbortSignal) {
        expeditionId(input.actionId); boundedText(input.text, CAMPAIGN_RULES.playerTextLimit);
        if (input.regenerate !== undefined) { expeditionId(input.regenerate); }
        const allowed = () => guard() && !signal.aborted;
        const current = view().data, saved = current.active;
        if (!allowed() || conversation || !(dependencies.idle?.() ?? true) || !saved) { fault('unavailable'); }
        const previous = saved.conversations[input.person].find(t => t.id === input.actionId);
        if (previous) { if (previous.player !== input.text || previous.regeneratedFrom !== input.regenerate) { fault('identity'); } return view(); }
        if (current.revision !== input.revision) { fault('stale'); }
        let campaign = input.regenerate ? prepareRegeneration(saved, input.person, input.regenerate) : saved;
        if (input.regenerate && saved.conversations[input.person].at(-1)?.player !== input.text) { fault('identity'); }
        if (!canTalk(campaign, input.person)) { fault('unavailable'); }
        if (!dependencies.agent) { fault('agent_not_configured'); }
        let revision = input.revision;
        let received: Record<string, unknown> | null = null;
        conversation = { actionId: input.actionId, person: input.person, text: input.text, regenerating: !!input.regenerate, phase: 'preparing', startedAt: Date.now() };
        replyFailure = null;
        const onPhase = (phase: ConversationPhase) => {
            if (!conversation || conversation.phase === phase || signal.aborted && phase !== 'stopping') { return; }
            conversation = { ...conversation, phase };
            listeners.forEach(listener => listener());
        };
        const stopping = () => onPhase('stopping');
        signal.addEventListener('abort', stopping, { once: true });
        try {
        listeners.forEach(listener => listener());
        if (input.regenerate) {
            // Persist removal before any model request. Cancellation/reload leaves the
            // player's message, never resurrects the discarded assistant response.
            let accepted = false;
            const result = await store.transact(transaction => {
                if (!allowed()) { fault('cancelled'); }
                const data = transaction.current;
                if (!data?.active || data.revision !== revision || data.active.id !== campaign.id) { fault('stale'); }
                const next = structuredClone(data);
                next.active = prepareRegeneration(data.active, input.person, input.regenerate!);
                if (data.active.conversations[input.person].at(-1)?.kind !== 'player') {
                    next.revision++; transaction.replace(next); accepted = true;
                }
            }, { retainFailedCandidate: true, commitGuard: () => accepted || allowed() });
            if (result.status !== 'confirmed' && result.status !== 'unchanged') { fault(`save_${result.status}`); }
            const prepared = view().data;
            revision = prepared.revision;
            campaign = structuredClone(prepared.active!);
            // generateConversation already appends input.text as the final user message.
            campaign.conversations[input.person].pop();
            listeners.forEach(listener => listener());
        }
        const response = await generateConversation(dependencies.agent, campaign, input.person, input.text, signal, {
            loadCanon: dependencies.loadCanon, countTokens: dependencies.countTokens,
            onPhase,
            received: result => { received = result; },
            memory: {
                read() {
                    const active = store.peekCurrent()?.value?.active;
                    if (active?.id !== campaign.id) { fault('stale'); }
                    return active.memories[input.person];
                },
                compact: (session, snapshot) => memories.start(session, snapshot, input.person),
            },
        });
        if (!allowed()) { fault('unavailable'); }
        if (input.regenerate && response.kind === 'receipt') { fault(response.issue); }
        onPhase('saving');
        let accepted = false;
        const result = await store.transact(transaction => {
            if (!allowed()) { fault('unavailable'); }
            const data = transaction.current;
            if (!data || data.revision !== revision || !data.active || data.active.id !== campaign.id) { fault('stale'); }
            const next = structuredClone(data);
            if (!canTalk(next.active!, input.person)) { fault('stale'); }
            applyReply(next.active!, input, response);
            next.revision++;
            next.last = { id: input.actionId, command: { type: 'conversation', person: input.person, text: input.text } };
            const money = transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
            validateEconomy(data, money); postExpeditionMoney(data, next, money); validateEconomy(next, money);
            transaction.replace(next); accepted = true;
        }, { retainFailedCandidate: true, commitGuard: () => accepted || allowed() });
        if (result.status !== 'confirmed' && result.status !== 'unchanged') { throw Object.assign(new Error(`expedition_save_${result.status}`), { code: `expedition_save_${result.status}` }); }
        // A saved dialogue is a successful reply. Control diagnostics stay on its
        // turn; they must not become a second, persistent failure notification.
        replyFailure = response.kind === 'receipt' ? { actionId: input.actionId, person: input.person, playerText: input.text, regenerating: !!input.regenerate, text: null, code: `expedition_${response.issue}` } : null;
        if (response.kind === 'dialogue' && response.issue) {
            console.warn('[LittleWhiteBox:expedition]', { code: `expedition_${response.issue}`, person: input.person, actionId: input.actionId });
        }
        } catch (error) {
            const result = received as Record<string, unknown> | null;
            const failure = expeditionFailure(error);
            if (guard() && failure.code !== 'expedition_cancelled') {
                replyFailure = { actionId: input.actionId, person: input.person, playerText: input.text, regenerating: !!input.regenerate, text: typeof result?.text === 'string' ? result.text : null, ...failure };
            }
            throw error;
        } finally { signal.removeEventListener('abort', stopping); conversation = null; }
        return view();
    }
    return { view, refresh, act, converse, stopMemory: memories.stop,
        async retryMemory(person: Participant, guard: () => boolean) {
            if (!guard() || !(dependencies.idle?.() ?? true) || conversation) { fault('unavailable'); }
            const campaign = view().data.active;
            if (!campaign || memories.states(campaign.id)[person]?.status !== 'failed') { return view(); }
            if (!dependencies.agent) { fault('agent_not_configured'); }
            const session = await dependencies.agent.openSession(await dependencies.agent.loadConfig());
            if (!guard() || store.peekCurrent()?.value?.active?.id !== campaign.id) { fault('stale'); }
            if (!String(session.providerConfig.model ?? '').trim()) { fault('agent_not_configured'); }
            memories.clearFailure(person); void memories.start(session, campaign, person);
            return view();
        },
        async rebuild(actionId: string, guard: () => boolean) {
            expeditionId(actionId);
            const allowed = () => guard() && !conversation && (dependencies.idle?.() ?? true);
            const result = await store.transact(transaction => {
                if (!allowed()) { fault('unavailable'); }
                // This destructive command is offered only for invalid test data, never a valid journey.
                if (transaction.rawCurrent === undefined || EXPEDITION_PARTITION.parse(transaction.rawCurrent).ok) { fault('unavailable'); }
                const next = expeditionRights(transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY));
                next.revision = 1; next.last = { id: actionId, command: { type: 'rebuild' } };
                transaction.replace(next);
            }, { retainFailedCandidate: true, commitGuard: allowed });
            if (result.status !== 'confirmed' && result.status !== 'unchanged') { fault(`save_${result.status}`); }
            replyFailure = null; memories.stop(); return view();
        },
        async confirm(guard: () => boolean) {
            if (files.hasPendingCommit() && !files.hasPendingCommit(EXPEDITION_PARTITION.key)) { fault('unavailable'); }
            if (!guard() || !(dependencies.idle?.() ?? true)) { fault('unavailable'); }
            await files.retryPending({ beforeRetry: guard });
            const next = await refresh();
            if (!next.pending && next.writeState === 'ready') {
                for (const [person, state] of Object.entries(next.memories)) {
                    if (state.status === 'failed' && state.code.startsWith('expedition_save_')) { memories.clearFailure(person as Participant); }
                }
            }
            if (replyFailure && (next.data.active?.conversations[replyFailure.person].some(turn => turn.id === replyFailure!.actionId)
                || replyFailure.code.startsWith('expedition_save_') && !next.pending && next.writeState === 'ready')) { replyFailure = null; }
            return view();
        },
        // User-file notifications cover game writes without parsing an invalid optional partition before the owner can handle it.
        subscribe(listener: () => void) { listeners.add(listener); const stops = [economy.subscribe(listener), files.subscribeFileState(listener)]; return () => { listeners.delete(listener); stops.forEach(stop => stop()); }; },
    };
}
export type ExpeditionService = ReturnType<typeof createExpeditionService>;
