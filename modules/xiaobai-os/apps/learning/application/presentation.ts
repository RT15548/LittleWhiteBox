import type { LearningUnit } from '../../../domains/learning/types.js';
import { learningRecord } from '../../../domains/learning/profile.js';
import { learningEnum, learningId, requireLearning } from '../../../domains/learning/validation.js';

/** A runtime reference to confirmed teaching content, never a second saved lesson. */
export interface LearningPresentation {
    unitId: string;
    kind: 'material' | 'exercise';
    id: string;
    title: string;
}
export function learningPresentation(unit: LearningUnit | null, args: unknown): LearningPresentation {
    const input = learningRecord(args, 'LearningPresent', ['kind', 'id']);
    const kind = learningEnum(input.kind, 'kind', ['material', 'exercise']);
    const id = learningId(input.id, 'id');
    const item = kind === 'exercise' ? unit?.exercises.find(entry => entry.id === id) : unit?.materials.find(entry => entry.id === id);
    requireLearning(unit && item, 'id', 'Choose an existing material or exercise from LearningRead');
    return { unitId: unit.id, kind, id, title: 'prompt' in item ? item.prompt : item.title };
}
