import type { LandscapeFeature } from '../world/landscape.js';

/** Authored dimensions are shared by rendering, movement and projectile collision. */
export const feature = (id: string, kind: LandscapeFeature['kind'], x: number, z: number, width: number, depth: number,
    extra: Pick<LandscapeFeature, 'height' | 'tint' | 'wallUse' | 'damaged'> = {}): LandscapeFeature => ({ id, kind, footprint: { x, z, width, depth }, ...extra });
