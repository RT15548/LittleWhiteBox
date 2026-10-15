import { BLUEPRINT_IDS, RECIPE_IDS, PERSON_IDS, type Declaration, type Operation, type PersonId, type Point, type WorkTask } from './model.js';
import { RULES } from './content.js';
import { fail } from './fault.js';
import { SURVIVAL } from './survival-content.js';

export function object(raw: unknown): Record<string, unknown> {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { fail('invalid'); }
    return raw as Record<string, unknown>;
}
export function shape(raw: unknown, keys: readonly string[]) {
    const value = object(raw);
    if (Object.keys(value).length !== keys.length || keys.some(k => !Object.hasOwn(value, k))) { fail('invalid'); }
    return value;
}
export function integer(raw: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
    if (typeof raw !== 'number' || !Number.isSafeInteger(raw) || raw < min || raw > max) { fail('invalid'); }
    return raw;
}
export function number(raw: unknown, min = 0, max = Number.MAX_VALUE): number {
    if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < min || raw > max) { fail('invalid'); }
    return raw;
}
export function boolean(raw: unknown): boolean { if (typeof raw !== 'boolean') { fail('invalid'); } return raw; }
export function member<T extends string>(raw: unknown, values: readonly T[]): T {
    if (typeof raw !== 'string' || !values.includes(raw as T)) { fail('invalid'); }
    return raw as T;
}
export function text(raw: unknown, max = RULES.maxSpeechCharacters as number): string {
    if (typeof raw !== 'string' || !raw.trim() || raw.length > max) { fail('invalid'); }
    return raw;
}
export function identifier(raw: unknown): string {
    if (typeof raw !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(raw)) { fail('identity'); }
    return raw;
}
export function list<T>(raw: unknown, parse: (value: unknown) => T): T[] {
    if (!Array.isArray(raw)) { fail('invalid'); }
    return raw.map(parse);
}
export function point(raw: unknown): Point {
    const p = shape(raw, ['x', 'y']);
    if (typeof p.x !== 'number' || typeof p.y !== 'number' || !Number.isFinite(p.x) || !Number.isFinite(p.y)) { fail('invalid'); }
    return { x: p.x, y: p.y };
}
export const person = (raw: unknown): PersonId => member(raw, PERSON_IDS);
export function declaration(raw: unknown): Declaration {
    const choice = object(raw);
    if (choice.kind === 'residence') { shape(choice, ['kind', 'position']); return { kind: 'residence', position: point(choice.position) }; }
    if (choice.kind === 'proposal') { shape(choice, ['kind']); return { kind: 'proposal' }; }
    if (choice.kind === 'response') {
        shape(choice, ['kind', 'proposal', 'stance']);
        return { kind: 'response', proposal: integer(choice.proposal, 1), stance: member(choice.stance, ['accept', 'decline']) };
    }
    if (choice.kind === 'relay') { shape(choice, ['kind', 'reference']); return { kind: 'relay', reference: integer(choice.reference, 1) }; }
    shape(choice, ['kind', 'person', 'stance']);
    return { kind: member(choice.kind, ['support']), person: person(choice.person), stance: member(choice.stance, ['with', 'against', 'neutral']) };
}
export function route(raw: unknown) {
    const points = list(raw, point);
    if (!points.length || points.length > RULES.maxRoutePoints) { fail('invalid'); }
    return points;
}
export function parseOperation(raw: unknown): Operation {
    const op = object(raw);
    switch (op.kind) {
        case 'say': case 'intend': shape(op, ['kind', 'text']); return { kind: op.kind, text: text(op.text) };
        case 'declare': shape(op, ['kind', 'text', 'choice']); return { kind: 'declare', text: text(op.text), choice: declaration(op.choice) };
        case 'travel': shape(op, ['kind', 'route']); return { kind: 'travel', route: route(op.route) };
        case 'drag': shape(op, ['kind', 'subject', 'route']); return { kind: 'drag', subject: person(op.subject), route: route(op.route) };
        case 'rest': shape(op, ['kind', 'seconds']); return { kind: 'rest', seconds: integer(op.seconds, 1, RULES.maxAdvanceSeconds) };
        case 'take': case 'drop': case 'wear': case 'unwear': shape(op, ['kind', 'item']); return { kind: op.kind, item: identifier(op.item) };
        case 'offer': shape(op, ['kind', 'item', 'to', 'units']); return { kind: 'offer', item: identifier(op.item), to: person(op.to), units: integer(op.units, 1, 100) };
        case 'accept': shape(op, ['kind', 'from']); return { kind: 'accept', from: person(op.from) };
        case 'work': shape(op, ['kind', 'task']); return { kind: 'work', task: parseWorkTask(op.task) };
        case 'construct': shape(op, ['kind', 'site']); return { kind: 'construct', site: identifier(op.site) };
        case 'cancel': shape(op, ['kind']); return { kind: 'cancel' };
        default: return fail('invalid');
    }
}

