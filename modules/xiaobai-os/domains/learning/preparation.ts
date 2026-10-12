import type { LearningUnit } from './types.js';

export const LEARNING_SUMMARY_PROMPT = '用你的话概括这一段';

/** Saved content is the only preparation checkpoint; restarting never needs a job record. */
export function learningPreparation(unit: Pick<LearningUnit, 'kind' | 'materials' | 'explanations' | 'exercises'>) {
    const missing = unit.kind === 'reading-writing' ? unit.materials.flatMap(material => material.paragraphs
        .filter(paragraph => !unit.explanations?.some(entry => entry.materialId === material.id && entry.paragraphId === paragraph.id))
        .map(paragraph => paragraph.id)) : [];
    const essay = unit.kind !== 'reading-writing' || unit.exercises.some(exercise => !exercise.paragraphId && exercise.skill === 'writing' && exercise.response.kind === 'text');
    return { missing, essay, ready: !missing.length && essay };
}

/** Only append-only teaching supplements commute with learner work on the identical article. */
export function mergeLearningSupplement(before: LearningUnit, current: LearningUnit, prepared: LearningUnit): LearningUnit | null {
    const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
    const article = (unit: LearningUnit) => ({ id: unit.id, kind: unit.kind, title: unit.title, goal: unit.goal, scope: unit.scope,
        reward: unit.reward, materials: unit.materials.map(({ transcriptRevealed: _exposed, ...material }) => material) });
    if (before.kind !== 'reading-writing' || !same(article(before), article(current)) || !same(article(before), article(prepared))) { return null; }
    if (!before.exercises.every(entry => same(entry, prepared.exercises.find(item => item.id === entry.id)))
        || !before.explanations?.every(entry => same(entry, prepared.explanations?.find(note => note.materialId === entry.materialId && note.paragraphId === entry.paragraphId)))) { return null; }
    const next = structuredClone(current);
    for (const entry of prepared.explanations ?? []) {
        const existing = next.explanations!.find(item => item.paragraphId === entry.paragraphId);
        if (existing && !same(existing, entry)) { return null; }
        if (!existing) { next.explanations!.push(structuredClone(entry)); }
    }
    for (const entry of prepared.exercises) {
        const existing = next.exercises.find(item => item.id === entry.id);
        if (existing && !same(existing, entry)) { return null; }
        if (!existing) {
            next.exercises.push(structuredClone(entry));
        }
    }
    return next;
}
