import { PERSON_IDS, type Journey, type Landscape, type PersonId, type Point, type Polygon, type Structure } from './model.js';
import { RULES } from './content.js';
import { structureScreen } from './structure-shape.js';

export function distance(a: Point, b: Point): number { return Math.hypot(a.x - b.x, a.y - b.y); }
// Moving attached bodies can add sub-nanometre rounding to an exactly reachable gap.
// The same contact test serves simulation, save validation and operation controls.
export function withinReach(a: Point, b: Point): boolean { return distance(a, b) <= RULES.reachMetres + 1e-8; }
const cross = (a: Point, b: Point, c: Point) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
function onSegment(a: Point, b: Point, p: Point) {
    return Math.abs(cross(a, b, p)) < 1e-8 && p.x >= Math.min(a.x, b.x) && p.x <= Math.max(a.x, b.x)
        && p.y >= Math.min(a.y, b.y) && p.y <= Math.max(a.y, b.y);
}
function intersects(a: Point, b: Point, c: Point, d: Point) {
    return cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0
        || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b);
}
export function inside(point: Point, polygon: Polygon): boolean {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i], b = polygon[j];
        if (onSegment(a, b, point)) { return true; }
        if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) { result = !result; }
    }
    return result;
}
function touches(a: Point, b: Point, polygon: Polygon) {
    return inside(a, polygon) || inside(b, polygon) || polygon.some((p, i) => intersects(a, b, p, polygon[(i + 1) % polygon.length]));
}
export function canStand(point: Point, land: Landscape): boolean {
    return inside(point, land.land) && !land.obstacles.some(p => inside(point, p));
}
export function canTravel(a: Point, b: Point, land: Landscape): boolean {
    if (!canStand(a, land) || !canStand(b, land) || land.obstacles.some(p => touches(a, b, p))) { return false; }
    const dx = b.x - a.x, dy = b.y - a.y, lengthSquared = dx * dx + dy * dy;
    if (!lengthSquared) { return true; }
    // Test every interval separated by coastline intersections, including vertices
    // and collinear edges. Endpoints alone miss water across a concave inlet.
    const boundaries = [0, 1];
    for (let i = 0; i < land.land.length; i++) {
        const p = land.land[i], q = land.land[(i + 1) % land.land.length];
        const ex = q.x - p.x, ey = q.y - p.y, denominator = dx * ey - dy * ex;
        if (Math.abs(denominator) < 1e-8) {
            if (Math.abs(cross(a, b, p)) < 1e-8) {
                for (const endpoint of [p, q]) {
                    const t = ((endpoint.x - a.x) * dx + (endpoint.y - a.y) * dy) / lengthSquared;
                    if (t > 0 && t < 1) { boundaries.push(t); }
                }
            }
        } else {
            const t = ((p.x - a.x) * ey - (p.y - a.y) * ex) / denominator;
            const u = ((p.x - a.x) * dy - (p.y - a.y) * dx) / denominator;
            if (t > 0 && t < 1 && u >= 0 && u <= 1) { boundaries.push(t); }
        }
    }
    boundaries.sort((left, right) => left - right);
    return boundaries.slice(1).every((end, i) => {
        const t = (boundaries[i] + end) / 2;
        return inside({ x: a.x + dx * t, y: a.y + dy * t }, land.land);
    });
}
export function perceives(world: Journey, observer: PersonId, point: Point, sense: 'sight' | 'sound', land: Landscape): boolean {
    return perception(world, observer, point, sense, land);
}
// A screen's own surface is visible from either side; its occupant is not.
export function perceivesStructure(world: Journey, observer: PersonId, site: Structure, land: Landscape): boolean {
    return perception(world, observer, site.position, 'sight', land, site);
}
function perception(world: Journey, observer: PersonId, point: Point, sense: 'sight' | 'sound', land: Landscape, surface?: Structure): boolean {
    const person = world.people[observer];
    if (person.body.kind === 'dead') { return false; }
    const screens = sense === 'sight' ? land.sightScreens : land.soundScreens;
    const range = sense === 'sight' ? RULES.sightMetres : RULES.hearingMetres;
    // Nearby personal space stays readable even inside a foliage footprint.
    const separation = distance(person.position, point);
    if (separation > range || !withinReach(person.position, point) && screens.some(p => touches(person.position, point, p))) { return false; }
    return sense !== 'sight' || !Object.values(world.structures).some(site => {
        if (site === surface) { return false; }
        const screen = structureScreen(site);
        return screen !== null && !onSegment(screen[0], screen[1], point) && !onSegment(screen[0], screen[1], person.position)
            && intersects(person.position, point, screen[0], screen[1]);
    });
}
export function witnesses(world: Journey, point: Point, sense: 'sight' | 'sound', land: Landscape): PersonId[] {
    return PERSON_IDS.filter(id => perceives(world, id, point, sense, land));
}
export function itemPosition(world: Journey, item: string): Point | null {
    const location = Object.hasOwn(world.items, item) && world.items[item].quantity > 0 ? world.items[item].location : null;
    return !location ? null : location.kind === 'ground' ? location.position : world.people[location.person].position;
}
