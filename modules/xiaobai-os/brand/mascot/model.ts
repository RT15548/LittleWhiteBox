import { type Group, type Object3D } from 'three';
import { MASCOT_COLORS, MASCOT_PARTS } from './design.js';

type Point3 = [number, number, number];

interface MascotKit {
    group(parent: Object3D, position: Point3): Group;
    ball(parent: Object3D, size: Point3, color: string, position: Point3): unknown;
}

// Xiaobai is a real 3D model: the stills are projections of these same parts.
export function createMascot(kit: MascotKit, parent: Object3D, position: Point3): Group {
    const mascot = kit.group(parent, position);
    for (const part of MASCOT_PARTS) {
        kit.ball(mascot, [part.radius[0], part.radius[1], part.radius[2]], MASCOT_COLORS[part.color],
            [part.center[0], part.center[1], part.center[2]]);
    }
    return mascot;
}
