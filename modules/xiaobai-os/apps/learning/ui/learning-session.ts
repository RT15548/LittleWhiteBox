import { computed, inject, provide, reactive, watch, type InjectionKey, type Ref } from 'vue';
import type { LearningSelection } from '../../../domains/learning/notes.js';
import type { LearningClientState } from '../types.js';
import { learningAnswerDraftChanged, type LearningAnswerDraft } from './answer-draft.js';
import type { LearningEditorDraft } from './learning-editor.js';
import { learningRevisionWork } from './revision-work.js';

interface WritingDraft extends LearningEditorDraft {
    text: string;
    rewriting: boolean;
    submitted: { before: string | undefined; text: string } | null;
}
type Settings = NonNullable<LearningClientState['profile']>['settings'];
type SettingsForm = { [K in keyof Settings]: string };
export function learningSettingsInput(form: SettingsForm): Settings {
    const optional = (text: string) => text.trim() || null;
    return { exam: optional(form.exam), level: optional(form.level), targetLevel: optional(form.targetLevel),
        explanationLanguage: form.explanationLanguage, interests: optional(form.interests) };
}
interface UnitSession {
    reading: { view: 'reading' | 'feedback' | 'model' | null; scrolls: Partial<Record<'reading' | 'feedback' | 'model', number>> };
    writing: Record<string, WritingDraft>;
    edits: Record<string, { value: string; done: boolean } & LearningEditorDraft>;
    expanded: Record<string, boolean>;
    selection: LearningSelection | null;
    activities: Record<string, { scroll: number; selected: LearningSelection | null; retry: boolean; materialsOpen: boolean }>;
    activityDrafts: Record<string, { response: string; value: LearningAnswerDraft; submitted?: { before: string | undefined } }>;
    review: { index: number | null; drafts: Record<string, { value: LearningAnswerDraft; retry: boolean; submitted?: { before: string | undefined } }>; openReason: string; expanded: boolean; seenBefore: boolean | null };
}
const emptyChat = () => ({ text: '', cursor: undefined as LearningEditorDraft['cursor'], focus: null as { unitId?: string; exerciseId?: string; selection?: LearningSelection; help?: boolean } | null,
    study: null as { unitId: string; exerciseId?: string } | null,
    sent: null as { text: string; user: string; after: number } | null, scroll: 0, following: true });

/** Only unsaved interaction state lives here. No storage, model requests or copies of course content. */
export function createLearningUiSession() {
    const units = reactive<Record<string, UnitSession>>({});
    const chat = reactive(emptyChat());
    const workbenchChat = reactive(emptyChat());
    const settings = reactive({ open: false, form: { exam: '', level: '', targetLevel: '', explanationLanguage: 'zh-CN', interests: '' },
        submitted: null as { value: Settings; form: SettingsForm } | null });
    const companion = reactive({ enabled: false });
    const setup = reactive({ step: 0, name: '', note: '' });
    const books = reactive({ tab: 'grammar' as 'grammar' | 'vocabulary' | 'growth' | 'all', reason: '' });
    return {
        units, chat, workbenchChat, settings, companion, setup, books,
        unit(id: string) {
            units[id] ??= { reading: { view: null, scrolls: {} }, writing: {}, edits: {}, expanded: {}, selection: null, activities: {}, activityDrafts: {},
                review: { index: null, drafts: {}, openReason: '', expanded: false, seenBefore: null } };
            // Read through the reactive owner, including on first creation.
            return units[id];
        },
        reset(keepSetup = false, keepWork = false) {
            if (!keepWork) {
                for (const id of Object.keys(units)) { delete units[id]; }
                settings.open = false; settings.submitted = null;
                Object.assign(workbenchChat, emptyChat());
            }
            Object.assign(chat, emptyChat()); companion.enabled = false;
            if (!keepSetup) { Object.assign(setup, { step: 0, name: '', note: '' }); }
            Object.assign(books, { tab: 'grammar', reason: '' });
        },
        reconcile(state: LearningClientState) {
            const submittedSettings = settings.submitted;
            if (submittedSettings && state.storage === 'ready' && !state.busy && state.profile
                && Object.entries(submittedSettings.value).every(([key, value]) => state.profile!.settings[key as keyof Settings] === value)) {
                if (Object.entries(submittedSettings.form).every(([key, value]) => settings.form[key as keyof SettingsForm] === value)) { settings.open = false; }
                settings.submitted = null;
            }
            for (const id of Object.keys(units)) {
                const unit = [state.unit, state.review].find(unit => unit?.id === id);
                if (!unit) { delete units[id]; continue; }
                for (const [exerciseId, draft] of Object.entries(units[id].review.drafts)) {
                    const saved = unit.attempts.filter(attempt => attempt.exerciseId === exerciseId).at(-1);
                    if (draft.submitted && saved && saved.id !== draft.submitted.before) { delete units[id].review.drafts[exerciseId]; }
                }
                for (const [exerciseId, draft] of Object.entries(units[id].activityDrafts)) {
                    const saved = unit.attempts.filter(attempt => attempt.exerciseId === exerciseId).at(-1);
                    if (draft.submitted && saved && saved.id !== draft.submitted.before) {
                        delete units[id].activityDrafts[exerciseId];
                        const activity = units[id].activities[`exercise:${exerciseId}`];
                        if (activity) { activity.retry = false; }
                    }
                }
                const selection = units[id].selection;
                if (selection && unit.materials.find(material => material.id === selection.materialId)?.paragraphs
                    .find(paragraph => paragraph.id === selection.paragraphId)?.text.slice(selection.start, selection.end) !== selection.quote) {
                    units[id].selection = null;
                }
                for (const [exerciseId, draft] of Object.entries(units[id].writing)) {
                    const saved = unit.attempts.filter(attempt => attempt.exerciseId === exerciseId && !attempt.revisesAttemptId).at(-1);
                    const submitted = draft.submitted;
                    if (!submitted || !saved || saved.id === submitted.before) { continue; }
                    if (draft.text === submitted.text && saved.answer.kind === 'text' && saved.answer.text === submitted.text.trim()) {
                        draft.text = ''; draft.rewriting = false;
                    } else { draft.rewriting = true; }
                    draft.submitted = null;
                }
            }
            for (const [draft, conversation] of [[chat, state.conversation], [workbenchChat, state.workbenchConversation]] as const) {
                const sent = draft.sent;
                if (sent && conversation.turns.some((turn, index) => index + conversation.removedTurns >= sent.after
                    && turn.purpose === 'talk' && turn.user === sent.user)) {
                    if (draft.text === sent.text) { draft.text = ''; draft.focus = null; }
                    draft.sent = null;
                }
            }
        },
    };
}
type LearningUiSession = ReturnType<typeof createLearningUiSession>;
const key: InjectionKey<LearningUiSession> = Symbol('learning-ui-session');

