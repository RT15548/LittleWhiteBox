import { completeLearningByFacts } from './completion.js';
import { LEARNING_WORK_COPY, createLearningAttemptAccess, learningUnitOfAttempt } from './work.js';
import { checkLearningAnnotations, parseLearningAssessment } from './facts.js';
import { learningRecord, learningText } from './profile.js';
import { selectLearningEvidence } from './progress.js';
import { advanceLearningSchedule, correctLearningSchedules, learningReviewQuality, learningScheduled, newLearningSchedule } from './schedule.js';
import { canReadLearningScope, LEARNING_LIMITS as L, type LearningAssessment, type LearningAttempt, type LearningEvidence, type LearningItem, type LearningLanguage, type LearningScope, type LearningSkill, type LearningUnit } from './types.js';
import { combineLearningScope, learningArray, learningId, requireLearning, uniqueLearning } from './validation.js';

/**
 * The one copy of an attempt kept as item evidence. Reading-writing summaries keep only their paragraph and
 * essays keep no article text; other exercises retain their referenced materials, including selectable evidence.
 */
export function projectLearningEvidence(unit: LearningUnit, attemptId: string): LearningEvidence {
    const attempt = unit.attempts.find(entry => entry.id === attemptId);
    const assessment = unit.assessments.find(entry => entry.attemptId === attemptId);
    requireLearning(attempt && assessment, 'attemptId', 'Evidence needs a saved attempt with feedback');
    const exercise = unit.exercises.find(entry => entry.id === attempt.exerciseId)!;
    let materials = unit.materials.filter(material => exercise.materialIds.includes(material.id));
    if (unit.kind === 'reading-writing' && exercise.skill === 'writing') {
        materials = exercise.paragraphId === undefined ? [] : materials.map(material => ({ ...material,
            paragraphs: material.paragraphs.filter(paragraph => paragraph.id === exercise.paragraphId) })).filter(material => material.paragraphs.length);
    }
    const kept = materials.map(material => material.id);
    return structuredClone({ unitId: unit.id, scope: assessment.scope,
        exercise: { ...exercise, materialIds: exercise.materialIds.filter(id => kept.includes(id)) }, materials, attempt, assessment });
}

export function learningEvidence(profile: LearningLanguage, attemptId: string): LearningEvidence {
    const unit = learningUnitOfAttempt(profile, attemptId);
    if (!unit) {
        const archived = profile.items.flatMap(item => item.evidence).find(entry => entry.attempt.id === attemptId);
        requireLearning(archived, 'attemptId', 'Select a current attempt or retained learning evidence');
        return structuredClone(archived);
    }
    return projectLearningEvidence(unit, attemptId);
}

/** Replacing feedback also replaces every representative copy of that same attempt. */
export function replaceLearningAssessment(profile: LearningLanguage, assessment: LearningAssessment): void {
    const unit = learningUnitOfAttempt(profile, assessment.attemptId);
    if (unit) {
        const index = unit.assessments.findIndex(entry => entry.attemptId === assessment.attemptId);
        if (index < 0) { unit.assessments.push(assessment); } else { unit.assessments[index] = assessment; }
    }
    for (const item of profile.items) {
        item.evidence = item.evidence.map(entry => entry.attempt.id === assessment.attemptId
            ? { ...entry, assessment: structuredClone(assessment), scope: structuredClone(assessment.scope) } : entry);
    }
}

export function attachLearningEvidence(item: LearningItem, evidence: LearningEvidence): void {
    item.evidence = selectLearningEvidence([...item.evidence.filter(entry => entry.attempt.id !== evidence.attempt.id), structuredClone(evidence)]);
}

/** Only saved answer facts establish order; representative evidence is reordered on every judgement. */
function followsLearningAttempt(profile: LearningLanguage, attempt: LearningAttempt, earlierId: string): boolean {
    const unit = learningUnitOfAttempt(profile, earlierId);
    const earlier = unit?.attempts.find(entry => entry.id === earlierId)
        ?? profile.items.flatMap(item => item.evidence).find(entry => entry.attempt.id === earlierId)?.attempt;
    if (!earlier) { return false; }
    if (attempt.submittedAt !== earlier.submittedAt) { return attempt.submittedAt > earlier.submittedAt; }
    // A current unit preserves submission order even when two answers share a timestamp; archives do not.
    return unit !== undefined && unit.attempts.findIndex(entry => entry.id === attempt.id)
        > unit.attempts.findIndex(entry => entry.id === earlierId);
}

/**
 * Apply a new or changed judgement, never a replay. Current and archived review answers obey the same rule:
 * a changed judgement withdraws its own move and reapplies it only if no later answer has moved the item.
 */
export function scheduleLearningReview(profile: LearningLanguage, evidence: LearningEvidence, now: string, prior?: LearningAssessment): void {
    const { attempt, assessment, exercise } = evidence;
    const item = profile.items.find(entry => entry.id === exercise.itemId);
    const advances = item?.schedule && (!prior || item.schedule.lastAttemptId === attempt.id
        || prior.verdict === 'disputed' && (item.schedule.lastAttemptId === null
            || followsLearningAttempt(profile, attempt, item.schedule.lastAttemptId)));
    if (prior) { correctLearningSchedules(profile.items, attempt.id, now); }
    if (!item?.schedule) { return; }
    attachLearningEvidence(item, evidence);
    const quality = learningReviewQuality(attempt, assessment);
    if (advances && quality !== null) { item.schedule = advanceLearningSchedule(item.schedule, quality, attempt.id, now); }
}

