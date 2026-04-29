import { getContext } from "../../../../extensions.js";
import { xbLog } from "./debug-core.js";

const MODULE_ID = "afterAiGate";
const READY_TIMEOUT_MS = 2000;
const STILL_GENERATING_LOG_INTERVAL_MS = 400;

let initialized = false;
let bodyObserver = null;
let treeObserver = null;
let stopObserver = null;
let observedStopEl = null;
let pollTimer = null;
let checkQueued = false;
let activeTicket = null;
let nextTicketId = 0;
const queuedTickets = [];

const handlerRegistry = new Map();
const lastFlushedSignatureByChat = new Map();

function safeNow() {
    return Date.now();
}

function nextFrame() {
    return new Promise((resolve) => {
        const raf = globalThis.requestAnimationFrame;
        if (typeof raf === "function") {
            raf(() => resolve());
            return;
        }
        setTimeout(resolve, 16);
    });
}

function currentChatId() {
    const ctx = getContext?.();
    return String(ctx?.chatId || "");
}

function getMessageById(chatId, messageId) {
    const ctx = getContext?.();
    if (String(ctx?.chatId || "") !== String(chatId || "")) return null;
    return ctx?.chat?.[messageId] || null;
}

function resolveMessageSignature(chatId, messageId) {
    const msg = getMessageById(chatId, messageId);
    if (!msg) return `${messageId}:missing`;
    const stamp = msg.send_date
        || msg?.gen_finished?.toISOString?.()
        || msg?.gen_started?.toISOString?.()
        || `${String(msg.mes || "").length}`;
    return `${messageId}:${stamp}`;
}

function isStopButtonHidden() {
    const stopEl = document.getElementById("mes_stop");
    if (!stopEl || !stopEl.isConnected) return true;
    const style = window.getComputedStyle?.(stopEl);
    if (!style) return !!stopEl.hidden;
    if (stopEl.hidden) return true;
    if (style.display === "none") return true;
    if (style.visibility === "hidden") return true;
    if (style.opacity === "0" && style.pointerEvents === "none") return true;
    return false;
}

function isHostReadyForAfterAi(chatId) {
    if (!chatId) return false;
    if (currentChatId() !== String(chatId)) return false;
    if (document.body?.dataset?.generating) return false;
    if (!isStopButtonHidden()) return false;
    return true;
}

function disconnectStopObserver() {
    stopObserver?.disconnect?.();
    stopObserver = null;
    observedStopEl = null;
}

function bindStopObserver() {
    const stopEl = document.getElementById("mes_stop");
    if (stopEl === observedStopEl) return;
    disconnectStopObserver();
    if (!stopEl) return;
    observedStopEl = stopEl;
    stopObserver = new MutationObserver(() => scheduleCheck("stop-mutated"));
    stopObserver.observe(stopEl, {
        attributes: true,
        attributeFilter: ["style", "class", "hidden", "aria-hidden"],
        childList: true,
        subtree: true,
    });
}

function stopWatching() {
    bodyObserver?.disconnect?.();
    treeObserver?.disconnect?.();
    disconnectStopObserver();
    bodyObserver = null;
    treeObserver = null;
    if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
    }
}

function ensureWatching() {
    if (!document?.body) return;
    if (!bodyObserver) {
        bodyObserver = new MutationObserver(() => scheduleCheck("body-generating"));
        bodyObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ["data-generating"],
        });
    }
    if (!treeObserver) {
        treeObserver = new MutationObserver(() => {
            bindStopObserver();
            scheduleCheck("tree-mutated");
        });
        treeObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
    bindStopObserver();
}

function ensurePoll() {
    if (pollTimer) clearTimeout(pollTimer);
    if (!activeTicket) return;
    pollTimer = setTimeout(() => {
        pollTimer = null;
        scheduleCheck("poll");
    }, 100);
}

async function flushHandlers(ticket, reason) {
    const handlers = [...handlerRegistry.entries()];
    const payload = {
        chatId: ticket.chatId,
        messageId: ticket.messageId,
        signature: ticket.signature,
        hints: [...ticket.hints],
        reason,
    };

    xbLog.info(MODULE_ID, `after-ai ready chat=${ticket.chatId} message=${ticket.messageId} reason=${reason}`);
    for (const [moduleId, handler] of handlers) {
        try {
            xbLog.info(MODULE_ID, `handler start: ${moduleId}`);
            await handler(payload);
            xbLog.info(MODULE_ID, `handler end: ${moduleId}`);
        } catch (error) {
            xbLog.warn(MODULE_ID, `handler failed: ${moduleId}`, error?.message || String(error));
        }
    }
}

