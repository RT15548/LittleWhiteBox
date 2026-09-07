import type { LearningAnswer } from '../../../domains/learning/types.js';
import { confirmedLearning, createLearningService, type LearningRepository } from './service.js';
import { learningAnswerText } from './answer-text.js';
import type { createLearningTeaching, LearningClassroom, LearningTeachingResult } from './teaching.js';

/** User submissions are saved before the teacher sees them; the teacher never fabricates an Attempt. */
export function createLearningPractice(options: {
    repository: LearningRepository; teaching: ReturnType<typeof createLearningTeaching>;
    current: () => LearningClassroom | null; createId?: () => string; now?: () => string;
}) {
    const service = createLearningService(options.repository, options);
    let submitting = false;
    return {
        async submit(input: { unitId: string; exerciseId: string; answer: LearningAnswer; replays: number; slowPlayback: boolean }, isCurrent: () => boolean = () => true): Promise<
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
                const pending = service.prepareAttempt({ ...input, language: classroom.language, osId: classroom.osId,
                    scope: { kind: 'story', osId: classroom.osId } });
                const saved = await pending.save(guard);
                if (!guard()) { return { status: 'cancelled' }; }
                if (saved.status !== 'confirmed' && saved.status !== 'unchanged') { return { status: saved.status }; }
                const unit = confirmedLearning(options.repository)!.data.profiles.find(entry => entry.language === classroom.language)!.unit!;
                const attempt = unit.attempts.find(entry => entry.id === pending.attemptId)!;
                const exercise = unit.exercises.find(entry => entry.id === attempt.exerciseId)!;
                const teaching = await options.teaching.run({ action: { kind: 'assess', attemptId: pending.attemptId, review: false },
                    message: '我提交了这道题的答案，请接着带我学。',
                    displayMessage: learningAnswerText(attempt.answer, exercise.response, unit.materials.flatMap(entry => entry.paragraphs)) });
                return { status: 'saved', attemptId: pending.attemptId, teaching };
            } finally { submitting = false; }
        },
    };
}
