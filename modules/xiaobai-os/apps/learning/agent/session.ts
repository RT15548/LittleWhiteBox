import { assessLearning } from '../../../domains/learning/assessment.js';
import { completeLearning, saveLearningModelEssay } from '../../../domains/learning/completion.js';
import { parseLearningData } from '../../../domains/learning/data.js';
import { learningRecord, LearningValidationError, parseLearningLanguageTag, parseLearningProfile } from '../../../domains/learning/profile.js';
import { canReadLearningScope, type LearningData, type LearningLanguage, type LearningScope, type LearningUnit, type RewardTier } from '../../../domains/learning/types.js';
import { combineLearningScope, learningId, learningInteger, requireLearning } from '../../../domains/learning/validation.js';
import { exposeLearningContent } from '../../../domains/learning/exposure.js';
import { LEARNING_REWARD_PRICES } from '../../../domains/learning/reward.js';
import { createLearningLessonCompiler } from '../application/lesson.js';
import { createLearningId } from '../application/identity.js';
import { learningPresentation, type LearningPresentation } from '../application/presentation.js';
import { confirmedLearning, type LearningRepository } from '../application/service.js';
import { createLearningSourceRegistry } from '../materials/lesson-sources.js';
import { readLearning } from './data-projection.js';
import { learningToolNamesFor } from './tool-contract.js';
import { isLearningConversation, learningReadUnit } from './access.js';
import type { LearningActor } from '../domain/conversation.js';
import { createLearningReading } from './reading.js';
import type { LearningSaveConfirmation } from '../storage/repository.js';
import type { LearningWorkTarget } from '../application/delegation.js';

/**
 * Request purposes select the initial context and teaching guidance, not tool permissions.
 */
export type LearningAction =
    | { kind: 'profile' }
    | { kind: 'prepare'; replaceCurrent: boolean; unit?: 'reading-writing' | 'lesson'; source?: 'web' | 'authored'; prices?: Readonly<Record<RewardTier, number>> }
    | { kind: 'assess'; attemptId: string; review: boolean }
    | { kind: 'complete' }
    | { kind: 'talk'; unitId?: string }
    | { kind: 'task-result'; taskId: string }
    /** A reply focused on one paragraph summary. */
    | { kind: 'summary-review'; attemptId: string }
    | { kind: 'grade'; unitId: string }
    | { kind: 'revision-review'; unitId: string }
    | { kind: 'model-essay'; unitId: string }
    /** itemIds and asOf are the due selection shown to the learner when they started the review. */
    | { kind: 'review-prepare'; itemIds: string[]; asOf: string }
    | { kind: 'review-assess'; unitId: string }
    /** An unprompted in-character remark while the learner reads; it writes nothing. */
    | { kind: 'companion'; materialId?: string; paragraphId?: string };

/** Every tool name the classroom can show, for tool-activity views. */
export function learningToolNames(): string[] {
    return [...new Set([...learningToolNamesFor(), ...learningToolNamesFor(undefined, 'companion')])];
}

