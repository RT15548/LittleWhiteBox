// Hand-authored MapSceneEdit calls, compiled by the production tool path in tests and previews.
const object = (icon, center, size, label, material, rotation = 0) => ({ id: icon, cat: 'furniture', shape: 'rect', geo: { center, size }, icon, label, ...(material && { material }), rotation });
const round = (icon, at, radius, label, material) => ({ id: icon, cat: 'decoration', shape: 'circle', geo: { at, radius }, icon, label, ...(material && { material }) });
const player = at => ({ id: 'player', cat: 'actor', kind: 'player', actorKey: 'player', geo: { at } });
const entrance = at => ({ id: 'entrance', cat: 'door', kind: 'entrance', icon: 'door-open', label: '入口', geo: { at } });
const room = material => [
    { id: 'floor', cat: 'terrain', geo: { center: [380, 280], size: [660, 440] }, material },
    { id: 'walls', cat: 'wall', geo: { points: [[330, 500], [50, 500], [50, 60], [710, 60], [710, 500], [430, 500]] }, material: 'stone', closed: false },
    entrance([380, 500]), player([390, 390]),
];

export const sceneObjectInputs = [
    { scene: 'guesthouse', title: '岸边旅舍 · 公共起居室', playerHere: true, viewBox: [0, 0, 760, 580], mood: 'warm', elements: [
        ...room('wood'),
        object('shelf', [155, 90], [150, 32], '书架', 'wood'),
        object('sofa', [185, 192], [160, 68], '沙发', 'fabric'),
        object('table', [185, 290], [114, 60], '茶桌', 'wood'),
        object('chair', [282, 290], [40, 40], '单椅', 'wood', 90),
        object('bed', [600, 184], [76, 152], '休息床', 'fabric'),
        object('cabinet', [666, 118], [52, 55], '柜', 'wood'),
        object('chest', [600, 306], [54, 50], '行李箱', 'wood'),
        object('counter', [466, 92], [150, 48], '茶水台', 'wood'),
        round('stool', [456, 160], 19, '凳', 'wood'),
        round('barrel', [668, 402], 24, '储物桶', 'wood'),
        object('bench', [175, 450], [110, 40], '长凳', 'wood'),
        round('potted-plant', [86, 373], 18, '盆栽'),
        round('light', [85, 179], 14, '落地灯'),
    ] },
    { scene: 'utilities', title: '旅舍 · 厨房与盥洗间', playerHere: true, viewBox: [0, 0, 760, 580], mood: 'neutral', elements: [
        ...room('tile'),
        { id: 'divider', cat: 'wall', geo: { points: [[397, 60], [397, 330]] }, material: 'tile', closed: false },
        object('counter', [160, 135], [126, 58], '备餐台', 'wood'),
        object('stove', [278, 135], [62, 65], '炉灶'),
        object('refrigerator', [117, 342], [75, 50], '冰箱'),
        object('sink', [307, 340], [62, 65], '水槽', 'tile'),
        object('bathtub', [604, 182], [82, 174], '浴缸'),
        object('toilet', [477, 166], [42, 65], '马桶'),
        round('potted-plant', [640, 402], 21, '盆栽'),
    ] },
    { scene: 'workshop', title: '北岸检修工坊', playerHere: true, viewBox: [0, 0, 760, 580], mood: 'cold', elements: [
        ...room('metal'),
        object('machine', [168, 168], [98, 95], '检修设备', 'metal'),
        object('terminal', [308, 131], [68, 56], '操作终端', 'metal'),
        object('vending-machine', [640, 130], [59, 53], '自动售货机', 'metal'),
        object('car', [570, 330], [103, 185], '停放车辆', 'metal'),
        object('partition', [183, 277], [150, 30], '隔断', 'metal'),
        object('ladder', [95, 424], [35, 22], '梯具', 'metal'),
        object('sign', [673, 447], [47, 26], '出入指示', 'metal'),
    ] },
    { scene: 'courtyard', title: '溪畔庭院', playerHere: true, scale: 'outdoor', viewBox: [0, 0, 880, 660], mood: 'calm', elements: [
        { id: 'ground', cat: 'terrain', geo: { center: [440, 310], size: [780, 520] }, material: 'grass' },
        { id: 'water', cat: 'water', geo: { points: [[630, 50], [702, 50], [733, 270], [700, 570], [624, 570], [657, 270]] }, material: 'water', closed: true },
        { id: 'fence', cat: 'decoration', shape: 'path', icon: 'fence', label: '围栏', geo: { points: [[342, 570], [50, 570], [50, 50], [600, 50]] }, closed: false, material: 'wood' },
        { id: 'east-fence', cat: 'decoration', shape: 'curve', icon: 'fence', geo: { curve: [[732, 50], [830, 80], [830, 570], [440, 570]] }, closed: false, material: 'wood' },
        round('column', [323, 540], 17, '门柱', 'stone'),
        round('fountain', [420, 226], 59, '喷泉', 'marble'),
        round('well', [558, 442], 34, '水井', 'stone'),
        object('statue', [457, 103], [61, 41], '雕塑', 'stone'),
        object('tent', [173, 166], [128, 124], '帐篷', 'fabric'),
        round('fire', [245, 328], 27, '火堆'),
        round('tree', [760, 169], 44, '树', 'forest'),
        round('rock', [760, 476], 37, '岩石', 'stone'),
        object('flag', [100, 440], [33, 27], '旗帜', 'fabric'),
        object('sign', [455, 510], [49, 23], '庭院入口', 'wood'),
        object('bridge', [690, 323], [50, 151], '桥', 'wood', 90),
        player([377, 459]), entrance([384, 570]),
    ] },
];
