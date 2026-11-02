import { splitPath } from './executor.js';

export const INPUT_ERROR = Object.freeze({
    INVALID_JSON: 'invalid_json',
    INVALID_INPUT: 'invalid_input',
    INVALID_OPERATION: 'invalid_operation',
    MISSING_FIELD: 'missing_field',
    UNEXPECTED_FIELD: 'unexpected_field',
    INVALID_PATH: 'invalid_path',
    INVALID_DELTA: 'invalid_delta',
    CONFLICTING_OPERATIONS: 'conflicting_operations',
});
const MESSAGES = {
    [INPUT_ERROR.INVALID_JSON]: '状态 JSON 无法解析',
    [INPUT_ERROR.INVALID_INPUT]: '输入须为仅含 ops 数组的 JSON 对象，值不能含函数、访问器、循环引用或非有限数字',
    [INPUT_ERROR.INVALID_OPERATION]: 'op 必须是支持的操作名称字符串',
    [INPUT_ERROR.MISSING_FIELD]: '缺少必填字段',
    [INPUT_ERROR.UNEXPECTED_FIELD]: '此操作不接受该字段',
    [INPUT_ERROR.INVALID_PATH]: '路径须使用点路径或方括号路径，根名称两端不能有空白，也不能访问原型链特殊键',
    [INPUT_ERROR.INVALID_DELTA]: 'delta 必须是有限数字，不能是数字字符串',
    [INPUT_ERROR.CONFLICTING_OPERATIONS]: '同批下标删除与另一操作的目标重叠或会使其下标移动；本批未执行。请去掉重复删除，或拆成两次提交：先修改，再删除',
};
// The input/output boundary owns public names. Persisted requests and events keep executor names.
const OPERATIONS = Object.freeze({
    set: { op: 'set', fields: ['value'] },
    inc: { op: 'inc', fields: ['delta'] },
    push: { op: 'push', fields: ['value'] },
    remove: { op: 'pop', fields: ['value'] },
    del: { op: 'del', fields: [] },
});
const PUBLIC_NAMES = Object.freeze(Object.fromEntries(Object.entries(OPERATIONS).map(([name, { op }]) => [op, name])));

/** The public command schema is derived from the same operation table as validation. */
export function getStateInputSchema() {
    return {
        type: 'object',
        properties: {
            ops: {
                type: 'array',
                description: 'Changes for this passage. An empty array means no changes.',
                items: {
                    type: 'object',
                    properties: {
                        op: { type: 'string', enum: Object.keys(OPERATIONS) },
                        path: { type: 'string', description: 'Existing managed variable path, using dots or brackets.' },
                        value: { description: 'JSON value for set, push or remove.' },
                        delta: { type: 'number', description: 'Signed change for inc.' },
                    },
                    required: ['op', 'path'],
                    additionalProperties: false,
                    description: Object.entries(OPERATIONS).map(([name, definition]) =>
                        `${name}: ${['op', 'path', ...definition.fields].join(', ')}`).join('; '),
                },
            },
        },
        required: ['ops'],
        additionalProperties: false,
    };
}

