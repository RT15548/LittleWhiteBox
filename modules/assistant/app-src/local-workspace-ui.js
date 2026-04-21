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
import { getPathExtension } from '../shared/public-text-file-types.js';
import { buildCodeRows, buildDiffRows } from './local-workspace-diff.js';

const workspaceEditorTheme = EditorView.theme({
    '&': {
        height: '100%',
        backgroundColor: 'transparent',
        color: '#1c314d',
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
        color: '#8a97aa',
    },
    '.cm-activeLineGutter': {
        backgroundColor: 'rgba(27, 55, 88, 0.06)',
    },
    '.cm-activeLine': {
        backgroundColor: 'rgba(27, 55, 88, 0.04)',
    },
    '.cm-cursor': {
        borderLeftColor: '#1b3758',
    },
    '.cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: 'rgba(72, 120, 184, 0.22)',
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
    const reportSelection = (view) => {
        const selection = view.state.selection.main;
        callbacks.onSelectionChange({
            filePath: path,
            viewerMode: 'current',
            value: view.state.doc.toString(),
            selectionStart: selection.from,
            selectionEnd: selection.to,
            lineStart: view.state.doc.lineAt(selection.from).number,
            lineEnd: view.state.doc.lineAt(selection.to).number,
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
                        reportSelection(update.view);
                    }
                }),
                EditorView.domEventHandlers({
                    blur: (event, viewInstance) => {
                        callbacks.onBlur(viewInstance.state.doc.toString());
                        reportSelection(viewInstance);
                        return false;
                    },
                }),
            ],
        }),
        parent: container,
    });
    reportSelection(view);
    return view;
}

