import { createLearningTaskBook, learningTaskResult, learningTaskView, type LearningDelegatedTask, type LearningTaskResult, type LearningWorkRequest, type LearningRequestResult } from '../application/delegation.js';
import type { LearningTeachingResult } from '../application/teaching.js';
import type { LearningTurn } from '../agent/history.js';
import { LEARNING_CONVERSATION_COPY as copy } from '../application/conversation-copy.js';
import { reportLearningFailure } from '../application/feedback.js';

/** Independent work and serial result delivery, owned by the active learning runtime. */
export function createLearningDelegatedWork(options: {
    owner: () => string | null;
    workBusy: () => boolean;
    canNotify: (retrySave?: boolean) => boolean;
    awaitingApproval: () => boolean;
    work: (request: LearningWorkRequest, taskId: string, retryId?: string) => Promise<LearningTeachingResult>;
    notify: (result: LearningTaskResult, retryId?: string) => Promise<LearningTeachingResult>;
    notificationTurn: (taskId: string) => LearningTurn | undefined;
    resetNotification: (taskId: string) => void;
    saveNotification: (taskId: string) => Promise<boolean>;
    run: (work: () => Promise<void>) => unknown;
    changed: () => void;
}) {
    const book = createLearningTaskBook();
    const owned = (task: LearningDelegatedTask) => book.get(task.id) === task && task.owner === options.owner();
    const current = () => book.forOwner(options.owner() ?? '');
    const views = () => current().map(task => learningTaskView(task, !task.result && options.awaitingApproval()));
    const list = () => views().map(({ taskId, task, status, notification }) => ({ taskId, task, status, notification }));
    function drain() {
        for (const task of current()) {
            const turn = options.notificationTurn(task.id);
            if (task.notification === 'failed' && turn?.status === 'finished' && !turn.notice) {
                task.notification = 'delivered'; task.notificationError = '';
            }
        }
        if (!options.canNotify()) { return; }
        const next = current().find(task => task.result && task.notification === 'pending');
        if (next) { deliver(next); }
    }
    function deliver(task: LearningDelegatedTask) {
        task.notification = 'delivering'; task.notificationError = '';
        const attempt = ++task.notificationAttempt;
        const currentDelivery = () => owned(task) && task.notificationAttempt === attempt;
        const previous = options.notificationTurn(task.id);
        // Reserve the conversation synchronously, before another learner request can start it.
        const delivery = previous?.status === 'finished' && previous.notice === 'history-save'
            ? options.saveNotification(task.id).then(historySaved => ({ status: 'finished' as const, historySaved }))
            : options.notify(learningTaskResult(task), previous?.id);
        options.run(async () => {
            try {
                const result = await delivery;
                if (!currentDelivery()) { return; }
                const turn = options.notificationTurn(task.id);
                task.notification = result.status === 'finished' && result.historySaved === true ? 'delivered' : 'failed';
                if (task.notification === 'failed') {
                    task.notificationError = turn?.message || (result.status === 'failed' ? result.message : copy.notificationFailed);
                }
            } catch (error) {
                if (currentDelivery()) {
                    task.notification = 'failed';
                    task.notificationError = reportLearningFailure('task-result', 'learning_action_failed', { stage: 'action', cause: error });
                }
            } finally {
                if (currentDelivery()) { drain(); options.changed(); }
            }
        });
        options.changed();
    }
    function execute(task: LearningDelegatedTask, retryId?: string) {
        if (retryId) { options.resetNotification(task.id); }
        task.result = null;
        task.notification = 'pending'; task.notificationError = '';
        task.notificationAttempt++;
        const attempt = ++task.workAttempt;
        const currentWork = () => owned(task) && task.workAttempt === attempt;
        const work = options.work(task.request, task.id, retryId);
        options.run(async () => {
            try { const result = await work; if (currentWork() && !task.result) { task.result = result; } }
            catch (error) {
                if (currentWork() && !task.result) { task.result = { status: 'failed', reason: 'learning_action_failed', displayed: false,
                    message: reportLearningFailure('talk', 'learning_action_failed', { stage: 'action', cause: error }) }; }
            } finally { if (currentWork()) { drain(); options.changed(); } }
        });
        options.changed();
    }
    return {
        views, list, drain,
        clear: book.clear,
        cancel(actor: 'workbench' | 'companion') {
            for (const task of current()) {
                if (actor === 'workbench' && !task.result) { task.result = { status: 'cancelled' }; }
                if (actor === 'companion' && task.notification === 'delivering') {
                    task.notificationAttempt++; task.notification = 'failed';
                    task.notificationError = copy.notificationFailed;
                }
            }
            drain();
        },
        get(taskId?: string) {
            const tasks = views();
            return taskId === undefined ? { ok: true, tasks: list() }
                : tasks.some(task => task.taskId === taskId) ? { ok: true, tasks: tasks.filter(task => task.taskId === taskId) }
                    : { ok: false, status: 'not-found' };
        },
        retry(taskId: string) {
            const task = book.get(taskId);
            if (!task || !owned(task) || task.notification !== 'failed') { return; }
            const turn = options.notificationTurn(task.id);
            if (!options.canNotify(turn?.status === 'finished' && turn.notice === 'history-save')) { return 'busy' as const; }
            deliver(task);
        },
        retryWork(taskId: string, turnId: string) {
            const task = book.get(taskId);
            if (!task || !owned(task) || !['failed', 'cancelled'].includes(task.result?.status ?? '')) { return; }
            if (options.workBusy() || task.notification === 'delivering') { return 'busy' as const; }
            execute(task, turnId);
        },
        async start(request: LearningWorkRequest, signal: AbortSignal): Promise<LearningRequestResult> {
            const owner = options.owner();
            if (!owner || signal.aborted) { return { ok: false, status: 'cancelled' }; }
            if (options.workBusy()) { return { ok: false, status: 'busy' }; }
            const task = book.create(owner, request);
            execute(task);
            return { ok: true, status: 'accepted', taskId: task.id };
        },
    };
}
