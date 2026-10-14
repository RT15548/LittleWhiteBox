import { defineLandscapeScene } from '../../world/landscape.js';
import { feature as f } from '../landscape-content.js';

export const DEEP_WATERWAY = defineLandscapeScene({
    id: 'deep_waterway', safe: true,
    anchors: { kouzi_home: { x: 0, y: 29 }, south_street: { x: 0, y: -29 }, workshop_street: { x: 16, y: -18 }, receipt: { x: -9, y: 2 }, winch: { x: -3, y: -19 } },
    exits: [{ id: 'kouzi_home', anchor: 'kouzi_home', to: 'kouzi_home', arrival: 'north' },
        { id: 'south_street', anchor: 'south_street', to: 'south_street', arrival: 'deep_waterway', condition: { all: ['deep_gate_opened'] } },
        { id: 'workshop_street', anchor: 'workshop_street', to: 'workshop_street', arrival: 'deep_waterway', condition: { all: ['deep_route_shared'] } }],
    objects: [{ id: 'deep_receipt', anchor: 'receipt', kind: 'inspect', passage: 'deep_receipt' },
        { id: 'deep_gate', anchor: 'winch', kind: 'inspect', passage: 'deep_gate', condition: { all: ['deep_route_agreed'] } }],
    landscape: { bounds: { x: 0, z: 0, width: 48, depth: 72 }, vista: 'interior', surface: 'wet',
        gates: [{ id: 'deep_gate', footprint: { x: 0, z: -25, width: 44, depth: 2 }, condition: { all: ['deep_gate_opened'] } }],
        roads: [{ points: [[0, 31], [-7, 13], [-7, 0], [0, -13], [0, -31]], width: 5 }, { points: [[0, -18], [17, -18]], width: 4 }],
        suspended: [{ kind: 'pipe', from: [-19, 4, 30], to: [-19, 4, -30] }],
        features: [f('trade-box', 'supplies', -14, 2, 4, 4), f('water', 'water', 9, 7, 8, 24),
            f('winch', 'toolrack', -7, -23, 4, 2),
            f('west-ruin', 'ruin', -14, -15, 6, 8, { height: 5 }), f('east-ruin', 'ruin', 15, -29, 10, 6, { height: 5 }),
            f('south-column', 'column', 10, 25, 4, 4, { height: 7 }),
            f('west-wall', 'wall', -23, 0, 2, 72, { height: 7 }), f('east-wall', 'wall', 23, 0, 2, 72, { height: 7 }),
            f('north-wall', 'wall', 0, -35, 48, 2, { height: 7 }), f('south-wall', 'wall', 0, 35, 48, 2, { height: 7 })] },
});

export const COAL_STORE = defineLandscapeScene({
    id: 'coal_store', safe: false,
    anchors: { workshop_street: { x: 0, y: 29 }, encounter: { x: 0, y: 13 }, guard: { x: 0, y: -6 },
        archer: { x: -13, y: -18 }, bomber: { x: 13, y: -18 }, flank: { x: 13, y: 5 }, reward: { x: 0, y: -27 } },
    exits: [{ id: 'workshop_street', anchor: 'workshop_street', to: 'workshop_street', arrival: 'coal_store' }],
    objects: [{ id: 'relic_cache', anchor: 'reward', kind: 'reward', node: 'coal_store' }],
    landscape: { bounds: { x: 0, z: 0, width: 60, depth: 72 }, vista: 'interior', surface: 'paving', gates: [],
        roads: [{ points: [[0, 31], [0, -28]], width: 8 }],
        features: [f('west-fuel', 'fuel', -23, -9, 8, 30), f('east-fuel', 'fuel', 23, -9, 8, 30),
            f('cover', 'cargo', -9, 2, 4, 4), f('north-fuel', 'fuel', 0, -32, 18, 4),
            f('west-wall', 'wall', -29, 0, 2, 72, { height: 7 }), f('east-wall', 'wall', 29, 0, 2, 72, { height: 7 }),
            f('north-wall', 'wall', 0, -35, 60, 2, { height: 9 }), f('south-wall', 'wall', 0, 35, 60, 2, { height: 7 })] },
});
