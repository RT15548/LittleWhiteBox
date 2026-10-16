import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { python } from '@codemirror/lang-python';
import { yaml } from '@codemirror/lang-yaml';
import { indentWithTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { getPathExtension } from '../../../agent-core/tools/text-file-types.js';
import { buildCodeRows, buildDiffRows } from './local-workspace-diff.js';
import { updateChromeIcon } from '../ui/chrome-icons.js';
import { WORKSPACE_COPY as C } from './workspace-copy.js';

function createActionButton({ action, icon, label, onClick, disabled = false, pressed, className = '' }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `xb-assistant-workspace-action ${className}`.trim();
    button.dataset.action = action;
    button.title = label;
    button.setAttribute('aria-label', label);
    button.disabled = !!disabled;
    if (pressed !== undefined) {
        button.setAttribute('aria-pressed', String(pressed));
        button.classList.toggle('is-active', pressed);
    }
    updateChromeIcon(button, icon);
    button.addEventListener('click', onClick);
    return button;
}

const workspaceEditorTheme = EditorView.theme({
    '&': {
        height: '100%',
        backgroundColor: 'transparent',
        color: '#3a352f',
        fontFamily: '"Cascadia Code", "Consolas", monospace',
        fontSize: '12px',
    },
    '.cm-scroller': {
        overflow: 'auto',
        fontFamily: 'inherit',
        lineHeight: '1.6',
    },
    '.cm-content': {
        minHeight: '100%',
        padding: '8px 0 16px',
    },
    '.cm-line': {
        padding: '0 14px 0 0',
    },
    '.cm-gutters': {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#9a9084',
    },
    '.cm-activeLineGutter': {
        backgroundColor: 'rgba(167, 95, 67, 0.08)',
    },
    '.cm-activeLine': {
        backgroundColor: 'rgba(167, 95, 67, 0.05)',
    },
    '.cm-cursor': {
        borderLeftColor: '#814733',
    },
    '.cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: 'rgba(196, 122, 88, 0.22)',
    },
    '&.cm-focused': {
        outline: 'none',
    },
});

function resolveWorkspaceEditorLanguage(pathText = '') {
    const extension = getPathExtension(pathText);
    if (['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'].includes(extension)) {
        return javascript({ jsx: ['.jsx', '.tsx'].includes(extension), typescript: ['.ts', '.tsx'].includes(extension) });
    }
    if (extension === '.html') return html();
    if (['.css', '.scss', '.sass', '.less'].includes(extension)) return css();
    if (['.json', '.json5'].includes(extension)) return json();
    if (extension === '.md') return markdown();
    if (extension === '.py') return python();
    if (['.yaml', '.yml'].includes(extension)) return yaml();
    return [];
}

function mountWorkspaceEditor(container, options = {}) {
    const {
        path = '',
        value = '',
        disabled = false,
        callbacks = {
            onChange: () => {},
            onSelectionChange: () => {},
            onBlur: () => {},
        },
    } = options;
    const reportSelection = (view, options = {}) => {
        const selection = view.state.selection.main;
        callbacks.onSelectionChange({
            filePath: path,
            viewerMode: 'current',
            value: view.state.doc.toString(),
            selectionStart: selection.from,
            selectionEnd: selection.to,
            lineStart: view.state.doc.lineAt(selection.from).number,
            lineEnd: view.state.doc.lineAt(selection.to).number,
            collapsed: selection.empty,
            userInteracted: !!options.userInteracted,
        });
    };
    const view = new EditorView({
        state: EditorState.create({
            doc: value,
            extensions: [
                basicSetup,
                keymap.of([indentWithTab]),
                workspaceEditorTheme,
                EditorState.readOnly.of(!!disabled),
                EditorView.editable.of(!disabled),
                resolveWorkspaceEditorLanguage(path),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        callbacks.onChange(update.state.doc.toString());
                    }
                    if (update.docChanged || update.selectionSet) {
                        reportSelection(update.view, { userInteracted: true });
                    }
                }),
                EditorView.domEventHandlers({
                    blur: (event, viewInstance) => {
                        callbacks.onBlur(viewInstance.state.doc.toString());
                        reportSelection(viewInstance, { userInteracted: true });
                        return false;
                    },
                }),
            ],
        }),
        parent: container,
    });
    return view;
}

