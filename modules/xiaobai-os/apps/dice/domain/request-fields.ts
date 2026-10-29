type CheckRequestField = { readonly required: boolean } & (
    { readonly type: 'string'; readonly maxLength: number }
    | { readonly type: 'enum'; readonly values: readonly string[] });

/** D20 and D100 validate the same field contract that their model descriptions use. */
export function parseCheckRequestFields(value: unknown, fields: Readonly<Record<string, CheckRequestField>>): Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_request_object_required'); }
    const input = value as Record<string, unknown>;
    if (Object.keys(input).some(key => !Object.hasOwn(fields, key))) { throw new TypeError('dice_request_unknown_field'); }
    const result: Record<string, string> = {};
    for (const [key, spec] of Object.entries(fields)) {
        if (!Object.hasOwn(input, key) && !spec.required) { continue; }
        const raw = input[key];
        if (typeof raw !== 'string' || (spec.type === 'string' ? !raw.trim() || raw.trim().length > spec.maxLength : !spec.values.includes(raw))) {
            throw new TypeError(`dice_request_${key}_invalid`);
        }
        result[key] = spec.type === 'string' ? raw.trim() : raw;
    }
    return result;
}
