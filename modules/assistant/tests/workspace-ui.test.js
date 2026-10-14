import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { renderWorkspace } from '../app-src/workspace/local-workspace-ui.js';
import { buildAppMarkup } from '../app-src/ui/app-shell.js';
import { renderAppChrome } from '../app-src/ui/app-chrome.js';

function fixture(t, markup = '<main></main>') {
    const previousDocument = globalThis.document;
    const previousWindow = globalThis.window;
    const { document, window } = parseHTML(`<html><body>${markup}</body></html>`);
    globalThis.document = document;
    globalThis.window = { matchMedia: () => ({ matches: true }) };
    t.after(() => {
        globalThis.document = previousDocument;
        globalThis.window = previousWindow;
    });
    return { document, window, root: document.body.firstElementChild };
}

function action(root, key) {
    const button = root.querySelector(`button[data-action="${key}"]`);
    assert.ok(button, `missing action: ${key}`);
    assert.ok(button.getAttribute('aria-label')?.trim(), `unnamed action: ${key}`);
    return button;
}

function selectedFile(path = 'local/alpha/src/file.js', originalContent = 'before') {
    return { source: { label: 'alpha' }, file: { path, content: 'after', originalContent } };
}

function viewerOptions(overrides = {}) {
    return {
        selectedMatch: selectedFile(),
        workspaceState: { viewerMode: 'original', selectedFilePath: 'local/alpha/src/file.js' },
        hasOriginalSnapshot: file => file.originalContent !== null,
        ...overrides,
    };
}

test('workspace has one named entry whose expanded state follows the open panel, including while busy', t => {
    const state = {
        sidebarCollapsed: true, isWorkspaceOpen: false, isBusy: false,
        configSave: { status: 'idle' }, config: { presetNames: [] },
        draftAttachments: [], messages: [], composeMenuOpen: false,
    };
    const { root, document } = fixture(t, `<main>${buildAppMarkup(state)}</main>`);
    const entries = root.querySelectorAll('button[aria-controls="xb-assistant-workspace"]');
    assert.equal(entries.length, 1);
    const entry = entries[0];
    const panel = document.getElementById(entry.getAttribute('aria-controls'));
    assert.ok(panel);
    assert.ok(entry.getAttribute('aria-label')?.trim());
    const renders = [];
    for (const open of [false, true, false]) {
        state.isWorkspaceOpen = open;
        state.isBusy = open;
        renderAppChrome(root, state, { renderWorkspace: (_container, options) => renders.push(options.disabled) });
        assert.equal(entry.getAttribute('aria-expanded'), String(open));
        assert.equal(entry.disabled, false);
        assert.ok(entry.getAttribute('aria-label')?.trim());
        assert.equal(panel.getAttribute('aria-hidden'), String(!open));
        assert.equal(root.querySelector('#xb-assistant-workspace-backdrop').hasAttribute('hidden'), !open);
    }
    assert.deepEqual(renders, [false, true, false]);
});

test('workspace navigation exposes named actions and forwards panel, filter, search and close choices', t => {
    const { root, window } = fixture(t);
    const calls = [];
    for (const active of ['workspace', 'memory']) {
        const modifiedOnly = active === 'memory';
        renderWorkspace(root, {
            summary: { fileCount: 1 }, activePanelMode: active,
            workspaceState: { showModifiedOnly: modifiedOnly, fileSearchQuery: 'src' },
            onSelectPanelMode: value => calls.push(['panel', value]),
            onToggleModifiedOnly: value => calls.push(['modified', value]),
            onSearchChange: value => calls.push(['search', value]),
            onCloseWorkspace: () => calls.push(['close']),
            onDownloadAll: () => calls.push(['download']),
            onClearAll: () => calls.push(['clear']),
        });
        for (const mode of ['workspace', 'memory']) {
            const button = action(root, `panel-${mode}`);
            assert.equal(button.getAttribute('aria-pressed'), String(mode === active));
            button.click();
        }
        const filter = action(root, 'modified-only');
        assert.equal(filter.getAttribute('aria-pressed'), String(modifiedOnly));
        filter.click();
        const search = root.querySelector('input[type="search"]');
        assert.ok(search.getAttribute('aria-label')?.trim());
        assert.equal(search.value, 'src');
        search.value = 'next';
        search.dispatchEvent(new window.Event('input'));
        for (const key of ['close', 'download-all', 'clear-all']) action(root, key).click();
    }
    assert.deepEqual(calls, [
        ['panel', 'workspace'], ['panel', 'memory'], ['modified', true], ['search', 'next'], ['close'], ['download'], ['clear'],
        ['panel', 'workspace'], ['panel', 'memory'], ['modified', false], ['search', 'next'], ['close'], ['download'], ['clear'],
    ]);
});

