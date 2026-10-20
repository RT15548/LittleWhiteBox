import { estimateMemoryChatContext, memoryRegenerationNote } from './conversation.js';
import { requireMemory } from './errors.js';
import { memoryRunError } from './run-feedback.js';

/** Page-lifetime conversation. Stored memory, automatic runs and UI mounting are not its history. */
export function createMemoryChatController({ identity, chatId, scheduler, execute, diagnostics, previewTask, changed }) {
    let binding = null, generation = 0, serial = 0;
    let turns = [], history = [], beforeLast = [], draft = '', activeId = null, failure = '';
    let pendingRun = null;
    let context = estimateMemoryChatContext();
    let updateTimer = null;
    const notify = (immediate = false) => {
        if (immediate) { clearTimeout(updateTimer); updateTimer = null; changed(); }
        else if (updateTimer === null) updateTimer = setTimeout(() => { updateTimer = null; changed(); }, 60);
    };
    function refreshContext() {
        context = estimateMemoryChatContext({ question: draft, history, task: previewTask() });
    }
    function reset() {
        generation++;
        binding = identity();
        turns = []; history = []; beforeLast = []; draft = ''; activeId = null; failure = '';
        pendingRun = null;
        scheduler.cancelInteraction();
        refreshContext();
        notify(true);
    }
    function synchronize() { if (binding !== identity()) reset(); }
    const token = () => binding ? JSON.stringify([binding, generation]) : null;
    function assertBinding(request) {
        synchronize();
        requireMemory(binding && request.identity === token(), 'conflict');
    }
    function snapshot() {
        synchronize();
        const current = diagnostics({ limit: 1 });
        return { identity: token(), chatId: chatId(), turns: structuredClone(turns), draft, activeId,
            busy: activeId !== null, automatic: current.automatic, ranges: current.ranges,
            context: structuredClone(context), error: failure };
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
        const turn = { id: `${++serial}`, question: question.trim(), answer: '', status: 'queued',
            phase: 'thinking', tools: [], saved: 0,
            ...(regenerate && previous ? { previousAnswer: previous.answer || previous.previousAnswer } : {}) };
        if (regenerate) turns[turns.length - 1] = turn;
        else { turns.push(turn); draft = ''; }
        activeId = turn.id; failure = '';
        const current = () => epoch === generation && binding === identity() && activeId === turn.id;
        const update = () => { if (current()) notify(); };
        // Empty per-call snapshots (including tool-only replies) do not revoke earlier text.
        const receiveAnswer = text => { if (typeof text === 'string' && text.trim()) turn.answer = text; };
        const task = { chatId: chatId(), identity: binding };
        notify(true);
        const work = async (_task, signal, phase) => {
            if (!current()) return { status: 'cancelled', code: 'cancelled' };
            turn.status = 'running'; notify(true);
            return execute(task, { mode: 'chat', signal, question: turn.question, history: inputHistory,
                phase: (status, progress) => {
                    phase(status, progress);
                    if (!current()) return;
                    if (status === 'saving') turn.phase = 'editing';
                    if (progress?.saved != null) turn.saved = progress.saved;
                    update();
                },
                onProgress: progress => { if (current()) { turn.phase = progress.action; turn.saved = progress.saved; update(); } },
                onStream: snapshot => { if (current()) { receiveAnswer(snapshot.text); update(); } },
                onContext: value => { if (current()) { context = value; update(); } },
                onCall: ({ call, result, tools = [] }) => {
                    if (!current() || call.kind === 'compaction') return;
                    receiveAnswer(result?.text);
                    for (const tool of tools) turn.tools.push({ name: tool.name, arguments: tool.arguments,
                        response: tool.response, status: tool.response?.status || 'completed' });
                    update();
                },
            });
        };
        try {
            pendingRun = scheduler.interact(task, work);
            const result = await pendingRun;
            if (!current()) return;
            turn.status = ['completed', 'cancelled', 'unconfirmed'].includes(result.status) ? result.status : 'failed';
            receiveAnswer(result.summary);
            turn.saved = result.saved ?? turn.saved;
            turn.runId = result.runId;
            turn.receipts = result.receipts || [];
            if (result.error || result.code && result.status !== 'cancelled') {
                turn.error = memoryRunError(result.error || { code: result.code, message: result.code });
            }
            if (result.messages) history = result.messages;
            beforeLast = result.replayBeforeTurn || inputHistory;
            refreshContext();
        } catch (error) {
            if (current()) { turn.status = error.uncertain ? 'unconfirmed' : 'failed'; turn.error = memoryRunError(error); }
        } finally {
            if (current()) { activeId = null; pendingRun = null; notify(true); }
        }
    }
    return {
        get identity() { synchronize(); return token(); },
        snapshot,
        reset,
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
                turns = []; history = []; beforeLast = []; failure = '';
                refreshContext(); notify(true);
            }
        },
        report(error, requestIdentity) {
            if (binding !== identity() || requestIdentity !== token()) return;
            failure = memoryRunError(error); notify(true);
        },
    };
}
