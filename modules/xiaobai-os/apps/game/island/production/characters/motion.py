"""Two in-place review clips. World travel remains owned by the game, never the mesh."""

import math
import bpy
from mathutils import Matrix, Quaternion, Vector

from ye_design import STANDING_POSE, WALK_ARM_CLEARANCE


REVIEW_POSES = ("raise_arms", "bend_elbows", "bend_spine", "bend_knee")


def rotate(rig, name, axis, degrees, base=None):
    bone = rig.pose.bones[name]
    local_axis = bone.bone.matrix_local.to_quaternion().inverted() @ Vector(axis)
    bone.rotation_mode = "QUATERNION"
    delta = Quaternion(local_axis, math.radians(degrees))
    bone.rotation_quaternion = (base @ delta) if base is not None else delta


def relaxed_pose(rig):
    for bone in rig.pose.bones:
        bone.rotation_mode = "QUATERNION"
        bone.rotation_quaternion.identity()
        bone.location = (0, 0, 0)
    # Retract the neck without tilting the gaze upward. Rotations are authored
    # in the rest rig's frame; the child head compensates the neck chain.
    rotate(rig, "neck01", (1, 0, 0), -10)
    rotate(rig, "neck02", (1, 0, 0), -3)
    rotate(rig, "head", (1, 0, 0), 13)
    for side, sign in [("L", 1), ("R", -1)]:
        rotate(rig, f"clavicle.{side}", (0, 1, 0), sign * STANDING_POSE["shoulder_drop"])
        rotate(rig, f"upperarm01.{side}", (0, 1, 0), sign * STANDING_POSE["upperarm_in"])
        rotate(rig, f"lowerarm01.{side}", (1, 0, 0), STANDING_POSE["elbow_unbend"])
        # Preserve a small carrying angle: bringing elbows inward must not
        # rotate the hands into the thighs or leave the forearms held forward.
        turn(rig, f"lowerarm01.{side}", (0, 1, 0), -sign * STANDING_POSE["forearm_out"])
        turn(rig, f"wrist.{side}", (0, 1, 0), -sign * STANDING_POSE["wrist_out"])
        turn(rig, f"finger1-1.{side}", (0, 1, 0), -sign * STANDING_POSE["thumb_fold"])
        rotate(rig, f"upperleg01.{side}", (0, 1, 0), sign * 5)
        # A mirrored anatomical palm axis, not one Euler axis copied to both
        # hands. The slight increasing curl leaves the fingertips separated.
        index = rig.data.bones[f"finger2-1.{side}"].head_local
        pinky = rig.data.bones[f"finger5-1.{side}"].head_local
        curl_axis = (pinky - index).normalized() * sign
        for digit in range(2, 6):
            for segment, degrees in enumerate((8 + (digit - 2) * 2, 13, 6), start=1):
                rotate(rig, f"finger{digit}-{segment}.{side}", curl_axis, degrees)
    bpy.context.view_layer.update()


def turn(rig, name, axis, degrees):
    """Apply a delta about the current joint, in armature space (not rest axes)."""
    bpy.context.view_layer.update()
    bone = rig.pose.bones[name]
    pivot = Matrix.Translation(bone.head)
    delta = Quaternion(Vector(axis), math.radians(degrees)).to_matrix().to_4x4()
    bone.matrix = pivot @ delta @ pivot.inverted() @ bone.matrix
    bpy.context.view_layer.update()


def exercise_pose(rig, name):
    relaxed_pose(rig)
    if name == "raise_arms":
        for side, sign in (("L", 1), ("R", -1)):
            turn(rig, f"clavicle.{side}", (0, 1, 0), sign * -12)
            turn(rig, f"upperarm01.{side}", (0, 1, 0), sign * -128)
    elif name == "bend_elbows":
        for side in ("L", "R"):
            turn(rig, f"lowerarm01.{side}", (1, 0, 0), -85)
    elif name == "bend_spine":
        for bone, degrees in (("spine05", 18), ("spine03", 20), ("spine01", 12)):
            turn(rig, bone, (1, 0, 0), degrees)
    elif name == "bend_knee":
        turn(rig, "upperleg01.L", (1, 0, 0), -35)
        turn(rig, "lowerleg01.L", (1, 0, 0), 90)
        turn(rig, "foot.L", (1, 0, 0), -55)
    else:
        raise ValueError(f"Unknown review pose: {name}")


def author_clips(rig):
    relaxed_pose(rig)
    base = {bone.name: bone.rotation_quaternion.copy() for bone in rig.pose.bones}
    affected = ["spine01", "head"] + [f"{name}.{side}" for side in ["L", "R"] for name in
                                          ["upperarm01", "lowerarm01", "upperleg01", "lowerleg01", "foot"]]
    rig.animation_data_create()
    for name, frames in [("idle", 72), ("walk", 30)]:
        action = bpy.data.actions.new(name)
        rig.animation_data.action = action
        for frame in range(frames + 1):
            phase = frame / frames * math.tau
            relaxed_pose(rig)
            if name == "idle":
                rotate(rig, "spine01", (1, 0, 0), math.sin(phase) * 0.8, base["spine01"])
                rotate(rig, "head", (0, 0, 1), math.sin(phase) * 0.8, base["head"])
            else:
                for side, sign in [("L", 1), ("R", -1)]:
                    swing = math.sin(phase) * sign
                    for bone, amount in [("upperleg01", -swing * 20),
                                         ("lowerleg01", max(0, swing) * 28),
                                         ("foot", -max(0, swing) * 12),
                                         ("upperarm01", swing * 13)]:
                        turn(rig, f"{bone}.{side}", (1, 0, 0), amount)
                    # Swing around the current joints, not the binding-pose
                    # axes. A small gait-only clearance keeps the relaxed hand
                    # outside the hip without widening the standing pose.
                    turn(rig, f"upperarm01.{side}", (0, 1, 0), -sign * abs(swing) * WALK_ARM_CLEARANCE)
            # Neck retraction and relaxed fingers are part of each clip too.
            # Key the static base once; otherwise export resets those joints.
            for bone in (base if frame == 0 else affected):
                rig.pose.bones[bone].keyframe_insert("rotation_quaternion", frame=frame)
        action.use_fake_user = True
    rig.animation_data.action = None
    for bone in rig.pose.bones:
        bone.rotation_quaternion.identity()
    bpy.context.scene.render.fps = 30
    bpy.context.view_layer.update()
