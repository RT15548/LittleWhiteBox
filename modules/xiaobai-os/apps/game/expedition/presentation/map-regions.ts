import type { DistrictScene } from '../content/world-types.js';

/** Diagram positions only. Discovery and links always come from actual scene exits. */
export const MAP_REGIONS = {
    outskirts: { label: '外墙与檐下', layout: { camp: [52, 89], crossroads: [52, 66], gate: [25, 44], beacon: [25, 22], hall: [52, 15], cells: [79, 32], waterway: [79, 54], roots: [16, 70], south_street: [52, 2] } },
    city: { label: '内堡南坊', layout: { hall: [40, 95], south_street: [40, 78], deep_waterway: [12, 80], workshop_street: [72, 66],
        coal_store: [92, 46], heat_station: [40, 52], pipe_gallery: [40, 36], sluice_bridge: [40, 20], main_valve: [40, 4] } },
} as const satisfies Record<string, { label: string; layout: Partial<Record<DistrictScene, readonly [number, number]>> }>;
export type MapRegion = keyof typeof MAP_REGIONS;
