import type { LocalResident } from '../content/local-life.js';
import type { Point } from '../types.js';

const WALK_SPEED = .85;
export interface LocalPose { position: Point; facing: number; walking: boolean }

/** Closed authored routes. No pathfinder, game tick, random seed or campaign mutation. */
export function localPose(resident: LocalResident, seconds: number): LocalPose {
    const route = resident.route;
    if (route.length === 1) { return { position: route[0].position, facing: route[0].facing, walking: false }; }
    const durations = route.map((stop, i) => {
        const next = route[(i + 1) % route.length].position;
        return stop.wait + Math.hypot(next.x - stop.position.x, next.y - stop.position.y) / WALK_SPEED;
    });
    let at = (seconds + resident.phase) % durations.reduce((sum, duration) => sum + duration, 0);
    for (let i = 0; i < route.length; i++) {
        if (at > durations[i]) { at -= durations[i]; continue; }
        const stop = route[i], next = route[(i + 1) % route.length].position;
        if (at <= stop.wait) { return { position: stop.position, facing: stop.facing, walking: false }; }
        const fraction = (at - stop.wait) / (durations[i] - stop.wait);
        return { position: { x: stop.position.x + (next.x - stop.position.x) * fraction, y: stop.position.y + (next.y - stop.position.y) * fraction },
            facing: Math.atan2(next.x - stop.position.x, next.y - stop.position.y), walking: true };
    }
    throw new Error('expedition_local_route_invalid');
}

/** Pause/offscreen frames never catch up elapsed wall time. */
export function localElapsed(previous: number | null, now: number) {
    return previous === null ? 0 : Math.min(.1, Math.max(0, (now - previous) / 1000));
}
