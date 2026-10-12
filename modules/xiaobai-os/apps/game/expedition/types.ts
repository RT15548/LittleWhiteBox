import type { BOSS_IDS, EFFECT_IDS, ENCOUNTER_IDS, EXPEDITION_FORMAT_VERSION, MOB_IDS, OATH_IDS, OUTFIT_IDS, RELIC_IDS, WEAPON_IDS } from './ids.js';
import type { Campaign } from './campaign/types.js';
import type { Traveler } from './campaign/traveler.js';
import type { ChapterId } from './content/chapters.js';
import type { CampaignChoice } from './content/campaign-actions.js';
import type { CourtyardPerson } from './content/world-types.js';
import type { Participant } from './content/participants.js';
export type Weapon = typeof WEAPON_IDS[number];
export type Oath = typeof OATH_IDS[number];
export type Relic = typeof RELIC_IDS[number];
export type Outfit = typeof OUTFIT_IDS[number];
export type BossKind = typeof BOSS_IDS[number];
export type MobKind = typeof MOB_IDS[number];
export type EnemyKind = BossKind | MobKind;
export type EncounterKind = typeof ENCOUNTER_IDS[number];
export type RouteKind = 'battle' | 'elite' | 'camp' | 'shrine' | 'merchant' | 'boss';
export interface Point { x: number; y: number }
export interface InputFrame { move: number; dash: boolean; skill: boolean }
/** RLE of fixed-step world-space input. No client damage or outcomes cross this boundary. */
export interface InputSpan extends InputFrame { ticks: number }
export interface RelicStack { id: Relic; rank: number }
export interface Player extends Point {
    hp: number; facing: number; attack: number; dash: number; skill: number; invulnerable: number;
    dashTime: number; dashAngle: number; swing: number; shield: number; combo: number;
    guard: number; resource: number; resonance: number; ward: number; lastHit: number; travel: number; rescues: number;
}
export interface Enemy extends Point {
    id: number; kind: EnemyKind; hp: number; maxHp: number; angle: number; cooldown: number;
    windup: number; target: Point; pattern: number; phase: number; chill: number; burn: number; marked: number;
    stun: number; bleed: number; poison: number; exposed: number; motion: number; motionAngle: number; stagger: number; memory: Point[];
}
export type DamageSource = 'attack' | 'skill' | 'passive' | 'lightning' | 'companion';
export interface Shot extends Point {
    id: number; angle: number; speed: number; damage: number; life: number; friendly: boolean; source: DamageSource;
    pierce: number; hits: number[]; radius: number; splash: number; bounce: number;
}
export interface Hazard extends Point {
    id: number; radius: number; wait: number; life: number; damage: number; friendly: boolean;
    kind: 'storm' | 'fire' | 'slam' | 'frost' | 'poison' | 'beam' | 'ring' | 'mine';
    angle: number; length: number; width: number; inner: number; source: DamageSource;
    hits: number[];
}
export interface Effect extends Point { id: number; kind: typeof EFFECT_IDS[number]; life: number; angle: number; size: number }
export interface Obstacle extends Point { radius: number }
export interface Companion extends Point { id: number; kind: 'familiar' | 'turret' | 'shade'; hp: number; life: number; cooldown: number; angle: number; empowered: number }
export interface Objective extends Point { hp: number; progress: number; target: number }
export interface Battle {
    tick: number; seed: number; serial: number; player: Player; enemies: Enemy[]; shots: Shot[];
    hazards: Hazard[]; effects: Effect[]; obstacles: Obstacle[]; companions: Companion[];
    wave: number; waves: number; nextWave: number; kills: number; damageTaken: number;
    status: 'fighting' | 'won' | 'lost'; zone: number; chapter: number; elite: boolean; boss: boolean;
    bossKind: BossKind; encounter: EncounterKind; objective: Objective;
}
export type BattleHud = Pick<Battle, 'player' | 'enemies' | 'wave' | 'waves' | 'tick' | 'objective' | 'encounter'>;
export type PresentationError = 'rendering' | 'sound';
export interface Route { id: number; kind: RouteKind; encounter: EncounterKind }
export interface Award { key: string; actionId: string; runId: string; amount: number }
export interface Purchase { id: Outfit; actionId: string; amount: number }
export interface JourneySetup { weapon: Weapon; outfit: Outfit; traveler: Traveler; chapter: ChapterId }
export type Command =
    | (({ type: 'start' } | { type: 'restart' }) & JourneySetup)
    | { type: 'interact'; id: string }
    | { type: 'input'; spans: InputSpan[] }
    | { type: 'relic'; id: Relic }
    | { type: 'loadout'; equipped: Relic[] }
    | { type: 'purchase'; id: Outfit } | { type: 'equip'; id: Outfit }
    | { type: 'choice'; id: CampaignChoice; person: CourtyardPerson }
    | { type: 'resolve_parley' }
    | { type: 'greet'; person: Participant }
    | { type: 'accept_reply' }
    | { type: 'retry' } | { type: 'retreat' } | { type: 'leave' };
export interface ExpeditionData {
    formatVersion: typeof EXPEDITION_FORMAT_VERSION; revision: number; last: { id: string; command: Command | { type: 'conversation'; person: string; text: string } | { type: 'rebuild' } } | null; active: Campaign | null;
    awards: Award[];
    purchases: Purchase[]; equippedOutfit: Outfit;
}
export interface Loadout { weapon: Weapon; relics: readonly RelicStack[]; oaths: readonly Oath[] }
