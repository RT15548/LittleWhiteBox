import { createEbookAgentRunner } from './agent-runner.js';
import { createBookController } from './book-controller.js';
import { createEbookConversationStore } from './conversation-store.js';
import { createAgentSettingsPanel } from '../../agent-core/ui/settings-panel.js';
import {
    createAdapter as createProviderAdapter,
    getActiveProviderConfig as resolveActiveProviderConfig,
    normalizeEbookConfig,
} from './provider-config.js';
import {
    collectAgentRenderUnits,
    collectStudioFileSectionModels,
    formatFileTitle,
    renderEbookShell,
    renderConversationContextMeterLabel,
    renderConversationContextMeterTitle,
    renderProviderReadiness,
    renderSettingsDialog,
} from './renderer.js';
import { createEbookState } from './state.js';
import { injectEbookStyles } from './styles.js';
import { bindEbookEvents } from './ui-bindings.js';
import { enhanceMarkdownContent } from '../../agent-core/ui/message-markdown.js';
import { formatDraftMetrics } from './text-metrics.js';
import { escapeHtml } from './text-utils.js';

const CONFIG_SAVE_TIMEOUT_MS = 5000;
const CONFIG_SAVE_RESULT_MS = 1800;
const CHAPTER_PATH_REGEX = /^book\/chapters\/.+\.md$/;
const EBOOK_IMAGE_MARKER_REGEX = /\[ebook-image:[a-z0-9\-_]+\]/gi;

function isChapterPath(path = '') {
    return CHAPTER_PATH_REGEX.test(String(path || ''));
}

function stripEbookImageMarkers(content = '') {
    return String(content || '').replace(EBOOK_IMAGE_MARKER_REGEX, '').trim();
}

function getScrollAnchorConfig(selector = '') {
    if (selector === '.xb-agent-main') {
        return {
            attr: 'data-agent-unit-key',
            datasetKey: 'agentUnitKey',
        };
    }
    if (selector === '.xb-reader-paper') {
        return {
            attr: 'data-reader-block-key',
            datasetKey: 'readerBlockKey',
        };
    }
    return null;
}

function isVolatileScrollAnchorKey(selector = '', key = '') {
    return selector === '.xb-agent-main' && String(key || '').startsWith('history-gate:');
}

export function shouldForceAgentScrollToBottom(state = {}, snapshot = null) {
    if (state.agentForceScrollBottomOnce) return true;
    if (state.agentAutoScroll === false) return false;
    return !snapshot || snapshot.nearBottom !== false;
}

export function captureScrollState(root, selector) {
    const node = root?.querySelector?.(selector);
    if (!node) return null;
    const distanceToBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    const containerRect = typeof node.getBoundingClientRect === 'function'
        ? node.getBoundingClientRect()
        : null;
    const anchorConfig = getScrollAnchorConfig(selector);
    const visibleAnchors = containerRect && anchorConfig
        ? Array.from(node.querySelectorAll?.(`[${anchorConfig.attr}]`) || [])
            .map((item) => ({
                key: item?.dataset?.[anchorConfig.datasetKey] || '',
                rect: typeof item?.getBoundingClientRect === 'function'
                    ? item.getBoundingClientRect()
                    : null,
            }))
            .filter((item) => (
                item.key
                && item.rect
                && item.rect.bottom >= containerRect.top + 1
                && item.rect.top <= containerRect.bottom - 1
            ))
        : [];
    const stableAnchors = visibleAnchors.filter((item) => !isVolatileScrollAnchorKey(selector, item.key));
    const anchors = [...stableAnchors, ...visibleAnchors.filter((item) => isVolatileScrollAnchorKey(selector, item.key))]
        .map((item) => ({
            key: item.key,
            topOffset: item.rect ? item.rect.top - containerRect.top : 0,
        }));
    const anchor = anchors[0]
        || null;
    return {
        selector,
        scrollTop: node.scrollTop,
        nearBottom: distanceToBottom < 80,
        distanceToBottom,
        scrollHeight: node.scrollHeight,
        clientHeight: node.clientHeight,
        anchorKey: anchor?.key || '',
        anchorTopOffset: anchor?.topOffset || 0,
        anchors,
    };
}

