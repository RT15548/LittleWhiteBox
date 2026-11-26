import { messageImages } from '../../shared/image-tools.js';
import { createImageResultGallery } from './image-results.js';
import { deliveredText } from '../../plugins/delivery/history.js';
import { isTimelineCompaction } from '../state/compaction-history.js';
import { compactionRow } from './compaction-row.js';
import { buildMarkdownFragment } from '../../../agent-core/ui/message-markdown.js';
import { createToolActivityProjection } from './tool-activity.js';
import { createToolProcess } from './tool-process.js';
import { createMessageActions, MESSAGE_ACTION_COPY } from './message-actions.js';
import { getMessageActions } from '../state/message-actions.js';
import { expandMessageWindow, getMessageWindow } from '../../../agent-core/ui/message-windowing.js';

function isAssistantToolCallMessageForWindow(message) {
    return message?.role === 'assistant'
        && Array.isArray(message.toolCalls)
        && message.toolCalls.length > 0;
}

export function collectAssistantMessageWindowUnits(messages = []) {
    const source = Array.isArray(messages) ? messages : [];
    const units = [];
    for (let index = 0; index < source.length;) {
        const message = source[index];
        const startIndex = index;
        let nextIndex = index + 1;
        while (nextIndex < source.length && source[nextIndex]?.role !== 'user') {
            nextIndex += 1;
        }
        units.push({
            type: message?.role === 'user' ? 'turn' : 'orphan',
            startIndex,
            endIndex: nextIndex,
            hiddenCount: nextIndex - startIndex,
        });
        index = nextIndex;
    }
    return units;
}

export function getAssistantMessageWindow(state = {}) {
    const units = collectAssistantMessageWindowUnits(state.messages || []);
    const window = getMessageWindow(state, units.length);
    return {
        ...window,
        units,
        visibleUnits: units.slice(window.startIndex),
    };
}

export function getAssistantVisibleMessageRange(state = {}) {
    const messageWindow = getAssistantMessageWindow(state);
    return {
        ...messageWindow,
        visibleStartIndex: messageWindow.visibleUnits[0]?.startIndex ?? 0,
        visibleEndIndex: messageWindow.visibleUnits.at(-1)?.endIndex ?? (state.messages || []).length,
    };
}

