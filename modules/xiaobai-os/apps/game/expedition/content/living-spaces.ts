import type { CourtyardScene, DistrictScene, LivingScene } from './world-types.js';
import type { LandscapeFeature } from '../world/landscape.js';
import type { Point } from '../types.js';
import { feature } from './landscape-content.js';

interface LivingSpace {
    name: string;
    household: readonly ('sanniang' | 'laobai' | 'kouzi' | 'anian' | 'player' | 'anian_parents' | 'innkeeper')[];
    use: string; enclosure: string;
    width: number; depth: number;
    doors: readonly { side: 'north' | 'south'; to: CourtyardScene; arrival: string }[];
    furniture: readonly (LandscapeFeature & { label: string })[];
}
const furnishing = (id: string, label: string, kind: LandscapeFeature['kind'], x: number, z: number, width: number, depth: number,
    options: Partial<Pick<LandscapeFeature, 'tint' | 'height'>> = {}) => ({ ...feature(id, kind, x, z, width, depth, options), label });

/** Room facts and physical furnishings share this source. Ownership is world content, not a property save. */
export const LIVING_SPACES = {
    clinic_front: {
        name: '诊棚 · 接诊间', household: ['sanniang'], use: '三娘接诊、换药与整理药材的前间，病人会来候诊。',
        enclosure: '临街木门经过后掩上；北侧木门通向三娘的起居后间。候诊处与诊床间有屏风。',
        width: 24, depth: 22,
        doors: [{ side: 'south', to: 'camp', arrival: 'clinic_front' }, { side: 'north', to: 'sanniang_room', arrival: 'south' }],
        furniture: [
            furnishing('examination', '铺白布的诊床', 'bed', -5.5, -3.5, 3, 5, { tint: 'sage' }),
            furnishing('screen', '遮住诊床的屏风', 'screen', -2.5, -3, 1, 6),
            furnishing('apothecary', '分格药柜', 'cabinet', 7, -7, 6, 2, { tint: 'sage' }),
            furnishing('medicine', '药碗与药材工作台', 'medicine', 7, -2, 6, 2),
            furnishing('wash', '洗手盆与清水罐', 'basin', -8, -8, 2, 2),
            furnishing('waiting', '候诊长凳', 'bench', -7, 6, 6, 2),
        ],
    },
    sanniang_room: {
        name: '三娘的起居后间', household: ['sanniang'], use: '三娘在诊棚后的日常住处，与接诊间分开。',
        enclosure: '木门通接诊间，经过后掩上；窗帘遮住临巷的窗，门外的说话声仍可能传进来。',
        width: 18, depth: 18, doors: [{ side: 'south', to: 'clinic_front', arrival: 'north' }],
        furniture: [
            furnishing('bed', '床与叠好的薄被', 'bed', -4.5, -4, 3, 4, { tint: 'rose' }),
            furnishing('wardrobe', '衣柜与换洗衣物', 'wardrobe', 5, -7, 6, 2, { tint: 'rose' }),
            furnishing('tea', '放着茶具和书的矮桌', 'table', 4, 1, 4, 2),
            furnishing('chair', '桌边的木椅', 'chair', 4, 4, 2, 2),
            furnishing('wash', '梳洗盆与毛巾', 'basin', -7, 4, 2, 2),
        ],
    },
    inn: {
        name: '小客店 · 前厅', household: ['innkeeper'], use: '檐下供过路人投宿的小客店，共用前厅。',
        enclosure: '临街木门与客房门相隔一个前厅，店家在柜台边照看生意。',
        width: 24, depth: 22, doors: [{ side: 'south', to: 'camp', arrival: 'inn' }, { side: 'north', to: 'guest_room', arrival: 'south' }],
        furniture: [
            furnishing('counter', '店家的柜台与登记簿', 'ledger', 7, -5, 6, 2),
            furnishing('shelf', '碗盏与备用被褥柜', 'cabinet', 7, -9, 6, 2),
            furnishing('table', '共用饭桌', 'table', -5, 0, 4, 4),
            furnishing('seats', '饭桌旁的长凳', 'bench', -5, 4, 4, 2),
            furnishing('stove', '温着水的小炉', 'stove', -8, -7, 2, 2),
        ],
    },
    guest_room: {
        name: '小客店 · 旅人客房', household: ['player'], use: '旅人在檐下投宿的一间客房，暂住，不是自有房产。',
        enclosure: '独立木门通前厅，经过后掩上；有窗帘，木隔墙不完全隔音。',
        width: 18, depth: 18, doors: [{ side: 'south', to: 'inn', arrival: 'north' }],
        furniture: [
            furnishing('bed', '客床与干净被褥', 'bed', -4.5, -3, 3, 4, { tint: 'sage' }),
            furnishing('chest', '放行囊的矮柜', 'cabinet', 5, -6, 4, 2, { height: 1.2 }),
            furnishing('table', '带烛台的小桌', 'table', 5, 0, 4, 2),
            furnishing('chair', '木椅', 'chair', 5, 3, 2, 2),
            furnishing('wash', '水盆与毛巾', 'basin', -7, 4, 2, 2),
        ],
    },
    laobai_home: {
        name: '老白的小屋', household: ['laobai'], use: '外门附近，老白离开父母家后独住的小屋；门楼是工作点。',
        enclosure: '独立木门临街，经过后掩上；窄窗挂着旧布帘，能听见外门的动静。',
        width: 18, depth: 18, doors: [{ side: 'south', to: 'camp', arrival: 'laobai_home' }],
        furniture: [
            furnishing('bed', '靠墙的单人床', 'bed', -4.5, -4, 3, 4, { tint: 'sage' }),
            furnishing('kit', '衣物柜与守门用具', 'wardrobe', 6, -7, 4, 2),
            furnishing('table', '饭碗与水壶所在的桌子', 'table', 5, -1, 4, 2),
            furnishing('chair', '旧木椅', 'chair', 5, 2, 2, 2),
            furnishing('stove', '墙角的小炉', 'stove', -7, 5, 2, 2),
        ],
    },
    kouzi_home: {
        name: '扣子的管边小窝', household: ['kouzi'], use: '扣子在管线旁自搭的住处，修缮工具和睡铺挤在同一间。',
        enclosure: '木板门经过后掩上，板壁接缝透进管架的光；热管的震声穿过墙板。',
        width: 18, depth: 18, doors: [{ side: 'south', to: 'camp', arrival: 'kouzi_home' }],
        furniture: [
            furnishing('bed', '挤在工具旁的睡铺', 'bed', -4.5, -3, 3, 4, { tint: 'amber' }),
            furnishing('bench', '钳子、扳手与零件工作台', 'workbench', 5, -4, 6, 2),
            furnishing('rack', '铜管短料与工具架', 'toolrack', 5, -7, 6, 2),
            furnishing('chair', '修理凳', 'chair', 5, -1, 2, 2),
            furnishing('wash', '搪洗盆', 'basin', -7, 5, 2, 2),
        ],
    },
    anian_home: {
        name: '阿念家 · 起居间', household: ['anian', 'anian_parents'], use: '阿念与父母同住的家，共用起居间供一家吃饭、做活。父母睡处在屏风后。',
        enclosure: '临街木门经过后掩上；北侧木门通阿念的睡处。父母在家做活，起居间不是空屋。',
        width: 26, depth: 24, doors: [{ side: 'south', to: 'camp', arrival: 'anian_home' }, { side: 'north', to: 'anian_room', arrival: 'south' }],
        furniture: [
            furnishing('table', '一家人吃饭的桌子', 'table', -5, 3, 4, 4),
            furnishing('bench', '桌边长凳', 'bench', -5, 7, 4, 2),
            furnishing('work', '父亲修铜管的工作台', 'workbench', 8, -6, 6, 2),
            furnishing('sewing', '母亲的衣料柜', 'wardrobe', 8, 0, 6, 2, { tint: 'rose' }),
            furnishing('parents_bed', '父母的床铺', 'bed', -7, -6, 4, 4),
            furnishing('screen', '遮住父母睡处的屏风', 'screen', -7, -1.5, 6, 1),
        ],
    },
    anian_room: {
        name: '阿念的睡处', household: ['anian'], use: '阿念在父母家中的小房间。',
        enclosure: '木门与起居间相隔，经过后掩上；有窗帘，隔壁父母做活与说话的声音可闻。',
        width: 18, depth: 18, doors: [{ side: 'south', to: 'anian_home', arrival: 'north' }],
        furniture: [
            furnishing('bed', '小床与洗净的被单', 'bed', -4.5, -3, 3, 4, { tint: 'rose' }),
            furnishing('clothes', '衣物柜', 'wardrobe', 5, -6, 6, 2, { tint: 'rose' }),
            furnishing('desk', '临窗小桌', 'table', 5, 0, 4, 2),
            furnishing('chair', '木椅', 'chair', 5, 3, 2, 2),
            furnishing('wash', '洗脸盆', 'basin', -7, 5, 2, 2),
        ],
    },
} as const satisfies Record<LivingScene, LivingSpace>;

/** Existing street buildings keep their collision footprints and saved coordinates. */
export const LIVING_ENTRANCES: readonly { to: LivingScene; building: string; position: Point }[] = [
    { to: 'clinic_front', building: 'clinic', position: { x: -19, y: 12 } },
    { to: 'inn', building: 'arrival-home', position: { x: -27, y: 32.5 } },
    { to: 'laobai_home', building: 'roadside-workshop', position: { x: -17, y: -32.5 } },
    { to: 'kouzi_home', building: 'eastern-workshop', position: { x: 28, y: 34.5 } },
    { to: 'anian_home', building: 'eastern-home', position: { x: 15, y: 23.5 } },
];
export function livingSpace(scene: CourtyardScene): LivingSpace | undefined { return Object.hasOwn(LIVING_SPACES, scene) ? LIVING_SPACES[scene as LivingScene] : undefined; }
export function districtScene(scene: CourtyardScene): DistrictScene { return livingSpace(scene) ? 'camp' : scene as DistrictScene; }