test('directory actions use the selected directory or file parent, not the file shown in the viewer', t => {
    const { root } = fixture(t);
    for (const [selectedTreePath, selectedFilePath, expected] of [
        ['local/beta/docs/', 'local/alpha/src/file.js', 'local/beta/docs/'],
        ['local/beta/docs/other.md', 'local/alpha/src/file.js', 'local/beta/docs/'],
        ['', 'local/alpha/src/file.js', 'local/alpha/src/'],
    ]) {
        const calls = [];
        renderWorkspace(root, viewerOptions({
            workspaceState: { viewerMode: 'original', selectedTreePath, selectedFilePath },
            onCreateFile: path => calls.push(['create-file', path]),
            onCreateDirectory: path => calls.push(['create-directory', path]),
            onRenamePath: path => calls.push(['rename', path]),
            onDeletePath: path => calls.push(['delete', path]),
        }));
        for (const key of ['new-file', 'new-directory', 'rename-directory', 'delete-directory']) {
            const button = action(root, key);
            assert.equal(button.disabled, false);
            button.click();
        }
        assert.deepEqual(calls, [
            ['create-file', expected], ['create-directory', expected], ['rename', expected], ['delete', expected],
        ]);
    }
});

test('viewer modes and file actions retain the displayed file target and back navigation', t => {
    const { root } = fixture(t);
    const path = 'local/alpha/src/file.js';
    for (const mode of ['original', 'diff']) {
        const calls = [];
        renderWorkspace(root, viewerOptions({
            workspaceState: { viewerMode: mode, selectedTreePath: 'local/beta/', mobileWorkspacePane: 'viewer' },
            showSaveButton: true, canSaveFile: () => true,
            onSetViewerMode: value => calls.push(['mode', value]),
            onSaveFile: target => calls.push(['save', target]),
            onDownloadFile: target => calls.push(['download', target]),
            onRestoreFile: target => calls.push(['restore', target]),
            onRenamePath: target => calls.push(['rename', target]),
            onDeletePath: target => calls.push(['delete', target]),
            onShowTree: () => calls.push(['back']),
        }));
        for (const choice of ['current', 'original', 'diff']) {
            const button = action(root, `view-${choice}`);
            assert.equal(button.getAttribute('aria-pressed'), String(choice === mode));
            assert.equal(button.disabled, false);
            button.click();
        }
        for (const key of ['save-file', 'download-file', 'restore-file', 'rename-file', 'delete-file', 'back']) action(root, key).click();
        assert.deepEqual(calls, [
            ['mode', 'current'], ['mode', 'original'], ['mode', 'diff'],
            ['save', path], ['download', path], ['restore', path], ['rename', path], ['delete', path], ['back'],
        ]);
    }
});

test('root, empty workspace and missing snapshots retain their disabled constraints', t => {
    const { root } = fixture(t);
    const calls = [];
    renderWorkspace(root, { onCreateFile: path => calls.push(path), onCreateDirectory: path => calls.push(path) });
    assert.equal(action(root, 'rename-directory').disabled, true);
    assert.equal(action(root, 'delete-directory').disabled, true);
    assert.equal(action(root, 'clear-all').disabled, true);
    assert.equal(action(root, 'download-all').disabled, false);
    action(root, 'new-file').click();
    action(root, 'new-directory').click();
    assert.deepEqual(calls, ['local/', 'local/']);
    assert.equal(root.querySelector('[data-action="save-file"]'), null);
    renderWorkspace(root, viewerOptions({ selectedMatch: selectedFile(undefined, null) }));
    assert.equal(action(root, 'view-current').disabled, false);
    for (const key of ['view-original', 'view-diff', 'restore-file']) assert.equal(action(root, key).disabled, true);
    renderWorkspace(root, viewerOptions({ disabled: true, summary: { fileCount: 1 } }));
    assert.equal(action(root, 'download-all').disabled, true);
    assert.equal(action(root, 'clear-all').disabled, true);
    for (const key of ['panel-workspace', 'panel-memory', 'modified-only', 'close', 'back']) {
        assert.equal(action(root, key).disabled, false);
    }
});

test('memory save follows dirty and busy state and hides workspace-only actions', t => {
    const { root } = fixture(t);
    const path = 'memory/notes/Identity.md';
    const saved = [];
    for (const [dirty, busy] of [[false, false], [true, false], [true, true]]) {
        renderWorkspace(root, viewerOptions({
            selectedMatch: selectedFile(path), activePanelMode: 'memory',
            hideNavActions: true, hideTreeActions: true,
            showRenameButton: false, showDeleteButton: false, showSaveButton: true,
            disabled: busy, canSaveFile: file => file.path === path && dirty,
            onSaveFile: target => saved.push(target),
        }));
        const save = action(root, 'save-file');
        assert.equal(save.disabled, busy || !dirty);
        if (!save.disabled) save.click();
        for (const key of ['download-all', 'clear-all', 'new-file', 'new-directory', 'rename-directory', 'delete-directory', 'rename-file', 'delete-file']) {
            assert.equal(root.querySelector(`[data-action="${key}"]`), null, key);
        }
        for (const key of ['download-file', 'restore-file', 'close', 'back']) action(root, key);
    }
    assert.deepEqual(saved, [path]);
    renderWorkspace(root, viewerOptions({
        showDownloadButton: false, showRestoreButton: false, showRenameButton: false, showDeleteButton: false,
    }));
    for (const key of ['save-file', 'download-file', 'restore-file', 'rename-file', 'delete-file']) {
        assert.equal(root.querySelector(`[data-action="${key}"]`), null, key);
    }
});
