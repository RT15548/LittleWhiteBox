import type { Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { Point } from '../types.js';
import type { PersonLocation } from '../world/people.js';
import type { SanniangAsset } from './sanniang-asset.js';

/** Presentation follows the same confirmed position used by dialogue and interactions. */
export function sanniangPerson(k: SceneKit, parent: Group, asset: SanniangAsset, x: number, z: number, seated: boolean) {
    const model = asset.create(), root = model.root, position = { x, y: z };
    parent.add(root); root.position.set(x, 0, z); root.rotation.y = .25;
    const ring = k.ring(parent, '#e8c77b', .75, x, z, .8);
    let distance = 0, lastStep = -Infinity, facing = 0, updated = -1;
    return { root, ring, id: 'sanniang' as const, position, seated,
        locate(state: PersonLocation, time: number) {
            const moved = Math.hypot(position.x - state.position.x, position.y - state.position.y);
            if (moved) { distance += moved; lastStep = time; }
            facing = state.facing; position.x = state.position.x; position.y = state.position.y;
            root.position.set(position.x, 0, position.y); ring.position.x = position.x; ring.position.z = position.y;
            return moved > 0;
        },
        update(player: Point, time: number, reduced: boolean) {
            const walking = time - lastStep < 120, near = Math.hypot(player.x - position.x, player.y - position.y) < 10;
            ring.visible = near;
            const aim = walking ? Math.PI / 2 - facing : near ? Math.atan2(player.x - position.x, player.y - position.y) : .25;
            const delta = Math.atan2(Math.sin(aim - root.rotation.y), Math.cos(aim - root.rotation.y));
            const elapsed = updated < 0 ? 0 : Math.min(.12, (time - updated) / 1000); updated = time;
            root.rotation.y += reduced ? delta : delta * (1 - Math.exp(-elapsed * 9));
            model.pose(time, distance, walking, reduced);
        },
        dispose() { model.dispose(); ring.removeFromParent(); },
    };
}