export function publicOperationName(op) {
    return PUBLIC_NAMES[op] ?? op;
}
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const PATH_PATTERN = /^[^.[\]]+(?:(?:\.[^.[\]]+)|(?:\[(?:\d+|"[^"]+"|'[^']+')\]))*$/;
const pointerTo = (parent, key) => `${parent}/${String(key).replaceAll('~', '~0').replaceAll('/', '~1')}`;

export class StateInputError extends Error {
    constructor(code, index, details = {}) {
        const location = details.pointer ? `${details.pointer}: ` : '';
        const choices = details.allowed ? `；允许：${details.allowed.join(', ')}` : '';
        super(`${location}${MESSAGES[code]}${choices}`);
        this.code = code;
        this.details = details;
        const match = /^\/ops\/(\d+)(?:\/|$)/.exec(details.pointer || '');
        if (index !== undefined || match) this.index = index ?? Number(match[1]);
    }

    toJSON() {
        return { code: this.code, message: this.message, ...this.details, ...(this.index === undefined ? {} : { index: this.index }) };
    }
}

function copyJson(value, ancestors = new Set(), pointer = '') {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const invalid = (location = pointer) => { throw new StateInputError(INPUT_ERROR.INVALID_INPUT, undefined, { pointer: location }); };
    if (!value || typeof value !== 'object' || ancestors.has(value)) invalid();
    const array = Array.isArray(value);
    if (!array) {
        // A realm's Object.prototype is not an identity contract. Inspect content instead,
        // without allowing Object#toString to invoke an inherited tag accessor.
        for (let prototype = value; prototype; prototype = Object.getPrototypeOf(prototype)) {
            const tag = Object.getOwnPropertyDescriptor(prototype, Symbol.toStringTag);
            if (tag && !Object.hasOwn(tag, 'value')) invalid();
        }
        if (Object.prototype.toString.call(value) !== '[object Object]') invalid();
    }
    ancestors.add(value);
    const result = array ? [] : {};
    for (const key of Reflect.ownKeys(value)) {
        if (array && key === 'length') continue;
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        const location = typeof key === 'string' ? pointerTo(pointer, key) : pointer;
        if (typeof key !== 'string' || UNSAFE_KEYS.has(key) || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')
            || (array && !/^(0|[1-9]\d*)$/.test(key))) invalid(location);
        Object.defineProperty(result, key, { value: copyJson(descriptor.value, ancestors, location), enumerable: true, writable: true, configurable: true });
    }
    if (array && Object.keys(result).length !== value.length) invalid();
    ancestors.delete(value);
    return result;
}

const isPrefix = (prefix, path) => prefix.length <= path.length && prefix.every((segment, index) => segment === path[index]);

/** Reject ambiguous new JSON batches without reinterpreting text or stored historical requests. */
export function validateJsonBatch(ops) {
    if (!ops.some(item => item.source === 'json')) return;
    const paths = ops.map(item => splitPath(item.path));
    for (let deleted = 0; deleted < ops.length; deleted++) {
        const path = paths[deleted];
        if (ops[deleted].op !== 'del' || path.length < 2 || typeof path.at(-1) !== 'number') continue;
        const parent = path.slice(0, -1);
        for (let other = 0; other < ops.length; other++) {
            if (deleted === other || (ops[deleted].source !== 'json' && ops[other].source !== 'json')) continue;
            const target = paths[other];
            const siblingDelete = ops[other].op === 'del' && target.length === path.length
                && isPrefix(parent, target) && typeof target.at(-1) === 'number';
            if (siblingDelete && target.at(-1) !== path.at(-1)) continue; // Protected by descending deletion.
            const movedTarget = isPrefix(parent, target) && typeof target[parent.length] === 'number'
                && target[parent.length] >= path.at(-1);
            const ancestorWrite = isPrefix(target, parent) && ['set', 'del'].includes(ops[other].op);
            if (movedTarget || ancestorWrite) {
                const index = Math.max(deleted, other);
                throw new StateInputError(INPUT_ERROR.CONFLICTING_OPERATIONS, index, {
                    pointer: `/ops/${index}/path`, conflictsWith: Math.min(deleted, other),
                });
            }
        }
    }
}

/** Decode and snapshot the entire batch before any state operation can run. */
export function parseJsonInput(input) {
    let decoded = input;
    if (typeof input === 'string') {
        try { decoded = JSON.parse(input); }
        catch { throw new StateInputError(INPUT_ERROR.INVALID_JSON); }
    }
    const data = copyJson(decoded);
    if (!data || Array.isArray(data) || typeof data !== 'object'
        || Object.keys(data).length !== 1 || !Array.isArray(data.ops)) {
        throw new StateInputError(INPUT_ERROR.INVALID_INPUT);
    }
    const ops = data.ops.map((item, index) => {
        const invalid = (code, field, details = {}) => {
            throw new StateInputError(code, index, { pointer: field ? pointerTo(`/ops/${index}`, field) : `/ops/${index}`, ...details });
        };
        if (!item || typeof item !== 'object' || Array.isArray(item)) invalid(INPUT_ERROR.INVALID_OPERATION);
        if (typeof item.op !== 'string' || !Object.hasOwn(OPERATIONS, item.op)) {
            invalid(INPUT_ERROR.INVALID_OPERATION, 'op', { allowed: Object.keys(OPERATIONS) });
        }
        const fields = ['op', 'path', ...OPERATIONS[item.op].fields];
        for (const field of fields) {
            if (!Object.hasOwn(item, field)) invalid(INPUT_ERROR.MISSING_FIELD, field, { required: fields });
        }
        for (const field of Object.keys(item)) {
            if (!fields.includes(field)) invalid(INPUT_ERROR.UNEXPECTED_FIELD, field, { allowed: fields });
        }
        const path = typeof item.path === 'string' ? item.path.trim() : '';
        const parts = splitPath(path);
        if (!path || !PATH_PATTERN.test(path) || String(parts[0]) !== String(parts[0]).trim()
            || parts.some(part => !String(part).trim() || UNSAFE_KEYS.has(String(part)))) invalid(INPUT_ERROR.INVALID_PATH, 'path');
        if (item.op === 'inc' && (typeof item.delta !== 'number' || !Number.isFinite(item.delta))) invalid(INPUT_ERROR.INVALID_DELTA, 'delta');
        return { ...item, op: OPERATIONS[item.op].op, path, source: 'json' };
    });
    validateJsonBatch(ops);
    return ops;
}
