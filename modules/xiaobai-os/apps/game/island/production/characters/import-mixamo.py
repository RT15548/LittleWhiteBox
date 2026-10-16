"""Bake licensed local FBX motion into mesh-free, Y-up reference/delta tracks.

The game's existing character meshes, skinning and body proportions are untouched.
Only the game embeds the resulting data; downloaded source FBXs stay in output/.
"""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Quaternion, Vector

MAP = {
    "root": "Hips", "spine05": "Spine", "spine03": "Spine1", "spine01": "Spine2",
    "neck01": "Neck", "head": "Head",
}
for side, word in (("L", "Left"), ("R", "Right")):
    for target, source in (("clavicle", "Shoulder"), ("upperarm01", "Arm"), ("lowerarm01", "ForeArm"),
                           ("wrist", "Hand"), ("upperleg01", "UpLeg"), ("lowerleg01", "Leg"), ("foot", "Foot")):
        MAP[f"{target}.{side}"] = word + source
    for digit, word_digit in enumerate(("Thumb", "Index", "Middle", "Ring", "Pinky"), start=1):
        for segment in range(1, 4):
            MAP[f"finger{digit}-{segment}.{side}"] = f"{word}Hand{word_digit}{segment}"

CONVERT = Quaternion(Vector((1, 0, 0)), -math.pi / 2)


def rotation(matrix):
    return CONVERT @ matrix.to_quaternion()


def xyzw(q):
    return [round(v, 7) for v in (q.x, q.y, q.z, q.w)]


def bake(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=str(path), use_anim=True)
    rigs = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
    if len(rigs) != 1:
        raise ValueError("Expected one source skeleton")
    rig = rigs[0]
    bones = {key: rig.pose.bones["mixamorig:" + name] for key, name in MAP.items()}
    action = rig.animation_data.action
    start, end = map(int, action.frame_range)
    fps = bpy.context.scene.render.fps / bpy.context.scene.render.fps_base
    rest = {key: rotation(rig.matrix_world @ bone.bone.matrix_local) for key, bone in bones.items()}
    reference = {key: xyzw(q) for key, q in rest.items()}
    # Source Y-up hip height is the scale reference, never a target bone length.
    hip = (CONVERT.to_matrix().to_4x4() @ rig.matrix_world @ bones["root"].bone.matrix_local).translation
    tracks = {key: [] for key in bones}
    bob = []
    previous = {}
    for frame in range(start, end + 1):
        bpy.context.scene.frame_set(frame)
        for key, bone in bones.items():
            delta = rotation(rig.matrix_world @ bone.matrix) @ rest[key].inverted()
            if key in previous and delta.dot(previous[key]) < 0:
                delta.negate()
            previous[key] = delta.copy()
            tracks[key].extend(xyzw(delta))
        position = CONVERT @ (rig.matrix_world @ bones["root"].matrix).translation
        bob.append(position.y / hip.y)
    baseline = sum(bob) / len(bob)
    return {"fps": fps, "frames": end - start + 1, "reference": reference,
            "tracks": tracks, "bob": [round(y - baseline, 7) for y in bob]}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--clip", action="append", required=True, help="clip-name=local.fbx")
    parser.add_argument("--output", required=True)
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
    result = {}
    for entry in args.clip:
        key, file = entry.split("=", 1)
        result[key] = bake(Path(file).resolve(strict=True))
        print(f"Baked {key}: {result[key]['frames']} frames")
    Path(args.output).write_text(json.dumps(result, separators=(",", ":")) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
