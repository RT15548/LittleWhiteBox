import type {
    MapElement,
    MapElementCategory,
    MapElementKind,
    MapIconToken,
    MapLinkKind,
    MapLocationScale,
    MapSceneMood,
} from '../../../domains/map/types.js';
import { isAreaElement, sceneElementBounds } from './scene-geometry.js';
import { materialPaint } from './scene-materials.js';
import type { MapObjectIcon } from '../../../domains/map/semantics.js';

const OBJECT_FALLBACKS: Readonly<Record<MapObjectIcon, string>> = {
    chair: '椅', stool: '凳', bench: '长凳', sofa: '沙发', bed: '床', table: '桌', counter: '台', shelf: '架', cabinet: '柜', chest: '箱', barrel: '桶',
    stove: '灶', refrigerator: '冰箱', sink: '水槽', toilet: '厕', bathtub: '浴缸', terminal: '终端', machine: '机械', 'vending-machine': '售货', car: '车',
    column: '柱', partition: '屏风', fence: '围栏', 'door-open': '门', ladder: '梯', statue: '雕像', well: '井', fountain: '喷泉', bridge: '桥', tent: '帐篷',
    tree: '树', 'potted-plant': '盆栽', rock: '石', light: '灯', fire: '火', flag: '旗', sign: '牌',
};

export interface MapElementRecipe {
    stroke: string;
    fill: string;
    width: number;
    dash?: string;
}

export interface MapElementPresentation extends MapElementRecipe {
    fill: string;
    opacity: number;
    dash?: string;
    icon: string;
    fallback: string;
    z: number;
}

export interface MapMoodRecipe {
    background: string;
    glow: string;
    accent: string;
}

const CATEGORY_RECIPES: Readonly<Record<MapElementCategory, MapElementRecipe>> = Object.freeze({
    wall: { stroke: 'var(--scene-edge)', fill: 'none', width: 6 },
    road: { stroke: 'var(--scene-road)', fill: 'var(--scene-road)', width: 8 },
    water: { stroke: 'var(--scene-water-edge)', fill: 'var(--scene-water)', width: 3 },
    terrain: { stroke: 'var(--scene-soft-edge)', fill: 'var(--scene-ground)', width: .8 },
    furniture: { stroke: 'var(--scene-edge)', fill: 'var(--scene-object)', width: 1 },
    decoration: { stroke: 'var(--scene-soft-edge)', fill: 'var(--scene-object)', width: 1 },
    door: { stroke: 'var(--map-accent)', fill: 'var(--scene-object)', width: 2 },
    danger: { stroke: '#ff6d7a', fill: 'rgba(218, 52, 72, .24)', width: 2.6, dash: '7 4' },
    marker: { stroke: '#66d9ff', fill: 'rgba(48, 166, 222, .22)', width: 2.2 },
    actor: { stroke: '#f4f8ff', fill: '#167fc3', width: 2.2 },
    label: { stroke: 'none', fill: '#e9f4ff', width: 0 },
    grid: { stroke: '#54738d', fill: 'none', width: 1, dash: '2 5' },
    magic: { stroke: '#c18cff', fill: 'rgba(139, 83, 213, .25)', width: 2.5 },
    secret: { stroke: '#8198aa', fill: 'rgba(74, 96, 113, .20)', width: 2, dash: '3 6' },
    light: { stroke: '#ffe49a', fill: 'rgba(255, 210, 91, .22)', width: 1.5 },
});

export const MAP_CATEGORY_LABELS: Readonly<Record<MapElementCategory, string>> = Object.freeze({
    wall: '墙体',
    road: '道路',
    water: '水域',
    terrain: '地形',
    furniture: '家具',
    decoration: '陈设',
    door: '出入口',
    danger: '危险',
    marker: '标记',
    actor: '人物',
    label: '标注',
    grid: '网格',
    magic: '魔法',
    secret: '未知',
    light: '光源',
});

const KIND_ICONS: Readonly<Record<MapElementKind, string>> = Object.freeze({
    door: 'door_open',
    stairs: 'stairs',
    elevator: 'elevator',
    portal: 'captive_portal',
    passage: 'conversion_path',
    entrance: 'login',
    exit: 'exit_to_app',
    north: 'north',
    south: 'south',
    east: 'east',
    west: 'west',
    up: 'arrow_upward',
    down: 'arrow_downward',
    trap: 'warning',
    chest: 'inventory_2',
    marker: 'location_on',
    player: 'person_pin_circle',
    actor: 'person',
});

const KIND_FALLBACKS: Readonly<Record<MapElementKind, string>> = Object.freeze({
    door: 'D',
    stairs: 'S',
    elevator: 'E',
    portal: 'O',
    passage: 'P',
    entrance: 'I',
    exit: 'O',
    north: 'N',
    south: 'S',
    east: 'E',
    west: 'W',
    up: '↑',
    down: '↓',
    trap: '!',
    chest: 'X',
    marker: '+',
    player: 'P',
    actor: 'A',
});

