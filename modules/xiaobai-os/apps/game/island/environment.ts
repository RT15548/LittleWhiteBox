import type { BlueprintId, Journey, Point, Structure } from './model.js';
import { distance } from './space.js';
import { BLUEPRINTS } from './survival-content.js';
import { elevationAt } from './terrain.js';
import { TIDE } from './content.js';

export function terrainAt(p: Point): 'sand' | 'scrub' | 'reef' | 'mangrove' {
    if (p.x > 650) { return 'reef'; }
    if (p.y > 300) { return 'mangrove'; }
    return p.x < -660 ? 'sand' : 'scrub';
}
export function weatherAt(world: Pick<Journey, 'id' | 'clock'>) {
    let seed = 0;
    for (const char of world.id) { seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0; }
    const local = world.clock + 9 * 3600, period = 3 * 3600, slot = Math.floor(local / period);
    // Authored weather pacing: at most one 15–45 minute shower per three-hour window.
    // It is derived from journey identity and game time, so loading never redraws weather.
    const pattern = (Math.imul(slot + 1, 1103515245) ^ seed) >>> 0;
    const duration = 900 + (pattern >>> 4) % 1801, onset = (pattern >>> 10) % (period - duration);
    const within = local % period, rain = pattern % 5 < 2 && within >= onset && within < onset + duration;
    const hour = local / 3600 % 24, daylight = hour >= 6 && hour < 18;
    return { rain, daylight, hour, temperature: daylight ? rain ? 28 : 32 : 24,
        tide: (Math.sin(world.clock / TIDE.periodSeconds * Math.PI * 2) + 1) / 2 };
}
export function shelterAt(world: Journey, position: Point): boolean {
    return Object.values(world.structures).some(site => site.kind === 'shelter' && site.workLeft === 0
        && distance(site.position, position) <= BLUEPRINTS.shelter.radius);
}
export function buildingGround(position: Point): boolean {
    return terrainAt(position) !== 'reef' && terrainAt(position) !== 'mangrove' && elevationAt(position) > TIDE.highWater;
}
export function sitesConflict(a: { kind: BlueprintId; position: Point }, b: { kind: BlueprintId; position: Point }): boolean {
    // A canopy can cover a hearth, water collector or latrine. Two floor uses cannot overlap.
    if (a.kind !== b.kind && (a.kind === 'shelter' || b.kind === 'shelter') && a.kind !== 'signal' && b.kind !== 'signal') { return false; }
    return distance(a.position, b.position) < BLUEPRINTS[a.kind].radius + BLUEPRINTS[b.kind].radius;
}
export function fireAt(world: { structures: Record<string, Pick<Structure, 'kind' | 'workLeft' | 'burning' | 'fuelSeconds' | 'position'>> }, position: Point): boolean {
    return Object.values(world.structures).some(site => site.kind === 'firepit' && site.workLeft === 0 && site.burning && site.fuelSeconds > 0
        && distance(site.position, position) <= 3);
}
