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
    let saveExpected = expected;
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
    let help: { exerciseIds: string[]; materialIds: string[] } | null = null;
    const applied = new Set<string>();
    const names = learningToolNames();
    const sources = options.sources ?? createLearningSourceRegistry();
    const compileLesson = createLearningLessonCompiler({
        osId: options.osId, scope: inputScope, prices: action.kind === 'prepare' ? action.prices ?? LEARNING_REWARD_PRICES : LEARNING_REWARD_PRICES,
        createId, sources,
    });
    const active = () => requireLearning(!invalid && !sealed, 'action', 'This teaching action has ended');
    return {
        toolNames: [...names],
        appliedTools: () => [...applied],
        presentation: () => presentation ? structuredClone(presentation) : null,
        helpDeclared: () => help !== null,
        helpIsPublished() {
            if (!help) { return false; }
            const proposed = staged.profiles.find(entry => entry.language === canonicalLanguage)?.unit;
            const published = saveExpected?.data.profiles.find(entry => entry.language === canonicalLanguage)?.unit;
            return help.exerciseIds.every(id => published?.revealed.hints.includes(id)
                && JSON.stringify(published.exercises.find(entry => entry.id === id)) === JSON.stringify(proposed?.exercises.find(entry => entry.id === id)))
                && help.materialIds.every(id => published?.materials.some(entry => entry.id === id && entry.transcriptRevealed
                    && JSON.stringify(entry.paragraphs) === JSON.stringify(proposed?.materials.find(material => material.id === id)?.paragraphs)));
        },
        markExplained(exerciseId: string) {
            active();
            const profile = staged.profiles.find(profile => profile.language === canonicalLanguage);
            const unit = profile?.unit;
            requireLearning(unit && canReadLearningScope(unit.scope, accessOsId)
                && unit.exercises.some(exercise => exercise.id === exerciseId), 'exerciseId', 'Select an available exercise');
            exposeLearningContent(profile!, 'hints', exerciseId);
        },
        async saveHelp(guard: () => boolean) {
            active();
            const data = structuredClone(saveExpected?.data ?? { profiles: [] });
            const profile = data.profiles.find(entry => entry.language === canonicalLanguage);
            const proposed = staged.profiles.find(entry => entry.language === canonicalLanguage)?.unit;
            // Only exposure of already-published content survives an interrupted teaching turn.
            if (profile?.unit && proposed?.id === profile.unit.id) {
                for (const kind of ['answers', 'hints'] as const) {
                    for (const id of proposed.revealed[kind]) {
                        if (profile.unit.exercises.some(entry => entry.id === id
                            && JSON.stringify(entry) === JSON.stringify(proposed.exercises.find(exercise => exercise.id === id)))) { exposeLearningContent(profile, kind, id); }
                    }
                }
                for (const material of proposed.materials) {
                    const published = profile.unit.materials.find(entry => entry.id === material.id);
                    if (material.transcriptRevealed && published && JSON.stringify(material.paragraphs) === JSON.stringify(published.paragraphs)) {
                        exposeLearningContent(profile, 'transcripts', material.id);
                    }
                }
            }
            const result = await repository.save(saveExpected, data, () => !invalid && guard());
            if (result.status === 'confirmed' || result.status === 'unchanged') { saveExpected = result.document; }
            return result;
        },
        executeTool(name: string, args: unknown): unknown {
            active();
            let nextPresentation = presentation;
            let nextMessageAttempt = messageAttempt;
            try {
                requireLearning(names.includes(name), 'tool', 'This tool is not available for the current learning action');
                if (name === 'LearningHelp') {
                    const input = learningRecord(args, name, ['exerciseIds', 'materialIds']);
                    const exerciseIds = learningIds(input.exerciseIds, 'exerciseIds');
                    const materialIds = learningIds(input.materialIds, 'materialIds');
                    const next = structuredClone(staged);
                    const profile = next.profiles.find(entry => entry.language === canonicalLanguage);
                    requireLearning(!exerciseIds.length && !materialIds.length || profile?.unit && canReadLearningScope(profile.unit.scope, accessOsId), 'unit', 'Select an available current lesson');
                    for (const id of exerciseIds) { exposeLearningContent(profile!, 'hints', id); }
                    for (const id of materialIds) { exposeLearningContent(profile!, 'transcripts', id); }
                    const changed = JSON.stringify(next) !== JSON.stringify(staged);
                    staged = next;
                    help = { exerciseIds: [...new Set([...(help?.exerciseIds ?? []), ...exerciseIds])],
                        materialIds: [...new Set([...(help?.materialIds ?? []), ...materialIds])] };
                    applied.add(name);
                    return { ok: true, changed, ids: [...exerciseIds, ...materialIds], errors: [] };
                }
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
                        nextPresentation = target;
                        ids = [target.id];
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
                            nextMessageAttempt = { exerciseId: question.id, id: attempt.id };
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
                        const confirmed = saveExpected?.data.profiles.find(entry => entry.language === canonicalLanguage);
                        const remembered = [...(confirmed?.unit?.materials ?? []),
                            ...(confirmed?.items.flatMap(item => item.evidence.flatMap(evidence => evidence.materials)) ?? [])];
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
                    }
                }
                next = parseLearningData(next);
                // Reject the particular edit that breaks a live reference, while the model can still repair it.
                if (nextPresentation) {
                    const unit = next.profiles.find(profile => profile.language === canonicalLanguage)?.unit ?? null;
                    requireLearning(unit?.id === nextPresentation.unitId, 'presentation', 'Present content from the current lesson');
                    nextPresentation = learningPresentation(unit, { kind: nextPresentation.kind, id: nextPresentation.id }, options.learnerMessage);
                }
                for (const profile of next.profiles) {
                    const known = expected?.data.profiles.find(entry => entry.language === profile.language)?.completions ?? [];
                    for (const completion of profile.completions.filter(entry => !known.some(old => old.unitId === entry.unitId))) {
                        const unit = profile.unit;
                        requireLearning(unit?.id === completion.unitId && completion.attemptIds.every(id => unit.attempts.some(attempt => attempt.id === id)
                            && unit.assessments.some(assessment => assessment.attemptId === id && assessment.verdict !== 'disputed')),
                        'completion', 'Keep resolved feedback for each attempt cited by the completion');
                    }
                }
                const changed = JSON.stringify(next) !== JSON.stringify(staged);
                staged = next;
                if (name === 'LearningLessonEdit' && changed) { help = null; }
                presentation = nextPresentation;
                messageAttempt = nextMessageAttempt;
                applied.add(name);
                return { ok: true, changed, ids, errors: [] };
            } catch (error) {
                if (!(error instanceof LearningValidationError)) { invalid = true; throw error; }
                // An unsuccessful replacement declaration cannot leave an older scope authorizing new text.
                if (name === 'LearningHelp') { help = null; }
                const issue = { path: error.path, message: error.message };
                return { ok: false, changed: false, ids: [], errors: [issue] };
            }
        },
        async commit(guard: () => boolean) {
            active();
            sealed = true;
            return repository.save(saveExpected, staged, () => !invalid && guard());
        },
        invalidate() { invalid = true; },
    };
}