export function restoreScrollState(root, snapshot, defaultSelector = null, options = {}) {
    const selector = snapshot?.selector || defaultSelector;
    if (!selector) return;
    const node = root?.querySelector?.(selector);
    if (!node) return;
    if (options.forceBottom) {
        node.scrollTop = node.scrollHeight;
        return;
    }
    if (!snapshot) {
        if (options.defaultToBottom !== false) {
            node.scrollTop = node.scrollHeight;
        }
        return;
    }
    if (options.preserveScrollTop) {
        node.scrollTop = Math.min(Math.max(0, snapshot.scrollTop), node.scrollHeight);
        const anchors = snapshot.anchors?.length
            ? snapshot.anchors
            : snapshot.anchorKey
                ? [{ key: snapshot.anchorKey, topOffset: snapshot.anchorTopOffset }]
                : [];
        if (anchors.length && options.preserveAnchor !== false) {
            const anchorConfig = getScrollAnchorConfig(selector);
            const containerRect = typeof node.getBoundingClientRect === 'function'
                ? node.getBoundingClientRect()
                : null;
            const currentAnchors = anchorConfig
                ? Array.from(node.querySelectorAll?.(`[${anchorConfig.attr}]`) || [])
                : [];
            const matchedAnchor = anchors
                .map((anchorItem) => {
                    const anchorNode = currentAnchors
                        .find((item) => item?.dataset?.[anchorConfig.datasetKey] === anchorItem.key);
                    const anchorRect = typeof anchorNode?.getBoundingClientRect === 'function'
                        ? anchorNode.getBoundingClientRect()
                        : null;
                    return anchorRect ? { rect: anchorRect, topOffset: anchorItem.topOffset } : null;
                })
                .find(Boolean);
            if (containerRect && matchedAnchor) {
                const nextOffset = matchedAnchor.rect.top - containerRect.top;
                node.scrollTop = Math.min(
                    Math.max(0, node.scrollTop + nextOffset - Number(matchedAnchor.topOffset || 0)),
                    node.scrollHeight,
                );
            }
        }
        return;
    }
    node.scrollTop = snapshot.nearBottom
        ? node.scrollHeight
        : Math.min(snapshot.scrollTop, node.scrollHeight);
}

export function shouldResetReaderScrollOnRender(previousReaderPath = '', nextViewMode = '', nextReaderPath = '') {
    return nextViewMode === 'reader'
        && String(previousReaderPath || '') !== String(nextReaderPath || '')
        && isChapterPath(nextReaderPath);
}

function updateAgentScrollButtons(root) {
    const agentMain = root?.querySelector?.('.xb-agent-main');
    const scrollTopButton = root?.querySelector?.('#xb-agent-scroll-top');
    const scrollBottomButton = root?.querySelector?.('#xb-agent-scroll-bottom');
    if (!agentMain || !scrollTopButton || !scrollBottomButton) return;
    const threshold = 80;
    const scrollTop = Number(agentMain.scrollTop || 0);
    const distanceToBottom = agentMain.scrollHeight - scrollTop - agentMain.clientHeight;
    scrollTopButton.classList.toggle('visible', scrollTop > threshold);
    scrollBottomButton.classList.toggle('visible', distanceToBottom > threshold);
}

function buildHtmlElement(html = '') {
    const template = document.createElement('template');
    // Dynamic values are escaped by renderer helpers before interpolation.
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = String(html || '').trim();
    return template.content.firstElementChild || document.createTextNode('');
}

function applyAgentRenderUnits(container, previousUnits = [], unitSpecs = [], enhanceNode = () => {}) {
    const nextUnits = [];
    unitSpecs.forEach((unit, index) => {
        const previousUnit = previousUnits[index];
        const canReuseNode = previousUnit?.signature === unit.signature
            && previousUnit.node?.parentNode === container;
        const node = canReuseNode ? previousUnit.node : buildHtmlElement(unit.html);
        const currentNode = container.childNodes[index] || null;

        if (currentNode !== node) {
            container.insertBefore(node, currentNode);
        }
        if (!canReuseNode && previousUnit?.node?.parentNode === container && previousUnit.node !== node) {
            previousUnit.node.remove();
        }
        if (!canReuseNode && node?.nodeType === (globalThis.Node?.ELEMENT_NODE || 1)) {
            enhanceNode(node);
        }
        if (node?.nodeType === (globalThis.Node?.ELEMENT_NODE || 1)) {
            node.dataset.agentUnitKey = unit.key;
        }

        nextUnits.push({
            signature: unit.signature,
            node,
        });
    });

    while (container.childNodes.length > unitSpecs.length) {
        container.lastChild?.remove();
    }
    return nextUnits;
}

