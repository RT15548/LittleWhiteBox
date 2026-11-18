import { indexSchemaResources } from '../../../shared/json-schema-resources.js';

// Google v1beta Schema (not the arbitrary JSON value parametersJsonSchema).
// https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const TYPES = ['object', 'array', 'string', 'number', 'boolean', 'null'];
const KEYWORD_TYPES = new Map([
    [['items', 'minItems', 'maxItems'], ['array']],
    [['properties', 'required', 'minProperties', 'maxProperties'], ['object']],
    [['minLength', 'maxLength', 'pattern', 'format'], ['string']],
    [['minimum', 'maximum'], ['number', 'integer']],
].flatMap(([keywords, types]) => keywords.map(key => [key, types])));
const VALUES = new Set(['title', 'description', 'format', 'nullable', 'default', 'example', 'propertyOrdering',
    'minItems', 'maxItems', 'minProperties', 'maxProperties', 'minLength', 'maxLength', 'pattern', 'minimum', 'maximum']);
const ANNOTATIONS = new Set(['$schema', '$id', '$anchor', '$comment', '$defs', 'definitions', 'examples',
    'deprecated', 'readOnly', 'writeOnly', 'contentMediaType', 'contentEncoding']);
const STRUCTURE = new Set(['type', '$ref', 'const', 'enum', 'properties', 'required', 'items',
    'anyOf', 'oneOf', 'allOf', 'not', 'if', 'then', 'else']);
const LOWER = new Set(['minimum', 'minLength', 'minItems', 'minProperties']);
const UPPER = new Set(['maximum', 'maxLength', 'maxItems', 'maxProperties']);
const ANNOTATION_VALUES = new Set(['title', 'description', 'default', 'example', 'propertyOrdering']);

function literal(value, state) {
    if (typeof value === 'string') return { type: 'string', enum: [value] };
    if (typeof value === 'number') return { type: 'number', minimum: value, maximum: value };
    if (value === null) return { type: 'null' };
    state.lossy = true;
    return {};
}

// Conjunction of positive constraints. A collision we cannot represent keeps one
// conjunct and reports loss; it never invents a stronger restriction.
function intersect(left, right, state) {
    const result = { ...left };
    for (const [key, value] of Object.entries(right)) {
        if (!Object.hasOwn(result, key)) result[key] = value;
        else if (JSON.stringify(result[key]) === JSON.stringify(value)) continue;
        else if (ANNOTATION_VALUES.has(key)) continue;
        else if (LOWER.has(key)) result[key] = Math.max(result[key], value);
        else if (UPPER.has(key)) result[key] = Math.min(result[key], value);
        else if (key === 'required') result[key] = [...new Set([...result[key], ...value])];
        else if (key === 'properties') result[key] = Object.fromEntries([...new Set([...Object.keys(result[key]), ...Object.keys(value)])]
            .map(name => [name, intersect(result[key][name] || {}, value[name] || {}, state)]));
        else if (key === 'items') result[key] = intersect(result[key], value, state);
        else if (key === 'type' && [result[key], value].every(type => type === 'number' || type === 'integer')) result[key] = 'integer';
        else if (key === 'enum') {
            const common = result[key].filter(item => value.includes(item));
            if (common.length) result[key] = common;
            else state.lossy = true;
        } else state.lossy = true;
    }
    return result;
}

