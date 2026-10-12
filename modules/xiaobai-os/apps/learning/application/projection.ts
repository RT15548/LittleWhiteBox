import { learningProgress } from '../../../domains/learning/progress.js';
import { learningScheduleReason, selectDueLearningItems } from '../../../domains/learning/schedule.js';
import { learningUnitStage } from '../../../domains/learning/stage.js';
import { createLearningAttemptAccess, learningWorkInScope } from '../../../domains/learning/work.js';
import { learningPreparation } from '../../../domains/learning/preparation.js';
import { learningSpeechParts } from '../../../domains/learning/speech.js';
import { canReadLearningScope, type LearningCompletion, type LearningData, type LearningItem, type LearningExercise, type LearningMaterial, type LearningUnit } from '../../../domains/learning/types.js';
import type { LearningRewardStatus } from './rewards.js';

export function learningMaterialView(material: LearningMaterial, hidden: boolean) {
    return { id: material.id, title: material.title, provenance: material.provenance, hidden,
        paragraphs: hidden ? [] : material.paragraphs,
        parts: learningSpeechParts(material).map((part, index) => ({ key: part.key, number: index + 1 })) };
}
export function learningExerciseView(exercise: LearningExercise, unit?: LearningUnit) {
    const { rule, hint, ...question } = exercise;
    return { ...question, hasHint: !!hint.trim(), hint: unit?.revealed.hints.includes(exercise.id) ? hint : null,
        solution: unit?.revealed.answers.includes(exercise.id) ? rule : null };
}

/** The complete published reading surface, shared by the workbench and its companion. */
export function learningTrainingView(unit: LearningUnit) {
    const materials = unit.materials.map(material => learningMaterialView(material, !material.transcriptRevealed
        && unit.exercises.some(exercise => exercise.skill === 'listening' && exercise.materialIds.includes(material.id))));
    return { id: unit.id, kind: unit.kind, title: unit.title, goal: unit.goal,
        materials, exercises: unit.exercises.map(exercise => learningExerciseView(exercise, unit)),
        explanations: (unit.explanations ?? []).filter(entry => materials.some(material => material.id === entry.materialId && !material.hidden)),
        modelEssay: unit.modelEssay ?? null, preparation: learningPreparation(unit) };
}

/** The iframe receives a reading surface, never an unfiltered lesson or answer-key cache. */
export function learningClassView(data: LearningData, language: string, osId: string | null, offset = 0, recordId = '',
    rewardStatus: (completion: LearningCompletion) => LearningRewardStatus | 'available' = completion => completion.receipt ? 'paid' : 'available',
    now = new Date().toISOString()) {
    const profile = data.profiles.find(entry => entry.language === language);
    const visible = (scope: Parameters<typeof canReadLearningScope>[0]) => canReadLearningScope(scope, osId);
    const unit = learningWorkInScope(profile?.unit, osId);
    const review = learningWorkInScope(profile?.review, osId);
    const attempts = createLearningAttemptAccess(profile, osId);
    const unitView = (unit: LearningUnit) => ({ ...learningTrainingView(unit), stage: learningUnitStage(unit, osId), reward: unit.reward,
        shared: unit.scope.kind === 'public',
        notes: unit.notes ?? [],
        // Current attempts are paged by question in the UI; keys and transcript never travel with them.
        attempts: unit.attempts,
        attemptActions: Object.fromEntries(unit.attempts.map(attempt => [attempt.id, attempts.get(attempt.id).actions])),
        assessments: unit.assessments,
    });
    const items = profile?.items ?? [];
    const item = items.find(entry => entry.id === recordId);
    const pageOffset = Math.min(offset, Math.floor(Math.max(0, items.length - 1) / 30) * 30);
    const itemView = (entry: LearningItem) => ({
        id: entry.id, label: visible(entry.scope) ? entry.label : '其他故事中的学习项', skill: entry.skill,
        ...learningProgress(entry), readable: visible(entry.scope),
        schedule: entry.schedule ?? null, scheduleReason: entry.schedule ? learningScheduleReason(entry.schedule) : null,
        nextReviewAt: entry.schedule?.dueAt ?? null, evidenceCount: entry.evidence.filter(evidence => visible(evidence.scope)).length,
    });
    const views = items.map(itemView);
    const completions = profile?.completions ?? [];
    return {
        languages: data.profiles.map(entry => entry.language),
        profile: profile ? { language: profile.language, explanationLanguage: profile.explanationLanguage,
            selfAssessment: profile.selfAssessment, level: profile.level, interests: profile.interests, goal: profile.goal, voice: profile.voice ?? null,
            settings: { explanationLanguage: profile.explanationLanguage, level: profile.level, targetLevel: profile.goal.targetLevel,
                exam: profile.goal.exam, interests: profile.interests } } : null,
        blockedUnit: !!profile?.unit && !unit,
        currentUnitId: profile?.unit?.id ?? null,
        unit: unit ? unitView(unit) : null,
        blockedReview: !!profile?.review && !review,
        review: review ? unitView(review) : null,
        dueCount: profile ? selectDueLearningItems(profile, now, osId).length : 0,
        /** The 全部记录 list, one page of 30 at a time. */
        records: { offset: pageOffset, total: items.length, items: views.slice(pageOffset, pageOffset + 30) },
        /** The grammar and vocabulary books list every item of their skill; growth reads every item too. */
        books: { grammar: views.filter(entry => entry.skill === 'grammar'), vocabulary: views.filter(entry => entry.skill === 'vocabulary') },
        growth: learningGrowth(views, completions.length),
        /** Words already in the vocabulary book, so a reading term shows as saved. */
        savedTerms: [...new Set(items.filter(entry => entry.skill === 'vocabulary' && visible(entry.scope)).map(entry => entry.label))],
        record: item && visible(item.scope) ? { id: item.id, label: item.label, evidence: item.evidence.filter(entry => visible(entry.scope)).map(entry => ({
            unitId: entry.unitId, exercise: learningExerciseView(entry.exercise), attempt: entry.attempt, assessment: entry.assessment,
            actions: attempts.get(entry.attempt.id).actions,
            materials: entry.materials.map(material => learningMaterialView(material, entry.exercise.skill === 'listening' && !material.transcriptRevealed)),
        })) } : null,
        completions: completions.map(completion => ({ unitId: completion.unitId,
            completedAt: completion.completedAt, summary: visible(completion.scope) ? completion.summary : '在其他故事中完成的学习',
            amount: completion.reward.amount, rewardStatus: rewardStatus(completion),
        })).reverse(),
    };
}
export type LearningClassView = ReturnType<typeof learningClassView>;

export interface LearningGrowthItem { label: string; skill: string; state: string; evidenceCount: number; readable: boolean }
export interface LearningGrowth {
    enough: boolean;
    steady: string[]; practising: string[]; struggling: string[];
    evidence: number; completed: number;
}

/**
 * Only facts that come from saved attempts: the evidence behind each item and finished units.
 * Too little evidence says so instead of drawing a curve.
 */
export function learningGrowth(items: LearningGrowthItem[], completed: number): LearningGrowth {
    const seen = items.filter(item => item.readable && item.evidenceCount > 0);
    const evidence = seen.reduce((sum, item) => sum + item.evidenceCount, 0);
    const pick = (state: string) => seen.filter(item => item.state === state).map(item => item.label);
    return { enough: evidence >= 3 && seen.some(item => item.evidenceCount >= 2),
        steady: pick('independent'), practising: pick('practised'), struggling: pick('strengthen'), evidence, completed };
}
