import { activateSendButtons, deactivateSendButtons, setCharacterId, setCharacterName, setExternalAbortController, setSendButtonState, stopGeneration, is_send_press, eventSource, saveChat } from '../../../../../../../../../script.js';
import * as nativeHost from '../../../../../../../../../script.js';
import { isGenerating } from '../../../../../shared/common/sillytavern-generation-state.js';
import { generateGroupWrapper, is_group_generating, saveGroupChat } from '../../../../../../../../group-chats.js';
import { uuidv4 } from '../../../../../../../../utils.js';
import { createModuleEvents, event_types } from '../../../../../core/event-manager.js';
import { registerGenerateInterceptor, unregisterGenerateInterceptor, GENERATE_INTERCEPTOR_ORDER } from '../../../../../shared/common/generate-interceptor.js';
import { buildActionCheckContinuation, buildActionCheckRules } from '../protocol/prompt.js';
import type { ActionCheckFrequency, ActionCheckRule } from '../types.js';
import { readCoc7Sheet, type Coc7Sheet } from '../domain/coc7-sheet.js';
import { parseDiceRecords } from '../domain/check-records.js';
import { createActionCheckSession } from '../application/action-check-session.js';
import { isDiceContinuationPending } from '../application/continuation-state.js';
import type { DiceContinuationStage, DiceContinuationProgress, DiceHostBlocker } from '../application/host-wait.js';
import { applyDiceCandidate, captureDiceTarget, clearNewDiceSwipe, isDiceTargetCurrent, readDiceRecords, type DiceCandidate, type DiceTarget } from './message-records.js';
import { filterDiceGenerationData, type DiceGenerationData } from './request-filter.js';
import { parseActionCheck } from '../protocol/request.js';
import { captureDiceChat, diceHostContext, ensureDiceDisplayRule, isDiceMessageBeingEdited, waitForDiceHost } from './sillytavern-port.js';
import type { DiceResults } from '../application/results.js';
import { terminalCheck } from '../domain/reroll.js';
import { DiceOperationError } from '../application/operation-error.js';
import type { DiceRerollService } from '../application/reroll-service.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';
import { holdDiceRecoverySave } from './recovery-save-gate.js';
import { subscribeChatImagePlacement, rebaseImageOffset, rebaseImageText, restoreChatImagePlacements } from '../../../../draw/shared/chat-image-placement.js';

export type DiceCardAction = 'continue-check' | 'cancel-continue' | 'reroll-check' | 'retry-check';
// A replacement gets a new in-memory identity even when the paid roll has identical values.
export interface DiceCardTarget extends DiceTarget { resultVersion: string; originalRecords: unknown }
export interface DiceCardActions { target: DiceCardTarget; kind: 'choice' | 'request'; disabled: boolean; canCancel: boolean; canReroll: boolean; rerollDisabled?: boolean; insufficientFunds?: boolean }

const KEY = 'xiaobai_os_dice';
const MAIN_TYPES = ['', 'normal', 'regenerate', 'swipe', 'continue'];
interface Observation {
    source: NonNullable<ReturnType<typeof captureDiceChat>>;
    type: string; from: number; initialBody: string; signal?: AbortSignal;
    stage: 'preparing' | 'receiving';
    previousStream: ReturnType<typeof diceHostContext>['streamingProcessor'];
    error?: string;
    rule: ActionCheckRule;
    coc7Sheet: Coc7Sheet | null;
}

