import { replaceLearningAssessment } from '../../../domains/learning/assessment.js';
import { objectiveLearningVerdict, parseLearningAnswer } from '../../../domains/learning/exercise.js';
import { parseLearningHelp } from '../../../domains/learning/facts.js';
import { learningListeningBasis, learningSpeechParts } from '../../../domains/learning/speech.js';
import { canReadLearningScope, type LearningLanguage, type LearningScope } from '../../../domains/learning/types.js';
import { combineLearningScope, learningId, learningTimestamp, parseLearningScope, requireLearning } from '../../../domains/learning/validation.js';

/** Capture the real answer and its conditions together, before any new teacher assistance. */
export function appendLearningAttempt(profile: LearningLanguage, input: {
    unitId: string; exerciseId: string; answer: unknown; scope: LearningScope; osId: string;
    replays: number; slowPlayback: boolean; createId: () => string; now: () => string;
}) {
    const unit = profile.unit;
    requireLearning(unit && unit.id === input.unitId && canReadLearningScope(unit.scope, input.osId), 'unitId', 'Select an available current unit');
    const exercise = unit.exercises.find(entry => entry.id === input.exerciseId);
    requireLearning(exercise, 'exerciseId', 'Select an exercise in this unit');
    const answer = parseLearningAnswer(input.answer, exercise.response, unit.materials);
    requireLearning(input.scope.kind === 'public' || input.scope.osId === input.osId, 'scope', 'Use the current story identity');
    const scope = combineLearningScope(unit.scope, parseLearningScope(input.scope, 'scope'));
    const listening = exercise.skill === 'listening' ? learningListeningBasis(unit.listening ?? [],
        unit.materials.filter(material => exercise.materialIds.includes(material.id)).flatMap(learningSpeechParts).map(part => part.key)) : null;
    const help = parseLearningHelp({ answer: unit.revealed.answers.includes(exercise.id), hint: unit.revealed.hints.includes(exercise.id),
        feedback: unit.attempts.some(attempt => attempt.exerciseId === exercise.id
            && unit.assessments.some(assessment => assessment.attemptId === attempt.id && canReadLearningScope(assessment.scope, input.osId))),
        transcript: exercise.skill === 'listening' && unit.materials.some(material => exercise.materialIds.includes(material.id) && material.transcriptRevealed),
        replays: listening?.replays ?? input.replays, slowPlayback: listening?.slowPlayback ?? input.slowPlayback });
    const attempt = { id: learningId(input.createId(), 'attemptId'), exerciseId: exercise.id, answer, scope,
        submittedAt: learningTimestamp(input.now(), 'submittedAt'), help,
        ...(listening ? { listening: structuredClone(listening.parts) } : {}) };
    unit.attempts.push(attempt);
    const verdict = objectiveLearningVerdict(exercise, answer);
    if (verdict !== null && exercise.rule.kind !== 'semantic') {
        replaceLearningAssessment(profile, { attemptId: attempt.id, verdict, scope,
            understanding: '', expression: '', guidance: exercise.rule.explanation });
    }
    return attempt;
}
