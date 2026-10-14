import { SOUTH_STREET, WORKSHOP_STREET } from './streets.js';
import { HEAT_STATION, PIPE_GALLERY, SLUICE_BRIDGE, MAIN_VALVE } from './works.js';
import { DEEP_WATERWAY, COAL_STORE } from './side-routes.js';
import type { CityDistrict, SceneDefinition } from '../world-types.js';

export const CITY_SCENES = {
    south_street: SOUTH_STREET, workshop_street: WORKSHOP_STREET, heat_station: HEAT_STATION,
    pipe_gallery: PIPE_GALLERY, sluice_bridge: SLUICE_BRIDGE, main_valve: MAIN_VALVE,
    deep_waterway: DEEP_WATERWAY, coal_store: COAL_STORE,
} satisfies Record<CityDistrict, SceneDefinition>;
