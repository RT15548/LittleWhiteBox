import * as T from 'three';
import { LANDSCAPE } from '../content.js';
import type { IslandView } from '../service.js';
import type { NpcId, Point } from '../model.js';
import { canStand, distance } from '../space.js';
import { disposeGroup, disposeSurfaces, mesh } from './meshes.js';
import { structure } from './structures.js';
import { createFoliage } from './foliage.js';
import { createCutaway } from './cutaway.js';
import { groundMaterial } from './terrain-materials.js';
import { createOcean } from './ocean.js';
import { createPeopleLayer } from './people-layer.js';
import { CAMERA_OFFSET } from './camera.js';
import { islandGround } from './terrain-mesh.js';
import { elevationAt } from '../terrain.js';
import { createWeatherLayer } from './weather-layer.js';
import { createVegetationLayer } from './vegetation-layer.js';
import { itemMesh } from './item-mesh.js';
import { waterBasin } from './water-basin.js';
import { graveMesh, wasteMesh } from './waste-mesh.js';
import type { CharacterRoster } from './character-loader.js';

type Observation = NonNullable<IslandView['player']>;
export function createIslandScene(container: HTMLElement, select: (point: Point) => void, selectPerson: (id: NpcId) => void, onError: () => void, characters: CharacterRoster) {
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
    container.append(renderer.domElement);
    const scene = new T.Scene(); scene.background = new T.Color('#c0e8ef'); scene.fog = new T.Fog('#c0e8ef', 120, 235);
    const camera = new T.OrthographicCamera(-35, 35, 25, -25, .1, 500), sunlight = new T.DirectionalLight('#fff4da', 3);
    sunlight.position.set(-35, 65, -25); sunlight.castShadow = true; sunlight.shadow.mapSize.set(2048, 2048);
    Object.assign(sunlight.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: .5, far: 180 }); sunlight.shadow.bias = -.0004;
    scene.add(sunlight, sunlight.target, new T.HemisphereLight('#e5f7ff', '#a2a67d', 2.1));
    const ground = groundMaterial(renderer.capabilities.getMaxAnisotropy(), () => { if (!disposed) { schedule(); } }, onError);
    const land = islandGround(ground.material); scene.add(land);
    const sea = createOcean(land.geometry); scene.add(sea.root);
    const poolWater = new T.MeshStandardMaterial({ color: '#75b5b6', roughness: .2, metalness: .12, transparent: true, opacity: .78 });
    const dynamic = new T.Group(), marker = new T.Group(); scene.add(dynamic, marker);
    const foliage = createFoliage(() => { if (!disposed) { schedule(); } }, onError);
    const cutaway = createCutaway();
    const vegetation = createVegetationLayer(scene, foliage, cutaway, ground.reefRock);
    const people = createPeopleLayer(scene, container, selectPerson, foliage, characters);
    const weather = createWeatherLayer(scene);
    const ring = new T.Mesh(new T.RingGeometry(.5, .6, 40), new T.MeshBasicMaterial({ color: '#2b7b78', transparent: true, opacity: .85, side: T.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = .035; marker.add(ring); marker.visible = false;
    let observation: Observation | null = null, frame = 0, disposed = false, active = true, zoom = 12;
    const raycaster = new T.Raycaster();
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    function resize() {
        const w = container.clientWidth, h = container.clientHeight; if (!w || !h) { return; }
        // A conversation gets its own space. Keep people readable when the remaining scene is short,
        // instead of fitting the same expanse of empty ground into a smaller viewport.
        const halfHeight = zoom * Math.min(1, h / 640);
        renderer.setSize(w, h, false); camera.left = -halfHeight * w / h; camera.right = halfHeight * w / h; camera.top = halfHeight; camera.bottom = -halfHeight; camera.updateProjectionMatrix();
        schedule();
    }
    function render(time = performance.now()) {
        frame = 0; if (disposed || !active || !observation || document.hidden || !container.clientHeight) { return; }
        try { people.animate(time); }
        catch (error) { console.error(error); onError(); return; }
        const p = people.player()!, target = new T.Vector3(p.x, elevationAt({ x: p.x, y: p.z }), p.z);
        camera.position.copy(target).add(new T.Vector3(CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z)); camera.lookAt(target);
        camera.updateMatrixWorld();
        cutaway.update(p, camera);
        sunlight.position.copy(target).add(new T.Vector3(-35, 65, -25)); sunlight.target.position.copy(target);
        people.project(camera);
        sea.animate(media.matches ? 0 : time / 1000);
        weather.animate(media.matches ? 0 : time / 1000, target);
        renderer.render(scene, camera);
        if (!media.matches) { frame = requestAnimationFrame(render); }
    }
    function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(render); }
    // The world updates several times a second while people walk; the props around them rarely change.
    let propsSignature = '';
    function update(next: Observation) {
        observation = next; vegetation.update(next.self.position);
        people.update(next, media.matches);
        const activity = next.self.activity;
        const destination = activity?.kind === 'travel' || activity?.kind === 'drag' ? activity.route.at(-1) : null;
        marker.visible = !!destination;
        if (destination) { marker.position.set(destination.x, elevationAt(destination), destination.y); }
        const signature = JSON.stringify([next.waste, next.graves, next.structures, next.items, next.resources, Math.round(next.weather.tide * 100)]);
        if (signature !== propsSignature) { propsSignature = signature; rebuildProps(next); }
        renderer.toneMappingExposure = next.weather.daylight ? next.weather.rain ? 1.05 : 1.25 : .58;
        const sky = next.weather.daylight ? next.weather.rain ? '#b4d4df' : '#c0e8ef' : '#5c788c';
        scene.background = new T.Color(sky); (scene.fog as T.Fog).color.set(sky);
        sunlight.intensity = next.weather.daylight ? next.weather.rain ? 1.4 : 3 : .6;
        sea.update(next.weather.tide, next.weather.daylight, next.weather.rain);
        ground.update(next.weather.tide);
        weather.setRain(next.weather.rain); schedule();
    }
    function rebuildProps(next: Observation) {
        disposeGroup(dynamic, [...foliage.materials, ...cutaway.materials, ground.reefRock, poolWater]); dynamic.clear();
        for (const waste of next.waste) { const trace = wasteMesh(waste); trace.position.set(waste.position.x, 0, waste.position.y); dynamic.add(trace); }
        for (const grave of next.graves) { const mound = graveMesh(); mound.position.set(grave.position.x, 0, grave.position.y); dynamic.add(mound); }
        for (const site of next.structures) { const g = structure(site, foliage); cutaway.apply(g); g.position.set(site.position.x, 0, site.position.y); dynamic.add(g); }
        for (const item of next.items) {
            if (item.location.kind !== 'ground') { continue; }
            const p = item.location.position;
            const g = itemMesh(item, foliage, characters); g.position.set(p.x, 0, p.y); dynamic.add(g);
        }
        for (const resource of next.resources) {
            const p = resource.position;
            if (resource.kind === 'seep' || resource.kind === 'reef_food') {
                const pool = waterBasin({ ...resource, kind: resource.kind }, ground.reefRock, poolWater, next.weather.tide);
                pool.position.set(p.x, 0, p.y); dynamic.add(pool);
            } else if (resource.kind === 'coconuts') {
                for (let i = 0; i < Math.min(7, resource.stock); i++) { mesh(new T.SphereGeometry(.16, 8, 7), '#9a9e56', dynamic, p.x + Math.cos(i * 2.4) * .6, .12, p.y + Math.sin(i * 2.4) * .6); }
            } else {
                const pile = itemMesh({ kind: resource.kind === 'wood' ? 'branch' : 'palm_leaf', quantity: Math.floor(resource.stock), wetness: 0 }, foliage, characters);
                pile.position.set(p.x, 0, p.y); dynamic.add(pile);
            }
        }
        for (const object of dynamic.children) { object.position.y += elevationAt({ x: object.position.x, y: object.position.z }); }
    }
    function click(event: PointerEvent) {
        if (!observation || event.button !== 0) { return; }
        const rect = renderer.domElement.getBoundingClientRect();
        raycaster.setFromCamera(new T.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2), camera);
        const person = people.pick(raycaster); if (person) { selectPerson(person); return; }
        const hit = raycaster.intersectObject(land, false)[0]; if (!hit) { return; }
        const p = { x: hit.point.x, y: hit.point.z };
        if (!canStand(p, LANDSCAPE) || distance(p, observation.self.position) > 90) { return; }
        select(p);
    }
    function changeZoom(by: number) { zoom = Math.max(3, Math.min(36, zoom + by)); resize(); }
    function wheel(event: WheelEvent) { event.preventDefault(); changeZoom(Math.sign(event.deltaY) * 2); }
    function visibility() { if (document.hidden) { cancelAnimationFrame(frame); } else { schedule(); } }
    const observer = new ResizeObserver(resize); observer.observe(container);
    renderer.domElement.addEventListener('pointerup', click); renderer.domElement.addEventListener('wheel', wheel, { passive: false });
    renderer.domElement.addEventListener('webglcontextlost', onError); document.addEventListener('visibilitychange', visibility); resize();
    return { update, resize, changeZoom, setActive(value: boolean) { active = value; if (value) { resize(); schedule(); } else { cancelAnimationFrame(frame); } }, dispose() {
        disposed = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility);
        renderer.domElement.removeEventListener('pointerup', click); renderer.domElement.removeEventListener('wheel', wheel); renderer.domElement.removeEventListener('webglcontextlost', onError);
        people.dispose(); weather.dispose(); vegetation.dispose(); sea.dispose(); disposeGroup(scene, [...foliage.materials, ...cutaway.materials, ground.reefRock, poolWater]); cutaway.dispose(); foliage.dispose(); ground.dispose(); poolWater.dispose(); disposeSurfaces(); sunlight.dispose(); renderer.dispose(); renderer.domElement.remove();
    } };
}