function destroyWorkspaceEditorCache(container) {
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

export function renderWorkspace(container, options = {}) {
    const {
        summary = { sourceCount: 0, fileCount: 0, modifiedFileCount: 0 },
        workspaceTree = { nodes: [] },
        selectedMatch = null,
        workspaceState = {},
        disabled = false,
        isModifiedFile = () => false,
        hasOriginalSnapshot = () => false,
        onDownloadAll = () => {},
        onClearAll = () => {},
        onCloseWorkspace = () => {},
        onSearchChange = () => {},
        onToggleModifiedOnly = () => {},
        onToggleNode = () => {},
        onSelectNode = () => {},
        onSelectFile = () => {},
        onSetViewerMode = () => {},
        onDownloadFile = () => {},
        onRestoreFile = () => {},
        onUpdateFileContent = () => true,
        onEditorSelectionChange = () => {},
        onCreateFile = () => {},
        onCreateDirectory = () => {},
        onRenamePath = () => {},
        onDeletePath = () => {},
    } = options;

    if (!container) return;
    const shouldRenderEditor = !!selectedMatch && workspaceState.viewerMode === 'current';
    container.replaceChildren();

    const body = document.createElement('div');
    body.className = 'xb-assistant-workspace-body';

    const nav = document.createElement('div');
    nav.className = 'xb-assistant-workspace-nav';

    const filters = document.createElement('div');
    filters.className = 'xb-assistant-workspace-filters';

    const navHeader = document.createElement('div');
    navHeader.className = 'xb-assistant-workspace-nav-header';
    const navTitle = document.createElement('strong');
    navTitle.className = 'xb-assistant-workspace-nav-title';
    navTitle.textContent = '文件工作区';
    const navActions = document.createElement('div');
        navActions.className = 'xb-assistant-workspace-nav-header-actions';
    const clearAllButton = document.createElement('button');
    clearAllButton.type = 'button';
    clearAllButton.className = 'xb-assistant-workspace-header-button';
    clearAllButton.textContent = '清空全部';
    clearAllButton.disabled = !!disabled || !summary.fileCount;
    clearAllButton.addEventListener('click', () => onClearAll());
    const downloadAllButton = document.createElement('button');
    downloadAllButton.type = 'button';
    downloadAllButton.className = 'xb-assistant-workspace-header-button';
    downloadAllButton.textContent = '下载全部';
    downloadAllButton.disabled = !!disabled;
    downloadAllButton.addEventListener('click', () => onDownloadAll());
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'xb-assistant-workspace-header-button is-icon';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', '关闭工作区');
    closeButton.title = '关闭工作区';
    closeButton.addEventListener('click', () => onCloseWorkspace());
    navHeader.appendChild(navTitle);
    navActions.append(clearAllButton, downloadAllButton, closeButton);
    navHeader.appendChild(navActions);
    filters.appendChild(navHeader);

    const treeScope = document.createElement('div');
    treeScope.className = 'xb-assistant-workspace-scope';
    treeScope.textContent = '全部工作区根';
    filters.appendChild(treeScope);

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'xb-assistant-workspace-search';
    searchInput.placeholder = '搜索文件';
    searchInput.value = workspaceState.fileSearchQuery || '';
    searchInput.addEventListener('input', (event) => onSearchChange(event.target.value));
    filters.appendChild(searchInput);

    const modifiedToggle = document.createElement('label');
    modifiedToggle.className = 'xb-assistant-workspace-modified-toggle';
    modifiedToggle.innerHTML = '<input type="checkbox" /> <span>仅看已修改</span>';
    modifiedToggle.querySelector('input').checked = !!workspaceState.showModifiedOnly;
    modifiedToggle.querySelector('input').addEventListener('change', (event) => onToggleModifiedOnly(event.target.checked));
    filters.appendChild(modifiedToggle);

    nav.appendChild(filters);

    const tree = document.createElement('div');
    tree.className = 'xb-assistant-workspace-tree';
    const activePath = workspaceState.selectedTreePath || workspaceState.selectedFilePath || '';
    const currentDirectoryPath = String(activePath || '').endsWith('/')
        ? (activePath || 'local/')
        : (activePath ? `${activePath.split('/').slice(0, -1).join('/')}/` : 'local/');
    const isWorkspaceRootDirectory = currentDirectoryPath === 'local/';
    const treeActions = document.createElement('div');
    treeActions.className = 'xb-assistant-workspace-tree-actions';

    const treeActionsContext = document.createElement('div');
    treeActionsContext.className = 'xb-assistant-workspace-tree-actions-context';

    const treeActionsTitle = document.createElement('strong');
    treeActionsTitle.className = 'xb-assistant-workspace-tree-actions-title';
    treeActionsTitle.textContent = isWorkspaceRootDirectory ? '全部工作区根' : '当前目录';

    const treeActionsPath = document.createElement('span');
    treeActionsPath.className = 'xb-assistant-workspace-tree-actions-path';
    treeActionsPath.textContent = currentDirectoryPath;

    treeActionsContext.append(treeActionsTitle, treeActionsPath);
    treeActions.appendChild(treeActionsContext);

    const treeActionsButtons = document.createElement('div');
    treeActionsButtons.className = 'xb-assistant-workspace-tree-actions-buttons';

    const newFileButton = document.createElement('button');
    newFileButton.type = 'button';
    newFileButton.className = 'xb-assistant-workspace-viewer-button';
    newFileButton.textContent = '+文件';
    newFileButton.addEventListener('click', () => onCreateFile(currentDirectoryPath));
    treeActionsButtons.appendChild(newFileButton);

    const newDirectoryButton = document.createElement('button');
    newDirectoryButton.type = 'button';
    newDirectoryButton.className = 'xb-assistant-workspace-viewer-button';
    newDirectoryButton.textContent = '+📂';
    newDirectoryButton.addEventListener('click', () => onCreateDirectory(currentDirectoryPath));
    treeActionsButtons.appendChild(newDirectoryButton);

    const renamePathButton = document.createElement('button');
    renamePathButton.type = 'button';
    renamePathButton.className = 'xb-assistant-workspace-viewer-button';
    renamePathButton.textContent = '重命名目录';
    renamePathButton.disabled = isWorkspaceRootDirectory;
    renamePathButton.title = isWorkspaceRootDirectory ? '全部工作区根不可重命名' : '重命名当前目录';
    renamePathButton.addEventListener('click', () => onRenamePath(currentDirectoryPath));
    treeActionsButtons.appendChild(renamePathButton);

    const deletePathButton = document.createElement('button');
    deletePathButton.type = 'button';
    deletePathButton.className = 'xb-assistant-workspace-viewer-button';
    deletePathButton.textContent = '删除目录';
    deletePathButton.disabled = isWorkspaceRootDirectory;
    deletePathButton.title = isWorkspaceRootDirectory ? '全部工作区根不可删除' : '删除当前目录';
    deletePathButton.addEventListener('click', () => onDeletePath(currentDirectoryPath));
    treeActionsButtons.appendChild(deletePathButton);

    treeActions.appendChild(treeActionsButtons);
    nav.appendChild(treeActions);

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
        emptyTree.textContent = summary.fileCount ? '当前筛选下没有文件' : '工作区还是空的';
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
        emptyViewer.innerHTML = '<strong>还没有选中文件</strong><span>从左侧文件树里点一个文件，我会在这里显示当前内容、原始内容或 Diff。</span>';
        viewer.appendChild(emptyViewer);
        body.appendChild(viewer);
        container.appendChild(body);
        return;
    }

    const viewerHeader = document.createElement('div');
    viewerHeader.className = 'xb-assistant-workspace-viewer-header';

    const viewerInfo = document.createElement('div');
    viewerInfo.className = 'xb-assistant-workspace-viewer-info';
    const viewerPath = document.createElement('strong');
    viewerPath.textContent = selectedMatch.file.path;
    const viewerMeta = document.createElement('span');
    viewerMeta.textContent = `${selectedMatch.source.label} · ${isModifiedFile(selectedMatch.file) ? '已修改' : '未修改'}`;
    viewerInfo.appendChild(viewerPath);
    viewerInfo.appendChild(viewerMeta);
    viewerHeader.appendChild(viewerInfo);

    const viewerActions = document.createElement('div');
    viewerActions.className = 'xb-assistant-workspace-viewer-actions';

    const viewerModes = [
        { key: 'current', label: '当前', enabled: true },
        { key: 'original', label: '原始', enabled: hasOriginalSnapshot(selectedMatch.file) },
        { key: 'diff', label: 'Diff', enabled: hasOriginalSnapshot(selectedMatch.file) },
    ];
    viewerModes.forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `xb-assistant-workspace-mode-button${workspaceState.viewerMode === item.key ? ' is-active' : ''}`;
        button.textContent = item.label;
        button.disabled = !item.enabled;
        button.addEventListener('click', () => onSetViewerMode(item.key));
        viewerActions.appendChild(button);
    });

    const downloadButton = document.createElement('button');
    downloadButton.type = 'button';
    downloadButton.className = 'xb-assistant-workspace-viewer-button is-icon';
    downloadButton.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
    downloadButton.title = '下载当前文件';
    downloadButton.setAttribute('aria-label', '下载当前文件');
    downloadButton.addEventListener('click', () => onDownloadFile(selectedMatch.file.path));
    viewerActions.appendChild(downloadButton);

    const restoreButton = document.createElement('button');
    restoreButton.type = 'button';
    restoreButton.className = 'xb-assistant-workspace-viewer-button is-icon';
    restoreButton.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>';
    restoreButton.title = '恢复原始内容';
    restoreButton.setAttribute('aria-label', '恢复原始内容');
    restoreButton.disabled = !hasOriginalSnapshot(selectedMatch.file);
    restoreButton.addEventListener('click', () => onRestoreFile(selectedMatch.file.path));
    viewerActions.appendChild(restoreButton);

    const renameButton = document.createElement('button');
    renameButton.type = 'button';
    renameButton.className = 'xb-assistant-workspace-viewer-button is-icon';
    renameButton.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    renameButton.title = '重命名';
    renameButton.setAttribute('aria-label', '重命名');
    renameButton.addEventListener('click', () => onRenamePath(selectedMatch.file.path));
    viewerActions.appendChild(renameButton);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'xb-assistant-workspace-viewer-button is-icon';
    deleteButton.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    deleteButton.title = '删除';
    deleteButton.setAttribute('aria-label', '删除');
    deleteButton.addEventListener('click', () => onDeletePath(selectedMatch.file.path));
    viewerActions.appendChild(deleteButton);

    viewerHeader.appendChild(viewerActions);
    viewer.appendChild(viewerHeader);

    const codeWrap = document.createElement('div');
    codeWrap.className = 'xb-assistant-workspace-code-wrap';
    if (workspaceState.viewerMode === 'current') {
        const editorMount = document.createElement('div');
        editorMount.className = 'xb-assistant-workspace-editor';
        editorMount.setAttribute('aria-label', `编辑 ${selectedMatch.file.path}`);
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
                onUpdateFileContent(selectedMatch.file.path, nextValue, { render: true, flush: true });
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
