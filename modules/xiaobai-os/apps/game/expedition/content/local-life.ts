import type { Point } from '../types.js';
import type { CourtyardScene, WorldCondition } from './world-types.js';
import { WORLD_COPY } from './world-copy.js';

export interface LocalStop { position: Point; wait: number; facing: number }
export interface LocalResident {
    id: string;
    name: string;
    activity: 'mend' | 'warm' | 'dressings' | 'cook' | 'water' | 'deliver' | 'repair' | 'keep' | 'register';
    coat: 'blue' | 'rose' | 'cream';
    route: readonly LocalStop[];
    phase: number;
    condition?: WorldCondition;
}
const stop = (x: number, y: number, wait: number, facing = Math.PI): LocalStop => ({ position: { x, y }, wait, facing });

/** Ordinary life, not conversation participants. Seconds are local scene time; nothing is saved. */
export const LOCAL_LIFE: Partial<Record<CourtyardScene, readonly LocalResident[]>> = {
    furnace_terrace: [
        { id: 'peisu-at-table', name: '掌炉官裴肃', activity: 'warm', coat: 'blue', phase: 0, route: [stop(0, -25, 0, 0)], condition: { none: ['furnace_approach_ready'] } },
        { id: 'terrace-attendant', name: '炉台侍者', activity: 'keep', coat: 'cream', phase: 0, route: [stop(8, -13, 0)] },
    ],
    furnace_quarter: [
        { id: 'bathhouse-water', name: '澡堂伙计', activity: 'water', coat: 'blue', phase: 4, route: [stop(-10, -8, 8), stop(-9, 6, 0), stop(-10, 17, 7), stop(-9, 6, 0)] },
        { id: 'furnace-mender', name: '修衣的住户', activity: 'mend', coat: 'rose', phase: 1, route: [stop(13, 1, 0)] },
        { id: 'furnace-delivery', name: '运料工', activity: 'deliver', coat: 'cream', phase: 9, route: [stop(12, 21, 6), stop(5, 16, 0), stop(6, 0, 0), stop(9, -15, 8), stop(6, 0, 0), stop(5, 16, 0)] },
        { id: 'furnace-handover-worker', name: '接管炉组的管工', activity: 'warm', coat: 'blue', phase: 0, route: [stop(-6, -17, 0, Math.PI / 2)], condition: { all: ['furnace_stilled'] } },
        { id: 'furnace-handover-clerk', name: '登记住户的办事员', activity: 'register', coat: 'cream', phase: 2, route: [stop(6, -17, 0, -Math.PI / 2)], condition: { all: ['furnace_stilled'] } },
    ],
    furnace_antechamber: [
        { id: 'furnace-orderly', name: '值房看护', activity: 'dressings', coat: 'cream', phase: 0, route: [stop(11, -9, 0)] },
    ],
    furnace_heart: [
        { id: 'furnace-recovery-worker', name: '接手检修的管工', activity: 'repair', coat: 'blue', phase: 0, route: [stop(6, -32, 0)], condition: { all: ['furnace_stilled'] } },
        { id: 'furnace-recovery-carrier', name: '搬送晶座的工人', activity: 'deliver', coat: 'cream', phase: 5, route: [stop(9, 20, 6), stop(9, -13, 0), stop(9, -28, 8), stop(9, -13, 0)], condition: { all: ['furnace_stilled'] } },
    ],
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
    south_street: [
        { id: 'tea-seller', name: '热水铺掌柜', activity: 'cook', coat: 'cream', phase: 0, route: [stop(7, -17, 0, Math.PI / 2)] },
        { id: 'tea-drinker', name: '歇脚的街坊', activity: 'warm', coat: 'blue', phase: 1, route: [stop(-7, 19, 0)] },
        { id: 'city-delivery', name: '送货的伙计', activity: 'deliver', coat: 'rose', phase: 6,
            route: [stop(11, 23, 7), stop(5, 17, 0), stop(0, 7, 0), stop(0, -5, 5), stop(0, 7, 0), stop(5, 17, 0)] },
    ],
    workshop_street: [
        { id: 'pipe-fitter', name: '修管的工人', activity: 'repair', coat: 'blue', phase: 0, route: [stop(18, -4, 0)] },
        { id: 'lodging-mender', name: '补衣的寄工', activity: 'mend', coat: 'rose', phase: 1, route: [stop(17, 20, 0)] },
        { id: 'workshop-water', name: '领水的寄工', activity: 'water', coat: 'cream', phase: 3,
            route: [stop(-10, 19, 6, -Math.PI / 2), stop(-4, 18, 0), stop(8, 21, 0), stop(14, 20, 7), stop(8, 21, 0), stop(-4, 18, 0)] },
    ],
    workers_lodging: [
        { id: 'old-mender', name: '补鞋的老寄工', activity: 'mend', coat: 'cream', phase: 0, route: [stop(-7, 7, 0)] },
    ],
};
export const LOCAL_ACTIVITY = { mend: '缝补衣物', warm: '捧着热水歇息', dressings: '整理敷料', cook: '照看炉火', water: '提水往来', deliver: '搬送货物', repair: '修理铜管', keep: '照看柜台', register: '核对名册' } as const;
