import assert from 'node:assert/strict';
import test from 'node:test';
import { layoutSceneLabels } from '../apps/map/ui/three/scene3d-label-layout.js';

const marker = (id, x, y, priority) => ({ id, anchor: { x, y }, priority, badge: { w: 30, h: 30 }, caption: { w: 40, h: 22 } });
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

test('nearby player and entrance retain separate badges and exact positions when captions collide', () => {
    const input = [marker('exit', 578, 514, 1), marker('player', 617, 471, 0)];
    const original = structuredClone(input);
    const result = layoutSceneLabels(input, 900, 600);
    for (const item of input) {
        assert.ok(result.get(item.id).badge);
        assert.deepEqual(result.get(item.id).anchor, item.anchor);
    }
    assert.ok(!overlaps(result.get('exit').badge, result.get('player').badge));
    assert.deepEqual(input, original);
});

test('NPC input order and long names cannot hide or displace the player badge', () => {
    const input = [marker('npc', 161, 259, 2), marker('player', 160, 260, 0), marker('entrance', 175, 280, 1)];
    input[0].caption = { w: 144, h: 85 };
    const alone = layoutSceneLabels([input[1]], 320, 400).get('player');
    const result = layoutSceneLabels(input, 320, 400);
    assert.deepEqual(result.get('player').badge, alone.badge);
    const boxes = input.map(item => result.get(item.id).badge);
    assert.ok(boxes.every(Boolean));
    for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) assert.ok(!overlaps(boxes[i], boxes[j]));
    }
    assert.deepEqual(result, layoutSceneLabels([...input].reverse(), 320, 400));
});

test('names toggle changes only captions, including markers beside viewport controls', () => {
    const input = [marker('player', 287, 260, 0), marker('door', 311, 390, 1)];
    const controls = [{ x: 269, y: 280, w: 39, h: 112 }];
    const on = layoutSceneLabels(input, 320, 400, controls);
    const off = layoutSceneLabels(input.map(item => ({ ...item, caption: undefined })), 320, 400, controls);
    for (const item of input) {
        const shown = on.get(item.id), hidden = off.get(item.id);
        assert.deepEqual(hidden.anchor, item.anchor);
        assert.deepEqual(hidden.badge, shown.badge);
        assert.equal(hidden.caption, undefined);
        assert.ok(!overlaps(shown.badge, controls[0]));
        assert.ok(shown.badge.x >= 0 && shown.badge.x + shown.badge.w <= 320);
        assert.ok(shown.badge.y >= 0 && shown.badge.y + shown.badge.h <= 400);
    }
});

test('crowding may omit text but never loses an in-view marker or changes its location', () => {
    const input = Array.from({ length: 128 }, (_, i) => marker(String(i), 160, 180, i ? 2 : 0));
    const result = layoutSceneLabels(input, 320, 360);
    assert.equal(result.size, input.length);
    for (const item of input) {
        assert.ok(result.get(item.id).badge);
        assert.deepEqual(result.get(item.id).anchor, item.anchor);
    }
    assert.ok([...result.values()].some(item => !item.caption));
});
