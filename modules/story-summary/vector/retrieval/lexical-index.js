import { getContext } from '../../../../../../../extensions.js';
import { getSummaryStore } from '../../data/store.js';
import { getAllChunks } from '../storage/chunk-store.js';
import { xbLog } from '../../../../core/debug-core.js';
import { getTokenizerSnapshot, injectEntities } from '../utils/tokenizer.js';
import { getEntityVocabulary } from './entity-lexicon.js';
import { normalizeEntityTerm } from './entity-matcher.js';
import { LexicalCorpus } from './lexical-corpus.js';

const MODULE_ID = 'lexical-index';

// One active chat, one runtime owner. No persisted index or schema.
let cachedIndex = null;
let cachedChatId = null;
let activeBuild = null;
const queryFormsByTokenizer = new WeakMap();

function cleanSummary(summary) {
    return String(summary || '').replace(/\s*\(#\d+(?:-\d+)?\)\s*$/, '').trim();
}
const normalizeTerm = normalizeEntityTerm;

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
    }

    for (const ev of events || []) {
        const doc = buildEventDoc(ev);
        if (doc) docs.push(doc);
    }

    return { docs };
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
 * @property {Array<{term:string,error:Error}>} failures - Failed terms; other hits remain usable.
 */

/**
 * Search lexical index by terms, using per-term MiniSearch and IDF-weighted score aggregation.
 * This keeps existing outputs compatible while adding observability fields.
 *
 * @param {LexicalCorpus} index
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
        idfEnabled: (index?.documentCount || 0) > 0,
        idfDocCount: index?.documentCount || 0,
        topIdfTerms: [],
        queryTerms: [],
        termFloorHits: {},
        floorLexScores: [],
        termSearches: 0,
        searchTime: 0,
        failures: [],
    };

    if (!index || !terms?.length) {
        result.searchTime = Math.round(performance.now() - T0);
        return result;
    }

    const groups = buildLexicalQueryGroups(index.tokenizer, terms);
    const queryTerms = groups.map(group => group.term);
    result.queryTerms = [...queryTerms];
    const weightedScores = new Map(); // docId -> score
    const hitMeta = new Map(); // docId -> { type, floor }
    const idfPairs = [];
    const termFloorHits = new Map(); // term -> [{ floor, weightedScore, chunkId }]
    const floorLexAgg = new Map(); // floor -> { score, terms:Set<string> }

    for (const group of groups) {
        const term = group.term;
        const idf = Math.max(...group.forms.map(form => index.getIdf(form)));
        idfPairs.push({ term, idf });
        const groupedHits = new Map();
        for (const form of group.forms) {
            try {
                for (const hit of index.search(form, { exact: group.exact })) {
                    const weighted = (hit.score || 0) * index.getIdf(form);
                    if (!groupedHits.has(hit.id) || groupedHits.get(hit.id).weighted < weighted) {
                        groupedHits.set(hit.id, { ...hit, weighted });
                    }
                }
                result.termSearches += 1;
            } catch (error) {
                xbLog.warn(MODULE_ID, `Lexical term search failed: ${form}`, error);
                result.failures.push({ term: form, error });
            }
        }
        const hits = [...groupedHits.values()];

        for (const hit of hits) {
            const id = String(hit.id || '');
            if (!id) continue;

            const weighted = hit.weighted;
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

// Keep surface spellings in documents. Canonical names only group queries;
// recognizing an identity reveal therefore does not rewrite historical prose.
function buildLexicalQueryGroups(tokenizer, terms) {
    let formsByIdentity = queryFormsByTokenizer.get(tokenizer);
    if (!formsByIdentity) {
        formsByIdentity = new Map();
        for (const [form, display] of tokenizer.entities) {
            const identity = normalizeTerm(display);
            const forms = formsByIdentity.get(identity) || [];
            forms.push(form);
            formsByIdentity.set(identity, forms);
        }
        queryFormsByTokenizer.set(tokenizer, formsByIdentity);
    }
    const groups = new Map();
    for (const raw of terms) {
        const term = normalizeTerm(raw);
        if (!term) continue;
        const identity = normalizeTerm(tokenizer.entities.get(term) || '');
        const key = identity || term;
        if (!groups.has(key)) groups.set(key, {
            term: key,
            exact: !!identity,
            forms: identity ? formsByIdentity.get(identity) : [term],
        });
    }
    return [...groups.values()];
}

function synchronizeVocabulary() {
    const store = getSummaryStore();
    const context = getContext();
    const vocabulary = getEntityVocabulary(store, context);
    injectEntities(vocabulary.lexicon, vocabulary.displayMap, vocabulary.blockedTerms);
}

export function getLexicalIdfAccessor() {
    // A corpus being repaired is not a complete scoring snapshot yet.
    const index = activeBuild || cachedChatId !== getContext().chatId ? null : cachedIndex;
    return {
        enabled: (index?.documentCount || 0) > 0,
        docCount: index?.documentCount || 0,
        getIdf: term => index?.getIdf(term) || 1,
    };
}

export async function getLexicalIndex() {
    const { chatId } = getContext();
    if (!chatId) return null;
    synchronizeVocabulary();
    while (getContext().chatId === chatId) {
        if (!activeBuild && cachedIndex && cachedChatId === chatId && cachedIndex.tokenizer === getTokenizerSnapshot()) return cachedIndex;
        const pending = activeBuild?.chatId === chatId ? activeBuild.promise : startIndexSync(chatId);
        if (!await pending) return null;
        // Another committed update may have arrived while the promise settled.
        // Join it before handing a partially updated corpus to a reader.
    }
    return null;
}

function startIndexSync(chatId, updates = []) {
    const build = { chatId, updates, promise: null };
    const isCurrent = () => activeBuild === build && getContext().chatId === chatId;
    activeBuild = build;
    build.promise = Promise.resolve().then(async () => {
        if (!isCurrent()) return null;
        let index = cachedChatId === chatId ? cachedIndex : null;
        if (index) {
            // The writer exclusively owns this mutable corpus until publication.
            // If a chat switch abandons it mid-slice, never reuse a partial cache.
            cachedIndex = null;
            cachedChatId = null;
        }
        if (!index) {
            // A failed read is a failed build, NOT an empty successful corpus.
            const chunks = await getAllChunks(chatId);
            if (!isCurrent()) return null;
            const { docs } = collectDocuments(chunks, getSummaryStore()?.json?.events || []);
            // Fold changes queued during the read over the loaded source before
            // tokenizing it. Deleted/intermediate versions never enter the index.
            build.updates.unshift({ docs });
        }
        while (isCurrent()) {
            synchronizeVocabulary();
            const tokenizer = getTokenizerSnapshot();
            index ||= new LexicalCorpus(tokenizer);
            const updates = build.updates.splice(0);
            await index.applyBatch(updates, tokenizer, isCurrent);
            if (!isCurrent()) return null;
            if (build.updates.length || index.tokenizer !== getTokenizerSnapshot()) continue;
            cachedIndex = index;
            cachedChatId = chatId;
            // Publish and close the writer in the same synchronous step. Later
            // updates must start a new sync, never enter this finished queue.
            activeBuild = null;
            return index;
        }
        return null;
    }).catch(error => {
        if (isCurrent()) {
            cachedIndex = null;
            cachedChatId = null;
        }
        throw error;
    }).finally(() => {
        if (activeBuild === build) activeBuild = null;
    });
    // Incremental writers may enqueue without awaiting. Observe their failure
    // here, while keeping the original rejection available to recall readers.
    build.promise.catch(error => xbLog.error(MODULE_ID, 'Index build failed', error));
    return build.promise;
}

export function warmupIndex() {
    getLexicalIndex().catch(error => xbLog.warn(MODULE_ID, 'Warmup failed', error));
}

export function invalidateLexicalIndex() {
    cachedIndex = null;
    cachedChatId = null;
    activeBuild = null;
}

function applyUpdate(update, chatId) {
    if (!chatId || getContext().chatId !== chatId) return null;
    if (!update.clearChunks && update.floor === undefined && !update.docs?.length && !update.removeIds?.length) return null;
    if (activeBuild?.chatId === chatId) {
        activeBuild.updates.push(update);
        return activeBuild.promise;
    }
    if (!cachedIndex || cachedChatId !== chatId) return null;
    // Even warm-cache writes use the sliced sync. Enqueuing a large alias
    // migration must not tokenize the entire batch on the caller's stack.
    return startIndexSync(chatId, [update]);
}

export function addDocumentsForFloor(floor, chunks, chatId = getContext().chatId) {
    const { docs } = collectDocuments((chunks || []).map(chunk => ({ ...chunk, floor: chunk.floor ?? floor })), []);
    return applyUpdate({ floor, docs }, chatId);
}

export function addChunkDocuments(chunks, chatId = getContext().chatId) {
    return applyUpdate({ docs: collectDocuments(chunks || [], []).docs }, chatId);
}

export function clearChunkDocuments(chatId = getContext().chatId) {
    return applyUpdate({ clearChunks: true }, chatId);
}

export function removeDocumentsByFloor(floor, chatId = getContext().chatId) {
    return applyUpdate({ floor }, chatId);
}

export function addEventDocuments(events, chatId = getContext().chatId) {
    const docs = [];
    const removeIds = [];
    for (const event of events || []) {
        const doc = buildEventDoc(event);
        if (doc) docs.push(doc);
        else if (event?.id) removeIds.push(event.id);
    }
    return applyUpdate({ docs, removeIds }, chatId);
}

export function removeEventDocuments(ids, chatId = getContext().chatId) {
    return applyUpdate({ removeIds: ids }, chatId);
}
