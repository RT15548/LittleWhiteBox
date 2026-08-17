import {
    createAbortError,
    mergeAbortSignals,
} from '../../shared/common/abort-utils.js';

const NORMAL_GENERATION_TYPES = new Set([undefined, null, 'normal']);

function appendPlan(baseText, planText) {
    const base = String(baseText ?? '').trimEnd();
    return base ? `${base}\n\n${planText}` : planText;
}

export function createEnaPlannerInterceptor({
    getContext,
    getSettings,
    plan,
    updateMessageBlock,
    scheduleNotice = () => null,
    onError = () => {},
}) {
    let activeRun = null;

    const reportError = (error) => {
        try {
            onError(error);
        } catch {
            // Error reporting must not block the host generation.
        }
    };

    const cancelRunNotice = run => {
        if (!run) return;
        try {
            run.cancelNotice?.();
        } catch {
            // Notice cleanup must not affect planner cancellation.
        }
        run.cancelNotice = null;
    };

    const cancel = (reason = 'cancelled') => {
        const run = activeRun;
        if (!run) return;
        activeRun = null;
        run.cancelReason = reason;
        cancelRunNotice(run);
        run.runContext?.abort?.(true);
        run.controller.abort(createAbortError(`Ena Planner ${reason}`));
    };

    const run = async (coreChat, _contextSize, _abort, type, runContext) => {
        cancel('superseded');
        if (!NORMAL_GENERATION_TYPES.has(type) || !Array.isArray(coreChat)) return;

        const settings = getSettings();
        if (!settings?.enabled) return;

        const initialContext = getContext();
        const chat = initialContext?.chat;
        const chatId = initialContext?.chatId;
        const messageId = Array.isArray(chat) ? chat.length - 1 : -1;
        const message = messageId >= 0 ? chat[messageId] : null;
        if (chatId == null || !message?.is_user || message?.is_system) return;

        const originalRaw = String(message.mes ?? '');
        if (!originalRaw.trim()) return;
        if (settings.skipIfPlotPresent && /<plot\b/i.test(originalRaw)) return;

        let coreMessage = null;
        for (let i = coreChat.length - 1; i >= 0; i--) {
            if (coreChat[i]?.is_user && !coreChat[i]?.is_system) {
                coreMessage = coreChat[i];
                break;
            }
        }
        if (!coreMessage) return;

        const storyResult = runContext?.results?.get?.('story-summary');
        const controller = new AbortController();
        const signal = mergeAbortSignals(controller.signal, runContext?.signal) || controller.signal;
        const planningRun = {
            controller,
            runContext,
            chatId,
            messageId,
            message,
            originalRaw,
            cancelReason: null,
            cancelNotice: null,
        };
        activeRun = planningRun;
        const cancelNoticeFromSignal = () => cancelRunNotice(planningRun);
        signal.addEventListener('abort', cancelNoticeFromSignal, { once: true });

        const canCommit = () => {
            if (activeRun !== planningRun || signal.aborted) return false;
            const currentContext = getContext();
            const currentChat = currentContext?.chat;
            return currentContext?.chatId === chatId
                && Array.isArray(currentChat)
                && currentChat.length - 1 === messageId
                && currentChat[messageId] === message
                && message.is_user === true
                && message.mes === originalRaw;
        };

        try {
            try {
                if (!signal.aborted) planningRun.cancelNotice = scheduleNotice();
            } catch {
                // A status notification must never block the planner request.
            }
            const result = await plan(originalRaw, {
                signal,
                storyMemoryText: String(storyResult?.text || ''),
                recallLogText: String(storyResult?.recallLogText || ''),
            });
            const filteredPlan = String(result?.filtered || '').trim();
            if (!filteredPlan || !canCommit()) return;

            const mergedRaw = `${originalRaw}\n\n${filteredPlan}`.trim();
            coreMessage.mes = appendPlan(coreMessage.mes, filteredPlan);
            message.mes = mergedRaw;
            if (typeof message.extra?.display_text === 'string') {
                message.extra.display_text = appendPlan(message.extra.display_text, filteredPlan);
            }

            try {
                updateMessageBlock(messageId, message);
            } catch (error) {
                reportError(error);
            }

            return { messageId, text: filteredPlan };
        } catch (error) {
            if (!planningRun.cancelReason && !signal.aborted) reportError(error);
            return;
        } finally {
            cancelRunNotice(planningRun);
            signal.removeEventListener('abort', cancelNoticeFromSignal);
            if (activeRun === planningRun) activeRun = null;
        }
    };

    return { cancel, run };
}
