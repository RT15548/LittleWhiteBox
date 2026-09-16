// One completed, adopted memory per runtime. No chat snapshots or retrieval
// sessions belong here. Tickets live only for the pending prepare/commit call.
export function createRecallReuse() {
    let memory = null;
    let version = 0;

    function invalidate() {
        memory = null;
        version++;
    }

    function hasSource(binding, context) {
        return !!binding && binding.chatId === context?.chatId
            && context?.chat?.[binding.sourceIndex] === binding.sourceRef;
    }

    function historyChanged(context, changedFloor = null) {
        // Deletion is observed after the host mutates chat. Swipe reports its
        // actual floor; replacing the current answer does not change its query.
        if (!hasSource(memory, context)
            || (changedFloor !== null && changedFloor < memory.replyStart)) invalidate();
    }

    function prepare(context, type = 'normal') {
        // Quiet/impersonation calls keep their existing recall behavior and do
        // not own the conversational round's memory.
        if (!['normal', 'continue', 'swipe', 'regenerate'].includes(type)) {
            return { ticket: null, memory: null };
        }
        const chat = context?.chat;
        if (!context?.chatId || !Array.isArray(chat) || !chat.length) {
            invalidate();
            return { ticket: null, memory: null };
        }
        const lastIndex = chat.length - 1;
        // Native regenerate has already deleted its answer before interception.
        const sourceIndex = type === 'swipe' && !chat[lastIndex]?.is_user
            ? lastIndex - 1 : lastIndex;
        const sameSource = memory?.sourceIndex === sourceIndex
            && memory?.sourceRef === chat[sourceIndex]
            // A first-operation continue can use its own partial answer as the
            // query. A later normal generation starts a new reply to that AI.
            && !(type === 'normal' && memory.replyStart === memory.sourceIndex);
        const sameAnswer = (type === 'continue' || type === 'swipe')
            && lastIndex === memory?.replyStart && !chat[lastIndex]?.is_user;
        if (hasSource(memory, context) && (sameSource || sameAnswer)) {
            return { ticket: { ...bindingOf(memory), version, chatLength: chat.length }, memory };
        }

        invalidate();
        if (!chat[sourceIndex]) return { ticket: null, memory: null };
        return {
            ticket: {
                version, chatLength: chat.length, chatId: context.chatId,
                sourceRef: chat[sourceIndex], sourceIndex,
                replyStart: type === 'continue' && !chat[lastIndex]?.is_user
                    ? lastIndex : sourceIndex + 1,
            },
            memory: null,
        };
    }

    function isCurrent(ticket, context) {
        return ticket?.version === version && hasSource(ticket, context)
            && ticket.chatLength === context.chat.length;
    }

    function adopt(ticket, context, { text, boundary, role, report }) {
        if (!isCurrent(ticket, context)) return false;
        memory = Object.freeze({ ...bindingOf(ticket), text, boundary, role, report });
        return true;
    }

    return Object.freeze({
        prepare, isCurrent, adopt, invalidate, historyChanged,
        getStats: () => ({
            count: Number(!!memory),
            sourceFloor: memory ? memory.sourceIndex + 1 : null,
            bytes: memory ? (memory.text.length + memory.report.length) * 2 : 0,
        }),
    });
}

function bindingOf({ chatId, sourceRef, sourceIndex, replyStart }) {
    return { chatId, sourceRef, sourceIndex, replyStart };
}

// Compare only inputs consumed by recall/assembly; generation API preferences
// and hide flags do not change an adopted memory. keepVisibleCount also controls
// which recent evidence the assembler includes.
export function recallConfigKey(config) {
    return JSON.stringify([
        config?.vector, config?.textFilterRules, config?.prompts?.memoryTemplate,
        config?.trigger?.role, config?.trigger?.wrapperHead, config?.trigger?.wrapperTail,
        config?.ui?.keepVisibleCount,
    ]);
}
