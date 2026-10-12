import { tryConsumeWholeItem } from './token-budget.js';
import { CAUSAL_EVIDENCE_NOTE, causalRecordLabel, formatCausalEvidence } from './causal-evidence-format.js';

const CAUSAL_POOL_SHARE = 0.25;
const CAUSAL_PER_EVENT_SHARE = 0.10;
const MAX_CAUSAL_BODIES = 30;
const MAX_CONSEQUENCE_DEPTH = 10;

function buildConsequenceIndex(eventIndex) {
    const result = new Map();
    for (const event of eventIndex.values()) {
        for (const causeId of new Set(event.causedBy || [])) {
            if (causeId === event.id || !eventIndex.has(causeId)) continue;
            if (!result.has(causeId)) result.set(causeId, []);
            result.get(causeId).push(event.id);
        }
    }
    return result;
}

function createQueue(owner, eventIndex, consequences, maxTokens) {
    const rootId = owner.event.id;
    const pending = {
        cause: [...new Set(owner.event.causedBy || [])]
            .filter(id => id !== rootId && eventIndex.has(id))
            .map(eventId => ({ eventId, direction: 'cause', path: [rootId, eventId] })),
        consequence: [],
    };
    const seen = new Set([rootId]);
    const offsets = { cause: 0, consequence: 0 };
    let nextDirection = 'consequence';
    const expand = path => {
        if (path.length - 1 >= MAX_CONSEQUENCE_DEPTH) return;
        for (const eventId of consequences.get(path[path.length - 1]) || []) {
            if (seen.has(eventId)) continue;
            seen.add(eventId);
            pending.consequence.push({ eventId, direction: 'consequence', path: [...path, eventId] });
        }
    };
    expand([rootId]);
    return {
        owner, budget: { used: 0, max: maxTokens }, expand,
        take() {
            const other = nextDirection === 'cause' ? 'consequence' : 'cause';
            const direction = offsets[nextDirection] < pending[nextDirection].length ? nextDirection : other;
            const item = pending[direction][offsets[direction]];
            if (item) offsets[direction]++;
            nextDirection = direction === 'cause' ? 'consequence' : 'cause';
            return item;
        },
    };
}

/**
 * Supplement selected owners only: direct causes, plus forward breadth-first paths.
 * A forward path grows only after its preceding record has actually been admitted.
 * Owners rotate, starting with consequences, within one shared evidence ledger.
 */
export function packCausalEvidence(owners, eventIndex, budget, estimateTokens) {
    const maxTokens = Math.floor(budget.max * CAUSAL_POOL_SHARE);
    const perEventMaxTokens = Math.floor(budget.max * CAUSAL_PER_EVENT_SHARE);
    const mainLabels = new Map(owners.map(owner => [owner.event.id, owner.label]));
    const emittedLabels = new Map();
    const byEvent = new Map();
    const candidates = [];
    const causalBudget = { used: 0, max: maxTokens };
    const consequences = buildConsequenceIndex(eventIndex);
    const queues = owners.map(owner => createQueue(owner, eventIndex, consequences, perEventMaxTokens));
    const noteTokens = estimateTokens(CAUSAL_EVIDENCE_NOTE);

    while (budget.used < budget.max && causalBudget.used < causalBudget.max) {
        let attempted = false;
        for (const queue of queues) {
            if (budget.used >= budget.max || causalBudget.used >= causalBudget.max) break;
            if (queue.budget.used >= queue.budget.max) continue;
            const item = queue.take();
            if (!item) continue;
            attempted = true;
            const candidate = { ...item, ownerId: queue.owner.event.id, admitted: false };
            candidates.push(candidate);
            const event = eventIndex.get(item.eventId);
            if (!String(event?.summary || '').trim()) continue;
            const existingLabel = mainLabels.get(item.eventId) || emittedLabels.get(item.eventId);
            if (!existingLabel && emittedLabels.size >= MAX_CAUSAL_BODIES) continue;
            const label = existingLabel || causalRecordLabel(emittedLabels.size + 1);
            const parentId = item.path[item.path.length - 2];
            const parentLabel = item.path.length > 2
                ? mainLabels.get(parentId) || emittedLabels.get(parentId)
                : null;
            const reference = !!existingLabel;
            const text = formatCausalEvidence(event, { ...item, parentLabel, label, reference });
            const cost = estimateTokens(text);
            // Charge the shared explanation once, without taxing the first owner's quota.
            if (!tryConsumeWholeItem(cost + (byEvent.size ? 0 : noteTokens), budget, causalBudget)) continue;
            tryConsumeWholeItem(cost, queue.budget);
            Object.assign(candidate, { admitted: true, label, reference, text });
            if (!existingLabel) emittedLabels.set(item.eventId, label);
            if (!byEvent.has(queue.owner.event.id)) byEvent.set(queue.owner.event.id, []);
            byEvent.get(queue.owner.event.id).push(candidate);
            if (item.direction === 'consequence') queue.expand(item.path);
        }
        if (!attempted) break;
    }

    const links = [...byEvent.values()].flat();
    return {
        byEvent, candidates,
        introduction: links.length ? CAUSAL_EVIDENCE_NOTE : '',
        stats: {
            candidates: candidates.length, links: links.length, bodies: emittedLabels.size,
            causes: links.filter(item => item.direction === 'cause').length,
            consequences: links.filter(item => item.direction === 'consequence').length,
            depth: Math.max(0, ...links.map(item => item.path.length - 1)),
            tokens: causalBudget.used, maxTokens, perEventMaxTokens, maxBodies: MAX_CAUSAL_BODIES,
        },
    };
}
