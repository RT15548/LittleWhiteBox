export const PERSON_IDS = ['player', 'lin', 'zhou', 'xu', 'chen', 'ye', 'luo'] as const;
export const ISLAND_FORMAT_VERSION = 1;
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
}
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
    | { kind: 'wash'; supply: { kind: 'container' | 'source'; id: string }; millilitres: number }
    | { kind: 'cover_waste'; waste: string }
    | { kind: 'cover_body'; subject: PersonId; item: string }
    | { kind: 'ignite'; site: string; tinder: string; drill: string }
    | { kind: 'fuel'; site: string; materials: MaterialUse[] }
    | { kind: 'boil'; site: string; container: string };
export type Activity =
    | { kind: 'travel'; route: Point[] }
    | { kind: 'drag'; subject: PersonId; route: Point[] }
    | { kind: 'offer'; item: string; to: PersonId; units: number }
    | { kind: 'rest'; until: number }
    | { kind: 'take'; item: string; until: number }
    | { kind: 'work'; task: WorkTask; remaining: number }
    | { kind: 'construct'; site: string };
export interface Person { position: Point; body: Body; activity: Activity | null }
export type ItemLocation = { kind: 'ground'; position: Point } | { kind: 'carried' | 'worn' | 'covering'; person: PersonId };
export interface Water { millilitres: number; quality: 'untreated' | 'treated'; coconut: { millilitres: number; openedAt: number } | null }
export interface Item { kind: ItemKind; location: ItemLocation; quantity: number; water: Water | null; wetness: number; foodSince: number | null }
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
    | { kind: 'poured'; actor: PersonId; from: string; to: string | null; millilitres: number }
    | { kind: 'contested'; actors: PersonId[]; item: string }
    | { kind: 'died'; actor: PersonId }
    | { kind: 'noticed_body'; actor: PersonId; subject: PersonId }
    | { kind: 'body_handling'; actor: PersonId; subject: PersonId; stage: 'started' | 'placed' }
    | { kind: 'body_covered'; actor: PersonId; subject: PersonId; item: string }
    | { kind: 'discovered'; actor: PersonId; subject: { kind: 'resource'; id: string; form: ResourceKind } | { kind: 'structure'; id: string; form: BlueprintId } }
    | { kind: 'worked'; actor: PersonId; task: WorkTask['kind'] | 'construct'; target: string | null; outputs: string[] }
    | { kind: 'work_failed'; actor: PersonId; task: WorkTask['kind']; reason: string }
    | { kind: 'resource_contested'; actors: PersonId[]; source: string }
    | { kind: 'site_contested'; actors: PersonId[] }
    | { kind: 'accident'; actor: PersonId; waste: 'urine' | 'feces' }
    | { kind: 'need'; actor: PersonId; need: 'thirst' | 'hunger' | 'fatigue' | 'bladder' | 'bowel' | 'wound' };
export interface Experience {
    sequence: number;
    at: number;
    position: Point;
    audience: PersonId[];
    payload: EventPayload;
}
export interface Journey {
    id: string;
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
    | { kind: 'accept'; from: PersonId }
    | { kind: 'wear' | 'unwear'; item: string }
    | { kind: 'work'; task: WorkTask }
    | { kind: 'construct'; site: string }
    | { kind: 'cancel' };
export interface IslandData { formatVersion: typeof ISLAND_FORMAT_VERSION; revision: number; active: Journey | null; last: { id: string; fingerprint: string } | null }
