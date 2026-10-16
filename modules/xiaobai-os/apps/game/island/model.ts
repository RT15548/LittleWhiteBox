import type { PlayerIdentity } from './characters.js';

export const PERSON_IDS = ['player', 'lin', 'zhou', 'xu', 'chen', 'ye', 'luo'] as const;
export const ISLAND_FORMAT_VERSION = 4;
export const CONTACT_FORMS = ['embrace', 'handhold', 'kiss', 'lean'] as const;
export type ContactForm = typeof CONTACT_FORMS[number];
export const STRIKE_FORMS = ['push', 'punch'] as const;
export type StrikeForm = typeof STRIKE_FORMS[number];
export const ITEM_KINDS = ['lifejacket', 'shirt', 'trousers', 'shoes', 'ivory_blouse', 'charcoal_trousers', 'inner_top', 'inner_shorts', 'branch', 'palm_leaf', 'cord', 'cloth',
    'coconut', 'coconut_open', 'coconut_husk', 'shell', 'bottle', 'metal_cup', 'metal_edge', 'coral_stone', 'basket', 'wraps', 'fish', 'cooked_fish', 'tinder', 'fire_drill'] as const;
export type ItemKind = typeof ITEM_KINDS[number];
export const RESOURCE_KINDS = ['wood', 'palm', 'coconuts', 'seep', 'reef_food'] as const;
export type ResourceKind = typeof RESOURCE_KINDS[number];
export const BLUEPRINT_IDS = ['shelter', 'raincatcher', 'latrine', 'firepit', 'signal'] as const;
export type BlueprintId = typeof BLUEPRINT_IDS[number];
export const RECIPE_IDS = ['tear_cloth', 'twist_cord', 'foot_wraps', 'open_coconut', 'coir_cord', 'weave_basket', 'dry_tinder', 'fire_drill', 'cook_fish'] as const;
export type RecipeId = typeof RECIPE_IDS[number];
export const DEATH_CAUSES = ['trauma', 'dehydration', 'starvation', 'illness', 'drowning'] as const;
export const NEED_KINDS = ['thirst', 'hunger', 'fatigue', 'bladder', 'bowel', 'wound', 'infection', 'illness', 'hygiene'] as const;
export type NeedKind = typeof NEED_KINDS[number];
export type PersonId = typeof PERSON_IDS[number];
export type NpcId = Exclude<PersonId, 'player'>;
export interface Point { x: number; y: number }
export type Polygon = readonly Point[];
export interface Landscape {
    land: Polygon;
    obstacles: readonly Polygon[];
    sightScreens: readonly Polygon[];
    soundScreens: readonly Polygon[];
}
export type DeathCause = typeof DEATH_CAUSES[number];
export interface Needs {
    waterDeficit: number; energy: number; fatigue: number; bladder: number; bowel: number;
    soiling: number; footWound: number; skinWound: number; infection: number; illness: number;
    footSoiling: number; skinSoiling: number;
}
export type Wound = 'foot' | 'skin';
export type WashSupply = { kind: 'container' | 'source'; id: string } | { kind: 'sea' };
export type Treatment = { kind: 'rinse'; supply: WashSupply; millilitres: number } | { kind: 'dress'; item: string } | { kind: 'uncover' };
export type Body = { kind: 'living'; needs: Needs } | { kind: 'dead'; death: number; cause: DeathCause };
export interface MaterialUse { item: string; units: number }
export type WorkTask =
    | { kind: 'gather'; source: string; units: number }
    | { kind: 'fill'; source: string; container: string; millilitres: number }
    | { kind: 'pour'; from: string; container: string; millilitres: number }
    | { kind: 'empty'; container: string; millilitres: number }
    | { kind: 'drink'; container: string; millilitres: number }
    | { kind: 'sip'; source: string; millilitres: number }
    | { kind: 'eat'; item: string }
    | { kind: 'craft'; recipe: RecipeId; materials: MaterialUse[] }
    | { kind: 'build'; blueprint: BlueprintId; materials: MaterialUse[] }
    | { kind: 'relieve'; waste: 'urine' | 'feces' }
    | { kind: 'wash'; supply: WashSupply; millilitres: number }
    | { kind: 'wash_item'; item: string; supply: WashSupply; millilitres: number }
    | { kind: 'tend'; subject: PersonId; wound: Wound; treatment: Treatment }
    | { kind: 'cover_waste'; waste: string }
    | { kind: 'cover_body'; subject: PersonId; item: string }
    | { kind: 'bury_body'; subject: PersonId; tool: string }
    | { kind: 'exhume_body'; grave: number; tool: string }
    | { kind: 'ignite'; site: string; tinder: string; drill: string }
    | { kind: 'fuel'; site: string; materials: MaterialUse[] }
    | { kind: 'boil'; site: string; container: string };
