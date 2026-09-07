import type { LearningLanguage } from './types.js';
import { requireLearning } from './validation.js';

/** Exposure is a fact about still-retained content; past attempt conditions remain unchanged. */
export function exposeLearningContent(profile: LearningLanguage, kind: 'answers' | 'hints' | 'transcripts', id: string) {
    const unit = profile.unit;
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
