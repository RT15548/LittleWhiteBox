import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import { canReadLearningScope, LEARNING_LIMITS as L, type LearningAssessment, type LearningAttempt, type LearningData, type LearningScope, type LearningUnit } from '../../../domains/learning/types.js';
import { learningAnswerParagraphs } from '../../../domains/learning/facts.js';
import { requireLearning } from '../../../domains/learning/validation.js';
import type { LearningSelection } from '../../../domains/learning/notes.js';
import type { LearningActor } from '../domain/conversation.js';
import type { LearningTeacherPreference } from '../../../domains/learning/profile.js';
import type { PromptContextSnapshot } from '../../../host/prompt-context/types.js';
import { readLearning } from './data-projection.js';
import type { LearningAction } from './session.js';
import { createLearningBackground } from './background.js';
import type { LearningPresentation } from '../application/presentation.js';
import type { LearningProgress } from '../application/feedback.js';
import type { LearningMessage } from './messages.js';
import { learningExerciseView, learningTrainingView } from '../application/projection.js';
import { learningReadAudience, learningReadUnit } from './access.js';
import { learningUnitStage, type LearningExerciseStatus } from '../../../domains/learning/stage.js';
import { LEARNING_WORK_COPY, createLearningAttemptAccess, learningWorkInScope } from '../../../domains/learning/work.js';
import { createLearningReading, type LearningReading } from './reading.js';
import type { LearningDelegation, LearningTaskResult, LearningWorkbenchActivity, LearningWorkTarget } from '../application/delegation.js';

export interface LearningDialogue {
    user: string; teacher: string; presentation?: LearningPresentation;
    id?: string;
    references?: string[];
    scope: LearningScope;
    /** The request purpose; a companion remark has no learner message of its own. */
    purpose?: LearningAction['kind'];
    messages: LearningMessage[];
    /** Live execution metadata, scoped to this run and never stored as learning data. */
    progress?: LearningProgress;
    status: 'running' | 'finished' | 'failed' | 'cancelled' | 'unconfirmed' | 'conflict';
    message: string;
    notice?: 'history-save' | 'learning-save';
    target?: LearningWorkTarget;
}
export interface LearningTeacherContext { snapshot: PromptContextSnapshot; teacherDetails: string }
// Scope is an access fact for the Host; the model sees the answer, its conditions and numbered paragraphs.
function answerView(attempt: LearningAttempt, reading: LearningReading) {
    const { scope: _scope, ...answer } = attempt;
    return reading.include(answer.answer.kind === 'text' ? { ...answer, paragraphs: learningAnswerParagraphs(answer.answer.text) } : answer,
        attempt.scope, [attempt.id, attempt.exerciseId, ...attempt.revisesAttemptId ? [attempt.revisesAttemptId] : []]);
}
function feedbackView(assessment: LearningAssessment | undefined, reading: LearningReading) {
    if (!assessment) { return null; }
    const { scope: _scope, ...feedback } = assessment;
    return reading.include(feedback, assessment.scope, [assessment.attemptId, ...(assessment.annotations ?? []).flatMap(entry => entry.itemId ? [entry.itemId] : [])]);
}
function readableUnit(unit: LearningUnit | null | undefined, osId: string | null, unitId: string) {
    const work = learningWorkInScope(unit, osId);
    requireLearning(work?.id === unitId, 'unitId', 'Select the current available unit');
    return work;
}
function workView(unit: LearningUnit, attempts: LearningAttempt[], osId: string | null, reading: LearningReading) {
    return attempts.map(attempt => {
        const assessment = unit.assessments.find(entry => entry.attemptId === attempt.id);
        requireLearning(canReadLearningScope(attempt.scope, osId) && (!assessment || canReadLearningScope(assessment.scope, osId)),
            'attemptId', 'This work belongs to another story');
        const exercise = unit.exercises.find(entry => entry.id === attempt.exerciseId)!;
        return reading.include({ exercise, attempt: answerView(attempt, reading), assessment: feedbackView(assessment, reading) }, unit.scope,
            [unit.id, exercise.id, ...exercise.materialIds, ...exercise.itemId ? [exercise.itemId] : []]);
    });
}

function pendingAttempts(unit: LearningUnit, status: LearningExerciseStatus, osId: string | null) {
    const ids = new Set(learningUnitStage(unit, osId).exercises.filter(entry => entry.status === status)
        .map(entry => status === 'reviewing' ? entry.revisionAttemptId : entry.draftAttemptId));
    return unit.attempts.filter(attempt => ids.has(attempt.id));
}

