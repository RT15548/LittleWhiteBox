import { activateSendButtons, deactivateSendButtons, setCharacterId, setCharacterName, setExternalAbortController, setSendButtonState, stopGeneration, isGenerating } from '../../../../../../../../../script.js';
import { generateGroupWrapper, is_group_generating } from '../../../../../../../../group-chats.js';
import { uuidv4 } from '../../../../../../../../utils.js';
import { createModuleEvents, event_types } from '../../../../../core/event-manager.js';
import { registerGenerateInterceptor, unregisterGenerateInterceptor, GENERATE_INTERCEPTOR_ORDER } from '../../../../../shared/common/generate-interceptor.js';
import { setSillyTavernPrompt } from '../../../host/sillytavern-runtime-adapters.js';
import { buildActionCheckPrompt } from '../protocol/prompt.js';
import { hasValidCheckAnchor, parseDiceRecords } from '../domain/check-records.js';
import { createActionCheckSession } from '../application/action-check-session.js';
import { captureDiceTarget, clearNewDiceSwipe, isDiceTargetCurrent, type DiceCandidate, type DiceTarget } from './message-records.js';
import { createDiceMessageSave } from './message-save.js';
import { captureDiceChat, diceHostContext, diceSavePort, ensureDiceDisplayRule, waitForDiceHost } from './sillytavern-port.js';

const KEY = 'xiaobai_os_dice';
const MAIN_TYPES = ['', 'normal', 'regenerate', 'swipe', 'continue'];
interface Observation {
    source: NonNullable<ReturnType<typeof captureDiceChat>>;
    type: string; from: number; initialBody: string; signal?: AbortSignal;
    stage: 'preparing' | 'receiving';
    previousStream: ReturnType<typeof diceHostContext>['streamingProcessor'];
    error?: string;
}

