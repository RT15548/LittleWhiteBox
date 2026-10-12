const selection = message => ({ swipe_id: message?.swipe_id ?? 0, swipeCount: message?.swipes?.length ?? 0,
    swipeText: message?.swipes?.[message?.swipe_id ?? 0] });
const read = message => ({ message, mes: message?.mes, name: message?.name, is_user: message?.is_user, ...selection(message) });
const sameInput = (source, message) => source?.mes === message?.mes
    && source.name === message?.name && source.is_user === message?.is_user;
const sameSelection = (source, message) => {
    const current = selection(message);
    // Removing an unselected candidate can renumber the active branch without
    // changing its source. Removing the active candidate can keep its index.
    if (current.swipeCount < source.swipeCount) return source.swipeText === current.swipeText && sameInput(source, message);
    return source.swipe_id === current.swipe_id;
};
const sameSource = (source, message) => sameInput(source, message) && sameSelection(source, message);
const equal = (source, message) => source?.message === message && sameSource(source, message);
const firstFloor = (a, b) => a === null ? b : b === null ? a : Math.min(a, b);
const unionFloors = (a, b) => [...new Set([...a, ...b])].sort((a, b) => a - b);

// Two distinct facts: completed AI notifications, and successfully retired sources.
// Both are page-local. Notification deduplication can never confirm cache safety.
export function createMessageSourceTracker() {
    let owner = null;
    let sources = [];
    let generation = 0;
    let completions = new WeakMap();
    // Only unfinished consistency work survives an owner switch. The baseline
    // is borrowed, not copied again; success or chat deletion releases it.
    const pending = new Map();
    const capture = ({ chatId, chat }) => ({ owner: chatId, generation, sources: chat.map(read) });
    const isCurrent = (snapshot, { chatId, chat }) => snapshot?.owner === owner && chatId === owner
        && snapshot.generation === generation && snapshot.sources.length === chat.length
        && snapshot.sources.every((source, floor) => equal(source, chat[floor]));
    // Consume each native deletion at its notification boundary, not by count:
    // an intervening candidate addition can leave the total unchanged.
    // Deletion renumbers surviving branches, not their acknowledged prose.
    // A removed branch has no live index, even if its replacement has identical text.
    function rebaseDeletedSwipe(source, message, swipeId) {
        if (source?.message !== message) return source;
        return { ...source, swipeCount: message.swipes.length,
            swipe_id: source.swipe_id === swipeId ? -1 : source.swipe_id - Number(source.swipe_id > swipeId) };
    }
    function inspect(context, { kind = 'observed', floor: eventFloor = null } = {}) {
        const { chatId, chat } = context;
        if (chatId !== owner) return null;
        const positions = new Map(chat.map((message, floor) => [message, floor]));
        const sharedLength = Math.min(sources.length, chat.length);
        let firstMoved = 0;
        while (firstMoved < sharedLength && sources[firstMoved].message === chat[firstMoved]) firstMoved++;
        const structural = firstMoved < sharedLength || chat.length < sources.length;
        const lengthChanged = sources.length !== chat.length;
        const editedFloors = [];
        const anchorFloors = new Set();
        for (let floor = 0; floor < chat.length; floor++) {
            if (equal(sources[floor], chat[floor])) continue;
            editedFloors.push(floor);
            anchorFloors.add(floor);
            if ((sources[floor]?.is_user || chat[floor].is_user) && chat[floor + 1] && !chat[floor + 1].is_user) {
                anchorFloors.add(floor + 1);
            }
        }
        const obligation = pending.get(owner)?.change;
        // Explicit L2 replacement owns a newer source basis than unfinished
        // cache retirement. Never infer its undo from the old cache length.
        const rollbackSources = pending.get(owner)?.rollbackSources || sources;
        let rollbackFromFloor = obligation?.rollbackFromFloor ?? null;
        if (chat.length < rollbackSources.length || kind === 'delete') {
            let firstRemoved = 0;
            while (firstRemoved < Math.min(chat.length, rollbackSources.length)
                && rollbackSources[firstRemoved].message === chat[firstRemoved]) firstRemoved++;
            if (firstRemoved < rollbackSources.length) rollbackFromFloor = firstFloor(rollbackFromFloor, firstRemoved);
        }
        for (let floor = 0; floor < rollbackSources.length; floor++) {
            const source = rollbackSources[floor];
            // ST changes the chosen branch before its delayed swipe event.
            const currentFloor = positions.get(source.message);
            if (currentFloor !== undefined && !sameSelection(source, chat[currentFloor])) {
                rollbackFromFloor = firstFloor(rollbackFromFloor, Math.min(floor, currentFloor));
            }
        }
        if (kind === 'swipe' && rollbackSources[eventFloor] && chat[eventFloor]
            && !equal(rollbackSources[eventFloor], chat[eventFloor])) {
            rollbackFromFloor = firstFloor(rollbackFromFloor, eventFloor);
        }
        if (!editedFloors.length && !lengthChanged && !obligation && rollbackFromFloor === null) return null;
        return {
            fromFloor: firstFloor(obligation?.fromFloor ?? null, structural || lengthChanged ? Math.min(firstMoved, ...editedFloors) : null),
            structural: structural || !!obligation?.structural,
            editedFloors: unionFloors(obligation?.editedFloors || [], editedFloors),
            anchorFloors: unionFloors(obligation?.anchorFloors || [], anchorFloors),
            rollbackFromFloor,
        };
    }
    // CHAT_CHANGED also means reloadCurrentChat: parsed objects replace the live
    // objects without changing chatId (or even the array). Rebind identity only;
    // the acknowledged input and unfinished retirement ranges remain untouched.
    function bindSources(baseline, chat) {
        const oldMessages = new Set(baseline.map(source => source.message));
        const liveMessages = new Set(chat);
        let rebound = false;
        const next = baseline.map((source, floor) => {
            const message = chat[floor];
            if (!message || liveMessages.has(source.message) || oldMessages.has(message)
                || (!sameSource(source, message) && !sameSource(read(source.message), message))) return source;
            rebound = true;
            return { ...source, message };
        });
        return rebound ? next : baseline;
    }
    function bindLoadedSources(chat) {
        const next = bindSources(sources, chat);
        const obligation = pending.get(owner);
        if (obligation?.rollbackSources) obligation.rollbackSources = bindSources(obligation.rollbackSources, chat);
        if (next !== sources) {
            sources = next;
            if (obligation) obligation.sources = sources;
            completions = new WeakMap(chat.map(message => [message, read(message)]));
            return true;
        }
        return false;
    }
    function reset({ chatId = null, chat = [] } = {}) {
        owner = chatId;
        sources = pending.get(chatId)?.sources || chat.map(read);
        if (pending.has(chatId)) bindLoadedSources(chat);
        completions = new WeakMap(chat.map(message => [message, read(message)]));
        generation++;
    }
    function retain(context, options = {}) {
        if (context.chatId !== owner) return;
        const change = inspect(context, options);
        if (!change) return;
        const previous = pending.get(owner);
        pending.set(owner, { ...previous, sources, change });
    }
    return {
        capture, inspect, isCurrent, reset, retain,
        observeSwipeDeleted(context, { messageId, swipeId }) {
            if (context.chatId !== owner) return;
            const message = context.chat[messageId];
            const rebase = baseline => baseline.map(source => rebaseDeletedSwipe(source, message, swipeId));
            sources = rebase(sources);
            const obligation = pending.get(owner);
            if (obligation) {
                obligation.sources = sources;
                if (obligation.rollbackSources) obligation.rollbackSources = rebase(obligation.rollbackSources);
            }
            if ([sources, obligation?.rollbackSources || []].some(baseline => baseline.some(source =>
                source.message === message && !sameSelection(source, message)))) generation++;
            const completion = completions.get(message);
            if (completion) completions.set(message, rebaseDeletedSwipe(completion, message, swipeId));
            retain(context);
        },
        forget(chatId) { pending.delete(chatId); },
        // Explicit L2 import/clear replaces the old undo obligation, not L0/L1 sources.
        // Call only after its confirmed commit, and never release a newer edit's work.
        resolveRollback(snapshot, context) {
            if (!isCurrent(snapshot, context)) return;
            retain(context);
            const obligation = pending.get(owner);
            if (obligation) {
                obligation.rollbackSources = snapshot.sources;
                obligation.change.rollbackFromFloor = null;
            }
        },
        switchChat(context) {
            if ((context.chatId || null) !== owner) reset(context);
            else if (bindLoadedSources(context.chat)) generation++;
        },
        observeCompletion({ chatId, chat }, floor) {
            const message = chat[floor];
            if (chatId !== owner || !message || message.is_user || equal(completions.get(message), message)) return false;
            completions.set(message, read(message));
            return true;
        },
        // Caller owns the existing serial consistency-write session. No second queue.
        async synchronize(context, apply, readCurrent = () => context) {
            if (context.chatId !== owner || !readCurrent()) return { status: 'stale' };
            const change = inspect(context);
            if (!change) { pending.delete(owner); return { status: 'unchanged' }; }
            retain(context);
            const snapshot = capture(context);
            const result = await apply(change);
            if (!result || !['not_needed', 'rolled_back'].includes(result.status)) {
                return { status: result?.status === 'stale' ? 'stale' : 'failed', change, result };
            }
            const current = readCurrent();
            if (!current || !isCurrent(snapshot, current)) return { status: 'stale', change, result };
            // Harmless candidate deletion during the write may have renumbered
            // the same branch. Do not restore its pre-notification indices.
            sources = current.chat.map(read);
            pending.delete(owner);
            return { status: 'synced', change, result };
        },
    };
}
