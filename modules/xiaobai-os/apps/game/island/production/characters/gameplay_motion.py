"""In-place survival actions on the approved rig; idle/walk are never rewritten."""

import math
import bpy
from mathutils import Matrix, Vector

from motion import relaxed_pose, turn

CLIP_FRAMES = {"rest": 90, "work": 60, "construct": 60, "drink": 72,
               "wash": 72, "offer": 60, "drag": 30, "dead": 30}
HAND_BONE = "wrist.R"


def pivot_rotation(bone, rotation):
    pivot = Matrix.Translation(bone.head)
    bone.matrix = pivot @ rotation.to_matrix().to_4x4() @ pivot.inverted() @ bone.matrix
    bpy.context.view_layer.update()


def solve_chain(rig, upper_name, middle_name, end_name, target, pole):
    """Analytic two-link reach; no constraints, helper bones, or rig edits survive export."""
    upper = rig.pose.bones[upper_name]
    fore = rig.pose.bones[middle_name]
    wrist = rig.pose.bones[end_name]
    start, elbow, hand = upper.head.copy(), fore.head.copy(), wrist.head.copy()
    a, b = (elbow - start).length, (hand - elbow).length
    toward = Vector(target) - start
    distance = min(toward.length, (a + b) * 0.985)
    axis = toward.normalized()
    offset = Vector(pole) - start
    plane = (offset - offset.dot(axis) * axis).normalized()
    along = (a * a - b * b + distance * distance) / (2 * distance)
    height = math.sqrt(max(0, a * a - along * along))
    desired_elbow = start + axis * along + plane * height
    pivot_rotation(upper, (elbow - start).rotation_difference(desired_elbow - start))
    pivot_rotation(fore, (wrist.head - fore.head).rotation_difference(start + axis * distance - fore.head))


def reach(rig, side, target, pole):
    solve_chain(rig, f"upperarm01.{side}", f"lowerarm01.{side}", f"wrist.{side}", target, pole)


def seated_legs(rig, scale=1):
    root = rig.pose.bones['root']
    hip_height = rig.pose.bones['upperleg01.L'].head.z
    root.matrix = Matrix.Translation((0, 0, 0.080 * scale - hip_height)) @ root.matrix
    bpy.context.view_layer.update()
    for side, sign in (("L", 1), ("R", -1)):
        solve_chain(rig, f"upperleg01.{side}", f"lowerleg01.{side}", f"foot.{side}",
                    Vector((sign * 0.11, -0.65, 0.069)) * scale, Vector((sign * 0.15, -0.34, 0.40)) * scale)
        foot = rig.pose.bones[f"foot.{side}"]
        foot.matrix = Matrix.Translation(foot.head) @ foot.bone.matrix_local.to_3x3().to_4x4()
        bpy.context.view_layer.update()


def curl(rig, side, amount):
    sign = 1 if side == "L" else -1
    index = rig.data.bones[f"finger2-1.{side}"].head_local
    pinky = rig.data.bones[f"finger5-1.{side}"].head_local
    axis = (pinky - index).normalized() * sign
    for digit in range(2, 6):
        for segment in (1, 2, 3):
            turn(rig, f"finger{digit}-{segment}.{side}", axis, amount * (0.6 if segment == 3 else 1))


def world_points(objects):
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    points = []
    for obj in objects:
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        matrix = evaluated.matrix_world.copy()
        points.extend(matrix @ vertex.co.copy() for vertex in mesh.vertices)
        evaluated.to_mesh_clear()
    if any(not math.isfinite(value) or abs(value) > 4 for p in points for value in p):
        raise ValueError("Invalid or stretched character pose bounds")
    return points


def ground(rig, objects):
    floor = min(p.z for p in world_points(objects))
    root = rig.pose.bones["root"]
    root.matrix = Matrix.Translation((0, 0, -floor)) @ root.matrix
    bpy.context.view_layer.update()
    return -floor


def legs(rig, hip, knee, ankle):
    for side in ("L", "R"):
        turn(rig, f"upperleg01.{side}", (1, 0, 0), hip)
        turn(rig, f"lowerleg01.{side}", (1, 0, 0), knee)
        turn(rig, f"foot.{side}", (1, 0, 0), ankle)