/** One user-initiated action. Provider orchestration owns normal completion/cancellation, not this draft. */
export function createLearningSession(repository: LearningRepository, options: {
    language: string; osId: string; inputScope: LearningScope; action: LearningAction;
    createId?: () => string; now?: () => string;
    sources?: ReturnType<typeof createLearningSourceRegistry>;
    asOf?: string;
    actor?: LearningActor;
    unitKey?: 'unit' | 'review';
}) {
    const actor = options.actor ?? 'workbench';
    let expected = isLearningConversation(options.action) ? repository.snapshot().document ?? null : confirmedLearning(repository);
    const action = structuredClone(options.action);
    let inputScope = structuredClone(options.inputScope);
    const readReferences = new Set<string>();
    requireLearning(inputScope.kind === 'public' || inputScope.osId === options.osId, 'scope', 'Use the current story identity');
    const accessOsId = options.osId;
    const createId = options.createId ?? createLearningId;
    const now = options.now ?? (() => new Date().toISOString());
    const asOf = options.asOf ?? now();
    const canonicalLanguage = parseLearningLanguageTag(options.language, 'language');
    let staged: LearningData = structuredClone(expected?.data ?? { profiles: [] });
    const unitKey = options.unitKey ?? learningReadUnit(action, staged.profiles.find(entry => entry.language === canonicalLanguage));
    const focused = staged.profiles.find(entry => entry.language === canonicalLanguage);
    const knownUnits = { unit: focused?.unit?.id, review: focused?.review?.id };
    let invalid = false;
    let sealed = false;
    let presentation: LearningPresentation | null = null;
    let discardEdit: (() => void) | null = null;
    const replacements = new Set<string>();
    const preapprovedUnitId = action.kind === 'prepare' && action.replaceCurrent
        ? expected?.data.profiles.find(entry => entry.language === canonicalLanguage)?.unit?.id : undefined;
    const applied = new Set<string>();
    const names = learningToolNamesFor(action, actor);
    const sources = options.sources ?? createLearningSourceRegistry();
    const compilerOptions = {
        osId: options.osId, language: canonicalLanguage, scope: inputScope, prices: action.kind === 'prepare' ? action.prices ?? LEARNING_REWARD_PRICES : LEARNING_REWARD_PRICES,
        createId, sources,
    };
    const compiler = createLearningLessonCompiler(compilerOptions);
    const compileLesson: typeof compiler = (...args) => { compilerOptions.scope = inputScope; return compiler(...args); };
    const active = () => requireLearning(!invalid && !sealed, 'action', 'This teaching action has ended');
    const currentSlot = (profile: LearningLanguage, id?: unknown) => {
        if (id === undefined) {
            requireLearning(profile[unitKey]?.id === knownUnits[unitKey], 'unitId', 'The focused unit changed. Read its current content or select a unitId');
            return unitKey;
        }
        const unitId = learningId(id, 'unitId');
        const key = profile.review?.id === unitId ? 'review' : 'unit';
        requireLearning(profile[key]?.id === unitId, 'unitId', 'Select an available lesson or review');
        return key;
    };
    const canReplace = (profile: LearningLanguage, unit: LearningUnit | null) => !unit
        || replacements.has(unit.id) || profile.completions.some(entry => entry.unitId === unit.id)
        || unit.id === preapprovedUnitId;
    async function checkpoint(guard: () => boolean, onConfirmed?: LearningSaveConfirmation) {
        active();
        if (actor === 'companion') { return { status: guard() ? 'unchanged' as const : 'cancelled' as const, document: repository.snapshot().document ?? null }; }
        if (JSON.stringify(staged) === JSON.stringify(expected?.data ?? { profiles: [] })) {
            discardEdit = null;
            return { status: guard() ? 'unchanged' as const : 'cancelled' as const, document: repository.snapshot().document ?? null };
        }
        const result = await repository.save(expected, staged, () => !invalid && guard(), saved => {
            expected = saved.document;
            staged = structuredClone(expected?.data ?? { profiles: [] });
            discardEdit = null;
            onConfirmed?.(saved);
        });
        // A cancelled save was never sent. Retire its draft, not the whole tool loop.
        if (result.status === 'cancelled') { discardEdit?.(); discardEdit = null; }
        return result;
    }
    const knownTexts = new Set<string>();
    const rememberText = (profile: LearningLanguage | undefined) => {
        for (const material of [...(profile?.unit?.materials ?? []), ...(profile?.review?.materials ?? []),
            ...(profile?.items.flatMap(item => item.evidence.flatMap(entry => entry.materials)) ?? [])]) {
            if (material.transcriptRevealed) { knownTexts.add(material.paragraphs.map(paragraph => paragraph.text).join('\n\n')); }
        }
    };
    rememberText(expected?.data.profiles.find(entry => entry.language === canonicalLanguage));
    /** Exact known text remains exposed across edits in this task. */
    const revealKnownText = (unit: LearningUnit, confirmed: LearningLanguage | undefined) => {
        rememberText(confirmed);
        for (const material of unit.materials) {
            const text = material.paragraphs.map(paragraph => paragraph.text).join('\n\n');
            material.transcriptRevealed = !unit.exercises.some(exercise => exercise.skill === 'listening' && exercise.materialIds.includes(material.id)) || knownTexts.has(text);
        }
        return unit;
    };
    return {
        toolNames: [...names],
        appliedTools: () => [...applied],
        reading: () => ({ scope: structuredClone(inputScope), references: [...readReferences] }),
        target(focus?: LearningWorkTarget): LearningWorkTarget {
            const unit = staged.profiles.find(entry => entry.language === canonicalLanguage)?.[unitKey];
            const exerciseId = unit?.id === knownUnits[unitKey] && unit?.exercises.some(entry => entry.id === focus?.exerciseId) ? focus?.exerciseId : undefined;
            const selection = unit?.id === knownUnits[unitKey] && focus?.selection && unit?.materials.some(material => material.id === focus.selection!.materialId
                && material.paragraphs.some(paragraph => paragraph.id === focus.selection!.paragraphId
                    && paragraph.text.slice(focus.selection!.start, focus.selection!.end) === focus.selection!.quote)) ? focus.selection : null;
            return { unitKey, unitId: knownUnits[unitKey], ...(exerciseId ? { exerciseId } : {}), selection };
        },
        recordAppliedTool(name: string) { active(); applied.add(name); },
        authorizeReplacement(unitId: string) { active(); replacements.add(unitId); },
        refresh() {
            active();
            requireLearning(JSON.stringify(staged) === JSON.stringify(expected?.data ?? { profiles: [] }), 'storage', 'Save the current edit before reading newer records');
            expected = actor === 'companion' ? repository.snapshot().document ?? null : confirmedLearning(repository);
            staged = structuredClone(expected?.data ?? { profiles: [] });
        },
        checkpoint,
        presentation: () => presentation ? structuredClone(presentation) : null,
        executeTool(name: string, args: unknown): unknown {
            active();
            let nextPresentation = presentation;
            try {
                requireLearning(names.includes(name), 'tool', 'This tool is not available for the current learning action');
                if (name === 'LearningRead') {
                    const audience = actor === 'companion' ? 'public' : 'teaching';
                    if (args && typeof args === 'object' && 'section' in args && args.section === 'sources') {
                        const input = learningRecord(args, name, ['section', 'offset', 'limit']);
                        const offset = learningInteger(input.offset ?? 0, 'offset');
                        const limit = learningInteger(input.limit ?? 20, 'limit', 1, 50);
                        const records = sources.list();
                        const nextOffset = offset + limit < records.length ? offset + limit : null;
                        return { section: 'sources', data: records.slice(offset, offset + limit), nextOffset, omitted: nextOffset !== null };
                    }
                    const reading = createLearningReading();
                    const result = readLearning(staged, canonicalLanguage, accessOsId, args, asOf, audience, unitKey, reading);
                    const profile = staged.profiles.find(entry => entry.language === canonicalLanguage);
                    knownUnits.unit = profile?.unit?.id; knownUnits.review = profile?.review?.id;
                    const { scope, references } = reading.inspect(result);
                    references.forEach(id => readReferences.add(id));
                    inputScope = combineLearningScope(inputScope, scope);
                    return result;
                }
                let next = structuredClone(staged);
                const index = next.profiles.findIndex(profile => profile.language === canonicalLanguage);
                let ids: string[] = [];
                let approval: { id: string; title: string } | undefined;
                if (name === 'LearningProfileEdit') {
                    const input = learningRecord(args, name, ['explanationLanguage', 'selfAssessment', 'level', 'interests', 'goal']);
                    const previous = next.profiles[index];
                    const profile = parseLearningProfile({ language: canonicalLanguage,
                        explanationLanguage: input.explanationLanguage === undefined ? previous?.explanationLanguage : input.explanationLanguage,
                        selfAssessment: input.selfAssessment === undefined ? previous?.selfAssessment : input.selfAssessment,
                        level: input.level === undefined ? previous?.level ?? null : input.level, interests: input.interests === undefined ? previous?.interests ?? null : input.interests,
                        goal: { ...(previous?.goal ?? { exam: null, targetLevel: null, targetDate: null }),
                            ...(input.goal === undefined ? {} : learningRecord(input.goal, 'goal', ['description', 'exam', 'targetLevel', 'targetDate'])) } });
                    if (previous) { next.profiles[index] = { ...previous, ...profile }; }
                    else { next.profiles.push({ ...profile, unit: null, review: null, items: [], completions: [] }); }
                    ids = [canonicalLanguage];
                } else {
                    requireLearning(index >= 0, 'profile', 'Save the learner goal before preparing a lesson');
                    const profile = next.profiles[index];
                    if (name === 'LearningArticle') {
                        const input = learningRecord(args, name, ['title', 'goal', 'tier', 'kind', 'sourceId', 'text']);
                        if (!canReplace(profile, profile.unit)) { approval = { id: profile.unit!.id, title: profile.unit!.title }; }
                        profile.unit = revealKnownText(compileLesson({ kind: 'reading-writing', title: input.title, goal: input.goal, tier: input.tier,
                            materials: [{ key: 'article', title: input.title, kind: input.kind, ...(input.sourceId ? { sourceId: input.sourceId } : {}), text: input.text }] }), profile);
                        ids = [profile.unit.id];
                    } else if (name === 'LearningReadingNotes' || name === 'LearningEssayTask') {
                        const input = learningRecord(args, name, ['unitId', ...(name === 'LearningReadingNotes' ? ['explanations'] : ['prompt', 'exerciseId'])]);
                        const key = currentSlot(profile, input.unitId);
                        const unit = profile[key];
                        requireLearning(unit?.kind === 'reading-writing' && canReadLearningScope(unit.scope, accessOsId), 'unitId', 'Select an available reading article');
                        if (name === 'LearningReadingNotes') {
                            requireLearning(Array.isArray(input.explanations), 'explanations', 'Supply paragraph explanations');
                            const entries = new Map<string, Record<string, unknown>>(unit.explanations!.map(({ materialId, ...entry }) => [entry.paragraphId, { materialKey: materialId, ...entry }]));
                            for (const raw of input.explanations) {
                                const entry = learningRecord(raw, 'explanations', ['paragraphId', 'explanation', 'terms']);
                                const paragraphId = learningId(entry.paragraphId, 'paragraphId');
                                entries.set(paragraphId, { paragraphId, explanation: entry.explanation, terms: entry.terms, materialKey: unit.materials[0].id });
                            }
                            profile[key] = compileLesson({ explanations: [...entries.values()] }, unit, unit);
                        } else {
                            profile[key] = compileLesson({ exercises: [{ key: input.exerciseId ?? unit.exercises.find(entry => !entry.paragraphId && entry.skill === 'writing' && entry.response.kind === 'text')?.id ?? 'essay', skill: 'writing', materialKeys: [unit.materials[0].id],
                                prompt: input.prompt, response: { kind: 'text' }, rule: { kind: 'semantic' } }] }, unit, unit);
                        }
                        ids = [unit.id];
                    } else if (name === 'LearningPresent') {
                        const { unitId, ...input } = learningRecord(args, name, ['unitId', 'kind', 'id']);
                        const unit = profile[currentSlot(profile, unitId)];
                        const target = learningPresentation(unit, input);
                        requireLearning(unit && canReadLearningScope(unit.scope, accessOsId), 'unit', 'Choose a lesson available in this classroom');
                        nextPresentation = target;
                        ids = [target.id];
                    } else if (name === 'LearningLessonEdit') {
                        const { unitId, newLesson, ...lesson } = learningRecord(args, name, ['unitId', 'newLesson', 'kind', 'title', 'goal', 'tier', 'materials', 'exercises', 'removeMaterials', 'removeExercises', 'explanations']);
                        requireLearning(newLesson === undefined || typeof newLesson === 'boolean', 'newLesson', 'Use true to begin the next lesson');
                        const key = unitId === undefined && (lesson.kind === 'review' || action.kind === 'review-prepare') ? 'review' : currentSlot(profile, unitId);
                        const previous = expected?.data.profiles.find(entry => entry.language === canonicalLanguage)?.[key];
                        const startNew = newLesson ?? (preapprovedUnitId !== undefined && profile[key]?.id === preapprovedUnitId);
                        if (startNew && !canReplace(profile, profile[key])) { approval = { id: profile[key]!.id, title: profile[key]!.title }; }
                        requireLearning(startNew || !profile[key] || canReadLearningScope(profile[key].scope, accessOsId), 'unitId', 'This lesson belongs to another story');
                        const confirmed = expected?.data.profiles.find(entry => entry.language === canonicalLanguage);
                        const current = startNew ? null : profile[key];
                        const kind = lesson.kind ?? (key === 'review' ? 'review' : !current && action.kind === 'prepare' ? action.unit : undefined);
                        const edited = revealKnownText(compileLesson({ ...lesson, ...(kind ? { kind } : {}) }, current,
                            previous?.id === current?.id ? previous ?? null : null, { profile, now: asOf }), confirmed);
                        profile[key] = edited;
                        ids = [edited.id, ...edited.materials.map(material => material.id), ...edited.exercises.map(exercise => exercise.id)];
                    } else if (name === 'LearningAssess') {
                        const { review: requestedReview, ...requested } = learningRecord(args, name, ['attemptId', 'verdict', 'understanding', 'expression', 'guidance', 'items', 'annotations', 'resolvedAnnotationIds', 'signal', 'review']);
                        requireLearning(requestedReview === undefined || typeof requestedReview === 'boolean', 'review', 'Use true for a learner-requested review');
                        const attemptId = requested.attemptId;
                        const attempt = [profile.unit, profile.review].flatMap(unit => unit?.attempts ?? []).find(entry => entry.id === attemptId)
                            ?? profile.items.flatMap(item => item.evidence).find(entry => entry.attempt.id === attemptId)?.attempt;
                        // A workbench step that re-judges disputed feedback is that review; the dispute already asked for it.
                        const disputed = [profile.unit, profile.review].flatMap(unit => unit?.assessments ?? [])
                            .some(entry => entry.attemptId === attemptId && entry.verdict === 'disputed');
                        const review = requestedReview === true || action.kind === 'assess' && action.review && action.attemptId === attemptId
                            || disputed && (action.kind === 'grade' || action.kind === 'revision-review' || action.kind === 'review-assess');
                        requireLearning(attempt && canReadLearningScope(attempt.scope, accessOsId), 'attemptId', 'This attempt is outside the action reading scope');
                        const result = assessLearning(profile, requested, { attemptId: attempt.id, review, inputScope, osId: options.osId, createId, now });
                        next.profiles[index] = result.profile;
                        ids = result.ids;
                    } else if (name === 'LearningModelEssay') {
                        const input = learningRecord(args, name, ['unitId', 'text', 'level']);
                        requireLearning(profile.unit && canReadLearningScope(profile.unit.scope, accessOsId), 'unitId', 'This unit is outside the action reading scope');
                        saveLearningModelEssay(profile, learningId(input.unitId, 'unitId'), { text: input.text, level: input.level },
                            { now: now(), osId: options.osId, inputScope });
                        ids = [profile.unit.id];
                    } else if (name === 'LearningReveal') {
                        const input = learningRecord(args, name, ['unitId', 'kind', 'id']);
                        const unit = profile[currentSlot(profile, input.unitId)];
                        requireLearning(unit && canReadLearningScope(unit.scope, accessOsId), 'unitId', 'Select an available lesson or review');
                        requireLearning(input.kind === 'answers' || input.kind === 'hints' || input.kind === 'transcripts', 'kind', 'Choose answers, hints or transcripts');
                        exposeLearningContent(profile, input.kind, learningId(input.id, 'id'), unit);
                        ids = [unit.id, String(input.id)];
                    } else if (name === 'LearningComplete') {
                        const input = learningRecord(args, name, ['unitId', 'attemptIds', 'summary']);
                        const key = currentSlot(profile, input.unitId);
                        const unit = profile[key];
                        requireLearning(unit && canReadLearningScope(unit.scope, accessOsId), 'unitId', 'This unit is outside the action reading scope');
                        const completed = completeLearning(profile, args, { osId: options.osId, inputScope, now });
                        next.profiles[index].completions = completed.completions;
                        ids = [unit.id];
                    } else { requireLearning(false, 'tool', 'This tool requires the application executor'); }
                }
                next = parseLearningData(next);
                // A display link is ephemeral: retiring its content must not block later work.
                if (nextPresentation) {
                    const profile = next.profiles.find(profile => profile.language === canonicalLanguage);
                    const unit = [profile?.unit, profile?.review].find(entry => entry?.id === nextPresentation!.unitId) ?? null;
                    const exists = unit && (nextPresentation.kind === 'material' ? unit.materials : unit.exercises).some(entry => entry.id === nextPresentation!.id);
                    nextPresentation = exists ? learningPresentation(unit, { kind: nextPresentation.kind, id: nextPresentation.id }) : null;
                }
                for (const profile of next.profiles) {
                    const known = expected?.data.profiles.find(entry => entry.language === profile.language)?.completions ?? [];
                    for (const completion of profile.completions.filter(entry => !known.some(old => old.unitId === entry.unitId))) {
                        const unit = [profile.unit, profile.review].find(entry => entry?.id === completion.unitId);
                        requireLearning(unit?.id === completion.unitId && completion.attemptIds.every(id => unit.attempts.some(attempt => attempt.id === id)
                            && unit.assessments.some(assessment => assessment.attemptId === id && assessment.verdict !== 'disputed')),
                        'completion', 'Keep resolved feedback for each attempt cited by the completion');
                    }
                }
                // Only a fully valid proposal can wait for consent; it has not changed the draft.
                if (approval) { return { ok: false, changed: false, ids: [], errors: [], approval }; }
                const changed = JSON.stringify(next) !== JSON.stringify(staged);
                if (changed && !discardEdit) {
                    const before = { presentation, units: { ...knownUnits }, tools: [...applied] };
                    discardEdit = () => {
                        staged = structuredClone(expected?.data ?? { profiles: [] });
                        presentation = before.presentation;
                        Object.assign(knownUnits, before.units);
                        applied.clear(); before.tools.forEach(tool => applied.add(tool));
                    };
                }
                staged = next;
                const updated = next.profiles.find(entry => entry.language === canonicalLanguage);
                for (const slot of ['unit', 'review'] as const) {
                    if (updated?.[slot]?.id !== expected?.data.profiles.find(entry => entry.language === canonicalLanguage)?.[slot]?.id) {
                        knownUnits[slot] = updated?.[slot]?.id;
                    }
                }
                presentation = nextPresentation;
                applied.add(name);
                return { ok: true, changed, ids, errors: [] };
            } catch (error) {
                if (!(error instanceof LearningValidationError)) { invalid = true; throw error; }
                const issue = { path: error.path, message: error.message };
                return { ok: false, changed: false, ids: [], errors: [issue] };
            }
        },
        async commit(guard: () => boolean) {
            const result = await checkpoint(guard);
            sealed = true;
            return result;
        },
        invalidate() { invalid = true; },
    };
}
