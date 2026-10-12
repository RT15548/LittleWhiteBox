import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { buildAppMarkup } from '../app-src/ui/app-shell.js';
import { createChatUi } from '../app-src/ui/chat-ui.js';

test('assistant compose starts empty with one row and an accessible name', () => {
    const { document } = parseHTML(buildAppMarkup({ sidebarCollapsed: true, configSave: { status: 'idle' } }));
    const input = document.querySelector('form textarea');
    assert.ok(input);
    assert.equal(input.getAttribute('rows'), '1');
    assert.equal(input.value, '');
    assert.ok(input.getAttribute('aria-label'));
});

test('pending approval exposes a named modal and decisions, then disappears when cleared', t => {
    const previousDocument = globalThis.document;
    const { document } = parseHTML('<html><body><main></main></body></html>');
    globalThis.document = document;
    t.after(() => { globalThis.document = previousDocument; });
    const command = '/echo <script>untrusted()</script>';
    const state = { pendingApproval: { id: 'approval-1', kind: 'slash-command', status: 'pending', command } };
    const ui = createChatUi({ state });
    const container = document.querySelector('main');
    ui.renderApprovalPanel(container);
    const dialog = container.querySelector('[role="alertdialog"]');
    assert.ok(dialog);
    assert.equal(dialog.getAttribute('aria-modal'), 'true');
    assert.ok(document.getElementById(dialog.getAttribute('aria-labelledby'))?.textContent);
    assert.equal(dialog.querySelector('pre').textContent, command);
    assert.equal(dialog.querySelector('script'), null);
    assert.deepEqual([...dialog.querySelectorAll('[data-approval-decision]')].map(button => ({
        id: button.dataset.approvalId, decision: button.dataset.approvalDecision,
    })), [
        { id: 'approval-1', decision: 'approve' },
        { id: 'approval-1', decision: 'decline' },
    ]);
    state.pendingApproval = null;
    ui.renderApprovalPanel(container);
    assert.equal(container.childElementCount, 0);
});
