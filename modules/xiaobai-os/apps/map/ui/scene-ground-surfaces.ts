import type { MapMaterial } from '../../../domains/map/types.js';

/** Renderer-owned surface recipes. Size is in the scene's presentation units, not metres. */
export const GROUND_SURFACES = {
    sand: { color: '#dfc68d', size: 4.2, relief: .075, roughness: .94 },
    stone: { color: '#aeb8bc', size: 4.8, relief: .11, roughness: .88 },
    dirt: { color: '#aa8965', size: 3.8, relief: .10, roughness: .96 },
    grass: { color: '#8eae68', size: 3.6, relief: .075, roughness: .94 },
    forest: { color: '#82916a', size: 3.6, relief: .08, roughness: .97 },
    snow: { color: '#edf4f6', size: 5.2, relief: .09, roughness: .68 },
    marble: { color: '#e3e9e8', size: 5.4, relief: .009, roughness: .24 },
    wood: { color: '#c4a077', size: 4.2, relief: .045, roughness: .62 },
    tile: { color: '#d7e2e2', size: 3.2, relief: .035, roughness: .32 },
} as const satisfies Partial<Record<MapMaterial, { color: string; size: number; relief: number; roughness: number }>>;
export type GroundSurface = keyof typeof GROUND_SURFACES;
export const GROUND_TEXTURE_SIZE = 256;

export function isGroundSurface(material?: MapMaterial): material is GroundSurface {
    return !!material && Object.hasOwn(GROUND_SURFACES, material);
}

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const wrap = (n: number, period: number) => ((n % period) + period) % period;
const smooth = (a: number, b: number, n: number) => { const t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); };
const tau = Math.PI * 2;
function hash(x: number, y: number, seed = 0): number {
    let n = Math.imul(x + 17, 374761393) ^ Math.imul(y + 41, 668265263) ^ Math.imul(seed + 1, 1274126177);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** Periodic fields keep both value and slope continuous at the texture boundary. */
function createNoiseField() {
    // Lattices live only during this rasterization; avoid hashing every pixel corner.
    const lattices = new Map<number, Float64Array>();
    return (u: number, v: number, cells: number, seed = 0): number => {
        const key = cells * 100 + seed;
        let lattice = lattices.get(key);
        if (!lattice) {
            lattice = Float64Array.from({ length: cells * cells }, (_, i) => hash(i % cells, Math.floor(i / cells), seed));
            lattices.set(key, lattice);
        }
        const x = u * cells, y = v * cells, ix = Math.floor(x), iy = Math.floor(y);
        const sx = smooth(0, 1, x - ix), sy = smooth(0, 1, y - iy);
        const x0 = wrap(ix, cells), x1 = wrap(ix + 1, cells), y0 = wrap(iy, cells) * cells, y1 = wrap(iy + 1, cells) * cells;
        return (lattice[y0 + x0] * (1 - sx) + lattice[y0 + x1] * sx) * (1 - sy)
            + (lattice[y1 + x0] * (1 - sx) + lattice[y1 + x1] * sx) * sy;
    };
}

function cells(u: number, v: number, count: number) {
    const x = u * count, y = v * count, ix = Math.floor(x), iy = Math.floor(y);
    let first = Infinity, second = Infinity, shade = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const cx = ix + dx, cy = iy + dy, px = wrap(cx, count), py = wrap(cy, count);
            const distance = (x - cx - .15 - hash(px, py, 3) * .7) ** 2 + (y - cy - .15 - hash(px, py, 7) * .7) ** 2;
            if (distance < first) { second = first; first = distance; shade = hash(px, py, 11); }
            else if (distance < second) { second = distance; }
        }
    }
    return { distance: Math.sqrt(first), edge: Math.sqrt(second) - Math.sqrt(first), shade };
}

export interface GroundSurfacePixels {
    size: number;
    /** Material-coloured sRGB albedo, followed by two independent linear scalar channels. */
    color: Uint8Array;
    height: Uint8Array;
    roughness: Uint8Array;
}

