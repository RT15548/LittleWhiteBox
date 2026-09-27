import { BufferGeometry, Color, Float32BufferAttribute, Group, InstancedMesh, Mesh, Object3D } from 'three';
import type { AtlasFeatureProjection } from '../../../../domains/map/space/projection.js';
import { geometryBounds, geometryPoints } from '../../../../domains/map/space/geometry.js';
import type { SpaceBounds } from '../../../../domains/map/space/types.js';
import { RenderResources } from '../render/resources.js';
import { atlasDetails, atlasSeed } from './details.js';
import { atlasMeshGeometry } from './gpu-geometry.js';
import type { createAtlasMaterials } from './gpu-materials.js';

type Materials = ReturnType<typeof createAtlasMaterials>;
export const ATLAS_DETAIL_BUDGET = 1024;
export const ATLAS_RELIEF_CELLS = 1600;

const detailKind = (source: AtlasFeatureProjection['source']) => source.form || (source.material === 'forest' ? 'forest' : source.material === 'vacuum' ? 'stars' : 'plain');
/** Structural keys deliberately exclude labels, destinations, actors and visit status. */
export function atlasShapeKey(feature: AtlasFeatureProjection): string {
    const { id, geometry, material, form, role } = feature.source;
    return JSON.stringify([id, geometry, material, form, role, feature.mapping]);
}
function sourceView(feature: AtlasFeatureProjection, view: SpaceBounds): SpaceBounds {
    const { scale, offset } = feature.mapping;
    return [(view[0] - offset[0]) / scale, (view[1] - offset[1]) / scale, view[2] / scale, view[3] / scale];
}
function positionedGroup(feature: AtlasFeatureProjection) {
    const group = new Group(), { scale, offset } = feature.mapping;
    group.position.set(offset[0], -offset[1], 0); group.scale.setScalar(scale);
    return group;
}
export function createAtlasBody(feature: AtlasFeatureProjection, materials: Materials) {
    const resources = new RenderResources(), group = positionedGroup(feature), source = feature.source;
    const footprint = resources.own(atlasMeshGeometry(source.geometry));
    const relief = source.role === 'relief';
    if (!['asteroids', 'nebula', 'celestial'].includes(source.form || '') && !(relief && ['ridge', 'dunes'].includes(source.form || ''))) {
        group.add(new Mesh(footprint, materials.material(source.material, 'base', relief)));
    }
    if (source.form === 'celestial') {
        const [x, y, w, h] = geometryBounds(source.geometry);
        const sphere = new Mesh(materials.shapes.sphere, materials.material(source.material, 'celestial'));
        sphere.position.set(x + w / 2, -y - h / 2, 0); sphere.scale.set(w / 2, h / 2, Math.min(w, h) / 2);
        group.add(sphere);
    }
    return { group, footprint, dispose() { group.removeFromParent(); resources.dispose(); } };
}
export function atlasDetailPlan(feature: AtlasFeatureProjection, viewport: SpaceBounds, unitScale: number, budget: number, cells: number) {
    const source = feature.source, bounds = geometryBounds(source.geometry), view = sourceView(feature, viewport);
    const kind = detailKind(source);
    const span = Math.max(1, Math.min(bounds[2], bounds[3]));
    const spacing = Math.max(.25, Math.min(48, span / (kind === 'forest' ? 16 : 10)));
    const samples = ['forest', 'scattered', 'compact', 'blocks', 'towers', 'asteroids', 'stars', 'nebula'].includes(kind)
        ? atlasDetails(source, view, unitScale / feature.mapping.scale, Math.max(1, budget), spacing) : [];
    let grid: SpaceBounds | undefined, step = 0;
    if (['ridge', 'dunes'].includes(kind)) {
        const x = Math.max(bounds[0], view[0]), y = Math.max(bounds[1], view[1]);
        const w = Math.max(0, Math.min(bounds[0] + bounds[2], view[0] + view[2]) - x);
        const h = Math.max(0, Math.min(bounds[1] + bounds[3], view[1] + view[3]) - y);
        step = 2 ** Math.ceil(Math.log2(Math.max(span / 48, unitScale / feature.mapping.scale * 5, Math.sqrt(w * h / Math.max(1, cells)))));
        const range = (): SpaceBounds => [Math.floor(x / step), Math.floor(y / step), Math.ceil((x + w) / step), Math.ceil((y + h) / step)];
        grid = range();
        // A source-aligned grid spanning both axes needs at least four cells.
        while ((grid[2] - grid[0]) * (grid[3] - grid[1]) > Math.max(4, cells)) { step *= 2; grid = range(); }
    }
    return { kind, samples, grid, step, bounds, key: JSON.stringify([kind, samples, grid, step]) };
}
type DetailPlan = ReturnType<typeof atlasDetailPlan>;

