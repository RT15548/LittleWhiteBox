const ARGUMENT_ERRORS = {
    arguments_invalid_json: 'Tool arguments are not valid JSON. Correct the syntax identified by parserMessage and send the complete arguments again. The tool was not executed.',
    arguments_must_be_object: 'The outer tool arguments must be a JSON object. receivedType identifies what was supplied; nested fields have not been checked. The tool was not executed.',
} as const;

export class ToolArgumentsError extends Error {
    constructor(readonly code: keyof typeof ARGUMENT_ERRORS, readonly details: { parserMessage: string } | { receivedType: string }) {
        super(ARGUMENT_ERRORS[code]);
    }

    result() {
        return { ok: false as const, status: 'failed' as const, changed: false, code: this.code,
            data: { stage: 'arguments', message: this.message, ...this.details } };
    }
}

export function requireToolArgumentsObject(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new ToolArgumentsError('arguments_must_be_object', {
            receivedType: value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value,
        });
    }
    return value as Record<string, unknown>;
}

export function parseToolArguments(text: string): Record<string, unknown> {
    let value: unknown;
    try { value = JSON.parse(text); }
    catch (error) {
        if (!(error instanceof SyntaxError)) { throw error; }
        throw new ToolArgumentsError('arguments_invalid_json', { parserMessage: error.message });
    }
    return requireToolArgumentsObject(value);
}
