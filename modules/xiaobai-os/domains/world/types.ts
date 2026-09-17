export interface WorldNews {
    id: string;
    title: string;
    summary: string;
    body: string;
}

export interface WorldContent {
    overview: string;
    news: WorldNews[];
}

export interface WorldDomain extends WorldContent {
    version: 2;
}

export const WORLD_LIMITS = Object.freeze({
    news: 8, id: 64, title: 64, summary: 120, body: 800, overview: 320,
});

export function createEmptyWorld(): WorldDomain {
    return { version: 2, overview: '', news: [] };
}

export function sameWorldContent(left: WorldContent, right: WorldContent): boolean {
    return left.overview === right.overview && left.news.length === right.news.length
        && left.news.every((item, index) => {
            const other = right.news[index];
            return item.id === other.id && item.title === other.title && item.summary === other.summary && item.body === other.body;
        });
}
