import type { CourtyardPerson, CourtyardScene, LivingScene } from './world-types.js';
import { WORLD_COPY } from './world-copy.js';
import { LIVING_SPACES } from './living-spaces.js';

export interface PersonPlace { scene: CourtyardScene; anchor: string }
export const PERSON_PLACES: Record<CourtyardPerson, { initial: PersonPlace; station: PersonPlace; captive: boolean }> = {
    sanniang: { initial: { scene: 'camp', anchor: 'clinic' }, station: { scene: 'camp', anchor: 'clinic' }, captive: false },
    laobai: { initial: { scene: 'camp', anchor: 'guard' }, station: { scene: 'camp', anchor: 'guard' }, captive: false },
    kouzi: { initial: { scene: 'cells', anchor: 'kouzi' }, station: { scene: 'camp', anchor: 'kouzi' }, captive: true },
    anian: { initial: { scene: 'cells', anchor: 'anian' }, station: { scene: 'camp', anchor: 'anian' }, captive: true },
};
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
} as const satisfies Record<string, PersonPlace & { name: string }>;
export type DestinationId = keyof typeof DESTINATIONS;
