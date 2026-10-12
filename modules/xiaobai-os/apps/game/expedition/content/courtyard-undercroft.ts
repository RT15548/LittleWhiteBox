import { defineLandscapeScene } from '../world/landscape.js';
import { feature as f } from './landscape-content.js';

export const COURTYARD_WATERWAY = defineLandscapeScene({
    id: 'waterway', safe: false,
    anchors: { crossroads: { x: -21, y: -35 }, cells: { x: 20, y: 35 }, sluice: { x: -9, y: 8 }, encounter: { x: 4, y: 4 }, guard: { x: 10, y: -5 } },
    exits: [
        { id: 'crossroads', anchor: 'crossroads', to: 'crossroads', arrival: 'waterway' },
        { id: 'cells', anchor: 'cells', to: 'cells', arrival: 'waterway', condition: { all: ['waterway_cleared'] } },
    ], objects: [{ id: 'sluice', anchor: 'sluice', kind: 'switch', fact: 'sluice_opened' }],
    landscape: {
        vista: 'interior', surface: 'wet', bounds: { x: 0, z: 0, width: 64, depth: 88 },
        suspended: [
            { kind: 'pipe', from: [-28.5, 4.3, -41], to: [-28.5, 4.3, 16] },
            { kind: 'pipe', from: [-28.5, 4.3, -18], to: [29, 4.3, -18] },
            { kind: 'pipe', from: [29, 4.3, -18], to: [29, 4.3, 41] },
        ],
        gates: [{ id: 'sluice', footprint: { x: 0, z: 16, width: 12, depth: 4 }, condition: { all: ['sluice_opened'] } }],
        roads: [{ points: [[-21, -35], [-10, -32], [-10, -12], [3, 0], [0, 16], [14, 28], [20, 35]], width: 5 }],
        features: [
            f('west-wall', 'wall', -31, 0, 2, 88, { height: 7 }),
            f('east-wall', 'wall', 31, 0, 2, 88, { height: 7 }),
            f('north-wall', 'wall', 0, -43, 64, 2, { height: 8 }),
            f('south-wall', 'wall', 0, 43, 64, 2, { height: 8 }),
            f('upper-channel-west', 'water', -24, -3, 12, 58),
            f('upper-channel-east', 'water', 23, -12, 14, 48),
            f('lower-channel-west', 'water', -13, 32, 30, 20),
            f('lower-channel-east', 'water', 28, 32, 4, 20),
            f('sluice-west-abutment', 'wall', -18, 16, 24, 4, { height: 5 }),
            f('sluice-east-abutment', 'wall', 18, 16, 24, 4, { height: 5 }),
            f('upper-pier-west', 'column', -15, -18, 4, 4, { height: 9 }),
            f('upper-pier-east', 'column', 11, -18, 4, 4, { height: 9 }),
            f('lower-pier-west', 'column', -13, 0, 4, 4, { height: 9 }),
            f('lower-pier-east', 'column', 13, 0, 4, 4, { height: 9 }),
            f('vault-north', 'arch', -2, -18, 26, 2, { height: 10 }),
            f('vault-middle', 'arch', 0, 0, 26, 2, { height: 10 }),
            f('entry-marker', 'ruin', -24, -39, 6, 2, { height: 5 }),
            f('maintenance-supplies', 'supplies', 8, 36, 4, 4),
        ],
    },
});

export const COURTYARD_CELLS = defineLandscapeScene({
    id: 'cells', safe: false,
    anchors: {
        waterway: { x: -21, y: 21 }, hall: { x: 0, y: -3 }, postern: { x: 23, y: 33 }, latch: { x: 20, y: 16 },
        release: { x: -3, y: 5 }, kouzi: { x: -15, y: -12 }, anian: { x: 15, y: -12 },
        kouzi_talk: { x: -15, y: -8 }, anian_talk: { x: 15, y: -8 },
    },
    exits: [
        { id: 'waterway', anchor: 'waterway', to: 'waterway', arrival: 'cells' },
        { id: 'hall', anchor: 'hall', to: 'hall', arrival: 'cells' },
        { id: 'postern', anchor: 'postern', to: 'camp', arrival: 'postern', condition: { all: ['postern_opened'] } },
    ],
    objects: [
        { id: 'release', anchor: 'release', kind: 'switch', fact: 'captives_released' },
        { id: 'postern_latch', anchor: 'latch', kind: 'switch', fact: 'postern_opened' },
    ],
    landscape: {
        vista: 'interior', surface: 'paving', bounds: { x: 0, z: 0, width: 64, depth: 76 },
        gates: [
            { id: 'cell-west', footprint: { x: -15, z: -10, width: 10, depth: 2 }, condition: { all: ['captives_released'] } },
            { id: 'cell-east', footprint: { x: 15, z: -10, width: 10, depth: 2 }, condition: { all: ['captives_released'] } },
            { id: 'postern', footprint: { x: 24, z: 24, width: 12, depth: 2 }, condition: { all: ['postern_opened'] } },
        ],
        roads: [
            { points: [[-21, 21], [-21, 12], [0, 5], [20, 12], [24, 24], [23, 34]], width: 4 },
            { points: [[-16, -23], [-15, -10], [0, 5], [15, -10], [16, -23]], width: 4 },
        ],
        features: [
            f('west-wall', 'wall', -31, 0, 2, 76, { height: 6 }),
            f('east-wall', 'wall', 31, 0, 2, 76, { height: 6 }),
            f('north-wall', 'wall', 0, -37, 64, 2, { height: 8 }),
            f('south-wall', 'wall', 0, 37, 64, 2, { height: 6 }),
            f('cells-divider', 'wall', 0, -24, 2, 28, { height: 6 }),
            f('cells-front-center', 'wall', 0, -10, 20, 2, { height: 6 }),
            f('cells-front-west', 'wall', -26, -10, 12, 2, { height: 6 }),
            f('cells-front-east', 'wall', 26, -10, 12, 2, { height: 6 }),
            f('postern-divider', 'wall', -7, 24, 50, 2, { height: 5 }),
            f('waterway-passage', 'arch', -21, 19, 10, 2, { height: 7 }),
            f('postern-corridor', 'wall', 17, 31, 2, 12, { height: 5 }),
            f('west-bunk', 'bunk', -26, -24, 4, 8),
            f('east-bunk', 'bunk', 26, -24, 4, 8),
            f('west-cell-bench', 'bench', -8, -30, 2, 4),
            f('east-cell-bench', 'bench', 8, -30, 2, 4),
            f('guard-desk', 'ledger', 3, 12, 4, 4),
            f('hall-pier-west', 'column', -7, -4, 2, 2, { height: 7 }),
            f('hall-pier-east', 'column', 7, -4, 2, 2, { height: 7 }),
        ],
    },
});
