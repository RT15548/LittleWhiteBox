import type { LearningAssessment, LearningAttempt, LearningUnit } from './types.js';
import { learningPreparation } from './preparation.js';
import { learningWorkInScope } from './work.js';
import { requireLearning } from './validation.js';

export type LearningUnitStage = 'lesson' | 'writing' | 'grading' | 'revising' | 'reviewing' | 'model' | 'answering' | 'complete';
export type LearningExerciseStatus = 'writing' | 'grading' | 'revising' | 'reviewing' | 'done';
export interface LearningExerciseStage {
    exerciseId: string; draftAttemptId: string | null; revisionAttemptId: string | null; status: LearningExerciseStatus;
}

/** Errors and improvements ask for a revision; alternatives are only offered. */
export function learningNeedsRevision(assessment: LearningAssessment | undefined): boolean {
    return Boolean(assessment?.annotations?.some(annotation => annotation.severity !== 'alternative'));
}

/** The latest submission that is not itself a revision counts as the draft. */
export function learningLatestDraft(unit: LearningUnit, exerciseId: string): LearningAttempt | undefined {
    return unit.attempts.filter(attempt => attempt.exerciseId === exerciseId && attempt.revisesAttemptId === undefined).at(-1);
}

/** Derived from saved attempts and feedback only; no step number is stored beside them. */
export function learningUnitStage(source: LearningUnit, osId: string | null): { stage: LearningUnitStage; exercises: LearningExerciseStage[] } {
    const unit = learningWorkInScope(source, osId);
    requireLearning(unit, 'unitId', 'Select an available learning unit');
    // Disputed feedback is waiting to be judged again, so it does not move the unit forward.
    const assessed = (attempt: LearningAttempt | undefined) => unit.assessments.find(entry => entry.attemptId === attempt?.id && entry.verdict !== 'disputed');
    const rows = unit.exercises.map(exercise => {
        const draft = unit.kind === 'reading-writing' ? learningLatestDraft(unit, exercise.id) : unit.attempts.filter(entry => entry.exerciseId === exercise.id).at(-1);
        const descendants = new Set(draft ? [draft.id] : []);
        const revisions = unit.attempts.filter(entry => {
            if (!entry.revisesAttemptId || !descendants.has(entry.revisesAttemptId)) { return false; }
            descendants.add(entry.id); return true;
        });
        const revision = revisions.at(-1);
        return { exercise, draft, revision, draftAssessment: assessed(draft), revisionAssessment: assessed(revision) };
    });
    const exercises = (status: (row: typeof rows[number]) => LearningExerciseStatus) => rows.map(row => ({ exerciseId: row.exercise.id,
        draftAttemptId: row.draft?.id ?? null, revisionAttemptId: row.revision?.id ?? null, status: status(row) }));
    const basic = (row: typeof rows[number]): LearningExerciseStatus => !row.draft ? 'writing' : !row.draftAssessment ? 'grading' : 'done';
    if (unit.kind === 'lesson') { return { stage: 'lesson', exercises: exercises(basic) }; }
    if (unit.kind === 'review') {
        const stage = rows.some(row => !row.draft) ? 'answering' : rows.some(row => !row.draftAssessment) ? 'grading' : 'complete';
        return { stage, exercises: exercises(basic) };
    }
    const status = (row: typeof rows[number]): LearningExerciseStatus => !row.draft ? 'writing'
        : row.revision && !row.revisionAssessment ? 'reviewing'
            : !row.draftAssessment ? 'grading'
        : !unit.skippedRevisionAttemptIds?.includes((row.revision ?? row.draft)!.id)
            && learningNeedsRevision(row.revision ? row.revisionAssessment : row.draftAssessment) ? 'revising' : 'done';
    if (!learningPreparation(unit).ready || rows.some(row => !row.draft)) { return { stage: 'writing', exercises: exercises(status) }; }
    if (rows.some(row => !row.draftAssessment)) { return { stage: 'grading', exercises: exercises(status) }; }
    if (rows.some(row => row.revision && !row.revisionAssessment)) { return { stage: 'reviewing', exercises: exercises(status) }; }
    if (rows.some(row => status(row) === 'revising')) { return { stage: 'revising', exercises: exercises(status) }; }
    return { stage: unit.modelEssay ? 'complete' : 'model', exercises: exercises(status) };
}
