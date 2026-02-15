// ═══════════════════════════════════════════════════════════════════════════
// diffusion.js - PPR Graph Diffusion (Personalized PageRank)
//
// Spreads activation from seed L0 atoms through entity co-occurrence graph
// to discover narratively-connected but semantically-distant memories.
//
// Pipeline position: recall.js Stage 7.5
//   Input:  seeds (reranked L0 from Stage 6)
//   Output: additional L0 atoms → merged into l0Selected
//
// Algorithm:
//   1. Build undirected weighted graph over all L0 atoms
//      Candidate edges: WHAT + R semantic; WHO/WHERE are reweight-only
//   2. Personalized PageRank (Power Iteration)
//      Seeds weighted by rerankScore — Haveliwala (2002) topic-sensitive variant
//      α = 0.15 restart probability — Page et al. (1998)
//   3. Post-verification (Dense Cosine Gate)
//      Exclude seeds, cosine ≥ 0.45, final = PPR_norm × cosine ≥ 0.10
//
// References:
//   Page et al. "The PageRank Citation Ranking" (1998)
//   Haveliwala "Topic-Sensitive PageRank" (IEEE TKDE 2003)
//   Langville & Meyer "Eigenvector Methods for Web IR" (SIAM Review 2005)
//   Sun et al. "GraftNet" (EMNLP 2018)
//   Jaccard "Étude comparative de la distribution florale" (1912)
//   Szymkiewicz "Une contribution statistique" (1934) — Overlap coefficient
//   Rimmon-Kenan "Narrative Fiction" (2002) — Channel weight rationale
//
// Core PPR iteration aligned with NetworkX pagerank():
//   github.com/networkx/networkx — algorithms/link_analysis/pagerank_alg.py
// ═══════════════════════════════════════════════════════════════════════════

import { xbLog } from '../../../../core/debug-core.js';
import { getContext } from '../../../../../../../extensions.js';

const MODULE_ID = 'diffusion';

// ═══════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // PPR parameters (Page et al. 1998; GraftNet 2018 uses same values)
    ALPHA: 0.15,            // restart probability
    EPSILON: 1e-5,          // L1 convergence threshold
    MAX_ITER: 50,           // hard iteration cap (typically converges in 15-25)

    // Edge weight channel coefficients
    // Candidate generation uses WHAT + R semantic only.
    // WHO/WHERE are reweight-only signals.
    GAMMA: {
        what: 0.40,         // interaction pair overlap
        rSem: 0.40,         // semantic similarity over edges.r aggregate
        who: 0.10,          // endpoint entity overlap   (reweight-only)
        where: 0.05,        // location exact match      (reweight-only)
        time: 0.05,         // temporal decay score
    },
    // R semantic candidate generation
    R_SEM_MIN_SIM: 0.62,
    R_SEM_TOPK: 8,
    TIME_WINDOW_MAX: 80,
    TIME_DECAY_DIVISOR: 12,
    WHERE_MAX_GROUP_SIZE: 16,   // skip location-only pair expansion for over-common places
    WHERE_FREQ_DAMP_PIVOT: 6,   // location freq <= pivot keeps full WHERE score
    WHERE_FREQ_DAMP_MIN: 0.20,  // lower bound for damped WHERE contribution

    // Post-verification (Cosine Gate)
    COSINE_GATE: 0.46,      // min cosine(queryVector, stateVector)
    SCORE_FLOOR: 0.10,      // min finalScore = PPR_normalized × cosine
    DIFFUSION_CAP: 100,     // max diffused nodes (excluding seeds)
};

// ═══════════════════════════════════════════════════════════════════════════
// Utility functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Unicode-safe text normalization (matches recall.js / entity-lexicon.js)
 */
