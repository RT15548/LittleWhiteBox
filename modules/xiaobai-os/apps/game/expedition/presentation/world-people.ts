import type { Group } from 'three';
import type { CourtyardFact, CourtyardPerson } from '../content/world-types.js';
import type { SceneKit } from '../scene-kit.js';
import type { Point } from '../types.js';
import type { PersonLocation } from '../world/people.js';
import { hasReturned } from '../campaign/rescue.js';
import type { SanniangAsset } from './sanniang-asset.js';
import { sanniangPerson } from './sanniang-person.js';

/** Sanniang uses the authored asset; the remaining three actors retain their current presentation. */
export function person(k: SceneKit, root: Group, id: CourtyardPerson, x: number, z: number, facts: ReadonlySet<CourtyardFact>, sanniang: SanniangAsset, seated = true) {
    if (id === 'sanniang') { return sanniangPerson(k, root, sanniang, x, z, seated); }
    const arrived = hasReturned([...facts], id);
    const actor = k.group(root, [x, 0, z]), furniture = k.group(root), guard = id === 'laobai', worker = id === 'kouzi';
    actor.rotation.y = -.35;
    if (seated && (worker || id === 'anian')) { actor.position.y = -.3; }
    actor.scale.setScalar(guard ? 1.24 : worker ? 1.06 : id === 'anian' ? 1.19 : 1.12);
    const cloth = guard ? '#596a80' : worker ? '#53617a' : '#79647d', leather = '#615047', skin = '#dfbaa0';
    const shoulder = guard ? .39 : worker ? .25 : .29, waist = guard ? .31 : .23;
    const legs: Group[] = [];
    for (const side of [-1, 1]) {
        const leg = k.group(actor, [side * .16, .78, side > 0 ? .03 : -.04]); leg.rotation.x = seated && (worker || id === 'anian') ? -1.15 : side * .06; legs.push(leg);
        k.mesh(leg, 'cylinder', '#48545d', [.115, .61, .12], [0, -.28, 0]);
        k.mesh(leg, 'cylinder', leather, [.135, .37, .14], [0, -.53, 0]);
        k.mesh(leg, 'sphere', leather, [.14, .12, .23], [0, -.69, .08]);
    }
    k.mesh(actor, 'sphere', cloth, [shoulder, .46, .22], [0, 1.24, 0]);
    k.mesh(actor, 'cylinder', cloth, [waist, .34, .21], [0, .92, 0]);
    k.mesh(actor, 'cylinder', leather, [waist + .015, .08, .23], [0, 1.01, 0]);
    k.mesh(actor, 'box', '#c6aa72', [.13, .11, .03], [0, 1.01, .244]);
    k.mesh(actor, 'cylinder', skin, [.095, .2, .1], [0, 1.68, 0]);
    const head = k.group(actor, [0, 1.93, .025]); head.rotation.x = -.025;
    k.mesh(head, 'sphere', skin, [.215, .285, .22]);
    const hair = worker ? '#643d41' : id === 'anian' ? '#483b40' : '#30343e';
    k.mesh(head, 'sphere', hair, [.23, .18, .23], [0, .16, -.025]);
    for (const side of [-1, 1]) {
        k.mesh(head, 'sphere', hair, [.045, .17, .095], [side * .2, .02, -.03]);
        k.mesh(head, 'sphere', '#303b3b', [.026, .033, .013], [side * .083, .025, .216]);
        k.mesh(head, 'box', hair, [.069, .018, .016], [side * .086, .093, .219]);
        k.mesh(head, 'sphere', skin, [.036, .062, .045], [side * .212, -.025, 0]);
    }
    k.mesh(head, 'sphere', skin, [.035, .05, .045], [0, -.025, .223]);
    k.mesh(head, 'box', '#b47f70', [.06, .012, .014], [0, -.126, .194]);
    for (const side of [-1, 1]) {
        const arm = k.group(actor, [side * shoulder, 1.48, 0]); arm.rotation.z = side * .11;
        arm.rotation.x = side > 0 ? -.4 : -.1;
        k.mesh(arm, 'cylinder', cloth, [.11, .39, .12], [0, -.17, 0]);
        k.mesh(arm, 'cylinder', '#80969d', [.12, .14, .13], [0, -.39, 0]);
        k.mesh(arm, 'cylinder', skin, [.076, .22, .085], [0, -.51, 0]);
        k.mesh(arm, 'sphere', skin, [.09, .105, .075], [0, -.65, 0]);
    }
    if (guard) {
        k.mesh(actor, 'sphere', cloth, [.34, .35, .2], [0, 1.17, .1]);
        k.shape(actor, [[-.41, .34], [.41, .34], [.49, -.58], [.18, -.7], [-.35, -.57]], '#627a92', [0, 1.18, -.26], .025);
        k.mesh(actor, 'box', '#aeb7b6', [.44, .14, .11], [0, 1.62, .19]);
        const book = k.group(actor, [-.36, 1.1, .2]); book.rotation.z = -.18;
        k.mesh(book, 'box', '#7a624b', [.32, .42, .075]);
        k.mesh(book, 'box', '#e4dfcd', [.27, .36, .025], [0, 0, .047]);
        k.mesh(actor, 'cylinder', '#e4dfcd', [.13, .25, .14], [.16, .36, .06]);
    } else if (worker) {
        k.mesh(actor, 'cylinder', '#b48859', [.18, .17, .17], [0, 1.65, 0]);
        k.mesh(actor, 'box', '#b48859', [.17, .38, .04], [.08, 1.42, .24]);
        k.mesh(actor, 'cylinder', '#74869e', [.025, .48, .025], [-.36, .67, .18]);
        k.mesh(actor, 'box', '#74869e', [.13, .11, .055], [-.36, .92, .18]);
        if (arrived && seated) {
            actor.position.y = .5;
            const pipe = k.mesh(furniture, 'cylinder', '#849b95', [.24, 2.4, .24], [x, .72, z]); pipe.rotation.z = Math.PI / 2;
            for (const side of [-1, 1]) { k.mesh(furniture, 'box', '#637b7c', [.2, .7, .6], [x + side * .8, .35, z]); }
        }
        k.mesh(actor, 'box', '#e7dbc4', [.28, .22, .23], [.16, .53, .03]);
        k.mesh(actor, 'box', '#6f5540', [.24, .21, .15], [-.3, 1, .12]);
        if (facts.has('supplies_secured')) { k.mesh(actor, 'cylinder', '#8caaa7', [.035, .44, .035], [-.32, 1.11, .22]); }
        k.mesh(actor, 'box', '#6b5944', [.52, .43, .03], [0, 1.29, .24]);
    } else {
        k.mesh(actor, 'cone', cloth, [.36, 1.05, .28], [0, .67, 0]);
        k.mesh(head, 'sphere', hair, [.22, .48, .16], [0, -.26, -.17]);
        for (let i = 0; i < 3; i++) { const slip = k.mesh(actor, 'box', '#ded3b5', [.29, .34, .018], [-.12 + i * .02, 1.02, .31 + i * .023]); slip.rotation.z = i * .1; }
        const strap = k.mesh(actor, 'box', '#d8ba87', [.075, .83, .04], [0, 1.25, .22]); strap.rotation.z = -.55;
        k.mesh(actor, 'box', leather, [.42, .44, .21], [.21, .91, -.28]);
    }
    // The interaction ring belongs to ground space, never a seated/perched body transform.
    const ring = k.ring(root, '#e8c77b', .75, x, z, .8);
    head.removeFromParent();
    legs.forEach(leg => leg.removeFromParent());
    const disposeLegs = legs.map(leg => k.bake(leg));
    const disposeBody = k.bake(actor), disposeHead = k.bake(head), disposeFurniture = k.bake(furniture); actor.add(head, ...legs);
    const restingY = actor.position.y, restingAngle = actor.rotation.y;
    const position = { x, y: z }; let lastStep = -Infinity, facing = 0;
    return { root: actor, ring, id, position, seated,
        locate(state: PersonLocation, time: number) {
            const moved = position.x !== state.position.x || position.y !== state.position.y;
            if (moved) { lastStep = time; } facing = state.facing;
            position.x = state.position.x; position.y = state.position.y;
            actor.position.x = position.x; actor.position.z = position.y; ring.position.x = position.x; ring.position.z = position.y;
            return moved;
        },
        update(player: Point, time: number, reduced: boolean) {
            const walking = time - lastStep < 120;
            const near = Math.hypot(player.x - position.x, player.y - position.y) < 10;
            ring.visible = near;
            const aim = walking ? Math.PI / 2 - facing : near ? Math.atan2(player.x - position.x, player.y - position.y) : restingAngle;
            const delta = Math.atan2(Math.sin(aim - actor.rotation.y), Math.cos(aim - actor.rotation.y));
            actor.rotation.y += reduced ? delta : delta * .16;
            actor.position.y = restingY + (reduced ? 0 : Math.sin(time * .0015 + x) * .012);
            head.rotation.y = reduced ? 0 : Math.sin(time * .0008 + z) * .04;
            if (!seated) { legs.forEach((leg, i) => { leg.rotation.x = reduced || !walking ? 0 : Math.sin(time * .012 + i * Math.PI) * .45; }); }
        },
        dispose() { disposeBody(); disposeHead(); disposeFurniture(); disposeLegs.forEach(dispose => dispose()); actor.removeFromParent(); furniture.removeFromParent(); ring.removeFromParent(); },
    };
}
