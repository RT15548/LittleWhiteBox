import type { Object3D } from 'three';
import type { MascotOutfit } from './outfit.js';

type Point = [number, number, number];
interface OutfitKit {
    ball(parent: Object3D, size: Point, color: string, position: Point): Object3D;
    box(parent: Object3D, size: Point, color: string, position: Point): Object3D;
}

/** Meshes belong to the scene's kit and inherit every walk/carry/rest pose from the original body. */
export function dressMascot(kit: OutfitKit, mascot: Object3D, outfit: MascotOutfit) {
    for (const part of outfit) {
        const piece = kit[part.shape](mascot, [...part.size], part.color, [...part.at]);
        piece.rotation.z = part.tilt ?? 0;
    }
}
