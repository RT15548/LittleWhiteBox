import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import yeUrl from '../assets/characters/ye.glb?url&no-inline';
import { createCharacterAsset } from './character-asset.js';

export async function loadCharacterAsset(signal: AbortSignal) {
    const response = await fetch(yeUrl, { signal });
    if (!response.ok) { throw new Error(`island_character_load:${response.status}`); }
    const bytes = await response.arrayBuffer(); signal.throwIfAborted();
    const gltf = await new GLTFLoader().parseAsync(bytes, new URL('.', yeUrl).href);
    const asset = createCharacterAsset(gltf);
    if (signal.aborted) { asset.dispose(); signal.throwIfAborted(); }
    return asset;
}
