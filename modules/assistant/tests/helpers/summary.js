import { SUMMARY_TOOLS } from '../../app-src/runtime/summary-request.js';

export function summaryResult(content) {
    return { text: '', toolCalls: [{ id: 'summary-result', name: SUMMARY_TOOLS.submit, arguments: JSON.stringify({ content }) }] };
}

export function summarySource(request) {
    const description = request.tools.find(tool => tool.function.name === SUMMARY_TOOLS.source).function.description;
    const boundary = description.indexOf('\n\n');
    return boundary < 0
        ? request.messages.find(message => message.role === 'tool' && message.toolName === SUMMARY_TOOLS.source).content
        : description.slice(boundary + 2);
}
