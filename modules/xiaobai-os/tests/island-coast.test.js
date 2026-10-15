import assert from 'node:assert/strict';
import test from 'node:test';
import * as T from 'three';
import { LANDSCAPE, LANDING } from '../apps/game/island/content.ts';
import { shoreDistance } from '../apps/game/island/coastline.ts';
import { canStand } from '../apps/game/island/space.ts';
import { elevationAt } from '../apps/game/island/terrain.ts';
import { islandGround } from '../apps/game/island/presentation/terrain-mesh.ts';
import { oceanGeometry } from '../apps/game/island/presentation/ocean-mesh.ts';

// Distances control flooding as well as rendering. Compare against the actual
// walk boundary, not an implementation-specific tree or a visual snapshot.
test('shore proximity remains exact inside coves, at headlands and out at sea', () => {
    const exact = p => Math.min(...LANDSCAPE.land.map((a, i) => {
        const b = LANDSCAPE.land[(i + 1) % LANDSCAPE.land.length];
        const edge = new T.Vector2(b.x - a.x, b.y - a.y), offset = new T.Vector2(p.x - a.x, p.y - a.y);
        return offset.sub(edge.clone().multiplyScalar(T.MathUtils.clamp(offset.dot(edge) / edge.lengthSq(), 0, 1))).length();
    }));
    for (let i = 0; i < LANDSCAPE.land.length; i += 7) {
        const a = LANDSCAPE.land[i];
        for (const scale of [.5, .998, 1, 1.008, 2]) {
            const p = { x: a.x * scale, y: a.y * scale };
            assert.ok(Math.abs(shoreDistance(p) - exact(p)) < 1e-8);
        }
    }
    for (const p of Object.values(LANDING)) { assert.equal(canStand(p, LANDSCAPE), true); }
});

test('the sea joins every actual coastline point and never covers a cove with an offshore triangle', () => {
    const geometry = oceanGeometry(), positions = geometry.getAttribute('position'), distances = geometry.getAttribute('shoreMetres');
    for (let i = 0; i < LANDSCAPE.land.length; i++) {
        const p = LANDSCAPE.land[i];
        assert.ok(Math.abs(positions.getX(i) - p.x) < .0001);
        assert.ok(Math.abs(positions.getZ(i) - p.y) < .0001);
        assert.equal(distances.getX(i), 0);
    }
    const indices = geometry.getIndex(), a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3();
    for (let i = 0; i < indices.count; i += 3) {
        a.fromBufferAttribute(positions, indices.getX(i)); b.fromBufferAttribute(positions, indices.getX(i + 1)); c.fromBufferAttribute(positions, indices.getX(i + 2));
        assert.equal(canStand({ x: (a.x + b.x + c.x) / 3, y: (a.z + b.z + c.z) / 3 }, LANDSCAPE), false);
        assert.ok(b.clone().sub(a).cross(c.clone().sub(a)).y > 0);
    }
    geometry.dispose();
});

test('the walkable shoreline is also pickable ground with the same bed and shore distance', () => {
    const material = new T.MeshStandardMaterial(), mesh = islandGround(material), ray = new T.Raycaster();
    mesh.updateMatrixWorld();
    const samples = [LANDING.player, { x: -729, y: -35 }, { x: -731, y: 25 }, { x: 800, y: 0 }];
    for (const p of samples) {
        ray.set(new T.Vector3(p.x, 40, p.y), new T.Vector3(0, -1, 0));
        const hit = ray.intersectObject(mesh)[0]; assert.ok(hit);
        assert.ok(Math.abs(hit.point.y - elevationAt(p)) < .035);
    }
    const positions = mesh.geometry.getAttribute('position'), distances = mesh.geometry.getAttribute('shoreMetres');
    for (let i = 0; i < positions.count; i += 113) {
        assert.ok(Math.abs(distances.getX(i) - shoreDistance({ x: positions.getX(i), y: positions.getZ(i) })) < .0001);
    }
    mesh.geometry.dispose(); material.dispose();
});
