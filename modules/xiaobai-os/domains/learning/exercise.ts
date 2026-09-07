import { learningRecord, learningText } from './profile.js';
import { LEARNING_LIMITS as L, LEARNING_SKILLS, type LearningAnswer, type LearningExercise, type LearningMaterial, type LearningOption, type LearningResponse, type LearningRule } from './types.js';
import { learningArray, learningBoolean, learningEnum, learningId, learningIds, requireLearning, uniqueLearning } from './validation.js';

function options(value: unknown, path: string, max: number, min = 1): LearningOption[] {
    const values = learningArray(value, path, (raw, p) => {
        const item = learningRecord(raw, p, ['id', 'text']);
        return { id: learningId(item.id, `${p}.id`), text: learningText(item.text, `${p}.text`, L.prompt) };
    }, max);
    requireLearning(values.length >= min, path, `Expected at least ${min} entries`);
    uniqueLearning(values.map(item => item.id), path);
    return values;
}

function parseResponse(value: unknown, path: string): LearningResponse {
    const item = learningRecord(value, path, ['kind', 'options', 'multiple', 'left', 'right', 'slots', 'materialId']);
    const kind = learningEnum(item.kind, `${path}.kind`, ['choice', 'order', 'match', 'evidence', 'gaps', 'text']);
    const keys: Record<typeof kind, string[]> = {
        choice: ['kind', 'options', 'multiple'], order: ['kind', 'options'], match: ['kind', 'left', 'right'],
        evidence: ['kind', 'materialId'], gaps: ['kind', 'slots'], text: ['kind'],
    };
    learningRecord(value, path, keys[kind]);
    switch (kind) {
        case 'choice': return { kind, options: options(item.options, `${path}.options`, L.options, 2), multiple: learningBoolean(item.multiple, `${path}.multiple`) };
        case 'order': return { kind, options: options(item.options, `${path}.options`, L.pairs, 2) };
        case 'match': {
            const left = options(item.left, `${path}.left`, L.pairs, 2);
            const right = options(item.right, `${path}.right`, L.pairs, 2);
            requireLearning(left.length === right.length, path, 'Matching sides must have equal lengths');
            return { kind, left, right };
        }
        case 'evidence': return { kind, materialId: learningId(item.materialId, `${path}.materialId`) };
        case 'gaps': return { kind, slots: options(item.slots, `${path}.slots`, L.gaps) };
        case 'text': return { kind };
    }
}

export function parseLearningAnswer(value: unknown, response: LearningResponse, materials: LearningMaterial[], path = 'answer'): LearningAnswer {
    const item = learningRecord(value, path, ['kind', ...(response.kind === 'match' ? ['pairs'] : response.kind === 'gaps' ? ['values'] : response.kind === 'text' ? ['text'] : ['ids'])]);
    requireLearning(item.kind === response.kind, `${path}.kind`, 'Answer form must match the exercise');
    const refs = (ids: string[], allowed: string[], exact: boolean) => {
        requireLearning(ids.length > 0 && ids.every(id => allowed.includes(id)) && (!exact || ids.length === allowed.length), path, 'Use the IDs supplied by this exercise');
    };
    if (response.kind === 'text') { return { kind: 'text', text: learningText(item.text, `${path}.text`, L.answer) }; }
    if (response.kind === 'gaps') {
        const values = learningArray(item.values, `${path}.values`, (raw, p) => {
            const value = learningRecord(raw, p, ['id', 'text']);
            return { id: learningId(value.id, `${p}.id`), text: learningText(value.text, `${p}.text`, L.answer) };
        }, L.gaps);
        uniqueLearning(values.map(value => value.id), path);
        refs(values.map(value => value.id), response.slots.map(slot => slot.id), true);
        requireLearning(values.reduce((sum, value) => sum + [...value.text].length, 0) <= L.answer, path, `Combined answer is at most ${L.answer} code points`);
        return { kind: 'gaps', values: response.slots.map(slot => values.find(value => value.id === slot.id)!) };
    }
    if (response.kind === 'match') {
        const pairs = learningArray(item.pairs, `${path}.pairs`, (raw, p) => {
            const value = learningRecord(raw, p, ['left', 'right']);
            return { left: learningId(value.left, `${p}.left`), right: learningId(value.right, `${p}.right`) };
        }, L.pairs);
        uniqueLearning(pairs.map(pair => pair.left), path);
        uniqueLearning(pairs.map(pair => pair.right), path);
        refs(pairs.map(pair => pair.left), response.left.map(option => option.id), true);
        refs(pairs.map(pair => pair.right), response.right.map(option => option.id), true);
        return { kind: 'match', pairs: response.left.map(option => pairs.find(pair => pair.left === option.id)!) };
    }
    const ids = learningIds(item.ids, `${path}.ids`);
    const allowed = response.kind === 'evidence'
        ? materials.find(material => material.id === response.materialId)?.paragraphs.map(paragraph => paragraph.id) ?? []
        : response.options.map(option => option.id);
    refs(ids, allowed, response.kind === 'order');
    if (response.kind === 'choice' && !response.multiple) { requireLearning(ids.length === 1, path, 'Select one answer'); }
    return { kind: response.kind, ids: response.kind === 'order' ? ids : allowed.filter(id => ids.includes(id)) };
}

