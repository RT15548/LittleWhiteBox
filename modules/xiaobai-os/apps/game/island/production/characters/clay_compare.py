"""Same-material/pose/orthographic comparison with an approved body read from .blend."""

import hashlib
import json
import math
from pathlib import Path

import bpy

from motion import relaxed_pose


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def silhouette(body):
    """Binding-space width/depth slices, normalized by height, not body measurements."""
    points = [v.co for v in body.data.vertices]
    floor, top = min(p.z for p in points), max(p.z for p in points)
    height = top - floor
    samples = {}
    for fraction in (0.25, 0.40, 0.52, 0.62, 0.72, 0.82, 0.92):
        band = [p for p in points if abs((p.z - floor) / height - fraction) < 0.015]
        if not band:
            raise ValueError(f"Body has no silhouette sample at height fraction {fraction}")
        samples[str(fraction)] = {"width_over_height": (max(p.x for p in band) - min(p.x for p in band)) / height,
                                  "depth_over_height": (max(p.y for p in band) - min(p.y for p in band)) / height}
    return {"height_m": height, "normalized_slices": samples}


def compare_approved(path, target, others, standing_pose, gray, camera, directory):
    source = Path(path).resolve(strict=True)
    before = sha(source)
    names = ("Survivor", "body.skin", "body.eyes")
    with bpy.data.libraries.load(str(source), link=False) as (available, loaded):
        missing = set(names) - set(available.objects)
        if missing:
            raise ValueError(f"Approved source does not contain the required body objects: {missing}")
        loaded.objects = list(names)
    rig, body, eyes = loaded.objects
    for obj in loaded.objects:
        bpy.context.scene.collection.objects.link(obj)
        obj.hide_viewport = obj.hide_render = False
    rig.animation_data_clear()
    rig.name = "ApprovedComparison"
    for obj in (body, eyes):
        obj.data = obj.data.copy()
        obj.data.materials.clear()
        obj.data.materials.append(gray)
        for poly in obj.data.polygons:
            poly.material_index = 0
    # Both bodies receive the candidate's exact joint angles; Ye's approved natural
    # pose is not compared against a different pose, nor written back to its source.
    relaxed_pose(rig, standing_pose)
    original_location = target[0].location.copy()
    original_rotation = target[0].rotation_euler.copy()
    target[0].location.x = 0.55
    rig.location.x = -0.55
    for actor in others:
        for obj in actor:
            obj.hide_render = True
    scene = bpy.context.scene
    original_scale = camera.data.ortho_scale
    resolution = scene.render.resolution_x, scene.render.resolution_y
    camera.data.ortho_scale = 2.8
    scene.render.resolution_x, scene.render.resolution_y = 1600, 1200
    record = {"approved_source": str(source), "approved_source_sha256": before,
              "left": "approved-body", "right": "candidate-body", "pose": standing_pose,
              "approved": silhouette(body), "candidate": silhouette(target[1]),
              "status": "comparison-only; not final art acceptance"}
    for name, angle in (("front", 0), ("side", math.pi / 2), ("back", math.pi)):
        rig.rotation_euler.z = target[0].rotation_euler.z = angle
        scene.render.filepath = str(directory / f"comparison-{name}.png")
        if name == "front":
            bpy.ops.wm.save_as_mainfile(filepath=str(directory / "body-comparison.blend"))
        bpy.ops.render.render(write_still=True)
    if sha(source) != before:
        raise AssertionError("Approved source changed during read-only comparison")
    record["approved_source_unchanged"] = True
    (directory / "comparison.json").write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    for obj in loaded.objects:
        obj.hide_render = obj.hide_viewport = True
    target[0].location = original_location
    target[0].rotation_euler = original_rotation
    camera.data.ortho_scale = original_scale
    scene.render.resolution_x, scene.render.resolution_y = resolution
    for actor in others:
        for obj in actor:
            obj.hide_render = False
