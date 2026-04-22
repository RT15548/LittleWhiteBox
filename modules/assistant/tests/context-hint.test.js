import test from 'node:test';
import assert from 'node:assert/strict';

import { collectContextHintItems } from '../app-src/app-chrome.js';

test('collectContextHintItems shows workspace line context without selected text', () => {
    const items = collectContextHintItems({
        isWorkspaceOpen: true,
        selectedFilePath: 'local/test/test1/README.md',
        selectedTreePath: 'local/test/test1/README.md',
        workspaceSelectionContext: {
            filePath: 'local/test/test1/README.md',
            lineStart: '3',
            lineEnd: '3',
            text: '',
        },
    });

    assert.equal(items.length, 1);
    assert.match(items[0], /工作区文件：local\/test\/test1\/README\.md/);
    assert.match(items[0], /已选第 3 行/);
});