function heightAt(x: number, y: number, seed: number, span: number, dunes: boolean) {
    const u = x / span, v = y / span, phase = seed % 997;
    const wave = Math.sin(u * (dunes ? 36 : 22) + Math.sin(v * 11 + phase) * 1.4 + phase);
    const ridge = (1 - Math.abs(wave)) ** (dunes ? 1.2 : 1.8);
    const secondary = (Math.sin(u * 43 - v * 31 + phase) + 1) / 2;
    return span * (dunes ? .08 : .22) * (ridge * .8 + secondary * .2);
}
function reliefGeometry(plan: DetailPlan, id: string) {
    const positions: number[] = [], indices: number[] = [], [x0, y0, x1, y1] = plan.grid!, step = plan.step;
    const span = Math.max(1, Math.min(plan.bounds[2], plan.bounds[3])), seed = atlasSeed(id);
    const columns = x1 - x0 + 1;
    for (let y = y0; y <= y1; y++) { for (let x = x0; x <= x1; x++) {
        const u = x * step, v = y * step;
        positions.push(u, -v, heightAt(u, v, seed, span, plan.kind === 'dunes') + .1);
        if (x < x1 && y < y1) {
            const a = (y - y0) * columns + x - x0;
            indices.push(a, a + columns, a + 1, a + 1, a + columns, a + columns + 1);
        }
    }
    }
    const geometry = new BufferGeometry(); geometry.setAttribute('position', new Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}

export function createAtlasDetails(feature: AtlasFeatureProjection, plan: DetailPlan, materials: Materials) {
    const resources = new RenderResources(), group = positionedGroup(feature), source = feature.source;
    if (plan.grid) { group.add(new Mesh(resources.own(reliefGeometry(plan, source.id)), materials.material(source.material, plan.kind === 'dunes' ? 'dunes' : 'relief', source.role === 'relief'))); }
    if (plan.samples.length) {
        const forest = plan.kind === 'forest', stars = plan.kind === 'stars', nebula = plan.kind === 'nebula';
        const buildings = ['blocks', 'compact', 'scattered', 'towers'].includes(plan.kind);
        const shape = nebula ? materials.shapes.mist : forest ? materials.shapes.tree : buildings ? (plan.kind === 'towers' ? materials.shapes.cube : materials.shapes.roof) : materials.shapes.rock;
        const material = materials.material(stars ? 'cold-light' : source.material, nebula ? 'mist' : stars ? 'star' : forest || buildings ? 'detail' : 'relief');
        const outline = nebula ? geometryPoints(source.geometry) : [];
        const instances = resources.own(new InstancedMesh(shape, material, plan.samples.length)), object = new Object3D(), color = new Color();
        instances.frustumCulled = false;
        plan.samples.forEach((sample, index) => {
            let size = sample.size;
            if (forest) { size *= 1.4; }
            if (stars) { size *= .035; }
            if (plan.kind === 'asteroids') { size *= .28; }
            if (nebula) {
                // Feather patches finish at the recorded contour instead of hitting
                // the stencil with an opaque edge (which looked like a second planet).
                let edge = Infinity;
                for (let i = 0; i < outline.length; i++) {
                    const a = outline[i], b = outline[(i + 1) % outline.length], dx = b[0] - a[0], dy = b[1] - a[1];
                    const t = Math.max(0, Math.min(1, ((sample.x - a[0]) * dx + (sample.y - a[1]) * dy) / (dx * dx + dy * dy || 1)));
                    edge = Math.min(edge, Math.hypot(sample.x - a[0] - dx * t, sample.y - a[1] - dy * t));
                }
                size = Math.min(size * 5, edge);
            }
            const height = size * (plan.kind === 'towers' ? 1.4 : .55);
            object.position.set(sample.x, -sample.y, height);
            object.rotation.set(0, 0, buildings ? 0 : sample.variant * .6);
            object.scale.set(size, size * (buildings ? .7 : 1), height);
            object.updateMatrix(); instances.setMatrixAt(index, object.matrix);
            color.setHSL(forest ? .34 + sample.variant * .02 : .08, forest ? .15 : .04, .65 + sample.variant * .12);
            instances.setColorAt(index, color);
        });
        instances.instanceMatrix.needsUpdate = true; group.add(instances);
    }
    return { group, dispose() { group.removeFromParent(); resources.dispose(); } };
}
