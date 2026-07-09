import { buildActionPrompt } from './prompts.js';
import { countMessageWindowUnits } from './renderer.js';
import { EBOOK_THEME_STORAGE_KEY } from './state.js';
import { formatDraftMetrics } from './text-metrics.js';
import {
    AGENT_MESSAGE_WINDOW_DEFAULT,
    expandMessageWindow,
    resetMessageWindow,
} from '../../agent-core/ui/message-windowing.js';

const messageActionFeedbackTimers = new Map();

function scheduleFrame(callback) {
    if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(callback);
        return;
    }
    const timer = setTimeout(callback, 16);
    timer?.unref?.();
}

function isEbookMobile() {
    try {
        const mobileTypes = ['mobile', 'tablet'];
        const platformType = globalThis.Bowser?.parse?.(globalThis.navigator?.userAgent || '')?.platform?.type;
        if (mobileTypes.includes(platformType)) return true;
    } catch {
        // Fall back to media queries.
    }
    try {
        return !!(
            globalThis.matchMedia?.('(pointer: coarse)')?.matches
            && globalThis.matchMedia?.('(max-width: 900px)')?.matches
        );
    } catch {
        return false;
    }
}

function isSendShortcut(event) {
    return event.key === 'Enter'
        && !isEbookMobile()
        && !event.isComposing
        && !event.shiftKey
        && !event.ctrlKey
        && !event.altKey
        && !event.metaKey;
}

function isSaveShortcut(event) {
    return String(event.key || '').toLowerCase() === 's' && (event.ctrlKey || event.metaKey);
}

function updateEditorMeta(root, state, bookController) {
    const meta = root.querySelector('#xb-editor-meta');
    if (!meta) return;
    meta.textContent = `${bookController.isEditorDirty() ? '有未保存修改' : '已保存到书库'} · ${formatDraftMetrics(state.editorContent || '')}`;
}

function updateComposeHint(root) {
    const hint = root.querySelector('#xb-compose-hint');
    if (!hint) return;
    hint.textContent = isEbookMobile()
        ? 'Enter 换行 · 点击发送'
        : 'Enter 发送 · Shift+Enter 换行';
}

function parsePixelValue(value, fallback = 0) {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}

function autoSizeAgentInput(root) {
    const input = root?.querySelector?.('#xb-agent-input');
    if (!input?.style) return;
    const computed = globalThis.getComputedStyle?.(input);
    const minHeight = parsePixelValue(computed?.minHeight, 46);
    const maxHeight = Math.max(minHeight, parsePixelValue(computed?.maxHeight, 68));
    const contentHeight = Number.isFinite(Number(input.scrollHeight)) ? Number(input.scrollHeight) : minHeight;
    input.style.height = '0px';
    const nextHeight = Math.min(maxHeight, Math.max(minHeight, contentHeight));
    input.style.height = `${nextHeight}px`;
    input.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';
}

function scrollActiveStudioFileIntoView(root) {
    const activeFile = root?.querySelector?.('.xb-files .xb-file.is-active');
    if (!activeFile) return;
    scheduleFrame(() => {
        try {
            activeFile.scrollIntoView({ block: 'center', inline: 'nearest' });
        } catch {
            activeFile.scrollIntoView?.();
        }
    });
}

function createSvgPath(doc, d) {
    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    return path;
}

function createThemeIconNode(doc, colorTheme = 'dark') {
    if (colorTheme === 'light') {
        const span = doc.createElement('span');
        span.className = 'xb-theme-glyph';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = '☾';
        return span;
    }
    const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'xb-theme-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('stroke-width', '1.75');
    const circle = doc.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '4');
    svg.appendChild(circle);
    [
        'M12 2v2',
        'M12 20v2',
        'm4.93 4.93 1.41 1.41',
        'm17.66 17.66 1.41 1.41',
        'M2 12h2',
        'M20 12h2',
        'm6.34 17.66-1.41 1.41',
        'm19.07 4.93-1.41 1.41',
    ].forEach((d) => svg.appendChild(createSvgPath(doc, d)));
    return svg;
}

