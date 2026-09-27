import { Box3, DirectionalLight, HemisphereLight, MathUtils, NeutralToneMapping, OrthographicCamera, PCFSoftShadowMap, Scene, Spherical, SRGBColorSpace, TOUCH, Vector2, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { MapScene } from '../../../../domains/map/types.js';
import { createSceneModel } from './scene3d-model.js';
import { createSceneLabels } from './scene3d-labels.js';
import { createSceneAssetSession, decodeSceneAsset } from './scene3d-assets.js';
import { SCENE_ASSET_URLS } from './scene3d-asset-catalog.js';
import { sceneAssetKind } from './scene3d-asset-fit.js';

export function createThreeRuntime(host: HTMLElement, labelHost: HTMLElement, options: { fallback: (reason: string) => void }) {
    let renderer: WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let model: ReturnType<typeof createSceneModel> | undefined;
    let assets: ReturnType<typeof createSceneAssetSession> | undefined;
    let labels: ReturnType<typeof createSceneLabels> | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let visibilityObserver: IntersectionObserver | undefined;
    let themeObserver: MutationObserver | undefined;
    let disposed = false, failed = false, visible = true, raf = 0;
    let width = 0, height = 0, showLabels = true, lowWalls = false, symbolsReady = false;
    let data: MapScene | undefined;
    let fitWidth = 14, fitHeight = 14;
    const abort = new AbortController();
    const scene = new Scene();
    const camera = new OrthographicCamera(-10, 10, 10, -10, .01, 1000);
    const drawingSize = new Vector2();
    const ambient = new HemisphereLight('#f5f8ff', '#9c8c7a', 1.65);
    const key = new DirectionalLight('#fff3df', 3.1);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.normalBias = .012;
    key.shadow.bias = -.00015;
    key.shadow.radius = 2;
    const fill = new DirectionalLight('#daeaff', .65);
    scene.add(ambient, key, key.target, fill);
    const isDark = () => !!host.closest('.theme-dark');
    let dark = isDark();
    function cancelFrame() {if (raf) {cancelAnimationFrame(raf); raf = 0;}}
    function dispose() {
        if (disposed) {return;}
        disposed = true; cancelFrame(); abort.abort();
        resizeObserver?.disconnect(); visibilityObserver?.disconnect(); themeObserver?.disconnect();
        controls?.dispose(); labels?.dispose(); model?.dispose(); assets?.dispose(); key.shadow.dispose();
        renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
        scene.clear();
    }
    function fail(reason: string) {
        if (disposed || failed) {return;}
        failed = true; cancelFrame(); options.fallback(reason);
    }
    function invalidate() {
        if (disposed || failed || raf || document.hidden || !visible || width <= 0 || height <= 0) {return;}
        raf = requestAnimationFrame(() => {
            raf = 0;
            try {
                // Resizing clears WebGL's drawing buffer. Resize and draw in the same
                // frame so layout changes never flash blank.
                renderer!.getSize(drawingSize);
                if (drawingSize.x !== width || drawingSize.y !== height) {renderer!.setSize(width, height, false);}
                renderer!.render(scene, camera);
                labels?.update(camera, width, height, showLabels);
            } catch {fail('三维画面暂不可用，已切换二维。');}
        });
    }
    function sceneBounds() {
        const [x, y, w, h] = data!.viewBox;
        const { frame } = model!;
        return new Box3(frame.point(x, y), frame.point(x + w, y + h)).union(model!.bounds);
    }
    function lightScene() {
        const bounds = sceneBounds();
        const center = bounds.getCenter(new Vector3());
        const span = Math.max(1, bounds.getSize(new Vector3()).length());
        key.position.copy(center).add(new Vector3(-span / 2, span, span / 2));
        key.target.position.copy(center);
        fill.position.copy(center).add(new Vector3(span, span / 2, -span));
        key.updateMatrixWorld(true); key.target.updateMatrixWorld(true);
        key.shadow.updateMatrices(key);
        const shadowBounds = bounds.clone().applyMatrix4(key.shadow.camera.matrixWorldInverse);
        Object.assign(key.shadow.camera, {
            left: shadowBounds.min.x - .3, right: shadowBounds.max.x + .3,
            top: shadowBounds.max.y + .3, bottom: shadowBounds.min.y - .3,
            near: Math.max(.01, -shadowBounds.max.z - 1), far: -shadowBounds.min.z + 1,
        });
        key.shadow.camera.updateProjectionMatrix(); key.shadow.needsUpdate = true;
    }
    function fit() {
        if (!controls || !model) {return;}
        // Full-height bounds stay stable when low walls are toggled.
        const bounds = sceneBounds();
        const center = bounds.getCenter(new Vector3());
        const span = Math.max(1, bounds.getSize(new Vector3()).length());
        controls.target.copy(center);
        camera.position.copy(center).add(new Vector3(9, 13, 15).normalize().multiplyScalar(span * 2));
        camera.near = span / 1000; camera.far = span * 6;
        camera.lookAt(center); camera.updateMatrixWorld(true);
        let maxX = 0, maxY = 0;
        for (const x of [bounds.min.x, bounds.max.x]) {
            for (const y of [bounds.min.y, bounds.max.y]) {
                for (const z of [bounds.min.z, bounds.max.z]) {
                    const projected = new Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse);
                    maxX = Math.max(maxX, Math.abs(projected.x)); maxY = Math.max(maxY, Math.abs(projected.y));
                }
            }
        }
        fitWidth = maxX; fitHeight = maxY;
        const extent = Math.max(fitHeight, fitWidth / (width / height || 1)) * 1.09;
        camera.top = extent; camera.bottom = -extent;
        camera.left = -extent * (width / height || 1); camera.right = -camera.left;
        camera.zoom = 1; camera.updateProjectionMatrix(); controls.update();
        invalidate();
    }
    function resize() {
        if (disposed) {return;}
        const rect = host.getBoundingClientRect();
        width = rect.width; height = rect.height;
        if (width <= 0 || height <= 0) {cancelFrame(); return;}
        camera.top = Math.max(fitHeight, fitWidth / (width / height)) * 1.09; camera.bottom = -camera.top;
        camera.left = -camera.top * width / height; camera.right = -camera.left;
        camera.updateProjectionMatrix(); invalidate();
    }
    function setScene(next: MapScene) {
        if (disposed || failed) {return;}
        try {
            const reset = data?.key !== next.key;
            if (reset) {
                model?.dispose(); model = undefined; assets?.dispose();
                assets = createSceneAssetSession(async (kind, signal) => {
                    const response = await fetch(SCENE_ASSET_URLS[kind], { signal });
                    if (!response.ok) {throw new Error(`HTTP ${response.status}`);}
                    return decodeSceneAsset(await response.arrayBuffer());
                }, () => {if (data) {setScene(data);}}, (kind, error) => console.warn(`[Map 3D] ${kind}: keeping procedural shape`, error));
            }
            // ViewBox updates change the available map, not the user's coordinate frame.
            // Keep this scene-local transform until switching scenes or unmounting.
            const candidate = createSceneModel(next, dark, assets, reset ? undefined : model?.frame);
            labels?.dispose(); model?.dispose();
            data = next; model = candidate; scene.add(model.group); model.updateWalls(lowWalls);
            labels = createSceneLabels(labelHost, next, model.anchors);
            labels.symbols(symbolsReady);
            lightScene();
            if (reset) {fit();}
            // Release obsolete prototypes only after removing their old instances.
            assets?.sync(next.elements.flatMap(element => {const kind = sceneAssetKind(element); return kind ? [kind] : [];}));
            invalidate();
        } catch {fail('这个场景暂时无法立体显示，已切换二维。');}
    }
    function zoom(factor: number) {
        camera.zoom = MathUtils.clamp(camera.zoom * factor, .4, 6);
        camera.updateProjectionMatrix(); invalidate();
    }
    try {
        renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
        renderer.setClearColor(0, 0);
        renderer.outputColorSpace = SRGBColorSpace;
        renderer.toneMapping = NeutralToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = PCFSoftShadowMap;
        renderer.debug.onShaderError = () => fail('图形驱动无法绘制三维，已切换二维。');
        const canvas = renderer.domElement;
        canvas.setAttribute('aria-label', '三维场景：左键拖动旋转，Shift + 左键拖动平移，滚轮缩放；单指平移，双指拖动旋转、捏合缩放；方向键旋转，Home 全图');
        canvas.title = '左键拖动旋转 · Shift + 左键拖动平移 · 滚轮缩放';
        canvas.setAttribute('role', 'group'); canvas.tabIndex = 0;
        host.prepend(canvas);
        controls = new OrbitControls(camera, canvas);
        // Right-drag must not move the map while browser mouse gestures may take over.
        controls.mouseButtons.RIGHT = null;
        controls.touches = { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_ROTATE };
        controls.enableDamping = false;
        controls.minPolarAngle = .08; controls.maxPolarAngle = Math.PI * .46;
        controls.minZoom = .4; controls.maxZoom = 6;
        controls.rotateSpeed = .65; controls.zoomSpeed = .8;
        controls.addEventListener('change', invalidate);
        canvas.addEventListener('webglcontextlost', event => {event.preventDefault(); fail('图形连接已中断，已切换二维。重新打开地图可重试。');}, { signal: abort.signal });
        canvas.addEventListener('keydown', event => {
            if (event.ctrlKey || event.metaKey || event.altKey) {return;}
            if (event.key === 'Home') {fit();}
            else if (event.key === '+' || event.key === '=') {zoom(1.2);}
            else if (event.key === '-') {zoom(1 / 1.2);}
            else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                const spherical = new Spherical().setFromVector3(camera.position.clone().sub(controls!.target));
                spherical.theta += event.key === 'ArrowLeft' ? -.13 : event.key === 'ArrowRight' ? .13 : 0;
                spherical.phi = MathUtils.clamp(spherical.phi + (event.key === 'ArrowUp' ? -.10 : event.key === 'ArrowDown' ? .10 : 0), controls!.minPolarAngle, controls!.maxPolarAngle);
                camera.position.copy(controls!.target).add(new Vector3().setFromSpherical(spherical));
                controls!.update(); invalidate();
            } else {return;}
            event.preventDefault();
        }, { signal: abort.signal });
        resizeObserver = new ResizeObserver(() => {try {resize();} catch {fail('三维画面尺寸调整失败，已切换二维。');}});
        resizeObserver.observe(host); resize();
        visibilityObserver = new IntersectionObserver(entries => {visible = entries[0].isIntersecting; if (visible) {invalidate();} else {cancelFrame();}});
        visibilityObserver.observe(host);
        document.addEventListener('visibilitychange', () => {if (document.hidden) {cancelFrame();} else {invalidate();}}, { signal: abort.signal });
        themeObserver = new MutationObserver(() => {const next = isDark(); if (next !== dark) {dark = next; if (data) {setScene(data);}}});
        for (let element: HTMLElement | null = host; element; element = element.parentElement) {themeObserver.observe(element, { attributes: true, attributeFilter: ['class'] });}
        return {
            dispose, setScene, fit, zoom,
            labels(show: boolean) {showLabels = show; invalidate();},
            walls(low: boolean) {lowWalls = low; model?.updateWalls(low); invalidate();},
            symbols(ready: boolean) {symbolsReady = ready; labels?.symbols(ready); invalidate();},
        };
    } catch (error) {dispose(); throw error;}
}
