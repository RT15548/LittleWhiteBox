import { InstancedMesh, Matrix4, Vector3, type Group } from 'three';
import type { MapElement, MapMaterial } from '../../../../domains/map/types.js';
import type { SceneAsset, SceneAssetKind } from './scene3d-assets.js';
import type { Scene3DResources } from './scene3d-resources.js';
import type { createSceneMaterials } from './scene3d-materials.js';
import { isSceneMarker, sceneElementBounds } from '../scene-geometry.js';
import assetManifest from './assets/kenney/manifest.json';

const ASSET_MEASUREMENTS = new Map(assetManifest.map(entry => [entry.icon, {
    size: new Vector3().fromArray(entry.size), radius: entry.radius,
}]));

const ASSET_RATIOS: Record<SceneAssetKind, readonly [number, number]> = {
    table: [1.2, 3], chair: [.75, 1.35], bed: [.4, .85], shelf: [1, 8], tree: [.6, 1.7], rock: [.6, 1.7],
    stool: [.8, 1.4], bench: [1.5, 3.2], sofa: [1.6, 3.4], cabinet: [.7, 1.4], chest: [.7, 1.4], barrel: [.8, 1.25],
    stove: [.75, 1.3], refrigerator: [1, 1.85], sink: [.75, 1.3], toilet: [.45, .9], bathtub: [.32, .65],
    car: [.4, .8], statue: [1, 2], tent: [.75, 1.35], 'potted-plant': [.65, 1.3], light: [.65, 1.3],
};
const ROUND_ASSETS = new Set<SceneAssetKind>(['tree', 'rock', 'stool', 'barrel', 'potted-plant', 'light']);
const DEFAULT_SURFACES: Partial<Record<SceneAssetKind, MapMaterial>> = {
    tree: 'forest', rock: 'stone', sofa: 'fabric', cabinet: 'wood', chest: 'wood', barrel: 'wood',
    stove: 'metal', refrigerator: 'metal', sink: 'tile', toilet: 'tile', bathtub: 'tile', car: 'metal',
    statue: 'stone', tent: 'fabric', 'potted-plant': 'tile', light: 'metal',
};

/** Limits are render choices, not new map semantics. Unsupported proportions stay schematic. */
export function sceneAssetKind(element: MapElement): SceneAssetKind | undefined {
    if (isSceneMarker(element) || ['wall', 'grid'].includes(element.category) || !element.icon || !Object.hasOwn(ASSET_RATIOS, element.icon)) {return undefined;}
    const kind = element.icon as SceneAssetKind;
    if (element.shape === 'circle') {return ROUND_ASSETS.has(kind) ? kind : undefined;}
    if (element.shape !== 'rect') {return undefined;}
    const { width, height } = sceneElementBounds(element), ratio = width / height;
    const [min, max] = ASSET_RATIOS[kind];
    return ratio >= min && ratio <= max ? kind : undefined;
}

function assetFit(element: MapElement, kind: SceneAssetKind, { size, radius }: Pick<SceneAsset, 'size' | 'radius'>, width: number, depth: number) {
    // Repeated empty structural bays represent one shelf, not invented contents.
    const count = kind === 'shelf' ? Math.max(1, Math.ceil(width / depth / (size.x / size.z))) : 1;
    const scale = Math.min((kind === 'tree' ? 3 : 2.5) / size.y,
        element.shape === 'circle' ? width / (2 * radius) : Math.min(width / count / size.x, depth / size.z));
    return { count, scale, height: size.y * scale };
}

/** Offline measurements reserve the eventual height without waiting for a GLB request. */
export function sceneAssetHeight(element: MapElement, kind: SceneAssetKind, width: number, depth: number): number {
    return assetFit(element, kind, ASSET_MEASUREMENTS.get(kind)!, width, depth).height;
}

export function fitSceneAsset(parent: Group, element: MapElement, kind: SceneAssetKind, asset: SceneAsset,
    width: number, depth: number, resources: Scene3DResources, materials: ReturnType<typeof createSceneMaterials>) {
    const { size } = asset;
    const { count, scale, height } = assetFit(element, kind, asset, width, depth);
    const main = element.material ? element : {
        ...element, material: DEFAULT_SURFACES[kind] || 'unknown',
    };
    for (const part of asset.parts) {
        const geometry = resources.own(part.geometry.clone());
        geometry.scale(scale, scale, scale);
        // Expand only the middle span of a rectangular tabletop; end legs keep their thickness.
        if (kind === 'table') {
            const positions = geometry.getAttribute('position'), half = size.x * scale / 2;
            const extra = width / 2 - half;
            for (let i = 0; i < positions.count; i++) {
                if (positions.getY(i) < size.y * scale * .55) {continue;}
                const x = positions.getX(i);
                positions.setX(i, x + Math.max(-1, Math.min(1, x / (half * .5))) * extra);
            }
            geometry.computeVertexNormals();
        }
        geometry.computeBoundingBox(); geometry.computeBoundingSphere();
        let surface = main;
        if (part.role === 'soft' || part.role === 'shade') {surface = { ...element, material: 'bed-sheet' };}
        else if (part.role === 'foliage') {surface = { ...element, material: 'forest' };}
        else if (part.role === 'window') {surface = { ...element, material: 'glass' };}
        else if (part.role === 'wood') {surface = { ...element, material: 'wood' };}
        else if (part.role === 'bark' && (!element.material || ['grass', 'forest'].includes(element.material))) {surface = { ...element, material: 'wood' };}
        const tint = part.role === 'detail' ? kind === 'car' ? -.78 : -.25 : part.role === 'bark' ? -.22 : part.role === 'window' ? -.3 : part.role === 'soft' ? .12 : 0;
        const material = materials.mesh(surface, tint);
        const mesh = resources.own(new InstancedMesh(geometry, material, count));
        for (let i = 0; i < count; i++) {mesh.setMatrixAt(i, new Matrix4().makeTranslation((i - (count - 1) / 2) * size.x * scale, 0, 0));}
        mesh.castShadow = material.opacity >= .8; mesh.receiveShadow = true;
        parent.add(mesh);
    }
    return height;
}
