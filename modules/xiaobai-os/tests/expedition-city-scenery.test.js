import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Mesh } from 'three';
import { createSceneKit } from '../apps/game/expedition/scene-kit.ts';
import { buildCityProps } from '../apps/game/expedition/presentation/city-props.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';

// Protect bounded rendering work and scene resource ownership, not mesh counts or artistic coordinates.
test('confirmed mechanisms animate once, stop while reading, and release their own geometry on departure', () => {
    for (const [scene, fact] of [['deep_waterway', 'deep_gate_opened'], ['pipe_gallery', 'return_flow_tested'], ['main_valve', 'heat_restored']]) {
        const kit = createSceneKit(), root = new Group(), props = buildCityProps(kit, root, COURTYARD[scene], new Set());
        const owned = new Set(), disposed = new Set(), shared = new Set(Object.values(kit.geometries));
        root.traverse(object => { if (object instanceof Mesh && !shared.has(object.geometry)) owned.add(object.geometry); });
        for (const geometry of owned) geometry.addEventListener('dispose', () => disposed.add(geometry));
        assert.equal(props.animating, false);
        props.setFacts(new Set([fact])); assert.equal(props.animating, true);
        assert.equal(props.animate(0, false), true);
        props.animate(2000, false); assert.equal(props.animating, false);
        props.setFacts(new Set([fact])); assert.equal(props.animate(3000, false), false);
        props.dispose(); assert.equal(root.children.length, 0); assert.deepEqual(disposed, owned);
        const loaded = buildCityProps(kit, root, COURTYARD[scene], new Set([fact]));
        assert.equal(loaded.animating, false); loaded.dispose();
        const reduced = buildCityProps(kit, root, COURTYARD[scene], new Set());
        reduced.setFacts(new Set([fact])); reduced.animate(0, true); assert.equal(reduced.animating, false);
        reduced.dispose(); kit.dispose();
    }
});
