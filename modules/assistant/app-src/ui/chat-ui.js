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
    const openToolBatchKeys = new Set();

    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderMarkdown(text) {
        const raw = String(text || '').trim();
        if (!raw) return '';

        try {
            const showdownLib = globalThis.parent?.showdown || globalThis.showdown;
            const DOMPurifyLib = globalThis.parent?.DOMPurify || globalThis.DOMPurify;
            if (showdownLib?.Converter && DOMPurifyLib?.sanitize) {
                const converter = new showdownLib.Converter({
                    simpleLineBreaks: true,
                    strikethrough: true,
                    tables: true,
                    tasklists: true,
                    ghCodeBlocks: true,
                    simplifiedAutoLink: true,
                    openLinksInNewWindow: true,
                    emoji: false,
                });
                const html = converter.makeHtml(raw);
                return DOMPurifyLib.sanitize(html, {
                    USE_PROFILES: { html: true },
                    FORBID_TAGS: ['style', 'script'],
                });
            }
        } catch {
            // Fall back to escaped plain text below.
        }

        return escapeHtml(raw).replace(/\n/g, '<br>');
    }

    async function copyText(text) {
        const normalized = String(text || '');
        if (!normalized) return false;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(normalized);
                return true;
            }
        } catch {
            // Fall through to execCommand fallback.
        }

        try {
            const textarea = document.createElement('textarea');
            textarea.value = normalized;
            textarea.setAttribute('readonly', 'readonly');
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.pointerEvents = 'none';
            document.body.appendChild(textarea);
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);
            const copied = document.execCommand('copy');
            textarea.remove();
            return copied;
        } catch {
            return false;
        }
    }

    function enhanceMarkdownCodeBlocks(doc) {
        Array.from(doc.body.querySelectorAll('pre')).forEach((pre) => {
            if (pre.closest('.xb-assistant-codeblock')) return;

            const wrapper = doc.createElement('div');
            wrapper.className = 'xb-assistant-codeblock';
            const copyButton = doc.createElement('button');
            copyButton.type = 'button';
            copyButton.className = 'xb-assistant-code-copy';
            copyButton.textContent = '⧉';
            copyButton.title = '复制代码';
            copyButton.setAttribute('aria-label', '复制代码');
            copyButton.addEventListener('click', async () => {
                const codeText = pre.querySelector('code')?.textContent || pre.textContent || '';
                const copied = await copyText(codeText);
                copyButton.textContent = copied ? '✓' : '!';
                copyButton.title = copied ? '已复制' : '复制失败';
                setTimeout(() => {
                    copyButton.textContent = '⧉';
                    copyButton.title = '复制代码';
                }, 1200);
            });

            pre.parentNode?.insertBefore(wrapper, pre);
            wrapper.append(copyButton, pre);
        });
    }

    function enhanceLocalPathLinks(rootNode) {
        if (!rootNode || typeof onLocalPathClick !== 'function') return;
        const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);
        const textNodes = [];

        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node?.nodeValue || !String(node.nodeValue).includes('local/')) continue;
            const parent = node.parentElement;
            if (parent?.closest?.('button, a, textarea, input')) continue;
            textNodes.push(node);
        }

        const pathRegex = /local\/[^\s`"'<>，。；：！？（）()[\]{}]+/g;
        textNodes.forEach((node) => {
            const text = String(node.nodeValue || '');
            let match = null;
            let lastIndex = 0;
            const fragment = document.createDocumentFragment();
            let replaced = false;
            pathRegex.lastIndex = 0;

            while ((match = pathRegex.exec(text)) !== null) {
                replaced = true;
                if (match.index > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                }
                const matchedPath = match[0];

                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'xb-assistant-local-path-link';
                button.textContent = matchedPath;
                button.addEventListener('click', () => {
                    onLocalPathClick(matchedPath);
                });
                fragment.appendChild(button);
                lastIndex = match.index + matchedPath.length;
            }

            if (!replaced) return;
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
            }
            node.parentNode?.replaceChild(fragment, node);
        });
    }

    function buildSanitizedHtmlFragment(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<body>${String(html || '')}</body>`, 'text/html');
        enhanceMarkdownCodeBlocks(doc);
        const fragment = document.createDocumentFragment();
        while (doc.body.firstChild) {
            fragment.appendChild(doc.body.firstChild);
        }
        enhanceLocalPathLinks(fragment);
        return fragment;
    }

    function buildInteractivePre(text, className = '') {
        const pre = document.createElement('pre');
        pre.className = className;
        pre.textContent = String(text || '');
        enhanceLocalPathLinks(pre);
        return pre;
    }

    function getRenderableMessageSignature(message) {
        return JSON.stringify({
            role: message.role,
            content: String(message.content || ''),
            toolCallId: String(message.toolCallId || ''),
            toolName: String(message.toolName || ''),
            toolCalls: Array.isArray(message.toolCalls)
                ? message.toolCalls.map((toolCall) => ({
                    id: String(toolCall.id || ''),
                    name: String(toolCall.name || ''),
                    arguments: String(toolCall.arguments || ''),
                }))
                : [],
            thoughts: normalizeThoughtBlocks(message.thoughts),
            attachments: normalizeAttachments(message.attachments).map((attachment) => ({
                kind: attachment.kind,
                name: attachment.name,
                type: attachment.type,
                size: attachment.size,
            })),
            streaming: Boolean(message.streaming),
        });
    }

    function isAssistantToolCallMessage(message) {
        return message?.role === 'assistant'
            && Array.isArray(message.toolCalls)
            && message.toolCalls.length > 0;
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

    function buildToolBatch(message, toolMessages, batchIndex) {
        const details = document.createElement('details');
        const batchKey = buildToolBatchKey(message, batchIndex);
        details.className = 'xb-assistant-tool-batch';
        details.dataset.toolBatchKey = batchKey;
        if (openToolBatchKeys.has(batchKey)) {
            details.open = true;
        }
        details.addEventListener('toggle', () => {
            if (details.open) {
                openToolBatchKeys.add(batchKey);
            } else {
                openToolBatchKeys.delete(batchKey);
            }
        });

        const summary = document.createElement('summary');
        summary.className = 'xb-assistant-tool-batch-summary';
        summary.textContent = `小白助手 · 已发起 ${Array.isArray(message.toolCalls) ? message.toolCalls.length : 0} 个工具调用`;
        details.appendChild(summary);

        const body = document.createElement('div');
        body.className = 'xb-assistant-tool-batch-body';

        const assistantContentText = String(message.content || '').trim();
        if (assistantContentText) {
            const note = document.createElement('div');
            note.className = 'xb-assistant-tool-batch-note xb-assistant-markdown';
            note.appendChild(buildSanitizedHtmlFragment(renderMarkdown(assistantContentText)));
            body.appendChild(note);
        }

        toolMessages.forEach((toolMessage) => {
            const toolBubble = buildMessageBubble(toolMessage);
            toolBubble.dataset.renderSignature = getRenderableMessageSignature(toolMessage);
            body.appendChild(toolBubble);
        });

        details.appendChild(body);
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

        const title = document.createElement('div');
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
                if (state.isBusy && item.action !== 'cancel-edit') {
                    button.disabled = true;
                }
                actions.appendChild(button);
            });

            metaRow.appendChild(actions);
        }

        bubble.appendChild(metaRow);

        if (message.role === 'tool') {
            const display = formatToolResultDisplay(message);
            const summary = buildInteractivePre(display.summary || '工具已返回结果。', 'xb-assistant-content tool-summary');
            bubble.append(summary);

            if (display.details) {
                const details = document.createElement('details');
                details.className = 'xb-assistant-tool-details';
                const summaryEl = document.createElement('summary');
                summaryEl.textContent = message.toolName === toolNames.READ ? '展开文件内容' : '展开详细结果';
                const detailPre = buildInteractivePre(display.details, 'xb-assistant-content tool-detail');
                details.append(summaryEl, detailPre);
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
        let thoughtDetails = null;
        if (message.role === 'assistant' && Array.isArray(message.thoughts) && message.thoughts.length) {
            const details = document.createElement('details');
            details.className = 'xb-assistant-thought-details';
            const summaryEl = document.createElement('summary');
            summaryEl.textContent = message.thoughts.length > 1
                ? `展开思考块（${message.thoughts.length} 段）`
                : '展开思考块';
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

            thoughtDetails = details;
        }

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
            content.appendChild(buildSanitizedHtmlFragment(renderMarkdown(bodyText)));
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

    function renderMessages(container) {
        if (!state.messages.length) {
            container.innerHTML = '';
            const empty = document.createElement('div');
            empty.className = 'xb-assistant-empty';
            empty.innerHTML = '<h2>你好！我是小白助手</h2><p>我是 SillyTavern 中 LittleWhiteBox（小白X）插件的内置技术支持助手。</p><p>我可以帮你做很多事情，比如：</p><ul><li><strong>解答问题与排查报错</strong>：解答关于 SillyTavern 或小白X插件的代码、设置、模块行为等问题，帮你排查报错。</li><li><strong>编写与创作辅助</strong>：辅助你写角色卡、写插件、写 STscript 脚本、整理设定或构思剧情。</li><li><strong>查询实例状态</strong>：我可以执行斜杠命令，帮你查询当前酒馆的 API、模型、角色状态等实时信息。</li><li><strong>查阅文档与源码</strong>：我可以读取酒馆和插件的前端源码及参考文档，为你提供准确的技术支持。</li></ul><p>另外，如果你希望我以特定的性格、语气和你交流，或者有特定的工作习惯要求，你可以随时告诉我，我可以将这些设定保存到我的专属身份设定文件中跨会话记住；同时我会在 98k 上下文附近自动总结，尽量保持长期记忆。</p><p>今天有什么我可以帮你的吗？</p>';
            container.appendChild(empty);
            return;
        }

        container.innerHTML = '';
        for (let index = 0; index < state.messages.length; index += 1) {
            const message = state.messages[index];
            if (isAssistantToolCallMessage(message)) {
                const toolMessages = [];
                let nextIndex = index + 1;
                while (nextIndex < state.messages.length && state.messages[nextIndex]?.role === 'tool') {
                    toolMessages.push(state.messages[nextIndex]);
                    nextIndex += 1;
                }

                const toolBatch = buildToolBatch(message, toolMessages, index);
                toolBatch.dataset.renderSignature = getRenderableMessageSignature(message);
                container.appendChild(toolBatch);
                index = nextIndex - 1;
                continue;
            }

            const nextBubble = buildMessageBubble(message, index);
            nextBubble.dataset.renderSignature = getRenderableMessageSignature(message);
            container.appendChild(nextBubble);
        }

        if (state.autoScroll) {
            container.scrollTop = container.scrollHeight;
        }
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
        updateChatScrollButtonsVisibility,
        handleAssistantChatScroll,
        copyText,
    };
}
