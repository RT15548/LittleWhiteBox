import { canReadLearningScope, LEARNING_LIMITS as L, type LearningAssessment, type LearningAttempt, type LearningItem, type LearningLanguage, type LearningSchedule, type LearningSkill, type RewardTier } from './types.js';
import { learningRecord } from './profile.js';
import { learningId, learningInteger, learningTimestamp, requireLearning } from './validation.js';

const DAY = 86400000;
const EF_START = 2.5;
const EF_FLOOR = 1.3;
const addDays = (now: string, days: number) => new Date(Date.parse(now) + days * DAY).toISOString();

/** Grammar and vocabulary are the two books the learner reviews by schedule. */
export function learningScheduled(skill: LearningSkill): boolean {
    return skill === 'grammar' || skill === 'vocabulary';
}

/** Entry state: nothing learned yet, due at the given time. */
export function learningScheduleAt(dueAt: string): LearningSchedule {
    return { ef: EF_START, repetitions: 0, intervalDays: 0, dueAt, lastAttemptId: null, lastQuality: null };
}

/** A new item is first reviewed the next day. */
export function newLearningSchedule(now: string): LearningSchedule {
    return learningScheduleAt(addDays(now, 1));
}

export function parseLearningSchedule(value: unknown, path = 'schedule'): LearningSchedule {
    const item = learningRecord(value, path, ['ef', 'repetitions', 'intervalDays', 'dueAt', 'lastAttemptId', 'lastQuality']);
    requireLearning(typeof item.ef === 'number' && Number.isFinite(item.ef) && item.ef >= EF_FLOOR && item.ef <= 10, `${path}.ef`, `Expected an ease factor from ${EF_FLOOR}`);
    return { ef: item.ef, repetitions: learningInteger(item.repetitions, `${path}.repetitions`),
        intervalDays: learningInteger(item.intervalDays, `${path}.intervalDays`), dueAt: learningTimestamp(item.dueAt, `${path}.dueAt`),
        lastAttemptId: item.lastAttemptId === null ? null : learningId(item.lastAttemptId, `${path}.lastAttemptId`),
        lastQuality: item.lastQuality === null ? null : learningInteger(item.lastQuality, `${path}.lastQuality`, 0, 5) };
}

/** SM-2 quality from what actually happened; null means the judgement is disputed and must not move memory. */
export function learningReviewQuality(attempt: Pick<LearningAttempt, 'help'>, assessment: Pick<LearningAssessment, 'verdict' | 'signal'>): number | null {
    if (assessment.verdict === 'disputed') { return null; }
    if (assessment.signal === 'blank') { return 0; }
    if (assessment.verdict === 'incorrect') { return 1; }
    if (assessment.verdict === 'partial') { return 2; }
    const help = attempt.help;
    if (help.answer || help.hint || help.feedback) { return 3; }
    return assessment.signal === 'hesitant' ? 4 : 5;
}

/** One SM-2 step; assessment transitions decide whether a judgement is new. Consecutive duplicates are a no-op. */
export function advanceLearningSchedule(schedule: LearningSchedule, quality: number, attemptId: string, now: string): LearningSchedule {
    if (schedule.lastAttemptId === attemptId) { return schedule; }
    if (quality < 3) {
        return { ef: schedule.ef, repetitions: 0, intervalDays: 1, dueAt: addDays(now, 1), lastAttemptId: attemptId, lastQuality: quality };
    }
    const repetitions = schedule.repetitions + 1;
    const intervalDays = repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(schedule.intervalDays * schedule.ef);
    const ef = Math.max(EF_FLOOR, Math.round((schedule.ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)) * 100) / 100);
    return { ef, repetitions, intervalDays, dueAt: addDays(now, intervalDays), lastAttemptId: attemptId, lastQuality: quality };
}

/**
 * The attempt that last moved these items was deleted or re-judged. ef already carries that attempt's effect
 * and earlier states are not kept, so the item returns to its entry state instead of guessing a history.
 */
export function correctLearningSchedules(items: LearningItem[], attemptId: string, now: string): void {
    for (const item of items) {
        if (item.schedule?.lastAttemptId === attemptId) { item.schedule = newLearningSchedule(now); }
    }
}

export function selectDueLearningItems(profile: Pick<LearningLanguage, 'items'>, now: string, osId?: string | null): LearningItem[] {
    return profile.items.filter(item => item.schedule && item.schedule.dueAt <= now && (osId === undefined || canReadLearningScope(item.scope, osId)))
        .sort((left, right) => left.schedule!.dueAt.localeCompare(right.schedule!.dueAt)).slice(0, L.reviewItems);
}

export function learningReviewTier(count: number): RewardTier {
    requireLearning(Number.isSafeInteger(count) && count >= 1 && count <= L.reviewItems, 'count', `A review covers 1 to ${L.reviewItems} items`);
    return count <= 5 ? 'short' : count <= 12 ? 'regular' : 'deep';
}

export function learningScheduleReason(schedule: LearningSchedule): string {
    const quality = schedule.lastQuality;
    if (quality === null) { return '还没有复习记录，从头开始'; }
    if (quality === 0) { return '上次没想起来，明天再复习'; }
    if (quality < 3) { return '上次没答对，明天再复习'; }
    if (quality === 3) { return `上次借助提示答对，${schedule.intervalDays} 天后复习`; }
    if (quality === 4) { return `上次答对但有犹豫，${schedule.intervalDays} 天后复习`; }
    return `上次独立答对，${schedule.intervalDays} 天后复习`;
}
