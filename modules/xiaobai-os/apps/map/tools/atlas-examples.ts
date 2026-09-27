/** Executable tool inputs. Also used by production-component acceptance, never by rendering recipes. */
const rect = (x: number, y: number, width: number, height: number) => ({ shape: 'rect', x, y, width, height });
const contour = (points: number[][]) => ({ shape: 'curve', closed: true, points });
const area = (id: string, role: string, material: string, geometry: unknown, form?: string) => ({ id, map: null, role, material, geometry, ...(form ? { form } : {}) });
const regionMaps = [
    { map: 'west', mapping: { map: null, scale: 1, offset: [0, 0] }, boundary: 'west-boundary' },
    { map: 'east', mapping: { map: null, scale: 1, offset: [500, 0] }, boundary: 'east-boundary' },
];
const boundaries = ['west', 'east'].map(map => ({ id: `${map}-boundary`, map, role: 'boundary', material: 'unknown', geometry: rect(0, 0, 500, 600) }));
const river = { id: 'river', map: null, role: 'channel', material: 'water', geometry: { shape: 'curve', points: [[0, 300], [250, 270], [550, 330], [780, 260], [1000, 300]], width: 44 } };

const themes = [
    { id: 'nature', name: 'Riverlands', features: [area('land', 'surface', 'grass', contour([[0, 80], [250, 10], [520, 40], [900, 0], [1000, 250], [960, 520], [690, 600], [330, 540], [40, 600]])), area('forest', 'cover', 'forest', contour([[90, 150], [220, 70], [410, 120], [620, 80], [900, 210], [800, 410], [620, 450], [350, 380], [170, 480]]), 'forest'), area('ridge', 'relief', 'stone', contour([[410, 100], [610, 35], [780, 55], [900, 150], [720, 220], [530, 190]]), 'ridge'), river] },
    { id: 'desert', name: 'Dune Sea', features: [area('sand', 'surface', 'sand', rect(0, 0, 1000, 600), 'dunes'), area('canyon', 'relief', 'rock', rect(540, 80, 340, 160), 'ridge'), area('oasis', 'cover', 'water', { shape: 'circle', x: 210, y: 380, radius: 80 }), area('palms', 'cover', 'forest', rect(90, 300, 220, 180), 'forest')] },
    { id: 'city', name: 'Riverport', features: [area('land', 'surface', 'grass', rect(0, 0, 1000, 600)), area('city', 'cover', 'stone', rect(100, 100, 680, 350), 'blocks'), area('park', 'cover', 'forest', rect(340, 110, 120, 110), 'forest'), river, { id: 'avenue', map: null, role: 'channel', material: 'stone', geometry: { shape: 'path', points: [[80, 180], [850, 180]], width: 24 } }, { id: 'landmark', map: 'west', role: 'structure', material: 'tile', destination: 'station', geometry: rect(145, 135, 55, 50) }] },
    { id: 'ocean', name: 'Open Water', features: [area('sea', 'environment', 'water', rect(0, 0, 1000, 600)), area('island', 'surface', 'sand', { shape: 'circle', x: 230, y: 210, radius: 110 }), { ...area('platform', 'surface', 'metal', rect(560, 310, 240, 140)), crosses: ['sea'] }, { ...area('platform-buildings', 'structure', 'metal', rect(580, 330, 180, 100), 'compact'), support: 'platform' }, { id: 'lane', map: null, role: 'channel', material: 'cold-light', geometry: { shape: 'curve', points: [[340, 220], [450, 270], [560, 380]], width: 8 } }] },
    { id: 'megastructure', name: 'Orbital Deck', features: [area('void', 'environment', 'vacuum', rect(0, 0, 1000, 600)), area('deck', 'surface', 'metal', rect(80, 80, 820, 440)), { ...area('modules', 'structure', 'metal', rect(130, 120, 700, 350), 'blocks'), support: 'deck' }, { id: 'corridor', map: null, role: 'channel', material: 'cold-light', support: 'deck', geometry: { shape: 'path', points: [[100, 290], [800, 290], [800, 460]], width: 35 } }] },
    { id: 'space', name: 'Helix Sector', features: [area('vacuum', 'environment', 'vacuum', rect(0, 0, 1000, 600)), area('nebula', 'cover', 'cloud', { shape: 'circle', x: 680, y: 330, radius: 190 }, 'nebula'), area('planet', 'surface', 'rock', { shape: 'circle', x: 250, y: 230, radius: 100 }, 'celestial'), area('belt', 'cover', 'rock', rect(420, 50, 480, 160), 'asteroids'), area('station-hull', 'structure', 'metal', rect(120, 420, 170, 60), 'compact')] },
    { id: 'fantasy', name: 'Sky Fracture', features: [area('aether', 'environment', 'cloud', rect(0, 0, 1000, 600)), { ...area('floating-island', 'surface', 'grass', { shape: 'path', points: [[100, 180], [320, 90], [440, 220], [290, 390], [80, 300]], closed: true }), crosses: ['aether'] }, { ...area('grove', 'cover', 'forest', rect(100, 170, 230, 160), 'forest'), support: 'floating-island' }, { id: 'rift', map: null, role: 'channel', material: 'rune', geometry: { shape: 'path', points: [[630, 60], [570, 260], [720, 370], [650, 540]], width: 35 } }] },
];

export const ATLAS_EXAMPLES = themes.map(theme => ({
    id: theme.id,
    name: theme.name,
    input: {
        locations: [
            { key: 'west', name: `${theme.name} West`, scale: 'region', position: { map: null, at: [220, 220] } },
            { key: 'east', name: `${theme.name} East`, scale: 'region', position: { map: null, at: [730, 220] } },
            { key: 'station', name: 'Station', parent: 'west', scale: 'building', position: { map: 'west', at: [170, 160] } },
            { key: 'unlocated', name: 'Unlocated destination', parent: 'west', scale: 'outdoor' },
        ],
        maps: regionMaps,
        features: [...boundaries, ...theme.features],
        actors: [{ actorKey: 'player', locationKey: 'station' }],
    },
    patch: { features: [{ id: theme.features[0].id, name: `${theme.name} expanse` }] },
}));

export function atlasExamplesPrompt(): string {
    return ['## Atlas examples (not exhaustive)',
        'Each map starts with its environment or main surface. These are relative layouts, not templates for unrelated worlds. Use names in the story’s language.',
        ...ATLAS_EXAMPLES.filter(e => ['nature', 'city', 'space'].includes(e.id)).map(e => `${e.name}: MapAtlasEdit(${JSON.stringify(e.input)})`),
    ].join('\n');
}
