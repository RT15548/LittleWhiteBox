import assert from 'node:assert/strict';
import test from 'node:test';
import { createTravelerGait } from '../apps/game/expedition/traveler-gait.ts';
import { RULES } from '../apps/game/expedition/content.ts';

// Protects render continuity when browsers draw several frames per simulation update.
test('30 Hz movement stays continuous at 30, 60 and 120 Hz rendering without an idle pose between samples', () => {
    const results = [];
    for (const fps of [30, 60, 120]) {
        const gait = createTravelerGait(), strides = [];
        for (let frame = 0; frame <= fps * 4; frame++) {
            const seconds = frame / fps, tick = Math.floor(frame * RULES.hz / fps);
            const point = { x: tick * RULES.speed, y: 0 }, before = { ...point };
            const pose = gait.update(point, seconds, false);
            assert.deepEqual(point, before);
            assert.ok(pose.lift >= 0 && pose.lift <= .04);
            if (seconds >= 1) assert.ok(pose.amount > .99);
            if (frame) assert.ok(Math.abs(pose.stride - strides.at(-1)) < 5 / fps);
            strides.push(pose.stride);
        }
        const crossings = strides.slice(1).filter((stride, i) => stride * strides[i] < 0).length;
        assert.ok(crossings >= 7 && crossings <= 11, `human walking cadence at ${fps} Hz: ${crossings}`);
        results.push(strides.filter((_, i) => i % (fps / 30) === 0));
        assert.equal(gait.active, true);
    }
    for (let i = 0; i < results[0].length; i++) {
        assert.ok(Math.abs(results[0][i] - results[1][i]) < .04);
        assert.ok(Math.abs(results[0][i] - results[2][i]) < .04);
    }
});

test('stopping and blocked movement settle smoothly; a new scene, portrait and reduced motion have no residual steps', () => {
    const gait = createTravelerGait();
    let pose;
    for (let frame = 0; frame <= 120; frame++) pose = gait.update({ x: frame * .03, y: 0 }, frame / 60, false);
    const stoppedAt = pose;
    for (let frame = 121; frame <= 180; frame++) {
        const next = gait.update({ x: 3.6, y: 0 }, frame / 60, false);
        assert.ok(Math.abs(next.stride - pose.stride) < .1);
        pose = next;
    }
    assert.ok(stoppedAt.amount > .99);
    assert.deepEqual(pose, { stride: 0, lift: 0, amount: 0 }); assert.equal(gait.active, false);
    gait.reset();
    assert.deepEqual(gait.update({ x: 200, y: -80 }, 4, false), pose);
    gait.update({ x: 201, y: -80 }, 4.03, false);
    assert.deepEqual(gait.update(null, 4.05, false), pose);
    gait.update({ x: 200, y: -80 }, 5, false);
    gait.update({ x: 201, y: -80 }, 5.04, false);
    assert.deepEqual(gait.update({ x: 202, y: -80 }, 5.08, true), pose);
    assert.deepEqual(gait.update({ x: 0, y: 0 }, 0, false), pose);
});
