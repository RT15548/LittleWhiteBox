import { RepeatWrapping, SRGBColorSpace, TextureLoader, type Texture } from 'three';
import stone from '../assets/texture-stone.webp?url&no-inline';
import plaster from '../assets/texture-plaster.webp?url&no-inline';
import slate from '../assets/texture-slate.webp?url&no-inline';
import ground from '../assets/texture-ground.webp?url&no-inline';
import { LAND } from './world-palette.js';

/** Owned by one active renderer. URLs are fetched only after entering the world. */
export function createWorldTextures(invalidate: () => void, status: (failed: number, pending: number) => void) {
    const loader = new TextureLoader(), maps = new Map<string, Texture>(), owned = new Set<Texture>();
    const failed = new Map<string, readonly string[]>();
    let pending = 0;
    let disposed = false;
    function load(url: string, colors: readonly string[]) {
        pending++;
        const texture = loader.load(url, loaded => {
            if (disposed) { loaded.dispose(); return; }
            pending--; failed.delete(url);
            for (const color of colors) { maps.set(color, loaded); }
            invalidate(); status(failed.size, pending);
        }, undefined, () => {
            if (disposed) { return; }
            pending--; owned.delete(texture); texture.dispose(); failed.set(url, colors);
            status(failed.size, pending);
        });
        texture.colorSpace = SRGBColorSpace; texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.anisotropy = 2; owned.add(texture);
    }
    // Until a map is decoded, surfaces keep their authored base pigments. A failed
    // decoration download is reported, but never changes gameplay or stops WebGL.
    for (const [url, colors] of [
        [stone, [LAND.stone, LAND.wetStone, LAND.marble, LAND.marbleLight]],
        [plaster, [LAND.light]], [slate, [LAND.roof, LAND.roofLight]],
        [ground, [LAND.grass, LAND.grassLight, LAND.grassDark]],
    ] as const) { load(url, colors); }
    return {
        maps,
        retry() { if (!disposed && pending === 0) { for (const [url, colors] of failed) { load(url, colors); } status(failed.size, pending); } },
        dispose() { disposed = true; owned.forEach(texture => texture.dispose()); owned.clear(); maps.clear(); failed.clear(); },
    };
}
