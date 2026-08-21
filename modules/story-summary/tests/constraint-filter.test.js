import test from 'node:test';
import assert from 'node:assert/strict';

import { filterConstraintsByRelevance } from '../generate/constraint-filter.js';

test('ordinary USER facts remain relevant without making unrelated characters relevant', () => {
    const userFact = { s: '蓝 袖', p: '身份', o: '旅人' };
    const unrelatedCharacterFact = { s: '林月', p: '身份', o: '医师' };
    const worldFact = { s: '城门', p: '状态', o: '关闭' };

    assert.deepEqual(
        filterConstraintsByRelevance(
            [userFact, unrelatedCharacterFact, worldFact],
            [],
            new Set(['蓝袖', '林月']),
            '蓝袖',
        ),
        [userFact, worldFact],
    );
});
