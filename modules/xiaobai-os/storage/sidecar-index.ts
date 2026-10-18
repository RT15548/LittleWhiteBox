import type { JsonUserFilePort, XiaobaiOsChatBindingV1 } from '../kernel/contracts.js';
import { assertJsonValue, parseXiaobaiOsChatBinding } from '../kernel/envelope.js';

export const XIAOBAI_OS_INDEX_FILENAME = 'LittleWhiteBox_OS_index.json';

export interface XiaobaiOsIndexV1 {
    formatVersion: 1;
    entries: Record<string, XiaobaiOsChatBindingV1>;
}

export interface SidecarIndex {
    remember(osId: string, binding: XiaobaiOsChatBindingV1): Promise<void>;
    forget(osId: string): Promise<void>;
    findByChatId(chatId: string, ownerLocator?: string): Promise<readonly string[]>;
    updateOwner(oldOwnerLocator: string, newOwnerLocator: string): Promise<void>;
    snapshot(): Promise<XiaobaiOsIndexV1>;
}

type Logger = Pick<Console, 'warn'>;

function emptyIndex(): XiaobaiOsIndexV1 {
    return { formatVersion: 1, entries: {} };
}

function sameBinding(left: XiaobaiOsChatBindingV1 | undefined, right: XiaobaiOsChatBindingV1): boolean {
    return !!left
        && left.kind === right.kind
        && left.ownerLocator === right.ownerLocator
        && left.chatId === right.chatId;
}

export function parseSidecarIndex(value: unknown): XiaobaiOsIndexV1 {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('sidecar_index_invalid');
    }
    const record = value as Record<string, unknown>;
    if (record.formatVersion !== 1 || !record.entries || typeof record.entries !== 'object' || Array.isArray(record.entries)) {
        throw new Error('sidecar_index_invalid');
    }
    if (Object.keys(record).sort().join(',') !== 'entries,formatVersion') {
        throw new Error('sidecar_index_invalid');
    }
    const entries: Record<string, XiaobaiOsChatBindingV1> = {};
    for (const [osId, binding] of Object.entries(record.entries as Record<string, unknown>)) {
        if (!/^[A-Za-z0-9_-]+$/.test(osId)) { throw new Error('sidecar_index_invalid'); }
        entries[osId] = parseXiaobaiOsChatBinding(binding);
    }
    return { formatVersion: 1, entries };
}

export function createSidecarIndex(storage: JsonUserFilePort, logger: Logger = console): SidecarIndex {
    let queue: Promise<unknown> = Promise.resolve();

    function enqueue<T>(work: () => Promise<T>): Promise<T> {
        const result = queue.then(work, work);
        queue = result.catch((caughtError) => { console.debug({ source: import.meta.url, operation: "enqueue" }, caughtError); });
        return result;
    }

    async function load(): Promise<XiaobaiOsIndexV1> {
        try {
            const raw = await storage.read(XIAOBAI_OS_INDEX_FILENAME);
            return raw === null ? emptyIndex() : parseSidecarIndex(raw);
        } catch (error) {
            logger.warn('[LittleWhiteBox] 小白 OS sidecar 索引损坏或不可读，将渐进重建', error);
            return emptyIndex();
        }
    }

    async function persist(next: XiaobaiOsIndexV1): Promise<void> {
        assertJsonValue(next);
        try {
            await storage.replace(XIAOBAI_OS_INDEX_FILENAME, next);
        } catch (error) {
            // The index is maintenance data. A failed save must never block sidecar operations.
            logger.warn('[LittleWhiteBox] 小白 OS sidecar 索引保存失败', error);
        }
    }

    function remember(osId: string, binding: XiaobaiOsChatBindingV1): Promise<void> {
        return enqueue(async () => {
            const next = await load();
            const canonical = parseXiaobaiOsChatBinding(binding);
            if (sameBinding(next.entries[osId], canonical)) { return; }
            next.entries[osId] = canonical;
            await persist(next);
        });
    }

    function forget(osId: string): Promise<void> {
        return enqueue(async () => {
            const next = await load();
            if (!Object.hasOwn(next.entries, osId)) { return; }
            delete next.entries[osId];
            await persist(next);
        });
    }

    function findByChatId(chatId: string, ownerLocator?: string): Promise<readonly string[]> {
        return enqueue(async () => {
            const current = await load();
            return Object.entries(current.entries)
                .filter(([, binding]) => binding.chatId === chatId && (!ownerLocator || binding.ownerLocator === ownerLocator))
                .map(([osId]) => osId);
        });
    }

    function updateOwner(oldOwnerLocator: string, newOwnerLocator: string): Promise<void> {
        return enqueue(async () => {
            const next = await load();
            let changed = false;
            for (const binding of Object.values(next.entries)) {
                if (binding.kind === 'character' && binding.ownerLocator === oldOwnerLocator) {
                    binding.ownerLocator = newOwnerLocator;
                    changed = true;
                }
            }
            if (changed) { await persist(next); }
        });
    }

    function snapshot(): Promise<XiaobaiOsIndexV1> {
        return enqueue(load);
    }

    return Object.freeze({ remember, forget, findByChatId, updateOwner, snapshot });
}
