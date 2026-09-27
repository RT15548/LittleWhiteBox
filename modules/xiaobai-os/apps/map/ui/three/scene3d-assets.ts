import { Box3, Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Scene3DResources } from './scene3d-resources.js';

export type SceneAssetKind = 'table' | 'chair' | 'bed' | 'shelf' | 'tree' | 'rock' | 'stool' | 'bench' | 'sofa'
    | 'cabinet' | 'chest' | 'barrel' | 'stove' | 'refrigerator' | 'sink' | 'toilet' | 'bathtub'
    | 'car' | 'statue' | 'tent' | 'potted-plant' | 'light';
export type SceneAsset = Awaited<ReturnType<typeof decodeSceneAsset>>;
export type SceneAssetLoader = (kind: SceneAssetKind, signal: AbortSignal) => Promise<SceneAsset>;

/** Prepared GLBs are baked static meshes: no images, animations, transforms or external URIs. */
export async function decodeSceneAsset(buffer: ArrayBuffer) {
    const { scene } = await new GLTFLoader().parseAsync(buffer, '');
    const resources = new Scene3DResources();
    const parts: { geometry: Mesh['geometry']; role: string }[] = [];
    const size = new Box3().setFromObject(scene).getSize(new Vector3());
    let radius = 0;
    scene.traverse(node => {
        if (!(node instanceof Mesh)) {return;}
        resources.own(node.geometry);
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach(material => resources.own(material));
        parts.push({ geometry: node.geometry, role: materials[0].name });
        const positions = node.geometry.getAttribute('position');
        for (let i = 0; i < positions.count; i++) {radius = Math.max(radius, Math.hypot(positions.getX(i), positions.getZ(i)));}
    });
    return { parts, size, radius, dispose: () => {resources.dispose(); scene.clear();} };
}

/** One displayed scene owns requests and immutable prototypes, never a cross-chat cache. */
export function createSceneAssetSession(load: SceneAssetLoader, changed: () => void, report: (kind: SceneAssetKind, error: unknown) => void) {
    const records = new Map<SceneAssetKind, { abort: AbortController; asset?: SceneAsset }>();
    let disposed = false;
    function remove(kind: SceneAssetKind) {
        const record = records.get(kind);
        records.delete(kind); record?.abort.abort(); record?.asset?.dispose();
    }
    return {
        get: (kind: SceneAssetKind) => records.get(kind)?.asset,
        sync(kinds: Iterable<SceneAssetKind>) {
            if (disposed) {return;}
            const needed = new Set(kinds);
            for (const kind of records.keys()) {if (!needed.has(kind)) {remove(kind);}}
            for (const kind of needed) {
                if (records.has(kind)) {continue;}
                const record = { abort: new AbortController(), asset: undefined as SceneAsset | undefined };
                records.set(kind, record);
                void load(kind, record.abort.signal).then(asset => {
                    // Parsing cannot be interrupted; dispose a late result instead of reviving it.
                    if (records.get(kind) !== record) {asset.dispose(); return;}
                    record.asset = asset; changed();
                }).catch(error => {
                    if (records.get(kind) === record) {report(kind, error);}
                    // Retain the failed record until removal: no automatic retry loop.
                });
            }
        },
        dispose() {disposed = true; for (const kind of records.keys()) {remove(kind);}},
    };
}
