import { createAbortError, throwIfSignalAborted } from '../../shared/common/abort-utils.js';
import { projectPlannerContext, replacePlannerSlot } from './ena-planner-context.js';
import { PLANNER_COPY } from './ena-planner-copy.js';

/** An editable in-memory draft can outlive a stopped native request. */
export function createPlannerGeneration(host) {
    let active = null;
    let lastContext = null;
    const retiredRuns = new Map();
    const adoptedSources = new WeakMap();
    const expectedText = run => run.adoptedText ?? run.sourceText;
    const owns = run => active === run && host.identity() === run.chatId
        && host.chat()[run.index] === run.source && run.source.mes === expectedText(run);
    function assertActive(run) {
        throwIfSignalAborted(run.controller.signal);
        if (!owns(run)) throw createAbortError(PLANNER_COPY.changed);
    }
    const actions = run => ({
        stop: () => stopPlanning(run),
        replan: () => { replan(run).catch(error => fail(run, error)); },
        edit: text => edit(run, text),
        send: async () => { await send(run); },
        discard: () => { if (owns(run)) cancel(!run.requestStopped, true); },
    });
    const publish = run => host.preview?.(run, actions(run));
    function release(run, keepSlot = false) {
        run.removeAbort?.();
        if (!keepSlot) run.releaseSlot?.();
    }
    function revokeRequest(run) {
        const awaiting = run.phase === 'ready' && !run.request;
        const retired = { allowDispatch: false, releaseSlot: awaiting ? run.releaseSlot : null };
        retiredRuns.set(run.marker, retired);
        // A later Send must never authorize the old, aborted payload.
        if (run.request) guardRequest(run.request, retired);
        run.requestStopped = true;
        release(run, awaiting);
        run.finish?.();
    }
    function cancel(stopHost = true, clear = true) {
        const run = active;
        if (run) {
            active = null;
            revokeRequest(run);
            run.controller.abort();
            run.plannerController?.abort();
            if (stopHost) host.stop();
        }
        if (clear) { lastContext = null; host.clearPreview?.(); }
    }
    function hostStopped() {
        const run = active;
        if (!run || run.requestStopped) return;
        if (!run.context) { cancel(false); return; }
        revokeRequest(run);
        run.plannerController?.abort();
        run.phase = 'stopped';
        run.error = '';
        publish(run);
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
        if (active?.phase === 'ready' && !active.request) cancel(false);
        if (active && owns(active)) {
            if (host.chat().at(-1) !== active.source) cancel(false);
            else { abort(true); return; }
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
        if (!run || !owns(run) || !run.context || run.phase === 'sending') return;
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
    function edit(run, text) {
        if (!owns(run) || run.phase === 'sending') return;
        // Typing takes ownership; late provider chunks cannot replace edits.
        if (run.phase === 'planning') {
            run.plannerController.abort();
            run.phase = 'stopped';
        }
        run.previewText = String(text);
        run.error = '';
        publish(run);
    }
    async function send(run = active) {
        if (!run || !owns(run) || !['preview', 'stopped', 'error'].includes(run.phase)) return;
        const plan = run.previewText.trim();
        if (!plan) return;
        run.phase = 'sending';
        run.error = '';
        publish(run);
        try {
            assertActive(run);
            const data = run.request;
            const updates = {};
            if (!run.requestStopped) {
                const filled = replacePlannerSlot(data[run.field], run.marker, plan);
                if (filled.count !== 1) throw new Error(PLANNER_COPY.slot);
                updates[run.field] = filled.prompt;
                for (const [field, count] of run.companions) {
                    const companion = replacePlannerSlot(data[field], run.marker, plan);
                    if (companion.count !== count) throw new Error(PLANNER_COPY.slot);
                    updates[field] = companion.prompt;
                }
            } else {
                await host.waitForIdle(run.controller.signal);
                assertActive(run);
                if (host.chat().at(-1) !== run.source) throw createAbortError(PLANNER_COPY.changed);
            }
            // In-memory adoption only. The next ordinary ST save owns persistence.
            run.adoptedText = `${String(run.sourceText).trimEnd()}\n\n${plan}`;
            run.source.mes = run.adoptedText;
            adoptedSources.set(run.source, run.adoptedText);
            host.update(run.index, run.source);
            if (!run.requestStopped) {
                Object.assign(data, updates);
                run.allowDispatch = true;
            }
            run.phase = 'completed';
            release(run);
            publish(run);
            active = null;
            run.finish();
            // Last message is this USER: regenerate neither deletes a reply nor
            // consumes the next message the user may have typed in the composer.
            if (run.requestStopped) await host.generate('regenerate');
        } catch (error) {
            if (error?.name === 'AbortError') { if (active === run) cancel(true); return; }
            if (active === run) fail(run, error);
            else host.onError(error);
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
        prepare, consume, cancel, hostStopped, stopPlanning, replan, send,
        matchesRequest, rejectRequest, hasOutstandingRequest,
        ready: () => active?.phase === 'ready',
        bindRequest(data, field, companionFields = []) {
            if (data?.type === 'quiet' || data?.type === 'impersonate') return false;
            if (typeof field !== 'string') return false;
            const fields = [field, ...companionFields];
            const matches = [...retiredRuns].filter(([marker]) => containsMarker(data, fields, marker));
            const current = Boolean(active && !active.requestStopped && containsMarker(data, fields, active.marker));
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