export function createDiceGenerationAdapter(enabled: () => boolean, frequency: () => ActionCheckFrequency, changed: () => void,
    reveal: (target: DiceTarget, candidate: DiceCandidate, signal: AbortSignal) => Promise<void>, rule: () => ActionCheckRule,
    sheet: () => unknown = () => null, rerolls: DiceRerollService<DiceTarget> | null = null,
    results: DiceResults, prompts: { setRules(content: string): void; setResult(content: string): void }) {
    let observation: Observation | null = null;
    let intention: { target: DiceTarget; candidate: DiceCandidate; signal: AbortSignal;
        settled: Promise<void>; received: boolean; stage: DiceContinuationStage; stageStartedAt: number; error?: string } | null = null;
    let wrapperSignal: AbortSignal | undefined;
    let controls: { signal: AbortSignal; nativePending: boolean } | null = null;
    let replacement: AbortController | null = null;
    let unsubscribe: (() => void) | null = null;
    let pausingGroup = false;
    let recoverySave: Promise<void> | null = null;
    // Only a successful reply observed by this adapter can own this tail. Reloaded
    // messages and pre-existing/failed processors never reconstruct pending work.
    let finalizingStream: ReturnType<typeof diceHostContext>['streamingProcessor'] = null;
    const native = nativeHost as unknown as { isChatSaving?: boolean; waitForGenerationIdle?: () => Promise<void> };
    const nativeBlocker = (): DiceHostBlocker | null => {
        // A replacement first emits GENERATION_STARTED, which cancels the old choice;
        // losing this reference must never revive that choice on the replacement call.
        if (finalizingStream && diceHostContext().streamingProcessor !== finalizingStream) { finalizingStream = null; }
        if (native.isChatSaving === true || recoverySave) { return 'save'; }
        if (finalizingStream) { return 'finalization'; }
        return isGenerating() ? 'generation' : null;
    };
    const nativeBusy = () => nativeBlocker() !== null;
    const records = (message: DiceTarget['message']) => results.records(readDiceRecords(message));
    const project = (target: DiceTarget | null) => target ? { ...target, records: records(target.message) } : null;
    const setPrompt = prompts.setResult;
    const setRulesPrompt = prompts.setRules;
    const clearPrompt = () => { setPrompt(''); setRulesPrompt(''); };
    const currentTarget = (target: DiceTarget) => isDiceTargetCurrent(captureDiceChat(), target)
        && jsonValuesEqual(records(target.message), target.records) && !isDiceMessageBeingEdited(target.index);
    const captureSheet = () => { const value = readCoc7Sheet(sheet()); return value.kind === 'ready' ? value.sheet : null; };
    const session = createActionCheckSession({
        enabled, current: currentTarget,
        async ready(target, signal, inGroup, report) {
            // TT exposes the full native Promise boundary, including preparation and chat-history cleanup.
            let nativePending = !!native.waitForGenerationIdle;
            void native.waitForGenerationIdle?.().then(() => { nativePending = false; });
            await waitForDiceHost(target, signal, inGroup,
                () => nativeBlocker() ?? (intention || nativePending ? 'finalization' : null), report);
            if (!terminalCheck(target.body, target.records) && isDiceMessageBeingEdited()) { throw new DiceOperationError('dice_busy'); }
        },
        apply(target, candidate) {
            const raw = readDiceRecords(target.message);
            const originals = raw === undefined ? [] : parseDiceRecords(raw).checks;
            applyDiceCandidate(captureDiceChat(), { ...target, records: raw }, { ...candidate,
                records: { ...candidate.records, checks: candidate.records.checks.map(check => originals.find(original => original.id === check.id) ?? check) } });
        }, changed,
        saveRecovered(target) {
            if (!currentTarget(target) || nativeBusy() || isDiceMessageBeingEdited()) { throw new DiceOperationError('dice_target_changed'); }
            // ST captures this chat synchronously. TT enters its native save queue;
            // nativeBusy above excludes pending tasks, so capture has no I/O wait.
            // Do not use saveChatConditional: it waits before selecting its chat and
            // can therefore save a different chat if the user switches during that wait.
            const release = holdDiceRecoverySave(() => {
                const source = captureDiceChat();
                return source?.key === target.source.key && source.chat === target.source.chat;
            });
            let saving: Promise<void>;
            try { saving = (target.source.groupId ? saveGroupChat(target.source.groupId, true) : saveChat()) as Promise<void>; }
            catch (error) { release(); throw error; }
            const settled = saving.catch(error => {
                // Native save functions own normal HTTP feedback. Unexpected failures
                // still leave the delivered roll usable; never retry another chat.
                console.error('[LittleWhiteBox] Dice recovered check save failed', error);
                (window.toastr as unknown as { error(message: string): void }).error(new DiceOperationError('dice_result_save_failed').message);
            }).finally(() => { release(); if (recoverySave === settled) { recoverySave = null; } changed(); });
            recoverySave = settled;
            return settled;
        },
        id: uuidv4,
        reveal,
        async continue(target, candidate, signal) {
            // Explicit recovery may replace a cancelled call while its native I/O unwinds.
            // A live continuation still owns the normal chain until Generate resolves.
            if (intention && !intention.signal.aborted) { await intention.settled; }
            if (!currentTarget(target) || signal.aborted) { return null; }
            const inGroup = is_group_generating;
            const callController = new AbortController();
            const callSignal = inGroup ? wrapperSignal : callController.signal;
            if (!callSignal) { throw new Error('本次群聊已结束，无法继续检定。'); }
            let settle!: () => void;
            const settled = new Promise<void>(resolve => { settle = resolve; });
            const own: NonNullable<typeof intention> = { target, candidate, signal: callSignal, settled, received: false,
                stage: 'preparing', stageStartedAt: Date.now() };
            if (!inGroup) { setExternalAbortController(callController); }
            intention = own;
            changed();
            const previousStream = diceHostContext().streamingProcessor;
            const cancel = () => {
                if (intention !== own) { return; }
                if (inGroup) { stopGeneration(); }
                else {
                    // A replacement caller may already have installed its external controller.
                    // Cancel our request and stream, never whichever controller is now global.
                    callController.abort();
                    const stream = diceHostContext().streamingProcessor;
                    if (stream && stream !== previousStream) { stream.onStopStreaming(); }
                }
            };
            signal.addEventListener('abort', cancel, { once: true });
            try {
                // ST 1.18's nonzero recursion depth skips slash commands and all composer reads/writes.
                // 'continue' cannot call native tools, so this does not reduce a tool-call recursion budget.
                const options = {
                    signal: callSignal, depth: 1,
                    ...(target.source.groupId ? { force_chid: target.source.characterId } : {}),
                };
                try {
                    if (target.source.groupId && !is_group_generating) {
                        // Generate's outer group branch does not forward depth; the exported wrapper does.
                        await generateGroupWrapper(false, 'continue', options);
                    } else {
                        await diceHostContext().generate('continue', options);
                    }
                } catch (error) {
                    if (signal.aborted) { return null; }
                    if (own.error) { throw new Error(own.error); }
                    // Native generation owns API feedback. Keep same-roll recovery without repeating it.
                    console.error('[LittleWhiteBox] Dice host continuation failed', error);
                    return null;
                }
                if (signal.aborted || intention !== own) { return null; }
                if (own.error) { throw new Error(own.error); }
                const source = captureDiceChat();
                if (!source || source.key !== target.source.key || source.chat !== target.source.chat
                    || source.chat.at(-1) !== target.message || (target.message.swipe_id ?? 0) !== target.swipe) { return null; }
                const stream = diceHostContext().streamingProcessor;
                // Generate resolves even when its stream fails. Partial output is not a completed reply.
                if (stream && stream !== previousStream && stream.isStopped) { return null; }
                return project(captureDiceTarget(source, target.index, candidate.body.length, target.rule, target.coc7Sheet));
            } finally {
                signal.removeEventListener('abort', cancel);
                if (intention === own) { intention = null; clearPrompt(); }
                settle();
                changed();
            }
        },
    });

    function advanceContinuation(stage: DiceContinuationStage): void {
        if (!intention || intention.signal.aborted || intention.stage === stage) { return; }
        intention.stage = stage;
        intention.stageStartedAt = Date.now();
        changed();
    }

    function setPostprocessBusy(value: boolean, signal: AbortSignal): void {
        if (value) {
            if (signal.aborted || controls?.signal === signal) { return; }
            controls = { signal, nativePending: is_send_press };
            setSendButtonState(true);
            deactivateSendButtons();
            return;
        }
        if (controls?.signal !== signal) { return; }
        const nativePending = controls.nativePending;
        controls = null;
        // A paused Dice wait must not unlock a generation still owned by ST.
        if (nativePending) { return; }
        setSendButtonState(false);
        if (!is_group_generating) { activateSendButtons(); }
    }

    function cancel(): void {
        observation = null;
        if (replacement) {
            replacement.abort();
            setPostprocessBusy(false, replacement.signal);
        }
        session.cancel();
        clearPrompt();
    }

    async function groupBoundary(): Promise<void> {
        const pending = session.view();
        if (!pending) { return; }
        const previousId = diceHostContext().characterId;
        const previousName = diceHostContext().name2;
        const source = pending.target.source;
        setCharacterId(source.characterId);
        setCharacterName(source.characterName);
        try {
            await session.drain(Boolean(is_group_generating));
            const result = session.view();
            if (result && ['revealing', 'awaiting-choice', 'continue-error', 'invalid'].includes(result.phase.kind) && is_group_generating) {
                // Abort the native wrapper, not a second queue. The interceptor below blocks its next drafted call.
                pausingGroup = true;
                try { stopGeneration(); } finally { pausingGroup = false; }
            }
        } finally {
            if (captureDiceChat()?.key === source.key) {
                setCharacterId(previousId);
                setCharacterName(previousName);
            }
        }
    }

    function start(): void {
        if (unsubscribe) { return; }
        const events = createModuleEvents('xiaobaiOsDice');
        const started = async (type: unknown, options: { signal?: AbortSignal }, dryRun: unknown) => {
            if (dryRun || type === 'quiet' || intention && type === 'continue' && options.signal === intention.signal
                && currentTarget(intention.target)) { return; }
            // Keep an error at the preceding member while the aborted wrapper unwinds.
            if (is_group_generating && wrapperSignal?.aborted) { return; }
            const previous = intention;
            // ST auto-swipe awaits a nested Generate after MESSAGE_SWIPED changes the target.
            // Waiting on that outer call here would make it wait on itself.
            const nativeSwipe = previous?.received && type === 'swipe'
                && captureDiceChat()?.chat === previous.target.source.chat
                && (previous.target.message.swipe_id ?? 0) !== previous.target.swipe;
            controls = null;
            cancel();
            replacement = null;
            // Do not let a later generation save overtake this one native recovery save.
            if (recoverySave) { await recoverySave; }
            if (nativeSwipe) { intention = null; return; }
            // Do not let the old native Generate() finalize after the replacement has taken ownership.
            // Its stop path is abortable, but the host still performs async save/UI cleanup afterward.
            if (previous) {
                const incoming = new AbortController();
                replacement = incoming;
                setPostprocessBusy(true, incoming.signal);
                await previous.settled;
                if (replacement === incoming && !incoming.signal.aborted) {
                    // Hand the controls back to the incoming native call, not the cancelled Dice run.
                    controls = null; replacement = null;
                    setSendButtonState(true); deactivateSendButtons();
                }
            }
        };
        eventSource.makeFirst(event_types.GENERATION_STARTED, started);
        const ended = () => {
            queueMicrotask(changed);
            const own = controls;
            if (!own || own.signal.aborted) { return; }
            own.nativePending = false;
            queueMicrotask(() => {
                if (controls !== own || own.signal.aborted) { return; }
                setSendButtonState(true);
                deactivateSendButtons();
            });
        };
        eventSource.makeFirst(event_types.GENERATION_ENDED, ended);
        events.on(event_types.GENERATION_AFTER_COMMANDS, (value: unknown, options: { signal?: AbortSignal }, dryRun: unknown) => {
            if (dryRun) { return; }
            const type = String(value || '');
            // ST sets its send flag only after ping/prompt preflight. Arm the exported
            // native flag after commands, so Continue cannot enter that preparation gap.
            // Every early exit here calls unblockGeneration or clears is_send_press;
            // no Dice timer or missing GENERATION_ENDED event owns its release.
            if (enabled() && MAIN_TYPES.includes(type)) { setSendButtonState(true); }
            if (is_group_generating && options.signal) { wrapperSignal = options.signal; }
            const source = captureDiceChat();
            if (!source || source.groupId && !is_group_generating) { return; }
            const last = source.chat.at(-1);
            // Candidate ownership is independent of whether new rolls are enabled.
            if (type === 'swipe' && last) { clearNewDiceSwipe(last); }
            if (!enabled() || !MAIN_TYPES.includes(type) || intention) { return; }
            observation = { source, type, from: type === 'continue' ? last?.mes.length ?? 0 : 0,
                rule: rule(), coc7Sheet: captureSheet(),
                initialBody: type === 'continue' ? last?.mes ?? '' : '', signal: options.signal, stage: 'preparing',
                previousStream: diceHostContext().streamingProcessor };
            changed();
        });
        registerGenerateInterceptor(KEY, async (_chat: unknown, _size: unknown, abort: (immediate: boolean) => void, type: string) => {
            // Native send flags are set after AFTER_COMMANDS, before prompt assembly.
            changed();
            if (replacement?.signal.aborted) { replacement = null; clearPrompt(); abort(true); return; }
            if (is_group_generating && wrapperSignal?.aborted) { abort(true); return; }
            const own = intention;
            const observed = observation;
            const current = () => own ? intention === own && !own.signal.aborted
                && currentTarget(own.target)
                : !observed || observation === observed && !observed.signal?.aborted
                    && captureDiceChat()?.chat === observed.source.chat && captureDiceChat()?.key === observed.source.key;
            if (!enabled() || !MAIN_TYPES.includes(String(type || ''))) { clearPrompt(); return; }
            if (observation) { observation.stage = 'receiving'; }
            try {
                if (!current()) { abort(true); return; }
                await ensureDiceDisplayRule();
                // The host can yield during preparation. Stop this request before it can target another floor.
                if (!current()) { abort(true); return; }
                const last = diceHostContext().chat.at(-1);
                const saved = type === 'continue' && last ? records(last) : undefined;
                const checks = own?.candidate.records.checks ?? saved?.checks ?? [];
                if (!enabled()) { clearPrompt(); return; }
                const activeRule = own?.target.rule ?? observed?.rule ?? rule();
                const activeSheet = own ? own.target.coc7Sheet : observed ? observed.coc7Sheet : captureSheet();
                setRulesPrompt(buildActionCheckRules(frequency(), activeRule, !!activeSheet));
                if (type === 'continue' && last) {
                    const content = buildActionCheckContinuation(last.mes, checks, activeRule !== 'coc7' || !!activeSheet);
                    setPrompt(content);
                } else { setPrompt(''); }
            } catch (error) {
                console.error('[LittleWhiteBox] Dice check preparation failed', error);
                clearPrompt();
                if (own) {
                    own.error = '暂时无法继续行动检定。';
                    abort(true);
                } else if (observed) {
                    observed.error = '本次未能进行行动检定。';
                    // A native Continue must not silently inject an older/absent result.
                    if (type === 'continue') { abort(true); }
                }
            }
        }, GENERATE_INTERCEPTOR_ORDER.XIAOBAI_OS_DICE);
        events.on(event_types.GENERATE_AFTER_DATA, (data: DiceGenerationData, dryRun: unknown) => {
            // Saved markers remain display-only even when new checks are disabled; previews use the same projection.
            filterDiceGenerationData(data);
            if (!dryRun) { clearPrompt(); advanceContinuation('requesting'); }
        });
        events.on(event_types.STREAM_TOKEN_RECEIVED, () => advanceContinuation('responding'));
        const received = (index: number, type: string) => {
            if (!MAIN_TYPES.includes(type) && type !== 'appendFinal') { return; }
            const message = diceHostContext().chat[index];
            if (message) { restoreChatImagePlacements(message); }
            const own = intention;
            if (own && index === own.target.index) { own.received = true; }
            const observed = own ? { source: own.target.source, from: own.candidate.body.length,
                initialBody: own.candidate.body, rule: own.target.rule, coc7Sheet: own.target.coc7Sheet,
                signal: own.signal, error: own.error, previousStream: undefined }
                : observation?.stage === 'receiving' ? observation : null;
            if (!observed) { return; }
            observation = null;
            changed();
            const stream = diceHostContext().streamingProcessor;
            // ST also emits MESSAGE_RECEIVED on a failed normal stream. Ignore only that call's
            // processor, not a stale failure left behind before a subsequent non-streaming reply.
            if (stream && stream !== observed.previousStream && stream.isStopped) { return; }
            const source = captureDiceChat();
            if (!source || source.key !== observed.source.key || source.chat !== observed.source.chat || observed.signal?.aborted) { return; }
            // ST 1.14/1.18 unlock streaming UI before message listeners and saving.
            // Native code releases this exact processor only after onFinishStreaming
            // returns. Our own continuations already have their full Generate Promise.
            if (!own && stream && stream !== observed.previousStream && stream.isFinished && stream.messageId === index) {
                finalizingStream = stream;
            }
            try {
                const target = project(captureDiceTarget(source, index, observed.from, observed.rule, observed.coc7Sheet));
                if (!target || !target.body.startsWith(observed.initialBody)) { return; }
                session.accept(target, observed.error);
                void session.drain().catch(error => console.error('[LittleWhiteBox] Dice check failed', error));
            } catch (error) {
                // This synchronous listener precedes native saving. A Dice read failure
                // must not interrupt saving the user's new prose or invent a first result.
                console.error('[LittleWhiteBox] Dice result read failed', error);
            }
        };
        eventSource.makeFirst(event_types.MESSAGE_RECEIVED, received);
        const releaseImagePlacement = subscribeChatImagePlacement((change: {
            message: DiceTarget['message']; swipeIndex: number; before: string; after: string;
            edits: { start: number; end: number; content: string }[];
        } | { removedSlotId: string } | { restoreMessage: DiceTarget['message'] }) => {
            if ('removedSlotId' in change || 'restoreMessage' in change) { return; }
            if (observation?.type === 'continue' && observation.source.chat.at(-1) === change.message
                && (change.message.swipe_id ?? 0) === change.swipeIndex) {
                const prefix = rebaseImageText(observation.initialBody, change);
                if (prefix !== null) {
                    observation.initialBody = prefix;
                    observation.from = prefix.length;
                }
            }
            const active = session.view();
            if (!active || active.target.message !== change.message || active.target.swipe !== change.swipeIndex
                || active.target.body !== change.before || !currentTarget({ ...active.target, body: change.after })) { return; }
            // Only the drawing owner's validated replacements may advance these
            // live references. Ordinary edits still invalidate the exact-body guard.
            active.target.body = change.after;
            active.target.generatedFrom = rebaseImageOffset(active.target.generatedFrom, change.edits);
            if ('candidate' in active.phase && active.phase.candidate) { active.phase.candidate.body = change.after; }
            changed();
        });
        events.on(event_types.GROUP_MEMBER_DRAFTED, groupBoundary);
        events.on(event_types.GROUP_WRAPPER_FINISHED, async () => { await groupBoundary(); wrapperSignal = undefined; changed(); });
        const stopped = () => {
            if (pausingGroup) { clearPrompt(); return; }
            const phase = session.view()?.phase.kind;
            // Internal wrapper stop must not discard the same-roll recovery candidate.
            if (controls || !['awaiting-choice', 'continue-error', 'invalid'].includes(phase ?? '')) { cancel(); }
            clearPrompt();
        };
        eventSource.makeFirst(event_types.GENERATION_STOPPED, stopped);
        events.on(event_types.MESSAGE_DELETED, () => {
            // ST removes the old reply once between AFTER_COMMANDS and the interceptors on regenerate.
            // Consume that preparation step only; a deletion during reception still cancels the request.
            if (observation?.type === 'regenerate' && observation.stage === 'preparing') {
                observation.stage = 'receiving';
                return;
            }
            cancel();
        });
        for (const name of [event_types.CHAT_CHANGED, event_types.MESSAGE_SWIPED, event_types.MESSAGE_EDITED]) {
            events.on(name, cancel);
        }
        unsubscribe = () => {
            releaseImagePlacement();
            eventSource.removeListener(event_types.MESSAGE_RECEIVED, received);
            eventSource.removeListener(event_types.GENERATION_ENDED, ended);
            eventSource.removeListener(event_types.GENERATION_STARTED, started);
            eventSource.removeListener(event_types.GENERATION_STOPPED, stopped);
            events.cleanup(); unregisterGenerateInterceptor(KEY);
        };
    }

    function stop(): void {
        cancel(); unsubscribe?.(); unsubscribe = null; wrapperSignal = undefined;
    }

    function actions(index: number): DiceCardActions | null {
        if (!enabled() || isDiceMessageBeingEdited(index)) { return null; }
        const source = captureDiceChat();
        if (!source || index !== source.chat.length - 1) { return null; }
        const active = session.view();
        const captured = active?.target.index === index && currentTarget(active.target) ? active.target
            : project(captureDiceTarget(source, index, 0, rule(), captureSheet()));
        if (!captured || !currentTarget(captured)) { return null; }
        const target: DiceCardTarget = { ...captured, originalRecords: readDiceRecords(captured.message),
            resultVersion: results.version(readDiceRecords(captured.message)) };
        const phase = active?.target.message === target.message ? active.phase.kind : null;
        const busy = !!controls || !!intention && !intention.signal.aborted;
        if (terminalCheck(target.body, target.records)) {
            return { target, kind: 'choice', disabled: busy || !!phase && !['revealing', 'awaiting-choice', 'continue-error'].includes(phase),
                canCancel: phase === 'settling',
                // Rerolls never write chat: a received result can change while native
                // saving finishes. A new, not-yet-received generation still excludes it.
                canReroll: !!rerolls, rerollDisabled: phase === 'revealing' || !!observation && nativeBusy() || !rerolls?.canAfford(),
                insufficientFunds: !!rerolls && !rerolls.canAfford() };
        }
        if (!active && parseActionCheck(target.body, target.generatedFrom, target.rule).kind === 'request') {
            return { target, kind: 'request', disabled: busy || nativeBusy() || isDiceMessageBeingEdited(), canCancel: false, canReroll: false };
        }
        return null;
    }

    async function act(target: DiceCardTarget, action: DiceCardAction): Promise<void> {
        if (!currentTarget(target) || target.originalRecords !== readDiceRecords(target.message)
            || target.resultVersion !== results.version(readDiceRecords(target.message))) { throw new DiceOperationError('dice_target_changed'); }
        const available = actions(target.index);
        if (action === 'cancel-continue' && available?.canCancel) {
            // Only this queued choice is cancelled. Native finalization and any
            // previous Generate Promise still own their real completion boundary.
            session.cancel();
            return;
        }
        if (!available || available.disabled) { throw new DiceOperationError('dice_busy'); }
        if (action === 'retry-check' && available.kind === 'request') { await session.retryRequest(target); }
        else if (action === 'continue-check' && available.kind === 'choice') { await session.continueCheck(target); }
        else if (action === 'reroll-check' && available.kind === 'choice' && rerolls) {
            if (available.insufficientFunds) { throw new DiceOperationError('dice_insufficient_funds'); }
            if (available.rerollDisabled) { throw new DiceOperationError('dice_busy'); }
            const rolled = rerolls.reroll(target);
            await session.showResult(rolled.target, { body: rolled.target.body, records: parseDiceRecords(rolled.target.records) }, rolled.operationId);
        } else { throw new DiceOperationError('dice_target_changed'); }
    }
    function isReplyPaused(message: unknown): boolean {
        if (!enabled() || message === null || typeof message !== 'object') { return false; }
        // The caller selects its floor. Workflow ownership is not a pause in that floor's prose.
        return isDiceContinuationPending(message);
    }
    return { start, stop, cancel, isReplyPaused,
        actions, act, records, current: currentTarget,
        view() {
            const current = session.view();
            if (!current) { return null; }
            const own = intention;
            const continuation: DiceContinuationProgress | null = current.phase.kind === 'continuing'
                && own && !own.signal.aborted && !own.received && own.candidate === current.phase.candidate
                ? { stage: own.stage, elapsedSeconds: Math.floor((Date.now() - own.stageStartedAt) / 1000) } : null;
            return { ...current, continuation };
        },
        isBusy: () => nativeBusy() || !!controls || !!intention && !intention.signal.aborted,
        canRetryRequest(index: number): boolean {
            const available = actions(index);
            return available?.kind === 'request' && !available.disabled;
        },
    };
}
