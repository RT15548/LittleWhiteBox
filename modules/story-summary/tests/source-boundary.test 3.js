import assert from 'node:assert/strict';
import test from 'node:test';

import { getSummarySourceEnd, registerSummarySourceBoundary } from '../generate/source-boundary.js';

test('summary delay and producer ownership independently limit eligible source floors', () => {
    const chat = Array.from({ length: 22 }, () => ({ mes: 'story' }));
    const release = registerSummarySourceBoundary(() => 18);
    try {
        assert.equal(getSummarySourceEnd(chat, 21), 18);
        assert.equal(getSummarySourceEnd(chat, 21, 2), 18);
        assert.equal(getSummarySourceEnd(chat, 21, 4), 17);
        assert.equal(getSummarySourceEnd(chat, 10, 2), 10);
    } finally {
        release();
    }
});
