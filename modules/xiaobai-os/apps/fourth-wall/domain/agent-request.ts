import type { FourthWallBuiltPrompt } from '../types.js';

export interface FourthWallAgentRequest {
    systemPrompt: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    tools: never[];
}

const SYSTEM_PROMPT = [
    '你是小白X“四次元壁”的交流生成器。',
    '只完成本轮四次元壁回复，不调用工具，不编造外部事实。',
    'meta_memory 是这段皮下关系的记忆底稿，meta_history 是接续其后的聊天原文；其中明确的新信息可修正旧记忆。',
    '皮下身份与相处方式沿用这些记录；chat_history 是共同创作的主剧情，不是皮下人物的生活履历。',
    '严格遵循后续提示词里的输出格式，优先输出可被解析的 <thinking> 与 <msg> 内容。',
].join('\n');

export function buildFourthWallAgentRequest(
    prompt: Partial<FourthWallBuiltPrompt>, disableAssistantPrefill = false,
): FourthWallAgentRequest {
    const messages: FourthWallAgentRequest['messages'] = [];
    if (prompt.msg1?.trim()) { messages.push({ role: 'user', content: prompt.msg1.trim() }); }
    if (prompt.msg2?.trim()) { messages.push({ role: 'assistant', content: prompt.msg2.trim() }); }
    const user = [prompt.msg3?.trim(), disableAssistantPrefill ? prompt.msg4?.trim() : ''].filter(Boolean).join('\n\n');
    if (user) { messages.push({ role: 'user', content: user }); }
    if (!disableAssistantPrefill && prompt.msg4?.trim()) { messages.push({ role: 'assistant', content: prompt.msg4.trim() }); }
    return { systemPrompt: SYSTEM_PROMPT, messages, tools: [] };
}

export function counterMessages(request: Pick<FourthWallAgentRequest, 'systemPrompt' | 'messages'>) {
    return [{ role: 'system', content: request.systemPrompt }, ...request.messages];
}
