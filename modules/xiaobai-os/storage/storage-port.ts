import type { XiaobaiOsStoragePort } from '../kernel/contracts.js';

export type { XiaobaiOsStoragePort };

/** A successful file download whose body is not JSON; keep it separate from transport failures. */
export class JsonUserFileParseError extends SyntaxError {
    constructor(readonly source: string) { super('storage_json_invalid'); }
}

export class XiaobaiOsStorageError extends Error {
    readonly httpStatus?: number;

    constructor(
        readonly code: string,
        message: string,
        readonly retryable: boolean,
        options: { cause?: unknown; httpStatus?: number } = {},
    ) {
        super(message, options);
        this.name = 'XiaobaiOsStorageError';
        this.httpStatus = options.httpStatus;
    }
}
