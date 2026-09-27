import { AlwaysStencilFunc, type BufferGeometry, AmbientLight, DirectionalLight, DoubleSide, EqualStencilFunc, KeepStencilOp, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, ReplaceStencilOp, Scene, SRGBColorSpace, Vector2, WebGLRenderer, ZeroStencilOp } from 'three';
import type { AtlasFeatureProjection, AtlasProjection } from '../../../../domains/map/space/projection.js';
import type { SpaceBounds, SpaceGeometry } from '../../../../domains/map/space/types.js';
import { boundsOverlap } from '../../../../domains/map/space/geometry.js';
import { atlasClipPlan, atlasPaintOrder } from '../../../../domains/map/space/composition.js';
import { mapPixelRatio } from '../render/pixel-ratio.js';
import { demandFrame } from '../render/demand-frame.js';
import { RenderResources } from '../render/resources.js';
import { ATLAS_MATERIALS } from './materials.js';
import { atlasMeshGeometry } from './gpu-geometry.js';
import { createAtlasMaterials } from './gpu-materials.js';
import { ATLAS_DETAIL_BUDGET, ATLAS_RELIEF_CELLS, atlasDetailPlan, atlasShapeKey, createAtlasBody, createAtlasDetails } from './gpu-content.js';

interface Layer {
    key: string; body: ReturnType<typeof createAtlasBody>;
    detailKey?: string; details?: ReturnType<typeof createAtlasDetails>;
}
export interface AtlasRenderView { projection: AtlasProjection; viewport: SpaceBounds; size: readonly [number, number]; unitScale: number }