/** CPU-only, deterministic and bounded. Neither Three.js nor a browser is needed. */
export function createGroundSurface(material: GroundSurface): GroundSurfacePixels {
    const size = GROUND_TEXTURE_SIZE, profile = GROUND_SURFACES[material];
    const noise = createNoiseField();
    const color = new Uint8Array(size * size * 4), height = new Uint8Array(size * size), roughness = new Uint8Array(size * size);
    const rgb = [1, 3, 5].map(index => Number.parseInt(profile.color.slice(index, index + 2), 16));
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const u = x / size, v = y / size, grain = hash(x, y), broad = noise(u, v, 4);
            let value = 1, elevation = .5, finish: number = profile.roughness;
            if (material === 'sand') {
                const phase = v * 8 + Math.sin(u * tau) * .65 + broad * .9;
                const ridge = (.5 + .5 * Math.sin(phase * tau)) ** 3;
                value = .89 + ridge * .12 + grain * .045;
                elevation = .32 + ridge * .24 + grain * .055;
                finish += (grain - .5) * .08;
            } else if (material === 'stone') {
                const rock = cells(u + noise(u, v, 8, 1) * .065, v + broad * .065, 5);
                const edge = smooth(.018, .075, rock.edge), face = noise(u, v, 24, 2);
                value = (.72 + rock.shade * .29 + face * .09) * (.62 + edge * .38);
                elevation = .18 + edge * .40 + face * .11 + grain * .035;
                finish += -.10 + face * .17 + (1 - edge) * .05;
            } else if (material === 'dirt') {
                const soil = cells(u + noise(u, v, 8, 3) * .05, v + broad * .045, 13);
                const clump = (1 - smooth(.08, .35 + soil.shade * .4, soil.distance)) * (.55 + soil.shade * .45);
                const grit = grain > .93 ? .12 : grain < .1 ? -.09 : 0;
                value = .69 + broad * .29 + clump * .14 + grit;
                elevation = .23 + broad * .27 + clump * .27 + grit * .5;
                finish += -.07 + (1 - clump) * .11;
            } else if (material === 'grass' || material === 'forest') {
                const tufts = noise(u, v, 12, 4);
                value = .66 + broad * .24 + tufts * .23 + grain * .045;
                elevation = .25 + broad * .13 + tufts * .2;
                finish += -.045 + tufts * .09;
            } else if (material === 'snow') {
                const drift = noise(u + .045 * Math.sin(v * tau), v, 3, 6);
                const crest = (.5 + .5 * Math.sin((v * 2 + u + broad * .7) * tau)) ** 5;
                value = .82 + drift * .17 + crest * .07 + grain * .025;
                elevation = .20 + drift * .42 + crest * .20 + noise(u, v, 16, 4) * .045;
                finish += grain > .985 ? -.38 : -.07 + drift * .15;
            } else if (material === 'marble') {
                const warp = broad * 1.7 + noise(u, v, 8, 2) * .65 + noise(u, v, 16, 3) * .17;
                const line = Math.abs(Math.sin((u * 2 + v * 3 + warp) * tau));
                const vein = Math.exp(-line * 12), halo = Math.exp(-line * 3);
                const branch = Math.exp(-Math.abs(Math.sin((u * 5 - v * 2 + warp) * tau)) * 18);
                value = .98 + broad * .06 - vein * .25 - halo * .12 - branch * .08;
                elevation = .49 + noise(u, v, 16) * .02;
                finish += -.03 + halo * .09;
            } else if (material === 'wood') {
                const row = Math.floor(v * 4), along = wrap(u * 2 + (row % 2) * .5, 1);
                const seam = 1 - smooth(.008, .024, Math.min(wrap(v * 4, 1), 1 - wrap(v * 4, 1), along, 1 - along));
                const fibre = Math.sin((v * 76 + noise(u, v, 8, 3) * 1.3) * tau);
                value = .83 + hash(row, Math.floor(u * 2 + (row % 2) * .5) % 2, 2) * .17 + fibre * .025 - seam * .22;
                elevation = .55 - seam * .3 + fibre * .02;
                finish += -.04 + seam * .29 + fibre * .025;
            } else if (material === 'tile') {
                const tx = wrap(u * 4, 1), ty = wrap(v * 4, 1);
                const edge = Math.min(tx, 1 - tx, ty, 1 - ty), grout = 1 - smooth(.016, .035, edge);
                value = .94 + hash(Math.floor(u * 4), Math.floor(v * 4), 3) * .07 - grout * .22;
                elevation = .53 * smooth(.005, .048, edge);
                finish += -.07 + grout * .65 + broad * .07;
            }
            const index = y * size + x;
            for (let channel = 0; channel < 3; channel++) { color[index * 4 + channel] = Math.round(clamp(rgb[channel] * value, 0, 255)); }
            color[index * 4 + 3] = 255;
            height[index] = Math.round(clamp(elevation) * 255);
            roughness[index] = Math.round(clamp(finish) * 255);
        }
    }
    if (material === 'grass' || material === 'forest') { scatterFoliage({ size, color, height, roughness }, material, noise); }
    return { size, color, height, roughness };
}

/** Small blades / leaf litter are texture marks, never additional scene objects. */
function scatterFoliage(surface: GroundSurfacePixels, material: 'grass' | 'forest', noise: ReturnType<typeof createNoiseField>) {
    const { size, color, height } = surface, grass = material === 'grass';
    const count = grass ? 1200 : 850;
    for (let i = 0; i < count; i++) {
        const x = hash(i, 1) * size, y = hash(i, 2) * size;
        const angle = grass ? -1 + noise(x / size, y / size, 4, 8) * 2.5 + (hash(i, 3) - .5) * 1.7 : hash(i, 3) * tau;
        const length = (grass ? 6 : 3) + hash(i, 4) * (grass ? 16 : 6);
        const dx = Math.cos(angle) * length, dy = Math.sin(angle) * length, breadth = grass ? 1.1 : 1.8;
        const bright = hash(i, 5), tint = grass ? [104 + bright * 73, 133 + bright * 65, 62 + bright * 48] : [111 + bright * 69, 103 + bright * 45, 58 + bright * 33];
        for (let py = Math.floor(Math.min(y, y + dy) - breadth); py <= Math.ceil(Math.max(y, y + dy) + breadth); py++) {
            for (let px = Math.floor(Math.min(x, x + dx) - breadth); px <= Math.ceil(Math.max(x, x + dx) + breadth); px++) {
                const t = clamp(((px - x) * dx + (py - y) * dy) / (length * length));
                const distance = Math.hypot(px - x - dx * t, py - y - dy * t);
                const radius = breadth * (grass ? 1 - t * .8 : Math.sin(t * Math.PI));
                const alpha = clamp(radius + .4 - distance) * .85;
                if (!alpha) { continue; }
                const index = wrap(py, size) * size + wrap(px, size);
                for (let channel = 0; channel < 3; channel++) {
                    color[index * 4 + channel] = Math.round(color[index * 4 + channel] * (1 - alpha) + tint[channel] * alpha);
                }
                height[index] = Math.round(height[index] * (1 - alpha) + (145 + t * 35) * alpha);
            }
        }
    }
}
