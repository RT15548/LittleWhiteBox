import { computed, nextTick, reactive, watch, type Ref } from 'vue';
import type { ConversationTurn } from '../campaign/types.js';
import type { Participant } from '../content/participants.js';
import { CONVERSATION_WINDOW, conversationRange, type ConversationSelection } from '../../../../shell/conversation-window.js';

const { recent: RECENT_MESSAGES, maximum: BROWSE_MESSAGES } = CONVERSATION_WINDOW;
interface Reading { range: ConversationSelection | null; top: number; latest: boolean }
interface Message { key: string; side: 'player' | 'npc'; turn: ConversationTurn }

/** Presentation only: saved turns and model context never pass through this window. */
export function useDialogueWindow(options: {
    history: Ref<ConversationTurn[]>; pending: Ref<boolean>; talking: Ref<boolean>; person: Ref<Participant>;
    campaignId: Ref<string | undefined>; transcript: Ref<HTMLElement | null>; freshReply: Ref<string | null>;
}) {
    const { history, pending, talking, person, campaignId, transcript, freshReply } = options;
    const reading = reactive(new Map<Participant, Reading>());
    let revision = 0, shifting = false;
    const savedCount = computed(() => history.value.reduce((count, turn) => count + (turn.kind === 'greeting' || turn.kind === 'player' ? 1 : 2), 0));
    const count = computed(() => savedCount.value + Number(pending.value));
    const range = computed(() => conversationRange(reading.get(person.value)?.range, count.value));
    const messages = computed<Message[]>(() => {
        const rows: Message[] = [];
        let index = 0;
        for (const turn of history.value) {
            if (index >= range.value.end) { break; }
            const sides: Message['side'][] = turn.kind === 'greeting' ? ['npc'] : turn.kind === 'player' ? ['player'] : ['player', 'npc'];
            for (const side of sides) {
                if (index >= range.value.start && index < range.value.end) { rows.push({ key: `${turn.id}:${side}`, side, turn }); }
                index++;
            }
        }
        return rows;
    });
    const hasOlder = computed(() => range.value.start > 0);
    const hasNewer = computed(() => range.value.end < count.value);
    const expanded = computed(() => hasNewer.value || range.value.end - range.value.start > RECENT_MESSAGES);
    const pendingVisible = computed(() => pending.value && range.value.end > savedCount.value);

    function restoreFocus(focused: Element | null) {
        if (focused && !focused.isConnected) { transcript.value?.focus({ preventScroll: true }); }
    }
    function readingAnchor(log: HTMLElement, kept: Set<string>) {
        const top = log.getBoundingClientRect().top;
        const row = [...log.querySelectorAll<HTMLElement>('[data-message-key]')]
            .find(row => kept.has(row.dataset.messageKey!) && row.getBoundingClientRect().bottom > top);
        return row ? { key: row.dataset.messageKey, offset: row.getBoundingClientRect().top - top } : null;
    }
    function restoreAnchor(log: HTMLElement, anchor: ReturnType<typeof readingAnchor>) {
        const row = anchor && [...log.querySelectorAll<HTMLElement>('[data-message-key]')]
            .find(row => row.dataset.messageKey === anchor.key);
        if (!row || !anchor) { return false; }
        log.scrollTop += row.getBoundingClientRect().top - log.getBoundingClientRect().top - anchor.offset;
        return true;
    }

    function scrollToReply() {
        const log = transcript.value;
        if (!log || shifting || reading.get(person.value)?.latest === false) { return; }
        const latest = freshReply.value ? log.querySelector<HTMLElement>('[data-fresh-reply="true"]') : null;
        log.scrollTop = latest && latest.offsetHeight > log.clientHeight
            ? latest.getBoundingClientRect().top - log.getBoundingClientRect().top + log.scrollTop - 12 : log.scrollHeight;
    }
    function resetLatest() {
        const version = ++revision, recipient = person.value;
        const focused = transcript.value?.contains(document.activeElement) ? document.activeElement : null;
        shifting = false; freshReply.value = null; reading.delete(recipient);
        void nextTick(() => { if (revision === version && person.value === recipient) { scrollToReply(); restoreFocus(focused); } });
    }
    function rememberReading() {
        const log = transcript.value;
        if (!log || shifting) { return; }
        const latest = !hasNewer.value && log.scrollHeight - log.clientHeight - log.scrollTop < 32;
        if (latest && expanded.value) { resetLatest(); return; }
        reading.set(person.value, { top: log.scrollTop, latest,
            range: latest ? null : { start: range.value.start, end: hasNewer.value ? range.value.end : null } });
    }
    async function shift(direction: 'older' | 'newer') {
        const log = transcript.value;
        if (!log || shifting) { return; }
        const next = { ...range.value };
        if (direction === 'older') {
            next.start = Math.max(0, next.start - RECENT_MESSAGES);
            next.end = Math.min(next.end, next.start + BROWSE_MESSAGES);
        } else {
            next.end = Math.min(count.value, next.end + RECENT_MESSAGES);
            next.start = Math.max(next.start, next.end - BROWSE_MESSAGES);
        }
        const kept = new Set(messages.value.filter((_, index) => {
            const position = range.value.start + index;
            return position >= next.start && position < next.end;
        }).map(row => row.key));
        const anchor = readingAnchor(log, kept);
        const focused = log.contains(document.activeElement) ? document.activeElement : null;
        const recipient = person.value, version = ++revision;
        shifting = true;
        const selected = { start: next.start, end: next.end === count.value ? null : next.end };
        reading.set(recipient, { range: selected, top: log.scrollTop, latest: false });
        await nextTick();
        if (version !== revision || person.value !== recipient || transcript.value !== log) { return; }
        if (!restoreAnchor(log, anchor)) { log.scrollTop = direction === 'older' ? 0 : log.scrollHeight; }
        reading.set(recipient, { range: selected, top: log.scrollTop, latest: false });
        shifting = false;
        restoreFocus(focused);
    }
    watch(campaignId, () => { revision++; shifting = false; reading.clear(); });
    watch([transcript, person], ([log, recipient]) => {
        revision++; shifting = false;
        const position = reading.get(recipient);
        if (log) { log.scrollTop = position && !position.latest ? position.top : log.scrollHeight; }
    }, { flush: 'post' });
    watch(transcript, (log, _previous, onCleanup) => {
        if (!log) { return; }
        const observer = new ResizeObserver(scrollToReply);
        observer.observe(log); onCleanup(() => observer.disconnect());
    }, { flush: 'post' });
    watch(messages, async rows => {
        const log = transcript.value, recipient = person.value, version = revision;
        const position = reading.get(recipient);
        if (!log || shifting || !position || position.latest) { return; }
        const anchor = readingAnchor(log, new Set(rows.map(row => row.key)));
        await nextTick();
        if (version !== revision || transcript.value !== log || reading.get(recipient) !== position) { return; }
        restoreAnchor(log, anchor);
        position.top = log.scrollTop;
    });
    watch([history, pending, talking, freshReply], async () => { await nextTick(); scrollToReply(); });
    return { messages, hasOlder, hasNewer, expanded, pendingVisible, rememberReading, resetLatest,
        older: () => shift('older'), newer: () => shift('newer') };
}
