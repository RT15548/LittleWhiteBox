import test from 'node:test';
import assert from 'node:assert/strict';

import { buildWorkspaceUserContextTextForState } from '../app-src/context/ide-context.js';
import { collectContextHintItems } from '../app-src/ui/app-chrome.js';

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

test('collectContextHintItems shows memory file context in memory panel', () => {
    const items = collectContextHintItems({
        isWorkspaceOpen: true,
        workspacePanelMode: 'memory',
        selectedSkillFilePath: 'memory/skills/LittleWhiteBox_Assistant_Skill_Test.md',
        skillFiles: [{
            path: 'memory/skills/LittleWhiteBox_Assistant_Skill_Test.md',
            filename: 'LittleWhiteBox_Assistant_Skill_Test.md',
            memorySection: 'skills',
        }],
        workspaceSelectionContext: {
            filePath: 'memory/skills/LittleWhiteBox_Assistant_Skill_Test.md',
            lineStart: '8',
            lineEnd: '10',
            text: '## Triggers',
        },
    });

    assert.equal(items.length, 1);
    assert.match(items[0], /记忆区技能文件：LittleWhiteBox_Assistant_Skill_Test\.md/);
    assert.match(items[0], /已选第 8-10 行/);
});

test('buildWorkspaceUserContextTextForState avoids leaking synthetic memory paths to the model', () => {
    const text = buildWorkspaceUserContextTextForState({
        isWorkspaceOpen: true,
        workspacePanelMode: 'memory',
        selectedSkillFilePath: 'memory/skills/LittleWhiteBox_Assistant_Skill_Test.md',
        skillFiles: [{
            path: 'memory/skills/LittleWhiteBox_Assistant_Skill_Test.md',
            filename: 'LittleWhiteBox_Assistant_Skill_Test.md',
            memorySection: 'skills',
        }],
        workspaceSelectionContext: {
            filePath: 'memory/skills/LittleWhiteBox_Assistant_Skill_Test.md',
            lineStart: '8',
            lineEnd: '10',
            text: '## Triggers',
        },
        viewerMode: 'current',
    });

    assert.match(text, /用户当前打开了记忆区技能文件：LittleWhiteBox_Assistant_Skill_Test\.md/);
    assert.match(text, /用户当前选中了 这个技能文件 的第 8 到 10 行：/);
    assert.doesNotMatch(text, /memory\/skills\/LittleWhiteBox_Assistant_Skill_Test\.md/);
});
