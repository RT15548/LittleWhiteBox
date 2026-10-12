import { Scene, WebGLRenderer, OrthographicCamera, Vector3, Color, Group, Box3,
    HemisphereLight, DirectionalLight, SRGBColorSpace, PCFSoftShadowMap, NeutralToneMapping } from 'three';
import { createMascot } from '../../../../brand/mascot/model.js';
import { dressMascot } from '../../../../brand/mascot/outfit-model.js';
import { BUILDER_OUTFIT } from '../outfit.js';
import { createResources } from './resources.js';
import { withSceneLifetime } from './lifetime.js';
import { pixelRatio, RENDER_BUDGET } from './quality.js';
import { PALETTE as C } from './palette.js';
import { createPartModel, createSite, worldX, worldZ } from './models.js';
import { blueprint, certifiedPlans } from '../generation.js';
import { CELL, TIERS, cells, partKey, siteCells, type Blueprint, type Part } from '../policy.js';
import { projectBlueprint, type Project } from '../domain.js';
import { houseParts } from '../house.js';
import { livingSpaces, lifeTour } from '../spaces.js';
import { keepsakePlacements } from '../memories.js';
import { createKeepsake } from './keepsakes.js';
import { createHouseLife, type LifeMoment } from './life.js';
import type { SceneCue } from '../sound.js';
export interface CellTarget { x: number; y: number; z: number; polygon: string; left: number; top: number; width: number; height: number }
export interface SceneInput { project: Project | null; enabled: boolean; floor: number | null }
const DEMO = blueprint(17, TIERS[0]);
const DEMO_PARTS = houseParts(DEMO, certifiedPlans(DEMO)[1]);
export function createBuildingScene(host: HTMLElement, onLayout: (targets: CellTarget[]) => void,
    onBusy: (value: boolean) => void, onError: (error: unknown) => void, cue: (cue: SceneCue) => void, onMoment: (moment: LifeMoment | null) => void) {
    return withSceneLifetime(life => {
        const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
        life.defer(() => renderer.domElement.remove()); life.defer(() => renderer.forceContextLoss()); life.own(renderer);
        renderer.domElement.className = 'build-canvas'; host.append(renderer.domElement);
        renderer.outputColorSpace = SRGBColorSpace; renderer.toneMapping = NeutralToneMapping;
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = PCFSoftShadowMap;
        const scene = new Scene(); scene.background = new Color(C.sky);
        const camera = new OrthographicCamera(-5, 5, 5, -5, .1, 100), r = life.own(createResources());
        scene.add(new HemisphereLight(C.porcelain, C.mint, 2.1));
        const sun = new DirectionalLight(C.milk, 2.6); sun.position.set(-5, 10, 8); sun.castShadow = true;
        sun.shadow.mapSize.setScalar(RENDER_BUDGET.shadow); sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
        sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8; sun.shadow.normalBias = .03;
        life.own(sun.shadow); scene.add(sun, sun.target);
        const models = new Group(); scene.add(models);
        const mascot = createMascot({ group(parent, pos) { const group = new Group(); group.position.set(...pos); parent.add(group); return group; },
            ball(parent, size, color, pos) { return r.mesh(parent, 'sphere', color, size, pos); } }, scene, [0, 0, 0]);
        mascot.scale.setScalar(.70);
        dressMascot({
            ball(parent, size, color, position) { return r.mesh(parent, 'sphere', color, size, position); },
            box(parent, size, color, position) { return r.mesh(parent, 'box', color, size, position); },
        }, mascot, BUILDER_OUTFIT);
        let invitationFocus: Pick<Part, 'x' | 'y' | 'z'> | null = null;
        let focused = false, moment: LifeMoment | null = null;
        const footOffset = -new Box3().setFromObject(mascot).min.y;
        const resident = createHouseLife(r, mascot, footOffset, value => { moment = value; if (value?.phase === 'using') { invitationFocus = null; } onMoment(value); if (focused) { setCamera(); } });
        let gifts: { model: ReturnType<typeof createKeepsake>; floor: number }[] = [];
        let site: ReturnType<typeof createSite> | null = null, houses: ReturnType<typeof createPartModel>[] = [];
        let input: SceneInput = { project: null, enabled: true, floor: null };
        let brief: Blueprint = DEMO, parts = DEMO_PARTS, key = '', width = 1, height = 1, zoom = 1, yaw = .55;
        let ambientTimer: ReturnType<typeof setTimeout> | null = null;
        let ambientIndex = 0;
        let frame = 0, last = 0, hidden = false, suspended = false, disposed = false, failed = false;
        let falling: { model: Group; y: number; elapsed: number } | null = null, pendingVisit: Part | null = null;
        const reduced = matchMedia('(prefers-reduced-motion: reduce)'), pointers = new Map<number, { x: number; y: number }>();
        let gesture = false;
        life.defer(() => { disposed = true; stop(); houses.forEach(h => h.dispose()); gifts.forEach(g => g.model.dispose()); site?.dispose(); });
        function active() { return !disposed && !failed && !hidden && !suspended && !document.hidden && input.enabled; }
        function setCamera() {
            const expansion = siteCells(brief);
            const footprint = [...parts.filter(p => p.kind !== 'roof').flatMap(cells), ...expansion];
            const left = Math.min(...footprint.map(p => p.x)), right = Math.max(...footprint.map(p => p.x));
            const aspect = width / height, top = Math.max(1, ...parts.map(p => p.y + (p.kind === 'roof' ? .6 : 1)), ...expansion.map(p => p.y + 1)) * CELL.height;
            const focus = focused ? invitationFocus ?? moment?.space.part : null;
            const half = Math.max((top + brief.depth * CELL.depth + 2.0) / 2, ((right - left + 1) * CELL.width + brief.depth * CELL.depth * .65 + 1.2) / (2 * aspect)) * zoom;
            const center = focus ? (focus.y + .48) * CELL.height : top / 2 - .12, centerX = focus ? worldX(brief, focus.x) : worldX(brief, (left + right) / 2);
            camera.left = -half * aspect; camera.right = half * aspect; camera.top = half; camera.bottom = -half;
            const centerZ = focus ? worldZ(brief, focus.z) : 0;
            camera.position.set(centerX + Math.sin(yaw) * 12, center + 13, centerZ + Math.cos(yaw) * 12); camera.lookAt(centerX, center, centerZ);
            camera.updateProjectionMatrix(); camera.updateMatrixWorld();
            const targets: CellTarget[] = [];
            for (const cell of siteCells(brief)) {
                if (input.floor !== null && cell.y !== input.floor) { continue; }
                const corners = [[-.49, -.49], [.49, -.49], [.49, .49], [-.49, .49]].map(([dx, dz]) =>
                    new Vector3(worldX(brief, cell.x) + dx * CELL.width, cell.y * CELL.height + .15, worldZ(brief, cell.z) + dz * CELL.depth).project(camera));
                const xs = corners.map(p => (p.x + 1) * 50), ys = corners.map(p => (1 - p.y) * 50);
                const left = Math.min(...xs), top = Math.min(...ys), w = Math.max(...xs) - left, h = Math.max(...ys) - top;
                targets.push({ ...cell, left, top, width: w, height: h, polygon: xs.map((x, i) => `${(x - left) / w * 100}% ${(ys[i] - top) / h * 100}%`).join(',') });
            }
            onLayout(targets);
        }
        function resize() {
            const size = host.getBoundingClientRect(); width = Math.max(1, size.width); height = Math.max(1, size.height);
            renderer.setPixelRatio(pixelRatio(width, height, window.devicePixelRatio || 1)); renderer.setSize(width, height, false);
            setCamera(); invalidate();
        }
        function visit(destination?: Pick<Part, 'x' | 'y' | 'z'>) {
            if (!active() || falling) { return; }
            clearAmbient();
            resident.visit(destination, reduced.matches);
            if (destination) { invitationFocus = destination; focused = true; zoom = .75; setCamera(); }
            invalidate();
        }
        function set(next: SceneInput) {
            if (!next.enabled) { stop(); }
            const nextBrief = next.project ? projectBlueprint(next.project) : DEMO;
            const nextParts = next.project ? houseParts(nextBrief, next.project.rooms) : DEMO_PARTS;
            const nextKey = JSON.stringify([next.project?.id, next.project?.state, next.project?.memories, nextParts]);
            const isNew = input.project?.id !== next.project?.id;
            if (isNew) { invitationFocus = null; zoom = 1; yaw = .55; focused = false; pointers.clear(); }
            const added = !isNew ? nextParts.find(p => p.kind !== 'roof' && !parts.some(old => old.kind !== 'roof' && partKey(old) === partKey(p))) : null;
            const remembered = !isNew ? next.project?.memories.find(id => !input.project?.memories.includes(id)) : null;
            const finished = !isNew && input.project?.state === 'building' && next.project?.state === 'living';
            const wasUsable = new Set(livingSpaces(brief, parts).filter(s => !s.issue).map(s => `${partKey(s.part)}:${s.activity}`));
            input = next; brief = nextBrief;
            if (key !== nextKey) {
                clearAmbient();
                falling = null; pendingVisit = null; onBusy(false);
                houses.forEach(h => h.dispose()); gifts.forEach(g => g.model.dispose()); models.clear(); site?.dispose(); if (site) { scene.remove(site.root); }
                parts = nextParts; key = nextKey; site = createSite(r, brief); scene.add(site.root);
                const placements = next.project ? keepsakePlacements(brief, next.project.rooms, next.project.memories) : [];
                houses = parts.map(p => { const model = createPartModel(r, brief, parts, p, true, placements.filter(g => partKey(g.part) === partKey(p) && g.part.kind === p.kind).map(g => g.id)); models.add(model.root); return model; });
                gifts = placements.map(gift => {
                    const model = createKeepsake(r, brief, gift); models.add(model.root); return { model, floor: gift.part.y };
                });
                resident.configure(brief, parts, isNew); sun.position.x = brief.sunSide * 7;
                const newlyUsable = lifeTour(brief, parts).find(s => !wasUsable.has(`${partKey(s.part)}:${s.activity}`));
                if (added && next.enabled && !reduced.matches) {
                    const model = houses[parts.indexOf(added)].root; falling = { model, y: model.position.y, elapsed: 0 }; onBusy(true); cue('release');
                } else if (added) { cue('land'); }
                if (remembered && next.project) {
                    cue('reward');
                    const gift = placements.find(g => g.id === remembered);
                    if (gift) { invitationFocus = gift.part; focused = true; zoom = .75; resident.visit(gift.part, reduced.matches); }
                } else if (finished) { cue('reward'); resident.visit(undefined, reduced.matches); }
                else if (newlyUsable && !isNew) {
                    if (falling) { pendingVisit = newlyUsable.part; } else { resident.visit(newlyUsable.part, reduced.matches); }
                } else if (!next.project || isNew && next.project.state === 'living') { resident.visit(lifeTour(brief, parts)[0]?.part, reduced.matches); }
            }
            houses.forEach((house, i) => { house.root.visible = input.floor === null || parts[i].kind !== 'roof' && parts[i].y <= input.floor; });
            gifts.forEach(g => { g.model.root.visible = input.floor === null || g.floor <= input.floor; });
            setCamera(); invalidate();
        }
        function render(now: number) {
            frame = 0; if (!active()) { last = 0; return; }
            const delta = last ? Math.min(64, now - last) : 0; last = now;
            if (falling) {
                falling.elapsed += delta; const t = Math.min(1, falling.elapsed / 420);
                falling.model.position.y = falling.y + (1 - t) ** 2 * 1.7;
                if (t === 1) { falling = null; onBusy(false); cue('land'); if (pendingVisit) { resident.visit(pendingVisit, reduced.matches); pendingVisit = null; } }
            }
            let walking = false;
            try { walking = resident.tick(delta);
                mascot.visible = input.floor === null || mascot.position.y - footOffset < (input.floor + 1) * CELL.height;
                renderer.render(scene, camera); } catch (error) { failed = true; stop(); onError(error); return; }
            if (falling || walking) { invalidate(); } else {
                last = 0;
                if (!reduced.matches && input.project?.state === 'living' && ambientTimer === null) {
                    ambientTimer = setTimeout(() => {
                        ambientTimer = null;
                        if (active()) { const tour = lifeTour(brief, parts); if (tour.length) { resident.visit(tour[ambientIndex++ % tour.length].part); invalidate(); } }
                    }, 6500);
                }
            }
        }
        function invalidate() { if (!frame && active()) { frame = requestAnimationFrame(render); } }
        function clearAmbient() { if (ambientTimer !== null) { clearTimeout(ambientTimer); ambientTimer = null; } }
        function stop() { clearAmbient(); if (frame) { cancelAnimationFrame(frame); frame = 0; } last = 0; }
        function visibility() { stop(); invalidate(); }
        function motionPreference() {
            stop();
            if (reduced.matches) {
                if (falling) { falling.model.position.y = falling.y; falling = null; onBusy(false); }
                if (pendingVisit) { resident.visit(pendingVisit, true); pendingVisit = null; }
                resident.reduce();
            }
            invalidate();
        }
        function lost(event: Event) { event.preventDefault(); failed = true; stop(); onError(new Error('building_webgl_context_lost')); }
        function scale(factor: number) { zoom = Math.max(.48, Math.min(2, zoom * factor)); setCamera(); invalidate(); }
        function wheel(event: WheelEvent) { event.preventDefault(); scale(Math.exp(event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1) * .001)); }
        function down(event: PointerEvent) {
            if (!pointers.size) { gesture = false; }
            if ((event.target as HTMLElement).closest('button:not(.build-cell)')) { return; }
            if (pointers.size) { gesture = true; }
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (!(event.target as HTMLElement).closest('button')) { host.setPointerCapture(event.pointerId); }
        }
        function move(event: PointerEvent) {
            const before = pointers.get(event.pointerId); if (!before) { return; }
            const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)?.[1];
            if (other) { const a = Math.hypot(before.x - other.x, before.y - other.y), b = Math.hypot(event.clientX - other.x, event.clientY - other.y); if (a && b) { scale(a / b); } }
            else if (!(event.target as HTMLElement).closest('button')) {
                if (Math.hypot(event.clientX - before.x, event.clientY - before.y) > 3) { gesture = true; }
                yaw = Math.max(-1.2, Math.min(1.2, yaw - (event.clientX - before.x) * .008)); setCamera(); invalidate();
            }
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        }
        function up(event: PointerEvent) { pointers.delete(event.pointerId); }
        function click(event: MouseEvent) { if (gesture) { event.preventDefault(); event.stopPropagation(); gesture = false; } }
        host.addEventListener('click', click, true); life.defer(() => host.removeEventListener('click', click, true));
        const events: [EventTarget, string, EventListener][] = [[host, 'wheel', wheel as EventListener], [host, 'pointerdown', down as EventListener],
            [host, 'pointermove', move as EventListener], [host, 'pointerup', up as EventListener], [host, 'pointercancel', up as EventListener],
            [host, 'lostpointercapture', up as EventListener], [document, 'visibilitychange', visibility], [renderer.domElement, 'webglcontextlost', lost], [reduced, 'change', motionPreference]];
        life.defer(() => events.forEach(([target, name, listener]) => target.removeEventListener(name, listener)));
        events.forEach(([target, name, listener]) => target.addEventListener(name, listener, { passive: false }));
        const observer = new ResizeObserver(resize); life.defer(() => observer.disconnect()); observer.observe(host);
        const intersection = new IntersectionObserver(entries => { hidden = !entries[0].isIntersecting; visibility(); }); life.defer(() => intersection.disconnect()); intersection.observe(host);
        set(input); resize();
        return { set, visit, focus() { if (moment) { invitationFocus = null; focused = true; zoom = .60; setCamera(); invalidate(); } },
            zoom(delta: number) { scale(Math.exp(delta)); }, reset() { invitationFocus = null; focused = false; zoom = 1; yaw = .55; setCamera(); invalidate(); },
            suspend() { suspended = true; stop(); }, resume() { suspended = false; invalidate(); },
            async snapshot() { renderer.render(scene, camera); return new Promise<Blob>((resolve, reject) => renderer.domElement.toBlob(blob => blob ? resolve(blob) : reject(new Error('building_export')), 'image/png')); },
            dispose: life.dispose,
        };
    });
}
export type BuildingScene = ReturnType<typeof createBuildingScene>;
