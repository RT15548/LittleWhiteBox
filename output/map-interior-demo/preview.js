import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import fixtures from 'demo:scenes';
import { footprint, nameOf, presentationKind, kindNames, explanation } from './scene-data.js';
import { createRoomModel } from './room-model.js';
import { mountPlan } from './plan-view.js';

const $ = id => document.getElementById(id);
const app = $('app'), viewport = $('viewport'), plan = $('plan');
let fixture = fixtures[0], room = fixture.scene, elements = new Map();
let mode = '3d', labelsVisible = true, lowWalls = false, selected = null, available = false;
let renderer, camera, controls, scene, model, ambient, sunlight, animation = 0, disposed = false;
const labels = new Map(), cleanups = [];
const planView = mountPlan(plan, room);
function on(target, name, callback, options) {
    target.addEventListener(name, callback, options);
    cleanups.push(() => target.removeEventListener(name, callback, options));
}
function notice(message) { $('error').textContent = message; $('error').hidden = !message; }
function select(id) {
    selected = elements.get(id) || null;
    if (available) model?.select(selected);
    const title = selected ? nameOf(selected) + ' · ' + kindNames[presentationKind(selected)] : room.name;
    $('selection-title').textContent = title;
    $('selection-detail').textContent = selected ? (
        presentationKind(selected) === 'footprint' ? '◇ 只有占地轮廓；这不是它的真实外观'
            : presentationKind(selected) === 'model' ? '本地预设造型；高度与细节不在原始数据中'
                : explanation(selected)
    ) : '点选物件查看三维呈现依据';
    $('detail-title').textContent = selected ? nameOf(selected) : '物件与造型';
    $('detail-reason').textContent = selected ? explanation(selected) : '选择一项查看它是否有三维模板。';
    if (selected) {
        const fp = footprint(selected);
        $('detail-fact').textContent = '形状 ' + selected.shape + ' · 材质 ' + (selected.material || '未指定')
            + ' · 朝向 ' + (selected.rotation || 0) + '°'
            + (fp.width && fp.depth ? ' · 范围 ' + fp.width + ' × ' + fp.depth + '（地图单位）' : '')
            + ' · 确定性 ' + (selected.certainty || 'confirmed');
    } else $('detail-fact').textContent = '';
    $('element-json').textContent = JSON.stringify(selected || room, null, 2);
    $('object-list').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.element === selected?.id)));
    for (const [key, node] of labels) node.classList.toggle('selected', key === selected?.id);
    invalidate();
}
function fillObjects() {
    $('object-list').replaceChildren(); $('coverage').replaceChildren();
    const counts = {};
    const ordered = [...room.elements].sort((a, b) => {
        const priority = { model: 0, footprint: 1, marker: 2, wall: 3, surface: 4 };
        return priority[presentationKind(a)] - priority[presentationKind(b)];
    });
    for (const element of ordered) {
        const kind = presentationKind(element);
        counts[kind] = (counts[kind] || 0) + 1;
        const button = document.createElement('button'); button.className = 'object-row';
        button.dataset.element = element.id; button.dataset.kind = kind; button.setAttribute('aria-pressed', 'false');
        const name = document.createElement('span'); name.className = 'object-name'; name.textContent = nameOf(element);
        const badge = document.createElement('span'); badge.className = 'kind ' + kind; badge.textContent = kindNames[kind];
        button.append(name, badge); $('object-list').append(button);
    }
    for (const kind of ['model', 'footprint', 'marker']) {
        const node = document.createElement('span'); node.className = kind;
        node.textContent = (counts[kind] || 0) + ' ' + kindNames[kind]; $('coverage').append(node);
    }
    $('element-count').textContent = room.elements.length + ' 项，全部列出';
}
function loadScene(value) {
    fixture = fixtures.find(item => item.id === value); room = fixture.scene;
    elements = new Map(room.elements.map(element => [element.id, element]));
    planView.setScene(room); fillObjects(); labels.clear(); $('labels').replaceChildren();
    if (model) { scene.remove(model.group); model.dispose(); model = null; }
    if (available) {
        try {
            model = createRoomModel(room); scene.add(model.group);
            for (const id of model.labelAnchors.keys()) {
                const element = elements.get(id), node = document.createElement('span');
                node.className = 'scene-label ' + presentationKind(element); node.textContent = nameOf(element);
                node.dataset.element = id; $('labels').append(node); labels.set(id, node);
            }
            reset(); resize();
        } catch (error) {
            console.error(error); fail3d('该场景的三维渲染失败，已回到现有二维视图。');
        }
    }
    select(value === 'cabin' ? 'berth' : null);
}
function setMode(next) {
    if (next === '3d' && !available) return;
    mode = next; app.dataset.mode = mode;
    $('mode-3d').setAttribute('aria-pressed', String(mode === '3d'));
    $('mode-2d').setAttribute('aria-pressed', String(mode === '2d'));
    if (renderer) renderer.domElement.hidden = mode !== '3d';
    $('labels').hidden = mode !== '3d' || !labelsVisible;
    plan.hidden = mode !== '2d';
    if (controls) controls.enabled = mode === '3d';
    $('hint').textContent = mode === '3d' ? '拖动旋转 · 双指 / 滚轮缩放 · 点选物件' : '插件原有二维组件 · 拖动平移 · 双指 / 滚轮缩放';
    viewport.setAttribute('aria-label', mode === '3d' ? '三维视口：拖动旋转，方向键调整，Home复位' : '插件现有二维地图');
    if (mode === '2d') $('needle').style.transform = 'rotate(0deg)';
    resize(); invalidate();
}
function fail3d(message) {
    available = false; $('mode-3d').disabled = true; $('loading').hidden = true;
    if (animation) { cancelAnimationFrame(animation); animation = 0; }
    setMode('2d'); notice(message);
}
function invalidate() {
    if (!available || mode !== '3d' || disposed || document.hidden || animation || !model) return;
    animation = requestAnimationFrame(() => {
        animation = 0;
        try { render(); } catch (error) { console.error(error); fail3d('立体画面暂不可用，已切回现有二维视图。'); }
    });
}
function render() {
    model.updateWalls(camera, controls.target, lowWalls); renderer.render(scene, camera);
    $('needle').style.transform = 'rotate(' + -controls.getAzimuthalAngle() * 180 / Math.PI + 'deg)';
    const rect = viewport.getBoundingClientRect(), occupied = [];
    const rank = id => id === selected?.id ? 0 : presentationKind(elements.get(id)) === 'footprint' ? 1 : 2;
    for (const [id, point] of [...model.labelAnchors.entries()].sort(([a], [b]) => rank(a) - rank(b))) {
        const node = labels.get(id), p = point.clone().project(camera);
        const x = (p.x + 1) / 2 * rect.width, y = (1 - p.y) / 2 * rect.height;
        const width = node.offsetWidth || 68, box = { x: x - width / 2, y: y - 26, width, height: 26 };
        const collision = occupied.some(o => box.x < o.x + o.width + 4 && box.x + box.width + 4 > o.x && box.y < o.y + o.height && box.y + box.height > o.y);
        const visible = p.z > -1 && p.z < 1 && x > width / 2 && x < rect.width - width / 2 && y > 26 && y < rect.height - 8 && !collision;
        node.style.display = visible ? '' : 'none'; node.style.left = x + 'px'; node.style.top = y + 'px';
        if (visible) occupied.push(box);
    }
}
function resize() {
    if (!available || !model) return;
    const { width, height } = viewport.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;
    renderer.setSize(width, height); const aspect = width / height;
    const span = Math.max(model.span * .70, model.span / aspect);
    camera.left = -span * aspect / 2; camera.right = span * aspect / 2;
    camera.top = span / 2; camera.bottom = -span / 2; camera.updateProjectionMatrix(); invalidate();
}
function reset() {
    if (!available) return;
    camera.position.set(11, 15, 18); camera.zoom = 1; controls.target.set(0, .15, -.35);
    camera.updateProjectionMatrix(); controls.update(); invalidate();
}
function zoom(factor) {
    if (!available || mode !== '3d') return;
    camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, .6, 3.5); camera.updateProjectionMatrix(); invalidate();
}
function theme() {
    const dark = app.classList.toggle('theme-dark');
    $('theme').setAttribute('aria-pressed', String(dark)); $('theme').textContent = dark ? '浅色' : '深色';
    $('theme').setAttribute('aria-label', dark ? '切换浅色' : '切换深色');
    if (ambient) { ambient.intensity = dark ? 1.7 : 2.1; sunlight.intensity = dark ? 2.3 : 2.7; }
    invalidate();
}
try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8)); renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
    renderer.domElement.setAttribute('aria-label', '同一场景数据的可旋转三维预览'); viewport.prepend(renderer.domElement);
    scene = new THREE.Scene(); camera = new THREE.OrthographicCamera(-10, 10, 7, -7, .1, 100);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false; controls.enablePan = true; controls.screenSpacePanning = true;
    controls.minPolarAngle = .08; controls.maxPolarAngle = Math.PI * .42; controls.minZoom = .6; controls.maxZoom = 3.5;
    controls.rotateSpeed = .65; controls.zoomSpeed = .8;
    controls.touches.ONE = THREE.TOUCH.ROTATE; controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE; controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY; controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    controls.addEventListener('change', invalidate);
    ambient = new THREE.HemisphereLight('#ffffff', '#b4bdc8', 2.1); scene.add(ambient);
    sunlight = new THREE.DirectionalLight('#fff5e6', 2.7);
    sunlight.position.set(-5, 15, 10); sunlight.castShadow = true; sunlight.shadow.mapSize.set(2048, 2048);
    Object.assign(sunlight.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: .5, far: 45 });
    sunlight.shadow.normalBias = .023; sunlight.shadow.bias = -.00015; scene.add(sunlight);
    const fill = new THREE.DirectionalLight('#d6efff', .7); fill.position.set(8, 6, -7); scene.add(fill);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ opacity: .11 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.12; shadow.receiveShadow = true; scene.add(shadow);
    available = true;
    let start = null, dragged = false;
    const pointers = new Set();
    on(renderer.domElement, 'pointerdown', event => {
        pointers.add(event.pointerId);
        if (pointers.size === 1) { start = [event.clientX, event.clientY]; dragged = false; } else dragged = true;
    });
    on(renderer.domElement, 'pointermove', event => {
        if (start && Math.hypot(event.clientX - start[0], event.clientY - start[1]) > 5) dragged = true;
    });
    on(renderer.domElement, 'pointerup', event => {
        pointers.delete(event.pointerId);
        if (!dragged && start && event.button === 0) {
            const rect = renderer.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
            const ray = new THREE.Raycaster(); ray.params.Line.threshold = .06; ray.setFromCamera(mouse, camera);
            const hit = ray.intersectObjects(model.group.children, true).find(item => {
                const element = elements.get(item.object.userData.elementId);
                return element && !['wall', 'terrain'].includes(element.category);
            });
            select(hit?.object.userData.elementId);
        }
        if (!pointers.size) start = null;
    });
    on(renderer.domElement, 'pointercancel', event => { pointers.delete(event.pointerId); start = null; dragged = true; });
    on(renderer.domElement, 'webglcontextlost', event => { event.preventDefault(); fail3d('图形上下文已丢失，已回到现有二维地图。重新打开页面可重试三维。'); });
} catch (error) {
    console.error(error); fail3d('当前浏览器无法打开 WebGL；已显示插件现有二维地图。');
}
for (const item of fixtures) {
    const option = document.createElement('option'); option.value = item.id; option.textContent = item.scene.name;
    $('scene-picker').append(option);
}
loadScene(fixtures[0].id); setMode(available ? '3d' : '2d'); $('loading').hidden = true;
on($('scene-picker'), 'change', event => loadScene(event.target.value));
on($('object-list'), 'click', event => {
    const button = event.target.closest('button[data-element]'); if (button) select(button.dataset.element);
});
on(plan, 'click', event => {
    // MapViewport suppresses this bubbled click after a drag.
    const target = event.target.closest('.map-scene-element'); if (target) select(target.dataset.element);
});
on($('mode-3d'), 'click', () => setMode('3d')); on($('mode-2d'), 'click', () => setMode('2d'));
on($('theme'), 'click', theme);
on($('phone'), 'click', () => {
    const phone = app.classList.toggle('phone'); $('phone').setAttribute('aria-pressed', String(phone));
    $('phone').textContent = phone ? '还原' : '手机尺寸';
});
on($('zoom-in'), 'click', () => zoom(1.18)); on($('zoom-out'), 'click', () => zoom(1 / 1.18)); on($('reset'), 'click', reset);
on($('labels-toggle'), 'click', () => { labelsVisible = !labelsVisible; $('labels-toggle').setAttribute('aria-pressed', String(labelsVisible)); $('labels').hidden = !labelsVisible; });
on($('walls-toggle'), 'click', () => { lowWalls = !lowWalls; $('walls-toggle').setAttribute('aria-pressed', String(lowWalls)); invalidate(); });
function showObjects(open) {
    app.classList.toggle('objects-open', open); $('objects-toggle').setAttribute('aria-expanded', String(open));
    if (!open) $('objects-toggle').focus();
}
on($('objects-toggle'), 'click', () => showObjects(!app.classList.contains('objects-open')));
on($('objects-close'), 'click', () => showObjects(false));
on(app, 'keydown', event => { if (event.key === 'Escape' && app.classList.contains('objects-open')) showObjects(false); });
on(viewport, 'keydown', event => {
    if (event.target !== viewport || mode !== '3d' || !available) return;
    const deltas = { ArrowLeft: [-.15, 0], ArrowRight: [.15, 0], ArrowUp: [0, -.1], ArrowDown: [0, .1] };
    if (event.key === 'Home') reset();
    else if (event.key === '+' || event.key === '=') zoom(1.15);
    else if (event.key === '-') zoom(1 / 1.15);
    else if (deltas[event.key]) {
        const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
        spherical.theta += deltas[event.key][0];
        spherical.phi = THREE.MathUtils.clamp(spherical.phi + deltas[event.key][1], controls.minPolarAngle, controls.maxPolarAngle);
        camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical)); controls.update(); invalidate();
    } else return;
    event.preventDefault();
});
const observer = new ResizeObserver(resize); observer.observe(viewport);
on(document, 'visibilitychange', () => { if (document.hidden && animation) { cancelAnimationFrame(animation); animation = 0; } else invalidate(); });
function cleanup() {
    if (disposed) return;
    disposed = true; if (animation) cancelAnimationFrame(animation);
    observer.disconnect(); controls?.dispose(); model?.dispose(); planView.dispose();
    if (scene) scene.traverse(object => { if (object.isLight) object.shadow?.dispose(); });
    if (scene) for (const object of scene.children) if (object.isMesh) { object.geometry.dispose(); object.material.dispose(); }
    renderer?.dispose(); cleanups.splice(0).forEach(off => off());
}
on(window, 'pagehide', event => { if (!event.persisted) cleanup(); }); on(window, 'pageshow', invalidate);
