import assert from 'node:assert/strict';
import test from 'node:test';
import { forestCanopies, isAreaElement, isSceneObject, sceneElementLabelPoint, sceneElementPath, sceneElementTransform } from '../apps/map/ui/scene-geometry.js';
import { elementPresentation, sortedSceneElements } from '../apps/map/ui/map-presentation.js';

const rectangle = (id, category = 'terrain', material = 'forest') => ({ id, category, material, shape: 'rect', geometry: { x: 0, y: 0, width: 120, height: 60 } });

test('wall outlines never fill floors; explicit open paths override category defaults', () => {
    for (const shape of ['rect', 'circle', 'path', 'curve']) {
        const geometry = shape === 'rect' ? rectangle('x').geometry : shape === 'circle' ? { x: 0, y: 0, radius: 20 } : { points: [[0, 0], [50, 0], [50, 40]] };
        const wall = { id: 'wall', category: 'wall', shape, geometry, closed: true };
        assert.equal(elementPresentation(wall, 'test').fill, 'none');
        if (shape === 'path' || shape === 'curve') {
            for (const category of ['water', 'terrain', 'wall', 'road']) {
                const element = { ...wall, category, closed: false };
                assert.equal(isAreaElement(element), false);
                assert.equal(sceneElementPath(element).endsWith('Z'), false);
                assert.equal(elementPresentation(element, 'test').fill, 'none');
            }
        }
    }
});

test('rotation uses the footprint centre while labels stay unrotated and outside furniture', () => {
    const element = { ...rectangle('table', 'furniture', 'metal'), rotation: 90 };
    const original = structuredClone(element);
    assert.equal(sceneElementTransform(element), 'rotate(90 60 30)');
    assert.deepEqual(sceneElementLabelPoint(element), [60, 103]);
    assert.deepEqual(element, original);
    assert.equal(sceneElementTransform({ ...element, rotation: 0 }), undefined);
    assert.deepEqual(sceneElementLabelPoint({ ...element, shape: 'circle', geometry: { x: 15, y: 20, radius: 5 } }), [15, 38]);
});

test('line labels stay beside their actual middle segment', () => {
    const road = { id: 'trail', category: 'road', shape: 'path', geometry: { points: [[0, 0], [100, 0]] } };
    assert.deepEqual(sceneElementLabelPoint(road), [50, -13]);
    // The bounding-box centre of this bend is 160 units from the line.
    // Both the polyline and its smoothed curve have a vertical middle segment.
    for (const category of ['road', 'water', 'terrain']) {
        for (const shape of ['path', 'curve']) {
            const element = { id: 'bend', category, shape, closed: false, geometry: { points: [[40, 40], [360, 40], [360, 540]] } };
            for (const unitScale of [.5, 1, 2]) {
                const [x, y] = sceneElementLabelPoint(element, unitScale);
                assert.ok(Math.abs(Math.abs(x - 360) / unitScale - 13) < .001, `${category}/${shape}: label stays 13px from the line`);
                assert.ok(y > 40 && y < 540, `${category}/${shape}: label stays alongside the middle segment`);
            }
        }
    }
});

test('water and terrain area labels retain their centres with explicit or default closure', () => {
    for (const category of ['water', 'terrain']) {
        for (const shape of ['path', 'curve']) {
            const element = { id: 'area', category, shape, geometry: { points: [[40, 40], [360, 40], [360, 540]] } };
            assert.deepEqual(sceneElementLabelPoint(element), [200, 290]);
            assert.deepEqual(sceneElementLabelPoint({ ...element, closed: true }), [200, 290]);
        }
        assert.deepEqual(sceneElementLabelPoint(rectangle('floor', category)), [60, 30]);
        assert.deepEqual(sceneElementLabelPoint({ id: 'pond', category, shape: 'circle', geometry: { x: 20, y: 30, radius: 10 } }), [20, 30]);
    }
});

test('materials are independent of object tokens, and large base surfaces precede overlays', () => {
    const wood = { ...rectangle('table', 'furniture', 'wood'), icon: 'table' };
    const metal = { ...wood, material: 'metal' };
    assert.notEqual(elementPresentation(wood, 'p').fill, elementPresentation(metal, 'p').fill);
    assert.equal(elementPresentation(wood, 'p').icon, elementPresentation(metal, 'p').icon);
    const base = rectangle('z-base');
    const overlay = { ...rectangle('a-rug'), geometry: { x: 10, y: 10, width: 30, height: 20 } };
    assert.deepEqual(sortedSceneElements([overlay, base]).map(e => e.id), ['z-base', 'a-rug']);
});

test('forest decorations are bounded, deterministic, order independent and not stored', () => {
    const elements = Array.from({ length: 128 }, (_, i) => ({ ...rectangle(`forest-${i}`), geometry: { x: 0, y: 0, width: 100000, height: i ? 100000 : .001 } }));
    const original = structuredClone(elements);
    const crowns = forestCanopies(elements);
    assert.ok([...crowns.values()].flat().length <= 256);
    assert.ok([...crowns.values()].flat().length > 0);
    assert.deepEqual(forestCanopies([...elements].reverse()), crowns);
    assert.deepEqual(elements, original);
    for (const crown of [...crowns.values()].flat()) {
        assert.ok([crown.x, crown.y, crown.size].every(Number.isFinite));
        assert.ok(crown.size > 0);
    }
    assert.equal(forestCanopies([{ id: 'open', category: 'terrain', material: 'forest', shape: 'path', closed: false, geometry: { points: [[0, 0], [10, 0], [10, 10]] } }]).size, 0);
    for (const icon of ['tree', 'rock']) {
        const object = { ...rectangle(icon, 'terrain'), shape: 'circle', geometry: { x: 20, y: 20, radius: 10 }, icon };
        assert.equal(isSceneObject(object), true);
        assert.equal(forestCanopies([object]).size, 0);
    }
    assert.deepEqual(forestCanopies([...elements, rectangle('not-forest', 'terrain', 'wood')]), crowns);
    assert.deepEqual(forestCanopies([...elements, { ...rectangle('individual-tree', 'decoration'), icon: 'tree' }]), crowns);
});
