export const TAVERN_ATLAS_DOC_TYPE = 'tavern.atlas' as const;
export const TAVERN_ATLAS_DOC_ID = 'main' as const;

export interface TavernSeedAtlasDocument {
    version: 1;
    locations: unknown[];
    links: unknown[];
    actors: unknown[];
}

export function createSeedAtlasDocument(): TavernSeedAtlasDocument {
    return {
        version: 1,
        locations: [],
        links: [],
        actors: [],
    };
}
