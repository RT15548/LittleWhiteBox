export const DEFAULT_SESSION_LEASE_TTL_MS = 120000;

function normalizeChatId(chatId) {
    const key = String(chatId || '');
    return key || null;
}

export function createSessionLeaseRegistry(options = {}) {
    const ttlMs = Math.max(1, Number(options.ttlMs || DEFAULT_SESSION_LEASE_TTL_MS));
    const now = typeof options.now === 'function' ? options.now : Date.now;
    const schedule = typeof options.schedule === 'function' ? options.schedule : setTimeout;
    const cancel = typeof options.cancel === 'function' ? options.cancel : clearTimeout;
    const onExpire = typeof options.onExpire === 'function' ? options.onExpire : null;
    const leasesByChatId = new Map();

    function remove(chatId, leaseId, shouldCancelTimer) {
        const key = normalizeChatId(chatId);
        if (!key || !leaseId) return { released: false, chatId: key, leaseId, activeSessions: 0 };

        const leases = leasesByChatId.get(key);
        const lease = leases?.get(leaseId);
        if (!lease) {
            return {
                released: false,
                chatId: key,
                leaseId,
                activeSessions: leases?.size || 0,
            };
        }

        leases.delete(leaseId);
        if (shouldCancelTimer) cancel(lease.timer);
        if (!leases.size) leasesByChatId.delete(key);

        return {
            released: true,
            chatId: key,
            leaseId,
            startedAt: lease.startedAt,
            expiresAt: lease.expiresAt,
            activeSessions: leases.size,
        };
    }

    function add(chatId, leaseId, timing = {}) {
        const key = normalizeChatId(chatId);
        if (!key || !leaseId) return null;

        remove(key, leaseId, true);
        const startedAt = Number(timing.startedAt) || now();
        const expiresAt = Number(timing.expiresAt) || (startedAt + ttlMs);
        let leases = leasesByChatId.get(key);
        if (!leases) {
            leases = new Map();
            leasesByChatId.set(key, leases);
        }

        const timer = schedule(() => {
            const result = remove(key, leaseId, false);
            if (!result.released) return;
            try {
                onExpire?.(result);
            } catch {
                // Expiration must still release ownership if diagnostics fail.
            }
        }, Math.max(0, expiresAt - now()));

        leases.set(leaseId, { startedAt, expiresAt, timer });
        return { chatId: key, leaseId, startedAt, expiresAt };
    }

    function release(chatId, leaseId) {
        return remove(chatId, leaseId, true);
    }

    function hasLease(chatId, leaseId) {
        const key = normalizeChatId(chatId);
        return !!key && !!leaseId && leasesByChatId.get(key)?.has(leaseId);
    }

    function count(chatId) {
        const key = normalizeChatId(chatId);
        return key ? (leasesByChatId.get(key)?.size || 0) : 0;
    }

    function hasChat(chatId) {
        return count(chatId) > 0;
    }

    function clear() {
        for (const leases of leasesByChatId.values()) {
            for (const lease of leases.values()) cancel(lease.timer);
        }
        leasesByChatId.clear();
    }

    return { add, release, hasLease, hasChat, count, clear };
}
