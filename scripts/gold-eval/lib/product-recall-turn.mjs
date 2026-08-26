// Gold Eval - reproduce the product's in-memory USER turn boundary.

function assertHistoryIdentity(chat, historyMessages, label) {
    if (!Array.isArray(chat) || !Array.isArray(historyMessages)) {
        throw new Error(`${label}: recall chat/history must be arrays`);
    }
    if (chat.length !== historyMessages.length
        || chat.some((message, index) => message !== historyMessages[index])) {
        throw new Error(`${label}: recall context is not the frozen pre-query history`);
    }
}

function assertUserMessage(message, label) {
    if (!message || typeof message !== 'object' || message.is_user !== true) {
        throw new Error(`${label}: focus message must be a real USER message object`);
    }
    if (!String(message.mes || '').trim()) {
        throw new Error(`${label}: focus USER message is empty`);
    }
}

function productTurnDrift(chat, historyRefs, focusMessage, label) {
    if (chat.length !== historyRefs.length + 1
        || historyRefs.some((message, index) => chat[index] !== message)
        || chat[historyRefs.length] !== focusMessage) {
        return new Error(`${label}: recall mutated the in-memory chat turn`);
    }
    return null;
}

/**
 * Mirror the product boundary: chat.push(realUserMessage) -> recall.
 *
 * The USER object is deliberately temporary here. Historical Summary/L0/L1
 * state remains frozen at q-1, while recall sees the exact in-memory chat that
 * the plugin sees after SillyTavern has pushed q. Removing q afterwards keeps
 * independent cases and immutable boundary snapshots isolated.
 */
export async function withProductRecallTurn({
    modules,
    historyMessages,
    focusMessage,
    label = 'recall-case',
    execute,
}) {
    if (typeof execute !== 'function') {
        throw new Error(`${label}: recall executor is missing`);
    }
    const chat = modules?.getContext?.()?.chat;
    assertHistoryIdentity(chat, historyMessages, label);
    assertUserMessage(focusMessage, label);

    const historyRefs = chat.slice();
    chat.push(focusMessage);
    let result;
    let executionError = null;
    try {
        result = await execute();
    } catch (error) {
        executionError = error;
    }
    const driftError = productTurnDrift(chat, historyRefs, focusMessage, label);
    chat.splice(0, chat.length, ...historyRefs);
    if (driftError) {
        if (executionError) driftError.cause = executionError;
        throw driftError;
    }
    if (executionError) throw executionError;
    return result;
}