function clearActiveTicket(ticket, { markFlushed = false } = {}) {
    if (!ticket) return;
    if (activeTicket?.id !== ticket.id) return;
    if (markFlushed) {
        lastFlushedSignatureByChat.set(ticket.chatId, ticket.signature);
    }
    activeTicket = null;
    if (queuedTickets.length > 0) {
        activeTicket = queuedTickets.shift();
        ensureWatching();
        scheduleCheck("next-ticket");
        return;
    }
    stopWatching();
}

async function evaluateActiveTicket(triggerReason) {
    const ticket = activeTicket;
    if (!ticket) return;

    if (currentChatId() !== String(ticket.chatId)) {
        xbLog.info(MODULE_ID, `drop stale ticket chat=${ticket.chatId} message=${ticket.messageId} reason=chat-changed`);
        clearActiveTicket(ticket);
        return;
    }

    const ready = isHostReadyForAfterAi(ticket.chatId);
    if (ready) {
        await nextFrame();
        if (!activeTicket || activeTicket.id !== ticket.id) return;
        if (!isHostReadyForAfterAi(ticket.chatId)) {
            ensurePoll();
            return;
        }

        await nextFrame();
        if (!activeTicket || activeTicket.id !== ticket.id) return;
        if (!isHostReadyForAfterAi(ticket.chatId)) {
            ensurePoll();
            return;
        }

        await flushHandlers(ticket, triggerReason);
        clearActiveTicket(ticket, { markFlushed: true });
        return;
    }

    if (safeNow() >= ticket.deadlineAt && !ticket.timeoutWarned) {
        ticket.timeoutWarned = true;
        xbLog.warn(MODULE_ID, `after-ai still waiting chat=${ticket.chatId} message=${ticket.messageId}`);
    }

    if (safeNow() - ticket.lastStillGeneratingLogAt >= STILL_GENERATING_LOG_INTERVAL_MS) {
        ticket.lastStillGeneratingLogAt = safeNow();
        xbLog.info(MODULE_ID, `host still generating chat=${ticket.chatId} message=${ticket.messageId}`);
    }

    ensurePoll();
}

function scheduleCheck(reason = "manual") {
    if (!activeTicket || checkQueued) {
        ensurePoll();
        return;
    }
    checkQueued = true;
    queueMicrotask(async () => {
        checkQueued = false;
        try {
            await evaluateActiveTicket(reason);
        } catch (error) {
            xbLog.warn(MODULE_ID, "evaluate ticket failed", error?.message || String(error));
            ensurePoll();
        }
    });
}

export function initAfterAiGate() {
    if (initialized) return;
    initialized = true;
}

export function registerAfterAiHandler(moduleId, handler) {
    initAfterAiGate();
    if (!moduleId || typeof handler !== "function") return () => {};
    handlerRegistry.set(moduleId, handler);
    return () => {
        if (handlerRegistry.get(moduleId) === handler) {
            handlerRegistry.delete(moduleId);
        }
    };
}

export function notifyAfterAiHint({ chatId, messageId, source = "unknown", kind = "unknown" } = {}) {
    initAfterAiGate();
    const normalizedChatId = String(chatId || "");
    const normalizedMessageId = Number(messageId);
    if (!normalizedChatId || !Number.isFinite(normalizedMessageId) || normalizedMessageId < 0) return;

    const signature = resolveMessageSignature(normalizedChatId, normalizedMessageId);
    if (!document.body?.dataset?.generating && lastFlushedSignatureByChat.get(normalizedChatId) === signature) {
        return;
    }

    const hint = `${source}:${kind}`;
    if (activeTicket && activeTicket.chatId === normalizedChatId && activeTicket.signature === signature) {
        activeTicket.hints.add(hint);
        scheduleCheck("hint-merge");
        return;
    }

    const queued = queuedTickets.find((ticket) => ticket.chatId === normalizedChatId && ticket.signature === signature);
    if (queued) {
        queued.hints.add(hint);
        return;
    }

    const ticket = {
        id: ++nextTicketId,
        chatId: normalizedChatId,
        messageId: normalizedMessageId,
        signature,
        createdAt: safeNow(),
        deadlineAt: safeNow() + READY_TIMEOUT_MS,
        hints: new Set([hint]),
        lastStillGeneratingLogAt: 0,
        timeoutWarned: false,
    };

    xbLog.info(MODULE_ID, `after-ai hint chat=${normalizedChatId} message=${normalizedMessageId} source=${source} kind=${kind}`);
    if (!activeTicket) {
        activeTicket = ticket;
        ensureWatching();
        scheduleCheck("hint");
        return;
    }

    queuedTickets.push(ticket);
}
