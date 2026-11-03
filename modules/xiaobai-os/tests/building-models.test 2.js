import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Group, Vector3 } from 'three';
import { generate, blueprint, certifiedPlans } from '../apps/game/building/generation.ts';
import { houseParts } from '../apps/game/building/house.ts';
import { CELL, TIERS, PARTS } from '../apps/game/building/policy.ts';
import { createResources } from '../apps/game/building/scene/resources.ts';
import { createPartModel, createSite, worldX, worldZ } from '../apps/game/building/scene/models.ts';
import { createMascotWalker, MASCOT_RUN_DURATION_MS } from '../brand/mascot/performance.ts';
import { pixelRatio, RENDER_BUDGET } from '../apps/game/building/scene/quality.ts';
import { createKeepsake } from '../apps/game/building/scene/keepsakes.ts';
import { MEMORY_IDS, keepsakePlacements } from '../apps/game/building/memories.ts';
import { memoryLayout } from './fixtures/building-memory-layouts.mjs';

test('earned keepsakes share their room frame and release merged GPU geometry once', () => {
    const r = createResources(), brief = { ...blueprint(17, 'sunroom'), materials: 20 };
    try {
        for (const gift of keepsakePlacements(brief, memoryLayout(brief), MEMORY_IDS)) {
            const model = createKeepsake(r, brief, gift), p = gift.part;
            assert.equal(model.root.position.x, worldX(brief, p.x) + (PARTS[p.kind].width - 1) * CELL.width / 2);
            assert.equal(model.root.position.z, worldZ(brief, p.z));
            assert.equal(model.root.position.y, p.y * CELL.height);
            let meshes = 0, disposed = 0;
            model.root.traverse(o => { if (o.isMesh) { meshes++; o.geometry.addEventListener('dispose', () => disposed++); } });
            assert.ok(meshes > 0);
            model.dispose(); model.dispose(); assert.equal(disposed, meshes);
        }
    } finally { r.dispose(); }
});

test('constructed components align to rule-owned cells and dispose their batches once', async () => {
    const r = createResources();
    try {
        for (const tier of TIERS) {
            const b = blueprint(await generate(17, tier), tier), parts = houseParts(b, certifiedPlans(b)[0]), site = createSite(r, b);
            assert.ok(new Box3().setFromObject(site.root).max.y < .2); site.dispose();
            for (const p of parts) {
                const model = createPartModel(r, b, parts, p, true, []); let meshes = 0, disposed = 0;
                assert.equal(model.root.position.x, worldX(b, p.x) + (PARTS[p.kind].width - 1) * CELL.width / 2);
                assert.equal(model.root.position.y, p.y * CELL.height);
                assert.equal(model.root.position.z, worldZ(b, p.z));
                model.root.traverse(o => { if (o.isMesh) { meshes++; o.geometry.addEventListener('dispose', () => disposed++); } });
                assert.ok(meshes > 0 && meshes <= 10);
                model.dispose(); model.dispose(); assert.equal(disposed, meshes);
            }
        }
    } finally { r.dispose(); }
});

test('Xiaobai traverses supplied route in order and comes to rest exactly at the destination', () => {
    const mascot = new Group(), walk = createMascotWalker(mascot), points = [new Vector3(0, 0, 1), new Vector3(1, 0, 1), new Vector3(1, 1, 1)];
    assert.equal(walk.walk(points, 0), true); assert.deepEqual(mascot.position, points[0]);
    assert.equal(walk.walk(points, MASCOT_RUN_DURATION_MS), true); assert.deepEqual(mascot.position, points[1]);
    assert.equal(walk.walk(points, MASCOT_RUN_DURATION_MS * 3), false); assert.deepEqual(mascot.position, points[2]);
});

test('mobile backing buffers stay within pixel budget at high DPR', () => {
    for (const [w, h] of [[320, 568], [390, 844], [844, 390], [1920, 1080]]) {
        const ratio = pixelRatio(w, h, 4);
        assert.ok(ratio <= RENDER_BUDGET.maxDpr); assert.ok(w * h * ratio * ratio <= RENDER_BUDGET.maxPixels + 1);
    }
});
