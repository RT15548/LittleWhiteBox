import { replaceLearningAssessment } from '../../../domains/learning/assessment.js';
import { completeLearningByFacts, saveLearningModelEssay } from '../../../domains/learning/completion.js';
import { parseLearningAnswer } from '../../../domains/learning/exercise.js';
import { exposeLearningContent } from '../../../domains/learning/exposure.js';
import { defaultLearningProfile, LEARNING_DEFAULT_EXPLANATION_LANGUAGE, learningRecord, parseLearningLanguageTag, parseLearningProfile } from '../../../domains/learning/profile.js';
import { correctLearningSchedules, learningReviewTier, newLearningSchedule, selectDueLearningItems } from '../../../domains/learning/schedule.js';
import { learningSpeechParts, parseLearningVoice } from '../../../domains/learning/speech.js';
import type { LearningNote } from '../../../domains/learning/notes.js';
import { canReadLearningScope, type LearningData, type LearningLanguage, type LearningScope } from '../../../domains/learning/types.js';
import { combineLearningScope, learningArray, learningId, learningTimestamp, requireLearning, uniqueLearning } from '../../../domains/learning/validation.js';
import type { createLearningRepository, LearningSaveConfirmation } from '../storage/repository.js';
import { createLearningId } from './identity.js';
import { appendLearningAttempt, learningAttemptConditions, learningAttemptUnit, type LearningAttemptBasis } from './attempt.js';
import { LEARNING_WORK_COPY, createLearningAttemptAccess, learningWorkInScope } from '../../../domains/learning/work.js';
import { learningUnitStage } from '../../../domains/learning/stage.js';

export type LearningRepository = ReturnType<typeof createLearningRepository>;

export function confirmedLearning(repository: LearningRepository) {
    const snapshot = repository.snapshot();
    requireLearning(snapshot.status === 'ready' && snapshot.document !== undefined, 'storage', 'Read or resolve the learning file first');
    return snapshot.document;
}