/** The facts one request purpose works on; each purpose reads only its own stage of the unit. */
function purposeFocus(data: LearningData, language: string, osId: string | null, action: LearningAction, reading: LearningReading) {
    const profile = data.profiles.find(entry => entry.language === language);
    switch (action.kind) {
    case 'summary-review': {
        const unit = learningWorkInScope(profile?.unit, osId);
        const attempt = unit?.attempts.find(entry => entry.id === action.attemptId);
        const exercise = attempt && unit!.exercises.find(entry => entry.id === attempt.exerciseId);
        requireLearning(unit && attempt && exercise?.paragraphId, 'attemptId', 'Select a saved paragraph summary');
        requireLearning(canReadLearningScope(attempt.scope, osId), 'attemptId', 'This answer belongs to another story');
        const material = unit.materials.find(entry => exercise.materialIds.includes(entry.id));
        return reading.include({ unitId: unit.id, exercise: learningExerciseView(exercise, unit), attempt: answerView(attempt, reading),
            materialId: material?.id, paragraphId: exercise.paragraphId }, unit.scope, [unit.id, exercise.id, ...material ? [material.id] : []]);
    }
    case 'grade': {
        const unit = readableUnit(profile?.unit, osId, action.unitId);
        const drafts = pendingAttempts(unit, 'grading', osId);
        return { unitId: unit.id, drafts: workView(unit, drafts, osId, reading) };
    }
    case 'revision-review': {
        const unit = readableUnit(profile?.unit, osId, action.unitId);
        const revisions = pendingAttempts(unit, 'reviewing', osId);
        return { unitId: unit.id, revisions: revisions.map(revision => {
            const draft = unit.attempts.find(entry => entry.id === revision.revisesAttemptId)!;
            const [original, edited] = workView(unit, [draft, revision], osId, reading);
            return reading.include({ exercise: edited.exercise, draft: original.attempt, draftAssessment: original.assessment, revision: edited.attempt }, unit.scope, [unit.id, revision.exerciseId]);
        }) };
    }
    case 'model-essay': {
        const unit = readableUnit(profile?.unit, osId, action.unitId);
        const essays = unit.exercises.filter(exercise => !exercise.paragraphId);
        return { unitId: unit.id, level: profile!.level, targetLevel: profile!.goal.targetLevel,
            work: workView(unit, unit.attempts.filter(attempt => essays.some(exercise => exercise.id === attempt.exerciseId)), osId, reading) };
    }
    case 'review-prepare': {
        const due = readLearning(data, language, osId, { section: 'review', limit: L.readMax }, action.asOf, 'teaching', 'review', reading).data as { id: string }[];
        return { asOf: action.asOf, items: action.itemIds.map(id => due.find(item => item.id === id) ?? { id }) };
    }
    case 'review-assess': {
        const unit = readableUnit(profile?.review, osId, action.unitId);
        const answers = pendingAttempts(unit, 'grading', osId);
        return { unitId: unit.id, answers: workView(unit, answers, osId, reading).map(work => {
            const item = profile!.items.find(item => item.id === work.exercise.itemId && canReadLearningScope(item.scope, osId));
            const projected = reading.include({ ...work, item: item?.label ?? null }, unit.scope, [unit.id, work.exercise.id]);
            if (item) { reading.include(projected.exercise, item.scope, [item.id]); }
            return projected;
        }) };
    }
    case 'companion': {
        const unit = profile?.unit && canReadLearningScope(profile.unit.scope, osId) ? profile.unit : null;
        const training = unit ? learningTrainingView(unit) : null;
        const material = training?.materials.find(entry => entry.id === action.materialId) ?? training?.materials[0];
        const paragraphId = action.paragraphId ?? material?.paragraphs[0]?.id;
        return training && material ? { unitId: training.id, materialId: material.id,
            paragraphId: material.paragraphs.some(paragraph => paragraph.id === paragraphId) ? paragraphId : null } : null;
    }
    default: return undefined;
    }
}