// Type-specific keywords apply only to that type in JSON Schema. Give each
// applicable type its own branch, leaving other types unrestricted.
function typed(node, root = false) {
    const types = Array.isArray(node.type) ? node.type
        : node.type ? [node.type] : root ? ['object']
            : [...KEYWORD_TYPES.keys()].some(key => Object.hasOwn(node, key)) ? TYPES : null;
    const finish = branch => {
        if (branch.properties) branch.properties = Object.fromEntries(Object.entries(branch.properties).map(([key, value]) => [key, typed(value)]));
        if (branch.anyOf) branch.anyOf = branch.anyOf.map(value => typed(value));
        if (Object.hasOwn(branch, 'items')) branch.items = typed(branch.items);
        if (branch.type === 'array' && !Object.hasOwn(branch, 'items')) branch.items = {};
        if (branch.required) {
            const properties = { ...branch.properties };
            for (const key of branch.required) if (!Object.hasOwn(properties, key)) Object.defineProperty(properties, key, { value: {}, enumerable: true });
            branch.properties = properties;
        }
        return branch;
    };
    if (!types) return finish({ ...node });
    const branches = types.map(type => finish({
        ...Object.fromEntries(Object.entries(node).filter(([key]) => key !== 'type' && (!KEYWORD_TYPES.has(key) || KEYWORD_TYPES.get(key).includes(type)))),
        type,
    }));
    return branches.length === 1 ? branches[0] : { anyOf: branches };
}

export function projectGeminiToolParameters(schema) {
    const resources = indexSchemaResources(schema);
    const state = { lossy: false };
    function project(source, seen = new Set()) {
        if (source === true) return {};
        if (!object(source)) { state.lossy = true; return {}; }
        if (seen.has(source)) { state.lossy = true; return {}; }
        const next = new Set([...seen, source]);
        const child = value => project(value, next);
        let node = {};
        for (const [key, value] of Object.entries(source)) {
            if (VALUES.has(key)) node[key] = value;
            else if (!ANNOTATIONS.has(key) && !STRUCTURE.has(key)) {
                if (key !== 'additionalProperties' || value !== true) state.lossy = true;
            }
        }
        if (source.type !== undefined) node.type = source.type;
        if (object(source.properties)) node.properties = Object.fromEntries(Object.entries(source.properties).map(([name, value]) => [name, child(value)]));
        if (Array.isArray(source.required)) node.required = source.required;
        if (Object.hasOwn(source, 'items')) {
            if (source.items === false && !source.prefixItems) node.maxItems = Math.min(node.maxItems ?? Infinity, 0);
            else if (Array.isArray(source.items) || source.prefixItems) { state.lossy = true; node.items = {}; }
            else node.items = child(source.items);
        }
        if (Array.isArray(source.anyOf)) node.anyOf = source.anyOf.map(child);
        // Exclusivity is not available. The union is a superset even when a
        // projected branch is wider; negation and conditionals must be omitted whole.
        if (Array.isArray(source.oneOf)) {
            state.lossy = true;
            node = intersect(node, { anyOf: source.oneOf.map(child) }, state);
        }
        if (Object.hasOwn(source, 'not') || Object.hasOwn(source, 'if') && (Object.hasOwn(source, 'then') || Object.hasOwn(source, 'else'))) state.lossy = true;
        if (Array.isArray(source.allOf)) for (const part of source.allOf) node = intersect(node, child(part), state);
        if (typeof source.$ref === 'string') {
            const target = resources.resolve(source.$ref, source);
            if (target) node = intersect(node, child(target.schema), state);
            else state.lossy = true;
        }
        if (Object.hasOwn(source, 'const')) node = intersect(node, literal(source.const, state), state);
        if (Array.isArray(source.enum)) {
            node = intersect(node, source.enum.every(value => typeof value === 'string')
                ? { type: 'string', enum: source.enum }
                : { anyOf: source.enum.map(value => literal(value, state)) }, state);
        }
        return node;
    }
    return { parameters: typed(project(schema), true), lossy: state.lossy };
}

/** OpenAI-style declarations for Gemini relays that use the old Schema field. */
export function projectGeminiRelayTools(tools) {
    return tools.map(tool => {
        if (tool.type !== 'function' || !tool.function?.parameters) return tool;
        const { parameters, lossy } = projectGeminiToolParameters(tool.function.parameters);
        const description = lossy
            ? `${tool.function.description || ''}\n\nFull JSON Schema for the arguments:\n${JSON.stringify(tool.function.parameters)}`.trim()
            : tool.function.description;
        return { ...tool, function: { ...tool.function, ...(description === undefined ? {} : { description }), parameters } };
    });
}
