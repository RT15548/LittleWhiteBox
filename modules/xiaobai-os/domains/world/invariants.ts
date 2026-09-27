import { WORLD_VERSION, type WorldContent, type WorldDomain } from './types.js';
import { collectToolInputIssues } from '../../../agent-core/runtime/tool-input-validation.js';
import { WORLD_CONTENT_SCHEMA, WORLD_SCHEMA } from './schema.js';

export class WorldValidationError extends Error {
    constructor(readonly path: string, message: string, readonly issues?: ReturnType<typeof collectToolInputIssues>) { super(message); }
}

export function validateWorldInput(value: unknown, schema: Record<string, unknown>, path: string): void {
    const issues = collectToolInputIssues(value, schema, path);
    if (issues.length) { throw new WorldValidationError(issues[0].path, issues[0].message, issues); }
}

export function record(value: unknown, path: string, keys: readonly string[]): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new WorldValidationError(path, 'Expected an object.');
    }
    const item = value as Record<string, unknown>;
    for (const key of Object.keys(item)) {
        if (!keys.includes(key)) { throw new WorldValidationError(`${path}.${key}`, 'Unsupported field.'); }
    }
    return item;
}

export function worldText(value: unknown, path: string, max: number, allowEmpty = false): string {
    if (typeof value !== 'string' || (!allowEmpty && !value.trim())) {
        throw new WorldValidationError(path, allowEmpty ? 'Expected text.' : 'Expected non-empty text.');
    }
    if ([...value].length > max) { throw new WorldValidationError(path, `Maximum ${max} Unicode code points.`); }
    return value;
}

export function parseWorldContent(value: unknown, path = 'world'): WorldContent {
    validateWorldInput(value, WORLD_CONTENT_SCHEMA, path);
    const { overview, news } = value as WorldContent;
    if (new Set(news.map(entry => entry.id)).size !== news.length) {
        throw new WorldValidationError(`${path}.news`, 'News IDs must be unique.');
    }
    return structuredClone({ overview, news });
}

export function parseWorld(value: unknown): WorldDomain {
    validateWorldInput(value, WORLD_SCHEMA, 'world');
    const item = value as WorldDomain;
    return { version: WORLD_VERSION,
        ...parseWorldContent({ overview: item.overview, news: item.news }) };
}