export function destroyWorkspaceEditorCache(container) {
    const cache = container?.__xbWorkspaceEditorCache;
    if (cache?.view) {
        cache.view.destroy();
    }
    if (container) {
        delete container.__xbWorkspaceEditorCache;
    }
}

function ensureWorkspaceEditor(container, mountPoint, options = {}) {
    const cache = container?.__xbWorkspaceEditorCache || null;
    const normalizedDisabled = !!options.disabled;
    const nextValue = String(options.value || '');
    if (cache && cache.path === options.path && cache.disabled === normalizedDisabled) {
        cache.callbacks.onChange = options.onChange || (() => {});
        cache.callbacks.onSelectionChange = options.onSelectionChange || (() => {});
        cache.callbacks.onBlur = options.onBlur || (() => {});
        const currentValue = cache.view.state.doc.toString();
        if (currentValue !== nextValue) {
            cache.view.dispatch({
                changes: { from: 0, to: currentValue.length, insert: nextValue },
            });
        }
        mountPoint.appendChild(cache.view.dom);
        return cache.view;
    }

    destroyWorkspaceEditorCache(container);
    const callbacks = {
        onChange: options.onChange || (() => {}),
        onSelectionChange: options.onSelectionChange || (() => {}),
        onBlur: options.onBlur || (() => {}),
    };
    const view = mountWorkspaceEditor(mountPoint, {
        path: options.path,
        value: nextValue,
        disabled: normalizedDisabled,
        callbacks,
    });
    container.__xbWorkspaceEditorCache = {
        view,
        callbacks,
        path: options.path,
        disabled: normalizedDisabled,
    };
    return view;
}

function renderCodeRows(container, rows = [], options = {}) {
    container.replaceChildren();
    const mode = options.mode || 'current';
    const fragment = document.createDocumentFragment();

    rows.forEach((row, index) => {
        const line = document.createElement('div');
        line.className = `xb-assistant-workspace-code-row mode-${mode}${row.kind ? ` kind-${row.kind}` : ''}`;
        line.dataset.lineIndex = String(index + 1);
        line.dataset.lineNumber = String(row.lineNumber || row.rightLineNumber || row.leftLineNumber || index + 1);
        line.dataset.leftLineNumber = String(row.leftLineNumber || row.lineNumber || '');
        line.dataset.rightLineNumber = String(row.rightLineNumber || '');
        line.dataset.viewerMode = mode;

        const leftNum = document.createElement('span');
        leftNum.className = 'xb-assistant-workspace-code-num';
        leftNum.textContent = row.leftLineNumber || row.lineNumber || '';
        line.appendChild(leftNum);

        if (mode === 'diff') {
            const rightNum = document.createElement('span');
            rightNum.className = 'xb-assistant-workspace-code-num';
            rightNum.textContent = row.rightLineNumber || '';
            line.appendChild(rightNum);
        }

        const marker = document.createElement('span');
        marker.className = `xb-assistant-workspace-code-marker ${row.kind || mode}`;
        marker.textContent = row.kind === 'add' ? '+' : row.kind === 'remove' ? '-' : ' ';
        line.appendChild(marker);

        const code = document.createElement('span');
        code.className = 'xb-assistant-workspace-code-text';
        code.textContent = row.text || '';
        line.appendChild(code);

        fragment.appendChild(line);
    });

    container.appendChild(fragment);
}

