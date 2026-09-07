import type { LearningUnit } from '../../../domains/learning/types.js';
import { learningRecord } from '../../../domains/learning/profile.js';
import { learningEnum, learningId, requireLearning } from '../../../domains/learning/validation.js';

/** A runtime reference to confirmed teaching content, never a second saved lesson. */
export interface LearningActivityPresentation {
    unitId: string;
    kind: 'material' | 'exercise';
    id: string;
    title: string;
}
export type LearningPresentation = LearningActivityPresentation | { unitId: string; kind: 'replacement'; id: string; title: string; message: string };

export function learningPresentation(unit: LearningUnit | null, args: unknown, learnerMessage = ''): LearningPresentation {
    const input = learningRecord(args, 'LearningPresent', ['kind', 'id']);
    const kind = learningEnum(input.kind, 'kind', ['material', 'exercise', 'replacement']);
    if (kind === 'replacement') {
        requireLearning(unit && learnerMessage.trim(), 'unit', 'Choose a current lesson to put aside');
        return { unitId: unit.id, kind, id: unit.id, title: '换一课', message: learnerMessage };
    }
    const id = learningId(input.id, 'id');
    const item = kind === 'exercise' ? unit?.exercises.find(entry => entry.id === id) : unit?.materials.find(entry => entry.id === id);
    requireLearning(unit && item, 'id', 'Choose an existing material or exercise from LearningRead');
    return { unitId: unit.id, kind, id, title: 'prompt' in item ? item.prompt : item.title };
}
