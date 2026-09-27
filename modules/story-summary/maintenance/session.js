import { editMemoryBatch, memoryRecords, memoryItems, memoryKey, replaceMemoryRecords, sameMemory } from './domain.js';
import { createEvidenceReader, SOURCE_PAGE_CHARS } from './evidence.js';
import { MemoryMaintenanceError, requireMemory, memoryUpdated } from './errors.js';
import { projectMemoryRecord, memoryPolicy, recordHandle } from './records.js';
import { maintenanceTask, memoryOwnership, selectMemoryRanges, subtractRanges } from './ranges.js';
import { buildMemoryOpening } from './opening.js';
import { ARC_PROGRESS_MAX } from '../generate/arc-progress.js';
import { MEMORY_TOOLS } from './tools.js';
import { normalizeToolArguments, validateToolArguments } from './arguments.js';
import { MEMORY_PAGE_CHARS, MEMORY_PAGE_SIZE, OPENING_TOKENS } from './limits.js';

export { projectMemoryRecord } from './records.js';
export { MEMORY_PAGE_CHARS, MEMORY_PAGE_SIZE } from './limits.js';

export function createMemorySession({ chatId, chat, json, atoms, l0Index, cutoff, start = 0, store,
    filterRules = [], openingTokens = OPENING_TOKENS }) {
    const baseline = structuredClone({ json: json || {}, atoms: atoms.filter(atom => atom.floor <= cutoff) });
    let memory = structuredClone(baseline), history = structuredClone(store?.summaryHistory || []);
    const policy = memoryPolicy(filterRules), evidence = createEvidenceReader(chat, cutoff, filterRules);
    const generations = entries => entries.map(({ maintenance: _receipts, ...batch }) => batch);
    const originalBatches = structuredClone(generations(history));
    const allOperations = [];
    let opening = null, pending = null;
    const records = (value = memory, batches = history) => {
        const owner = memoryOwnership(batches, cutoff);
        return memoryRecords(value).map(record => projectMemoryRecord(record, batches, owner(record)))
            .sort((a, b) => recordHandle(a) < recordHandle(b) ? -1 : recordHandle(a) > recordHandle(b) ? 1 : 0);
    };
    const task = () => maintenanceTask(history, cutoff);
    const missingAnchors = () => evidence.source.filter(record => record.floor - 1 >= start && record.role === 'assistant'
        && !['ok', 'empty'].includes(l0Index?.byFloor?.[String(record.floor - 1)]?.status)
        && !baseline.atoms.some(atom => atom.floor === record.floor - 1))
        .map(record => ({ floor: record.floor, status: l0Index?.byFloor?.[String(record.floor - 1)]?.status || 'missing' }));

    function page(items, { cursor, limit = MEMORY_PAGE_SIZE, textOffset = 0 } = {}) {
        const offset = cursor ? items.findIndex(item => textOffset ? recordHandle(item) >= cursor : recordHandle(item) > cursor) : 0;
        if (cursor && textOffset) requireMemory(offset >= 0 && recordHandle(items[offset]) === cursor, 'record_missing', '', 'cursor');
        if (offset < 0) return { items: [], total: items.length, next: null };
        const result = [];
        let budget = MEMORY_PAGE_CHARS;
        for (let i = offset; i < Math.min(items.length, offset + limit); i++) {
            const item = items[i], text = JSON.stringify(item), begin = i === offset ? textOffset : 0;
            requireMemory(begin <= text.length, 'invalid_arguments', '', 'textOffset');
            if (result.length && text.length > budget) break;
            if (begin || text.length > budget) {
                const end = Math.min(text.length, begin + Math.max(1, budget - 300));
                result.push({ ...(item.collection ? { collection: item.collection, key: item.key } : {}),
                    excerpt: text.slice(begin, end), nextTextOffset: end < text.length ? end : null });
                return { items: result, total: items.length,
                    next: end < text.length ? { cursor: recordHandle(item), textOffset: end }
                        : i + 1 < items.length ? { cursor: recordHandle(item) } : null };
            }
            result.push(item); budget -= text.length;
        }
        return { items: result, total: items.length, next: offset + result.length < items.length ? { cursor: recordHandle(result.at(-1)) } : null };
    }

    function ownsHistory(current) {
        const batches = generations(current.store?.summaryHistory || []);
        return current.cutoff >= cutoff && (originalBatches.length
            ? sameMemory(originalBatches, batches.slice(0, originalBatches.length)) : current.cutoff === cutoff);
    }
    function assertBoundary(current, allSource = false) {
        requireMemory(current.chatId === chatId && ownsHistory(current), 'conflict');
        evidence.assertCurrent(current.chat, allSource);
    }

    const find = (value, { collection, key }) => memoryItems(value, collection).find(item => memoryKey(collection, item) === key) ?? null;
    const editTargets = commands => commands.flatMap(command => [command,
        ...(command.removeIds || []).map(key => ({ collection: 'events', key }))]);
    function assertRunOwnership(value, keys, batches) {
        const owner = memoryOwnership(batches, cutoff);
        const later = keys.filter(key => {
            const record = find(value, key);
            return record && owner({ ...key, value: record }).range.to > cutoff + 1;
        });
        if (later.length) throw memoryUpdated(later);
    }
    function assertKnown(currentMemory, keys) {
        const changed = keys.filter(key => !sameMemory(find(currentMemory, key), find(baseline, key)));
        if (changed.length) throw memoryUpdated(changed, { completion: !!pending?.completion });
    }

    function readMemory({ collection, key, query = '', ranges, ...paging } = {}, current) {
        ranges?.forEach((range, index) => {
            requireMemory(range.to >= range.from, 'invalid_arguments', '', `ranges[${index}].to`);
            requireMemory(range.from <= cutoff + 1, 'source_boundary', '', `ranges[${index}].from`);
            requireMemory(range.to <= cutoff + 1, 'source_boundary', '', `ranges[${index}].to`);
        });
        if (current) assertBoundary(current);
        const value = current ? { json: current.json || {}, atoms: current.atoms.filter(atom => atom.floor <= cutoff) } : memory;
        const batches = current?.store?.summaryHistory || history;
        const items = records(value, batches);
        if (current && key && collection && !items.some(item => item.collection === collection && item.key === key)) {
            replaceMemoryRecords(baseline, [{ collection, key, value: null }]);
            memory = structuredClone(baseline);
        }
        if (key) requireMemory(collection && items.some(item => item.collection === collection && item.key === key), 'record_missing', '', 'key');
        const selected = selectMemoryRanges(items, ranges).filter(item => (!collection || item.collection === collection) && (!key || item.key === key)
            && (!query || JSON.stringify(item.value).toLocaleLowerCase().includes(query.toLocaleLowerCase())));
        if (current && paging.textOffset) assertKnown(value, selected.filter(item => recordHandle(item) === paging.cursor));
        const result = page(selected, paging);
        if (current) {
            replaceMemoryRecords(baseline, result.items.map(item => ({ collection: item.collection, key: item.key, value: find(value, item) })));
            memory = structuredClone(baseline);
            history = structuredClone(batches);
        }
        if (result.next) result.next = { ...(collection ? { collection } : {}), ...(key ? { key } : {}), ...(query ? { query } : {}),
            ...(ranges !== undefined ? { ranges: structuredClone(ranges) } : {}),
            ...(paging.limit !== undefined ? { limit: paging.limit } : {}), ...result.next };
        return result;
    }

    function initial(tokenBudget = openingTokens) {
        opening = buildMemoryOpening({ task: task(), records: records(), maxTokens: Math.min(tokenBudget, openingTokens, OPENING_TOKENS) });
        return structuredClone(opening);
    }

    function complete({ from, to }) {
        requireMemory(to >= from && to <= cutoff + 1, 'source_boundary', '', 'to');
        if (!subtractRanges([{ from, to }], task().completed).length) return { status: 'unchanged', task: task() };
        pending = { operations: [], note: '', completion: { from, to } };
        return { status: 'staged', changed: 0 };
    }

    function submit(args) {
        const staged = [];
        try {
            validateToolArguments(args, MEMORY_TOOLS.find(tool => tool.function.name === 'EditMemory').function.parameters);
            const errors = [];
            const commands = args.edits.flatMap((operation, index) => {
                try {
                    const { collection, kind, key, removeIds } = operation;
                    if (kind === 'delete') {
                        requireMemory(operation.patch === undefined, 'invalid_arguments', '', 'patch');
                        requireMemory(removeIds === undefined, 'invalid_arguments', '', 'removeIds');
                    } else requireMemory(operation.patch, 'invalid_arguments', '', 'patch');
                    if (kind !== 'merge') requireMemory(removeIds === undefined, 'invalid_arguments', '', 'removeIds');
                    const patch = structuredClone(operation.patch || {});
                    if (collection === 'facts' && Object.hasOwn(patch, 'isState')) { patch._isState = patch.isState; delete patch.isState; }
                    if (collection === 'arcs' && Object.hasOwn(patch, 'progress')) patch.progress /= ARC_PROGRESS_MAX;
                    return [{ kind, collection, key, removeIds, patch }];
                } catch (error) {
                    if (error instanceof MemoryMaintenanceError) {
                        error.entry = 'edits[' + index + ']';
                        error.field ||= error.code === 'source_boundary' || error.code === 'source_marker_missing' ? 'patch.summary'
                            : error.code === 'invalid_reference' ? 'patch.causedBy' : error.code === 'record_missing' ? 'key' : 'patch';
                    }
                    if (!(error instanceof MemoryMaintenanceError)) throw error;
                    errors.push(error);
                    return [];
                }
            });
            if (errors.length) throw MemoryMaintenanceError.batch(errors, ['records', 'references']);
            assertRunOwnership(memory, editTargets(commands), history);
            const result = editMemoryBatch(memory, commands, cutoff);
            assertRunOwnership(memory, result.results.flatMap(item => item.changes), history);
            for (const [index, edit] of result.results.entries()) {
                const { kind, collection } = commands[index];
                if (edit.changes.length) staged.push({ kind, collection, key: edit.key, changes: edit.changes });
            }
            memory = result.memory;
            if (staged.length) pending = { commands, operations: staged, note: args.note || '' };
        } catch (error) {
            if (!(error instanceof MemoryMaintenanceError)) throw error;
            if (error.code === 'memory_updated') return { status: 'error', code: error.code, message: error.message, records: error.records };
            return { status: 'needs_fix', rejected: error.rejected || [{ entry: error.entry || error.field?.match(/^edits\[\d+\]/u)?.[0] || 'arguments',
                field: error.field || 'arguments', code: error.code, message: error.message,
                ...(error.expected ? { expected: error.expected } : {}) }], unchecked: error.unchecked || [] };
        }
        return { status: staged.length ? 'staged' : 'unchanged', changed: staged.length };
    }


    function runTool(name, args = {}, current) {
        const tool = MEMORY_TOOLS.find(item => item.function.name === name);
        if (!tool) throw new MemoryMaintenanceError('unknown_tool', name, 'name');
        requireMemory(opening && !pending, 'pending_edit');
        args = normalizeToolArguments(args, tool.function.parameters);
        if (name === 'EditMemory') return submit(args);
        validateToolArguments(args, tool.function.parameters);
        if (name === 'CompleteMaintenance') return complete(args);
        if (name === 'ReadMemory') return readMemory(args, current);
        if (name === 'SearchSource') return evidence.search(args);
        if (name === 'ReadSource') {
            const { floor, to = floor, offset = 0, view = 'story' } = args;
            requireMemory(to >= floor && to <= cutoff + 1, 'source_boundary', '', 'to');
            const items = [];
            let budget = SOURCE_PAGE_CHARS;
            for (let current = floor; current <= to; current++) {
                const item = evidence.read({ floor: current, offset: current === floor ? offset : 0, view, limit: budget });
                items.push(item); budget -= item.text.length;
                if (!item.complete || budget <= 0) return { items, next: item.next && item.next.floor <= to ? { ...item.next, to } : null };
            }
            return { items, next: null };
        }
    }

    return { chatId, get cutoff() { return cutoff; }, get start() { return start; },
        get evidence() { return evidence; }, get policy() { return policy; },
        get baseline() { return structuredClone(baseline); },
        get memory() { return structuredClone(memory); },
        get operations() { return structuredClone(allOperations); },
        get pending() { return structuredClone(pending); },
        coverage: () => ({ supplied: evidence.ranges(), missingAnchors: missingAnchors() }),
        runTool, initial, task, ownsHistory,
        inputProvided() { evidence.inputProvided(); },
        discard() { memory = structuredClone(baseline); pending = null; },
        acknowledge(current) {
            requireMemory(pending, 'pending_edit');
            allOperations.push(...pending.operations);
            replaceMemoryRecords(baseline, pending.operations.flatMap(operation => operation.changes)
                .map(change => ({ ...change, value: change.after })));
            memory = structuredClone(baseline);
            history = structuredClone(current.store.summaryHistory);
            l0Index = current.l0Index;
            pending = null;
        },
        conclude(outcome) {
            memory = structuredClone(baseline); // An unconfirmed draft never enters the final receipt.
            pending = { operations: [], note: outcome.summary || '', outcome: { status: outcome.status, ...(outcome.code ? { code: outcome.code } : {}) } };
        },
        assertCurrent(current) {
            assertBoundary(current, !!pending?.completion);
            const currentMemory = { json: current.json || {}, atoms: current.atoms };
            if (pending?.completion) {
                assertKnown(currentMemory, selectMemoryRanges(records(currentMemory, current.store.summaryHistory), [pending.completion]));
            } else if (pending?.commands) {
                const targets = editTargets(pending.commands);
                assertRunOwnership(currentMemory, targets, current.store?.summaryHistory || history);
                assertKnown(currentMemory, targets);
                const result = editMemoryBatch(currentMemory, pending.commands, cutoff);
                assertRunOwnership(currentMemory, result.results.flatMap(item => item.changes), current.store?.summaryHistory || history);
                assertKnown(currentMemory, result.results.flatMap(item => item.changes));
                // Reapplying to the latest state preserves unrelated edits and validates all references.
                pending.operations = result.results.flatMap((item, index) => item.changes.length ? [{
                    kind: pending.commands[index].kind, collection: pending.commands[index].collection, key: item.key, changes: item.changes,
                }] : []);
                return result.memory;
            }
            return structuredClone(currentMemory);
        },
    };
}