type ItemRef = { itemId: string | null; label: string | null };
function parseItemRef(value: unknown, path: string): ItemRef {
    const item = learningRecord(value, path, ['itemId', 'label']);
    return { itemId: item.itemId === undefined ? null : learningId(item.itemId, `${path}.itemId`),
        label: item.label === undefined ? null : learningText(item.label, `${path}.label`, L.goal) };
}

export function assessLearning(profile: LearningLanguage, args: unknown, options: {
    attemptId: string; review: boolean; inputScope: LearningScope; osId: string; createId: () => string; now?: () => string;
}): { profile: LearningLanguage; ids: string[] } {
    const input = learningRecord(args, 'LearningAssess', ['attemptId', 'verdict', 'understanding', 'expression', 'guidance', 'items', 'annotations', 'resolvedAnnotationIds', 'signal']);
    const attemptId = learningId(input.attemptId, 'attemptId');
    requireLearning(attemptId === options.attemptId, 'attemptId', 'This action evaluates its submitted attempt');
    const now = (options.now ?? (() => new Date().toISOString()))();
    const next = structuredClone(profile);
    const access = createLearningAttemptAccess(next, options.osId).get(attemptId);
    requireLearning(access.work, 'attemptId', LEARNING_WORK_COPY.unavailable);
    const { attempt, assessment: prior } = access.work;
    const scope = combineLearningScope(access.work.scope, options.inputScope);
    const { items: rawItems, annotations: rawAnnotations, ...rawAssessment } = input;
    const evidenceOnly = prior && Object.keys(rawAssessment).length === 1 && rawAnnotations === undefined;
    const createItem = (label: string, skill: LearningSkill) => {
        const found = next.items.find(entry => entry.label === label && entry.skill === skill && JSON.stringify(entry.scope) === JSON.stringify(scope));
        if (found) { return found; }
        const item: LearningItem = { id: options.createId(), label, scope, skill, evidence: [], ...(learningScheduled(skill) ? { schedule: newLearningSchedule(now) } : {}) };
        next.items.push(item);
        return item;
    };
    const resolveItem = (ref: ItemRef, skill: LearningSkill, path: string) => {
        const item = ref.itemId === null ? null : next.items.find(entry => entry.id === ref.itemId);
        requireLearning(ref.itemId === null || item, `${path}.itemId`, 'Reference an existing learning item');
        if (item) {
            requireLearning(item.skill === skill, `${path}.itemId`, 'This attempt must train the same skill');
            if (ref.label !== null && ref.label !== item.label) {
                requireLearning(canReadLearningScope(item.scope, options.osId), `${path}.label`, 'A label from another story cannot be changed here');
                item.label = ref.label;
                item.scope = combineLearningScope(item.scope, scope);
            }
            return item;
        }
        requireLearning(ref.label, `${path}.label`, 'A new learning item needs a focused label');
        return createItem(ref.label, skill);
    };
    // Annotation items are resolved first, so the saved annotation names a real grammar or vocabulary item.
    const linked: LearningItem[] = [];
    const annotations = rawAnnotations === undefined ? undefined : learningArray(rawAnnotations, 'annotations', (value, path) => {
        const { item: rawRef, ...annotation } = learningRecord(value, path, ['category', 'severity', 'paragraphIndex', 'quote', 'explanation', 'suggestion', 'item']);
        if (rawRef === undefined) { return { id: options.createId(), ...annotation }; }
        const category = annotation.category;
        requireLearning(category === 'grammar' || category === 'vocabulary', `${path}.item`, 'Only grammar and vocabulary annotations link a learning item');
        const item = resolveItem(parseItemRef(rawRef, `${path}.item`), category, `${path}.item`);
        if (!linked.includes(item)) { linked.push(item); }
        return { id: options.createId(), ...annotation, itemId: item.id };
    }, L.annotations);
    const assessment = evidenceOnly ? prior : parseLearningAssessment({ ...rawAssessment, ...(annotations ? { annotations } : {}), scope });
    const rejudged = prior !== undefined && JSON.stringify(prior) !== JSON.stringify(assessment);
    requireLearning(!rejudged || options.review, 'attemptId', 'Existing feedback can be changed in an explicit review');
    requireLearning(!rejudged || access.actions.review, 'attemptId', LEARNING_WORK_COPY.revised);
    // Validate the selected answer before updating its authoritative feedback and representative copies.
    checkLearningAnnotations(assessment, attempt);
    const changes = learningArray(rawItems ?? [], 'items', parseItemRef, L.itemChanges);
    uniqueLearning(changes.flatMap(item => item.itemId === null ? [] : [item.itemId]), 'items');
    replaceLearningAssessment(next, assessment);
    const evidence = learningEvidence(next, attemptId);
    const ids = [attemptId];
    for (const change of changes) {
        const item = resolveItem(change, evidence.exercise.skill, 'items');
        if (!linked.includes(item)) { linked.push(item); }
    }
    // Decide against the saved answers before new item links can prune their representative evidence.
    if (!prior || rejudged) { scheduleLearningReview(next, evidence, now, prior); }
    for (const item of linked) { attachLearningEvidence(item, evidence); ids.push(item.id); }
    completeLearningByFacts(next, 'unit', now, options.osId);
    completeLearningByFacts(next, 'review', now, options.osId);
    return { profile: next, ids };
}
