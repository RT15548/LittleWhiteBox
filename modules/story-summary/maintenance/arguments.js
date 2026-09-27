import { MemoryMaintenanceError } from './errors.js';
import { collectToolInputIssues } from '../../agent-core/runtime/tool-input-validation.js';

// Model/API argument formatting, not data migration. Business text and record IDs
// remain exact; only schema-unambiguous scalars and single-item lists are repaired.
export function normalizeToolArguments(value, schema) {
    if (schema.anyOf) {
        const collection = normalizeToolArguments(value?.collection, { type: 'string', enum: schema.anyOf.flatMap(item => item.properties.collection.enum) });
        const candidate = schema.anyOf.find(item => item.properties.collection.enum.includes(collection));
        return candidate ? normalizeToolArguments({ ...value, collection }, candidate) : value;
    }
    if (schema.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
        const result = Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
            schema.properties[key] ? normalizeToolArguments(item, schema.properties[key]) : item]));
        for (const [key, field] of Object.entries(schema.properties)) {
            if (result[key] === undefined && field.default !== undefined) result[key] = field.default;
        }
        return result;
    }
    if (schema.type === 'array') {
        const items = Array.isArray(value) ? value : value != null && typeof value === schema.items.type ? [value]
            : schema.items.anyOf && value && typeof value === 'object' ? [value] : null;
        return items ? items.map(item => normalizeToolArguments(item, schema.items)) : value;
    }
    if (typeof value === 'string') {
        const text = value.trim();
        if (schema.type === 'integer' && /^[+-]?\d+$/u.test(text) && Number.isSafeInteger(Number(text))) return Number(text);
        if (schema.type === 'boolean' && /^(true|false)$/iu.test(text)) return text.toLowerCase() === 'true';
        if (schema.enum) return schema.enum.find(item => typeof item === 'string' && item.toLowerCase() === text.toLowerCase()) ?? value;
    }
    return value;
}

// Validate the same schema the model receives, including nested patch fields.
export function validateToolArguments(value, schema, field = '') {
    const issues = collectToolInputIssues(value, schema, field);
    if (!issues.length) return;
    const errors = issues.map(issue => {
        const error = new MemoryMaintenanceError(issue.code === 'unknown_field' ? 'invalid_field' : 'invalid_arguments', '', issue.path);
        error.expected = issue.expected;
        return error;
    });
    throw MemoryMaintenanceError.batch(errors, ['records', 'references']);
}
