import type { AgentCapability } from '../../../capabilities/agent/index.js';
import type { EconomyReadCapability } from '../../../capabilities/economy/index.js';
import { parseLearningSelection, type LearningSelection } from '../../../domains/learning/notes.js';
import { learningRecord, learningText, LearningValidationError, parseLearningLanguageTag, type LearningTeacherPreference } from '../../../domains/learning/profile.js';
import type { LearningAnswer } from '../../../domains/learning/types.js';
import { learningInteger, requireLearning } from '../../../domains/learning/validation.js';
import type { KnownPerson } from '../../../host/prompt-context/known-people.js';
import type { ScopedChatStore, XiaobaiOsFileControls } from '../../../kernel/contracts.js';
import type { XiaobaiOsExecutionScope } from '../../../kernel/execution-scope.js';
import type { XiaobaiOsAppActivationContext, XiaobaiOsAppRuntime } from '../../../types.js';
import type { LearningTeacherContext } from '../agent/context.js';
import type { LearningAction } from '../agent/session.js';
import { learningClassView } from '../application/projection.js';
import { createLearningId } from '../application/identity.js';
import { createLearningPractice } from '../application/practice.js';
import { createLearningRewards } from '../application/rewards.js';
import { confirmedLearning, createLearningService, type LearningRepository } from '../application/service.js';
import { createLearningSpeech } from '../application/speech.js';
import { createLearningTeacherService } from '../application/teacher.js';
import { createLearningTeaching, type LearningClassroom, type LearningTeachingResult } from '../application/teaching.js';
import { learningProgressMessage, reportLearningFailure } from '../application/feedback.js';
import { LearningStorageError } from '../storage/repository.js';
import { sameLearningDocument } from '../storage/document.js';
import type { LearningClientState } from '../types.js';
import type { LearningTtsFacade } from './media-adapter.js';