function applyColorTheme(root, state) {
    const theme = state.colorTheme === 'light' ? 'light' : 'dark';
    root.querySelectorAll('.xb-ebook-shell, .xb-ebook-screen').forEach((node) => {
        node.classList.toggle('theme-light', theme === 'light');
        node.classList.toggle('theme-dark', theme !== 'light');
    });
    const title = theme === 'light' ? '切换为深色视觉' : '切换为白底黑字';
    root.querySelectorAll('#xb-theme-toggle, [data-theme-toggle]').forEach((themeToggle) => {
        themeToggle.replaceChildren(createThemeIconNode(themeToggle.ownerDocument || document, theme));
        themeToggle.setAttribute('title', title);
        themeToggle.setAttribute('aria-label', title);
    });
}

function openBookPackageFilePicker(bookController) {
    const doc = document;
    const input = doc.createElement('input');
    input.type = 'file';
    input.accept = '.xbebook.json,.json,application/json';
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    input.addEventListener('change', () => {
        const file = input.files?.[0] || null;
        input.remove();
        if (file) void bookController.importBookPackageFile(file);
    }, { once: true });
    input.addEventListener('cancel', () => input.remove(), { once: true });
    doc.body.appendChild(input);
    input.click();
}

function updateOpenKeyList(list = [], key = '', open = false) {
    const normalizedKey = String(key || '').trim();
    const current = new Set(Array.isArray(list) ? list : []);
    if (!normalizedKey) return [...current];
    if (open) {
        current.add(normalizedKey);
    } else {
        current.delete(normalizedKey);
    }
    return [...current];
}

function findClosest(target, selector) {
    return target?.closest?.(selector) || null;
}

const ROOT_DELEGATED_BINDINGS_KEY = '__xiaobaixEbookDelegatedBindings';

function clearDelegatedRootBindings(root) {
    const existing = root?.[ROOT_DELEGATED_BINDINGS_KEY];
    if (!existing) return;
    try {
        existing.abortController?.abort?.();
    } catch {
        // Older WebViews may not fully support AbortController-backed listeners.
    }
    root.removeEventListener?.('toggle', existing.handleToggle, true);
    root.removeEventListener?.('click', existing.handleClick);
    root[ROOT_DELEGATED_BINDINGS_KEY] = null;
}

function bindDelegatedRootEvents(root, handlers = {}) {
    if (!root?.addEventListener) return;
    clearDelegatedRootBindings(root);
    const abortController = typeof AbortController === 'function'
        ? new AbortController()
        : null;
    const toggleOptions = abortController ? { capture: true, signal: abortController.signal } : true;
    const clickOptions = abortController ? { signal: abortController.signal } : undefined;
    root.addEventListener('toggle', handlers.handleToggle, toggleOptions);
    root.addEventListener('click', handlers.handleClick, clickOptions);
    root[ROOT_DELEGATED_BINDINGS_KEY] = {
        abortController,
        handleToggle: handlers.handleToggle,
        handleClick: handlers.handleClick,
    };
}

