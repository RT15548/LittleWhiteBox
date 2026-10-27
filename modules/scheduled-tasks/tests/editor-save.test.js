import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { transformSync } from 'esbuild';
import { parseHTML } from 'linkedom';
import * as operation from '../task-save-operation.js';
import { TASK_SAVE_COPY } from '../task-save-copy.js';

// Contract: cancel/Escape can close a saving editor, but its delayed result must
// not close/focus another editor or discard text entered during saving (lost edits).
// LWB_EDITOR_BASELINE=1 runs the same acceptance against HEAD before the repair.
const source = process.env.LWB_EDITOR_BASELINE === '1'
    ? execFileSync('git', ['show', 'HEAD:modules/scheduled-tasks/task-editor-save.js'], { encoding: 'utf8' })
    : fs.readFileSync(new URL('../task-editor-save.js', import.meta.url), 'utf8');
const code = transformSync(source, { format: 'cjs' }).code;
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

function fixture() {
    const { document, Event } = parseHTML('<html><body><div id="editor"><input></div><div id="buttons"><button id="ok">Save</button><button id="cancel">Cancel</button></div></body></html>');
    const box = { module: { exports: {} }, document, console, toastr: { success() {}, error() {} }, require: name => name.includes('copy') ? { TASK_SAVE_COPY } : operation };
    vm.runInNewContext(code, box);
    const popup = { result: 1, value: 1, dlg: document.body, okButton: document.getElementById('ok'), cancelButton: document.getElementById('cancel'), buttonControls: document.getElementById('buttons') };
    return { create: box.module.exports.createTaskEditorSaveHandler, editor: document.getElementById('editor'), popup, Event };
}

test('cancel closes immediately and a late successful result cannot close again', async () => {
    const { create, editor, popup } = fixture(), gate = deferred();
    const close = create(editor, () => gate.promise, 1);
    const saving = close(popup);
    try {
        popup.result = 0;
        assert.equal(await close(popup), true);
    } finally { gate.resolve(); }
    assert.equal(await saving, false);
});

test('a save does not discard text entered while its request was pending', async () => {
    const { create, editor, popup, Event } = fixture(), gate = deferred();
    const close = create(editor, () => gate.promise, 1);
    const saving = close(popup);
    editor.querySelector('input').value = 'newer edit';
    editor.dispatchEvent(new Event('input'));
    gate.resolve();
    assert.equal(await saving, false);
    assert.equal(editor.querySelector('input').value, 'newer edit');
});
