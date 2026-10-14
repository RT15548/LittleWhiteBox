import type { CourtyardScene, SceneDefinition } from './world-types.js';
import { COURTYARD_CAMP, COURTYARD_CROSSROADS } from './courtyard-outdoors.js';
import { COURTYARD_GATE, COURTYARD_BEACON } from './courtyard-ramparts.js';
import { COURTYARD_WATERWAY, COURTYARD_CELLS } from './courtyard-undercroft.js';
import { COURTYARD_HALL, COURTYARD_ROOTS } from './courtyard-sanctum.js';
import { COURTYARD_HOMES } from './courtyard-homes.js';
import { CITY_SCENES } from './inner-city/scenes.js';
import { STORY_PEOPLE, STORY_PERSON_IDS } from './inner-city/people.js';
import { defineLandscapeScene } from '../world/landscape.js';

const SCENES: Record<CourtyardScene, SceneDefinition> = {
    camp: COURTYARD_CAMP, crossroads: COURTYARD_CROSSROADS, gate: COURTYARD_GATE, beacon: COURTYARD_BEACON,
    waterway: COURTYARD_WATERWAY, cells: COURTYARD_CELLS, hall: COURTYARD_HALL, roots: COURTYARD_ROOTS,
    ...COURTYARD_HOMES,
    ...CITY_SCENES,
};
for (const person of STORY_PERSON_IDS) {
    const { scene, anchor } = STORY_PEOPLE[person], definition = SCENES[scene];
    SCENES[scene] = defineLandscapeScene({ ...definition,
        objects: [...definition.objects, { id: person, anchor, kind: 'resident', person }],
    });
}
export const COURTYARD: Readonly<Record<CourtyardScene, SceneDefinition>> = SCENES;
