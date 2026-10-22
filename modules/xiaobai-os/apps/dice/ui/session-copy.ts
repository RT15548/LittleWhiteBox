import type { DiceContinuationProgress, DiceContinuationStage, DiceHostBlocker, DiceHostWait } from '../application/host-wait.js';
import { DICE_REROLL_COST } from '../domain/reroll.js';

const blockerLabels: Record<DiceHostBlocker, string> = {
    generation: '上一轮生成结束',
    finalization: '上一轮回复收尾',
    save: '聊天保存',
};

const continuationLabels: Record<DiceContinuationStage, string> = {
    preparing: '酒馆正在准备续写',
    requesting: '提示词准备完成',
    responding: '已收到响应',
};

const withElapsed = (label: string, seconds: number) => `${label} · 已等 ${seconds} 秒`;

export const DICE_SESSION_COPY = {
    waitingGroup: '等待群聊轮次交接…',
    waitingHost: '准备行动检定…',
    unrolled: '检定请求已保留，尚未掷骰。',
    retained: '已暂停等待，骰点已保留。',
    retryCheck: '重试检定',
    retryContinue: '继续',
    cancelContinue: '取消续写',
    reroll: '重掷',
    price: `${DICE_REROLL_COST} 币`,
    rerollAccessible: `重掷，花费 ${DICE_REROLL_COST} 小白币`,
    insufficientFunds: '余额不足',
    unavailable: '这条检定记录暂时无法显示。',
    rolling: '正在掷骰',
    context: '检定背景',
    continuing: continuationLabels.preparing,
    retryFailed: '暂时无法重试。请等酒馆生成结束；若已修改回复，请用酒馆的「继续」。',
} as const;

export function diceHostWaitLabel(wait: DiceHostWait): string {
    return withElapsed(`等待${wait.blockers.map(blocker => blockerLabels[blocker]).join('、')}`, wait.elapsedSeconds);
}

export function diceContinuationLabel(progress: DiceContinuationProgress): string {
    return withElapsed(continuationLabels[progress.stage], progress.elapsedSeconds);
}
