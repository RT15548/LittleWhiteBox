import type { NpcId } from '../model.js';
import type { PlayerAge, PlayerGender, PlayerIdentity } from '../characters.js';

export type CharacterKey = NpcId | `player-${PlayerGender}-${PlayerAge}`;
const models = import.meta.glob<string>('../assets/characters/*.glb', { eager: true, import: 'default', query: '?url&no-inline' });
const portraits = import.meta.glob<string>('../assets/characters/*-portrait.png', { eager: true, import: 'default', query: '?url&no-inline' });

export function playerCharacterKey(identity: Pick<PlayerIdentity, 'gender' | 'appearanceAge'>): CharacterKey {
    return `player-${identity.gender}-${identity.appearanceAge}`;
}
export function characterModel(key: CharacterKey) {
    const url = models[`../assets/characters/${key}.glb`];
    if (!url) { throw new Error(`island_character_model_missing:${key}`); }
    return url;
}
export function characterPortrait(key: CharacterKey) {
    const url = portraits[`../assets/characters/${key}-portrait.png`];
    if (!url) { throw new Error(`island_character_portrait_missing:${key}`); }
    return url;
}
