import test from 'node:test';
import assert from 'node:assert/strict';

import { applyPatchUpdateToText, parseApplyPatch } from '../shared/apply-patch.js';

function parsePatchDocument(lines) {
    return parseApplyPatch([
        '*** Begin Patch',
        ...lines,
        '*** End Patch',
    ].join('\n'));
}

test('parseApplyPatch parses a mixed assistant workspace patch', () => {
    const patch = parsePatchDocument([
        '*** Add File: local/notes/summary.md',
        '+hello',
        '*** Update File: local/scripts/scene.js',
        '*** Move to: local/scripts/scene-main.js',
        '@@ function runScene() {',
        ' console.log("before")',
        '-return 1;',
        '+return 2;',
        '*** Delete File: local/archive/old-scene.js',
    ]);

    assert.equal(patch.operations.length, 3);
    assert.equal(patch.operations[0].type, 'add');
    assert.equal(patch.operations[1].type, 'update');
    assert.equal(patch.operations[1].moveTo, 'local/scripts/scene-main.js');
    assert.equal(patch.operations[2].type, 'delete');
});

test('parseApplyPatch allows rename-only file moves', () => {
    const patch = parsePatchDocument([
        '*** Update File: local/styles/panel.css',
        '*** Move to: local/styles/assistant-panel.css',
    ]);

    assert.equal(patch.operations.length, 1);
    assert.equal(patch.operations[0].type, 'update');
    assert.equal(patch.operations[0].moveTo, 'local/styles/assistant-panel.css');
    assert.deepEqual(patch.operations[0].hunks, []);
});

test('parseApplyPatch keeps end-of-file markers on update hunks', () => {
    const patch = parsePatchDocument([
        '*** Update File: local/notes/todo.md',
        '@@ final marker',
        ' line one',
        '+line two',
        '*** End of File',
    ]);

    assert.equal(patch.operations[0].hunks.length, 1);
    assert.equal(patch.operations[0].hunks[0].endOfFile, true);
    assert.equal(patch.operations[0].hunks[0].header, 'final marker');
});

test('parseApplyPatch treats unified diff line ranges as hunk metadata, not text anchors', () => {
    const patch = parsePatchDocument([
        '*** Update File: local/scripts/demo.js',
        '@@ -1,3 +1,3 @@',
        ' function demo() {',
        '-  return "old";',
        '+  return "new";',
        ' }',
    ]);

    const hunk = patch.operations[0].hunks[0];
    assert.equal(hunk.header, '');
    assert.equal(hunk.oldStartLine, 1);
    assert.equal(hunk.oldLineCount, 3);
    assert.equal(hunk.newStartLine, 1);
    assert.equal(hunk.newLineCount, 3);
});

test('parseApplyPatch keeps unified diff section text as the optional hunk anchor', () => {
    const patch = parsePatchDocument([
        '*** Update File: local/scripts/demo.js',
        '@@ -10,3 +10,3 @@ function demo() {',
        ' function demo() {',
        '-  return "old";',
        '+  return "new";',
        ' }',
    ]);

    const hunk = patch.operations[0].hunks[0];
    assert.equal(hunk.header, 'function demo() {');
    assert.equal(hunk.oldStartLine, 10);
    assert.equal(hunk.newStartLine, 10);
});

