// The only source of the compact, user-visible stage names.
export const REPLY_PROGRESS_COPY = Object.freeze({
    message: '消息事件处理',
    context: '等待处理',
    waiting: '等待回复',
    interceptor: '小白x插件处理',
    recall: '小白x记忆处理',
});

export const REPLY_PROGRESS_ERRORS = Object.freeze({
    observe: '[生成状态追踪] 观察失败，已停止本次提示',
    cleanup: '[生成状态追踪] 提示清理失败',
});

const HANDLERS = Object.freeze({
    draw: '小白x绘图检查',
    xiaobai_os_shop_effects: '小白x商店处理',
    xiaobai_os_map_context: '小白x地图处理',
    xiaobai_os_tasks_context: '小白x任务处理',
    xiaobai_os_world_context: '小白x世界处理',
    xiaobai_os_dice_encounter: '小白x骰子处理',
    xiaobai_os_dice: '小白x骰子处理',
});

const RECALL_STAGES = Object.freeze({
    prepare: '小白x召回准备',
    tokenizer: '小白x分词准备',
    'source-boundary': '小白x边界读取',
    'query-build': '小白x构造查询',
    'round1-embed': '小白x查询向量',
    'round2-embed': '小白x线索向量',
    'runtime-load': '小白x检索准备',
    'round1-retrieval': '小白x向量检索',
    'round2-retrieval': '小白x向量检索',
    'lexical-search': '小白x词法检索',
    'floor-evidence': '小白x证据筛选',
    'direct-evidence': '小白x证据提取',
    diffusion: '小白x记忆扩展',
    'event-rerank': '小白x记忆精排',
    'prompt-assembly': '小白x记忆组装',
    'prompt-ready': '小白x记忆提交',
    reuse: '小白x记忆复用',
    'canonical-summary': '小白x总结组装',
});

export function interceptorLabel(id) {
    return HANDLERS[id] || REPLY_PROGRESS_COPY.interceptor;
}

export function recallLabel(stage) {
    return RECALL_STAGES[stage] || REPLY_PROGRESS_COPY.recall;
}

export function replyProgressLabel({ phase, detail }) {
    if (phase === 'interceptor') return interceptorLabel(detail);
    if (phase === 'recall') return recallLabel(detail);
    return REPLY_PROGRESS_COPY[phase];
}

export function formatReplyProgress(label, elapsedMs) {
    const seconds = Math.floor(Math.max(0, elapsedMs) / 1000);
    const duration = seconds < 1000 ? `${seconds}秒`
        : seconds < 360000 ? `${Math.floor(seconds / 60)}分`
            : `${Math.min(999, Math.floor(seconds / 3600))}时`;
    return `${label}·${duration}`;
}
