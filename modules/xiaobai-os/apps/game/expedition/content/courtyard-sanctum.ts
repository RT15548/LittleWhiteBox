import { defineLandscapeScene } from '../world/landscape.js';
import { feature as f } from './landscape-content.js';

export const COURTYARD_HALL = defineLandscapeScene({
    id: 'hall', safe: false,
    anchors: {
        beacon: { x: -22, y: 35 }, cells: { x: 22, y: 35 }, encounter: { x: 0, y: 5 }, warden: { x: 0, y: -17 },
        orders: { x: 0, y: -36 }, reinforcementLeft: { x: -24, y: -12 }, reinforcementRight: { x: 24, y: -12 },
    },
    exits: [
        { id: 'beacon', anchor: 'beacon', to: 'beacon', arrival: 'hall' },
        { id: 'cells', anchor: 'cells', to: 'cells', arrival: 'hall' },
    ], objects: [{ id: 'orders', anchor: 'orders', kind: 'inspect', passage: 'orders', condition: { all: ['warden_defeated'] } }],
    landscape: {
        vista: 'interior', surface: 'marble', bounds: { x: 0, z: 0, width: 80, depth: 92 }, gates: [],
        roads: [
            { points: [[-22, 36], [-22, 27], [0, 19], [22, 27], [22, 36]], width: 5 },
            { points: [[0, 27], [0, 4], [0, -17], [0, -35]], width: 10 },
        ],
        features: [
            f('west-wall', 'wall', -39, 0, 2, 92, { height: 11 }),
            f('east-wall', 'wall', 39, 0, 2, 92, { height: 11 }),
            f('north-wall', 'wall', 0, -45, 80, 2, { height: 13 }),
            f('south-wall', 'wall', 0, 45, 80, 2, { height: 8 }),
            f('western-front-column', 'column', -15, 17, 4, 4, { height: 12 }),
            f('eastern-front-column', 'column', 15, 17, 4, 4, { height: 12 }),
            f('western-middle-column', 'column', -15, -3, 4, 4, { height: 12 }),
            f('eastern-middle-column', 'column', 15, -3, 4, 4, { height: 12 }),
            f('western-rear-column', 'column', -15, -25, 4, 4, { height: 12 }),
            f('eastern-rear-column', 'column', 15, -25, 4, 4, { height: 12 }),
            f('entry-vault', 'arch', 0, 17, 30, 2, { height: 14 }),
            f('rear-vault', 'arch', 0, -25, 30, 2, { height: 14 }),
            f('west-gallery', 'planter', -32, 4, 6, 28),
            f('east-gallery', 'planter', 32, 4, 6, 28),
            f('west-gallery-bench', 'bench', -28, 28, 2, 6),
            f('east-gallery-bench', 'bench', 28, 28, 2, 6),
            f('crown-console', 'ledger', 0, -41, 6, 4),
            f('northern-west-pillar', 'column', -29, -35, 4, 4, { height: 14 }),
            f('northern-east-pillar', 'column', 29, -35, 4, 4, { height: 14 }),
        ],
    },
});

export const COURTYARD_ROOTS = defineLandscapeScene({
    id: 'roots', safe: false,
    anchors: { crossroads: { x: 0, y: 34 }, encounter: { x: 0, y: 5 }, tree: { x: 0, y: -12 }, rootLeft: { x: -12, y: -13 }, rootRight: { x: 12, y: -13 } },
    exits: [{ id: 'crossroads', anchor: 'crossroads', to: 'crossroads', arrival: 'roots' }], objects: [],
    landscape: {
        vista: 'garden', surface: 'grass', bounds: { x: 0, z: 0, width: 80, depth: 84 }, gates: [],
        suspended: [
            { kind: 'pipe', from: [-38, 3.2, -29], to: [-3, 3.2, -29] },
            { kind: 'pipe', from: [3, 2.8, -29], to: [38, 2.8, -29] },
        ],
        roads: [
            { points: [[0, 35], [0, 23], [-9, 11], [-12, -7], [0, -19]], width: 5 },
            { points: [[0, 23], [11, 12], [13, -5], [0, -19]], width: 4 },
        ],
        features: [
            f('west-enclosure', 'wall', -39, 0, 2, 84, { height: 3 }),
            f('east-enclosure', 'wall', 39, 0, 2, 84, { height: 3 }),
            f('north-enclosure', 'wall', 0, -41, 80, 2, { height: 4 }),
            f('south-enclosure', 'wall', 0, 41, 80, 2, { height: 3 }),
            f('dead-heartwood', 'root', 0, -29, 12, 10, { height: 17 }),
            f('western-root', 'root', -22, -15, 8, 4, { height: 3.8 }),
            f('eastern-root', 'root', 22, -11, 8, 4, { height: 3.2 }),
            f('west-reflecting-pool', 'water', -26, 9, 12, 16),
            f('east-reflecting-pool', 'water', 26, 9, 12, 16),
            f('west-old-colonnade', 'ruin', -15, 7, 4, 4, { height: 5 }),
            f('east-old-colonnade', 'ruin', 15, 9, 4, 4, { height: 4 }),
            f('western-growth', 'thicket', -29, -27, 14, 12),
            f('eastern-growth', 'thicket', 29, -27, 14, 12),
            f('west-entry-pillar', 'column', -7, 30, 4, 4, { height: 7 }),
            f('east-entry-pillar', 'column', 7, 30, 4, 4, { height: 7 }),
            f('garden-arch', 'arch', 0, 30, 14, 2, { height: 9 }),
            f('west-entry-tree', 'tree', -21, 29, 6, 6, { height: 12, tint: 'rose' }),
            f('east-entry-tree', 'tree', 23, 29, 6, 6, { height: 12, tint: 'sage' }),
            f('west-north-tree', 'tree', -18, -33, 6, 6, { height: 14, tint: 'sage' }),
            f('east-north-tree', 'tree', 18, -33, 6, 6, { height: 14, tint: 'rose' }),
        ],
    },
});
