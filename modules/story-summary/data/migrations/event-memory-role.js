import { projectSummaryEvent } from '../events.js';

/**
 * Load-boundary conversion for stored type/weight events and format-1 undo records.
 * Keep evidence and exact rollback together; absent roles remain unclassified.
 * Remove when pre-memoryRole local stores are no longer accepted.
 */
export function upgradeStoredEventMemoryRoles(store) {
    let changed = false;
    const project = event => {
        if (!event || typeof event !== 'object' || Array.isArray(event)) return event;
        const next = projectSummaryEvent(event);
        if (JSON.stringify(next) === JSON.stringify(event)) return event;
        changed = true;
        return next;
    };

    if (Array.isArray(store.json?.events)) {
        store.json.events = store.json.events.map(project);
    }
    for (const entry of store.summaryHistory || []) {
        const undo = entry?.format === 1 ? entry.undo : null;
        if (!undo) continue;
        for (const field of ['previousEvents', 'generatedEvents']) {
            if (Array.isArray(undo[field])) undo[field] = undo[field].map(project);
        }
        for (const change of undo.eventChanges || []) {
            change.previous = project(change.previous);
            change.generated = project(change.generated);
        }
    }
    return changed;
}