export function createLearningService(repository: LearningRepository, options: {
    createId?: () => string; now?: () => string; onConfirmed?: LearningSaveConfirmation;
} = {}) {
    const createId = options.createId ?? createLearningId;
    const now = options.now ?? (() => new Date().toISOString());
    const mutate = (language: string, change: (data: LearningData, index: number) => void, guard: () => boolean) => {
        const expected = confirmedLearning(repository);
        const data = structuredClone(expected?.data ?? { profiles: [] });
        const index = data.profiles.findIndex(profile => profile.language === language);
        requireLearning(index >= 0, 'language', 'Select a saved learning profile');
        change(data, index);
        return repository.save(expected, data, guard, options.onConfirmed);
    };
    const stamp = () => learningTimestamp(now(), 'now');
    const readingWriting = (profile: LearningLanguage, unitId: string) => {
        const unit = profile.unit;
        requireLearning(unit?.kind === 'reading-writing' && unit.id === unitId, 'unitId', 'Select the current reading-writing unit');
        return unit;
    };
    /** The current lesson or the review group, whichever has this id. */
    const slot = (profile: LearningLanguage, unitId: string) => [profile.unit, profile.review].find(unit => unit?.id === unitId) ?? null;
    /** Removing an answer also removes its revision, their feedback and evidence, and withdraws any schedule move they made. */
    const removeAttempts = (profile: LearningLanguage, ids: Set<string>) => {
        for (const unit of [profile.unit, profile.review]) {
            if (!unit) { continue; }
            unit.attempts = unit.attempts.filter(entry => !ids.has(entry.id));
            unit.assessments = unit.assessments.filter(entry => !ids.has(entry.attemptId));
            if (unit.skippedRevisionAttemptIds) { unit.skippedRevisionAttemptIds = unit.skippedRevisionAttemptIds.filter(id => !ids.has(id)); }
        }
        for (const item of profile.items) { item.evidence = item.evidence.filter(entry => !ids.has(entry.attempt.id)); }
        const at = stamp();
        for (const id of ids) { correctLearningSchedules(profile.items, id, at); }
    };
    return {
        /** Settings may be saved before any lesson; a missing profile starts from the defaults. Null restores a default. */
        saveSettings(language: string, settings: unknown, guard: () => boolean) {
            const expected = confirmedLearning(repository);
            const data = structuredClone(expected?.data ?? { profiles: [] });
            const input = learningRecord(settings, 'settings', ['explanationLanguage', 'level', 'targetLevel', 'exam', 'interests']);
            const tag = parseLearningLanguageTag(language, 'language');
            let profile = data.profiles.find(entry => entry.language === tag);
            if (!profile) {
                profile = { ...defaultLearningProfile(tag), unit: null, review: null, items: [], completions: [] };
                data.profiles.push(profile);
            }
            const pick = (key: string, previous: unknown) => input[key] === undefined ? previous : input[key];
            Object.assign(profile, parseLearningProfile({ language: tag,
                explanationLanguage: pick('explanationLanguage', profile.explanationLanguage) ?? LEARNING_DEFAULT_EXPLANATION_LANGUAGE,
                selfAssessment: profile.selfAssessment, level: pick('level', profile.level), interests: pick('interests', profile.interests),
                goal: { ...profile.goal, exam: pick('exam', profile.goal.exam), targetLevel: pick('targetLevel', profile.goal.targetLevel) } }, 'settings'));
            return repository.save(expected, data, guard, options.onConfirmed);
        },
        /** A tapped explanation term goes into the vocabulary book, due tomorrow, before any evidence exists. */
        bookmarkTerm(language: string, unitId: string, materialId: string, paragraphId: string, termText: string, guard: () => boolean) {
            return mutate(language, (data, index) => {
                const profile = data.profiles[index];
                const unit = readingWriting(profile, unitId);
                const term = unit.explanations!.find(entry => entry.materialId === materialId && entry.paragraphId === paragraphId)
                    ?.terms.find(entry => entry.text === termText);
                requireLearning(term, 'termText', "Bookmark a term from this paragraph's explanation");
                const scope = JSON.stringify(unit.scope);
                if (profile.items.some(item => item.label === term.text && item.skill === 'vocabulary' && JSON.stringify(item.scope) === scope)) { return; }
                profile.items.push({ id: learningId(createId(), 'itemId'), label: term.text, scope: structuredClone(unit.scope), skill: 'vocabulary',
                    evidence: [], schedule: newLearningSchedule(stamp()) });
            }, guard);
        },
        skipRevision(language: string, unitId: string, osId: string, guard: () => boolean) {
            return mutate(language, (data, index) => {
                const unit = readingWriting(data.profiles[index], unitId);
                const stage = learningUnitStage(unit, osId);
                const skipped = stage.exercises.filter(row => row.status === 'revising').map(row => (row.revisionAttemptId ?? row.draftAttemptId)!);
                unit.skippedRevisionAttemptIds = [...new Set([...unit.skippedRevisionAttemptIds!, ...skipped])];
                completeLearningByFacts(data.profiles[index], 'unit', stamp(), osId);
            }, guard);
        },
        /** Revisions are new learner attempts; batches and further revisions preserve the earlier work. */
        submitRevision(language: string, unitId: string, revisions: unknown, osId: string, guard: () => boolean, basis?: LearningAttemptBasis) {
            return mutate(language, (data, index) => {
                const unit = readingWriting(data.profiles[index], unitId);
                const work = learningWorkInScope(unit, osId);
                requireLearning(work, 'unitId', 'Select work available in this story');
                const entries = learningArray(revisions, 'revisions', (raw, path) => {
                    const entry = learningRecord(raw, path, ['attemptId', 'text']);
                    return { attemptId: learningId(entry.attemptId, `${path}.attemptId`), text: entry.text, path };
                }, unit.exercises.length);
                requireLearning(entries.length > 0, 'revisions', 'Submit at least one revised draft');
                uniqueLearning(entries.map(entry => entry.attemptId), 'revisions');
                const submittedAt = basis?.submittedAt ?? stamp();
                for (const entry of entries) {
                    const draft = work.attempts.find(attempt => attempt.id === entry.attemptId);
                    const assessment = work.assessments.find(assessment => assessment.attemptId === draft?.id);
                    requireLearning(draft && assessment && assessment.verdict !== 'disputed',
                        `${entry.path}.attemptId`, 'Revise a saved answer with feedback');
                    const conditions = learningAttemptUnit(basis, language, unit, draft.exerciseId);
                    const help = learningAttemptConditions(conditions, draft.exerciseId, osId);
                    unit.attempts.push({ id: learningId(createId(), 'attemptId'), exerciseId: draft.exerciseId,
                        answer: parseLearningAnswer({ kind: 'text', text: entry.text }, { kind: 'text' }, [], `${entry.path}.text`), submittedAt,
                        ...help, help: { ...help.help, feedback: true },
                        scope: combineLearningScope(unit.scope, assessment.scope), revisesAttemptId: draft.id });
                }
            }, guard);
        },
        saveModelEssay(language: string, unitId: string, value: unknown, osId: string, guard: () => boolean) {
            return mutate(language, (data, index) => { saveLearningModelEssay(data.profiles[index], unitId, value,
                { now: stamp(), osId, inputScope: readingWriting(data.profiles[index], unitId).scope }); }, guard);
        },
        /** What a new review would cover now; null when nothing is due. */
        reviewSelection(language: string, at = now(), osId?: string | null) {
            const profile = confirmedLearning(repository)?.data.profiles.find(entry => entry.language === language);
            const items = profile ? selectDueLearningItems(profile, learningTimestamp(at, 'now'), osId) : [];
            return items.length ? { itemIds: items.map(item => item.id), tier: learningReviewTier(items.length) } : null;
        },
        abandonReview: (language: string, guard: () => boolean) => mutate(language, (data, index) => { data.profiles[index].review = null; }, guard),
        /** Called by Host after a real submit. Returned intent is kept for this save, not recreated by retries. */
        prepareAttempt(input: { language: string; unitId: string; exerciseId: string; answer: unknown;
            scope: LearningScope; osId: string; replays: number; slowPlayback: boolean }, basis?: LearningAttemptBasis) {
            const expected = confirmedLearning(repository);
            const data = structuredClone(expected?.data ?? { profiles: [] });
            const profile = data.profiles.find(profile => profile.language === input.language);
            requireLearning(profile, 'language', 'Select a saved learning profile');
            const currentUnit = [profile.unit, profile.review].find(entry => entry?.id === input.unitId);
            const originalUnit = learningAttemptUnit(basis, input.language, currentUnit, input.exerciseId);
            const attempt = appendLearningAttempt(profile, { ...input, createId, now: basis ? () => basis.submittedAt : now, basis: originalUnit });
            let submitted = false;
            return { attemptId: attempt.id, save(guard: () => boolean) {
                requireLearning(!submitted, 'attemptId', 'This submission has been sent; read or verify its saved result');
                submitted = true;
                return repository.save(expected, data, guard, options.onConfirmed);
            } };
        },
        reveal(language: string, unitId: string, kind: 'answers' | 'hints' | 'transcripts', id: string, osId: string, guard: () => boolean) {
            return mutate(language, (data, index) => {
                const unit = slot(data.profiles[index], unitId);
                requireLearning(unit && canReadLearningScope(unit.scope, osId), 'unitId', 'Select an available current unit');
                requireLearning(kind === 'transcripts' ? unit.materials.some(material => material.id === id) : unit.exercises.some(exercise => exercise.id === id), 'id', 'Reveal content from this unit');
                if (kind === 'hints' && !unit.exercises.find(exercise => exercise.id === id)!.hint.trim()) { return; }
                exposeLearningContent(data.profiles[index], kind, id, unit);
            }, guard);
        },
        setVoice(language: string, value: unknown, guard: () => boolean) {
            return mutate(language, (data, index) => { data.profiles[index].voice = parseLearningVoice(value); }, guard);
        },
        note(language: string, unitId: string, note: LearningNote | string, guard: () => boolean, scope?: LearningScope) {
            return mutate(language, (data, index) => {
                const unit = slot(data.profiles[index], unitId);
                requireLearning(unit, 'unitId', 'Select the current unit');
                unit.notes ??= [];
                if (typeof note === 'string') { unit.notes = unit.notes.filter(entry => entry.id !== note); }
                else if (!unit.notes.some(entry => entry.id === note.id)) {
                    unit.notes.push(structuredClone(note));
                    if (scope) { unit.scope = combineLearningScope(unit.scope, scope); }
                }
            }, guard);
        },
        listening(language: string, unitId: string, exerciseId: string, voice: unknown, partKey: string,
            started: boolean, slow: boolean, osId: string, guard: () => boolean) {
            return mutate(language, (data, index) => {
                const unit = data.profiles[index].unit;
                requireLearning(unit?.id === unitId && canReadLearningScope(unit.scope, osId)
                    && unit.exercises.some(exercise => exercise.id === exerciseId && exercise.skill === 'listening'), 'exerciseId', 'Select a current listening exercise');
                const exercise = unit.exercises.find(entry => entry.id === exerciseId)!;
                requireLearning(unit.materials.filter(material => exercise.materialIds.includes(material.id))
                    .flatMap(learningSpeechParts).some(part => part.key === partKey), 'partKey', 'Select an actual material span');
                // A new record covers one span; slowing unrelated audio must not taint another material.
                const records = unit.listening ?? [];
                let record = records.find(entry => entry.exerciseId === exerciseId && entry.parts.some(part => part.key === partKey));
                if (!record && !started) { return; }
                if (!record) {
                    record = { exerciseId, voice: parseLearningVoice(voice), parts: [{ key: partKey, count: 0 }], slowPlayback: false };
                    records.push(record);
                }
                unit.listening = records;
                if (started) { record.parts.find(part => part.key === partKey)!.count++; }
                record.slowPlayback ||= slow;
            }, guard);
        },
        dispute(language: string, attemptId: string, osId: string, guard: () => boolean) {
            return mutate(language, (data, index) => {
                const profile = data.profiles[index];
                const access = createLearningAttemptAccess(profile, osId).get(attemptId);
                const current = access.work?.assessment;
                requireLearning(current, 'attemptId', LEARNING_WORK_COPY.feedbackRequired);
                // The revision already answered this feedback; its own review is what can still change.
                requireLearning(access.actions.review, 'attemptId', LEARNING_WORK_COPY.revised);
                replaceLearningAssessment(profile, { ...current, verdict: 'disputed' });
                // A disputed judgement no longer supports the memory move it made.
                correctLearningSchedules(profile.items, attemptId, stamp());
            }, guard);
        },
        deleteAttempt(language: string, attemptId: string, osId: string, guard: () => boolean) {
            return mutate(language, (data, index) => {
                const profile = data.profiles[index];
                const access = createLearningAttemptAccess(profile, osId).get(attemptId);
                requireLearning(access.work, 'attemptId', LEARNING_WORK_COPY.unavailable);
                requireLearning(access.actions.remove, 'attemptId', LEARNING_WORK_COPY.hiddenRevisions);
                removeAttempts(profile, access.family);
            }, guard);
        },
        /** Its links in feedback go too, and a review stops asking about it. */
        deleteItem: (language: string, id: string, osId: string, guard: () => boolean) => mutate(language, (data, index) => {
            const profile = data.profiles[index];
            profile.items = profile.items.filter(item => item.id !== id);
            const review = profile.review;
            if (review) {
                const removed = review.exercises.filter(exercise => exercise.itemId === id).map(exercise => exercise.id);
                removeAttempts(profile, createLearningAttemptAccess(profile, osId).family(review.attempts.filter(attempt => removed.includes(attempt.exerciseId)).map(attempt => attempt.id)));
                review.exercises = review.exercises.filter(exercise => !removed.includes(exercise.id));
                review.revealed = { answers: review.revealed.answers.filter(entry => !removed.includes(entry)),
                    hints: review.revealed.hints.filter(entry => !removed.includes(entry)) };
                if (review.notes) { review.notes = review.notes.filter(note => !removed.includes(note.exerciseId)); }
                if (review.listening) { review.listening = review.listening.filter(record => !removed.includes(record.exerciseId)); }
                if (!review.exercises.length) { profile.review = null; }
            }
            const assessments = [profile.unit, profile.review].flatMap(unit => unit?.assessments ?? [])
                .concat(profile.items.flatMap(item => item.evidence.map(entry => entry.assessment)));
            for (const annotation of assessments.flatMap(assessment => assessment.annotations ?? [])) {
                if (annotation.itemId === id) { delete annotation.itemId; }
            }
            completeLearningByFacts(profile, 'review', stamp(), osId);
        }, guard),
        abandonUnit: (language: string, guard: () => boolean) => mutate(language, (data, index) => { data.profiles[index].unit = null; }, guard),
        deleteLanguage: (language: string, guard: () => boolean) => mutate(language, (data, index) => { data.profiles.splice(index, 1); }, guard),
    };
}
