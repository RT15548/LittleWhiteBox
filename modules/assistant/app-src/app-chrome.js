export function collectContextHintItems(state = {}) {
    const workspaceSelection = state.workspaceSelectionContext || {};
    const externalEditorContext = state.externalEditorContext || null;
    const contextItems = [];
    const selectedFilePath = String(state.selectedFilePath || '').trim();
    const selectedTreePath = String(state.selectedTreePath || '').trim();

    if (externalEditorContext && (externalEditorContext.filePath || externalEditorContext.note || externalEditorContext.selectionText)) {
        const parts = [];
        if (externalEditorContext.filePath) {
            parts.push(`外部编辑器：${externalEditorContext.filePath}`);
        } else {
            parts.push('外部编辑器上下文');
        }
        if (externalEditorContext.lineStart) {
            parts.push(
                externalEditorContext.lineEnd && externalEditorContext.lineEnd !== externalEditorContext.lineStart
                    ? `第 ${externalEditorContext.lineStart}-${externalEditorContext.lineEnd} 行`
                    : `第 ${externalEditorContext.lineStart} 行`,
            );
        }
        if (externalEditorContext.selectionText) {
            parts.push('含选中文本');
        }
        contextItems.push(parts.join(' · '));
    }

    if (state.isWorkspaceOpen) {
        if (selectedTreePath && String(selectedTreePath).endsWith('/') && (!selectedFilePath || selectedTreePath !== selectedFilePath)) {
            const parts = [`工作区目录：${selectedTreePath}`];
            if (!selectedFilePath) {
                parts.push('未锁定具体文件');
            }
            contextItems.push(parts.join(' · '));
        } else if (selectedFilePath) {
            const parts = [`工作区文件：${selectedFilePath}`];
            if (workspaceSelection.text && workspaceSelection.filePath === selectedFilePath) {
                if (workspaceSelection.lineStart) {
                    parts.push(
                        workspaceSelection.lineEnd && workspaceSelection.lineEnd !== workspaceSelection.lineStart
                            ? `已选第 ${workspaceSelection.lineStart}-${workspaceSelection.lineEnd} 行`
                            : `已选第 ${workspaceSelection.lineStart} 行`,
                    );
                } else {
                    parts.push('含选中文本');
                }
            }
            contextItems.push(parts.join(' · '));
        }
    }

    return contextItems;
}

export function renderContextHint(root, state) {
    if (!root) return;
    const contextHint = root.querySelector('#xb-assistant-context-hint');
    if (!contextHint) return;

    const contextItems = collectContextHintItems(state);
    contextHint.toggleAttribute('hidden', !contextItems.length);
    if (!contextItems.length) {
        contextHint.replaceChildren();
        return;
    }

    contextHint.replaceChildren();
    contextItems.forEach((item) => {
        const pill = document.createElement('div');
        pill.className = 'xb-assistant-context-hint-item';
        pill.textContent = item;
        contextHint.appendChild(pill);
    });
}

