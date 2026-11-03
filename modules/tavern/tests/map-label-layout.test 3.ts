import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    estimateTavernMapLabelBounds,
    layoutTavernMapLabels,
    type TavernMapLabelBounds,
} from '../app-src/map-label-layout';

function overlaps(left: TavernMapLabelBounds, right: TavernMapLabelBounds) {
    return !(left.maxX <= right.minX || left.minX >= right.maxX || left.maxY <= right.minY || left.minY >= right.maxY);
}

function distanceFrom(item: { x: number; y: number }, x: number, y: number) {
    return Math.hypot(item.x - x, item.y - y);
}

test('map label layout deterministically moves overlapping labels apart', () => {
    const labels = [
        { id: 'a', text: '玩家', x: 120, y: 120, fontSize: 14, anchor: 'middle' },
        { id: 'b', text: '老板', x: 120, y: 120, fontSize: 14, anchor: 'middle' },
    ];

    const first = layoutTavernMapLabels(labels, [0, 0, 320, 240]);
    const second = layoutTavernMapLabels(labels, [0, 0, 320, 240]);

    assert.deepEqual(first, second);
    assert.deepEqual([first[0]?.x, first[0]?.y], [120, 120]);
    assert.notDeepEqual([first[1]?.x, first[1]?.y], [120, 120]);
    assert.equal(overlaps(
        estimateTavernMapLabelBounds(first[0]!),
        estimateTavernMapLabelBounds(first[1]!),
    ), false);
});

test('map label layout places higher-priority labels first', () => {
    const labels = [
        { id: 'ordinary', text: '普通标注', x: 160, y: 140, fontSize: 14, anchor: 'middle' },
        { id: 'player', text: '玩家', x: 160, y: 140, fontSize: 14, anchor: 'middle' },
    ];

    const laidOut = layoutTavernMapLabels(labels, [0, 0, 360, 260], {
        priority: (item) => item.id === 'player' ? 0 : 10,
    });

    assert.deepEqual([laidOut[1]?.x, laidOut[1]?.y], [160, 140]);
    assert.notDeepEqual([laidOut[0]?.x, laidOut[0]?.y], [160, 140]);
});

test('map label layout allows edge overflow when there are no label collisions', () => {
    const labels = [
        { id: 'edge', text: '边缘标注', x: 8, y: 14, fontSize: 14, anchor: 'middle' },
    ];

    const [laidOut] = layoutTavernMapLabels(labels, [0, 0, 240, 180]);
    const bounds = estimateTavernMapLabelBounds(laidOut!);

    assert.deepEqual([laidOut?.x, laidOut?.y], [8, 14]);
    assert.ok(bounds.minX < 0);
    assert.ok(bounds.minY < 0);
});

test('map label layout keeps edge labels stable instead of jumping to a side candidate without collisions', () => {
    const labels = [
        { id: 'edge', text: '边缘标注', x: 8, y: 14, fontSize: 14, anchor: 'middle' },
    ];

    const [laidOut] = layoutTavernMapLabels(labels, [0, 0, 240, 180]);

    assert.deepEqual([laidOut?.x, laidOut?.y], [8, 14]);
});

test('map label layout keeps candidate moves visually close to the anchor', () => {
    const labels = [
        { id: 'a', text: '非常非常长的地图标注一', x: 120, y: 120, fontSize: 14, anchor: 'middle' },
        { id: 'b', text: '非常非常长的地图标注二', x: 120, y: 120, fontSize: 14, anchor: 'middle' },
    ];

    const laidOut = layoutTavernMapLabels(labels, [0, 0, 320, 240]);

    assert.ok(Math.max(...laidOut.map((item) => distanceFrom(item, 120, 120))) <= 48);
});
