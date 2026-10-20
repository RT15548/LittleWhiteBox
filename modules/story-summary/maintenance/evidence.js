import { requireMemory } from './errors.js';
import { applyTextFilterRules } from '../data/text-filter-rules.js';

export const SOURCE_PAGE_CHARS = 10000;
const sourceRecord = (message, index) => ({
    floor: index + 1, name: String(message?.name || ''), role: message?.is_user ? 'user' : 'assistant',
    text: String(message?.mes || ''),
});

/** Read live dialogue inside the fixed summary boundary, never an opening snapshot. */
export function createEvidenceReader(readChat, cutoff, filterRules = []) {
    requireMemory(Number.isInteger(cutoff) && cutoff >= 0, 'source_boundary');
    const prepared = [];
    let supplied = 0;
    return {
        cutoff,
        inputProvided() { supplied = prepared.length; },
        ranges: () => structuredClone(prepared.slice(0, supplied)),
        read({ floor, to = floor, offset = 0, view = 'story', limit = SOURCE_PAGE_CHARS } = {}) {
            requireMemory(Number.isInteger(floor) && floor >= 1 && Number.isInteger(to) && to >= floor && to <= cutoff + 1, 'source_boundary', '', 'floor');
            requireMemory(Number.isInteger(offset) && offset >= 0 && ['story', 'raw'].includes(view)
                && Number.isInteger(limit) && limit >= 0, 'invalid_arguments', '', 'offset');
            const chat = readChat(), items = [], ranges = [];
            let budget = limit, next = null;
            for (let current = floor; current <= to; current++) {
                requireMemory(chat[current - 1], 'source_missing', '', 'floor');
                const record = sourceRecord(chat[current - 1], current - 1);
                const story = applyTextFilterRules(record.text, filterRules);
                const text = view === 'raw' ? record.text : story, start = current === floor ? offset : 0;
                requireMemory(start <= text.length, 'invalid_arguments', '', 'offset');
                const end = Math.min(text.length, start + budget);
                const following = end < text.length ? { floor: current, offset: end, view }
                    : current < Math.min(cutoff + 1, chat.length) ? { floor: current + 1, offset: 0, view } : null;
                items.push({ floor: current, name: record.name, role: record.role, view, text: text.slice(start, end),
                    excludedCharacters: record.text.length - story.length, next: following, complete: end === text.length });
                ranges.push({ floor: current, start, end, view });
                budget -= end - start;
                if (end < text.length || budget <= 0) {
                    next = following && following.floor <= to ? { ...following, to } : null;
                    break;
                }
            }
            // A failed range returns only its error, not earlier pages from the same call.
            prepared.push(...ranges);
            return { items, next };
        },
        search({ query, from = 1, limit = 20 } = {}) {
            requireMemory(typeof query === 'string' && query.trim(), 'invalid_arguments', '', 'query');
            requireMemory(Number.isInteger(from) && from >= 1 && from <= cutoff + 1, 'source_boundary', '', 'from');
            requireMemory(Number.isInteger(limit) && limit >= 1 && limit <= 20, 'invalid_arguments', '', 'limit');
            const chat = readChat(), lastFloor = Math.min(cutoff + 1, chat.length);
            const hits = [];
            let floor = from;
            for (; floor <= lastFloor; floor++) {
                const record = sourceRecord(chat[floor - 1], floor - 1), text = applyTextFilterRules(record.text, filterRules);
                const at = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
                if (at >= 0) {
                    const start = Math.max(0, at - 80), end = Math.min(text.length, at + 240);
                    hits.push({ floor, name: record.name, role: record.role, excerpt: text.slice(start, end) });
                    prepared.push({ floor, start, end, view: 'story' });
                }
                if (hits.length >= limit) { floor++; break; }
            }
            return { hits, next: floor <= lastFloor ? floor : null };
        },
    };
}
