import { learningProgress } from '../../../domains/learning/progress.js';
import { canReadLearningScope, LEARNING_SKILLS, type LearningLanguage } from '../../../domains/learning/types.js';

/** An overview of every retained item, not just the first reading page. Never stored separately. */
export function learningProgressOverview(profile: LearningLanguage | undefined, osId: string | null, asOf: string) {
    const skills = LEARNING_SKILLS.map(skill => ({ skill, total: 0, due: 0,
        states: { unassessed: 0, review: 0, independent: 0, practised: 0, strengthen: 0 } }));
    for (const item of profile?.items ?? []) {
        const progress = learningProgress(item);
        const group = skills.find(entry => entry.skill === item.skill)!;
        group.total++;
        group.states[progress.state]++;
        if (progress.nextReviewAt && Date.parse(progress.nextReviewAt) <= Date.parse(asOf)) { group.due++; }
    }
    const completions = profile?.completions ?? [];
    const readable = completions.filter(entry => canReadLearningScope(entry.scope, osId));
    const latest = readable.reduce<LearningLanguage['completions'][number] | null>((latest, entry) =>
        !latest || entry.completedAt > latest.completedAt ? entry : latest, null);
    return { skills, completedLessons: completions.length, readableCompletions: readable.length,
        latestCompletion: latest ? { unitId: latest.unitId, completedAt: latest.completedAt, summary: latest.summary } : null };
}
