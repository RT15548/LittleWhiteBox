import type { SceneObject } from './world-types.js';

/** The same handoff defines the map interaction, completion event and conversation destination. */
export const SUPPLIES_HANDOFF = {
    scene: 'camp', fact: 'supplies_secured',
    object: { id: 'cargo', anchor: 'cargo', kind: 'inspect', passage: 'cargo', condition: { all: ['warden_defeated'] } },
    situation: {
        held: '药材与冷却管件仍被哨站扣押，解除内堡门厅的封锁后，物资会运回檐下的货车。',
        ready: '门厅封锁已解除，药材与冷却管件已运回檐下的货车，等玩家在货车处核对接收。',
        collected: '玩家已在檐下的货车核对接收药材与冷却管件，这批物资已经取回。',
    },
} as const satisfies { scene: 'camp'; fact: 'supplies_secured'; object: SceneObject; situation: Record<string, string> };
