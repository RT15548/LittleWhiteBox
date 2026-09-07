import { assessLearning } from '../../../domains/learning/assessment.js';
import { completeLearning } from '../../../domains/learning/completion.js';
import { parseLearningData } from '../../../domains/learning/data.js';
import { exposeLearningContent } from '../../../domains/learning/exposure.js';
import { learningRecord, LearningValidationError, parseLearningLanguageTag, parseLearningProfile } from '../../../domains/learning/profile.js';
import { canReadLearningScope, type LearningData, type LearningScope, type RewardTier } from '../../../domains/learning/types.js';
import { learningIds, learningInteger, requireLearning } from '../../../domains/learning/validation.js';
import { LEARNING_REWARD_PRICES } from '../../../domains/learning/reward.js';
import { createLearningLessonCompiler } from '../application/lesson.js';
import { createLearningId } from '../application/identity.js';
import { appendLearningAttempt } from '../application/attempt.js';
import { learningPresentation, type LearningPresentation } from '../application/presentation.js';
import { confirmedLearning, type LearningRepository } from '../application/service.js';
import { createLearningSourceRegistry } from '../materials/lesson-sources.js';
import { readLearning } from './data-projection.js';

export type LearningAction =
    | { kind: 'profile' }
    | { kind: 'prepare'; replaceCurrent: boolean; prices?: Readonly<Record<RewardTier, number>> }
    | { kind: 'assess'; attemptId: string; review: boolean }
    | { kind: 'complete' }
    | { kind: 'explain' }
    | { kind: 'talk' };

export function learningToolNames(): string[] {
    return ['LearningRead', 'LearningProfileEdit', 'LearningLessonEdit', 'LearningAssess', 'LearningComplete', 'LearningHelp', 'LearningPresent', 'LearningAnswer'];
}

