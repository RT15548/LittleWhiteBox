import assert from 'node:assert/strict';
import test from 'node:test';
import * as T from 'three';
import { WATER_BASINS, basinRadius, basinExtent } from '../apps/game/island/water-basins.ts';
import { elevationAt, basinWaterLevel } from '../apps/game/island/terrain.ts';
import { islandGround } from '../apps/game/island/presentation/terrain-mesh.ts';
import { waterBasin } from '../apps/game/island/presentation/water-basin.ts';
import { RESOURCE_RULES } from '../apps/game/island/survival-content.ts';

// Actual geometry, not a source inspection: protects water/ground intersections and picking.
test('every authored water basin has submerged ground and a continuous dry rim', () => {
    for (const basin of WATER_BASINS) {
        const center = basin.position, water = basinWaterLevel(basin.kind, center);
        assert.ok(elevationAt(center) < water);
        for (let i = 0; i < 24; i++) {
            const angle = i / 24 * Math.PI * 2, radius = basinRadius(basin.kind, center, angle);
            const p = scale => ({ x: center.x + Math.cos(angle) * radius * scale, y: center.y + Math.sin(angle) * radius * scale });
            assert.ok(elevationAt(p(.3)) < water);
            assert.ok(elevationAt(p(1)) > water);
            assert.ok(Math.abs(elevationAt(p(1.001)) - elevationAt(p(.999))) < .01);
        }
    }
});

test('rendered ground and ray picking follow the basin footing instead of bridging over the water', () => {
    const material = new T.MeshStandardMaterial(), ground = islandGround(material), ray = new T.Raycaster();
    ground.updateMatrixWorld();
    for (const basin of WATER_BASINS) {
        for (const ratio of [0, .3, .65, 1]) {
            const p = { x: basin.position.x + basinExtent(basin.kind) * ratio, y: basin.position.y };
            ray.set(new T.Vector3(p.x, 30, p.y), new T.Vector3(0, -1, 0));
            const hit = ray.intersectObject(ground)[0];
            assert.ok(hit);
            assert.ok(Math.abs(hit.point.y - elevationAt(p)) < .03);
            if (ratio === 0) { assert.ok(hit.point.y < basinWaterLevel(basin.kind, basin.position)); }
        }
    }
    ground.geometry.dispose(); material.dispose();
});

test('basin water is horizontal and uses the same floor; an exhausted seep shows no water', () => {
    const stone = new T.MeshStandardMaterial(), water = new T.MeshStandardMaterial();
    for (const basin of WATER_BASINS) {
        const group = waterBasin(basin, stone, water, 0), surface = group.children.find(c => c.material === water);
        assert.ok(surface);
        const positions = surface.geometry.getAttribute('position');
        const fill = basin.kind === 'seep' ? basin.stock / RESOURCE_RULES.seep.capacity : 1;
        for (let i = 0; i < positions.count; i++) {
            assert.ok(Math.abs(positions.getY(i) + elevationAt(basin.position) - basinWaterLevel(basin.kind, basin.position, fill)) < 1e-6);
        }
        group.traverse(o => o.geometry?.dispose());
    }
    const seep = WATER_BASINS.find(b => b.kind === 'seep'), dry = waterBasin({ ...seep, stock: 0 }, stone, water, 0);
    assert.equal(dry.children.some(c => c.material === water), false);
    dry.traverse(o => o.geometry?.dispose()); stone.dispose(); water.dispose();
});