/** A loss warning is derived from actual edits, not another dirty flag to synchronize. */
export function hasLearningUnsavedInput(session: LearningUiSession, state: LearningClientState): boolean {
    if (session.chat.text.trim() || session.workbenchChat.text.trim()) { return true; }
    if (session.settings.open && Object.entries(learningSettingsInput(session.settings.form))
        .some(([key, value]) => state.profile?.settings[key as keyof Settings] !== value)) { return true; }
    if (session.setup.step === 1 && session.setup.name.trim()
        && (session.setup.name.trim() !== state.teacher?.name || session.setup.note.trim() !== state.teacher.note)) { return true; }
    for (const unit of [state.unit, state.review]) {
        const local = unit && session.units[unit.id];
        if (!unit || !local) { continue; }
        if (Object.values(local.writing).some(draft => !!draft.text.trim())) { return true; }
        if (Object.keys(local.edits).length && learningRevisionWork(unit).some(work => work.row.status === 'revising'
            && work.annotations.some(annotation => local.edits[annotation.id] && local.edits[annotation.id].value !== annotation.quote))) { return true; }
        for (const exercise of unit.exercises) {
            const activity = local.activityDrafts[exercise.id]?.value;
            const review = local.review.drafts[exercise.id];
            if (activity && learningAnswerDraftChanged(activity, exercise.response)) { return true; }
            if (review && (review.retry || !unit.attempts.some(attempt => attempt.exerciseId === exercise.id))
                && learningAnswerDraftChanged(review.value, exercise.response)) { return true; }
        }
    }
    return false;
}

export function learningContextNeedsConfirmation(session: LearningUiSession, state: LearningClientState, action: string, input: Record<string, unknown>) {
    if (action === 'teacher') {
        return (input.teacher as LearningClientState['teacher'])?.name !== state.teacher?.name && !!session.chat.text.trim();
    }
    return action === 'language' && input.language !== state.language && hasLearningUnsavedInput(session, state);
}

export function provideLearningUiSession(state: Ref<LearningClientState>) {
    const session = createLearningUiSession();
    provide(key, session);
    watch([() => state.value.chatIdentity, () => state.value.language, () => state.value.companionSessionId], (next, previous) =>
        session.reset(next[0] === previous[0], next[0] === previous[0] && next[1] === previous[1]));
    watch(() => state.value, value => session.reconcile(value), { immediate: true });
    watch(() => [state.value.unit?.id, state.value.review?.id], ids => {
        for (const draft of [session.chat, session.workbenchChat]) {
            if (draft.focus?.unitId && !ids.includes(draft.focus.unitId)) { draft.focus = null; }
            if (draft.study && !ids.includes(draft.study.unitId)) { draft.study = null; }
        }
    });
    watch(() => hasLearningUnsavedInput(session, state.value), (dirty, _, cleanup) => {
        if (!dirty) { return; }
        const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
        window.addEventListener('beforeunload', warn);
        cleanup(() => window.removeEventListener('beforeunload', warn));
    }, { immediate: true });
    return session;
}
export function useLearningUiSession() {
    const session = inject(key);
    if (!session) { throw new Error('Learning views require their application session'); }
    return session;
}
export function useLearningUnitSession(id: () => string) {
    const session = useLearningUiSession();
    return computed(() => session.unit(id()));
}
