import type { Campaign, ConversationTurn, DialogueEffects } from './types.js';
import { isPerson, type Participant } from '../content/participants.js';
import { fault } from '../random.js';
import { relationshipBand } from './relationships.js';

/** One bounded checkpoint: no transcripts, summaries, battle frames or nested snapshots. */
export function dialogueEffects(campaign: Campaign): DialogueEffects {
    const { seed, facts, knowledge, relationships, people, pendingParley } = campaign;
    return structuredClone({ seed, facts, knowledge, relationships, people, pendingParley });
}
export function latestReply(campaign: Campaign) {
    const checkpoint = campaign.lastReply;
    if (!checkpoint) { return null; }
    const turn = campaign.conversations[checkpoint.person].at(-1);
    return turn?.id === checkpoint.turnId ? { person: checkpoint.person, turn } : null;
}
/** The last reply remains replaceable after its world effects have been committed. */
export function latestConversationReply(campaign: Campaign, person: Participant) {
    const turn = campaign.conversations[person].at(-1);
    return turn && turn.kind !== 'greeting' ? turn : null;
}
/** A durable user message, not a request/job: it survives cancellation and reload. */
export function playerTurn(turn: ConversationTurn): ConversationTurn {
    return { id: turn.id, kind: 'player', player: turn.player, reply: '', action: null, scene: turn.scene, facts: [...turn.facts] };
}
export function prepareRegeneration(campaign: Campaign, person: Participant, turnId: string): Campaign {
    const turn = latestConversationReply(campaign, person);
    if (!turn || turn.id !== turnId) { fault('stale'); }
    if (turn.kind === 'player') { return structuredClone(campaign); }
    const candidate = rewindReply(campaign, person, turnId);
    // Rewinding an uncommitted reply may also remove knowledge gained in that reply.
    candidate.conversations[person].push({ ...playerTurn(turn), facts: turn.facts.filter(fact => candidate.facts.includes(fact)) });
    return candidate;
}
export function pendingEnding(campaign: Campaign) {
    const reply = latestReply(campaign);
    return reply?.turn.action === 'finish' && !campaign.facts.includes('chapter_completed') ? reply.person : null;
}
export function rewindReply(campaign: Campaign, person: Participant, turnId: string): Campaign {
    const turn = latestConversationReply(campaign, person), checkpoint = campaign.lastReply;
    if (!turn || turn.id !== turnId) { fault('stale'); }
    const ending = pendingEnding(campaign);
    if (ending && ending !== person) { fault('unavailable'); }
    const candidate = structuredClone(campaign);
    candidate.conversations[person].pop();
    if (checkpoint?.person === person && checkpoint.turnId === turnId) {
        Object.assign(candidate, structuredClone(checkpoint.before));
    } else if (isPerson(person)) {
        // World travel/facts are already committed. Only this person's reply-owned
        // relationship and clothing effects are replaced; clothing derives from turns.
        const relation = candidate.relationships[person];
        relation.affection -= turn.affectionDelta ?? 0;
        let affection = relation.affection, peak = affection;
        for (let i = candidate.conversations[person].length - 1; i >= 0; i--) {
            affection -= candidate.conversations[person][i].affectionDelta ?? 0;
            peak = Math.max(peak, affection);
        }
        relation.highestBand = relationshipBand(peak);
    }
    delete candidate.lastReply;
    return candidate;
}
