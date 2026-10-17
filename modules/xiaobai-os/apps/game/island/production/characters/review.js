import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { REVIEW_COPY as c } from './review-copy.mjs';

document.title = c.title;
document.querySelector('h1').textContent = c.title;
const status = document.querySelector('#status'), viewport = document.querySelector('#viewport');
status.textContent = c.loading;
const renderer = new T.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.domElement.setAttribute('aria-label', c.viewport);
viewport.append(renderer.domElement);
const scene = new T.Scene();
scene.background = new T.Color('#e4eeeb');
const camera = new T.PerspectiveCamera(34, 1, 0.01, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 0.30;
controls.maxDistance = 8;
controls.maxPolarAngle = Math.PI * 0.57;
scene.add(new T.HemisphereLight('#eaf4ff', '#a69a7e', 2.2));
const key = new T.DirectionalLight('#fff2e0', 2.7);
key.position.set(-2, 4, 3); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -2; key.shadow.camera.right = 2;
key.shadow.camera.top = 3; key.shadow.camera.bottom = -1; key.shadow.normalBias = 0.015;
scene.add(key);
const rim = new T.DirectionalLight('#e3f2ff', 1.8); rim.position.set(2, 3, -3); scene.add(rim);
const ground = new T.Mesh(new T.PlaneGeometry(200, 200), new T.MeshStandardMaterial({ color: '#dce7dd', roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; ground.receiveShadow = true; scene.add(ground);

function resize() {
    const { width, height } = viewport.getBoundingClientRect();
    renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
    frame(framing);
}
new ResizeObserver(resize).observe(viewport);
let mixer, active, framing = 'full', playing = false;
const clock = new T.Clock();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.08);
    if (!document.hidden && playing) mixer?.update(dt);
    controls.update(); renderer.render(scene, camera);
});
function frame(mode) {
    framing = mode;
    const mobile = camera.aspect < 0.8;
    if (mode === 'portrait') { controls.target.set(0, 1.48, 0); camera.position.set(0, 1.51, 0.86); }
    else if (mode === 'game') { controls.target.set(0, 0.65, 0); camera.position.set(3, 7.5, 9.6); }
    else { controls.target.set(0, mobile ? 0.74 : 0.87, 0); camera.position.set(0.3, 1.12, mobile ? 3.9 : 3.3); }
    controls.update();
}
function group(label, options, selected, run) {
    const container = document.createElement('div'); container.setAttribute('role', 'group'); container.setAttribute('aria-label', label);
    for (const value of options) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = c[value]; button.dataset.value = value;
        button.setAttribute('aria-pressed', String(value === selected));
        button.addEventListener('click', () => {
            run(value);
            for (const other of container.children) other.setAttribute('aria-pressed', String(other === button));
        });
        container.append(button);
    }
    return container;
}
try {
    const manager = new T.LoadingManager();
    let imageError;
    manager.onError = url => { imageError = new Error(`Character resource failed: ${url}`); };
    const gltf = await new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder).loadAsync('/model.glb');
    if (imageError) throw imageError;
    gltf.scene.traverse(obj => { if (obj.isMesh) { obj.castShadow = true; obj.frustumCulled = false; } });
    scene.add(gltf.scene);
    mixer = new T.AnimationMixer(gltf.scene);
    const actions = new Map(gltf.animations.map(clip => [clip.name, mixer.clipAction(clip)]));
    for (const name of ['idle', 'walk']) if (!actions.has(name)) throw new Error(c.missingAnimation(name));
    function animate(name) {
        const next = actions.get(name);
        active?.stop(); active = next; active.reset().play(); mixer.update(0);
        playing = name === 'walk' || !reducedMotion;
    }
    animate('idle');
    const nav = document.querySelector('#controls');
    nav.append(group(c.framing, ['full', 'portrait', 'game'], framing, frame), group(c.motion, ['idle', 'walk'], 'idle', animate));
    const wardrobe = document.createElement('div'); wardrobe.setAttribute('role', 'group'); wardrobe.setAttribute('aria-label', c.appearance);
    const garments = new Map();
    gltf.scene.traverse(obj => {
        const kind = obj.userData.garment_id;
        if (!kind) return;
        if (!garments.has(kind)) garments.set(kind, []);
        garments.get(kind).push(obj);
    });
    if (!garments.size) throw new Error(c.noGarments);
    for (const [kind, parts] of garments) {
        if (typeof c[kind] !== 'string') throw new Error(c.missingClothing(kind));
        const button = document.createElement('button'); button.type = 'button'; button.textContent = c[kind]; button.setAttribute('aria-pressed', 'true');
        button.addEventListener('click', () => { const visible = !parts[0].visible; for (const part of parts) part.visible = visible; button.setAttribute('aria-pressed', String(visible)); });
        wardrobe.append(button);
    }
    nav.append(wardrobe); nav.hidden = false; status.textContent = c.status; frame('full');
    // Read-only diagnostics for the local browser check, not a game API.
    window.characterReview = { model: gltf.scene, animations: gltf.animations, renderer, mixer, frame };
} catch (error) {
    status.textContent = c.error;
    const element = document.querySelector('#error'); element.textContent = error.message; element.hidden = false;
}
