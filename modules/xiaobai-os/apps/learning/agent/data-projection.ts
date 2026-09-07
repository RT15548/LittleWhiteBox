import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import { learningRecord } from '../../../domains/learning/profile.js';
import { learningProgress } from '../../../domains/learning/progress.js';
import { canReadLearningScope, LEARNING_LIMITS as L, type LearningData, type LearningScope } from '../../../domains/learning/types.js';
import { learningEnum, learningId, learningInteger, requireLearning } from '../../../domains/learning/validation.js';
import { learningProgressOverview } from './progress-overview.js';

export function readLearning(data: LearningData, language: string, accessOsId: string | null, args: unknown, asOf = new Date().toISOString()) {
    const input = learningRecord(args, 'LearningRead', ['section', 'id', 'offset', 'limit']);
    const section = learningEnum(input.section ?? 'overview', 'section', ['overview', 'unit', 'materials', 'exercises', 'attempts', 'notes', 'listening', 'items', 'review', 'evidence', 'completions']);
    const id = input.id === undefined ? null : learningId(input.id, 'id');
    const offset = input.offset === undefined ? 0 : learningInteger(input.offset, 'offset');
    const limit = input.limit === undefined ? L.readDefault : learningInteger(input.limit, 'limit', 1, L.readMax);
    const profile = data.profiles.find(profile => profile.language === language);
    const readable = (scope: LearningScope) => canReadLearningScope(scope, accessOsId);
    const unit = profile?.unit && readable(profile.unit.scope) ? profile.unit : null;
    const attempts = unit?.attempts.filter(attempt => readable(attempt.scope)).map(({ scope, ...attempt }) => ({ ...attempt,
        assessment: unit.assessments.filter(assessment => assessment.attemptId === attempt.id && readable(assessment.scope))
            .map(({ scope: assessmentScope, ...assessment }) => ({ ...assessment, shared: assessmentScope.kind === 'public' }))[0] ?? null,
        shared: scope.kind === 'public',
    })) ?? [];
    const overview = {
        profile: profile ? { language: profile.language, explanationLanguage: profile.explanationLanguage, selfAssessment: profile.selfAssessment, goal: profile.goal } : null,
        unit: unit ? { id: unit.id, title: unit.title, goal: unit.goal, reward: unit.reward, shared: unit.scope.kind === 'public',
            materials: unit.materials.slice(0, L.readDefault).map(material => ({ id: material.id, title: material.title, paragraphs: material.paragraphs.length })),
            exercises: unit.exercises.slice(0, L.readDefault).map(exercise => ({ id: exercise.id, skill: exercise.skill, response: exercise.response.kind })),
            materialCount: unit.materials.length, exerciseCount: unit.exercises.length,
            materialsOmitted: unit.materials.length > L.readDefault, exercisesOmitted: unit.exercises.length > L.readDefault,
            attempts: attempts.slice(-L.readDefault).map(attempt => ({ id: attempt.id, exerciseId: attempt.exerciseId, assessed: attempt.assessment !== null })),
            attemptCount: attempts.length, attemptsOmitted: attempts.length > L.readDefault,
            noteCount: unit.notes?.length ?? 0, listeningCount: unit.listening?.length ?? 0,
            completed: !!profile?.completions.some(completion => completion.unitId === unit.id) } : null,
        blockedCurrentUnit: !!profile?.unit && !unit,
        itemCount: profile?.items.length ?? 0,
        ...(section === 'overview' ? { progress: learningProgressOverview(profile, accessOsId, asOf) } : {}),
    };
    if (section === 'overview') {
        while (overview.unit && overview.unit.attempts.length && [...safePromptJson(overview)].length > L.dataMessage - 512) {
            overview.unit.attempts.shift();
            overview.unit.attemptsOmitted = true;
        }
        return { section, data: overview, nextOffset: null, omitted: !!overview.unit && (overview.unit.attemptsOmitted || overview.unit.materialsOmitted || overview.unit.exercisesOmitted) };
    }
    if (section === 'unit') {
        const result = { section, data: unit ? { ...overview.unit, materials: unit.materials, exercises: unit.exercises, attempts,
            notes: unit.notes ?? [], listening: unit.listening ?? [], revealed: unit.revealed,
            materialsOmitted: false, exercisesOmitted: false, attemptsOmitted: false } : null, nextOffset: null, omitted: false };
        requireLearning([...safePromptJson(result)].length <= L.dataMessage, 'section', 'Read overview, then materials, exercises and attempts in separate pages');
        return result;
    }
    let records: unknown[];
    switch (section) {
        case 'materials': {
            const materials = id ? [...(unit?.materials ?? []), ...(profile?.items ?? []).flatMap(item => item.evidence
                .filter(evidence => readable(evidence.scope)).flatMap(evidence => evidence.materials))].filter(material => material.id === id) : unit?.materials ?? [];
            const unique = materials.filter((material, index) => materials.findIndex(other => other.id === material.id) === index);
            records = unique.flatMap(material => material.paragraphs.flatMap(paragraph => {
                const points = [...paragraph.text];
                const parts = [];
                for (let start = 0; start < points.length; start += L.paragraphChunk) {
                    parts.push({ materialId: material.id, title: material.title, provenance: material.provenance, transcriptRevealed: material.transcriptRevealed, id: paragraph.id,
                        text: points.slice(start, start + L.paragraphChunk).join(''), textOffset: start, textComplete: start === 0 && points.length <= L.paragraphChunk });
                }
                return parts;
            }));
            break;
        }
        case 'exercises': records = (unit?.exercises ?? []).filter(exercise => !id || exercise.id === id).map(exercise => ({ ...exercise,
            revealed: { answer: unit!.revealed.answers.includes(exercise.id), hint: unit!.revealed.hints.includes(exercise.id) } })); break;
        case 'attempts': records = attempts.filter(attempt => !id || attempt.id === id); break;
        case 'notes': records = (unit?.notes ?? []).filter(note => !id || note.exerciseId === id); break;
        case 'listening': records = (unit?.listening ?? []).filter(record => !id || record.exerciseId === id); break;
        case 'review':
        case 'items': {
            const items = (profile?.items ?? []).filter(item => !id || item.id === id).map(item => ({
                id: item.id, skill: item.skill, ...learningProgress(item),
                label: readable(item.scope) ? item.label : null,
                evidence: item.evidence.filter(evidence => readable(evidence.scope)).map(evidence => ({ attemptId: evidence.attempt.id, unitId: evidence.unitId })),
            }));
            records = section === 'review' ? items.filter(item => item.nextReviewAt && Date.parse(item.nextReviewAt) <= Date.parse(asOf))
                .sort((left, right) => left.nextReviewAt!.localeCompare(right.nextReviewAt!) || left.id.localeCompare(right.id)) : items;
            break;
        }
        case 'evidence': records = (profile?.items ?? []).flatMap(item => item.evidence.filter(evidence => (!id || item.id === id) && readable(evidence.scope))
            .map(evidence => ({ itemId: item.id, unitId: evidence.unitId, materials: evidence.materials.map(material => ({ id: material.id, title: material.title })),
                exercise: evidence.exercise,
                attempt: { id: evidence.attempt.id, answer: evidence.attempt.answer, submittedAt: evidence.attempt.submittedAt,
                    help: evidence.attempt.help, ...(evidence.attempt.listening ? { listening: evidence.attempt.listening } : {}) },
                assessment: { verdict: evidence.assessment.verdict, understanding: evidence.assessment.understanding,
                    expression: evidence.assessment.expression, guidance: evidence.assessment.guidance },
            }))); break;
        case 'completions': records = (profile?.completions ?? []).filter(completion => (!id || completion.unitId === id) && readable(completion.scope))
            .map(completion => ({ unitId: completion.unitId, completedAt: completion.completedAt, summary: completion.summary })); break;
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
