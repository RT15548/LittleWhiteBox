const RECENT_INPUT_SHARE = 0.15;

// Each assistant call and all of its parallel results form one indivisible unit.
// Only the current turn supplies raw history. Its user request and pinned
// tool exchanges do not spend the tail allowance.
export function selectCompactionRange(messages, costs, inputLimit, tailCapacity = inputLimit, pinnedMessages = []) {
    const pinnedUser = messages.findLastIndex(message => message.role === 'user');
    const afterUser = pinnedUser + 1;
    const pinned = new Set(pinnedMessages);
    const isPinned = (index) => index === pinnedUser || (index >= afterUser && pinned.has(messages[index]));
    let remaining = Math.min(Math.floor(inputLimit * RECENT_INPUT_SHARE), tailCapacity);
    let end = messages.length;
    while (end > afterUser) {
        let start = end - 1;
        while (start > afterUser && messages[start].role === 'tool') start--;
        if (!isPinned(start)) {
            for (let i = start; i < end; i++) remaining -= costs[i];
            if (remaining < 0) break;
        }
        end = start;
    }
    return {
        priorCount: pinnedUser < 0 ? end : pinnedUser,
        archived: messages.slice(0, end).filter((_, i) => !isPinned(i)),
        retained: messages.filter((_, i) => isPinned(i) || i >= end),
    };
}
