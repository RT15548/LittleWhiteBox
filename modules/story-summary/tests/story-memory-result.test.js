import assert from 'node:assert/strict';
import test from 'node:test';

import { selectBestStoryMemoryResult } from '../generate/story-memory-result.js';

test('current recall takes precedence over canonical story memory', () => {
    const result = selectBestStoryMemoryResult(
        { text: '本轮召回', recallLogText: '召回日志' },
        'canonical 总结',
    );

    assert.deepEqual(result, { text: '本轮召回', recallLogText: '召回日志' });
});

test('empty or failed recall falls back to canonical story memory', () => {
    assert.deepEqual(
        selectBestStoryMemoryResult(undefined, 'canonical 总结'),
        { text: 'canonical 总结', recallLogText: '' },
    );
    assert.equal(selectBestStoryMemoryResult({ text: '   ' }, '   '), undefined);
});
