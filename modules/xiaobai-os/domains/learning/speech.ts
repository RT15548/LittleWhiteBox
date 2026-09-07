import { learningRecord, learningText, parseLearningLanguageTag } from './profile.js';
import { type LearningExercise, type LearningHeardPart, type LearningListening, type LearningMaterial, type LearningSpeechVoice } from './types.js';
import { learningArray, learningBoolean, learningId, learningInteger, requireLearning, uniqueLearning } from './validation.js';

export function parseLearningVoice(value: unknown, path = 'voice'): LearningSpeechVoice {
    const item = learningRecord(value, path, ['voiceId', 'language', 'speed']);
    requireLearning(typeof item.speed === 'number' && Number.isFinite(item.speed) && item.speed >= 0.5 && item.speed <= 2,
        `${path}.speed`, 'Expected a speech speed between 0.5 and 2');
    return { voiceId: learningText(item.voiceId, `${path}.voiceId`, 160), language: parseLearningLanguageTag(item.language, `${path}.language`), speed: item.speed };
}
export function parseLearningListening(value: unknown, exercises: LearningExercise[], materials: LearningMaterial[], path: string): LearningListening[] {
    const records = learningArray(value, path, (raw, p) => {
        const item = learningRecord(raw, p, ['exerciseId', 'voice', 'parts', 'slowPlayback']);
        const exerciseId = learningId(item.exerciseId, `${p}.exerciseId`);
        const exercise = exercises.find(exercise => exercise.id === exerciseId && exercise.skill === 'listening');
        requireLearning(exercise, p, 'Listening belongs to a listening exercise');
        const keys = materials.filter(material => exercise.materialIds.includes(material.id)).flatMap(learningSpeechParts).map(part => part.key);
        const parts = learningArray(item.parts, `${p}.parts`, (rawPart, partPath) => {
            const part = learningRecord(rawPart, partPath, ['key', 'count']);
            const key = learningText(part.key, `${partPath}.key`, 160);
            requireLearning(keys.includes(key), partPath, 'Listening refers to an actual material span');
            return { key, count: learningInteger(part.count, `${partPath}.count`, 1) };
        }, 64);
        uniqueLearning(parts.map(part => part.key), p);
        return { exerciseId, voice: parseLearningVoice(item.voice, `${p}.voice`), parts, slowPlayback: learningBoolean(item.slowPlayback, `${p}.slowPlayback`) };
    }, exercises.length * 64);
    uniqueLearning(records.flatMap(record => record.parts.map(part => JSON.stringify([record.exerciseId, part.key]))), path);
    return records;
}

/** The exercise ID is playback provenance; hearing the same material helps every question using it. */
export function learningListeningBasis(records: readonly LearningListening[], keys: readonly string[]) {
    const heard = new Map<string, LearningHeardPart>();
    const counts = new Map<string, number>();
    for (const record of records) {
        for (const part of record.parts) {
            if (!keys.includes(part.key)) { continue; }
            counts.set(part.key, (counts.get(part.key) ?? 0) + part.count);
            const id = heardPartIdentity(part.key, record.voice);
            const saved = heard.get(id);
            if (saved) { saved.count += part.count; saved.slowPlayback ||= record.slowPlayback; }
            else { heard.set(id, { ...part, voice: structuredClone(record.voice), slowPlayback: record.slowPlayback }); }
        }
    }
    const parts = [...heard.values()];
    return parts.length ? { parts, replays: [...counts.values()].reduce((sum, count) => sum + count - 1, 0),
        slowPlayback: parts.some(part => part.slowPlayback) } : null;
}

function heardPartIdentity(key: string, voice: LearningSpeechVoice) {
    return JSON.stringify([key, voice.voiceId, voice.language, voice.speed]);
}

export function parseLearningHeardParts(value: unknown, exercise: LearningExercise, materials: LearningMaterial[], path: string): LearningHeardPart[] {
    requireLearning(exercise.skill === 'listening', path, 'Listening belongs to a listening exercise');
    const keys = materials.filter(material => exercise.materialIds.includes(material.id)).flatMap(learningSpeechParts).map(part => part.key);
    const parts = learningArray(value, path, (raw, p) => {
        const item = learningRecord(raw, p, ['key', 'voice', 'count', 'slowPlayback']);
        const key = learningText(item.key, `${p}.key`, 160);
        requireLearning(keys.includes(key), p, 'Listening refers to an actual material span');
        return { key, voice: parseLearningVoice(item.voice, `${p}.voice`), count: learningInteger(item.count, `${p}.count`, 1),
            slowPlayback: learningBoolean(item.slowPlayback, `${p}.slowPlayback`) };
    });
    requireLearning(parts.length > 0, path, 'Listening requires a played material span');
    uniqueLearning(parts.map(part => heardPartIdentity(part.key, part.voice)), path);
    return parts;
}

/** Deterministic text spans, not synthetic timing. IDs remain the same across reloads. */
export function learningSpeechParts(material: LearningMaterial) {
    const text = [...material.paragraphs.map(paragraph => paragraph.text).join('\n\n')];
    const parts: { key: string; text: string }[] = [];
    for (let offset = 0; offset < text.length;) {
        let end = Math.min(text.length, offset + 1000);
        if (end < text.length) {
            // Prefer a sentence/paragraph boundary, then a word boundary; never rewrite the text.
            const boundary = (punctuation: boolean) => {
                for (let index = end - 1; index >= offset + 400; index--) {
                    if (punctuation ? /[。！？\n]/u.test(text[index]) || /[.!?]/u.test(text[index]) && /\s/u.test(text[index + 1])
                        : /\s/u.test(text[index])) { return index + 1; }
                }
                return 0;
            };
            end = boundary(true) || boundary(false) || end;
        }
        parts.push({ key: `${material.id}:${offset}`, text: text.slice(offset, end).join('') });
        offset = end;
    }
    return parts;
}