export function createLearningRuntime(deps: {
    repository: LearningRepository; store: ScopedChatStore<LearningTeacherPreference>; files: XiaobaiOsFileControls;
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
    let message = '';
    let progress = '';
    let loadFailed = false;
    let reply: LearningClientState['reply'] = null;
    let replySelection: LearningSelection | null = null;
    let pendingCleanup: string | null = null;
    let recordId = '';
    let offset = 0;
    const repository = deps.repository;
    const service = createLearningService(repository);
    const teacher = createLearningTeacherService(deps.store, { knownPeople: deps.people, playerName: deps.playerName });
    const rewards = createLearningRewards({ ...deps });
    const active = () => !!activation?.isCurrent() && chatIdentity === deps.chatIdentity();
    function current(): LearningClassroom | null {
        const saved = deps.store.peekCurrent();
        return active() && saved?.osId && saved.value?.teacher
            ? { language, osId: saved.osId, chatIdentity, teacher: saved.value.teacher } : null;
    }
    const teaching = createLearningTeaching({ repository, gateway: deps.agent, current, capture: deps.capture,
        onConversation: () => publish(),
        onProgress: next => {
            const text = learningProgressMessage(next);
            if (text !== progress) { progress = text; publish(); }
        } });
    const practice = createLearningPractice({ repository, teaching, current });
    const speech = createLearningSpeech({ repository, current, getFacade: deps.getTtsFacade,
        onState: media => { if (active()) { activation!.post('learning/media', { media }); } }, onSave: () => publish(),
        onError: error => { message = error instanceof LearningStorageError && error.code === 'learning_file_full'
            ? '学习文件已满，已暂停播放。请先导出或清理不需要的学习记录；腾出空间后再操作，会重试保存听取记录。'
            : repository.snapshot().status === 'ready'
                ? '听取记录保存失败，已暂停播放。请重试刚才的操作，会先重试保存听取记录。'
                : '听取记录未确认保存，请先核实保存再作答；原题保持不变。'; publish(); } });

    function state(): LearningClientState {
        const snapshot = repository.snapshot();
        const saved = deps.store.peekCurrent();
        const view = learningClassView(snapshot.document?.data ?? { profiles: [] }, language, saved?.osId ?? null, offset, recordId);
        // Keep navigation on the displayed page when deletion or a server read shrinks the list.
        offset = view.records.offset;
        return { ...view,
            chatIdentity, language, teacher: saved?.value?.teacher ?? null,
            candidates: teacher.candidates().map(person => ({ name: person.name, aliases: person.aliases })),
            storage: loadFailed ? 'unloaded' : snapshot.status, chatStorage: deps.files.getFileState(), busy: !!job,
            message: job ? progress : message, reply, conversation: teaching.conversation(),
            walletOpen: deps.economy.isOpen(), media: speech.media.snapshot(), voices: speech.media.capabilities() };
    }
    function publish() { if (active()) { activation!.post('learning/state', { state: state() }); } }
    function cancel() {
        epoch++; teaching.cancel(); speech.stop(); job = null; progress = '';
        reply = null; replySelection = null;
    }
    function saved(result: { status: string }) {
        if (result.status === 'unconfirmed') { message = '保存尚未确认。请先核实，不要重新生成或重复作答。'; }
        else if (result.status === 'conflict') { message = '学习文件有另一版本。请先核实，或明确采用服务器内容。'; }
        else if (result.status === 'failed') { message = '保存失败，已确认的内容保持不变，请重试。'; }
        return result.status === 'confirmed' || result.status === 'unchanged';
    }
    async function pay(unitId: string, open: boolean, guard: () => boolean) {
        const result = await rewards.settle(language, unitId, open, guard);
        if (!guard()) { return; }
        if (result === 'paid') { message = '学习奖励已到账。'; }
        else if (result === 'wallet-closed') { message = '学习已完成。开通当前聊天的钱包后即可领取奖励。'; }
        else if (result === 'other-story') { message = '学习成果已保留；奖励只能在开课的原聊天领取。'; }
        else if (result !== 'cancelled') { message = '学习已完成，奖励尚未确认到账。请核实账本后再补领，不需要重新上课。'; }
    }
    async function afterTeaching(result: LearningTeachingResult, guard: () => boolean, action: LearningAction['kind'], exerciseId?: string, selection: LearningSelection | null = null) {
        if (!guard()) { return; }
        if (result.status === 'failed') { message = result.message; return; }
        if (result.status !== 'finished') { saved(result); return; }
        reply = { text: result.text, action, ...(exerciseId ? { exerciseId } : {}) }; replySelection = selection;
        const profile = confirmedLearning(repository)?.data.profiles.find(entry => entry.language === language);
        const completed = profile?.completions.find(entry => entry.unitId === profile.unit?.id);
        if (completed && !completed.receipt) { await pay(completed.unitId, false, guard); }
    }
    function restoreTeaching() {
        if (pendingCleanup && repository.snapshot().status === 'ready') {
            if (repository.snapshot().document?.commitId === pendingCleanup) { teaching.reset(); reply = null; replySelection = null; }
            pendingCleanup = null;
        }
        const recovered = teaching.recoverConfirmed();
        if (recovered) {
            const { result, request } = recovered;
            reply = { text: result.text, action: request.action.kind, ...(request.exerciseId ? { exerciseId: request.exerciseId } : {}) };
            replySelection = request.selection ?? null;
        }
    }
    function unit() {
        const classroom = current();
        const profile = confirmedLearning(repository)?.data.profiles.find(entry => entry.language === language);
        requireLearning(classroom && profile?.unit && (profile.unit.scope.kind === 'public' || profile.unit.scope.osId === classroom.osId), 'unit', 'Select an available lesson');
        return profile.unit;
    }
    function selection(value: unknown) {
        const lesson = unit();
        const selected = parseLearningSelection(value, lesson.materials);
        const visible = state().unit?.materials.find(material => material.id === selected.materialId);
        requireLearning(visible && !visible.hidden, 'selection', 'Reveal the transcript before selecting text');
        return selected;
    }
    async function action(name: string, input: Record<string, unknown>, guard: () => boolean) {
        if (name === 'read' || name === 'verify' || name === 'retry-save' || name === 'adopt-server') {
            const before = repository.snapshot();
            if (name === 'verify') { saved(await repository.verify()); }
            else if (name === 'retry-save') { saved(await repository.retry(guard)); }
            else if (name === 'adopt-server') { await repository.adoptServer(); teaching.reset(); reply = null; replySelection = null; pendingCleanup = null; }
            else { await repository.refresh(); }
            await deps.store.read(); await deps.economy.refresh(); loadFailed = false;
            if (!guard()) { return; }
            if (name === 'read' && before.status === 'ready' && !sameLearningDocument(before.document ?? null, repository.snapshot().document ?? null)) {
                teaching.reset(); reply = null; replySelection = null;
            }
            restoreTeaching();
            if (name !== 'read' && guard() && repository.snapshot().status === 'ready') {
                const profile = confirmedLearning(repository)?.data.profiles.find(entry => entry.language === language);
                const completion = profile?.completions.find(entry => entry.unitId === profile.unit?.id);
                if (completion && !completion.receipt) { await pay(completion.unitId, false, guard); }
            }
            return;
        }
        if (name === 'verify-wallet') { saved(await deps.files.retryPending()); await deps.economy.refresh(); return; }
        if (name === 'adopt-wallet') { saved(await deps.files.adoptServerState()); await deps.economy.refresh(); return; }
        requireLearning(!loadFailed, 'storage', 'Read the learning file first');
        confirmedLearning(repository);
        if (name === 'teacher') {
            const before = await deps.store.read();
            const selected = input.teacher as LearningTeacherPreference['teacher'];
            if (JSON.stringify(current()?.teacher) === JSON.stringify(selected)) { return; }
            if (saved(await teacher.select(before.identityKey, input.teacher as LearningTeacherPreference['teacher'], guard))) { teaching.reset(); reply = null; }
            return;
        }
        if (name === 'talk') {
            const exerciseId = input.exerciseId === undefined ? undefined : learningText(input.exerciseId, 'exerciseId', 128);
            await afterTeaching(await teaching.run({ action: { kind: 'talk' }, exerciseId,
                message: learningText(input.message, 'message', 4000) }), guard, 'talk', exerciseId); return;
        }
        if (name === 'profile') {
            await afterTeaching(await teaching.run({ action: { kind: 'profile' }, message: learningText(input.message, 'message', 4000) }), guard, 'profile'); return;
        }
        if (name === 'prepare' || name === 'replace-lesson') {
            if (name === 'replace-lesson') {
                const profile = confirmedLearning(repository)?.data.profiles.find(entry => entry.language === language);
                requireLearning(profile?.unit?.id === input.unitId, 'unitId', 'The lesson has changed; ask the teacher again before replacing it');
            }
            reply = null;
            await afterTeaching(await teaching.run({ action: { kind: 'prepare', replaceCurrent: name === 'replace-lesson' || input.replaceCurrent === true },
                message: learningText(input.message, 'message', 4000) }), guard, 'prepare'); return;
        }
        if (name === 'submit') {
            const result = await practice.submit({ unitId: learningText(input.unitId, 'unitId', 128), exerciseId: learningText(input.exerciseId, 'exerciseId', 128),
                answer: input.answer as LearningAnswer, replays: 0, slowPlayback: false }, guard);
            if (result.status === 'saved' && result.teaching) { await afterTeaching(result.teaching, guard, 'assess', String(input.exerciseId)); }
            else if (result.status !== 'saved') { saved(result); }
            return;
        }
        if (name === 'assess') {
            const attemptId = learningText(input.attemptId, 'attemptId', 128);
            if (input.review === true && !saved(await service.dispute(language, attemptId, guard))) { return; }
            if (!guard()) { return; }
            await afterTeaching(await teaching.run({ action: { kind: 'assess', attemptId, review: input.review === true },
                message: learningText(input.message, 'message', 4000) }), guard, 'assess'); return;
        }
        if (name === 'complete') {
            await afterTeaching(await teaching.run({ action: { kind: 'complete' }, message: '请根据已经保存的练习和反馈，看看这一课是否已经达到可以收课的程度。' }), guard, 'complete'); return;
        }
        if (name === 'explain') {
            const lesson = unit();
            const exerciseId = input.exerciseId === undefined ? undefined : learningText(input.exerciseId, 'exerciseId', 128);
            requireLearning(exerciseId === undefined || lesson.exercises.some(exercise => exercise.id === exerciseId), 'exerciseId', 'Select a current exercise');
            const selected = input.selection ? selection(input.selection) : null;
            requireLearning(exerciseId || selected, 'selection', 'Select a question or material passage');
            const text = learningText(input.message, 'message', selected ? 1800 : 2000);
            await afterTeaching(await teaching.run({ action: { kind: 'explain' }, exerciseId,
                message: selected ? `${text}\n\n${selected.quote}` : text, selection: selected }), guard, 'explain', exerciseId, selected); return;
        }
        if (name === 'reveal') {
            const lesson = unit();
            requireLearning(['answers', 'hints', 'transcripts'].includes(String(input.kind)), 'kind', 'Choose what to reveal');
            saved(await service.reveal(language, lesson.id, input.kind as 'answers' | 'hints' | 'transcripts',
                learningText(input.id, 'id', 128), current()!.osId, guard)); return;
        }
        if (name === 'voice') { saved(await service.setVoice(language, input.voice, guard)); return; }
        if (name === 'play') {
            await speech.play({ materialId: String(input.materialId), partKey: String(input.partKey), exerciseId: typeof input.exerciseId === 'string' ? input.exerciseId : undefined }); return;
        }
        if (name === 'say') { await speech.say(selection(input.selection).quote); return; }
        if (name === 'say-reply') {
            requireLearning(reply?.text, 'reply', 'Select a current teacher explanation');
            await speech.say(reply.text); return;
        }
        if (name === 'say-question') {
            const exercise = unit().exercises.find(entry => entry.id === input.exerciseId);
            requireLearning(exercise, 'exerciseId', 'Select a current exercise');
            await speech.say(exercise.prompt); return;
        }
        if (name === 'save-note') {
            const lesson = unit();
            requireLearning(reply?.exerciseId && lesson.exercises.some(exercise => exercise.id === reply!.exerciseId), 'reply', 'Choose a current explanation');
            if (lesson.notes?.some(note => note.exerciseId === reply!.exerciseId && note.text === reply!.text
                && JSON.stringify(note.selection) === JSON.stringify(replySelection))) { return; }
            saved(await service.note(language, lesson.id, { id: createLearningId(), text: reply.text, exerciseId: reply.exerciseId, selection: replySelection }, guard)); return;
        }
        if (name === 'delete-note') { saved(await service.note(language, unit().id, String(input.id), guard)); return; }
        if (name === 'reward') { await pay(String(input.unitId), input.openWallet === true, guard); return; }
        if (name === 'delete-item') { saved(await service.deleteItem(language, String(input.id), guard)); recordId = ''; return; }
        if (name === 'delete-attempt') { saved(await service.deleteAttempt(language, String(input.id), guard)); return; }
        requireLearning(!deps.files.hasPendingCommit(), 'wallet', 'Resolve pending wallet changes before deleting learning data');
        if (name === 'abandon') { saved(await service.abandonUnit(language, guard)); reply = null; return; }
        if (name === 'delete-language') { saved(await service.deleteLanguage(language, guard)); reply = null; return; }
        if (name === 'clear') { saved(await repository.clear(confirmedLearning(repository), guard)); reply = null; return; }
        throw new Error('learning_unknown_action');
    }
    function launch(name: string, input: Record<string, unknown>) {
        if (job || !active()) { return; }
        const owned = epoch;
        const token = {};
        const guard = () => active() && epoch === owned;
        job = token; message = ''; progress = '正在处理学习操作…';
        // Stop first so hearing facts cannot race a teacher snapshot or a submitted answer.
        speech.stop();
        void deps.execution.run(async () => {
            const cleanup = ['delete-note', 'delete-item', 'delete-attempt', 'abandon', 'delete-language', 'clear'].includes(name);
            const pendingBefore = repository.pendingCommitId();
            let before = repository.snapshot().document;
            try {
                // Free space before retrying hearing writes. Repository confirmation/conflict guards still apply.
                if (cleanup) { await speech.settle(); }
                else if (!await speech.flush()) { return; }
                before = repository.snapshot().document;
                if (guard()) {
                    await action(name, input, guard);
                }
            }
            catch (error) {
                if (guard()) {
                    message = error instanceof LearningStorageError ? reportLearningFailure(name, error.code, { stage: 'save', cause: error })
                        : error instanceof Error && error.message === 'learning_teacher_is_player' ? '请选择其他已知人物作为老师，不能选择自己。'
                            : reportLearningFailure(name, error instanceof LearningValidationError ? 'learning_input_invalid' : 'learning_action_failed', { stage: 'action', cause: error });
                }
            } finally {
                if (cleanup && guard() && repository.pendingCommitId() !== pendingBefore) { pendingCleanup = repository.pendingCommitId(); }
                if (cleanup && guard() && !sameLearningDocument(before ?? null, repository.snapshot().document ?? null)) {
                    teaching.reset(); reply = null; replySelection = null;
                }
                if (job === token) { job = null; progress = ''; publish(); }
            }
        });
        publish();
    }
    deps.execution.addCleanup(() => { cancel(); teaching.reset(); activation = null; });
    return {
        async activate(context) {
            cancel(); activation = context; chatIdentity = deps.chatIdentity(); message = ''; offset = 0; recordId = '';
            const owned = epoch;
            try {
                const before = repository.snapshot();
                await repository.read(); if (owned !== epoch) { return state(); }
                if (before.status === 'ready' && !sameLearningDocument(before.document ?? null, repository.snapshot().document ?? null)) { teaching.reset(); }
                await deps.store.read(); if (owned !== epoch) { return state(); }
                restoreTeaching();
                await deps.economy.refresh(); if (owned === epoch) { loadFailed = false; }
            } catch (error) {
                if (owned === epoch) {
                    loadFailed = true;
                    message = reportLearningFailure('open', error instanceof LearningStorageError ? error.code : 'learning_read_failed', { stage: 'context', cause: error });
                }
            }
            return state();
        },
        deactivate() { cancel(); activation = null; },
        cancelForeground: cancel, cancelAll: cancel, handleChatChanged: () => { cancel(); teaching.reset(); activation = null; },
        handleWindowClosed: () => { cancel(); activation = null; },
        handleMessage(messageInput) {
            const name = messageInput.type.replace(/^learning\//, '');
            const input = learningRecord(messageInput.payload ?? {}, 'request', ['chatIdentity', 'language', 'teacher', 'message', 'replaceCurrent',
                'unitId', 'exerciseId', 'answer', 'attemptId', 'review', 'selection', 'kind', 'id', 'voice', 'materialId', 'partKey', 'openWallet', 'offset', 'value']);
            if (!active() || input.chatIdentity !== chatIdentity) { return { state: state() }; }
            if (name === 'pause') { speech.media.pause(); }
            else if (name === 'resume' && !job) { speech.media.resume(); }
            else if (name === 'stop') { speech.stop(); }
            else if (name === 'rate' && !job) { speech.media.setRate(Number(input.value)); }
            else if (name === 'seek' && !job) { speech.media.seek(Number(input.value)); }
            else if (name === 'tts-settings') { speech.media.openSettings(); }
            else if (name === 'cancel') { cancel(); message = '已停止本次操作；已发出的保存仍需核实。'; }
            else if (name === 'forget-conversation' && !job) { teaching.reset(); reply = null; replySelection = null; message = ''; }
            else if (name === 'language' && !job) {
                const selected = parseLearningLanguageTag(input.language, 'language');
                if (selected !== language) { cancel(); teaching.reset(); language = selected; recordId = ''; offset = 0; message = ''; }
            } else if (name === 'records') { offset = learningInteger(input.offset ?? 0, 'offset'); recordId = typeof input.id === 'string' ? input.id : ''; }
            else if (name === 'export') { return { state: state(), document: structuredClone(confirmedLearning(repository)) }; }
            else { launch(name, input); }
            return { state: state() };
        },
    };
}
