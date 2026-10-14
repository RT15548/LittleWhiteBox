import type { Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { CourtyardFact, SceneDefinition } from '../content/world-types.js';
import { LAND } from './world-palette.js';

/** Scene-local movement derives from confirmed facts. Loading a used mechanism snaps to its final pose. */
export function buildCityProps(k: SceneKit, root: Group, scene: SceneDefinition, facts: ReadonlySet<CourtyardFact>) {
    const scenery = k.group(root), moving = k.group(root);
    const releases: (() => void)[] = [];
    const mechanisms: { fact: CourtyardFact; pose: (amount: number) => void; value: number; from: number; target: number; born: number | null }[] = [];
    function mechanism(fact: CourtyardFact, pose: (amount: number) => void) {
        const value = facts.has(fact) ? 1 : 0;
        mechanisms.push({ fact, pose, value, from: value, target: value, born: null }); pose(value);
    }
    if (scene.id === 'south_street') {
        const p = scene.anchors.stroll, rack = k.group(scenery, [p.x + 1.3, 0, p.y + 1]);
        for (const x of [-.7, .7]) { k.mesh(rack, 'cylinder', LAND.timber, [.055, 1.8, .055], [x, .9, 0]); }
        k.mesh(rack, 'box', LAND.wood, [1.6, .08, .08], [0, 1.6, 0]);
        for (const [i, color] of [LAND.brass, LAND.rose, LAND.slate].entries()) {
            const wheel = k.group(rack, [(i - 1) * .65, 1.6, .1]); wheel.rotation.z = i * .7;
            for (const angle of [0, Math.PI / 2]) {
                const blade = k.mesh(wheel, 'box', color, [.5, .13, .04], [0, 0, 0]); blade.rotation.z = angle;
            }
            k.mesh(wheel, 'sphere', LAND.brass, [.05, .05, .05], [0, 0, .045]);
        }
    }
    if (['pipe_gallery', 'deep_waterway', 'main_valve'].includes(scene.id)) {
        const deep = scene.id === 'deep_waterway', main = scene.id === 'main_valve';
        const p = scene.anchors[deep ? 'winch' : main ? 'valve' : 'trial'];
        const x = p.x + 2.8, z = p.y - .8;
        const model = k.group(scenery, [x, 0, z]);
        k.mesh(model, 'cylinder', LAND.slate, [.22, 1.3, .22], [0, .65, 0]);
        const wheel = k.group(moving, [x, 1.2, z + .25]);
        k.mesh(wheel, 'torus', LAND.brass, [.7, .7, .7]);
        for (const angle of [0, Math.PI / 2]) {
            const spoke = k.mesh(wheel, 'box', LAND.timber, [1.2, .085, .08]); spoke.rotation.z = angle;
        }
        releases.push(k.bake(wheel));
        const fact = deep ? 'deep_gate_opened' : main ? 'heat_restored' : 'return_flow_tested';
        mechanism(fact, amount => { wheel.rotation.z = amount * Math.PI * 1.3; });
        if (!deep) {
            k.mesh(model, 'disc', LAND.light, [.34, .34, 1], [0, 2.15, .12]);
            const needle = k.group(moving, [x, 2.15, z + .14]);
            k.mesh(needle, 'box', LAND.ember, [.035, .25, .025], [0, .09, 0]); releases.push(k.bake(needle));
            mechanism(fact, amount => { needle.rotation.z = 1.3 - amount * 1.8; });
        }
    }
    if (scene.id === 'deep_waterway') {
        const gate = scene.landscape.gates[0].footprint;
        // The moving leaf uses the same footprint as collision and map passage.
        const leaf = k.group(moving, [gate.x, 0, gate.z]);
        for (const side of [-1, 1]) { k.mesh(scenery, 'box', LAND.stone, [.6, 6.8, 1.2], [gate.x + side * gate.width / 2, 3.4, gate.z]); }
        k.mesh(scenery, 'box', LAND.stone, [gate.width + .6, .6, 1.2], [gate.x, 6.5, gate.z]);
        for (let x = -gate.width / 2 + .4; x < gate.width / 2; x += 1) { k.mesh(leaf, 'box', LAND.slate, [.12, 4.4, .16], [x, 2.2, 0]); }
        for (const y of [.3, 3.8]) { k.mesh(leaf, 'box', LAND.brass, [gate.width, .16, .25], [0, y, 0]); }
        releases.push(k.bake(leaf));
        mechanism('deep_gate_opened', amount => { leaf.position.y = amount * 4.5; });
    }
    releases.push(k.bake(scenery));
    return {
        get animating() { return mechanisms.some(item => item.value !== item.target); },
        setFacts(next: ReadonlySet<CourtyardFact>) {
            for (const item of mechanisms) {
                const target = next.has(item.fact) ? 1 : 0;
                if (target !== item.target) { item.from = item.value; item.target = target; item.born = null; }
            }
        },
        animate(now: number, reduced: boolean) {
            let changed = false;
            for (const item of mechanisms) {
                if (item.value === item.target) { continue; }
                item.born ??= now;
                const elapsed = reduced ? 1 : Math.min(1, (now - item.born) / 1100);
                const eased = elapsed * elapsed * (3 - 2 * elapsed);
                item.value = elapsed === 1 ? item.target : item.from + (item.target - item.from) * eased;
                item.pose(item.value); changed = true;
            }
            return changed;
        },
        dispose() { releases.forEach(release => release()); scenery.removeFromParent(); moving.removeFromParent(); },
    };
}