function getDirectFileButtons(groupNode) {
    return Array.from(groupNode?.children || []).filter((node) => (
        node?.classList?.contains?.('xb-file') && node?.dataset?.path
    ));
}

function getFileGroupNode(filesNode, groupKey = '') {
    return Array.from(filesNode?.children || []).find((node) => (
        node?.classList?.contains?.('xb-file-group')
        && node?.dataset?.fileGroupKey === groupKey
    )) || null;
}

function replaceFileGroupScaffold(groupNode, group = {}) {
    const replacement = buildHtmlElement(group.scaffoldHtml);
    getDirectFileButtons(groupNode).forEach((button) => replacement.appendChild(button));
    const emptyNode = Array.from(groupNode.children || []).find((node) => node?.dataset?.fileGroupEmpty === 'true');
    if (emptyNode) replacement.appendChild(emptyNode);
    groupNode.replaceWith(replacement);
    return replacement;
}

function syncFileGroupFiles(groupNode, group = {}) {
    if (!groupNode) return;
    if (group.treeHtml) {
        const nextTree = buildHtmlElement(group.treeHtml);
        const currentTree = Array.from(groupNode.children || []).find((node) => node?.classList?.contains?.('xb-file-tree'));
        if (!currentTree) {
            groupNode.appendChild(nextTree);
        } else if (currentTree.dataset.fileTreeSignature !== nextTree.dataset.fileTreeSignature) {
            currentTree.replaceWith(nextTree);
        } else {
            // Structure unchanged — only the active selection may have moved. Toggle the
            // is-active class in place so we don't rebuild (and lose scroll of) the tree.
            const activePaths = new Set((group.files || [])
                .filter((file) => file.active)
                .map((file) => file.path));
            currentTree.querySelectorAll('.xb-file[data-path]').forEach((button) => {
                button.classList.toggle('is-active', activePaths.has(button.dataset.path || ''));
            });
        }
        return;
    }
    const expectedPaths = new Set((group.files || []).map((file) => file.path));
    getDirectFileButtons(groupNode).forEach((button) => {
        if (!expectedPaths.has(button.dataset.path || '')) button.remove();
    });

    const emptyNode = Array.from(groupNode.children || []).find((node) => node?.dataset?.fileGroupEmpty === 'true');
    if (!group.files?.length) {
        getDirectFileButtons(groupNode).forEach((button) => button.remove());
        if (!emptyNode) groupNode.appendChild(buildHtmlElement(group.emptyHtml));
        return;
    }
    emptyNode?.remove();

    group.files.forEach((file, index) => {
        let button = getDirectFileButtons(groupNode).find((node) => node.dataset.path === file.path);
        if (!button) {
            button = buildHtmlElement(file.html);
        } else if (button.dataset.fileSignature !== file.signature) {
            const nextButton = buildHtmlElement(file.html);
            button.replaceWith(nextButton);
            button = nextButton;
        }
        button.dataset.fileSignature = file.signature;
        button.classList.toggle('is-active', !!file.active);
        const currentButtons = getDirectFileButtons(groupNode);
        const target = currentButtons[index] || null;
        if (target && target !== button) {
            groupNode.insertBefore(button, target);
        } else if (!target) {
            groupNode.appendChild(button);
        }
    });
}

