import type { Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { CourtyardFact, SceneDefinition } from '../content/world-types.js';
import { COURTYARD_ENCOUNTERS } from '../content/courtyard-encounters.js';
import { PARLEY_ENEMIES } from '../content/parley.js';
import { PALETTES } from '../visuals.js';
import { createEnemyActor } from '../scene-actors.js';

/** Calm encounter actors survive resolution; combat owns its separate animated actors. */
export function buildSentries(kit: SceneKit, parent: Group, scene: SceneDefinition, initial: ReadonlySet<CourtyardFact>) {
    const group = kit.group(parent), encounter = COURTYARD_ENCOUNTERS[scene.id];
    const parley = Object.values(PARLEY_ENEMIES).find(spec => spec.scene === scene.id);
    let facts = initial, fighting = false;
    const actors = (encounter?.waves[0] ?? []).map(entry => {
        const actor = createEnemyActor(kit, group, entry.kind, PALETTES[0]); actor.bar.removeFromParent();
        const home = scene.anchors[entry.anchor], exit = parley?.sentryExits[entry.anchor as keyof typeof parley.sentryExits];
        const aside = exit ? scene.anchors[exit] : home;
        const position = initial.has(encounter!.complete) ? aside : home;
        actor.root.position.set(position.x, 0, position.y);
        return { ...actor, home, aside, dispose: kit.bake(actor.root) };
    });
    const visibility = () => { group.visible = !fighting && !!encounter && (!!parley || !facts.has(encounter.complete)); };
    visibility();
    return {
        setFacts(next: ReadonlySet<CourtyardFact>) { facts = next; visibility(); },
        setEncounterActive(active: boolean) { fighting = active; visibility(); },
        animate(reduced: boolean) {
            if (!group.visible) { return false; }
            let changed = false;
            for (const actor of actors) {
                const target = facts.has(encounter!.complete) ? actor.aside : actor.home;
                const dx = target.x - actor.root.position.x, dz = target.y - actor.root.position.z, distance = Math.hypot(dx, dz);
                if (distance < .001) { continue; }
                const step = reduced ? 1 : Math.min(1, .36 / distance);
                actor.root.position.x += dx * step; actor.root.position.z += dz * step;
                actor.root.rotation.y = distance > .4 ? Math.atan2(dx, dz) : 0;
                changed = true;
            }
            return changed;
        },
        dispose() { actors.forEach(actor => actor.dispose()); group.removeFromParent(); },
    };
}
