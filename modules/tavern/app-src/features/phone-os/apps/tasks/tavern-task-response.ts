import {
    parseTavernTaskBoardResponse,
    parseTavernTaskCandidatesResponse,
    type TavernTaskCandidate,
    type TavernTaskListing,
} from '../../../../../shared/tasks/task-types';

export function parseTavernTaskBoardGenerationResponse(value = '', options: {
    excludedTitles?: string[];
    excludedIssuerNames?: string[];
} = {}): TavernTaskListing[] {
    return parseTavernTaskBoardResponse(value, {
        excludedTitles: options.excludedTitles,
        excludedIssuerNames: options.excludedIssuerNames,
    });
}

export function parseTavernTaskCandidatesGenerationResponse(value = '', options: {
    knownNames?: string[];
} = {}): TavernTaskCandidate[] {
    return parseTavernTaskCandidatesResponse(value, {
        knownNames: options.knownNames,
    });
}

export function tavernTaskRequestErrorText(error: unknown): string {
    if (error instanceof DOMException && error.name === 'AbortError') {return '';}
    const message = error instanceof Error ? error.message : String(error || 'task_request_failed');
    if (message === '请先配置分身模型。' || message.includes('分身模型')) {return '请先配置分身模型。';}
    if (message.startsWith('task_board_revision_conflict')) {return '委托板已被更新，本次迟到结果没有覆盖新内容。';}
    if (message.startsWith('task_board_epoch_conflict')) {return '委托板已经换新，请重新打开后再操作。';}
    if (message.startsWith('task_revision_conflict') || message.startsWith('task_version_conflict')) {
        return '任务状态已经变化，请重新打开后再操作。';
    }
    if (message.startsWith('task_anchor_order_regression')) {return '任务时间线已经前进，请重新打开后再操作。';}
    if (message.startsWith('task_timeline_conflict')) {return '剧情已经变化，请重新打开后再操作。';}
    if (message.startsWith('task_id_invalid') || message.startsWith('task_party_invalid')) {return '任务资料无效，无法建立这份委托。';}
    if (message.startsWith('task_listing_already_accepted')) {return '这份委托已经接取，不能重复领取。';}
    if (message.startsWith('task_balance_insufficient') || message.startsWith('economy_balance_insufficient')) {
        return '小白币余额不足，无法冻结这笔委托报酬。';
    }
    if (message.startsWith('task_response_invalid')) {return '终端没有收到可用的任务结果，请重试。';}
    if (message.startsWith('task_session_missing')) {return '这段剧情已经不存在。';}
    if (message.startsWith('task_action_conflict')) {return '这次操作已经失效，请重新打开任务后再试。';}
    if (message.startsWith('task_board_missing')) {return '委托板已经变化，请重新读取。';}
    return '任务终端暂时无法完成这次操作，请稍后重试。';
}
