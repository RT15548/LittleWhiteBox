import * as THREE from 'three';
import { footprint, presentationKind } from './scene-data.js';
import { SVGLoader } from './vendor/SVGLoader.js';
import { isAreaElement, sceneElementPath } from '../../modules/xiaobai-os/apps/map/ui/scene-geometry.ts';
import { sortedSceneElements } from '../../modules/xiaobai-os/apps/map/ui/map-presentation.ts';

export const UNIT = 50;


// These are local visual recipes, not spatial facts or additions to the save.
function woodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#d0ae84'; ctx.fillRect(0, 0, 1024, 1024);
    let seed = 8217;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    for (let row = 0; row < 16; row++) {
        const y = row * 64;
        for (let col = -1; col < 4; col++) {
            const x = col * 320 + (row % 3) * 107;
            ctx.fillStyle = `hsl(34 33% ${68 + random() * 8}%)`; ctx.fillRect(x + 1, y + 1, 318, 62);
            ctx.strokeStyle = '#83614420'; ctx.strokeRect(x + 1, y + 1, 318, 62);
            for (let i = 0; i < 22; i++) {
                const gy = y + 3 + random() * 57;
                ctx.beginPath(); ctx.moveTo(x + 5, gy);
                ctx.bezierCurveTo(x + 100, gy - 1.5, x + 200, gy + 2, x + 312, gy);
                ctx.strokeStyle = `rgba(100,70,40,${.035 + random() * .055})`; ctx.lineWidth = .6 + random(); ctx.stroke();
            }
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
    return texture;
}

function roundedGeometry(w, h, d, radius = .045) {
    const b = Math.min(radius, w / 5, h / 5, d / 5);
    const shape = new THREE.Shape();
    const x = w / 2 - b, y = d / 2 - b;
    shape.moveTo(-x, -y); shape.lineTo(x, -y); shape.lineTo(x, y); shape.lineTo(-x, y); shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: h - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 3, steps: 1, curveSegments: 1 });
    g.translate(0, 0, -(h - 2 * b) / 2); g.rotateX(-Math.PI / 2);
    g.computeVertexNormals();
    return g;
}