/** One user-initiated action. Provider orchestration owns normal completion/cancellation, not this draft. */
export function createLearningSession(repository: LearningRepository, options: {
    language: string; osId: string; inputScope: LearningScope; action: LearningAction;
    createId?: () => string; now?: () => string;
    sources?: ReturnType<typeof createLearningSourceRegistry>;
    learnerMessage?: string;
    asOf?: string;
}) {
    const expected = confirmedLearning(repository);
    const action = structuredClone(options.action);
    const inputScope = structuredClone(options.inputScope);
    requireLearning(inputScope.kind === 'public' || inputScope.osId === options.osId, 'scope', 'Use the current story identity');
    const accessOsId = inputScope.kind === 'story' ? options.osId : null;
    const createId = options.createId ?? createLearningId;
    const now = options.now ?? (() => new Date().toISOString());
    const asOf = options.asOf ?? now();
    const canonicalLanguage = parseLearningLanguageTag(options.language, 'language');
    let staged: LearningData = structuredClone(expected?.data ?? { profiles: [] });
    let invalid = false;
    let sealed = false;
    let presentation: LearningPresentation | null = null;
    let messageAttempt: { exerciseId: string; id: string } | null = null;
    const applied = new Set<string>();
    const assessed = new Set<string>();
    const failures = new Map<string, { path: string; message: string }>();
    const names = learningToolNames();
    const sources = options.sources ?? createLearningSourceRegistry();
    const compileLesson = createLearningLessonCompiler({
        osId: options.osId, scope: inputScope, prices: action.kind === 'prepare' ? action.prices ?? LEARNING_REWARD_PRICES : LEARNING_REWARD_PRICES,
        createId, sources,
    });
    const active = () => requireLearning(!invalid && !sealed, 'action', 'This teaching action has ended');
    const errors = () => [...failures.values()];
    const missingMessageAssessment = () => !!messageAttempt && !staged.profiles.some(profile => profile.unit?.assessments
        .some(entry => entry.attemptId === messageAttempt!.id && canReadLearningScope(entry.scope, accessOsId)));
    return {
        toolNames: [...names],
        appliedTools: () => [...applied],
        missingMessageAssessment,
        hasAssessment: (attemptId: string) => assessed.has(attemptId) || !(action.kind === 'assess' && action.review)
            && staged.profiles.some(profile => profile.unit?.assessments.some(entry => entry.attemptId === attemptId && entry.verdict !== 'disputed' && canReadLearningScope(entry.scope, accessOsId))),
        presentation: () => presentation ? structuredClone(presentation) : null,
        unresolvedErrors: () => structuredClone(errors()),
        markExplained(exerciseId: string) {
            active();
            const profile = staged.profiles.find(profile => profile.language === canonicalLanguage);
            const unit = profile?.unit;
            requireLearning(unit && canReadLearningScope(unit.scope, accessOsId)
                && unit.exercises.some(exercise => exercise.id === exerciseId), 'exerciseId', 'Select an available exercise');
            exposeLearningContent(profile!, 'hints', exerciseId);
        },
        executeTool(name: string, args: unknown): unknown {
            active();
            const attemptRef = name === 'LearningAssess' && args && typeof args === 'object' && 'attemptId' in args
                && typeof args.attemptId === 'string' ? args.attemptId : null;
            const failureKey = attemptRef === null ? name : `${name}:${attemptRef}`;
            try {
                requireLearning(names.includes(name), 'tool', 'This tool is not available for the current learning action');
                if (name === 'LearningRead') {
                    if (args && typeof args === 'object' && 'section' in args && args.section === 'sources') {
                        const input = learningRecord(args, name, ['section', 'offset', 'limit']);
                        const offset = learningInteger(input.offset ?? 0, 'offset');
                        const limit = learningInteger(input.limit ?? 20, 'limit', 1, 50);
                        const records = sources.list();
                        const nextOffset = offset + limit < records.length ? offset + limit : null;
                        return { section: 'sources', data: records.slice(offset, offset + limit), nextOffset, omitted: nextOffset !== null };
                    }
                    return readLearning(staged, canonicalLanguage, accessOsId, args, asOf);
                }
                if (args && typeof args === 'object' && 'discard' in args) {
                    const input = learningRecord(args, name, ['discard']);
                    requireLearning(input.discard === true, 'discard', 'Use true to withdraw this failed proposal');
                    for (const key of failures.keys()) { if (key === name || key.startsWith(`${name}:`)) { failures.delete(key); } }
                    return { ok: true, changed: false, ids: [], errors: errors() };
                }
                let next = structuredClone(staged);
                const index = next.profiles.findIndex(profile => profile.language === canonicalLanguage);
                let ids: string[] = [];
                if (name === 'LearningProfileEdit') {
                    const input = learningRecord(args, name, ['explanationLanguage', 'selfAssessment', 'goal']);
                    const previous = next.profiles[index];
                    const profile = parseLearningProfile({ language: canonicalLanguage,
                        explanationLanguage: input.explanationLanguage === undefined ? previous?.explanationLanguage : input.explanationLanguage,
                        selfAssessment: input.selfAssessment === undefined ? previous?.selfAssessment : input.selfAssessment,
                        goal: { ...(previous?.goal ?? { exam: null, targetLevel: null, targetDate: null }),
                            ...(input.goal === undefined ? {} : learningRecord(input.goal, 'goal', ['description', 'exam', 'targetLevel', 'targetDate'])) } });
                    if (previous) { next.profiles[index] = { ...previous, ...profile }; }
                    else { next.profiles.push({ ...profile, unit: null, items: [], completions: [] }); }
                    ids = [canonicalLanguage];
                } else {
                    requireLearning(index >= 0, 'profile', 'Save the learner goal before preparing a lesson');
                    const profile = next.profiles[index];
                    if (name === 'LearningPresent') {
                        const target = learningPresentation(profile.unit, args, options.learnerMessage);
                        requireLearning(target.kind === 'replacement' || profile.unit && canReadLearningScope(profile.unit.scope, accessOsId), 'unit', 'Choose a lesson available in this classroom');
                        presentation = target;
                        ids = [presentation.id];
                    } else if (name === 'LearningAnswer') {
                        const input = learningRecord(args, name, ['exerciseId']);
                        const published = structuredClone(expected?.data.profiles.find(entry => entry.language === canonicalLanguage));
                        const question = published?.unit?.exercises.find(entry => entry.id === input.exerciseId);
                        requireLearning(action.kind === 'talk' && typeof options.learnerMessage === 'string', 'message', 'This tool records the learner’s current typed message');
                        requireLearning(published?.unit && question?.response.kind === 'text', 'exerciseId', 'Choose a text-response question published before this message');
                        requireLearning(profile.unit?.id === published.unit.id && JSON.stringify(profile.unit.exercises.find(entry => entry.id === question.id)) === JSON.stringify(question)
                            && JSON.stringify(profile.unit.materials.filter(entry => question.materialIds.includes(entry.id)).map(({ transcriptRevealed: _revealed, ...entry }) => entry))
                                === JSON.stringify(published.unit.materials.filter(entry => question.materialIds.includes(entry.id)).map(({ transcriptRevealed: _revealed, ...entry }) => entry)),
                        'exerciseId', 'Keep the published question and its material unchanged when recording its answer');
                        requireLearning(!messageAttempt || messageAttempt.exerciseId === question.id, 'exerciseId', 'This message already answers another question');
                        if (messageAttempt) { ids = [messageAttempt.id]; }
                        else {
                            const attempt = appendLearningAttempt(published, { unitId: published.unit.id, exerciseId: question.id,
                                answer: { kind: 'text', text: options.learnerMessage }, scope: inputScope, osId: options.osId,
                                replays: 0, slowPlayback: false, createId, now });
                            profile.unit.attempts.push(attempt);
                            messageAttempt = { exerciseId: question.id, id: attempt.id };
                            ids = [attempt.id];
                        }
                    } else if (name === 'LearningLessonEdit') {
                        const { newLesson, ...lesson } = learningRecord(args, name, ['newLesson', 'title', 'goal', 'tier', 'materials', 'exercises', 'removeMaterials', 'removeExercises']);
                        requireLearning(newLesson === undefined || typeof newLesson === 'boolean', 'newLesson', 'Use true to begin the next lesson');
                        const previous = expected?.data.profiles.find(entry => entry.language === canonicalLanguage)?.unit;
                        const startNew = (newLesson === true || action.kind === 'prepare' && action.replaceCurrent) && !applied.has(name);
                        requireLearning(!startNew || action.kind === 'prepare' && action.replaceCurrent || !profile.unit
                            || profile.unit.id === previous?.id && expected?.data.profiles.find(entry => entry.language === canonicalLanguage)?.completions.some(entry => entry.unitId === previous.id),
                        'newLesson', 'Finish and save the current lesson before beginning another, or use LearningPresent with kind:replacement to ask the learner to confirm putting it aside');
                        requireLearning(startNew || !profile.unit || canReadLearningScope(profile.unit.scope, accessOsId),
                            'unit', 'This lesson belongs to another story. LearningPresent with kind:replacement asks the learner to confirm starting another');
                        const remembered = [...(profile.unit?.materials ?? []), ...profile.items.flatMap(item => item.evidence.flatMap(evidence => evidence.materials))];
                        const current = startNew ? null : profile.unit;
                        requireLearning(!current || current.scope.kind === inputScope.kind, 'unit',
                            'This shared lesson cannot acquire private story details. Ask the learner to start a new lesson in this classroom');
                        profile.unit = compileLesson(lesson, current, previous?.id === current?.id ? previous ?? null : null);
                        // Exact known text remains exposed across a new preparation; no website-reading log is needed.
                        for (const material of profile.unit.materials) {
                            const text = material.paragraphs.map(paragraph => paragraph.text).join('\n\n');
                            material.transcriptRevealed = !profile.unit.exercises.some(exercise => exercise.skill === 'listening' && exercise.materialIds.includes(material.id)) || remembered.some(old => old.transcriptRevealed
                                && old.paragraphs.map(paragraph => paragraph.text).join('\n\n') === text);
                        }
                        ids = [profile.unit.id, ...profile.unit.materials.map(material => material.id), ...profile.unit.exercises.map(exercise => exercise.id)];
                    } else if (name === 'LearningAssess') {
                        const { review: requestedReview, ...requested } = learningRecord(args, name, ['attemptId', 'verdict', 'understanding', 'expression', 'guidance', 'items', 'review']);
                        requireLearning(requestedReview === undefined || typeof requestedReview === 'boolean', 'review', 'Use true for a learner-requested review');
                        const attemptId = requested.attemptId;
                        const review = requestedReview === true || action.kind === 'assess' && action.review && action.attemptId === attemptId;
                        const attempt = profile.unit?.attempts.find(entry => entry.id === attemptId)
                            ?? profile.items.flatMap(item => item.evidence).find(entry => entry.attempt.id === attemptId)?.attempt;
                        requireLearning(attempt && canReadLearningScope(attempt.scope, accessOsId), 'attemptId', 'This attempt is outside the action reading scope');
                        const result = assessLearning(profile, requested, { attemptId: attempt.id, review, inputScope, osId: options.osId, createId });
                        next.profiles[index] = result.profile;
                        ids = result.ids;
                    } else if (name === 'LearningComplete') {
                        requireLearning(profile.unit && canReadLearningScope(profile.unit.scope, accessOsId), 'unitId', 'This unit is outside the action reading scope');
                        // Scope follows every piece of feedback the completion is allowed to consume.
                        const visible = structuredClone(profile);
                        visible.unit!.assessments = visible.unit!.assessments.filter(entry => canReadLearningScope(entry.scope, accessOsId));
                        const completed = completeLearning(visible, args, { osId: options.osId, inputScope, now });
                        next.profiles[index].completions = completed.completions;
                        ids = [profile.unit.id];
                    } else if (name === 'LearningHelp') {
                        const input = learningRecord(args, name, ['exerciseIds', 'materialIds']);
                        requireLearning(profile.unit && canReadLearningScope(profile.unit.scope, accessOsId), 'unit', 'Select an available current lesson');
                        const exercises = learningIds(input.exerciseIds ?? [], 'exerciseIds');
                        const materials = learningIds(input.materialIds ?? [], 'materialIds');
                        for (const id of exercises) { exposeLearningContent(profile, 'hints', id); }
                        for (const id of materials) { exposeLearningContent(profile, 'transcripts', id); }
                        ids = [...exercises, ...materials];
                    }
                }
                next = parseLearningData(next);
                const changed = JSON.stringify(next) !== JSON.stringify(staged);
                staged = next;
                applied.add(name);
                if (name === 'LearningAssess' && attemptRef) { assessed.add(attemptRef); }
                failures.delete(failureKey);
                failures.delete(name);
                return { ok: true, changed, ids, errors: errors() };
            } catch (error) {
                if (!(error instanceof LearningValidationError)) { invalid = true; throw error; }
                const issue = { path: error.path, message: error.message };
                if (name !== 'LearningRead') { failures.set(failureKey, issue); }
                return { ok: false, changed: false, ids: [], errors: name === 'LearningRead' ? [issue, ...errors()] : errors() };
            }
        },
        async commit(guard: () => boolean) {
            active();
            requireLearning(failures.size === 0, 'action', 'Correct each failed proposal or withdraw it with discard:true on that tool');
            requireLearning(!missingMessageAssessment(), 'assessment', 'Assess the attempt returned by LearningAnswer before finishing this reply');
            if (presentation) {
                const unit = staged.profiles.find(entry => entry.language === canonicalLanguage)?.unit ?? null;
                requireLearning(unit?.id === presentation.unitId, 'presentation', 'Present content from the current lesson');
                presentation = learningPresentation(unit, { kind: presentation.kind, id: presentation.id }, options.learnerMessage);
            }
            for (const profile of staged.profiles) {
                const known = expected?.data.profiles.find(entry => entry.language === profile.language)?.completions ?? [];
                for (const completion of profile.completions.filter(entry => !known.some(old => old.unitId === entry.unitId))) {
                    const unit = profile.unit;
                    requireLearning(unit?.id === completion.unitId && completion.attemptIds.every(id => unit.attempts.some(attempt => attempt.id === id)
                        && unit.assessments.some(assessment => assessment.attemptId === id && assessment.verdict !== 'disputed')),
                    'completion', 'The new completion still needs resolved feedback when this action is saved');
                }
            }
            sealed = true;
            return repository.save(expected, staged, () => !invalid && guard());
        },
        invalidate() { invalid = true; },
    };
}
