import type { Group } from 'three';
import type { SceneKit } from './scene-kit.js';
import { CONTRACT_COLORS as C } from './visuals.js';

/** Articulated book. Presentation state lives and dies with the hero's equipment. */
export function createGrimoire(k: SceneKit, hand: Group) {
    const book = k.group(hand, [0, .15, .12]), covers: Group[] = [];
    book.rotation.set(-.45, 0, -.2);
    for (const side of [-1, 1]) {
        const cover = k.group(book);
        k.mesh(cover, 'box', C.cover, [.25, .055, .44], [side * .125, 0, 0]);
        k.mesh(cover, 'box', C.page, [.22, .06, .38], [side * .12, .04, 0]);
        covers.push(cover);
    }
    const page = k.group(book, [0, .085, 0]);
    k.mesh(page, 'box', '#fffced', [.22, .012, .37], [.11, 0, 0]);
    const rune = k.mesh(book, 'rock', C.empowered, [.07, .1, .07], [0, .3, 0], false, 1, true);
    const halo = k.mesh(book, 'torus', C.crest, [.17, .17, .17], [0, .31, 0], true, .65); halo.rotation.x = Math.PI / 2;
    let power = 0, lift = .15, lastTime = -1;
    return { update(active: boolean, casting: boolean, time: number, reduced: boolean) {
        const blend = reduced || lastTime < 0 || time < lastTime ? 1 : 1 - Math.exp(-Math.min(4, time - lastTime) * .5); lastTime = time;
        power += ((active ? 1 : 0) - power) * blend;
        lift += ((casting ? .5 : active ? .28 : .15) - lift) * blend;
        book.position.y = lift; book.rotation.x = -.45 + (lift - .15) * .7;
        covers[0].rotation.z = -.65 + power * .5; covers[1].rotation.z = .65 - power * .5;
        page.rotation.z = !reduced ? .2 + power * (Math.sin(time * .18) + 1) * 1.3 : .2;
        rune.scale.set(.07 + power * .025, .1 + power * .06, .07 + power * .025);
        halo.visible = active;
        if (!reduced) { rune.rotation.y = time * .08; }
    } };
}