function renderWorkspaceTreeNodes(container, nodes = [], options = {}) {
    const {
        selectedFilePath = '',
        selectedTreePath = '',
        expandedKeys = new Set(),
        onToggleNode = () => {},
        onSelectNode = () => {},
        onSelectFile = () => {},
        depth = 0,
    } = options;

    nodes.forEach((node) => {
        const isSelected = node.path === (selectedTreePath || selectedFilePath);
        const row = document.createElement('div');
        row.className = `xb-assistant-workspace-tree-row type-${node.type}${node.modified ? ' is-modified' : ''}${isSelected ? ' is-selected' : ''}`;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `xb-assistant-workspace-tree-button type-${node.type}`;
        button.style.paddingLeft = `${12 + (depth * 16)}px`;

        const caret = document.createElement('span');
        caret.className = 'xb-assistant-workspace-tree-caret';
        caret.textContent = node.type === 'dir'
            ? (expandedKeys.has(node.key) ? '▾' : '▸')
            : '';
        button.appendChild(caret);

        const label = document.createElement('span');
        label.className = 'xb-assistant-workspace-tree-label';
        label.textContent = node.label;
        button.appendChild(label);

        if (node.modified) {
            const badge = document.createElement('span');
            badge.className = 'xb-assistant-workspace-tree-badge';
            badge.textContent = '●';
            button.appendChild(badge);
        }

        button.addEventListener('click', () => {
            if (node.type === 'dir') {
                onSelectNode(node.path);
                onToggleNode(node.key);
                return;
            }
            onSelectFile(node.path);
        });

        row.appendChild(button);
        container.appendChild(row);

        if (node.type === 'dir' && expandedKeys.has(node.key) && Array.isArray(node.children) && node.children.length) {
            renderWorkspaceTreeNodes(container, node.children, {
                ...options,
                depth: depth + 1,
            });
        }
    });
}

function renderSaveNotice(viewer, { editorDraft, savedFileExists, onResolveConflict }) {
    viewer.querySelector('.xb-assistant-workspace-save-notice')?.remove();
    const visible = editorDraft?.status === 'conflict' || editorDraft?.status === 'error';
    viewer.classList.toggle('has-save-notice', visible);
    if (!visible) return;
    const notice = document.createElement('div');
    notice.className = 'xb-assistant-workspace-save-notice';
    notice.setAttribute('role', 'status');
    const message = document.createElement('span');
    message.textContent = editorDraft.status === 'conflict'
        ? (savedFileExists ? C.conflict : C.deletedConflict)
        : C.editorSaveFailed;
    notice.appendChild(message);
    const actions = editorDraft.status === 'conflict'
        ? [
            ['saved', savedFileExists ? C.useSaved : C.discardDeletedDraft],
            ['mine', savedFileExists ? C.overwriteWithDraft : C.recreateFromDraft],
        ]
        : [['retry', C.retrySave]];
    for (const [action, label] of actions) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.dataset.conflictAction = action;
        button.addEventListener('click', () => onResolveConflict(action));
        notice.appendChild(button);
    }
    viewer.insertBefore(notice, viewer.querySelector('.xb-assistant-workspace-code-wrap'));
}

