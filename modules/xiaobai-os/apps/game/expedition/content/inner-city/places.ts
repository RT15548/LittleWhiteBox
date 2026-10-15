import type { CityDistrict } from '../world-types.js';

export const CITY_SCENE_NAMES = {
    south_street: '内堡南街', workshop_street: '工坊街', heat_station: '南坊分暖站',
    pipe_gallery: '检修管廊', sluice_bridge: '闸桥', main_valve: '回流主闸',
    deep_waterway: '深水道', coal_store: '旧炭库',
} as const satisfies Record<CityDistrict, string>;
export function isCityDistrict(scene: string): scene is CityDistrict { return Object.hasOwn(CITY_SCENE_NAMES, scene); }
