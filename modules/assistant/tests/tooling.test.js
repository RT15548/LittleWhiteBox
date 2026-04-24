import test from 'node:test';
import assert from 'node:assert/strict';

import { formatToolResultDisplay, TOOL_NAMES } from '../app-src/tooling.js';

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
