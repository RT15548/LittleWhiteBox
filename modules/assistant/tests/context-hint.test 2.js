import test from 'node:test';
import assert from 'node:assert/strict';

import { buildWorkspaceUserContextTextForState } from '../app-src/context/current-context.js';
import { buildCurrentPlansContextText, formatCurrentPlansContextText } from '../../agent-core/current-plans.js';
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
    assert.match(items[0], /^上下文：/);
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
    assert.match(items[0], /^上下文：/);
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

    assert.match(text, /^\[Current context\]/);
    assert.match(text, /用户当前打开了记忆区技能文件：LittleWhiteBox_Assistant_Skill_Test\.md/);
    assert.match(text, /用户当前选中了 这个技能文件 的第 8 到 10 行：/);
    assert.doesNotMatch(text, /memory\/skills\/LittleWhiteBox_Assistant_Skill_Test\.md/);
});

test('formatCurrentPlansContextText injects compact unfinished plan snapshot', () => {
    const text = formatCurrentPlansContextText([
        {
            id: 'plan-done',
            title: '已完成项',
            status: 'completed',
            updatedAt: 40,
        },
        {
            id: 'plan-pending',
            title: '整理设置页',
            status: 'pending',
            updatedAt: 30,
        },
        {
            id: 'plan-active',
            title: '接入当前计划上下文',
            status: 'in_progress',
            updatedAt: 20,
        },
        {
            id: 'plan-blocked',
            title: '等待验证',
            status: 'blocked',
            blockedBy: ['plan-active'],
            updatedAt: 10,
        },
    ]);

    assert.match(text, /^\[Current plans\]/);
    assert.match(text, /plan-active in_progress: 接入当前计划上下文/);
    assert.match(text, /plan-blocked blocked: 等待验证; blocked by plan-active/);
    assert.match(text, /plan-pending pending: 整理设置页/);
    assert.doesNotMatch(text, /已完成项/);
});

test('formatCurrentPlansContextText keeps plan rows single-line', () => {
    const text = formatCurrentPlansContextText([{
        id: 'plan-multiline',
        title: '第一行\n第二行\t第三行',
        status: 'pending',
        updatedAt: 10,
        blockedBy: ['plan-a\nplan-b'],
    }]);

    assert.match(text, /plan-multiline pending: 第一行 第二行 第三行; blocked by plan-a plan-b/);
    assert.doesNotMatch(text, /第一行\n第二行/);
});

test('buildCurrentPlansContextText queries unfinished plan statuses separately', async () => {
    const calls = [];
    const ledger = {
        async listPlans(sessionId, args) {
            calls.push({ sessionId, args });
            if (args.status === 'pending') {
                return {
                    ok: true,
                    plans: [{
                        id: 'plan-pending',
                        title: '不会被 completed 挤掉',
                        status: 'pending',
                        updatedAt: 10,
                    }],
                };
            }
            return { ok: true, plans: [] };
        },
    };

    const text = await buildCurrentPlansContextText({
        sessionId: 'session-a',
        ledger,
    });

    assert.deepEqual(
        calls.map((call) => call.args),
        [
            { status: 'in_progress', limit: 5 },
            { status: 'blocked', limit: 5 },
            { status: 'pending', limit: 5 },
        ],
    );
    assert.match(text, /plan-pending pending: 不会被 completed 挤掉/);
});