async function copyText(text = '') {
    const normalized = String(text || '');
    if (!normalized) return false;
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(normalized);
            return true;
        }
    } catch {
        // Fall through to the legacy copy path.
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

function isEditableConversationTextMessage(message = {}) {
    return message
        && ['user', 'assistant'].includes(message.role)
        && !message.streaming
        && String(message.content || '').trim()
        && !(Array.isArray(message.toolCalls) && message.toolCalls.length);
}

function findUserTurnEndIndex(messages = [], userIndex = -1) {
    if (!Array.isArray(messages) || userIndex < 0 || messages[userIndex]?.role !== 'user') {
        return userIndex + 1;
    }
    let endIndex = userIndex + 1;
    while (endIndex < messages.length && messages[endIndex]?.role !== 'user') {
        endIndex += 1;
    }
    return endIndex;
}

function canDrawSelectedChapter(state = {}) {
    return !!(state.isDrawingChapter || (
        !state.isBusy
        && /^book\/chapters\/.+\.md$/.test(String(state.selectedPath || ''))
        && state.drawStatus?.enabled
        && state.drawStatus?.ready
        && String(state.editorContent || '').replace(/\[ebook-image:[a-z0-9\-_]+\]/gi, '').trim()
    ));
}

function canHydrateReaderFigure(figure, slotId = '') {
    return !!(
        figure
        && figure.isConnected !== false
        && String(figure.dataset?.ebookImageSlot || '').trim() === slotId
    );
}

function hydrateReaderImages(root, bookController) {
    root.querySelectorAll('[data-ebook-image-slot]').forEach((figure) => {
        const slotId = String(figure.dataset.ebookImageSlot || '').trim();
        if (!slotId) return;
        void bookController.getDrawImage(slotId)
            .then((result) => {
                if (!canHydrateReaderFigure(figure, slotId)) return;
                if (!result?.hasData || !result.url) {
                    figure.classList.add('is-failed');
                    const placeholder = document.createElement('div');
                    placeholder.className = 'xb-reader-image-placeholder';
                    placeholder.textContent = result?.isFailed
                        ? (result.errorMessage || '配图生成失败')
                        : '配图未找到';
                    figure.replaceChildren(placeholder);
                    return;
                }
                figure.classList.add('is-loaded');
                const image = document.createElement('img');
                image.src = result.url;
                image.alt = result.tags ? `章节配图：${result.tags}` : '章节配图';
                image.loading = 'lazy';
                figure.replaceChildren(image);
            })
            .catch(() => {
                if (!canHydrateReaderFigure(figure, slotId)) return;
                figure.classList.add('is-failed');
                const placeholder = document.createElement('div');
                placeholder.className = 'xb-reader-image-placeholder';
                placeholder.textContent = '配图加载失败';
                figure.replaceChildren(placeholder);
            });
    });
}

export function bindEbookEvents(options = {}) {
    const {
        root,
        state,
        render,
        renderSettingsSurface,
        postToHost,
        bookController,
        agentRunner,
        persistConversation,
        clearConversation,
        showToast,
        hydrateStartup,
    } = options;
    if (!root) return;

    root.querySelector('#xb-close')?.addEventListener('click', () => postToHost('xb-ebook:close'));
    root.querySelector('#xb-library-link')?.addEventListener('click', () => void bookController.showLibrary());
    root.querySelector('#xb-library-retry-shelf')?.addEventListener('click', () => void hydrateStartup?.());
    root.querySelector('#xb-library-new-book')?.addEventListener('click', () => {
        if (state.isShelfLoading || state.shelfLoadError) return;
        void bookController.createNewBook();
    });
    root.querySelector('#xb-library-transfer-book')?.addEventListener('click', () => {
        if (state.isShelfLoading || state.shelfLoadError || state.isBusy || state.bookTransferProgress) return;
        state.isBookTransferMenuOpen = true;
        render();
    });
    root.querySelector('#xb-book-transfer-menu-close')?.addEventListener('click', () => {
        state.isBookTransferMenuOpen = false;
        render();
    });
    root.querySelector('#xb-book-transfer-menu-overlay')?.addEventListener('click', (event) => {
        if (event.target !== event.currentTarget) return;
        state.isBookTransferMenuOpen = false;
        render();
    });
    root.querySelector('#xb-book-transfer-upload')?.addEventListener('click', () => {
        if (state.isShelfLoading || state.shelfLoadError || state.isBusy || state.bookTransferProgress) return;
        state.isBookTransferMenuOpen = false;
        render();
        openBookPackageFilePicker(bookController);
    });
    root.querySelector('#xb-book-transfer-download')?.addEventListener('click', () => {
        if (state.isShelfLoading || state.shelfLoadError || state.isBusy || state.bookTransferProgress) return;
        state.isBookTransferMenuOpen = false;
        void bookController.openExportDialog();
    });
    root.querySelector('#xb-library-delete-book')?.addEventListener('click', () => {
        state.isDeleteBookOpen = true;
        render();
    });
    root.querySelector('#xb-delete-book-close')?.addEventListener('click', () => {
        state.isDeleteBookOpen = false;
        render();
    });
    root.querySelector('#xb-delete-book-overlay')?.addEventListener('click', (event) => {
        if (event.target !== event.currentTarget) return;
        state.isDeleteBookOpen = false;
        render();
    });
    root.querySelector('#xb-book-export-close')?.addEventListener('click', () => void bookController.closeExportDialog());
    root.querySelector('#xb-book-export-overlay')?.addEventListener('click', (event) => {
        if (event.target !== event.currentTarget) return;
        void bookController.closeExportDialog();
    });
    root.querySelectorAll('[data-export-book-id]').forEach((button) => {
        button.addEventListener('click', () => {
            void bookController.exportBookPackage(button.dataset.exportBookId || '');
        });
    });
    root.querySelectorAll('[data-delete-book-id]').forEach((button) => {
        button.addEventListener('click', () => {
            void bookController.removeBook(button.dataset.deleteBookId || '');
        });
    });
    root.querySelectorAll('#xb-entry-link, [data-entry-link]').forEach((button) => {
        button.addEventListener('click', () => void bookController.showBookEntry());
    });
    root.querySelector('#xb-studio-link')?.addEventListener('click', () => void bookController.showStudio());
    root.querySelector('#xb-studio-empty-link')?.addEventListener('click', () => void bookController.showStudio());
    root.querySelector('#xb-reader-link')?.addEventListener('click', () => void bookController.showReader());
    root.querySelector('#xb-reader-tts-toggle')?.addEventListener('click', () => void bookController.toggleReaderTts());
    root.querySelector('#xb-draw-chapter')?.addEventListener('click', () => void bookController.drawCurrentChapter());
    root.querySelector('#xb-new-book')?.addEventListener('click', () => void bookController.createNewBook());
    root.querySelector('#xb-new-file')?.addEventListener('click', () => void bookController.createNewFile());
    root.querySelectorAll('[data-book-rename]').forEach((button) => {
        button.addEventListener('click', () => void bookController.renameCurrentBook());
    });
    root.querySelector('#xb-save')?.addEventListener('click', () => void bookController.saveCurrentFile());
    root.querySelectorAll('#xb-agent-close, #xb-agent-close-mobile').forEach((button) => {
        button.addEventListener('click', () => postToHost('xb-ebook:close'));
    });
    root.querySelectorAll('#xb-theme-toggle, [data-theme-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            state.colorTheme = state.colorTheme === 'light' ? 'dark' : 'light';
            try {
                globalThis.localStorage?.setItem(EBOOK_THEME_STORAGE_KEY, state.colorTheme);
            } catch {
                // Theme choice is purely cosmetic; ignore storage failures.
            }
            applyColorTheme(root, state);
            render();
        });
    });
    root.querySelector('#xb-agent-open-settings')?.addEventListener('click', () => {
        state.isSettingsOpen = true;
        state.configFormSyncPending = true;
        if (!renderSettingsSurface?.()) render();
    });
    root.querySelector('#xb-agent-settings-close')?.addEventListener('click', () => {
        state.isSettingsOpen = false;
        if (!renderSettingsSurface?.()) render();
    });
    root.querySelector('#xb-agent-clear')?.addEventListener('click', async () => {
        if (state.isBusy) return;
        await clearConversation?.(state.book?.id);
        showToast?.('创作对话已清空');
        render();
    });
    root.querySelectorAll('.xb-book').forEach((button) => {
        button.addEventListener('click', () => void bookController.selectBook(button.dataset.bookId || ''));
    });
    root.querySelectorAll('.xb-library-book').forEach((button) => {
        button.addEventListener('click', () => {
            if (state.isShelfLoading || state.shelfLoadError) return;
            const bookId = button.dataset.bookId || '';
            if (!bookId) return;
            void bookController.selectBook(bookId);
        });
    });
    root.querySelectorAll('[data-studio-layout]').forEach((button) => {
        button.addEventListener('click', () => {
            const layout = String(button.dataset.studioLayout || 'balanced');
            state.studioLayout = ['focus-editor', 'focus-agent'].includes(layout) ? layout : 'balanced';
            const shell = root.querySelector('.xb-studio-shell');
            shell?.classList.remove('balanced', 'focus-editor', 'focus-agent');
            shell?.classList.add(state.studioLayout);
            root.querySelectorAll('[data-studio-layout]').forEach((item) => {
                item.classList.toggle('is-active', item.dataset.studioLayout === state.studioLayout);
            });
        });
    });
    root.querySelectorAll('[data-entry-action]').forEach((button) => {
        button.addEventListener('click', () => {
            if (button.dataset.entryAction === 'reader') {
                void bookController.showReader();
                return;
            }
            void bookController.showStudio();
        });
    });
    root.querySelectorAll('[data-reader-path]').forEach((button) => {
        button.addEventListener('click', () => {
            root.querySelector('.xb-reader-screen')?.classList.remove('is-reader-index-open');
            void bookController.selectReaderChapter(button.dataset.readerPath || '');
        });
    });
    root.querySelector('#xb-mobile-file-picker')?.addEventListener('click', () => {
        root.querySelector('.xb-studio-shell')?.classList.add('is-file-drawer-open');
        scrollActiveStudioFileIntoView(root);
    });
    root.querySelectorAll('[data-mobile-file-drawer-close]').forEach((button) => {
        button.addEventListener('click', () => {
            root.querySelector('.xb-studio-shell')?.classList.remove('is-file-drawer-open');
        });
    });
    root.querySelector('#xb-reader-index-toggle')?.addEventListener('click', () => {
        root.querySelector('.xb-reader-screen')?.classList.add('is-reader-index-open');
    });
    root.querySelector('#xb-reader-index-close')?.addEventListener('click', () => {
        root.querySelector('.xb-reader-screen')?.classList.remove('is-reader-index-open');
    });
    root.querySelector('#xb-reader-index-scrim')?.addEventListener('click', () => {
        root.querySelector('.xb-reader-screen')?.classList.remove('is-reader-index-open');
    });
    root.querySelectorAll('[data-home-action]').forEach((button) => {
        button.addEventListener('click', () => {
            switch (button.dataset.homeAction) {
                case 'start-writing':
                    void bookController.selectFile('book/chapters/001.md');
                    break;
                case 'open-outline':
                    void bookController.selectFile('book/outline.md');
                    break;
                case 'import-chat':
                    void bookController.importMaterial('chat');
                    break;
                case 'back-library':
                    void bookController.showLibrary();
                    break;
                default:
                    break;
            }
        });
    });
    root.querySelectorAll('[data-action]').forEach((button) => {
        button.addEventListener('click', () => {
            const promptText = buildActionPrompt(button.dataset.action || '', {
                selectedPath: state.selectedPath,
            });
            void agentRunner.runAgent(promptText);
        });
    });
    function flashMessageActionButton(messageIndex, action, ok) {
        if (!Number.isInteger(messageIndex) || messageIndex < 0 || !action) return;
        const feedbackKey = `${action}:${messageIndex}`;
        if (messageActionFeedbackTimers.has(feedbackKey)) {
            clearTimeout(messageActionFeedbackTimers.get(feedbackKey));
            messageActionFeedbackTimers.delete(feedbackKey);
        }
        state.messageActionFeedback = {
            ...(state.messageActionFeedback || {}),
            [feedbackKey]: ok ? 'success' : 'error',
        };
        render();
        const timer = window.setTimeout(() => {
            messageActionFeedbackTimers.delete(feedbackKey);
            const nextFeedback = { ...(state.messageActionFeedback || {}) };
            delete nextFeedback[feedbackKey];
            state.messageActionFeedback = nextFeedback;
            render();
        }, 1200);
        messageActionFeedbackTimers.set(feedbackKey, timer);
    }

    async function handleMessageActionClick(button) {
        const messageIndex = Number.parseInt(button.dataset.messageIndex || '', 10);
        const action = String(button.dataset.messageAction || '').trim();
        if (!Number.isInteger(messageIndex) || messageIndex < 0 || !action) return;
        if (state.isBusy && action !== 'cancel-edit') return;
        const message = state.messages[messageIndex];
        if (!isEditableConversationTextMessage(message)) return;

        if (action === 'copy') {
            const copied = await copyText(message.content);
            flashMessageActionButton(messageIndex, action, copied);
            showToast?.(copied ? '已复制整条消息' : '复制失败');
            return;
        }

        if (action === 'edit') {
            if (state.isBusy) return;
            state.editingMessageIndex = messageIndex;
            render();
            const textarea = root.querySelector(`.xb-msg[data-message-index="${messageIndex}"] .xb-msg-editor`);
            textarea?.focus();
            textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
            return;
        }

        if (action === 'cancel-edit') {
            state.editingMessageIndex = -1;
            render();
            return;
        }

        if (action === 'save-edit') {
            if (state.isBusy) return;
            const textarea = root.querySelector(`.xb-msg[data-message-index="${messageIndex}"] .xb-msg-editor`);
            const nextContent = String(textarea?.value || '').trim();
            if (!nextContent) {
                showToast?.('消息内容不能为空');
                return;
            }
            state.messages[messageIndex] = {
                ...message,
                content: nextContent,
            };
            state.editingMessageIndex = -1;
            await persistConversation?.(state.book?.id);
            showToast?.('消息已更新');
            render();
            return;
        }

        if (action === 'delete') {
            if (state.isBusy) return;
            if (message.role === 'user') {
                state.messages.splice(messageIndex, findUserTurnEndIndex(state.messages, messageIndex) - messageIndex);
            } else {
                state.messages.splice(messageIndex, 1);
            }
            state.editingMessageIndex = -1;
            await persistConversation?.(state.book?.id);
            showToast?.('消息已删除');
            render();
            return;
        }

        if (action === 'reroll') {
            if (state.isBusy) return;
            const result = await agentRunner.rerunFromMessageIndex(messageIndex);
            if (result?.ok === false) {
                showToast?.('这条消息前没有可重跑的用户输入');
            }
        }
    }

    const handleDelegatedToggle = (event) => {
        const details = event.target;
        if (!details?.matches?.('.xb-tool-turn[data-tool-turn-key], .xb-thought-details[data-thought-key]')) return;
        if (details.matches('.xb-tool-turn[data-tool-turn-key]')) {
            if (state.isBusy && details.dataset.autoOpenToolTurn === 'true') return;
            const wasLazy = details.dataset.lazyToolTurn === 'true';
            state.openToolTurnKeys = updateOpenKeyList(
                state.openToolTurnKeys,
                details.dataset.toolTurnKey || '',
                details.open,
            );
            if (wasLazy || !details.open) {
                render();
            }
            return;
        }
        if (state.isBusy && details.dataset.autoOpenThought === 'true') return;
        state.openThoughtKeys = updateOpenKeyList(
            state.openThoughtKeys,
            details.dataset.thoughtKey || '',
            details.open,
        );
    };

    const handleDelegatedClick = (event) => {
        const messageAction = findClosest(event.target, '[data-message-action][data-message-index]');
        if (messageAction) {
            event.preventDefault?.();
            void handleMessageActionClick(messageAction);
            return;
        }
        const chapterSortToggle = findClosest(event.target, '[data-chapter-sort-toggle]');
        if (chapterSortToggle && root.contains(chapterSortToggle)) {
            event.preventDefault?.();
            void bookController.toggleChapterSortOrder();
            return;
        }
        const fileButton = findClosest(event.target, '.xb-file[data-path]');
        if (fileButton && root.contains(fileButton)) {
            event.preventDefault?.();
            root.querySelector('.xb-studio-shell')?.classList.remove('is-file-drawer-open');
            void bookController.selectFile(fileButton.dataset.path || '');
            return;
        }
        const importButton = findClosest(event.target, '[data-import]');
        if (importButton && root.contains(importButton) && !importButton.disabled) {
            event.preventDefault?.();
            void bookController.importMaterial(importButton.dataset.import || '');
        }
    };

    bindDelegatedRootEvents(root, {
        handleToggle: handleDelegatedToggle,
        handleClick: handleDelegatedClick,
    });

    const editor = root.querySelector('#xb-editor-text');
    editor?.addEventListener('keydown', (event) => {
        if (!isSaveShortcut(event)) return;
        event.preventDefault();
        void bookController.saveCurrentFile();
    });
    editor?.addEventListener('input', () => {
        state.editorContent = editor.value;
        const saveButton = root.querySelector('#xb-save');
        if (saveButton) saveButton.disabled = state.isBusy || !bookController.isEditorDirty();
        const drawButton = root.querySelector('#xb-draw-chapter');
        if (drawButton) drawButton.disabled = !canDrawSelectedChapter(state);
        updateEditorMeta(root, state, bookController);
    });

    const agentInput = root.querySelector('#xb-agent-input');
    agentInput?.addEventListener('input', () => {
        state.agentInputDraft = agentInput.value;
        updateComposeHint(root);
        autoSizeAgentInput(root);
    });
    agentInput?.addEventListener('keydown', (event) => {
        if (!isSendShortcut(event)) return;
        event.preventDefault();
        root.querySelector('#xb-agent-form')?.requestSubmit();
    });
    updateComposeHint(root);
    autoSizeAgentInput(root);

    root.querySelector('#xb-agent-form')?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (state.isBusy) {
            agentRunner.cancelActiveRun();
            return;
        }
        const input = root.querySelector('#xb-agent-input');
        const text = String(input?.value || state.agentInputDraft || '').trim();
        if (!text) return;
        state.agentInputDraft = '';
        if (input) input.value = '';
        autoSizeAgentInput(root);
        void agentRunner.runAgent(buildActionPrompt('custom', { text, selectedPath: state.selectedPath }));
    });

    // 上下导航按钮（抄小白助手）
    let agentScrollHideTimer = null;
    let agentScrollTicking = false;
    const agentMain = root.querySelector('.xb-agent-main');
    const scrollTopBtn = root.querySelector('#xb-agent-scroll-top');
    const scrollBottomBtn = root.querySelector('#xb-agent-scroll-bottom');
    const scrollHelpers = root.querySelector('#xb-agent-scroll-helpers');
    let agentTouchStartY = null;
    let agentLastScrollTop = Number(agentMain?.scrollTop || 0);

    function scrollAgentToBottom(container) {
        if (!container) return;
        const apply = () => { container.scrollTop = container.scrollHeight; };
        apply();
        scheduleFrame(() => { apply(); scheduleFrame(apply); });
    }

    function collapseAgentWindowAtBottom() {
        if (Number(state.uiMessageWindowLimit || 0) <= AGENT_MESSAGE_WINDOW_DEFAULT) return false;
        resetMessageWindow(state);
        render();
        scrollAgentToBottom(root.querySelector('.xb-agent-main'));
        return true;
    }

    function isAgentNearBottom(threshold = 48) {
        if (!agentMain) return true;
        return agentMain.scrollHeight - agentMain.scrollTop - agentMain.clientHeight <= threshold;
    }

    function isAgentAtBottom(threshold = 4) {
        if (!agentMain) return true;
        return agentMain.scrollHeight - agentMain.scrollTop - agentMain.clientHeight <= threshold;
    }

    function suspendAgentAutoScroll() {
        state.agentAutoScroll = false;
    }

    function revealOlderAgentMessages() {
        if (!agentMain || agentMain.scrollTop > 64) return false;
        const totalUnits = countMessageWindowUnits(state.messages || []);
        if (!expandMessageWindow(state, totalUnits)) return false;
        const previousScrollHeight = agentMain.scrollHeight;
        const previousScrollTop = agentMain.scrollTop;
        render();
        const restoreExpandedWindowScroll = () => {
            const nextAgentMain = root.querySelector('.xb-agent-main');
            if (!nextAgentMain) return;
            nextAgentMain.scrollTop = Math.max(0, nextAgentMain.scrollHeight - previousScrollHeight + previousScrollTop);
        };
        restoreExpandedWindowScroll();
        scheduleFrame(restoreExpandedWindowScroll);
        return true;
    }

    function updateAgentScrollButtonsVisibility() {
        if (!agentMain || !scrollTopBtn || !scrollBottomBtn) return;
        const threshold = 80;
        const st = agentMain.scrollTop;
        const sh = agentMain.scrollHeight;
        const ch = agentMain.clientHeight;
        scrollTopBtn.classList.toggle('visible', st > threshold);
        scrollBottomBtn.classList.toggle('visible', sh - st - ch > threshold);
    }

    function showScrollHelpers() { scrollHelpers?.classList.add('active'); }
    function hideScrollHelpers() { scrollHelpers?.classList.remove('active'); }
    function scheduleHideScrollHelpers() {
        if (agentScrollHideTimer) clearTimeout(agentScrollHideTimer);
        agentScrollHideTimer = setTimeout(() => { hideScrollHelpers(); agentScrollHideTimer = null; }, 1500);
        agentScrollHideTimer?.unref?.();
    }

    function handleAgentScroll() {
        if (!agentMain) return;
        if (revealOlderAgentMessages()) {
            state.agentAutoScroll = false;
            return;
        }
        const currentScrollTop = Number(agentMain.scrollTop || 0);
        const scrollingTowardBottom = currentScrollTop > agentLastScrollTop;
        agentLastScrollTop = currentScrollTop;
        const nearBottom = isAgentNearBottom();
        const atBottom = isAgentAtBottom();
        if (atBottom) {
            if (state.agentAutoScroll !== false || scrollingTowardBottom) {
                state.agentAutoScroll = true;
                if (collapseAgentWindowAtBottom()) return;
            }
        } else if (nearBottom && state.agentAutoScroll !== false) {
            state.agentAutoScroll = true;
        } else {
            state.agentAutoScroll = false;
        }
        if (agentScrollTicking) return;
        agentScrollTicking = true;
        scheduleFrame(() => {
            updateAgentScrollButtonsVisibility();
            showScrollHelpers();
            scheduleHideScrollHelpers();
            agentScrollTicking = false;
        });
    }

    agentMain?.addEventListener('scroll', () => {
        handleAgentScroll();
    });
    agentMain?.addEventListener('wheel', (event) => {
        if (Number(event?.deltaY || 0) < 0) {
            suspendAgentAutoScroll();
        }
    }, { passive: true });
    agentMain?.addEventListener('touchstart', (event) => {
        agentTouchStartY = Number(event?.touches?.[0]?.clientY);
    }, { passive: true });
    agentMain?.addEventListener('touchmove', (event) => {
        const currentY = Number(event?.touches?.[0]?.clientY);
        if (!Number.isFinite(agentTouchStartY) || !Number.isFinite(currentY)) {
            suspendAgentAutoScroll();
            return;
        }
        if (currentY > agentTouchStartY + 4 || !isAgentNearBottom()) {
            suspendAgentAutoScroll();
        }
    }, { passive: true });

    scrollTopBtn?.addEventListener('click', () => {
        state.agentAutoScroll = false;
        agentMain?.scrollTo({ top: 0, behavior: 'smooth' });
        showScrollHelpers();
        updateAgentScrollButtonsVisibility();
        scheduleHideScrollHelpers();
    });

    scrollBottomBtn?.addEventListener('click', () => {
        state.agentAutoScroll = true;
        if (!collapseAgentWindowAtBottom()) {
            scrollAgentToBottom(agentMain);
        }
        showScrollHelpers();
        updateAgentScrollButtonsVisibility();
        scheduleHideScrollHelpers();
    });

    updateAgentScrollButtonsVisibility();
    hydrateReaderImages(root, bookController);
}
