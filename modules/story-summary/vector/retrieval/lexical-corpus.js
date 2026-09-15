import MiniSearch from '../../../../libs/minisearch.mjs';
import { normalizeEntityTerm } from './entity-matcher.js';

const TOKEN_SEPARATOR = '\u001f';
const WORK_SLICE_MS = 8;
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

function createSlicedVisitor(isCurrent) {
    let sliceStart = performance.now();
    return async (items, visit) => {
        for (const item of items) {
            if (!isCurrent()) return;
            visit(item);
            if (performance.now() - sliceStart >= WORK_SLICE_MS) {
                await yieldToMain();
                sliceStart = performance.now();
            }
        }
    };
}

function* orderedMutations(updates) {
    for (let order = 0; order < updates.length; order++) {
        const update = updates[order];
        if (update.clearChunks) yield { clearChunks: true, order };
        else if (update.floor !== undefined) yield { floor: update.floor, order };
        // Within one update, removals precede additions (floor replacement).
        for (const id of update.removeIds || []) yield { id, doc: null, order };
        for (const doc of update.docs || []) {
            if (doc?.id) yield { id: doc.id, doc: doc.text ? doc : null, order };
        }
    }
}

function* chunkIdsAcrossFloors(chunkIdsByFloor, floors) {
    for (const floor of floors) yield* chunkIdsByFloor.get(floor) || [];
}

function sameDocument(left, right) {
    return !!left && !!right && left.text === right.text && left.type === right.type && left.floor === right.floor;
}

// Runtime-only searchable corpus. Retains source text once so vocabulary changes
// can repair affected documents without reloading/re-tokenizing the whole chat.
// MiniSearch and IDF consume the SAME token array, calculated once per update.
export class LexicalCorpus {
    constructor(tokenizer) {
        this.tokenizer = tokenizer;
        this.records = new Map();
        this.chunkIdsByFloor = new Map();
        this.documentFrequency = new Map();
        this.index = new MiniSearch({
            fields: ['tokens'],
            storeFields: ['type', 'floor'],
            tokenize: text => text ? text.split(TOKEN_SEPARATOR) : [],
        });
    }

    get documentCount() { return this.records.size; }

    getIdf(term) {
        if (!this.documentCount) return 1;
        const df = this.documentFrequency.get(normalizeEntityTerm(term)) || 0;
        return Math.max(1, Math.min(4, Math.log((this.documentCount + 1) / (df + 1)) + 1));
    }

    remove(id) {
        const record = this.records.get(id);
        if (!record) return;
        this.index.remove({ ...record.doc, tokens: record.tokens });
        for (const term of new Set(record.tokens.split(TOKEN_SEPARATOR).filter(Boolean))) {
            const count = this.documentFrequency.get(term) - 1;
            if (count > 0) this.documentFrequency.set(term, count);
            else this.documentFrequency.delete(term);
        }
        if (record.doc.type === 'chunk') {
            const ids = this.chunkIdsByFloor.get(record.doc.floor);
            ids.delete(id);
            if (!ids.size) this.chunkIdsByFloor.delete(record.doc.floor);
        }
        this.records.delete(id);
    }

    upsert(doc, tokenizer = this.tokenizer, force = false) {
        if (!doc?.id) return;
        if (!doc.text) { this.remove(doc.id); return; }
        const previous = this.records.get(doc.id)?.doc;
        if (!force && sameDocument(previous, doc)) return;
        const tokens = tokenizer.tokenizeForIndex(doc.text);
        const indexed = { id: doc.id, type: doc.type, floor: doc.floor, tokens: tokens.join(TOKEN_SEPARATOR) };
        this.remove(doc.id);
        this.index.add(indexed);
        const terms = new Set(tokens);
        // Keep the serialized token stream needed by MiniSearch.remove, but not
        // another per-document Set of the same terms for the lifetime of the chat.
        this.records.set(doc.id, { doc: { ...doc }, tokens: indexed.tokens });
        if (doc.type === 'chunk') {
            const ids = this.chunkIdsByFloor.get(doc.floor) || new Set();
            ids.add(doc.id);
            this.chunkIdsByFloor.set(doc.floor, ids);
        }
        for (const term of terms) this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
    }

