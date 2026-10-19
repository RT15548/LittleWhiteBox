import { type Component } from 'vue';
import DiceRecord from './rooms/dice/DiceRecord.vue';
import PushRecord from './rooms/push/PushRecord.vue';
import LadderRecord from './rooms/ladder/LadderRecord.vue';
import { gameInfo } from '../catalog.js';
import type { GameKind } from '../types.js';
import { MOVING_GAME } from '../moving/catalog.js';
import { BUILDING_GAME } from '../building/catalog.js';
import { EXPEDITION_GAME } from '../expedition/catalog.js';
import expeditionCover from '../expedition/assets/game-cover.webp?url&no-inline';

export const GAME_ROOMS = [
    { ...gameInfo('dice'), record: DiceRecord, artwork: new URL('./rooms/dice/art.svg', import.meta.url).href, load: () => import('./rooms/dice/DiceRoom.vue') },
    { ...gameInfo('push'), record: PushRecord, artwork: new URL('./rooms/push/art.svg', import.meta.url).href, load: () => import('./rooms/push/PushRoom.vue') },
    { ...gameInfo('ladder'), record: LadderRecord, artwork: new URL('./rooms/ladder/art.svg', import.meta.url).href, load: () => import('./rooms/ladder/LadderRoom.vue') },
] satisfies Array<ReturnType<typeof gameInfo> & { record: Component; artwork: string; load: () => Promise<{ default: Component }> }>;

export function gameRoom(kind: GameKind) {return GAME_ROOMS.find(room => room.id === kind)!;}

// Moving owns its Host protocol and view; it is not a wagering GameKind.
export const GAME_ENTRIES = [
    { ...EXPEDITION_GAME, mode: 'standalone' as const, artwork: expeditionCover, load: () => import('../expedition/ExpeditionRoom.vue') },
    { ...BUILDING_GAME, mode: 'standalone' as const, artwork: new URL('../building/art.svg', import.meta.url).href, load: () => import('../building/BuildingRoom.vue') },
    { ...MOVING_GAME, mode: 'standalone' as const, artwork: new URL('../moving/art.svg', import.meta.url).href, load: () => import('../moving/MovingRoom.vue') },
    ...GAME_ROOMS.map(room => ({ ...room, mode: 'wager' as const })),
];
export type GameEntryId = typeof GAME_ENTRIES[number]['id'];
export function gameEntry(id: GameEntryId) { return GAME_ENTRIES.find(entry => entry.id === id)!; }
