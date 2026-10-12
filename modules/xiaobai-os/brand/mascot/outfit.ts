/** Game-owned clothing, in the shared mascot's local coordinates. Ball sizes are radii; box sizes are full extents. */
export interface MascotOutfitPart {
    shape: 'ball' | 'box';
    size: readonly [number, number, number];
    at: readonly [number, number, number];
    color: string;
    tilt?: number;
}
export type MascotOutfit = readonly MascotOutfitPart[];