function focus(data: LearningData, language: string, osId: string | null, action: LearningAction, reading: LearningReading,
    unitKey: 'unit' | 'review', requestData: LearningData, exerciseId?: string) {
    const purpose = purposeFocus(data, language, osId, action, reading);
    if (purpose !== undefined) { return purpose; }
    const profile = data.profiles.find(entry => entry.language === language);
    const current = profile?.[unitKey];
    const unit = learningWorkInScope(current, osId);
    if (action.kind === 'talk') {
        // Selection belongs to the original message; retries and handoffs project today's saved content.
        const original = requestData.profiles.find(entry => entry.language === language)?.[unitKey];
        const selected = original && canReadLearningScope(original.scope, osId) ? original : null;
        if (action.unitId) { requireLearning(selected?.id === action.unitId, 'unitId', 'Select the current available unit'); }
        if (exerciseId) { requireLearning(selected?.exercises.some(entry => entry.id === exerciseId), 'exerciseId', 'Select an available exercise'); }
        if (unit?.id !== selected?.id || exerciseId && !unit?.exercises.some(entry => entry.id === exerciseId)) { return null; }
    }
    if (action.kind === 'assess') {
        const target = createLearningAttemptAccess(profile, osId).work(action.attemptId);
        requireLearning(target, 'attemptId', LEARNING_WORK_COPY.unavailable);
        // Focused questions and submitted answers are complete or the request is stopped before calling a model.
        const feedback = target.assessment;
        const { scope: _attemptScope, ...answer } = target.attempt;
        const published = unit ? learningTrainingView(unit).materials : [];
        return reading.include({ unitId: target.unitId, exercise: target.exercise,
            // Current public material already appears in training. Archived sources and withheld
            // listening transcripts are supplied only to this assessment, never to conversation.
            materials: target.materials.filter(material => !published.some(entry => entry.id === material.id && !entry.hidden
                && JSON.stringify(entry.paragraphs) === JSON.stringify(material.paragraphs) && JSON.stringify(entry.provenance) === JSON.stringify(material.provenance))),
            attempt: reading.include(answer, target.attempt.scope, [target.attempt.id]),
            assessment: feedback ? reading.include({ attemptId: feedback.attemptId, verdict: feedback.verdict,
                understanding: feedback.understanding, expression: feedback.expression, guidance: feedback.guidance }, feedback.scope, [feedback.attemptId]) : null },
        target.scope, [target.unitId, target.exercise.id, ...target.materials.map(material => material.id)]);
    }
    if (exerciseId) {
        const exercise = unit?.exercises.find(entry => entry.id === exerciseId);
        requireLearning(unit && exercise, 'exerciseId', 'Select an available exercise');
        const training = learningTrainingView(unit);
        const attempt = unit.attempts.filter(entry => entry.exerciseId === exercise.id).at(-1);
        const assessment = unit.assessments.find(entry => entry.attemptId === attempt?.id);
        return reading.include({ unitId: unit.id, exercise: training.exercises.find(entry => entry.id === exercise.id),
            attempt: attempt ? answerView(attempt, reading) : null, assessment: feedbackView(assessment, reading) }, unit.scope, [unit.id, exercise.id]);
    }
    return null;
}

export function buildLearningContext(options: {
    data: LearningData; language: string; osId: string | null; actor: LearningActor; teacher: LearningTeacherPreference['teacher'];
    context: LearningTeacherContext | null; selection?: LearningSelection | null; action: LearningAction; message: string; exerciseId?: string; asOf?: string; requestData?: LearningData;
    delegation?: LearningDelegation; taskResult?: LearningTaskResult; workbench?: () => LearningWorkbenchActivity;
    target?: LearningWorkTarget;
}) {
    const { data, language, osId, action, context } = options;
    const currentTime = options.asOf ?? new Date().toISOString();
    const background = options.actor === 'companion' && context ? createLearningBackground(context) : null;
    const requestData = options.requestData ?? data;
    const unitKey = options.target?.unitKey ?? learningReadUnit(action, requestData.profiles.find(entry => entry.language === language));
    const targetAvailable = action.kind === 'assess' || !options.target?.unitId || data.profiles.find(profile => profile.language === language)?.[unitKey]?.id === options.target.unitId;
    const reading = createLearningReading();
    const read = (args: unknown) => readLearning(data, language, osId, args, currentTime, learningReadAudience(action), unitKey, reading);
    const request = { language, action, currentTime,
        ...(options.delegation ? { delegation: options.delegation } : {}),
        ...(options.taskResult ? { taskResult: options.taskResult } : {}),
        profile: read({}).data,
        items: read({ section: 'items' }),
        review: read({ section: 'review' }),
        training: read({ section: 'training' }).data,
        focus: targetAvailable ? focus(data, language, osId, action, reading, unitKey, requestData, options.exerciseId) : null, selection: options.selection ?? null,
        ...(options.target ? { target: options.target } : {}),
        ...(background ? { background: background.initial() } : {}) };
    // Core settings have no clock, progress or recent-story fields. Dynamic data belongs at the tail.
    const reference = { teacher: options.teacher, characters: context?.snapshot.characters.map(character => ({
        cardName: character.displayName, description: character.description, personality: character.personality, scenario: character.scenario,
    })) ?? [] };
    const userText = action.kind === 'task-result' ? '[工作台委托结果，由应用送达]' : `[学生本轮发言]\n${options.message}`;
    return { ...reading.inspect(request),
        taskReferences: reading.inspect(request.focus).references,
        prefix: options.actor === 'companion' && context ? [{ role: 'system' as const, content: `人物与故事核心设定，作为身份背景资料。\n<teacher_reference>\n${safePromptJson(reference)}\n</teacher_reference>` }] : [],
        get messages() {
            const workbench = options.actor === 'companion' ? options.workbench?.() : undefined;
            const current = { ...request, ...(workbench ? { workbench: { ...workbench, ...(workbench.busy ? {
                notice: '工作台正在更新任务，你看到的进度可能慢一拍；现在先聊，暂时别操作工作台。',
            } : {}) } } : {}) };
            const dataText = `本轮学习状态与背景资料：\n<learning_request>\n${safePromptJson(current)}\n</learning_request>`;
            return [{ role: 'user' as const, content: options.actor === 'companion' ? `${dataText}\n\n${userText}` : `${userText}\n\n${dataText}` }];
        },
        // Like ebook, replay the actual exchange, not an obsolete copy of every injected asset.
        turn: { role: 'user', content: `${userText}\n\n<learning_turn>\n${safePromptJson({ action })}\n</learning_turn>` } };
}
