import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import { canReadLearningScope, type LearningData } from '../../../domains/learning/types.js';
import { requireLearning } from '../../../domains/learning/validation.js';
import type { LearningTeacherPreference } from '../../../domains/learning/profile.js';
import type { PromptContextSnapshot } from '../../../host/prompt-context/types.js';
import { readLearning } from './data-projection.js';
import type { LearningAction } from './session.js';
import { createLearningBackground } from './background.js';
import type { LearningPresentation } from '../application/presentation.js';

export interface LearningDialogue { user: string; teacher: string; presentation?: LearningPresentation }
export interface LearningTeacherContext { snapshot: PromptContextSnapshot; teacherDetails: string }
function focus(data: LearningData, language: string, osId: string, action: LearningAction, exerciseId?: string) {
    const profile = data.profiles.find(entry => entry.language === language);
    const unit = profile?.unit && canReadLearningScope(profile.unit.scope, osId) ? profile.unit : null;
    if (action.kind === 'assess') {
        const attempt = unit?.attempts.find(entry => entry.id === action.attemptId);
        const archived = action.review ? profile?.items.flatMap(item => item.evidence).find(entry => entry.attempt.id === action.attemptId) : null;
        const target = attempt && unit ? {
            unitId: unit.id, exercise: unit.exercises.find(entry => entry.id === attempt.exerciseId)!,
            attempt, assessment: unit.assessments.find(entry => entry.attemptId === attempt.id) ?? null,
            materials: unit.materials.filter(material => unit.exercises.find(entry => entry.id === attempt.exerciseId)!.materialIds.includes(material.id)),
        } : archived;
        requireLearning(target && canReadLearningScope(target.attempt.scope, osId)
            && (!target.assessment || canReadLearningScope(target.assessment.scope, osId)), 'attemptId', 'Select an available saved answer');
        // Focused questions and submitted answers are complete or the request is stopped before calling a model.
        const { scope: _attemptScope, ...answer } = target.attempt;
        const feedback = target.assessment;
        return { unitId: target.unitId, exercise: target.exercise, materials: target.materials,
            attempt: answer, assessment: feedback ? { attemptId: feedback.attemptId, verdict: feedback.verdict,
                understanding: feedback.understanding, expression: feedback.expression, guidance: feedback.guidance } : null };
    }
    if (exerciseId) {
        const exercise = unit?.exercises.find(entry => entry.id === exerciseId);
        requireLearning(unit && exercise, 'exerciseId', 'Select an available exercise');
        return { unitId: unit.id, exercise, materials: unit.materials.filter(material => exercise.materialIds.includes(material.id)) };
    }
    return null;
}

export function buildLearningContext(options: {
    data: LearningData; language: string; osId: string; teacher: NonNullable<LearningTeacherPreference['teacher']>;
    context: LearningTeacherContext; action: LearningAction; message: string; exerciseId?: string; asOf?: string;
}) {
    const { data, language, osId, action, context } = options;
    const currentTime = options.asOf ?? new Date().toISOString();
    const background = createLearningBackground(context);
    const request = { language, action, currentTime,
        profile: readLearning(data, language, osId, {}, currentTime).data,
        items: readLearning(data, language, osId, { section: 'items' }, currentTime),
        review: readLearning(data, language, osId, { section: 'review' }, currentTime),
        focus: focus(data, language, osId, action, options.exerciseId), background: background.initial() };
    // Core settings have no clock, progress or recent-story fields. Dynamic data belongs at the tail.
    const reference = { teacher: options.teacher, characters: context.snapshot.characters.map(character => ({
        cardName: character.displayName, description: character.description, personality: character.personality, scenario: character.scenario,
    })) };
    const userText = `[学生本轮发言]\n${options.message}`;
    return { prefix: [{ role: 'system' as const, content: `人物与故事核心设定，作为身份背景资料。\n<teacher_reference>\n${safePromptJson(reference)}\n</teacher_reference>` }],
        messages: [{ role: 'user' as const, content: `${userText}\n\n本轮学习状态与背景资料：\n<learning_request>\n${safePromptJson(request)}\n</learning_request>` }],
        // Like ebook, replay the actual exchange, not an obsolete copy of every injected asset.
        turn: { role: 'user', content: `${userText}\n\n<learning_turn>\n${safePromptJson({ action, focus: request.focus })}\n</learning_turn>` } };
}
