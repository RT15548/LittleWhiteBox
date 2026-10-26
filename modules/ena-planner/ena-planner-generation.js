import { createAbortError, throwIfSignalAborted } from '../../shared/common/abort-utils.js';
import { projectPlannerContext, replacePlannerSlot } from './ena-planner-context.js';
import { PLANNER_COPY } from './ena-planner-copy.js';

/** Keep the native request suspended until the user adopts this turn's preview. */
export function createPlannerGeneration(host) {
    let active = null;
    let recovering = null;
    let lastContext = null;
    const retiredRuns = new Map();
    // Keep only in-memory recovery records for already-confirmed Send actions.
    // Host Stop must not turn an uncertain write into a silently accepted <plot>.
    const pendingSaves = new Map();
    const adoptedSources = new WeakMap();
    const expectedText = run => run.saveState?.applied ? run.saveState.text : run.sourceText;
    const owns = run => active === run && host.identity() === run.chatId
        && host.chat()[run.index] === run.source && run.source.mes === expectedText(run);
    function assertActive(run) {
        throwIfSignalAborted(run.controller.signal);
        if (!owns(run)) throw createAbortError(PLANNER_COPY.changed);
    }
    const actions = run => ({
        stop: () => stopPlanning(run),
        replan: () => replan(run),
        send: () => send(run),
    });
    const publish = run => host.preview?.(run, actions(run));
    function release(run, keepSlot = false) {
        run.removeAbort?.();
        if (!keepSlot) run.releaseSlot?.();
    }
    function cancel(stopHost = true, clear = false) {
        const run = active;
        recovering?.controller.abort();
        if (!run && recovering && stopHost) host.stop();
        if (run) {
            active = null;
            if (run.saveState?.status === 'confirmed') adoptedSources.set(run.source, run.saveState.text);
            if (run.saveState?.attempted && run.saveState.status !== 'confirmed') pendingSaves.set(run.source, run);
            const awaitingNativeRequest = run.phase === 'ready' && !run.request;
            retiredRuns.set(run.marker, { allowDispatch: false, controller: run.controller,
                releaseSlot: awaitingNativeRequest ? run.releaseSlot : null });
            run.controller.abort();
            run.plannerController?.abort();
            run.phase = 'invalid';
            run.error ||= PLANNER_COPY.changed;
            // If the host is still formatting its copy, keep the marker until
            // that cancelled request arrives so it can be positively rejected.
            release(run, awaitingNativeRequest);
            publish(run);
            run.finish?.();
            if (stopHost) host.stop();
        }
        if (clear) { lastContext = null; host.clearPreview?.(); }
    }
    function fail(run, error, fatal = false) {
        if (active !== run) return;
        run.error = String(error?.message || error);
        run.phase = 'error';
        publish(run);
        host.onError(error);
        if (fatal) cancel(true);
    }
    // EventEmitter catches listener errors. A request-local serialization guard
    // also blocks transport, including text streaming which creates a NEW signal
    // after GENERATE_AFTER_DATA. Never patch global fetch or host state.
    function guardRequest(data, run) {
        Object.defineProperty(data, 'toJSON', { configurable: true, enumerable: false,
            value() {
                if (!run.allowDispatch || run.controller.signal.aborted
                    || host.identity() !== run.chatId || host.chat()[run.index] !== run.source
                    || run.source.mes !== expectedText(run)) throw createAbortError(PLANNER_COPY.changed);
                return { ...this };
            } });
    }

    async function prepare(chat, contextSize, abort, type, dispatch) {
        if (type === 'quiet' || type === 'impersonate') return;
        // Check the pending transaction BEFORE inspecting source text: an
        // uncertain save already contains <plot> in RAM, but must not let a new
        // foreground generation bypass confirmation through the usual skip rule.
        // A new native foreground interception supersedes only an unbound
        // preparation. Some hosts return early (e.g. Horde parameter failure)
        // without a request-scoped end event. Keep the old marker revoked so a
        // late payload cannot take the new run. Never displace a preview/save.
        if (active?.phase === 'ready' && !active.request) cancel(false, true);
        if (recovering || (active && owns(active))) { abort(true); return; }
        for (const [source, previous] of pendingSaves) {
            if (previous.chatId !== host.identity()) continue;
            if (!host.chat().includes(source)) { pendingSaves.delete(source); continue; }
            if (host.chat()[previous.index] !== source || source.mes !== expectedText(previous)) {
                if (previous.saveState.writePending) {
                    abort(true);
                    host.onError(new Error('上一笔规划保存尚未结束，请稍后重试。'));
                    return;
                }
                // An explicit edit/deletion supersedes this old authorization.
                pendingSaves.delete(source);
                continue;
            }
            // The user already clicked Send. A new foreground request after
            // host cancellation retries that transaction, never the model. The
            // save layer reads first and refuses to rewrite an unsettled save.
            const recovery = { controller: new AbortController() };
            recovering = recovery;
            previous.controller = recovery.controller;
            const cancelRecovery = () => recovery.controller.abort();
            dispatch?.signal?.addEventListener('abort', cancelRecovery, { once: true });
            if (dispatch?.signal?.aborted) cancelRecovery();
            const snapshotText = source.mes;
            try {
                throwIfSignalAborted(recovery.controller.signal);
                await host.commit(previous, previous.saveState.plan);
                throwIfSignalAborted(recovery.controller.signal);
                pendingSaves.delete(source);
                adoptedSources.set(source, previous.saveState.text);
                if (source.mes !== snapshotText) {
                    // The host cloned chat before this interceptor. Never send
                    // that stale snapshot or rewrite other handlers' output.
                    abort(true);
                    host.onError(new Error('规划保存已恢复。请再次生成正文，以采用刚恢复的规划。'));
                    return;
                }
            } catch (error) {
                abort(true);
                if (error?.name !== 'AbortError') host.onError(error);
                return;
            } finally {
                dispatch?.signal?.removeEventListener('abort', cancelRecovery);
                if (recovering === recovery) recovering = null;
            }
        }
        const source = host.chat().at(-1);
        if (!host.enabled() || !source?.is_user || (type && !['normal', 'regenerate'].includes(type))) return;
        if (adoptedSources.get(source) === source.mes) return;
        const text = String(source.mes || '');
        if (!text.trim() || text.trimStart().startsWith('/') || /<plot\b/i.test(text)) return;
        cancel(false, true);
        const run = { source, sourceText: source.mes, index: host.chat().length - 1,
            chatId: host.identity(), contextSize, marker: host.createMarker(),
            controller: new AbortController(), phase: 'preparing', previewText: '', error: '' };
        active = run;
        run.done = new Promise(resolve => { run.finish = resolve; });
        const onAbort = () => { if (active === run) cancel(true); };
        dispatch?.signal?.addEventListener('abort', onAbort, { once: true });
        run.removeAbort = () => dispatch?.signal?.removeEventListener('abort', onAbort);
        publish(run);
        try {
            // Persist the original USER independently, before any preview exists.
            await host.saveSource?.(run);
            assertActive(run);
            run.api = await host.resolveApi();
            assertActive(run);
            if (dispatch?.signal?.aborted) throw createAbortError();
            run.releaseSlot = host.reserveSlot(chat, run.source, run.marker);
            host.orderHooks();
            run.phase = 'ready';
            return true;
        } catch (error) {
            if (active === run) {
                if (error?.name !== 'AbortError') host.onError(error);
                cancel(true);
            }
            abort(true);
        }
    }

    async function replan(run = active) {
        if (!run || !owns(run) || !run.context || run.phase === 'saving' || run.saveState) return;
        run.plannerController?.abort();
        const controller = new AbortController();
        run.plannerController = controller;
        const current = () => owns(run) && run.plannerController === controller && !controller.signal.aborted;
        run.phase = 'planning';
        run.previewText = '';
        run.error = '';
        publish(run);
        try {
            const result = await host.plan(run.context, { signal: controller.signal, api: run.api,
                onPreview(text) {
                    if (!current()) return;
                    run.previewText = String(text || '');
                    publish(run);
                } });
            if (!current()) return;
            run.previewText = String(result?.filtered || '').trim();
            if (!run.previewText) throw new Error(PLANNER_COPY.empty);
            run.phase = 'preview';
            publish(run);
        } catch (error) {
            if (!current()) return;
            fail(run, error);
        }
    }
    function stopPlanning(run = active) {
        if (!run || !owns(run) || run.phase !== 'planning') return;
        run.plannerController.abort();
        run.phase = 'stopped';
        publish(run);
    }
    async function send(run = active) {
        if (!run || !owns(run) || !['preview', 'stopped', 'error'].includes(run.phase)) return;
        const plan = run.saveState?.plan || run.previewText.trim();
        if (!plan) return;
        run.phase = 'saving';
        run.error = '';
        publish(run);
        try {
            assertActive(run);
            const data = run.request;
            const filled = replacePlannerSlot(data[run.field], run.marker, plan);
            if (filled.count !== 1) throw new Error(PLANNER_COPY.slot);
            const updates = { [run.field]: filled.prompt };
            for (const [field, count] of run.companions) {
                const companion = replacePlannerSlot(data[field], run.marker, plan);
                if (companion.count !== count) throw new Error(PLANNER_COPY.slot);
                updates[field] = companion.prompt;
            }
            await host.checkBudget({ ...data, ...updates }, run);
            assertActive(run);
            await host.commit(run, plan);
            // commit may update source.mes; saveState is the authority for RAM.
            throwIfSignalAborted(run.controller.signal);
            if (active !== run || host.identity() !== run.chatId
                || host.chat()[run.index] !== run.source) throw createAbortError(PLANNER_COPY.changed);
            Object.assign(data, updates);
            run.allowDispatch = true;
            adoptedSources.set(run.source, expectedText(run));
            run.phase = 'completed';
            release(run);
            publish(run);
            active = null;
            run.finish();
        } catch (error) {
            if (error?.name === 'AbortError') { if (active === run) cancel(true); return; }
            fail(run, error);
        }
    }
    async function consume(data) {
        const run = active;
        if (!run || run.phase !== 'ready' || run.request !== data) return;
        run.releaseSlot?.();
        try {
            assertActive(run);
            const captured = replacePlannerSlot(data[run.field], run.marker, '');
            if (captured.count !== 1) throw new Error(PLANNER_COPY.slot);
            run.context = projectPlannerContext(captured.prompt);
            lastContext = { chatId: run.chatId, source: run.source, messages: run.context };
            // Deliberately do not await the model before awaiting user choice.
            // Stop/replan can detach a provider that ignores cancellation.
            replan(run).catch(error => fail(run, error, true));
        } catch (error) {
            fail(run, error, true);
        }
        await run.done;
    }

    function containsMarker(data, fields, marker) {
        return fields.some(field => {
            if (data?.[field] == null) return false;
            try { return replacePlannerSlot(data[field], marker, '').count > 0; }
            catch { return false; }
        });
    }
    function matchesRequest(data, field, companionFields = []) {
        const fields = [field, ...companionFields];
        return Boolean(active && containsMarker(data, fields, active.marker))
            || [...retiredRuns.keys()].some(marker => containsMarker(data, fields, marker));
    }
    function rejectRequest(data, error = new Error(PLANNER_COPY.slot)) {
        // Missing identity is not evidence that this is the current foreground
        // request. Deny this payload, without stopping or changing another run.
        guardRequest(data, { allowDispatch: false });
        host.onError(error);
        return false;
    }
    const hasOutstandingRequest = () => Boolean(active?.phase === 'ready' && !active.request)
        || [...retiredRuns.values()].some(run => run.releaseSlot);

    return {
        prepare, consume, cancel, stopPlanning, replan, send,
        matchesRequest, rejectRequest, hasOutstandingRequest,
        ready: () => active?.phase === 'ready',
        bindRequest(data, field, companionFields = []) {
            if (data?.type === 'quiet' || data?.type === 'impersonate') return false;
            if (typeof field !== 'string') return false;
            const fields = [field, ...companionFields];
            const matches = [...retiredRuns].filter(([marker]) => containsMarker(data, fields, marker));
            const current = Boolean(active && containsMarker(data, fields, active.marker));
            if (matches.length + Number(current) > 1) return rejectRequest(data);
            // Positively identified revoked payloads never touch a newer run.
            if (matches.length) {
                const retired = matches[0][1];
                guardRequest(data, retired);
                retired.releaseSlot?.();
                retired.releaseSlot = null;
                return false;
            }
            if (!current) {
                // Native text requests have no reliable `type` field. The host
                // adapter identifies bypass requests before reaching this path.
                // An unknown payload cannot consume a retired slot or cancel
                // the foreground; a later interception can replace ready state.
                return hasOutstandingRequest() ? rejectRequest(data) : false;
            }
            if (active.phase !== 'ready' || active.request) return rejectRequest(data);
            const run = active;
            guardRequest(data, run);
            let captured, companions;
            try {
                captured = replacePlannerSlot(data?.[field], run.marker, '');
                companions = companionFields.filter(name => data[name] != null)
                    .map(name => [name, replacePlannerSlot(data[name], run.marker, '').count]);
            } catch {
                fail(run, new Error(PLANNER_COPY.slot), true);
                return false;
            }
            if (captured.count !== 1 || companions.some(([, count]) => count > 1)) {
                fail(run, new Error(PLANNER_COPY.slot), true);
                return false;
            }
            run.request = data;
            run.field = field;
            run.companionFields = companionFields;
            run.companions = companions;
            return true;
        },
        context: () => lastContext?.chatId === host.identity() ? lastContext.messages : null,
        sourceEdited(index) {
            if (Number(index) === active?.index) cancel(true, true);
            if (host.chat()[Number(index)] === lastContext?.source) lastContext = null;
        },
        sourceDeleted() { if (active && !owns(active)) cancel(true, true); },
        stripSlot(data, field) {
            if (active && data[field] != null) data[field] = replacePlannerSlot(data[field], active.marker, '').prompt;
        },
    };
}