def pose(rig, name, phase, ground_objects, standing_pose, contact_scale=1):
    def contact(side, target, pole):
        reach(rig, side, Vector(target) * contact_scale, Vector(pole) * contact_scale)
    for bone in rig.pose.bones:
        bone.matrix_basis = Matrix.Identity(4)
    relaxed_pose(rig, standing_pose)
    wave = math.sin(phase)
    if name == "rest":
        seated_legs(rig, contact_scale)
        turn(rig, "spine05", (1, 0, 0), 8)
        turn(rig, "spine03", (1, 0, 0), -3 + wave * 0.45)
        ground(rig, ground_objects)
        for side, sign in (("L", 1), ("R", -1)):
            knee = rig.pose.bones[f"lowerleg01.{side}"].head
            reach(rig, side, (sign * 0.145 * contact_scale, knee.y - 0.02 * contact_scale, knee.z + 0.12 * contact_scale),
                  Vector((sign * 0.35, -0.17, 0.65)) * contact_scale)
        turn(rig, "head", (1, 0, 0), 4)
    elif name == "work":
        legs(rig, -48, 84, -36)
        turn(rig, "spine05", (1, 0, 0), 19)
        turn(rig, "spine03", (1, 0, 0), 16 + wave * 2)
        ground(rig, ground_objects)
        for side, sign in (("L", 1), ("R", -1)):
            contact(side, (sign * 0.17, -0.40 + sign * wave * 0.035, 0.47 + wave * 0.025),
                  (sign * 0.40, -0.16, 0.70))
        turn(rig, "head", (1, 0, 0), 9)
    elif name == "construct":
        legs(rig, -17, 30, -13)
        turn(rig, "spine05", (1, 0, 0), 10)
        turn(rig, "spine03", (1, 0, 0), 8 + wave)
        ground(rig, ground_objects)
        contact("L", (0.16, -0.36, 0.81), (0.38, -0.14, 0.95))
        contact("R", (-0.16, -0.39, 0.90 + 0.11 * wave), (-0.40, -0.12, 1.08))
        curl(rig, "R", 23)
        turn(rig, "head", (1, 0, 0), 8)
    elif name == "drink":
        ground(rig, ground_objects)
        sip = (1 - math.cos(phase)) / 2
        contact("R", (-0.055, -0.29, 1.12 + 0.235 * sip), (-0.33, -0.18, 1.13))
        turn(rig, "wrist.R", (1, 0, 0), -10 * sip)
        turn(rig, "head", (1, 0, 0), -3 * sip)
        curl(rig, "R", 25)
    elif name == "wash":
        legs(rig, -19, 34, -15)
        turn(rig, "spine05", (1, 0, 0), 12)
        turn(rig, "spine03", (1, 0, 0), 7)
        ground(rig, ground_objects)
        contact("R", (-0.032, -0.405, 0.91 + wave * 0.014), (-0.33, -0.20, 1.00))
        contact("L", (0.032, -0.37, 0.91 - wave * 0.014), (0.33, -0.20, 1.00))
        turn(rig, "head", (1, 0, 0), 10)
    elif name == "offer":
        ground(rig, ground_objects)
        contact("R", (-0.13, -0.425 - 0.012 * wave, 1.035), (-0.34, -0.16, 1.0))
        turn(rig, "wrist.R", (0, 1, 0), -26)
        curl(rig, "R", 10)
        turn(rig, "head", (0, 0, 1), -3)
    elif name == "drag":
        for side, sign in (("L", 1), ("R", -1)):
            swing = wave * sign
            turn(rig, f"upperleg01.{side}", (1, 0, 0), -swing * 16)
            turn(rig, f"lowerleg01.{side}", (1, 0, 0), max(0, swing) * 23)
            turn(rig, f"foot.{side}", (1, 0, 0), -max(0, swing) * 8)
        turn(rig, "spine05", (1, 0, 0), 12)
        ground(rig, ground_objects)
        for side, sign in (("L", 1), ("R", -1)):
            contact(side, (sign * 0.23, 0.16, 0.85 + sign * wave * 0.014),
                  (sign * 0.40, 0.12, 1.06))
            curl(rig, side, 22)
    elif name == "dead":
        for side, sign in (("L", 1), ("R", -1)):
            turn(rig, f"upperarm01.{side}", (0, 1, 0), -sign * 14)
            turn(rig, f"lowerarm01.{side}", (1, 0, 0), -8)
            turn(rig, f"upperleg01.{side}", (0, 1, 0), -sign * 3)
            turn(rig, f"lowerleg01.{side}", (1, 0, 0), 5)
        turn(rig, "head", (0, 0, 1), 12)
        turn(rig, "root", (1, 0, 0), -90)
        ground(rig, ground_objects)
    else:
        raise ValueError(f"Unknown gameplay action: {name}")
    ground(rig, ground_objects)
    bpy.context.view_layer.update()


def author_gameplay_clips(rig, objects, standing_pose, contact_scale=1):
    """Add only new actions; saved source idle/walk datablocks remain byte-equivalent."""
    if set(CLIP_FRAMES) & {a.name for a in bpy.data.actions}:
        raise ValueError("Gameplay actions already exist; load the approved source afresh")
    rig.animation_data_create()
    rig.animation_data.action = None
    for name, frames in CLIP_FRAMES.items():
        action = bpy.data.actions.new(name)
        action.use_fake_user = True
        step = 1 if name == "drag" else 4
        for frame in sorted(set(range(0, frames + 1, step)) | {frames}):
            rig.animation_data.action = None
            pose(rig, name, frame / frames * math.tau, objects, standing_pose, contact_scale)
            rig.animation_data.action = action
            for bone in rig.pose.bones:
                bone.keyframe_insert("rotation_quaternion", frame=frame)
                # Includes a zero location on every other bone so all clips have an
                # explicit base pose, not a residual state from a previous action.
                bone.keyframe_insert("location", frame=frame)
        for layer in action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    for curve in bag.fcurves:
                        for key in curve.keyframe_points:
                            key.interpolation = "BEZIER"
                            key.handle_left_type = key.handle_right_type = "AUTO_CLAMPED"
        print(f"Authored gameplay clip {name}: {frames / 30:.2f}s", flush=True)
    rig.animation_data.action = None
    relaxed_pose(rig, standing_pose)
    bpy.context.scene.render.fps = 30