function parseRule(value: unknown, response: LearningResponse, materials: LearningMaterial[], path: string): LearningRule {
    const item = learningRecord(value, path, ['kind', 'answer', 'accepted', 'caseSensitive', 'punctuationSensitive', 'explanation']);
    if (item.kind === 'semantic') { learningRecord(value, path, ['kind']); return { kind: 'semantic' }; }
    const explanation = learningText(item.explanation, `${path}.explanation`, L.explanation);
    if (item.kind === 'exact') {
        learningRecord(value, path, ['kind', 'answer', 'explanation']);
        requireLearning(response.kind !== 'text' && response.kind !== 'gaps', path, 'Text requires semantic evaluation; gaps use accepted forms');
        return { kind: 'exact', answer: parseLearningAnswer(item.answer, response, materials, `${path}.answer`), explanation };
    }
    requireLearning(item.kind === 'gaps' && response.kind === 'gaps', path, 'Expected a compatible evaluation rule');
    learningRecord(value, path, ['kind', 'accepted', 'caseSensitive', 'punctuationSensitive', 'explanation']);
    const accepted = learningArray(item.accepted, `${path}.accepted`, (raw, p) => {
        const entry = learningRecord(raw, p, ['id', 'forms']);
        const forms = learningArray(entry.forms, `${p}.forms`, (form, fp) => learningText(form, fp, L.answer), L.acceptedForms);
        requireLearning(forms.length > 0, p, 'Provide at least one accepted form');
        return { id: learningId(entry.id, `${p}.id`), forms };
    }, L.gaps);
    uniqueLearning(accepted.map(slot => slot.id), path);
    requireLearning(accepted.length === response.slots.length && accepted.every(slot => response.slots.some(value => value.id === slot.id)), path, 'Provide accepted forms for every gap');
    return { kind: 'gaps', accepted, caseSensitive: learningBoolean(item.caseSensitive, `${path}.caseSensitive`),
        punctuationSensitive: learningBoolean(item.punctuationSensitive, `${path}.punctuationSensitive`), explanation };
}

export function parseLearningExercise(value: unknown, materials: LearningMaterial[], path = 'exercise'): LearningExercise {
    const item = learningRecord(value, path, ['id', 'skill', 'materialIds', 'prompt', 'response', 'rule', 'hint']);
    const materialIds = learningIds(item.materialIds, `${path}.materialIds`);
    requireLearning(materialIds.every(id => materials.some(material => material.id === id)), `${path}.materialIds`, 'Referenced material must exist');
    const referenced = materials.filter(material => materialIds.includes(material.id));
    const response = parseResponse(item.response, `${path}.response`);
    if (response.kind === 'evidence') { requireLearning(materialIds.includes(response.materialId), path, 'Evidence selection requires the referenced material'); }
    const skill = learningEnum(item.skill, `${path}.skill`, LEARNING_SKILLS);
    if (skill === 'listening') { requireLearning(materialIds.length > 0, path, 'Listening requires a saved material'); }
    if (skill === 'writing') { requireLearning(response.kind === 'text', path, 'Writing evidence requires a written response'); }
    return { id: learningId(item.id, `${path}.id`), skill, materialIds,
        prompt: learningText(item.prompt, `${path}.prompt`, L.prompt), response,
        rule: parseRule(item.rule, response, referenced, `${path}.rule`), hint: learningText(item.hint, `${path}.hint`, L.explanation, true) };
}

export function objectiveLearningVerdict(exercise: LearningExercise, answer: LearningAnswer): 'correct' | 'incorrect' | null {
    const rule = exercise.rule;
    if (rule.kind === 'semantic') { return null; }
    if (rule.kind === 'exact') { return JSON.stringify(rule.answer) === JSON.stringify(answer) ? 'correct' : 'incorrect'; }
    requireLearning(answer.kind === 'gaps', 'answer', 'Expected gap answers');
    const normalize = (text: string) => {
        let result = text.trim();
        if (!rule.caseSensitive) { result = result.toLowerCase(); }
        if (!rule.punctuationSensitive) { result = result.replace(/\p{P}/gu, ''); }
        return result;
    };
    return answer.values.every(value => rule.accepted.find(slot => slot.id === value.id)!.forms.some(form => normalize(form) === normalize(value.text))) ? 'correct' : 'incorrect';
}
