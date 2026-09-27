import { parseWorldContent, validateWorldInput, WorldValidationError } from './invariants.js';
import { WORLD_EDIT_SCHEMA } from './schema.js';
import { sameWorldContent, type WorldContent, type WorldNews } from './types.js';

export interface WorldEditResult {
    ok: boolean;
    status: 'updated' | 'unchanged' | 'failed';
    changed: boolean;
    data: WorldContent;
    errors: { path: string; message: string; code?: string; expected?: unknown }[];
    unchecked?: string[];
}

export function editWorld(current: WorldContent, input: unknown): WorldEditResult {
    try {
        validateWorldInput(input, WORLD_EDIT_SCHEMA, 'WorldEdit');
        const edit = input as { overview?: string; upsert?: WorldNews[]; remove?: string[] };
        const overview = edit.overview ?? current.overview;
        const upsert = edit.upsert ?? [];
        const remove = edit.remove ?? [];
        const ids = [...upsert.map(item => item.id), ...remove];
        if (new Set(ids).size !== ids.length) {
            throw new WorldValidationError('WorldEdit', 'Each ID may appear once per edit, in either upsert or remove.');
        }
        const replacements = new Map(upsert.map(item => [item.id, item]));
        const oldIds = new Set(current.news.map(item => item.id));
        const data = parseWorldContent({ overview, news: [
            ...upsert.filter(item => !oldIds.has(item.id)),
            ...current.news.filter(item => !remove.includes(item.id)).map(item => replacements.get(item.id) ?? item),
        ] });
        const changed = !sameWorldContent(current, data);
        return { ok: true, status: changed ? 'updated' : 'unchanged', changed, data, errors: [] };
    } catch (error) {
        if (!(error instanceof WorldValidationError)) { throw error; }
        return { ok: false, status: 'failed', changed: false, data: structuredClone(current),
            errors: error.issues ?? [{ path: error.path, message: error.message }],
            ...(error.issues ? { unchecked: ['publication'] } : {}) };
    }
}
