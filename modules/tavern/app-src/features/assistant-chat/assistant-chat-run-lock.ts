interface TavernAssistantChatLockManager {
    request<T>(
        name: string,
        options: { mode: 'exclusive'; ifAvailable: true },
        callback: (lock: unknown | null) => Promise<T | undefined>,
    ): Promise<T | undefined>;
}

const locallyClaimedSessions = new Set<string>();

export type TavernAssistantChatRunLockResult<T> =
    | { acquired: true; value: T }
    | { acquired: false };

export async function withTavernAssistantChatRunLock<T>(
    sessionId: string,
    operation: () => Promise<T>,
): Promise<TavernAssistantChatRunLockResult<T>> {
    const id = String(sessionId || '').trim();
    if (!id || locallyClaimedSessions.has(id)) {return { acquired: false };}
    locallyClaimedSessions.add(id);
    try {
        const lockManager = (globalThis.navigator as Navigator & { locks?: TavernAssistantChatLockManager } | undefined)?.locks;
        if (!lockManager?.request) {
            return { acquired: true, value: await operation() };
        }
        let acquired = false;
        let value: T | undefined;
        await lockManager.request(
            `little-white-box:tavern:assistant-chat:${id}`,
            { mode: 'exclusive', ifAvailable: true },
            async (lock) => {
                if (!lock) {return undefined;}
                acquired = true;
                value = await operation();
                return value;
            },
        );
        return acquired
            ? { acquired: true, value: value as T }
            : { acquired: false };
    } finally {
        locallyClaimedSessions.delete(id);
    }
}
