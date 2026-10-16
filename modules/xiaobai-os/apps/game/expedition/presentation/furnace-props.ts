import type { Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { CourtyardFact, SceneDefinition } from '../content/world-types.js';
import { FURNACE_COLORS as C } from './furnace-models.js';

/** A small fact-driven layer; old visits dispose it with the rest of their scene. */
export function buildFurnaceProps(k: SceneKit, parent: Group, scene: SceneDefinition) {
    const root = k.group(parent);
    let key = '', release: (() => void) | null = null;
    const signals: CourtyardFact[] = ['division_tested', 'furnace_cargo_loaded', 'division_works_started', 'furnace_stilled', 'city_rekindled'];
    function setFacts(facts: ReadonlySet<CourtyardFact>) {
        const next = signals.map(fact => Number(facts.has(fact))).join('');
        if (next === key) { return; } key = next;
        release?.(); root.clear();
        if (scene.id === 'furnace_heart') {
            const hot = !facts.has('furnace_stilled');
            // Recessed heat channels frame the fighting floor; no extra obstacle, light or simulation.
            for (const side of [-1, 1]) {
                const x = side * 23;
                k.mesh(root, 'box', C.soot, [2.8, .07, 51], [x, .065, -5]);
                k.mesh(root, 'box', hot ? C.ember : C.iron, [1.9, .025, 50], [x, .112, -5], hot);
                for (let z = -29; z < 21; z += 1.6) {
                    k.mesh(root, 'box', C.iron, [2.8, .1, .55], [x, .19, z]);
                }
                for (const rail of [-1, 1]) { k.mesh(root, 'box', C.copper, [.12, .1, 51], [x + rail * 1.4, .17, -5]); }
            }
            for (const x of [-3.2, 3.2]) { k.mesh(root, 'box', C.soot, [.16, .025, 63], [x, .075, -3]); }
        }
        if (scene.id === 'old_kiln' || scene.id === 'furnace_heart') {
            const old = scene.id === 'old_kiln', p = scene.anchors[old ? 'trial' : 'shutdown'];
            const active = old ? facts.has('division_tested') : !facts.has('furnace_stilled');
            const wheel = k.group(root, [p.x + 2.1, 1.2, p.y - .7]);
            k.mesh(root, 'box', C.iron, [1.8, 1.1, .8], [p.x + 2.1, .55, p.y - .9]);
            k.mesh(wheel, 'torus', C.copper, [.65, .65, .24]); wheel.rotation.z = active ? -.7 : .7;
            k.mesh(wheel, 'box', C.edge, [1.1, .08, .09]);
            k.mesh(wheel, 'box', C.edge, [.08, 1.1, .09]);
            const furnace = scene.landscape.features.find(f => f.kind === 'kiln')!;
            const f = furnace.footprint;
            for (const side of [-1, 1]) {
                k.mesh(root, 'box', active ? C.ember : '#926c61', [f.width * .14, furnace.height! * .3, .06],
                    [f.x + side * f.width * .23, furnace.height! * .58, f.z + f.depth * .465], active);
            }
            if (old && facts.has('division_tested') && !facts.has('furnace_cargo_loaded')) {
                const load = scene.landscape.features.find(f => f.id === 'load-platform')!.footprint;
                k.mesh(root, 'cylinder', C.iron, [1.4, 1.8, 1.4], [load.x, 2.2, load.z]);
                for (const side of [-1, 1]) { k.mesh(root, 'box', C.copper, [.08, 2.3, 3], [load.x + side, 2, load.z]); }
            }
        }
        if (scene.id === 'south_street' && facts.has('division_works_started') && !facts.has('city_rekindled')) {
            for (let i = 0; i < 3; i++) { k.mesh(root, 'box', '#a48765', [1.2, .8, .8], [11 + i * 1.4, .4, 25]); }
        }
        if ((scene.id === 'camp' || scene.id === 'furnace_quarter') && facts.has('city_rekindled')) {
            const p = scene.anchors[scene.id === 'camp' ? 'rest' : 'charter'];
            for (const side of [-1, 1]) {
                const stove = k.group(root, [p.x + side * 3, 0, p.y - 2]);
                k.mesh(stove, 'cylinder', C.iron, [.7, 1.5, .7], [0, .75, 0]);
                k.mesh(stove, 'box', C.ember, [.6, .5, .035], [0, .65, .7], true);
                k.mesh(stove, 'cylinder', C.copper, [.12, 2.3, .12], [.4, 1.8, -.1]);
                for (let i = 0; i < 3; i++) { k.mesh(stove, 'box', C.soot, [.045, .5, .06], [(i - 1) * .19, .65, .74]); }
            }
        }
        release = k.bake(root);
    }
    return { setFacts, dispose() { release?.(); root.removeFromParent(); } };
}
