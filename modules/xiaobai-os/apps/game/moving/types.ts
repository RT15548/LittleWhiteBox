export const ITEM_KINDS = ['cat', 'cup', 'plant', 'toast', 'duck', 'ufo', 'potion', 'star'] as const;
export type ItemKind = typeof ITEM_KINDS[number];
export type RoomTheme = 'weekend' | 'witch';
export type Point3 = readonly [number, number, number];
export interface MovingItem {
    readonly id: string;
    readonly kind: ItemKind;
    readonly position: Point3;
    readonly above: string | null;
}
export interface MovingLevel {
    readonly id: RoomTheme;
    readonly key: string;
    readonly seed: number;
    readonly items: readonly MovingItem[];
    readonly stacks: readonly (readonly string[])[];
}
export interface MovingState {
    readonly remaining: readonly string[];
    readonly tray: readonly string[];
}
export type MovingAction = { type: 'pick'; id: string };
export type MovingError = 'finished' | 'missing' | 'blocked';
export type MovingResult =
    | { ok: false; reason: MovingError }
    | { ok: true; state: MovingState; packed: readonly string[] };
