import { EDITABLE_FIELDS, memoryKey, sameMemory } from '../maintenance/domain.js';
import { factKey } from './fact-predicates.js';

// The editor owns only changes from its opening snapshot. Background additions,
// removals and untouched fields retain their latest values; explicit user edits win.
function applyRecordEdits(before, edited, current, keyOf, fields) {
    const original = new Map(before.map(item => [keyOf(item), item]));
    const submitted = new Map(edited.map(item => [keyOf(item), item]));
    const result = new Map(current.map(item => [keyOf(item), structuredClone(item)]));
    for (const key of original.keys()) if (!submitted.has(key)) result.delete(key);
    for (const [key, item] of submitted) {
        const previous = original.get(key);
        if (!previous) {
            result.set(key, { ...result.get(key), ...structuredClone(item) });
            continue;
        }
        const changed = fields.filter(field => !sameMemory(previous[field], item[field]));
        if (!changed.length) continue;
        const next = result.get(key) || structuredClone(item);
        for (const field of changed) {
            if (Object.hasOwn(item, field)) next[field] = structuredClone(item[field]);
            else delete next[field];
        }
        result.set(key, next);
    }
    return [...result.values()];
}

export function applySummarySectionEdit(section, before, edited, current) {
    if (section === 'characters') {
        return {
            ...current,
            main: applyRecordEdits(before.main, edited.main, current.main,
                item => memoryKey('characters', item), EDITABLE_FIELDS.characters),
            relationships: applyRecordEdits(before.relationships, edited.relationships, current.relationships,
                item => `${item.from}->${item.to}`, ['label', 'trend']),
        };
    }
    return applyRecordEdits(before, edited, current,
        section === 'facts' ? factKey : item => memoryKey(section, item),
        EDITABLE_FIELDS[section].filter(field => field !== '_isState'));
}
