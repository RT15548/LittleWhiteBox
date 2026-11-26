import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import db from '../shared/session-db.js';
import { writeWorkspaceImages } from '../shared/workspace-images.js';
import { workspaceRepository } from '../shared/workspace-repository.js';
import { createChatUi } from '../app-src/ui/chat-ui.js';
import { toolOutcome } from '../app-src/ui/tool-activity.js';
import { workspaceMutationScopes } from '../shared/workspace-preconditions.js';
import { createHostToolRequestController } from '../app-src/runtime/host-tool-requests.js';

// User contract: history can preview a returned image, opens its renamed file,
// and cannot keep downloading a deleted workspace image. No provider is called.
test('chat image previews follow workspace move/delete and release object URLs', async t => {
    const { document } = parseHTML('<html><body><main></main></body></html>');
    const previousDocument = globalThis.document; globalThis.document = document;
    document.getSelection = () => ({ isCollapsed: true });
    const created = [], revoked = [], opened = [];
    let complete;
    let ready = new Promise(resolve => { complete = resolve; });
    t.mock.method(URL, 'createObjectURL', () => { const url = `blob:preview-${created.length}`; created.push(url); complete(); return url; });
    t.mock.method(URL, 'revokeObjectURL', url => revoked.push(url));
    try {
        const [file] = await writeWorkspaceImages([{ path: 'local/test-images/picture.png', blob: new Blob(['picture'], { type: 'image/png' }) }]);
        const { localSources } = await workspaceRepository.readWorkspace();
        const state = { messages: [{ role: 'user', content: 'View image' }, { role: 'assistant', content: '', toolCalls: [{ id: 'image', name: 'ReadImage', arguments: '{}' }] },
            { role: 'tool', toolName: 'ReadImage', toolCallId: 'image', content: JSON.stringify({ ok: true, images: [file] }) }], localSources, editingMessageIndex: -1 };
        const ui = createChatUi({ state, normalizeThoughtBlocks: value => value || [], normalizeAttachments: value => value || [], renderAttachmentGallery() {}, onLocalPathClick: path => opened.push(path) });
        const mount = document.querySelector('main'); ui.renderMessages(mount); await ready;
        assert.equal(mount.querySelector('img').src, created[0]);
        assert.equal(mount.querySelector('a[download]').download, file.name);
        const renamed = { ...file, name: 'portrait.png', path: 'local/test-images/portrait.png', relativePath: 'portrait.png' };
        state.localSources = localSources.map(source => ({ ...source, files: source.files.map(item => item.blobId === file.blobId ? renamed : item) }));
        ready = new Promise(resolve => { complete = resolve; }); ui.renderMessages(mount); await ready;
        mount.querySelector('button.xb-assistant-attachment-name').click();
        assert.deepEqual(opened, [renamed.path]); assert.deepEqual(revoked, [created[0]]);
        state.localSources = []; ui.renderMessages(mount);
        assert.equal(mount.querySelector('a[download]'), null); assert.equal(mount.querySelector('img'), null);
        assert.equal(mount.querySelector('button.xb-assistant-attachment-name').disabled, true);
        assert.deepEqual(revoked, created);
    } finally { globalThis.document = previousDocument; await db.delete(); }
});

test('card asset edits and save flush only their affected draft paths before host dispatch', async t => {
    t.mock.method(console, 'info', () => {});
    const path = 'local/cards/fixture.png/tasks/portraits.md';
    for (const [name, args] of [['CardAssets', { action: 'set', taskPath: path }], ['CardAssets', { action: 'remove', taskPath: path }], ['CardFiles', { action: 'save', paths: [path] }]]) {
        const pending = new Map(), events = [];
        const state = { activeRun: { id: 'run', toolRequestIds: new Set(), workspaceBaseline: [] } };
        const controller = createHostToolRequestController({ state, pendingToolCalls: pending, createRequestId: () => 'test', REQUEST_TIMEOUT_MS: 1000,
            describeError: error => error.message,
            flushBeforeToolCall({ toolName, args }) {
                const entries = workspaceMutationScopes(toolName, args).filter(item => item.scope === 'entry');
                assert.deepEqual(entries.map(item => item.path), [path]); events.push('flush'); return true;
            }, post(_type, payload) { events.push('dispatch'); assert.equal(payload.name, name); pending.get('test').resolve({ ok: true }); } });
        assert.equal((await controller.callHostTool(name, args, { runId: 'run' })).ok, true);
        assert.deepEqual(events, ['flush', 'dispatch']);
    }
});

test('a post-receipt observer failure rejects rather than stranding the host request', async t => {
    t.mock.method(console, 'info', () => {});
    const pending = new Map();
    const controller = createHostToolRequestController({ state: {}, pendingToolCalls: pending, createRequestId: () => 'test',
        REQUEST_TIMEOUT_MS: 1000, describeError: error => error.message, post() {} });
    const result = controller.callHostTool('ReadImage', { path: 'local/images/a.png' }, { onWorkspaceObserved() { throw new Error('observer_failed'); } });
    pending.get('test').resolve({ ok: true });
    await assert.rejects(result, { message: 'observer_failed' });
    assert.equal(pending.size, 0);
});

test('card draft receipts and partial listings keep their distinct user-visible outcomes', () => {
    for (const unchanged of [false, true]) {
        const draft = toolOutcome({ ok: true, draft: true, requiresWriteback: true, unchanged }, 'CardAssets');
        assert.equal(draft.status, 'succeeded'); assert.ok(draft.note);
    }
    assert.equal(toolOutcome({ ok: false, status: 'partial', tasks: [{}], errors: [{}] }, 'CardAssets').status, 'partial');
    assert.equal(toolOutcome({ ok: false, status: 'failed', tasks: [], errors: [{}] }, 'CardAssets').status, 'failed');
});

test('avatar refresh failure stays in the existing successful tool result', () => {
    const saved = { ok: true };
    assert.deepEqual(toolOutcome(saved, 'CardFiles'), { status: 'succeeded', note: '' });
    const needsRefresh = toolOutcome({ ...saved, previewRefreshFailed: true }, 'CardFiles');
    assert.equal(needsRefresh.status, 'succeeded');
    assert.ok(needsRefresh.note);
});
