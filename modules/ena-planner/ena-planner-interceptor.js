import { createAbortError } from '../../shared/common/abort-utils.js';
import { assertPlannerApiUrlConfigured } from './ena-planner-api-config.js';
import { observeBackgroundTask } from '../../shared/common/async-errors.js';


function appendPlan(baseText, planText) {
    const base = String(baseText ?? '').trimEnd();
    const plan = String(planText ?? '').trim();
    if (!plan) return base;
    return base ? `${base}\n\n${plan}` : plan;
}

function isSendButtonEvent(event, button) {
    const target = event?.target;
    return !!button && (target === button || button.contains?.(target) === true);
}

function stopSendEvent(event) {
    event?.preventDefault?.();
    event?.stopImmediatePropagation?.();
}

function acquireBusyUi(textarea, button) {
    const textareaWasDisabled = textarea?.disabled === true;
    const buttonHadDisabledClass = button?.classList?.contains?.('disabled') === true;
    const previousAriaDisabled = button?.getAttribute?.('aria-disabled');

    if (textarea) textarea.disabled = true;
    button?.classList?.add?.('disabled');
    button?.setAttribute?.('aria-disabled', 'true');

    let released = false;
    return () => {
        if (released) return;
        released = true;
        if (textarea) textarea.disabled = textareaWasDisabled;
        if (!buttonHadDisabledClass) button?.classList?.remove?.('disabled');
        if (previousAriaDisabled == null) button?.removeAttribute?.('aria-disabled');
        else button?.setAttribute?.('aria-disabled', previousAriaDisabled);
    };
}