    // One writer, one fixed batch, one tokenizer snapshot. The caller keeps the
    // corpus unavailable to readers until all queued batches have been applied.
    async applyBatch(updates, next, isCurrent) {
        // Share a time budget across folding, removals, repair and additions;
        // many small phases/floors must not reset the budget and starve the UI.
        const visitInSlices = createSlicedVisitor(isCurrent);
        const changes = new Map();
        const clearedFloors = new Map();
        let clearChunksAt = -1;
        await visitInSlices(orderedMutations(updates), mutation => {
            if (mutation.clearChunks) clearChunksAt = mutation.order;
            else if (mutation.floor !== undefined) clearedFloors.set(mutation.floor, mutation.order);
            else changes.set(mutation.id, mutation);
        });
        if (!isCurrent()) return;

        // A later floor/whole-chunk clear also removes earlier queued additions,
        // including documents moved to that floor. Additions after it survive.
        await visitInSlices(changes.values(), change => {
            if (change.doc?.type === 'chunk' && (clearChunksAt > change.order
                || (clearedFloors.get(change.doc.floor) ?? -1) > change.order)) change.doc = null;
        });
        if (!isCurrent()) return;
        const floors = clearChunksAt >= 0 ? this.chunkIdsByFloor.keys() : clearedFloors.keys();
        await visitInSlices(chunkIdsAcrossFloors(this.chunkIdsByFloor, floors), id => {
            // An explicit final version takes precedence over clearing its old
            // floor. This also covers a chunk becoming an event or moving floors.
            if (!changes.has(id)) changes.set(id, { id, doc: null, order: -1 });
        });
        if (!isCurrent()) return;

        await visitInSlices(changes, ([id, change]) => {
            if (sameDocument(this.records.get(id)?.doc, change.doc)) changes.delete(id);
            else {
                this.remove(id);
                if (!change.doc) changes.delete(id);
            }
        });
        if (!isCurrent()) return;

        // Discarded/replaced sources are already gone: never repair them just
        // before indexing their final replacements. Unchanged sources still need
        // vocabulary repair, even when the batch contained an identical upsert.
        await this.repairTokenizer(next, visitInSlices);
        if (!isCurrent()) return;
        await visitInSlices(changes.values(), ({ doc }) => this.upsert(doc, next));
        if (isCurrent()) this.tokenizer = next;
    }

    async repairTokenizer(next, visitInSlices) {
        const previous = this.tokenizer;
        if (previous === next) return;
        const engineChanged = previous.cut !== next.cut || previous.segmenter !== next.segmenter;
        const changedTerms = new Set([
            ...[...previous.entities.keys()].filter(term => !next.entities.has(term)),
            ...[...next.entities.keys()].filter(term => !previous.entities.has(term)),
            ...previous.blockedTerms.filter(term => !next.blockedTerms.includes(term)),
            ...next.blockedTerms.filter(term => !previous.blockedTerms.includes(term)),
        ]);
        const changedForms = [...changedTerms];
        if (engineChanged || changedTerms.size) {
            // Snapshot the records: upsert removes/reinserts Map entries.
            await visitInSlices([...this.records.values()], ({ doc }) => {
                const affected = engineChanged || (() => {
                    const text = normalizeEntityTerm(doc.text);
                    return changedForms.some(term => text.includes(term));
                })();
                if (affected) this.upsert(doc, next, true);
            });
        }
    }

    search(term, { exact = false } = {}) {
        return this.index.search(term, {
            tokenize: exact ? text => [normalizeEntityTerm(text)] : this.tokenizer.tokenizeForIndex,
            fuzzy: exact ? false : 0.2,
            prefix: !exact,
            combineWith: 'OR',
        });
    }
}
