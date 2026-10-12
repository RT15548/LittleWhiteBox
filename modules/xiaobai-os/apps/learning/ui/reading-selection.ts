import { onBeforeUnmount, onMounted, type Ref } from 'vue';
import { LEARNING_SELECTION_LIMIT, type LearningSelection } from '../../../domains/learning/notes.js';

type Material = { id: string; paragraphs: { id: string; text: string }[] };
export const LEARNING_SELECTION_COPY = Object.freeze({ select: '引用这段', ask: '问语伴', listen: '朗读', dismiss: '取消引用' });

/** Offsets are UTF-16, just like the saved paragraph contract; the visible paragraph number is excluded. */
export function learningTextSelection(root: HTMLElement, materials: Material[], selection: Selection | null): LearningSelection | null {
    if (!selection?.rangeCount || selection.isCollapsed) { return null; }
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const element = (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>('[data-learning-text]');
    if (!element || !root.contains(element) || !element.contains(range.endContainer)) { return null; }
    const material = materials.find(entry => entry.id === element.dataset.materialId);
    const paragraph = material?.paragraphs.find(entry => entry.id === element.dataset.paragraphId);
    if (!material || !paragraph) { return null; }
    const before = range.cloneRange(); before.selectNodeContents(element); before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    const quote = range.toString();
    if (!quote.trim() || [...quote].length > LEARNING_SELECTION_LIMIT || paragraph.text.slice(start, start + quote.length) !== quote) { return null; }
    return { materialId: material.id, paragraphId: paragraph.id, start, end: start + quote.length, quote };
}

/** One listener per reader, including touch selection-handle changes; none per paragraph. */
export function useLearningTextSelection(root: Ref<HTMLElement | null>, materials: () => Material[], select: (value: LearningSelection) => void) {
    const update = () => {
        if (!root.value) { return; }
        const value = learningTextSelection(root.value, materials(), window.getSelection());
        if (value) { select(value); }
    };
    onMounted(() => document.addEventListener('selectionchange', update));
    onBeforeUnmount(() => document.removeEventListener('selectionchange', update));
}
