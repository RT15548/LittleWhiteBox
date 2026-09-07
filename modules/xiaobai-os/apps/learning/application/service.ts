import { learningEvidence, replaceLearningAssessment } from '../../../domains/learning/assessment.js';
import { exposeLearningContent } from '../../../domains/learning/exposure.js';
import { learningSpeechParts, parseLearningVoice } from '../../../domains/learning/speech.js';
import type { LearningNote } from '../../../domains/learning/notes.js';
import { canReadLearningScope, type LearningData, type LearningScope } from '../../../domains/learning/types.js';
import { requireLearning } from '../../../domains/learning/validation.js';
import type { createLearningRepository } from '../storage/repository.js';
import { createLearningId } from './identity.js';
import { appendLearningAttempt } from './attempt.js';

export type LearningRepository = ReturnType<typeof createLearningRepository>;

export function confirmedLearning(repository: LearningRepository) {
    const snapshot = repository.snapshot();
    requireLearning(snapshot.status === 'ready' && snapshot.document !== undefined, 'storage', 'Read or resolve the learning file first');
    return snapshot.document;
}

export function createLearningService(repository: LearningRepository, options: { createId?: () => string; now?: () => string } = {}) {
    const createId = options.createId ?? createLearningId;
    const now = options.now ?? (() => new Date().toISOString());
    const mutate = (language: string, change: (data: LearningData, index: number) => void, guard: () => boolean) => {
        const expected = confirmedLearning(repository);
        const data = structuredClone(expected?.data ?? { profiles: [] });
        const index = data.profiles.findIndex(profile => profile.language === language);
        requireLearning(index >= 0, 'language', 'Select a saved learning profile');
        change(data, index);
        return repository.save(expected, data, guard);
    };
    return {
        /** Called by Host after a real submit. Returned intent is kept for this save, not recreated by retries. */
        prepareAttempt(input: { language: string; unitId: string; exerciseId: string; answer: unknown;
            scope: LearningScope; osId: string; replays: number; slowPlayback: boolean }) {
            const expected = confirmedLearning(repository);
            const data = structuredClone(expected?.data ?? { profiles: [] });
            const profile = data.profiles.find(profile => profile.language === input.language);
            requireLearning(profile, 'language', 'Select a saved learning profile');
            const attempt = appendLearningAttempt(profile, { ...input, createId, now });
            let submitted = false;
            return { attemptId: attempt.id, save(guard: () => boolean) {
                requireLearning(!submitted, 'attemptId', 'This submission has been sent; read or verify its saved result');
                submitted = true;
                return repository.save(expected, data, guard);
            } };
        },
        reveal(language: string, unitId: string, kind: 'answers' | 'hints' | 'transcripts', id: string, osId: string, guard: () => boolean) {
            return mutate(language, (data, index) => {
                const unit = data.profiles[index].unit;
                requireLearning(unit && unit.id === unitId && canReadLearningScope(unit.scope, osId), 'unitId', 'Select an available current unit');
                requireLearning(kind === 'transcripts' ? unit.materials.some(material => material.id === id) : unit.exercises.some(exercise => exercise.id === id), 'id', 'Reveal content from this unit');
                if (kind === 'hints' && !unit.exercises.find(exercise => exercise.id === id)!.hint.trim()) { return; }
                exposeLearningContent(data.profiles[index], kind, id);
            }, guard);
        },
        setVoice(language: string, value: unknown, guard: () => boolean) {
            return mutate(language, (data, index) => { data.profiles[index].voice = parseLearningVoice(value); }, guard);
        },
        note(language: string, unitId: string, note: LearningNote | string, guard: () => boolean) {
            return mutate(language, (data, index) => {
                const unit = data.profiles[index].unit;
                requireLearning(unit?.id === unitId, 'unitId', 'Select the current unit');
                unit.notes ??= [];
                if (typeof note === 'string') { unit.notes = unit.notes.filter(entry => entry.id !== note); }
                else if (!unit.notes.some(entry => entry.id === note.id)) { unit.notes.push(structuredClone(note)); }
            }, guard);
        },
        listening(language: string, unitId: string, exerciseId: string, voice: unknown, partKey: string,
            started: boolean, slow: boolean, osId: string, guard: () => boolean) {
            return mutate(language, (data, index) => {
                const unit = data.profiles[index].unit;
                requireLearning(unit?.id === unitId && canReadLearningScope(unit.scope, osId)
                    && unit.exercises.some(exercise => exercise.id === exerciseId && exercise.skill === 'listening'), 'exerciseId', 'Select a current listening exercise');
                const exercise = unit.exercises.find(entry => entry.id === exerciseId)!;
                requireLearning(unit.materials.filter(material => exercise.materialIds.includes(material.id))
                    .flatMap(learningSpeechParts).some(part => part.key === partKey), 'partKey', 'Select an actual material span');
                // A new record covers one span; slowing unrelated audio must not taint another material.
                const records = unit.listening ?? [];
                let record = records.find(entry => entry.exerciseId === exerciseId && entry.parts.some(part => part.key === partKey));
                if (!record && !started) { return; }
                if (!record) {
                    record = { exerciseId, voice: parseLearningVoice(voice), parts: [{ key: partKey, count: 0 }], slowPlayback: false };
                    records.push(record);
                }
                unit.listening = records;
                if (started) { record.parts.find(part => part.key === partKey)!.count++; }
                record.slowPlayback ||= slow;
            }, guard);
        },
        dispute(language: string, attemptId: string, guard: () => boolean) {
            return mutate(language, (data, index) => {
                const profile = data.profiles[index];
                const current = profile.unit?.assessments.find(entry => entry.attemptId === attemptId)
                    ?? learningEvidence(profile, attemptId).assessment;
                requireLearning(current, 'attemptId', 'Select saved feedback to review');
                replaceLearningAssessment(profile, { ...current, verdict: 'disputed' });
            }, guard);
        },
        deleteAttempt(language: string, attemptId: string, guard: () => boolean) {
            return mutate(language, (data, index) => {
                const profile = data.profiles[index];
                if (profile.unit) {
                    profile.unit.attempts = profile.unit.attempts.filter(entry => entry.id !== attemptId);
                    profile.unit.assessments = profile.unit.assessments.filter(entry => entry.attemptId !== attemptId);
                }
                for (const item of profile.items) { item.evidence = item.evidence.filter(entry => entry.attempt.id !== attemptId); }
            }, guard);
        },
        deleteItem: (language: string, id: string, guard: () => boolean) => mutate(language, (data, index) => {
            data.profiles[index].items = data.profiles[index].items.filter(item => item.id !== id);
        }, guard),
        abandonUnit: (language: string, guard: () => boolean) => mutate(language, (data, index) => { data.profiles[index].unit = null; }, guard),
        deleteLanguage: (language: string, guard: () => boolean) => mutate(language, (data, index) => { data.profiles.splice(index, 1); }, guard),
    };
}
