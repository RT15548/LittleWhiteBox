import type { ScopedChatStore, XiaobaiOsFileControls, XiaobaiOsFileState } from '../../../kernel/contracts.js';
import { parseWorld, parseWorldContent } from '../../../domains/world/invariants.js';
import { worldContent } from '../../../domains/world/projection.js';
import { createEmptyWorld, sameWorldContent, type WorldContent, type WorldDomain } from '../../../domains/world/types.js';

export interface WorldView {
    /** Sidecar binding key; character owners use the avatar filename, not the UI index. */
    identityKey: string;
    /** Runtime chat key used by the UI, maintenance runner and context consumers. */
    chatIdentity: string;
    world: WorldDomain;
    writeState: XiaobaiOsFileState;
    pendingSave: boolean;
}

export function createWorldService(
    store: ScopedChatStore<WorldDomain>,
    files: XiaobaiOsFileControls,
    getChatIdentity: () => string,
) {
    const listeners = new Set<() => void>();
    const publish = (): void => {
        for (const listener of listeners) {
            try { listener(); } catch (error) { console.error('[LittleWhiteBox] World state listener failed', error); }
        }
    };
    const unsubscribeStore = store.subscribe(publish);
    const unsubscribeFile = files.subscribeFileState(publish);
    function readCurrent(): WorldView {
        const snapshot = store.peekCurrent();
        return { identityKey: snapshot?.identityKey ?? '', chatIdentity: snapshot ? getChatIdentity() : '',
            world: structuredClone(snapshot?.value ?? createEmptyWorld()),
            writeState: files.getFileState(), pendingSave: files.hasPendingCommit() };
    }

    async function change(identityKey: string, update: (current: WorldDomain) => WorldDomain, guard: () => boolean) {
        const valid = () => !!identityKey && store.peekCurrent()?.identityKey === identityKey && guard();
        if (!valid()) { throw new Error('world_context_changed'); }
        const result = await store.transact(transaction => {
            if (!valid()) { throw new Error('world_context_changed'); }
            const current = transaction.currentOrInitial();
            const next = parseWorld(update(current));
            if (!sameWorldContent(current, next)) { transaction.replace(next); }
        }, { commitGuard: valid });
        if (result.status === 'failed' || result.status === 'unconfirmed' || result.status === 'conflict') {
            throw Object.assign(new Error(`world_save_${result.status}`), {
                code: result.status === 'failed' ? result.error.code : result.status === 'unconfirmed' ? 'SAVE_UNCONFIRMED' : 'SAVE_CONFLICT',
                uncertain: result.status === 'unconfirmed',
            });
        }
        return readCurrent();
    }

    return Object.freeze({
        readCurrent,
        async refreshCurrent() { await store.read(); return readCurrent(); },
        replaceContent(identityKey: string, expected: WorldContent, candidate: WorldContent, guard: () => boolean) {
            const replacement = parseWorldContent(candidate);
            return change(identityKey, current => {
                if (!sameWorldContent(worldContent(current), expected)) { throw new Error('world_content_conflict'); }
                return { ...current, ...replacement };
            }, guard);
        },
        confirmPending: files.retryPending,
        adoptServerState: files.adoptServerState,
        subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
        dispose() { unsubscribeStore(); unsubscribeFile(); listeners.clear(); },
    });
}

export type WorldService = ReturnType<typeof createWorldService>;