const ICON_TOKENS: Readonly<Record<MapIconToken, string>> = Object.freeze({
    'door-open': 'door_open',
    stairs: 'stairs',
    elevator: 'elevator',
    portal: 'captive_portal',
    passage: 'conversion_path',
    entrance: 'login',
    exit: 'exit_to_app',
    north: 'north',
    south: 'south',
    east: 'east',
    west: 'west',
    up: 'arrow_upward',
    down: 'arrow_downward',
    trap: 'warning',
    chest: 'inventory_2',
    marker: 'location_on',
    player: 'person_pin_circle',
    actor: 'person',
    chair: 'chair',
    table: 'table_restaurant',
    bed: 'bed',
    counter: 'countertops',
    shelf: 'shelves',
    sofa: 'weekend',
    bridge: 'road',
    tree: 'park',
    rock: 'landscape',
    building: 'apartment',
    fire: 'local_fire_department',
    light: 'lightbulb',
    water: 'water_drop',
    stool: 'chair_alt', bench: 'event_seat', cabinet: 'kitchen', barrel: 'propane_tank',
    stove: 'oven_gen', refrigerator: 'kitchen', sink: 'countertops', toilet: 'wc', bathtub: 'bathtub',
    terminal: 'computer', machine: 'precision_manufacturing', 'vending-machine': 'point_of_sale', car: 'directions_car',
    column: 'account_balance', partition: 'view_column', fence: 'fence', ladder: 'format_line_spacing', statue: 'architecture',
    well: 'water_pump', fountain: 'water', tent: 'camping', 'potted-plant': 'potted_plant', flag: 'flag', sign: 'signpost',
});

const CATEGORY_ICONS: Readonly<Record<MapElementCategory, string>> = Object.freeze({
    wall: 'architecture',
    road: 'route',
    water: 'water_drop',
    terrain: 'terrain',
    furniture: 'chair',
    decoration: 'category',
    door: 'door_open',
    danger: 'warning',
    marker: 'location_on',
    actor: 'person',
    label: 'label',
    grid: 'grid_on',
    magic: 'auto_awesome',
    secret: 'visibility_off',
    light: 'lightbulb',
});

const CATEGORY_Z: Readonly<Record<MapElementCategory, number>> = Object.freeze({
    terrain: 10,
    water: 20,
    grid: 25,
    road: 30,
    wall: 40,
    furniture: 50,
    decoration: 52,
    door: 55,
    danger: 60,
    secret: 62,
    magic: 65,
    light: 70,
    marker: 80,
    actor: 85,
    label: 90,
});

export const MAP_MOOD_RECIPES: Readonly<Record<MapSceneMood, MapMoodRecipe>> = Object.freeze({
    neutral: { background: '#071019', glow: 'rgba(59, 157, 219, .13)', accent: '#55baff' },
    warm: { background: '#130e0b', glow: 'rgba(235, 142, 65, .14)', accent: '#f2ad68' },
    cold: { background: '#07121b', glow: 'rgba(88, 190, 231, .14)', accent: '#73d2f4' },
    dark: { background: '#05070a', glow: 'rgba(92, 114, 137, .10)', accent: '#8aa6bd' },
    mystic: { background: '#0d0a17', glow: 'rgba(156, 94, 231, .16)', accent: '#c89aff' },
    danger: { background: '#16090d', glow: 'rgba(239, 66, 85, .15)', accent: '#ff7180' },
    calm: { background: '#071411', glow: 'rgba(61, 189, 158, .13)', accent: '#69d8b8' },
});

export const MAP_SCALE_LABELS: Readonly<Record<MapLocationScale, string>> = Object.freeze({
    world: '世界',
    region: '区域',
    city: '城市',
    district: '区域',
    building: '建筑',
    floor: '楼层',
    room: '房间',
    outdoor: '户外',
});

export const MAP_LINK_LABELS: Readonly<Record<MapLinkKind, string>> = Object.freeze({
    door: '门',
    stairs: '楼梯',
    elevator: '电梯',
    path: '小径',
    road: '道路',
    portal: '传送门',
    passage: '通道',
});

function stableText(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
}

export function elementPresentation(element: MapElement, patternPrefix: string): MapElementPresentation {
    const recipe = CATEGORY_RECIPES[element.category];
    const area = isAreaElement(element);
    const materialFill = area && (element.material || element.category === 'water')
        ? materialPaint(element.material || 'water', patternPrefix)
        : '';
    const certaintyDash = element.certainty === 'inferred'
        ? '8 6'
        : element.certainty === 'unknown' ? '3 7' : recipe.dash;
    return {
        ...recipe,
        fill: area ? materialFill || recipe.fill : 'none',
        opacity: element.certainty === 'unknown' ? 0.48 : element.certainty === 'inferred' ? 0.72 : 1,
        dash: certaintyDash,
        icon: element.icon ? ICON_TOKENS[element.icon] : element.kind ? KIND_ICONS[element.kind] : CATEGORY_ICONS[element.category],
        fallback: element.kind ? KIND_FALLBACKS[element.kind] : element.icon && Object.hasOwn(OBJECT_FALLBACKS, element.icon)
            ? OBJECT_FALLBACKS[element.icon as MapObjectIcon] : MAP_CATEGORY_LABELS[element.category].slice(0, 1),
        z: CATEGORY_Z[element.category],
    };
}

export function sortedSceneElements(elements: readonly MapElement[]): MapElement[] {
    const area = (element: MapElement): number => {
        if (!isAreaElement(element)) {return 0;}
        const b = sceneElementBounds(element);
        return b.width * b.height;
    };
    return [...elements].sort((left, right) => (
        CATEGORY_Z[left.category] - CATEGORY_Z[right.category] || area(right) - area(left) || stableText(left.id, right.id)
    ));
}