export function renderWorkspace(container, options = {}) {
    const {
        summary = { sourceCount: 0, fileCount: 0, modifiedFileCount: 0 },
        workspaceTree = { nodes: [] },
        selectedMatch = null,
        editorDraft = null,
        savedFileExists = true,
        onResolveConflict = () => {},
        workspaceState = {},
        panelModes = C.panelModes,
        activePanelMode = 'workspace',
        hideNavActions = false,
        hideTreeActions = false,
        emptyTreeText = '',
        emptyViewerTitle = C.selectFile,
        disabled = false,
        isModifiedFile = () => false,
        hasOriginalSnapshot = () => false,
        onDownloadAll = () => {},
        onClearAll = () => {},
        onCloseWorkspace = () => {},
        onSelectPanelMode = () => {},
        onSearchChange = () => {},
        onToggleModifiedOnly = () => {},
        onToggleNode = () => {},
        onSelectNode = () => {},
        onSelectFile = () => {},
        onSetViewerMode = () => {},
        onShowTree = () => {},
        onDownloadFile = () => {},
        onRestoreFile = () => {},
        onSaveFile = () => {},
        onUpdateFileContent = () => true,
        canSaveFile = () => false,
        onEditorSelectionChange = () => {},
        onCreateFile = () => {},
        onCreateDirectory = () => {},
        onRenamePath = () => {},
        onDeletePath = () => {},
        showDownloadButton = true,
        showRestoreButton = true,
        showRenameButton = true,
        showDeleteButton = true,
        showSaveButton = false,
    } = options;

    if (!container) return;
    const shouldRenderEditor = !!selectedMatch && workspaceState.viewerMode === 'current';
    const existingEditorCache = container.__xbWorkspaceEditorCache || null;
    const shouldPreserveFocusedEditor = !!(
        shouldRenderEditor
        && existingEditorCache?.view
        && existingEditorCache.path === selectedMatch?.file?.path
        && existingEditorCache.disabled === !!disabled
        && (existingEditorCache.view.hasFocus || existingEditorCache.view.composing)
    );
    if (shouldPreserveFocusedEditor) {
        existingEditorCache.callbacks.onChange = onUpdateFileContent
            ? (nextValue) => {
                onUpdateFileContent(selectedMatch.file.path, nextValue, { render: false, flush: false });
            }
            : (() => {});
        existingEditorCache.callbacks.onSelectionChange = onEditorSelectionChange || (() => {});
        existingEditorCache.callbacks.onBlur = onUpdateFileContent
            ? (nextValue) => {
                onUpdateFileContent(selectedMatch.file.path, nextValue, { render: true, flush: true });
            }
            : (() => {});
        renderSaveNotice(existingEditorCache.view.dom.closest('.xb-assistant-workspace-viewer'), {
            editorDraft, savedFileExists, onResolveConflict,
        });
        return;
    }
    container.replaceChildren();

    const body = document.createElement('div');
    body.className = 'xb-assistant-workspace-body';
    body.classList.toggle('is-viewing', workspaceState.mobileWorkspacePane === 'viewer');

    const nav = document.createElement('div');
    nav.className = 'xb-assistant-workspace-nav';

    const filters = document.createElement('div');
    filters.className = 'xb-assistant-workspace-filters';

    const navHeader = document.createElement('div');
    navHeader.className = 'xb-assistant-workspace-nav-header';
    const panelTabs = document.createElement('div');
    panelTabs.className = 'xb-assistant-workspace-action-group';
    panelModes.forEach((item) => {
        panelTabs.appendChild(createActionButton({
            action: `panel-${item.key}`,
            icon: item.icon,
            label: item.label,
            pressed: activePanelMode === item.key,
            onClick: () => onSelectPanelMode(item.key),
        }));
    });
    const navActions = document.createElement('div');
    navActions.className = 'xb-assistant-workspace-action-group';
    if (!hideNavActions) {
        navActions.append(
            createActionButton({
                action: 'download-all', icon: 'download', label: C.downloadAll,
                disabled, onClick: () => onDownloadAll(),
            }),
            createActionButton({
                action: 'clear-all', icon: 'clear', label: C.clearAll,
                disabled: disabled || !summary.fileCount, onClick: () => onClearAll(),
            }),
        );
    }
    navActions.appendChild(createActionButton({
        action: 'close', icon: 'close', label: C.close, onClick: () => onCloseWorkspace(),
    }));
    navHeader.append(panelTabs, navActions);
    filters.appendChild(navHeader);

    const searchRow = document.createElement('div');
    searchRow.className = 'xb-assistant-workspace-search-row';
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'xb-assistant-workspace-search';
    searchInput.placeholder = C.search;
    searchInput.setAttribute('aria-label', C.search);
    searchInput.value = workspaceState.fileSearchQuery || '';
    searchInput.addEventListener('input', (event) => onSearchChange(event.target.value));
    const modifiedToggle = createActionButton({
        action: 'modified-only', icon: 'filter', label: C.modifiedOnly,
        pressed: !!workspaceState.showModifiedOnly,
        onClick: () => onToggleModifiedOnly(!workspaceState.showModifiedOnly),
    });
    searchRow.append(searchInput, modifiedToggle);
    filters.appendChild(searchRow);
    nav.appendChild(filters);

    const tree = document.createElement('div');
    tree.className = 'xb-assistant-workspace-tree';
    const activePath = workspaceState.selectedTreePath || workspaceState.selectedFilePath || '';
    const currentDirectoryPath = String(activePath || '').endsWith('/')
        ? (activePath || 'local/')
        : (activePath ? `${activePath.split('/').slice(0, -1).join('/')}/` : 'local/');
    const isWorkspaceRootDirectory = currentDirectoryPath === 'local/';
    if (!hideTreeActions) {
        const treeActions = document.createElement('div');
        treeActions.className = 'xb-assistant-workspace-tree-actions';
        const createActions = document.createElement('div');
        createActions.className = 'xb-assistant-workspace-action-group';
        createActions.append(
            createActionButton({
                action: 'new-file', icon: 'newFile', label: C.directoryAction(C.newFile, currentDirectoryPath),
                onClick: () => onCreateFile(currentDirectoryPath),
            }),
            createActionButton({
                action: 'new-directory', icon: 'newDirectory', label: C.directoryAction(C.newDirectory, currentDirectoryPath),
                onClick: () => onCreateDirectory(currentDirectoryPath),
            }),
        );
        const directoryActions = document.createElement('div');
        directoryActions.className = 'xb-assistant-workspace-action-group';
        directoryActions.append(
            createActionButton({
                action: 'rename-directory', icon: 'rename', label: C.directoryAction(C.renameDirectory, currentDirectoryPath),
                disabled: isWorkspaceRootDirectory, onClick: () => onRenamePath(currentDirectoryPath),
            }),
            createActionButton({
                action: 'delete-directory', icon: 'clear', label: C.directoryAction(C.deleteDirectory, currentDirectoryPath),
                disabled: isWorkspaceRootDirectory, onClick: () => onDeletePath(currentDirectoryPath),
            }),
        );
        treeActions.append(createActions, directoryActions);
        nav.appendChild(treeActions);
    }

    if (workspaceTree.nodes.length) {
        renderWorkspaceTreeNodes(tree, workspaceTree.nodes, {
            selectedFilePath: workspaceState.selectedFilePath || '',
            selectedTreePath: workspaceState.selectedTreePath || '',
            expandedKeys: new Set(workspaceState.treeExpandedKeys || []),
            onToggleNode,
            onSelectNode,
            onSelectFile,
        });
    } else {
        const emptyTree = document.createElement('div');
        emptyTree.className = 'xb-assistant-workspace-tree-empty';
        emptyTree.textContent = emptyTreeText || (summary.fileCount ? C.emptyFilter : C.emptyWorkspace);
        tree.appendChild(emptyTree);
    }
    nav.appendChild(tree);
    body.appendChild(nav);

    const viewer = document.createElement('div');
    viewer.className = 'xb-assistant-workspace-viewer';

    if (!selectedMatch) {
        destroyWorkspaceEditorCache(container);
        const emptyViewer = document.createElement('div');
        emptyViewer.className = 'xb-assistant-workspace-empty';
        const emptyViewerTitleEl = document.createElement('strong');
        emptyViewerTitleEl.textContent = emptyViewerTitle;
        emptyViewer.appendChild(emptyViewerTitleEl);
        viewer.appendChild(emptyViewer);
        body.appendChild(viewer);
        container.appendChild(body);
        return;
    }

    const viewerHeader = document.createElement('div');
    viewerHeader.className = 'xb-assistant-workspace-viewer-header';

    const viewerInfo = document.createElement('div');
    viewerInfo.className = 'xb-assistant-workspace-viewer-info';

    const mobileBackButton = createActionButton({
        action: 'back', icon: 'collapse', label: C.back,
        className: 'xb-assistant-workspace-mobile-back', onClick: () => onShowTree(),
    });
    viewerInfo.appendChild(mobileBackButton);

    const viewerPath = document.createElement('strong');
    viewerPath.textContent = selectedMatch.file.path;
    viewerPath.title = selectedMatch.file.path;
    viewerInfo.appendChild(viewerPath);
    if (isModifiedFile(selectedMatch.file)) {
        const modifiedIndicator = document.createElement('span');
        modifiedIndicator.className = 'xb-assistant-workspace-modified-indicator';
        modifiedIndicator.title = C.modified;
        modifiedIndicator.setAttribute('role', 'img');
        modifiedIndicator.setAttribute('aria-label', C.modified);
        viewerInfo.appendChild(modifiedIndicator);
    }
    viewerHeader.appendChild(viewerInfo);

    const viewerActions = document.createElement('div');
    viewerActions.className = 'xb-assistant-workspace-viewer-actions';
    const modeActions = document.createElement('div');
    modeActions.className = 'xb-assistant-workspace-action-group';
    C.viewerModes.forEach((item) => {
        modeActions.appendChild(createActionButton({
            action: `view-${item.key}`, icon: item.icon, label: item.label,
            pressed: workspaceState.viewerMode === item.key,
            disabled: item.key !== 'current' && !hasOriginalSnapshot(selectedMatch.file),
            onClick: () => onSetViewerMode(item.key),
        }));
    });
    viewerActions.appendChild(modeActions);

    const fileActions = document.createElement('div');
    fileActions.className = 'xb-assistant-workspace-action-group';
    const path = selectedMatch.file.path;
    const actions = [
        { action: 'save-file', icon: 'save', label: C.save, show: showSaveButton, disabled: disabled || !canSaveFile(selectedMatch.file), callback: onSaveFile },
        { action: 'download-file', icon: 'download', label: C.download, show: showDownloadButton, callback: onDownloadFile },
        { action: 'restore-file', icon: 'restore', label: C.restore, show: showRestoreButton, disabled: !hasOriginalSnapshot(selectedMatch.file), callback: onRestoreFile },
        { action: 'rename-file', icon: 'rename', label: C.rename, show: showRenameButton, callback: onRenamePath },
        { action: 'delete-file', icon: 'clear', label: C.delete, show: showDeleteButton, callback: onDeletePath },
    ];
    actions.filter(item => item.show).forEach((item) => {
        fileActions.appendChild(createActionButton({ ...item, onClick: () => item.callback(path) }));
    });
    if (fileActions.childElementCount) viewerActions.appendChild(fileActions);

    viewerHeader.appendChild(viewerActions);
    viewer.appendChild(viewerHeader);

    renderSaveNotice(viewer, { editorDraft, savedFileExists, onResolveConflict });

    const codeWrap = document.createElement('div');
    codeWrap.className = 'xb-assistant-workspace-code-wrap';
    if (workspaceState.viewerMode === 'current') {
        const editorMount = document.createElement('div');
        editorMount.className = 'xb-assistant-workspace-editor';
        editorMount.setAttribute('aria-label', C.edit(selectedMatch.file.path));
        codeWrap.appendChild(editorMount);
        ensureWorkspaceEditor(container, editorMount, {
            path: selectedMatch.file.path,
            value: selectedMatch.file.content || '',
            disabled: !!disabled,
            onChange: (nextValue) => {
                onUpdateFileContent(selectedMatch.file.path, nextValue, { render: false, flush: false });
            },
            onSelectionChange: onEditorSelectionChange,
            onBlur: (nextValue) => {
                onUpdateFileContent(selectedMatch.file.path, nextValue, { render: false, flush: true });
            },
        });
    } else {
        destroyWorkspaceEditorCache(container);
        const code = document.createElement('div');
        code.className = `xb-assistant-workspace-code mode-${workspaceState.viewerMode}`;
        codeWrap.appendChild(code);

        if (workspaceState.viewerMode === 'original' && hasOriginalSnapshot(selectedMatch.file)) {
            renderCodeRows(code, buildCodeRows(selectedMatch.file.originalContent), { mode: 'original' });
        } else if (workspaceState.viewerMode === 'diff' && hasOriginalSnapshot(selectedMatch.file)) {
            renderCodeRows(code, buildDiffRows(selectedMatch.file.originalContent, selectedMatch.file.content), { mode: 'diff' });
        } else {
            renderCodeRows(code, buildCodeRows(selectedMatch.file.content), { mode: 'current' });
        }
    }

    if (!shouldRenderEditor) {
        destroyWorkspaceEditorCache(container);
    }

    viewer.appendChild(codeWrap);
    body.appendChild(viewer);
    container.appendChild(body);
}
