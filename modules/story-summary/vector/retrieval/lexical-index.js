import MiniSearch from '../../../../libs/minisearch.mjs';
import { getContext } from '../../../../../../../extensions.js';
import { getSummaryStore } from '../../data/store.js';
import { getAllChunks } from '../storage/chunk-store.js';
import { xbLog } from '../../../../core/debug-core.js';
import { tokenizeForIndex } from '../utils/tokenizer.js';

const MODULE_ID = 'lexical-index';

// In-memory index cache
let cachedIndex = null;
let cachedChatId = null;
let cachedFingerprint = null;
let building = false;
let buildPromise = null;

// floor -> chunk doc ids (L1 only)
let floorDocIds = new Map();

// IDF stats over lexical docs (L1 chunks + L2 events)
let termDfMap = new Map();
let docTokenSets = new Map(); // docId -> Set<token>
let lexicalDocCount = 0;

const IDF_MIN = 1.0;
const IDF_MAX = 4.0;
const BUILD_BATCH_SIZE = 500;

function cleanSummary(summary) {
    return String(summary || '')
        .replace(/\s*\(#\d+(?:-\d+)?\)\s*$/, '')
        .trim();
}

function fnv1a32(input, seed = 0x811C9DC5) {
    let hash = seed >>> 0;
    const text = String(input || '');
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
}

function compareDocKeys(a, b) {
    const ka = `${a?.type || ''}:${a?.id || ''}`;
    const kb = `${b?.type || ''}:${b?.id || ''}`;
    if (ka < kb) return -1;
    if (ka > kb) return 1;
    return 0;
}

function computeFingerprintFromDocs(docs) {
    const normalizedDocs = Array.isArray(docs) ? [...docs].sort(compareDocKeys) : [];
    let hash = 0x811C9DC5;

    for (const doc of normalizedDocs) {
        const payload = `${doc?.type || ''}\u001F${doc?.id || ''}\u001F${doc?.floor ?? ''}\u001F${doc?.text || ''}\u001E`;
        hash = fnv1a32(payload, hash);
    }

    return `${normalizedDocs.length}:${(hash >>> 0).toString(16)}`;
}

function yieldToMain() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function normalizeTerm(term) {
    return String(term || '').trim().toLowerCase();
}

function computeIdfFromDf(df, docCount) {
    if (!docCount || docCount <= 0) return 1;
    const raw = Math.log((docCount + 1) / ((df || 0) + 1)) + 1;
    return clamp(raw, IDF_MIN, IDF_MAX);
}

function computeIdf(term) {
    const t = normalizeTerm(term);
    if (!t || lexicalDocCount <= 0) return 1;
    return computeIdfFromDf(termDfMap.get(t) || 0, lexicalDocCount);
}

function extractUniqueTokens(text) {
    return new Set(tokenizeForIndex(String(text || '')).map(normalizeTerm).filter(Boolean));
}

function clearIdfState() {
    termDfMap = new Map();
    docTokenSets = new Map();
    lexicalDocCount = 0;
}

function removeDocumentIdf(docId) {
    const id = String(docId || '');
    if (!id) return;

    const tokens = docTokenSets.get(id);
    if (!tokens) return;

    for (const token of tokens) {
        const current = termDfMap.get(token) || 0;
        if (current <= 1) {
            termDfMap.delete(token);
        } else {
            termDfMap.set(token, current - 1);
        }
    }

    docTokenSets.delete(id);
    lexicalDocCount = Math.max(0, lexicalDocCount - 1);
}

function addDocumentIdf(docId, text) {
    const id = String(docId || '');
    if (!id) return;

    // Replace semantics: remove old token set first if this id already exists.
    removeDocumentIdf(id);

    const tokens = extractUniqueTokens(text);
    docTokenSets.set(id, tokens);
    lexicalDocCount += 1;

    for (const token of tokens) {
        termDfMap.set(token, (termDfMap.get(token) || 0) + 1);
    }
}

function rebuildIdfFromDocs(docs) {
    clearIdfState();
    for (const doc of docs || []) {
        const id = String(doc?.id || '');
        const text = String(doc?.text || '');
        if (!id || !text.trim()) continue;
        addDocumentIdf(id, text);
    }
}

function buildEventDoc(ev) {
    if (!ev?.id) return null;

    const parts = [];
    if (ev.title) parts.push(ev.title);
    if (ev.participants?.length) parts.push(ev.participants.join(' '));

    const summary = cleanSummary(ev.summary);
    if (summary) parts.push(summary);

    const text = parts.join(' ').trim();
    if (!text) return null;

    return {
        id: ev.id,
        type: 'event',
        floor: null,
        text,
    };
}

function collectDocuments(chunks, events) {
    const docs = [];

    for (const chunk of chunks || []) {
        if (!chunk?.chunkId || !chunk.text) continue;

        const floor = chunk.floor ?? -1;
        docs.push({
            id: chunk.chunkId,
            type: 'chunk',
            floor,
            text: chunk.text,
        });

        if (floor >= 0) {
            if (!floorDocIds.has(floor)) floorDocIds.set(floor, []);
            floorDocIds.get(floor).push(chunk.chunkId);
        }
    }

    for (const ev of events || []) {
        const doc = buildEventDoc(ev);
        if (doc) docs.push(doc);
    }

    return docs;
}

async function buildIndexAsync(docs) {
    const T0 = performance.now();

    const index = new MiniSearch({
        fields: ['text'],
        storeFields: ['type', 'floor'],
        idField: 'id',
        searchOptions: {
            boost: { text: 1 },
            fuzzy: 0.2,
            prefix: true,
        },
        tokenize: tokenizeForIndex,
    });

    if (!docs.length) return index;

    for (let i = 0; i < docs.length; i += BUILD_BATCH_SIZE) {
        const batch = docs.slice(i, i + BUILD_BATCH_SIZE);
        index.addAll(batch);

        if (i + BUILD_BATCH_SIZE < docs.length) {
            await yieldToMain();
        }
    }

    const elapsed = Math.round(performance.now() - T0);
    xbLog.info(MODULE_ID, `Index built: ${docs.length} docs (${elapsed}ms)`);
    return index;
}

/**
 * @typedef {object} LexicalSearchResult
 * @property {string[]} atomIds - Reserved for backward compatibility (currently empty).
 * @property {Set<number>} atomFloors - Reserved for backward compatibility (currently empty).
 * @property {string[]} chunkIds - Matched L1 chunk ids sorted by weighted lexical score.
 * @property {Set<number>} chunkFloors - Floor ids covered by matched chunks.
 * @property {string[]} eventIds - Matched L2 event ids sorted by weighted lexical score.
 * @property {object[]} chunkScores - Weighted lexical scores for matched chunks.
 * @property {boolean} idfEnabled - Whether IDF stats are available for weighting.
 * @property {number} idfDocCount - Number of lexical docs used to compute IDF.
 * @property {Array<{term:string,idf:number}>} topIdfTerms - Top query terms by IDF.
 * @property {string[]} queryTerms - Normalized query terms actually searched.
 * @property {Record<string, Array<{floor:number, weightedScore:number, chunkId:string}>>} termFloorHits - Chunk-floor hits by term.
 * @property {Array<{floor:number, score:number, hitTermsCount:number}>} floorLexScores - Aggregated lexical floor scores (debug).
 * @property {number} termSearches - Number of per-term MiniSearch queries executed.
 * @property {number} searchTime - Total lexical search time in milliseconds.
 */

/**
 * Search lexical index by terms, using per-term MiniSearch and IDF-weighted score aggregation.
 * This keeps existing outputs compatible while adding observability fields.
 *
 * @param {MiniSearch} index
 * @param {string[]} terms
 * @returns {LexicalSearchResult}
 */
export function searchLexicalIndex(index, terms) {
    const T0 = performance.now();

    const result = {
        atomIds: [],
        atomFloors: new Set(),
        chunkIds: [],
        chunkFloors: new Set(),
        eventIds: [],
        chunkScores: [],
        idfEnabled: lexicalDocCount > 0,
        idfDocCount: lexicalDocCount,
        topIdfTerms: [],
        queryTerms: [],
        termFloorHits: {},
        floorLexScores: [],
        termSearches: 0,
        searchTime: 0,
    };

    if (!index || !terms?.length) {
        result.searchTime = Math.round(performance.now() - T0);
        return result;
    }

    const queryTerms = Array.from(new Set((terms || []).map(normalizeTerm).filter(Boolean)));
    result.queryTerms = [...queryTerms];
    const weightedScores = new Map(); // docId -> score
    const hitMeta = new Map(); // docId -> { type, floor }
    const idfPairs = [];
    const termFloorHits = new Map(); // term -> [{ floor, weightedScore, chunkId }]
    const floorLexAgg = new Map(); // floor -> { score, terms:Set<string> }

    for (const term of queryTerms) {
        const idf = computeIdf(term);
        idfPairs.push({ term, idf });

        let hits = [];
        try {
            hits = index.search(term, {
                boost: { text: 1 },
                fuzzy: 0.2,
                prefix: true,
                combineWith: 'OR',
                tokenize: tokenizeForIndex,
            });
        } catch (e) {
            xbLog.warn(MODULE_ID, `Lexical term search failed: ${term}`, e);
            continue;
        }

        result.termSearches += 1;

        for (const hit of hits) {
            const id = String(hit.id || '');
            if (!id) continue;

            const weighted = (hit.score || 0) * idf;
            weightedScores.set(id, (weightedScores.get(id) || 0) + weighted);

            if (!hitMeta.has(id)) {
                hitMeta.set(id, {
                    type: hit.type,
                    floor: hit.floor,
                });
            }

            if (hit.type === 'chunk' && typeof hit.floor === 'number' && hit.floor >= 0) {
                if (!termFloorHits.has(term)) termFloorHits.set(term, []);
                termFloorHits.get(term).push({
                    floor: hit.floor,
                    weightedScore: weighted,
                    chunkId: id,
                });

                const floorAgg = floorLexAgg.get(hit.floor) || { score: 0, terms: new Set() };
                floorAgg.score += weighted;
                floorAgg.terms.add(term);
                floorLexAgg.set(hit.floor, floorAgg);
            }
        }
    }

    idfPairs.sort((a, b) => b.idf - a.idf);
    result.topIdfTerms = idfPairs.slice(0, 5);
    result.termFloorHits = Object.fromEntries(
        [...termFloorHits.entries()].map(([term, hits]) => [term, hits]),
    );
    result.floorLexScores = [...floorLexAgg.entries()]
        .map(([floor, info]) => ({
            floor,
            score: Number(info.score.toFixed(6)),
            hitTermsCount: info.terms.size,
        }))
        .sort((a, b) => b.score - a.score);

    const sortedHits = Array.from(weightedScores.entries())
        .sort((a, b) => b[1] - a[1]);

    for (const [id, score] of sortedHits) {
        const meta = hitMeta.get(id);
        if (!meta) continue;

        if (meta.type === 'chunk') {
            result.chunkIds.push(id);
            result.chunkScores.push({ chunkId: id, score });
            if (typeof meta.floor === 'number' && meta.floor >= 0) {
                result.chunkFloors.add(meta.floor);
            }
            continue;
        }

        if (meta.type === 'event') {
            result.eventIds.push(id);
        }
    }

    result.searchTime = Math.round(performance.now() - T0);

    xbLog.info(
        MODULE_ID,
        `Lexical search terms=[${queryTerms.slice(0, 5).join(',')}] chunks=${result.chunkIds.length} events=${result.eventIds.length} termSearches=${result.termSearches} (${result.searchTime}ms)`,
    );

    return result;
}

async function collectAndBuild(chatId) {
    floorDocIds = new Map();

    const store = getSummaryStore();
    const events = store?.json?.events || [];

    let chunks = [];
    try {
        chunks = await getAllChunks(chatId);
    } catch (e) {
        xbLog.warn(MODULE_ID, 'Failed to load chunks', e);
    }

    const docs = collectDocuments(chunks, events);
    const fp = computeFingerprintFromDocs(docs);

    if (cachedIndex && cachedChatId === chatId && cachedFingerprint === fp) {
        return { index: cachedIndex, fingerprint: fp };
    }

    rebuildIdfFromDocs(docs);
    const index = await buildIndexAsync(docs);

    return { index, fingerprint: fp };
}

/**
 * Expose IDF accessor for query-term selection in query-builder.
 * If index stats are not ready, this gracefully falls back to idf=1.
 */
export function getLexicalIdfAccessor() {
    return {
        enabled: lexicalDocCount > 0,
        docCount: lexicalDocCount,
        getIdf(term) {
            return computeIdf(term);
        },
    };
}

export async function getLexicalIndex() {
    const { chatId } = getContext();
    if (!chatId) return null;

    if (cachedIndex && cachedChatId === chatId && cachedFingerprint) {
        return cachedIndex;
    }

    if (building && buildPromise) {
        try {
            await buildPromise;
            if (cachedIndex && cachedChatId === chatId && cachedFingerprint) {
                return cachedIndex;
            }
        } catch {
            // Continue to rebuild below.
        }
    }

    xbLog.info(MODULE_ID, `Lexical cache miss; rebuilding (chatId=${chatId.slice(0, 8)})`);

    building = true;
    buildPromise = collectAndBuild(chatId);

    try {
        const { index, fingerprint } = await buildPromise;
        cachedIndex = index;
        cachedChatId = chatId;
        cachedFingerprint = fingerprint;
        return index;
    } catch (e) {
        xbLog.error(MODULE_ID, 'Index build failed', e);
        return null;
    } finally {
        building = false;
        buildPromise = null;
    }
}

export function warmupIndex() {
    const { chatId } = getContext();
    if (!chatId || building) return;

    getLexicalIndex().catch(e => {
        xbLog.warn(MODULE_ID, 'Warmup failed', e);
    });
}

export function invalidateLexicalIndex() {
    if (cachedIndex) {
        xbLog.info(MODULE_ID, 'Lexical index cache invalidated');
    }
    cachedIndex = null;
    cachedChatId = null;
    cachedFingerprint = null;
    floorDocIds = new Map();
    clearIdfState();
}

export function addDocumentsForFloor(floor, chunks) {
    if (!cachedIndex || !chunks?.length) return;

    removeDocumentsByFloor(floor);

    const docs = [];
    const docIds = [];

    for (const chunk of chunks) {
        if (!chunk?.chunkId || !chunk.text) continue;

        const doc = {
            id: chunk.chunkId,
            type: 'chunk',
            floor: chunk.floor ?? floor,
            text: chunk.text,
        };
        docs.push(doc);
        docIds.push(chunk.chunkId);
    }

    if (!docs.length) return;

    cachedIndex.addAll(docs);
    floorDocIds.set(floor, docIds);

    for (const doc of docs) {
        addDocumentIdf(doc.id, doc.text);
    }

    xbLog.info(MODULE_ID, `Incremental add floor=${floor} chunks=${docs.length}`);
}

export function removeDocumentsByFloor(floor) {
    if (!cachedIndex) return;

    const docIds = floorDocIds.get(floor);
    if (!docIds?.length) return;

    for (const id of docIds) {
        try {
            cachedIndex.discard(id);
        } catch {
            // Ignore if the doc was already removed/rebuilt.
        }
        removeDocumentIdf(id);
    }

    floorDocIds.delete(floor);
    xbLog.info(MODULE_ID, `Incremental remove floor=${floor} chunks=${docIds.length}`);
}

export function addEventDocuments(events) {
    if (!cachedIndex || !events?.length) return;

    const docs = [];

    for (const ev of events) {
        const doc = buildEventDoc(ev);
        if (!doc) continue;

        try {
            cachedIndex.discard(doc.id);
        } catch {
            // Ignore if previous document does not exist.
        }
        removeDocumentIdf(doc.id);
        docs.push(doc);
    }

    if (!docs.length) return;

    cachedIndex.addAll(docs);
    for (const doc of docs) {
        addDocumentIdf(doc.id, doc.text);
    }

    xbLog.info(MODULE_ID, `Incremental add events=${docs.length}`);
}
