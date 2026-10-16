import * as T from 'three';

function rotateToward(bone: T.Bone, from: T.Vector3, to: T.Vector3) {
    const delta = new T.Quaternion().setFromUnitVectors(from.normalize(), to.normalize());
    const world = bone.getWorldQuaternion(new T.Quaternion()).premultiply(delta);
    const parent = bone.parent!.getWorldQuaternion(new T.Quaternion());
    bone.quaternion.copy(parent.invert().multiply(world)); bone.updateWorldMatrix(false, true);
}

// Rotations only: the actual character supplies both segment lengths.
export function reachLimb(upper: T.Bone, middle: T.Bone, end: T.Bone, target: T.Vector3, pole: T.Vector3) {
    const start = upper.getWorldPosition(new T.Vector3()), elbow = middle.getWorldPosition(new T.Vector3()), hand = end.getWorldPosition(new T.Vector3());
    const a = start.distanceTo(elbow), b = elbow.distanceTo(hand), toward = target.clone().sub(start);
    const distance = T.MathUtils.clamp(toward.length(), Math.abs(a - b) + .001, (a + b) * .985), axis = toward.normalize();
    const plane = pole.clone().sub(start); plane.addScaledVector(axis, -plane.dot(axis)).normalize();
    const along = (a * a - b * b + distance * distance) / (2 * distance);
    const desired = start.clone().addScaledVector(axis, along).addScaledVector(plane, Math.sqrt(Math.max(0, a * a - along * along)));
    rotateToward(upper, elbow.clone().sub(start), desired.sub(start));
    const nextElbow = middle.getWorldPosition(elbow), nextHand = end.getWorldPosition(hand);
    rotateToward(middle, nextHand.sub(nextElbow), start.addScaledVector(axis, distance).sub(nextElbow));
}
