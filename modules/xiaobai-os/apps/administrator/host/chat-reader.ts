import { MANAGEMENT_READ_CHARS, readOffset } from '../../../capabilities/management/read-page.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';

export interface AdministratorChatSurface { identityKey: string; messages: readonly unknown[]; playerName: string; assistantName: string }
interface SourceMessage { mes?: unknown; name?: unknown; is_user?: unknown; swipe_id?: unknown }
interface Evidence { raw: unknown; text: string; swipe: unknown }
const message = (value: unknown): SourceMessage => value && typeof value === 'object' ? value as SourceMessage : {};

export function createAdministratorChatReader(capture: () => AdministratorChatSurface | null, getSignal: () => AbortSignal) {
    const initial = capture();
    if (!initial) { throw new Error('administrator_chat_unavailable'); }
    const identity = initial.identityKey;
    const evidence = new Map<number, Evidence>();
    function current() {
        getSignal().throwIfAborted();
        const surface = capture();
        if (!surface || surface.identityKey !== identity) { throw new Error('administrator_context_changed'); }
        return surface;
    }
    function retain(index: number, raw: unknown, continuation = false) {
        const source = message(raw);
        const next = { raw, text: String(source.mes ?? ''), swipe: source.swipe_id };
        const previous = evidence.get(index);
        if (continuation && (!previous || previous.raw !== raw || previous.text !== next.text || previous.swipe !== next.swipe)) {
            throw new Error('administrator_evidence_expired');
        }
        if (previous && (previous.raw !== raw || previous.text !== next.text || previous.swipe !== next.swipe)) {
            // A fresh read replaces this reference. Other previously cited floors still have to match.
            evidence.delete(index);
        }
        evidence.set(index, next);
    }
    function bounds(from: unknown, to: unknown) {
        const messages = current().messages;
        const first = readOffset(from, 0), last = readOffset(to, messages.length - 1);
        if (first > last || last >= messages.length) { throw new Error('administrator_floor_missing'); }
        return { first, last };
    }
    function changedEvidence(messages: readonly unknown[]) {
        const floors: number[] = [], missingFloors: number[] = [];
        for (const [index, old] of evidence) {
            const raw = messages[index], source = message(raw);
            if (index >= messages.length) { floors.push(index); missingFloors.push(index); }
            else if (raw !== old.raw || String(source.mes ?? '') !== old.text || source.swipe_id !== old.swipe) { floors.push(index); }
        }
        return { floors, missingFloors };
    }
    return {
        identity,
        assertCurrent: () => { current(); },
        releaseEvidence: () => evidence.clear(),
        info: { player: initial.playerName, assistant: initial.assistantName, firstFloor: 0, lastFloor: initial.messages.length - 1 },
        staleEvidence: () => changedEvidence(current().messages),
        isCurrent() {
            const surface = capture();
            if (getSignal().aborted || surface?.identityKey !== identity) { return false; }
            return changedEvidence(surface.messages).floors.length === 0;
        },
        async read(args: Record<string, unknown>) {
            const { first, last } = bounds(args.from, args.to ?? args.from);
            const items: { floor: number; speaker: string; role: string; text: string; offset: number; totalChars: number }[] = [];
            let remaining = MANAGEMENT_READ_CHARS;
            const result = (scannedTo: number, next: { from: number; to: number; offset: number } | null) => ({ items, scanned: { from: first, to: scannedTo }, next, complete: next === null });
            for (let floor = first; floor <= last; floor++) {
                if (floor - first === POLICY.chatReadFloors) { return result(floor - 1, { from: floor, to: last, offset: 0 }); }
                if ((floor - first) % 25 === 0) { await new Promise(resolve => setTimeout(resolve, 0)); }
                const raw = current().messages[floor], source = message(raw), text = String(source.mes ?? '');
                const offset = floor === first ? readOffset(args.offset, 0, text.length) : 0;
                let end = Math.min(text.length, offset + remaining);
                if (end < text.length && /[\uD800-\uDBFF]/u.test(text[end - 1])) { end--; }
                if (remaining <= 1) { return result(floor - 1, { from: floor, to: last, offset }); }
                retain(floor, raw, offset > 0);
                items.push({ floor, speaker: String(source.name ?? ''), role: source.is_user ? 'user' : 'assistant', text: text.slice(offset, end), offset, totalChars: text.length });
                remaining -= end - offset;
                if (end < text.length) { return result(floor, { from: floor, to: last, offset: end }); }
            }
            return result(last, null);
        },
        async search(args: Record<string, unknown>) {
            if (typeof args.query !== 'string' || !args.query.trim() || args.query.length > POLICY.chatQueryChars) { throw new Error('administrator_query_invalid'); }
            if (!current().messages.length) { return { items: [], next: null, complete: true }; }
            const { first, last } = bounds(args.from, args.to);
            const needle = new RegExp(args.query.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'iu');
            const items: { floor: number; speaker: string; snippet: string; offset: number }[] = [];
            for (let floor = first; floor <= last; floor++) {
                if ((floor - first) % 25 === 0) { await new Promise(resolve => setTimeout(resolve, 0)); }
                const raw = current().messages[floor], source = message(raw);
                const text = String(source.mes ?? ''), found = needle.exec(text)?.index ?? -1;
                if (found >= 0) {
                    retain(floor, raw);
                    const offset = Math.max(0, found - 100);
                    items.push({ floor, speaker: String(source.name ?? ''), snippet: text.slice(offset, offset + 350), offset });
                }
                if (items.length === POLICY.chatSearchMatches && floor < last) { return { items, next: { query: args.query, from: floor + 1, to: last }, complete: false }; }
            }
            return { items, next: null, complete: true };
        },
    };
}
