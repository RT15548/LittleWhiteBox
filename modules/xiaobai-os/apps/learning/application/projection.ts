import { learningProgress } from '../../../domains/learning/progress.js';
import { learningSpeechParts } from '../../../domains/learning/speech.js';
import { canReadLearningScope, type LearningData, type LearningExercise, type LearningMaterial, type LearningUnit } from '../../../domains/learning/types.js';

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

/** The iframe receives a reading surface, never an unfiltered lesson or answer-key cache. */
export function learningClassView(data: LearningData, language: string, osId: string | null, offset = 0, recordId = '') {
    const profile = data.profiles.find(entry => entry.language === language);
    const visible = (scope: Parameters<typeof canReadLearningScope>[0]) => canReadLearningScope(scope, osId);
    const unit = profile?.unit && visible(profile.unit.scope) ? profile.unit : null;
    const items = profile?.items ?? [];
    const item = items.find(entry => entry.id === recordId);
    const pageOffset = Math.min(offset, Math.floor(Math.max(0, items.length - 1) / 30) * 30);
    return {
        languages: data.profiles.map(entry => entry.language),
        profile: profile ? { language: profile.language, explanationLanguage: profile.explanationLanguage,
            selfAssessment: profile.selfAssessment, goal: profile.goal, voice: profile.voice ?? null } : null,
        blockedUnit: !!profile?.unit && !unit,
        currentUnitId: profile?.unit?.id ?? null,
        unit: unit ? { id: unit.id, title: unit.title, goal: unit.goal, reward: unit.reward,
            notes: unit.notes ?? [],
            materials: unit.materials.map(material => learningMaterialView(material, !material.transcriptRevealed
                && unit.exercises.some(exercise => exercise.skill === 'listening' && exercise.materialIds.includes(material.id)))),
            exercises: unit.exercises.map(exercise => learningExerciseView(exercise, unit)),
            // Current attempts are paged by question in the UI; keys and transcript never travel with them.
            attempts: unit.attempts.filter(attempt => visible(attempt.scope)),
            assessments: unit.assessments.filter(assessment => visible(assessment.scope)
                && unit.attempts.some(attempt => attempt.id === assessment.attemptId && visible(attempt.scope))),
        } : null,
        records: { offset: pageOffset, total: items.length, items: items.slice(pageOffset, pageOffset + 30).map(entry => ({
            id: entry.id, label: visible(entry.scope) ? entry.label : '其他故事中的学习项', skill: entry.skill,
            ...learningProgress(entry), readable: visible(entry.scope), evidenceCount: entry.evidence.filter(evidence => visible(evidence.scope)).length,
        })) },
        record: item && visible(item.scope) ? { id: item.id, label: item.label, evidence: item.evidence.filter(entry => visible(entry.scope)).map(entry => ({
            unitId: entry.unitId, exercise: learningExerciseView(entry.exercise), attempt: entry.attempt, assessment: entry.assessment,
            materials: entry.materials.map(material => learningMaterialView(material, entry.exercise.skill === 'listening' && !material.transcriptRevealed)),
        })) } : null,
        completions: (profile?.completions ?? []).map(completion => ({ unitId: completion.unitId,
            completedAt: completion.completedAt, summary: visible(completion.scope) ? completion.summary : '在其他故事中完成的学习',
            amount: completion.reward.amount, paid: !!completion.receipt, originHere: completion.reward.originOsId === osId,
        })).reverse(),
    };
}
export type LearningClassView = ReturnType<typeof learningClassView>;
