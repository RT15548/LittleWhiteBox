import type * as T from 'three';
import type { Activity, Item, WorkTask, Wound } from '../model.js';
import type { cleanliness } from '../hygiene.js';
import type { ContactPose } from './contact-pose.js';
import type { ConflictMotion } from './conflict-pose.js';

export type FabricAppearance = { wetness: number; cleanliness?: ReturnType<typeof cleanliness> };
export type WornGarment = Pick<Item, 'kind'> & FabricAppearance;
export type VisibleDressing = FabricAppearance & { wound: Wound };
export interface SurvivorVisual {
    root: T.Group;
    hand: T.Group;
    covering: T.Group;
    headAnchor: T.Object3D;
    contact: ContactPose;
    wetness(items: readonly WornGarment[]): void;
    dressings(items: readonly VisibleDressing[]): void;
    careAnchor(wound: Wound): T.Vector3;
    care(target: T.Vector3, phase: number, selfWound: Wound | null): void;
    // Runtime seconds come from the visual replay, never the survival clock.
    pose(phase: number, moving: boolean, activity: Activity['kind'] | null, work?: WorkTask['kind'] | null, conflict?: ConflictMotion | null): void;
    dispose(): void;
}
