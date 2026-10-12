import type { LearningAction } from './session.js';
import { canReadLearningScope, type LearningLanguage, type LearningScope } from '../../../domains/learning/types.js';
import { combineLearningScope, requireLearning } from '../../../domains/learning/validation.js';

export function isLearningPreparation(action: Pick<LearningAction, 'kind'>) {
    return action.kind === 'prepare';
}

/** Conversation has its own run; only a requested workbench action can change training facts. */
export function isLearningConversation(action: Pick<LearningAction, 'kind'>) {
    return action.kind === 'talk' || action.kind === 'companion' || action.kind === 'task-result';
}

/** Public lesson preparation cannot copy story-private assets; existing work retains its original access. */
export function learningAccessOsId(action: LearningAction, inputScope: LearningScope, osId: string): string | null {
    return inputScope.kind === 'public' && (action.kind === 'prepare' || action.kind === 'review-prepare' || isLearningPreparation(action)) ? null : osId;
}

/** Review output inherits the selected items and the evidence the teacher can use for them. */
export function learningReviewScope(profile: LearningLanguage | undefined, itemIds: string[], osId: string): LearningScope {
    return itemIds.reduce<LearningScope>((scope, id) => {
        const item = profile?.items.find(item => item.id === id);
        requireLearning(item && canReadLearningScope(item.scope, osId), 'itemIds', 'Select available review items');
        return item.evidence.filter(evidence => canReadLearningScope(evidence.scope, osId))
            .reduce((scope, evidence) => combineLearningScope(scope, evidence.scope), combineLearningScope(scope, item.scope));
    }, { kind: 'public' });
}

export function learningReadAudience(action: LearningAction): 'public' | 'teaching' {
    return isLearningConversation(action) || action.kind === 'summary-review' || action.kind === 'profile' ? 'public' : 'teaching';
}

export function learningReadUnit(action: LearningAction, profile?: LearningLanguage): 'unit' | 'review' {
    return action.kind === 'review-prepare' || action.kind === 'review-assess'
        || action.kind === 'talk' && !!action.unitId && profile?.review?.id === action.unitId
        || action.kind === 'assess' && profile?.review?.attempts.some(attempt => attempt.id === action.attemptId) ? 'review' : 'unit';
}
