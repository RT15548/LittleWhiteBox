/** Failed prose remains visible, but is not a completed answer for history retention. */
export function settleAssistantRunFailure({ messages, notice, pushMessage, persistSession }) {
    const start = messages.findLastIndex(message => message.role === 'user');
    for (let index = start + 1; index < messages.length; index++) {
        const message = messages[index];
        if (message.role !== 'assistant' || message.toolCalls?.length) continue;
        message.error = true;
        message.streaming = false;
    }
    if (notice) pushMessage({ role: 'assistant', content: notice, error: true });
    else persistSession();
}
