import { Euler } from 'three/src/math/Euler.js';
import { IcosahedronGeometry } from 'three/src/geometries/IcosahedronGeometry.js';
import { Matrix4 } from 'three/src/math/Matrix4.js';
import { Quaternion } from 'three/src/math/Quaternion.js';
import { Vector3 } from 'three/src/math/Vector3.js';

const SVG = 'http://www.w3.org/2000/svg';
const LIGHT = new Vector3(-.8, 1.2, 1.4).normalize();
const HALF_LIGHT = LIGHT.clone().add(new Vector3(0, 0, 1)).normalize();
// SVG paint references are unique across simultaneously mounted historical cards.
let nextPaintId = 0;
const geometry = new IcosahedronGeometry(1, 0);
const positions = geometry.getAttribute('position');
const faces = Array.from({ length: 20 }, (_, index) => {
    const points = [0, 1, 2].map(offset => new Vector3().fromBufferAttribute(positions, index * 3 + offset));
    const center = points.reduce((sum, point) => sum.add(point), new Vector3()).multiplyScalar(1 / 3);
    const normal = center.clone().normalize();
    const up = points[0].clone().sub(center).normalize();
    const right = up.clone().cross(normal).normalize();
    const inset = points.map(point => point.clone().lerp(center, .16));
    const bevelNormals = points.map((point, edge) => point.clone().add(points[(edge + 1) % 3])
        .multiplyScalar(.5).sub(center).normalize().multiplyScalar(.72).addScaledVector(normal, .7).normalize());
    return { points, inset, bevelNormals, center, normal, up, right, value: 0 };
});
geometry.dispose();
let number = 1;
for (const face of faces) {
    if (face.value) { continue; }
    face.value = number;
    const opposite = faces.find(other => other.normal.dot(face.normal) < -.999);
    if (opposite) { opposite.value = 21 - number; }
    number++;
}

function svg<K extends keyof SVGElementTagNameMap>(name: K, attributes: Record<string, string> = {}): SVGElementTagNameMap[K] {
    const element = document.createElementNS(SVG, name);
    for (const [key, value] of Object.entries(attributes)) { element.setAttribute(key, value); }
    return element;
}
function project(point: Vector3): [number, number] {
    const scale = 61 / (1 - point.z * .12);
    return [80 + point.x * scale, 77 - point.y * scale];
}
function polygonPoints(points: Vector3[]): string {
    return points.map(point => project(point).join(',')).join(' ');
}

/** A cool key light and a narrow reflection distinguish metal from diffuse white paint. */
function metalColor(normal: Vector3, silver: boolean, reflection = 0): string {
    const light = Math.max(0, normal.dot(LIGHT));
    const specular = Math.pow(Math.max(0, normal.dot(HALF_LIGHT)), silver ? 12 : 18);
    const base = silver ? [63, 72, 84] : [25, 33, 44];
    const diffuse = silver ? 125 : 28;
    const highlight = silver ? 95 : 100;
    return `rgb(${base.map(channel => Math.round(Math.min(255,
        channel + light * diffuse + (specular + reflection) * highlight))).join(',')})`;
}

/**
 * A real twenty-face solid, lit and projected using Three's geometry and rotations.
 * SVG keeps historical dice static without a WebGL context, texture cache or render loop per message.
 */
