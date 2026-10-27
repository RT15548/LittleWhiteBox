import { createMemoryChatContextEstimator, memoryRegenerationNote } from './conversation.js';
import { REVIEW_LIMITS } from './limits.js';
import { requireMemory } from './errors.js';
import { memoryRunError } from './run-feedback.js';

export const MEMORY_CHAT_PAGE_SIZE = 20;
export const MEMORY_CHAT_TOOL_LIMIT = 20;
export const MEMORY_CHAT_CONTEXT_DELAY_MS = 250;
const contextPending = status => ({ status, used: null, limit: REVIEW_LIMITS.inputTokens, trigger: REVIEW_LIMITS.compactTokens });

/** Page-lifetime conversation. Stored memory, automatic runs and UI mounting are not its history. */
export function createMemoryChatController({ identity, chatId, scheduler, execute, status, previewTask, summaryStyle = () => '', changed }) {
    let binding = null, generation = 0, serial = 0;
    let turns = [], history = [], beforeLast = [], draft = '', activeId = null, failure = '';
    let pendingRun = null, pageOffset = 0;
    let context = contextPending('loading'), estimateContext = createMemoryChatContextEstimator();
    let updateTimer = null, contextTimer = null;
    const emitted = new Map();
    const notify = (immediate = false) => {
        if (immediate) { clearTimeout(updateTimer); updateTimer = null; changed(); }
        else if (updateTimer === null) updateTimer = setTimeout(() => { updateTimer = null; changed(); }, 100);
    };
    function refreshContext() {
        clearTimeout(contextTimer);
        const epoch = generation;
        if (!binding) { context = contextPending('unavailable'); contextTimer = null; return; }
        context = contextPending('loading');
        contextTimer = setTimeout(() => {
            contextTimer = null;
            if (epoch !== generation || binding !== identity() || activeId) return;
            try { context = { ...estimateContext({ question: draft, history, task: previewTask(), summaryStyle: summaryStyle() }), status: 'ready' }; }
            catch (error) { context = { ...contextPending('unavailable'), error: memoryRunError(error) }; }
            notify();
        }, MEMORY_CHAT_CONTEXT_DELAY_MS);
    }
    function reset({ preview = true } = {}) {
        generation++;
        clearTimeout(contextTimer); contextTimer = null;
        binding = identity();
        turns = []; history = []; beforeLast = []; draft = ''; activeId = null; failure = '';
        pendingRun = null; pageOffset = 0; emitted.clear();
        context = contextPending(binding ? 'loading' : 'unavailable');
        estimateContext = createMemoryChatContextEstimator();
        scheduler.cancelInteraction();
        if (preview) refreshContext();
        notify(true);
    }
    function synchronize() { if (binding !== identity()) reset(); }
    const token = () => binding ? JSON.stringify([binding, generation]) : null;
    function assertBinding(request) {
        synchronize();
        requireMemory(binding && request.identity === token(), 'conflict');
    }
    function snapshot({ delta = false } = {}) {
        synchronize();
        const current = status();
        const end = Math.max(0, turns.length - pageOffset), start = Math.max(0, end - MEMORY_CHAT_PAGE_SIZE);
        const page = turns.slice(start, end), visible = new Set(page.map(turn => turn.id));
        const selected = delta ? page.filter(turn => emitted.get(turn.id) !== turn.revision) : page;
        if (delta) {
            for (const id of emitted.keys()) if (!visible.has(id)) emitted.delete(id);
            for (const turn of selected) emitted.set(turn.id, turn.revision);
        }
        return { identity: token(), chatId: chatId(), turns: structuredClone(selected), turnIds: [...visible], delta,
            page: { offset: pageOffset, limit: MEMORY_CHAT_PAGE_SIZE, total: turns.length,
                older: start > 0 ? pageOffset + MEMORY_CHAT_PAGE_SIZE : null,
                newer: pageOffset > 0 ? Math.max(0, pageOffset - MEMORY_CHAT_PAGE_SIZE) : null },
            draft, activeId, activeStatus: activeId ? turns.at(-1)?.status : null,
            busy: activeId !== null, automatic: current.automatic, ranges: current.ranges,
            context: structuredClone(context), error: failure };
    }
    function query(request = {}) {
        synchronize();
        if (request.identity !== undefined) assertBinding(request);
        const offset = request.offset ?? 0;
        requireMemory(Number.isInteger(offset) && offset >= 0, 'invalid_arguments', '', 'offset');
        pageOffset = Math.min(offset, Math.max(0, Math.ceil(turns.length / MEMORY_CHAT_PAGE_SIZE) - 1) * MEMORY_CHAT_PAGE_SIZE);
        emitted.clear();
        return snapshot();
    }
    async function start(request, regenerate = false) {
        assertBinding(request);
        requireMemory(!activeId, 'memory_chat_busy');
        const previous = turns.at(-1);
        const question = regenerate ? previous?.question : request.text;
        requireMemory(typeof question === 'string' && question.trim(), 'invalid_arguments', '', 'text');
        const epoch = generation;
        const inputHistory = regenerate ? [...beforeLast, memoryRegenerationNote(previous)] : history;
        beforeLast = inputHistory;
        const turn = { id: `${++serial}`, revision: 1, question: question.trim(), answer: '', status: 'queued',
            phase: 'thinking', tools: [], toolCount: 0, saved: 0, staged: 0,
            ...(regenerate && previous ? { previousAnswer: previous.answer || previous.previousAnswer } : {}) };
        if (regenerate) turns[turns.length - 1] = turn;
        else { turns.push(turn); draft = ''; }
        activeId = turn.id; failure = ''; pageOffset = 0;
        clearTimeout(contextTimer); contextTimer = null;
        context = contextPending('loading');
        const current = () => epoch === generation && binding === identity() && activeId === turn.id;
        const update = () => { if (current()) { turn.revision++; notify(); } };
        // Empty per-call snapshots (including tool-only replies) do not revoke earlier text.
        const receiveAnswer = text => { if (typeof text === 'string' && text.trim()) turn.answer = text; };
        const task = { chatId: chatId(), identity: binding };
        notify(true);
        const work = async (_task, signal, phase) => {
            if (!current()) return { status: 'cancelled', code: 'cancelled' };
            turn.status = 'running'; turn.revision++; notify(true);
            return execute(task, { mode: 'chat', signal, question: turn.question, history: inputHistory,
                phase: (value, progress) => {
                    phase(value, progress);
                    if (!current()) return;
                    if (value === 'saving') turn.phase = 'saving';
                    if (progress?.saved != null) turn.saved = progress.saved;
                    if (progress?.staged != null) turn.staged = progress.staged;
                    update();
                },
                onProgress: progress => { if (current()) {
                    turn.phase = progress.action;
                    if (progress.saved != null) turn.saved = progress.saved;
                    if (progress.staged != null) turn.staged = progress.staged;
                    update();
                } },
                onStream: value => { if (current()) { receiveAnswer(value.text); update(); } },
                onContext: value => { if (current()) { context = { ...value, status: 'ready' }; update(); } },
                onCall: ({ call, result, tools = [] }) => {
                    if (!current() || call.kind === 'compaction') return;
                    receiveAnswer(result?.text);
                    // Only presentation metadata crosses into the UI conversation.
                    // The execution protocol, arguments and results stay in history.
                    for (const tool of tools) turn.tools.push({ name: tool.name, status: tool.response?.status || tool.response?.state || 'completed' });
                    turn.toolCount += tools.length;
                    if (turn.tools.length > MEMORY_CHAT_TOOL_LIMIT) turn.tools.splice(0, turn.tools.length - MEMORY_CHAT_TOOL_LIMIT);
                    update();
                },
            });
        };
        try {
            pendingRun = scheduler.interact(task, work);
            const result = await pendingRun;
            if (!current()) return;
            turn.status = ['completed', 'cancelled', 'unconfirmed', 'superseded', 'partially_superseded'].includes(result.status) ? result.status : 'failed';
            receiveAnswer(result.summary);
            turn.saved = result.saved ?? turn.saved;
            turn.staged = result.staged ?? (result.status === 'completed' ? 0 : turn.staged);
            turn.runId = result.runId;
            turn.receipts = result.receipts || [];
            if (result.error || result.code && result.status !== 'cancelled') {
                turn.error = memoryRunError(result.error || { code: result.code, message: result.code });
            }
            if (result.messages) history = result.messages;
            beforeLast = result.replayBeforeTurn || inputHistory;
        } catch (error) {
            if (current()) { turn.status = error.uncertain ? 'unconfirmed' : 'failed'; turn.error = memoryRunError(error); }
        } finally {
            if (current()) {
                turn.revision++;
                activeId = null; pendingRun = null;
                refreshContext(); notify(true);
            }
        }
    }
    return {
        get identity() { synchronize(); return token(); },
        snapshot, query, liveSnapshot: () => snapshot({ delta: true }), reset,
        send: request => start(request),
        regenerate: request => start(request, true),
        draft(request) {
            assertBinding(request);
            requireMemory(typeof request.text === 'string', 'invalid_arguments');
            draft = request.text;
            if (!activeId) refreshContext();
            notify();
        },
        stop(request) { assertBinding(request); scheduler.cancelInteraction(); },
        takeover(request) { assertBinding(request); scheduler.takeover(); },
        async clear(request) {
            assertBinding(request);
            const epoch = generation;
            draft = '';
            scheduler.cancelInteraction();
            // start() owns the terminal error; an explicit clear also completes after setup failure.
            await Promise.allSettled(pendingRun ? [pendingRun] : []);
            if (epoch === generation && binding === identity()) {
                turns = []; history = []; beforeLast = []; failure = ''; pageOffset = 0; emitted.clear();
                refreshContext(); notify(true);
            }
        },
        report(error, requestIdentity) {
            if (binding !== identity() || requestIdentity !== token()) return;
            failure = memoryRunError(error); notify(true);
        },
    };
}
