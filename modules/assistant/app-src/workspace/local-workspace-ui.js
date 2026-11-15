import { basicSetup } from 'codemirror';
import { Compartment, EditorState, Transaction } from '@codemirror/state';
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
import { buildDiffRows } from './local-workspace-diff.js';
import { isLocalSourceFileModified } from '../../shared/local-workspace-kernel.js';
import { updateChromeIcon } from '../ui/chrome-icons.js';
import { WORKSPACE_COPY as C } from './workspace-copy.js';
import { displayCardWorkspacePath } from '../../../card-workspace/paths.js';
import { describeCardWorkspaceFiles } from '../../../card-workspace/display.js';
import { itemEditorProjection } from '../../../card-workspace/editor.js';
import { ITEM_KINDS } from '../../../card-workspace/item-document.js';
import { COPY as CARD_COPY } from '../../../card-workspace/copy.js';
import { updateWorkspaceChildren } from './workspace-dom.js';
import { closeDetachedWorkspaceMenu, isWorkspaceMenuOpen, toggleWorkspaceMenu } from './workspace-menu.js';

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
    button.onclick = onClick;
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
        editability = new Compartment(),
        callbacks = {
            path,
            onChange: () => {},
            onSelectionChange: () => {},
            onBlur: () => {},
        },
    } = options;
    const reportSelection = (view, options = {}) => {
        const selection = view.state.selection.main;
        callbacks.onSelectionChange({
            filePath: callbacks.path,
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
                editability.of([EditorState.readOnly.of(!!disabled), EditorView.editable.of(!disabled)]),
                resolveWorkspaceEditorLanguage(options.languagePath || path),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged && !update.transactions.some(transaction => transaction.annotation(Transaction.remote))) {
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

// A directory rename keeps the same document/view (focus, selection, undo and
// composition). The following synchronous render refreshes the input callbacks.
export function relocateWorkspaceEditor(container, fromPath, toPath) {
    const cache = container?.__xbWorkspaceEditorCache;
    if (!toPath || !cache?.path.startsWith(fromPath)) return;
    cache.path = toPath + cache.path.slice(fromPath.length);
    cache.callbacks.path = cache.path;
    cache.relocated = true;
    const wrap = cache.view.dom.closest('.xb-assistant-workspace-code-wrap');
    if (wrap) wrap.dataset.viewKey = `${cache.path}:current`;
}

function ensureWorkspaceEditor(container, mountPoint, options = {}) {
    const cache = container?.__xbWorkspaceEditorCache || null;
    const normalizedDisabled = !!options.disabled;
    const nextValue = String(options.value || '');
    if (cache && cache.path === options.path && cache.part === options.part) {
        cache.callbacks.onChange = options.onChange || (() => {});
        cache.callbacks.onSelectionChange = options.onSelectionChange || (() => {});
        cache.callbacks.onBlur = options.onBlur || (() => {});
        const currentValue = cache.view.state.doc.toString();
        if (cache.disabled !== normalizedDisabled) {
            cache.view.dispatch({ effects: cache.editability.reconfigure([
                EditorState.readOnly.of(normalizedDisabled), EditorView.editable.of(!normalizedDisabled),
            ]) });
            cache.disabled = normalizedDisabled;
        }
        if (currentValue !== nextValue && !cache.view.composing && (cache.relocated || !cache.view.hasFocus)) {
            // Apply only the changed span, so a rebased card name does not
            // replace the entire editor document or discard its undo mapping.
            let from = 0, oldEnd = currentValue.length, newEnd = nextValue.length;
            while (from < oldEnd && from < newEnd && currentValue[from] === nextValue[from]) from++;
            while (oldEnd > from && newEnd > from && currentValue[oldEnd - 1] === nextValue[newEnd - 1]) { oldEnd--; newEnd--; }
            cache.view.dispatch({
                changes: { from, to: oldEnd, insert: nextValue.slice(from, newEnd) },
                annotations: [Transaction.remote.of(true), Transaction.addToHistory.of(false)],
            });
        }
        delete cache.relocated;
        if (cache.view.dom.parentNode !== mountPoint) mountPoint.appendChild(cache.view.dom);
        return cache.view;
    }

    destroyWorkspaceEditorCache(container);
    const callbacks = {
        path: options.path,
        onChange: options.onChange || (() => {}),
        onSelectionChange: options.onSelectionChange || (() => {}),
        onBlur: options.onBlur || (() => {}),
    };
    const editability = new Compartment();
    const view = mountWorkspaceEditor(mountPoint, {
        path: options.path,
        languagePath: options.languagePath,
        value: nextValue,
        disabled: normalizedDisabled,
        callbacks,
        editability,
    });
    container.__xbWorkspaceEditorCache = {
        view,
        callbacks,
        editability,
        path: options.path,
        part: options.part,
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
        nodeMenuItems = () => [],
        depth = 0,
    } = options;

    nodes.forEach((node) => {
        const isSelected = node.path === (selectedTreePath || selectedFilePath);
        const row = document.createElement('div');
        row.className = `xb-assistant-workspace-tree-row type-${node.type}${node.modified ? ' is-modified' : ''}${isSelected ? ' is-selected' : ''}`;
        row.dataset.nodeKey = node.key;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `xb-assistant-workspace-tree-button type-${node.type}`;
        button.style.paddingLeft = `${12 + (depth * 16)}px`;
        button.title = node.path ? displayCardWorkspacePath(node.path) : node.label;
        if (node.type !== 'file') button.setAttribute('aria-expanded', String(expandedKeys.has(node.key)));

        const caret = document.createElement('span');
        caret.className = 'xb-assistant-workspace-tree-caret';
        caret.textContent = node.type !== 'file'
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
            badge.title = C.modified;
            button.appendChild(badge);
        }

        button.onclick = () => {
            if (node.type !== 'file') {
                if (node.type === 'dir') onSelectNode(node.path);
                onToggleNode(node.key);
                return;
            }
            onSelectFile(node.path);
        };

        row.appendChild(button);
        const items = nodeMenuItems(node);
        if (items.length) {
            row.appendChild(createMenuButton({
                action: 'row-menu', menuKey: `row:${node.key}`, label: C.itemMore(node.label),
                className: 'xb-assistant-workspace-row-menu', items,
            }));
        }
        container.appendChild(row);

        if (node.type !== 'file' && expandedKeys.has(node.key) && Array.isArray(node.children) && node.children.length) {
            renderWorkspaceTreeNodes(container, node.children, {
                ...options,
                depth: depth + 1,
            });
        }
    });
}

function createMenuButton({ action, menuKey, label, items, icon = 'more', text = '', className = '' }) {
    const button = createActionButton({ action, icon, label, className: `${text ? 'has-text ' : ''}${className}` });
    if (text) {
        const span = document.createElement('span');
        span.textContent = text;
        button.appendChild(span);
    }
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', String(isWorkspaceMenuOpen(menuKey)));
    // The in-place patcher moves this handler onto the live button.
    button.onclick = event => toggleWorkspaceMenu(event.currentTarget, menuKey, items);
    return button;
}

function createTextButton({ action, label, onClick, primary = false, pressed, disabled = false }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `xb-assistant-workspace-text-action${primary ? ' is-primary' : ''}`;
    button.dataset.action = action;
    button.textContent = label;
    button.disabled = !!disabled;
    if (pressed !== undefined) button.setAttribute('aria-pressed', String(pressed));
    button.onclick = onClick;
    return button;
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
        button.onclick = () => onResolveConflict(action);
        notice.appendChild(button);
    }
    viewer.insertBefore(notice, viewer.querySelector('.xb-assistant-workspace-code-wrap'));
}

const ROOT_DIRECTORY = 'local/';

// The tree lives in the sidebar and the file viewer in its own column, so
// each part patches its own container and the editor belongs to the viewer.
// `manageFiles` enables creating, renaming and deleting (the workspace);
// the memory panel only browses and edits existing files.
export function renderWorkspace(containers, options = {}) {
    const {
        summary = { sourceCount: 0, fileCount: 0, modifiedFileCount: 0 },
        workspaceTree = { nodes: [] },
        panelModes = C.panelModes,
        activePanelMode = 'workspace',
        manageFiles = false,
        emptyTreeText = '',
        disabled = false,
        workspaceState = {},
        createMenuItems = [],
        onDownloadAll = () => {},
        onClearAll = () => {},
        onSelectPanelMode = () => {},
        onSearchChange = () => {},
        onToggleModifiedOnly = () => {},
        onToggleNode = () => {},
        onSelectNode = () => {},
        onSelectFile = () => {},
        onCreateFile = () => {},
        onCreateDirectory = () => {},
        onDownloadFile = () => {},
        onRenamePath = () => {},
        onDeletePath = () => {},
    } = options;
    const { nav: navContainer, viewer: viewerContainer } = containers || {};
    if (!navContainer || !viewerContainer) return;

    const nextNav = document.createElement('div');
    const nav = document.createElement('div');
    nav.className = 'xb-assistant-workspace-nav';

    const filters = document.createElement('div');
    filters.className = 'xb-assistant-workspace-filters';

    const panelTabs = document.createElement('div');
    panelTabs.className = 'xb-assistant-workspace-segmented';
    panelTabs.setAttribute('role', 'tablist');
    panelModes.forEach((item) => {
        const tab = createTextButton({
            action: `panel-${item.key}`, label: item.label,
            onClick: () => onSelectPanelMode(item.key),
        });
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', String(activePanelMode === item.key));
        panelTabs.appendChild(tab);
    });
    filters.appendChild(panelTabs);

    const searchRow = document.createElement('div');
    searchRow.className = 'xb-assistant-workspace-search-row';
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'xb-assistant-workspace-search';
    searchInput.placeholder = C.search;
    searchInput.setAttribute('aria-label', C.search);
    searchInput.value = workspaceState.fileSearchQuery || '';
    searchInput.oninput = (event) => onSearchChange(event.target.value);
    searchRow.appendChild(searchInput);
    if (manageFiles) {
        searchRow.appendChild(createMenuButton({
            action: 'create-menu', menuKey: 'create', icon: 'plus', text: C.create, label: C.create,
            items: [
                { label: C.newFile, disabled, onSelect: () => onCreateFile(ROOT_DIRECTORY) },
                { label: C.newDirectory, disabled, onSelect: () => onCreateDirectory(ROOT_DIRECTORY) },
                ...createMenuItems.map(item => ({ ...item, disabled })),
            ],
        }));
    }
    const modifiedOnly = !!workspaceState.showModifiedOnly;
    searchRow.appendChild(createMenuButton({
        action: 'more-menu', menuKey: 'more', label: C.more,
        items: [
            { label: modifiedOnly ? C.showAllFiles : C.modifiedOnly, onSelect: () => onToggleModifiedOnly(!modifiedOnly) },
            ...(manageFiles ? [
                { label: C.downloadAll, hint: C.downloadAllHint, disabled: !summary.fileCount, onSelect: onDownloadAll },
                { label: C.clearAll, danger: true, disabled: disabled || !summary.fileCount, onSelect: onClearAll },
            ] : []),
        ],
    }));
    filters.appendChild(searchRow);
    if (modifiedOnly) {
        const filterNote = document.createElement('div');
        filterNote.className = 'xb-assistant-workspace-filter-note';
        const text = document.createElement('span');
        text.textContent = C.modifiedOnlyActive;
        filterNote.append(text, createTextButton({ action: 'show-all-files', label: C.showAllFiles, onClick: () => onToggleModifiedOnly(false) }));
        filters.appendChild(filterNote);
    }
    nav.appendChild(filters);

    const nodeMenuItems = node => {
        if (!manageFiles) return [];
        const fileOrDirectory = [
            { label: C.rename, disabled, onSelect: () => onRenamePath(node.path) },
            { label: C.delete, danger: true, disabled, onSelect: () => onDeletePath(node.path) },
        ];
        if (node.type === 'file') return [{ label: C.download, onSelect: () => onDownloadFile(node.path) }, ...fileOrDirectory];
        return [
            { label: C.newFileHere, disabled, onSelect: () => onCreateFile(node.path) },
            { label: C.newDirectoryHere, disabled, onSelect: () => onCreateDirectory(node.path) },
            ...fileOrDirectory,
        ];
    };

    const tree = document.createElement('div');
    tree.className = 'xb-assistant-workspace-tree';
    if (workspaceTree.nodes.length) {
        renderWorkspaceTreeNodes(tree, workspaceTree.nodes, {
            selectedFilePath: workspaceState.selectedFilePath || '',
            selectedTreePath: workspaceState.selectedTreePath || '',
            expandedKeys: new Set(workspaceState.treeExpandedKeys || []),
            onToggleNode,
            onSelectNode,
            onSelectFile,
            nodeMenuItems,
        });
    } else {
        const emptyTree = document.createElement('div');
        emptyTree.className = 'xb-assistant-workspace-tree-empty';
        emptyTree.textContent = emptyTreeText || (summary.fileCount ? C.emptyFilter : C.emptyWorkspace);
        tree.appendChild(emptyTree);
    }
    nav.appendChild(tree);
    nextNav.appendChild(nav);
    updateWorkspaceChildren(navContainer, nextNav);

    renderWorkspaceViewer(viewerContainer, options);
    closeDetachedWorkspaceMenu();
}

function renderWorkspaceViewer(container, options) {
    const {
        showViewer = true,
        selectedMatch = null,
        editorDraft = null,
        savedFileExists = true,
        onResolveConflict = () => {},
        workspaceState = {},
        emptyViewerTitle = C.selectFile,
        disabled = false,
        manageFiles = false,
        onCloseWorkspace = () => {},
        onSetViewerMode = () => {},
        onDownloadFile = () => {},
        onRestoreFile = () => {},
        onUpdateFileContent = () => true,
        onEditorSelectionChange = () => {},
        onRenamePath = () => {},
        onDeletePath = () => {},
        primaryFileActions = () => [],
    } = options;

    if (!showViewer) {
        destroyWorkspaceEditorCache(container);
        container.replaceChildren();
        return;
    }
    const nextViewer = document.createElement('div');
    const viewer = document.createElement('div');
    viewer.className = 'xb-assistant-workspace-viewer';
    const closeButton = createActionButton({
        action: 'close', icon: 'close', label: C.close, onClick: () => onCloseWorkspace(),
    });

    if (!selectedMatch) {
        destroyWorkspaceEditorCache(container);
        const emptyHeader = document.createElement('div');
        emptyHeader.className = 'xb-assistant-workspace-viewer-header';
        const emptyInfo = document.createElement('div');
        emptyInfo.className = 'xb-assistant-workspace-viewer-info';
        emptyInfo.appendChild(closeButton);
        emptyHeader.appendChild(emptyInfo);
        viewer.appendChild(emptyHeader);
        const emptyViewer = document.createElement('div');
        emptyViewer.className = 'xb-assistant-workspace-empty';
        const emptyViewerTitleEl = document.createElement('strong');
        emptyViewerTitleEl.textContent = emptyViewerTitle;
        emptyViewer.appendChild(emptyViewerTitleEl);
        viewer.appendChild(emptyViewer);
        nextViewer.appendChild(viewer);
        updateWorkspaceChildren(container, nextViewer);
        return;
    }

    const file = selectedMatch.file;
    const path = file.path;
    const changed = isLocalSourceFileModified(file);
    const showDiff = workspaceState.viewerMode === 'diff' && changed;

    const viewerHeader = document.createElement('div');
    viewerHeader.className = 'xb-assistant-workspace-viewer-header';

    const viewerInfo = document.createElement('div');
    viewerInfo.className = 'xb-assistant-workspace-viewer-info';
    const viewerPath = document.createElement('strong');
    const description = describeCardWorkspaceFiles((options.localSources || [selectedMatch.source]).flatMap(source => source?.files || [])).get(path);
    const isItem = !!ITEM_KINDS[description?.kind];
    let projection = null, projectionError = '';
    if (isItem && !showDiff) {
        try { projection = itemEditorProjection(file, workspaceState.viewerMode); } catch (error) {
            if (!(error instanceof SyntaxError)) throw error;
            projectionError = error.message;
        }
    }
    const displayPath = description?.title || displayCardWorkspacePath(path);
    viewerPath.textContent = displayPath;
    viewerPath.title = displayCardWorkspacePath(path);
    viewerInfo.appendChild(viewerPath);
    if (changed) {
        const modifiedIndicator = document.createElement('span');
        modifiedIndicator.className = 'xb-assistant-workspace-modified-indicator';
        modifiedIndicator.title = C.modified;
        modifiedIndicator.setAttribute('role', 'img');
        modifiedIndicator.setAttribute('aria-label', C.modified);
        viewerInfo.appendChild(modifiedIndicator);
    }
    viewerInfo.appendChild(createMenuButton({
        action: 'file-menu', menuKey: `file:${path}`, label: C.fileMore,
        items: [
            ...(isItem ? [{ label: CARD_COPY.source, onSelect: () => onSetViewerMode('source') }] : []),
            { label: C.download, onSelect: () => onDownloadFile(path) },
            { label: C.restore, disabled: disabled || !changed, onSelect: () => onRestoreFile(path) },
            ...(manageFiles ? [
                { label: C.rename, disabled, onSelect: () => onRenamePath(path) },
                { label: C.delete, danger: true, disabled, onSelect: () => onDeletePath(path) },
            ] : []),
        ],
    }));
    viewerInfo.appendChild(closeButton);
    viewerHeader.appendChild(viewerInfo);

    const actions = [
        ...(isItem ? [
            { action: 'item-body', label: description.kind === 'tasks' ? CARD_COPY.script : description.kind === 'regex' ? CARD_COPY.replacement : CARD_COPY.body,
                pressed: !showDiff && !!projection && workspaceState.viewerMode !== 'settings', onClick: () => onSetViewerMode('current') },
            { action: 'item-settings', label: CARD_COPY.settings, pressed: workspaceState.viewerMode === 'settings', onClick: () => onSetViewerMode('settings') },
        ] : []),
        ...(changed ? [{
            action: 'view-changes', label: showDiff ? C.backToContent : C.viewChanges, pressed: showDiff,
            onClick: () => onSetViewerMode(showDiff ? 'current' : 'diff'),
        }] : []),
        ...primaryFileActions(file).map(item => ({ ...item, onClick: () => item.callback(path) })),
    ];
    if (actions.length) {
        const viewerActions = document.createElement('div');
        viewerActions.className = 'xb-assistant-workspace-viewer-actions';
        for (const item of actions) viewerActions.appendChild(createTextButton(item));
        viewerHeader.appendChild(viewerActions);
    }
    viewer.appendChild(viewerHeader);

    renderSaveNotice(viewer, { editorDraft, savedFileExists, onResolveConflict });
    if (projectionError) {
        const notice = document.createElement('p');
        notice.className = 'xb-assistant-workspace-save-notice';
        notice.textContent = projectionError;
        viewer.appendChild(notice);
    }

    const codeWrap = document.createElement('div');
    codeWrap.className = 'xb-assistant-workspace-code-wrap';
    codeWrap.dataset.viewKey = `${path}:${showDiff ? 'diff' : 'current'}`;
    if (!showDiff) {
        const editorMount = document.createElement('div');
        editorMount.className = 'xb-assistant-workspace-editor';
        editorMount.setAttribute('data-workspace-editor', '');
        editorMount.setAttribute('aria-label', C.edit(displayPath));
        codeWrap.appendChild(editorMount);
    } else {
        destroyWorkspaceEditorCache(container);
        const code = document.createElement('div');
        code.className = 'xb-assistant-workspace-code mode-diff';
        codeWrap.appendChild(code);
        renderCodeRows(code, buildDiffRows(file.originalContent, file.content), { mode: 'diff' });
    }

    viewer.appendChild(codeWrap);
    nextViewer.appendChild(viewer);
    updateWorkspaceChildren(container, nextViewer);
    if (!showDiff) ensureWorkspaceEditor(container, container.querySelector('[data-workspace-editor]'), {
        path,
        part: projection ? workspaceState.viewerMode : 'source',
        languagePath: projection ? `item${projection.language}` : path,
        value: projection ? projection.value : file.content || '',
        disabled: !!disabled,
        onChange: nextValue => onUpdateFileContent(path, projection ? projection.update(nextValue) : nextValue, { render: false, flush: false }),
        onSelectionChange: selection => onEditorSelectionChange?.(projection ? projection.selection(selection) : selection),
        onBlur: nextValue => onUpdateFileContent(path, projection ? projection.update(nextValue) : nextValue, { render: false, flush: true }),
    });
}
