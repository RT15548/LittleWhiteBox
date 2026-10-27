export const PLANNER_COPY = Object.freeze({
    pending: '剧情规划仍在处理中，请稍候。',
    empty: '未生成有效的剧情规划，本次正文已停止。',
    independentApi: '剧情规划需要选择独立 API 预设，不能使用正在等待规划的酒馆连接。',
    slot: '本轮规划位置被其他提示词处理移除或复制，本次正文已停止。',
    changed: '聊天或用户消息已变化，本次剧情规划已取消。',
    noContext: '本聊天尚无实际规划上下文。发送一条消息完成上下文准备后，可在这里查看。',
    test: '请用一句话提出一个剧情发展方向。',
    preview: {
        title: '剧情规划',
        actions: { stop: '停止规划', replan: '重新规划', send: '发送', discard: '不操作' },
        status: { preparing: '正在准备规划…', ready: '正在准备规划…', planning: '正在规划…',
            preview: '剧情规划', stopped: '剧情规划', error: '剧情规划', sending: '正在发送…' },
        failed: '操作失败，请重试。',
    },
});
