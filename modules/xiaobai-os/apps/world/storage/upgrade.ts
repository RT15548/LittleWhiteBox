import { parseWorld, record, worldText, WorldValidationError } from '../../../domains/world/invariants.js';
import type { WorldDomain } from '../../../domains/world/types.js';

// Frozen upstream v1 file format. Keep until v1 OS chat files are no longer
// supported. Preferences are deliberately not promoted from one chat to all chats.
interface WorldFileV1 {
    version: 1;
    subscribed: boolean;
    injectToStory: boolean;
    overview: string;
    news: { id: string; title: string; summary: string; body: string }[];
}

function parseV1(value: unknown): WorldFileV1 {
    const item = record(value, 'world', ['version', 'subscribed', 'injectToStory', 'overview', 'news']);
    if (item.version !== 1 || typeof item.subscribed !== 'boolean' || typeof item.injectToStory !== 'boolean'
        || !Array.isArray(item.news) || item.news.length > 8) {
        throw new WorldValidationError('world', 'Invalid version 1 world file.');
    }
    const news = item.news.map((value, index) => {
        const path = `world.news[${index}]`;
        const entry = record(value, path, ['id', 'title', 'summary', 'body']);
        return {
            id: worldText(entry.id, `${path}.id`, 64),
            title: worldText(entry.title, `${path}.title`, 64),
            summary: worldText(entry.summary, `${path}.summary`, 120),
            body: worldText(entry.body, `${path}.body`, 800),
        };
    });
    if (new Set(news.map(entry => entry.id)).size !== news.length) {
        throw new WorldValidationError('world.news', 'Duplicate version 1 news IDs.');
    }
    return { version: 1, subscribed: item.subscribed, injectToStory: item.injectToStory,
        overview: worldText(item.overview, 'world.overview', 320, true), news };
}

export function readWorldFile(value: unknown): WorldDomain {
    if (value !== null && typeof value === 'object' && (value as { version?: unknown }).version === 1) {
        const previous = parseV1(value);
        return parseWorld({ version: 2, overview: previous.overview, news: previous.news });
    }
    return parseWorld(value);
}
