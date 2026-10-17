import type { Journey, Landscape, Point } from './model.js';
import { canTravel } from './space.js';
import { operate } from './operations.js';

// Held-direction movement. The target always lies further ahead than one second of walking, so the
// ordinary travel tick spends the whole second walking and the route is re-aimed on the next one.
const LEAD_METRES = 3;

/**
 * Re-aims the player's walk along `direction` (a world-space unit vector). Free movement leaves no
 * experience of its own: only interrupting a real activity is recorded. Returns the world to continue
 * with, which is `source` itself unless an interruption produced a new one.
 */
export function steerPlayer(source: Journey, land: Landscape, direction: Point): Journey {
    if (source.people.player.body.kind !== 'living') { return source; }
    let world = source;
    if (world.people.player.activity && world.people.player.activity.kind !== 'travel') {
        world = operate(world, { kind: 'player' }, 'player', { kind: 'cancel' }, land);
    }
    const person = world.people.player, from = person.position;
    // Sliding along a shore or screen: try the full heading, then each axis on its own.
    const headings = [direction, { x: Math.sign(direction.x), y: 0 }, { x: 0, y: Math.sign(direction.y) }].filter(h => h.x || h.y);
    const target = headings.map(h => { const length = Math.hypot(h.x, h.y); return { x: from.x + h.x / length * LEAD_METRES, y: from.y + h.y / length * LEAD_METRES }; })
        .find(point => canTravel(from, point, land));
    person.activity = target ? { kind: 'travel', route: [target] } : null;
    return world;
}
