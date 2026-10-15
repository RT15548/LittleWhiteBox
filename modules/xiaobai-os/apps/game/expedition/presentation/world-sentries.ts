import type { Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { CourtyardFact, SceneDefinition } from '../content/world-types.js';
import { COURTYARD_ENCOUNTERS, sceneEncounters, segmentComplete, type EncounterSegment } from '../content/courtyard-encounters.js';
import { PARLEY_ENEMIES } from '../content/parley.js';
import { PALETTES } from '../visuals.js';
import { createEnemyActor } from '../scene-actors.js';

/** Only the unresolved segment's sentries remain; narrative leaders use their separate persistent actors. */
export function buildSentries(kit: SceneKit, parent: Group, scene: SceneDefinition, initial: ReadonlySet<CourtyardFact>) {
    const group = kit.group(parent);
    const parley = Object.values(PARLEY_ENEMIES).find(spec => spec.scene === scene.id);
    let facts = initial, fighting = false, completed: readonly EncounterSegment[] = [];
    const actors = sceneEncounters(scene.id).flatMap(id => {
        const spec = COURTYARD_ENCOUNTERS[id];
        return spec.waves[0].filter((entry, index) => !parley || entry.kind !== parley.kind || index !== spec.waves[0].findIndex(e => e.kind === parley.kind)).map(entry => {
            const actor = createEnemyActor(kit, group, entry.kind, PALETTES[0]); actor.bar.removeFromParent();
            const home = scene.anchors[entry.anchor]; actor.root.position.set(home.x, 0, home.y);
            return { ...actor, id, dispose: kit.bake(actor.root) };
        });
    });
    const visibility = () => {
        let changed = false;
        for (const actor of actors) {
            const visible = !fighting && !segmentComplete(actor.id, facts, completed);
            if (actor.root.visible !== visible) { actor.root.visible = visible; changed = true; }
        }
        return changed;
    };
    visibility();
    return {
        setFacts(next: ReadonlySet<CourtyardFact>) { facts = next; visibility(); },
        setProgress(next: readonly EncounterSegment[]) { completed = next; return visibility(); },
        setEncounterActive(active: boolean) { fighting = active; visibility(); },
        animate(_reduced: boolean) { return false; },
        dispose() { actors.forEach(actor => actor.dispose()); group.removeFromParent(); },
    };
}
