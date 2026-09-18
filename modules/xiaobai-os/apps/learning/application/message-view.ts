import type { AgentMessage } from '../../../../agent-core/runtime/conversation.js';
import type { LearningDialogue } from '../agent/context.js';
import type { LearningMessage } from '../agent/messages.js';
import { learningToolNames } from '../agent/session.js';

export type LearningMessageView = Pick<AgentMessage, 'role' | 'content' | 'streaming' | 'error' | 'toolCallId' | 'toolName' | 'toolCalls'> & { hasReasoning: boolean };
export type LearningDialogueView = Omit<LearningDialogue, 'messages'> & { messages: LearningMessageView[] };

const toolNames = new Set([...learningToolNames(), 'LearningSearch', 'LearningExtract', 'LearningContextRead']);
const toolName = (name: string) => toolNames.has(name) ? name : '未知工具';

/** One positive projection for every tool. Even titles, URLs, keys and errors can contain teaching text. */
function toolMetadata(value: unknown): unknown {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { return {}; }
    const source = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of ['ok', 'changed', 'omitted', 'newLesson', 'review', 'textComplete']) {
        if (typeof source[key] === 'boolean') { result[key] = source[key]; }
    }
    for (const key of ['offset', 'nextOffset', 'limit', 'total', 'maxResults', 'paragraphCount', 'materialCount', 'exerciseCount', 'attemptCount', 'itemCount', 'noteCount', 'listeningCount']) {
        if (source[key] === null || typeof source[key] === 'number' && Number.isFinite(source[key])) { result[key] = source[key]; }
    }
    for (const key of ['materials', 'exercises', 'attempts', 'items', 'evidence', 'results', 'failed', 'errors', 'ids', 'exerciseIds', 'materialIds', 'candidateIds', 'attemptIds', 'removeMaterials', 'removeExercises']) {
        if (Array.isArray(source[key])) { result[key + 'Count'] = source[key].length; }
    }
    for (const key of ['data', 'unit']) {
        if (source[key] && typeof source[key] === 'object') { result[key] = toolMetadata(source[key]); }
    }
    return result;
}

function describePayload(content: string, streaming?: boolean): string {
    if (!content) { return ''; }
    try { return JSON.stringify(toolMetadata(JSON.parse(content))); }
    catch { return streaming ? '参数生成中…' : '详细内容不在课堂展示。'; }
}

/** Raw tool and reasoning payloads never cross into the learner's iframe. */
export function learningMessageView(message: LearningMessage): LearningMessageView {
    return {
        role: message.role,
        content: message.role === 'tool' ? describePayload(message.content, message.streaming)
            : message.contentVisibility ? '' : message.content,
        streaming: message.streaming, error: message.error, hasReasoning: !!message.thoughts?.length,
        toolCallId: message.toolCallId,
        ...(message.toolName ? { toolName: toolName(message.toolName) } : {}),
        ...(message.toolCalls ? { toolCalls: message.toolCalls.map(({ id, name, arguments: args }) => ({
            id, name: toolName(name), arguments: describePayload(args, message.streaming),
        })) } : {}),
    };
}
