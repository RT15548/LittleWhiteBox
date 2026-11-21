const RECENT_INPUT_SHARE = 0.15;

// Each assistant call and all of its parallel results form one indivisible unit.
// The latest user request is pinned separately and does not spend the tail allowance.
export function selectCompactionRange(messages, costs, inputLimit, tailCapacity = inputLimit) {
    const pinned = messages.findLastIndex(message => message.role === 'user');
    let remaining = Math.min(Math.floor(inputLimit * RECENT_INPUT_SHARE), tailCapacity);
    let end = messages.length;
    while (end > 0) {
        let start = end - 1;
        while (start > 0 && messages[start].role === 'tool') start--;
        if (start !== pinned) {
            for (let i = start; i < end; i++) remaining -= costs[i];
            if (remaining < 0) break;
        }
        end = start;
    }
    return {
        priorCount: pinned < 0 ? end : Math.min(pinned, end),
        archived: messages.slice(0, end).filter((_, i) => i !== pinned),
        retained: messages.filter((_, i) => i === pinned || i >= end),
    };
}
