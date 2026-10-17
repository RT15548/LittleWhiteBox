import { BufferGeometry, LoadingManager, Material, Mesh, Object3D, Skeleton, SkinnedMesh, Texture } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// A load owns its requests and temporary URLs, not a new cross-character cache.
// Keep three's texture decoding/samplers/color spaces and the GLB's authored data intact.
export async function loadCharacterGltf(url: string, signal: AbortSignal) {
    signal.throwIfAborted();
    const controller = new AbortController(), base = new URL('.', url).href;
    const abort = () => controller.abort(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    const objectURLs = new Set<string>(), images = new Map<string, string>();
    const pending: Promise<unknown>[] = [];
    let restoreParser = () => {};
    const geometries = new Set<BufferGeometry>(), materials = new Set<Material>();
    const textures = new Set<Texture>(), skeletons = new Set<Skeleton>();
    function collect(value: unknown) {
        if (value instanceof BufferGeometry) { geometries.add(value); }
        if (value instanceof Texture) { textures.add(value); }
        if (value instanceof Skeleton) { skeletons.add(value); }
        if (value instanceof Material) {
            materials.add(value);
            for (const property of Object.values(value)) { if (property instanceof Texture) { textures.add(property); } }
        }
        if (value instanceof Object3D) {
            value.traverse(object => {
                if (object instanceof Mesh) {
                    collect(object.geometry);
                    for (const material of Array.isArray(object.material) ? object.material : [object.material]) { collect(material); }
                }
                if (object instanceof SkinnedMesh) { skeletons.add(object.skeleton); }
            });
        }
        if (Array.isArray(value)) { value.forEach(collect); }
    }
    function track<T>(promise: Promise<T>): Promise<T> {
        const tracked = promise.then(value => { collect(value); return value; });
        pending.push(tracked);
        // Some parser branches reject before their siblings have been awaited.
        void tracked.catch(() => {});
        return tracked;
    }
    async function settle() {
        let count = 0;
        while (count < pending.length) {
            const batch = pending.slice(count); count = pending.length;
            await Promise.allSettled(batch);
        }
    }
    const manager = new LoadingManager();
    manager.setURLModifier(resource => {
        if (resource.startsWith('blob:')) { objectURLs.add(resource); return resource; }
        return images.get(new URL(resource, base).href) ?? resource;
    });
    const loader = new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);
    loader.register(parser => {
        const dependency = parser.getDependency.bind(parser), loadGeometries = parser.loadGeometries.bind(parser);
        restoreParser = () => { parser.getDependency = dependency; parser.loadGeometries = loadGeometries; };
        parser.getDependency = (type, index) => track(dependency(type, index).then(value => {
            // GLTFLoader otherwise silently turns failed images into untextured materials.
            if (type === 'texture' && !value) { throw new Error(`island_character_texture:${index}`); }
            return value;
        }));
        parser.loadGeometries = primitives => track(loadGeometries(primitives));
        return {
            name: 'ISLAND_character_requests',
            async beforeRoot() {
                const uris = new Set<string>();
                for (const image of parser.json.images ?? []) {
                    if (typeof image.uri === 'string' && !/^(data:|blob:)/i.test(image.uri)) { uris.add(new URL(image.uri, base).href); }
                }
                await Promise.all([...uris].map(uri => track((async () => {
                    const response = await fetch(uri, { signal: controller.signal });
                    if (!response.ok) { throw new Error(`island_character_image:${response.status}:${uri}`); }
                    const blob = await response.blob(); controller.signal.throwIfAborted();
                    const local = URL.createObjectURL(blob); objectURLs.add(local); images.set(uri, local);
                })())));
                controller.signal.throwIfAborted();
            },
        };
    });
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) { throw new Error(`island_character_load:${response.status}`); }
        const bytes = await response.arrayBuffer(); controller.signal.throwIfAborted();
        const gltf = await loader.parseAsync(bytes, base);
        controller.signal.throwIfAborted();
        return gltf;
    } catch (error) {
        controller.abort();
        // Decode itself is not abortable. Drain it before closing images/revoking URLs.
        await settle();
        skeletons.forEach(skeleton => skeleton.dispose()); geometries.forEach(geometry => geometry.dispose());
        materials.forEach(material => material.dispose());
        const bitmaps = new Set<ImageBitmap>();
        textures.forEach(texture => { texture.dispose(); if (texture.source.data?.close) { bitmaps.add(texture.source.data); } });
        bitmaps.forEach(bitmap => bitmap.close());
        throw signal.aborted ? signal.reason : error;
    } finally {
        signal.removeEventListener('abort', abort);
        objectURLs.forEach(local => URL.revokeObjectURL(local));
        restoreParser(); pending.length = 0; images.clear(); objectURLs.clear();
        geometries.clear(); materials.clear(); textures.clear(); skeletons.clear();
    }
}
