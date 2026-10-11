import type { Point } from '../types.js';
import type { CourtyardScene } from './world-types.js';
import { WORLD_COPY } from './world-copy.js';

export interface LocalStop { position: Point; wait: number; facing: number }
export interface LocalResident {
    id: string;
    name: string;
    activity: 'mend' | 'warm' | 'dressings' | 'cook' | 'water' | 'deliver' | 'repair' | 'keep';
    coat: 'blue' | 'rose' | 'cream';
    route: readonly LocalStop[];
    phase: number;
}
const stop = (x: number, y: number, wait: number, facing = Math.PI): LocalStop => ({ position: { x, y }, wait, facing });

/** Ordinary life, not conversation participants. Seconds are local scene time; nothing is saved. */
export const LOCAL_LIFE: Partial<Record<CourtyardScene, readonly LocalResident[]>> = {
    camp: [
        { id: 'mender', name: '补衣人', activity: 'mend', coat: 'rose', phase: 0, route: [stop(-12, 23.2, 0)] },
        { id: 'patient', name: '歇脚的病人', activity: 'warm', coat: 'blue', phase: 1.3, route: [stop(-21, 12.5, 0, -.4)] },
        { id: 'helper', name: '帮忙的街坊', activity: 'dressings', coat: 'cream', phase: 2.7, route: [stop(-24, 11.9, 0, -.8)] },
        { id: 'stove-tender', name: '看炉的街坊', activity: 'cook', coat: 'blue', phase: .7, route: [stop(-2.8, 6, 0, Math.PI / 2)] },
        { id: 'water-carrier', name: '提水人', activity: 'water', coat: 'cream', phase: 3,
            route: [stop(-31, 18, 6, -Math.PI / 2), stop(-27, 16, 0), stop(-23, 13, 7, Math.PI), stop(-27, 16, 0)] },
        { id: 'delivery', name: '送货人', activity: 'deliver', coat: 'rose', phase: 12,
            route: [stop(10, 7, 6), stop(5, 10, 0), stop(-8, 13, 0), stop(-18, 14, 8, Math.PI), stop(-8, 13, 0), stop(5, 10, 0)] },
    ],
    clinic_front: [
        { id: 'waiting-patient', name: '候诊的街坊', activity: 'warm', coat: 'blue', phase: 0, route: [stop(-7, 4.5, 0)] },
    ],
    inn: [
        { id: 'innkeeper', name: WORLD_COPY.households.innkeeper, activity: 'keep', coat: 'cream', phase: 1, route: [stop(7, -7, 0)] },
    ],
    anian_home: [
        { id: 'anian-father', name: '阿念的父亲', activity: 'repair', coat: 'blue', phase: 0, route: [stop(8, -4, 0)] },
        { id: 'anian-mother', name: '阿念的母亲', activity: 'mend', coat: 'rose', phase: 2, route: [stop(8, 2, 0)] },
    ],
};
export const LOCAL_ACTIVITY = { mend: '缝补衣物', warm: '捧着热水歇息', dressings: '整理敷料', cook: '照看炉火', water: '提水往来', deliver: '搬送货物', repair: '修理铜管', keep: '照看柜台' } as const;