export function createEnaPlannerSendInterceptor({
    eventTarget,
    getChatIdentity,
    getSettings,
    getTextarea,
    getSendButton,
    shouldSendOnEnter,
    readStorySummary,
    plan,
    filterPreview = value => String(value ?? '').trim(),
    scheduleNotice = () => null,
    onError = () => {},
}) {
    let installed = false;
    let activeRun = null;
    let bypassButton = null;

    const reportError = (error) => {
        try {
            onError(error);
        } catch (caughtError) {
            console.warn({ source: import.meta.url, operation: "reportError" }, caughtError);
        }
    };

    const cancelRunNotice = run => {
        if (!run) return;
        try {
            run.cancelNotice?.();
        } catch (caughtError) {
            console.warn({ source: import.meta.url, operation: "cancelRunNotice" }, caughtError);
        }
        run.cancelNotice = null;
    };

    const finishRun = run => {
        cancelRunNotice(run);
        run?.releaseBusy?.();
        run.releaseBusy = null;
        if (activeRun === run) activeRun = null;
    };

    const ownsInput = run => (
        !!run
        && getChatIdentity() === run.chatIdentity
        && getTextarea() === run.textarea
        && String(run.textarea?.value ?? '') === run.lastWritten
    );

    const writeInput = (run, value) => {
        if (activeRun !== run || run.controller.signal.aborted || !ownsInput(run)) return false;
        const text = String(value ?? '');
        run.textarea.value = text;
        run.lastWritten = text;
        return true;
    };

    const restoreOriginal = run => {
        if (!ownsInput(run)) return false;
        run.textarea.value = run.initialValue;
        run.lastWritten = run.initialValue;
        return true;
    };

    const cancel = (reason = 'cancelled') => {
        const run = activeRun;
        if (!run) return;
        run.cancelReason = reason;
        if (reason !== 'chat-changed') restoreOriginal(run);
        run.controller.abort(createAbortError(`Ena Planner ${reason}`));
        finishRun(run);
    };

    const getEligibleSend = () => {
        const settings = getSettings();
        if (!settings?.enabled) return null;

        const textarea = getTextarea();
        const button = getSendButton();
        const chatIdentity = getChatIdentity();
        if (!textarea || !button || button.isConnected === false || !chatIdentity) return null;
        if (textarea.disabled === true
            || button.disabled === true
            || button.classList?.contains?.('disabled') === true
            || button.getAttribute?.('aria-disabled') === 'true') return null;

        const initialValue = String(textarea.value ?? '');
        const raw = initialValue.trim();
        if (!raw || raw.startsWith('/')) return null;
        if (/<plot\b/i.test(raw)) return null;

        return { button, chatIdentity, initialValue, raw, textarea };
    };

    const startPlanning = async eligible => {
        if (activeRun) return;

        const controller = new AbortController();
        const run = {
            ...eligible,
            cancelNotice: null,
            cancelReason: null,
            controller,
            lastWritten: eligible.initialValue,
            releaseBusy: acquireBusyUi(eligible.textarea, eligible.button),
        };
        activeRun = run;

        try {
            assertPlannerApiUrlConfigured(getSettings());
            try {
                run.cancelNotice = scheduleNotice();
            } catch (caughtError) {
                console.warn({ source: import.meta.url, operation: "startPlanning" }, caughtError);
            }

            const storyMemoryText = String(readStorySummary() || '');
            const result = await plan(run.raw, {
                signal: controller.signal,
                storyMemoryText,
                onDelta(_piece, full) {
                    if (!getSettings()?.api?.stream) return;
                    const preview = filterPreview(full);
                    writeInput(run, appendPlan(run.raw, preview));
                },
            });

            if (activeRun !== run || controller.signal.aborted) return;
            const filteredPlan = String(result?.filtered ?? '').trim();
            if (!filteredPlan) throw new Error('Ena 未生成有效的剧情规划');
            const finalText = appendPlan(run.raw, filteredPlan);
            if (!writeInput(run, finalText)) return;

            const button = getSendButton();
            if (!button || button.isConnected === false || typeof button.click !== 'function') {
                finishRun(run);
                reportError(new Error('Ena 规划已完成，但找不到 SillyTavern 发送入口；最终文本已保留在输入框中'));
                return;
            }

            finishRun(run);
            bypassButton = button;
            try {
                button.click();
            } catch (error) {
                reportError(error);
            } finally {
                if (bypassButton === button) bypassButton = null;
            }
        } catch (error) {
            const cancelled = !!run.cancelReason || controller.signal.aborted || error?.name === 'AbortError';
            if (!cancelled) {
                restoreOriginal(run);
                reportError(error);
            }
        } finally {
            finishRun(run);
        }
    };

    const handleClick = event => {
        const button = bypassButton || activeRun?.button || getSendButton();
        if (!isSendButtonEvent(event, button)) return;

        if (bypassButton === button) {
            bypassButton = null;
            return;
        }
        if (activeRun) {
            stopSendEvent(event);
            return;
        }

        const eligible = getEligibleSend();
        if (!eligible) return;
        stopSendEvent(event);
        observeBackgroundTask(startPlanning(eligible), { source: import.meta.url, operation: "handleClick" });
    };

    const handleKeydown = event => {
        const textarea = activeRun?.textarea || getTextarea();
        if (!textarea || event?.target !== textarea) return;
        const isSendEnter = event.key === 'Enter'
            && !event.isComposing
            && !event.altKey
            && (event.ctrlKey || !event.shiftKey)
            && shouldSendOnEnter();
        if (!isSendEnter) return;

        if (activeRun) {
            stopSendEvent(event);
            return;
        }

        const eligible = getEligibleSend();
        if (!eligible) return;
        stopSendEvent(event);
        observeBackgroundTask(startPlanning(eligible), { source: import.meta.url, operation: "handleKeydown" });
    };

    const install = () => {
        if (installed) return;
        eventTarget.addEventListener('click', handleClick, true);
        eventTarget.addEventListener('keydown', handleKeydown, true);
        installed = true;
    };

    const cleanup = () => {
        cancel('unloaded');
        bypassButton = null;
        if (!installed) return;
        eventTarget.removeEventListener('click', handleClick, true);
        eventTarget.removeEventListener('keydown', handleKeydown, true);
        installed = false;
    };

    return { cancel, cleanup, install };
}
