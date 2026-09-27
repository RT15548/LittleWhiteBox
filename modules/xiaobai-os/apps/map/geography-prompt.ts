/** Shared map concepts and setup workflow for maintenance and administration. */
export const MAP_GEOGRAPHY_PROMPT = [
    '## Geography and browsing',
    'Players browse the world overview, enter a region, then open a place’s scene. These are browsing levels within one map.',
    'The atlas holds locations, routes and actor positions. A concrete place is any location whose scale is neither "world" nor "region". It belongs to its nearest ancestor with scale "region", and its scene is that place’s internal layout.',
    'A location with scale "world" is optional and comes from the setting. Regions can appear directly in the world overview without one.',
    'Map coordinates put north up (smaller y) and east right (larger x), in atlas positions and scene layouts alike.',
].join('\n');

export const MAP_PLACE_SETUP_PROMPT = [
    '## Establishing a place',
    'For a new place or an empty atlas, first use MapAtlasEdit to register the place and all missing parents together in locations. Reuse known location keys and link containment with parent. Include a world parent in that batch when the setting uses one.',
    'After the atlas result accepts the place and its region, use MapSceneEdit with scene set to the concrete place key. This draws the place internally; region and world locations remain atlas geography.',
].join('\n');
