/** Model-facing examples, also exercised through the real tools. Not live-model results. */
export const SCENE_EXAMPLES = [
    {
        background: 'A timber-floored inn taproom has stone walls, a south entrance, a counter against the north wall and a table in the western half. The player has just entered. No exact dimensions or chairs were described.',
        layout: 'Approximate the rectangle around these anchors. Break the south wall at the entrance; keep the route from entrance to counter east of the table clear. One ordinary chair is inferred, faces its table, and is marked accordingly.',
        atlas: { locations: [{ key: 'town', name: 'Riverside Town', scale: 'region' }, { key: 'taproom', name: 'Taproom', scale: 'room', parent: 'town' }] },
        create: {
            scene: 'taproom', playerHere: true, viewBox: [0, 0, 480, 380], mood: 'warm',
            elements: [
                { id: 'floor', cat: 'terrain', shape: 'rect', geo: { center: [240, 170], size: [400, 260] }, material: 'wood' },
                { id: 'wall', cat: 'wall', shape: 'path', geo: { points: [[200, 300], [40, 300], [40, 40], [440, 40], [440, 300], [270, 300]] }, closed: false, material: 'stone' },
                { id: 'counter', cat: 'furniture', shape: 'rect', geo: { center: [240, 75], size: [260, 40] }, icon: 'counter', material: 'wood', label: 'Counter' },
                { id: 'table', cat: 'furniture', shape: 'rect', geo: { center: [130, 185], size: [90, 60] }, icon: 'table', material: 'wood' },
                { id: 'chair', cat: 'furniture', shape: 'rect', geo: { center: [130, 240], size: [32, 34] }, icon: 'chair', material: 'wood', rotation: 180, certainty: 'inferred' },
                { id: 'entrance', cat: 'door', kind: 'entrance', shape: 'icon', geo: { at: [235, 300] }, label: 'Entrance' },
                { id: 'player', cat: 'actor', kind: 'player', actorKey: 'player', shape: 'icon', geo: { at: [235, 265] } },
            ],
        },
        update: {
            evidence: 'The player walks up to the counter. Nothing else changes. Read the existing scene if needed, then move only the player; keep furniture and viewBox.',
            edit: { scene: 'taproom', elements: [{ id: 'player', geo: { at: [235, 125] } }] },
        },
    },
    {
        background: 'In a grassy valley, woodland is northwest, a stream with visible banks bends south through the middle, and a wooden bridge connects west and east trails. The player stands on the west trail.',
        layout: 'Use one forest area without a tree icon. Trace one stream bank downstream and the other back upstream to form its area. Bridge travel is east-west, so rotate its default north-south deck by 90 degrees. Trail vertices are real turns, not decorative handles.',
        atlas: { locations: [{ key: 'highlands', name: 'Highlands', scale: 'region' }, { key: 'valley', name: 'Stream Valley', scale: 'outdoor', parent: 'highlands' }] },
        create: {
            scene: 'valley', playerHere: true, viewBox: [0, 0, 700, 520],
            elements: [
                { id: 'ground', cat: 'terrain', shape: 'rect', geo: { center: [340, 250], size: [640, 460] }, material: 'grass' },
                { id: 'woods', cat: 'terrain', shape: 'path', geo: { points: [[30, 30], [260, 30], [240, 200], [30, 170]] }, closed: true, material: 'forest', label: 'Woodland' },
                { id: 'stream', cat: 'water', shape: 'curve', geo: { curve: [[340, 40], [420, 170], [400, 460], [460, 460], [480, 170], [400, 40]] }, closed: true, material: 'water' },
                { id: 'west-trail', cat: 'road', shape: 'path', geo: { points: [[60, 380], [240, 270], [380, 260]] }, closed: false, material: 'dirt' },
                { id: 'east-trail', cat: 'road', shape: 'path', geo: { points: [[500, 260], [620, 320]] }, closed: false, material: 'dirt' },
                { id: 'bridge', cat: 'road', shape: 'rect', geo: { center: [430, 260], size: [40, 140] }, icon: 'bridge', material: 'wood', rotation: 90, label: 'Bridge' },
                { id: 'player', cat: 'actor', kind: 'player', actorKey: 'player', shape: 'icon', geo: { at: [240, 270] } },
            ],
        },
        update: {
            evidence: 'The player crosses the bridge and stops on its east side. No new trail or destination is established.',
            edit: { scene: 'valley', elements: [{ id: 'player', geo: { at: [530, 275] } }] },
        },
    },
    {
        background: 'A metal-floored orbital cabin has a south hatch, a metal desk to the west, a chair south of it, and an angular metal instrument to the east. The player is just inside the hatch.',
        layout: 'Reuse ordinary table/chair tokens with metal, not wood. Preserve the unfamiliar instrument as its own outline and label without guessing a furniture icon. The central aisle remains clear.',
        atlas: { locations: [{ key: 'station', name: 'Orbital Station', scale: 'region' }, { key: 'cabin', name: 'Orbital Cabin', scale: 'room', parent: 'station' }] },
        create: {
            scene: 'cabin', playerHere: true, viewBox: [0, 0, 600, 440], mood: 'cold',
            elements: [
                { id: 'floor', cat: 'terrain', shape: 'rect', geo: { center: [300, 200], size: [500, 320] }, material: 'metal' },
                { id: 'wall', cat: 'wall', shape: 'path', geo: { points: [[260, 360], [50, 360], [50, 40], [550, 40], [550, 360], [340, 360]] }, closed: false, material: 'metal' },
                { id: 'desk', cat: 'furniture', shape: 'rect', geo: { center: [160, 150], size: [120, 60] }, icon: 'table', material: 'metal' },
                { id: 'chair', cat: 'furniture', shape: 'rect', geo: { center: [160, 235], size: [36, 38] }, icon: 'chair', material: 'metal', rotation: 180 },
                { id: 'instrument', cat: 'furniture', shape: 'path', geo: { points: [[400, 130], [480, 120], [510, 180], [460, 215], [395, 185]] }, closed: true, material: 'metal', label: 'Instrument' },
                { id: 'hatch', cat: 'door', kind: 'door', shape: 'icon', geo: { at: [300, 360] }, label: 'Hatch' },
                { id: 'player', cat: 'actor', kind: 'player', actorKey: 'player', shape: 'icon', geo: { at: [300, 315] } },
            ],
        },
        update: {
            evidence: 'The chair is turned toward the instrument to the east. Its footprint and material stay unchanged.',
            edit: { scene: 'cabin', elements: [{ id: 'chair', rotation: 270 }] },
        },
    },
] as const;

export function sceneExamplesPrompt(): string {
    return [
        '# Worked scene examples',
        'Illustrations of relative layout, not templates to copy into unrelated worlds. Coordinates are approximate; use names in the language of the supplied story.',
        ...SCENE_EXAMPLES.flatMap(example => [
            `Evidence: ${example.background}`,
            `Spatial organization: ${example.layout}`,
            `MapAtlasEdit: ${JSON.stringify(example.atlas)}`,
            `MapSceneEdit: ${JSON.stringify(example.create)}`,
            `Next accepted evidence: ${example.update.evidence}`,
            `MapSceneEdit: ${JSON.stringify(example.update.edit)}`,
        ]),
    ].join('\n');
}
