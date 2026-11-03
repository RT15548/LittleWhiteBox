// Hand-authored Tool inputs, not evidence of live Map Agent generation quality.
const rect = (id, cat, center, size, material, icon, label) => ({ id, cat, shape: 'rect', geo: { center, size }, material, ...(icon && { icon }), ...(label && { label }) });
const point = (id, at) => ({ id, cat: 'actor', shape: 'icon', kind: 'player', actorKey: 'player', geo: { at } });

export const sceneMapLocations = [
    { key: 'tavern', name: '旧港酒馆', scale: 'room' },
    { key: 'valley', name: '雾杉溪谷', scale: 'outdoor' },
    { key: 'cabin', name: '轨道站 · 观测舱', scale: 'room' },
];

export const sceneMapInputs = [
    {
        scene: 'tavern', mood: 'warm', playerHere: true, viewBox: [0, 0, 720, 580],
        elements: [
            rect('floor', 'terrain', [360, 270], [600, 420], 'wood'),
            { id: 'walls', cat: 'wall', shape: 'path', geo: { points: [[310, 480], [60, 480], [60, 60], [660, 60], [660, 480], [400, 480]] }, closed: false, material: 'stone' },
            rect('bar', 'furniture', [500, 123], [230, 65], 'wood', 'counter', '吧台'),
            rect('shelf', 'furniture', [238, 90], [180, 30], 'wood', 'shelf'),
            rect('rug', 'terrain', [238, 300], [228, 185], 'carpet'),
            rect('table', 'furniture', [238, 290], [110, 75], 'wood', 'table', '长桌'),
            { ...rect('chair-left', 'furniture', [147, 290], [38, 40], 'wood', 'chair'), rotation: 270 },
            { ...rect('chair-right', 'furniture', [329, 290], [38, 40], 'wood', 'chair'), rotation: 90 },
            rect('sofa', 'furniture', [525, 370], [158, 68], 'fabric', 'sofa', '软座'),
            { id: 'door', cat: 'door', shape: 'icon', kind: 'entrance', geo: { at: [355, 480] }, label: '入口' },
            point('player', [395, 250]),
        ],
    },
    {
        scene: 'valley', mood: 'calm', playerHere: true, viewBox: [0, 0, 800, 650],
        elements: [
            { id: 'ground', cat: 'terrain', shape: 'path', geo: { points: [[30, 35], [760, 35], [780, 580], [60, 620]] }, material: 'grass' },
            { id: 'forest-west', cat: 'terrain', shape: 'curve', geo: { curve: [[35, 65], [250, 55], [300, 220], [240, 310], [70, 270]] }, material: 'forest', label: '雾杉林' },
            { id: 'forest-east', cat: 'terrain', shape: 'curve', geo: { curve: [[560, 45], [755, 50], [755, 275], [610, 230]] }, material: 'forest' },
            { id: 'stream', cat: 'water', shape: 'curve', geo: { curve: [[320, 35], [450, 150], [470, 330], [420, 475], [460, 610], [540, 610], [500, 480], [550, 335], [530, 135], [400, 35]] }, closed: true, material: 'water', label: '浅溪' },
            { id: 'trail-west', cat: 'road', shape: 'path', geo: { points: [[80, 480], [245, 400], [415, 360]] }, material: 'dirt' },
            { id: 'trail-east', cat: 'road', shape: 'path', geo: { points: [[570, 330], [650, 390], [730, 475]] }, material: 'dirt' },
            { ...rect('bridge', 'road', [495, 345], [48, 170], 'wood', 'bridge', '木桥'), rotation: 78 },
            { id: 'rock', cat: 'decoration', shape: 'circle', geo: { at: [310, 485], radius: 28 }, material: 'stone', icon: 'rock', label: '溪石' },
            { id: 'tree', cat: 'decoration', shape: 'circle', geo: { at: [660, 525], radius: 40 }, material: 'forest', icon: 'tree' },
            point('player', [340, 395]),
        ],
    },
    {
        scene: 'cabin', mood: 'cold', playerHere: true, viewBox: [0, 0, 720, 580],
        elements: [
            rect('floor', 'terrain', [360, 270], [600, 420], 'metal'),
            { id: 'walls', cat: 'wall', shape: 'path', geo: { points: [[305, 480], [60, 480], [60, 60], [660, 60], [660, 480], [415, 480]] }, closed: false, material: 'metal' },
            rect('observation-glass', 'decoration', [360, 94], [390, 45], 'glass', undefined, '观景窗'),
            rect('table', 'furniture', [220, 260], [130, 75], 'metal', 'table', '操作台'),
            { ...rect('chair', 'furniture', [220, 345], [40, 42], 'metal', 'chair'), rotation: 180 },
            rect('berth', 'furniture', [548, 355], [93, 160], 'fabric', 'bed', '休息床'),
            { id: 'field', cat: 'decoration', shape: 'circle', geo: { at: [438, 235], radius: 43 }, material: 'glass', label: '相位场' },
            { id: 'unknown-device', cat: 'furniture', shape: 'path', geo: { points: [[85, 380], [145, 380], [162, 407], [120, 433], [85, 412]] }, material: 'metal', label: '谐振装置' },
            { id: 'exit', cat: 'door', shape: 'icon', kind: 'exit', geo: { at: [360, 480] }, label: '气闸' },
            point('player', [355, 350]),
        ],
    },
];
