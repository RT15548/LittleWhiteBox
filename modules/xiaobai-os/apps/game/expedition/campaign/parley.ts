import type { Campaign } from './types.js';
import { PARLEY_ENEMIES, PARLEY_IDS, type ParleyEnemy } from '../content/parley.js';
import { COURTYARD } from '../content/courtyard.js';
import type { CourtyardFact, CourtyardScene } from '../content/world-types.js';
import type { Interaction } from '../world/exploration.js';
import type { Point } from '../types.js';

export type ParleyDecision = 'pass' | 'attack';
export interface PendingParley { enemy: ParleyEnemy; decision: ParleyDecision }
export function parleyPosition(id: ParleyEnemy, facts: ReadonlySet<CourtyardFact>) {
    const spec = PARLEY_ENEMIES[id], scene = COURTYARD[spec.scene];
    return scene.anchors[facts.has(spec.complete) ? spec.clearedAnchor : spec.anchor];
}
export function parleyInteractions(scene: CourtyardScene, position: Point, facts: ReadonlySet<CourtyardFact>): Interaction[] {
    return PARLEY_IDS.filter(id => PARLEY_ENEMIES[id].scene === scene).flatMap(id => {
        const p = parleyPosition(id, facts), spec = PARLEY_ENEMIES[id];
        return Math.hypot(position.x - p.x, position.y - p.y) <= spec.approachRadius
            ? [{ kind: 'object', target: { id, anchor: '', kind: 'enemy', enemy: id }, position: p }] : [];
    });
}
export function canParley(campaign: Campaign, enemy: ParleyEnemy) {
    return campaign.phase === 'exploration' && !campaign.pendingParley && parleyInteractions(campaign.location.scene, campaign.location.position, new Set(campaign.facts))
        .some(item => item.target.id === enemy);
}
