import type { LearningData, LearningScope } from '../../../domains/learning/types.js';

/** Access and deletion follow the existing coursework, never a copied long-term article. */
export function learningReferenceScopes(data: LearningData | undefined): Map<string, LearningScope> {
    const scopes = new Map<string, LearningScope>();
    for (const profile of data?.profiles ?? []) {
        for (const unit of [profile.unit, profile.review]) {
            if (!unit) { continue; }
            scopes.set(unit.id, unit.scope);
            for (const entry of [...unit.materials, ...unit.exercises, ...unit.notes ?? []]) { scopes.set(entry.id, unit.scope); }
            for (const attempt of unit.attempts) { scopes.set(attempt.id, attempt.scope); }
        }
        for (const item of profile.items) {
            scopes.set(item.id, item.scope);
            for (const evidence of item.evidence) {
                scopes.set(evidence.unitId, evidence.scope); scopes.set(evidence.attempt.id, evidence.attempt.scope);
                scopes.set(evidence.exercise.id, evidence.scope);
                for (const material of evidence.materials) { scopes.set(material.id, evidence.scope); }
            }
        }
    }
    return scopes;
}
