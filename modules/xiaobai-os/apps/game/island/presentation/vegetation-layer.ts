import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LANDSCAPE } from '../content.js';
import { terrainAt } from '../environment.js';
import type { Point } from '../model.js';
import { canStand, inside } from '../space.js';
import { elevationAt } from '../terrain.js';
import { disposeGroup } from './meshes.js';
import { palm, coastalPlant, mangrove, thicket } from './vegetation-models.js';
import type { Foliage } from './foliage.js';
import type { Cutaway } from './cutaway.js';
import { reefRockGeometry } from './reef-rock.js';

type Plant = 'palm' | 'coastal' | 'mangrove' | 'thicket' | 'rock';
function bake(group: T.Group, retained: readonly T.Material[]) {
    group.updateMatrixWorld(true);
    const byMaterial = new Map<T.MeshStandardMaterial, T.BufferGeometry[]>();
    group.traverse(object => {
        if (!(object instanceof T.Mesh) || Array.isArray(object.material)) { return; }
        const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
        geometry.applyMatrix4(object.matrixWorld);
        if (!(object.material as T.MeshStandardMaterial).map) { geometry.deleteAttribute('uv'); }
        const batch = byMaterial.get(object.material) ?? []; batch.push(geometry); byMaterial.set(object.material, batch);
    });
    disposeGroup(group, retained); group.clear();
    return [...byMaterial].map(([material, geometries]) => {
        const merged = mergeGeometries(geometries); for (const geometry of geometries) { geometry.dispose(); }
        if (!merged) { throw new Error('island_geometry_merge'); }
        return { geometry: merged, material };
    });
}

export function createVegetationLayer(scene: T.Scene, foliage: Foliage, cutaway: Cutaway, stone: T.MeshStandardMaterial) {
    const group = new T.Group(); scene.add(group);
    const templates = new Map<string, ReturnType<typeof bake>>();
    let cell = '';
    function template(kind: Plant, variant: number) {
        const key = `${kind}:${variant}`; let parts = templates.get(key);
        if (!parts) {
            const seed = variant * 17 + 3;
            const model = kind === 'palm' ? palm(seed, foliage) : kind === 'mangrove' ? mangrove(seed, foliage)
                : kind === 'coastal' ? coastalPlant(seed, foliage, .75) : kind === 'thicket' ? thicket(seed, foliage) : new T.Group();
            if (kind === 'rock') { const rock = new T.Mesh(reefRockGeometry(seed), stone); rock.position.y = .16; model.add(rock); }
            parts = bake(model, [...foliage.materials, stone]); templates.set(key, parts);
        }
        return parts;
    }
    function clear() { for (const mesh of group.children) { (mesh as T.InstancedMesh).dispose(); } group.clear(); }
    function update(position: Point) {
        const next = `${Math.floor(position.x / 25)}:${Math.floor(position.y / 25)}`;
        if (next === cell) { return; } cell = next; clear();
        const cx = Math.floor(position.x / 25) * 25, cy = Math.floor(position.y / 25) * 25;
        const batches = new Map<string, { parts: ReturnType<typeof bake>; matrices: T.Matrix4[] }>();
        function add(kind: Plant, seed: number, p: Point, scale = 1) {
            // Small world-anchored batches allow the renderer to cull offscreen foliage.
            const variant = Math.floor(seed) % 3, key = `${Math.floor(p.x / 25)}:${Math.floor(p.y / 25)}:${kind}:${variant}`;
            let batch = batches.get(key);
            if (!batch) { batch = { parts: template(kind, variant), matrices: [] }; batches.set(key, batch); }
            batch.matrices.push(new T.Matrix4().compose(new T.Vector3(p.x, elevationAt(p), p.y),
                new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), seed), new T.Vector3(scale, scale, scale)));
        }
        // Both lattices are world anchored: crossing a loading boundary never moves a plant.
        for (let x = Math.floor((cx - 75) / 7) * 7; x < cx + 75; x += 7) { for (let y = Math.floor((cy - 75) / 7) * 7; y < cy + 75; y += 7) {
            const seed = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453), f = seed % 1;
            const p = { x: x + f * 5, y: y + Math.sin(seed) * 4 };
            if (!canStand(p, LANDSCAPE)) { continue; }
            const type = terrainAt(p);
            if (type === 'reef' || type === 'sand' && p.x < -722) {
                if (type === 'reef' || f < .15) { add('rock', seed, p, type === 'reef' ? .5 + f : .15 + f); }
                continue;
            }
            if (type === 'mangrove') { if (f < .5) { add('mangrove', seed, p); } }
            else if (f < .33) { add('palm', seed, p); }
            else if (f < .8 && !LANDSCAPE.sightScreens.some(screen => inside(p, screen))) {
                // Open undergrowth is below eye level. Dense, eye-level foliage comes only
                // from the same footprints used by sight, not an unrelated decoration map.
                add('coastal', seed, p, .9 + f * .3);
            }
        } }
        for (let x = Math.floor((cx - 75) / 4) * 4; x < cx + 75; x += 4) { for (let y = Math.floor((cy - 75) / 4) * 4; y < cy + 75; y += 4) {
            const seed = Math.abs(Math.sin(x * 7.137 + y * 41.31) * 9123.71);
            const p = { x: x + Math.sin(seed) * .75, y: y + Math.cos(seed * 3) * .75 };
            if (canStand(p, LANDSCAPE) && LANDSCAPE.sightScreens.some(screen => inside(p, screen))) { add('thicket', seed, p, .9 + seed % 1 * .2); }
        } }
        for (const { parts, matrices } of batches.values()) { for (const part of parts) {
            const object = new T.InstancedMesh(part.geometry, cutaway.material(part.material), matrices.length);
            matrices.forEach((matrix, i) => object.setMatrixAt(i, matrix)); object.instanceMatrix.needsUpdate = true;
            object.computeBoundingSphere(); object.castShadow = true; object.receiveShadow = true; group.add(object);
        } }
    }
    return { update, dispose() { clear(); for (const parts of templates.values()) { for (const p of parts) { p.geometry.dispose(); } } templates.clear(); scene.remove(group); } };
}