function normalize(s) {
    return String(s || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .toLowerCase();
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a, b) {
    if (!a?.length || !b?.length || a.length !== b.length) return 0;
    let dot = 0, nA = 0, nB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        nA += a[i] * a[i];
        nB += b[i] * b[i];
    }
    return nA && nB ? dot / (Math.sqrt(nA) * Math.sqrt(nB)) : 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// Feature extraction from L0 atoms
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Endpoint entity set from edges.s/edges.t (used for candidate pair generation).
 * @param {object} atom
 * @param {Set<string>} excludeEntities - entities to exclude (e.g. name1)
 * @returns {Set<string>}
 */
function extractEntities(atom, excludeEntities = new Set()) {
    const set = new Set();
    for (const e of (atom.edges || [])) {
        const s = normalize(e?.s);
        const t = normalize(e?.t);
        if (s && !excludeEntities.has(s)) set.add(s);
        if (t && !excludeEntities.has(t)) set.add(t);
    }
    return set;
}

/**
 * WHAT channel: interaction pairs "A↔B" (direction-insensitive).
 * @param {object} atom
 * @param {Set<string>} excludeEntities
 * @returns {Set<string>}
 */
function extractInteractionPairs(atom, excludeEntities = new Set()) {
    const set = new Set();
    for (const e of (atom.edges || [])) {
        const s = normalize(e?.s);
        const t = normalize(e?.t);
        if (s && t && !excludeEntities.has(s) && !excludeEntities.has(t)) {
            const pair = [s, t].sort().join('\u2194');
            set.add(pair);
        }
    }
    return set;
}

/**
 * WHERE channel: normalized location string
 * @param {object} atom
 * @returns {string} empty string if absent
 */
function extractLocation(atom) {
    return normalize(atom.where);
}

function getFloorDistance(a, b) {
    const fa = Number(a?.floor || 0);
    const fb = Number(b?.floor || 0);
    return Math.abs(fa - fb);
}

function getTimeScore(distance) {
    return Math.exp(-distance / CONFIG.TIME_DECAY_DIVISOR);
}

// ═══════════════════════════════════════════════════════════════════════════
// Set similarity functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Jaccard index: |A∩B| / |A∪B| (Jaccard 1912)
 * @param {Set<string>} a
 * @param {Set<string>} b
 * @returns {number} 0..1
 */
function jaccard(a, b) {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
    for (const x of smaller) {
        if (larger.has(x)) inter++;
    }
    const union = a.size + b.size - inter;
    return union > 0 ? inter / union : 0;
}

/**
 * Overlap coefficient: |A∩B| / min(|A|,|B|) (Szymkiewicz-Simpson 1934)
 * Used for directed pairs where set sizes are small (1-3); Jaccard
 * over-penalizes small-set asymmetry.
 * @param {Set<string>} a
 * @param {Set<string>} b
 * @returns {number} 0..1
 */
function overlapCoefficient(a, b) {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
    for (const x of smaller) {
        if (larger.has(x)) inter++;
    }
    return inter / smaller.size;
}

// ═══════════════════════════════════════════════════════════════════════════
// Graph construction
//
// Candidate pairs discovered via WHAT inverted index and R semantic top-k.
// WHO/WHERE are reweight-only signals and never create candidate pairs.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pre-extract features for all atoms
 * @param {object[]} allAtoms
 * @param {Set<string>} excludeEntities
 * @returns {object[]} feature objects with entities/interactionPairs/location
 */
function extractAllFeatures(allAtoms, excludeEntities = new Set()) {
    return allAtoms.map(atom => ({
        entities: extractEntities(atom, excludeEntities),
        interactionPairs: extractInteractionPairs(atom, excludeEntities),
        location: extractLocation(atom),
    }));
}

/**
 * Build inverted index: value → list of atom indices
 * @param {object[]} features
 * @returns {{ whatIndex: Map, locationFreq: Map }}
 */
function buildInvertedIndices(features) {
    const whatIndex = new Map();
    const locationFreq = new Map();

    for (let i = 0; i < features.length; i++) {
        for (const pair of features[i].interactionPairs) {
            if (!whatIndex.has(pair)) whatIndex.set(pair, []);
            whatIndex.get(pair).push(i);
        }
        const loc = features[i].location;
        if (loc) locationFreq.set(loc, (locationFreq.get(loc) || 0) + 1);
    }

    return { whatIndex, locationFreq };
}

/**
 * Collect candidate pairs from inverted index
 * @param {Map} index - value → [atomIndex, ...]
 * @param {Set<number>} pairSet - packed pair collector
 * @param {number} N - total atom count (for pair packing)
 */
function collectPairsFromIndex(index, pairSet, N) {
    for (const indices of index.values()) {
        for (let a = 0; a < indices.length; a++) {
            for (let b = a + 1; b < indices.length; b++) {
                const lo = Math.min(indices[a], indices[b]);
                const hi = Math.max(indices[a], indices[b]);
                pairSet.add(lo * N + hi);
            }
        }
    }
}

/**
 * Build weighted undirected graph over L0 atoms.
 *
 * @param {object[]} allAtoms
 * @param {object[]} stateVectors
 * @param {Set<string>} excludeEntities
 * @returns {{ neighbors: object[][], edgeCount: number, channelStats: object, buildTime: number }}
 */
function buildGraph(allAtoms, stateVectors = [], excludeEntities = new Set()) {
    const N = allAtoms.length;
    const T0 = performance.now();

    const features = extractAllFeatures(allAtoms, excludeEntities);
    const { whatIndex, locationFreq } = buildInvertedIndices(features);

    // Candidate pairs: WHAT + R semantic
    const pairSetByWhat = new Set();
    const pairSetByRSem = new Set();
    const rSemByPair = new Map();
    const pairSet = new Set();
    collectPairsFromIndex(whatIndex, pairSetByWhat, N);

    const rVectorByAtomId = new Map(
        (stateVectors || [])
            .filter(v => v?.atomId && v?.rVector?.length)
            .map(v => [v.atomId, v.rVector])
    );
    const rVectors = allAtoms.map(a => rVectorByAtomId.get(a.atomId) || null);

    const directedNeighbors = Array.from({ length: N }, () => []);
    let rSemSimSum = 0;
    let rSemSimCount = 0;
    let topKPrunedPairs = 0;
    let timeWindowFilteredPairs = 0;

    // Enumerate only pairs within floor window to avoid O(N^2) full scan.
    const sortedByFloor = allAtoms
        .map((atom, idx) => ({ idx, floor: Number(atom?.floor || 0) }))
        .sort((a, b) => a.floor - b.floor);

    for (let left = 0; left < sortedByFloor.length; left++) {
        const i = sortedByFloor[left].idx;
        const baseFloor = sortedByFloor[left].floor;

        for (let right = left + 1; right < sortedByFloor.length; right++) {
            const floorDelta = sortedByFloor[right].floor - baseFloor;
            if (floorDelta > CONFIG.TIME_WINDOW_MAX) break;

            const j = sortedByFloor[right].idx;
            const vi = rVectors[i];
            const vj = rVectors[j];
            if (!vi?.length || !vj?.length) continue;

            const sim = cosineSimilarity(vi, vj);
            if (sim < CONFIG.R_SEM_MIN_SIM) continue;

            directedNeighbors[i].push({ target: j, sim });
            directedNeighbors[j].push({ target: i, sim });
            rSemSimSum += sim;
            rSemSimCount++;
        }
    }

    for (let i = 0; i < N; i++) {
        const arr = directedNeighbors[i];
        if (!arr.length) continue;
        arr.sort((a, b) => b.sim - a.sim);
        if (arr.length > CONFIG.R_SEM_TOPK) {
            topKPrunedPairs += arr.length - CONFIG.R_SEM_TOPK;
        }
        for (const n of arr.slice(0, CONFIG.R_SEM_TOPK)) {
            const lo = Math.min(i, n.target);
            const hi = Math.max(i, n.target);
            const packed = lo * N + hi;
            pairSetByRSem.add(packed);
            const prev = rSemByPair.get(packed) || 0;
            if (n.sim > prev) rSemByPair.set(packed, n.sim);
        }
    }
    for (const p of pairSetByWhat) pairSet.add(p);
    for (const p of pairSetByRSem) pairSet.add(p);

    // Compute edge weights for all candidates
    const neighbors = Array.from({ length: N }, () => []);
    let edgeCount = 0;
    const channelStats = { what: 0, where: 0, rSem: 0, who: 0 };
    let reweightWhoUsed = 0;
    let reweightWhereUsed = 0;

    for (const packed of pairSet) {
        const i = Math.floor(packed / N);
        const j = packed % N;

        const distance = getFloorDistance(allAtoms[i], allAtoms[j]);
        if (distance > CONFIG.TIME_WINDOW_MAX) {
            timeWindowFilteredPairs++;
            continue;
        }
        const wTime = getTimeScore(distance);

        const fi = features[i];
        const fj = features[j];

        const wWhat = overlapCoefficient(fi.interactionPairs, fj.interactionPairs);
        const wRSem = rSemByPair.get(packed) || 0;
        const wWho = jaccard(fi.entities, fj.entities);
        let wWhere = 0.0;
        if (fi.location && fi.location === fj.location) {
            const freq = locationFreq.get(fi.location) || 1;
            const damp = Math.max(
                CONFIG.WHERE_FREQ_DAMP_MIN,
                Math.min(1, CONFIG.WHERE_FREQ_DAMP_PIVOT / Math.max(1, freq))
            );
            wWhere = damp;
        }

        const weight =
            CONFIG.GAMMA.what * wWhat +
            CONFIG.GAMMA.rSem * wRSem +
            CONFIG.GAMMA.who * wWho +
            CONFIG.GAMMA.where * wWhere +
            CONFIG.GAMMA.time * wTime;

        if (weight > 0) {
            neighbors[i].push({ target: j, weight });
            neighbors[j].push({ target: i, weight });
            edgeCount++;

            if (wWhat > 0) channelStats.what++;
            if (wRSem > 0) channelStats.rSem++;
            if (wWho > 0) channelStats.who++;
            if (wWhere > 0) channelStats.where++;
            if (wWho > 0) reweightWhoUsed++;
            if (wWhere > 0) reweightWhereUsed++;
        }
    }

    const buildTime = Math.round(performance.now() - T0);

    xbLog.info(MODULE_ID,
        `Graph: ${N} nodes, ${edgeCount} edges ` +
        `(candidate_by_what=${pairSetByWhat.size} candidate_by_r_sem=${pairSetByRSem.size}) ` +
        `(what=${channelStats.what} r_sem=${channelStats.rSem} who=${channelStats.who} where=${channelStats.where}) ` +
        `(reweight_who_used=${reweightWhoUsed} reweight_where_used=${reweightWhereUsed}) ` +
        `(time_window_filtered=${timeWindowFilteredPairs} topk_pruned=${topKPrunedPairs}) ` +
        `(${buildTime}ms)`
    );

    const totalPairs = N > 1 ? (N * (N - 1)) / 2 : 0;
    const edgeDensity = totalPairs > 0 ? Number((edgeCount / totalPairs * 100).toFixed(2)) : 0;

    return {
        neighbors,
        edgeCount,
        channelStats,
        buildTime,
        candidatePairs: pairSet.size,
        pairsFromWhat: pairSetByWhat.size,
        pairsFromRSem: pairSetByRSem.size,
        rSemAvgSim: rSemSimCount ? Number((rSemSimSum / rSemSimCount).toFixed(3)) : 0,
        timeWindowFilteredPairs,
        topKPrunedPairs,
        reweightWhoUsed,
        reweightWhereUsed,
        edgeDensity,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// PPR: Seed vector construction
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build personalization vector s from seeds, weighted by rerankScore.
 * Haveliwala (2002): non-uniform personalization improves topic sensitivity.
 *
 * @param {object[]} seeds - seed L0 entries with atomId and rerankScore
 * @param {Map<string, number>} idToIdx - atomId → array index
 * @param {number} N - total node count
 * @returns {Float64Array} personalization vector (L1-normalized, sums to 1)
 */
function buildSeedVector(seeds, idToIdx, N) {
    const s = new Float64Array(N);
    let total = 0;

    for (const seed of seeds) {
        const idx = idToIdx.get(seed.atomId);
        if (idx == null) continue;

        const score = Math.max(0, seed.rerankScore || seed.similarity || 0);
        s[idx] += score;
        total += score;
    }

    // L1 normalize to probability distribution
    if (total > 0) {
        for (let i = 0; i < N; i++) s[i] /= total;
    }

    return s;
}

// ═══════════════════════════════════════════════════════════════════════════
// PPR: Column normalization + dangling node detection
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Column-normalize adjacency into transition matrix W.
 *
 * Column j of W: W_{ij} = weight(i,j) / Σ_k weight(k,j)
 * Dangling nodes (no outgoing edges): handled in powerIteration
 * via redistribution to personalization vector s.
 * (Langville & Meyer 2005, §4.1)
 *
 * @param {object[][]} neighbors - neighbors[j] = [{target, weight}, ...]
 * @param {number} N
 * @returns {{ columns: object[][], dangling: number[] }}
 */
function columnNormalize(neighbors, N) {
    const columns = Array.from({ length: N }, () => []);
    const dangling = [];

    for (let j = 0; j < N; j++) {
        const edges = neighbors[j];

        let sum = 0;
        for (let e = 0; e < edges.length; e++) sum += edges[e].weight;

        if (sum <= 0) {
            dangling.push(j);
            continue;
        }

        const col = columns[j];
        for (let e = 0; e < edges.length; e++) {
            col.push({ target: edges[e].target, prob: edges[e].weight / sum });
        }
    }

    return { columns, dangling };
}

// ═══════════════════════════════════════════════════════════════════════════
// PPR: Power Iteration
//
// Aligned with NetworkX pagerank() (pagerank_alg.py):
//
//   NetworkX "alpha" = damping = our (1 − α)
//   NetworkX "1-alpha" = teleportation = our α
//
//   Per iteration:
//     π_new[i] = α·s[i] + (1−α)·( Σ_j W_{ij}·π[j] + dangling_sum·s[i] )
//
// Convergence: Perron-Frobenius theorem guarantees unique stationary
// distribution for irreducible aperiodic column-stochastic matrix.
// Rate: ‖π^(t+1) − π^t‖₁ ≤ (1−α)^t (geometric).
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Run PPR Power Iteration.
 *
 * @param {object[][]} columns - column-normalized transition matrix
 * @param {Float64Array} s - personalization vector (sums to 1)
 * @param {number[]} dangling - dangling node indices
 * @param {number} N - node count
 * @returns {{ pi: Float64Array, iterations: number, finalError: number }}
 */
function powerIteration(columns, s, dangling, N) {
    const alpha = CONFIG.ALPHA;
    const d = 1 - alpha;       // damping factor = prob of following edges
    const epsilon = CONFIG.EPSILON;
    const maxIter = CONFIG.MAX_ITER;

    // Initialize π to personalization vector
    let pi = new Float64Array(N);
    for (let i = 0; i < N; i++) pi[i] = s[i];

    let iterations = 0;
    let finalError = 0;

    for (let iter = 0; iter < maxIter; iter++) {
        const piNew = new Float64Array(N);

        // Dangling mass: probability at nodes with no outgoing edges
        // redistributed to personalization vector (Langville & Meyer 2005)
        let danglingSum = 0;
        for (let k = 0; k < dangling.length; k++) {
            danglingSum += pi[dangling[k]];
        }

        // Sparse matrix-vector product: (1−α) · W · π
        for (let j = 0; j < N; j++) {
            const pj = pi[j];
            if (pj === 0) continue;

            const col = columns[j];
            const dpj = d * pj;
            for (let e = 0; e < col.length; e++) {
                piNew[col[e].target] += dpj * col[e].prob;
            }
        }

        // Restart + dangling contribution:
        // α · s[i] + (1−α) · danglingSum · s[i]
        const restartCoeff = alpha + d * danglingSum;
        for (let i = 0; i < N; i++) {
            piNew[i] += restartCoeff * s[i];
        }

        // L1 convergence check
        let l1 = 0;
        for (let i = 0; i < N; i++) {
            l1 += Math.abs(piNew[i] - pi[i]);
        }

        pi = piNew;
        iterations = iter + 1;
        finalError = l1;

        if (l1 < epsilon) break;
    }

    return { pi, iterations, finalError };
}

// ═══════════════════════════════════════════════════════════════════════════
// Post-verification: Dense Cosine Gate
//
// PPR measures graph-structural relevance ("same characters").
// Cosine gate measures semantic relevance ("related to current topic").
// Product combination ensures both dimensions are satisfied
// (CombMNZ — Fox & Shaw, TREC-2 1994).
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Filter PPR-activated nodes by semantic relevance.
 *
 * For each non-seed node with PPR > 0:
 *   1. cosine(queryVector, stateVector) ≥ COSINE_GATE
 *   2. finalScore = PPR_normalized × cosine ≥ SCORE_FLOOR
 *   3. Top DIFFUSION_CAP by finalScore
 *
 * @param {Float64Array} pi - PPR stationary distribution
 * @param {string[]} atomIds - index → atomId
 * @param {Map<string, object>} atomById - atomId → atom object
 * @param {Set<string>} seedAtomIds - seed atomIds (excluded from output)
 * @param {Map<string, Float32Array>} vectorMap - atomId → embedding vector
 * @param {Float32Array|number[]} queryVector - R2 weighted query vector
 * @returns {{ diffused: object[], gateStats: object }}
 */
function postVerify(pi, atomIds, atomById, seedAtomIds, vectorMap, queryVector) {
    const N = atomIds.length;
    const gateStats = { passed: 0, filtered: 0, noVector: 0 };

    // Find max PPR score among non-seed nodes (for normalization)
    let maxPPR = 0;
    for (let i = 0; i < N; i++) {
        if (pi[i] > 0 && !seedAtomIds.has(atomIds[i])) {
            if (pi[i] > maxPPR) maxPPR = pi[i];
        }
    }

    if (maxPPR <= 0) {
        return { diffused: [], gateStats };
    }

    const candidates = [];

    for (let i = 0; i < N; i++) {
        const atomId = atomIds[i];

        // Skip seeds and zero-probability nodes
        if (seedAtomIds.has(atomId)) continue;
        if (pi[i] <= 0) continue;

        // Require state vector for cosine verification
        const vec = vectorMap.get(atomId);
        if (!vec?.length) {
            gateStats.noVector++;
            continue;
        }

        // Cosine gate
        const cos = cosineSimilarity(queryVector, vec);
        if (cos < CONFIG.COSINE_GATE) {
            gateStats.filtered++;
            continue;
        }

        // Final score = PPR_normalized × cosine
        const pprNorm = pi[i] / maxPPR;
        const finalScore = pprNorm * cos;

        if (finalScore < CONFIG.SCORE_FLOOR) {
            gateStats.filtered++;
            continue;
        }

        gateStats.passed++;

        const atom = atomById.get(atomId);
        if (!atom) continue;

        candidates.push({
            atomId,
            floor: atom.floor,
            atom,
            finalScore,
            pprScore: pi[i],
            pprNormalized: pprNorm,
            cosine: cos,
        });
    }

    // Sort by finalScore descending, cap at DIFFUSION_CAP
    candidates.sort((a, b) => b.finalScore - a.finalScore);
    const diffused = candidates.slice(0, CONFIG.DIFFUSION_CAP);

    return { diffused, gateStats };
}

// ═══════════════════════════════════════════════════════════════════════════
// Main entry point
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Spread activation from seed L0 atoms through entity co-occurrence graph.
 *
 * Called from recall.js Stage 7.5, after locateAndPullEvidence and before
 * Causation Trace. Results are merged into l0Selected and consumed by
 * prompt.js through existing budget/formatting pipeline (zero downstream changes).
 *
 * @param {object[]} seeds - l0Selected from recall Stage 6
 *   Each: { atomId, rerankScore, similarity, atom, ... }
 * @param {object[]} allAtoms - getStateAtoms() result
 *   Each: { atomId, floor, semantic, edges, where }
 * @param {object[]} stateVectors - getAllStateVectors() result
 *   Each: { atomId, floor, vector: Float32Array, rVector?: Float32Array }
 * @param {Float32Array|number[]} queryVector - R2 weighted query vector
 * @param {object|null} metrics - metrics object (optional, mutated in-place)
 * @returns {object[]} Additional L0 atoms for l0Selected
 *   Each: { atomId, floor, atom, finalScore, pprScore, pprNormalized, cosine }
 */
export function diffuseFromSeeds(seeds, allAtoms, stateVectors, queryVector, metrics) {
    const T0 = performance.now();

    // ─── Early exits ─────────────────────────────────────────────────

    if (!seeds?.length || !allAtoms?.length || !queryVector?.length) {
        fillMetricsEmpty(metrics);
        return [];
    }

    // Align with entity-lexicon hard rule: exclude name1 from graph features.
    const { name1 } = getContext();
    const excludeEntities = new Set();
    if (name1) excludeEntities.add(normalize(name1));

    // ─── 1. Build atom index ─────────────────────────────────────────

    const atomById = new Map();
    const atomIds = [];
    const idToIdx = new Map();

    for (let i = 0; i < allAtoms.length; i++) {
        const a = allAtoms[i];
        atomById.set(a.atomId, a);
        atomIds.push(a.atomId);
        idToIdx.set(a.atomId, i);
    }

    const N = allAtoms.length;

    // Validate seeds against atom index
    const validSeeds = seeds.filter(s => idToIdx.has(s.atomId));
    const seedAtomIds = new Set(validSeeds.map(s => s.atomId));

    if (!validSeeds.length) {
        fillMetricsEmpty(metrics);
        return [];
    }

    // ─── 2. Build graph ──────────────────────────────────────────────

    const graph = buildGraph(allAtoms, stateVectors, excludeEntities);

    if (graph.edgeCount === 0) {
        fillMetrics(metrics, {
            seedCount: validSeeds.length,
            graphNodes: N,
            graphEdges: 0,
            channelStats: graph.channelStats,
            candidatePairs: graph.candidatePairs,
            pairsFromWhat: graph.pairsFromWhat,
            pairsFromRSem: graph.pairsFromRSem,
            rSemAvgSim: graph.rSemAvgSim,
            timeWindowFilteredPairs: graph.timeWindowFilteredPairs,
            topKPrunedPairs: graph.topKPrunedPairs,
            edgeDensity: graph.edgeDensity,
            reweightWhoUsed: graph.reweightWhoUsed,
            reweightWhereUsed: graph.reweightWhereUsed,
            time: graph.buildTime,
        });
        xbLog.info(MODULE_ID, 'No graph edges — skipping diffusion');
        return [];
    }

    // ─── 3. Build seed vector ────────────────────────────────────────

    const s = buildSeedVector(validSeeds, idToIdx, N);

    // ─── 4. Column normalize ─────────────────────────────────────────

    const { columns, dangling } = columnNormalize(graph.neighbors, N);

    // ─── 5. PPR Power Iteration ──────────────────────────────────────

    const T_PPR = performance.now();
    const { pi, iterations, finalError } = powerIteration(columns, s, dangling, N);
    const pprTime = Math.round(performance.now() - T_PPR);

    // Count activated non-seed nodes
    let pprActivated = 0;
    for (let i = 0; i < N; i++) {
        if (pi[i] > 0 && !seedAtomIds.has(atomIds[i])) pprActivated++;
    }

    // ─── 6. Post-verification ────────────────────────────────────────

    const vectorMap = new Map();
    for (const sv of (stateVectors || [])) {
        vectorMap.set(sv.atomId, sv.vector);
    }

    const { diffused, gateStats } = postVerify(
        pi, atomIds, atomById, seedAtomIds, vectorMap, queryVector
    );

    // ─── 7. Metrics ──────────────────────────────────────────────────

    const totalTime = Math.round(performance.now() - T0);

    fillMetrics(metrics, {
        seedCount: validSeeds.length,
        graphNodes: N,
        graphEdges: graph.edgeCount,
        channelStats: graph.channelStats,
        candidatePairs: graph.candidatePairs,
        pairsFromWhat: graph.pairsFromWhat,
        pairsFromRSem: graph.pairsFromRSem,
        rSemAvgSim: graph.rSemAvgSim,
        timeWindowFilteredPairs: graph.timeWindowFilteredPairs,
        topKPrunedPairs: graph.topKPrunedPairs,
        edgeDensity: graph.edgeDensity,
        reweightWhoUsed: graph.reweightWhoUsed,
        reweightWhereUsed: graph.reweightWhereUsed,
        buildTime: graph.buildTime,
        iterations,
        convergenceError: finalError,
        pprActivated,
        cosineGatePassed: gateStats.passed,
        cosineGateFiltered: gateStats.filtered,
        cosineGateNoVector: gateStats.noVector,
        postGatePassRate: pprActivated > 0
            ? Math.round((gateStats.passed / pprActivated) * 100)
            : 0,
        finalCount: diffused.length,
        scoreDistribution: diffused.length > 0
            ? calcScoreStats(diffused.map(d => d.finalScore))
            : { min: 0, max: 0, mean: 0 },
        time: totalTime,
    });

    xbLog.info(MODULE_ID,
        `Diffusion: ${validSeeds.length} seeds → ` +
        `graph(${N}n/${graph.edgeCount}e) → ` +
        `PPR(${iterations}it, ε=${finalError.toExponential(1)}, ${pprTime}ms) → ` +
        `${pprActivated} activated → ` +
        `gate(${gateStats.passed}\u2713/${gateStats.filtered}\u2717` +
        `${gateStats.noVector ? `/${gateStats.noVector}?` : ''}) → ` +
        `${diffused.length} final (${totalTime}ms)`
    );

    return diffused;
}

// ═══════════════════════════════════════════════════════════════════════════
// Metrics helpers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute min/max/mean distribution
 * @param {number[]} scores
 * @returns {{ min: number, max: number, mean: number }}
 */
function calcScoreStats(scores) {
    if (!scores.length) return { min: 0, max: 0, mean: 0 };
    const sorted = [...scores].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    return {
        min: Number(sorted[0].toFixed(3)),
        max: Number(sorted[sorted.length - 1].toFixed(3)),
        mean: Number((sum / sorted.length).toFixed(3)),
    };
}

/**
 * Fill metrics with empty diffusion block
 */
function fillMetricsEmpty(metrics) {
    if (!metrics) return;
    metrics.diffusion = {
        seedCount: 0,
        graphNodes: 0,
        graphEdges: 0,
        iterations: 0,
        convergenceError: 0,
        pprActivated: 0,
        cosineGatePassed: 0,
        cosineGateFiltered: 0,
        cosineGateNoVector: 0,
        finalCount: 0,
        scoreDistribution: { min: 0, max: 0, mean: 0 },
        byChannel: { what: 0, where: 0, rSem: 0, who: 0 },
        candidatePairs: 0,
        pairsFromWhat: 0,
        pairsFromRSem: 0,
        rSemAvgSim: 0,
        timeWindowFilteredPairs: 0,
        topKPrunedPairs: 0,
        edgeDensity: 0,
        reweightWhoUsed: 0,
        reweightWhereUsed: 0,
        postGatePassRate: 0,
        time: 0,
    };
}

/**
 * Fill metrics with diffusion results
 */
function fillMetrics(metrics, data) {
    if (!metrics) return;
    metrics.diffusion = {
        seedCount: data.seedCount || 0,
        graphNodes: data.graphNodes || 0,
        graphEdges: data.graphEdges || 0,
        iterations: data.iterations || 0,
        convergenceError: data.convergenceError || 0,
        pprActivated: data.pprActivated || 0,
        cosineGatePassed: data.cosineGatePassed || 0,
        cosineGateFiltered: data.cosineGateFiltered || 0,
        cosineGateNoVector: data.cosineGateNoVector || 0,
        postGatePassRate: data.postGatePassRate || 0,
        finalCount: data.finalCount || 0,
        scoreDistribution: data.scoreDistribution || { min: 0, max: 0, mean: 0 },
        byChannel: data.channelStats || { what: 0, where: 0, rSem: 0, who: 0 },
        candidatePairs: data.candidatePairs || 0,
        pairsFromWhat: data.pairsFromWhat || 0,
        pairsFromRSem: data.pairsFromRSem || 0,
        rSemAvgSim: data.rSemAvgSim || 0,
        timeWindowFilteredPairs: data.timeWindowFilteredPairs || 0,
        topKPrunedPairs: data.topKPrunedPairs || 0,
        edgeDensity: data.edgeDensity || 0,
        reweightWhoUsed: data.reweightWhoUsed || 0,
        reweightWhereUsed: data.reweightWhereUsed || 0,
        time: data.time || 0,
    };
}
