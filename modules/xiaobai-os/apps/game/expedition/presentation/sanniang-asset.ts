import { AnimationMixer, type BufferGeometry, Group, type Material, Matrix4, Mesh, SkinnedMesh, type Skeleton, Texture, Vector3 } from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import modelUrl from '../assets/characters/sanniang.glb?url&no-inline';

/** One renderer owns the source; visits own only a cloned skeleton and mixer. */
function release(gltf: GLTF) {
    const geometry = new Set<BufferGeometry>(), materials = new Set<Material>(), textures = new Set<Texture>(), skeletons = new Set<Skeleton>();
    gltf.scene.traverse(object => {
        if (!(object instanceof Mesh)) { return; }
        geometry.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            materials.add(material);
            for (const value of Object.values(material)) { if (value instanceof Texture) { textures.add(value); } }
        }
        if (object instanceof SkinnedMesh) { skeletons.add(object.skeleton); }
    });
    geometry.forEach(value => value.dispose()); materials.forEach(value => value.dispose());
    skeletons.forEach(value => value.dispose());
    textures.forEach(value => { value.dispose(); value.source.data?.close?.(); });
}

export async function loadSanniangAsset(signal: AbortSignal) {
    const response = await fetch(modelUrl, { signal });
    if (!response.ok) { throw new Error(`expedition_character_load:${response.status}`); }
    const bytes = await response.arrayBuffer(); signal.throwIfAborted();
    const gltf = await new GLTFLoader().parseAsync(bytes, new URL('.', new URL(modelUrl, location.href)).href);
    const idle = gltf.animations.find(clip => clip.name === 'idle'), walk = gltf.animations.find(clip => clip.name === 'walk');
    const stride: unknown = gltf.scene.getObjectByName('Sanniang')?.userData.stride;
    try {
        signal.throwIfAborted();
        if (!idle || !walk || typeof stride !== 'number' || stride <= 0) { throw new Error('expedition_character_motion_missing'); }
    } catch (error) { release(gltf); throw error; }
    // Models are authored in metres; this is the established expedition actor scale.
    const scale = 1.48, stepLength = stride as number * scale;
    return {
        create() {
            const root = new Group(), body = clone(gltf.scene);
            root.add(body); body.scale.setScalar(scale);
            const feet: { mesh: Mesh; indices: number[] }[] = [], point = new Vector3(), inverse = new Matrix4(), skeletons = new Set<Skeleton>();
            root.updateMatrixWorld(true);
            body.traverse(object => {
                if (!(object instanceof Mesh)) { return; }
                object.castShadow = object.receiveShadow = true; object.frustumCulled = false;
                const indices: number[] = [];
                for (let i = 0; i < object.geometry.getAttribute('position').count; i++) {
                    object.getVertexPosition(i, point).applyMatrix4(object.matrixWorld);
                    if (point.y < .09 * scale) { indices.push(i); }
                }
                if (indices.length) { feet.push({ mesh: object, indices }); }
                if (object instanceof SkinnedMesh) { skeletons.add(object.skeleton); }
            });
            const mixer = new AnimationMixer(body), resting = mixer.clipAction(idle!), walking = mixer.clipAction(walk!);
            resting.play(); walking.play(); walking.enabled = false;
            let moving = false, previous = -1, previousDistance = 0, stridePhase = 0;
            return { root,
                pose(time: number, distance: number, walkingNow: boolean, reduced: boolean) {
                    const elapsed = previous < 0 ? 0 : Math.min(.12, Math.max(0, (time - previous) / 1000)); previous = time;
                    const travelled = Math.max(0, distance - previousDistance); previousDistance = distance;
                    if (walkingNow !== moving) {
                        moving = walkingNow;
                        const next = moving ? walking : resting, last = moving ? resting : walking;
                        next.reset().play(); last.crossFadeTo(next, .18, false);
                    }
                    // Follow catch-up is faster than an anatomical walk. Bound cadence rather than
                    // turning a burst of world ticks into vibrating legs; never replay offscreen travel.
                    if (walkingNow) { stridePhase = (stridePhase + Math.min(travelled / stepLength, elapsed * 1.8)) % 1; }
                    walking.timeScale = 0;
                    if (moving) { walking.time = reduced ? 0 : stridePhase * walk!.duration; }
                    if (reduced) {
                        const active = moving ? walking : resting, inactive = moving ? resting : walking;
                        inactive.stop(); active.stopFading().setEffectiveWeight(1); active.time = 0;
                    }
                    mixer.update(reduced ? 0 : elapsed);
                    body.position.y = 0; root.updateMatrixWorld(true); inverse.copy(root.matrixWorld).invert();
                    let floor = Infinity;
                    for (const { mesh, indices } of feet) {
                        for (const i of indices) { mesh.getVertexPosition(i, point).applyMatrix4(mesh.matrixWorld).applyMatrix4(inverse); floor = Math.min(floor, point.y); }
                    }
                    body.position.y = -floor;
                },
                dispose() {
                    mixer.stopAllAction(); mixer.uncacheRoot(body);
                    skeletons.forEach(skeleton => skeleton.dispose());
                    root.removeFromParent();
                },
            };
        },
        dispose() { release(gltf); },
    };
}
export type SanniangAsset = Awaited<ReturnType<typeof loadSanniangAsset>>;
