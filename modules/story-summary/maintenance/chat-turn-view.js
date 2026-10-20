import { element, disclosure } from './ui-elements.js';
import { reportMarkdown } from './report-markdown.js';
import { MEMORY_CHAT_COPY as copy, memoryChatErrorText } from './chat-copy.js';

const detailText = value => typeof value === 'string' ? value : value == null ? '' : JSON.stringify(value, null, 2);

/** Keep disclosure nodes mounted while streamed text and tool results change. */
export function createMemoryChatTurn(turn) {
    const root = element('article', 'memory-chat-turn');
    root.dataset.turnId = turn.id;
    const question = element('div', 'memory-chat-question');
    const questionLabel = element('small', 'memory-chat-speaker', copy.user);
    const questionText = element('p');
    question.append(questionLabel, questionText);
    const reply = element('div', 'memory-chat-reply');
    const replyLabel = element('small', 'memory-chat-speaker', copy.assistant);
    const answer = element('div', 'memory-chat-answer memory-outcome');
    const previous = disclosure(copy.previousAnswer, 'memory-chat-previous');
    const previousContent = element('div', 'memory-chat-answer memory-outcome');
    previous.append(previousContent);
    const progress = element('p', 'memory-chat-turn-status');
    progress.setAttribute('role', 'status');
    const saved = element('p', 'memory-chat-saved');
    const error = element('div', 'memory-chat-turn-error');
    error.setAttribute('role', 'alert');
    const process = disclosure('', 'memory-chat-process');
    const toolList = element('ol', 'memory-chat-tools');
    process.append(toolList);
    reply.append(replyLabel, previous, progress, process, answer, saved, error);
    root.append(question, reply);
    const toolNodes = [];
    let previousAnswer, previousVersion;

    function toolNode() {
        const node = element('li');
        const heading = element('p', 'memory-chat-tool-heading');
        const name = element('span');
        const state = element('small');
        heading.append(name, state);
        const failure = element('p', 'memory-chat-tool-error');
        const details = disclosure(copy.toolDetails, 'memory-chat-tool-details');
        const request = element('pre');
        const response = element('pre');
        details.append(element('h5', '', copy.toolArguments), request, element('h5', '', copy.toolResponse), response);
        node.append(heading, failure, details);
        return { node, name, state, failure, request, response };
    }

    function update(next) {
        root.dataset.status = next.status;
        questionText.textContent = next.question || '';
        const busy = ['running', 'queued'].includes(next.status);
        progress.textContent = next.status === 'running' ? copy.phases[next.phase] || copy.statuses.running : copy.statuses[next.status] || '';
        progress.hidden = next.status === 'completed';
        reply.setAttribute('aria-busy', String(busy));
        const text = next.answer || '';
        if (text !== previousAnswer) {
            previousAnswer = text;
            answer.replaceChildren(reportMarkdown(text));
        }
        answer.hidden = !text;
        const oldText = next.previousAnswer || '';
        if (oldText !== previousVersion) {
            previousVersion = oldText;
            previousContent.replaceChildren(reportMarkdown(oldText));
        }
        previous.hidden = !oldText;
        saved.textContent = next.saved > 0 ? copy.saved(next.saved) : '';
        saved.hidden = !(next.saved > 0);
        error.textContent = memoryChatErrorText(next.error);
        error.hidden = !error.textContent;
        const tools = next.tools || [];
        process.hidden = !tools.length;
        process.firstElementChild.textContent = copy.tools(tools.length);
        for (let index = 0; index < tools.length; index++) {
            const tool = tools[index];
            if (!toolNodes[index]) {
                toolNodes[index] = toolNode();
                toolList.append(toolNodes[index].node);
            }
            const item = toolNodes[index];
            item.node.dataset.status = tool.status || '';
            item.name.textContent = copy.toolNames[tool.name] || tool.name;
            item.state.textContent = copy.toolStatuses[tool.status] || tool.status || '';
            item.request.textContent = detailText(tool.arguments);
            item.response.textContent = detailText(tool.response);
            const failures = tool.response?.rejected || (tool.response?.error ? [tool.response.error]
                : ['error', 'needs_fix', 'unconfirmed', 'not_executed'].includes(tool.status) ? [tool.response] : []);
            item.failure.textContent = failures.map(memoryChatErrorText).filter(Boolean).join('\n');
            item.failure.hidden = !item.failure.textContent;
        }
        while (toolNodes.length > tools.length) toolNodes.pop().node.remove();
    }
    update(turn);
    return { element: root, update };
}