function createRequestId(prefix = 'req') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEbookApp(options = {}) {
    const {
        rootId,
        hostBridge,
    } = options;
    const state = createEbookState();
    let configSaveTimeout = null;
    let configSaveResetTimer = null;
    let agentRenderCache = [];
    let lastRenderedReaderPath = '';
    const renderPerfCounters = {
        fullRender: 0,
        agentSurface: 0,
        toolTraceSurface: 0,
        filesSurface: 0,
        editorSurface: 0,
    };

    try {
        globalThis.__xiaobaixEbookPerfCounters = renderPerfCounters;
    } catch {
        // Debug counters are optional and must never affect runtime behavior.
    }

    function bumpRenderPerfCounter(name = '') {
        if (Object.prototype.hasOwnProperty.call(renderPerfCounters, name)) {
            renderPerfCounters[name] += 1;
        }
    }

    function getActiveProviderConfig(options = {}) {
        return resolveActiveProviderConfig(state.config, options);
    }

    function createAdapter(providerConfig = getActiveProviderConfig()) {
        return createProviderAdapter(providerConfig);
    }

    function showToast(message = '') {
        state.toast = String(message || '');
        if (!renderToastSurface()) render();
        if (state.toast) {
            setTimeout(() => {
                if (state.toast === message) {
                    state.toast = '';
                    if (!renderToastSurface()) render();
                }
            }, 2200);
        }
    }

    function describeError(error) {
        return error instanceof Error ? error.message : String(error || 'unknown_error');
    }

    function clearConfigSaveTimers() {
        if (configSaveTimeout) {
            clearTimeout(configSaveTimeout);
            configSaveTimeout = null;
        }
        if (configSaveResetTimer) {
            clearTimeout(configSaveResetTimer);
            configSaveResetTimer = null;
        }
    }

    function scheduleConfigSaveReset(delay = CONFIG_SAVE_RESULT_MS) {
        if (configSaveResetTimer) {
            clearTimeout(configSaveResetTimer);
        }
        configSaveResetTimer = setTimeout(() => {
            configSaveResetTimer = null;
            state.configSave = {
                status: 'idle',
                requestId: '',
                error: '',
            };
            if (!renderSettingsSurface()) render();
        }, delay);
    }

    function beginConfigSave(requestId) {
        clearConfigSaveTimers();
        state.configSave = {
            status: 'saving',
            requestId,
            error: '',
        };
        configSaveTimeout = setTimeout(() => {
            configSaveTimeout = null;
            if (state.configSave.requestId !== requestId || state.configSave.status !== 'saving') {
                return;
            }
            state.configSave = {
                status: 'error',
                requestId,
                error: '保存超时，请重试',
            };
            if (!renderSettingsSurface()) render();
            scheduleConfigSaveReset();
        }, CONFIG_SAVE_TIMEOUT_MS);
        if (!renderSettingsSurface()) render();
    }

    function completeConfigSave(requestId, { ok, error = '' } = {}) {
        if (requestId && state.configSave.requestId && state.configSave.requestId !== requestId) {
            return;
        }
        if (configSaveTimeout) {
            clearTimeout(configSaveTimeout);
            configSaveTimeout = null;
        }
        state.configSave = {
            status: ok ? 'success' : 'error',
            requestId: requestId || state.configSave.requestId || '',
            error: ok ? '' : String(error || '保存失败'),
        };
        if (!renderSettingsSurface()) render();
        scheduleConfigSaveReset();
    }

    let bookController;
    let agentRunner;
    let startupHydrationPromise = null;
    const conversationStore = createEbookConversationStore({ state });
    const settingsPanel = createAgentSettingsPanel({
        state,
        render: () => {
            if (!renderSettingsSurface()) render();
        },
        showToast,
        createRequestId,
        describeError,
        saveConfig: async ({ requestId, config, payload }) => {
            beginConfigSave(requestId);
            try {
                const result = await hostBridge.requestHost('xb-ebook:save-config', payload);
                state.config = normalizeEbookConfig(result?.config || config || {});
                state.configDraft = null;
                state.configFormSyncPending = true;
                completeConfigSave(requestId, { ok: true });
                showToast('配置已保存');
                if (!renderSettingsSurface()) render();
                if (!renderAgentControlsSurface()) renderAgentSurface();
            } catch (error) {
                completeConfigSave(requestId, { ok: false, error: describeError(error) });
                showToast(describeError(error));
            }
        },
        getRuntimeSummaryText: ({ providerLabel }) => providerLabel,
    });

    function captureFocusState(root) {
        const active = document.activeElement;
        if (!active || !root?.contains?.(active)) return null;
        const id = String(active.id || '').trim();
        if (!id) return null;
        return {
            id,
            selectionStart: Number.isFinite(active.selectionStart) ? active.selectionStart : null,
            selectionEnd: Number.isFinite(active.selectionEnd) ? active.selectionEnd : null,
        };
    }

    function restoreFocusState(root, snapshot) {
        if (!snapshot?.id) return;
        const node = document.getElementById(snapshot.id);
        if (!node || !root?.contains?.(node)) return;
        try {
            node.focus({ preventScroll: true });
        } catch {
            node.focus?.();
        }
        if (
            Number.isFinite(snapshot.selectionStart)
            && Number.isFinite(snapshot.selectionEnd)
            && typeof node.setSelectionRange === 'function'
        ) {
            try {
                node.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd);
            } catch {
                // Not all focused elements expose a text selection.
            }
        }
    }

    function renderAgentSurface() {
        const root = document.getElementById(rootId);
        if (!root || state.viewMode !== 'studio') return false;
        const shell = root.querySelector('.xb-studio-shell');
        const agentMain = root.querySelector('.xb-agent-main');
        const agentLog = root.querySelector('.xb-agent-log');
        if (!shell || !agentMain || !agentLog) return false;

        const contextMeter = root.querySelector('.xb-agent-context-meter');
        if (contextMeter) {
            const providerConfig = getActiveProviderConfig();
            contextMeter.textContent = renderConversationContextMeterLabel(state, providerConfig);
            contextMeter.title = renderConversationContextMeterTitle(state, providerConfig);
        }

        const agentScroll = captureScrollState(root, '.xb-agent-main');
        const shouldAutoScrollAgent = shouldForceAgentScrollToBottom(state, agentScroll);
        agentMain.classList.toggle('is-busy', !!state.isBusy);
        agentRenderCache = applyAgentRenderUnits(
            agentLog,
            agentRenderCache,
            collectAgentRenderUnits(state),
            (node) => node.querySelectorAll?.('.xb-msg-markdown, .xb-tool-preface-markdown').forEach((markdownNode) => {
                enhanceMarkdownContent(markdownNode, {
                    codeBlockClassName: 'xb-assistant-codeblock',
                    codeCopyClassName: 'xb-assistant-code-copy',
                });
                markdownNode.dataset.markdownEnhanced = 'true';
            }),
        );
        agentLog.querySelectorAll('.xb-msg-markdown, .xb-tool-preface-markdown').forEach((node) => {
            if (node.dataset.markdownEnhanced === 'true') return;
            enhanceMarkdownContent(node, {
                codeBlockClassName: 'xb-assistant-codeblock',
                codeCopyClassName: 'xb-assistant-code-copy',
            });
            node.dataset.markdownEnhanced = 'true';
        });

        const sendButton = root.querySelector('#xb-agent-form button[type="submit"]');
        if (sendButton) {
            sendButton.classList.toggle('is-busy', !!state.isBusy);
            sendButton.textContent = state.isCancellingRun ? '…' : state.isBusy ? '■' : '➤';
            sendButton.title = state.isCancellingRun ? '正在停止' : state.isBusy ? '停止' : '发送';
            sendButton.setAttribute('aria-label', sendButton.title);
            if (state.isBusy) {
                sendButton.disabled = !!state.isCancellingRun;
            }
        }

        const clearButton = root.querySelector('#xb-agent-clear');
        if (clearButton) {
            const canClearConversation = !!state.messages?.length;
            clearButton.disabled = state.isBusy || !canClearConversation;
        }

        restoreScrollState(root, agentScroll, '.xb-agent-main', {
            forceBottom: shouldAutoScrollAgent,
            defaultToBottom: shouldAutoScrollAgent,
            preserveScrollTop: !shouldAutoScrollAgent,
        });
        state.agentForceScrollBottomOnce = false;
        updateAgentScrollButtons(root);
        bumpRenderPerfCounter('agentSurface');
        return true;
    }

    function renderToolTraceSurface() {
        const ok = renderAgentSurface();
        if (ok) bumpRenderPerfCounter('toolTraceSurface');
        return ok;
    }

    function renderAgentControlsSurface() {
        const root = document.getElementById(rootId);
        if (!root || state.viewMode !== 'studio') return false;
        const shell = root.querySelector('.xb-studio-shell');
        const input = root.querySelector('#xb-agent-input');
        const sendButton = root.querySelector('#xb-agent-form button[type="submit"]');
        if (!shell || !input || !sendButton) return false;

        const readiness = renderProviderReadiness(getActiveProviderConfig());
        const canUseAgent = !state.isBusy && readiness.canRun;
        input.disabled = !canUseAgent;
        input.placeholder = readiness.canRun
            ? '写作指令，例如：把当前段落改得更克制一点，或者先列三种开场方案'
            : '先补好 API 和模型信息';
        sendButton.disabled = !canUseAgent;
        root.querySelectorAll('[data-action]').forEach((button) => {
            button.disabled = !canUseAgent;
        });
        return true;
    }

    function renderEditorTitleSurface(root) {
        const fileTitle = formatFileTitle(state.selectedPath || 'book/chapters/001.md');
        const mobileTitle = root.querySelector('#xb-mobile-file-picker strong');
        const pathNode = root.querySelector('.xb-path');
        if (mobileTitle) mobileTitle.textContent = fileTitle;
        if (pathNode) pathNode.textContent = fileTitle;
    }

    function renderEditorTextSurface(root) {
        const editor = root.querySelector('#xb-editor-text');
        if (!editor) return;
        const active = document.activeElement;
        editor.disabled = !!state.isBusy;
        if (active !== editor && editor.value !== state.editorContent) {
            editor.value = state.editorContent || '';
        }
    }

    function renderEditorActionsSurface(root) {
        const dirty = bookController.isEditorDirty();
        const saveButton = root.querySelector('#xb-save');
        const drawButton = root.querySelector('#xb-draw-chapter');
        if (saveButton) {
            saveButton.disabled = !(dirty && !state.isBusy);
        }
        if (!drawButton) return;
        const drawStatus = state.drawStatus || {};
        const drawIsChapter = isChapterPath(state.selectedPath);
        const drawReady = !!drawStatus.enabled && !!drawStatus.ready;
        const canDrawChapter = !!(state.isDrawingChapter || (
            !state.isBusy
            && drawIsChapter
            && drawReady
            && stripEbookImageMarkers(state.editorContent)
        ));
        const drawTitle = state.isDrawingChapter
            ? '停止当前章节配图'
            : !drawIsChapter
                ? '只有正文章节可以配图'
                : !drawReady
                    ? '画图后端未启用'
                    : !stripEbookImageMarkers(state.editorContent)
                        ? '当前章节没有正文'
                        : '为当前章节生成配图';
        drawButton.disabled = !canDrawChapter;
        drawButton.textContent = state.isDrawingChapter ? '停止' : '配图';
        drawButton.title = drawTitle;
        drawButton.setAttribute('aria-label', drawTitle);
    }

    function renderEditorMetaSurface(root) {
        const editorMeta = root.querySelector('#xb-editor-meta');
        if (!editorMeta) return;
        const dirty = bookController.isEditorDirty();
        const drawProgressText = state.drawProgressText ? ` · ${state.drawProgressText}` : '';
        editorMeta.textContent = `${dirty ? '有未保存修改' : '已保存到书库'} · ${formatDraftMetrics(state.editorContent || '')}${drawProgressText}`;
    }

    function renderStudioSurface() {
        const root = document.getElementById(rootId);
        if (!root || state.viewMode !== 'studio') return false;
        const shell = root.querySelector('.xb-studio-shell');
        if (!shell) return false;

        renderEditorTitleSurface(root);
        renderEditorTextSurface(root);
        renderEditorActionsSurface(root);
        renderEditorMetaSurface(root);
        bumpRenderPerfCounter('editorSurface');
        return true;
    }

    function renderFilesSurface() {
        const root = document.getElementById(rootId);
        if (!root || state.viewMode !== 'studio') return false;
        const shell = root.querySelector('.xb-studio-shell');
        const filesNode = root.querySelector('.xb-files');
        if (!shell || !filesNode) return false;
        const writeActionAttr = state.isBusy ? 'disabled' : '';
        const model = collectStudioFileSectionModels(state, { writeActionAttr });
        if (model.emptyHtml) {
            if (filesNode.dataset.fileRenderMode !== 'empty' || filesNode.textContent.trim() !== '还没有书稿文件') {
                filesNode.replaceChildren(buildHtmlElement(model.emptyHtml));
                filesNode.dataset.fileRenderMode = 'empty';
            }
        } else {
            filesNode.dataset.fileRenderMode = 'sections';
            const expectedGroupKeys = new Set(model.groups.map((group) => group.key));
            Array.from(filesNode.children).forEach((node) => {
                if (!node?.classList?.contains?.('xb-file-group')) node.remove();
            });
            model.groups.forEach((group, index) => {
                let groupNode = getFileGroupNode(filesNode, group.key);
                if (!groupNode) {
                    groupNode = buildHtmlElement(group.scaffoldHtml);
                } else if (groupNode.dataset.fileStaticSignature !== group.staticSignature) {
                    groupNode = replaceFileGroupScaffold(groupNode, group);
                }
                groupNode.dataset.fileStaticSignature = group.staticSignature;
                const target = filesNode.children[index] || null;
                if (target && target !== groupNode) {
                    filesNode.insertBefore(groupNode, target);
                } else if (!target) {
                    filesNode.appendChild(groupNode);
                }
                syncFileGroupFiles(groupNode, group);
            });
            Array.from(filesNode.children).forEach((node) => {
                if (
                    node?.classList?.contains?.('xb-file-group')
                    && !expectedGroupKeys.has(node.dataset.fileGroupKey || '')
                ) {
                    node.remove();
                }
            });
        }
        const title = state.book?.title || '未命名书稿';
        const titleNode = root.querySelector('.xb-title-row h1');
        if (titleNode) titleNode.textContent = title;
        bumpRenderPerfCounter('filesSurface');
        return true;
    }

    function renderEditorFileSurface() {
        const root = document.getElementById(rootId);
        if (!root || state.viewMode !== 'studio') return false;
        const shell = root.querySelector('.xb-studio-shell');
        if (!shell) return false;
        renderEditorTitleSurface(root);
        renderEditorTextSurface(root);
        renderEditorActionsSurface(root);
        renderEditorMetaSurface(root);
        bumpRenderPerfCounter('editorSurface');
        return true;
    }

    function renderSettingsSurface() {
        const root = document.getElementById(rootId);
        if (!root) return false;
        const existingOverlay = root.querySelector('#xb-agent-settings-overlay');
        if (!state.isSettingsOpen) {
            existingOverlay?.remove();
            return true;
        }

        const settingsScroll = captureScrollState(root, '.xb-ebook-settings-body');
        const focusState = captureFocusState(root);
        const wasOpen = !!existingOverlay;
        const nextOverlay = buildHtmlElement(renderSettingsDialog(state));
        if (existingOverlay) {
            existingOverlay.replaceWith(nextOverlay);
        } else {
            const host = root.querySelector('.xb-ebook-shell, .xb-ebook-screen') || root;
            host.appendChild(nextOverlay);
        }

        settingsPanel.syncConfigToForm(root);
        state.configFormSyncPending = false;
        settingsPanel.bindSettingsPanelEvents(root);
        root.querySelector('#xb-agent-settings-close')?.addEventListener('click', () => {
            state.isSettingsOpen = false;
            renderSettingsSurface();
        });

        if (wasOpen && settingsScroll) {
            restoreScrollState(root, settingsScroll, '.xb-ebook-settings-body', {
                defaultToBottom: false,
            });
            restoreFocusState(root, focusState);
        }
        return true;
    }

    function renderToastSurface() {
        const root = document.getElementById(rootId);
        if (!root) return false;
        root.querySelectorAll('.xb-toast').forEach((node) => node.remove());
        if (!state.toast) return true;
        const toast = buildHtmlElement(`<div class="xb-toast">${escapeHtml(state.toast)}</div>`);
        const host = root.querySelector('.xb-ebook-shell, .xb-ebook-screen') || root;
        host.appendChild(toast);
        return true;
    }

    function renderPassiveSurface() {
        const root = document.getElementById(rootId);
        if (!root) return false;
        if (state.viewMode !== 'reader') return false;
        renderToastSurface();
        renderSettingsSurface();
        return true;
    }

    function renderProtocolNoticeSurface() {
        const root = document.getElementById(rootId);
        if (!root || state.viewMode !== 'studio') return false;
        const host = root.querySelector('.xb-agent-chat-wrap');
        if (!host) return false;
        host.querySelectorAll('.xb-protocol-notice').forEach((node) => node.remove());
        const message = String(state.protocolNotice?.message || '').trim();
        if (!message) return true;
        const notice = buildHtmlElement(`
            <div class="xb-protocol-notice" role="status" aria-live="polite">
                <span>${escapeHtml(message)}</span>
            </div>
        `);
        host.appendChild(notice);
        return true;
    }

    function render() {
        const root = document.getElementById(rootId);
        if (!root) return;
        bumpRenderPerfCounter('fullRender');
        const agentScroll = captureScrollState(root, '.xb-agent-main');
        const readerScroll = captureScrollState(root, '.xb-reader-paper');
        const settingsScroll = captureScrollState(root, '.xb-ebook-settings-body');
        const focusState = captureFocusState(root);
        const wasSettingsOpen = !!root.querySelector('.xb-ebook-settings-body');
        const shouldResetReaderScroll = shouldResetReaderScrollOnRender(
            lastRenderedReaderPath,
            state.viewMode,
            state.readerPath,
        );
        const providerConfig = getActiveProviderConfig();
        // Dynamic values are escaped by renderer helpers before interpolation.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = renderEbookShell({
            state,
            providerConfig,
            dirty: bookController.isEditorDirty(),
        });
        agentRenderCache = [];
        root.querySelectorAll('.xb-msg-markdown, .xb-tool-preface-markdown').forEach((node) => {
            enhanceMarkdownContent(node, {
                codeBlockClassName: 'xb-assistant-codeblock',
                codeCopyClassName: 'xb-assistant-code-copy',
            });
        });
        if (state.isSettingsOpen) {
            settingsPanel.syncConfigToForm(root);
            state.configFormSyncPending = false;
            settingsPanel.bindSettingsPanelEvents(root);
        }
        bindEbookEvents({
            root,
            state,
            render,
            renderSettingsSurface,
            postToHost: hostBridge.postToHost,
            bookController,
            agentRunner,
            persistConversation: conversationStore.persistConversation,
            clearConversation: conversationStore.clearConversation,
            showToast,
            hydrateStartup: hydrateEbookStartup,
        });
        const shouldAutoScrollAgent = shouldForceAgentScrollToBottom(state, agentScroll);
        restoreScrollState(root, agentScroll, '.xb-agent-main', {
            forceBottom: shouldAutoScrollAgent,
            defaultToBottom: shouldAutoScrollAgent,
            preserveScrollTop: !shouldAutoScrollAgent,
        });
        state.agentForceScrollBottomOnce = false;
        restoreScrollState(root, readerScroll, '.xb-reader-paper', {
            defaultToBottom: false,
            preserveScrollTop: true,
        });
        if (shouldResetReaderScroll) {
            const readerPaper = root.querySelector('.xb-reader-paper');
            if (readerPaper) readerPaper.scrollTop = 0;
        }
        if (state.isSettingsOpen) {
            const settingsBody = root.querySelector('.xb-ebook-settings-body');
            if (settingsBody) {
                if (wasSettingsOpen && settingsScroll) {
                    restoreScrollState(root, settingsScroll, '.xb-ebook-settings-body', {
                        defaultToBottom: false,
                    });
                } else {
                    settingsBody.scrollTop = 0;
                }
            }
        }
        if (wasSettingsOpen === state.isSettingsOpen) {
            restoreFocusState(root, focusState);
        }
        lastRenderedReaderPath = state.viewMode === 'reader' && isChapterPath(state.readerPath)
            ? state.readerPath
            : '';
    }

    bookController = createBookController({
        state,
        render,
        renderStudioSurface,
        renderFilesSurface,
        requestHost: hostBridge.requestHost,
        showToast,
        conversationStore,
    });

    agentRunner = createEbookAgentRunner({
        state,
        refreshBooksAndFiles: bookController.refreshBooksAndFiles,
        render,
        renderAgentSurface,
        renderPassiveSurface,
        renderToolTraceSurface,
        renderFilesSurface,
        renderEditorFileSurface,
        showToast,
        persistConversation: conversationStore.persistConversation,
        isEditorDirty: bookController.isEditorDirty,
        getActiveProviderConfig,
        createAdapter,
        renderProtocolNoticeSurface,
    });

    function handleHostConfig(payload = {}) {
        state.config = normalizeEbookConfig(payload?.config || {});
        state.configDraft = null;
        state.configFormSyncPending = true;
        render();
    }

    function handleOpenSettings() {
        state.isSettingsOpen = true;
        state.configFormSyncPending = true;
        if (!renderSettingsSurface()) render();
    }

    function handleDrawProgress(payload = {}) {
        bookController.handleDrawProgress(payload);
    }

    function handleTtsState(payload = {}) {
        bookController.handleTtsState(payload);
    }

    async function hydrateEbookStartup(options = {}) {
        if (startupHydrationPromise) return startupHydrationPromise;
        state.isShelfLoading = true;
        state.shelfLoadError = '';
        state.status = '正在打开书架...';
        if (options.renderInitial !== false) {
            render();
        }
        startupHydrationPromise = (async () => {
            try {
                await bookController.initializeBook();
                state.isShelfLoading = false;
                state.status = '就绪';
                render();
                void bookController.refreshDrawStatus({ renderAfter: true });
                void bookController.refreshTtsStatus({ renderAfter: true });
            } catch (error) {
                state.isShelfLoading = false;
                state.shelfLoadError = error?.message || String(error || 'shelf_load_failed');
                state.status = `书架加载失败：${state.shelfLoadError}`;
                render();
            } finally {
                startupHydrationPromise = null;
            }
        })();
        return startupHydrationPromise;
    }

    function start() {
        injectEbookStyles(rootId);
        state.isShelfLoading = true;
        state.shelfLoadError = '';
        state.status = '正在打开书架...';
        render();
        hostBridge.postToHost('xb-ebook:frame-ready');
        void hydrateEbookStartup({ renderInitial: false });
    }

    return {
        handleDrawProgress,
        handleHostConfig,
        handleOpenSettings,
        handleTtsState,
        start,
        state,
    };
}
