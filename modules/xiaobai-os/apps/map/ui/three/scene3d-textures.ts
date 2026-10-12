import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three';
import type { MapMaterial } from '../../../../domains/map/types.js';

function cloud(x: number, y: number, cells: number): number {
    const px = x / 128 * cells, py = y / 128 * cells, ix = Math.floor(px), iy = Math.floor(py);
    const smooth = (v: number) => v * v * (3 - 2 * v);
    const noise = (a: number, b: number) => {
        let hash = Math.imul(a % cells + 17, 374761393) + Math.imul(b % cells + 41, 668265263);
        hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
        return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
    };
    const sx = smooth(px - ix), sy = smooth(py - iy);
    return (noise(ix, iy) * (1 - sx) + noise(ix + 1, iy) * sx) * (1 - sy)
        + (noise(ix, iy + 1) * (1 - sx) + noise(ix + 1, iy + 1) * sx) * sy;
}

/** Small, deterministic surface detail; no downloaded assets or scene facts. */
export function createSurfaceTexture(token: MapMaterial, floor: boolean): DataTexture {
    const size = 128, pixels = new Uint8Array(size * size * 4);
    let seed = 781;
    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            const noise = seed / 4294967296;
            let value = .94 + noise * .06;
            if (token === 'wood') {
                const grain = Math.sin(y * .32 + Math.sin(x * Math.PI / 64) * .8 + Math.sin(y * .14));
                value = .94 + grain * .014 + noise * .012;
                if (floor) {
                    const row = Math.floor(y / 32);
                    value += [0, .018, -.015, .01][row];
                    if (y % 32 === 0 || (x + row * 47) % 128 === 0) {value = .83;}
                }
            } else if (token === 'tile') {
                value = x % 64 < 2 || y % 64 < 2 ? .73 : .96 + noise * .04;
            } else if (['fabric', 'carpet', 'bed-sheet', 'tatami'].includes(token)) {
                value = .95 + ((x % 4 < 2) === (y % 4 < 2) ? .012 : 0) + noise * .018;
            } else if (token === 'stone' || token === 'marble') {
                value = .86 + cloud(x, y, 4) * .085 + cloud(x, y, 16) * .035 + noise * .02;
            } else if (['grass', 'forest', 'dirt', 'sand', 'snow'].includes(token)) {
                value = .91 + cloud(x, y, 4) * .04 + cloud(x, y, 16) * .025 + noise * .015;
            } else if (['water', 'slime', 'blood', 'flesh'].includes(token)) {
                const wave = cloud(x, y, 4) * .6 + cloud(x, y, 8) * .4;
                value = .92 + wave * (token === 'flesh' ? .06 : .035) + noise * .008;
            } else if (token === 'metal') {
                value = .97 + Math.sin(y * 2) * .008 + noise * .012;
            }
            const channel = Math.round(value * 255);
            pixels.set([channel, channel, channel, 255], (y * size + x) * 4);
        }
    }
    const texture = new DataTexture(pixels, size, size, RGBAFormat);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    if (floor && token === 'wood') {texture.repeat.set(.28, .28);}
    texture.magFilter = LinearFilter; texture.minFilter = LinearMipmapLinearFilter;
    texture.generateMipmaps = true; texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
}
