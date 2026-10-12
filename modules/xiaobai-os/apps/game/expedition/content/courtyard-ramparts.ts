import { defineLandscapeScene } from '../world/landscape.js';
import { feature as f } from './landscape-content.js';

export const COURTYARD_GATE = defineLandscapeScene({
    id: 'gate', safe: false,
    anchors: { crossroads: { x: 0, y: 32 }, beacon: { x: 0, y: -33 }, encounter: { x: 0, y: 0 }, guard: { x: -5, y: -9 }, archer: { x: 8, y: -17 }, parley: { x: 0, y: 19 }, parley_side: { x: -7, y: 19 }, guard_side: { x: -8, y: 9 }, archer_side: { x: 8, y: 9 } },
    exits: [
        { id: 'crossroads', anchor: 'crossroads', to: 'crossroads', arrival: 'gate' },
        { id: 'beacon', anchor: 'beacon', to: 'beacon', arrival: 'gate', condition: { all: ['patrol_cleared'] } },
    ], objects: [],
    landscape: {
        vista: 'ramparts', surface: 'paving', bounds: { x: 0, z: 0, width: 72, depth: 80 }, gates: [],
        roads: [
            { points: [[0, 34], [0, 13], [0, -9], [0, -34]], width: 10 },
            { points: [[-26, 12], [0, 12], [26, 12]], width: 4 },
        ],
        features: [
            f('outer-west', 'wall', -35, 0, 2, 80, { height: 8 }),
            f('outer-east', 'wall', 35, 0, 2, 80, { height: 8 }),
            f('north-wall', 'wall', 0, -39, 72, 2, { height: 9 }),
            f('south-wall', 'wall', 0, 39, 72, 2, { height: 5 }),
            f('gate-tower-west', 'tower', -10, -27, 8, 12, { height: 16 }),
            f('gate-tower-east', 'tower', 10, -27, 8, 12, { height: 16 }),
            f('main-arch', 'arch', 0, -27, 12, 6, { height: 12 }),
            f('gate-flank-west', 'wall', -25, -27, 22, 6, { height: 9 }),
            f('gate-flank-east', 'wall', 25, -27, 22, 6, { height: 9 }),
            f('west-pillars', 'ruin', -13, -3, 6, 4, { height: 4.8 }),
            f('east-pillars', 'ruin', 13, -3, 6, 4, { height: 4.8 }),
            f('western-barracks', 'storehouse', -25, 2, 12, 12),
            f('eastern-barracks', 'storehouse', 25, 2, 12, 12),
            f('awaiting-inspection', 'cargo', -15, 23, 4, 12),
            f('cleared-consignments', 'cargo', 15, 23, 4, 12),
            f('inspection-cart', 'wagon', 25, 19, 4, 6),
            f('inspection-crates', 'supplies', 28, 25, 4, 4),
            f('barracks-tree', 'tree', -27, 26, 4, 4, { height: 9, tint: 'amber' }),
        ],
    },
});

export const COURTYARD_BEACON = defineLandscapeScene({
    id: 'beacon', safe: false,
    anchors: { gate: { x: 0, y: 35 }, hall: { x: 0, y: -35 }, beacon: { x: 0, y: 0 }, encounter: { x: 0, y: 9 }, guard: { x: -9, y: -13 }, archer: { x: 12, y: -13 }, parley: { x: 0, y: 28 }, parley_side: { x: -8, y: 28 }, guard_side: { x: -14, y: 2 }, archer_side: { x: 14, y: 2 } },
    exits: [
        { id: 'gate', anchor: 'gate', to: 'gate', arrival: 'beacon' },
        { id: 'hall', anchor: 'hall', to: 'hall', arrival: 'beacon', condition: { all: ['alarm_silenced'] } },
    ], objects: [],
    landscape: {
        vista: 'ramparts', surface: 'paving', bounds: { x: 0, z: 0, width: 72, depth: 84 }, gates: [],
        roads: [
            { points: [[0, 36], [0, 10], [-9, 0], [-9, -18], [0, -27], [0, -36]], width: 6 },
            { points: [[0, 10], [10, 0], [10, -18], [0, -27]], width: 6 },
        ],
        features: [
            f('west-parapet', 'wall', -35, 0, 2, 84, { height: 3 }),
            f('east-parapet', 'wall', 35, 0, 2, 84, { height: 3 }),
            f('north-wall', 'wall', 0, -41, 72, 2, { height: 9 }),
            f('south-wall', 'wall', 0, 41, 72, 2, { height: 5 }),
            f('signal-brazier', 'beacon', 0, -8, 6, 6),
            f('west-signal-column', 'column', -20, -10, 4, 4, { height: 11 }),
            f('east-signal-column', 'column', 20, -10, 4, 4, { height: 11 }),
            f('west-approach-column', 'column', -20, 12, 4, 4, { height: 8 }),
            f('east-approach-column', 'column', 20, 12, 4, 4, { height: 8 }),
            f('hall-tower-west', 'tower', -10, -30, 8, 8, { height: 16 }),
            f('hall-tower-east', 'tower', 10, -30, 8, 8, { height: 16 }),
            f('hall-arch', 'arch', 0, -30, 12, 4, { height: 12 }),
            f('signal-fuel', 'fuel', -27, 19, 8, 22),
            f('signal-reserve', 'cargo', 27, 19, 8, 22),
            f('west-copper-store', 'supplies', -26, -23, 6, 6),
            f('east-copper-store', 'supplies', 26, -23, 6, 6),
        ],
    },
});
