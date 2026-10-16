import * as T from 'three';
import { reachLimb } from './limb-ik.js';

export function createCarePose(root: T.Object3D, bone: (name: string) => T.Bone) {
    const arms = (['L', 'R'] as const).map(side => ({ side, upper: bone(`upperarm01.${side}`), middle: bone(`lowerarm01.${side}`), end: bone(`wrist.${side}`) }));
    const originals = new Map<T.Bone, T.Quaternion>();
    return {
        reset() { for (const [joint, rotation] of originals) { joint.quaternion.copy(rotation); } originals.clear(); },
        apply(target: T.Vector3, phase: number, selfSkin: boolean) {
            for (const arm of arms) {
                if (selfSkin && arm.side === 'L') { continue; }
                originals.set(arm.upper, arm.upper.quaternion.clone()); originals.set(arm.middle, arm.middle.quaternion.clone());
                const sign = arm.side === 'L' ? 1 : -1;
                const pole = root.localToWorld(new T.Vector3(sign * .4, .75, .1));
                const offset = new T.Vector3(sign * .025, .025 + Math.sin(phase) * .006, 0).applyQuaternion(root.getWorldQuaternion(new T.Quaternion()));
                reachLimb(arm.upper, arm.middle, arm.end, target.clone().add(offset), pole);
            }
        },
    };
}
