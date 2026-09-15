import { parseEventRange } from '../vector/retrieval/temporal-turn-carrier.js';

// Causal background uses the existing evidence pool, never an extra pool.
const CAUSAL_POOL_SHARE = 0.25;
const CAUSAL_PER_EVENT_SHARE = 0.10;

function formatCause(event, label) {
    const time = event.timeLabel ? `【${event.timeLabel}】` : '';
    const people = (event.participants || []).join(' / ');
    const summary = String(event.summary || '').replace(/\s*\(#\d+(?:-\d+)?\)\s*$/, '').trim();
    const range = parseEventRange(event.summary);
    const floorHint = range
        ? ` (#${range.start + 1}${range.end !== range.start ? `-${range.end + 1}` : ''})`
        : '';
    return `  ├─ ${label}${time}${people ? ` ${people}` : ''}\n  │  ${summary}${floorHint}`;
}

/**
 * Admit direct causes of already selected events, in relevance-order rounds.
 * Owners carry their final display label; cause bodies are emitted once, and
 * references (including references to selected main events) are also charged.
 * This only reads direct edges: it does not traverse a cause's own causedBy.
 */
export function packCausalEvidence(owners, causesById, budget, estimateTokens) {
    const maxTokens = Math.floor(budget.max * CAUSAL_POOL_SHARE);
    const perEventMaxTokens = Math.floor(budget.max * CAUSAL_PER_EVENT_SHARE);
    const mainLabels = new Map(owners.map(owner => [owner.event.id, owner.label]));
    const emittedLabels = new Map();
    const byEvent = new Map();
    const stats = { candidates: 0, links: 0, bodies: 0, tokens: 0, maxTokens, perEventMaxTokens };
    const queues = owners.map(owner => ({
        owner,
        ids: [...new Set(owner.event.causedBy || [])].filter(id => (
            id !== owner.event.id && causesById.has(id)
        )),
        tokens: 0,
    }));
    stats.candidates = queues.reduce((sum, queue) => sum + queue.ids.length, 0);

    for (let round = 0; queues.some(queue => round < queue.ids.length); round++) {
        for (const queue of queues) {
            const causeId = queue.ids[round];
            if (causeId === undefined) continue;
            const cause = causesById.get(causeId).event;
            if (!String(cause?.summary || '').trim()) continue;
            const existingLabel = mainLabels.get(causeId) || emittedLabels.get(causeId);
            const label = existingLabel || `前因${emittedLabels.size + 1}`;
            const text = existingLabel ? `  ├─ 前因：见${label}` : formatCause(cause, label);
            const cost = estimateTokens(text);
            if (budget.used + cost > budget.max
                || stats.tokens + cost > maxTokens
                || queue.tokens + cost > perEventMaxTokens) continue;

            budget.used += cost;
            stats.tokens += cost;
            queue.tokens += cost;
            stats.links++;
            if (!existingLabel) {
                emittedLabels.set(causeId, label);
                stats.bodies++;
            }
            if (!byEvent.has(queue.owner.event.id)) byEvent.set(queue.owner.event.id, []);
            byEvent.get(queue.owner.event.id).push({ causeId, text });
        }
    }

    return { byEvent, stats };
}
