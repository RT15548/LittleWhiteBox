import { CLOTHING_COPY } from './clothing.js';
import type { ConversationPhase } from '../narrative/conversation.js';

export const DIALOGUE_COPY = Object.freeze({
    affection: '好感', context: '上下文', close: '关闭', loading: '正在读取人物资料',
    retry: '重新读取', rawReply: '查看回复原文',
    reloadArtwork: '重新加载人物画面',
    older: '查看更早消息', newer: '查看后续消息', latest: '回到最新',
    regenerate: '重新生成', retrySend: '重试发送', sendFailed: '未完成回复，原消息已保留。', continue: '继续',
    phases: {
        preparing: '准备中', summarizing: '整理记忆中', waiting: '等待响应', thinking: '思考中',
        replying: '生成回复中', saving: '保存回复中', stopping: '正在停止',
    } satisfies Record<ConversationPhase, string>,
    elapsed: (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
    issues: {
        action_rejected: '对白已保存，附带行动不成立，未执行。',
        clothing_rejected: CLOTHING_COPY.rejected,
        reply_invalid: '回复格式有误。原文已保存，未执行行动或改变好感。',
        reply_incomplete: '回复未完整生成。已收到的原文已保存，未执行行动或改变好感。',
    },
    shareSecret: '把当前阶段的秘密实际讲给玩家，记录玩家已获得这份情报。',
    follow: '答应与玩家同行时提交；关闭交谈后跟随玩家，跨场景同行，可以进入战区但不参战。', stay: '停止跟随或赶路，留在当前地点等候，玩家离开后仍留在这里。',
    go: (place: string) => `自己步行去${place}，到了在那里等玩家；不移动玩家。`,
    pass: '决定放行，不再进行这场战斗；玩家读完并关闭面板后让路。',
    attack: '决定动手，对话结束；玩家读完并迎战后开始战斗。', fight: '迎战',
    contextParts: { system: '世界与人物', situation: '当前处境', memory: '历史摘要', history: '近期交谈' },
    memoryRetry: '重试',
});