export type Activity =
    | { kind: 'travel'; route: Point[] }
    | { kind: 'drag'; subject: PersonId; route: Point[] }
    | { kind: 'offer'; item: string; to: PersonId; units: number }
    | { kind: 'offer_care'; to: PersonId; wound: Wound; treatment: Treatment }
    | { kind: 'receive_care'; from: PersonId }
    | { kind: 'offer_contact'; to: PersonId; form: ContactForm }
    | { kind: 'contact'; with: PersonId; form: ContactForm }
    | { kind: 'strike'; to: PersonId; form: StrikeForm; until: number }
    | { kind: 'guard'; until: number }
    | { kind: 'rest'; until: number }
    | { kind: 'take'; item: string; until: number }
    | { kind: 'work'; task: WorkTask; remaining: number }
    | { kind: 'construct'; site: string };
export interface Person { position: Point; body: Body; activity: Activity | null }
export type ItemLocation = { kind: 'ground'; position: Point } | { kind: 'carried' | 'worn' | 'covering'; person: PersonId }
    | { kind: 'dressing'; person: PersonId; wound: Wound };
export interface Water { millilitres: number; quality: 'untreated' | 'treated'; coconut: { millilitres: number; openedAt: number } | null }
export interface Item { kind: ItemKind; location: ItemLocation; quantity: number; water: Water | null; wetness: number; soiling: number; foodSince: number | null }
export interface Resource { kind: ResourceKind; position: Point; stock: number }
export interface Structure { kind: BlueprintId; position: Point; builder: PersonId; workLeft: number; water: Water | null; fuelSeconds: number; burning: boolean }
export interface Waste { kind: 'urine' | 'feces'; position: Point; amount: number; covered: boolean; createdAt: number }
export type Declaration =
    | { kind: 'residence'; position: Point }
    | { kind: 'support'; person: PersonId; stance: 'with' | 'against' | 'neutral' }
    | { kind: 'proposal' }
    | { kind: 'response'; proposal: number; stance: 'accept' | 'decline' }
    | { kind: 'relay'; reference: number };
