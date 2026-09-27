import type { ItemKind } from './types.js';
import { MATCH_SIZE, TRAY_CAPACITY } from './rules.js';

/** Each stack is read top first. Its visible top must be removed before the next object. */
export type MovingStacks = readonly (readonly ItemKind[])[];
export interface PuzzleAnalysis {
    solvable: boolean;
    minimumPeak: number;
    randomWinProbability: number;
    reachableStates: number;
    losingBranches: number;
    branches: number;
    solution: readonly number[];
}

/** Exhaustive DAG analysis, not a heuristic search that can miss an easier solution. */
export function analyzePuzzle(stacks: MovingStacks): PuzzleAnalysis {
    const kinds = [...new Set(stacks.flat())];
    const strides: number[] = [];
    let size = 1;
    const prefixes = stacks.map(stack => {
        strides.push(size); size *= stack.length + 1;
        const rows = [new Uint8Array(kinds.length)];
        for (const kind of stack) {
            const row = rows.at(-1)!.slice(); row[kinds.indexOf(kind)]++;
            rows.push(row);
        }
        return rows;
    });
    if (!stacks.length || stacks.length > 4 || size > 20000 || stacks.some(stack => !stack.length)) {
        throw new Error('moving_puzzle_shape');
    }
    const totals = kinds.map(kind => stacks.flat().filter(value => value === kind).length);
    if (totals.some(count => count % MATCH_SIZE)) { throw new Error('moving_puzzle_counts'); }
    const peaks = new Uint8Array(size).fill(TRAY_CAPACITY);
    const loads = new Uint8Array(size);
    const probabilities = new Float64Array(size);
    const choices = new Int8Array(size).fill(-1);
    const counts = new Uint8Array(kinds.length);
    const indices = new Uint8Array(stacks.length);
    for (let key = size - 1; key >= 0; key--) {
        counts.fill(0);
        for (let lane = 0; lane < stacks.length; lane++) {
            indices[lane] = Math.floor(key / strides[lane]) % (stacks[lane].length + 1);
            for (let k = 0; k < kinds.length; k++) { counts[k] += prefixes[lane][indices[lane]][k]; }
        }
        const load = counts.reduce((sum, count) => sum + count % MATCH_SIZE, 0);
        loads[key] = load;
        if (load >= TRAY_CAPACITY) { continue; }
        if (key === size - 1) { peaks[key] = 0; probabilities[key] = 1; continue; }
        let moves = 0;
        for (let lane = 0; lane < stacks.length; lane++) {
            if (indices[lane] === stacks[lane].length) { continue; }
            moves++;
            const next = key + strides[lane];
            const peak = Math.max(load, peaks[next]);
            if (peak < peaks[key]) { peaks[key] = peak; choices[key] = lane; }
            probabilities[key] += probabilities[next];
        }
        probabilities[key] /= moves;
    }
    const visited = new Uint8Array(size); visited[0] = 1;
    let reachableStates = 0, branches = 0, losingBranches = 0;
    for (let key = 0; key < size; key++) {
        if (!visited[key] || loads[key] >= TRAY_CAPACITY) { continue; }
        reachableStates++;
        for (let lane = 0; lane < stacks.length; lane++) {
            const index = Math.floor(key / strides[lane]) % (stacks[lane].length + 1);
            if (index === stacks[lane].length) { continue; }
            const next = key + strides[lane];
            if (peaks[key] < TRAY_CAPACITY) {
                branches++; if (peaks[next] >= TRAY_CAPACITY) { losingBranches++; }
            }
            visited[next] = 1;
        }
    }
    const solution: number[] = [];
    let key = 0;
    while (choices[key] !== -1) {
        const lane = choices[key]; solution.push(lane); key += strides[lane];
    }
    return { solvable: peaks[0] < TRAY_CAPACITY, minimumPeak: peaks[0], randomWinProbability: probabilities[0],
        reachableStates, branches, losingBranches, solution };
}

/** Deterministic seed stream; all randomness is construction-time, never during a paid run. */
export function puzzleRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state += 0x6D2B79F5;
        let value = state;
        value = Math.imul(value ^ value >>> 15, value | 1);
        value ^= value + Math.imul(value ^ value >>> 7, value | 61);
        return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
}

export function shuffledPuzzle(kinds: readonly ItemKind[], lanes: number, random: () => number): MovingStacks {
    const items = kinds.flatMap(kind => Array.from({ length: MATCH_SIZE }, () => kind));
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]];
    }
    return Array.from({ length: lanes }, (_, lane) => items.filter((_, index) => index % lanes === lane));
}
