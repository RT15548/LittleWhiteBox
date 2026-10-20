import { element, disclosure } from './ui-elements.js';
import { reportMarkdown } from './report-markdown.js';
import { MEMORY_CHAT_COPY as copy, memoryChatErrorText } from './chat-copy.js';

/** Only the changed turn is updated; streamed text is not reparsed as markdown. */
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
    const toolHint = element('small', 'memory-chat-tools-hint');
    process.append(toolList, toolHint);
    reply.append(replyLabel, previous, progress, process, answer, saved, error);
    root.append(question, reply);
    const toolNodes = [];
    let previousAnswer, previousVersion, previousText = '', streaming = false, revision;

    function showPrevious() {
        if (previous.open && previousText !== previousVersion) {
            previousVersion = previousText;
            previousContent.replaceChildren(reportMarkdown(previousText));
        }
    }
    previous.addEventListener('toggle', showPrevious);

    function toolNode() {
        const node = element('li');
        const heading = element('p', 'memory-chat-tool-heading');
        const name = element('span');
        const state = element('small');
        heading.append(name, state);
        node.append(heading);
        return { node, name, state };
    }

    function update(next) {
        if (next.revision !== undefined && next.revision === revision) return;
        revision = next.revision;
        root.dataset.status = next.status;
        questionText.textContent = next.question || '';
        const busy = ['running', 'queued'].includes(next.status);
        progress.textContent = next.status === 'running' ? copy.phases[next.phase] || copy.statuses.running : copy.statuses[next.status] || '';
        progress.hidden = next.status === 'completed';
        reply.setAttribute('aria-busy', String(busy));
        const text = next.answer || '';
        if (text !== previousAnswer || streaming !== busy) {
            if (busy) {
                if (!streaming || !answer.firstChild) answer.replaceChildren(document.createTextNode(text));
                else if (text.startsWith(previousAnswer)) answer.firstChild.appendData(text.slice(previousAnswer.length));
                else answer.firstChild.data = text;
            } else answer.replaceChildren(reportMarkdown(text));
            previousAnswer = text;
            streaming = busy;
            answer.classList.toggle('is-streaming', busy);
        }
        answer.hidden = !text;
        previousText = next.previousAnswer || '';
        previous.hidden = !previousText;
        showPrevious();
        saved.dataset.saved = String(next.saved || 0);
        saved.dataset.staged = String(next.staged || 0);
        saved.textContent = [next.saved > 0 ? copy.saved(next.saved) : '', next.staged > 0 ? copy.staged(next.staged) : ''].filter(Boolean).join(' · ');
        saved.hidden = !saved.textContent;
        error.textContent = memoryChatErrorText(next.error);
        error.hidden = !error.textContent;
        const tools = next.tools || [], count = next.toolCount ?? tools.length;
        process.hidden = !count;
        process.firstElementChild.textContent = copy.tools(count);
        toolHint.textContent = count > tools.length ? copy.toolsShown(tools.length) : '';
        toolHint.hidden = count <= tools.length;
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
        }
        while (toolNodes.length > tools.length) toolNodes.pop().node.remove();
    }
    update(turn);
    return { element: root, update };
}
