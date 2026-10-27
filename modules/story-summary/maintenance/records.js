export { memoryDigest, memoryPolicy } from '../data/memory-policy.js';
import { ARC_PROGRESS_MAX } from '../generate/arc-progress.js';

export const recordHandle = record => `${record.collection}:${record.key}`;

// Model I/O uses one-based source floors and the generation progress scale.
// Bookkeeping is exposed as read-only provenance, not editable story content.
export function projectMemoryRecord(record, history = [], ownership) {
    const value = structuredClone(record.value);
    if (value && typeof value === 'object') {
        delete value._addedAt;
        delete value.quality;
        delete value.source;
        delete value.atomId;
        delete value.id;
        if (record.collection === 'anchors') value.floor += 1;
        if (record.collection === 'facts' && value.since != null) {
            delete value.since;
        }
        if (record.collection === 'facts') delete value.retracted;
        if (Object.hasOwn(value, '_isState')) { value.isState = value._isState; delete value._isState; }
        if (record.collection === 'arcs') {
            value.progress = Math.round(value.progress * ARC_PROGRESS_MAX);
            value.moments = (value.moments || []).map(moment => typeof moment === 'string' ? moment : moment.text);
        }
    }
    const batch = ownership?.batch || (record.collection !== 'anchors' && history.find(item => item.kind === 'batch' && item.endMesId === record.value?._addedAt));
    return { collection: record.collection, key: record.key, value,
        ...(batch ? { generatedBy: { from: batch.previousEndMesId + 2, to: batch.endMesId + 1 } } : {}),
        ...(ownership ? { maintenanceRange: ownership.range } : {}) };
}

export function eventSourceRange(event) {
    const matches = [...String(event?.summary || '').matchAll(/\(#(\d+)(?:-(\d+))?\)/gu)];
    return matches.length ? { from: Math.min(...matches.map(match => Number(match[1]))),
        to: Math.max(...matches.map(match => Number(match[2] || match[1]))) } : null;
}
