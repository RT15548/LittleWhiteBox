import test from 'node:test';
import assert from 'node:assert/strict';

import { describeToolCall, formatToolResultDisplay, TOOL_DEFINITIONS, TOOL_NAMES } from '../app-src/tooling.js';
import {
    LOOKUP_SCOPE_LOCAL,
    LOOKUP_SCOPE_PROJECT,
    assertLookupScopePath,
    assertLookupScopePattern,
    isLocalLookupTarget,
    normalizeLookupScope,
} from '../shared/lookup-scope.js';

test('lookup tools expose strict project/local scope parameters', () => {
    const lookupTools = [TOOL_NAMES.LS, TOOL_NAMES.GLOB, TOOL_NAMES.GREP, TOOL_NAMES.READ];
    lookupTools.forEach((toolName) => {
        const definition = TOOL_DEFINITIONS.find((entry) => entry.function?.name === toolName);
        assert(definition);
        assert.deepEqual(definition.function.parameters.properties.scope.enum, ['project', 'local']);
    });
});

test('Read exposes tail as the only extra range shortcut', () => {
    const definition = TOOL_DEFINITIONS.find((entry) => entry.function?.name === TOOL_NAMES.READ);
    assert(definition);
    assert.deepEqual(Object.keys(definition.function.parameters.properties), [
        'filePath',
        'scope',
        'offset',
        'limit',
        'tail',
    ]);
    assert.match(definition.function.parameters.properties.tail.description, /cannot be combined with offset, limit/i);
    assert.match(definition.function.parameters.properties.tail.description, /do not send `tail: 0`/i);
    assert.doesNotMatch(JSON.stringify(definition.function.parameters.properties), /mode|from/i);
});

test('Write exposes filePath as the single model-facing target path parameter', () => {
    const definition = TOOL_DEFINITIONS.find((entry) => entry.function?.name === TOOL_NAMES.WRITE);
    assert(definition);
    assert.deepEqual(Object.keys(definition.function.parameters.properties), [
        'filePath',
        'content',
    ]);
    assert.deepEqual(definition.function.parameters.required, ['filePath', 'content']);
});

test('web search tool exposes a focused Tavily schema', () => {
    const definition = TOOL_DEFINITIONS.find((entry) => entry.function?.name === TOOL_NAMES.WEB_SEARCH);
    assert(definition);
    assert.deepEqual(Object.keys(definition.function.parameters.properties), ['query', 'maxResults']);
    assert.deepEqual(definition.function.parameters.required, ['query']);
    assert.match(String(definition.function.description || ''), /Tavily/i);
});

test('plan tools expose strict state-only schemas', () => {
    const planTools = [
        TOOL_NAMES.PLAN_CREATE,
        TOOL_NAMES.PLAN_UPDATE,
        TOOL_NAMES.PLAN_LIST,
        TOOL_NAMES.PLAN_GET,
    ];
    planTools.forEach((toolName) => {
        const definition = TOOL_DEFINITIONS.find((entry) => entry.function?.name === toolName);
        assert(definition);
        assert.equal(definition.function.parameters.additionalProperties, false);
        assert.doesNotMatch(JSON.stringify(definition.function.parameters), /sessionId/i);
    });
    const updateDefinition = TOOL_DEFINITIONS.find((entry) => entry.function?.name === TOOL_NAMES.PLAN_UPDATE);
    assert.deepEqual(updateDefinition.function.parameters.properties.status.enum, [
        'pending',
        'in_progress',
        'blocked',
        'completed',
        'failed',
        'cancelled',
    ]);
});

test('DelegateRun exposes a strict task-only schema', () => {
    const definition = TOOL_DEFINITIONS.find((entry) => entry.function?.name === TOOL_NAMES.DELEGATE_RUN);
    assert(definition);
    assert.equal(definition.function.parameters.additionalProperties, false);
    assert.deepEqual(Object.keys(definition.function.parameters.properties), ['task', 'context', 'deliverable']);
    assert.deepEqual(definition.function.parameters.required, ['task']);
    assert.doesNotMatch(JSON.stringify(definition.function.parameters), /sessionId/i);
    assert.match(String(definition.function.description || ''), /only knows task\/context\/deliverable/i);
});

