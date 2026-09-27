import type { ManagementResult } from './index.js';

const DOCUMENT_ERRORS = {
    path_invalid: 'path must be a JSON Pointer: "" for the root, or /field with ~0 for ~ and ~1 for /.',
    root_required: 'The document root cannot be removed. Use set with a replacement document.',
    parent_missing: 'The parent at this path is missing or is not an object or array. Read the relevant parent before correcting the path.',
    path_missing: 'This path does not exist. Check the object field or array index; replace the array to append items.',
    patches_invalid: 'Use patches alone with one or more {op,path,value?} entries. set requires value; remove omits it.',
    read_required: 'Read the relevant stored JSON in document mode before applying corrections.',
} as const;

/** Rejected input, before any save attempt; the model can correct it in the same run. */
export class ManagementDocumentInputError extends Error {
    readonly code: string;
    constructor(reason: keyof typeof DOCUMENT_ERRORS, readonly path?: string) {
        super(DOCUMENT_ERRORS[reason]);
        this.code = `management_document_${reason}`;
    }

    result(): ManagementResult {
        return { ok: false, status: 'failed', code: this.code,
            data: { message: this.message, ...(this.path === undefined ? {} : { path: this.path }) } };
    }
}
