import { createPlannerMarker } from './ena-planner-slot.js';
import { replacePlannerSlot } from './ena-planner-context.js';

/** Request-local identities for native generations that bypass the planner. */
export function createPlannerBypassRequests({ createMarker = createPlannerMarker } = {}) {
    const requests = new Map();
    const snapshots = new WeakMap();

    function reserve(chat, sourceChat) {
        if (!Array.isArray(chat) || !Array.isArray(sourceChat)) {
            throw new TypeError('Expected native and persistent chat arrays');
        }
        const message = [...chat].reverse().find(item => typeof item?.mes === 'string');
        if (!message || sourceChat.includes(message)) {
            throw new Error('Cannot mark a missing or persistent native message');
        }
        const marker = createMarker();
        if (typeof marker !== 'string' || !marker || requests.has(marker)) {
            throw new Error('Invalid or duplicate bypass request marker');
        }
        const original = message.mes;
        const tagged = original + marker;
        message.mes = tagged;
        requests.set(marker, new WeakRef(message));
        if (!snapshots.has(message)) snapshots.set(message, new Map());
        snapshots.get(message).set(marker, { original, tagged });
    }

    function scan(data, field, companionFields) {
        if (!data || typeof field !== 'string') return [];
        const fields = [...new Set([field, ...companionFields])].filter(name => data[name] != null);
        const found = [];
        for (const [marker, request] of requests) {
            const replacements = fields.map(name => [name, replacePlannerSlot(data[name], marker, '')]);
            if (replacements.some(([, result]) => result.count > 0)) {
                found.push({ marker, request, replacements });
            }
        }
        return found;
    }

    function matches(data, field, companionFields = []) {
        return scan(data, field, companionFields).length > 0;
    }

    function take(data, field, companionFields = []) {
        const found = scan(data, field, companionFields);
        if (!found.length) return false;
        // Validate before mutating any field or consuming any registry entry.
        // CFG may carry the same identity once in each companion field.
        if (found.length !== 1 || found[0].replacements.some(([, result]) => result.count > 1)) {
            throw new Error('Conflicting bypass request markers');
        }
        const { marker, request, replacements } = found[0];
        if (replacements.find(([name]) => name === field)?.[1].count !== 1) return false;
        for (const [name, result] of replacements) {
            if (result.count) data[name] = result.prompt;
        }
        const message = request.deref();
        const messageSnapshots = message && snapshots.get(message);
        const snapshot = messageSnapshots?.get(marker);
        if (snapshot && message.mes === snapshot.tagged) message.mes = snapshot.original;
        messageSnapshots?.delete(marker);
        requests.delete(marker);
        return true;
    }

    return { reserve, matches, take, pending: () => requests.size > 0 };
}