export function createDiceGenerationAdapter(enabled: () => boolean, changed: () => void,
    reveal: (target: DiceTarget, candidate: DiceCandidate, signal: AbortSignal) => Promise<void>) {
    const saver = createDiceMessageSave(diceSavePort);
    let observation: Observation | null = null;
    let intention: { target: DiceTarget; candidate: DiceCandidate; signal: AbortSignal; error?: string } | null = null;
    let wrapperSignal: AbortSignal | undefined;
    let revealing: AbortSignal | null = null;
    let unsubscribe: (() => void) | null = null;
    const clearPrompt = () => setSillyTavernPrompt(KEY, '');
    const session = createActionCheckSession({
        enabled, current: target => isDiceTargetCurrent(captureDiceChat(), target),
        same: (left, right) => left.message === right.message && left.swipe === right.swipe,
        ready: waitForDiceHost, save: saver.commit, changed,
        id: uuidv4,
        async reveal(target, candidate, signal) {
            revealing = signal;
            setSendButtonState(true);
            deactivateSendButtons();
            try { await reveal(target, candidate, signal); }
            finally {
                if (revealing === signal) { releaseReveal(); }
            }
        },
        async continue(target, candidate, signal) {
            if (!isDiceTargetCurrent(captureDiceChat(), target) || signal.aborted) { return null; }
            const callController = new AbortController();
            const callSignal = is_group_generating ? wrapperSignal : callController.signal;
            if (!callSignal) { throw new Error('本次群聊已结束，无法继续检定。'); }
            const own: NonNullable<typeof intention> = { target, candidate, signal: callSignal };
            if (!is_group_generating) { setExternalAbortController(callController); }
            intention = own;
            // Internal follow-ups inherit a busy parent in ST. Dice resumes after that parent has finished.
            setSendButtonState(true);
            const cancel = () => { if (intention === own) { stopGeneration(); } };
            signal.addEventListener('abort', cancel, { once: true });
            const previousStream = diceHostContext().streamingProcessor;
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
                    if (own.error) { throw new Error(own.error); }
                    // Native generation owns API feedback. Keep same-roll recovery without repeating it.
                    console.error('[LittleWhiteBox] Dice host continuation failed', error);
                    return null;
                }
                if (own.error) { throw new Error(own.error); }
                const source = captureDiceChat();
                if (!source || source.key !== target.source.key || source.chat !== target.source.chat
                    || source.chat.at(-1) !== target.message || (target.message.swipe_id ?? 0) !== target.swipe) { return null; }
                const stream = diceHostContext().streamingProcessor;
                // Generate resolves even when its stream fails. Partial output is not a completed reply.
                if (stream && stream !== previousStream && stream.isStopped) { return null; }
                return captureDiceTarget(source, target.index, candidate.body.length);
            } finally {
                signal.removeEventListener('abort', cancel);
                if (intention === own) { intention = null; setSendButtonState(false); clearPrompt(); }
                changed();
            }
        },
    });

    function releaseReveal(): void {
        revealing = null; setSendButtonState(false);
        // An active native group wrapper owns its own Stop/swipe controls.
        if (!is_group_generating) { activateSendButtons(); }
    }

    function cancel(): void {
        observation = null;
        session.cancel();
        if (revealing) { releaseReveal(); }
        if (intention) { intention = null; setSendButtonState(false); }
        clearPrompt();
    }

    async function groupBoundary(): Promise<void> {
        if (intention) { return; }
        const pending = session.view();
        if (!pending || pending.phase.kind !== 'waiting') { return; }
        const previousId = diceHostContext().characterId;
        const previousName = diceHostContext().name2;
        const source = pending.target.source;
        setCharacterId(source.characterId);
        setCharacterName(source.characterName);
        try {
            await session.drain(Boolean(is_group_generating));
            const result = session.view();
            if (result && ['save-error', 'continue-error', 'invalid'].includes(result.phase.kind) && is_group_generating) {
                // Abort the native wrapper, not a second queue. The interceptor below blocks its next drafted call.
                stopGeneration();
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
        events.on(event_types.GENERATION_STARTED, (type: unknown, options: { signal?: AbortSignal }, dryRun: unknown) => {
            if (dryRun || intention && type === 'continue' && options.signal === intention.signal
                && isDiceTargetCurrent(captureDiceChat(), intention.target)) { return; }
            // Keep an error at the preceding member while the aborted wrapper unwinds.
            if (is_group_generating && wrapperSignal?.aborted) { return; }
            cancel();
        });
        events.on(event_types.GENERATION_AFTER_COMMANDS, (value: unknown, options: { signal?: AbortSignal }, dryRun: unknown) => {
            if (dryRun) { return; }
            const type = String(value || '');
            if (is_group_generating && options.signal) { wrapperSignal = options.signal; }
            const source = captureDiceChat();
            if (!source || source.groupId && !is_group_generating) { return; }
            const last = source.chat.at(-1);
            // Candidate ownership is independent of whether new rolls are enabled.
            if (type === 'swipe' && last) { clearNewDiceSwipe(last); }
            if (!enabled() || !MAIN_TYPES.includes(type) || intention) { return; }
            observation = { source, type, from: type === 'continue' ? last?.mes.length ?? 0 : 0,
                initialBody: type === 'continue' ? last?.mes ?? '' : '', signal: options.signal, stage: 'preparing',
                previousStream: diceHostContext().streamingProcessor };
        });
        registerGenerateInterceptor(KEY, async (_chat: unknown, _size: unknown, abort: (immediate: boolean) => void, type: string) => {
            if (is_group_generating && wrapperSignal?.aborted) { abort(true); return; }
            const own = intention;
            const observed = observation;
            const current = () => own ? intention === own && !own.signal.aborted
                && isDiceTargetCurrent(captureDiceChat(), own.target)
                : !observed || observation === observed && !observed.signal?.aborted
                    && captureDiceChat()?.chat === observed.source.chat && captureDiceChat()?.key === observed.source.key;
            if (!current()) { clearPrompt(); abort(true); return; }
            if (!enabled() || !MAIN_TYPES.includes(String(type || ''))) { clearPrompt(); return; }
            if (observation) { observation.stage = 'receiving'; }
            try {
                await ensureDiceDisplayRule();
                // The host can yield during preparation. Stop this request before it can target another floor.
                if (!current()) { clearPrompt(); abort(true); return; }
                const last = diceHostContext().chat.at(-1);
                const saved = type === 'continue' && last ? saver.readConfirmed(last) : undefined;
                const records = own?.candidate.records.checks ?? (saved === undefined ? [] : parseDiceRecords(saved).checks);
                if (last && records.some(record => !hasValidCheckAnchor(last.mes, record))) {
                    // An ordinary user continuation is still allowed, without treating the edited action as equivalent.
                    clearPrompt(); return;
                }
                if (!enabled()) { clearPrompt(); return; }
                setSillyTavernPrompt(KEY, buildActionCheckPrompt(records));
            } catch (error) {
                clearPrompt();
                console.error('[LittleWhiteBox] Dice check preparation failed', error);
                if (!current()) { abort(true); return; }
                if (own) {
                    own.error = '暂时无法继续行动检定。';
                    abort(true);
                } else if (observed) {
                    observed.error = '本次未能进行行动检定。';
                }
            }
        }, GENERATE_INTERCEPTOR_ORDER.XIAOBAI_OS_DICE);
        events.on(event_types.GENERATE_AFTER_DATA, (_data: unknown, dryRun: unknown) => { if (!dryRun) { clearPrompt(); } });
        events.on(event_types.MESSAGE_RECEIVED, (index: number, type: string) => {
            if (intention || observation?.stage !== 'receiving' || !MAIN_TYPES.includes(type) && type !== 'appendFinal') { return; }
            const observed = observation;
            observation = null;
            const stream = diceHostContext().streamingProcessor;
            // ST also emits MESSAGE_RECEIVED on a failed normal stream. Ignore only that call's
            // processor, not a stale failure left behind before a subsequent non-streaming reply.
            if (stream && stream !== observed.previousStream && stream.isStopped) { return; }
            const source = captureDiceChat();
            if (!source || source.key !== observed.source.key || source.chat !== observed.source.chat || observed.signal?.aborted) { return; }
            const target = captureDiceTarget(source, index, observed.from);
            if (!target || !target.body.startsWith(observed.initialBody)) { return; }
            session.accept(target, observed.error);
            if (!source.groupId) { void session.drain().catch(error => console.error('[LittleWhiteBox] Dice check failed', error)); }
        });
        events.on(event_types.GROUP_MEMBER_DRAFTED, groupBoundary);
        events.on(event_types.GROUP_WRAPPER_FINISHED, async () => { await groupBoundary(); wrapperSignal = undefined; });
        events.on(event_types.GENERATION_STOPPED, () => {
            const phase = session.view()?.phase.kind;
            // Internal wrapper stop must not discard the same-roll recovery candidate.
            if (phase !== 'save-error' && phase !== 'continue-error' && phase !== 'invalid') { cancel(); }
            clearPrompt();
        });
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
        unsubscribe = () => { events.cleanup(); unregisterGenerateInterceptor(KEY); };
    }

    async function stop(): Promise<void> {
        cancel(); unsubscribe?.(); unsubscribe = null; wrapperSignal = undefined;
        // Re-enabling the OS must not interpret a still-staged, unconfirmed write as persisted history.
        await saver.settled();
    }
    return { start, stop, cancel, settled: saver.settled, view: session.view, readConfirmed: saver.readConfirmed,
        async retry(index: number) {
            if (isGenerating()) { throw new Error('请等待酒馆生成结束。'); }
            const source = captureDiceChat();
            const target = source && captureDiceTarget(source, index, 0);
            if (!target) { throw new Error('回复已不存在。'); }
            await session.retry(target);
        },
    };
}
