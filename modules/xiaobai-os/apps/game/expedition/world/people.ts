import type { Campaign } from '../campaign/types.js';
import type { CourtyardFact, CourtyardPerson, CourtyardScene, SceneExit, SceneDefinition } from '../content/world-types.js';
import { PERSON_IDS } from '../content/people.js';
import { DESTINATIONS, PERSON_PLACES, type DestinationId, type PersonPlace } from '../content/people-places.js';
import { COURTYARD } from '../content/courtyard.js';
import { COURTYARD_ENCOUNTERS, sceneEncounters } from '../content/courtyard-encounters.js';
import { conditionMet, INTERACTION_REACH, sceneSpace, type Interaction } from './exploration.js';
import { campaignWorldInteractions } from '../campaign/interactions.js';
import { findWorldPath } from './navigation.js';
import { cellCenter, moveInWorld, worldCell, worldLineClear } from './geometry.js';
import type { WorldSpace } from './types.js';
import type { Point } from '../types.js';
import { RULES } from '../content.js';
import { fault } from '../random.js';
import { livingSpace } from '../content/living-spaces.js';
import { rescuePhase } from '../campaign/rescue.js';

export interface PersonLocation { scene: CourtyardScene; position: Point; facing: number; mode: 'idle' | 'follow' | 'travel'; destination: DestinationId | null }
export type PeopleLocations = Record<CourtyardPerson, PersonLocation>;
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
// Cache only a deterministic cell-to-cell waypoint, never actor state. Replay and reload produce the same move.
const directions = new WeakMap<WorldSpace, Map<string, Point | null>>();
function nextWaypoint(space: WorldSpace, from: Point, target: Point): Point | null {
    if (worldLineClear(space, from, target, RULES.playerRadius)) { return target; }
    const a = worldCell(space.map, from), b = worldCell(space.map, target), key = `${a.column},${a.row}/${b.column},${b.row}`;
    let cache = directions.get(space); if (!cache) { cache = new Map(); directions.set(space, cache); }
    const center = cellCenter(space.map, a.column, a.row);
    if (!cache.has(key)) {
        const end = cellCenter(space.map, b.column, b.row), route = findWorldPath(space, center, end, RULES.playerRadius);
        if (cache.size >= 512) { cache.delete(cache.keys().next().value!); }
        cache.set(key, route?.find(point => distance(point, center) > .01) ?? null);
    }
    const point = cache.get(key);
    if (!point) { return null; }
    return worldLineClear(space, from, point, RULES.playerRadius) ? point : center;
}
export function personAt(place: PersonPlace): PersonLocation {
    return { scene: place.scene, position: { ...COURTYARD[place.scene].anchors[place.anchor] }, facing: 0, mode: 'idle', destination: null };
}
export function initialPeople(): PeopleLocations { return Object.fromEntries(PERSON_IDS.map(id => [id, personAt(PERSON_PLACES[id].initial)])) as PeopleLocations; }
export function sceneSafe(scene: CourtyardScene, facts: ReadonlySet<CourtyardFact>) {
    return sceneEncounters(scene).every(id => {
        const encounter = COURTYARD_ENCOUNTERS[id];
        return encounter.complete === null || facts.has(encounter.complete);
    });
}
/** Scene graph traversal uses exactly the same exits as player travel; solo travel excludes every hostile intermediate scene. */
export function sceneRoute(from: Pick<PersonLocation, 'scene' | 'position'>, to: PersonPlace, facts: ReadonlySet<CourtyardFact>, safeOnly: boolean): SceneExit[] | null {
    const queue: { scene: CourtyardScene; position: Point; route: SceneExit[] }[] = [{ ...from, route: [] }], visited = new Set<string>();
    while (queue.length) {
        const item = queue.shift()!;
        const scene = COURTYARD[item.scene], space = sceneSpace(scene, facts);
        if (item.scene === to.scene && nextWaypoint(space, item.position, scene.anchors[to.anchor])) { return item.route; }
        for (const exit of COURTYARD[item.scene].exits) {
            const key = `${exit.to}/${exit.arrival}`;
            if (visited.has(key) || !conditionMet(exit.condition, facts) || safeOnly && !sceneSafe(exit.to, facts)
                || !nextWaypoint(space, item.position, scene.anchors[exit.anchor])) { continue; }
            visited.add(key); queue.push({ scene: exit.to, position: COURTYARD[exit.to].anchors[exit.arrival], route: [...item.route, exit] });
        }
    }
    return null;
}
export function personMap(campaign: Campaign, person: CourtyardPerson) {
    const facts = new Set(campaign.facts), location = campaign.people[person];
    return Object.entries(DESTINATIONS).map(([id, place]) => {
        const route = sceneRoute(location, place, facts, false);
        const safe = sceneSafe(place.scene, facts);
        const soloRoute = sceneSafe(location.scene, facts) && safe ? sceneRoute(location, place, facts, true) : null;
        return { id: id as DestinationId, name: place.name,
        ...(livingSpace(place.scene) ? { use: livingSpace(place.scene)!.use } : {}),
        personHere: location.scene === place.scene && (id === place.scene || distance(location.position, COURTYARD[place.scene].anchors[place.anchor]) <= INTERACTION_REACH),
        playerHere: campaign.location.scene === place.scene && (id === place.scene || distance(campaign.location.position, COURTYARD[place.scene].anchors[place.anchor]) <= INTERACTION_REACH),
        accessible: route !== null, safe, solo: soloRoute !== null,
        route: soloRoute ?? route,
    }; });
}
export function personCanMove(campaign: Campaign, person: CourtyardPerson) { return rescuePhase(campaign.facts, person) !== 'confined'; }
const followDistance = (person: CourtyardPerson) => INTERACTION_REACH * (.7 + PERSON_IDS.indexOf(person) / PERSON_IDS.length * .2);
export function peopleNeedTick(campaign: Campaign) {
    return PERSON_IDS.some(id => campaign.people[id].mode === 'travel' || campaign.people[id].mode === 'follow'
        && distance(campaign.people[id].position, campaign.location.position) >= followDistance(id));
}
export function personInteractions(scene: CourtyardScene, people: PeopleLocations): Interaction[] {
    return PERSON_IDS.filter(id => people[id].scene === scene).map(id => ({ kind: 'object', position: people[id].position,
        target: { id, anchor: '', kind: 'person', person: id } }));
}
export function campaignInteractions(campaign: Campaign): Interaction[] {
    return [...campaignWorldInteractions(campaign), ...personInteractions(campaign.location.scene, campaign.people)];
}
export function reachablePeople(campaign: Campaign) {
    return reachablePersonInteractions(COURTYARD[campaign.location.scene], campaign.location.position, new Set(campaign.facts), campaign.people);
}
/** Cell bars block bodies, not voices. Only the captive conversation sight line ignores those bars, never solid walls. */
export function reachablePersonInteractions(scene: SceneDefinition, player: Point, facts: ReadonlySet<CourtyardFact>, people: PeopleLocations) {
    return personInteractions(scene.id, people).filter(item => {
        if (item.kind !== 'object' || item.target.kind !== 'person') { return false; }
        const acrossBars = scene.id === 'cells' && !!PERSON_PLACES[item.target.person].returnFact && !facts.has('captives_released');
        const space = sceneSpace(scene, acrossBars ? new Set([...facts, 'captives_released']) : facts);
        return distance(item.position, player) <= (acrossBars ? 5 : INTERACTION_REACH) && worldLineClear(space, player, item.position);
    });
}
export function movePerson(campaign: Campaign, person: CourtyardPerson, action: 'follow' | 'stay' | `go:${DestinationId}`) {
    if (!personCanMove(campaign, person)) { fault('unavailable'); }
    const state = campaign.people[person];
    if (action === 'follow') { state.mode = 'follow'; state.destination = null; }
    else if (action === 'stay') { state.mode = 'idle'; state.destination = null; }
    else {
        const id = action.slice(3) as DestinationId, place = personMap(campaign, person).find(p => p.id === id);
        if (!place?.accessible || !place.solo) { fault('unavailable'); }
        state.mode = 'travel'; state.destination = id;
    }
}
export function relocatePeople(campaign: Campaign) {
    for (const id of PERSON_IDS) {
        const state = campaign.people[id];
        if (state.mode === 'follow') { state.scene = campaign.location.scene; state.position = { ...campaign.location.position }; }
    }
}
/** Positions advance in fixed gameplay ticks. Pausing or backgrounding never runs a second movement clock. */
export function tickPeople(campaign: Campaign) {
    const facts = new Set(campaign.facts);
    for (const id of PERSON_IDS) {
        const state = campaign.people[id]; if (state.mode === 'idle') { continue; }
        const scene = COURTYARD[state.scene], space = sceneSpace(scene, facts);
        let target: Point, exit: SceneExit | undefined;
        if (state.mode === 'follow') {
            if (state.scene !== campaign.location.scene) { fault('invalid'); }
            target = campaign.location.position;
            if (distance(state.position, target) < followDistance(id)) { continue; }
        } else {
            const destination = DESTINATIONS[state.destination!], route = sceneRoute(state, destination, facts, true);
            if (!route) { fault('unavailable'); }
            exit = route[0]; target = scene.anchors[exit?.anchor ?? destination.anchor];
            if (distance(state.position, target) < .2) {
                if (exit) { state.scene = exit.to; state.position = { ...COURTYARD[exit.to].anchors[exit.arrival] }; }
                else { state.mode = 'idle'; state.destination = null; }
                continue;
            }
        }
        const point = nextWaypoint(space, state.position, target);
        if (!point) { fault('unavailable'); }
        const dx = point.x - state.position.x, dy = point.y - state.position.y, length = Math.hypot(dx, dy), speed = Math.min(length, RULES.speed * 1.8);
        if (!length) { continue; }
        state.facing = Math.atan2(dy, dx);
        moveInWorld(space, state.position, { x: dx / length * speed, y: dy / length * speed }, RULES.playerRadius);
    }
}