export type EventPayload =
    | { kind: 'speech'; actor: PersonId; text: string }
    | { kind: 'intention'; actor: NpcId; text: string }
    | { kind: 'encounter'; actor: PersonId; subject: PersonId }
    | { kind: 'started'; actor: PersonId; activity: Activity['kind'] }
    | { kind: 'declaration'; actor: PersonId; text: string; choice: Declaration }
    | { kind: 'departed' | 'arrived' | 'rested' | 'interrupted'; actor: PersonId }
    | { kind: 'taken' | 'dropped' | 'take_unavailable' | 'worn' | 'unworn'; actor: PersonId; item: string }
    | { kind: 'offered'; actor: PersonId; to: PersonId; item: string; form: ItemKind; units: number }
    | { kind: 'received'; actor: PersonId; from: PersonId; item: string; form: ItemKind; units: number }
    | { kind: 'offer_declined'; actor: PersonId; from: PersonId; item: string }
    | { kind: 'care_offered'; actor: PersonId; to: PersonId; wound: Wound; treatment: Treatment['kind'] }
    | { kind: 'care_response'; actor: PersonId; from: PersonId; accepted: boolean }
    | { kind: 'contact_offered'; actor: PersonId; to: PersonId; form: ContactForm }
    | { kind: 'contact_response'; actor: PersonId; from: PersonId; form: ContactForm; accepted: boolean }
    | { kind: 'contact_ended'; actor: PersonId; with: PersonId; form: ContactForm }
    | { kind: 'strike_started'; actor: PersonId; to: PersonId; form: StrikeForm }
    | { kind: 'strike_resolved'; actor: PersonId; to: PersonId; form: StrikeForm; outcome: 'missed' | 'blocked' | 'hit' }
    | { kind: 'tended'; actor: PersonId; subject: PersonId; wound: Wound; treatment: Treatment['kind'] }
    | { kind: 'poured'; actor: PersonId; from: string; to: string | null; millilitres: number }
    | { kind: 'contested'; actors: PersonId[]; item: string }
    | { kind: 'died'; actor: PersonId }
    | { kind: 'noticed_body'; actor: PersonId; subject: PersonId }
    | { kind: 'body_handling'; actor: PersonId; subject: PersonId; stage: 'started' | 'placed' }
    | { kind: 'body_covered'; actor: PersonId; subject: PersonId; item: string }
    | { kind: 'body_buried'; actor: PersonId; subject: PersonId }
    | { kind: 'body_exhumed'; actor: PersonId; subject: PersonId; grave: number }
    | { kind: 'discovered'; actor: PersonId; subject: { kind: 'resource'; id: string; form: ResourceKind } | { kind: 'structure'; id: string; form: BlueprintId } }
    | { kind: 'worked'; actor: PersonId; task: WorkTask['kind'] | 'construct'; target: string | null; outputs: string[] }
    | { kind: 'work_failed'; actor: PersonId; task: WorkTask['kind']; reason: string }
    | { kind: 'resource_contested'; actors: PersonId[]; source: string }
    | { kind: 'site_contested'; actors: PersonId[] }
    | { kind: 'accident'; actor: PersonId; waste: 'urine' | 'feces' }
    | { kind: 'need'; actor: PersonId; need: NeedKind };
export interface Experience {
    sequence: number;
    at: number;
    position: Point;
    audience: PersonId[];
    payload: EventPayload;
}
export interface Journey {
    id: string;
    playerIdentity: PlayerIdentity;
    clock: number;
    people: Record<PersonId, Person>;
    items: Record<string, Item>;
    resources: Record<string, Resource>;
    structures: Record<string, Structure>;
    waste: Record<string, Waste>;
    experiences: Experience[];
}
export interface SceneScope {
    journey: string;
    clock: number;
    anchor: PersonId;
    actors: NpcId[];
    audience: PersonId[];
    mode: 'alone' | 'private' | 'group';
    signature: string;
}
export type Authority = { kind: 'player' } | { kind: 'gm'; scene: SceneScope };
export type Operation =
    | { kind: 'say'; text: string }
    | { kind: 'intend'; text: string }
    | { kind: 'declare'; text: string; choice: Declaration }
    | { kind: 'travel'; route: Point[] }
    | { kind: 'drag'; subject: PersonId; route: Point[] }
    | { kind: 'rest'; seconds: number }
    | { kind: 'take' | 'drop'; item: string }
    | { kind: 'offer'; item: string; to: PersonId; units: number }
    | { kind: 'accept' | 'decline_offer'; from: PersonId }
    | { kind: 'offer_care'; to: PersonId; wound: Wound; treatment: Treatment }
    | { kind: 'accept_care' | 'decline_care'; from: PersonId }
    | { kind: 'offer_contact'; to: PersonId; form: ContactForm }
    | { kind: 'accept_contact' | 'decline_contact'; from: PersonId }
    | { kind: 'strike'; to: PersonId; form: StrikeForm }
    | { kind: 'guard'; seconds: number }
    | { kind: 'wear' | 'unwear'; item: string }
    | { kind: 'work'; task: WorkTask }
    | { kind: 'construct'; site: string }
    | { kind: 'cancel' };
export interface IslandData { formatVersion: typeof ISLAND_FORMAT_VERSION; revision: number; active: Journey | null; last: { id: string; fingerprint: string } | null }
