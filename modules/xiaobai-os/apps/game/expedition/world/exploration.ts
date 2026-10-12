import { RULES } from '../content.js';
import type { CourtyardFact, CourtyardScene, SceneDefinition, SceneExit, SceneObject, WorldCondition } from '../content/world-types.js';
import { direction, distance } from '../combat/geometry.js';
import type { Point } from '../types.js';
import { createWorldSpace, moveInWorld, worldLineClear } from './geometry.js';
import { type WorldSpace, worldFault } from './types.js';

export const INTERACTION_REACH = 2.4;
export interface WorldLocation { scene: CourtyardScene; position: Point; facing: number; visited: CourtyardScene[] }
export type Interaction = { kind: 'exit'; target: SceneExit; position: Point }
    | { kind: 'object'; target: SceneObject; position: Point };
export type WorldInteraction = { kind: 'travel'; location: WorldLocation }
    | { kind: 'object'; object: SceneObject };

export function conditionMet(condition: WorldCondition | undefined, facts: ReadonlySet<CourtyardFact>): boolean {
    return (!condition?.all || condition.all.every(f => facts.has(f))) && (!condition?.none || condition.none.every(f => !facts.has(f)));
}
const spaces = new WeakMap<SceneDefinition, Map<string, WorldSpace>>();
export function sceneSpace(scene: SceneDefinition, facts: ReadonlySet<CourtyardFact>): WorldSpace {
    const opened = scene.gates.filter(g => conditionMet(g.condition, facts)).map(g => g.id), key = opened.join('/');
    let cache = spaces.get(scene);
    if (!cache) { cache = new Map(); spaces.set(scene, cache); }
    let space = cache.get(key);
    if (!space) { space = createWorldSpace(scene.map, new Set(opened)); cache.set(key, space); }
    return space;
}
export function startWorld(scene: SceneDefinition, anchor: string): WorldLocation {
    const position = scene.anchors[anchor];
    if (!position) { worldFault('map_invalid'); }
    return { scene: scene.id, position: { ...position }, facing: -Math.PI / 2, visited: [scene.id] };
}
export function visibleInteractions(scene: SceneDefinition, facts: ReadonlySet<CourtyardFact>): Interaction[] {
    const exits: Interaction[] = scene.exits.filter(e => conditionMet(e.condition, facts))
        .map(target => ({ kind: 'exit', target, position: scene.anchors[target.anchor] }));
    const objects: Interaction[] = scene.objects.filter(o => conditionMet(o.condition, facts) && !(o.kind === 'switch' && facts.has(o.fact)))
        .map(target => ({ kind: 'object', target, position: scene.anchors[target.anchor] }));
    return [...exits, ...objects];
}
export function reachableInteractions(scene: SceneDefinition, location: WorldLocation, facts: ReadonlySet<CourtyardFact>): Interaction[] {
    const space = sceneSpace(scene, facts);
    return visibleInteractions(scene, facts).filter(item => distance(location.position, item.position) <= INTERACTION_REACH
        && worldLineClear(space, location.position, item.position))
        .sort((a, b) => distance(location.position, a.position) - distance(location.position, b.position) || a.target.id.localeCompare(b.target.id));
}
/** Input is a fixed world-space direction, not a client-claimed coordinate. */
export function walkWorld(location: WorldLocation, move: number, space: WorldSpace, speed = 1): void {
    if (!Number.isInteger(move) || move < 0 || move > 8) { worldFault('input_invalid'); }
    if (!move) { return; }
    location.facing = direction(move);
    moveInWorld(space, location.position, { x: Math.cos(location.facing) * RULES.speed * speed, y: Math.sin(location.facing) * RULES.speed * speed }, RULES.playerRadius);
}
/** The caller receives an intent only after position, line of sight and authored conditions agree. */
export function interactWorld(catalog: Readonly<Record<CourtyardScene, SceneDefinition>>, location: WorldLocation, facts: ReadonlySet<CourtyardFact>, id: string): WorldInteraction {
    const scene = catalog[location.scene];
    const item = visibleInteractions(scene, facts).find(i => i.target.id === id);
    if (!item) { worldFault('interaction_unavailable'); }
    if (!reachableInteractions(scene, location, facts).some(i => i.target.id === id)) { worldFault('out_of_reach'); }
    if (item.kind === 'object') { return { kind: 'object', object: item.target }; }
    const destination = catalog[item.target.to], position = destination.anchors[item.target.arrival];
    if (!position) { worldFault('map_invalid'); }
    const next = { scene: destination.id, position: { ...position }, facing: location.facing,
        visited: location.visited.includes(destination.id) ? [...location.visited] : [...location.visited, destination.id] };
    return { kind: 'travel', location: next };
}
