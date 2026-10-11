import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch, type Ref } from 'vue';
import { CONVERSATION_WINDOW as WINDOW, conversationRange, type ConversationRange as Range, type ConversationSelection as Selection } from '../../../shell/conversation-window.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';
import type { AdministratorPage, AdministratorState } from '../domain/types.js';
import { administratorError } from './copy.js';

/** Owns only the mounted page and reading position. Host history remains paged and unchanged. */
export function useAdministratorWindow(options: {
    state: Ref<AdministratorState>; pending: Ref<boolean>; list: Ref<HTMLElement | null>;
    page(start: number, revision: number): Promise<AdministratorPage>;
}) {
    const { state, pending, list } = options;
    const selection = shallowRef<Selection | null>(null), resident = shallowRef(state.value.page);
    const paging = ref(false), atBottom = ref(true), pageError = ref('');
    let version = 0, shifting = false;
    // The requested destination survives Host refreshes; selection remains the mounted window until IO succeeds.
    let navigation: Selection | null = null;
    const total = computed(() => state.value.page.total + Number(pending.value));
    // Keep the mounted range on its resident page until a refreshed page is ready.
    const range = computed(() => conversationRange(selection.value, resident.value.total + Number(pending.value)));
    const rows = computed(() => resident.value.rows.slice(Math.max(0, range.value.start - resident.value.start), Math.max(0, range.value.end - resident.value.start)));
    const hasOlder = computed(() => range.value.start > 0);
    const hasNewer = computed(() => selection.value !== null && selection.value.end !== null && range.value.end < total.value);
    const expanded = computed(() => hasNewer.value || range.value.end - range.value.start > WINDOW.recent);
    const pendingVisible = computed(() => pending.value && range.value.end > state.value.page.total);
    function anchor(next: Range = range.value) {
        const log = list.value;
        if (!log) { return null; }
        const kept = new Set(resident.value.rows.filter((_, index) => {
            const position = resident.value.start + index;
            return position >= next.start && position < next.end;
        }).map(row => row.id));
        const top = log.getBoundingClientRect().top;
        const element = [...log.querySelectorAll<HTMLElement>('[data-row-id]')].find(row => kept.has(row.dataset.rowId!) && row.getBoundingClientRect().bottom > top);
        return element ? { id: element.dataset.rowId, offset: element.getBoundingClientRect().top - top } : null;
    }
    function restore(saved: ReturnType<typeof anchor>) {
        const log = list.value;
        const element = log && [...log.querySelectorAll<HTMLElement>('[data-row-id]')].find(row => row.dataset.rowId === saved?.id);
        if (saved && element && log) { log.scrollTop += element.getBoundingClientRect().top - log.getBoundingClientRect().top - saved.offset; }
    }
    function restoreFocus(focused: Element | null) {
        if (focused && !focused.isConnected) { list.value?.focus({ preventScroll: true }); }
    }
    async function follow() {
        await nextTick();
        if (atBottom.value && !navigation && list.value && !shifting) { list.value.scrollTop = list.value.scrollHeight; }
    }
    function resetLatest() {
        version++; paging.value = false; shifting = false; navigation = null;
        pageError.value = '';
        const focused = list.value?.contains(document.activeElement) ? document.activeElement : null;
        selection.value = null; atBottom.value = true; resident.value = state.value.page;
        void follow().then(() => restoreFocus(focused));
    }
    function scrolled() {
        const log = list.value;
        if (!log || shifting) { return; }
        atBottom.value = !hasNewer.value && log.scrollHeight - log.clientHeight - log.scrollTop < 32;
        if (atBottom.value) {
            if (selection.value) { resetLatest(); }
        } else { selection.value = { start: range.value.start, end: hasNewer.value ? range.value.end : null }; }
    }
    function covers(page: AdministratorPage, next: Range) {
        return page.revision === state.value.page.revision && page.start <= next.start
            && page.start + page.rows.length >= Math.min(next.end, state.value.page.total);
    }
    async function read(next: Range, current: () => boolean) {
        const revision = state.value.page.revision, count = state.value.page.total;
        const collected: AdministratorPage = { start: next.start, rows: [], total: count, revision };
        for (let cursor = next.start; cursor < Math.min(next.end, count); cursor += POLICY.pageSize) {
            const page = await options.page(cursor, revision);
            if (!current()) { return null; }
            collected.rows.push(...page.rows.slice(0, Math.min(next.end, count) - cursor));
        }
        return collected;
    }
    async function update() {
        const next = conversationRange(navigation ?? selection.value, total.value), navigating = !!navigation;
        const request = ++version, identity = state.value.chatIdentity, revision = state.value.page.revision;
        const current = () => request === version && identity === state.value.chatIdentity && revision === state.value.page.revision;
        paging.value = true;
        try {
            // Install an available page in the same render as acceptance, without briefly removing its pending row first.
            const page = [state.value.page, resident.value].find(page => covers(page, next)) ?? await read(next, current);
            if (!current() || !page) { return; }
            // Read the anchor after IO, so scrolling while a page is loading is not undone.
            const saved = anchor(next), focused = list.value?.contains(document.activeElement) ? document.activeElement : null;
            shifting = true;
            resident.value = page;
            if (navigating) { selection.value = { start: next.start, end: next.end === total.value ? null : next.end }; atBottom.value = false; }
            await nextTick();
            if (!current()) { return; }
            if (atBottom.value && list.value) { list.value.scrollTop = list.value.scrollHeight; }
            else { restore(saved); }
            shifting = false; restoreFocus(focused);
        } catch (cause) { if (current()) { pageError.value = administratorError(cause); } }
        finally { if (current()) { paging.value = false; shifting = false; navigation = null; } }
    }
    function shift(direction: 'older' | 'newer') {
        if (paging.value) { return; }
        pageError.value = '';
        const next = { ...range.value };
        if (direction === 'older') {
            next.start = Math.max(0, next.start - WINDOW.recent);
            next.end = Math.min(next.end, next.start + WINDOW.maximum);
        } else {
            next.end = Math.min(total.value, next.end + WINDOW.recent);
            next.start = Math.max(next.start, next.end - WINDOW.maximum);
        }
        navigation = { start: next.start, end: next.end === total.value ? null : next.end };
        return update();
    }
    watch(() => state.value.chatIdentity, resetLatest, { flush: 'sync' });
    watch([() => state.value.page, pending], () => { void update(); });
    watch(() => state.value.live, () => { void follow(); });
    watch(list, (log, _previous, onCleanup) => {
        if (!log) { return; }
        const observer = new ResizeObserver(() => { void follow(); });
        observer.observe(log); onCleanup(() => observer.disconnect());
        void follow();
    }, { flush: 'post' });
    onBeforeUnmount(() => { version++; navigation = null; });
    return { rows, hasOlder, hasNewer, expanded, pendingVisible, paging, pageError, atBottom, resetLatest, scrolled,
        older: () => shift('older'), newer: () => shift('newer') };
}
