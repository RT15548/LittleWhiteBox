import type { LearningData } from '../../../domains/learning/types.js';
import type { LearningSelection } from '../../../domains/learning/notes.js';
import type { LearningAction } from '../agent/session.js';
import { learningReadUnit } from '../agent/access.js';
import type { LearningWorkTarget } from './delegation.js';

/** The saved answer owns its location; neither the model nor the current screen needs to repeat it. */
export function learningWorkTarget(data: LearningData, language: string, request: {
    action: LearningAction; exerciseId?: string; selection?: LearningSelection | null; target?: LearningWorkTarget;
}, requestData = data): LearningWorkTarget {
    if (request.target) { return request.target; }
    const profile = data.profiles.find(entry => entry.language === language);
    const unitKey = learningReadUnit(request.action, requestData.profiles.find(entry => entry.language === language));
    const unit = profile?.[unitKey];
    if ('attemptId' in request.action) {
        const attemptId = request.action.attemptId;
        const attempt = unit?.attempts.find(entry => entry.id === attemptId);
        const archived = !attempt && profile?.items.flatMap(item => item.evidence).find(entry => entry.attempt.id === attemptId);
        return { unitKey, unitId: attempt ? unit!.id : archived ? archived.unitId : undefined,
            exerciseId: attempt?.exerciseId ?? (archived ? archived.exercise.id : undefined) };
    }
    return { unitKey, unitId: 'unitId' in request.action ? request.action.unitId ?? unit?.id : unit?.id,
        exerciseId: request.exerciseId, selection: request.selection };
}
