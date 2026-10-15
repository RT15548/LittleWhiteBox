import { Mesh, type Group } from 'three';
import type { Traveler } from './campaign/traveler.js';
import { OUTFITS } from './outfits.js';
import type { SceneKit } from './scene-kit.js';
import type { Outfit } from './types.js';

/** Expedition owns this human silhouette. Other games retain their own mascot and animation. */
export function createTraveler(k: SceneKit, parent: Group, gender: Traveler['gender']) {
    const body = k.group(parent, [0, 1.3, 0]); body.scale.setScalar(1.5);
    const torso = k.group(body), head = k.group(body, [0, .5, 0]), hair = k.group(head);
    const female = gender === 'female', shoulder = female ? .225 : .255;
    const fabric = OUTFITS.traveler.fabric, leather = '#574a40', skin = '#d7ab8b', hairColor = '#463f3b';
    k.mesh(torso, 'sphere', fabric, [shoulder, .28, .155], [0, -.04, 0]);
    k.mesh(torso, 'cylinder', fabric, [female ? .165 : .185, .24, .16], [0, -.25, 0]);
    k.mesh(torso, 'cylinder', leather, [.196, .06, .175], [0, -.24, 0]);
    k.mesh(torso, 'box', '#d5b77b', [.07, .067, .025], [0, -.24, .178]);
    k.mesh(torso, 'cylinder', skin, [.066, .16, .07], [0, .265, 0]);
    k.mesh(head, 'sphere', skin, [female ? .161 : .172, .22, .165]);
    k.mesh(hair, 'sphere', hairColor, [.18, .125, .173], [0, .135, -.022]);
    for (const side of [-1, 1]) {
        k.mesh(head, 'sphere', skin, [.027, .042, .027], [side * .166, -.01, 0]);
        k.mesh(head, 'sphere', '#303b3b', [.019, .023, .012], [side * .061, .016, .155]);
        k.mesh(head, 'box', hairColor, [.047, .012, .014], [side * .064, .062, .154]);
        k.mesh(hair, 'sphere', hairColor, [.035, .12, .08], [side * .157, .035, -.036]);
    }
    k.mesh(head, 'sphere', skin, [.027, .041, .028], [0, -.025, .16]);
    k.mesh(head, 'box', '#a86e60', [.045, .009, .012], [0, -.1, .148]);
    if (female) {
        const braid = k.group(hair, [0, .06, -.17]);
        for (let i = 0; i < 4; i++) { k.mesh(braid, 'sphere', hairColor, [.064 - i * .009, .09, .063 - i * .008], [i % 2 ? .014 : -.014, -i * .115, 0]); }
        k.mesh(braid, 'box', fabric, [.066, .032, .066], [0, -.33, 0]);
    }
    const arms: Group[] = [], legs: Group[] = [];
    for (const side of [-1, 1]) {
        const arm = k.group(body, [side * shoulder, .12, 0]); arms.push(arm);
        k.mesh(arm, 'cylinder', fabric, [.076, .27, .078], [0, -.12, 0]);
        k.mesh(arm, 'cylinder', '#e5dfcd', [.081, .085, .081], [0, -.27, 0]);
        k.mesh(arm, 'cylinder', skin, [.052, .14, .057], [0, -.36, .008]);
        k.mesh(arm, 'sphere', skin, [.06, .075, .047], [0, -.45, .015]);
        const leg = k.group(body, [side * .105, -.32, 0]); legs.push(leg);
        k.mesh(leg, 'cylinder', '#434e55', [.078, .35, .085], [0, -.15, 0]);
        k.mesh(leg, 'cylinder', leather, [.085, .23, .091], [0, -.39, 0]);
        k.mesh(leg, 'sphere', leather, [.089, .066, .155], [0, -.485, .056]);
    }
    // Keep only articulation boundaries; static details are batched by material.
    hair.removeFromParent();
    const disposeParts = [torso, head, hair, ...arms, ...legs].map(part => k.bake(part)); head.add(hair);
    const clothMeshes: Mesh[] = [];
    body.traverse(object => { if (object instanceof Mesh && object.material === k.material(fabric)) { clothMeshes.push(object); } });
    let outfit: Outfit | null = null;
    return {
        body, hand: k.group(arms[1], [0, -.45, .015]),
        dress(id: Outfit) {
            if (id === outfit) { return; }
            outfit = id;
            for (const mesh of clothMeshes) { mesh.material = k.material(OUTFITS[id].fabric); }
            hair.visible = !['helm', 'hat', 'hood'].includes(OUTFITS[id].head);
        },
        pose(facing: number, stride: number, lift: number, dash: boolean, reduced: boolean, attacking: boolean) {
            body.position.y = 1.3 + lift;
            body.rotation.set(!reduced && dash ? .16 : 0, Math.PI / 2 - facing, 0);
            legs.forEach((leg, i) => { leg.rotation.x = (i ? -1 : 1) * stride; });
            arms.forEach((arm, i) => { arm.rotation.set(i && attacking ? -.55 : (i ? 1 : -1) * stride * .65, 0, (i ? -1 : 1) * .1); });
        },
        dispose() { disposeParts.forEach(dispose => dispose()); body.removeFromParent(); },
    };
}
