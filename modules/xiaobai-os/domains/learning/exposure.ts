import type { LearningLanguage, LearningUnit } from './types.js';
import { requireLearning } from './validation.js';

/** Help belongs to both the question and the passages it asks about, not just a reused question ID. */
export function sameLearningExerciseContent(left: LearningUnit | null | undefined, right: LearningUnit | null | undefined, id: string): boolean {
    if (!left || !right || left.id !== right.id) { return false; }
    const exercise = left.exercises.find(entry => entry.id === id);
    const other = right.exercises.find(entry => entry.id === id);
    return !!exercise && !!other && JSON.stringify(exercise) === JSON.stringify(other)
        && exercise.materialIds.every(materialId => {
            const material = left.materials.find(entry => entry.id === materialId);
            const counterpart = right.materials.find(entry => entry.id === materialId);
            return !!material && !!counterpart && JSON.stringify(material.paragraphs) === JSON.stringify(counterpart.paragraphs);
        });
}

/** Exposure is a fact about still-retained content; past attempt conditions remain unchanged. The unit defaults to the current lesson. */
export function exposeLearningContent(profile: LearningLanguage, kind: 'answers' | 'hints' | 'transcripts', id: string, unit: LearningUnit | null = profile.unit) {
    requireLearning(unit, 'unit', 'Select a current lesson');
    requireLearning(kind === 'transcripts' ? unit.materials.some(material => material.id === id)
        : unit.exercises.some(exercise => exercise.id === id), 'id', 'Use content from the current lesson');
    if (kind === 'transcripts') {
        unit.materials.find(material => material.id === id)!.transcriptRevealed = true;
        for (const item of profile.items) {
            for (const evidence of item.evidence) {
                for (const material of evidence.materials) { if (material.id === id) { material.transcriptRevealed = true; } }
            }
        }
    } else if (!unit.revealed[kind].includes(id)) { unit.revealed[kind].push(id); }
}
