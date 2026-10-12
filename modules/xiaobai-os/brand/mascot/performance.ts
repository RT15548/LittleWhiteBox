import { type Group, type Object3D, type Vector3 } from 'three';

export const MASCOT_RUN_DURATION_MS = 1100;

/** Walking through an actual building route uses the same measured, bobbing gait. */
export function createMascotWalker(mascot: Group) {
    return {
        walk(points: readonly Vector3[], elapsed: number) {
            if (!points.length) { return false; }
            const progress = Math.max(0, elapsed / MASCOT_RUN_DURATION_MS), index = Math.min(points.length - 1, Math.floor(progress));
            const next = points[Math.min(index + 1, points.length - 1)], current = points[index];
            const t = Math.min(1, Math.max(0, (progress - index - .16) / .84));
            mascot.position.copy(current).lerp(next, t);
            mascot.position.y += Math.abs(Math.sin(t * Math.PI * 4)) * .045;
            mascot.rotation.y = Math.sign(next.x - current.x) * .4;
            return index < points.length - 1;
        },
    };
}

export type MascotPosture = 'reading' | 'reclining' | 'sleeping' | 'sipping' | 'looking';
/** A pose is applied from an anchor, never accumulated into the previous frame. */
export function createMascotPoses(mascot: Group) {
    return {
        pose(posture: MascotPosture, anchor: Vector3, elapsed: number, reduced = false) {
            const breath = reduced ? 0 : Math.sin(elapsed / 520) * .012;
            mascot.position.copy(anchor); mascot.rotation.set(0, 0, 0);
            if (posture === 'reading') { mascot.rotation.x = .20 + breath; }
            if (posture === 'reclining') { mascot.rotation.set(-.23, -.15, -.14 + breath); }
            if (posture === 'sleeping') { mascot.rotation.z = Math.PI / 2; }
            if (posture === 'sipping') { mascot.rotation.x = -.08 + breath; }
            if (posture === 'looking') { mascot.rotation.y = reduced ? .25 : Math.sin(elapsed / 850) * .3; }
            mascot.position.y += breath;
        },
        reset() { mascot.rotation.set(0, 0, 0); },
    };
}

/** Combat uses the same body, with a planted stance, running gait and a dash lean. */
export function createMascotFighter(mascot: Group) {
    return {
        pose(x: number, z: number, facing: number, tick: number, moving: boolean, dashing: boolean, reduced: boolean) {
            mascot.position.set(x, .48 + (moving && !reduced ? Math.abs(Math.sin(tick * .5)) * .075 : 0), z);
            mascot.rotation.set(dashing && !reduced ? .22 : 0, Math.PI / 2 - facing, moving && !reduced ? Math.sin(tick * .5) * .07 : 0);
        },
    };
}

// Motion belongs to the performer, not to the game that happens to host it.
export function createMascotPerformer(mascot: Group, home: Vector3) {
    return {
        rest(carried: Object3D) {
            mascot.position.copy(home);
            mascot.rotation.y = 0;
            carried.visible = false;
        },
        carry(progress: number, destinationX: number, carried: Object3D) {
            const walk = Math.max(0, (progress - .2) / .8);
            carried.visible = walk > 0 && walk < .92;
            mascot.position.x = home.x + walk * (destinationX - home.x);
            mascot.position.y = home.y + Math.abs(Math.sin(walk * 22)) * .1;
            mascot.rotation.y = .6;
        },
    };
}
