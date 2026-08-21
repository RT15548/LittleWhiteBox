import assert from 'node:assert/strict';
import test from 'node:test';

import { isRelationFact, parseRelationTarget } from '../data/fact-predicates.js';

test('relation fact predicates share one canonical parser', () => {
    assert.equal(parseRelationTarget('对 林月 的看法'), '林月');
    assert.equal(parseRelationTarget('身体特征'), null);
    assert.equal(isRelationFact({ p: '对林月的态度' }), true);
    assert.equal(isRelationFact({ p: '所在地' }), false);
});
