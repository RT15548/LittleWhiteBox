import type { PartitionRegistration } from '../../../kernel/contracts.js';
import { BLUEPRINT_IDS, RESOURCE_KINDS, DEATH_CAUSES, ISLAND_FORMAT_VERSION, ITEM_KINDS, NEED_KINDS, PERSON_IDS, CONTACT_FORMS, STRIKE_FORMS, type Experience, type IslandData, type Journey } from './model.js';
import { LANDSCAPE } from './content.js';
import { canTravel } from './space.js';
import { emptyIsland } from './world.js';
import { fail } from './fault.js';
import { boolean, declaration, identifier, integer, list, member, object, person, route, shape, text, parseWorkTask, wound, treatment } from './validation.js';
import { needs, stand, validateObjects, workReferences, treatmentReferences } from './state-validation.js';
import { WORK_NAMES } from './survival-content.js';
import { cooperationHistory } from './cooperation.js';
import { canOffer } from './handoff.js';
import { dragRoute } from './remains.js';
import { parsePlayerIdentity } from './identity.js';
import { careReach, requireCareConsent } from './care.js';
import { contactReach } from './contact.js';

function unique<T>(values: T[]) { if (new Set(values).size !== values.length) { fail('invalid'); } return values; }
const cause = (raw: unknown) => member(raw, DEATH_CAUSES);

