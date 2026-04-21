import { buildCodeRows, buildDiffRows } from './local-workspace-diff.js';

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
        localSources = [],
        summary = { sourceCount: 0, fileCount: 0, modifiedFileCount: 0 },
        workspaceTree = { nodes: [] },
        selectedMatch = null,
        workspaceState = {},
        disabled = false,
        isModifiedFile = () => false,
        hasOriginalSnapshot = () => false,
        onDownloadAll = () => {},
        onCloseWorkspace = () => {},
        onSelectSource = () => {},
        onSearchChange = () => {},
        onToggleModifiedOnly = () => {},
        onToggleNode = () => {},
        onSelectNode = () => {},
        onSelectFile = () => {},
        onSetViewerMode = () => {},
        onDownloadFile = () => {},
        onRestoreFile = () => {},
        onCreateFile = () => {},
        onRenamePath = () => {},
        onDeletePath = () => {},
    } = options;

    if (!container) return;
    container.replaceChildren();

    if (!summary.fileCount) {
        const empty = document.createElement('div');
        empty.className = 'xb-assistant-workspace-empty';
        empty.innerHTML = '<strong>还没有 local 文件工作区内容</strong><span>先用“选择文件 / 选择文件夹”导入源码，再在这里看树、看文件和看 Diff。</span>';
        container.appendChild(empty);
        return;
    }

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
    navActions.append(downloadAllButton, closeButton);
    navHeader.appendChild(navActions);
    filters.appendChild(navHeader);

    const sourceSelect = document.createElement('select');
    sourceSelect.className = 'xb-assistant-workspace-select';
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = '全部源码源';
    sourceSelect.appendChild(allOption);
    localSources.forEach((source) => {
        const optionEl = document.createElement('option');
        optionEl.value = source.sourceId;
        optionEl.textContent = source.label;
        sourceSelect.appendChild(optionEl);
    });
    sourceSelect.value = workspaceState.selectedSourceId || 'all';
    sourceSelect.addEventListener('change', (event) => onSelectSource(event.target.value));
    filters.appendChild(sourceSelect);

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
    const activePathIsDirectory = String(activePath || '').endsWith('/');
    const treeActions = document.createElement('div');
    treeActions.className = 'xb-assistant-workspace-viewer-actions';

    const newFileButton = document.createElement('button');
    newFileButton.type = 'button';
    newFileButton.className = 'xb-assistant-workspace-viewer-button';
    newFileButton.textContent = '新建文件';
    newFileButton.addEventListener('click', () => onCreateFile(activePath));
    treeActions.appendChild(newFileButton);

    const renamePathButton = document.createElement('button');
    renamePathButton.type = 'button';
    renamePathButton.className = 'xb-assistant-workspace-viewer-button';
    renamePathButton.textContent = activePathIsDirectory ? '重命名目录' : '重命名';
    renamePathButton.disabled = !activePath;
    renamePathButton.addEventListener('click', () => onRenamePath(activePath));
    treeActions.appendChild(renamePathButton);

    const deletePathButton = document.createElement('button');
    deletePathButton.type = 'button';
    deletePathButton.className = 'xb-assistant-workspace-viewer-button';
    deletePathButton.textContent = activePathIsDirectory ? '删除目录' : '删除';
    deletePathButton.disabled = !activePath;
    deletePathButton.addEventListener('click', () => onDeletePath(activePath));
    treeActions.appendChild(deletePathButton);

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
        emptyTree.textContent = '当前筛选下没有文件';
        tree.appendChild(emptyTree);
    }
    nav.appendChild(tree);
    body.appendChild(nav);

    const viewer = document.createElement('div');
    viewer.className = 'xb-assistant-workspace-viewer';

    if (!selectedMatch) {
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
    downloadButton.addEventListener('click', () => onDownloadFile(selectedMatch.file.path));
    viewerActions.appendChild(downloadButton);

    const restoreButton = document.createElement('button');
    restoreButton.type = 'button';
    restoreButton.className = 'xb-assistant-workspace-viewer-button is-icon';
    restoreButton.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>';
    restoreButton.title = '恢复原始内容';
    restoreButton.disabled = !hasOriginalSnapshot(selectedMatch.file);
    restoreButton.addEventListener('click', () => onRestoreFile(selectedMatch.file.path));
    viewerActions.appendChild(restoreButton);

    const renameButton = document.createElement('button');
    renameButton.type = 'button';
    renameButton.className = 'xb-assistant-workspace-viewer-button is-icon';
    renameButton.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    renameButton.title = '重命名';
    renameButton.addEventListener('click', () => onRenamePath(selectedMatch.file.path));
    viewerActions.appendChild(renameButton);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'xb-assistant-workspace-viewer-button is-icon';
    deleteButton.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    deleteButton.title = '删除';
    deleteButton.addEventListener('click', () => onDeletePath(selectedMatch.file.path));
    viewerActions.appendChild(deleteButton);

    viewerHeader.appendChild(viewerActions);
    viewer.appendChild(viewerHeader);

    const codeWrap = document.createElement('div');
    codeWrap.className = 'xb-assistant-workspace-code-wrap';
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

    viewer.appendChild(codeWrap);
    body.appendChild(viewer);
    container.appendChild(body);
}
