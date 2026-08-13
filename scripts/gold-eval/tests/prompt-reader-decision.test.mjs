import test from 'node:test';
import assert from 'node:assert/strict';

import { exactMcNemarP } from '../experiments/prompt-reader-decision.mjs';

test('exact McNemar 使用双侧二项分布计算 paired discordance', () => {
    assert.equal(exactMcNemarP(0, 0), 1);
    assert.equal(exactMcNemarP(9, 1), 0.021484375);
    assert.equal(exactMcNemarP(5, 5), 1);
});
