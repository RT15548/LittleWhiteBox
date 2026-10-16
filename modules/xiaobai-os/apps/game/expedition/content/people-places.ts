import type { CourtyardFact, CourtyardPerson, CourtyardScene, LivingScene } from './world-types.js';
import { WORLD_COPY } from './world-copy.js';
import { LIVING_SPACES } from './living-spaces.js';
import { PERSON_IDS } from './people.js';

export interface PersonPlace { scene: CourtyardScene; anchor: string }
export const PERSON_PLACES: Record<CourtyardPerson, { initial: PersonPlace; station: PersonPlace; returnFact: CourtyardFact | null }> = {
    sanniang: { initial: { scene: 'camp', anchor: 'clinic' }, station: { scene: 'camp', anchor: 'clinic' }, returnFact: null },
    laobai: { initial: { scene: 'camp', anchor: 'guard' }, station: { scene: 'camp', anchor: 'guard' }, returnFact: null },
    kouzi: { initial: { scene: 'cells', anchor: 'kouzi' }, station: { scene: 'camp', anchor: 'kouzi' }, returnFact: 'kouzi_returned' },
    anian: { initial: { scene: 'cells', anchor: 'anian' }, station: { scene: 'camp', anchor: 'anian' }, returnFact: 'anian_returned' },
};
export const CAPTIVE_IDS = PERSON_IDS.filter(id => PERSON_PLACES[id].returnFact !== null);
export const DESTINATIONS = {
    ...Object.fromEntries(Object.keys(LIVING_SPACES).map(id => [id, { scene: id, anchor: 'settle', name: WORLD_COPY.scenes[id as LivingScene] }])) as Record<LivingScene, PersonPlace & { name: string }>,
    camp: { scene: 'camp', anchor: 'start', name: '檐下营地' },
    gatehouse: { scene: 'camp', anchor: 'gatehouse', name: '外门门楼' },
    pipewalk: { scene: 'camp', anchor: 'kouzi', name: '管架高处' },
    clinic_back: { scene: 'camp', anchor: 'clinic_back', name: '诊棚后' },
    registry: { scene: 'camp', anchor: 'registry', name: '登记棚' },
    crossroads: { scene: 'crossroads', anchor: 'warning', name: WORLD_COPY.scenes.crossroads },
    gate: { scene: 'gate', anchor: 'crossroads', name: WORLD_COPY.scenes.gate },
    beacon: { scene: 'beacon', anchor: 'gate', name: WORLD_COPY.scenes.beacon },
    waterway: { scene: 'waterway', anchor: 'crossroads', name: WORLD_COPY.scenes.waterway },
    cells: { scene: 'cells', anchor: 'release', name: WORLD_COPY.scenes.cells },
    hall: { scene: 'hall', anchor: 'cells', name: WORLD_COPY.scenes.hall },
    roots: { scene: 'roots', anchor: 'crossroads', name: WORLD_COPY.scenes.roots },
    south_street: { scene: 'south_street', anchor: 'rest', name: WORLD_COPY.scenes.south_street },
    workshop_street: { scene: 'workshop_street', anchor: 'rest', name: WORLD_COPY.scenes.workshop_street },
    heat_station: { scene: 'heat_station', anchor: 'rest', name: WORLD_COPY.scenes.heat_station },
    deep_waterway: { scene: 'deep_waterway', anchor: 'receipt', name: WORLD_COPY.scenes.deep_waterway },
    furnace_terrace: { scene: 'furnace_terrace', anchor: 'rest', name: WORLD_COPY.scenes.furnace_terrace },
    old_kiln: { scene: 'old_kiln', anchor: 'view', name: WORLD_COPY.scenes.old_kiln },
    furnace_quarter: { scene: 'furnace_quarter', anchor: 'rest', name: WORLD_COPY.scenes.furnace_quarter },
    furnace_scaffold: { scene: 'furnace_scaffold', anchor: 'crossing', name: WORLD_COPY.scenes.furnace_scaffold },
    furnace_antechamber: { scene: 'furnace_antechamber', anchor: 'pause', name: WORLD_COPY.scenes.furnace_antechamber },
} as const satisfies Record<string, PersonPlace & { name: string }>;
export type DestinationId = keyof typeof DESTINATIONS;
