import type { LearningClientState } from '../types.js';

/** The answer currently shown for revision, independently of the rest of the course's stage. */
export function learningRevisionWork(unit: NonNullable<LearningClientState['unit']>) {
    return unit.stage.exercises.flatMap(row => {
        const exercise = unit.exercises.find(entry => entry.id === row.exerciseId);
        const latest = unit.attempts.find(entry => entry.id === row.revisionAttemptId);
        const reviewed = latest && unit.assessments.some(entry => entry.attemptId === latest.id && entry.verdict !== 'disputed');
        const draft = reviewed ? latest : unit.attempts.find(entry => entry.id === (latest?.revisesAttemptId ?? row.draftAttemptId));
        if (!exercise || exercise.response.kind !== 'text' || !draft) { return []; }
        const assessment = unit.assessments.find(entry => entry.attemptId === draft.id);
        const revision = reviewed ? undefined : latest;
        const review = revision && unit.assessments.find(entry => entry.attemptId === revision.id);
        return [{ row, exercise, draft, assessment, revision, review, annotations: assessment?.annotations ?? [] }];
    });
}
