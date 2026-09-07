import { parseLearningExercise } from './exercise.js';
import { parseLearningAssessment, parseLearningAttempt, parseLearningMaterial } from './facts.js';
import { learningRecord, learningText, parseLearningProfile } from './profile.js';
import { parseLearningListening, parseLearningVoice } from './speech.js';
import { parseLearningSelection } from './notes.js';
import { LEARNING_LIMITS as L, LEARNING_SKILLS, type LearningCompletion, type LearningData, type LearningEvidence, type LearningItem, type LearningLanguage, type LearningUnit } from './types.js';
import { combineLearningScope, learningArray, learningEnum, learningId, learningIds, learningInteger, learningTimestamp, parseLearningScope, requireLearning, sameLearningScope, uniqueLearning } from './validation.js';

export function parseLearningUnit(value: unknown, path = 'unit'): LearningUnit {
    const item = learningRecord(value, path, ['id', 'title', 'goal', 'scope', 'originOsId', 'reward', 'materials', 'exercises', 'attempts', 'assessments', 'revealed', 'listening', 'notes']);
    const materials = learningArray(item.materials, `${path}.materials`, parseLearningMaterial);
    const exercises = learningArray(item.exercises, `${path}.exercises`, (raw, p) => parseLearningExercise(raw, materials, p));
    requireLearning(exercises.length > 0, `${path}.exercises`, 'A unit needs at least one exercise');
    const attempts = learningArray(item.attempts, `${path}.attempts`, (raw, p) => parseLearningAttempt(raw, exercises, materials, p));
    const assessments = learningArray(item.assessments, `${path}.assessments`, parseLearningAssessment);
    for (const records of [materials, exercises, attempts]) { uniqueLearning(records.map(record => record.id), path); }
    uniqueLearning(assessments.map(assessment => assessment.attemptId), `${path}.assessments`);
    const scope = parseLearningScope(item.scope, `${path}.scope`);
    const originOsId = learningId(item.originOsId, `${path}.originOsId`);
    if (scope.kind === 'story') { requireLearning(scope.osId === originOsId, path, 'Story unit must belong to its source story'); }
    for (const assessment of assessments) {
        const attempt = attempts.find(attempt => attempt.id === assessment.attemptId);
        requireLearning(attempt, path, 'Assessment must reference a saved attempt');
        requireLearning(sameLearningScope(combineLearningScope(attempt.scope, assessment.scope), assessment.scope), path, 'Assessment must retain the source scope');
    }
    for (const attempt of attempts) {
        requireLearning(sameLearningScope(combineLearningScope(scope, attempt.scope), attempt.scope), path, 'Attempt must retain the source scope');
    }
    const reward = learningRecord(item.reward, `${path}.reward`, ['tier', 'amount']);
    const revealed = learningRecord(item.revealed, `${path}.revealed`, ['answers', 'hints']);
    const answers = learningIds(revealed.answers, `${path}.revealed.answers`);
    const hints = learningIds(revealed.hints, `${path}.revealed.hints`);
    requireLearning([...answers, ...hints].every(id => exercises.some(exercise => exercise.id === id)), path, 'Revealed content must belong to this unit');
    const notes = item.notes === undefined ? undefined : learningArray(item.notes, `${path}.notes`, raw => {
        const note = learningRecord(raw, 'note', ['id', 'text', 'exerciseId', 'selection']);
        const exerciseId = learningId(note.exerciseId, 'exerciseId');
        requireLearning(exercises.some(exercise => exercise.id === exerciseId), 'note', 'Notes belong to a current exercise');
        return { id: learningId(note.id, 'noteId'), text: learningText(note.text, 'text', 4000), exerciseId,
            selection: note.selection === null ? null : parseLearningSelection(note.selection, materials) };
    }, 12);
    if (notes) { uniqueLearning(notes.map(note => note.id), 'notes'); }
    return { id: learningId(item.id, `${path}.id`), title: learningText(item.title, `${path}.title`, L.name),
        goal: learningText(item.goal, `${path}.goal`, L.goal), scope, originOsId,
        reward: { tier: learningEnum(reward.tier, `${path}.reward.tier`, ['short', 'regular', 'deep']), amount: learningInteger(reward.amount, `${path}.reward.amount`, 1) },
        materials, exercises, attempts, assessments, revealed: { answers, hints },
        ...(notes ? { notes } : {}),
        ...(item.listening === undefined ? {} : { listening: parseLearningListening(item.listening, exercises, materials, `${path}.listening`) }) };
}

function parseEvidence(value: unknown, path: string): LearningEvidence {
    const item = learningRecord(value, path, ['unitId', 'scope', 'exercise', 'materials', 'attempt', 'assessment']);
    const materials = learningArray(item.materials, `${path}.materials`, parseLearningMaterial);
    uniqueLearning(materials.map(material => material.id), path);
    const exercise = parseLearningExercise(item.exercise, materials, `${path}.exercise`);
    const attempt = parseLearningAttempt(item.attempt, [exercise], materials, `${path}.attempt`);
    const assessment = parseLearningAssessment(item.assessment, `${path}.assessment`);
    const scope = parseLearningScope(item.scope, `${path}.scope`);
    requireLearning(assessment.attemptId === attempt.id && sameLearningScope(scope, assessment.scope), path, 'Evidence must match its attempt and assessment scope');
    requireLearning(sameLearningScope(combineLearningScope(attempt.scope, scope), scope), path, 'Evidence must retain the attempt scope');
    return { unitId: learningId(item.unitId, `${path}.unitId`), scope, exercise, materials, attempt, assessment };
}

