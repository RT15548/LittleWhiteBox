import * as T from 'three';
import source from '../assets/characters/motion-library.json';

type Motion = { fps: number; frames: number; reference: Record<string, number[]>; tracks: Record<string, number[]>; bob: number[] };
const library: Record<string, Motion> = source;

// Retarget once per loaded character. Geometry, inverse binds and bone lengths never change.
export function libraryClips(template: T.Object3D, gender: 'male' | 'female'): T.AnimationClip[] {
    const joints: T.Bone[] = [], saved = new Map<T.Bone, T.Quaternion>();
    template.traverse(object => { if (object instanceof T.Bone) { joints.push(object); saved.set(object, object.quaternion.clone()); } });
    const joint = (name: string) => {
        const found = template.getObjectByName(T.PropertyBinding.sanitizeNodeName(name));
        if (!(found instanceof T.Bone)) { throw new Error(`island_motion_joint:${name}`); }
        return found;
    };
    template.updateMatrixWorld(true);
    const reference = library.idle.reference;
    // MakeHuman is not a T-pose skeleton. Align a temporary reference pose to the
    // source's anatomical directions before transferring source world rotations.
    for (const side of ['L', 'R']) {
        for (const [name, end] of [['upperarm01', 'lowerarm01'], ['lowerarm01', 'wrist'], ['wrist', 'finger3-1'], ['upperleg01', 'lowerleg01'], ['lowerleg01', 'foot']]) {
            const key = `${name}.${side}`, start = joint(key), tip = joint(`${end}.${side}`);
            const before = tip.getWorldPosition(new T.Vector3()).sub(start.getWorldPosition(new T.Vector3())).normalize();
            const after = new T.Vector3(0, 1, 0).applyQuaternion(new T.Quaternion().fromArray(reference[key])).normalize();
            const world = new T.Quaternion().setFromUnitVectors(before, after).multiply(start.getWorldQuaternion(new T.Quaternion()));
            start.quaternion.copy(start.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));
            template.updateMatrixWorld(true);
        }
    }
    const restWorld = new Map<T.Object3D, T.Quaternion>(), restLocal = new Map<T.Object3D, T.Quaternion>();
    template.traverse(object => { restWorld.set(object, object.getWorldQuaternion(new T.Quaternion())); restLocal.set(object, object.quaternion.clone()); });
    const sourceKeys = new Map(joints.map(b => [b, Object.keys(reference).find(key => T.PropertyBinding.sanitizeNodeName(key) === b.name)]));
    const clips = [['idle', 'idle'], ['walk', gender === 'female' ? 'femaleWalk' : 'maleWalk'], ['punch', 'punch'], ['guard', 'guard']].map(([name, key]) => {
        const motion = library[key], times = Array.from({ length: motion.frames }, (_, i) => i / motion.fps);
        const values = new Map(joints.map(b => [b, [] as number[]]));
        for (let frame = 0; frame < motion.frames; frame++) {
            const posed = new Map<T.Object3D, T.Quaternion>();
            template.traverse(object => {
                const parent = object.parent ? posed.get(object.parent) ?? restWorld.get(object.parent) ?? object.parent.getWorldQuaternion(new T.Quaternion()) : new T.Quaternion();
                const sourceKey = object instanceof T.Bone ? sourceKeys.get(object) : undefined;
                const global = sourceKey
                    ? new T.Quaternion().fromArray(motion.tracks[sourceKey], frame * 4).multiply(restWorld.get(object)!)
                    : parent.clone().multiply(restLocal.get(object)!);
                posed.set(object, global);
                if (object instanceof T.Bone) {
                    const local = parent.clone().invert().multiply(global), data = values.get(object)!;
                    if (data.length && local.dot(new T.Quaternion().fromArray(data, data.length - 4)) < 0) { local.set(-local.x, -local.y, -local.z, -local.w); }
                    data.push(...local.toArray());
                }
            });
        }
        const tracks: T.KeyframeTrack[] = joints.map(b => new T.QuaternionKeyframeTrack(`${b.name}.quaternion`, times, values.get(b)!));
        // In-place motion: retain vertical hip motion, discard source travel/scale.
        const hips = joint('root'), height = hips.getWorldPosition(new T.Vector3()).y;
        const inverseParent = hips.parent!.getWorldQuaternion(new T.Quaternion()).invert();
        tracks.push(new T.VectorKeyframeTrack(`${hips.name}.position`, times, motion.bob.flatMap(bob =>
            hips.position.clone().add(new T.Vector3(0, bob * height, 0).applyQuaternion(inverseParent)).toArray())));
        const clip = new T.AnimationClip(name, times.at(-1)!, tracks);
        return clip.optimize();
    });
    for (const [bone, q] of saved) { bone.quaternion.copy(q); }
    template.updateMatrixWorld(true);
    return clips;
}
