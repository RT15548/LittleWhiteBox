export function createChatUi(deps) {
    const {
        state,
        examplePrompts,
        toolNames,
        formatToolResultDisplay,
        normalizeThoughtBlocks,
        normalizeAttachments,
        renderAttachmentGallery,
    } = deps;

    let chatScrollTicking = false;
    let chatScrollHideTimer = null;

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

    function buildSanitizedHtmlFragment(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<body>${String(html || '')}</body>`, 'text/html');
        const fragment = document.createDocumentFragment();
        Array.from(doc.body.childNodes).forEach((node) => {
            fragment.appendChild(document.importNode(node, true));
        });
        return fragment;
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
            approvalRequest: message.approvalRequest
                ? {
                    id: String(message.approvalRequest.id || ''),
                    kind: String(message.approvalRequest.kind || ''),
                    command: String(message.approvalRequest.command || ''),
                    status: String(message.approvalRequest.status || ''),
                }
                : null,
            streaming: Boolean(message.streaming),
        });
    }

    function buildMessageBubble(message) {
        const bubble = document.createElement('div');
        bubble.className = `xb-assistant-bubble role-${message.role}`;

        const meta = document.createElement('div');
        meta.className = 'xb-assistant-meta';
        meta.textContent = message.role === 'user'
            ? '你'
            : message.role === 'assistant'
                ? Array.isArray(message.toolCalls) && message.toolCalls.length
                    ? `小白助手 · 已发起 ${message.toolCalls.length} 个工具调用${Array.isArray(message.thoughts) && message.thoughts.length ? ` · 含 ${message.thoughts.length} 段思考` : ''}`
                    : `小白助手${message.streaming ? ' · 正在生成' : ''}${Array.isArray(message.thoughts) && message.thoughts.length ? ` · 含 ${message.thoughts.length} 段思考` : ''}`
                : `工具结果${message.toolName ? ` · ${message.toolName}` : ''}`;

        if (message.role === 'tool') {
            const display = formatToolResultDisplay(message);
            const summary = document.createElement('pre');
            summary.className = 'xb-assistant-content tool-summary';
            summary.textContent = display.summary || '工具已返回结果。';
            bubble.append(meta, summary);

            if (display.details) {
                const details = document.createElement('details');
                details.className = 'xb-assistant-tool-details';
                const summaryEl = document.createElement('summary');
                summaryEl.textContent = message.toolName === toolNames.READ ? '展开文件内容' : '展开详细结果';
                const detailPre = document.createElement('pre');
                detailPre.className = 'xb-assistant-content tool-detail';
                detailPre.textContent = display.details;
                details.append(summaryEl, detailPre);
                bubble.appendChild(details);
            }

            return bubble;
        }

        const content = document.createElement('div');
        content.className = 'xb-assistant-content xb-assistant-markdown';
        content.appendChild(
            buildSanitizedHtmlFragment(
                renderMarkdown(
                    message.content || (message.role === 'assistant'
                        ? (message.streaming ? '思考中…' : '我先查一下相关代码。')
                        : ''),
                ),
            ),
        );
        bubble.append(meta, content);

        if (Array.isArray(message.attachments) && message.attachments.length) {
            const gallery = document.createElement('div');
            gallery.className = 'xb-assistant-attachment-gallery';
            renderAttachmentGallery(gallery, message.attachments, { compact: true });
            bubble.appendChild(gallery);
        }

        if (message.role === 'assistant' && message.approvalRequest?.kind === 'slash-command') {
            const approval = document.createElement('div');
            approval.className = 'xb-assistant-approval';

            const title = document.createElement('div');
            title.className = 'xb-assistant-approval-title';
            title.textContent = '待确认的斜杠命令';

            const command = document.createElement('pre');
            command.className = 'xb-assistant-content xb-assistant-approval-command';
            command.textContent = message.approvalRequest.command || '';

            const note = document.createElement('div');
            note.className = 'xb-assistant-approval-note';
            note.textContent = message.approvalRequest.status === 'approved'
                ? '已同意，命令已进入执行流程。'
                : message.approvalRequest.status === 'declined'
                    ? '已拒绝，本次不会执行这条命令。'
                    : message.approvalRequest.status === 'cancelled'
                        ? '本轮请求已终止，这条命令未执行。'
                        : '这条命令可能改动真实实例状态；点“是”后才会真正执行。';

            approval.append(title, command, note);

            if (message.approvalRequest.status === 'pending') {
                const actions = document.createElement('div');
                actions.className = 'xb-assistant-approval-actions';

                const approveButton = document.createElement('button');
                approveButton.type = 'button';
                approveButton.className = 'xb-assistant-approval-button';
                approveButton.dataset.approvalId = message.approvalRequest.id;
                approveButton.dataset.approvalDecision = 'approve';
                approveButton.textContent = '是，执行';

                const declineButton = document.createElement('button');
                declineButton.type = 'button';
                declineButton.className = 'xb-assistant-approval-button secondary';
                declineButton.dataset.approvalId = message.approvalRequest.id;
                declineButton.dataset.approvalDecision = 'decline';
                declineButton.textContent = '否，跳过';

                actions.append(approveButton, declineButton);
                approval.appendChild(actions);
            }

            bubble.appendChild(approval);
        }

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

            bubble.appendChild(details);
        }

        return bubble;
    }

    function renderMessages(container) {
        const existingBubbles = Array.from(container.querySelectorAll('.xb-assistant-bubble'));

        if (!state.messages.length) {
            container.innerHTML = '';
            const empty = document.createElement('div');
            empty.className = 'xb-assistant-empty';
            empty.innerHTML = '<h2>你好，我是小白助手</h2><p>我运行在你当前打开的 SillyTavern 酒馆里，专门帮你解答 LittleWhiteBox 和酒馆前端的问题。</p><p><strong>我能做什么：</strong></p><ul><li><strong>查看源码</strong>：读取 LittleWhiteBox 和酒馆前端的代码快照（构建时索引），帮你找按钮位置、设置逻辑、报错链路。</li><li><strong>查询实例</strong>：执行斜杠命令查询你当前酒馆的实时状态，比如当前 API、模型、角色、扩展开关等。</li><li><strong>记录工作</strong>：把排查结论写到 <code>user/files/LittleWhiteBox_Assistant_Worklog.md</code>，方便你后续查看。</li></ul><p><strong>我不能做什么：</strong></p><ul><li>不能访问后端代码、数据库、API Key 存储位置。</li><li>不能修改你的源码或配置文件。</li><li>代码快照可能不包含你最新的修改；如需确认当前实例状态，我会用斜杠命令查询。</li></ul><p>下面是一些示例问题，点击后会填入输入框（不会自动发送）：</p>';

            const examples = document.createElement('div');
            examples.className = 'xb-assistant-examples';
            examplePrompts.forEach((prompt) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'xb-assistant-example-chip';
                button.dataset.prompt = prompt;
                button.textContent = prompt;
                examples.appendChild(button);
            });
            empty.appendChild(examples);
            container.appendChild(empty);
            return;
        }

        const emptyEl = container.querySelector('.xb-assistant-empty');
        if (emptyEl) {
            emptyEl.remove();
        }

        state.messages.forEach((message, index) => {
            const signature = getRenderableMessageSignature(message);
            const existingBubble = existingBubbles[index] || null;
            if (existingBubble?.dataset.renderSignature === signature) {
                return;
            }
            const nextBubble = buildMessageBubble(message);
            nextBubble.dataset.renderSignature = signature;
            if (existingBubble) {
                container.replaceChild(nextBubble, existingBubble);
            } else {
                container.appendChild(nextBubble);
            }
        });

        existingBubbles.slice(state.messages.length).forEach((bubble) => bubble.remove());

        if (state.autoScroll) {
            container.scrollTop = container.scrollHeight;
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
        scrollChatToBottom,
        scrollChatToTop,
        updateChatScrollButtonsVisibility,
        handleAssistantChatScroll,
    };
}
