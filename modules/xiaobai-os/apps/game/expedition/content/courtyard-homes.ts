import { defineLandscapeScene } from '../world/landscape.js';
import { feature } from './landscape-content.js';
import { LIVING_SPACES } from './living-spaces.js';
import type { LivingScene, SceneDefinition } from './world-types.js';

export const COURTYARD_HOMES = Object.fromEntries(Object.entries(LIVING_SPACES).map(([id, room]) => {
    const { width, depth } = room, half = width / 2, end = depth / 2;
    const walls = [feature('west-wall', 'wall', -half + .5, 0, 1, depth, { height: 3.8, wallUse: 'room' }),
        feature('east-wall', 'wall', half - .5, 0, 1, depth, { height: 3.8, wallUse: 'room' })];
    for (const side of ['north', 'south'] as const) {
        const z = (side === 'north' ? -1 : 1) * (end - .5);
        if (room.doors.some(door => door.side === side)) {
            walls.push(feature(`${side}-door`, 'door', 0, z, 4, 1));
            for (const sign of [-1, 1]) { walls.push(feature(`${side}-${sign}`, 'wall', sign * (half + 2) / 2, z, half - 2, 1, { height: 3.8, wallUse: 'room' })); }
        } else { walls.push(feature(`${side}-wall`, 'wall', 0, z, width, 1, { height: 3.8, wallUse: 'room' })); }
    }
    const bed = id === 'guest_room' ? room.furniture.find(item => item.kind === 'bed')!.footprint : null;
    const anchors = { settle: { x: 0, y: 1 },
        ...(bed ? { rest: { x: bed.x + bed.width / 2 + 1, y: bed.z } } : {}),
        ...Object.fromEntries(room.doors.map(door => [door.side, { x: 0, y: (door.side === 'north' ? -1 : 1) * (end - 2) }])) };
    return [id, defineLandscapeScene({ id: id as LivingScene, safe: true, anchors,
        exits: room.doors.map(door => ({ id: door.side, anchor: door.side, to: door.to, arrival: door.arrival,
            doorway: true })),
        objects: bed ? [{ id: 'rest', anchor: 'rest', kind: 'rest' }] : [],
        landscape: { bounds: { x: 0, z: 0, width, depth }, vista: 'room', surface: 'boards', roads: [], gates: [], features: [...walls, ...room.furniture] },
    })];
})) as Record<LivingScene, SceneDefinition>;
