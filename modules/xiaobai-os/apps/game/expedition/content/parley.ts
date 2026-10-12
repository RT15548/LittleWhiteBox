import type { CourtyardFact, CourtyardScene } from './world-types.js';
import type { EnemyKind } from '../types.js';

interface ParleyDefinition {
    name: string; card: string; scene: CourtyardScene; intel: CourtyardFact; complete: CourtyardFact;
    persuaded: CourtyardFact; kind: EnemyKind; anchor: string; clearedAnchor: string; approachRadius: number;
    sentryExits: Record<string, string>;
}
/** Enemy-specific story and presentation, consumed by the one parley state machine. */
export const PARLEY_ENEMIES = {
    bajin: { name: '八斤', card: 'enemy-bajin', scene: 'gate', intel: 'bajin_intel', complete: 'patrol_cleared',
        persuaded: 'bajin_passed', kind: 'guard', anchor: 'parley', clearedAnchor: 'parley_side', approachRadius: 7,
        sentryExits: { guard: 'guard_side', archer: 'archer_side' } },
    changyounian: { name: '常有年', card: 'enemy-changyounian', scene: 'beacon', intel: 'changyounian_intel', complete: 'alarm_silenced',
        persuaded: 'changyounian_passed', kind: 'archer', anchor: 'parley', clearedAnchor: 'parley_side', approachRadius: 7,
        sentryExits: { guard: 'guard_side', archer: 'archer_side' } },
} as const satisfies Record<string, ParleyDefinition>;
export type ParleyEnemy = keyof typeof PARLEY_ENEMIES;
export const PARLEY_IDS = Object.keys(PARLEY_ENEMIES) as ParleyEnemy[];
