import { editMemoryBatch, iterateMemoryRecords, memoryItems, memoryKey, sameMemory, MEMORY_COLLECTIONS } from './domain.js';
import { createEvidenceReader } from './evidence.js';
import { MemoryMaintenanceError, requireMemory, memoryUpdated } from './errors.js';
import { projectMemoryRecord, memoryPolicy, recordHandle } from './records.js';
import { maintenanceTask, memoryOwnership, subtractRanges, unionRanges, overlaps } from './ranges.js';
import { buildMemoryOpening } from './opening.js';
import { ARC_PROGRESS_MAX } from '../generate/arc-progress.js';
import { MEMORY_TOOLS } from './tools.js';
import { normalizeToolArguments, validateToolArguments } from './arguments.js';
import { MEMORY_PAGE_CHARS, MEMORY_PAGE_SIZE, OPENING_TOKENS } from './limits.js';
import { projectMaintenanceResult } from './result.js';

export { projectMemoryRecord } from './records.js';
export { MEMORY_PAGE_CHARS, MEMORY_PAGE_SIZE, OPENING_TOKENS } from './limits.js';

const generation = ({ maintenance: _receipts, ...batch }) => batch;
const find = (memory, { collection, key }) => {
    const value = memoryItems(memory, collection).find(item => memoryKey(collection, item) === key) ?? null;
    return collection === 'facts' && value?.retracted ? null : value;
};
const targets = commands => commands.flatMap(command => [command, ...(command.removeIds || []).map(key => ({ collection: 'events', key }))]);
function recordLookup(memory) {
    const indexes = new Map();
    return ({ collection, key }) => {
        if (!indexes.has(collection)) {
            const values = new Map();
            for (const record of iterateMemoryRecords(memory, [collection])) values.set(record.key, record.value);
            indexes.set(collection, values);
        }
        return indexes.get(collection).get(key) ?? null;
    };
}

