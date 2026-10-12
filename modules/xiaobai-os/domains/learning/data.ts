import { projectLearningEvidence } from './assessment.js';
import { parseLearningExercise } from './exercise.js';
import { checkLearningAnnotations, parseLearningAssessment, parseLearningAttempt, parseLearningMaterial } from './facts.js';
import { learningRecord, learningText, parseLearningProfile } from './profile.js';
import { learningScheduled, parseLearningSchedule } from './schedule.js';
import { parseLearningListening, parseLearningVoice } from './speech.js';
import { parseLearningSelection } from './notes.js';
import { LEARNING_LIMITS as L, LEARNING_SKILLS, type LearningAssessment, type LearningAttempt, type LearningCompletion, type LearningData, type LearningEvidence, type LearningExercise, type LearningExplanation, type LearningItem, type LearningLanguage, type LearningMaterial, type LearningUnit } from './types.js';
import { combineLearningScope, learningArray, learningEnum, learningId, learningIds, learningInteger, learningTimestamp, parseLearningScope, requireLearning, sameLearningScope, uniqueLearning } from './validation.js';

function parseExplanation(value: unknown, path: string): LearningExplanation {
    const item = learningRecord(value, path, ['materialId', 'paragraphId', 'explanation', 'terms']);
    return { materialId: learningId(item.materialId, `${path}.materialId`), paragraphId: learningId(item.paragraphId, `${path}.paragraphId`),
        explanation: learningText(item.explanation, `${path}.explanation`, L.explanation),
        terms: learningArray(item.terms, `${path}.terms`, (raw, p) => {
            const term = learningRecord(raw, p, ['text', 'note']);
            return { text: learningText(term.text, `${p}.text`, L.name), note: learningText(term.note, `${p}.note`, L.explanation, true) };
        }, L.terms) };
}

const openWriting = (exercise: LearningExercise) => exercise.skill === 'writing' && exercise.response.kind === 'text' && exercise.rule.kind === 'semantic';

/** One article, explained and summarised paragraph by paragraph, then one essay; each draft may be revised once. */
function checkReadingWriting(path: string, materials: LearningMaterial[], exercises: LearningExercise[], explanations: LearningExplanation[],
    attempts: LearningAttempt[], assessments: LearningAssessment[]): void {
    requireLearning(materials.length === 1, `${path}.materials`, 'A reading-writing unit reads exactly one article');
    const article = materials[0];
    const paragraphs = article.paragraphs.map(paragraph => paragraph.id);
    requireLearning(explanations.every(entry => entry.materialId === article.id && paragraphs.includes(entry.paragraphId)),
        `${path}.explanations`, 'Explanations reference article paragraphs');
    uniqueLearning(explanations.map(entry => entry.paragraphId), `${path}.explanations`);
    const summaries = exercises.filter(exercise => exercise.paragraphId !== undefined);
    requireLearning(summaries.every(exercise => openWriting(exercise) && exercise.materialIds.includes(article.id)), `${path}.exercises`, 'Paragraph summaries are open writing on the article');
    uniqueLearning(summaries.map(exercise => exercise.paragraphId!), `${path}.exercises`);
    for (const [index, attempt] of attempts.entries()) {
        if (attempt.revisesAttemptId === undefined) { continue; }
        const draft = attempts.slice(0, index).find(entry => entry.id === attempt.revisesAttemptId);
        const feedback = assessments.find(entry => entry.attemptId === draft?.id);
        requireLearning(draft && draft.exerciseId === attempt.exerciseId
            && feedback, `${path}.attempts`, 'A revision revises an earlier, assessed draft of the same exercise');
        requireLearning(sameLearningScope(combineLearningScope(feedback.scope, attempt.scope), attempt.scope),
            `${path}.attempts`, 'A revision retains the scope of the feedback it uses');
    }
}

