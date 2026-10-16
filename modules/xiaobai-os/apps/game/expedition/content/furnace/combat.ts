import type { EncounterDefinition } from '../courtyard-encounters.js';

export const FURNACE_BOSSES = ['kilnheart', 'furnacemaster'] as const;
export type FurnaceBoss = typeof FURNACE_BOSSES[number];
export const FURNACE_COMBAT = Object.freeze({ kilnHp: 4400, masterHp: 8800, couplerHp: 280, preparedCouplerHp: 160,
    connectedAt: .65, burningAt: .3, couplerStun: 75, couplerExposed: 180 });
export const FURNACE_VENTS = {
    furnace_scaffold: [{ x: -12, y: 5, angle: 0, length: 15, width: 1.1, offset: 90, period: 210 },
        { x: 12, y: -23, angle: Math.PI, length: 15, width: 1.1, offset: 195, period: 210 }],
} as const;
export const FURNACE_ENCOUNTERS = {
    snow_road: { scene: 'snow_road', complete: 'snow_road_cleared', reward: null, trigger: 'encounter', triggerRadius: 52,
        boss: null, bounds: { left: -24, right: 24, top: -29, bottom: 23 }, summons: [],
        waves: [[{ kind: 'stalker', anchor: 'front' }, { kind: 'wisp', anchor: 'left' }, { kind: 'wisp', anchor: 'right' }],
            [{ kind: 'stalker', anchor: 'left' }, { kind: 'stalker', anchor: 'right' }, { kind: 'wisp', anchor: 'rear' }]] },
    old_kiln: { scene: 'old_kiln', complete: 'kilnheart_defeated', reward: null, trigger: 'encounter', triggerRadius: 56,
        boss: 'kilnheart', bounds: { left: -17, right: 17, top: -25, bottom: 20 }, summons: ['left', 'right'],
        waves: [[{ kind: 'kilnheart', anchor: 'boss' }]] },
    return_bridge: { scene: 'return_bridge', complete: 'furnace_convoy_secured', reward: 'furnace_convoy', trigger: 'encounter', triggerRadius: 56,
        boss: null, bounds: { left: -20, right: 20, top: -28, bottom: 22 }, summons: [],
        waves: [[{ kind: 'guard', anchor: 'front' }, { kind: 'archer', anchor: 'left' }, { kind: 'bomber', anchor: 'right' }],
            [{ kind: 'charger', anchor: 'front' }, { kind: 'priest', anchor: 'rear' }, { kind: 'stalker', anchor: 'left' }, { kind: 'archer', anchor: 'right' }]] },
    furnace_lift: { scene: 'furnace_lift', complete: 'furnace_lift_cleared', reward: 'furnace_ascent', trigger: 'encounter', triggerRadius: 56,
        boss: null, bounds: { left: -24, right: 24, top: -27, bottom: 22 }, summons: [],
        waves: [[{ kind: 'guard', anchor: 'front' }, { kind: 'archer', anchor: 'left' }, { kind: 'archer', anchor: 'right' }],
            [{ kind: 'charger', anchor: 'front' }, { kind: 'priest', anchor: 'rear' }, { kind: 'bomber', anchor: 'right' }, { kind: 'guard', anchor: 'left' }]] },
    furnace_scaffold: { scene: 'furnace_scaffold', complete: 'furnace_scaffold_cleared', reward: 'furnace_ascent', trigger: 'encounter', triggerRadius: 56,
        boss: null, bounds: { left: -14, right: 14, top: -27, bottom: 23 }, summons: [],
        waves: [[{ kind: 'stalker', anchor: 'front' }, { kind: 'archer', anchor: 'left' }, { kind: 'bomber', anchor: 'right' }],
            [{ kind: 'charger', anchor: 'left' }, { kind: 'stalker', anchor: 'right' }, { kind: 'archer', anchor: 'rear' }]] },
    furnace_heart: { scene: 'furnace_heart', complete: 'furnace_master_defeated', reward: null, trigger: 'encounter', triggerRadius: 60,
        boss: 'furnacemaster', bounds: { left: -28, right: 28, top: -28, bottom: 25 }, summons: ['left', 'right'],
        waves: [[{ kind: 'furnacemaster', anchor: 'master' }]] },
} as const satisfies Record<string, EncounterDefinition>;
export type FurnaceEncounter = keyof typeof FURNACE_ENCOUNTERS;
export const FURNACE_ENCOUNTER_IDS = Object.keys(FURNACE_ENCOUNTERS) as FurnaceEncounter[];
