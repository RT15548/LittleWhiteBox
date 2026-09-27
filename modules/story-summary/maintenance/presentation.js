import { MEMORY_COPY as copy } from './copy.js';
import { sameMemory } from './domain.js';

const displayFields = {
    events: ['title', 'timeLabel', 'summary', 'participants', 'causedBy', 'memoryRole'],
    facts: ['s', 'p', 'o', 'since', 'retracted', 'trend', '_isState'],
    characters: ['name'], arcs: ['name', 'trajectory', 'progress', 'moments'],
    keywords: ['text', 'weight'], characterAliases: ['from', 'to', 'evidence'],
    anchors: ['semantic', 'where', 'edges'],
};

export function memoryLabel(collection, value) {
    if (typeof value === 'string') return value;
    if (!value) return copy.collections[collection];
    if (collection === 'events') return value.title;
    if (collection === 'facts') return [value.s, value.p].filter(Boolean).join(' · ');
    if (collection === 'anchors') return copy.floor(value.floor + 1);
    if (collection === 'keywords') return value.text;
    if (collection === 'characterAliases') return [value.from, value.to].join(' → ');
    return value.name;
}

/** Display-only names are derived from current memory and the receipt, never persisted. */
export function presentMaintenanceReceipt(receipt, memory) {
    const eventNames = Object.fromEntries((memory.json.events || []).map(event => [event.id, event.title]));
    for (const operation of receipt.operations) {
        for (const change of operation.changes) {
            const value = change.after ?? change.before;
            if (change.collection === 'events') eventNames[change.key] = value.title;
        }
    }
    const coverage = { ...receipt.coverage,
        missingAnchors: receipt.coverage.missingAnchors.map(item => ({ ...item, label: copy.floor(item.floor) })) };
    return { ...receipt, coverage, eventNames };
}

function primaryValue(operation) {
    const primary = operation.changes.find(change => change.collection === operation.collection && change.key === operation.key);
    return primary?.after ?? primary?.before;
}

export const operationCategory = operation => operation.collection === 'anchors' ? 'anchors' : 'summary';

export function operationFloor(operation) {
    return operationCategory(operation) === 'anchors' ? primaryValue(operation).floor + 1 : null;
}

export function operationTitle(operation) {
    const category = operationCategory(operation);
    const title = memoryLabel(operation.collection, primaryValue(operation));
    return copy.operationTitle(copy.operation[operation.kind], copy[category],
        category === 'anchors' ? title : `${copy.collections[operation.collection]} · ${title}`);
}

function fieldValue(field, value, eventNames) {
    if (value == null || value === '' || (Array.isArray(value) && !value.length)) return copy.notSet;
    if (field === 'since') return copy.floor(value + 1);
    if (field === 'retracted') return value ? copy.retracted : copy.retained;
    if (field === '_isState') return value ? copy.yes : copy.no;
    if (field === 'progress') return `${Math.round(value * 100)}%`;
    if (field === 'causedBy') return value.map(id => eventNames[id] || copy.collections.events).join('、');
    if (field === 'edges') return value.map(copy.relation).join('\n');
    if (field === 'moments') return value.map(moment => typeof moment === 'string' ? moment : moment.text).join('\n');
    if (Array.isArray(value)) return value.join('、');
    // The persisted source marker is a file-format detail; readers see floor names.
    return String(value).replace(/\(#(\d+)(?:-(\d+))?\)/gu, (_, start, end) => `（${copy.sourceRange(start, end || start)}）`);
}

/** Both sides use the same fields; hidden metadata never becomes fallback JSON. */
export function comparisonRows(change, eventNames = {}, full = false) {
    const before = typeof change.before === 'string' ? { name: change.before } : change.before;
    const after = typeof change.after === 'string' ? { name: change.after } : change.after;
    return displayFields[change.collection].filter(field => (before?.[field] != null || after?.[field] != null)
        && (full || before == null || after == null || !sameMemory(before[field], after[field])))
        .map(field => ({ field, label: copy.fields[field], before: fieldValue(field, before?.[field], eventNames),
            after: fieldValue(field, after?.[field], eventNames) }));
}
