import assert from 'node:assert/strict';
import test from 'node:test';

import { gameDiceRevealTimeline } from '../apps/game/ui/game-motion.js';

test('a five-die showdown reveals the result promptly after the dice land', () => {
    const timeline = gameDiceRevealTimeline(5);

    assert.deepEqual(timeline, { countAt: 980, verdictAt: 1_160, settledAt: 1_360 });
    assert.ok(timeline.verdictAt <= 1_200);
    assert.ok(timeline.settledAt <= 1_400);
});