export function createChatUi(deps) {
    const {
        state,
        getToolActivity,
        getToolActions,
        normalizeThoughtBlocks,
        normalizeAttachments,
        renderAttachmentGallery,
        isImageInputEnabled = () => true,
        onLocalPathClick,
    } = deps;

    let chatScrollTicking = false;
    let bottomFollowPending = false;
    let chatScrollHideTimer = null;
    let renderCache = {
        kind: '',
        units: [],
    };
    const projectTools = createToolActivityProjection(getToolActivity, getToolActions);
    const processViews = new WeakMap();
    const appendMessageActions = createMessageActions(state);

    async function copyText(text) {
        const normalized = String(text || '');
        if (!normalized) return false;

        try {
            const textarea = document.createElement('textarea');
            try {
                textarea.value = normalized;
                textarea.setAttribute('readonly', 'readonly');
                textarea.style.position = 'fixed';
                textarea.style.left = '0';
                textarea.style.top = '0';
                textarea.style.width = '2em';
                textarea.style.height = '2em';
                textarea.style.padding = '0';
                textarea.style.border = '0';
                textarea.style.outline = '0';
                textarea.style.boxShadow = 'none';
                textarea.style.background = 'transparent';
                textarea.style.opacity = '0';
                textarea.style.pointerEvents = 'none';
                textarea.style.fontSize = '16px';
                document.body.appendChild(textarea);
                try {
                    textarea.focus({ preventScroll: true });
                } catch {
                    textarea.focus();
                }
                textarea.select();
                textarea.setSelectionRange(0, textarea.value.length);
                const copied = document.execCommand('copy');
                if (copied) return true;
            } finally {
                textarea.remove();
            }
        } catch (caughtError) {
            console.debug({ source: import.meta.url, operation: "copyText" }, caughtError);
        }

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(normalized);
                return true;
            }
        } catch (caughtError) {
            console.warn({ source: import.meta.url, operation: "copyText" }, caughtError);
        }
        return false;
    }

    function buildTextSignature(text) {
        const value = String(text || '');
        let hash = 2166136261;
        for (let index = 0; index < value.length; index += 1) {
            hash ^= value.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return `${value.length}:${(hash >>> 0).toString(36)}`;
    }

    function getRenderableMessageSignature(message, messageIndex = -1) {
        const feedbackKeyPrefix = Number.isInteger(messageIndex) && messageIndex >= 0
            ? `:${messageIndex}`
            : '';
        const actionFeedback = feedbackKeyPrefix
            ? Object.fromEntries(
                Object.entries(state.messageActionFeedback || {})
                    .filter(([key]) => key.endsWith(feedbackKeyPrefix)),
            )
            : {};
        return JSON.stringify({
            role: message.role,
            content: buildTextSignature(message.content),
            thoughts: normalizeThoughtBlocks(message.thoughts).map((item) => ({
                label: item.label,
                text: buildTextSignature(item.text),
            })),
            attachments: normalizeAttachments(message.attachments).map((attachment) => ({
                kind: attachment.kind,
                name: attachment.name,
                type: attachment.type,
                size: attachment.size,
            })),
            imageInput: message.attachments?.length ? isImageInputEnabled() : undefined,
            streaming: Boolean(message.streaming),
            ui: Number.isInteger(messageIndex) && messageIndex >= 0
                ? {
                    editing: state.editingMessageIndex === messageIndex,
                    actions: getMessageActions(state.messages, messageIndex),
                    actionFeedback,
                }
                : undefined,
        });
    }

    function buildThoughtDetails(message) {
        if (message.role !== 'assistant' || !Array.isArray(message.thoughts) || !message.thoughts.length) {
            return null;
        }

        const details = document.createElement('details');
        details.className = 'xb-assistant-thought-details';
        if (message.streaming) {
            details.open = true;
        }
        const summaryEl = document.createElement('summary');
        summaryEl.textContent = message.thoughts.length > 1
            ? `${message.streaming ? '正在思考' : '展开思考块'}（${message.thoughts.length} 段）`
            : (message.streaming ? '正在思考' : '展开思考块');
        details.appendChild(summaryEl);

        message.thoughts.forEach((item) => {
            const block = document.createElement('div');
            block.className = 'xb-assistant-thought-block';

            const label = document.createElement('div');
            label.className = 'xb-assistant-thought-label';
            label.textContent = item.label;

            const pre = document.createElement('pre');
            pre.className = 'xb-assistant-content xb-assistant-thought-content';
            pre.textContent = item.text;

            block.append(label, pre);
            details.appendChild(block);
        });

        return details;
    }

    function buildApprovalPanel(approvalRequest) {
        if (!approvalRequest || !approvalRequest.kind) {
            return null;
        }

        const formatJsApiRequestKind = (value) => {
            if (value === 'inspect') return '探索只读';
            if (value === 'read') return '精确只读';
            if (value === 'effect') return '执行操作';
            return '未知';
        };

        const panel = document.createElement('div');
        panel.className = 'xb-assistant-approval';
        panel.setAttribute('role', 'alertdialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-labelledby', 'xb-assistant-approval-title');

        const title = document.createElement('div');
        title.id = 'xb-assistant-approval-title';
        title.className = 'xb-assistant-approval-title';
        title.textContent = approvalRequest.kind === 'generate-skill'
            ? '待确认的技能沉淀'
            : approvalRequest.kind === 'jsapi-run'
                ? '待确认的 JS API 执行'
                : '待确认的斜杠命令';

        const command = document.createElement('pre');
        command.className = 'xb-assistant-content xb-assistant-approval-command';
        if (approvalRequest.kind === 'generate-skill') {
            command.textContent = [
                approvalRequest.title ? `标题：${approvalRequest.title}` : '',
                approvalRequest.reason ? `原因：${approvalRequest.reason}` : '',
                approvalRequest.sourceSummary ? `过程摘要：${approvalRequest.sourceSummary}` : '',
            ].filter(Boolean).join('\n\n');
        } else if (approvalRequest.kind === 'jsapi-run') {
            const semanticEntries = approvalRequest.calledApiSemantics && typeof approvalRequest.calledApiSemantics === 'object'
                ? Object.entries(approvalRequest.calledApiSemantics)
                    .map(([apiPath, semantic]) => `${apiPath}(${semantic})`)
                    .filter(Boolean)
                : [];
            command.textContent = [
                `请求性质：${formatJsApiRequestKind(approvalRequest.requestKind)}`,
                approvalRequest.purpose ? `目的：${approvalRequest.purpose}` : '',
                Array.isArray(approvalRequest.apiPaths) && approvalRequest.apiPaths.length ? `使用 API：${approvalRequest.apiPaths.join(', ')}` : '',
                Array.isArray(approvalRequest.calledApis) && approvalRequest.calledApis.length ? `实际调用：${approvalRequest.calledApis.join(', ')}` : '',
                semanticEntries.length ? `判定依据：${semanticEntries.join(', ')}` : '',
                approvalRequest.safety ? `安全说明：${approvalRequest.safety}` : '',
                approvalRequest.expectedOutput ? `预期输出：${approvalRequest.expectedOutput}` : '',
                approvalRequest.code ? `代码：\n${approvalRequest.code}` : '',
            ].filter(Boolean).join('\n\n');
        } else {
            command.textContent = approvalRequest.command || '';
        }

        const note = document.createElement('div');
        note.className = 'xb-assistant-approval-note';
        note.textContent = approvalRequest.kind === 'generate-skill'
            ? (approvalRequest.status === 'approved'
                ? '已同意，接下来会生成 skill 草稿并继续保存流程。'
                : approvalRequest.status === 'declined'
                    ? '已拒绝，本次不会生成 skill。'
                    : approvalRequest.status === 'cancelled'
                        ? '本轮请求已终止，这次 skill 沉淀未继续。'
                        : '这会把刚完成的过程沉淀成可复用 skill；点“是”后才会进入生成。')
            : approvalRequest.kind === 'jsapi-run'
                ? (approvalRequest.status === 'approved'
                    ? '已同意，JS API 请求已进入执行流程。'
                    : approvalRequest.status === 'declined'
                        ? '已拒绝，本次不会执行这段 JS API 代码。'
                        : approvalRequest.status === 'cancelled'
                            ? '本轮请求已终止，这段 JS API 代码未执行。'
                            : approvalRequest.requestKind === 'unknown'
                                ? '这次请求的性质未能明确判断，按执行操作请求处理；点“是”后才会执行。'
                                : '这是执行操作 JS API 请求；点“是”后才会真正执行。')
                : (approvalRequest.status === 'approved'
                    ? '已同意，命令已进入执行流程。'
                    : approvalRequest.status === 'declined'
                        ? '已拒绝，本次不会执行这条命令。'
                        : approvalRequest.status === 'cancelled'
                            ? '本轮请求已终止，这条命令未执行。'
                            : '当前权限模式要求先确认；点“是”后才会真正执行这条斜杠命令。');

        panel.append(title, command, note);

        if (approvalRequest.status === 'pending') {
            const actions = document.createElement('div');
            actions.className = 'xb-assistant-approval-actions';

            const approveButton = document.createElement('button');
            approveButton.type = 'button';
            approveButton.className = 'xb-assistant-approval-button';
            approveButton.dataset.approvalId = approvalRequest.id;
            approveButton.dataset.approvalDecision = 'approve';
            approveButton.textContent = approvalRequest.kind === 'generate-skill'
                ? '是，生成'
                : '是，执行';

            const declineButton = document.createElement('button');
            declineButton.type = 'button';
            declineButton.className = 'xb-assistant-approval-button secondary';
            declineButton.dataset.approvalId = approvalRequest.id;
            declineButton.dataset.approvalDecision = 'decline';
            declineButton.textContent = '否，跳过';

            actions.append(approveButton, declineButton);
            panel.appendChild(actions);
        }

        return panel;
    }

    function buildMessageBubble(message, messageIndex = -1) {
        const bubble = document.createElement('div');
        bubble.className = `xb-assistant-bubble role-${message.role}`;
        if (Number.isInteger(messageIndex) && messageIndex >= 0) {
            bubble.dataset.messageIndex = String(messageIndex);
        }
        const assistantContentText = String(message.content || '').trim();
        const canShowActions = getMessageActions(state.messages, messageIndex).length > 0;
        const isEditing = canShowActions && state.editingMessageIndex === messageIndex;
        bubble.classList.toggle('is-editing', isEditing);

        const metaRow = document.createElement('div');
        metaRow.className = 'xb-assistant-meta-row';

        const meta = document.createElement('div');
        meta.className = 'xb-assistant-meta';
        meta.textContent = message.role === 'user'
            ? '你'
            : `小白助手${message.streaming ? ' · 正在生成' : ''}${Array.isArray(message.thoughts) && message.thoughts.length ? ` · 含 ${message.thoughts.length} 段思考` : ''}`;
        metaRow.appendChild(meta);

        bubble.appendChild(metaRow);

        const content = document.createElement('div');
        content.className = 'xb-assistant-content xb-assistant-markdown';
        const fallbackContent = message.role === 'assistant'
            ? (message.streaming ? '思考中…' : '我先查一下相关代码。')
            : '';
        const bodyText = assistantContentText || String(fallbackContent || '').trim();
        const thoughtDetails = buildThoughtDetails(message);

        if (isEditing) {
            const editorWrap = document.createElement('div');
            editorWrap.className = 'xb-assistant-message-editor-wrap';
            const textarea = document.createElement('textarea');
            textarea.className = 'xb-assistant-message-editor';
            textarea.value = assistantContentText;
            textarea.setAttribute('aria-label', MESSAGE_ACTION_COPY.editor);
            editorWrap.appendChild(textarea);
            bubble.appendChild(editorWrap);
        } else if (bodyText) {
            if (thoughtDetails) {
                bubble.appendChild(thoughtDetails);
            }
            content.appendChild(buildMarkdownFragment(bodyText, {
                onPathClick: onLocalPathClick,
                codeBlockClassName: 'xb-assistant-codeblock',
                codeCopyClassName: 'xb-assistant-code-copy',
                linkClassName: 'xb-assistant-local-path-link',
            }));
            bubble.appendChild(content);
        } else if (thoughtDetails) {
            bubble.appendChild(thoughtDetails);
        }

        if (Array.isArray(message.attachments) && message.attachments.length) {
            const gallery = document.createElement('div');
            gallery.className = 'xb-assistant-attachment-gallery';
            renderAttachmentGallery(gallery, message.attachments, { compact: true });
            bubble.appendChild(gallery);
        }

        if (canShowActions) {
            appendMessageActions(bubble, message, messageIndex, isEditing);
        }

        return bubble;
    }

    function createMessageRenderUnit(message, messageIndex, deliveryBody) {
        const display = deliveryBody === undefined ? message : { ...message, role: 'assistant', content: deliveryBody };
        const signature = JSON.stringify({
            type: 'message',
            messageIndex,
            message: getRenderableMessageSignature(display, messageIndex),
        });
        return {
            key: message,
            signature,
            build: () => {
                const node = buildMessageBubble(display, messageIndex);
                node.dataset.renderSignature = signature;
                return node;
            },
        };
    }

    function createProcessUnit(messages, running) {
        const key = messages[0];
        let view = processViews.get(key);
        if (!view) {
            view = createToolProcess({
                project: projectTools,
                renderText: text => buildMarkdownFragment(text, {
                    onPathClick: onLocalPathClick,
                    codeBlockClassName: 'xb-assistant-codeblock',
                    codeCopyClassName: 'xb-assistant-code-copy',
                    linkClassName: 'xb-assistant-local-path-link',
                }),
            });
            processViews.set(key, view);
        }
        return { key: view, build: () => view.node, update: () => view.update(messages, running) };
    }

    function createImageResultUnit(message, images) {
        const current = new Map((state.localSources || []).flatMap(source => source.files || []).filter(file => file.kind === 'image').map(file => [file.blobId, file]));
        images = images.map(file => current.has(file.blobId) ? { ...file, ...current.get(file.blobId) } : { ...file, unavailable: true });
        const unit = { key: message, signature: JSON.stringify(images), build: () => {
            const view = createImageResultGallery(images, { open: onLocalPathClick });
            unit.dispose = view.dispose;
            return view.node;
        } };
        return unit;
    }

    function collectMessageUnits(startIndex, endIndex) {
        const units = [];
        for (let start = startIndex; start < endIndex;) {
            let end = start + 1;
            while (end < endIndex && state.messages[end].role !== 'user') end++;
            let firstTool = -1, lastTool = -1;
            for (let index = start; index < end; index++) {
                if (isAssistantToolCallMessageForWindow(state.messages[index])) {
                    if (firstTool < 0) firstTool = index;
                    lastTool = index;
                }
            }
            let processEnd = lastTool + 1;
            while (processEnd < end && state.messages[processEnd].role === 'tool') processEnd++;
            for (let index = start; index < end; index++) {
                if (index === firstTool) {
                    units.push(createProcessUnit(state.messages.slice(firstTool, processEnd),
                        !!state.isBusy && end === state.messages.length));
                }
                const message = state.messages[index];
                const images = messageImages(message);
                if (images.length) units.push(createImageResultUnit(message, images));
                const body = deliveredText(state.messages, index);
                if (body !== undefined) {
                    units.push(createMessageRenderUnit(message, index, body));
                } else if ((index < firstTool || index >= processEnd) && message.role !== 'tool' && !message.approvalRequest) {
                    units.push(createMessageRenderUnit(message, index));
                }
            }
            start = end;
        }
        return units;
    }

    function collectRenderUnits(start, end) {
        const records = state.compactions || [];
        if (!records.length && !state.compactionPending) return collectMessageUnits(start, end);
        const units = [];
        let epoch = start ? state.messages[start - 1].compactionEpoch || 0 : 0;
        const emitUntil = limit => {
            while (epoch < limit) {
                const record = records[epoch];
                // Imported old summaries have no recorded event to display.
                if (isTimelineCompaction(record)) units.push(compactionRow(epoch, record));
                epoch++;
            }
        };
        for (let i = start; i < end;) {
            const position = state.messages[i].compactionEpoch || 0;
            emitUntil(position);
            let next = i + 1;
            while (next < end && (state.messages[next].compactionEpoch || 0) === position) next++;
            units.push(...collectMessageUnits(i, next));
            i = next;
        }
        emitUntil(records.length);
        if (state.compactionPending) units.push(compactionRow(records.length, null));
        return units;
    }

    function createHistoryGateRenderUnit(hiddenBefore = 0) {
        const signature = `history-gate:${hiddenBefore}`;
        return {
            key: 'history-gate',
            signature,
            build: () => {
                const gate = document.createElement('button');
                gate.type = 'button';
                gate.className = 'xb-assistant-history-gate';
                gate.dataset.renderSignature = signature;
                gate.textContent = `较早记录 ${hiddenBefore} 轮`;
                gate.addEventListener('click', () => {
                    state.autoScroll = false;
                    revealOlderMessages(gate.parentElement);
                });
                return gate;
            },
        };
    }

    function applyRenderUnits(container, previousUnits, unitSpecs) {
        const previous = new Map(previousUnits.map(unit => [unit.key, unit]));
        const nextUnits = unitSpecs.map((unit, index) => {
            const retained = previous.get(unit.key);
            const reuse = retained?.node.parentNode === container
                && (unit.update || retained.signature === unit.signature);
            const node = reuse ? retained.node : unit.build();
            unit.update?.();
            if (container.children[index] !== node) container.insertBefore(node, container.children[index] || null);
            return { key: unit.key, signature: unit.signature, node, dispose: reuse ? retained.dispose : unit.dispose };
        });
        const nodes = new Set(nextUnits.map(unit => unit.node));
        for (const old of previousUnits) if (!nodes.has(old.node)) old.dispose?.();
        for (const child of Array.from(container.children)) if (!nodes.has(child)) child.remove();
        return nextUnits;
    }

    function renderMessages(container) {
        if (!container) return;
        container.classList.toggle('is-busy', !!state.isBusy);
        if (!state.messages.length && !state.compactions?.some(isTimelineCompaction)) {
            if (renderCache.kind === 'empty') return;
            for (const unit of renderCache.units || []) unit.dispose?.();
            container.replaceChildren();
            const empty = document.createElement('div');
            empty.className = 'xb-assistant-empty';
            empty.innerHTML = '<h2>你好！我是小白助手</h2><p>我是 SillyTavern 中 LittleWhiteBox（小白X）插件的内置技术支持助手。</p><p>我可以帮你做很多事情，比如：</p><ul><li><strong>解答问题与排查报错</strong>：解答关于 SillyTavern 或小白X插件的代码、设置、模块行为等问题，帮你排查报错。</li><li><strong>编写与创作辅助</strong>：辅助你写角色卡、写插件、写 STscript 脚本、整理设定或构思剧情。</li><li><strong>查询实例状态</strong>：我可以执行斜杠命令，帮你查询当前酒馆的 API、模型、角色状态等实时信息。</li><li><strong>查阅文档与源码</strong>：我可以读取酒馆和插件的前端源码及参考文档，为你提供准确的技术支持。</li></ul><p>另外，如果你希望我以特定的性格、语气和你交流，或者有特定的工作习惯要求，你可以随时告诉我，我可以将这些设定保存到我的专属身份设定文件中跨会话记住。</p><p>今天有什么我可以帮你的吗？</p>';
            container.appendChild(empty);
            renderCache = {
                kind: 'empty',
                units: [],
            };
            return;
        }

        const messageWindow = getAssistantVisibleMessageRange(state);
        const visibleUnitSpecs = collectRenderUnits(messageWindow.visibleStartIndex, messageWindow.visibleEndIndex);
        const unitSpecs = messageWindow.hiddenBefore
            ? [
                createHistoryGateRenderUnit(messageWindow.hiddenBefore),
                ...visibleUnitSpecs,
            ]
            : visibleUnitSpecs;
        const previousUnits = renderCache.kind === 'messages' ? renderCache.units : [];
        const canReuseAll = previousUnits.length === unitSpecs.length
            && unitSpecs.every((unit, index) => !unit.update && previousUnits[index]?.key === unit.key
                && previousUnits[index]?.signature === unit.signature);
        if (canReuseAll) {
            return;
        }

        const previousScrollTop = container.scrollTop;
        const nextUnits = applyRenderUnits(container, previousUnits, unitSpecs);
        renderCache = {
            kind: 'messages',
            units: nextUnits,
        };

        if (!state.autoScroll) container.scrollTop = previousScrollTop;
    }

    function revealOlderMessages(container) {
        if (!container) return false;
        if (container.scrollTop > 64) return false;
        const messageWindow = getAssistantMessageWindow(state);
        if (!expandMessageWindow(state, messageWindow.total)) return false;

        const previousScrollHeight = container.scrollHeight;
        const previousScrollTop = container.scrollTop;
        renderMessages(container);
        container.scrollTop = Math.max(0, container.scrollHeight - previousScrollHeight + previousScrollTop);
        return true;
    }

    function renderApprovalPanel(container) {
        if (!container) return;
        container.innerHTML = '';
        const nextApproval = buildApprovalPanel(state.pendingApproval);
        if (nextApproval) {
            container.appendChild(nextApproval);
        }
    }

    function trackChatScroll(container) {
        if (!container) return;
        // A short conversation can be at the bottom and inside the history-loading band.
        state.autoScroll = container.scrollHeight - container.scrollTop - container.clientHeight <= 48;
        if (!state.autoScroll) revealOlderMessages(container);
    }

    function followChatToBottom(container) {
        if (!container || !state.autoScroll || bottomFollowPending) return;
        bottomFollowPending = true;
        // Finish the synchronous render (including the composer) before browser scroll events.
        queueMicrotask(() => {
            bottomFollowPending = false;
            if (state.autoScroll && container.isConnected) container.scrollTop = container.scrollHeight;
        });
    }

    function scrollChatToTop(container) {
        if (!container) return;
        container.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateChatScrollButtonsVisibility(root) {
        const chat = root.querySelector('#xb-assistant-chat');
        const topButton = root.querySelector('#xb-assistant-scroll-top');
        const bottomButton = root.querySelector('#xb-assistant-scroll-bottom');
        if (!chat || !topButton || !bottomButton) return;

        const scrollTop = chat.scrollTop;
        const scrollHeight = chat.scrollHeight;
        const clientHeight = chat.clientHeight;
        const threshold = 80;

        topButton.classList.toggle('visible', scrollTop > threshold);
        bottomButton.classList.toggle('visible', scrollHeight - scrollTop - clientHeight > threshold);
    }

    function showChatScrollHelpers(root) {
        root.querySelector('#xb-assistant-scroll-helpers')?.classList.add('active');
    }

    function hideChatScrollHelpers(root) {
        root.querySelector('#xb-assistant-scroll-helpers')?.classList.remove('active');
    }

    function scheduleHideChatScrollHelpers(root) {
        if (chatScrollHideTimer) {
            clearTimeout(chatScrollHideTimer);
        }
        chatScrollHideTimer = setTimeout(() => {
            hideChatScrollHelpers(root);
            chatScrollHideTimer = null;
        }, 1500);
    }

    function handleAssistantChatScroll(root) {
        if (chatScrollTicking) return;
        chatScrollTicking = true;
        requestAnimationFrame(() => {
            updateChatScrollButtonsVisibility(root);
            showChatScrollHelpers(root);
            scheduleHideChatScrollHelpers(root);
            chatScrollTicking = false;
        });
    }

    return {
        renderMessages,
        renderApprovalPanel,
        followChatToBottom,
        trackChatScroll,
        scrollChatToTop,
        updateChatScrollButtonsVisibility,
        handleAssistantChatScroll,
        copyText,
    };
}
