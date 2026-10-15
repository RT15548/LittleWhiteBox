import type { BlueprintId, ItemKind, MaterialUse, RecipeId, Resource, ResourceKind, WorkTask } from './model.js';
import { GARMENTS, GARMENT_KINDS, type GarmentKind, type WearSlot } from './clothing.js';

export const WORK_NAMES: Record<WorkTask['kind'] | 'construct', string> = {
    gather: '收集', fill: '装水', drink: '饮水', sip: '原地捧饮', eat: '进食', craft: '制作', build: '备料施工',
    pour: '倒入容器', empty: '倒掉液体',
    relieve: '如厕', wash: '清洁', cover_waste: '掩埋排泄物', cover_body: '遮盖遗体', ignite: '点火', fuel: '添柴', boil: '煮水', construct: '搭建',
};

export type MaterialCapability = 'pole' | 'cover' | 'binding' | 'fabric' | 'fuel';
export type ToolCapability = 'cut' | 'strike';
export const MATERIAL_NAMES: Record<MaterialCapability, string> = { pole: '支杆', cover: '覆盖材料', binding: '绑扎材料', fabric: '布料', fuel: '燃料' };
export const TOOL_NAMES: Record<ToolCapability, string> = { cut: '切割工具', strike: '敲击工具' };
export const WEAR_SLOTS: Partial<Record<ItemKind, WearSlot>> = Object.fromEntries(GARMENT_KINDS.map(kind => [kind, GARMENTS[kind].slot]));
interface ItemSpec {
    name: string; kilograms: number; capacity: number; heatSafe: boolean; energy: number;
    materials: Partial<Record<MaterialCapability, number>>;
    tools: ToolCapability[];
}
const material = (name: string, kilograms: number, materials: ItemSpec['materials'] = {}): ItemSpec =>
    ({ name, kilograms, capacity: 0, heatSafe: false, energy: 0, materials, tools: [] });
const garmentItems = Object.fromEntries(GARMENT_KINDS.map(kind => {
    const garment = GARMENTS[kind];
    return [kind, material(garment.name, garment.kilograms, garment.fabricUnits ? { fabric: garment.fabricUnits } : {})];
})) as Record<GarmentKind, ItemSpec>;
export const ITEMS: Record<ItemKind, ItemSpec> = {
    ...garmentItems,
    branch: material('枯枝', 0.6, { pole: 1, fuel: 1 }), palm_leaf: material('棕榈叶', 0.3, { cover: 1, fuel: 0.2 }),
    cord: material('绳束', 0.1, { binding: 1 }), cloth: material('布片', 0.1, { fabric: 1, cover: 0.5 }),
    coconut: material('落地椰子', 1.2), coconut_open: { ...material('打开的椰子', 0.8), capacity: 300, energy: 400 },
    coconut_husk: material('椰衣', 0.4, { fuel: 0.3 }),
    shell: { ...material('椰壳碗', 0.2), capacity: 300, heatSafe: false },
    bottle: { ...material('回收水瓶', 0.04), capacity: 1000 }, metal_cup: { ...material('金属杯', 0.15), capacity: 350, heatSafe: true },
    metal_edge: { ...material('金属边片', 0.3), tools: ['cut'] }, coral_stone: { ...material('厚重珊瑚石', 1.8), tools: ['strike'] },
    basket: { ...material('编篮', 0.6), materials: {} },
    fish: { ...material('潮池小鱼', 0.2), energy: 180 }, cooked_fish: { ...material('熟鱼', 0.18), energy: 180 },
    tinder: material('干引火物', 0.03, { fuel: 0.1 }), fire_drill: material('钻木生火组', 0.5),
};
export interface Recipe {
    name: string; seconds: number; needs: Partial<Record<MaterialCapability, number>>;
    kinds: Partial<Record<ItemKind, number>>; outputs: Partial<Record<ItemKind, number>>; toolOptions: ToolCapability[]; fire: boolean;
}
const recipe = (name: string, seconds: number, values: Partial<Omit<Recipe, 'name' | 'seconds'>>): Recipe =>
    ({ name, seconds, needs: {}, kinds: {}, outputs: {}, toolOptions: [], fire: false, ...values });
