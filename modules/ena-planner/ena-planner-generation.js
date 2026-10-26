import { createAbortError, throwIfSignalAborted } from '../../shared/common/abort-utils.js';
import { projectPlannerContext, replacePlannerSlot } from './ena-planner-context.js';
import { PLANNER_COPY } from './ena-planner-copy.js';

/** One foreground host generation, from its native interceptor to its transport. */
export function createPlannerGeneration(host) {
    let active = null;
    let retrySource = null;
    let lastContext = null;

    const owns = run => active === run && host.identity() === run.chatId
        && host.chat()[run.index] === run.source && run.source.mes === run.sourceText;
    function assertActive(run) {
        throwIfSignalAborted(run.controller.signal);
        if (!owns(run)) throw createAbortError(PLANNER_COPY.changed);
    }
    function release(run) {
        run.removeAbort?.();
        run.cancelNotice?.();
        run.releaseSlot?.();
    }
    function cancel(stopHost = true, clear = false) {
        const run = active;
        if (run) {
            active = null;
            retrySource = run.source;
            run.controller.abort();
            release(run);
            if (stopHost) host.stop();
        }
        if (clear) { retrySource = null; lastContext = null; }
    }

    async function prepare(chat, contextSize, abort, type, dispatch) {
        const source = host.chat().at(-1);
        const retry = type === 'regenerate' && source === retrySource;
        if (!host.enabled() || !source?.is_user || (!retry && type && type !== 'normal')) return;
        const text = String(source.mes || '');
        if (!text.trim() || text.trimStart().startsWith('/') || /<plot\b/i.test(text)) return;
        cancel(false);
        const run = { source, sourceText: source.mes, index: host.chat().length - 1,
            chatId: host.identity(), contextSize, marker: host.createMarker(),
            controller: new AbortController(), phase: 'preparing' };
        active = run;
        const onAbort = () => { if (active === run) cancel(true); };
        dispatch?.signal?.addEventListener('abort', onAbort, { once: true });
        run.removeAbort = () => dispatch?.signal?.removeEventListener('abort', onAbort);
        try {
            run.api = await host.resolveApi();
            assertActive(run);
            if (dispatch?.signal?.aborted) throw createAbortError();
            run.releaseSlot = host.reserveSlot(chat, run.source, run.marker);
            host.orderHooks();
            run.phase = 'ready';
        } catch (error) {
            if (active === run) cancel(true);
            abort(true);
            if (error?.name !== 'AbortError') host.onError(error);
        }
    }

    async function consume(data) {
        const run = active;
        if (!run || run.phase !== 'ready' || run.request !== data) return;
        run.phase = 'planning';
        run.releaseSlot?.();
        try {
            assertActive(run);
            const captured = replacePlannerSlot(data[run.field], run.marker, '');
            if (captured.count !== 1) throw new Error(PLANNER_COPY.slot);
            const context = projectPlannerContext(captured.prompt);
            lastContext = { chatId: run.chatId, source: run.source, messages: context };
            run.cancelNotice = host.notice();
            const result = await host.plan(context, { signal: run.controller.signal, api: run.api });
            assertActive(run);
            const plan = String(result?.filtered || '').trim();
            if (!plan) throw new Error(PLANNER_COPY.empty);
            // Other handlers may have replaced the request while planning awaited.
            const filled = replacePlannerSlot(data[run.field], run.marker, plan);
            if (filled.count !== 1) throw new Error(PLANNER_COPY.slot);
            const updates = { [run.field]: filled.prompt };
            for (const [field, count] of run.companions) {
                // CFG branches share the same chat history, including the plan.
                const companion = replacePlannerSlot(data[field], run.marker, plan);
                if (companion.count !== count) throw new Error(PLANNER_COPY.slot);
                updates[field] = companion.prompt;
            }
            await host.checkBudget({ ...data, ...updates }, run);
            assertActive(run);
            await host.commit(run, plan);
            throwIfSignalAborted(run.controller.signal);
            if (active !== run || host.identity() !== run.chatId) throw createAbortError();
            Object.assign(data, updates);
            retrySource = null;
            active = null;
            release(run);
        } catch (error) {
            if (active === run) cancel(true);
            if (error?.name !== 'AbortError') host.onError(error);
        }
    }

    return {
        prepare, consume, cancel,
        ready: () => active?.phase === 'ready',
        bindRequest(data, field, companionFields = []) {
            if (active?.phase !== 'ready' || active.request || typeof field !== 'string') return false;
            if (data?.[field] == null) return false;
            const captured = replacePlannerSlot(data[field], active.marker, '');
            if (captured.count === 0) return false;
            const companions = companionFields.filter(name => data[name] != null)
                .map(name => [name, replacePlannerSlot(data[name], active.marker, '').count]);
            if (captured.count !== 1 || companions.some(([, count]) => count > 1)) {
                cancel(true);
                host.onError(new Error(PLANNER_COPY.slot));
                return false;
            }
            active.request = data;
            active.field = field;
            active.companionFields = companionFields;
            active.companions = companions;
            return true;
        },
        context: () => lastContext?.chatId === host.identity() ? lastContext.messages : null,
        sourceEdited(index) {
            const source = host.chat()[Number(index)];
            if (source === lastContext?.source) lastContext = null;
            if (source === retrySource) retrySource = null;
            if (active?.index === Number(index)) cancel(true, true);
        },
        // Non-owning requests must not leak a foreground placeholder.
        stripSlot(data, field) {
            if (active && data[field] != null) data[field] = replacePlannerSlot(data[field], active.marker, '').prompt;
        },
    };
}
