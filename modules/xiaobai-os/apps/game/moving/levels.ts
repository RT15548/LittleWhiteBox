import { ITEM_KINDS, type MovingLevel, type Point3, type RoomTheme } from './types.js';
import { analyzePuzzle, puzzleRandom, shuffledPuzzle, type MovingStacks } from './puzzle.js';
import { MOVING_POLICY, type ChallengeTier } from './policy.js';
import { classifyChallenge } from './difficulty.js';
import { MATCH_SIZE } from './rules.js';

// Stack bases are furniture anchors, shared by geometry and authored puzzle projection.
export const STACK_BASES: readonly Point3[] = [[-2.35, .7, -1.9], [2.05, .9, -1.85], [2.05, .65, 1.2], [-2.1, .4, 1.3]];
export const STACK_STEP = .51;
export const CHALLENGE_SHAPE = { lanes: STACK_BASES.length, depth: ITEM_KINDS.length * MATCH_SIZE / STACK_BASES.length };
const CHAPTER_SPECS = [
    { count: 4, lanes: 3, seed: 9 },
    { count: 5, lanes: 3, seed: 2 },
    { count: 6, lanes: 3, seed: 3 },
    { count: 7, lanes: 4, seed: 56 },
    { count: 7, lanes: 4, seed: 5 },
] as const;

export function materializePuzzle(stacks: MovingStacks, id: RoomTheme, key: string, seed: number): MovingLevel {
    const ids = stacks.map((stack, lane) => stack.map((_, depth) => `s${lane}-${depth}`));
    const items = stacks.flatMap((stack, lane) => stack.map((kind, depth) => {
        const [x, y, z] = STACK_BASES[lane];
        return { id: ids[lane][depth], kind, above: depth ? ids[lane][depth - 1] : null,
            position: [x + (depth % 2 ? .18 : -.18), y + (stack.length - depth - 1) * STACK_STEP + .32, z] as Point3 };
    }));
    return { id, key, seed, items, stacks: ids };
}

export const CHAPTER_LEVELS: readonly MovingLevel[] = CHAPTER_SPECS.map((spec, index) =>
    materializePuzzle(shuffledPuzzle(ITEM_KINDS.slice(0, spec.count), spec.lanes, puzzleRandom(spec.seed)), 'weekend', `chapter-${index + 1}`, spec.seed));

export function puzzleOf(level: MovingLevel): MovingStacks {
    return level.stacks.map(stack => stack.map(id => level.items.find(item => item.id === id)!.kind));
}

/** No fallback board. An exhausted batch is an explicit failure before any admission charge. */
export async function generateChallenge(seed: number, tier: ChallengeTier): Promise<MovingLevel> {
    const random = puzzleRandom(seed);
    for (let candidate = 0; candidate < MOVING_POLICY.candidateLimit; candidate++) {
        const stacks = shuffledPuzzle(ITEM_KINDS, CHALLENGE_SHAPE.lanes, random);
        if (classifyChallenge(analyzePuzzle(stacks)) === tier) {
            return materializePuzzle(stacks, 'witch', `challenge-${tier}-${seed}-${candidate}`, seed);
        }
        if (candidate % 16 === 15) { await new Promise<void>(resolve => setTimeout(resolve, 0)); }
    }
    throw new Error('moving_generation_exhausted');
}