function parseItem(value: unknown, path: string): LearningItem {
    const item = learningRecord(value, path, ['id', 'label', 'scope', 'skill', 'evidence']);
    const evidence = learningArray(item.evidence, `${path}.evidence`, parseEvidence, L.evidence);
    uniqueLearning(evidence.map(entry => entry.attempt.id), `${path}.evidence`);
    const skill = learningEnum(item.skill, `${path}.skill`, LEARNING_SKILLS);
    requireLearning(evidence.every(entry => entry.exercise.skill === skill), path, 'Evidence must train the item skill');
    return { id: learningId(item.id, `${path}.id`), label: learningText(item.label, `${path}.label`, L.goal),
        scope: parseLearningScope(item.scope, `${path}.scope`), skill, evidence };
}

function parseCompletion(value: unknown, path: string): LearningCompletion {
    const item = learningRecord(value, path, ['unitId', 'completedAt', 'summary', 'scope', 'attemptIds', 'reward', 'receipt']);
    const reward = learningRecord(item.reward, `${path}.reward`, ['originOsId', 'amount', 'title', 'note']);
    const attemptIds = learningIds(item.attemptIds, `${path}.attemptIds`);
    requireLearning(attemptIds.length > 0, path, 'Completion needs real learning evidence');
    const receipt = item.receipt === undefined ? undefined : learningRecord(item.receipt, `${path}.receipt`, ['transactionId', 'receivedAt']);
    return { unitId: learningId(item.unitId, `${path}.unitId`), completedAt: learningTimestamp(item.completedAt, `${path}.completedAt`),
        summary: learningText(item.summary, `${path}.summary`, L.explanation), scope: parseLearningScope(item.scope, `${path}.scope`), attemptIds,
        ...(receipt ? { receipt: { transactionId: learningId(receipt.transactionId, `${path}.receipt.transactionId`),
            receivedAt: learningInteger(receipt.receivedAt, `${path}.receipt.receivedAt`, 0) } } : {}),
        reward: { originOsId: learningId(reward.originOsId, `${path}.reward.originOsId`), amount: learningInteger(reward.amount, `${path}.reward.amount`, 1),
            title: learningText(reward.title, `${path}.reward.title`, L.name), note: learningText(reward.note, `${path}.reward.note`, L.goal) } };
}

function parseLanguage(value: unknown, path: string): LearningLanguage {
    const item = learningRecord(value, path, ['language', 'explanationLanguage', 'selfAssessment', 'goal', 'unit', 'items', 'completions', 'voice']);
    const { unit: rawUnit, items: rawItems, completions: rawCompletions, voice, ...rawProfile } = item;
    const profile = parseLearningProfile(rawProfile, path);
    const unit = rawUnit === null ? null : parseLearningUnit(rawUnit, `${path}.unit`);
    const items = learningArray(rawItems, `${path}.items`, parseItem);
    const completions = learningArray(rawCompletions, `${path}.completions`, parseCompletion);
    uniqueLearning(items.map(entry => entry.id), `${path}.items`);
    uniqueLearning(completions.map(entry => entry.unitId), `${path}.completions`);
    const seen = new Map<string, string>();
    for (const evidence of items.flatMap(entry => entry.evidence)) {
        const serialized = JSON.stringify(evidence);
        requireLearning(!seen.has(evidence.attempt.id) || seen.get(evidence.attempt.id) === serialized, path, 'Shared evidence must retain the same original facts');
        seen.set(evidence.attempt.id, serialized);
    }
    // A representative copy of current evidence is not a second editable source of truth.
    for (const evidence of items.flatMap(entry => entry.evidence)) {
        if (evidence.unitId !== unit?.id) { continue; }
        const attempt = unit.attempts.find(entry => entry.id === evidence.attempt.id);
        const assessment = unit.assessments.find(entry => entry.attemptId === evidence.attempt.id);
        const exercise = unit.exercises.find(entry => entry.id === evidence.exercise.id);
        const materials = unit.materials.filter(entry => exercise?.materialIds.includes(entry.id));
        requireLearning(JSON.stringify({ attempt, assessment, exercise, materials }) === JSON.stringify({
            attempt: evidence.attempt, assessment: evidence.assessment, exercise: evidence.exercise, materials: evidence.materials,
        }), path, 'Evidence must match the current saved attempt, exercise and feedback');
    }
    const completed = completions.find(entry => entry.unitId === unit?.id);
    if (unit && completed) {
        requireLearning(completed.reward.amount === unit.reward.amount && completed.reward.originOsId === unit.originOsId,
            path, 'Completed reward must match the published unit');
        requireLearning(sameLearningScope(combineLearningScope(unit.scope, completed.scope), completed.scope),
            path, 'Completion must retain the lesson scope');
    }
    return { ...profile, unit, items, completions, ...(voice === undefined ? {} : { voice: parseLearningVoice(voice, `${path}.voice`) }) };
}

export function parseLearningData(value: unknown): LearningData {
    const data = learningRecord(value, 'learning', ['profiles']);
    const profiles = learningArray(data.profiles, 'profiles', parseLanguage);
    uniqueLearning(profiles.map(profile => profile.language), 'profiles');
    return { profiles };
}
