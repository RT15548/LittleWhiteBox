import type { EncounterDefinition } from '../courtyard-encounters.js';

export const CITY_BOSSES = ['bridgekeeper', 'heatkeeper'] as const;
export type CityBoss = typeof CITY_BOSSES[number];
export const CITY_COMBAT = Object.freeze({ bridgeHp: 3800, keeperHp: 6200, pullDistance: 4 });
/** Fixed outlets: the pipe gallery teaches crossing a warned pressure line before either boss combines attacks. */
export const CITY_VENTS = {
    pipe_gallery: [{ x: -17, y: -3, angle: 0, length: 34, width: 1, offset: 75, period: 180 }],
} as const;
export const CITY_ENCOUNTERS = {
    // Entry spans each room's walkable width. A side lane is cover, not an unguarded bypass of the battle.
    pipe_gallery: { scene: 'pipe_gallery', complete: 'gallery_cleared', reward: null, trigger: 'encounter', triggerRadius: 52,
        boss: null, bounds: { left: -22, right: 22, top: -25, bottom: 22 }, summons: [],
        waves: [[{ kind: 'guard', anchor: 'guard' }, { kind: 'archer', anchor: 'archer' }, { kind: 'soldier', anchor: 'flank' }],
            [{ kind: 'charger', anchor: 'guard' }, { kind: 'bomber', anchor: 'bomber' }, { kind: 'stalker', anchor: 'flank' }]] },
    sluice_bridge: { scene: 'sluice_bridge', complete: 'bridge_cleared', reward: 'bridge', trigger: 'encounter', triggerRadius: 52,
        boss: 'bridgekeeper', bounds: { left: -28, right: 28, top: -24, bottom: 24 }, summons: ['left', 'right'],
        waves: [[{ kind: 'bridgekeeper', anchor: 'guard' }]] },
    main_valve: { scene: 'main_valve', complete: 'heatkeeper_defeated', reward: 'heatkeeper', trigger: 'encounter', triggerRadius: 56,
        boss: 'heatkeeper', bounds: { left: -32, right: 32, top: -27, bottom: 26 }, summons: ['left', 'right'],
        waves: [[{ kind: 'heatkeeper', anchor: 'keeper' }]] },
    coal_store: { scene: 'coal_store', complete: 'coal_store_cleared', reward: 'coal_store', trigger: 'encounter', triggerRadius: 50,
        boss: null, bounds: { left: -28, right: 28, top: -25, bottom: 24 }, summons: [],
        waves: [[{ kind: 'guard', anchor: 'guard' }, { kind: 'archer', anchor: 'archer' }, { kind: 'bomber', anchor: 'bomber' }],
            [{ kind: 'guard', anchor: 'guard' }, { kind: 'priest', anchor: 'archer' }, { kind: 'charger', anchor: 'flank' }, { kind: 'bomber', anchor: 'bomber' }]] },
} as const satisfies Record<string, EncounterDefinition>;