test('applyPatchUpdateToText updates two assistant sections in one pass', () => {
    const original = [
        'export function updateIdentity() {',
        '  return "draft";',
        '}',
        '',
        'export function updateMemory() {',
        '  return "stale";',
        '}',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/scripts/assistant-hooks.js',
        '@@ export function updateIdentity() {',
        ' export function updateIdentity() {',
        '-  return "draft";',
        '+  return "ready";',
        ' }',
        '@@ export function updateMemory() {',
        ' export function updateMemory() {',
        '-  return "stale";',
        '+  return "fresh";',
        ' }',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/scripts/assistant-hooks.js' });
    assert.match(applied.content, /return "ready";/);
    assert.match(applied.content, /return "fresh";/);
});

test('applyPatchUpdateToText accepts standard unified diff hunk ranges', () => {
    const original = [
        'function test() {',
        '  console.log("old");',
        '  return 1;',
        '}',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/strict-patch-test.js',
        '@@ -1,4 +1,4 @@',
        ' function test() {',
        '-  console.log("old");',
        '+  console.log("new");',
        '   return 1;',
        ' }',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/strict-patch-test.js' });
    assert.equal(applied.content, [
        'function test() {',
        '  console.log("new");',
        '  return 1;',
        '}',
    ].join('\n'));
});

test('applyPatchUpdateToText uses unified diff line ranges to disambiguate repeated blocks', () => {
    const original = [
        'const status = "idle";',
        'const status = "idle";',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/state/session.js',
        '@@ -2,1 +2,1 @@',
        '-const status = "idle";',
        '+const status = "busy";',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/state/session.js' });
    assert.equal(applied.content, [
        'const status = "idle";',
        'const status = "busy";',
    ].join('\n'));
});

test('applyPatchUpdateToText keeps multi-hunk unified ranges moving forward after inserted duplicate context', () => {
    const original = [
        'A',
        'target',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/demo.txt',
        '@@ -1,1 +1,3 @@',
        '-A',
        '+A1',
        '+target',
        '+A2',
        '@@ -2,1 +4,1 @@',
        '-target',
        '+done',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/demo.txt' });
    assert.equal(applied.content, [
        'A1',
        'target',
        'A2',
        'done',
    ].join('\n'));
});

test('applyPatchUpdateToText uses an anchor line to isolate repeated content', () => {
    const original = [
        'function mountSidebar() {',
        '  const title = "Workspace";',
        '}',
        '',
        'function mountInspector() {',
        '  const title = "Workspace";',
        '}',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/ui/panels.js',
        '@@ function mountInspector() {',
        '-  const title = "Workspace";',
        '+  const title = "Inspector";',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/ui/panels.js' });
    assert.match(applied.content, /mountSidebar\(\) \{\n\s{2}const title = "Workspace";/);
    assert.match(applied.content, /mountInspector\(\) \{\n\s{2}const title = "Inspector";/);
});

test('applyPatchUpdateToText tolerates trailing-space drift in source lines', () => {
    const original = [
        'const mobileCloseLabel = "Close";   ',
        'const mobileOpenLabel = "Open";',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/ui/mobile.js',
        '@@',
        '-const mobileCloseLabel = "Close";',
        '+const mobileCloseLabel = "Dismiss";',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/ui/mobile.js' });
    assert.match(applied.content, /Dismiss/);
});

test('applyPatchUpdateToText ignores a synthetic terminal newline when matching the final block', () => {
    const original = [
        '这是 x宝 的工作区文件写入测试。',
        '时间戳：2026-04-24',
        '测试内容：验证 Write → Read 工作区工具链是否正常。',
        '',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/test-workspace.txt',
        '@@ 测试内容：验证 Write → Read 工作区工具链是否正常。',
        ' 测试内容：验证 Write → Read 工作区工具链是否正常。',
        '+补一行：apply_patch 末尾换行兼容验证。',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/test-workspace.txt' });
    assert.equal(applied.content, [
        '这是 x宝 的工作区文件写入测试。',
        '时间戳：2026-04-24',
        '测试内容：验证 Write → Read 工作区工具链是否正常。',
        '补一行：apply_patch 末尾换行兼容验证。',
        '',
    ].join('\n'));
});

test('applyPatchUpdateToText still keeps a real trailing blank content line significant', () => {
    const original = [
        'const workspaceReady = true;',
        '',
        '',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/state/workspace.js',
        '@@',
        '-const workspaceReady = true;',
        '+const workspaceReady = false;',
        ' ',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/state/workspace.js' });
    assert.equal(applied.content, [
        'const workspaceReady = false;',
        '',
        '',
    ].join('\n'));
});

test('applyPatchUpdateToText tolerates outer whitespace drift when text body matches', () => {
    const original = [
        '    const workspaceWidth = 520;   ',
        'const sidebarCollapsed = true;',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/state/layout.js',
        '@@',
        '-const workspaceWidth = 520;',
        '+const workspaceWidth = 560;',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/state/layout.js' });
    assert.match(applied.content, /560/);
});

test('applyPatchUpdateToText can align prose lines after punctuation folding', () => {
    const original = [
        'title:\u00A0“小白助手”…',
        'subtitle: workspace — ready',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/notes/release.md',
        '@@',
        '-title: "小白助手"...',
        '+title: "小白助手 v2"...',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/notes/release.md' });
    assert.match(applied.content, /title: "小白助手 v2"\.\.\./);
    assert.match(applied.content, /workspace — ready/);
});

test('applyPatchUpdateToText prefers the tightest successful comparison profile', () => {
    const original = [
        'const toolName = "RunSlashCommand";',
        'const toolName = "RunSlashCommand";   ',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/config/tools.js',
        '@@',
        '-const toolName = "RunSlashCommand";',
        '+const toolName = "RunJavaScriptApi";',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/config/tools.js' });
    assert.equal(applied.content, [
        'const toolName = "RunJavaScriptApi";',
        'const toolName = "RunSlashCommand";   ',
    ].join('\n'));
});

test('applyPatchUpdateToText keeps anchor lookup and block lookup on the same profile', () => {
    const original = [
        'function renderWorkspace() {   ',
        '  const label = "Files";   ',
        '}',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/ui/workspace.js',
        '@@ function renderWorkspace() {',
        '-  const label = "Files";',
        '+  const label = "Workspace";',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/ui/workspace.js' });
    assert.equal(applied.content, [
        'function renderWorkspace() {   ',
        '  const label = "Workspace";',
        '}',
    ].join('\n'));
});

test('applyPatchUpdateToText keeps widening after an anchor-only hit', () => {
    const original = [
        'function updateToolbar() {',
        '  const mode = "idle";   ',
        '}',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/ui/toolbar.js',
        '@@ function updateToolbar() {',
        '-  const mode = "idle";',
        '+  const mode = "busy";',
    ]);

    const applied = applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/ui/toolbar.js' });
    assert.equal(applied.content, [
        'function updateToolbar() {',
        '  const mode = "busy";',
        '}',
    ].join('\n'));
});

test('applyPatchUpdateToText reports a missing anchor line with explicit diagnostics', () => {
    const original = [
        'function openWorkspace() {',
        '  return true;',
        '}',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/ui/workspace.js',
        '@@ function openMemory() {',
        '-  return true;',
        '+  return false;',
    ]);

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/ui/workspace.js' }),
        /apply_patch_apply_error:.*header did not match the current file.*comparisonProfile=all_profiles.*failureKind=missing_header_anchor.*headerMatchCount=0.*oldBlockMatchCount=0/,
    );
});

test('applyPatchUpdateToText reports repeated anchored matches that stay ambiguous', () => {
    const original = [
        'function syncPanel() {',
        'const active = true;',
        '}',
        'function syncPanel() {',
        'const active = true;',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/ui/panels.js',
        '@@ function syncPanel() {',
        '-const active = true;',
        '+const active = false;',
    ]);

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/ui/panels.js' }),
        /apply_patch_apply_error:.*matched multiple locations under header.*comparisonProfile=verbatim.*failureKind=ambiguous_header_scoped_match.*headerMatchCount=2.*oldBlockMatchCount=2/,
    );
});

test('applyPatchUpdateToText reports anchored misses after trying broader profiles', () => {
    const original = [
        'function syncMemory() {',
        '  return 1;',
        '}',
        '',
        'function syncMemory() {',
        '  return 2;',
        '}',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/state/memory.js',
        '@@ function syncMemory() {',
        '-  return 3;',
        '+  return 4;',
    ]);

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/state/memory.js' }),
        /apply_patch_apply_error:.*header matched but old block did not match under that header.*comparisonProfile=edge_trimmed.*failureKind=header_anchor_without_block.*headerMatchCount=2.*oldBlockMatchCount=0/,
    );
});

test('applyPatchUpdateToText reports repeated block matches when no anchor is given', () => {
    const original = [
        'const status = "idle";',
        'const status = "idle";',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/state/session.js',
        '@@',
        '-const status = "idle";',
        '+const status = "busy";',
    ]);

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/state/session.js' }),
        /apply_patch_apply_error:.*old block matched multiple locations.*usesHeader=no.*comparisonProfile=verbatim.*failureKind=ambiguous_block_match.*oldBlockMatchCount=2/,
    );
});

test('applyPatchUpdateToText reports missing block context when no anchor is given', () => {
    const original = [
        'const currentPreset = "default";',
        'const currentModel = "openai";',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/state/config.js',
        '@@',
        '-const currentPreset = "missing";',
        '+const currentPreset = "assistant";',
    ]);

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/state/config.js' }),
        /apply_patch_apply_error:.*old block did not match the current file.*usesHeader=no.*comparisonProfile=all_profiles.*failureKind=missing_block_match.*oldBlockMatchCount=0/,
    );
});

test('applyPatchUpdateToText does not treat plain ASCII mismatches as punctuation-fold candidates', () => {
    const original = [
        'const selectedSource = "all";',
        'const selectedFile = "index.js";',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/state/selection.js',
        '@@',
        '-const selectedSource = "notes";',
        '+const selectedSource = "memory";',
    ]);

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/state/selection.js' }),
        /apply_patch_apply_error:.*old block did not match the current file.*comparisonProfile=all_profiles.*failureKind=missing_block_match/,
    );
});

test('applyPatchUpdateToText still rejects insert-only hunks without match context', () => {
    const original = [
        'const workspaceRoot = "local/";',
    ].join('\n');
    const patch = parsePatchDocument([
        '*** Update File: local/state/workspace.js',
        '@@ const workspaceRoot = "local/";',
        '+const sourceFilter = "all";',
    ]);

    assert.throws(
        () => applyPatchUpdateToText(original, patch.operations[0].hunks, { path: 'local/state/workspace.js' }),
        /apply_patch_apply_error:.*has no match context/,
    );
});
