import { packageError } from './package/messages.js';

// Daily source faults belong to authoritative memory, not its replaceable vectors.
// Keep this separate from portable-package validation and never rewrite sources.
export function validateCurrentSources({ chat, atoms, events }) {
    for (const [rows, key, kind] of [[atoms, 'atomId', 'state'], [events, 'id', 'event']]) {
        const ids = new Set();
        for (const row of rows) {
            const id = row?.[key];
            const details = { kind, id: id ?? null, repairable: false,
                ...(kind === 'state' ? { floor: row?.floor ?? null } : {}) };
            if (typeof id !== 'string' || !id) {
                throw packageError('source_invalid', { ...details, reason: 'invalid_id' });
            }
            if (ids.has(id)) throw packageError('source_invalid', { ...details, reason: 'duplicate_id' });
            ids.add(id);
            if (kind === 'state' && (!Number.isInteger(row.floor) || row.floor < 0 || row.floor >= chat.length)) {
                throw packageError('source_invalid', { ...details, reason: 'invalid_floor' });
            }
        }
    }
}
