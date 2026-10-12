import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import type { LearningClientState } from '../types.js';
import { createLearningCompanionScheduler } from '../application/companion.js';

/** Lives with the lightweight application, not with the reading or conversation renderer. */
export function useLearningCompanion(options: {
    root: Ref<HTMLElement | null>; state: Ref<LearningClientState>; pending: Ref<boolean>;
    reading: Ref<boolean>; blocked: Ref<boolean>; preference: { enabled: boolean };
    request(action: string, input?: Record<string, unknown>): Promise<unknown>;
}) {
    const visible = ref(false);
    const editing = ref(false);
    const selecting = ref(false);
    const recentlyTyped = ref(false);
    const bubble = ref('');
    let quietTimer: ReturnType<typeof setTimeout> | undefined;
    let bubbleTimer: ReturnType<typeof setTimeout> | undefined;
    const available = computed(() => options.preference.enabled && options.reading.value && visible.value && !options.blocked.value
        && !!options.state.value.teacher && options.state.value.storage === 'ready');
    const eligible = computed(() => available.value && !editing.value && !selecting.value && !recentlyTyped.value && !options.pending.value
        && !options.state.value.busy && !options.state.value.chatBusy && !options.state.value.companionBusy);
    function paragraph() {
        const area = options.root.value?.querySelector('.learning-scroll');
        const bounds = area?.getBoundingClientRect();
        const top = bounds?.top ?? 0;
        const paragraphs = [...options.root.value?.querySelectorAll<HTMLElement>('[data-material-id][data-paragraph-id]') ?? []];
        const current = paragraphs.find(element => element.getBoundingClientRect().bottom > top + 60 && element.getBoundingClientRect().top < (bounds?.bottom ?? 0));
        return current ? { materialId: current.dataset.materialId, paragraphId: current.dataset.paragraphId } : null;
    }
    const scheduler = createLearningCompanionScheduler({ setTimer: (callback, delay) => setTimeout(callback, delay),
        clearTimer: timer => clearTimeout(timer), opportunity: () => { const current = paragraph(); if (current) { void options.request('companion', current); } } });
    watch(eligible, value => scheduler.update(value), { immediate: true });
    watch([available, editing, selecting, recentlyTyped, options.pending, () => options.state.value.companionBusy], ([canRead, input, selection, typed, pending, running]) => {
        if (running && !pending && (!canRead || input || selection || typed)) { void options.request('cancel-companion'); }
    });
    function onFocus() {
        const element = document.activeElement;
        editing.value = element instanceof HTMLElement && !!options.root.value?.contains(element)
            && element.matches('textarea, input:not([type=checkbox],[type=radio],[type=range]), [contenteditable=true]');
    }
    const onFocusChange = () => queueMicrotask(onFocus);
    function onSelection() {
        const selection = document.getSelection();
        selecting.value = !!selection && !selection.isCollapsed && !!options.root.value?.contains(selection.anchorNode);
    }
    function onPointer() {
        clearTimeout(quietTimer); recentlyTyped.value = true;
        quietTimer = setTimeout(() => { recentlyTyped.value = false; }, 30_000);
    }
    function onInput(event: Event) {
        if (!(event.target instanceof HTMLElement) || !event.target.matches('textarea, input:not([type=checkbox],[type=radio],[type=range]), [contenteditable=true]')) { return; }
        onPointer();
    }
    function onVisibility() {
        visible.value = document.visibilityState === 'visible';
        if (!visible.value) { clearTimeout(quietTimer); recentlyTyped.value = false; dismiss(); }
        onFocus();
    }
    function dismiss() { clearTimeout(bubbleTimer); bubble.value = ''; }
    watch(() => options.state.value.remark?.text ?? '', text => {
        dismiss();
        if (text && options.reading.value && visible.value && !editing.value && !selecting.value && !recentlyTyped.value && !options.blocked.value) {
            bubble.value = text; bubbleTimer = setTimeout(dismiss, 10_000);
        }
    });
    watch([options.reading, options.blocked, editing, selecting, recentlyTyped], ([reading, blocked, input, selection, interacting]) => { if (!reading || blocked || input || selection || interacting) { dismiss(); } });
    onMounted(() => {
        onVisibility(); document.addEventListener('visibilitychange', onVisibility);
        document.addEventListener('selectionchange', onSelection);
        options.root.value?.addEventListener('pointerdown', onPointer);
        options.root.value?.addEventListener('focusin', onFocusChange);
        options.root.value?.addEventListener('focusout', onFocusChange);
        options.root.value?.addEventListener('input', onInput);
    });
    onBeforeUnmount(() => {
        scheduler.dispose(); clearTimeout(quietTimer); dismiss(); document.removeEventListener('visibilitychange', onVisibility);
        document.removeEventListener('selectionchange', onSelection);
        options.root.value?.removeEventListener('pointerdown', onPointer);
        options.root.value?.removeEventListener('focusin', onFocusChange); options.root.value?.removeEventListener('focusout', onFocusChange); options.root.value?.removeEventListener('input', onInput);
    });
    return { bubble, dismiss };
}
