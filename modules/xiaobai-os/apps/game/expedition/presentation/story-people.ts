import { MeshStandardMaterial, type Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { Point } from '../types.js';
import type { SceneDefinition } from '../content/world-types.js';
import { STORY_PEOPLE, STORY_PERSON_IDS } from '../content/inner-city/people.js';
import { residentModel } from './local-people.js';
import { LAND } from './world-palette.js';

/** Scene-local actors share the residents' baked skeleton and release every owned mesh on departure. */
export function buildStoryPeople(k: SceneKit, parent: Group, scene: SceneDefinition) {
    const material = new MeshStandardMaterial({ vertexColors: true, roughness: .9 });
    const people = STORY_PERSON_IDS.filter(id => STORY_PEOPLE[id].scene === scene.id).map(id => {
        const spec = STORY_PEOPLE[id], position = scene.anchors[spec.anchor];
        const model = residentModel(k, parent, { coat: spec.coat, activity: id === 'chenhe' ? 'mend' : id === 'chengtiesheng' ? 'repair' : 'keep' }, material);
        model.root.position.set(position.x, 0, position.y);
        const accessory = k.group(model.body);
        if (id === 'chengtiesheng') {
            k.mesh(accessory, 'box', LAND.brass, [.14, .35, .08], [.25, .7, .27]);
            k.mesh(accessory, 'box', LAND.timber, [.12, .13, .13], [.25, .96, .27]);
        } else if (id === 'qinzhi' || id === 'liangyoufang') {
            k.mesh(accessory, 'box', LAND.cloth, [.37, .04, .29], [0, .96, .36]);
        } else if (id === 'wenshoutong') {
            k.mesh(accessory, 'box', LAND.slate, [.56, .45, .36], [0, .62, 0]);
            k.mesh(accessory, 'cylinder', LAND.pottery, [.1, .15, .1], [.36, .92, .21]);
        }
        const release = k.bake(accessory), ring = k.ring(model.root, LAND.brass, .72, 0, 0, .5, true);
        let lastTime = 0;
        return { id, root: model.root, position,
            update(player: Point, now: number, reduced: boolean) {
                const dx = player.x - position.x, dy = player.y - position.y, near = Math.hypot(dx, dy) < 6;
                ring.visible = near;
                const angle = near ? Math.atan2(dx, dy) : Math.PI;
                const difference = Math.atan2(Math.sin(angle - model.root.rotation.y), Math.cos(angle - model.root.rotation.y));
                const changed = Math.abs(difference) > .005;
                model.root.rotation.y += reduced || !changed ? difference : difference * .22;
                const moving = !reduced && Math.hypot(dx, dy) < 22;
                if (moving || lastTime !== 0) {
                    lastTime = moving ? now : 0;
                    const breath = moving ? Math.sin(now / 1000 * 1.5) : 0;
                    model.body.position.y = breath * .014;
                    model.arms.forEach((arm, index) => { arm.rotation.x = -.35 + breath * .045 * (index ? -1 : 1); });
                }
                return moving || changed;
            },
            dispose() { release(); model.dispose(); },
        };
    });
    return { people, dispose() { people.forEach(person => person.dispose()); material.dispose(); } };
}