export function renderAppChrome(root, state, options = {}) {
    if (!root) return;

    const {
        maxImageAttachments = 3,
        maxContextTokens = 128000,
        buildContextMeterLabel = () => '',
        getWorkspaceSummary = () => ({ fileCount: 0, modifiedFileCount: 0 }),
        renderAttachmentGallery = () => {},
        renderWorkspace = () => {},
        onRemoveDraftAttachment = () => {},
        onOpenWorkspace = () => {},
        onClearLocalSources = () => {},
    } = options;

    const sendButton = root.querySelector('#xb-assistant-send');
    sendButton.disabled = false;
    sendButton.classList.toggle('is-busy', state.isBusy);
    sendButton.textContent = state.isBusy ? '■' : '➤';
    sendButton.title = state.isBusy ? '终止' : '发送';
    sendButton.setAttribute('aria-label', state.isBusy ? '终止' : '发送');

    const composeMenuToggle = root.querySelector('#xb-assistant-compose-menu-toggle');
    const composeMenu = root.querySelector('#xb-assistant-compose-menu');
    if (state.isBusy && state.composeMenuOpen) {
        state.composeMenuOpen = false;
    }
    composeMenuToggle.disabled = state.isBusy;
    composeMenuToggle.setAttribute('aria-expanded', state.composeMenuOpen ? 'true' : 'false');
    composeMenuToggle.title = state.composeMenuOpen ? '收起更多操作' : '展开更多操作';
    composeMenuToggle.setAttribute('aria-label', state.composeMenuOpen ? '收起更多操作' : '展开更多操作');
    composeMenu.toggleAttribute('hidden', !state.composeMenuOpen);

    const addImageButton = root.querySelector('#xb-assistant-add-image');
    addImageButton.disabled = state.isBusy || state.draftAttachments.length >= maxImageAttachments;
    const addImageLabel = addImageButton.querySelector('.xb-assistant-compose-menu-label');
    addImageLabel.textContent = state.draftAttachments.length
        ? `发送图片（${state.draftAttachments.length}/${maxImageAttachments}）`
        : '发送图片';

    const localSourceSummary = getWorkspaceSummary();
    const addLocalFilesButton = root.querySelector('#xb-assistant-add-local-files');
    addLocalFilesButton.disabled = state.isBusy;
    const addLocalFilesLabel = addLocalFilesButton.querySelector('.xb-assistant-compose-menu-label');
    addLocalFilesLabel.textContent = localSourceSummary.fileCount
        ? `选择文件（${localSourceSummary.fileCount}）`
        : '选择文件';

    const addLocalDirectoryButton = root.querySelector('#xb-assistant-add-local-directory');
    const directoryInput = root.querySelector('#xb-assistant-local-directory-input');
    const supportsDirectoryImport = directoryInput && 'webkitdirectory' in directoryInput;
    addLocalDirectoryButton.disabled = state.isBusy || !supportsDirectoryImport;
    addLocalDirectoryButton.hidden = !supportsDirectoryImport;
    addLocalDirectoryButton.title = supportsDirectoryImport ? '导入本地文件夹源码' : '当前环境不支持文件夹导入';

    const clearButton = root.querySelector('#xb-assistant-clear');
    clearButton.disabled = state.isBusy || !state.messages.length;
    clearButton.textContent = window.matchMedia('(max-width: 900px)').matches ? '清空' : '清空对话';

    const workspaceButton = root.querySelector('#xb-assistant-open-workspace');
    if (workspaceButton) {
        workspaceButton.disabled = !localSourceSummary.fileCount;
        workspaceButton.textContent = localSourceSummary.modifiedFileCount
            ? `文件 ${localSourceSummary.modifiedFileCount}`
            : '文件';
        workspaceButton.title = localSourceSummary.fileCount
            ? (state.isWorkspaceOpen ? '关闭文件工作区' : '打开文件工作区')
            : '还没有导入 local 文件';
        workspaceButton.classList.toggle('is-active', !!state.isWorkspaceOpen);
    }

    const clearLocalSourcesButton = root.querySelector('#xb-assistant-clear-local-sources');
    if (clearLocalSourcesButton) {
        clearLocalSourcesButton.hidden = !localSourceSummary.fileCount;
        clearLocalSourcesButton.disabled = state.isBusy || !localSourceSummary.fileCount;
        clearLocalSourcesButton.title = localSourceSummary.fileCount
            ? `清空当前已导入的 ${localSourceSummary.fileCount} 个源码文件`
            : '还没有导入源码';
    }

    const deletePresetButton = root.querySelector('#xb-assistant-delete-preset');
    deletePresetButton.disabled = state.isBusy || (state.config?.presetNames || []).length <= 1;

    const saveButton = root.querySelector('#xb-assistant-save');
    const saveState = state.configSave.status;
    saveButton.classList.add('xb-assistant-save-button');
    saveButton.classList.toggle('is-saving', saveState === 'saving');
    saveButton.classList.toggle('is-success', saveState === 'success');
    saveButton.classList.toggle('is-error', saveState === 'error');
    saveButton.disabled = state.isBusy || saveState === 'saving';
    if (saveState === 'saving') {
        saveButton.innerHTML = '<span class="xb-assistant-save-spinner" aria-hidden="true"></span>保存中...';
        saveButton.title = '正在保存配置';
    } else if (saveState === 'success') {
        saveButton.textContent = '已保存';
        saveButton.title = '配置已保存';
    } else if (saveState === 'error') {
        saveButton.textContent = '保存失败';
        saveButton.title = state.configSave.error || '保存失败';
    } else {
        saveButton.textContent = '保存配置';
        saveButton.title = '保存配置';
    }

    const pullButton = root.querySelector('#xb-assistant-pull-models');
    pullButton.disabled = state.isBusy;

    const status = root.querySelector('#xb-assistant-status');
    status.textContent = state.progressLabel || '就绪';
    status.classList.toggle('busy', state.isBusy);

    const contextMeter = root.querySelector('#xb-assistant-context-meter');
    contextMeter.textContent = buildContextMeterLabel();
    contextMeter.classList.toggle('summary-active', !!state.contextStats.summaryActive);
    const contextBudgetLabel = `${Math.round(maxContextTokens / 1000)}k`;
    contextMeter.title = state.contextStats.summaryActive
        ? `当前实际送模上下文 / ${contextBudgetLabel}（已压缩较早历史）`
        : `当前实际送模上下文 / ${contextBudgetLabel}`;

    const toast = root.querySelector('#xb-assistant-toast');
    toast.textContent = state.toast || '';
    toast.classList.toggle('visible', !!state.toast);

    const shell = root.querySelector('.xb-assistant-shell');
    const sidebar = root.querySelector('.xb-assistant-sidebar');
    const sidebarToggle = root.querySelector('#xb-assistant-sidebar-toggle');
    const sidebarContent = root.querySelector('.xb-assistant-sidebar-content');
    const mobileSettingsButton = root.querySelector('#xb-assistant-mobile-settings');
    const mobileCloseButton = root.querySelector('#xb-assistant-mobile-close');
    const mobileBackdrop = root.querySelector('#xb-assistant-mobile-backdrop');
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    shell?.classList.toggle('sidebar-collapsed', !!state.sidebarCollapsed);
    sidebar?.classList.toggle('is-collapsed', !!state.sidebarCollapsed);
    sidebarContent?.toggleAttribute('hidden', !!state.sidebarCollapsed);
    mobileBackdrop?.toggleAttribute('hidden', !isMobile || !!state.sidebarCollapsed);
    mobileSettingsButton?.toggleAttribute('hidden', !isMobile);
    mobileCloseButton?.toggleAttribute('hidden', !isMobile);
    if (sidebarToggle) {
        sidebarToggle.setAttribute('aria-expanded', state.sidebarCollapsed ? 'false' : 'true');
        sidebarToggle.setAttribute('aria-label', state.sidebarCollapsed ? '展开 API 配置' : '收起 API 配置');
        sidebarToggle.title = state.sidebarCollapsed ? '展开 API 配置' : '收起 API 配置';
        const text = sidebarToggle.querySelector('.xb-assistant-sidebar-toggle-text');
        const icon = sidebarToggle.querySelector('.xb-assistant-sidebar-toggle-icon');
        if (text) {
            text.textContent = isMobile
                ? (state.sidebarCollapsed ? '展开设置' : '收起设置')
                : '';
        }
        if (icon) {
            icon.textContent = isMobile
                ? (state.sidebarCollapsed ? '▼' : '▲')
                : (state.sidebarCollapsed ? '⚙' : '‹');
        }
    }
    if (mobileSettingsButton) {
        mobileSettingsButton.textContent = state.sidebarCollapsed ? '设置' : '关闭设置';
        mobileSettingsButton.setAttribute('aria-expanded', state.sidebarCollapsed ? 'false' : 'true');
        mobileSettingsButton.title = state.sidebarCollapsed ? '展开 API 配置' : '收起 API 配置';
    }
    if (mobileCloseButton) {
        mobileCloseButton.textContent = '关闭';
        mobileCloseButton.title = '关闭小白助手';
    }

    const draftGallery = root.querySelector('#xb-assistant-draft-gallery');
    renderAttachmentGallery(draftGallery, state.draftAttachments, {
        onRemove: (index) => {
            onRemoveDraftAttachment(index);
        },
    });

    renderContextHint(root, state);

    const importProgress = root.querySelector('#xb-assistant-import-progress');
    const importState = state.localImportProgress || {};
    if (importProgress) {
        importProgress.toggleAttribute('hidden', !importState.active);
        if (importState.active) {
            importProgress.replaceChildren();

            const header = document.createElement('div');
            header.className = 'xb-assistant-import-progress-header';

            const title = document.createElement('strong');
            title.className = 'xb-assistant-import-progress-title';
            title.textContent = importState.label || '正在导入';
            header.appendChild(title);

            const percent = document.createElement('span');
            percent.className = 'xb-assistant-import-progress-percent';
            percent.textContent = `${Math.max(0, Math.min(100, Math.round(Number(importState.percent) || 0)))}%`;
            header.appendChild(percent);

            importProgress.appendChild(header);

            if (importState.detail) {
                const detail = document.createElement('div');
                detail.className = 'xb-assistant-import-progress-detail';
                detail.textContent = importState.detail;
                importProgress.appendChild(detail);
            }

            const bar = document.createElement('div');
            bar.className = 'xb-assistant-import-progress-bar';
            const fill = document.createElement('div');
            fill.className = 'xb-assistant-import-progress-fill';
            fill.style.width = `${Math.max(0, Math.min(100, Math.round(Number(importState.percent) || 0)))}%`;
            bar.appendChild(fill);
            importProgress.appendChild(bar);
        } else {
            importProgress.replaceChildren();
        }
    }

    const workspacePanel = root.querySelector('#xb-assistant-workspace-panel');
    renderWorkspace(workspacePanel, { disabled: state.isBusy });

    const workspaceShell = root.querySelector('#xb-assistant-workspace');
    const workspaceBackdrop = root.querySelector('#xb-assistant-workspace-backdrop');
    const mainBody = root.querySelector('.xb-assistant-main-body');
    mainBody?.classList.toggle('workspace-open', !!state.isWorkspaceOpen);
    mainBody?.style.setProperty('--xb-assistant-workspace-width', `${state.workspaceWidth || 520}px`);
    workspaceShell?.classList.toggle('is-open', !!state.isWorkspaceOpen);
    workspaceShell?.setAttribute('aria-hidden', state.isWorkspaceOpen ? 'false' : 'true');
    workspaceShell?.style.setProperty('--xb-assistant-workspace-width', `${state.workspaceWidth || 520}px`);
    workspaceBackdrop?.classList.toggle('is-open', !!state.isWorkspaceOpen && isMobile);
    workspaceBackdrop?.toggleAttribute('hidden', !(state.isWorkspaceOpen && isMobile));

    const toggleKey = root.querySelector('#xb-assistant-toggle-key');
    const apiKeyInput = root.querySelector('#xb-assistant-api-key');
    toggleKey.textContent = apiKeyInput.type === 'password' ? '显示' : '隐藏';
}
