import { buildMarkdownFragment, enhancePathLinks } from '../../../agent-core/ui/message-markdown.js';
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
        toolNames,
        formatToolResultDisplay,
        normalizeThoughtBlocks,
        normalizeAttachments,
        renderAttachmentGallery,
        onLocalPathClick,
    } = deps;

    let chatScrollTicking = false;
    let chatScrollHideTimer = null;
    let renderCache = {
        kind: '',
        units: [],
    };
    const openToolBatchKeys = new Set();
    const toolDisplayPreviewCache = new WeakMap();

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
        } catch {
            // Fall through to the async clipboard path.
        }

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(normalized);
                return true;
            }
        } catch {
            // Fall through to false.
        }
        return false;
    }

    function buildInteractivePre(text, className = '') {
        const pre = document.createElement('pre');
        pre.className = className;
        pre.textContent = String(text || '');
        enhancePathLinks(pre, {
            onPathClick: onLocalPathClick,
            linkClassName: 'xb-assistant-local-path-link',
        });
        return pre;
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

    function getMessageContentSignature(message = {}) {
        if (message.role === 'tool') {
            return [
                'tool',
                String(message.toolCallId || ''),
                String(message.toolName || ''),
                String(message.content || '').length,
            ].join(':');
        }
        const signature = buildTextSignature(message.content);
        return signature;
    }

    function getToolDisplayPreview(message) {
        const cached = toolDisplayPreviewCache.get(message);
        if (cached) {
            return cached;
        }

        const display = formatToolResultDisplay(message);
        const preview = {
            summary: String(display.summary || '') || '工具已返回结果。',
            hasDetails: Boolean(display.details),
        };
        toolDisplayPreviewCache.set(message, preview);
        return preview;
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
            content: getMessageContentSignature(message),
            toolCallId: String(message.toolCallId || ''),
            toolName: String(message.toolName || ''),
            toolCalls: Array.isArray(message.toolCalls)
                ? message.toolCalls.map((toolCall) => ({
                    id: String(toolCall.id || ''),
                    name: String(toolCall.name || ''),
                    arguments: buildTextSignature(toolCall.arguments),
                }))
                : [],
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
            streaming: Boolean(message.streaming),
            ui: Number.isInteger(messageIndex) && messageIndex >= 0
                ? {
                    editing: state.editingMessageIndex === messageIndex,
                    actionFeedback,
                }
                : undefined,
        });
    }

    function isAssistantToolCallMessage(message) {
        return isAssistantToolCallMessageForWindow(message);
    }

    function buildToolBatchKey(message, fallbackIndex = 0) {
        const toolCallIds = Array.isArray(message?.toolCalls)
            ? message.toolCalls
                .map((toolCall) => String(toolCall?.id || '').trim())
                .filter(Boolean)
            : [];
        if (toolCallIds.length) {
            return `tool-batch:${toolCallIds.join('|')}`;
        }
        return `tool-batch:fallback:${fallbackIndex}:${getRenderableMessageSignature(message)}`;
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

    function buildAssistantToolPreface(message) {
        const assistantContentText = String(message.content || '').trim();
        const thoughtDetails = buildThoughtDetails(message);
        if (!assistantContentText && !thoughtDetails) return null;

        const bubble = document.createElement('div');
        bubble.className = 'xb-assistant-bubble role-assistant xb-assistant-tool-preface';

        const metaRow = document.createElement('div');
        metaRow.className = 'xb-assistant-meta-row';
        const meta = document.createElement('div');
        meta.className = 'xb-assistant-meta';
        meta.textContent = '小白助手';
        metaRow.appendChild(meta);

        bubble.appendChild(metaRow);
        if (thoughtDetails) {
            bubble.appendChild(thoughtDetails);
        }
        if (assistantContentText) {
            const content = document.createElement('div');
            content.className = 'xb-assistant-content xb-assistant-markdown';
            content.appendChild(buildMarkdownFragment(assistantContentText, {
                onPathClick: onLocalPathClick,
                codeBlockClassName: 'xb-assistant-codeblock',
                codeCopyClassName: 'xb-assistant-code-copy',
                linkClassName: 'xb-assistant-local-path-link',
            }));
            bubble.appendChild(content);
        }
        return bubble;
    }

    function buildToolBatchDetails(message, toolMessages, batchIndex) {
        const details = document.createElement('details');
        const batchKey = buildToolBatchKey(message, batchIndex);
        details.className = 'xb-assistant-tool-batch';
        details.dataset.toolBatchKey = batchKey;
        if (openToolBatchKeys.has(batchKey)) {
            details.open = true;
        }

        const summary = document.createElement('summary');
        summary.className = 'xb-assistant-tool-batch-summary';
        summary.textContent = `小白助手 · 已发起 ${Array.isArray(message.toolCalls) ? message.toolCalls.length : 0} 个工具调用`;
        details.appendChild(summary);

        const body = document.createElement('div');
        body.className = 'xb-assistant-tool-batch-body';

        let bodyBuilt = false;
        const ensureBody = () => {
            if (bodyBuilt) return;
            bodyBuilt = true;
            toolMessages.forEach((toolMessage) => {
                const toolBubble = buildMessageBubble(toolMessage);
                toolBubble.dataset.renderSignature = getRenderableMessageSignature(toolMessage);
                body.appendChild(toolBubble);
            });
            details.appendChild(body);
        };

        details.addEventListener('toggle', () => {
            if (details.open) {
                openToolBatchKeys.add(batchKey);
                ensureBody();
            } else {
                openToolBatchKeys.delete(batchKey);
                if (bodyBuilt) {
                    body.remove();
                    body.replaceChildren();
                    bodyBuilt = false;
                }
            }
        });

        if (details.open) {
            ensureBody();
        }
        return details;
    }

    function buildToolBatch(message, toolMessages, batchIndex) {
        const preface = buildAssistantToolPreface(message);
        const details = buildToolBatchDetails(message, toolMessages, batchIndex);
        if (!preface) return details;

        const group = document.createElement('div');
        group.className = 'xb-assistant-tool-turn';
        group.append(preface, details);
        return group;
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
        const isAssistantToolCall = message.role === 'assistant'
            && Array.isArray(message.toolCalls)
            && message.toolCalls.length > 0;
        const isMetaOnlyToolCall = isAssistantToolCall && !assistantContentText;
        const canShowAssistantActions = message.role === 'assistant'
            && !isAssistantToolCall
            && !!assistantContentText;
        const isEditing = canShowAssistantActions && state.editingMessageIndex === messageIndex;
        if (isMetaOnlyToolCall) {
            bubble.classList.add('is-tool-call');
        }

        const metaRow = document.createElement('div');
        metaRow.className = 'xb-assistant-meta-row';

        const meta = document.createElement('div');
        meta.className = 'xb-assistant-meta';
        meta.textContent = message.role === 'user'
            ? '你'
            : message.role === 'assistant'
                ? Array.isArray(message.toolCalls) && message.toolCalls.length
                    ? `小白助手 · 已发起 ${message.toolCalls.length} 个工具调用`
                    : `小白助手${message.streaming ? ' · 正在生成' : ''}${Array.isArray(message.thoughts) && message.thoughts.length ? ` · 含 ${message.thoughts.length} 段思考` : ''}`
                : `工具结果${message.toolName ? ` · ${message.toolName}` : ''}`;
        metaRow.appendChild(meta);

        if (canShowAssistantActions) {
            const actions = document.createElement('div');
            actions.className = 'xb-assistant-message-actions';
            const getActionDefinition = (action, label, title) => {
                const feedbackKey = `${action}:${messageIndex}`;
                const feedbackState = state.messageActionFeedback?.[feedbackKey] || '';
                if (feedbackState === 'success') {
                    return { action, label: '✓', title: '已复制' };
                }
                if (feedbackState === 'error') {
                    return { action, label: '!', title: '复制失败' };
                }
                return { action, label, title };
            };
            const actionDefinitions = isEditing
                ? [
                    { action: 'save-edit', label: '✓', title: '保存这条消息的修改' },
                    { action: 'cancel-edit', label: '✕', title: '取消本次修改' },
                ]
                : [
                    getActionDefinition('copy', '⧉', '复制整条消息'),
                    { action: 'edit', label: '✎', title: '编辑这条消息' },
                    { action: 'reroll', label: '↻', title: '从这里重新生成后续回复' },
                    { action: 'delete', label: '🗑', title: '删除这条消息' },
                ];

            actionDefinitions.forEach((item) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'xb-assistant-message-action';
                button.dataset.messageAction = item.action;
                button.dataset.messageIndex = String(messageIndex);
                button.textContent = item.label;
                button.title = item.title;
                button.setAttribute('aria-label', item.title);
                actions.appendChild(button);
            });

            metaRow.appendChild(actions);
        }

        bubble.appendChild(metaRow);

        if (message.role === 'tool') {
            const display = getToolDisplayPreview(message);
            const summary = buildInteractivePre(display.summary || '工具已返回结果。', 'xb-assistant-content tool-summary');
            bubble.append(summary);

            if (display.hasDetails) {
                const details = document.createElement('details');
                details.className = 'xb-assistant-tool-details';
                const summaryEl = document.createElement('summary');
                summaryEl.textContent = message.toolName === toolNames.READ ? '展开文件内容' : '展开详细结果';
                details.appendChild(summaryEl);

                let detailPre = null;
                const ensureDetail = () => {
                    if (detailPre) return;
                    const detailDisplay = formatToolResultDisplay(message);
                    detailPre = buildInteractivePre(detailDisplay.details, 'xb-assistant-content tool-detail');
                    details.appendChild(detailPre);
                };
                details.addEventListener('toggle', () => {
                    if (details.open) {
                        ensureDetail();
                    } else if (detailPre) {
                        detailPre.remove();
                        detailPre = null;
                    }
                });
                if (details.open) {
                    ensureDetail();
                }
                bubble.appendChild(details);
            }

            return bubble;
        }

        const content = document.createElement('div');
        content.className = 'xb-assistant-content xb-assistant-markdown';
        const fallbackContent = message.role === 'assistant' && !isAssistantToolCall
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
            textarea.rows = Math.min(Math.max(assistantContentText.split('\n').length, 4), 14);
            textarea.setAttribute('aria-label', '编辑助手消息');
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

        return bubble;
    }

    function createMessageRenderUnit(message, messageIndex) {
        const signature = JSON.stringify({
            type: 'message',
            messageIndex,
            message: getRenderableMessageSignature(message, messageIndex),
        });
        return {
            signature,
            build: () => {
                const node = buildMessageBubble(message, messageIndex);
                node.dataset.renderSignature = signature;
                return node;
            },
        };
    }

    function createToolRunRenderUnit(startIndex) {
        const batches = [];
        let index = startIndex;
        while (index < state.messages.length && isAssistantToolCallMessage(state.messages[index])) {
            const message = state.messages[index];
            const toolMessages = [];
            let nextIndex = index + 1;
            while (nextIndex < state.messages.length && state.messages[nextIndex]?.role === 'tool') {
                toolMessages.push(state.messages[nextIndex]);
                nextIndex += 1;
            }
            batches.push({
                message,
                messageIndex: index,
                toolMessages,
            });
            index = nextIndex;
        }

        const signature = JSON.stringify({
            type: 'tool-run',
            startIndex,
            batches: batches.map((batch) => ({
                messageIndex: batch.messageIndex,
                message: getRenderableMessageSignature(batch.message, batch.messageIndex),
                toolMessages: batch.toolMessages.map((toolMessage) => getRenderableMessageSignature(toolMessage)),
            })),
        });

        return {
            nextIndex: index,
            signature,
            build: () => {
                const group = document.createElement('div');
                group.className = 'xb-assistant-tool-run';
                group.dataset.renderSignature = signature;
                batches.forEach((batch) => {
                    group.appendChild(buildToolBatch(batch.message, batch.toolMessages, batch.messageIndex));
                });
                return group;
            },
        };
    }

    function collectRenderUnits(startIndex = 0, endIndex = state.messages.length) {
        const units = [];
        const normalizedStart = Number(startIndex);
        const normalizedEnd = Number(endIndex);
        const start = Math.max(0, Number.isFinite(normalizedStart) ? Math.floor(normalizedStart) : 0);
        const rawEnd = Number.isFinite(normalizedEnd) ? Math.floor(normalizedEnd) : state.messages.length;
        const end = Math.min(state.messages.length, Math.max(start, rawEnd));
        for (let index = start; index < end; index += 1) {
            const message = state.messages[index];
            if (isAssistantToolCallMessage(message)) {
                const unit = createToolRunRenderUnit(index);
                units.push(unit);
                index = unit.nextIndex - 1;
                continue;
            }
            units.push(createMessageRenderUnit(message, index));
        }
        return units;
    }

    function createHistoryGateRenderUnit(hiddenBefore = 0) {
        const signature = `history-gate:${hiddenBefore}`;
        return {
            signature,
            build: () => {
                const gate = document.createElement('div');
                gate.className = 'xb-assistant-history-gate';
                gate.dataset.renderSignature = signature;
                gate.textContent = `较早记录 ${hiddenBefore} 轮`;
                return gate;
            },
        };
    }

    function applyRenderUnits(container, previousUnits, unitSpecs) {
        const nextUnits = [];

        unitSpecs.forEach((unit, index) => {
            const previousUnit = previousUnits[index];
            const canReuseNode = previousUnit?.signature === unit.signature
                && previousUnit.node?.parentNode === container;
            const node = canReuseNode ? previousUnit.node : unit.build();
            const currentNode = container.children[index] || null;

            if (currentNode !== node) {
                container.insertBefore(node, currentNode);
            }
            if (!canReuseNode && previousUnit?.node?.parentNode === container && previousUnit.node !== node) {
                previousUnit.node.remove();
            }

            nextUnits.push({
                signature: unit.signature,
                node,
            });
        });

        while (container.children.length > unitSpecs.length) {
            container.lastElementChild?.remove();
        }

        return nextUnits;
    }

    function renderMessages(container) {
        if (!container) return;
        container.classList.toggle('is-busy', !!state.isBusy);
        if (!state.messages.length) {
            if (renderCache.kind === 'empty') return;
            container.replaceChildren();
            const empty = document.createElement('div');
            empty.className = 'xb-assistant-empty';
            empty.innerHTML = '<h2>你好！我是小白助手</h2><p>我是 SillyTavern 中 LittleWhiteBox（小白X）插件的内置技术支持助手。</p><p>我可以帮你做很多事情，比如：</p><ul><li><strong>解答问题与排查报错</strong>：解答关于 SillyTavern 或小白X插件的代码、设置、模块行为等问题，帮你排查报错。</li><li><strong>编写与创作辅助</strong>：辅助你写角色卡、写插件、写 STscript 脚本、整理设定或构思剧情。</li><li><strong>查询实例状态</strong>：我可以执行斜杠命令，帮你查询当前酒馆的 API、模型、角色状态等实时信息。</li><li><strong>查阅文档与源码</strong>：我可以读取酒馆和插件的前端源码及参考文档，为你提供准确的技术支持。</li></ul><p>另外，如果你希望我以特定的性格、语气和你交流，或者有特定的工作习惯要求，你可以随时告诉我，我可以将这些设定保存到我的专属身份设定文件中跨会话记住；当前最大上下文约 188k，并会在 158k 附近自动总结，尽量减少频繁压缩又保持长期记忆。</p><p>今天有什么我可以帮你的吗？</p>';
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
            && unitSpecs.every((unit, index) => previousUnits[index]?.signature === unit.signature);
        if (canReuseAll) {
            return;
        }

        const previousScrollTop = container.scrollTop;
        const nextUnits = applyRenderUnits(container, previousUnits, unitSpecs);
        renderCache = {
            kind: 'messages',
            units: nextUnits,
        };

        if (state.autoScroll) {
            container.scrollTop = container.scrollHeight;
        } else {
            container.scrollTop = previousScrollTop;
        }
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

    function scrollChatToBottom(container) {
        if (!container) return;
        const apply = () => {
            container.scrollTop = container.scrollHeight;
        };
        apply();
        requestAnimationFrame(() => {
            apply();
            requestAnimationFrame(apply);
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
        scrollChatToBottom,
        scrollChatToTop,
        revealOlderMessages,
        updateChatScrollButtonsVisibility,
        handleAssistantChatScroll,
        copyText,
    };
}
