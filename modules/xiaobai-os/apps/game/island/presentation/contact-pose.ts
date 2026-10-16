import * as T from 'three';
import authored from '../assets/characters/embrace-pose.json';
import { reachLimb } from './limb-ik.js';
import type { ContactForm } from '../model.js';

type Side = 'L' | 'R';
type Surface = { mesh: T.Mesh; indices: [number, number, number]; weights: T.Vector3 };
export interface ContactPose {
    height: number;
    root: T.Object3D;
    mouth(): T.Vector3;
    alignFace(target: T.Vector3, weight: number): void;
    invalidate(): void;
    reset(): void;
    prepare(weight: number, upper: boolean, form: ContactForm, partnerHeight: number): void;
    contact(side: Side, upper: boolean): { point: T.Vector3; normal: T.Vector3; along: T.Vector3 };
    reach(partner: ContactPose, weight: number, upper: boolean, form: ContactForm): void;
}
const smooth = (value: number) => T.MathUtils.smoothstep(value, 0, 1);
const basis = (along: T.Vector3, normal: T.Vector3) => {
    const across = along.clone().cross(normal).normalize();
    return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(across, along, across.clone().cross(along).normalize()));
};

export function createContactPose(root: T.Object3D, body: T.Object3D, bone: (name: string) => T.Bone, height: number): ContactPose {
    const originals = new Map<T.Bone, T.Quaternion>(), surfaces = new Map<string, Surface>();
    const rotations = { lower: Object.entries(authored.lower), upper: Object.entries(authored.upper) };
    const arms = (['L', 'R'] as const).map(side => ({ side, upper: bone(`upperarm01.${side}`), middle: bone(`lowerarm01.${side}`), wrist: bone(`wrist.${side}`) }));
    const palms = new Map<Side, { offset: T.Vector3; basis: T.Quaternion }>();
    let mouthSurface: { mesh: T.Mesh; indices: number[] }[] | null = null;
    function mouth() {
        if (!mouthSurface) {
            const candidates: { mesh: T.Mesh; index: number; pigment: number }[] = [];
            body.traverse(object => {
                if (!(object instanceof T.Mesh) || !object.geometry.getAttribute('color')) { return; }
                let owner: T.Object3D | null = object;
                while (owner && !owner.userData.asset_role) { owner = owner.parent; }
                if (owner?.userData.asset_role !== 'body.skin') { return; }
                const colors = object.geometry.getAttribute('color');
                for (let index = 0; index < colors.count; index++) {
                    const point = root.worldToLocal(object.getVertexPosition(index, new T.Vector3()).applyMatrix4(object.matrixWorld));
                    if (point.y > height * .83 && Math.abs(point.x) < .045 && point.z > 0) {
                        candidates.push({ mesh: object, index, pigment: colors.getX(index) / colors.getY(index) });
                    }
                }
            });
            // Lip pigment is authored in face.py from the two MakeHuman lip supports.
            // Use the actual painted surface rather than a height-proportional head point.
            const peak = Math.max(...candidates.map(c => c.pigment));
            mouthSurface = [...new Set(candidates.map(c => c.mesh))].map(mesh => ({ mesh,
                indices: candidates.filter(c => c.mesh === mesh && c.pigment >= peak * .96).map(c => c.index) }));
            if (!mouthSurface.some(s => s.indices.length)) { throw new Error('island_contact_mouth_surface'); }
        }
        const result = new T.Vector3(); let count = 0;
        for (const surface of mouthSurface) { for (const i of surface.indices) { result.add(surface.mesh.getVertexPosition(i, new T.Vector3()).applyMatrix4(surface.mesh.matrixWorld)); count++; } }
        return result.divideScalar(count);
    }
    function remember(joint: T.Bone) { if (!originals.has(joint)) { originals.set(joint, joint.quaternion.clone()); } }
    function turn(name: string, axis: T.Vector3, radians: number) {
        const joint = bone(name); remember(joint);
        const worldAxis = axis.applyQuaternion(root.getWorldQuaternion(new T.Quaternion()));
        const desired = new T.Quaternion().setFromAxisAngle(worldAxis, radians).multiply(joint.getWorldQuaternion(new T.Quaternion()));
        joint.quaternion.copy(joint.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(desired));
        root.updateMatrixWorld(true);
    }
    function handAt(arm: typeof arms[number], target: T.Vector3, weight: number) {
        for (const joint of [arm.upper, arm.middle, arm.wrist]) { remember(joint); }
        const sign = arm.side === 'L' ? 1 : -1;
        const start = arm.wrist.getWorldPosition(new T.Vector3());
        const point = start.lerp(target, smooth(weight));
        const pole = root.localToWorld(new T.Vector3(sign * .35, height * .57, .2));
        reachLimb(arm.upper, arm.middle, arm.wrist, point, pole);
        root.updateMatrixWorld(true);
    }
    function capturePalms() {
        if (palms.size) { return; }
        root.updateMatrixWorld(true);
        for (const arm of arms) {
            const wrist = arm.wrist.getWorldPosition(new T.Vector3()), inv = arm.wrist.getWorldQuaternion(new T.Quaternion()).invert();
            const finger = (digit: number) => bone(`finger${digit}-1.${arm.side}`).getWorldPosition(new T.Vector3()).sub(wrist).applyQuaternion(inv);
            const middle = finger(3), along = middle.clone().normalize(), across = finger(5).sub(finger(2)).normalize();
            const normal = along.clone().cross(across).normalize();
            // Reference palm normal points inward toward the thigh in the relaxed stance.
            const rootNormal = normal.clone().applyQuaternion(arm.wrist.getWorldQuaternion(new T.Quaternion())).applyQuaternion(root.getWorldQuaternion(new T.Quaternion()).invert());
            if (rootNormal.x * (arm.side === 'L' ? 1 : -1) > 0) { normal.negate(); }
            palms.set(arm.side, { offset: middle.multiplyScalar(.55), basis: basis(along, normal) });
        }
    }
    function palmAt(arm: typeof arms[number], point: T.Vector3, normal: T.Vector3, weight: number) {
        const palm = palms.get(arm.side)!;
        const rotation = basis(new T.Vector3(0, -1, 0), normal).multiply(palm.basis.clone().invert());
        const handRotation = arm.wrist.getWorldQuaternion(new T.Quaternion()).slerp(rotation, smooth(weight));
        handAt(arm, point.clone().sub(palm.offset.clone().applyQuaternion(rotation)), weight);
        arm.wrist.quaternion.copy(arm.wrist.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(handRotation));
        arm.wrist.updateMatrixWorld(true);
    }
    function contact(side: Side, upper: boolean) {
        const key = `${side}:${upper}`, sign = side === 'L' ? 1 : -1;
        let surface = surfaces.get(key);
        if (!surface) {
            const meshes: T.Mesh[] = [];
            body.traverseVisible(object => {
                if (!(object instanceof T.Mesh)) { return; }
                let owner: T.Object3D | null = object;
                while (owner && !owner.userData.asset_role && !owner.userData.garment_id) { owner = owner.parent; }
                if (owner?.userData.asset_role !== 'body.skin' && !['shirt', 'lifejacket'].includes(owner?.userData.garment_id)) { return; }
                if (object instanceof T.SkinnedMesh) { object.computeBoundingBox(); object.computeBoundingSphere(); }
                meshes.push(object);
            });
            const from = root.localToWorld(new T.Vector3(-sign * .095, height * (upper ? .77 : .69) + (side === 'L' ? .055 : 0), -1));
            const direction = new T.Vector3(0, 0, 1).applyQuaternion(root.getWorldQuaternion(new T.Quaternion()));
            const hit = new T.Raycaster(from, direction, 0, 1.5).intersectObjects(meshes, false)[0];
            if (!hit?.face || !(hit.object instanceof T.Mesh)) { throw new Error('island_contact_contact_missing'); }
            const mesh = hit.object, indices: Surface['indices'] = [hit.face.a, hit.face.b, hit.face.c];
            const vertices = indices.map(i => mesh.getVertexPosition(i, new T.Vector3()));
            const weights = T.Triangle.getBarycoord(mesh.worldToLocal(hit.point.clone()), vertices[0], vertices[1], vertices[2], new T.Vector3());
            if (!weights) { throw new Error('island_contact_contact_degenerate'); }
            surface = { mesh, indices, weights }; surfaces.set(key, surface);
        }
        const point = new T.Vector3(), v = new T.Vector3();
        surface.indices.forEach((index, i) => point.addScaledVector(surface!.mesh.getVertexPosition(index, v), surface!.weights.getComponent(i)));
        point.applyMatrix4(surface.mesh.matrixWorld);
        const rotation = root.getWorldQuaternion(new T.Quaternion());
        const outward = new T.Vector3(0, 0, -1).applyQuaternion(rotation);
        return { point: point.addScaledVector(outward, .018), normal: outward.negate(), along: new T.Vector3(sign, -.26, 0).normalize().applyQuaternion(rotation) };
    }
    return {
        height, root, mouth,
        alignFace(target, weight) {
            const destination = mouth().lerp(target, smooth(weight));
            for (let iteration = 0; iteration < 6; iteration++) {
                for (const name of ['head', 'neck01', 'spine01', 'spine03', 'spine05']) {
                    const joint = bone(name), origin = joint.getWorldPosition(new T.Vector3()); remember(joint);
                    const before = mouth().sub(origin).normalize(), after = destination.clone().sub(origin).normalize();
                    const delta = new T.Quaternion().setFromUnitVectors(before, after);
                    const angle = 2 * Math.acos(T.MathUtils.clamp(Math.abs(delta.w), 0, 1));
                    delta.identity().slerp(new T.Quaternion().setFromUnitVectors(before, after), angle ? Math.min(1, .09 / angle) : 0);
                    const rotation = delta.multiply(joint.getWorldQuaternion(new T.Quaternion()));
                    joint.quaternion.copy(joint.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(rotation));
                    joint.updateMatrixWorld(true);
                }
            }
        },
        invalidate() { surfaces.clear(); },
        reset() { for (const [joint, rotation] of originals) { joint.quaternion.copy(rotation); } originals.clear(); },
        prepare(weight: number, upper: boolean, form: ContactForm, _partnerHeight: number) {
            capturePalms();
            if (form === 'kiss') { mouth(); }
            if (form === 'handhold' || form === 'lean') { return; }
            for (const [name, values] of rotations[upper ? 'upper' : 'lower']) {
                const joint = bone(name); remember(joint);
                joint.quaternion.multiply(new T.Quaternion().slerp(new T.Quaternion().fromArray(values), weight));
            }
            root.updateMatrixWorld(true);
            if (form === 'kiss') {
                turn('head', new T.Vector3(0, 0, 1), (upper ? -.16 : .16) * weight);
            }
        },
        contact,
        reach(partner: ContactPose, weight: number, upper: boolean, form: ContactForm) {
            if (form === 'handhold' || form === 'lean') {
                const other = root.worldToLocal(partner.root.getWorldPosition(new T.Vector3()));
                const arm = arms.find(a => a.side === (other.x > 0 ? 'L' : 'R'))!;
                const point = root.getWorldPosition(new T.Vector3()).lerp(partner.root.getWorldPosition(new T.Vector3()), .5);
                if (form === 'handhold') {
                    point.y += Math.min(height, partner.height) * .46;
                    const sign = other.x > 0 ? 1 : -1, facing = root.getWorldQuaternion(new T.Quaternion());
                    point.add(new T.Vector3(-sign * .008, 0, .055).applyQuaternion(facing));
                    palmAt(arm, point, new T.Vector3(sign, 0, 0).applyQuaternion(facing), weight);
                } else {
                    const sign = other.x > 0 ? 1 : -1;
                    turn('spine01', new T.Vector3(0, 0, 1), -sign * .08 * weight);
                    turn('head', new T.Vector3(0, 0, 1), -sign * .12 * weight);
                    const target = partner.root.localToWorld(new T.Vector3(sign * .12, partner.height * (upper ? .78 : .61), -.1));
                    palmAt(arm, target, new T.Vector3(0, 0, 1).applyQuaternion(partner.root.getWorldQuaternion(new T.Quaternion())), weight);
                }
                return;
            }
            for (const arm of arms) {
                for (const joint of [arm.upper, arm.middle, arm.wrist]) { remember(joint); }
                const sign = arm.side === 'L' ? 1 : -1, palm = palms.get(arm.side)!, target = partner.contact(arm.side, upper);
                const rotation = basis(target.along, target.normal).multiply(palm.basis.clone().invert());
                const wristTarget = target.point.sub(palm.offset.clone().applyQuaternion(rotation));
                const start = arm.wrist.getWorldPosition(new T.Vector3());
                const side = root.localToWorld(new T.Vector3(sign * .32, Math.min(height, partner.height) * .76, .29));
                const position = weight < .55 ? start.lerp(side, smooth(weight / .55)) : side.lerp(wristTarget, smooth((weight - .55) / .45));
                const pole = root.localToWorld(new T.Vector3(sign * .48, height * .69, .15));
                const handRotation = arm.wrist.getWorldQuaternion(new T.Quaternion()).slerp(rotation, weight);
                reachLimb(arm.upper, arm.middle, arm.wrist, position, pole);
                arm.wrist.quaternion.copy(arm.wrist.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(handRotation));
                root.updateMatrixWorld(true);
            }
        },
    };
}

export function alignContactFaces(first: ContactPose, second: ContactPose, weight: number) {
    const a = first.mouth(), b = second.mouth(), target = a.clone().lerp(b, .5);
    // The taller partner leans down; do not ask the shorter body to stretch upward.
    target.y = Math.min(a.y, b.y) + Math.abs(a.y - b.y) * .2;
    first.alignFace(target, weight); second.alignFace(target, weight);
}