export function validateIsland(raw: unknown): asserts raw is IslandData {
    const data = shape(raw, ['formatVersion', 'revision', 'active', 'last']);
    if (data.formatVersion !== ISLAND_FORMAT_VERSION) { fail('invalid'); }
    integer(data.revision);
    if (data.last !== null) {
        const last = shape(data.last, ['id', 'fingerprint']); identifier(last.id);
        if (typeof last.fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(last.fingerprint)) { fail('invalid'); }
    }
    if (data.active === null) {
        if (data.revision !== 0 || data.last !== null) { fail('invalid'); }
        return;
    }
    if (!data.last || data.revision === 0) { fail('invalid'); }
    const world = shape(data.active, ['id', 'playerIdentity', 'clock', 'people', 'items', 'resources', 'structures', 'waste', 'experiences']);
    const identity = parsePlayerIdentity(world.playerIdentity);
    if (identity.name !== object(world.playerIdentity).name) { fail('invalid'); }
    identifier(world.id); const clock = integer(world.clock), people = shape(world.people, PERSON_IDS), items = object(world.items);
    const resources = object(world.resources), structures = object(world.structures), waste = object(world.waste);
    validateObjects(items, resources, structures, waste, clock);
    for (const id of PERSON_IDS) {
        const p = shape(people[id], ['position', 'body', 'activity']), body = object(p.body);
        const position = stand(p.position);
        if (body.kind === 'living') { shape(body, ['kind', 'needs']); needs(body.needs); }
        else { shape(body, ['kind', 'death', 'cause']); member(body.kind, ['dead']); integer(body.death, 1); cause(body.cause); }
        if (p.activity === null) { continue; }
        if (body.kind === 'dead') { fail('invalid'); }
        const a = object(p.activity);
        if (a.kind === 'travel' || a.kind === 'drag') {
            shape(a, a.kind === 'drag' ? ['kind', 'subject', 'route'] : ['kind', 'route']);
            if (a.kind === 'drag') { person(a.subject); }
            let from = position;
            for (const dest of route(a.route)) { if (!canTravel(from, dest, LANDSCAPE)) { fail('invalid'); } from = dest; }
        } else if (a.kind === 'rest' || a.kind === 'guard') { shape(a, ['kind', 'until']); integer(a.until, clock + 1); }
        else if (a.kind === 'strike') {
            shape(a, ['kind', 'to', 'form', 'until']);
            if (person(a.to) === id) { fail('invalid'); }
            member(a.form, STRIKE_FORMS); integer(a.until, clock + 1);
        }
        else if (a.kind === 'offer') {
            shape(a, ['kind', 'item', 'to', 'units']); identifier(a.item); person(a.to); integer(a.units, 1, 100);
        }
        else if (a.kind === 'offer_care') {
            shape(a, ['kind', 'to', 'wound', 'treatment']);
            if (person(a.to) === id) { fail('invalid'); }
            wound(a.wound); treatmentReferences(treatment(a.treatment), items, resources, structures);
        }
        else if (a.kind === 'offer_contact') {
            shape(a, ['kind', 'to', 'form']); if (person(a.to) === id) { fail('invalid'); } member(a.form, CONTACT_FORMS);
        }
        else if (a.kind === 'contact') {
            shape(a, ['kind', 'with', 'form']); const partner = person(a.with), other = object(people[partner]).activity;
            member(a.form, CONTACT_FORMS);
            if (partner === id || !other || object(other).kind !== 'contact' || object(other).with !== id || object(other).form !== a.form) { fail('invalid'); }
        }
        else if (a.kind === 'receive_care') {
            shape(a, ['kind', 'from']); const from = person(a.from);
            const helper = object(people[from]).activity;
            if (from === id || !helper || object(helper).kind !== 'work') { fail('invalid'); }
            const task = parseWorkTask(object(helper).task);
            if (task.kind !== 'tend' || task.subject !== id) { fail('invalid'); }
        }
        else if (a.kind === 'work') {
            shape(a, ['kind', 'task', 'remaining']); integer(a.remaining, 1);
            workReferences(parseWorkTask(a.task), items, resources, structures, waste);
        } else if (a.kind === 'construct') {
            shape(a, ['kind', 'site']); if (!Object.hasOwn(structures, identifier(a.site))) { fail('invalid'); }
        } else {
            shape(a, ['kind', 'until', 'item']); member(a.kind, ['take']); integer(a.until, clock + 1);
            if (!Object.hasOwn(items, identifier(a.item))) { fail('invalid'); }
        }
    }
    for (const raw of Object.values(items)) {
        const item = object(raw), location = object(item.location);
        if (location.kind === 'covering' && object(object(people[person(location.person)]).body).kind !== 'dead') { fail('invalid'); }
    }
    let previousAt = 0, sequence = 0;
    const deaths = new Map<string, number>(), burials = new Map<string, number>();
    const cooperation = cooperationHistory();
    list(world.experiences, rawEvent => {
        if (deaths.has('player')) { fail('invalid'); }
        const event = shape(rawEvent, ['sequence', 'at', 'position', 'audience', 'payload']);
        if (integer(event.sequence, 1) !== ++sequence) { fail('invalid'); }
        previousAt = integer(event.at, previousAt, clock); stand(event.position);
        const audience = unique(list(event.audience, person));
        const p = object(event.payload);
        if (p.kind === 'contested' || p.kind === 'resource_contested' || p.kind === 'site_contested') {
            const field = p.kind === 'contested' ? 'item' : p.kind === 'resource_contested' ? 'source' : null;
            shape(p, field ? ['kind', 'actors', field] : ['kind', 'actors']); const actors = unique(list(p.actors, person));
            if (actors.length < 2 || actors.some(id => !audience.includes(id) || deaths.has(id)) || audience.some(id => deaths.has(id))) { fail('invalid'); }
            if (field) {
                const id = identifier(p[field]);
                if (field === 'item' ? !Object.hasOwn(items, id) : !Object.hasOwn(resources, id) && !Object.hasOwn(structures, id)) { fail('invalid'); }
            }
            return;
        }
        const actor = person(p.actor);
        if (!audience.includes(actor) || deaths.has(actor)) { fail('invalid'); }
        switch (p.kind) {
            case 'speech': shape(p, ['kind', 'actor', 'text']); text(p.text); break;
            case 'intention':
                shape(p, ['kind', 'actor', 'text']); text(p.text);
                if (actor === 'player' || audience.length !== 1) { fail('invalid'); } break;
            case 'encounter':
                shape(p, ['kind', 'actor', 'subject']); if (person(p.subject) === actor || deaths.has(p.subject as string) || audience.length !== 1) { fail('invalid'); } break;
            case 'started':
                shape(p, ['kind', 'actor', 'activity']); member(p.activity, ['travel', 'drag', 'rest', 'take', 'work', 'construct', 'offer', 'guard']); break;
            case 'declaration': {
                shape(p, ['kind', 'actor', 'text', 'choice']); text(p.text); const choice = declaration(p.choice);
                if (choice.kind === 'residence') { stand(choice.position); }
                else if (choice.kind === 'support' && choice.person === actor) { fail('invalid'); }
                break;
            }
            case 'died': shape(p, ['kind', 'actor']); deaths.set(actor, sequence); break;
            case 'noticed_body':
                shape(p, ['kind', 'actor', 'subject']); if (!deaths.has(person(p.subject)) || burials.has(p.subject as string)) { fail('invalid'); } break;
            case 'body_handling':
                shape(p, ['kind', 'actor', 'subject', 'stage']);
                if (!deaths.has(person(p.subject)) || burials.has(p.subject as string)) { fail('invalid'); } member(p.stage, ['started', 'placed']); break;
            case 'body_covered':
                shape(p, ['kind', 'actor', 'subject', 'item']);
                if (!deaths.has(person(p.subject)) || burials.has(p.subject as string) || !Object.hasOwn(items, identifier(p.item))) { fail('invalid'); } break;
            case 'body_buried': {
                shape(p, ['kind', 'actor', 'subject']); const subject = person(p.subject);
                if (!deaths.has(subject) || burials.has(subject)) { fail('invalid'); }
                burials.set(subject, sequence); break;
            }
            case 'body_exhumed': {
                shape(p, ['kind', 'actor', 'subject', 'grave']); const subject = person(p.subject);
                if (!deaths.has(subject) || burials.get(subject) !== integer(p.grave, 1, sequence - 1)) { fail('invalid'); }
                burials.delete(subject); break;
            }
            case 'discovered': {
                shape(p, ['kind', 'actor', 'subject']); const s = shape(p.subject, ['kind', 'id', 'form']);
                const kind = member(s.kind, ['resource', 'structure']); identifier(s.id);
                if (kind === 'resource') { member(s.form, RESOURCE_KINDS); if (!Object.hasOwn(resources, s.id as string)) { fail('invalid'); } }
                else { member(s.form, BLUEPRINT_IDS); if (!Object.hasOwn(structures, s.id as string)) { fail('invalid'); } }
                break;
            }
            case 'taken': case 'dropped': case 'take_unavailable': case 'worn': case 'unworn':
                shape(p, ['kind', 'actor', 'item']); if (!Object.hasOwn(items, identifier(p.item))) { fail('invalid'); } break;
            case 'offered': case 'received': {
                const counterpart = p.kind === 'offered' ? 'to' : 'from';
                shape(p, ['kind', 'actor', counterpart, 'item', 'form', 'units']);
                const other = person(p[counterpart]);
                if (other === actor || deaths.has(other) || !audience.includes(other) || !Object.hasOwn(items, identifier(p.item))) { fail('invalid'); }
                member(p.form, ITEM_KINDS); integer(p.units, 1, 100); break;
            }
            case 'worked':
                shape(p, ['kind', 'actor', 'task', 'target', 'outputs']);
                member(p.task, Object.keys(WORK_NAMES));
                if (p.target !== null) { identifier(p.target); }
                list(p.outputs, value => { if (!Object.hasOwn(items, identifier(value))) { fail('invalid'); } }); break;
            case 'care_offered':
                shape(p, ['kind', 'actor', 'to', 'wound', 'treatment']); person(p.to); wound(p.wound); member(p.treatment, ['rinse', 'dress', 'uncover']);
                if (p.to === actor || !audience.includes(p.to as typeof actor)) { fail('invalid'); } break;
            case 'care_response':
                shape(p, ['kind', 'actor', 'from', 'accepted']); person(p.from); boolean(p.accepted);
                if (p.from === actor || !audience.includes(p.from as typeof actor)) { fail('invalid'); } break;
            case 'contact_offered': case 'contact_response': case 'contact_ended': {
                const key = p.kind === 'contact_offered' ? 'to' : p.kind === 'contact_response' ? 'from' : 'with';
                shape(p, p.kind === 'contact_response' ? ['kind', 'actor', key, 'form', 'accepted'] : ['kind', 'actor', key, 'form']);
                member(p.form, CONTACT_FORMS);
                const other = person(p[key]);
                if (other === actor || deaths.has(other) || !audience.includes(other)) { fail('invalid'); }
                if (p.kind === 'contact_response') { boolean(p.accepted); } break;
            }
            case 'strike_started': case 'strike_resolved': {
                shape(p, p.kind === 'strike_started' ? ['kind', 'actor', 'to', 'form'] : ['kind', 'actor', 'to', 'form', 'outcome']);
                const to = person(p.to); member(p.form, STRIKE_FORMS);
                if (to === actor || !audience.includes(to)) { fail('invalid'); }
                if (p.kind === 'strike_resolved') { member(p.outcome, ['missed', 'blocked', 'hit']); }
                break;
            }
            case 'offer_declined':
                shape(p, ['kind', 'actor', 'from', 'item']); person(p.from);
                if (p.from === actor || !audience.includes(p.from as typeof actor) || !Object.hasOwn(items, identifier(p.item))) { fail('invalid'); } break;
            case 'tended':
                shape(p, ['kind', 'actor', 'subject', 'wound', 'treatment']); person(p.subject); wound(p.wound); member(p.treatment, ['rinse', 'dress', 'uncover']);
                if (!audience.includes(p.subject as typeof actor)) { fail('invalid'); } break;
            case 'poured':
                shape(p, ['kind', 'actor', 'from', 'to', 'millilitres']); integer(p.millilitres, 1, 10000);
                if (!Object.hasOwn(items, identifier(p.from)) || p.to !== null && (!Object.hasOwn(items, identifier(p.to)) || p.to === p.from)) { fail('invalid'); } break;
            case 'work_failed':
                shape(p, ['kind', 'actor', 'task', 'reason']);
                member(p.task, Object.keys(WORK_NAMES).filter(kind => kind !== 'construct'));
                identifier(p.reason); break;
            case 'need': shape(p, ['kind', 'actor', 'need']); member(p.need, NEED_KINDS); break;
            case 'accident': shape(p, ['kind', 'actor', 'waste']); member(p.waste, ['urine', 'feces']); break;
            default:
                shape(p, ['kind', 'actor']); member(p.kind, ['departed', 'arrived', 'rested', 'interrupted']);
        }
        if (audience.some(id => id !== actor && deaths.has(id))) { fail('invalid'); }
        cooperation.remember(rawEvent as Experience);
    });
    const handled = new Set<string>();
    for (const id of PERSON_IDS) {
        const body = object(object(people[id]).body), death = deaths.get(id);
        if (body.kind === 'dead' ? death === undefined || death !== body.death : death !== undefined) { fail('invalid'); }
        const parsed = world as unknown as Journey, activity = parsed.people[id].activity;
        if (activity?.kind === 'offer' && !canOffer(parsed, id, activity.to, activity.item, activity.units, LANDSCAPE)) { fail('invalid'); }
        if (activity?.kind === 'offer_care' && !careReach(parsed, id, activity.to, LANDSCAPE)) { fail('invalid'); }
        if (activity?.kind === 'offer_contact' && !contactReach(parsed, id, activity.to, LANDSCAPE)) { fail('invalid'); }
        if (activity?.kind === 'contact' && !contactReach(parsed, id, activity.with, LANDSCAPE)) { fail('invalid'); }
        if (activity?.kind === 'work' && activity.task.kind === 'tend') {
            if (!careReach(parsed, id, activity.task.subject, LANDSCAPE)) { fail('invalid'); }
            requireCareConsent(parsed, id, activity.task.subject);
        }
        const task = activity?.kind === 'work' ? activity.task : null;
        const subject = activity?.kind === 'drag' ? activity.subject
            : task?.kind === 'bury_body' || task?.kind === 'cover_body' ? task.subject
                : task?.kind === 'exhume_body' ? [...burials].find(([, grave]) => grave === task.grave)?.[0] : null;
        if (task?.kind === 'exhume_body' && !subject) { fail('invalid'); }
        if (subject) {
            if (!deaths.has(subject) || handled.has(subject) || task?.kind !== 'exhume_body' && burials.has(subject)) { fail('invalid'); }
            handled.add(subject);
        }
        if (activity?.kind === 'drag') { dragRoute(parsed, id, activity.subject, activity.route, LANDSCAPE); }
    }
}

export const ISLAND_PARTITION: PartitionRegistration<IslandData> = {
    key: 'island', ownerId: 'game', schemaVersion: ISLAND_FORMAT_VERSION, storage: 'user', createInitial: emptyIsland,
    parse(raw) {
        try { validateIsland(raw); return { ok: true, value: structuredClone(raw) }; }
        catch (error) {
            if (!(error instanceof Error) || !('code' in error) || typeof error.code !== 'string' || !error.code.startsWith('island_')) { throw error; }
            return { ok: false, error: { code: 'partition_invalid', message: error.message } };
        }
    },
    serialize(value) { validateIsland(value); return structuredClone(value); },
};
