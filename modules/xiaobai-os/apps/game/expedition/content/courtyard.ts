import type { CourtyardScene, SceneDefinition } from './world-types.js';
import { COURTYARD_CAMP, COURTYARD_CROSSROADS } from './courtyard-outdoors.js';
import { COURTYARD_GATE, COURTYARD_BEACON } from './courtyard-ramparts.js';
import { COURTYARD_WATERWAY, COURTYARD_CELLS } from './courtyard-undercroft.js';
import { COURTYARD_HALL, COURTYARD_ROOTS } from './courtyard-sanctum.js';
import { COURTYARD_HOMES } from './courtyard-homes.js';

export const COURTYARD: Readonly<Record<CourtyardScene, SceneDefinition>> = {
    camp: COURTYARD_CAMP, crossroads: COURTYARD_CROSSROADS, gate: COURTYARD_GATE, beacon: COURTYARD_BEACON,
    waterway: COURTYARD_WATERWAY, cells: COURTYARD_CELLS, hall: COURTYARD_HALL, roots: COURTYARD_ROOTS,
    ...COURTYARD_HOMES,
};
