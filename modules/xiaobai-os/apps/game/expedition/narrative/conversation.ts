import type { AgentCapability } from '../../../../capabilities/agent/index.js';
import type { Campaign, ConversationTurn } from '../campaign/types.js';
import { CAMPAIGN_RULES } from '../campaign/rules.js';
import { isPerson, type Participant } from '../content/participants.js';
import { conversationContext } from './prompt.js';
import type { NarrativeAction } from './actions.js';
import type { AffectionDirection } from '../campaign/relationships.js';
import { fault } from '../random.js';
import { loadNarrativeCanon } from './canon.js';
import { prepareConversation, type ConversationMemoryAccess, type TokenCounter } from './memory.js';
import { runNarrativeRequest } from './provider.js';
import { readPerformance } from '../performance/catalog.js';
import { decodeNarrativeReply } from './response.js';
import { readClothingChange } from '../clothing.js';

export type ConversationPhase = 'preparing' | 'summarizing' | 'waiting' | 'thinking' | 'replying' | 'saving' | 'stopping';

export interface ConversationOptions {
    loadCanon?: typeof loadNarrativeCanon;
    countTokens?: TokenCounter;
    memory: ConversationMemoryAccess;
    received: (response: Record<string, unknown>) => void;
    onPhase?: (phase: ConversationPhase) => void;
}

export type ConversationResult = Pick<ConversationTurn, 'reply' | 'action' | 'performance' | 'clothing'> & (
    { kind: 'dialogue'; affection: AffectionDirection; issue?: ConversationTurn['issue'] }
    | { kind: 'receipt'; affection: null; issue: 'reply_invalid' | 'reply_incomplete' }
);
function receipt(text: unknown, issue: 'reply_invalid' | 'reply_incomplete'): ConversationResult {
    if (typeof text !== 'string' || !text.trim()) { fault(issue); }
    return { kind: 'receipt', reply: text, action: null, affection: null, issue };
}

export async function generateConversation(agent: AgentCapability, campaign: Campaign, person: Participant, text: string, signal: AbortSignal, options: ConversationOptions) {
    const check = () => { if (signal.aborted) { fault('cancelled'); } };
    const config = await agent.loadConfig(); check();
    const session = await agent.openSession(config); check();
    if (!String(session.providerConfig.model ?? '').trim()) { fault('agent_not_configured'); }
    const canon = await (options.loadCanon ?? loadNarrativeCanon)(person, signal); check();
    const prepare = (force = false) => {
        options.onPhase?.('preparing');
        return prepareConversation(session, campaign, person, text, canon, signal, {
            ...options, force, onWait: () => options.onPhase?.('summarizing'),
        });
    };
    const prompt = await prepare(); check();
    const requestDialogue = async (prepared: typeof prompt) => {
        options.onPhase?.('waiting');
        let streaming = true, text = '', thoughts = '';
        try { return await runNarrativeRequest(session, { ...prepared, tools: [], maxTokens: 2400, signal,
            onStreamProgress(snapshot) {
                if (!streaming || signal.aborted) { return; }
                const nextText = typeof snapshot.text === 'string' ? snapshot.text : text;
                const nextThoughts = Array.isArray(snapshot.thoughts) ? snapshot.thoughts.map(item => String(item.text ?? '')).join('\n') : thoughts;
                // Native activity covers hidden reasoning; cumulative snapshots only
                // prove activity when content changes. Never forward their contents.
                if (snapshot.activity === 'waiting' || snapshot.activity === 'thinking' || snapshot.activity === 'replying') {
                    options.onPhase?.(snapshot.activity);
                } else if (nextText && nextText !== text) { options.onPhase?.('replying'); }
                else if (nextThoughts && nextThoughts !== thoughts) { options.onPhase?.('thinking'); }
                text = nextText; thoughts = nextThoughts;
            },
        }); }
        catch (error) {
            const cause = (error as { cause?: { partialResponse?: Record<string, unknown> } }).cause;
            if (!cause?.partialResponse) { throw error; }
            return { ...cause.partialResponse, truncated: true };
        }
        finally { streaming = false; }
    };
    let response;
    try { response = await requestDialogue(prompt); }
    catch (error) {
        if (!(error && typeof error === 'object' && 'code' in error && error.code === 'expedition_context_capacity')) { throw error; }
        const compacted = await prepare(true).catch(compactionError => {
            // If local compaction cannot make room, retain the provider rejection that
            // triggered it. A new summary-provider failure still reports its own cause.
            if (compactionError && typeof compactionError === 'object' && compactionError.code === 'expedition_context_capacity'
                && !('cause' in compactionError)) { throw error; }
            throw compactionError;
        }); check();
        response = await requestDialogue(compacted);
    }
    options.received(response); check();
    if (typeof response.text !== 'string') { fault('reply_invalid'); }
    const decoded = decodeNarrativeReply(response.text);
    if (!decoded) { return receipt(response.text, response.truncated ? 'reply_incomplete' : 'reply_invalid'); }
    if (response.truncated || !decoded.complete) { return receipt(decoded.reply, 'reply_incomplete'); }
    if (decoded.reply.length > CAMPAIGN_RULES.replyTextLimit) { return receipt(decoded.reply, 'reply_invalid'); }
    const reply = decoded.reply;
    if (!decoded.controls) {
        return { kind: 'dialogue' as const, reply, action: null, affection: null, issue: 'metadata_invalid' as const };
    }
    const result = decoded.controls;
    const submitted = typeof result.action === 'string' ? result.action.trim() : result.action;
    const action = typeof submitted === 'string' && conversationContext(campaign, person, canon.stages).actions.includes(submitted) ? submitted as NarrativeAction : null;
    const performance = readPerformance(person, result.performance);
    const clothing = readClothingChange(result.clothing);
    const issue = submitted !== null && submitted !== undefined && !action ? 'action_rejected' as const
        : clothing.rejected ? 'clothing_rejected' as const
        : result.performance !== null && result.performance !== undefined && !performance ? 'performance_rejected' as const : undefined;
    const affection: AffectionDirection = isPerson(person) && (result.affection === 'up' || result.affection === 'down') ? result.affection : null;
    return { kind: 'dialogue' as const, reply, action, affection, ...(performance ? { performance } : {}),
        ...(clothing.change ? { clothing: clothing.change } : {}), ...(issue ? { issue } : {}) };
}
