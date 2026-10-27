// Gemini Schema.type is scalar. OpenAI-compatible relays may forward JSON Schema
// type arrays unchanged; express those unions as anyOf before crossing that boundary.
// Visit schema positions only: enum/default/examples may contain arbitrary JSON.
const SCHEMA_MAPS = new Set(['properties', 'patternProperties', '$defs', 'definitions', 'dependentSchemas']);
const SCHEMA_LISTS = new Set(['anyOf', 'oneOf', 'allOf', 'prefixItems']);
const SCHEMA_VALUES = new Set(['items', 'additionalProperties', 'additionalItems', 'contains',
    'propertyNames', 'unevaluatedProperties', 'unevaluatedItems', 'not', 'if', 'then', 'else']);

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
    // Keep every constraint inside each branch, including an existing anyOf.
    // This preserves null/omit, enums and bounds without mutating the tool owner.
    return { anyOf: types.map(type => ({ ...constraints, type })) };
}
