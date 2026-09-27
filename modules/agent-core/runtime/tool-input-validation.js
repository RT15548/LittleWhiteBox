const MESSAGES = Object.freeze({
    invalid_type: 'The value has the wrong type.',
    required: 'This field is required.',
    unknown_field: 'This field is not accepted.',
    invalid_value: 'The value does not match the accepted values or bounds.',
});

function matchesType(value, type) {
    if (type === 'null') return value === null;
    if (type === 'array') return Array.isArray(value);
    if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
    if (type === 'integer') return Number.isSafeInteger(value);
    if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
    return typeof value === type;
}

function expected(schema) {
    return Object.fromEntries(['type', 'enum', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum',
        'minLength', 'maxLength', 'pattern', 'minItems', 'maxItems'].filter(key => schema[key] !== undefined)
        .map(key => [key, schema[key]]));
}

/**
 * Validate the JSON-schema vocabulary used by local tool declarations, without changing arguments.
 * Branches with a matching enum discriminator expose their own field errors; other unions report
 * their alternatives. Dependent business checks remain with the owner of the tool.
 * @returns {Array<{code: string, path: string, message: string, expected: Record<string, unknown>}>}
 */
export function collectToolInputIssues(value, schema, path = '') {
    const issues = [];
    const issue = (code, at = path, shape = expected(schema)) => issues.push({
        code, path: at || 'arguments', message: MESSAGES[code], expected: shape,
    });
    if (schema.anyOf) {
        const branches = schema.anyOf.map(branch => ({ branch, issues: collectToolInputIssues(value, branch, path) }));
        if (branches.some(branch => !branch.issues.length)) return [];
        const discriminator = Object.keys(schema.anyOf[0].properties || {}).find(key => {
            if (!schema.anyOf.every(branch => branch.properties?.[key]?.enum)) return false;
            const values = schema.anyOf.flatMap(branch => branch.properties[key].enum);
            return new Set(values).size === values.length;
        });
        if (discriminator) {
            const selected = branches.find(({ branch }) => value && branch.properties[discriminator].enum.includes(value[discriminator]));
            if (selected) return selected.issues;
            issue('invalid_value', path ? `${path}.${discriminator}` : discriminator,
                { enum: [...new Set(schema.anyOf.flatMap(branch => branch.properties[discriminator].enum))] });
            return issues;
        }
        const typed = branches.filter(({ branch }) => branch.type && matchesType(value, branch.type));
        if (typed.length === 1) return typed[0].issues;
        issue('invalid_value', path, { anyOf: schema.anyOf.map(expected) });
        return issues;
    }
    if (schema.type && ![].concat(schema.type).some(type => matchesType(value, type))) {
        issue('invalid_type');
        return issues;
    }
    if (schema.enum && !schema.enum.includes(value)) issue('invalid_value');
    if (value === null) return issues;
    if (Array.isArray(value)) {
        if (value.length < (schema.minItems ?? 0) || value.length > (schema.maxItems ?? Infinity)) issue('invalid_value');
        if (schema.items) value.forEach((item, index) => issues.push(...collectToolInputIssues(item, schema.items, `${path}[${index}]`)));
    } else if (typeof value === 'object') {
        const properties = schema.properties || {};
        const fieldPath = key => path ? `${path}.${key}` : key;
        for (const key of schema.required || []) {
            if (!Object.hasOwn(value, key)) issue('required', fieldPath(key), expected(properties[key] || {}));
        }
        for (const [key, item] of Object.entries(value)) {
            if (Object.hasOwn(properties, key)) issues.push(...collectToolInputIssues(item, properties[key], fieldPath(key)));
            else if (schema.additionalProperties === false) issue('unknown_field', fieldPath(key), { fields: Object.keys(properties) });
        }
    } else if (typeof value === 'string') {
        const length = [...value].length;
        if (length < (schema.minLength ?? 0) || length > (schema.maxLength ?? Infinity)
            || schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) issue('invalid_value');
    } else if (typeof value === 'number') {
        if (value < (schema.minimum ?? -Infinity) || value > (schema.maximum ?? Infinity)
            || schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum
            || schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) issue('invalid_value');
    }
    return issues;
}

export class ToolInputError extends Error {
    constructor(issues) {
        super(issues.map(issue => `${issue.path}: ${issue.message}`).join('\n'));
        this.name = 'ToolInputError';
        this.issues = issues;
    }
}
