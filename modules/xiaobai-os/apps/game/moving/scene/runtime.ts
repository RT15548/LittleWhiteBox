import { Color, DirectionalLight, HemisphereLight, NeutralToneMapping, PCFSoftShadowMap, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer, type Object3D } from 'three';
import { canPick, packedCount } from '../rules.js';
import type { MovingAction, MovingLevel, MovingState } from '../types.js';
import { MOVING_COPY } from '../copy.js';
import { createRoomModel } from './room-model.js';
import { createMovingCamera, fitMovingCamera, INITIAL_YAW } from './camera.js';

interface SceneOptions {
    action: (action: MovingAction) => void;
    error: (kind: 'graphicsFailed' | 'contextLost', cause?: unknown) => void;
}

export function createMovingScene(host: HTMLElement, level: MovingLevel, initial: MovingState, options: SceneOptions) {
    const scene = new Scene();
    const camera = createMovingCamera();
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const drawingSize = new Vector2();
    const model = createRoomModel(level);
    const mascotHome = model.mascot.position.clone();
    const abort = new AbortController();
    let renderer: WebGLRenderer | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let disposed = false, failed = false, active = true, onscreen = true, raf = 0;
    let width = 0, height = 0, yaw = INITIAL_YAW;
    const itemScale = .86;
    let state = initial;
    let focused: string | null = null;
    let gesture: { id: number; x: number; y: number; yaw: number; dragged: boolean } | null = null;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    type Transition = { started: number; duration: number; action?: MovingAction; packed: boolean; done: () => void };
    let transition: Transition | undefined;
    const key = new DirectionalLight('#fff4df', 3.1);
    key.position.set(-3, 10, 7); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: .5, far: 30 });
    key.shadow.normalBias = .025; key.shadow.bias = -.00015;
    scene.add(new HemisphereLight('#f3f8ff', '#b6b2b0', 2.1), key, model.root);
    const fill = new DirectionalLight('#dbeaff', .7); fill.position.set(6, 5, -3); scene.add(fill);

    function settled() {
        for (const item of level.items) {
            const object = model.items.get(item.id)!;
            object.visible = state.remaining.includes(item.id);
            object.position.set(...item.position); object.scale.setScalar(itemScale);
            model.markers.get(item.id)!.visible = canPick(state, item);
        }
        model.mascot.position.copy(mascotHome); model.mascot.rotation.y = 0; model.parcel.visible = false;
        model.shipped.children.forEach((carton, n) => { carton.visible = n < packedCount(level, state); });
    }

    function finish() {
        const previous = transition; transition = undefined; settled(); previous?.done();
    }
    function cancelFrame() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    function fail(kind: 'graphicsFailed' | 'contextLost', cause?: unknown) {
        if (disposed || failed) { return; }
        failed = true; cancelFrame(); finish(); options.error(kind, cause);
    }
    function fit() {
        fitMovingCamera(camera, width, height, yaw);
    }
    function draw(time: number) {
        raf = 0;
        if (disposed || failed || !active || !onscreen || document.hidden || width <= 0 || height <= 0) { return; }
        try {
            if (transition) {
                const t = Math.min(1, (time - transition.started) / transition.duration);
                const action = transition.action;
                if (action?.type === 'pick') {
                    const item = level.items.find(entry => entry.id === action.id)!;
                    const object = model.items.get(item.id)!;
                    const flight = Math.min(1, t * (transition.packed ? 4 : 1));
                    object.visible = flight < 1;
                    object.position.set(...item.position).lerp(mascotHome.clone().add(new Vector3(0, .43, 0)), flight);
                    object.position.y += Math.sin(flight * Math.PI) * 1.4;
                    object.scale.setScalar(itemScale * (1 - flight * .7));
                    if (transition.packed) {
                        const walk = Math.max(0, (t - .2) / .8);
                        model.parcel.visible = walk > 0 && walk < .92;
                        model.mascot.position.x = mascotHome.x + walk * (model.shipped.position.x - mascotHome.x);
                        model.mascot.position.y = mascotHome.y + Math.abs(Math.sin(walk * 22)) * .1;
                        model.mascot.rotation.y = .6;
                    }
                }
                if (t >= 1) { finish(); }
            }
            const target = focused ? model.items.get(focused) : undefined;
            model.halo.visible = !!target?.visible;
            if (target?.visible) { model.halo.position.copy(target.position); model.halo.position.y -= .28; }
            renderer!.getSize(drawingSize);
            if (drawingSize.x !== width || drawingSize.y !== height) { renderer!.setSize(width, height, false); }
            renderer!.render(scene, camera);
            if (transition) { invalidate(); }
        } catch (cause) { fail('graphicsFailed', cause); }
    }
    function invalidate() {
        if (!raf && !disposed && !failed && active && onscreen && !document.hidden && width > 0 && height > 0) { raf = requestAnimationFrame(draw); }
    }
    function resize() {
        const rect = host.getBoundingClientRect(); width = rect.width; height = rect.height;
        if (width <= 0 || height <= 0) { cancelFrame(); return; }
        // The next drawing frame resizes and renders atomically, without a blank frame.
        fit(); invalidate();
    }
    function raySurface(clientX: number, clientY: number): MovingAction | null {
        const rect = renderer!.domElement.getBoundingClientRect();
        pointer.set((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(model.root, true);
        for (const hit of hits) {
            let object: Object3D | null = hit.object;
            let visible = true;
            while (object) { if (!object.visible) { visible = false; break; } object = object.parent; }
            if (!visible || hit.object === model.halo || [...model.markers.values()].some(marker => hit.object.parent === marker)) { continue; }
            object = hit.object;
            while (object) {
                if (object.userData.itemId) { return { type: 'pick', id: object.userData.itemId }; }
                object = object.parent;
            }
            // First physical surface occludes everything behind it.
            return null;
        }
        return null;
    }
    function rayTarget(clientX: number, clientY: number): MovingAction | null {
        const direct = raySurface(clientX, clientY);
        if (direct?.type === 'pick') { return direct; }
        const rect = renderer!.domElement.getBoundingClientRect();
        // A 44px touch target may extend beyond the mesh, but never through an occluder.
        const candidates = level.items.flatMap(item => {
            const object = model.items.get(item.id)!;
            if (!object.visible) { return []; }
            const p = object.position.clone().project(camera);
            const x = rect.left + (p.x + 1) * rect.width / 2, y = rect.top + (1 - p.y) * rect.height / 2;
            const distance = Math.hypot(clientX - x, clientY - y);
            return distance <= 22 ? [{ id: item.id, x, y, distance }] : [];
        }).sort((a, b) => a.distance - b.distance);
        for (const candidate of candidates) {
            const hit = raySurface(candidate.x, candidate.y);
            if (hit?.type === 'pick' && hit.id === candidate.id) { return hit; }
        }
        return direct;
    }
    function zoom(factor: number) { camera.zoom = Math.max(1, Math.min(1.8, camera.zoom * factor)); camera.updateProjectionMatrix(); invalidate(); }
    function rotate(delta: number) { yaw = Math.max(-.15, Math.min(1.05, yaw + delta)); fit(); invalidate(); }
    function dispose() {
        if (disposed) { return; }
        disposed = true; cancelFrame(); finish(); abort.abort();
        resizeObserver?.disconnect(); intersectionObserver?.disconnect();
        model.dispose(); key.shadow.dispose(); scene.clear();
        renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
    }
    try {
        renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(new Color('#e6f1ed'), 0);
        renderer.outputColorSpace = SRGBColorSpace; renderer.toneMapping = NeutralToneMapping;
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = PCFSoftShadowMap;
        renderer.debug.onShaderError = () => fail('graphicsFailed');
        const canvas = renderer.domElement;
        canvas.setAttribute('aria-label', MOVING_COPY.sceneLabel); canvas.setAttribute('role', 'img'); canvas.tabIndex = 0;
        host.prepend(canvas);
        const eventOptions = { signal: abort.signal };
        canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fail('contextLost'); }, eventOptions);
        canvas.addEventListener('pointerdown', event => {
            if (event.button !== 0 || gesture || transition) { return; }
            canvas.setPointerCapture(event.pointerId);
            gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw, dragged: false };
        }, eventOptions);
        canvas.addEventListener('pointermove', event => {
            if (!gesture) {
                if (transition || event.pointerType !== 'mouse') { return; }
                const hit = rayTarget(event.clientX, event.clientY);
                const next = hit?.type === 'pick' ? hit.id : null;
                canvas.style.cursor = hit ? 'pointer' : 'grab';
                if (focused !== next) { focused = next; invalidate(); }
                return;
            }
            if (gesture.id !== event.pointerId) { return; }
            const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
            if (Math.hypot(dx, dy) > 7) { gesture.dragged = true; }
            if (gesture.dragged) { yaw = Math.max(-.15, Math.min(1.05, gesture.yaw - dx / width * 2.4)); fit(); invalidate(); }
        }, eventOptions);
        canvas.addEventListener('pointerleave', () => { if (focused) { focused = null; invalidate(); } }, eventOptions);
        canvas.addEventListener('pointerup', event => {
            if (!gesture || gesture.id !== event.pointerId) { return; }
            const moved = gesture.dragged; gesture = null;
            if (canvas.hasPointerCapture(event.pointerId)) { canvas.releasePointerCapture(event.pointerId); }
            if (!moved && !transition) { const action = rayTarget(event.clientX, event.clientY); if (action) { options.action(action); } }
        }, eventOptions);
        for (const name of ['pointercancel', 'lostpointercapture']) { canvas.addEventListener(name, () => { gesture = null; }, eventOptions); }
        canvas.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); rotate(event.key === 'ArrowLeft' ? -.14 : .14); }
            else if (event.key === 'Home') { event.preventDefault(); yaw = INITIAL_YAW; camera.zoom = 1; fit(); invalidate(); }
            else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.15); }
            else if (event.key === '-') { event.preventDefault(); zoom(1 / 1.15); }
        }, eventOptions);
        canvas.addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY < 0 ? 1.1 : 1 / 1.1); }, { ...eventOptions, passive: false });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { cancelFrame(); finish(); gesture = null; } else { invalidate(); }
        }, eventOptions);
        motion.addEventListener('change', () => { finish(); invalidate(); }, eventOptions);
        resizeObserver = new ResizeObserver(() => { try { resize(); } catch (cause) { fail('graphicsFailed', cause); } });
        resizeObserver.observe(host);
        intersectionObserver = new IntersectionObserver(entries => {
            onscreen = entries[0].isIntersecting;
            if (onscreen) { invalidate(); } else { cancelFrame(); finish(); }
        });
        intersectionObserver.observe(host);
        settled(); resize();
        return {
            dispose, rotate, zoom,
            visibleItems() {
                const rect = renderer!.domElement.getBoundingClientRect();
                return level.items.filter(item => {
                    const object = model.items.get(item.id)!;
                    if (!object.visible) { return false; }
                    const p = object.position.clone().project(camera);
                    if (Math.abs(p.x) > 1 || Math.abs(p.y) > 1) { return false; }
                    const hit = raySurface(rect.left + (p.x + 1) * rect.width / 2, rect.top + (1 - p.y) * rect.height / 2);
                    return hit?.type === 'pick' && hit.id === item.id;
                }).map(item => item.id);
            },
            resetView() { yaw = INITIAL_YAW; camera.zoom = 1; fit(); invalidate(); },
            focus(id: string | null) { focused = id; invalidate(); },
            active(value: boolean) {
                active = value;
                if (!value) { cancelFrame(); finish(); gesture = null; }
                else { resize(); }
            },
            update(next: MovingState, action?: MovingAction, packed = false): Promise<void> {
                finish(); state = next; settled();
                if (motion.matches || !active || document.hidden || failed || !onscreen || !action) { invalidate(); return Promise.resolve(); }
                return new Promise(resolve => {
                    transition = { started: performance.now(), duration: packed ? 1100 : 300, action, packed, done: resolve };
                    invalidate();
                });
            },
        };
    } catch (cause) { dispose(); throw cause; }
}
export type MovingScene = ReturnType<typeof createMovingScene>;
