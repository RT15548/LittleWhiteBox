export const FURNACE_SCENE_NAMES = {
    furnace_terrace: '炉城高台', snow_road: '雪线驿路', old_kiln: '雪线旧驿', return_bridge: '雪谷运料桥',
    furnace_quarter: '炉下旧城', furnace_lift: '运输平台', furnace_scaffold: '炉外检修架',
    furnace_antechamber: '炉前值房', furnace_heart: '古炉心室',
} as const;
export type FurnaceScene = keyof typeof FURNACE_SCENE_NAMES;
export const isFurnaceScene = (scene: string): scene is FurnaceScene => Object.hasOwn(FURNACE_SCENE_NAMES, scene);
