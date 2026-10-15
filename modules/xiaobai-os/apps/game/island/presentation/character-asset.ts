import * as T from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import type { Activity, Item, WorkTask } from '../model.js';
import { GARMENTS, type GarmentShape, type GarmentSpec } from '../clothing.js';
import type { SurvivorVisual, WornGarment } from './survivor-visual.js';
import { wetFabric } from './garment-material.js';

export const CHARACTER_CLIPS = ['idle', 'walk', 'rest', 'work', 'construct', 'drink', 'wash', 'offer', 'drag', 'dead'] as const;
type Clip = typeof CHARACTER_CLIPS[number];
const workClips: Record<WorkTask['kind'], Clip> = {
    gather: 'work', fill: 'work', pour: 'work', empty: 'work', drink: 'drink', sip: 'drink', eat: 'drink',
    craft: 'work', build: 'construct', relieve: 'work', wash: 'wash', cover_waste: 'work', cover_body: 'work',
    ignite: 'work', fuel: 'work', boil: 'work',
};
function clipFor(dead: boolean, moving: boolean, activity: Activity['kind'] | null, work: WorkTask['kind'] | null): Clip {
    if (dead) { return 'dead'; }
    if (moving) { return activity === 'drag' ? 'drag' : 'walk'; }
    if (activity === 'work') { return work ? workClips[work] : 'work'; }
    if (activity === 'rest' || activity === 'construct' || activity === 'offer') { return activity; }
    return activity === 'take' ? 'work' : 'idle';
}
function meshMaterials(mesh: T.Mesh): T.MeshStandardMaterial[] {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    if (materials.some(material => !(material instanceof T.MeshStandardMaterial))) { throw new Error('island_character_material'); }
    return materials as T.MeshStandardMaterial[];
}
function taggedGarments(root: T.Object3D) {
    const garments = new Map<GarmentShape, T.Object3D>();
    root.traverse(object => {
        const tag = object.userData.garment_id as GarmentShape | undefined;
        if (tag) {
            if (garments.has(tag)) { throw new Error('island_character_duplicate_garment'); }
            garments.set(tag, object);
        }
    });
    for (const shape of new Set(Object.values(GARMENTS).map(spec => spec.shape))) {
        if (!garments.has(shape)) { throw new Error(`island_character_missing_garment:${shape}`); }
    }
    return garments;
}
function bone(root: T.Object3D, name: string) {
    const object = root.getObjectByName(T.PropertyBinding.sanitizeNodeName(name));
    if (!(object instanceof T.Bone)) { throw new Error(`island_character_missing_bone:${name}`); }
    return object;
}
function supportPoints(body: T.Object3D) {
    const result: { mesh: T.Mesh; vertices: number[] }[] = [], point = new T.Vector3();
    body.updateMatrixWorld(true);
    body.traverse(object => {
        if (!(object instanceof T.Mesh)) { return; }
        let owner: T.Object3D | null = object;
        while (owner && !owner.userData.asset_role) { owner = owner.parent; }
        if (!owner || !['body.skin', 'clothing.shoes', 'clothing.wraps'].includes(owner.userData.asset_role)) { return; }
        const heights: number[] = [];
        for (let i = 0; i < object.geometry.getAttribute('position').count; i++) {
            object.getVertexPosition(i, point).applyMatrix4(object.matrixWorld); heights.push(point.y);
        }
        const floor = Math.min(...heights);
        result.push({ mesh: object, vertices: heights.flatMap((height, index) => height < floor + .035 ? [index] : []) });
    });
    if (!result.length) { throw new Error('island_character_missing_foot_contact'); }
    return result;
}
function visible(object: T.Object3D) {
    for (let parent: T.Object3D | null = object; parent; parent = parent.parent) { if (!parent.visible) { return false; } }
    return true;
}
type Fabric = { material: T.MeshStandardMaterial; dry: T.Color; roughness: number; tint: boolean };
function ownFabric(source: T.MeshStandardMaterial): Fabric {
    if (typeof source.userData.garment_tint !== 'boolean') { throw new Error('island_character_missing_fabric_role'); }
    return { material: source.clone(), dry: source.color.clone(), roughness: source.roughness, tint: source.userData.garment_tint };
}
function updateFabric(fabrics: readonly Fabric[], spec: GarmentSpec, wetness: number) {
    for (const fabric of fabrics) {
        if (fabric.tint) { wetFabric(fabric.material, spec, wetness); }
        else {
            fabric.material.color.copy(fabric.dry).multiplyScalar(1 - wetness * .28);
            fabric.material.roughness = Math.max(.05, fabric.roughness - wetness * .24);
        }
    }
}
function disposeModel(root: T.Object3D) {
    const geometries = new Set<T.BufferGeometry>(), materials = new Set<T.Material>(), textures = new Set<T.Texture>(), skeletons = new Set<T.Skeleton>();
    root.traverse(object => {
        if (!(object instanceof T.Mesh)) { return; }
        geometries.add(object.geometry);
        for (const material of meshMaterials(object)) {
            materials.add(material);
            for (const value of Object.values(material)) { if (value instanceof T.Texture) { textures.add(value); } }
        }
        if (object instanceof T.SkinnedMesh) { skeletons.add(object.skeleton); }
    });
    skeletons.forEach(skeleton => skeleton.dispose()); geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose()); textures.forEach(texture => { texture.dispose(); texture.source.data?.close?.(); });
}