/** One task borrows published records; only observed values and changed records are detached. */
export function createMemorySession({ chatId, chat, json, atoms, l0Index, cutoff, start = 0, store,
    filterRules = [], openingTokens = OPENING_TOKENS }) {
    let source = { json: json || {}, atoms }, history = store?.summaryHistory || [];
    const originalBatches = history.map(generation);
    const policy = memoryPolicy(filterRules), evidence = createEvidenceReader(() => chat, cutoff, filterRules);
    const observed = new Map(), overlay = new Map(), conflicts = new Map(), completionBaseline = new Map();
    const confirmedOperations = [], acknowledged = new Set();
    let pending = null, ownershipHistory, ownership;
    const ownerFor = batches => {
        if (batches !== ownershipHistory) { ownershipHistory = batches; ownership = memoryOwnership(batches, cutoff); }
        return ownership;
    };
    const ensurePending = () => pending ||= { commands: [], operations: [], completions: [], note: '' };
    const task = ({ includeStaged = false } = {}) => {
        const published = maintenanceTask(history, cutoff);
        if (!includeStaged || !pending?.completions.length) return published;
        const remaining = subtractRanges(published.pending, pending.completions);
        return { ...published, pending: remaining, completed: unionRanges([...published.completed, ...pending.completions]),
            stagedCompletions: pending.completions };
    };
    function completionRecords(memory, batches, ranges) {
        const selected = new Map(), owner = ownerFor(batches);
        for (const record of iterateMemoryRecords(memory)) {
            if (record.collection === 'anchors' && record.value.floor > cutoff) continue;
            const range = owner(record).range;
            if (ranges.some(requested => overlaps(range, requested))) selected.set(recordHandle(record), { ...record, range });
        }
        return selected;
    }
    function assertCompletions(memory, batches) {
        if (!pending?.completions.length) return;
        const current = completionRecords(memory, batches, pending.completions), changed = [];
        for (const handle of new Set([...completionBaseline.keys(), ...current.keys()])) {
            const before = completionBaseline.get(handle), after = current.get(handle);
            if (!sameMemory(before?.value, after?.value)) {
                const { collection, key } = after || before;
                changed.push({ collection, key }); conflicts.set(handle, { collection, key, refreshed: false });
            }
        }
        if (changed.length) throw memoryUpdated(changed, { completion: true });
    }
    const remember = record => {
        const handle = recordHandle(record);
        if (!overlay.has(handle)) observed.set(handle, { collection: record.collection, key: record.key, value: structuredClone(record.value) });
    };

    function ownsHistory(current) {
        const batches = current.store?.summaryHistory || [];
        return current.cutoff >= cutoff && (originalBatches.length
            ? originalBatches.every((batch, index) => batches[index] && sameMemory(batch, generation(batches[index])))
            : current.cutoff === cutoff);
    }
    function assertBoundary(current) { requireMemory(current.chatId === chatId && ownsHistory(current), 'conflict'); }
    function refresh(current) {
        if (!current) return;
        assertBoundary(current);
        source = { json: current.json || {}, atoms: current.atoms };
        history = current.store?.summaryHistory || history;
        chat = current.chat; l0Index = current.l0Index;
    }
    function assertRunOwnership(memory, keys, batches = history) {
        const owner = ownerFor(batches), lookup = recordLookup(memory);
        const later = keys.filter(key => {
            const value = lookup(key);
            return value && owner({ ...key, value }).range.to > cutoff + 1;
        });
        if (later.length) throw memoryUpdated(later);
    }
    function assertKnown(memory, keys, completion = false) {
        const lookup = recordLookup(memory);
        const changed = keys.filter(key => {
            const seen = observed.get(recordHandle(key));
            return seen && !sameMemory(lookup(key), seen.value);
        });
        if (changed.length) {
            for (const key of changed) conflicts.set(recordHandle(key), { collection: key.collection, key: key.key, refreshed: false });
            throw memoryUpdated(changed, { completion });
        }
    }
    function* records(collections = MEMORY_COLLECTIONS, memory = source, withDraft = true) {
        const found = new Set();
        for (const record of iterateMemoryRecords(memory, collections)) {
            const handle = recordHandle(record);
            if (overlay.has(handle)) found.add(handle);
            const change = withDraft ? overlay.get(handle) : null;
            const value = change && !conflicts.has(handle) ? change.after : record.value;
            if (value == null || (record.collection === 'anchors' && value.floor > cutoff)) continue;
            yield { ...record, value };
        }
        if (withDraft) for (const [handle, change] of overlay) {
            if (!found.has(handle) && change.after != null && collections.includes(change.collection)) {
                yield { collection: change.collection, key: change.key, value: change.after };
            }
        }
    }
    function workingMemory() {
        if (!overlay.size) return source;
        const memory = { json: { ...source.json }, atoms: source.atoms };
        for (const collection of new Set([...overlay.values()].map(change => change.collection))) {
            const changes = new Map([...overlay].filter(([, change]) => change.collection === collection));
            const values = [];
            for (const value of memoryItems(source, collection)) {
                const handle = `${collection}:${memoryKey(collection, value)}`, change = changes.get(handle);
                if (!change) values.push(value);
                else { if (change.after !== null) values.push(change.after); changes.delete(handle); }
            }
            for (const change of changes.values()) if (change.after !== null) values.push(change.after);
            if (collection === 'anchors') memory.atoms = values;
            else if (collection === 'characters') memory.json.characters = { ...memory.json.characters, main: values };
            else memory.json[collection] = values;
        }
        return memory;
    }
    function appendDraft(commands, results) {
        const draft = ensurePending();
        for (const [index, edit] of results.entries()) {
            if (!edit.changes.length) continue;
            const command = commands[index];
            draft.commands.push(command);
            draft.operations.push({ kind: command.kind, collection: command.collection, key: edit.key, changes: edit.changes });
            for (const change of edit.changes) {
                const handle = recordHandle(change), previous = overlay.get(handle);
                if (!observed.has(handle)) observed.set(handle, { collection: change.collection, key: change.key, value: change.before });
                overlay.set(handle, { ...change, before: previous ? previous.before : change.before, index: previous ? previous.index : change.index });
            }
        }
    }
    function installDraft(commands, results) {
        const draft = ensurePending();
        draft.commands = []; draft.operations = []; overlay.clear();
        appendDraft(commands, results);
    }

    /** Keep at most one page of references; project only records that can be returned. */
    function readMemory({ collection, key, query = '', ranges, cursor, limit = MEMORY_PAGE_SIZE, textOffset = 0 } = {}, current) {
        refresh(current);
        ranges?.forEach((range, index) => {
            requireMemory(range.to >= range.from, 'invalid_arguments', '', `ranges[${index}].to`);
            requireMemory(range.from >= 1 && range.to <= cutoff + 1, 'source_boundary', '', `ranges[${index}].to`);
        });
        const selected = [], owner = ownerFor(history), needle = query.toLocaleLowerCase();
        let total = 0, eligible = 0;
        for (let record of records(collection ? [collection] : MEMORY_COLLECTIONS)) {
            if (key && record.key !== key) continue;
            const responsibility = owner(record);
            if (ranges && !ranges.some(range => overlaps(responsibility.range, range))) continue;
            // Explicit rereads of a conflicted target show the current published value.
            const handle = recordHandle(record), conflict = conflicts.get(handle);
            if (conflict) {
                const value = find(source, record);
                if (value == null) continue;
                record = { ...record, value };
            }
            if (needle && !JSON.stringify(projectMemoryRecord(record, history, responsibility).value).toLocaleLowerCase().includes(needle)) continue;
            total++;
            if (cursor && (textOffset ? handle < cursor : handle <= cursor)) continue;
            eligible++;
            let at = selected.findIndex(item => recordHandle(item.record) > handle);
            if (at < 0) at = selected.length;
            if (at <= limit) selected.splice(at, 0, { record, responsibility });
            if (selected.length > limit + 1) selected.pop();
        }
        if (key && !total) {
            const handle = `${collection}:${key}`;
            observed.set(handle, { collection, key, value: null });
            if (conflicts.has(handle)) conflicts.get(handle).refreshed = true;
            throw new MemoryMaintenanceError('record_missing', '', 'key');
        }
        if (cursor && textOffset) requireMemory(selected.length && recordHandle(selected[0].record) === cursor, 'record_missing', '', 'cursor');
        const items = [];
        let budget = MEMORY_PAGE_CHARS, next = null;
        for (const { record, responsibility } of selected.slice(0, limit)) {
            const handle = recordHandle(record), begin = items.length ? 0 : textOffset;
            if (begin) assertKnown(source, [record]);
            const projected = projectMemoryRecord(record, history, responsibility), text = JSON.stringify(projected);
            requireMemory(begin <= text.length, 'invalid_arguments', '', 'textOffset');
            if (items.length && text.length > budget) { next = { cursor: recordHandle(items.at(-1)) }; break; }
            if (conflicts.has(handle)) {
                observed.set(handle, { collection: record.collection, key: record.key, value: structuredClone(record.value) });
                conflicts.get(handle).refreshed = true;
            } else remember(record);
            if (begin || text.length > budget) {
                const end = Math.min(text.length, begin + Math.max(1, budget - 300));
                items.push({ collection: record.collection, key: record.key, excerpt: text.slice(begin, end), nextTextOffset: end < text.length ? end : null });
                next = end < text.length ? { cursor: handle, textOffset: end } : eligible > items.length ? { cursor: handle } : null;
                break;
            }
            items.push(projected); budget -= text.length;
        }
        if (!next && eligible > items.length && items.length && !items.at(-1).nextTextOffset) next = { cursor: recordHandle(items.at(-1)) };
        if (next) next = { ...(collection ? { collection } : {}), ...(key ? { key } : {}), ...(query ? { query } : {}),
            ...(ranges ? { ranges } : {}), limit, ...next };
        return { items, total, next };
    }
    function initial(tokenBudget = openingTokens) {
        return buildMemoryOpening({ task: task(), read: readMemory,
            maxTokens: Math.min(tokenBudget, openingTokens, OPENING_TOKENS) });
    }
    function complete({ from, to }) {
        requireMemory(from >= 1 && to >= from && to <= cutoff + 1, 'source_boundary', '', 'to');
        for (const [handle, conflict] of conflicts) if (conflict.refreshed && !overlay.has(handle)) conflicts.delete(handle);
        if (conflicts.size) throw memoryUpdated([...conflicts.values()], { completion: true });
        const range = { from, to }, published = task();
        if (!subtractRanges([range], published.completed).length && !pending?.completions.some(staged => overlaps(staged, range))) {
            return { status: 'unchanged', task: task({ includeStaged: true }) };
        }
        for (const [handle, record] of completionBaseline) if (overlaps(record.range, range)) completionBaseline.delete(handle);
        for (const [handle, record] of completionRecords(source, history, [range])) completionBaseline.set(handle, record);
        const completed = [...published.completed, ...(pending?.completions || [])];
        if (!subtractRanges([{ from, to }], completed).length) return { status: 'unchanged', task: task({ includeStaged: true }) };
        ensurePending().completions = unionRanges([...(pending?.completions || []), { from, to }]);
        return { status: 'staged', changed: 0, task: task({ includeStaged: true }) };
    }
    function submit(args) {
        try {
            validateToolArguments(args, MEMORY_TOOLS.find(tool => tool.function.name === 'EditMemory').function.parameters);
            const errors = [];
            const commands = args.edits.flatMap((operation, index) => {
                try {
                    const { kind, collection, key, removeIds } = operation;
                    if (kind === 'delete') {
                        requireMemory(operation.patch === undefined && removeIds === undefined, 'invalid_operation');
                    } else requireMemory(operation.patch, 'invalid_arguments', '', 'patch');
                    if (kind !== 'merge') requireMemory(removeIds === undefined, 'invalid_arguments', '', 'removeIds');
                    const patch = structuredClone(operation.patch || {});
                    if (collection === 'facts' && Object.hasOwn(patch, 'isState')) { patch._isState = patch.isState; delete patch.isState; }
                    if (collection === 'arcs' && Object.hasOwn(patch, 'progress')) patch.progress /= ARC_PROGRESS_MAX;
                    return [{ kind, collection, key, ...(removeIds ? { removeIds } : {}), ...(operation.patch ? { patch } : {}) }];
                } catch (error) {
                    if (!(error instanceof MemoryMaintenanceError)) throw error;
                    error.entry = `edits[${index}]`; error.field ||= 'patch'; errors.push(error);
                    return [];
                }
            });
            if (errors.length) throw MemoryMaintenanceError.batch(errors, ['records', 'references']);
            const keys = targets(commands), repairing = new Set(keys.map(recordHandle).filter(handle => conflicts.get(handle)?.refreshed));
            const removed = new Set(), affected = new Set(repairing);
            // A renamed/deleted record may have later edits under its new key. Drop that
            // dependent command chain, not unrelated edits from the same tool request.
            let expanded;
            do {
                expanded = false;
                for (const [index, operation] of (pending?.operations || []).entries()) {
                    if (removed.has(index) || !operation.changes.some(change => affected.has(recordHandle(change)))) continue;
                    removed.add(index); expanded = true;
                    for (const change of operation.changes) affected.add(recordHandle(change));
                }
            } while (expanded);
            const unresolved = [...conflicts].filter(([handle]) => !affected.has(handle)).map(([, record]) => record);
            if (unresolved.length) throw memoryUpdated(unresolved);
            assertKnown(source, keys.filter(record => !repairing.has(recordHandle(record))));
            assertRunOwnership(source, keys);
            const retained = (pending?.commands || []).filter((_command, index) => !removed.has(index));
            const applicable = commands.filter(command => !(command.kind === 'delete' && repairing.has(recordHandle(command)) && find(source, command) == null));
            const incremental = !repairing.size;
            if (incremental) assertKnown(source, [...overlay.values()]);
            const all = incremental ? applicable : [...retained, ...applicable];
            const result = editMemoryBatch(incremental ? workingMemory() : source, all, cutoff);
            assertRunOwnership(source, result.results.flatMap(edit => edit.changes));
            // Original values are checked before installing any part of this atomic request.
            const changedKeys = result.results.flatMap(edit => edit.changes).filter(record => !affected.has(recordHandle(record)));
            assertKnown(source, changedKeys);
            if (incremental) appendDraft(all, result.results);
            else installDraft(all, result.results);
            for (const handle of repairing) if (completionBaseline.has(handle)) {
                const original = completionBaseline.get(handle), value = find(source, original);
                if (value == null) completionBaseline.delete(handle);
                else completionBaseline.set(handle, { ...original, value });
            }
            for (const handle of affected) conflicts.delete(handle);
            if (args.note) pending.note = args.note;
            const changed = result.results.slice(incremental ? 0 : retained.length).filter(edit => edit.changes.length).length;
            return { status: changed ? 'staged' : 'unchanged', changed };
        } catch (error) {
            if (!(error instanceof MemoryMaintenanceError)) throw error;
            if (error.code === 'memory_updated') return { status: 'error', code: error.code, message: error.message, records: error.records };
            return { status: 'needs_fix', rejected: error.rejected || [{ entry: error.entry || error.field?.match(/^edits\[\d+\]/u)?.[0] || 'arguments',
                field: error.field || 'arguments', code: error.code, message: error.message,
                ...(error.expected ? { expected: error.expected } : {}) }], unchecked: error.unchecked || [] };
        }
    }
    function runTool(name, args = {}, current) {
        const tool = MEMORY_TOOLS.find(item => item.function.name === name);
        if (!tool) throw new MemoryMaintenanceError('unknown_tool', name, 'name');
        refresh(current);
        args = normalizeToolArguments(args, tool.function.parameters);
        if (name === 'EditMemory') return submit(args);
        validateToolArguments(args, tool.function.parameters);
        if (name === 'CompleteMaintenance') return complete(args);
        if (name === 'ReadMemory') return readMemory(args);
        if (name === 'SearchSource') return evidence.search(args);
        if (name === 'ReadSource') return evidence.read(args);
    }
    function assertCurrent(current) {
        assertBoundary(current);
        const memory = { json: current.json || {}, atoms: current.atoms }, batches = current.store?.summaryHistory || history;
        const keys = [...overlay.values()];
        if (pending?.completions.length) {
            const owner = ownerFor(batches);
            for (const seen of observed.values()) if (seen.value && pending.completions.some(range => overlaps(range, owner(seen).range))) keys.push(seen);
        }
        assertKnown(memory, keys, !!pending?.completions.length);
        if (conflicts.size) throw memoryUpdated([...conflicts.values()]);
        assertCompletions(memory, batches);
        assertRunOwnership(memory, targets(pending?.commands || []), batches);
        if (!pending?.commands.length) return memory;
        const result = editMemoryBatch(memory, pending.commands, cutoff);
        assertRunOwnership(memory, result.results.flatMap(edit => edit.changes), batches);
        assertKnown(memory, result.results.flatMap(edit => edit.changes));
        if (pending?.commands.length) installDraft(pending.commands, result.results);
        return result.memory;
    }
    function coverage() {
        const indexed = new Set(source.atoms.filter(atom => atom.floor <= cutoff).map(atom => atom.floor));
        const missingAnchors = [];
        for (let floor = start; floor <= Math.min(cutoff, chat.length - 1); floor++) {
            if (chat[floor]?.is_user || indexed.has(floor) || ['ok', 'empty'].includes(l0Index?.byFloor?.[String(floor)]?.status)) continue;
            missingAnchors.push({ floor: floor + 1, status: l0Index?.byFloor?.[String(floor)]?.status || 'missing' });
        }
        return { supplied: evidence.ranges(), missingAnchors };
    }
    return { chatId, cutoff, start, evidence, policy,
        get operations() { return confirmedOperations; }, get pending() { return pending; },
        get hasPending() { return !!pending && !!(pending.operations.length || pending.completions.length || pending.outcome); },
        get stagedCount() { return pending?.operations.length || 0; }, get savedCount() { return confirmedOperations.length; },
        get stagedCompletions() { return pending?.completions || []; },
        coverage, runTool, initial, task, ownsHistory, assertCurrent,
        inputProvided() { evidence.inputProvided(); },
        discard() { pending = null; overlay.clear(); conflicts.clear(); completionBaseline.clear(); },
        acknowledge(saved) {
            const { current, receipt } = saved, id = receipt.id;
            if (acknowledged.has(id)) return;
            if (!pending) return;
            confirmedOperations.push(...projectMaintenanceResult(saved.receipts).operations);
            acknowledged.add(id);
            refresh(current); pending = null; overlay.clear(); conflicts.clear(); observed.clear(); completionBaseline.clear();
        },
        conclude(outcome) {
            const draft = ensurePending();
            draft.note = outcome.summary || draft.note;
            draft.outcome = { status: outcome.status, ...(outcome.code ? { code: outcome.code } : {}),
                ...(outcome.error ? { error: structuredClone(outcome.error) } : {}) };
        },
    };
}
