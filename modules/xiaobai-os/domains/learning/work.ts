import { canReadLearningScope, type LearningAssessment, type LearningEvidence, type LearningLanguage, type LearningUnit } from './types.js';
import { combineLearningScope } from './validation.js';

export const LEARNING_WORK_COPY = {
    unavailable: 'Select work available in this story',
    feedbackRequired: 'Select saved feedback to review',
    revised: '这篇已有修改稿，结果以修改稿的批改为准；请对修改稿的反馈申请复核。',
    hiddenRevisions: '这次作答关联其他故事中的修改稿，不能在这里一并删除。',
} as const;

/** A read-only work projection. Mutations retain the full unit and address its records by ID. */
export function learningWorkInScope(unit: LearningUnit | null | undefined, osId: string | null): LearningUnit | null {
    if (!unit || !canReadLearningScope(unit.scope, osId)) { return null; }
    const available = new Set<string>();
    const attempts = unit.attempts.filter(attempt => {
        const feedback = unit.assessments.find(entry => entry.attemptId === attempt.id);
        // A private judgement cannot be overwritten by grading its public answer in another story.
        if (!canReadLearningScope(attempt.scope, osId) || feedback && !canReadLearningScope(feedback.scope, osId)
            || attempt.revisesAttemptId && !available.has(attempt.revisesAttemptId)) { return false; }
        available.add(attempt.id); return true;
    });
    return { ...unit, attempts, assessments: unit.assessments.filter(entry => available.has(entry.attemptId)),
        ...(unit.skippedRevisionAttemptIds ? { skippedRevisionAttemptIds: unit.skippedRevisionAttemptIds.filter(id => available.has(id)) } : {}) };
}

/** Storage ownership does not determine whether retained evidence is readable. */
export function learningUnitOfAttempt(profile: LearningLanguage, attemptId: string): LearningUnit | undefined {
    return [profile.unit, profile.review].find(unit => unit?.attempts.some(entry => entry.id === attemptId)) ?? undefined;
}

type LearningAttemptWork = Omit<LearningEvidence, 'assessment'> & { assessment?: LearningAssessment };

/** One ephemeral index for a command or view; no saved document or scope is changed by reading it. */
export function createLearningAttemptAccess(profile: LearningLanguage | undefined, osId: string | null) {
    const units = [profile?.unit, profile?.review];
    const evidence = profile?.items.flatMap(item => item.evidence) ?? [];
    const available = new Map<string, LearningAttemptWork>();
    // A retained question/material snapshot stays readable even if its source course becomes private.
    for (const entry of evidence) {
        if (canReadLearningScope(entry.scope, osId)) { available.set(entry.attempt.id, entry); }
    }
    for (const source of units) {
        const unit = learningWorkInScope(source, osId);
        if (!unit) { continue; }
        for (const attempt of unit.attempts) {
            const exercise = unit.exercises.find(entry => entry.id === attempt.exerciseId)!;
            const assessment = unit.assessments.find(entry => entry.attemptId === attempt.id);
            available.set(attempt.id, { unitId: unit.id, exercise, attempt, assessment,
                scope: combineLearningScope(unit.scope, assessment?.scope ?? attempt.scope),
                materials: unit.materials.filter(material => exercise.materialIds.includes(material.id)) });
        }
    }
    // Include hidden and retained revisions too. Representative evidence need not be ordered.
    const children = new Map<string, Set<string>>();
    const attempts = units.flatMap(unit => unit?.attempts ?? []).concat(evidence.map(entry => entry.attempt));
    for (const attempt of attempts) {
        if (!attempt.revisesAttemptId) { continue; }
        const ids = children.get(attempt.revisesAttemptId) ?? new Set<string>();
        ids.add(attempt.id); children.set(attempt.revisesAttemptId, ids);
    }
    const family = (attemptIds: string[]) => {
        const ids = new Set(attemptIds);
        for (const id of ids) { for (const child of children.get(id) ?? []) { ids.add(child); } }
        return ids;
    };
    return {
        work: (attemptId: string) => available.get(attemptId) ?? null,
        family,
        get(attemptId: string) {
            const work = available.get(attemptId) ?? null;
            const ids = family([attemptId]);
            return { work, family: ids, actions: {
                review: !!work?.assessment && ids.size === 1,
                remove: !!work && [...ids].every(id => available.has(id)),
            } };
        },
    };
}
