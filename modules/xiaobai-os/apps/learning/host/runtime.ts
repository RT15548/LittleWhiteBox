import { learningReferenceScopes } from '../application/conversation-references.js';
import type { AgentCapability } from '../../../capabilities/agent/index.js';
import type { EconomyReadCapability } from '../../../capabilities/economy/index.js';
import { parseLearningSelection } from '../../../domains/learning/notes.js';
import { learningRecord, learningText, LearningValidationError, parseLearningLanguageTag, type LearningTeacherPreference } from '../../../domains/learning/profile.js';
import type { LearningAnswer } from '../../../domains/learning/types.js';
import { learningInteger, requireLearning } from '../../../domains/learning/validation.js';
import { learningUnitStage } from '../../../domains/learning/stage.js';
import type { KnownPerson } from '../../../host/prompt-context/known-people.js';
import type { PartitionStore, XiaobaiOsFileControls } from '../../../kernel/contracts.js';
import type { XiaobaiOsExecutionScope } from '../../../kernel/execution-scope.js';
import type { XiaobaiOsAppActivationContext, XiaobaiOsAppRuntime } from '../../../types.js';
import type { LearningTeacherContext } from '../agent/context.js';
import { parseLearningActor, type LearningActor } from '../domain/conversation.js';
import type { LearningStoredWorkbench } from '../workbench-partition.js';
import type { LearningStoredCompanions } from '../partition.js';
import { createLearningConversationStorage } from '../application/conversation-storage.js';
import { LEARNING_CONVERSATION_COPY as conversationCopy } from '../application/conversation-copy.js';
import { isLearningConversation } from '../agent/access.js';
import { learningClassView } from '../application/projection.js';
import { createLearningId } from '../application/identity.js';
import { learningReplyNote } from '../application/reply-note.js';
import type { LearningAttemptBasis } from '../application/attempt.js';
import { createLearningPractice } from '../application/practice.js';
import { createLearningRewards } from '../application/rewards.js';
import { confirmedLearning, createLearningService, type LearningRepository } from '../application/service.js';
import { createLearningSpeech } from '../application/speech.js';
import { createLearningTeacherService } from '../application/teacher.js';
import { createLearningTeaching, type LearningClassroom, type LearningTeachingResult } from '../application/teaching.js';
import { learningProgressMessage, reportLearningFailure, LEARNING_STORAGE_COPY, LEARNING_REWARD_COPY } from '../application/feedback.js';
import { LearningStorageError } from '../storage/repository.js';
import { sameLearningDocument, type LearningDocument } from '../storage/document.js';
import type { LearningClientState } from '../types.js';
import type { LearningTtsFacade } from './media-adapter.js';
import type { LearningRewardPolicy } from '../reward-partition.js';
import { isWebConfigured } from '../../../../agent-core/web/tools.js';
import { learningPreparation } from '../../../domains/learning/preparation.js';
import { LEARNING_PREPARATION_COPY as prepCopy } from '../application/preparation-copy.js';
import { learningActionBusy, learningActionLane } from '../application/action-availability.js';
import { createLearningApprovals } from '../application/approval.js';
import { createLearningDelegatedWork } from './delegated-work.js';
import { shareLearningCourse } from '../application/course-sharing.js';