export function createD20(value: number) {
    const result = faces.find(face => face.value === value);
    if (!result) { throw new Error('D20 result must be between 1 and 20.'); }
    const rest = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(result.right, result.up, result.normal)).invert();
    const tilt = new Quaternion().setFromEuler(new Euler(-.07, .12, -.07));
    const element = svg('svg', { viewBox: '0 0 160 160', 'aria-hidden': 'true', focusable: 'false' });
    element.classList.add('xb-dice-solid');
    const paintId = `xb-d20-${++nextPaintId}`;
    const definitions = svg('defs');
    const gold = svg('linearGradient', { id: `${paintId}-gold`, x1: '0', y1: '0', x2: '.25', y2: '1' });
    for (const [offset, color] of [['0', '#fff2ce'], ['.45', '#e7d3a1'], ['1', '#ba9b63']]) {
        gold.append(svg('stop', { offset, 'stop-color': color }));
    }
    // The top cut casts a shadow inside the glyph; the lower cut catches the key light.
    const engraving = svg('filter', { id: `${paintId}-engraving`, 'color-interpolation-filters': 'sRGB' });
    engraving.append(
        svg('feOffset', { in: 'SourceAlpha', dx: '.3', dy: '.8', result: 'lower' }),
        svg('feComposite', { in: 'SourceAlpha', in2: 'lower', operator: 'out', result: 'upper-cut' }),
        svg('feFlood', { 'flood-color': '#0a1019', 'flood-opacity': '.9', result: 'dark' }),
        svg('feComposite', { in: 'dark', in2: 'upper-cut', operator: 'in', result: 'cut-shadow' }),
        svg('feOffset', { in: 'SourceAlpha', dx: '-.15', dy: '-.4', result: 'upper' }),
        svg('feComposite', { in: 'SourceAlpha', in2: 'upper', operator: 'out', result: 'lower-cut' }),
        svg('feFlood', { 'flood-color': '#fff5d9', result: 'bright' }),
        svg('feComposite', { in: 'bright', in2: 'lower-cut', operator: 'in', result: 'cut-light' }),
    );
    const engravingLayers = svg('feMerge');
    for (const input of ['SourceGraphic', 'cut-shadow', 'cut-light']) { engravingLayers.append(svg('feMergeNode', { in: input })); }
    engraving.append(engravingLayers);
    definitions.append(gold, engraving);
    const shadow = svg('ellipse', { cx: '80', cy: '143', rx: '40', ry: '5', fill: '#080e17', opacity: '.3' });
    shadow.style.filter = 'blur(3px)';
    const body = svg('g');
    const surfaces = faces.map((face, index) => {
        const group = svg('g');
        const paint = svg('linearGradient', { id: `${paintId}-face-${index}`, gradientUnits: 'userSpaceOnUse' });
        const stops = ['0', '.38', '.5', '.64', '1'].map(offset => svg('stop', { offset }));
        paint.append(...stops); definitions.append(paint);
        const shell = svg('polygon', { fill: '#384555', 'stroke-width': '.5', 'stroke-linejoin': 'round' });
        const bevels = [0, 1, 2].map(() => svg('polygon', { 'stroke-width': '.25', 'stroke-linejoin': 'round' }));
        const surface = svg('polygon', { fill: `url(#${paint.id})`, stroke: '#111821', 'stroke-width': '.8', 'stroke-linejoin': 'round' });
        const rim = svg('polygon', { fill: 'none', stroke: '#c4d0df', 'stroke-opacity': '.35', 'stroke-width': '.5' });
        // Filter the projected glyph, not sub-pixel font units, to keep small labels crisp.
        const lettering = svg('g', { filter: `url(#${engraving.id})` });
        const label = svg('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': '.36',
            'font-weight': '700', 'font-family': 'Georgia, "Times New Roman", serif', fill: `url(#${gold.id})`,
            stroke: '#0b111a', 'stroke-width': '.012', 'stroke-linejoin': 'round', 'paint-order': 'stroke fill' });
        label.textContent = String(face.value);
        lettering.append(label);
        group.append(shell, ...bevels, surface, rim, lettering); body.append(group);
        return { group, shell, surface, bevels, rim, label, paint, stops };
    });
    element.append(definitions, shadow, body);

    function draw(progress: number, revealed = false): void {
        const t = Math.max(0, Math.min(1, progress));
        const remaining = Math.pow(1 - Math.min(1, t / .84), 2.6);
        const rotation = new Quaternion().setFromEuler(new Euler(-remaining * Math.PI * 5, remaining * Math.PI * 3.3, remaining * .7))
            .multiply(tilt).multiply(rest);
        const hop = (1 - t) * (8 + Math.abs(Math.sin(t * Math.PI * 3)) * 15);
        body.setAttribute('transform', `translate(0 ${-hop})`);
        shadow.setAttribute('opacity', String(.3 - hop / 150));
        shadow.setAttribute('rx', String(40 - hop / 3));
        faces.forEach((face, index) => {
            const { group, shell, surface, bevels, rim, label, paint, stops } = surfaces[index];
            const normal = face.normal.clone().applyQuaternion(rotation);
            group.style.display = normal.z > .015 ? '' : 'none';
            if (normal.z <= .015) { return; }
            const center = face.center.clone().applyQuaternion(rotation);
            const points = face.points.map(point => point.clone().applyQuaternion(rotation));
            const inset = face.inset.map(point => point.clone().applyQuaternion(rotation));
            shell.setAttribute('points', polygonPoints(points));
            shell.setAttribute('stroke', metalColor(normal, true));
            surface.setAttribute('points', polygonPoints(inset));
            rim.setAttribute('points', polygonPoints(inset.map(point => point.clone().lerp(center, .045))));
            bevels.forEach((bevel, edge) => {
                const next = (edge + 1) % 3;
                bevel.setAttribute('points', polygonPoints([points[edge], points[next], inset[next], inset[edge]]));
                const color = metalColor(face.bevelNormals[edge].clone().applyQuaternion(rotation), true);
                bevel.setAttribute('fill', color); bevel.setAttribute('stroke', color);
            });
            const origin = project(center);
            // A fixed studio reflection sweeps across each face as its normal turns.
            paint.setAttribute('x1', String(origin[0] - 35)); paint.setAttribute('y1', String(origin[1] - 50));
            paint.setAttribute('x2', String(origin[0] + 25)); paint.setAttribute('y2', String(origin[1] + 45));
            const reflection = .24 + .76 * Math.pow(Math.max(0, normal.dot(HALF_LIGHT)), 8);
            const band = .43 + normal.x * .22 - normal.y * .18;
            [0, .05, .85, .03, 0].forEach((gain, stop) => stops[stop].setAttribute('stop-color', metalColor(normal, false, gain * reflection)));
            stops[1].setAttribute('offset', String(band - .12)); stops[2].setAttribute('offset', String(band));
            stops[3].setAttribute('offset', String(band + .14));
            const right = project(center.clone().add(face.right.clone().applyQuaternion(rotation).multiplyScalar(.1)));
            const down = project(center.clone().add(face.up.clone().applyQuaternion(rotation).multiplyScalar(-.1)));
            label.setAttribute('transform', `matrix(${(right[0] - origin[0]) * 10} ${(right[1] - origin[1]) * 10} ${(down[0] - origin[0]) * 10} ${(down[1] - origin[1]) * 10} ${origin[0]} ${origin[1]})`);
            label.setAttribute('font-size', revealed && face.value === value ? '.47' : '.34');
            label.setAttribute('opacity', String(.32 + normal.z * .68));
        });
    }
    return { element, draw };
}
