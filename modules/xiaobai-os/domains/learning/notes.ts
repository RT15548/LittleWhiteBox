import { learningRecord } from './profile.js';
import type { LearningMaterial } from './types.js';
import { learningId, learningInteger, requireLearning } from './validation.js';

export interface LearningSelection { materialId: string; paragraphId: string; start: number; end: number; quote: string }
export interface LearningNote { id: string; text: string; exerciseId: string; selection: LearningSelection | null }
export const LEARNING_SELECTION_LIMIT = 2000;

export function parseLearningSelection(value: unknown, materials: LearningMaterial[]): LearningSelection {
    const input = learningRecord(value, 'selection', ['materialId', 'paragraphId', 'start', 'end', 'quote']);
    const materialId = learningId(input.materialId, 'materialId');
    const paragraphId = learningId(input.paragraphId, 'paragraphId');
    const paragraph = materials.find(material => material.id === materialId)?.paragraphs.find(entry => entry.id === paragraphId);
    const start = learningInteger(input.start, 'start');
    const end = learningInteger(input.end, 'end', start + 1);
    requireLearning(typeof input.quote === 'string' && !!input.quote.trim() && [...input.quote].length <= LEARNING_SELECTION_LIMIT,
        'quote', 'Select non-empty text within the quotation limit');
    const quote = input.quote;
    requireLearning(paragraph && end <= paragraph.text.length && paragraph.text.slice(start, end) === quote,
        'selection', 'The quotation must match the selected original text');
    return { materialId, paragraphId, start, end, quote };
}
