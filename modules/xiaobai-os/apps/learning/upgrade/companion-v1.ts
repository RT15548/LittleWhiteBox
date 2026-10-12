import { learningRecord, learningText } from '../../../domains/learning/profile.js';

/** Published upstream preference, before companion conversations were persisted. Retire with support for that format. */
export interface LearningCompanionV1 { teacher: { name: string; note: string } | null }
export function parseLearningCompanionV1(value: unknown): LearningCompanionV1 {
    const record = learningRecord(value, 'learning-v1', ['teacher']);
    if (record.teacher === null) { return { teacher: null }; }
    const teacher = learningRecord(record.teacher, 'learning-v1.teacher', ['name', 'note']);
    return { teacher: { name: learningText(teacher.name, 'name', 80), note: learningText(teacher.note, 'note', 800, true) } };
}
