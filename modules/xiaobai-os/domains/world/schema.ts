import { WORLD_LIMITS, WORLD_VERSION, WORLD_WRITE_LIMITS } from './types.js';

const text = (maxLength: number, description: string, allowEmpty = false) => ({
    type: 'string', maxLength, ...(!allowEmpty ? { minLength: 1, pattern: '\\S' } : {}), description,
});
export const worldNewsSchema = (bodyLimit: number = WORLD_LIMITS.body) => ({
    type: 'object', additionalProperties: false, required: ['id', 'title', 'body'], properties: {
        id: text(WORLD_LIMITS.id, 'Stable article ID. Reuse it to continue an article.'),
        title: text(WORLD_LIMITS.title, 'Article title.'),
        body: text(bodyLimit, 'Plain-text news brief; its opening is also the list preview.'),
    },
});
const overview = text(WORLD_LIMITS.overview, 'Wider-world atmosphere. Omit in an edit to keep it; an empty string clears it.', true);
export const WORLD_CONTENT_SCHEMA = {
    type: 'object', additionalProperties: false, required: ['overview', 'news'], properties: {
        overview,
        news: { type: 'array', maxItems: WORLD_LIMITS.news, items: worldNewsSchema() },
    },
};
export const WORLD_SCHEMA = {
    ...WORLD_CONTENT_SCHEMA, required: ['version', ...WORLD_CONTENT_SCHEMA.required],
    properties: { version: { type: 'integer', enum: [WORLD_VERSION] }, ...WORLD_CONTENT_SCHEMA.properties },
};
export const WORLD_EDIT_SCHEMA = {
    type: 'object', additionalProperties: false, properties: {
        overview,
        upsert: { type: 'array', maxItems: WORLD_WRITE_LIMITS.news,
            description: 'Complete new or replacement articles. Each ID appears once in this batch, in upsert or remove.',
            items: worldNewsSchema(WORLD_WRITE_LIMITS.body) },
        remove: { type: 'array', maxItems: WORLD_WRITE_LIMITS.news,
            description: 'IDs to retire. Omit to keep articles not replaced by upsert. A missing ID is already removed.',
            items: text(WORLD_WRITE_LIMITS.id, 'Article ID to retire.') },
    },
};
