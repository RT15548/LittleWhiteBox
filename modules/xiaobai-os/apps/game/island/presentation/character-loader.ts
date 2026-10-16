import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CAST, PLAYER_BODIES, type PlayerIdentity } from '../characters.js';
import type { NpcId, PersonId } from '../model.js';
import { createCharacterAsset, type CharacterAsset } from './character-asset.js';
import { characterModel, playerCharacterKey } from './character-media.js';
import type { WornGarment } from './survivor-visual.js';

async function loadAsset(id: string, url: string, height: number, gender: PlayerIdentity['gender'], signal: AbortSignal) {
    const response = await fetch(url, { signal });
    if (!response.ok) { throw new Error(`island_character_load:${response.status}`); }
    const bytes = await response.arrayBuffer(); signal.throwIfAborted();
    const gltf = await new GLTFLoader().parseAsync(bytes, new URL('.', url).href);
    const asset = createCharacterAsset(gltf, id, height, gender);
    if (signal.aborted) { asset.dispose(); signal.throwIfAborted(); }
    return asset;
}

// One scene owns six NPC assets plus the selected player, never all player variants.
export async function loadCharacters(identity: PlayerIdentity, signal: AbortSignal) {
    signal.throwIfAborted();
    const controller = new AbortController(), assets = new Map<PersonId, CharacterAsset>();
    const queue: { id: PersonId; url: string }[] = [
        ...Object.keys(CAST).map(id => ({ id: id as NpcId, url: characterModel(id as NpcId) })),
        { id: 'player', url: characterModel(playerCharacterKey(identity)) },
    ];
    const abort = () => controller.abort(); signal.addEventListener('abort', abort, { once: true });
    async function worker() {
        while (queue.length) {
            controller.signal.throwIfAborted(); const entry = queue.shift()!;
            const height = entry.id === 'player' ? PLAYER_BODIES[identity.gender].heightMetres : CAST[entry.id].heightMetres;
            const gender = entry.id === 'player' ? identity.gender : CAST[entry.id].gender;
            assets.set(entry.id, await loadAsset(entry.id, entry.url, height, gender, controller.signal));
        }
    }
    const pending = [worker(), worker()];
    try {
        await Promise.all(pending); signal.throwIfAborted();
    } catch (error) {
        controller.abort(); await Promise.allSettled(pending);
        assets.forEach(asset => asset.dispose()); throw error;
    } finally { signal.removeEventListener('abort', abort); }
    return {
        create(id: PersonId, worn: readonly WornGarment[], dead: boolean) {
            const asset = assets.get(id); if (!asset) { throw new Error(`island_character_not_loaded:${id}`); }
            return asset.create(worn, dead);
        },
        // Off-body clothing has one canonical pattern, independent of who dropped it.
        garment(item: WornGarment) { return assets.get('ye')!.garment(item); },
        dispose() { assets.forEach(asset => asset.dispose()); assets.clear(); },
    };
}
export type CharacterRoster = Awaited<ReturnType<typeof loadCharacters>>;
