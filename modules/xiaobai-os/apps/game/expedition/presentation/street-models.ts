import { Vector3, type Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { LandscapeFeature, SuspendedDetail } from '../world/landscape.js';
import { LAND } from './world-palette.js';

/** Reused roofs, patched shutters and warm windows, not landmark-sized detached villas. */
export function streetHouse(k: SceneKit, base: Group, upper: Group, item: LandscapeFeature) {
    const { width, depth } = item.footprint, alongX = width >= depth;
    const count = item.entrance ? 1 : Math.max(1, Math.floor(Math.max(width, depth) / 5));
    k.mesh(base, 'box', LAND.mortar, [width, .4, depth], [0, .2, 0]);
    for (let i = 0; i < count; i++) {
        const w = alongX ? width / count : width, d = alongX ? depth : depth / count;
        const root = k.group(upper, [alongX ? -width / 2 + (i + .5) * w : 0, 0, alongX ? 0 : -depth / 2 + (i + .5) * d]);
        const h = (item.height ?? 4) + (i % 3 - 1) * .35, workshop = item.kind === 'workshop';
        k.mesh(root, 'box', i % 2 ? LAND.stone : LAND.cloth, [w - .15, h - .4, d - .15], [0, (h + .4) / 2, 0]);
        for (const x of [-w / 2 + .12, w / 2 - .12]) {
            k.mesh(root, 'box', LAND.timber, [.18, h, d], [x, h / 2, 0]);
        }
        for (const y of [.7, h - .3]) { k.mesh(root, 'box', LAND.wood, [w, .15, d], [0, y, 0]); }
        // Simple sloping metal sheets: strong roof silhouette, restrained seams.
        const roof = k.group(root, [0, h + .24, 0]); roof.rotation.x = -.18;
        const roofDepth = !alongX && count > 1 ? d - .03 : d + .7;
        k.mesh(roof, 'box', LAND.roof, [w + .6, .16, roofDepth]);
        for (let x = -w / 2; x <= w / 2; x += .8) { k.mesh(roof, 'box', LAND.roofLight, [.055, .07, roofDepth], [x, .12, 0]); }
        k.mesh(roof, 'box', LAND.brass, [w + .65, .12, .13], [0, .03, roofDepth / 2]);
        const front = k.group(root, [0, 0, d / 2]);
        const doorX = item.entrance ? 0 : -w * .19;
        k.mesh(front, 'box', LAND.shadow, [1.05, 2.1, .1], [doorX, 1.1, 0]);
        for (const x of [-.4, -.13, .14, .41]) { k.mesh(front, 'box', LAND.wood, [.24, 1.95, .12], [doorX + x, 1.06, .04]); }
        k.mesh(front, 'box', LAND.shadow, [.9, .9, .12], [w * .27, 2.25, .03]);
        k.mesh(front, 'box', LAND.ember, [.7, .67, .14], [w * .27, 2.25, .1], true);
        k.mesh(front, 'box', LAND.timber, [.07, .85, .16], [w * .27, 2.25, .15]);
        k.mesh(front, 'box', LAND.timber, [.85, .07, .16], [w * .27, 2.25, .15]);
        if (d >= 4 && (alongX || i === count - 1)) {
            const shade = k.group(front, [0, 2.8, .55]); shade.rotation.x = .22;
            k.mesh(shade, 'box', item.tint === 'rose' ? LAND.rose : LAND.cloth, [w * .8, .045, 1.6]);
            k.mesh(shade, 'box', LAND.light, [.55, .015, .45], [-w * .17, .035, .35]);
        }
        if (workshop) {
            k.mesh(root, 'box', LAND.wood, [w * .65, .2, .8], [0, 1.1, d / 2 - .5]);
            for (let j = 0; j < 3; j++) { k.mesh(root, 'cylinder', LAND.brass, [.18, .6, .18], [(j - 1) * .55, 1.4, d / 2 - .5]).rotation.z = Math.PI / 2; }
        } else {
            k.mesh(root, 'box', LAND.slate, [.6, h * .38, .7], [-w * .3, h + .55, -d * .2]);
            k.mesh(root, 'box', LAND.shadow, [.75, .15, .85], [-w * .3, h * 1.19 + .6, -d * .2]);
        }
    }
}

/** Upper rooms hang over a clear lane. All supports meet the existing wall, not the walking surface. */
export function wallHomes(k: SceneKit, root: Group, footprint: LandscapeFeature['footprint']) {
    const front = k.group(root, [footprint.width / 2 + .04, 0, 0]); front.rotation.y = Math.PI / 2;
    const w = Math.min(4.8, footprint.depth - .7);
    k.mesh(front, 'box', LAND.timber, [w, .16, 2.2], [0, 3.25, 1]);
    k.mesh(front, 'box', LAND.cloth, [w - .15, 2.35, 1.75], [0, 4.5, .86]);
    for (const x of [-w / 2 + .1, w / 2 - .1]) {
        k.mesh(front, 'box', LAND.timber, [.16, 2.5, 1.9], [x, 4.5, .9]);
        const strut = k.mesh(front, 'box', LAND.wood, [.15, 1, .15], [x, 3, .4]); strut.rotation.x = -.68;
    }
    k.mesh(front, 'box', LAND.shadow, [1.3, 1, .05], [0, 4.55, 1.76]);
    k.mesh(front, 'box', LAND.ember, [1.03, .77, .06], [0, 4.55, 1.8], true);
    k.mesh(front, 'box', LAND.timber, [.07, .95, .1], [0, 4.55, 1.85]);
    for (const x of [-.78, .78]) { k.mesh(front, 'box', LAND.wood, [.26, 1.15, .12], [x, 4.55, 1.83]); }
    const roof = k.group(front, [0, 5.8, 1.1]); roof.rotation.x = .14;
    k.mesh(roof, 'box', LAND.roof, [w + .45, .16, 2.5]);
    for (let x = -w / 2; x < w / 2; x += .6) { k.mesh(roof, 'box', LAND.roofLight, [.07, .1, 2.53], [x, .1, 0]); }
    k.mesh(front, 'box', LAND.wood, [1.2, 1.9, .08], [0, 1, .04]);
    k.mesh(front, 'box', LAND.timber, [.1, .4, .06], [.3, 1, .11]);
}

export function cookstove(k: SceneKit, root: Group) {
    k.mesh(root, 'box', LAND.mortar, [4, .2, 4], [0, .1, 0]);
    k.mesh(root, 'box', LAND.slate, [1.45, 1.1, 1.15], [0, .75, 0]);
    k.mesh(root, 'box', LAND.shadow, [.95, .55, .04], [0, .62, .59]);
    k.mesh(root, 'box', LAND.ember, [.62, .24, .05], [0, .52, .62], true);
    for (const x of [-.22, 0, .22]) { k.mesh(root, 'box', LAND.shadow, [.05, .48, .07], [x, .62, .67]); }
    k.mesh(root, 'cylinder', LAND.shadow, [.13, 2.5, .13], [-.48, 2.25, -.4]);
    k.mesh(root, 'cylinder', LAND.pottery, [.36, .48, .36], [.2, 1.52, 0]);
    k.mesh(root, 'cylinder', LAND.shadow, [.38, .07, .38], [.2, 1.79, 0]);
    for (let i = 0; i < 5; i++) { k.mesh(root, 'box', LAND.wood, [.8, .16, .2], [1.25, .3 + i % 3 * .18, -.5 + Math.floor(i / 3) * .24]); }
    k.mesh(root, 'cylinder', LAND.timber, [.38, .65, .38], [-1.15, .52, .5]);
    for (let i = 0; i < 5; i++) { k.mesh(root, 'rock', LAND.shadow, [.18, .16, .17], [-1.15 + Math.sin(i * 2) * .2, .87, .5 + Math.cos(i * 2) * .2]); }
}

export function medicineBench(k: SceneKit, root: Group, width: number, depth: number) {
    k.mesh(root, 'box', LAND.wood, [width, .16, depth], [0, 1, 0]);
    for (const x of [-1, 1]) { k.mesh(root, 'box', LAND.timber, [.18, 1, depth - .2], [x * (width / 2 - .2), .5, 0]); }
    k.mesh(root, 'box', LAND.cloth, [width * .4, .025, depth * .8], [-width * .2, 1.1, 0]);
    for (let i = 0; i < 5; i++) {
        k.mesh(root, 'cylinder', i % 2 ? LAND.pottery : LAND.slate, [.16, .32 + i % 2 * .15, .16], [width * .04 + i * .43, 1.28, -.3]);
        k.mesh(root, 'cylinder', LAND.wood, [.17, .055, .17], [width * .04 + i * .43, 1.47 + i % 2 * .075, -.3]);
    }
    for (let i = 0; i < 3; i++) { k.mesh(root, 'box', LAND.light, [.8, .12, .48], [-width * .25, 1.18 + i * .12, .12]); }
    k.mesh(root, 'cylinder', LAND.pottery, [.3, .18, .3], [width * .22, 1.19, .45]);
}

export function suspendedDetail(k: SceneKit, root: Group, item: SuspendedDetail) {
    const a = new Vector3(...item.from), b = new Vector3(...item.to), direction = b.clone().sub(a), length = direction.length();
    const pipe = item.kind === 'pipe', radius = pipe ? .23 : .018;
    const line = k.mesh(root, 'cylinder', pipe ? LAND.brass : LAND.timber, [radius, length, radius], a.clone().add(b).multiplyScalar(.5).toArray());
    line.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize());
    if (pipe) {
        for (let at = 1; at < length; at += 3.7) {
            const point = a.clone().addScaledVector(direction, at);
            const collar = k.mesh(root, 'cylinder', LAND.wood, [.28, .16, .28], point.toArray()); collar.quaternion.copy(line.quaternion);
            k.mesh(root, 'box', LAND.shadow, [.12, .65, .12], [point.x, point.y - .3, point.z]);
        }
    } else {
        for (let at = 2; at < length - 2; at += 1.9) {
            const point = a.clone().addScaledVector(direction, at), cloth = k.group(root, point.toArray());
            cloth.rotation.y = Math.atan2(direction.x, direction.z) + Math.PI / 2;
            k.shape(cloth, [[-.55, 0], [.55, 0], [.5, -1.05], [-.45, -1.12]], Math.floor(at) % 2 ? LAND.cloth : LAND.light);
            for (const side of [-1, 1]) { k.mesh(cloth, 'box', LAND.wood, [.07, .17, .06], [side * .42, -.02, .03]); }
        }
    }
}
