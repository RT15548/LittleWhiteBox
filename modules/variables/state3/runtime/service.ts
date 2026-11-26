import { compileDefinition } from '../definition/compile.js';
import { clone, equal } from '../engine/data.js';
import { mergeAbortSignals } from '../../../../shared/common/abort-utils.js';
import { difference } from '../engine/difference.js';
import { displayChanges } from '../engine/delta-view.js';
import { settle } from '../engine/settle.js';
import { variableRoots } from './variables.js';
import { reject, diagnostic } from '../engine/diagnostics.js';
import { validateState } from '../engine/validation.js';
import { checkpoint, digest, makeReceipt, rebase, rewind, OPENING_SOURCE, isOpeningReceipt } from './history.js';
import { initialState } from '../definition/openings.js';
import type { BeforeUpdate, Compiled, History, HostAdapter, Json, JsonObject, Receipt, Result, RunOptions, Snapshot, Success, SwipeRecord } from '../types.js';
import { modelSource } from '../definition/stages.js';
import { createExtensionRun, type ExtensionHost } from '../extensions/runtime.js';
import { inspectInput } from '../engine/input.js';

interface StageOptions extends RunOptions { index?: number; replace?: boolean }
interface ApplyOptions extends StageOptions { preview?: boolean; source?: string; beforeUpdate?: BeforeUpdate }
const success = (state: Json): Success => ({ ok: true, state, changes: [], provenance: [], actions: [], diagnostics: [] });