test('lookup tool descriptions explain that local scope still uses local-prefixed paths', () => {
    const lookupTools = [TOOL_NAMES.LS, TOOL_NAMES.GLOB, TOOL_NAMES.GREP, TOOL_NAMES.READ];
    lookupTools.forEach((toolName) => {
        const definition = TOOL_DEFINITIONS.find((entry) => entry.function?.name === toolName);
        assert.match(String(definition?.function?.description || ''), /local\/\.\.\.|local\/"\s*is valid|local\/\.\.\. form|full `local\/\.\.\.` path/i);
    });
});

test('lookup tool schemas tell models to omit the public prefix for project paths', () => {
    const lookupTools = [TOOL_NAMES.LS, TOOL_NAMES.GLOB, TOOL_NAMES.GREP, TOOL_NAMES.READ];
    lookupTools.forEach((toolName) => {
        const definition = TOOL_DEFINITIONS.find((entry) => entry.function?.name === toolName);
        const parameterText = JSON.stringify(definition?.function?.parameters || {});
        assert.match(parameterText, /without `public\/`|omit `public\/`/i);
        assert.doesNotMatch(parameterText, /public\/scripts\/extensions/i);
    });
});

test('lookup scope helpers enforce strict project vs local paths', () => {
    assert.equal(normalizeLookupScope(''), LOOKUP_SCOPE_PROJECT);
    assert.equal(normalizeLookupScope('LOCAL'), LOOKUP_SCOPE_LOCAL);
    assert.equal(isLocalLookupTarget('local/demo.txt'), true);
    assert.equal(isLocalLookupTarget('scripts/app.js'), false);

    assert.doesNotThrow(() => assertLookupScopePath('local/demo.txt', LOOKUP_SCOPE_LOCAL));
    assert.doesNotThrow(() => assertLookupScopePattern('local/**/*.js', LOOKUP_SCOPE_LOCAL));
    assert.doesNotThrow(() => assertLookupScopePattern('**/*.js', LOOKUP_SCOPE_LOCAL));

    assert.throws(() => assertLookupScopePath('local/demo.txt', LOOKUP_SCOPE_PROJECT), /workspace_scope_local_required/);
    assert.throws(() => assertLookupScopePath('scripts/app.js', LOOKUP_SCOPE_LOCAL), /workspace_scope_local_only/);
    assert.throws(() => assertLookupScopePattern('scripts/**/*.js', LOOKUP_SCOPE_LOCAL), /workspace_scope_local_only/);
    assert.throws(() => normalizeLookupScope('all'), /invalid_lookup_scope/);
});

test('formatToolResultDisplay shows matchesFound while grep search is incomplete', () => {
    const display = formatToolResultDisplay({
        toolName: TOOL_NAMES.GREP,
        content: JSON.stringify({
            pattern: 'shared-token',
            outputMode: 'content',
            items: [
                { path: 'local/a.txt', line: 1, text: 'shared-token' },
            ],
            matchesFound: 42,
            searchComplete: false,
            truncated: false,
            scannedFiles: 3,
            candidateFiles: 10,
            nextOffset: 1,
        }),
    });

    assert.match(display.summary, /已找到 42 条，搜索仍在继续/);
    assert.doesNotMatch(display.summary, /总结果数：/);
});

test('formatToolResultDisplay shows totalMatches after grep search completes', () => {
    const display = formatToolResultDisplay({
        toolName: TOOL_NAMES.GREP,
        content: JSON.stringify({
            pattern: 'shared-token',
            outputMode: 'content',
            items: [
                { path: 'local/a.txt', line: 1, text: 'shared-token' },
            ],
            matchesFound: 156,
            totalMatches: 156,
            searchComplete: true,
            truncated: false,
            scannedFiles: 10,
            candidateFiles: 10,
            nextOffset: 1,
        }),
    });

    assert.match(display.summary, /总结果数：156/);
    assert.doesNotMatch(display.summary, /搜索仍在继续/);
});

test('formatToolResultDisplay keeps grep totalMatches as total match count in count mode', () => {
    const display = formatToolResultDisplay({
        toolName: TOOL_NAMES.GREP,
        content: JSON.stringify({
            pattern: 'token-d',
            outputMode: 'count',
            items: [
                { path: 'local/one.txt', matchCount: 2 },
                { path: 'local/two.md', matchCount: 1 },
            ],
            matchesFound: 3,
            totalMatches: 3,
            matchedFiles: 2,
            searchComplete: true,
            truncated: false,
            scannedFiles: 2,
            candidateFiles: 2,
            nextOffset: 2,
        }),
    });

    assert.match(display.summary, /总结果数：3/);
    assert.match(display.summary, /local\/one\.txt（2 处）/);
    assert.match(display.summary, /local\/two\.md（1 处）/);
});

test('formatToolResultDisplay summarizes plan tool results', () => {
    const display = formatToolResultDisplay({
        toolName: TOOL_NAMES.PLAN_CREATE,
        content: JSON.stringify({
            ok: true,
            plan: {
                id: 'plan-1',
                title: '检查 PLAN 工具',
                status: 'pending',
                priority: 'normal',
                owner: 'assistant',
            },
            blockers: [],
        }),
    });

    assert.match(display.summary, /计划已创建：检查 PLAN 工具/);
    assert.match(display.summary, /id：plan-1/);
    assert.match(display.details, /☐ 检查 PLAN 工具 \(plan-1\)/);
    assert.match(display.details, /状态：待办/);
    assert.doesNotMatch(display.details, /^\s*\{/);
});

test('formatToolResultDisplay renders plan lists as checklist details', () => {
    const display = formatToolResultDisplay({
        toolName: TOOL_NAMES.PLAN_LIST,
        content: JSON.stringify({
            ok: true,
            count: 2,
            plans: [
                {
                    id: 'plan-done',
                    title: '完成工具展示',
                    status: 'completed',
                    priority: 'normal',
                    owner: 'assistant',
                },
                {
                    id: 'plan-next',
                    title: '继续验证',
                    status: 'pending',
                    priority: 'high',
                    owner: 'assistant',
                },
            ],
        }),
    });

    assert.match(display.summary, /当前会话计划：2 项/);
    assert.match(display.details, /☑ 完成工具展示 \(plan-done\)/);
    assert.match(display.details, /☐ 继续验证 \(plan-next\)/);
    assert.doesNotMatch(display.details, /"plans"/);
});

test('formatToolResultDisplay summarizes delegate tool results', () => {
    const display = formatToolResultDisplay({
        toolName: TOOL_NAMES.DELEGATE_RUN,
        content: JSON.stringify({
            ok: true,
            status: 'completed',
            result: '完成检查，没有发现问题。',
            summary: '完成检查',
            rounds: 2,
            toolCallCount: 1,
            toolTrace: [
                {
                    name: TOOL_NAMES.READ,
                    ok: true,
                    args: 'filePath: local/a.txt',
                    summary: '读取完成',
                },
            ],
        }),
    });

    assert.match(display.summary, /子任务状态：completed/);
    assert.match(display.summary, /工具调用：1/);
    assert.match(display.details, /完成检查，没有发现问题/);
    assert.match(display.details, /Read/);
});

test('formatToolResultDisplay summarizes web search results', () => {
    const display = formatToolResultDisplay({
        toolName: TOOL_NAMES.WEB_SEARCH,
        content: JSON.stringify({
            ok: true,
            query: '京都町屋结构',
            maxResults: 3,
            count: 1,
            results: [
                {
                    title: 'Kyoto Machiya Guide',
                    url: 'https://example.com/machiya',
                    content: 'Traditional machiya usually have a narrow frontage and deep plan.',
                    score: 0.91,
                },
            ],
        }),
    });

    assert.match(display.summary, /已联网搜索：京都町屋结构/);
    assert.match(display.summary, /结果数：1/);
    assert.match(display.details, /Kyoto Machiya Guide/);
    assert.match(display.details, /Traditional machiya/);
});

test('formatToolResultDisplay shows apply_patch recovery guidance on failure', () => {
    const display = formatToolResultDisplay({
        toolName: TOOL_NAMES.APPLY_PATCH,
        content: JSON.stringify({
            ok: false,
            summary: 'Patch 校验失败，未修改任何文件。',
            nextStep: '先 Read 目标文件当前内容，再用当前文件里真实存在的原文行重写 patchText；不要凭记忆或旧内容匹配。',
            error: 'apply_patch_apply_error:hunk 1 old block did not match the current file',
            recovery: {
                rules: [
                    '复制 Read 返回的当前原文作为空格上下文行和 `-` 删除行。',
                ],
            },
        }),
    });

    assert.match(display.summary, /Patch 校验失败/);
    assert.match(display.summary, /下一步：先 Read 目标文件当前内容/);
    assert.match(display.details, /old block did not match/);
    assert.match(display.details, /复制 Read 返回/);
    assert.doesNotMatch(display.summary, /补丁已应用/);
});

test('formatToolResultDisplay summarizes streamed read previews without fake total lines', () => {
    const display = formatToolResultDisplay({
        toolName: TOOL_NAMES.READ,
        content: JSON.stringify({
            path: 'scripts/extensions/third-party/LittleWhiteBox/modules/assistant/assistant.js',
            source: 'littlewhitebox',
            startLine: 1,
            endLine: 2000,
            totalLinesKnown: false,
            hasMoreAfter: true,
            nextOffset: 2001,
            autoChunked: true,
            contentFormat: 'numbered_lines',
            content: '1\tconst example = true;',
        }),
    });

    assert.match(display.summary, /总行数未知（当前为首段预览）/);
    assert.match(display.summary, /文件较大，当前自动返回首段/);
    assert.match(display.summary, /后面还有内容；如需继续，可从第 2001 行继续读/);
});

test('describeToolCall shows Read tail requests without hiding the file path', () => {
    const description = describeToolCall(TOOL_NAMES.READ, {
        filePath: 'local/app.log',
        tail: 300,
    });

    assert.equal(description, '读取文件 local/app.log tail:300');
});

test('formatToolResultDisplay summarizes Read tail windows as tail, not fake line numbers', () => {
    const display = formatToolResultDisplay({
        toolName: TOOL_NAMES.READ,
        content: JSON.stringify({
            path: 'scripts/extensions/third-party/LittleWhiteBox/app.log',
            source: 'littlewhitebox',
            totalLinesKnown: false,
            tailLines: 300,
            startLine: null,
            endLine: null,
            returnedLines: 2,
            hasMoreBefore: true,
            hasMoreAfter: false,
            contentFormat: 'numbered_lines',
            content: 'error one\nerror two',
        }),
    });

    assert.match(display.summary, /范围：末尾 300 行/);
    assert.doesNotMatch(display.summary, /第 1 行到第 0 行/);
    assert.match(display.details, /error two/);
});
