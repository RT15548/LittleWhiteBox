import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import { learningRecord } from '../../../domains/learning/profile.js';
import { learningProgress } from '../../../domains/learning/progress.js';
import { learningWorkInScope } from '../../../domains/learning/work.js';
import { canReadLearningScope, LEARNING_LIMITS as L, type LearningData, type LearningScope } from '../../../domains/learning/types.js';
import { learningEnum, learningId, learningInteger, requireLearning } from '../../../domains/learning/validation.js';
import { learningProgressOverview } from './progress-overview.js';
import { learningExerciseView, learningTrainingView } from '../application/projection.js';
import { createLearningReading } from './reading.js';

export function readLearning(data: LearningData, language: string, accessOsId: string | null, args: unknown, asOf = new Date().toISOString(), audience: 'teaching' | 'public' = 'teaching', unitKey: 'unit' | 'review' = 'unit', reading = createLearningReading()) {
    const input = learningRecord(args, 'LearningRead', ['section', 'unitId', 'id', 'offset', 'limit']);
    const section = learningEnum(input.section ?? 'overview', 'section', ['overview', 'training', 'unit', 'materials', 'exercises', 'attempts', 'notes', 'listening', 'items', 'review', 'evidence', 'completions']);
    const id = input.id === undefined ? null : learningId(input.id, 'id');
    const offset = input.offset === undefined ? 0 : learningInteger(input.offset, 'offset');
    const limit = input.limit === undefined ? L.readDefault : learningInteger(input.limit, 'limit', 1, L.readMax);
    const profile = data.profiles.find(profile => profile.language === language);
    const readable = (scope: LearningScope) => canReadLearningScope(scope, accessOsId);
    const unitId = input.unitId === undefined ? null : learningId(input.unitId, 'unitId');
    const current = unitId ? [profile?.unit, profile?.review].find(entry => entry?.id === unitId) : profile?.[unitKey];
    requireLearning(!unitId || current && readable(current.scope), 'unitId', 'Select an available lesson or review');
    const unit = learningWorkInScope(current, accessOsId);
    const training = unit ? reading.include(learningTrainingView(unit), unit.scope, [unit.id]) : null;
    if (training) {
        for (const material of training.materials) { reading.include(material, unit!.scope, [material.id]); }
        for (const exercise of training.exercises) { reading.include(exercise, unit!.scope, [exercise.id, ...exercise.itemId ? [exercise.itemId] : []]); }
    }
    if (section === 'training') {
        return { section, data: training, nextOffset: null, omitted: false };
    }
    const attempts = unit?.attempts.map(({ scope, ...attempt }) => reading.include({ ...attempt,
        assessment: unit.assessments.filter(assessment => assessment.attemptId === attempt.id)
            .map(({ scope: assessmentScope, ...assessment }) => reading.include({ ...assessment, shared: assessmentScope.kind === 'public' }, assessmentScope, [attempt.id]))[0] ?? null,
        shared: scope.kind === 'public',
    }, scope, [unit.id, attempt.id, attempt.exerciseId, ...attempt.revisesAttemptId ? [attempt.revisesAttemptId] : []])) ?? [];
    const overview = {
        profile: profile ? { language: profile.language, explanationLanguage: profile.explanationLanguage,
            selfAssessment: profile.selfAssessment, level: profile.level, interests: profile.interests, goal: profile.goal } : null,
        unit: unit ? reading.include({ id: unit.id, title: unit.title, goal: unit.goal, reward: unit.reward, shared: unit.scope.kind === 'public',
            materials: unit.materials.slice(0, L.readDefault).map(material => reading.include({ id: material.id, title: material.title, paragraphs: material.paragraphs.length }, unit.scope, [material.id])),
            exercises: unit.exercises.slice(0, L.readDefault).map(exercise => reading.include({ id: exercise.id, skill: exercise.skill, response: exercise.response.kind }, unit.scope, [exercise.id])),
            materialCount: unit.materials.length, exerciseCount: unit.exercises.length,
            materialsOmitted: unit.materials.length > L.readDefault, exercisesOmitted: unit.exercises.length > L.readDefault,
            attempts: attempts.slice(-L.readDefault).map(attempt => reading.include({ id: attempt.id, exerciseId: attempt.exerciseId, assessed: attempt.assessment !== null }, { kind: 'public' }, [attempt.id, attempt.exerciseId])),
            attemptCount: attempts.length, attemptsOmitted: attempts.length > L.readDefault,
            noteCount: unit.notes?.length ?? 0, listeningCount: unit.listening?.length ?? 0,
            completed: !!profile?.completions.some(completion => completion.unitId === unit.id) }, unit.scope, [unit.id]) : null,
        blockedCurrentUnit: !!current && !unit,
        itemCount: profile?.items.length ?? 0,
        units: [profile?.unit, profile?.review].filter(entry => entry && readable(entry.scope)).map(entry => reading.include({ id: entry!.id, kind: entry!.kind, title: entry!.title }, entry!.scope, [entry!.id])),
        ...(section === 'overview' ? { progress: learningProgressOverview(profile, accessOsId, asOf) } : {}),
    };
    if (section === 'overview') {
        const latest = overview.progress?.latestCompletion;
        const completion = latest && profile?.completions.find(entry => entry.unitId === latest.unitId);
        if (completion) { reading.include(latest, completion.scope, [completion.unitId]); }
        while (overview.unit && overview.unit.attempts.length && [...safePromptJson(overview)].length > L.dataMessage - 512) {
            overview.unit.attempts.shift();
            overview.unit.attemptsOmitted = true;
        }
        return { section, data: overview, nextOffset: null, omitted: !!overview.unit && (overview.unit.attemptsOmitted || overview.unit.materialsOmitted || overview.unit.exercisesOmitted) };
    }
    if (section === 'unit') {
        if (unit) {
            for (const entry of [...unit.materials, ...unit.exercises, ...unit.notes ?? []]) { reading.include(entry, unit.scope, [entry.id]); }
        }
        const result = { section, data: unit ? reading.include({ ...overview.unit,
            ...training, ...(audience === 'public' ? {} : { materials: unit.materials, exercises: unit.exercises }), attempts,
            notes: unit.notes ?? [], listening: unit.listening ?? [], revealed: unit.revealed,
            materialsOmitted: false, exercisesOmitted: false, attemptsOmitted: false }, unit.scope, [unit.id]) : null, nextOffset: null, omitted: false };
        requireLearning([...safePromptJson(result)].length <= L.dataMessage, 'section', 'Read overview, then materials, exercises and attempts in separate pages');
        return result;
    }
    let records: unknown[];
    switch (section) {
        case 'materials': {
            const current = (unit?.materials ?? []).map(material => ({ material, scope: unit!.scope, unitId: unit!.id }));
            const materials = id ? [...current, ...(profile?.items ?? []).flatMap(item => item.evidence
                .filter(evidence => readable(evidence.scope)).flatMap(evidence => evidence.materials.map(material => ({ material, scope: evidence.scope, unitId: evidence.unitId }))))]
                .filter(entry => entry.material.id === id) : current;
            const unique = materials.filter((entry, index) => materials.findIndex(other => other.material.id === entry.material.id) === index)
                .filter(({ material }) => audience !== 'public' || (unit?.materials.some(entry => entry.id === material.id)
                    ? training!.materials.some(entry => entry.id === material.id && !entry.hidden) : material.transcriptRevealed));
            records = unique.flatMap(({ material, scope, unitId }) => material.paragraphs.flatMap(paragraph => {
                const points = [...paragraph.text];
                const parts = [];
                for (let start = 0; start < points.length; start += L.paragraphChunk) {
                    parts.push(reading.include({ materialId: material.id, title: material.title, provenance: material.provenance, transcriptRevealed: material.transcriptRevealed, id: paragraph.id,
                        text: points.slice(start, start + L.paragraphChunk).join(''), textOffset: start, textComplete: start === 0 && points.length <= L.paragraphChunk }, scope, [unitId, material.id]));
                }
                return parts;
            }));
            break;
        }
        case 'exercises': records = (unit?.exercises ?? []).filter(exercise => !id || exercise.id === id).map(exercise => reading.include({
            ...(audience === 'public' ? learningExerciseView(exercise, unit!) : exercise),
            revealed: { answer: unit!.revealed.answers.includes(exercise.id), hint: unit!.revealed.hints.includes(exercise.id) } }, unit!.scope, [unit!.id, exercise.id])); break;
        case 'attempts': records = attempts.filter(attempt => !id || attempt.id === id); break;
        case 'notes': records = (unit?.notes ?? []).filter(note => !id || note.exerciseId === id).map(note => reading.include(note, unit!.scope, [unit!.id, note.id])); break;
        case 'listening': records = (unit?.listening ?? []).filter(record => !id || record.exerciseId === id).map(record => reading.include(record, unit!.scope, [unit!.id, record.exerciseId])); break;
        case 'review':
        case 'items': {
            const items = (profile?.items ?? []).filter(item => !id || item.id === id).map(item => reading.include({
                id: item.id, skill: item.skill, ...learningProgress(item), nextReviewAt: item.schedule?.dueAt ?? null,
                label: readable(item.scope) ? item.label : null,
                evidence: item.evidence.filter(evidence => readable(evidence.scope)).map(evidence => reading.include({ attemptId: evidence.attempt.id, unitId: evidence.unitId }, { kind: 'public' }, [evidence.attempt.id, evidence.unitId])),
            }, readable(item.scope) ? item.scope : { kind: 'public' }, [item.id]));
            records = section === 'review' ? items.filter(item => item.nextReviewAt && Date.parse(item.nextReviewAt) <= Date.parse(asOf))
                .sort((left, right) => left.nextReviewAt!.localeCompare(right.nextReviewAt!) || left.id.localeCompare(right.id)) : items;
            break;
        }
        case 'evidence': records = (profile?.items ?? []).flatMap(item => item.evidence.filter(evidence => (!id || item.id === id) && readable(evidence.scope))
            .map(evidence => reading.include({ itemId: item.id, unitId: evidence.unitId, materials: evidence.materials.map(material => ({ id: material.id, title: material.title })),
                exercise: audience === 'public' ? learningExerciseView(evidence.exercise) : evidence.exercise,
                attempt: { id: evidence.attempt.id, answer: evidence.attempt.answer, submittedAt: evidence.attempt.submittedAt,
                    help: evidence.attempt.help, ...(evidence.attempt.listening ? { listening: evidence.attempt.listening } : {}) },
                assessment: { verdict: evidence.assessment.verdict, understanding: evidence.assessment.understanding,
                    expression: evidence.assessment.expression, guidance: evidence.assessment.guidance },
            }, evidence.scope, [item.id, evidence.unitId, evidence.attempt.id, evidence.exercise.id, ...evidence.materials.map(material => material.id)]))); break;
        case 'completions': records = (profile?.completions ?? []).filter(completion => (!id || completion.unitId === id) && readable(completion.scope))
            .map(completion => reading.include({ unitId: completion.unitId, completedAt: completion.completedAt, summary: completion.summary }, completion.scope, [completion.unitId])); break;
    }
    const page: unknown[] = [];
    for (const record of records.slice(offset, offset + limit)) {
        // Page boundaries never make a valid single exercise/answer unreadable.
        if (page.length && [...safePromptJson([...page, record])].length > L.dataMessage - 256) { break; }
        page.push(record);
    }
    const nextOffset = offset + page.length < records.length ? offset + page.length : null;
    return { section, data: page, nextOffset, omitted: nextOffset !== null, ...(section === 'review' ? { asOf, total: records.length } : {}) };
}
