import { TOOL_DELIVER, TOOL_READ, TOOL_APPROVAL } from './protocol.js';

export const deliveryActivityLabels = new Map([
    [TOOL_READ, '读取本轮工作要求'],
    [TOOL_APPROVAL, '确认可以交付答复'],
    [TOOL_DELIVER, '交付最终答复'],
]);

/** Read only a completed tool result; an argument draft is not a delivered reply. */
export function deliveredText(messages, index) {
    const message = messages[index];
    if (message?.role !== 'tool' || message.toolName !== TOOL_DELIVER || message.error) return undefined;
    // IDs may be reused in later batches. Only this batch can own the receipt.
    let owner = index - 1;
    while (owner >= 0 && messages[owner].role === 'tool') owner--;
    const request = messages[owner];
    const call = request?.role === 'assistant' && request.toolCalls?.find(item => item.id === message.toolCallId && item.name === TOOL_DELIVER);
    if (!call) return undefined;
    try {
        if (JSON.parse(message.content)?.ok !== true) return undefined;
        const body = JSON.parse(call.arguments)?.body;
        return typeof body === 'string' && body.trim() ? body : undefined;
    } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        return undefined;
    }
}