export const RECIPES: Record<RecipeId, Recipe> = {
    tear_cloth: recipe('拆衣取布', 180, { needs: { fabric: 2 }, outputs: { cloth: 2 } }),
    twist_cord: recipe('搓制绳束', 300, { needs: { fabric: 1 }, outputs: { cord: 2 } }),
    foot_wraps: recipe('制作足部包裹', 180, { kinds: { cloth: 2 }, outputs: { wraps: 1 } }),
    open_coconut: recipe('打开椰子', 240, { kinds: { coconut: 1 }, outputs: { coconut_open: 1, coconut_husk: 1 }, toolOptions: ['cut', 'strike'] }),
    coir_cord: recipe('捶取椰棕搓绳', 1200, { kinds: { coconut_husk: 1 }, outputs: { cord: 2 }, toolOptions: ['strike'] }),
    weave_basket: recipe('编织提篮', 900, { needs: { cover: 4, binding: 2 }, outputs: { basket: 1 } }),
    dry_tinder: recipe('整理引火物', 180, { kinds: { palm_leaf: 1 }, outputs: { tinder: 1 } }),
    fire_drill: recipe('制作钻木生火组', 900, { needs: { pole: 2, binding: 1 }, outputs: { fire_drill: 1 }, toolOptions: ['cut'] }),
    cook_fish: recipe('烤鱼', 600, { kinds: { fish: 1 }, outputs: { cooked_fish: 1 }, fire: true }),
};
export const BLUEPRINTS: Record<BlueprintId, { name: string; seconds: number; radius: number; needs: Recipe['needs']; capacity: number }> = {
    shelter: { name: '枝叶棚', seconds: 2400, radius: 2.5, needs: { pole: 4, cover: 8, binding: 4 }, capacity: 0 },
    raincatcher: { name: '集雨处', seconds: 1200, radius: 1.2, needs: { pole: 2, cover: 4, binding: 2 }, capacity: 2500 },
    latrine: { name: '隐蔽如厕处', seconds: 900, radius: 1.2, needs: { pole: 2, cover: 4, binding: 2 }, capacity: 0 },
    firepit: { name: '火塘', seconds: 600, radius: 0.9, needs: { fuel: 3 }, capacity: 0 },
    signal: { name: '海岸求救标记', seconds: 1200, radius: 4, needs: { pole: 6 }, capacity: 0 },
};
// Authored patch-level replenishment, not per-tree yields or measured ecology.
export const RESOURCE_RULES: Record<ResourceKind, { name: string; seconds: number; output: ItemKind | null; capacity: number; renewalPerDay: number; renewal: 'continuous' | 'high_tide' }> = {
    wood: { name: '枯枝散落处', seconds: 45, output: 'branch', capacity: 24, renewalPerDay: 2, renewal: 'continuous' },
    palm: { name: '棕榈叶', seconds: 30, output: 'palm_leaf', capacity: 32, renewalPerDay: 3, renewal: 'continuous' },
    coconuts: { name: '落地椰子', seconds: 90, output: 'coconut', capacity: 8, renewalPerDay: 1.5, renewal: 'continuous' },
    seep: { name: '淡水渗水处', seconds: 1, output: null, capacity: 6000, renewalPerDay: 20000, renewal: 'continuous' },
    reef_food: { name: '潮池', seconds: 180, output: 'fish', capacity: 8, renewalPerDay: 4, renewal: 'high_tide' },
};
export const INITIAL_RESOURCES: Record<string, Resource> = {
    west_wood: { kind: 'wood', position: { x: -710, y: -12 }, stock: 18 },
    west_palm: { kind: 'palm', position: { x: -706, y: 13 }, stock: 24 },
    west_coconuts: { kind: 'coconuts', position: { x: -702, y: 19 }, stock: 6 },
    center_seep: { kind: 'seep', position: { x: -520, y: -35 }, stock: 3500 },
    center_wood: { kind: 'wood', position: { x: -495, y: -22 }, stock: 24 },
    center_palm: { kind: 'palm', position: { x: -470, y: 15 }, stock: 28 },
    north_wood: { kind: 'wood', position: { x: -390, y: -280 }, stock: 20 },
    north_coconuts: { kind: 'coconuts', position: { x: -330, y: -290 }, stock: 8 },
    east_pools: { kind: 'reef_food', position: { x: 800, y: 0 }, stock: 4 },
    south_wood: { kind: 'wood', position: { x: -80, y: 355 }, stock: 24 },
};

