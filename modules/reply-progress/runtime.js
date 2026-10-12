import { observeGenerateInterceptors } from '../../shared/common/generate-interceptor.js';
import { createPlaceholderPresenter } from './placeholder.js';
import { REPLY_PROGRESS_ERRORS } from './copy.js';

const VISIBLE_TYPES = new Set(['normal', 'regenerate', 'swipe', 'continue']);
// A display lease, NOT a request timeout. ST has no request identity on ENDED
// and some preflight failures emit no end at all. Unconfirmed hints expire;
// a joined handler or an identified live stream can legitimately take longer.
export const UNCONFIRMED_HINT_MS = 60_000;

const generationType = type => String(type || 'normal');
function isVisibleGeneration(type, params, dryRun) {
    return !dryRun && !params?.automatic_trigger && !(params?.quiet_prompt && !params?.quietToLoud)
        && VISIBLE_TYPES.has(generationType(type));
}

// Own only one foreground reply's display. Global busy/idle, raw prompt events
// and untyped native completion events alone are not this reply's lifecycle.
export function createReplyProgressRuntime({
    events, eventTypes, getTextarea, getChat, getStream, isSendPressed, observeRequest,
    getGroupId = () => null,
    observeActions = () => () => {},
    isConnected = () => true,
    now = () => performance.now(),
    schedule = (fn, ms) => setInterval(fn, ms),
    unschedule = timer => clearInterval(timer),
    createPresenter = createPlaceholderPresenter,
    reportError = (message, error) => console.error(message, error),
}) {
    let enabled = false;
    let run = null;
    let timer = null;
    let group = null;
    let completedReply = null;
    const listeners = [];
    let unobserveInterceptors = null;
    let unobserveActions = null;

    function cleanup(action) {
        try { action?.(); }
        catch (error) { reportError(REPLY_PROGRESS_ERRORS.cleanup, error); }
    }

    function stop() {
        const previous = run;
        run = null;
        if (timer !== null) {
            const previousTimer = timer;
            timer = null;
            cleanup(() => unschedule(previousTimer));
        }
        cleanup(previous?.unobserveRequest);
        cleanup(() => previous?.presenter.restore());
    }

    function complete(message) {
        completedReply = { chat: run.chat, message };
        stop();
    }

    // Observers are synchronous and never return a Promise for the host to
    // await. A broken hint must not throw into another plugin or a request.
    function observe(callback) {
        return (...args) => {
            try { callback(...args); }
            catch (error) {
                stop();
                reportError(REPLY_PROGRESS_ERRORS.observe, error);
            }
        };
    }

    function setStage(phase, detail = null) {
        if (!run || run.phase === phase && run.detail === detail) return;
        run.phase = phase;
        run.detail = detail;
        run.evidenceAt = now();
    }

    function claimStream() {
        if (!run || !run.afterCommands || run.stream || run.handler) return;
        const stream = getStream();
        if (stream && stream !== run.previousStream && generationType(stream.type) === run.type
            && (run.replyIndex === null || stream.messageId === -1 || stream.messageId === run.replyIndex)) {
            run.stream = stream;
            setStage('waiting');
        }
    }

    function paint() {
        if (!run) return;
        if (getChat() !== run.chat || !isConnected()
            || run.signal?.aborted || run.dispatch?.signal.aborted) {
            stop();
            return;
        }
        claimStream();
        const stream = run.stream;
        if (stream && (String(stream.result || '').trim() || stream.isFinished || stream.isStopped
            || stream.abortController?.signal.aborted)) {
            complete(run.chat[stream.messageId]);
            return;
        }
        if (run.recall) {
            setStage('recall', run.recall.stage);
        }
        if (!stream && !run.handler && now() - run.evidenceAt >= UNCONFIRMED_HINT_MS) {
            stop();
            return;
        }
        run.presenter.show({ phase: run.phase, detail: run.detail, elapsedMs: now() - run.startedAt });
    }

    function onHostEnded() {
        paint();
        // ST 1.14/1.18 unblock a failed streaming request and emit ENDED before
        // dropping its stream, without marking that object stopped/finished.
        // A quiet completion cannot unblock a live stream. An earlier awaited
        // listener may let the host clear its pointer before we see ENDED.
        // Require an identified stream and released sending state; a replacement
        // stream or global idle without this event does not end our reply.
        const currentStream = getStream();
        if (run?.stream && (!currentStream || currentStream === run.stream) && !isSendPressed()) stop();
    }

    function start(type, params, dryRun) {
        const normalized = generationType(type);
        if (!isVisibleGeneration(type, params, dryRun)) return;
        if (normalized === 'normal' && getTextarea()?.value?.trimStart().startsWith('/')) return;
        // ST's automatic continuation clicks the same control as manual
        // continuation, without automatic_trigger. A trusted reply action
        // clears this marker; continuation of already-visible text does not.
        if (normalized === 'continue' && completedReply?.chat === getChat()
            && completedReply.message === getChat().at(-1)) return;
        if (group && group.chat === getChat() && group.id === getGroupId()) {
            // Later members of one group reply cannot restart a hint after
            // its first member has already produced text.
            if (group.started) {
                if (run && !run.dispatch) { run.type = normalized; run.signal = params?.signal; }
                return;
            }
            group.started = true;
        }
        stop();
        completedReply = null;
        const textarea = getTextarea();
        if (!textarea || !isConnected()) return;
        const startedAt = now();
        run = {
            chat: getChat(), groupId: getGroupId(), type: normalized, signal: params?.signal,
            previousMessage: getChat()?.at(-1), previousText: getChat()?.at(-1)?.mes || '',
            previousStream: getStream(), stream: null, replyIndex: null,
            startedAt, evidenceAt: startedAt, phase: 'context', detail: null,
            afterCommands: false, dispatch: null,
            handler: null, recall: null, unobserveRequest: null,
            presenter: createPresenter(textarea),
        };
        paint();
        if (run) timer = schedule(observe(paint), 200);
    }

    function onInterceptor({ phase, id, type, run: dispatch, detail }) {
        if (!run || run.chat !== getChat() || generationType(type) !== run.type || !run.afterCommands) return;
        if (phase === 'dispatch-start') {
            if (run.dispatch) return;
            run.dispatch = dispatch;
            setStage('context');
        } else if (run.dispatch !== dispatch) return;
        else if (dispatch.signal.aborted) {
            paint();
            return;
        } else if (phase === 'handler-start') {
            run.handler = id;
            if (id !== 'story-summary') setStage('interceptor', id);
        } else if (phase === 'handler-progress' && run.handler === 'story-summary') {
            run.recall = detail;
            setStage(detail ? 'recall' : 'context', detail?.stage);
        } else if (phase === 'handler-end' && run.handler === id) {
            run.handler = null;
            run.recall = null;
            setStage('context');
        } else if (phase === 'dispatch-end') {
            run.handler = null;
            run.recall = null;
            // Interceptors may legitimately append messages. Capture the
            // response position after their work, not before it.
            run.replyIndex = ['continue', 'swipe'].includes(run.type) ? run.chat.length - 1 : run.chat.length;
            run.evidenceAt = now();
            const owner = run;
            owner.unobserveRequest = observeRequest({ type: owner.type }, observe(() => {
                if (run !== owner) return;
                cleanup(owner.unobserveRequest);
                owner.unobserveRequest = null;
                setStage('waiting');
                paint();
            }));
            setStage(owner.unobserveRequest ? 'context' : 'waiting');
        }
        paint();
    }

    function on(name, callback) {
        // Keep other listeners' relative order; observe before their awaited
        // work so that waiting for a plugin is included in the total time.
        const event = eventTypes[name];
        const listener = observe(callback);
        events.makeFirst(event, listener);
        listeners.push([event, listener]);
    }

    function enable() {
        if (enabled) return;
        enabled = true;
        on('GENERATION_STARTED', start);
        on('GENERATION_AFTER_COMMANDS', (type, params, dryRun) => {
            // Never start here: delayed/background post-command notifications
            // cannot resurrect a reply that already produced text.
            if (!run || run.chat !== getChat() || generationType(type) !== run.type
                || !isVisibleGeneration(type, params, dryRun)) return;
            run.afterCommands = true;
            paint();
        });
        on('MESSAGE_SENT', index => {
            if (run?.type === 'normal' && !run.dispatch && run.chat === getChat() && run.chat[index]?.is_user) {
                setStage('message');
                paint();
            }
        });
        on('USER_MESSAGE_RENDERED', index => {
            if (run?.phase === 'message' && run.chat === getChat() && run.chat[index]?.is_user) {
                setStage('context');
                paint();
            }
        });
        // An untyped token/stop is only a chance to inspect our pinned stream,
        // never evidence that a background task belongs to this reply.
        for (const name of ['STREAM_TOKEN_RECEIVED', 'GENERATION_STOPPED']) on(name, paint);
        on('GENERATION_ENDED', onHostEnded);
        on('MESSAGE_RECEIVED', (index, type) => {
            if (!run || !run.afterCommands || getChat() !== run.chat) return;
            const sameType = generationType(type) === run.type
                || (run.type === 'continue' && type === 'appendFinal')
                || (['regenerate', 'swipe'].includes(run.type) && type === 'normal');
            if (!sameType || index !== (run.replyIndex ?? run.chat.length - 1)) return;
            const message = run.chat[index];
            if (message?.is_user !== false || message.is_system) return;
            if (run.type === 'normal' && message === run.previousMessage) return;
            if (run.type === 'continue' && message === run.previousMessage && message.mes === run.previousText) return;
            complete(message);
        });
        on('GROUP_WRAPPER_STARTED', ({ selected_group, type }) => {
            if (!VISIBLE_TYPES.has(generationType(type)) || selected_group !== getGroupId()) return;
            group = { chat: getChat(), id: selected_group, started: !!run };
        });
        on('GROUP_WRAPPER_FINISHED', ({ selected_group, type }) => {
            if (!group || group.chat !== getChat() || group.id !== selected_group || !VISIBLE_TYPES.has(generationType(type))) return;
            if (run?.groupId === selected_group) stop();
            group = null;
        });
        on('CHAT_CHANGED', () => { stop(); group = null; completedReply = null; });
        unobserveInterceptors = observeGenerateInterceptors(observe(onInterceptor));
        unobserveActions = observeActions({ onStop: observe(stop), onReply: () => { completedReply = null; } });
    }

    function disable() {
        if (!enabled) return;
        enabled = false;
        stop();
        group = null;
        completedReply = null;
        for (const [event, listener] of listeners) cleanup(() => events.removeListener(event, listener));
        listeners.length = 0;
        cleanup(unobserveInterceptors);
        cleanup(unobserveActions);
        unobserveInterceptors = unobserveActions = null;
    }

    return { setEnabled: value => value ? enable() : disable(), destroy: disable };
}
