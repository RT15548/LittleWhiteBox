import { requireLearning } from '../../../domains/learning/validation.js';
import type { LearningAnswer } from '../../../domains/learning/types.js';
import { confirmedLearning, createLearningService, type LearningRepository } from './service.js';
import { learningAnswerText } from './answer-text.js';
import type { createLearningTeaching, LearningClassroom, LearningTeachingResult } from './teaching.js';
import type { LearningAttemptBasis } from './attempt.js';

/** User submissions are saved before the teacher sees them; the teacher never fabricates an Attempt. */
export function createLearningPractice(options: {
    repository: LearningRepository; teaching: ReturnType<typeof createLearningTeaching>;
    current: () => LearningClassroom | null; createId?: () => string; now?: () => string;
}) {
    const service = createLearningService(options.repository, options);
    let submitting = false;
    return {
        async submit(input: { unitId: string; exerciseId: string; answer: LearningAnswer; replays: number; slowPlayback: boolean }, isCurrent: () => boolean = () => true, basis?: LearningAttemptBasis): Promise<
            { status: 'saved'; attemptId: string; teaching: LearningTeachingResult | null }
            | { status: 'cancelled' | 'busy' | 'unconfirmed' | 'conflict' }
        > {
            if (submitting) { return { status: 'busy' }; }
            const classroom = structuredClone(options.current());
            if (!classroom) { return { status: 'cancelled' }; }
            const key = JSON.stringify(classroom);
            const guard = () => isCurrent() && JSON.stringify(options.current()) === key;
            submitting = true;
            try {
                const original = confirmedLearning(options.repository)?.data.profiles.find(profile => profile.language === classroom.language);
                const sourceUnit = [original?.unit, original?.review].find(unit => unit?.id === input.unitId);
                requireLearning(sourceUnit, 'unitId', 'Select an available current unit');
                const pending = service.prepareAttempt({ ...input, language: classroom.language, osId: classroom.osId,
                    scope: sourceUnit.scope }, basis);
                const saved = await pending.save(guard);
                if (!guard()) { return { status: 'cancelled' }; }
                if (saved.status !== 'confirmed' && saved.status !== 'unchanged') { return { status: saved.status }; }
                const profile = confirmedLearning(options.repository)!.data.profiles.find(entry => entry.language === classroom.language)!;
                const unit = [profile.unit, profile.review].find(entry => entry?.id === input.unitId)!;
                const attempt = unit.attempts.find(entry => entry.id === pending.attemptId)!;
                const exercise = unit.exercises.find(entry => entry.id === attempt.exerciseId)!;
                const displayMessage = learningAnswerText(attempt.answer, exercise.response, unit.materials.flatMap(entry => entry.paragraphs));
                // A lesson answer is taught at once; a paragraph summary gets a short review. Essays and review answers
                // wait for the unit's unified grading, which the learner starts once every draft is in.
                const teaching = unit.kind === 'lesson'
                    ? await options.teaching.run({ action: { kind: 'assess', attemptId: pending.attemptId, review: false },
                        message: '我提交了这道题的答案，请接着带我学。', displayMessage })
                    : unit.kind === 'reading-writing' && exercise.paragraphId
                        ? await options.teaching.run({ action: { kind: 'summary-review', attemptId: pending.attemptId },
                            message: '我写好了这一段的概括，请看一下。', displayMessage })
                        : null;
                return { status: 'saved', attemptId: pending.attemptId, teaching };
            } finally { submitting = false; }
        },
    };
}
