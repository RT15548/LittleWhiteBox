import type { TasksGenerationState } from '../types.js';
import type { TaskGenerationRequests, TaskGenerationRequestResult } from './request.js';
import type { BoardCompileResult, CandidateCompileResult } from './types.js';
import { taskFailureMessage } from '../feedback.js';
import { taskGenerationFailureReason } from './failure.js';
import { observeBackgroundTask } from '../../../../../shared/common/async-errors.js';


interface GenerationRun {
    chatIdentity: string;
    state: TasksGenerationState;
    failureReason?: string;
}

type GenerationResult = TaskGenerationRequestResult<BoardCompileResult | CandidateCompileResult>;

function outcomeMessage(result: GenerationResult): string {
    if (result.status === 'cancelled') {return '本次生成已取消。';}
    if (result.status === 'failed') {
        const reason = result.compile?.skipped.some(item => item.reason === 'response_truncated')
            ? 'response-truncated' : 'invalid-response';
        return (result.kind === 'board' ? '任务刷新失败。' : '招募失败。') + taskFailureMessage(reason);
    }
    if (result.kind === 'board') {
        const count = (result.compile as BoardCompileResult | undefined)?.data?.listings.length ?? 0;
        if (result.status === 'partial') {return count ? `已刷新 ${count} 项任务，部分内容不可用。` : '任务内容不完整，本次未刷新。';}
        if (result.status === 'unchanged') {return count ? '任务大厅暂无变化。' : '当前没有新任务。';}
        return count ? `已刷新 ${count} 项任务。` : '当前没有新任务。';
    }
    const count = (result.compile as CandidateCompileResult | undefined)?.data?.candidates.length ?? 0;
    if (result.status === 'partial') {return '部分候选资料不可用。';}
    if (result.status === 'unchanged') {return count ? '候选名单无变化。' : '暂无人应征。';}
    return count ? `找到 ${count} 名候选人。` : '暂无人应征。';
}

export function createTaskGenerationRuntime({
    requests,
    getChatIdentity,
    onChange,
    report,
}: {
    requests: TaskGenerationRequests;
    getChatIdentity: () => string;
    onChange: () => void;
    report: (error: unknown) => void;
}) {
    let current: GenerationRun | null = null;

    function isCurrent(run: GenerationRun): boolean {
        return current === run && getChatIdentity() === run.chatIdentity;
    }

    async function execute(run: GenerationRun, request: () => Promise<GenerationResult>): Promise<void> {
        try {
            const result = await request();
            if (!isCurrent(run)) {return;}
            run.state = { ...run.state, state: 'idle', message: outcomeMessage(result) };
        } catch (error) {
            if (!isCurrent(run)) {return;}
            report(error);
            run.failureReason = taskGenerationFailureReason(error);
            run.state = {
                ...run.state,
                state: 'idle',
                message: run.failureReason === 'save-unconfirmed' ? ''
                    : (run.state.kind === 'board' ? '任务刷新失败。' : '招募失败。') + taskFailureMessage(run.failureReason),
            };
        } finally {
            if (isCurrent(run)) {onChange();}
        }
    }

    function start(
        chatIdentity: string,
        kind: 'board' | 'candidates',
        taskId: string | null,
        request: () => Promise<GenerationResult>,
    ): void {
        if (current?.state.state === 'running') {throw new Error('tasks_generation_active');}
        const run: GenerationRun = {
            chatIdentity,
            state: {
                state: 'running', kind, taskId,
                message: kind === 'board'
                    ? '正在后台刷新任务，可离开任务 APP 或关闭小白 OS。'
                    : '正在后台招募，可离开任务 APP 或关闭小白 OS。',
            },
        };
        current = run;
        onChange();
        observeBackgroundTask(execute(run, request), { source: import.meta.url, operation: "start" });
    }

    return Object.freeze({
        reconcileSave(chatIdentity: string, recovered: boolean): void {
            if (!recovered || current?.chatIdentity !== chatIdentity
                || (current.failureReason !== 'save-unconfirmed' && current.failureReason !== 'save-conflict')) { return; }
            current = null;
        },
        getState(chatIdentity: string): TasksGenerationState {
            return current?.chatIdentity === chatIdentity
                ? { ...current.state }
                : { state: 'idle', kind: null, taskId: null, message: '' };
        },
        startBoard(chatIdentity: string) {
            start(chatIdentity, 'board', null, () => requests.refreshBoard());
        },
        startCandidates(chatIdentity: string, input: Parameters<TaskGenerationRequests['refreshCandidates']>[0]) {
            start(chatIdentity, 'candidates', input.taskId, () => requests.refreshCandidates(input));
        },
        cancelAll(reason: string) {
            current = null;
            requests.cancelAll(reason);
            onChange();
        },
    });
}
