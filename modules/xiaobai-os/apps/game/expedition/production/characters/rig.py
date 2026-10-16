"""Sanniang's in-place gait. The world remains the sole owner of her position."""

import math
import bpy
from mathutils import Quaternion, Vector

STRIDE = .58


def skeleton():
    data = bpy.data.armatures.new('SanniangSkeleton')
    rig = bpy.data.objects.new('Sanniang', data)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bones = [
        ('root', (0, 0, .04), (0, 0, .2), None),
        ('hips', (0, 0, .84), (0, 0, 1.00), 'root'),
        ('spine', (0, 0, 1.0), (0, 0, 1.16), 'hips'),
        ('chest', (0, 0, 1.16), (0, 0, 1.31), 'spine'),
        ('neck', (0, 0, 1.31), (0, 0, 1.40), 'chest'),
        ('head', (0, 0, 1.40), (0, 0, 1.62), 'neck'),
        ('hem.front', (0, -.07, .89), (0, -.1, .21), 'hips'),
        ('hem.back', (0, .07, .89), (0, .1, .21), 'hips'),
        ('sash', (-.13, -.02, .94), (-.24, -.01, .54), 'hips'),
    ]
    for side, sign in [('L', 1), ('R', -1)]:
        bones += [
            (f'arm.{side}', (sign * .155, 0, 1.29), (sign * .228, -.009, 1.08), 'chest'),
            (f'forearm.{side}', (sign * .228, -.009, 1.08), (sign * .235, -.025, .89), f'arm.{side}'),
            (f'hand.{side}', (sign * .235, -.025, .89), (sign * .23, -.04, .78), f'forearm.{side}'),
            (f'thigh.{side}', (sign * .078, 0, .85), (sign * .078, -.012, .46), 'hips'),
            (f'shin.{side}', (sign * .078, -.012, .46), (sign * .078, 0, .08), f'thigh.{side}'),
            (f'foot.{side}', (sign * .078, 0, .08), (sign * .078, -.12, .04), f'shin.{side}'),
            (f'hem.{side}', (sign * .10, 0, .89), (sign * .19, 0, .2), 'hips'),
        ]
    for name, head, tail, parent in bones:
        bone = data.edit_bones.new(name)
        bone.head, bone.tail = head, tail
        bone.align_roll(Vector((0, -1, 0)))
        if parent:
            bone.parent = data.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    rig.select_set(False)
    rig['stride'] = STRIDE
    return rig


def body_weights(point):
    z = point[2]
    if z > 1.35:
        return {'neck': 1}
    if z > 1.12:
        t = min(1, (z - 1.12) / .15)
        return {'spine': 1 - t, 'chest': t}
    t = max(0, min(1, (z - .95) / .17))
    return {'hips': 1 - t, 'spine': t}


def sleeve_weights(side):
    def weights(p):
        t = max(0, min(1, (p[2] - 1.04) / .09))
        return {f'arm.{side}': t, f'forearm.{side}': 1 - t}
    return weights


def skirt_weights(p):
    x, y, z = p
    t = max(0, min(.95, (.94 - z) / .75))
    # Continuous circumferential weights: no sector boundary can tear the inner/outer panels apart.
    side = abs(x / .17) ** 4
    front = abs(y / .105) ** 4
    mix = side / (side + front) if side + front else 0
    return {'hips': 1 - t, 'hem.' + ('L' if x > 0 else 'R'): t * mix,
            'hem.' + ('front' if y < 0 else 'back'): t * (1 - mix)}


def rotate(rig, name, axis, degrees):
    bone = rig.pose.bones[name]
    bone.rotation_mode = 'QUATERNION'
    local_axis = bone.bone.matrix_local.to_quaternion().inverted() @ Vector(axis)
    bone.rotation_quaternion = Quaternion(local_axis, math.radians(degrees))


def clips(rig):
    rig.animation_data_create()
    for name, length in [('idle', 120), ('walk', 36)]:
        action = bpy.data.actions.new(name)
        rig.animation_data.action = action
        for frame in range(0, length + 1, 3):
            phase = frame / length * math.tau
            for bone in rig.pose.bones:
                bone.rotation_mode = 'QUATERNION'
                bone.rotation_quaternion.identity()
                bone.location = (0, 0, 0)
            rotate(rig, 'head', (0, 0, 1), math.sin(phase) * (.6 if name == 'idle' else .35))
            rotate(rig, 'chest', (1, 0, 0), math.sin(phase) * .35)
            if name == 'walk':
                for side, sign in [('L', 1), ('R', -1)]:
                    swing = math.sin(phase) * sign
                    rotate(rig, f'thigh.{side}', (1, 0, 0), -swing * 19)
                    rotate(rig, f'shin.{side}', (1, 0, 0), max(0, swing) * 30)
                    rotate(rig, f'foot.{side}', (1, 0, 0), -max(0, swing) * 11)
                    rotate(rig, f'arm.{side}', (1, 0, 0), swing * 9)
                    rotate(rig, f'forearm.{side}', (1, 0, 0), -3 - max(0, -swing) * 8)
                    rotate(rig, f'hem.{side}', (1, 0, 0), -swing * 17)
                rotate(rig, 'hem.front', (1, 0, 0), -abs(math.sin(phase)) * 18)
                rotate(rig, 'hem.back', (1, 0, 0), abs(math.sin(phase)) * 22)
                rotate(rig, 'sash', (1, 0, 0), math.sin(phase - .7) * 7)
            else:
                rotate(rig, 'arm.L', (1, 0, 0), -3)
                rotate(rig, 'forearm.L', (1, 0, 0), -5)
                rotate(rig, 'arm.R', (1, 0, 0), -7)
                rotate(rig, 'forearm.R', (1, 0, 0), -25)
            for bone in rig.pose.bones:
                bone.keyframe_insert('rotation_quaternion', frame=frame)
        action.use_fake_user = True
    rig.animation_data.action = None
    for bone in rig.pose.bones:
        bone.rotation_quaternion.identity()
    bpy.context.scene.render.fps = 30
    bpy.context.view_layer.update()
