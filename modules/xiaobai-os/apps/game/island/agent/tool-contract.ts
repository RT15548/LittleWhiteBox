import { BLUEPRINT_IDS, PERSON_IDS, RECIPE_IDS } from '../model.js';
import { RULES } from '../content.js';
import { HYGIENE, SURVIVAL } from '../survival-content.js';
import { AGENT_POLICY as P } from './policy.js';

type Schema = Record<string, unknown>;
const string = { type: 'string' }, id = { ...string, maxLength: 100 }, positive = { type: 'integer', minimum: 1 };
const object = (properties: Record<string, Schema>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const variant = (kind: string, fields: Record<string, Schema> = {}) => object({ kind: { type: 'string', enum: [kind] }, ...fields });
const point = object({ x: { type: 'number' }, y: { type: 'number' } });
const person = { type: 'string', enum: PERSON_IDS };
const materials = { type: 'array', minItems: 1, maxItems: 100, items: object({ item: id, units: { ...positive, maximum: 100 } }) };
const container = { container: id, millilitres: { ...positive, maximum: 10000 } };
const work = { anyOf: [
    variant('gather', { source: id, units: { ...positive, maximum: 100 } }), variant('fill', { source: id, ...container }),
    variant('drink', container), variant('eat', { item: id }),
    { ...variant('wash', { supply: object({ kind: { type: 'string', enum: ['container', 'source'] }, id }), millilitres: { ...positive, minimum: HYGIENE.minimumWashMl, maximum: 10000 } }),
        description: 'Wash oneself with water from a reachable container, seep or completed water collector. Consumes the specified amount from that supply when the work completes and reduces bodily soiling. Washing does not treat infection or clean worn clothing.' },
    { ...variant('pour', { from: id, ...container }), description: 'Pour from one reachable container into another, within the destination capacity and carrying limit. The liquid retains treatment and spoilage history; mixing with untreated water makes the mixture untreated. Completion records poured with from, to and millilitres; to is null when liquid was discarded by empty.' },
    { ...variant('empty', container), description: 'Discard the specified liquid amount from a reachable container. The container remains; discarded liquid cannot be recovered.' },
    variant('sip', { source: { ...id, description: 'Reachable seep or completed water collector. Drink here without a container; the water remains untreated and is consumed from its actual stock.' }, millilitres: { ...positive, maximum: SURVIVAL.maxSipMl } }),
    variant('craft', { recipe: { type: 'string', enum: RECIPE_IDS }, materials }),
    variant('build', { blueprint: { type: 'string', enum: BLUEPRINT_IDS }, materials }),
    { ...variant('relieve', { waste: { type: 'string', enum: ['urine', 'feces'] } }), description: 'Relieve oneself at the current position, leaving exposed waste there. A completed latrine is a leaf screen that provides visual shelter from one side. Covering the waste is separate work.' },
    variant('cover_waste', { waste: id }),
    { ...variant('cover_body', { subject: person, item: id }), description: `Cover a reachable, stationary dead body with a whole reachable bundle of fabric or leaves. Worn clothing must first be taken off. Takes ${SURVIVAL.coverBodySeconds} seconds. The covering remains the same item, at location covering on that body, and can be taken back. This does not bury or disinfect the body.` },
    variant('ignite', { site: id, tinder: id, drill: id }), variant('fuel', { site: id, materials }), variant('boil', { site: id, container: id }),
] };
const speech = { text: { ...string, minLength: 1, maxLength: RULES.maxSpeechCharacters } };
export const PLAYER_OPERATION_SCHEMA = { anyOf: [
    variant('say', speech), variant('declare', { ...speech, choice: { anyOf: [variant('residence', { position: point }),
        variant('support', { person, stance: { type: 'string', enum: ['with', 'against', 'neutral'] } }),
        { ...variant('proposal'), description: 'The spoken text is a cooperation proposal. Its new experience sequence identifies it. The proposer commits only themself; other people choose their own responses.' },
        variant('response', { proposal: { ...positive, description: 'Known proposal reference, from agreements or an original statement. Each response replaces only this actor\'s earlier commitment to that proposal.' },
            stance: { type: 'string', enum: ['accept', 'decline'], description: 'accept commits this actor; decline refuses or withdraws. Neither performs labour nor transfers goods.' } }),
        variant('relay', { reference: { ...positive, description: 'Reference of one known proposal or response. Speaks the operation text and quotes that statement exactly. Shares no original audience, location, surrounding conversation, or later responses. Quoting a response alone does not teach its proposal terms.' } })] } }),
    variant('travel', { route: { type: 'array', minItems: 1, maxItems: RULES.maxRoutePoints, items: point } }),
    { ...variant('drag', { subject: person, route: { type: 'array', minItems: 1, maxItems: RULES.maxRoutePoints, items: point } }),
        description: `Drag one reachable dead body along the actor's route at ${SURVIVAL.dragSpeedFactor} of walking speed with greater exertion. The body keeps its position relative to the actor and all attached items. Both paths must be passable. It can be held by only one person at a time. Arrival, cancellation or the handler's death leaves it where movement actually stopped.` },
    variant('rest', { seconds: { ...positive, maximum: RULES.maxAdvanceSeconds } }),
    ...['take', 'drop', 'wear', 'unwear'].map(kind => variant(kind, { item: id })),
    { ...variant('offer', { item: id, to: person, units: { ...positive, maximum: 100 } }),
        description: 'Hold out carried items within reach of a living person. They stay with the giver until that recipient accepts. Worn items must first be taken off. The giver waits in an offer activity and can cancel to take them back.' },
    { ...variant('accept', { from: person }), description: 'Accept what this giver is currently holding out to this actor. Transfers only the offered quantity, preserving the actual container and its water. May be done during an existing activity; capacity and present reach still apply.' },
    variant('work', { task: work }), variant('construct', { site: id }), variant('cancel'),
] };
export const OPERATION_SCHEMA = { anyOf: [variant('intend', speech), ...PLAYER_OPERATION_SCHEMA.anyOf] };
export const tool = (name: string, description: string, fields: Record<string, Schema>) => ({ type: 'function', function: { name, description, parameters: object(fields) } });
export const KNOWLEDGE_TOOLS = [
    tool('Observe', [
        'Read the present scene from each permitted observer\'s viewpoint. Returns observations with clock, observer, self, intention (latest private plan or null), people, items, offers, using, resources, structures, waste, weather, declarations, agreements, knownPlaces, offset and next.',
        'offers lists visible handovers with from, to, item, form, units, wetness, water and food; the shown quantity is what is held out, not the giver\'s remaining inventory.',
        'people.work is only the visible work kind, not the task target or remaining time. using lists a visible person actively drinking or eating their own carried object: person, form, wetness, units (one held portion). It supplies no item ID, liquid amount, capacity or remaining inventory; form is not an actionable item reference.',
        'items and offers include food: null for unmodeled spoilage, unexamined when out of reach, or a nearby sensory observation (no_obvious_spoilage or off_odor). Their water and structure water contain millilitres, quality (treated or untreated), and a separate food observation for exposed coconut water. Absence of odor or treated quality does not establish freedom from spoilage.',
        'Fish, opened coconut flesh and coconut water accumulate warm-storage exposure with game time. Transfer, cooking and boiling retain accumulated spoilage risk. Eating the flesh leaves the original liquid in a shell. Pouring and refilling retain the coconut-water portion and its exposure; mixed coconut water uses the earliest opening. Spoiled food and liquid can still be used at greater health cost. Capture and opening times are not supplied by observation.',
        'agreements gives proposal, proposer, termsPreview, termsTruncated, source, learnedAt, through and commitments (actor, stance, reference, source, learnedAt, through). Only responses that observer learned appear; an absent response means unknown. Read source for full text, which can be a relay rather than access to the private original. proposal/reference identifies the quoted statement for response/relay actions.',
        'knownPlaces contains remembered discoveries with subject (kind, id, form), position and observedAt; these are past locations, not current stocks, occupants or builders.',
        'waste contains id, position and the visible kind: urine, feces or disturbed_ground after covering. A visible trace does not identify who left it or when; disturbed ground does not reveal what lies underneath.',
        `items, resources, structures, waste, declarations, agreements and knownPlaces are paged together up to ${P.pageSize} each within ${P.observationCharacters} characters across observers; pass a returned next as offset. Start at offset 0. Terms, declaration text and private-plan text have previews of at most ${P.statementPreviewCharacters} characters. intention and declaration entries carry textTruncated; read their sequence for the full original when needed. Absent people are omitted; unoffered carried possessions of other living people are not listed as inventory.`,
    ].join('\n'), { offset: { type: 'integer', minimum: 0 } }),
    tool('BrowseMemory', 'Read chronological original experiences known by at least one permitted observer. Returns entries in the ReadMemory shape and next (null at end). Start with after 0, or the returned next to continue. An event audience identifies who learned it at the time, not everyone present now.',
        { after: { type: 'integer', minimum: 0 }, limit: { ...positive, maximum: P.pageSize } }),
    tool('ReadMemory', 'Read one original experience by sequence. Returns sequence, at, position, audience and payload; a relay also has shared (reference, actor, text, choice), the quoted statement without its original event metadata. Use a readable source ID from observations, recent history or search; a quoted reference is not permission to read the original private event. Unavailable and unknown IDs return the same error.', { sequence: positive }),
    tool('RecallMemory', `Find older experiences by meaning across the permitted observers' known history. Returns hits with source, at, position, audience, kind, actor, text, start, end and score, plus complete and missing. Results are original excerpts, not summaries; read source for full context. Maximum ${P.recallHits} hits. A missing index or failed connection is not evidence that an event never happened.`,
        { query: { ...string, minLength: 1, maxLength: P.queryCharacters } }),
];
export const TOOLS = [...KNOWLEDGE_TOOLS,
    tool('Act', 'Submit one NPC operation. Returns observer, self (that NPC after acceptance), recorded (new experience sequence, kind and audience) and due (NPCs still awaiting a choice). Use Observe to inspect changed items or the wider scene. Speech is audible at the speaker position; intend records a private plan known only to that NPC and can retain an ongoing activity after an encounter. Travel and work schedule activity; they do not elapse time. Materials must be reachable, selected quantities are consumed when work succeeds. Busy actors can speak, declare, intend, accept a handover or cancel; another activity requires finishing or cancellation. The player is controlled by the user.',
        { actor: { type: 'string', enum: PERSON_IDS.filter(id => id !== 'player') }, operation: OPERATION_SCHEMA }),
];
