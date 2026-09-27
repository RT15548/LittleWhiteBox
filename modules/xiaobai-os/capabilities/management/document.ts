import type { PartitionDocument } from '../../kernel/partition-document.js';
import type { PartitionSnapshot } from '../../kernel/contracts.js';
import type { ManagementResult } from './index.js';
import type { createManagementSave } from './save.js';
import { textPage } from './read-page.js';
import { jsonValuesEqual } from '../../host/json-values-equal.js';
import { ManagementDocumentInputError } from './document-errors.js';

function pointer(path: unknown): string[] {
    if (typeof path !== 'string' || path !== '' && (!path.startsWith('/') || /~(?:[^01]|$)/u.test(path))) { throw new ManagementDocumentInputError('path_invalid'); }
    return path === '' ? [] : path.slice(1).split('/').map(key => key.replace(/~1/gu, '/').replace(/~0/gu, '~'));
}

function member(value: unknown, key: string): unknown {
    if (value === null || typeof value !== 'object' || !Object.hasOwn(value, key)) { return undefined; }
    if (Array.isArray(value) && !/^(0|[1-9]\d*)$/u.test(key)) { return undefined; }
    return (value as Record<string, unknown>)[key];
}

function patch(root: unknown, keys: string[], change: Record<string, unknown>): unknown {
    const path = change.path as string;
    const remove = change.op === 'remove';
    if (!keys.length) {
        if (remove) { throw new ManagementDocumentInputError('root_required', path); }
        return structuredClone(change.value);
    }
    let parent = root;
    for (const key of keys.slice(0, -1)) { parent = member(parent, key); }
    if (parent === null || typeof parent !== 'object') { throw new ManagementDocumentInputError('parent_missing', path); }
    const key = keys[keys.length - 1];
    if (Array.isArray(parent)) {
        const index = Number(key);
        if (!/^(0|[1-9]\d*)$/u.test(key) || !Number.isSafeInteger(index) || index >= parent.length) { throw new ManagementDocumentInputError('path_missing', path); }
        if (remove) { parent.splice(index, 1); } else { parent[index] = structuredClone(change.value); }
    } else if (remove) {
        if (!Object.hasOwn(parent, key)) { throw new ManagementDocumentInputError('path_missing', path); }
        delete (parent as Record<string, unknown>)[key];
    } else {
        Object.defineProperty(parent, key, { value: structuredClone(change.value), enumerable: true, writable: true, configurable: true });
    }
    return root;
}

function applyPatches(root: unknown, args: Record<string, unknown>, wasRead: (keys: string[]) => boolean): unknown {
    if (Object.keys(args).some(key => key !== 'patches') || !Array.isArray(args.patches) || !args.patches.length) { throw new ManagementDocumentInputError('patches_invalid'); }
    let candidate = structuredClone(root);
    for (const value of args.patches) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new ManagementDocumentInputError('patches_invalid'); }
        const change = value as Record<string, unknown>;
        if (change.op !== 'set' && change.op !== 'remove' || Object.keys(change).some(key => !['op', 'path', 'value'].includes(key))
            || Object.hasOwn(change, 'value') !== (change.op === 'set')) { throw new ManagementDocumentInputError('patches_invalid'); }
        const keys = pointer(change.path);
        // A root replacement is an explicit rebuild; local corrections use observations of that part.
        if (keys.length && !wasRead(keys)) { throw new ManagementDocumentInputError('read_required', change.path as string); }
        candidate = patch(candidate, keys, change);
    }
    return candidate;
}

/** Read snapshots and pending saves are run-local; the partition remains the only stored document. */
export function createManagementDocument(document: Pick<PartitionDocument, 'read'>, saving: ReturnType<typeof createManagementSave>, writer?: PartitionDocument, onSaved?: (value: unknown) => void) {
    let baseline: PartitionSnapshot<unknown> | null = null;
    const pages = new Map<string, { keys: string[]; next: number | null }>();
    function acceptSaved(value: unknown) {
        pages.clear(); baseline = null;
        onSaved?.(value);
    }
    return {
        async read(args: Record<string, unknown>): Promise<ManagementResult> {
            const path = args.path ?? '';
            const keys = pointer(path);
            const offset = Number(args.offset ?? 0);
            const current = await document.read();
            const same = baseline?.identityKey === current.snapshot.identityKey && baseline?.osId === current.snapshot.osId
                && jsonValuesEqual(baseline?.value, current.snapshot.value);
            if (!same) {
                if (offset !== 0) { throw new Error('management_request_superseded'); }
                pages.clear();
            }
            if (offset !== 0 && pages.get(String(path))?.next !== offset) { throw new Error('management_document_page_required'); }
            let value = current.snapshot.value;
            for (const key of keys) { value = member(value, key); }
            const page = textPage(JSON.stringify(value ?? null), offset);
            baseline = current.snapshot;
            pages.set(String(path), { keys, next: page.nextOffset });
            return { ok: true, status: 'read', data: { mode: 'document', path, found: value !== undefined, validation: current.validation, ...page } };
        },
        async edit(args: Record<string, unknown>, guard: () => boolean): Promise<ManagementResult> {
            if (!writer) { throw new Error('management_document_read_only'); }
            if (!baseline) { return new ManagementDocumentInputError('read_required').result(); }
            const expected = baseline;
            let candidate: unknown;
            try {
                candidate = applyPatches(expected.value, args, keys => [...pages.values()].some(read =>
                    read.keys.length <= keys.length && read.keys.every((key, index) => key === keys[index])));
            }
            catch (error) {
                if (!(error instanceof ManagementDocumentInputError)) { throw error; }
                return error.result();
            }
            let saved: unknown;
            const validation = writer.validate(candidate, expected);
            if (!validation.valid) { return { ok: false, status: 'failed', data: { validation } }; }
            const result: ManagementResult = { ok: true, status: 'saved', data: { mode: 'document' } };
            return saving.run(async commitGuard => {
                const outcome = await writer.replace(expected, candidate, commitGuard);
                if (outcome.status === 'failed' || outcome.status === 'unconfirmed' || outcome.status === 'conflict') {
                    // The prepared result is also available for read-back after an uncertain dispatch.
                    if ('preparedResult' in outcome) { saved = outcome.preparedResult; }
                    throw Object.assign(new Error(outcome.status === 'failed' ? outcome.error.message : `management_save_${outcome.status}`), {
                        code: outcome.status === 'failed' ? outcome.error.code : outcome.status === 'unconfirmed' ? 'SAVE_UNCONFIRMED' : 'SAVE_CONFLICT',
                        uncertain: outcome.status === 'unconfirmed',
                    });
                }
                saved = outcome.result;
                acceptSaved(saved);
                return outcome.status === 'unchanged' ? { ok: true, status: 'unchanged' } : result;
            }, async () => {
                const current = (await document.read()).snapshot;
                if (current.identityKey !== expected.identityKey || current.osId !== expected.osId) { return { status: 'superseded' }; }
                if (saved !== undefined && jsonValuesEqual(current.value, saved)) { acceptSaved(saved); return { status: 'confirmed', result }; }
                return { status: jsonValuesEqual(current.value, expected.value) ? 'unchanged' : 'superseded' };
            }, guard);
        },
    };
}
