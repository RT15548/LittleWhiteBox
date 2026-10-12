import { sceneMapInputs } from './scene-maps.js';

// Fixed, hand-authored spatial inputs for cross-theme rendering checks, not Agent scores.
const rect = (id, cat, center, size, material, icon, label) => ({ id, cat, geo: { center, size }, material, ...(icon && { icon }), ...(label && { label }) });
const player = { id: 'player', cat: 'actor', kind: 'player', actorKey: 'player', shape: 'icon', geo: { at: [310, 330] } };
export const sceneVisualInputs = [
    ...structuredClone(sceneMapInputs),
    { scene: 'home', lighting: { space: 'indoor', natural: 'sunlight', artificial: 'off' }, viewBox: [0, 0, 720, 580], elements: [
        rect('floor', 'terrain', [360, 270], [600, 420], 'wood'),
        { id: 'walls', cat: 'wall', geo: { points: [[300, 480], [60, 480], [60, 60], [660, 60], [660, 480], [400, 480]] }, material: 'stone', closed: false },
        rect('rug', 'terrain', [270, 310], [255, 185], 'carpet'),
        rect('sofa', 'furniture', [220, 170], [210, 75], 'fabric', 'sofa', '沙发'),
        rect('table', 'furniture', [240, 305], [110, 65], 'wood', 'table'),
        rect('bed', 'furniture', [530, 210], [125, 210], 'fabric', 'bed', '床'),
        rect('shelf', 'furniture', [535, 425], [170, 35], 'wood', 'shelf'),
        { id: 'plant', cat: 'decoration', geo: { at: [120, 405], radius: 27 }, icon: 'potted-plant', material: 'forest' }, player,
    ] },
    { scene: 'ruins', lighting: { space: 'outdoor', natural: 'sunlight', artificial: 'off' }, viewBox: [0, 0, 720, 580], elements: [
        { id: 'ground', cat: 'terrain', geo: { points: [[40, 80], [220, 35], [625, 65], [685, 305], [570, 500], [130, 490], [35, 300]] }, material: 'dirt' },
        rect('paving', 'terrain', [350, 285], [330, 290], 'stone'),
        { id: 'wall', cat: 'wall', geo: { points: [[100, 390], [70, 175], [150, 80], [560, 80], [650, 190], [625, 390]] }, material: 'stone', closed: false },
        ...[[175, 160], [520, 160], [175, 390], [520, 390]].map(([x, y], i) => ({ id: `column-${i}`, cat: 'decoration', geo: { at: [x, y], radius: 20 }, material: 'marble', icon: 'column' })),
        rect('altar', 'furniture', [350, 155], [115, 65], 'stone', 'table', '祭坛'),
        ...[[110, 410, 30], [560, 410, 40], [585, 125, 30], [220, 75, 18]].map(([x, y, radius], i) => ({ id: `rock-${i}`, cat: 'decoration', geo: { at: [x, y], radius }, material: 'stone', icon: 'rock' })),
        player,
    ] },
    { scene: 'organic', mood: 'mystic', lighting: { space: 'indoor', natural: 'night', artificial: 'on' }, viewBox: [0, 0, 720, 580], elements: [
        { id: 'ground', cat: 'terrain', geo: { curve: [[65, 110], [240, 55], [520, 70], [655, 160], [625, 405], [430, 480], [140, 430]] }, material: 'blood' },
        { id: 'walls', cat: 'wall', geo: { curve: [[210, 450], [90, 400], [65, 110], [240, 55], [520, 70], [655, 160], [625, 405], [460, 465]] }, closed: false, material: 'blood' },
        { id: 'tendril-a', cat: 'decoration', shape: 'curve', geo: { curve: [[105, 135], [235, 170], [330, 270], [390, 310]] }, closed: false, material: 'forest', label: '藤蔓' },
        { id: 'tendril-b', cat: 'decoration', shape: 'curve', geo: { curve: [[575, 130], [470, 195], [520, 295], [450, 385]] }, closed: false, material: 'blood', label: '触手' },
        { id: 'slime', cat: 'actor', actorKey: 'slime', shape: 'circle', geo: { at: [180, 315], radius: 38 }, material: 'water', label: '史莱姆' },
        { id: 'lamp', cat: 'light', geo: { at: [515, 355], radius: 35 }, material: 'cold-light' },
        player,
    ] },
];
