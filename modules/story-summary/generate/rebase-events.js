import { getNextEventId } from './summary-result.js';

// Generated references were validated against the request snapshot. Rebind them
// to the published memory, including merges recorded while the model was running.
// Nothing here is persisted except the resulting events in the ordinary batch.
export function rebaseGeneratedEvents(events, currentEvents, operations) {
    const nextId = getNextEventId(currentEvents);
    const newIds = new Map(events.map((event, index) => [event.id, `evt-${nextId + index}`]));
    const currentIds = new Set(currentEvents.map(event => event.id));
    const resolveExisting = original => {
        let id = original;
        for (const operation of operations) {
            if (!operation.changes.some(change => !change.retired && change.collection === 'events'
                && change.key === id && change.after === null)) continue;
            id = operation.kind === 'merge' ? operation.key : null;
            if (id === null) break;
        }
        // An explicitly deleted old event must not become a link to a new event
        // that happens to reuse its number, or resurrect the deleted record.
        return currentIds.has(id) ? id : null;
    };
    return events.map(event => ({ ...event, id: newIds.get(event.id),
        causedBy: [...new Set(event.causedBy.map(id => newIds.get(id) || resolveExisting(id)).filter(Boolean))],
    }));
}
