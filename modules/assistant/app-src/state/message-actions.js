function isAssistantTextMessage(message) {
    return message?.role === 'assistant'
        && !message.approvalRequest
        && !message.streaming
        && !message.toolCalls?.length
        && !!String(message.content || '').trim();
}

export function getMessageActions(messages, messageIndex) {
    const message = messages[messageIndex];
    if (!message || message.approvalRequest || message.streaming) return [];
    const lastUserIndex = messages.findLastIndex(item => item.role === 'user' && !item.approvalRequest);
    if (message.role === 'user') {
        return messageIndex === lastUserIndex ? ['copy', 'edit', 'reroll', 'delete'] : [];
    }
    if (!isAssistantTextMessage(message)) return [];
    const lastReplyIndex = messages.findLastIndex(isAssistantTextMessage);
    return messageIndex === lastReplyIndex && messageIndex > lastUserIndex
        ? ['copy', 'edit', 'reroll', 'delete']
        : ['copy', 'edit'];
}

export function getRerollUserIndex(messages, messageIndex) {
    for (let index = messageIndex; index >= 0; index--) {
        if (messages[index]?.role === 'user' && !messages[index].approvalRequest) return index;
    }
    return -1;
}
