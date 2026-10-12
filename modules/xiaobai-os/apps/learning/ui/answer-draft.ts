import type { LearningResponse } from '../../../domains/learning/types.js';
import type { LearningEditorDraft } from './learning-editor.js';

/** Incomplete input belongs to the mounted classroom, not the saved learning file. */
export interface LearningAnswerDraft extends LearningEditorDraft {
    picked: string[];
    text: string;
    values: Record<string, string>;
    order: string[];
}

export function createLearningAnswerDraft(response: LearningResponse): LearningAnswerDraft {
    return { picked: [], text: '', values: {}, order: response.kind === 'order' ? response.options.map(option => option.id) : [] };
}

export function learningAnswerDraftChanged(draft: LearningAnswerDraft, response: LearningResponse): boolean {
    const initial = createLearningAnswerDraft(response);
    return !!draft.text.trim() || !!draft.picked.length || Object.values(draft.values).some(value => !!value.trim())
        || draft.order.length !== initial.order.length || draft.order.some((id, index) => id !== initial.order[index]);
}
