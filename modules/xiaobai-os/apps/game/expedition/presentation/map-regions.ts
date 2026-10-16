import type { DistrictScene } from '../content/world-types.js';
import { isCityDistrict } from '../content/inner-city/places.js';
import { isFurnaceScene } from '../content/furnace/places.js';

/** Diagram positions only. Discovery and links always come from actual scene exits. */
export const MAP_REGIONS = {
    outskirts: { label: '外墙与檐下', layout: { camp: [52, 89], crossroads: [52, 66], gate: [25, 44], beacon: [25, 22], hall: [52, 15], cells: [79, 32], waterway: [79, 54], roots: [16, 70], south_street: [52, 2] } },
    city: { label: '内堡南坊', layout: { hall: [40, 95], south_street: [40, 78], deep_waterway: [12, 80], workshop_street: [72, 66],
        coal_store: [92, 46], heat_station: [40, 52], pipe_gallery: [40, 36], sluice_bridge: [40, 20], main_valve: [40, 4], furnace_terrace: [75, 36] } },
    furnace: { label: '雪线与古炉', layout: { south_street: [17, 95], heat_station: [51, 95], furnace_terrace: [51, 76], snow_road: [29, 63],
        old_kiln: [10, 48], return_bridge: [10, 74], furnace_quarter: [73, 58], furnace_lift: [57, 39], furnace_scaffold: [89, 39],
        furnace_antechamber: [73, 20], furnace_heart: [73, 3] } },
} as const satisfies Record<string, { label: string; layout: Partial<Record<DistrictScene, readonly [number, number]>> }>;
export type MapRegion = keyof typeof MAP_REGIONS;
export const mapRegionFor = (scene: DistrictScene): MapRegion => isFurnaceScene(scene) ? 'furnace' : isCityDistrict(scene) ? 'city' : 'outskirts';
export const visibleMapRegions = (visited: readonly DistrictScene[]) => (Object.keys(MAP_REGIONS) as MapRegion[])
    .filter(region => region === 'outskirts' || visited.some(scene => mapRegionFor(scene) === region));
