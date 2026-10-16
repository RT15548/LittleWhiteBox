import * as T from 'three';
import { reachLimb } from './limb-ik.js';

export type ConflictMotion = { kind: 'punch' | 'push' | 'guard' | 'recoil'; progress: number; target: T.Vector3 | null };

// Project-authored push/recoil; punch and guard are retargeted library clips.
export function createConflictPose(root: T.Object3D, bone: (name: string) => T.Bone, height: number) {
    const originals = new Map<T.Bone, T.Quaternion>();
    const remember = (joint: T.Bone) => { if (!originals.has(joint)) { originals.set(joint, joint.quaternion.clone()); } };
    return {
        reset() { for (const [joint, rotation] of originals) { joint.quaternion.copy(rotation); } originals.clear(); },
        apply(motion: ConflictMotion) {
            const amount = Math.sin(Math.PI * T.MathUtils.clamp(motion.progress, 0, 1));
            if (motion.kind === 'push') {
                for (const side of ['L', 'R']) {
                    const upper = bone(`upperarm01.${side}`), elbow = bone(`lowerarm01.${side}`), wrist = bone(`wrist.${side}`);
                    [upper, elbow, wrist].forEach(remember);
                    const sign = side === 'L' ? 1 : -1;
                    const point = root.localToWorld(new T.Vector3(sign * .14, height * .72, .2 + .24 * amount));
                    const position = wrist.getWorldPosition(new T.Vector3()).lerp(point, Math.min(1, amount * 2));
                    reachLimb(upper, elbow, wrist, position, root.localToWorld(new T.Vector3(sign * .38, height * .64, .12)));
                }
            } else if (motion.kind === 'recoil') {
                const spine = bone('spine01'); remember(spine);
                const direction = motion.target ? root.worldToLocal(motion.target.clone()).z >= 0 ? -1 : 1 : -1;
                const axis = new T.Vector3(1, 0, 0).applyQuaternion(root.getWorldQuaternion(new T.Quaternion()));
                const rotation = new T.Quaternion().setFromAxisAngle(axis, direction * .18 * amount).multiply(spine.getWorldQuaternion(new T.Quaternion()));
                spine.quaternion.copy(spine.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(rotation));
            }
            root.updateMatrixWorld(true);
        },
    };
}
