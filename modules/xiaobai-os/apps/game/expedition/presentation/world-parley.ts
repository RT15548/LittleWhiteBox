import type { Group } from 'three';
import { PARLEY_ENEMIES, type ParleyEnemy } from '../content/parley.js';
import type { CourtyardFact } from '../content/world-types.js';
import type { SceneKit } from '../scene-kit.js';
import { createEnemyActor } from '../scene-actors.js';
import { PALETTES } from '../visuals.js';
import { parleyPosition } from '../campaign/parley.js';
import type { Point } from '../types.js';

export function parleyActor(kit: SceneKit, parent: Group, id: ParleyEnemy, facts: ReadonlySet<CourtyardFact>) {
    const spec = PARLEY_ENEMIES[id], actor = createEnemyActor(kit, parent, spec.kind, PALETTES[0]);
    actor.bar.removeFromParent();
    const dispose = kit.bake(actor.root), position = { ...parleyPosition(id, facts) };
    actor.root.position.set(position.x, 0, position.y);
    let currentFacts = facts;
    return { id, root: actor.root, position,
        setFacts(next: ReadonlySet<CourtyardFact>) { currentFacts = next; },
        update(player: Point, reduced: boolean) {
            const base = parleyPosition(id, currentFacts), dx = player.x - base.x, dy = player.y - base.y, distance = Math.hypot(dx, dy);
            const near = distance <= spec.approachRadius;
            const step = near && !currentFacts.has(spec.complete) ? 1 : 0;
            const x = base.x + (distance ? dx / distance * step : 0), y = base.y + (distance ? dy / distance * step : 0);
            const before = position.x + position.y + actor.root.rotation.y;
            position.x += reduced ? x - position.x : (x - position.x) * .22;
            position.y += reduced ? y - position.y : (y - position.y) * .22;
            if (Math.abs(x - position.x) + Math.abs(y - position.y) < .01) { position.x = x; position.y = y; }
            const aim = near ? Math.atan2(dx, dy) : 0;
            const angle = Math.atan2(Math.sin(aim - actor.root.rotation.y), Math.cos(aim - actor.root.rotation.y));
            actor.root.rotation.y += reduced || Math.abs(angle) < .005 ? angle : angle * .2;
            actor.root.position.set(position.x, 0, position.y);
            return before !== position.x + position.y + actor.root.rotation.y;
        },
        dispose() { dispose(); actor.root.removeFromParent(); },
    };
}
