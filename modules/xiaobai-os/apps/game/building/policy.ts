export const BUILDING_POLICY = { fee: 50, habitableAward: 50, collectionSize: 6, seedAttempts: 64, maxParts: 40, maxWidth: 6, maxDepth: 3 } as const;
export const TIERS = ['courtyard', 'duplex', 'terrace', 'sunroom'] as const;
export type Tier = typeof TIERS[number];
export const TIER_RULES = {
    courtyard: { floors: 1, living: 2, materials: 7, award: 100 },
    duplex: { floors: 2, living: 4, materials: 9, award: 140 },
    terrace: { floors: 3, living: 5, materials: 11, award: 200 },
    sunroom: { floors: 2, living: 2, materials: 12, award: 140 },
} as const;
export const PROJECT_TIER: Tier = 'sunroom';
export const PROJECT_WISH_TARGET = 2;
export const PARTS = {
    hall: { width: 1, cost: 0 }, entry: { width: 1, cost: 0 },
    room: { width: 1, cost: 1 }, study: { width: 1, cost: 2 }, wide: { width: 2, cost: 2 },
    terrace: { width: 1, cost: 1 }, garden: { width: 1, cost: 1 }, path: { width: 1, cost: 0 }, roof: { width: 1, cost: 0 },
} as const;
export type PartKind = keyof typeof PARTS;
export interface Part { kind: PartKind; x: number; y: number; z: number }
export const ROOM_CHOICES = ['room', 'wide', 'study', 'garden', 'path', 'terrace'] as const;
export type RoomChoice = typeof ROOM_CHOICES[number];
export type Room = Part & { kind: RoomChoice | 'hall' };
export interface Blueprint { seed: number; tier: Tier; width: number; depth: number; entryZ: number; floors: number; heights: number[]; entrance: number; living: number; gardenSide: -1 | 1; terraces: number; materials: number; sunSide: -1 | 1 }
export type Site = Omit<Blueprint, 'seed' | 'tier'>;
export function siteCells(brief: Blueprint) { return brief.heights.flatMap((height, i) => Array.from({ length: height }, (_, y) => ({ x: i % brief.width, y, z: Math.floor(i / brief.width) }))); }
export function columnHeight(brief: Blueprint, x: number, z: number) { return brief.heights[z * brief.width + x]; }
export const CELL = { width: 1.3, height: 1.12, depth: 1.15 } as const;
export function residential(kind: PartKind) { return kind === 'room' || kind === 'wide' || kind === 'study'; }
export function solid(kind: PartKind) { return kind === 'entry' || kind === 'hall' || residential(kind); }
export function partKey(part: Pick<Part, 'x' | 'y' | 'z'>) { return `${part.x}:${part.y}:${part.z}`; }
export function cells(part: Part) { return Array.from({ length: PARTS[part.kind].width }, (_, i) => ({ x: part.x + i, y: part.y, z: part.z })); }