/** One mounted Atlas, one viewport-sized stencil attachment, no offscreen mask textures. */
export function createAtlasRuntime(host: HTMLElement, failed: (error: unknown) => void, painted: () => void) {
    const resources = new RenderResources(), materials = createAtlasMaterials();
    const layers = new Map<string, Layer>(), masks = new Map<string, BufferGeometry>();
    const scene = new Scene(), camera = new OrthographicCamera(-1, 1, 1, -1, .01, 20000000);
    const light = new DirectionalLight('#ffffff', 2); light.position.set(-1, 2, 4);
    scene.add(new AmbientLight('#ffffff', 1.3), light);
    const maskScene = new Scene(), maskMaterial = resources.own(new MeshBasicMaterial({ colorWrite: false, depthTest: false, depthWrite: false, side: DoubleSide, stencilWrite: true, stencilFail: KeepStencilOp, stencilZFail: KeepStencilOp }));
    const quad = resources.own(new PlaneGeometry(2, 2)), maskMesh = new Mesh<BufferGeometry, MeshBasicMaterial>(quad, maskMaterial);
    maskMesh.frustumCulled = false; maskScene.add(maskMesh);
    const fullCamera = new OrthographicCamera(-1, 1, 1, -1, .01, 10); fullCamera.position.z = 1;
    const drawingSize = new Vector2();
    let renderer: WebGLRenderer | undefined, view: AtlasRenderView | undefined;
    let disposed = false, visible = true;
    const frame = demandFrame(draw, () => !disposed && visible && !!view && view.size[0] > 0 && view.size[1] > 0);
    const abort = new AbortController();
    let observer: IntersectionObserver | undefined, theme: MutationObserver | undefined;
    const clearLayers = () => { for (const layer of layers.values()) { layer.body.dispose(); layer.details?.dispose(); } layers.clear(); };
    function dispose() {
        if (disposed) { return; }
        disposed = true; frame.cancel(); abort.abort(); observer?.disconnect(); theme?.disconnect();
        clearLayers(); for (const geometry of masks.values()) { geometry.dispose(); } masks.clear();
        resources.dispose(); materials.dispose(); scene.clear(); maskScene.clear();
        renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
    }
    function fail(error: unknown) { if (!disposed) { dispose(); failed(error); } }
    function geometry(shape: SpaceGeometry, used: Set<string>) {
        const key = JSON.stringify(shape); used.add(key);
        if (!masks.has(key)) { masks.set(key, atlasMeshGeometry(shape)); }
        return masks.get(key)!;
    }
    function drawMask(mesh: BufferGeometry, ref: number, compare: number, write: number, clear = false, fullscreen = false) {
        maskMesh.geometry = mesh;
        maskMaterial.stencilRef = ref; maskMaterial.stencilFuncMask = compare;
        maskMaterial.stencilWriteMask = write; maskMaterial.stencilFunc = compare ? EqualStencilFunc : AlwaysStencilFunc;
        maskMaterial.stencilZPass = clear ? ZeroStencilOp : ReplaceStencilOp;
        renderer!.render(maskScene, fullscreen ? fullCamera : camera);
    }
    function clip(feature: AtlasFeatureProjection, pool: AtlasFeatureProjection[], used: Set<string>) {
        const plan = atlasClipPlan(feature, pool);
        if (view!.projection.clip) { plan.intersections.push(view!.projection.clip); }
        // Clearing depth/stencil never clears the painted map. Two bits alternate for
        // arbitrary-depth intersections, independent of support-chain length.
        renderer!.state.buffers.stencil.setMask(0xff);
        renderer!.clear(false, true, true);
        let bit = 1;
        drawMask(geometry(plan.intersections[0], used), bit, 0, bit);
        for (const shape of plan.intersections.slice(1)) {
            const next = bit === 1 ? 2 : 1;
            drawMask(quad, 0, 0, next, true, true);
            drawMask(geometry(shape, used), bit | next, bit, next); bit = next;
        }
        for (const excluded of plan.exclusions) { drawMask(geometry(excluded.geometry, used), 0, 0, bit, true); }
        materials.stencil(bit);
    }
    function draw() {
        if (disposed || !view || !renderer) { return; }
        try {
            const { projection, viewport: [x, y, w, h], size, unitScale } = view;
            renderer.getSize(drawingSize);
            if (drawingSize.x !== size[0] || drawingSize.y !== size[1]) { renderer.setSize(size[0], size[1], false); }
            // Same meet transform as SVG, including the initial pre-resize frame.
            const vw = unitScale * size[0], vh = unitScale * size[1];
            camera.left = -vw / 2; camera.right = vw / 2; camera.top = vh / 2; camera.bottom = -vh / 2;
            const depth = Math.max(w, h, ...projection.features.map(f => Math.max(f.bounds[2], f.bounds[3]))) * 4 + 10;
            camera.near = depth * .01; camera.far = depth * 3;
            camera.position.set(x + w / 2, -y - h / 2, depth); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
            const media = projection.features.filter(f => f.source.role === 'environment');
            const uniform = media.length && media.every(f => f.source.material === media[0].source.material);
            const paper = getComputedStyle(host).getPropertyValue('--atlas-paper').trim();
            renderer.setClearColor(uniform ? ATLAS_MATERIALS[media[0].source.material].base : paper);
            renderer.state.buffers.stencil.setMask(0xff); renderer.clear();
            const visibleLayers = atlasPaintOrder(projection.features.filter(f => boundsOverlap(f.bounds, view!.viewport)));
            const ids = new Set(visibleLayers.map(f => f.source.id)), used = new Set<string>();
            for (const [id, layer] of layers) { if (!ids.has(id)) { layer.body.dispose(); layer.details?.dispose(); layers.delete(id); } }
            const pool = [...projection.features, ...projection.carriers];
            const detailBudget = Math.max(1, Math.floor(ATLAS_DETAIL_BUDGET / Math.max(1, visibleLayers.length)));
            const reliefBudget = Math.max(1, Math.floor(ATLAS_RELIEF_CELLS / Math.max(1, visibleLayers.filter(f => ['ridge', 'dunes'].includes(f.source.form || '')).length)));
            for (const feature of visibleLayers) {
                const key = atlasShapeKey(feature); let layer = layers.get(feature.source.id);
                if (layer?.key !== key) {
                    layer?.body.dispose(); layer?.details?.dispose();
                    layer = { key, body: createAtlasBody(feature, materials) }; layers.set(feature.source.id, layer);
                }
                const plan = atlasDetailPlan(feature, view.viewport, unitScale, detailBudget, reliefBudget);
                if (layer.detailKey !== plan.key) {
                    layer.details?.dispose(); layer.details = createAtlasDetails(feature, plan, materials); layer.detailKey = plan.key;
                }
                clip(feature, pool, used);
                scene.add(layer.body.group, layer.details!.group);
                renderer.render(scene, camera); scene.remove(layer.body.group, layer.details!.group);
            }
            for (const [key, buffer] of masks) { if (!used.has(key)) { buffer.dispose(); masks.delete(key); } }
            painted();
        } catch (error) { fail(error); }
    }
    function invalidate() {
        frame.request();
    }
    try {
        renderer = new WebGLRenderer({ antialias: true, alpha: false, stencil: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(mapPixelRatio()); renderer.outputColorSpace = SRGBColorSpace; renderer.autoClear = false;
        renderer.debug.onShaderError = () => fail(new Error('atlas_shader_failed'));
        renderer.domElement.setAttribute('aria-hidden', 'true'); host.prepend(renderer.domElement);
        renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); fail(new Error('atlas_context_lost')); }, { signal: abort.signal });
        observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) { invalidate(); } else { frame.cancel(); } }); observer.observe(host);
        document.addEventListener('visibilitychange', () => { if (document.hidden) { frame.cancel(); } else { invalidate(); } }, { signal: abort.signal });
        theme = new MutationObserver(invalidate);
        for (let element: HTMLElement | null = host; element; element = element.parentElement) { theme.observe(element, { attributes: true, attributeFilter: ['class'] }); }
        return { dispose, update(next: AtlasRenderView) { view = next; invalidate(); } };
    } catch (error) { dispose(); throw error; }
}
