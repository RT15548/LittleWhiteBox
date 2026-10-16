import catalog from './character-catalog.json';
import type { NpcId } from './model.js';

export const PLAYER_GENDERS = ['male', 'female'] as const;
export const PLAYER_AGES = catalog.playerAges;
export const PLAYER_NAME_LIMIT = 24;
export const PLAYER_BACKGROUND_LIMIT = 800;
export type PlayerGender = typeof PLAYER_GENDERS[number];
export type PlayerAge = keyof typeof PLAYER_AGES;
export interface PlayerAppearance { name: string; gender: PlayerGender; appearanceAge: PlayerAge }
export interface PlayerIdentity extends PlayerAppearance { background?: string }
export interface NpcCharacter {
    name: string; gender: PlayerGender; age: number; heightMetres: number; occupation: string; profile: string;
}
export const CAST = catalog.npcs as Record<NpcId, NpcCharacter>;
export const CAST_BACKGROUND = catalog.background;
export const PLAYER_BODIES = catalog.playerBodies;
export type NpcIdentity = Pick<NpcCharacter, 'name' | 'gender' | 'age' | 'heightMetres'>;
export type PersonIdentity = PlayerAppearance | NpcIdentity;

export function playerAppearance(identity: PlayerIdentity): PlayerAppearance {
    const { name, gender, appearanceAge } = identity;
    return { name, gender, appearanceAge };
}

export function npcIdentity(id: NpcId): NpcIdentity {
    const { name, gender, age, heightMetres } = CAST[id];
    return { name, gender, age, heightMetres };
}
