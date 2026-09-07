import { learningRecord, learningText } from './profile.js';
import { canReadLearningScope, LEARNING_LIMITS as L, type LearningLanguage, type LearningScope } from './types.js';
import { combineLearningScope, learningId, learningIds, learningTimestamp, requireLearning } from './validation.js';

export function completeLearning(profile: LearningLanguage, args: unknown, options: {
    osId: string; inputScope: LearningScope; now: () => string;
}): LearningLanguage {
    const input = learningRecord(args, 'LearningComplete', ['unitId', 'attemptIds', 'summary']);
    const unitId = learningId(input.unitId, 'unitId');
    const unit = profile.unit;
    requireLearning(unit && unit.id === unitId && canReadLearningScope(unit.scope, options.osId), 'unitId', 'Use the current readable unit');
    const attemptIds = learningIds(input.attemptIds, 'attemptIds');
    requireLearning(attemptIds.length > 0, 'attemptIds', 'Completion requires actual practice with feedback');
    const summary = learningText(input.summary, 'summary', L.explanation);
    // A completed unit keeps its original completion and reward even during later review.
    if (profile.completions.some(entry => entry.unitId === unitId)) { return structuredClone(profile); }
    let scope = combineLearningScope(unit.scope, options.inputScope);
    for (const id of attemptIds) {
        const attempt = unit.attempts.find(entry => entry.id === id);
        const assessment = unit.assessments.find(entry => entry.attemptId === id);
        requireLearning(attempt && assessment && assessment.verdict !== 'disputed' && canReadLearningScope(assessment.scope, options.osId), 'attemptIds', 'Each attempt needs available, resolved feedback in this unit');
        scope = combineLearningScope(scope, assessment.scope);
    }
    const next = structuredClone(profile);
    next.completions.push({ unitId, completedAt: learningTimestamp(options.now(), 'completedAt'), summary, scope, attemptIds,
        reward: { originOsId: unit.originOsId, amount: unit.reward.amount, title: '语伴学习奖励', note: unit.title } });
    return next;
}
