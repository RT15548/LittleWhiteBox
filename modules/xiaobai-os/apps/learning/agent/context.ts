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
    const request = { language, teacher: options.teacher, action, currentTime,
        message: options.message, profile: readLearning(data, language, osId, {}).data,
        review: readLearning(data, language, osId, { section: 'review' }, currentTime),
        focus: focus(data, language, osId, action, options.exerciseId) };
    const background = createLearningBackground(context);
    return { messages: [
        { role: 'user' as const, content: `<learning_request>\n${safePromptJson(request)}\n</learning_request>` },
        { role: 'user' as const, content: `<teacher_background>\n${safePromptJson(background.initial())}\n</teacher_background>` },
    ], turn: { role: 'user', content: `<learning_turn>\n${safePromptJson({ action, message: options.message, focus: request.focus })}\n</learning_turn>` } };
}
