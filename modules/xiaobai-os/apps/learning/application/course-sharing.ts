import { requireLearning } from '../../../domains/learning/validation.js';
import { confirmedLearning, type LearningRepository } from './service.js';

/** Explicit user publication of this version's coursework, not its private answers or conversations. */
export function shareLearningCourse(repository: LearningRepository, input: {
    language: string; unitId: string; osId: string; commitId: string; approved: boolean;
}, guard: () => boolean) {
    const document = confirmedLearning(repository);
    requireLearning(input.approved && document?.commitId === input.commitId, 'commitId', 'Confirm the current version of this course before sharing it');
    const data = structuredClone(document.data);
    const profile = data.profiles.find(entry => entry.language === input.language);
    const unit = [profile?.unit, profile?.review].find(entry => entry?.id === input.unitId);
    requireLearning(unit && (unit.scope.kind === 'public' || unit.scope.osId === input.osId), 'unitId', 'Select coursework from this story');
    unit.scope = { kind: 'public' };
    return repository.save(document, data, guard);
}
