import type * as T from 'three';
import type { Activity, Item, WorkTask } from '../model.js';

export type WornGarment = Pick<Item, 'kind' | 'wetness'>;
export interface SurvivorVisual {
    root: T.Group;
    hand: T.Group;
    covering: T.Group;
    headAnchor: T.Object3D;
    wetness(items: readonly WornGarment[]): void;
    // Runtime seconds come from the visual replay, never the survival clock.
    pose(phase: number, moving: boolean, activity: Activity['kind'] | null, work?: WorkTask['kind'] | null): void;
    dispose(): void;
}