// Clusters provide reasons to explore or move home without revealing a global
// resource map. Their actual stocks live in the journey and are observed locally.
const groves = [
    ['northwest', -525, -250], ['midwest', -440, 90], ['center', 20, -100],
    ['northeast', 380, -210], ['southwest', -315, 280], ['southeast', 400, 265],
] as const;
for (const [name, x, y] of groves) {
    INITIAL_RESOURCES[`${name}_grove_fruit`] = { kind: 'coconuts', position: { x, y }, stock: 6 };
    INITIAL_RESOURCES[`${name}_grove_wood`] = { kind: 'wood', position: { x: x - 10, y: y + 6 }, stock: 18 };
    INITIAL_RESOURCES[`${name}_grove_leaves`] = { kind: 'palm', position: { x: x + 8, y: y - 7 }, stock: 24 };
}
const pools = [
    [700, -197], [730, -176], [760, -155], [790, -135], [820, -114], [837, -92],
    [829, -70], [815, -35], [786, 35], [771, 70], [757, 105], [742, 140], [727, 175], [713, 210], [698, 245],
] as const;
pools.forEach(([x, y], i) => { INITIAL_RESOURCES[`coast_pool_${i + 1}`] = { kind: 'reef_food', position: { x, y }, stock: 3 + i % 3 }; });

// Tuning values for play, not medical thresholds or claims about a real person's body.
export const SURVIVAL = {
    maxCarryKg: 18, basketBonusKg: 5,
    dragSpeedFactor: .3, dragExertionFactor: 1.8, coverBodySeconds: 45,
    waterLossRestPerHour: 100, waterLossWorkPerHour: 260, thirstSignal: 1000, lethalWaterDeficit: 6000,
    maxEnergy: 2600, lethalEnergyBalance: -24000, energyRestPerHour: 70, energyWorkPerHour: 170, hungerSignal: 600,
    fatigueWorkPerHour: 7, fatigueRestPerHour: 13, fatigueSignal: 75,
    bladderPerHour: 30, bladderSignal: 350, bladderLimit: 600, bowelSignal: 150, bowelLimit: 300,
    infectionPerHour: 0.002, footDamagePerRoughMetre: 0.00035,
    urineSeconds: 45, fecesSeconds: 120, washSeconds: 60, coverSeconds: 90,
    drinkMlPerSecond: 30, sipMlPerSecond: 10, maxSipMl: 1000, fillMlPerSecond: 50, fireSecondsPerFuel: 1800,
    dryPerSecond: 1 / 10800, rainWetPerSecond: 1 / 600,
    rainCollectionMlPerSecond: 3,
} as const;

// Authored warm-food exposure model, not a food-safety clock or diagnosis.
export const FOOD = {
    riskAfterSeconds: 2 * 3600, odorAfterSeconds: 6 * 3600,
    spoilageIllness: .25, rawFishIllness: .015,
} as const;
export const DRINKING = { portionMl: 250, untreatedIllness: .012, soilingIllness: .004 } as const;
export const HYGIENE = { minimumWashMl: 50, fullWashMl: 500, portionMl: 250 } as const;
// Shallow-water movement and garment contact, not a swimming or wave-force model.
export const WADING = {
    speedLossPerMetre: .6, minimumSpeedFactor: .35, groundContactMetres: .025,
} as const;

export function materialAmounts(items: readonly { kind: ItemKind; units: number }[]) {
    const capabilities: Partial<Record<MaterialCapability, number>> = {}, kinds: Partial<Record<ItemKind, number>> = {};
    for (const input of items) {
        kinds[input.kind] = (kinds[input.kind] ?? 0) + input.units;
        for (const [key, amount] of Object.entries(ITEMS[input.kind].materials)) {
            const capability = key as MaterialCapability;
            capabilities[capability] = (capabilities[capability] ?? 0) + amount * input.units;
        }
    }
    return { capabilities, kinds };
}
export function uniqueMaterials(inputs: MaterialUse[]) { return new Set(inputs.map(i => i.item)).size === inputs.length; }
