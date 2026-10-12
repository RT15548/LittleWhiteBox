import type { ConversationMemory, ConversationTurn } from '../campaign/types.js';
import type { CourtyardFact } from '../content/world-types.js';
import { FACT_COPY } from '../content/campaign-copy.js';
import { WORLD_COPY } from '../content/world-copy.js';
import { encodeNarrativeReply } from './response.js';

export function witnessedEvents(facts: readonly CourtyardFact[]) {
    return facts.map(id => ({ id, event: FACT_COPY[id] }));
}

/** Scene annotations reference the event catalogue; original speech and message roles stay intact. */
export function replayTurns(turns: readonly ConversationTurn[]) {
    const known = new Set<CourtyardFact>();
    let previousScene: ConversationTurn['scene'] | undefined;
    return turns.filter(turn => turn.kind !== 'receipt').flatMap(turn => {
        const newEvents = turn.facts.filter(id => !known.has(id));
        const scene = { ...(turn.scene === previousScene ? {} : { place: WORLD_COPY.scenes[turn.scene] }),
            ...(newEvents.length ? { newEvents } : {}) };
        turn.facts.forEach(id => known.add(id)); previousScene = turn.scene;
        const annotation = Object.keys(scene).length ? `<scene>\n${JSON.stringify(scene)}\n</scene>\n` : '';
        if (turn.kind === 'greeting') { return [{ role: 'assistant', content: encodeNarrativeReply(turn) }]; }
        if (turn.kind === 'player') { return [{ role: 'user', content: annotation + turn.player }]; }
        return [
            { role: 'user', content: annotation + turn.player },
            { role: 'assistant', content: encodeNarrativeReply(turn) },
        ];
    });
}

export function memoryBoundary(turns: readonly ConversationTurn[], memory: ConversationMemory | null) {
    return memory ? turns.findIndex(turn => turn.id === memory.throughId) + 1 : 0;
}

export function sameMemory(left: ConversationMemory | null, right: ConversationMemory | null) {
    return left?.throughId === right?.throughId && left?.text === right?.text;
}

export function historyForSummary(turns: readonly ConversationTurn[]) {
    const facts = [...new Set(turns.filter(turn => turn.kind !== 'receipt').flatMap(turn => turn.facts))];
    return { events: witnessedEvents(facts), conversation: replayTurns(turns) };
}