export function createSettlementService<S extends Snapshot>(adapter: HostAdapter<S>, extensionHost?: ExtensionHost) {
    const definitions = new WeakMap<object, Compiled>();
    const assertCurrent = (snapshot: S) => { if (!adapter.isCurrent(snapshot)) {reject('stale-target');} };
    async function authorize({ signal, stage }: RunOptions = {}) {
        const snapshot = adapter.capture();
        await (extensionHost?.requestAuthorization ?? extensionHost?.authorize)?.(adapter.bundle(), signal, stage);
        assertCurrent(snapshot); signal?.throwIfAborted();
    }
    async function checkRestoration(state: Json, signal?: AbortSignal) {
        try {
            const compiled = compileDefinition(adapter.bundle());
            return await validateState(compiled, { bundle: compiled.bundle, state: clone(state), params: {}, signal });
        } catch (error) { return [diagnostic(error)]; }
    }
    async function publish(snapshot: S, history: History, records: SwipeRecord[], result: Success, notify: boolean, hostSaves = false, invalidateFrom?: number): Promise<Success> {
        assertCurrent(snapshot);
        // Validation and publication are synchronous. Only persistence may wait;
        // another selection must be able to restore this state while it waits.
        history.revision++;
        const save = adapter.publish(snapshot, { state: result.state, history, records, ...(invalidateFrom === undefined ? {} : { invalidateFrom }) });
        let persistence: Success['persistence'];
        try { if (!hostSaves) {await save();} }
        catch (error) { const cause = diagnostic(error); persistence = cause.code === 'save-unconfirmed' ? cause : { code: 'save-unconfirmed', cause }; }
        const published = { ...result, committed: true, ...(hostSaves ? {} : { saved: !persistence }), ...(persistence ? { persistence } : {}) };
        if (notify) {
            try { adapter.committed?.(published); }
            catch (error) { published.diagnostics.push({ code: 'notification-failed', cause: diagnostic(error) }); }
        }
        return published;
    }
    async function rollback({ index, signal }: RunOptions & { index?: number } = {}): Promise<Success> {
        const snapshot = adapter.capture(index), history = snapshot.history;
        adapter.assertMutable(snapshot); assertCurrent(snapshot); signal?.throwIfAborted();
        if (!history) {reject('not-enabled');}
        const records = clone(snapshot.records), suffix = records.slice(snapshot.index).flatMap(record => record.entries.filter(entry => !isOpeningReceipt(entry)));
        if (snapshot.lastReceiptIndex < snapshot.index) {return { ...success(clone(snapshot.state)), saved: true };}
        const state = rewind(history, snapshot.state, suffix);
        records.slice(snapshot.index).forEach(record => {record.entries = record.entries.filter(isOpeningReceipt);});
        // Persist the real rollback before any model call or new rule execution.
        // Failure/cancellation after this point leaves the rolled-back state intact.
        const publication = publish(snapshot, { ...clone(history), checkpoints: [] }, records,
            { ...success(state), changes: displayChanges(difference(snapshot.state, state)), version: history.version }, true, false, snapshot.index);
        const rolledBack = adapter.capture(snapshot.index);
        const result = await publication;
        assertCurrent(rolledBack); adapter.assertMutable(rolledBack);
        return result;
    }
    async function stage({ index, replace, signal, stage: preparedStage }: StageOptions = {}, runCommitted = true) {
        const snapshot = adapter.capture(index), history = snapshot.history;
        const compiled = compileDefinition(adapter.bundle());
        if (!history) {reject('not-enabled');}
        const records = clone(snapshot.records), target = records[snapshot.index];
        if (!target) {reject('target-missing');}
        adapter.assertMutable(snapshot);
        // Replacement always means the whole floor and its suffix, not one source
        // merged back into already-confirmed later effects. Preview remains read-only.
        const suffix = replace ? records.slice(snapshot.index).flatMap(record => record.entries.filter(entry => !isOpeningReceipt(entry))) : [];
        const start = replace ? rewind(history, snapshot.state, suffix) : clone(snapshot.state);
        assertCurrent(snapshot);
        let consumed = false;
        let executionSnapshot = snapshot;
        let assertExecutionCurrent = () => assertCurrent(executionSnapshot);
        const extensions = createExtensionRun(compiled.bundle, { state: clone(start), target: snapshot.target, signal,
            assertCurrent: () => assertExecutionCurrent() }, extensionHost, undefined, compiled.tools);
        let candidate: { input: unknown; stage: RunOptions['stage']; prepared?: Json; result: Success } | undefined;
        async function commit(result: Success, source: string, beforeUpdate?: BeforeUpdate): Promise<Success> {
            if (consumed) {reject('stage-consumed');}
            assertCurrent(snapshot); adapter.assertMutable(snapshot); signal?.throwIfAborted();
            if (records.slice(snapshot.index + 1).some(record => record.entries.length)) {reject('stale-target');}
            const receipt = makeReceipt({ before: start, result, source, revision: history!.revision + 1,
                retainParams: target.entries.some(entry => entry.beforeUpdate) });
            if (beforeUpdate) {receipt.beforeUpdate = clone(beforeUpdate);}
            const next = clone(records);
            next[snapshot.index].entries = [...target.entries, receipt];
            const state = result.state;
            const updated: History = { ...clone(history!), version: digest(compiled.bundle), checkpoints: snapshot.index === records.length - 1 && !suffix.length ? clone(history!.checkpoints) : [] };
            consumed = true;
            if (snapshot.index === records.length - 1) {checkpoint(updated, state, snapshot.index, updated.revision + 1);}
            const hostSaves = snapshot.index === records.length - 1 && beforeUpdate !== undefined
                && ['applied', 'rejected', 'skipped'].includes(beforeUpdate.outcome);
            const publication = publish(snapshot, updated, next, { ...result, state, version: updated.version, receipt }, true, hostSaves);
            executionSnapshot = adapter.capture(snapshot.index);
            return publication;
        }
        const staged = {
            ok: true as const, snapshot: clone(start), bundle: clone(compiled.bundle), roots: clone(history.roots), target: snapshot.target,
            assertCurrent: () => assertExecutionCurrent(), extensions,
            async prepare(input: unknown, stage?: RunOptions['stage'], activeSignal?: AbortSignal) {
                const checked = inspectInput(clone(input), compiled, stage);
                if (!checked.ok) {return checked;}
                try {
                    const prepared = await extensions.prepare(checked.input, stage, mergeAbortSignals(signal, activeSignal) ?? undefined);
                    return { ok: true as const, prepared };
                } catch (error) {
                    return { ok: false as const, diagnostics: [signal?.aborted || activeSignal?.aborted ? { code: 'cancelled' } : diagnostic(error)], extensions: { calls: clone(extensions.calls) } };
                }
            },
            async recordBefore(outcome: BeforeUpdate): Promise<Success> {
                if (replace && snapshot.lastReceiptIndex >= snapshot.index) {
                    assertCurrent(snapshot); consumed = true;
                    const rolledBack = await rollback({ index: snapshot.index, signal });
                    if (rolledBack.saved === false) {return rolledBack;}
                    signal?.throwIfAborted();
                    return (await stage({ index: snapshot.index, signal })).recordBefore(outcome);
                }
                return commit(success(clone(start)), modelSource('before'), outcome);
            },
            async run(input: unknown, { preview = true, source = 'api', signal: runSignal, stage: updateStage = preparedStage, beforeUpdate, prepared }: ApplyOptions = {}): Promise<Result> {
                if (consumed) {reject('stage-consumed');}
                if (source === OPENING_SOURCE) {reject('source-reserved', { source });}
                assertCurrent(snapshot); adapter.assertMutable(snapshot);
                const activeSignal = mergeAbortSignals(signal, runSignal) ?? undefined;
                if (!preview && prepared !== undefined) {reject('prepared-preview-only');}
                if (!preview) {await authorize({ signal: activeSignal, stage: updateStage });}
                if (!preview && replace && snapshot.lastReceiptIndex >= snapshot.index) {
                    consumed = true;
                    const rolledBack = await rollback({ index: snapshot.index, signal: activeSignal });
                    if (rolledBack.saved === false) {return rolledBack;}
                    activeSignal?.throwIfAborted();
                    return (await stage({ index: snapshot.index, signal: activeSignal }, runCommitted)).run(input,
                        { preview: false, source, stage: updateStage, signal: activeSignal, beforeUpdate });
                }
                if (!preview) {
                    const checked = inspectInput(clone(input), compiled, updateStage);
                    if (!checked.ok) {return checked;}
                    try {prepared = await extensions.prepare(checked.input, updateStage, activeSignal);}
                    catch (error) {return { ok: false, diagnostics: [diagnostic(error)], extensions: { calls: clone(extensions.calls) } };}
                }
                const result = candidate && candidate.stage === updateStage && equal(candidate.input as Json, input as Json)
                    && equal(candidate.prepared as Json, prepared as Json)
                    ? clone(candidate.result) : await settle(compiled, start, input, { signal: activeSignal, stage: updateStage, prepared });
                const liveDetails = { calls: [...extensions.calls, ...(result.extensions?.calls || [])] };
                if (!result.ok) {return { ...result, ...(liveDetails.calls.length ? { extensions: liveDetails } : {}) };}
                if (Object.keys(result.state as JsonObject).some(root => !history.roots.includes(root))) {reject('unowned-root');}
                assertCurrent(snapshot); activeSignal?.throwIfAborted();
                candidate = { input: clone(input), stage: updateStage, prepared: clone(prepared), result: clone(result) };
                if (preview) {return { ...result, ...(liveDetails.calls.length ? { extensions: liveDetails } : {}), version: digest(compiled.bundle), committed: false };}
                const precedingCalls = extensions.calls.length;
                const published = await commit(result, source, beforeUpdate);
                try { if (runCommitted) {await extensions.committed(published, updateStage, activeSignal, async input => {
                    assertExecutionCurrent(); activeSignal?.throwIfAborted();
                    const next = await stage({ index: snapshot.index, signal: activeSignal }, false);
                    const result = await next.run(input, { preview: false, source: 'script:committed', stage: updateStage, signal: activeSignal });
                    assertExecutionCurrent = next.assertCurrent;
                    assertExecutionCurrent();
                    if (result.ok && result.committed) {
                        published.state = clone(result.state);
                        published.changes = displayChanges(difference(start, published.state));
                        published.actions.push(...clone(result.actions));
                        published.receipt = { ...published.receipt!, revision: result.receipt!.revision, delta: difference(start, published.state), actions: clone(published.actions) };
                        published.provenance.push(...clone(result.provenance));
                        published.diagnostics.push(...clone(result.diagnostics));
                        if (result.saved === undefined) {delete published.saved;} else {published.saved = result.saved;}
                        if (result.persistence) {published.persistence = result.persistence;} else {delete published.persistence;}
                    }
                    return result;
                });} }
                catch (error) { published.diagnostics.push({ ...diagnostic(error), code: 'extension-after-failed' }); }
                const calls = [...extensions.calls.slice(0, precedingCalls), ...(result.extensions?.calls || []), ...extensions.calls.slice(precedingCalls)];
                if (calls.length) {published.extensions = { calls };}
                return published;
            },
        };
        definitions.set(staged, compiled);
        return staged;
    }
    return {
        stage: (options?: StageOptions) => stage(options), rollback, authorize,
        compiled: (staged: object) => definitions.get(staged)!,
        async recordBefore(index: number, outcome: BeforeUpdate, options: RunOptions = {}) {
            const staged = await stage({ index, replace: true, ...options });
            return staged.recordBefore(outcome);
        },
        async inspect() {
            const snapshot = adapter.capture();
            if (!snapshot.history) {return { ok: false as const, diagnostics: [{ code: 'not-enabled' }] };}
            const bundle = adapter.bundle();
            return { ...success(clone(snapshot.state)), version: digest(bundle), bundle: clone(bundle),
                receipt: snapshot.records[snapshot.index]?.entries.at(-1) };
        },
        async enable({ signal }: RunOptions = {}): Promise<Result> {
            let snapshot = adapter.capture();
            if (snapshot.history) {reject('already-enabled');}
            const compiled = compileDefinition(adapter.bundle());
            if (compiled.definition.openings) {
                const greeting = adapter.capture(0);
                if (!greeting.opening) {reject('opening-start-required');}
                snapshot = greeting;
            }
            await authorize({ signal });
            assertCurrent(snapshot); signal?.throwIfAborted();
            const existing = snapshot.state as JsonObject;
            const base = { ...clone(compiled.definition.initial), ...Object.fromEntries(variableRoots(compiled.definition)
                .filter(root => Object.hasOwn(existing, root)).map(root => [root, clone(existing[root])])) };
            const opening = Boolean(compiled.definition.openings && snapshot.opening);
            const start = opening ? initialState(compiled.definition, snapshot.target.swipeId, base) : base;
            const result = await settle(compiled, start, [], { signal, initialize: true });
            if (!result.ok) {return result;}
            assertCurrent(snapshot); signal?.throwIfAborted();
            const roots = variableRoots(compiled.definition);
            if (Object.keys(result.state as JsonObject).some(root => !roots.includes(root))) {reject('unowned-root');}
            const history: History = { format: 3, roots, version: digest(compiled.bundle), revision: 0, checkpoints: [],
                openingMode: opening ? 'per-swipe' : 'common' };
            const records = clone(snapshot.records);
            const receipt = opening ? makeReceipt({ before: base, result, source: OPENING_SOURCE, revision: 1 }) : undefined;
            if (receipt) {records[0].entries.push(receipt);}
            return publish(snapshot, history, records, { ...result, version: history.version, ...(receipt ? { receipt } : {}) }, false);
        },
        async initializeOpening({ signal }: RunOptions = {}): Promise<Result | undefined> {
            const snapshot = adapter.capture(0), history = snapshot.history;
            if (history?.openingMode !== 'per-swipe' || !snapshot.opening || snapshot.records[0]?.entries.some(isOpeningReceipt)) {return;}
            const compiled = compileDefinition(adapter.bundle());
            await authorize({ signal });
            assertCurrent(snapshot); signal?.throwIfAborted();
            const start = initialState(compiled.definition, snapshot.target.swipeId, snapshot.state as JsonObject);
            const result = await settle(compiled, start, [], { signal, initialize: true });
            if (!result.ok) {return result;}
            assertCurrent(snapshot); signal?.throwIfAborted();
            if (Object.keys(result.state as JsonObject).some(root => !history.roots.includes(root))) {reject('unowned-root');}
            const records = clone(snapshot.records), updated = { ...clone(history), version: digest(compiled.bundle), checkpoints: [] };
            const receipt = makeReceipt({ before: snapshot.state, result, source: OPENING_SOURCE, revision: history.revision + 1 });
            records[0].entries.push(receipt);
            return publish(snapshot, updated, records, { ...result, version: updated.version, receipt }, true);
        },
        async apply(input: unknown, options: ApplyOptions = {}) {
            const staged = await stage(options);
            return staged.run(input, { ...options, preview: false });
        },
        async preview(input: unknown, options: ApplyOptions = {}) {
            const staged = await stage(options);
            return staged.run(input, { ...options, preview: true });
        },
        async undo({ index, signal, all = false }: RunOptions & { index?: number; all?: boolean } = {}): Promise<Result> {
            const snapshot = adapter.capture(index), history = snapshot.history, records = clone(snapshot.records);
            adapter.assertMutable(snapshot);
            const target = records[snapshot.index];
            const removable = target ? target.entries.map(isOpeningReceipt).lastIndexOf(false) : -1;
            if (!history || removable < 0) {reject('nothing-to-undo');}
            if (all) {return rollback({ index: snapshot.index, signal });}
            const later = records.slice(snapshot.index + 1).flatMap(record => record.entries);
            const removed = target.entries.splice(removable, 1);
            const state = rewind(history, snapshot.state, [...removed, ...later]);
            records.slice(snapshot.index + 1).forEach(record => {record.entries = [];});
            signal?.throwIfAborted();
            return publish(snapshot, { ...clone(history), checkpoints: [] }, records,
                { ...success(state), changes: displayChanges(difference(snapshot.state, state)), version: history.version }, true, false, snapshot.index);
        },
        async restoreSelection(previous: Receipt[], next: Receipt[] = [], { check = false, signal }: RunOptions & { check?: boolean } = {}): Promise<Result | undefined> {
            const snapshot = adapter.capture(), history = snapshot.history;
            if (!history || (!previous.length && !next.length)) {return;}
            const entries = clone(next);
            const state = rebase(rewind(history, snapshot.state, previous), entries);
            const rebased = new Map(entries.map(entry => [entry.id, entry]));
            const records = snapshot.records.map(record => ({ entries: record.entries.map(entry => rebased.get(entry.id) || entry) }));
            // Publish synchronously: validation warns about the restored state; it never vetoes a native swipe.
            const publication = publish(snapshot, { ...clone(history), checkpoints: [] }, records,
                { ...success(state), changes: displayChanges(difference(snapshot.state, state)), version: history.version }, true);
            const validation = check ? checkRestoration(state, signal) : Promise.resolve([]);
            const [result, restoration] = await Promise.all([publication, validation]);
            return { ...result, restoration };
        },
    };
}
export type SettlementService = ReturnType<typeof createSettlementService>;
