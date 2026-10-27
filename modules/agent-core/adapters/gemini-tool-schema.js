// Gemini Schema.type is scalar. OpenAI-compatible relays may forward JSON Schema
// type arrays unchanged; express those unions as anyOf before crossing that boundary.
// Visit schema positions only: enum/default/examples may contain arbitrary JSON.
const SCHEMA_MAPS = new Set(['properties', 'patternProperties', '$defs', 'definitions', 'dependentSchemas']);
const SCHEMA_LISTS = new Set(['anyOf', 'oneOf', 'allOf', 'prefixItems']);
const SCHEMA_VALUES = new Set(['items', 'additionalProperties', 'additionalItems', 'contains',
    'propertyNames', 'unevaluatedProperties', 'unevaluatedItems', 'not', 'if', 'then', 'else']);
// JSON Schema ignores these keywords on other types; Gemini's Schema rejects them.
const KEYWORD_TYPES = new Map([
    [['items', 'prefixItems', 'additionalItems', 'contains', 'minContains', 'maxContains', 'unevaluatedItems', 'minItems', 'maxItems', 'uniqueItems'], ['array']],
    [['properties', 'patternProperties', 'additionalProperties', 'required', 'minProperties', 'maxProperties', 'propertyNames', 'dependentRequired', 'dependentSchemas', 'unevaluatedProperties'], ['object']],
    [['minLength', 'maxLength', 'pattern'], ['string']],
    [['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf'], ['number', 'integer']],
].flatMap(([keywords, types]) => keywords.map(key => [key, types])));

export function normalizeGeminiToolSchema(schema) {
    if (!schema || typeof schema !== 'object') return schema;
    if (Array.isArray(schema)) return schema.map(normalizeGeminiToolSchema);
    const normalized = Object.fromEntries(Object.entries(schema).map(([key, value]) => {
        if (SCHEMA_MAPS.has(key)) {
            return [key, Object.fromEntries(Object.entries(value).map(([name, child]) => [name, normalizeGeminiToolSchema(child)]))];
        }
        if (SCHEMA_LISTS.has(key)) return [key, value.map(normalizeGeminiToolSchema)];
        if (SCHEMA_VALUES.has(key)) return [key, normalizeGeminiToolSchema(value)];
        return [key, value];
    }));
    if (!Array.isArray(normalized.type)) return normalized;
    const { type: types, ...constraints } = normalized;
    // Common constraints (enum, compositions) still apply to every branch.
    // Type-specific constraints belong only to branches where they are meaningful.
    return { anyOf: types.map(type => ({
        ...Object.fromEntries(Object.entries(constraints).filter(([key]) => !KEYWORD_TYPES.has(key) || KEYWORD_TYPES.get(key).includes(type))),
        type,
    })) };
}
