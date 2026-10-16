import { CITY_VENTS } from './inner-city/combat.js';
import { FURNACE_VENTS } from './furnace/combat.js';

export interface PressureVent { x: number; y: number; angle: number; length: number; width: number; offset: number; period: number; wait: number; damage: number }
const VENTS = { ...CITY_VENTS, ...FURNACE_VENTS };
export const PRESSURE_RULES = Object.freeze({ wait: 42, damage: 23 });
/** Collision, warning and visible outlet all project the same authored vent. */
export const pressureVents = (scene: string | undefined): readonly PressureVent[] => scene && Object.hasOwn(VENTS, scene)
    ? VENTS[scene as keyof typeof VENTS].map(vent => ({ ...vent, ...PRESSURE_RULES })) : [];