export function createRoomModel(data) {
    const group = new THREE.Group();
    const [vx, vy, vw, vh] = data.viewBox;
    const worldPoint = (x, y, height = 0) => new THREE.Vector3((x - vx - vw / 2) / UNIT, height, (y - vy - vh / 2) / UNIT);
    const loader = new SVGLoader();
    const objects = new Map();
    const walls = [];
    const labelAnchors = new Map();
    const textures = [woodTexture()];
    const materials = {};
    const mat = (key, color, roughness = .82) => {
        const material = new THREE.MeshStandardMaterial({ color, roughness });
        materials[key] = material;
        return material;
    };
    mat('wall', '#edece4'); mat('trim', '#d6dace'); mat('wood', '#b48b5f'); mat('woodLight', '#d3af7f');
    mat('woodDark', '#826647'); mat('fabric', '#7c9988'); mat('fabricLight', '#a9b9a6'); mat('seat', '#dedccd');
    mat('rug', '#d6d4c4'); mat('rugLine', '#b5b7a7'); mat('terracotta', '#ba795c'); mat('pot', '#e3dacc');
    mat('leaf', '#688b66'); mat('leafLight', '#93a679'); mat('trunk', '#786145'); mat('metal', '#424d46', .45);
    mat('blue', '#347db2', .45); mat('white', '#fffdf4'); mat('bookBlue', '#677d82'); mat('bookRust', '#ad7960');
    mat('bookCream', '#e9e0cb'); mat('bookOlive', '#8c9979'); mat('base', '#d7ddcf');
    materials.floor = new THREE.MeshStandardMaterial({ map: textures[0], color: '#ffffff', roughness: .82 });

    const colors = { metal: '#a8bccb', glass: '#a2d6df', stone: '#b4b8c3', fabric: '#b6b6d3', grass: '#b8caa7', forest: '#8fad93', water: '#7cbecb', dirt: '#c4ae89', sand: '#d4c69d', carpet: '#ccd3c2' };
    for (const [key, color] of Object.entries(colors)) {
        const material = mat('surface-' + key, color, key === 'metal' || key === 'glass' ? .35 : .85);
        if (key === 'metal') material.metalness = .45;
    }
    const surfaceMaterial = element => materials['surface-' + element.material] || materials.woodLight;
    const lineMaterial = new THREE.LineBasicMaterial({ color: '#627f8d' });
    const abstractLine = new THREE.LineBasicMaterial({ color: '#6b7285' });
    const extraMaterials = [lineMaterial, abstractLine];
    const boxCache = new Map();
    function box(parent, w, h, d, x, y, z, material, radius = 0) {
        const key = [w, h, d, radius].join(':');
        if (!boxCache.has(key)) boxCache.set(key, radius ? roundedGeometry(w, h, d, radius) : new THREE.BoxGeometry(w, h, d));
        const mesh = new THREE.Mesh(boxCache.get(key), material);
        mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
    }
    function cylinder(parent, r1, r2, h, x, y, z, material, count = 28) {
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, count), material);
        mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
    }
    function sphere(parent, x, y, z, sx, sy, sz, material) {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), material);
        mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
    }
    function legs(parent, w, d, height, thickness = .07, material = materials.woodDark) {
        for (const x of [-1, 1]) for (const z of [-1, 1]) box(parent, thickness, height, thickness, x * (w / 2 - .13), height / 2, z * (d / 2 - .13), material, .008);
    }
    function table(parent, element, w, d) {
        // A single proportional recipe; no height inferred from the object's name.
        const h = Math.min(.82, Math.min(w, d) * .43);
        if (element.shape === 'circle') {
            cylinder(parent, w / 2, w / 2, .105, 0, h, 0, materials.woodLight, 64);
            cylinder(parent, .16 * w, .23 * w, h - .06, 0, (h - .06) / 2, 0, materials.wood, 32);
            cylinder(parent, .24 * w, .26 * w, .07, 0, .055, 0, materials.woodDark, 32);
        } else {
            box(parent, w, .11, d, 0, h, 0, materials.woodLight, .035);
            legs(parent, w, d, h - .04, .085);
            box(parent, w - .22, .08, d - .28, 0, .2, 0, materials.wood, .025);
        }
        return h + .12;
    }
    function chair(parent, element, w, d) {
        const fabric = element.material === 'fabric';
        const h = Math.min(w, d) * .57;
        const seat = fabric ? materials.fabricLight : materials.seat;
        legs(parent, w * .9, d * .94, h, .065);
        box(parent, w * .92, fabric ? .18 : .11, d * .8, 0, h, d * .07, seat, .045);
        box(parent, w, h * .66, .13, 0, h * 1.49, -d * .39, fabric ? materials.fabric : materials.wood, .045);
        if (fabric) for (const side of [-1, 1]) box(parent, .1, .21, d * .67, side * w * .44, h + .17, .01, materials.fabric, .025);
        return h * 1.83;
    }
    function sofa(parent, w, d) {
        const h = d * .42;
        legs(parent, w, d, .18, .09);
        box(parent, w, .3, d * .95, 0, h - .09, 0, materials.fabric, .07);
        box(parent, w, .59, d * .17, 0, h + .26, -d * .405, materials.fabric, .07);
        for (const side of [-1, 1]) box(parent, .22, .4, d * .95, side * (w / 2 - .11), h + .08, 0, materials.fabric, .06);
        const seatW = (w - .52) / 3;
        for (let i = 0; i < 3; i++) {
            const x = (i - 1) * (seatW + .025);
            box(parent, seatW, .18, d * .65, x, h + .075, d * .1, materials.fabricLight, .055);
            const back = box(parent, seatW, .4, .17, x, h + .36, -d * .25, materials.fabricLight, .05);
            back.rotation.x = -.12;
        }
        const cushion = box(parent, .39, .34, .13, -w * .3, h + .35, .02, materials.seat, .055);
        cushion.rotation.z = -.22; cushion.rotation.x = -.2;
        const other = box(parent, .35, .36, .14, w * .31, h + .33, .04, materials.terracotta, .05);
        other.rotation.z = .18; other.rotation.x = -.2;
        return h + .65;
    }
    function shelf(parent, w, d) {
        const h = d * 2.6;
        box(parent, w, h, .055, 0, h / 2, -d / 2 + .028, materials.woodDark);
        for (const side of [-1, 1]) box(parent, .065, h, d, side * (w / 2 - .035), h / 2, 0, materials.wood);
        for (let row = 0; row < 4; row++) box(parent, w, .065, d, 0, .07 + row * (h - .09) / 3, 0, materials.woodLight);
        const bookMats = [materials.bookBlue, materials.bookCream, materials.bookOlive, materials.bookRust];
        for (let row = 0; row < 3; row++) for (let i = 0; i < 12; i++) {
            if ((i + row * 3) % 8 === 7) continue;
            const bh = (h / 3) * (.53 + ((i * 7 + row * 3) % 5) * .07);
            const x = -w / 2 + .16 + i * (w - .25) / 12;
            const book = box(parent, .105 + i % 3 * .013, bh, d * .7, x, .115 + row * (h - .09) / 3 + bh / 2, .02, bookMats[(row + i) % 4], .004);
            if (i % 6 === 5) book.rotation.z = -.13;
        }
        return h + .08;
    }
    function counter(parent, w, d) {
        const h = d * 1.22;
        legs(parent, w, d, .15, .08);
        box(parent, w, h - .15, d, 0, .15 + (h - .15) / 2, 0, materials.wood, .02);
        box(parent, w + .015, .07, d + .02, 0, h + .02, 0, materials.woodLight, .018);
        for (let i = 0; i < 3; i++) {
            const x = (i - 1) * w / 3;
            box(parent, w / 3 - .035, h - .24, .035, x, h / 2 + .055, d / 2 + .014, materials.woodLight, .008);
            box(parent, .19, .025, .025, x, h * .74, d / 2 + .04, materials.metal, .005);
        }
        return h + .09;
    }
    function plant(parent, w) {
        const r = w * .27;
        cylinder(parent, r, r * .72, w * .48, 0, w * .24, 0, materials.pot);
        cylinder(parent, r * 1.04, r * 1.04, .065, 0, w * .47, 0, materials.pot);
        cylinder(parent, r * .86, r * .86, .015, 0, w * .483, 0, materials.woodDark);
        cylinder(parent, .025, .038, w * 1.2, 0, w * 1.02, 0, materials.trunk, 9);
        for (let i = 0; i < 11; i++) {
            const a = i * 2.399, y = w * (.64 + i * .074);
            const leaf = sphere(parent, Math.cos(a) * w * .18, y, Math.sin(a) * w * .18, w * .16, w * .07, w * .3, i % 3 ? materials.leaf : materials.leafLight);
            leaf.rotation.y = -a + Math.PI / 2; leaf.rotation.z = .35;
        }
        return w * 1.65;
    }

    function pathsFor(element) {
        const d = sceneElementPath(element);
        return d ? loader.parse('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + d + '"/></svg>').paths : [];
    }
    function contour(parent, element, fp, height, material) {
        const paths = pathsFor(element);
        for (const path of paths) for (const subpath of path.subPaths) {
            const points = subpath.getPoints(20);
            if (subpath.autoClose && points.length && !points[0].equals(points.at(-1))) points.push(points[0].clone());
            const geo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3((p.x - fp.x) / UNIT, height, (p.y - fp.y) / UNIT)));
            const line = new THREE.Line(geo, material);
            parent.add(line);
        }
    }
    function area(parent, element, fp, height, top = height) {
        for (const path of pathsFor(element)) for (const shape of SVGLoader.createShapes(path)) {
            const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 24, steps: 1 });
            // SVG x/y -> world x/z, extruded down from the top; preserve front-face winding.
            geo.scale(1 / UNIT, 1 / UNIT, 1); geo.rotateX(Math.PI / 2);
            geo.translate(-fp.x / UNIT, top, -fp.y / UNIT);
            const mesh = new THREE.Mesh(geo, surfaceMaterial(element));
            mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
        }
    }
    for (const [index, element] of sortedSceneElements(data.elements).entries()) {
        const fp = footprint(element), kind = presentationKind(element);
        const parent = new THREE.Group();
        parent.position.copy(worldPoint(fp.x, fp.y, .012 + index * .002));
        parent.rotation.y = -(element.rotation || 0) * Math.PI / 180;
        group.add(parent); objects.set(element.id, parent);
        const w = fp.width / UNIT, d = fp.depth / UNIT;
        let height = .035;
        if (kind === 'wall') {
            for (const path of pathsFor(element)) for (const subpath of path.subPaths) {
                const points = subpath.getPoints(16);
                if (subpath.autoClose && !points[0].equals(points.at(-1))) points.push(points[0].clone());
                for (let i = 1; i < points.length; i++) {
                    const a = new THREE.Vector3((points[i - 1].x - fp.x) / UNIT, 0, (points[i - 1].y - fp.y) / UNIT);
                    const b = new THREE.Vector3((points[i].x - fp.x) / UNIT, 0, (points[i].y - fp.y) / UNIT);
                    const delta = b.clone().sub(a), length = delta.length();
                    if (!length) continue;
                    const part = new THREE.Group();
                    const mid = a.clone().add(b).multiplyScalar(.5);
                    part.position.copy(mid); part.rotation.y = -Math.atan2(delta.z, delta.x);
                    box(part, length, 1, .10, 0, .5, 0, element.material === 'metal' ? surfaceMaterial(element) : materials.wall);
                    box(part, length, .035, .115, 0, 1, 0, materials.trim);
                    parent.add(part);
                    const rotation = new THREE.Matrix4().makeRotationY(parent.rotation.y);
                    const normal = new THREE.Vector3(-delta.z, 0, delta.x).normalize().applyMatrix4(rotation);
                    const midpoint = mid.clone().applyMatrix4(rotation).add(parent.position);
                    if (normal.dot(midpoint) < 0) normal.negate();
                    walls.push({ part, normal });
                }
            }
        } else if (kind === 'marker') {
            const actor = element.category === 'actor';
            cylinder(parent, .20, .20, .045, 0, .025, 0, actor ? materials.blue : materials.metal, 40);
            if (actor) {
                cylinder(parent, .085, .11, .22, 0, .17, 0, materials.blue);
                sphere(parent, 0, .36, 0, .095, .095, .095, materials.white);
                height = .5;
            } else height = .08;
        } else if (kind === 'model') {
            if (element.icon === 'sofa') height = sofa(parent, w, d);
            else if (element.icon === 'chair') height = chair(parent, element, w, d);
            else if (element.icon === 'table') height = table(parent, element, w, d);
            else if (element.icon === 'shelf') height = shelf(parent, w, d);
            else if (element.icon === 'counter') height = counter(parent, w, d);
            else if (element.icon === 'tree') height = plant(parent, Math.min(w, d));
            if (element.material === 'metal' || element.material === 'glass') {
                parent.traverse(child => { if (child.isMesh) child.material = surfaceMaterial(element); });
            }
        } else if (kind === 'footprint') {
            height = .20; area(parent, element, fp, height);
            contour(parent, element, fp, height + .006, abstractLine);
        } else if (isAreaElement(element)) {
            if (element.shape === 'rect' && element.material === 'wood') {
                box(parent, w, .07, d, 0, -.035, 0, materials.floor);
            } else area(parent, element, fp, .014, 0);
        } else {
            contour(parent, element, fp, .025, lineMaterial);
        }
        const opacity = element.certainty === 'unknown' ? .48 : element.certainty === 'inferred' ? .72 : 1;
        const certaintyMaterials = new Map();
        parent.traverse(child => {
            if (child.isMesh || child.isLine) {
                child.userData.elementId = element.id;
                if (opacity < 1) {
                    if (!certaintyMaterials.has(child.material)) {
                        const clone = child.material.clone(); clone.transparent = true; clone.opacity = opacity;
                        certaintyMaterials.set(child.material, clone); extraMaterials.push(clone);
                    }
                    child.material = certaintyMaterials.get(child.material);
                }
            }
        });
        if (element.label || !['surface', 'wall'].includes(kind)) {
            labelAnchors.set(element.id, worldPoint(fp.x, fp.y, parent.position.y + height + .17));
        }
    }
    const highlight = new THREE.Group(); group.add(highlight);
    const highlightMaterial = new THREE.LineBasicMaterial({ color: '#117b91', depthTest: false });
    extraMaterials.push(highlightMaterial);
    function select(element) {
        while (highlight.children.length) { const child = highlight.children[0]; child.geometry.dispose(); highlight.remove(child); }
        if (!element) return;
        const fp = footprint(element);
        highlight.position.copy(objects.get(element.id).position);
        highlight.rotation.y = -(element.rotation || 0) * Math.PI / 180;
        if (presentationKind(element) === 'marker') {
            const points = Array.from({ length: 65 }, (_, i) => new THREE.Vector3(Math.cos(i * Math.PI / 32) * .30, .06, Math.sin(i * Math.PI / 32) * .30));
            highlight.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), highlightMaterial));
        } else contour(highlight, element, fp, .24, highlightMaterial);
        highlight.children.forEach(child => { child.renderOrder = 100; });
    }
    function updateWalls(camera, target, low) {
        const direction = camera.position.clone().sub(target); direction.y = 0; direction.normalize();
        for (const wall of walls) wall.part.scale.y = low ? .16 : wall.normal.dot(direction) > .15 ? .20 : 1.4;
    }
    function dispose() {
        const geometries = new Set(); group.traverse(object => { if (object.geometry) geometries.add(object.geometry); });
        geometries.forEach(g => g.dispose()); Object.values(materials).forEach(m => m.dispose());
        extraMaterials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
    }
    return { group, objects, labelAnchors, select, updateWalls, dispose, span: Math.hypot(vw, vh) / UNIT };
}
