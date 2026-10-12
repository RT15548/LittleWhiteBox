import { nextTick, type ObjectDirective } from 'vue';

export interface LearningEditorDraft {
    cursor?: { start: number; end: number; direction: 'forward' | 'backward' | 'none'; top: number; left: number };
}

/** The owning draft outlives its textarea. Restoring an editor never opens the soft keyboard. */
const listeners = new WeakMap<HTMLTextAreaElement, () => void>();
const events = ['select', 'input', 'keyup', 'pointerup', 'scroll'] as const;
export const rememberLearningEditor: ObjectDirective<HTMLTextAreaElement, LearningEditorDraft> = {
    mounted(element, binding) {
        const draft = binding.value;
        const saved = draft.cursor;
        const remember = () => {
            draft.cursor = { start: element.selectionStart, end: element.selectionEnd, direction: element.selectionDirection,
                top: element.scrollTop, left: element.scrollLeft };
        };
        listeners.set(element, remember);
        for (const event of events) { element.addEventListener(event, remember, { passive: true }); }
        void nextTick(() => {
            if (!element.isConnected || !saved) { return; }
            element.setSelectionRange(saved.start, saved.end, saved.direction);
            element.scrollTop = saved.top; element.scrollLeft = saved.left;
        });
    },
    beforeUnmount(element) {
        const remember = listeners.get(element);
        if (!remember) { return; }
        remember();
        for (const event of events) { element.removeEventListener(event, remember); }
        listeners.delete(element);
    },
};
