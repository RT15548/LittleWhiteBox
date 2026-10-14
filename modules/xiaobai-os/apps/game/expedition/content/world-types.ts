import type { Point } from '../types.js';
import type { WorldMap } from '../world/types.js';
import type { Landscape } from '../world/landscape.js';
import type { PERSON_NAMES } from './people.js';
import type { ParleyEnemy } from './parley.js';
import type { RewardNode } from './campaign-rewards.js';
import type { InnerCityFact } from './inner-city/facts.js';
import type { CityPassageId } from './inner-city/passages.js';
import type { StoryPerson } from './inner-city/people.js';

export type CityDistrict = 'south_street' | 'workshop_street' | 'heat_station' | 'pipe_gallery' | 'sluice_bridge' | 'main_valve' | 'deep_waterway' | 'coal_store';
export type DistrictScene = 'camp' | 'crossroads' | 'gate' | 'beacon' | 'waterway' | 'cells' | 'hall' | 'roots' | CityDistrict;
export type LivingScene = 'clinic_front' | 'sanniang_room' | 'inn' | 'guest_room' | 'laobai_home' | 'kouzi_home' | 'anian_home' | 'anian_room'
    | 'wen_house' | 'transfer_office' | 'audit_office' | 'workers_lodging' | 'south_inn';
export type CourtyardScene = DistrictScene | LivingScene;
export type CourtyardFact = 'crossroads_cleared' | 'patrol_cleared' | 'sluice_opened' | 'waterway_cleared'
    | 'alarm_silenced' | 'captives_released' | 'postern_opened' | 'receiving_arranged'
    | 'anian_returned' | 'kouzi_returned' | 'captives_arrived' | 'warden_defeated' | 'roots_cleared' | 'briefed' | 'alarm_raised' | 'supplies_secured' | 'chapter_completed' | 'clinic_helped'
    | 'bajin_intel' | 'changyounian_intel' | 'bajin_passed' | 'changyounian_passed' | InnerCityFact;
export type CourtyardPerson = keyof typeof PERSON_NAMES;
export type CourtyardSwitch = Extract<CourtyardFact, 'sluice_opened' | 'captives_released' | 'postern_opened'>;
export interface WorldCondition { all?: readonly CourtyardFact[]; none?: readonly CourtyardFact[] }
export interface SceneExit {
    id: string; anchor: string; to: CourtyardScene; arrival: string; condition?: WorldCondition;
    doorway?: boolean;
}
interface ObjectBase { id: string; anchor: string; condition?: WorldCondition }
export type SceneObject = ObjectBase & (
    | { kind: 'inspect'; passage: 'warning' | 'cargo' | 'orders' | CityPassageId }
    | { kind: 'switch'; fact: CourtyardSwitch }
    | { kind: 'person'; person: CourtyardPerson }
    | { kind: 'enemy'; enemy: ParleyEnemy }
    | { kind: 'resident'; person: StoryPerson }
    | { kind: 'rest' }
    | { kind: 'reward'; node: RewardNode }
);
export interface SceneGate { id: string; condition: WorldCondition }
export interface SceneDefinition {
    id: CourtyardScene;
    map: WorldMap;
    anchors: Readonly<Record<string, Point>>;
    gates: readonly SceneGate[];
    exits: readonly SceneExit[];
    objects: readonly SceneObject[];
    safe: boolean;
    landscape: Landscape;
}