export function materials(raw: unknown) {
    const uses = list(raw, value => {
        const v = shape(value, ['item', 'units']);
        return { item: identifier(v.item), units: integer(v.units, 1, 100) };
    });
    if (!uses.length || uses.length > 100 || new Set(uses.map(v => v.item)).size !== uses.length) { fail('materials'); }
    return uses;
}
export function parseWorkTask(raw: unknown): WorkTask {
    const t = object(raw);
    switch (t.kind) {
        case 'gather': shape(t, ['kind', 'source', 'units']); return { kind: t.kind, source: identifier(t.source), units: integer(t.units, 1, 100) };
        case 'fill': shape(t, ['kind', 'source', 'container', 'millilitres']); return { kind: t.kind, source: identifier(t.source), container: identifier(t.container), millilitres: integer(t.millilitres, 1, 10000) };
        case 'pour': shape(t, ['kind', 'from', 'container', 'millilitres']); return { kind: t.kind, from: identifier(t.from), container: identifier(t.container), millilitres: integer(t.millilitres, 1, 10000) };
        case 'drink': case 'empty': shape(t, ['kind', 'container', 'millilitres']); return { kind: t.kind, container: identifier(t.container), millilitres: integer(t.millilitres, 1, 10000) };
        case 'wash': {
            shape(t, ['kind', 'supply', 'millilitres']); const supply = shape(t.supply, ['kind', 'id']);
            return { kind: 'wash', supply: { kind: member(supply.kind, ['container', 'source']), id: identifier(supply.id) }, millilitres: integer(t.millilitres, 1, 10000) };
        }
        case 'sip': shape(t, ['kind', 'source', 'millilitres']); return { kind: t.kind, source: identifier(t.source), millilitres: integer(t.millilitres, 1, SURVIVAL.maxSipMl) };
        case 'eat': shape(t, ['kind', 'item']); return { kind: t.kind, item: identifier(t.item) };
        case 'craft': shape(t, ['kind', 'recipe', 'materials']); return { kind: t.kind, recipe: member(t.recipe, RECIPE_IDS), materials: materials(t.materials) };
        case 'build': shape(t, ['kind', 'blueprint', 'materials']); return { kind: t.kind, blueprint: member(t.blueprint, BLUEPRINT_IDS), materials: materials(t.materials) };
        case 'relieve': shape(t, ['kind', 'waste']); return { kind: t.kind, waste: member(t.waste, ['urine', 'feces']) };
        case 'cover_waste': shape(t, ['kind', 'waste']); return { kind: t.kind, waste: identifier(t.waste) };
        case 'cover_body': shape(t, ['kind', 'subject', 'item']); return { kind: t.kind, subject: person(t.subject), item: identifier(t.item) };
        case 'ignite': shape(t, ['kind', 'site', 'tinder', 'drill']); return { kind: t.kind, site: identifier(t.site), tinder: identifier(t.tinder), drill: identifier(t.drill) };
        case 'fuel': shape(t, ['kind', 'site', 'materials']); return { kind: t.kind, site: identifier(t.site), materials: materials(t.materials) };
        case 'boil': shape(t, ['kind', 'site', 'container']); return { kind: t.kind, site: identifier(t.site), container: identifier(t.container) };
        default: return fail('invalid');
    }
}
