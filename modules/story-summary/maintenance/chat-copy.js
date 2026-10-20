import { MEMORY_COPY } from './copy.js';

export const MEMORY_CHAT_COPY = Object.freeze({
    entry: '与助手聊天', title: '总结助手', currentChat: '当前聊天', close: '关闭对话',
    user: '你', assistant: '助手', previousAnswer: '上一版回复', input: '和总结助手说些什么…', send: '发送', stop: '停止当前回复',
    regenerate: '重答上一条请求', regenerateHint: '基于当前状态重新处理，不回滚已保存的修改。',
    clear: '清空对话', clearTitle: '清空与助手的对话？', clearRunningTitle: '停止并清空对话？',
    clearDetail: '仅清空人工对话和输入，已保存的记忆修改、维护记录不受影响。',
    clearRunningDetail: '当前人工任务会停止；已经保存的修改保留。', clearRunning: '停止并清空', cancel: '取消',
    empty: '可以直接问我，也可以让我处理记忆。',
    emptyHint: '例如：为什么维护停住了？继续处理未完成的部分。',
    lifetime: '关闭窗口不丢对话；切换或重新加载聊天后清空。已保存的记忆修改不受影响。',
    loading: '正在读取当前状态…', unavailable: '当前聊天尚未就绪。', latest: '回到最新 ↓',
    busy: '助手正在处理上一条消息，请等待完成或先停止。',
    queue: '等待当前自动维护结束', waiting: '等待上一轮停止', takeover: '停止自动维护，立即处理此消息',
    automatic: '自动维护正在运行', automaticQueued: '自动维护等待中',
    phases: { thinking: '正在梳理', reading: '正在查阅', editing: '正在保存修改', compacting: '正在整理上下文' },
    statuses: { queued: '等待处理', running: '正在处理', completed: '已回复', failed: '本轮未完成', cancelled: '已停止', unconfirmed: '保存结果尚未确认' },
    saved: count => `已保存 ${count} 项修改`, tools: count => `工作过程 · ${count} 次工具调用`,
    toolNames: { ReadMemory: '读取记忆', ReadSource: '读取原文', SearchSource: '搜索原文', EditMemory: '修改记忆', CompleteMaintenance: '记录维护进度', ReadMaintenance: '查询维护记录' },
    toolStatuses: { running: '进行中', pending: '等待中', completed: '完成', success: '完成', saved: '已保存', unchanged: '无需修改', failed: '失败', error: '失败', needs_fix: '需要修正', not_executed: '未执行', cancelled: '已停止', unconfirmed: '保存待确认' },
    toolArguments: '请求内容', toolResponse: '返回结果', toolDetails: '详细信息',
    errorHeading: '未完成原因', errorCode: '错误标识', errorStage: '发生阶段', errorMessage: '详细原因',
    context: '上下文用量', contextEmpty: '发送前将计算本轮输入用量。', contextEstimated: '约',
    contextSections: { rules: '规则与工具', history: '人工对话历史', material: '本轮材料与工具结果' },
    contextTrigger: tokens => `达到 ${tokens} 时自动整理上下文。`,
    contextTotal: (used, limit, estimated) => `${estimated ? '约 ' : ''}${used} / ${limit}`,
    summaryBoundary: floor => `已总结至 ${floor} 楼`, noBoundary: '当前尚无可维护的总结',
    maintained: ranges => `已维护：${ranges}`, pending: ranges => `待维护：${ranges}`, none: '无',
    floorRange: (from, to) => from === to ? `${from}` : `${from}–${to}`,
});

export function memoryChatErrorText(error) {
    if (!error) return '';
    if (typeof error === 'string') return error;
    const explanation = error.code === 'memory_chat_busy' ? MEMORY_CHAT_COPY.busy
        : error.code === 'invalid_history' ? MEMORY_COPY.states.history_invalid : MEMORY_COPY.errors[error.code];
    return [explanation, error.message !== explanation && error.message, error.stage && `${MEMORY_CHAT_COPY.errorStage}：${error.stage}`,
        error.code && `${MEMORY_CHAT_COPY.errorCode}：${error.code}`].filter(Boolean).join('\n');
}
