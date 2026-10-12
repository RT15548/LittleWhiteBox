import { projectLearningEvidence, replaceLearningAssessment, scheduleLearningReview } from '../../../domains/learning/assessment.js';
import { completeLearningByFacts } from '../../../domains/learning/completion.js';
import { objectiveLearningVerdict, parseLearningAnswer } from '../../../domains/learning/exercise.js';
import { parseLearningHelp } from '../../../domains/learning/facts.js';
import { sameLearningExerciseContent } from '../../../domains/learning/exposure.js';
import { learningListeningBasis, learningSpeechParts } from '../../../domains/learning/speech.js';
import { canReadLearningScope, type LearningLanguage, type LearningScope, type LearningUnit } from '../../../domains/learning/types.js';
import { combineLearningScope, learningId, learningTimestamp, parseLearningScope, requireLearning } from '../../../domains/learning/validation.js';
import type { LearningDocument } from '../storage/document.js';
import { learningWorkInScope } from '../../../domains/learning/work.js';

/** Frozen when a real message arrives; never supplied by the model or persisted as another snapshot. */
export interface LearningAttemptBasis { document: LearningDocument | null; submittedAt: string }

/** The question stays current; only the conditions of the learner's message come from its snapshot. */
export function learningAttemptUnit(basis: LearningAttemptBasis | undefined, language: string, current: LearningUnit | null | undefined, exerciseId: string) {
    if (!basis) { requireLearning(current, 'unitId', 'Select an available current unit'); return current; }
    const profile = basis.document?.data.profiles.find(entry => entry.language === language);
    const original = [profile?.unit, profile?.review].find(entry => entry?.id === current?.id);
    requireLearning(sameLearningExerciseContent(original, current, exerciseId), 'exerciseId',
        'The submitted question or its material changed; ask the learner for a fresh answer');
    return original!;
}

/** Originals and revisions use the same exposure facts, including an early model essay. */
export function learningAttemptConditions(unit: LearningUnit, exerciseId: string, osId: string | null, replays = 0, slowPlayback = false) {
    const exercise = unit.exercises.find(entry => entry.id === exerciseId);
    requireLearning(exercise, 'exerciseId', 'Select an exercise in this unit');
    const work = learningWorkInScope(unit, osId);
    requireLearning(work, 'unitId', 'Select work available in this story');
    const listening = exercise.skill === 'listening' ? learningListeningBasis(unit.listening ?? [],
        unit.materials.filter(material => exercise.materialIds.includes(material.id)).flatMap(learningSpeechParts).map(part => part.key)) : null;
    return { help: parseLearningHelp({ answer: unit.revealed.answers.includes(exercise.id)
        || Boolean(unit.modelEssay && exercise.skill === 'writing' && !exercise.paragraphId), hint: unit.revealed.hints.includes(exercise.id),
        feedback: work.attempts.some(attempt => attempt.exerciseId === exercise.id
            && work.assessments.some(assessment => assessment.attemptId === attempt.id)),
        transcript: exercise.skill === 'listening' && unit.materials.some(material => exercise.materialIds.includes(material.id) && material.transcriptRevealed),
        replays: listening?.replays ?? replays, slowPlayback: listening?.slowPlayback ?? slowPlayback }),
    ...(listening ? { listening: structuredClone(listening.parts) } : {}) };
}

/** Capture the real answer and its conditions together, before any new teacher assistance. */
export function appendLearningAttempt(profile: LearningLanguage, input: {
    unitId: string; exerciseId: string; answer: unknown; scope: LearningScope; osId: string;
    replays: number; slowPlayback: boolean; createId: () => string; now: () => string;
    basis?: LearningUnit;
}) {
    const unit = [profile.unit, profile.review].find(entry => entry?.id === input.unitId);
    requireLearning(unit && canReadLearningScope(unit.scope, input.osId), 'unitId', 'Select an available current unit');
    const exercise = unit.exercises.find(entry => entry.id === input.exerciseId);
    requireLearning(exercise, 'exerciseId', 'Select an exercise in this unit');
    const conditions = input.basis ?? unit;
    if (unit.kind === 'reading-writing') {
        // Replace an ungraded draft, while preserving feedback and the basis of every revision.
        const available = new Set(learningWorkInScope(unit, input.osId)!.attempts.map(attempt => attempt.id));
        unit.attempts = unit.attempts.filter(entry => entry.exerciseId !== exercise.id
            || !available.has(entry.id)
            || unit.assessments.some(assessment => assessment.attemptId === entry.id)
            || unit.attempts.some(revision => revision.revisesAttemptId === entry.id));
    }
    const answer = parseLearningAnswer(input.answer, exercise.response, unit.materials);
    requireLearning(input.scope.kind === 'public' || input.scope.osId === input.osId, 'scope', 'Use the current story identity');
    const scope = combineLearningScope(unit.scope, parseLearningScope(input.scope, 'scope'));
    const attempt = { id: learningId(input.createId(), 'attemptId'), exerciseId: exercise.id, answer, scope,
        submittedAt: learningTimestamp(input.now(), 'submittedAt'),
        ...learningAttemptConditions(conditions, exercise.id, input.osId, input.replays, input.slowPlayback) };
    unit.attempts.push(attempt);
    const verdict = objectiveLearningVerdict(exercise, answer);
    if (verdict !== null && exercise.rule.kind !== 'semantic') {
        replaceLearningAssessment(profile, { attemptId: attempt.id, verdict, scope,
            understanding: '', expression: '', guidance: exercise.rule.explanation });
        if (unit.kind === 'review') {
            const now = attempt.submittedAt;
            scheduleLearningReview(profile, projectLearningEvidence(unit, attempt.id), now);
            completeLearningByFacts(profile, 'review', now, input.osId);
        }
    }
    return attempt;
}