export function parseLearningUnit(value: unknown, path = 'unit'): LearningUnit {
    const item = learningRecord(value, path, ['id', 'kind', 'title', 'goal', 'scope', 'originOsId', 'reward', 'materials', 'exercises', 'attempts', 'assessments', 'revealed', 'listening', 'notes',
        'explanations', 'modelEssay', 'skippedRevisionAttemptIds']);
    const kind = learningEnum(item.kind, `${path}.kind`, ['reading-writing', 'review', 'lesson']);
    const materials = learningArray(item.materials, `${path}.materials`, parseLearningMaterial);
    const exercises = learningArray(item.exercises, `${path}.exercises`, (raw, p) => parseLearningExercise(raw, materials, p));
    requireLearning(exercises.length > 0, `${path}.exercises`, 'A unit needs at least one exercise');
    const attempts = learningArray(item.attempts, `${path}.attempts`, (raw, p) => parseLearningAttempt(raw, exercises, materials, p));
    const assessments = learningArray(item.assessments, `${path}.assessments`, parseLearningAssessment);
    for (const records of [materials, exercises, attempts]) { uniqueLearning(records.map(record => record.id), path); }
    uniqueLearning(assessments.map(assessment => assessment.attemptId), `${path}.assessments`);
    const scope = parseLearningScope(item.scope, `${path}.scope`);
    const originOsId = learningId(item.originOsId, `${path}.originOsId`);
    // Coursework may be shared, then edited in another story. Reward origin is immutable;
    // access follows the current content, while each saved answer retains its own scope.
    const rw = kind === 'reading-writing';
    requireLearning(exercises.every(exercise => rw || exercise.paragraphId === undefined), `${path}.exercises`, 'Only reading-writing summaries name a paragraph');
    requireLearning(exercises.every(exercise => (exercise.itemId !== undefined) === (kind === 'review')), `${path}.exercises`, 'Review exercises, and only they, name the item they review');
    requireLearning(rw || attempts.every(attempt => attempt.revisesAttemptId === undefined), `${path}.attempts`, 'Only reading-writing drafts are revised');
    if (kind === 'review') {
        uniqueLearning(exercises.map(exercise => exercise.itemId!), `${path}.exercises`);
    }
    for (const assessment of assessments) {
        const attempt = attempts.find(attempt => attempt.id === assessment.attemptId);
        requireLearning(attempt, path, 'Assessment must reference a saved attempt');
        requireLearning(sameLearningScope(combineLearningScope(attempt.scope, assessment.scope), assessment.scope), path, 'Assessment must retain the source scope');
        checkLearningAnnotations(assessment, attempt, `${path}.assessments`);
        requireLearning(assessment.signal === undefined || kind === 'review', `${path}.assessments`, 'Only review answers carry a recall signal');
        if (assessment.resolvedAnnotationIds !== undefined) {
            const draft = assessments.find(entry => entry.attemptId === attempt.revisesAttemptId);
            requireLearning(draft && assessment.resolvedAnnotationIds.every(id => draft.annotations?.some(annotation => annotation.id === id)),
                `${path}.assessments`, 'Resolved annotations belong to the revised draft');
        }
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
    requireLearning([item.explanations, item.modelEssay, item.skippedRevisionAttemptIds].every(field => (field !== undefined) === rw), path,
        'Reading-writing units, and only they, carry explanations, a model essay and the revision choice');
    let writing: Pick<LearningUnit, 'explanations' | 'modelEssay' | 'skippedRevisionAttemptIds'> = {};
    if (rw) {
        const explanations = learningArray(item.explanations, `${path}.explanations`, parseExplanation);
        checkReadingWriting(path, materials, exercises, explanations, attempts, assessments);
        const essay = item.modelEssay === null ? null : learningRecord(item.modelEssay, `${path}.modelEssay`, ['text', 'level']);
        const skippedRevisionAttemptIds = learningIds(item.skippedRevisionAttemptIds, `${path}.skippedRevisionAttemptIds`);
        requireLearning(skippedRevisionAttemptIds.every(id => attempts.some(attempt => attempt.id === id)
            && assessments.some(assessment => assessment.attemptId === id)), path, 'A skipped revision belongs to a saved answer with feedback');
        writing = { explanations, modelEssay: essay && { text: learningText(essay.text, `${path}.modelEssay.text`, L.materialText),
            level: learningText(essay.level, `${path}.modelEssay.level`, L.name) },
        skippedRevisionAttemptIds };
    }
    return { id: learningId(item.id, `${path}.id`), kind, title: learningText(item.title, `${path}.title`, L.name),
        goal: learningText(item.goal, `${path}.goal`, L.goal), scope, originOsId,
        reward: { tier: learningEnum(reward.tier, `${path}.reward.tier`, ['short', 'regular', 'deep']), amount: learningInteger(reward.amount, `${path}.reward.amount`, 1) },
        materials, exercises, attempts, assessments, revealed: { answers, hints },
        ...(notes ? { notes } : {}),
        ...(item.listening === undefined ? {} : { listening: parseLearningListening(item.listening, exercises, materials, `${path}.listening`) }),
        ...writing };
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
    checkLearningAnnotations(assessment, attempt, `${path}.assessment`);
    return { unitId: learningId(item.unitId, `${path}.unitId`), scope, exercise, materials, attempt, assessment };
}

function parseItem(value: unknown, path: string): LearningItem {
    const item = learningRecord(value, path, ['id', 'label', 'scope', 'skill', 'evidence', 'schedule']);
    const evidence = learningArray(item.evidence, `${path}.evidence`, parseEvidence, L.evidence);
    uniqueLearning(evidence.map(entry => entry.attempt.id), `${path}.evidence`);
    const skill = learningEnum(item.skill, `${path}.skill`, LEARNING_SKILLS);
    const scheduled = learningScheduled(skill);
    requireLearning((item.schedule !== undefined) === scheduled, `${path}.schedule`, 'Grammar and vocabulary items, and only they, keep a review schedule');
    // A grammar point or word can be met in any practice (a summary, an essay, a bookmark); other skills are shown by their own exercises.
    requireLearning(scheduled || evidence.every(entry => entry.exercise.skill === skill), path, 'Evidence must train the item skill');
    return { id: learningId(item.id, `${path}.id`), label: learningText(item.label, `${path}.label`, L.goal),
        scope: parseLearningScope(item.scope, `${path}.scope`), skill, evidence,
        ...(scheduled ? { schedule: parseLearningSchedule(item.schedule, `${path}.schedule`) } : {}) };
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
    const item = learningRecord(value, path, ['language', 'explanationLanguage', 'selfAssessment', 'level', 'interests', 'goal', 'unit', 'review', 'items', 'completions', 'voice']);
    const { unit: rawUnit, review: rawReview, items: rawItems, completions: rawCompletions, voice, ...rawProfile } = item;
    const profile = parseLearningProfile(rawProfile, path);
    const unit = rawUnit === null ? null : parseLearningUnit(rawUnit, `${path}.unit`);
    const review = rawReview === null ? null : parseLearningUnit(rawReview, `${path}.review`);
    requireLearning(unit?.kind !== 'review', `${path}.unit`, 'A review belongs in the review slot');
    requireLearning(!review || review.kind === 'review', `${path}.review`, 'The review slot holds a review unit');
    const units = [unit, review].filter(entry => entry !== null);
    uniqueLearning(units.map(entry => entry.id), path);
    uniqueLearning(units.flatMap(entry => entry.attempts.map(attempt => attempt.id)), path);
    const items = learningArray(rawItems, `${path}.items`, parseItem);
    const completions = learningArray(rawCompletions, `${path}.completions`, parseCompletion);
    uniqueLearning(items.map(entry => entry.id), `${path}.items`);
    uniqueLearning(completions.map(entry => entry.unitId), `${path}.completions`);
    const allEvidence = items.flatMap(entry => entry.evidence);
    const seen = new Map<string, string>();
    for (const evidence of allEvidence) {
        const serialized = JSON.stringify(evidence);
        requireLearning(!seen.has(evidence.attempt.id) || seen.get(evidence.attempt.id) === serialized, path, 'Shared evidence must retain the same original facts');
        seen.set(evidence.attempt.id, serialized);
    }
    // A representative copy of current evidence is not a second editable source of truth.
    for (const evidence of allEvidence) {
        const source = units.find(entry => entry.id === evidence.unitId);
        if (!source) { continue; }
        const current = source.attempts.some(entry => entry.id === evidence.attempt.id) ? projectLearningEvidence(source, evidence.attempt.id) : null;
        requireLearning(JSON.stringify(current) === JSON.stringify(evidence), path, 'Evidence must match the current saved attempt, exercise and feedback');
    }
    const assessments = [...units.flatMap(entry => entry.assessments), ...allEvidence.map(entry => entry.assessment)];
    for (const annotation of assessments.flatMap(entry => entry.annotations ?? [])) {
        requireLearning(annotation.itemId === undefined || items.some(entry => entry.id === annotation.itemId && entry.skill === annotation.category),
            path, 'An annotation links an item of its own grammar or vocabulary book');
    }
    requireLearning((review?.exercises ?? []).every(exercise => items.some(entry => entry.id === exercise.itemId && entry.schedule)),
        `${path}.review`, 'Review exercises review saved grammar or vocabulary items');
    for (const source of units) {
        const completed = completions.find(entry => entry.unitId === source.id);
        if (!completed) { continue; }
        requireLearning(completed.reward.amount === source.reward.amount && completed.reward.originOsId === source.originOsId,
            path, 'Completed reward must match the published unit');
        // Later coursework edits do not rewrite an already earned completion's provenance.
        for (const attempt of source.attempts.filter(entry => completed.attemptIds.includes(entry.id))) {
            requireLearning(sameLearningScope(combineLearningScope(attempt.scope, completed.scope), completed.scope),
                path, 'Completion must retain its original answer scope');
        }
    }
    return { ...profile, unit, review, items, completions, ...(voice === undefined ? {} : { voice: parseLearningVoice(voice, `${path}.voice`) }) };
}

export function parseLearningData(value: unknown): LearningData {
    const data = learningRecord(value, 'learning', ['profiles']);
    const profiles = learningArray(data.profiles, 'profiles', parseLanguage);
    uniqueLearning(profiles.map(profile => profile.language), 'profiles');
    return { profiles };
}
