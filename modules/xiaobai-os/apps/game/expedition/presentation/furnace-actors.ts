import type { Group } from 'three';
import type { SceneKit } from '../scene-kit.js';

const IRON = '#45576a', EDGE = '#93a7ad', COPPER = '#bc835a', FIRE = '#ffd498';

export function sculptFurnaceActor(k: SceneKit, body: Group, head: Group, weapon: Group, kind: 'kilnheart' | 'furnacemaster' | 'coupler') {
    if (kind === 'coupler') {
        k.mesh(body, 'box', IRON, [1.5, .4, 1.5], [0, .2, 0]);
        k.mesh(body, 'cylinder', COPPER, [.5, 1.8, .5], [0, 1.2, 0]);
        k.mesh(head, 'rock', FIRE, [.32, .7, .32], [0, 1.6, 0], true);
        for (const side of [-1, 1]) { k.mesh(body, 'box', EDGE, [.15, 1.9, .2], [side * .6, 1.15, 0]); }
        k.mesh(body, 'torus', IRON, [.65, .65, .2], [0, 1.7, 0]).rotation.x = Math.PI / 2;
        return;
    }
    if (kind === 'kilnheart') {
        k.mesh(body, 'rock', '#5e738b', [1.25, .7, 1.2], [0, .55, 0]);
        k.mesh(head, 'rock', '#badfe4', [.72, 1.3, .6], [0, 1.9, .2]);
        k.mesh(head, 'rock', FIRE, [.25, .65, .17], [0, 1.95, .72], true);
        for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3, shard = k.group(weapon, [Math.sin(a) * 1.05, .8, Math.cos(a) * 1.05]);
            shard.rotation.z = Math.sin(a) * .5; shard.rotation.x = Math.cos(a) * .5;
            k.mesh(shard, 'rock', i % 2 ? '#90b9c9' : '#d5eced', [.24, 1.3 + i % 2 * .35, .24], [0, 1, 0]);
            k.mesh(body, 'cylinder', COPPER, [.13, .65, .13], [Math.sin(a) * .9, .5, Math.cos(a) * .9]);
        }
        return;
    }
    // A recognisable human inside an industrial carrying frame, not a magical giant.
    k.mesh(body, 'box', '#354459', [.85, 1.45, .65], [0, 2, .1]);
    k.mesh(body, 'box', '#d4c2a5', [.15, 1.1, .07], [.2, 2.12, .46]);
    k.mesh(head, 'sphere', '#c8a386', [.36, .46, .34], [0, 3.04, .18]);
    k.mesh(head, 'sphere', '#44424a', [.39, .19, .36], [0, 3.38, .16]);
    for (const side of [-1, 1]) {
        k.mesh(head, 'box', '#312f36', [.085, .038, .03], [side * .13, 3.08, .51]);
        k.mesh(body, 'box', IRON, [.65, 1.8, .8], [side * .9, 1.12, -.05]);
        k.mesh(body, 'box', EDGE, [.9, .32, 1.3], [side * .9, .2, .22]);
        k.mesh(body, 'cylinder', COPPER, [.12, 1.4, .12], [side * 1.25, 1.2, .1]);
        k.mesh(body, 'box', IRON, [.25, 2.9, .35], [side * .75, 2.3, -.58]);
        k.mesh(body, 'box', EDGE, [.65, .28, .9], [side * .85, 3.8, -.45]);
        k.mesh(body, 'cylinder', COPPER, [.37, 1.8, .37], [side * .48, 2.5, -.9]);
        k.mesh(body, 'rock', FIRE, [.16, .58, .12], [side * .48, 2.7, -1.22], true);
        const plate = k.group(body, [side * .68, 2.25, .46]); plate.name = side < 0 ? 'furnace-armor-left' : 'furnace-armor-right';
        k.mesh(plate, 'box', COPPER, [.65, 1.1, .14], [-side * .2, 0, 0]);
    }
    k.mesh(body, 'box', IRON, [1.8, .3, .35], [0, 3.84, -.58]);
    weapon.position.set(1.6, 2.3, .05);
    k.mesh(weapon, 'cylinder', EDGE, [.12, 2.8, .12]);
    k.mesh(weapon, 'box', IRON, [1.1, .9, 1.3], [0, -1.1, .18]);
    k.mesh(weapon, 'box', COPPER, [1.2, .18, 1.4], [0, -1.45, .18]);
}