// One immutable asset per island scene. Instances own materials/skeletons, not the shared geometry or textures.
export function createCharacterAsset(gltf: GLTF) {
    const template = gltf.scene, clips = new Map(gltf.animations.map(clip => [clip.name, clip]));
    const loose = new Map<GarmentShape, { geometry: T.BufferGeometry; materials: T.MeshStandardMaterial[] }[]>();
    let disposed = false;
    try {
        for (const clip of CHARACTER_CLIPS) { if (!clips.has(clip)) { throw new Error(`island_character_missing_animation:${clip}`); } }
        bone(template, 'head'); bone(template, 'wrist.R'); bone(template, 'finger3-1.R');
        const garments = taggedGarments(template), mixer = new T.AnimationMixer(template);
        mixer.clipAction(clips.get('idle')!).play(); mixer.update(0); template.updateMatrixWorld(true);
        // Bake the same garment meshes for physical objects off the body. Flatten depth, not silhouette/length.
        for (const [shape, group] of garments) {
            const parts: { geometry: T.BufferGeometry; materials: T.MeshStandardMaterial[] }[] = [];
            const bounds = new T.Box3(), point = new T.Vector3();
            group.traverse(object => {
                if (!(object instanceof T.Mesh)) { return; }
                const materials = meshMaterials(object);
                if (materials.some(material => typeof material.userData.garment_tint !== 'boolean')) { throw new Error('island_character_missing_fabric_role'); }
                const geometry = object.geometry.clone(), positions = geometry.getAttribute('position');
                for (let i = 0; i < positions.count; i++) {
                    object.getVertexPosition(i, point).applyMatrix4(object.matrixWorld);
                    positions.setXYZ(i, point.x, point.y, point.z); bounds.expandByPoint(point);
                }
                geometry.deleteAttribute('skinIndex'); geometry.deleteAttribute('skinWeight');
                parts.push({ geometry, materials });
            });
            if (!parts.length) { throw new Error('island_character_empty_garment'); }
            const center = bounds.getCenter(new T.Vector3());
            for (const { geometry } of parts) {
                geometry.translate(-center.x, -center.y, -center.z);
                if (shape === 'shoes' || shape === 'wraps') { geometry.translate(0, (bounds.max.y - bounds.min.y) / 2 + .01, 0); }
                else {
                    const depth = shape === 'lifejacket' ? .5 : .18;
                    geometry.scale(1, 1, depth); geometry.rotateX(-Math.PI / 2);
                    geometry.translate(0, (bounds.max.z - bounds.min.z) * depth / 2 + .01, 0);
                }
                geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere();
            }
            loose.set(shape, parts);
        }
        mixer.stopAllAction(); mixer.uncacheRoot(template);
    } catch (error) {
        loose.forEach(parts => parts.forEach(part => part.geometry.dispose())); disposeModel(template); throw error;
    }
    function ensureActive() { if (disposed) { throw new Error('island_character_disposed'); } }
    return {
        create(worn: readonly WornGarment[], dead: boolean): SurvivorVisual {
            ensureActive();
            const body = cloneSkeleton(template), root = new T.Group(), hand = new T.Group(), covering = new T.Group(), headAnchor = new T.Object3D();
            root.name = 'ye'; body.name = 'ye-body'; root.add(body, hand, covering, headAnchor); covering.position.y = .35;
            const garments = taggedGarments(body), fabrics = new Map<GarmentShape, Fabric[]>(), skeletons = new Set<T.Skeleton>();
            body.traverse(object => {
                if (object instanceof T.Mesh) { object.castShadow = object.receiveShadow = true; object.frustumCulled = false; }
                if (object instanceof T.SkinnedMesh) { skeletons.add(object.skeleton); }
            });
            for (const [shape, garment] of garments) {
                const owned: Fabric[] = [];
                garment.traverse(object => {
                    if (!(object instanceof T.Mesh)) { return; }
                    const copies = meshMaterials(object).map(ownFabric); owned.push(...copies);
                    object.material = Array.isArray(object.material) ? copies.map(fabric => fabric.material) : copies[0].material;
                });
                fabrics.set(shape, owned);
            }
            const head = bone(body, 'head'), wrist = bone(body, 'wrist.R'), fingers = bone(body, 'finger3-1.R'), supports = supportPoints(body);
            const point = new T.Vector3(), palm = new T.Vector3(), mixer = new T.AnimationMixer(body);
            const actions = new Map(CHARACTER_CLIPS.map(name => [name, mixer.clipAction(clips.get(name)!)]));
            let current: T.AnimationAction | null = null, previousPhase: number | null = null;
            const visual: SurvivorVisual = {
                root, hand, covering, headAnchor,
                wetness(items) {
                    for (const [shape, garment] of garments) {
                        const item = items.find(item => GARMENTS[item.kind]?.shape === shape);
                        garment.visible = !!item;
                        if (item) { updateFabric(fabrics.get(shape)!, GARMENTS[item.kind]!, item.wetness); }
                    }
                },
                pose(phase, moving, activity, work = null) {
                    const clip = clipFor(dead, moving, activity, work), next = actions.get(clip)!;
                    body.position.y = 0;
                    if (current !== next) {
                        const old = current; current = next; current.reset().play();
                        if (old) { old.crossFadeTo(current, .18, false); }
                    }
                    const elapsed = previousPhase === null ? 0 : Math.max(0, Math.min(.08, (phase - previousPhase) * .16));
                    // Reduced motion still applies the complete pose of a newly confirmed activity.
                    if (phase === 0) { for (const action of actions.values()) { if (action !== current) { action.stop(); } } current.stopFading().setEffectiveWeight(1); }
                    mixer.update(elapsed); previousPhase = phase; root.updateMatrixWorld(true);
                    if (clip === 'idle' || clip === 'walk') {
                        const inverse = new T.Matrix4().copy(root.matrixWorld).invert(); let floor = Infinity;
                        for (const contact of supports) {
                            if (!visible(contact.mesh)) { continue; }
                            for (const index of contact.vertices) {
                                contact.mesh.getVertexPosition(index, point).applyMatrix4(contact.mesh.matrixWorld).applyMatrix4(inverse);
                                floor = Math.min(floor, point.y);
                            }
                        }
                        if (!Number.isFinite(floor)) { throw new Error('island_character_invalid_foot_contact'); }
                        body.position.y = -floor; root.updateMatrixWorld(true);
                    }
                    wrist.getWorldPosition(palm); fingers.getWorldPosition(point); palm.lerp(point, .55);
                    hand.position.copy(root.worldToLocal(palm));
                    head.getWorldPosition(point); headAnchor.position.copy(root.worldToLocal(point)); headAnchor.position.y += .16;
                },
                dispose() {
                    mixer.stopAllAction(); mixer.uncacheRoot(body);
                    skeletons.forEach(skeleton => skeleton.dispose()); fabrics.forEach(parts => parts.forEach(fabric => fabric.material.dispose()));
                },
            };
            visual.wetness(worn); visual.pose(0, false, null); return visual;
        },
        garment(item: Pick<Item, 'kind' | 'wetness'>) {
            ensureActive(); const spec = GARMENTS[item.kind]; if (!spec) { throw new Error('island_not_garment'); }
            const root = new T.Group(); root.userData.garment = true;
            for (const part of loose.get(spec.shape)!) {
                const fabrics = part.materials.map(ownFabric); updateFabric(fabrics, spec, item.wetness);
                const materials = fabrics.map(fabric => fabric.material);
                const mesh = new T.Mesh(part.geometry.clone(), materials.length === 1 ? materials[0] : materials);
                mesh.castShadow = mesh.receiveShadow = true; root.add(mesh);
            }
            return root;
        },
        dispose() {
            if (disposed) { return; } disposed = true;
            loose.forEach(parts => parts.forEach(part => part.geometry.dispose())); loose.clear(); disposeModel(template);
        },
    };
}
export type CharacterAsset = ReturnType<typeof createCharacterAsset>;
