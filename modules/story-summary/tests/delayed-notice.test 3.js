import assert from 'node:assert/strict';
import test from 'node:test';

import { scheduleDelayedNotice } from '../../../shared/common/delayed-notice.js';

test('a completed task cancels its pending delayed notice', async () => {
    let calls = 0;
    const cancel = scheduleDelayedNotice(() => calls++, 10);

    cancel();
    await new Promise(resolve => setTimeout(resolve, 20));

    assert.equal(calls, 0);
});

test('a slow task shows its notice only after the delay', async () => {
    let calls = 0;
    const cancel = scheduleDelayedNotice(() => calls++, 5);

    assert.equal(calls, 0);
    await new Promise(resolve => setTimeout(resolve, 20));
    cancel();

    assert.equal(calls, 1);
});