export function createLearningRuntime(deps: {
    repository: LearningRepository; store: PartitionStore<LearningStoredCompanions>; files: XiaobaiOsFileControls;
    workbenchStore: PartitionStore<LearningStoredWorkbench>; workbenchFiles: XiaobaiOsFileControls;
    rewardStore: PartitionStore<LearningRewardPolicy>; rewardFiles: XiaobaiOsFileControls;
    agent: AgentCapability; economy: EconomyReadCapability; execution: XiaobaiOsExecutionScope;
    chatIdentity(): string; playerName(): string; people(): KnownPerson[];
    capture(name: string, identity: string): Promise<LearningTeacherContext>;
    getTtsFacade?: () => LearningTtsFacade | undefined;
}): XiaobaiOsAppRuntime {
    let activation: XiaobaiOsAppActivationContext | null = null;
    let chatIdentity = '';
    let language = 'en';
    let epoch = 0;
    let job: object | null = null;
    let preparationJob: object | null = null;
    let preparation: LearningClientState['preparation'] = null;
    let sourceChoice: { reason: NonNullable<LearningClientState['sourceChoice']>; source: 'web' | 'authored'; input: Record<string, unknown>; unitId: string | null } | null = null;
    const chats: Record<LearningActor, { job: object | null; kind: string; progress: string }> = {
        workbench: { job: null, kind: '', progress: '' }, companion: { job: null, kind: '', progress: '' },
    };
    /** The stage request now running for a unit, so the workbench can show which step is being worked on. */
    let pending: LearningClientState['pending'] = null;
    let remark: LearningClientState['remark'] = null;
    let message = '';
    let progress = '';
    let loadFailed = false;
    let pendingCleanup: { commitId: string; before: LearningDocument | null; language?: string; clearAll: boolean } | null = null;
    // A lost clear receipt belongs to this conversation, not to the next language or companion.
    const pendingConversationClears = new Map<LearningActor, string>();
    let recordId = '';
    let offset = 0;
    const repository = deps.repository;
    const approvals = createLearningApprovals(publish);
    const activity = () => ({ busy: !!job,
        chatBusy: !!chats.companion.job && chats.companion.kind !== 'companion', workbenchBusy: !!chats.workbench.job, preparation });
    const canWork = (name: string) => !learningActionBusy(name, activity());
    const workbenchBusy = () => !!chats.workbench.job || !!job || !!preparationJob;
    const service = createLearningService(repository);
    const teacher = createLearningTeacherService(deps.store, { knownPeople: deps.people, playerName: deps.playerName });
    const rewards = createLearningRewards({ repository: deps.repository, store: deps.rewardStore, files: deps.rewardFiles, economy: deps.economy });
    const histories = createLearningConversationStorage({ companions: deps.store, workbench: deps.workbenchStore, data: () => repository.snapshot().document?.data, osId: () => deps.store.peekCurrent()?.osId ?? null });
    const active = () => !!activation?.isCurrent() && chatIdentity === deps.chatIdentity();
    function current(): LearningClassroom | null {
        const saved = deps.store.peekCurrent();
        return active() && saved?.osId ? { language, osId: saved.osId, chatIdentity, teacher: null } : null;
    }
    function companionCurrent(): LearningClassroom | null {
        const workspace = current();
        const selected = teacher.selected();
        return workspace && selected ? { ...workspace, teacher: selected.person, sessionId: selected.id } : null;
    }
    function persona(actor: LearningActor): ReturnType<typeof createLearningTeaching> {
        return createLearningTeaching({ actor, repository, gateway: deps.agent,
            current: actor === 'workbench' ? current : companionCurrent, capture: deps.capture,
            memory: () => histories.port(actor, language, teacher.selected()?.id ?? null),
            historyReady: () => (actor === 'workbench' ? deps.workbenchFiles : deps.files).getFileState() === 'ready',
            onConversation: publish, confirm: approvals.request, onSettled: payPending,
            delegate: (request, signal) => delegated.start(request, signal),
            taskGet: taskId => delegated.get(taskId),
            workbench: () => ({ busy: workbenchBusy(), tasks: delegated.list() }),
            onProgress: (next, action) => {
                const text = learningProgressMessage(next);
                if (isLearningConversation(action)) { chats[actor].progress = text; } else { progress = text; }
                publish();
            },
        });
    }
    const teaching = persona('workbench');
    const companion = persona('companion');
    const delegated = createLearningDelegatedWork({
        owner: () => companionCurrent() ? JSON.stringify(companionCurrent()) : null,
        workBusy: workbenchBusy,
        canNotify: retrySave => !!companionCurrent() && !chats.companion.job
            && (deps.files.getFileState() === 'ready' || retrySave === true && deps.files.getFileState() === 'unconfirmed'),
        awaitingApproval: () => !!approvals.current(),
        run: work => deps.execution.run(work), changed: publish,
        notificationTurn: taskId => companion.notificationTurn(taskId),
        resetNotification: taskId => companion.resetNotification(taskId),
        saveNotification: taskId => runDelegatedLane('companion', async () => {
            if (deps.files.getFileState() === 'unconfirmed') { await deps.files.retryPending(); }
            if (deps.files.getFileState() !== 'ready') { return false; }
            await companion.verifyHistory();
            return companion.notificationTurn(taskId)?.notice === 'history-save' ? companion.saveNotification(taskId) : true;
        }, 'task-result', false),
        work: (request, taskId, retryId) => runDelegatedLane('workbench', () => teaching.run({ ...request, taskId,
            displayMessage: '', action: { kind: 'talk', unitId: request.target.unitId } }, retryId), 'talk', { status: 'cancelled' }),
        notify: (taskResult, retryId) => runDelegatedLane('companion', () => companion.run({
            message: '', action: { kind: 'task-result', taskId: taskResult.taskId }, taskResult, target: structuredClone(taskResult.target),
        }, retryId), 'task-result', { status: 'cancelled' }),
    });
    function runDelegatedLane<T>(actor: LearningActor, run: () => Promise<T>, kind: string, cancelled: T): Promise<T> {
        const token = {};
        const owned = epoch;
        const lane = chats[actor];
        lane.job = token; lane.kind = kind; lane.progress = '';
        if (actor === 'companion') { remark = null; }
        return deps.execution.run(async () => {
            try { return active() && owned === epoch && lane.job === token ? await run() : cancelled; }
            finally {
                if (lane.job === token) { lane.job = null; lane.kind = ''; lane.progress = ''; }
                // The delegation owner publishes after recording the outcome and reserving delivery.
            }
        });
    }
    const runner = (actor: LearningActor) => actor === 'workbench' ? teaching : companion;
    const conversationKey = (actor: LearningActor) => JSON.stringify(actor === 'workbench' ? current() : companionCurrent());
    async function restoreConversation(actor: LearningActor, adopted = false) {
        const pendingKey = pendingConversationClears.get(actor);
        if (adopted || pendingKey === conversationKey(actor)) {
            if (actor === 'companion') { delegated.clear(); }
            runner(actor).reset();
            chats[actor].progress = '';
        }
        pendingConversationClears.delete(actor);
        await runner(actor).hydrate();
        await runner(actor).verifyHistory();
    }
    const practice = createLearningPractice({ repository, teaching, current });
    const speech = createLearningSpeech({ repository, current, getFacade: deps.getTtsFacade,
        onState: media => { if (active()) { activation!.post('learning/media', { media }); } }, onSave: () => publish(),
        onError: error => { message = error instanceof LearningStorageError && error.code === 'learning_file_full'
            ? '学习文件已满，已暂停播放。请先导出或清理不需要的学习记录；腾出空间后再操作，会重试保存听取记录。'
            : repository.snapshot().status === 'ready'
                ? '听取记录保存失败，已暂停播放。请重试刚才的操作，会先重试保存听取记录。'
                : '还不确定播放记录是否保存成功，请先检查保存再作答；题目不会更换。'; publish(); } });

    function state(): LearningClientState {
        const snapshot = repository.snapshot();
        const saved = deps.store.peekCurrent();
        const view = learningClassView(snapshot.document?.data ?? { profiles: [] }, language, saved?.osId ?? null, offset, recordId, rewards.status);
        // Keep navigation on the displayed page when deletion or a server read shrinks the list.
        offset = view.records.offset;
        return { ...view,
            chatIdentity, commitId: snapshot.document?.commitId ?? null, language, teacher: teacher.selected()?.person ?? null, companionSessionId: teacher.selected()?.id ?? null,
            candidates: teacher.candidates().map(person => ({ name: person.name, aliases: person.aliases })),
            storage: loadFailed && snapshot.status === 'ready' ? 'unloaded' : snapshot.status, chatStorage: deps.files.getFileState(), workbenchStorage: deps.workbenchFiles.getFileState(), walletStorage: deps.rewardFiles.getFileState(),
            sourceChoice: !preparationJob && snapshot.status === 'ready' && sourceChoice?.unitId === view.currentUnitId ? sourceChoice.reason : null, ...activity(), approval: approvals.current(),
            companionBusy: !!chats.companion.job && chats.companion.kind === 'companion', chatMessage: chats.companion.progress, workbenchMessage: chats.workbench.progress,
            message: job ? progress : message, reply: teaching.reply(), pending, remark, companionReply: companion.reply(), delegatedTasks: delegated.views(),
            conversation: companion.conversation(), workbenchConversation: teaching.conversation(),
            walletOpen: deps.economy.isOpen(), media: speech.media.snapshot(), voices: speech.media.capabilities() };
    }
    function publish() { if (active()) { activation!.post('learning/state', { state: state() }); } }
    /** No learner job is running; a companion remark does not count, it gives way. */
    function idle() { return !learningActionBusy('language', activity()); }
    /** Retire course work without cancelling the storage command that confirmed its reset. */
    function clearLearningWork() {
        delegated.clear();
        for (const lane of Object.values(chats)) { lane.job = null; lane.kind = ''; lane.progress = ''; }
        preparationJob = null; preparation = null; sourceChoice = null;
        pending = null; remark = null;
    }
    function cancel() {
        clearLearningWork();
        epoch++; teaching.cancel(); companion.cancel(); speech.stop(); job = null; progress = '';
    }
    function cancelConversation(actor: LearningActor) {
        runner(actor).cancel('conversation'); chats[actor].job = null; chats[actor].kind = ''; chats[actor].progress = '';
        delegated.cancel(actor);
    }
    /** Abort only the unprompted conversation lane; a workbench request has an independent lifetime. */
    function yieldRemark() {
        if (chats.companion.job && chats.companion.kind === 'companion') { cancelConversation('companion'); }
    }
    function saved(result: { status: string }) {
        if (result.status === 'unconfirmed') { message = LEARNING_STORAGE_COPY.unconfirmed; }
        else if (result.status === 'conflict') { message = repository.snapshot().status === 'invalid' ? LEARNING_STORAGE_COPY.invalid : LEARNING_STORAGE_COPY.conflict; }
        else if (result.status === 'failed') { message = LEARNING_STORAGE_COPY.failed; }
        return result.status === 'confirmed' || result.status === 'unchanged';
    }
    async function pay(unitId: string, open: boolean, guard: () => boolean) {
        const result = await rewards.settle(language, unitId, open, guard);
        // A save or storage warning already on screen matters more than the payment note.
        if (!guard() || message) { return result; }
        // Successful settlement and wallet setup already have a home in the completion card.
        if (!['paid', 'wallet-closed', 'retired', 'cancelled'].includes(result)) { message = LEARNING_REWARD_COPY.unknown; }
        return result;
    }
    /** All entry points settle confirmed completion records, including units retired by later tools. */
    async function payPending(guard: () => boolean) {
        if (!guard() || repository.snapshot().status !== 'ready') { return; }
        const profile = profileNow();
        for (const completion of profile?.completions ?? []) {
            if (rewards.status(completion) === 'available') {
                if (!guard() || repository.snapshot().status !== 'ready') { break; }
                const result = await pay(completion.unitId, false, guard);
                // A failed file/ledger write affects this settlement pass, not just one lesson.
                if (result !== 'paid' && result !== 'retired') { break; }
            }
        }
    }
    async function afterTeaching(result: LearningTeachingResult, guard: () => boolean) {
        if (!guard()) { return; }
        if (result.status === 'failed') { if (!result.displayed) { message = result.message; } return; }
        if (result.status !== 'finished') { saved(result); return; }
    }
    function profileNow() { return confirmedLearning(repository)?.data.profiles.find(entry => entry.language === language) ?? null; }
    /** The current lesson or review group with this id, when this story may read it. */
    function slot(unitId: string) {
        const classroom = current();
        const profile = profileNow();
        const found = [profile?.unit, profile?.review].find(entry => entry?.id === unitId);
        requireLearning(classroom && found && (found.scope.kind === 'public' || found.scope.osId === classroom.osId), 'unitId', 'Select an available current unit');
        return found;
    }
    const stageRequests = {
        grade: '请批改这课已经交上的答案，接着根据实际情况完成这次教学工作。还没写的留给我继续写。',
        'revision-review': '我按批注改好了，请复核修订稿。',
        'model-essay': '请给我一篇这次作文的范文。',
        'review-assess': '请批改这组复习题中已经交上的答案。',
    } as const;
    const nextStage: Partial<Record<string, keyof typeof stageRequests>> = { grading: 'grade', reviewing: 'revision-review', model: 'model-essay' };
    /** Native buttons express an intent; the teacher owns the complete tool loop. */
    async function advance(unitId: string, guard: () => boolean, intent?: keyof typeof stageRequests) {
        if (!guard()) { return; }
        const target = slot(unitId);
        const progress = learningUnitStage(target, current()!.osId);
        const purpose = intent ?? (target.kind === 'review' ? 'review-assess'
            : progress.exercises.some(row => row.status === 'grading') ? 'grade'
                : progress.exercises.some(row => row.status === 'reviewing') ? 'revision-review' : nextStage[progress.stage] ?? 'grade');
        pending = { purpose, unitId }; publish();
        const result = await teaching.run({ action: { kind: purpose, unitId }, message: stageRequests[purpose] });
        pending = null;
        await afterTeaching(result, guard);
    }
    async function cleanHistories(before: LearningDocument | null, guard: () => boolean, deletedLanguage?: string, clearAll = false) {
        const remaining = learningReferenceScopes(repository.snapshot().document?.data);
        const removed = new Set([...learningReferenceScopes(before?.data).keys()].filter(id => !remaining.has(id)));
        if (!removed.size && !deletedLanguage && !clearAll) { return; }
        delegated.clear();
        cancelConversation('workbench'); cancelConversation('companion');
        teaching.reset(); companion.reset();
        const result = await histories.prune(removed, guard, deletedLanguage, clearAll);
        if (result.status !== 'confirmed' && result.status !== 'unchanged') { message = conversationCopy.memoryClearFailed; }
        if (guard()) { await teaching.hydrate(); await companion.hydrate(); }
    }
    async function restoreTeaching() {
        if (pendingCleanup && repository.snapshot().status === 'ready') {
            if (repository.snapshot().document?.commitId === pendingCleanup.commitId) {
                await cleanHistories(pendingCleanup.before, active, pendingCleanup.language, pendingCleanup.clearAll);
            }
            pendingCleanup = null;
        }
        await teaching.recoverConfirmed();
        await teaching.hydrate(); await companion.hydrate();
    }
    function unit() {
        const classroom = current();
        const profile = confirmedLearning(repository)?.data.profiles.find(entry => entry.language === language);
        requireLearning(classroom && profile?.unit && (profile.unit.scope.kind === 'public' || profile.unit.scope.osId === classroom.osId), 'unit', 'Select an available lesson');
        return profile.unit;
    }
    function stopPreparation() {
        teaching.cancel('preparation'); preparationJob = null;
        if (preparation) { preparation = { ...preparation, running: false, message: prepCopy.stopped }; }
    }
    function startPreparation(article?: { source: 'web' | 'authored'; replaceCurrent: boolean; message: string }) {
        if (preparationJob) { return; }
        const token = {};
        const owned = epoch;
        const guard = () => active() && epoch === owned && preparationJob === token;
        preparationJob = token;
        sourceChoice = article ? { reason: 'unavailable', source: article.source,
            input: { message: article.message, replaceCurrent: article.replaceCurrent }, unitId: profileNow()?.unit?.id ?? null } : null;
        preparation = { phase: article ? 'article' : 'notes', running: true, message: '', ...(article ? { source: article.source } : {}) };
        void deps.execution.run(async () => {
            try {
                const result = await teaching.run({ action: { kind: 'prepare', unit: 'reading-writing',
                    replaceCurrent: article?.replaceCurrent ?? false, ...(article ? { source: article.source } : {}) },
                message: article?.message ?? '请接着完成当前文章的备课，沿用之前商定的要求。' });
                if (!guard()) { return; }
                if (result.status !== 'finished') {
                    preparation!.message = result.status === 'failed' ? result.message : prepCopy.stopped; return;
                }
                if (article && (profileNow()?.unit?.id ?? null) === sourceChoice?.unitId) {
                    preparation!.message = result.text;
                    await afterTeaching(result, guard);
                    return;
                }
                sourceChoice = null;
                preparation = null;
                await afterTeaching(result, guard);
            } catch (error) {
                if (guard() && preparation) { preparation.message = reportLearningFailure('prepare', error instanceof LearningStorageError ? error.code : 'learning_action_failed', { stage: 'action', cause: error }); }
            } finally {
                if (preparationJob === token) {
                    preparationJob = null;
                    if (preparation) { preparation = { ...preparation, running: false }; }
                    publish();
                }
            }
        });
        publish();
    }
    async function prepareReading(input: Record<string, unknown>, guard: () => boolean, source: 'web' | 'authored' = 'web') {
        const profile = profileNow();
        const replaceCurrent = input.replaceCurrent === true;
        if (profile?.unit && !replaceCurrent) {
            const target = unit();
            if (target.kind === 'reading-writing' && !learningPreparation(target).ready) { startPreparation(); }
            return;
        }
        if (source === 'web') {
            const config = await deps.agent.loadConfig();
            if (!guard()) { return; }
            if (!isWebConfigured(config)) { sourceChoice = { reason: 'unconfigured', source, input: structuredClone(input), unitId: profile?.unit?.id ?? null }; return; }
        }
        if (guard()) { startPreparation({ source, replaceCurrent, message: learningText(input.message, 'message', 4000) }); }
    }
    function selection(value: unknown) {
        const lesson = unit();
        const selected = parseLearningSelection(value, lesson.materials);
        const visible = state().unit?.materials.find(material => material.id === selected.materialId);
        requireLearning(visible && !visible.hidden, 'selection', 'Reveal the transcript before selecting text');
        return selected;
    }
    async function action(name: string, input: Record<string, unknown>, guard: () => boolean, answerBasis?: LearningAttemptBasis) {
        if (name === 'reset-learning') {
            saved(await repository.resetInvalid(guard, () => {
                clearLearningWork(); teaching.reset(); companion.reset();
            }));
            if (!guard()) { return; }
            if (repository.snapshot().status === 'ready') {
                await teacher.read(); await deps.workbenchStore.read(); await deps.economy.refresh();
                if (!guard()) { return; }
                await restoreTeaching();
            }
            if (guard()) { loadFailed = false; }
            return;
        }
        if (name === 'verify-teacher' || name === 'adopt-teacher') {
            const before = teacher.selected()?.person;
            const result = name === 'verify-teacher' ? await deps.files.retryPending({ readOnly: true }) : await deps.files.adoptServerState();
            if (deps.files.getFileState() !== 'ready') { return; }
            await teacher.read();
            if (guard()) { await restoreConversation('companion', result.status === 'adopted' || JSON.stringify(before) !== JSON.stringify(teacher.selected()?.person)); }
            return;
        }
        if (name === 'read' || name === 'verify' || name === 'retry-save' || name === 'adopt-server') {
            const before = repository.snapshot();
            if (name === 'verify') { saved(await repository.verify()); }
            else if (name === 'retry-save') { saved(await repository.retry(guard)); }
            else if (name === 'adopt-server') { await repository.adoptServer(); teaching.reset(); pendingCleanup = null; }
            else { await repository.refresh(); }
            await teacher.read(); await deps.economy.refresh(); loadFailed = false;
            if (!guard()) { return; }
            if (name === 'read' && before.status === 'ready' && !sameLearningDocument(before.document ?? null, repository.snapshot().document ?? null)) {
                teaching.reset();
            }
            await restoreTeaching();
            // Reading or confirming a save may reveal a completion that is now certain; the wallet takes it once.
            if (guard()) { await payPending(guard); }
            return;
        }
        if (name === 'verify-wallet' || name === 'adopt-wallet') {
            saved(await (name === 'verify-wallet' ? deps.rewardFiles.retryPending() : deps.rewardFiles.adoptServerState()));
            if (guard() && pendingConversationClears.has('workbench') && deps.workbenchFiles.getFileState() === 'ready') {
                await restoreConversation('workbench', name === 'adopt-wallet');
            }
            await deps.economy.refresh();
            if (guard()) { await payPending(guard); }
            return;
        }
        if (name === 'verify-workbench' || name === 'adopt-workbench') {
            const result = name === 'verify-workbench' ? await deps.workbenchFiles.retryPending({ readOnly: true }) : await deps.workbenchFiles.adoptServerState();
            if (guard() && deps.workbenchFiles.getFileState() === 'ready') { await restoreConversation('workbench', result.status === 'adopted'); }
            return;
        }
        if (name === 'forget-conversation') {
            const actor = parseLearningActor(input.target);
            if (actor === 'companion') { delegated.clear(); }
            cancelConversation(actor);
            const key = conversationKey(actor);
            const cleared = await histories.clear(actor, language, teacher.selected()?.id ?? null, guard);
            if (!guard()) { return; }
            if (cleared.status === 'confirmed' || cleared.status === 'unchanged') { await restoreConversation(actor, true); }
            else {
                if (cleared.status === 'unconfirmed' || cleared.status === 'conflict') {
                    pendingConversationClears.set(actor, key); runner(actor).forgetHistory();
                }
                chats[actor].progress = conversationCopy.memoryClearFailed;
            }
            return;
        }
        requireLearning(!loadFailed, 'storage', 'Read the learning file first');
        confirmedLearning(repository);
        if (name === 'choose-original' || name === 'retry-source') {
            requireLearning(sourceChoice, 'source', 'Choose an article source first');
            requireLearning((profileNow()?.unit?.id ?? null) === sourceChoice.unitId, 'unitId', 'The current article changed; choose again');
            await prepareReading(sourceChoice.input, guard, name === 'choose-original' ? 'authored' : sourceChoice.source); return;
        }
        if (name === 'resume-preparation') {
            requireLearning(unit().id === input.unitId && unit().kind === 'reading-writing', 'unitId', 'Continue the current reading article');
            startPreparation(); return;
        }
        if (name === 'teacher') {
            const before = await teacher.read();
            const selected = input.teacher as LearningTeacherPreference['teacher'];
            if (JSON.stringify(teacher.selected()?.person ?? null) === JSON.stringify(selected)) { return; }
            if (saved(await teacher.select(before.identityKey, input.teacher as LearningTeacherPreference['teacher'], guard))) { delegated.clear(); companion.reset(); await companion.hydrate(); }
            if (deps.files.getFileState() !== 'ready') { message = ''; }
            return;
        }
        if (name === 'profile') {
            await afterTeaching(await teaching.run({ action: { kind: 'profile' }, message: learningText(input.message, 'message', 4000) }), guard); return;
        }
        if (name === 'prepare' || name === 'replace-lesson') {
            if (!profileNow() && !saved(await service.saveSettings(language, {}, guard))) { return; }
            if (!guard()) { return; }
            if (name === 'replace-lesson') {
                const profile = confirmedLearning(repository)?.data.profiles.find(entry => entry.language === language);
                requireLearning(profile?.unit?.id === input.unitId, 'unitId', 'The lesson has changed; ask the teacher again before replacing it');
            }
            requireLearning(input.kind === undefined || input.kind === 'reading-writing' || input.kind === 'lesson', 'kind', 'Choose reading-writing or lesson');
            const profile = profileNow();
            // A completed unit is put aside by the next one without asking again.
            const finished = !!profile?.unit && profile.completions.some(entry => entry.unitId === profile.unit!.id);
            if (input.kind !== 'lesson') {
                await prepareReading({ ...input, replaceCurrent: name === 'replace-lesson' || input.replaceCurrent === true || finished }, guard); return;
            }
            await afterTeaching(await teaching.run({ action: { kind: 'prepare', replaceCurrent: name === 'replace-lesson' || input.replaceCurrent === true || finished,
                ...(input.kind ? { unit: input.kind as 'reading-writing' | 'lesson' } : {}) },
                message: learningText(input.message, 'message', 4000) }), guard); return;
        }
        if (name === 'submit') {
            const result = await practice.submit({ unitId: learningText(input.unitId, 'unitId', 128), exerciseId: learningText(input.exerciseId, 'exerciseId', 128),
                answer: input.answer as LearningAnswer, replays: 0, slowPlayback: false }, guard, answerBasis);
            if (result.status === 'saved' && result.teaching) {
                await afterTeaching(result.teaching, guard);
            }
            else if (result.status !== 'saved') { saved(result); }
            if (result.status === 'saved' && guard()) {
                const target = profileNow()?.review;
                if (target && target.id === input.unitId && learningUnitStage(target, current()!.osId).stage === 'grading') {
                    await advance(target.id, guard);
                } else if (!result.teaching) { await payPending(guard); }
            }
            return;
        }
        if (name === 'assess') {
            const attemptId = learningText(input.attemptId, 'attemptId', 128);
            if (input.review === true && !saved(await service.dispute(language, attemptId, current()!.osId, guard))) { return; }
            if (!guard()) { return; }
            await afterTeaching(await teaching.run({ action: { kind: 'assess', attemptId, review: input.review === true },
                message: learningText(input.message, 'message', 4000) }), guard); return;
        }
        if (name === 'settings') { saved(await service.saveSettings(language, input.value, guard)); return; }
        if (name === 'bookmark') {
            saved(await service.bookmarkTerm(language, slot(learningText(input.unitId, 'unitId', 128)).id, learningText(input.materialId, 'materialId', 128),
                learningText(input.paragraphId, 'paragraphId', 128), learningText(input.termText, 'termText', 400), guard)); return;
        }
        if (name === 'skip-revision' || name === 'submit-revision') {
            const unitId = slot(learningText(input.unitId, 'unitId', 128)).id;
            const result = name === 'skip-revision' ? await service.skipRevision(language, unitId, current()!.osId, guard)
                : await service.submitRevision(language, unitId, input.revisions, current()!.osId, guard, answerBasis);
            if (saved(result) && guard()) { await advance(unitId, guard, name === 'submit-revision' ? 'revision-review' : 'model-essay'); }
            return;
        }
        if (name === 'grade') { await advance(slot(learningText(input.unitId, 'unitId', 128)).id, guard); return; }
        if (name === 'start-review') {
            const classroom = current();
            requireLearning(classroom, 'workspace', 'Open the learning workspace first');
            const profile = profileNow();
            const open = profile?.review;
            requireLearning(!open || profile!.completions.some(entry => entry.unitId === open.id), 'review', 'Finish or put aside the current review first');
            const asOf = new Date().toISOString();
            const due = service.reviewSelection(language, asOf, classroom.osId);
            requireLearning(due, 'review', 'Nothing is due for review');
            pending = { purpose: 'review-prepare' }; publish();
            const result = await teaching.run({ action: { kind: 'review-prepare', itemIds: due.itemIds, asOf }, message: '开始今天的复习。' });
            pending = null;
            await afterTeaching(result, guard); return;
        }
        if (name === 'abandon-review') { saved(await service.abandonReview(language, guard)); return; }
        if (name === 'complete') {
            await afterTeaching(await teaching.run({ action: { kind: 'complete' }, message: '请根据已经保存的练习和反馈，看看这一课是否已经达到可以收课的程度。' }), guard); return;
        }
        if (name === 'reveal') {
            const lesson = input.unitId === undefined ? unit() : slot(learningText(input.unitId, 'unitId', 128));
            requireLearning(['answers', 'hints', 'transcripts'].includes(String(input.kind)), 'kind', 'Choose what to reveal');
            saved(await service.reveal(language, lesson.id, input.kind as 'answers' | 'hints' | 'transcripts',
                learningText(input.id, 'id', 128), current()!.osId, guard)); return;
        }
        if (name === 'voice') { saved(await service.setVoice(language, input.voice, guard)); return; }
        if (name === 'share-course') {
            saved(await shareLearningCourse(repository, { language, unitId: learningText(input.unitId, 'unitId', 128), osId: current()!.osId,
                commitId: learningText(input.commitId, 'commitId', 128), approved: input.approved === true }, guard)); return;
        }
        if (name === 'play') {
            await speech.play({ materialId: String(input.materialId), partKey: String(input.partKey), exerciseId: typeof input.exerciseId === 'string' ? input.exerciseId : undefined }); return;
        }
        if (name === 'say') { await speech.say(selection(input.selection).quote); return; }
        if (name === 'say-reply') {
            const spoken = runner(parseLearningActor(input.target)).reply(learningText(input.id, 'id', 128));
            requireLearning(spoken?.text, 'reply', 'Select a current reply');
            await speech.say(spoken.text); return;
        }
        if (name === 'say-question') {
            const exercise = unit().exercises.find(entry => entry.id === input.exerciseId);
            requireLearning(exercise, 'exerciseId', 'Select a current exercise');
            await speech.say(exercise.prompt); return;
        }
        if (name === 'save-note') {
            const noteReply = runner(parseLearningActor(input.target)).reply(learningText(input.id, 'id', 128));
            const lesson = input.unitId === undefined ? unit() : slot(learningText(input.unitId, 'unitId', 128));
            const target = learningReplyNote(lesson, noteReply);
            requireLearning(noteReply && target, 'reply', 'Choose a current explanation');
            if (target.saved) { return; }
            saved(await service.note(language, lesson.id, { id: createLearningId(), ...target.note }, guard, noteReply.scope)); return;
        }
        if (name === 'delete-note') {
            const lesson = input.unitId === undefined ? unit() : slot(learningText(input.unitId, 'unitId', 128));
            saved(await service.note(language, lesson.id, String(input.id), guard)); return;
        }
        if (name === 'reward') { await pay(String(input.unitId), input.openWallet === true, guard); return; }
        if (name === 'delete-item') {
            if (saved(await service.deleteItem(language, String(input.id), current()!.osId, guard))) { await payPending(guard); }
            recordId = ''; return;
        }
        if (name === 'delete-attempt') { saved(await service.deleteAttempt(language, String(input.id), current()!.osId, guard)); return; }
        requireLearning(!deps.rewardFiles.hasPendingCommit(), 'wallet', 'Resolve pending wallet changes before deleting learning data');
        if (name === 'abandon') { saved(await service.abandonUnit(language, guard)); return; }
        if (name === 'delete-language') { saved(await service.deleteLanguage(language, guard)); return; }
        if (name === 'clear') { saved(await repository.clear(confirmedLearning(repository), guard)); return; }
        throw new Error('learning_unknown_action');
    }
    function launch(name: string, input: Record<string, unknown>, answerBasis?: LearningAttemptBasis) {
        if (name === 'talk' || name === 'companion' || name === 'retry-chat') { return launchConversation(name, input); }
        yieldRemark();
        if (!active()) { return; }
        if (!canWork(name)) { return 'busy' as const; }
        const owned = epoch;
        const token = {};
        const guard = () => active() && epoch === owned && job === token;
        job = token; progress = '正在处理你的请求…';
        message = ''; remark = null;
        // Stop first so hearing facts cannot race a teacher snapshot or a submitted answer.
        speech.stop();
        void deps.execution.run(async () => {
            const cleanup = ['delete-note', 'delete-item', 'delete-attempt', 'abandon', 'delete-language', 'clear'].includes(name);
            const pendingBefore = repository.pendingCommitId();
            let before = repository.snapshot().document;
            try {
                if (!guard()) { return; }
                // Free space before retrying hearing writes. Repository confirmation/conflict guards still apply.
                if (cleanup || name === 'reset-learning') { await speech.settle(); }
                else if (!await speech.flush()) { return; }
                before = repository.snapshot().document;
                if (guard()) {
                    await action(name, input, guard, answerBasis);
                }
            }
            catch (error) {
                if (guard()) {
                    message = error instanceof LearningStorageError ? reportLearningFailure(name, error.code, { stage: 'save', cause: error })
                        : error instanceof Error && error.message === 'learning_teacher_is_player' ? '请选择其他已知人物作为语伴，不能选择自己。'
                            : reportLearningFailure(name, error instanceof LearningValidationError ? 'learning_input_invalid' : 'learning_action_failed', { stage: 'action', cause: error });
                }
            } finally {
                if (cleanup && guard() && repository.pendingCommitId() !== pendingBefore && repository.pendingCommitId()) {
                    pendingCleanup = { commitId: repository.pendingCommitId()!, before: before ?? null, language: name === 'delete-language' ? language : undefined, clearAll: name === 'clear' };
                }
                if (cleanup && guard() && !sameLearningDocument(before ?? null, repository.snapshot().document ?? null)) {
                    await cleanHistories(before ?? null, guard, name === 'delete-language' ? language : undefined, name === 'clear');
                }
                if (job === token) { job = null; progress = ''; pending = null; delegated.drain(); publish(); }
            }
        });
        publish();
    }
    function launchConversation(name: 'talk' | 'companion' | 'retry-chat', input: Record<string, unknown>) {
        const actor = name === 'companion' ? 'companion' : parseLearningActor(input.target);
        const lane = chats[actor];
        if (name !== 'companion') { yieldRemark(); }
        if (!active() || actor === 'companion' && !teacher.selected() || name === 'companion' && (lane.job || job || chats.workbench.job)) { return; }
        if (lane.job) { return 'busy' as const; }
        const retryId = name === 'retry-chat' && typeof input.id === 'string' ? input.id : undefined;
        let original: ReturnType<ReturnType<typeof createLearningTeaching>['retryRequest']> = null;
        if (name === 'retry-chat') {
            original = retryId ? runner(actor).retryRequest(retryId) : null;
            const storageReady = (actor === 'workbench' ? deps.workbenchFiles : deps.files).getFileState() === 'ready';
            if (!original || !storageReady) { lane.progress = conversationCopy.retryUnavailable; publish(); return; }
            if (original.taskId) { return delegated.retryWork(original.taskId, retryId!); }
            input = { ...original, unitId: original.action.kind === 'talk' ? original.action.unitId : undefined };
        }
        if (actor === 'companion') { remark = null; }
        const token = {};
        const owned = epoch;
        lane.job = token; lane.kind = name; lane.progress = '';
        const guard = () => active() && epoch === owned && lane.job === token;
        void deps.execution.run(async () => {
            try {
                const answerBasis = original?.answerBasis ?? { document: repository.snapshot().document ?? null, submittedAt: new Date().toISOString() };
                const exerciseId = input.exerciseId === undefined ? undefined : learningText(input.exerciseId, 'exerciseId', 128);
                const unitId = original && original.action.kind === 'talk' ? original.action.unitId
                    : name !== 'companion' && input.unitId !== undefined ? slot(learningText(input.unitId, 'unitId', 128)).id : undefined;
                const selected = original ? original.selection ?? null : input.selection ? selection(input.selection) : null;
                const materialId = name === 'companion' && input.materialId !== undefined ? learningText(input.materialId, 'materialId', 128) : undefined;
                const paragraphId = name === 'companion' && input.paragraphId !== undefined ? learningText(input.paragraphId, 'paragraphId', 128) : undefined;
                const text = name === 'companion' ? '' : learningText(input.message, 'message', selected ? 1800 : 4000);
                // Explicit help on a question is an application event. A quoted article is ordinary conversation.
                if (input.help === true && exerciseId && unitId && !selected) {
                    const exposed = await service.reveal(language, unitId, 'hints', exerciseId, current()!.osId, guard);
                    if (!saved(exposed) || !guard()) { return; }
                }
                const result = await runner(actor).run(original ?? { action: name === 'companion' ? { kind: name, materialId, paragraphId } : { kind: 'talk', ...(unitId ? { unitId } : {}) },
                    exerciseId, selection: selected, message: text, answerBasis,
                    displayMessage: selected ? `${text}\n\n${selected.quote}` : text }, retryId);
                if (!guard()) { return; }
                // The runner owns a failed turn's notice; the outer lane reports only failures before a turn exists.
                lane.progress = '';
                if (result.status === 'failed' && !result.displayed) { lane.progress = result.message; }
                if (result.status === 'finished') {
                    if (name === 'companion') {
                        if (result.text.trim()) { remark = { text: result.text, materialId, paragraphId }; }
                    }
                }
            } catch (error) {
                if (guard()) { lane.progress = reportLearningFailure(name, error instanceof LearningStorageError ? error.code
                    : error instanceof LearningValidationError ? 'learning_input_invalid' : 'learning_action_failed', { stage: 'action', cause: error }); }
            } finally {
                if (lane.job === token) { lane.job = null; lane.kind = ''; }
                delegated.drain(); publish();
            }
        });
        publish();
    }
    deps.execution.addCleanup(() => { cancel(); teaching.reset(); companion.reset(); activation = null; });
    return {
        async activate(context) {
            cancel(); activation = context; chatIdentity = deps.chatIdentity(); message = ''; offset = 0; recordId = '';
            const owned = epoch;
            try {
                const before = repository.snapshot();
                await repository.read(); if (owned !== epoch) { return state(); }
                if (before.status === 'ready' && !sameLearningDocument(before.document ?? null, repository.snapshot().document ?? null)) { teaching.reset(); }
                await teacher.read(); await deps.workbenchStore.read(); if (owned !== epoch) { return state(); }
                await restoreTeaching();
                await deps.economy.refresh(); if (owned === epoch) { loadFailed = false; }
                // A completion saved while the app was closed is paid on opening.
                if (owned === epoch) { await payPending(() => owned === epoch && active()); }
            } catch (error) {
                if (owned === epoch) {
                    loadFailed = true;
                    message = reportLearningFailure('open', error instanceof LearningStorageError ? error.code : 'learning_read_failed', { stage: 'context', cause: error });
                }
            }
            return state();
        },
        deactivate() { cancel(); activation = null; },
        cancelForeground: cancel, cancelAll: cancel, handleChatChanged: () => { cancel(); teaching.reset(); companion.reset(); activation = null; },
        handleWindowClosed: () => { cancel(); activation = null; },
        handleMessage(messageInput) {
            const name = messageInput.type.replace(/^learning\//, '');
            const input = learningRecord(messageInput.payload ?? {}, 'request', ['chatIdentity', 'language', 'teacher', 'message', 'replaceCurrent',
                'unitId', 'exerciseId', 'answer', 'attemptId', 'review', 'selection', 'kind', 'id', 'voice', 'materialId', 'partKey', 'openWallet', 'offset', 'value',
                'paragraphId', 'termText', 'revisions', 'target', 'help', 'approved', 'commitId']);
            if (!active() || input.chatIdentity !== chatIdentity) { return { state: state() }; }
            if (learningActionBusy(learningActionLane(name, input.target), activity())) { return { state: state(), rejected: 'busy' }; }
            if (name === 'approve-operation') {
                requireLearning(typeof input.approved === 'boolean', 'approved', 'Choose whether to proceed');
                approvals.resolve(learningText(input.id, 'id', 128), input.approved);
            }
            else if (name === 'pause') { speech.media.pause(); }
            // A companion remark never touches playback, so the player stays usable while it runs.
            else if (name === 'resume' && idle()) { speech.media.resume(); }
            else if (name === 'stop') { speech.stop(); }
            else if (name === 'rate' && idle()) { speech.media.setRate(Number(input.value)); }
            else if (name === 'seek' && idle()) { speech.media.seek(Number(input.value)); }
            else if (name === 'tts-settings') { speech.media.openSettings(); }
            else if (name === 'research-settings') { activation!.post('os/navigate', { appId: 'agent-api' }); }
            else if (name === 'dismiss-source') { sourceChoice = null; preparation = null; }
            else if (name === 'cancel-preparation') { stopPreparation(); }
            else if (name === 'cancel-chat') { cancelConversation(parseLearningActor(input.target)); publish(); }
            else if (name === 'retry-notification') {
                const rejected = delegated.retry(learningText(input.id, 'id', 128));
                if (rejected) { return { state: state(), rejected }; }
            }
            else if (name === 'cancel-companion') { yieldRemark(); publish(); }
            else if (name === 'cancel') {
                stopPreparation();
                teaching.cancel('work'); speech.stop(); job = null; progress = ''; pending = null;
                message = '已停止训练操作；如果保存已经开始，仍需检查是否成功。'; delegated.drain(); publish();
            }
            else if (name === 'language' && idle()) {
                const selected = parseLearningLanguageTag(input.language, 'language');
                if (selected !== language) {
                    cancel(); teaching.reset(); companion.reset(); language = selected; recordId = ''; offset = 0; message = '';
                    void deps.execution.run(async () => {
                        try { await teaching.hydrate(); await companion.hydrate(); }
                        catch { message = conversationCopy.historyLoadFailed; }
                        publish();
                    });
                }
            } else if (name === 'records') { offset = learningInteger(input.offset ?? 0, 'offset'); recordId = typeof input.id === 'string' ? input.id : ''; }
            else if (name === 'export') { return { state: state(), document: structuredClone(confirmedLearning(repository)) }; }
            else {
                const rejected = launch(name, input);
                if (rejected) { return { state: state(), rejected }; }
            }
            // Cancellation can push an intermediate snapshot during a synchronous command.
            // Publish its settled state too; clients may already have superseded the request acknowledgement.
            const result = { state: state() };
            activation!.post('learning/state', result);
            return result;
        },
    };
}
