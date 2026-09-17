import { WORLD_LIMITS, type WorldContent, type WorldDomain, type WorldNews } from './types.js';

export class WorldValidationError extends Error {
    constructor(readonly path: string, message: string) { super(message); }
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

export function parseWorldNews(value: unknown, path: string): WorldNews {
    const item = record(value, path, ['id', 'title', 'summary', 'body']);
    return {
        id: worldText(item.id, `${path}.id`, WORLD_LIMITS.id),
        title: worldText(item.title, `${path}.title`, WORLD_LIMITS.title),
        summary: worldText(item.summary, `${path}.summary`, WORLD_LIMITS.summary),
        body: worldText(item.body, `${path}.body`, WORLD_LIMITS.body),
    };
}

export function parseWorldContent(value: unknown, path = 'world'): WorldContent {
    const item = record(value, path, ['overview', 'news']);
    const overview = worldText(item.overview, `${path}.overview`, WORLD_LIMITS.overview, true);
    if (!Array.isArray(item.news) || item.news.length > WORLD_LIMITS.news) {
        throw new WorldValidationError(`${path}.news`, `Expected up to ${WORLD_LIMITS.news} news items.`);
    }
    const news = item.news.map((entry, index) => parseWorldNews(entry, `${path}.news[${index}]`));
    if (new Set(news.map(entry => entry.id)).size !== news.length) {
        throw new WorldValidationError(`${path}.news`, 'News IDs must be unique.');
    }
    return { overview, news };
}

export function parseWorld(value: unknown): WorldDomain {
    const item = record(value, 'world', ['version', 'overview', 'news']);
    if (item.version !== 2) {
        throw new WorldValidationError('world', 'Expected version 2.');
    }
    return { version: 2,
        ...parseWorldContent({ overview: item.overview, news: item.news }) };
}
