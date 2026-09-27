import type { ManagementTool } from './index.js';
import { MANAGEMENT_READ_CHARS } from './read-page.js';

/** These fields extend existing owner tools; they do not create a separate recovery tool package. */
export function withDocumentRead(tool: ManagementTool['definition']) {
    const properties = tool.function.parameters.properties as Record<string, Record<string, unknown>>;
    const modes = (properties.mode?.enum as string[] | undefined) ?? ['records'];
    properties.mode = { type: 'string', enum: [...modes, 'document'], description: `Read view. Default ${modes[0]}. document reads stored JSON, including invalid data.` };
    properties.path = { type: 'string', description: 'document mode: JSON Pointer into the stored document. Default "" reads its root. Escape ~ as ~0 and / as ~1 in field names; arrays use zero-based indices.' };
    properties.offset = { type: 'integer', minimum: 0, description: [properties.offset?.description,
        'document mode: character offset, default 0; continue with nextOffset and the same path.'].filter(Boolean).join('\n') };
    tool.function.description += '\n' + [
        'If the records are invalid, the default read returns the first stored-JSON page with its validation error.',
        `document mode returns data:{mode,path,found,validation,text,offset,nextOffset,totalChars}, at most ${MANAGEMENT_READ_CHARS} characters.`,
        'validation contains present, valid, the supported schemaVersion and error (null or {code,message}). found is false for an absent path. Reading does not require the APP to be open or its content to be valid.',
        'When supplied, validation.issues lists independent problems as {code,path,message}; validation.unchecked lists branches or reference checks that need valid structure before they can be checked.',
    ].join('\n');
    return tool;
}

export function withDocumentEdit(tool: ManagementTool['definition']) {
    const properties = tool.function.parameters.properties as Record<string, unknown>;
    properties.patches = { type: 'array', minItems: 1, description: 'Stored-JSON corrections, used alone. Inspect the relevant records in document mode; choose the replacement from the user’s request and story evidence.', items: {
        type: 'object', properties: {
            op: { type: 'string', enum: ['set', 'remove'] },
            path: { type: 'string', description: 'JSON Pointer to the affected value. "" replaces the whole document for a requested rebuild. Array indices refer to the result of preceding patches.' },
            value: { description: 'Complete JSON value for set; omit for remove. set can create an object field; replace an entire array to append items.' },
        }, required: ['op', 'path'], additionalProperties: false,
    } };
    tool.function.description += '\n' + [
        'For damaged records, patches correct the stored JSON in place; ordinary record edits use the fields above.',
        'All patches save together only if the resulting document is valid and the read version is still current. Targeted patches preserve unrelated records.',
        'A saved patch returns data:{mode:"document"}; unchanged means no modification. Invalid results return status failed with data.validation:{valid,schemaVersion,error} and any issues/unchecked fields described by the read tool. Storage stays unchanged. Correct the reported issues together before retrying.',
        'Invalid patch arguments return status failed, code and data:{message,path?}, without saving. Correct the indicated input and continue.',
    ].join('\n');
    return tool;
}
