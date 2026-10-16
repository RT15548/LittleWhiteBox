"""Uncovered adult anatomy review. No clothing, hair, skin colors, or photographs."""

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))
from authoring import prepare_build
from design import load_design
from face import build_eyes
from makehuman_data import HumanData
from mesh_tools import bind_weights, build_rig, material, source_mesh
from motion import REVIEW_POSES, exercise_pose, relaxed_pose


VIEWS = {"front": 0, "side": math.pi / 2, "back": math.pi}
PORTRAITS = {"front": 0, "three-quarter": math.pi / 4, "side": math.pi / 2}


def aim(obj, point):
    obj.rotation_euler = (Vector(point) - obj.location).to_track_quat("-Z", "Y").to_euler()


def add_actor(data, gray, name, x, angle, standing_pose, exercise=None):
    rig = build_rig(data)
    rig.name = name
    body, indices = source_mesh(f"{name}.body", data, data.group_faces("body"), gray)
    bind_weights(body, rig, [data.weights[i] for i in indices])
    eyes = build_eyes(data, rig)
    eyes.name = f"{name}.eyes"
    eyes.data.materials.clear()
    eyes.data.materials.append(gray)
    # Non-destructive surface preview; the source cage stays editable. This is
    # not the game's mesh budget or a substitute for anatomical shaping.
    for surface in (body, eyes):
        smooth = surface.modifiers.new("ClaySurface", "SUBSURF")
        smooth.levels = 1
        smooth.render_levels = 2
    relaxed_pose(rig, standing_pose)
    if exercise:
        exercise_pose(rig, exercise, standing_pose)
    rig.location.x, rig.rotation_euler.z = x, angle
    return (rig, body, eyes)


def setup_studio(samples):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.resolution_percentage = 100
    scene.render.pixel_aspect_x = scene.render.pixel_aspect_y = 1
    scene.view_settings.view_transform = "AgX"
    scene.world.color = (0.25, 0.25, 0.25)
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.36, 0.36, 0.36, 1)
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.5
    for name, location, energy, size in [
        ("ClayKey", (-3, -4, 5), 650, 5), ("ClayFill", (4, -2, 3), 300, 4),
    ]:
        light = bpy.data.lights.new(name, "AREA")
        light.energy, light.size = energy, size
        obj = bpy.data.objects.new(name, light)
        scene.collection.objects.link(obj)
        obj.location = location
        aim(obj, (0, 0, 0.9))
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -0.015))
    bpy.context.object.name = "ClayFloor"
    bpy.context.object.data.materials.append(material("ClayFloor", (0.24, 0.24, 0.24), 1))
    camera = bpy.data.objects.new("ClayCamera", bpy.data.cameras.new("ClayCamera"))
    scene.collection.objects.link(camera)
    camera.location = (0, -8, 0.98)
    aim(camera, (0, 0, 0.98))
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 3.6
    scene.camera = camera
    return camera


def view_bounds(points):
    return (min(p.x for p in points), max(p.x for p in points),
            min(p.z for p in points), max(p.z for p in points))


def head_points(actor):
    """Evaluated skin/eyes above the upper neck, including skull, ears and nose."""
    rig = actor[0]
    cutoff = min((rig.matrix_world @ rig.pose.bones[name].head).z
                 for name in ("neck02", "head")) - 0.025
    points = []
    graph = bpy.context.evaluated_depsgraph_get()
    for obj in actor[1:]:
        evaluated = obj.evaluated_get(graph)
        mesh = evaluated.to_mesh()
        try:
            for vertex in mesh.vertices:
                point = evaluated.matrix_world @ vertex.co
                if point.z >= cutoff:
                    points.append(point)
        finally:
            evaluated.to_mesh_clear()
    if not points:
        raise ValueError("No evaluated head surface for portrait framing")
    return points


def center_camera(scene, camera, points, width):
    left, right, bottom, top = view_bounds(points)
    camera.location = ((left + right) / 2, -8, (bottom + top) / 2)
    camera.rotation_euler = (math.pi / 2, 0, 0)
    camera.data.type = "ORTHO"
    # Make scale a physical horizontal width even for a portrait-format render.
    camera.data.sensor_fit = "HORIZONTAL"
    camera.data.shift_x = camera.data.shift_y = 0
    camera.data.ortho_scale = width
    bpy.context.view_layer.update()
    projected = [world_to_camera_view(scene, camera, point) for point in points]
    bounds = [min(p.x for p in projected), max(p.x for p in projected),
              min(p.y for p in projected), max(p.y for p in projected)]
    if bounds[0] < 0.01 or bounds[1] > 0.99 or bounds[2] < 0.01 or bounds[3] > 0.99:
        raise AssertionError(f"Review region is cropped by the camera: {bounds}")
    return {"camera_center": list(camera.location), "projected_bounds": bounds,
            "points_checked": len(projected)}


def render_equal_scale_views(scene, camera, rig, views, points_for_view, directory,
                             prefix, resolution, blend_name=None):
    """Fit the widest/tallest projection once; only pan between equal-scale views."""
    scene.render.resolution_x, scene.render.resolution_y = resolution
    aspect = resolution[0] / resolution[1]
    snapshots = []
    for name, angle in views.items():
        rig.rotation_euler.z = angle
        bpy.context.view_layer.update()
        points = points_for_view()
        left, right, bottom, top = view_bounds(points)
        snapshots.append((name, angle, points, max(right - left, (top - bottom) * aspect)))
    width = max(snapshot[3] for snapshot in snapshots) * 1.12
    receipt = {"orthographic_width_m": width, "resolution": list(resolution),
               "sensor_fit": "HORIZONTAL", "views": {}}
    for index, (name, angle, points, _) in enumerate(snapshots):
        rig.rotation_euler.z = angle
        scene.render.filepath = str(directory / f"{prefix}-{name}.png")
        framing = center_camera(scene, camera, points, width)
        framing["rotation_z_radians"] = angle
        framing["orthographic_width_m"] = camera.data.ortho_scale
        receipt["views"][name] = framing
        if index == 0 and blend_name:
            bpy.ops.wm.save_as_mainfile(filepath=str(directory / blend_name))
        bpy.ops.render.render(write_still=True)
    return receipt


def render_portraits(scene, camera, actor, directory, restore_view=True):
    rig = actor[0]
    original_rotation = rig.rotation_euler.copy()
    original_camera = camera.matrix_world.copy()
    original_scale, original_fit = camera.data.ortho_scale, camera.data.sensor_fit
    original_shift = camera.data.shift_x, camera.data.shift_y
    original_resolution = scene.render.resolution_x, scene.render.resolution_y
    receipt = render_equal_scale_views(scene, camera, rig, PORTRAITS, lambda: head_points(actor),
                                       directory, "face", (800, 1000))
    (directory / "portrait-framing.json").write_text(json.dumps(receipt, indent=2), encoding="utf-8")
    rig.rotation_euler = original_rotation
    bpy.context.view_layer.update()
    if restore_view:
        camera.matrix_world = original_camera
        camera.data.ortho_scale, camera.data.sensor_fit = original_scale, original_fit
        camera.data.shift_x, camera.data.shift_y = original_shift
        scene.render.resolution_x, scene.render.resolution_y = original_resolution
        bpy.context.view_layer.update()
    else:
        # The editable head scene opens in the original front view, not a front
        # body left behind under the last profile view's offset camera.
        center_camera(scene, camera, head_points(actor), receipt["orthographic_width_m"])


def detail_points(rig, region, height):
    """Landmark-centred inspection windows, not collision or volume acceptance."""
    def head(name):
        return rig.matrix_world @ rig.pose.bones[name].head
    if region == "shoulders":
        points = [head(name) for name in ("neck02", "spine02", "clavicle.L", "clavicle.R",
                                         "upperarm01.L", "upperarm01.R")]
        padding = height * 0.045
    elif region in ("elbow", "knee"):
        points = [head("lowerarm01.L" if region == "elbow" else "lowerleg01.L")]
        padding = height * (0.075 if region == "elbow" else 0.10)
    elif region == "leg-clearance":
        points = [rig.matrix_world @ endpoint
                  for side in ("L", "R") for name in ("upperleg01", "lowerleg01", "foot")
                  for endpoint in (rig.pose.bones[f"{name}.{side}"].head, rig.pose.bones[f"{name}.{side}"].tail)]
        padding = height * 0.045
    else:
        raise ValueError(f"Unknown joint inspection region: {region}")
    left, right, bottom, top = view_bounds(points)
    return [Vector((x, 0, z)) for x in (left - padding, right + padding)
            for z in (bottom - padding, top + padding)]


def render_joint_details(scene, camera, actor, design, directory):
    rig = actor[0]
    original_rotation = rig.rotation_euler.copy()
    # Opposing oblique views distinguish surface pinching from projection overlap.
    oblique = {"front-oblique": -math.pi / 4, "back-oblique": -3 * math.pi / 4}
    inspections = (
        ("shoulders", "raise_arms", {"front": 0, "back-oblique": -3 * math.pi / 4}, (1000, 900)),
        ("elbow", "bend_elbows", oblique, (900, 900)),
        ("knee", "bend_knee", {"side": -math.pi / 2}, (900, 900)),
        ("leg-clearance", "bend_knee", oblique, (900, 1100)),
    )
    receipt = {"status": "inspection-only; no weights or morphology changed", "regions": {}}
    for region, pose, views, resolution in inspections:
        exercise_pose(rig, pose, design.standing_pose)
        record = render_equal_scale_views(
            scene, camera, rig, views, lambda: detail_points(rig, region, design.identity.height_m),
            directory, f"joint-{region}", resolution, blend_name=f"joint-{region}.blend")
        record["exercise_pose"] = pose
        receipt["regions"][region] = record
    (directory / "joint-framing.json").write_text(json.dumps(receipt, indent=2), encoding="utf-8")
    relaxed_pose(rig, design.standing_pose)
    rig.rotation_euler = original_rotation
    bpy.context.view_layer.update()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--design", required=True, help="Local Python module exporting DESIGN")
    parser.add_argument("--source", required=True)
    parser.add_argument("--compare-approved", help="Approved .blend; read-only body comparison in the same pose")
    parser.add_argument("--output", required=True)
    parser.add_argument("--samples", type=int, default=16)
    parser.add_argument("--deformation", action="store_true")
    parser.add_argument("--portraits", action="store_true")
    parser.add_argument("--portraits-only", action="store_true")
    parser.add_argument("--details-only", action="store_true", help="Only portraits and targeted joint inspection views")
    options = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
    if options.details_only and (options.portraits_only or options.portraits or options.deformation or options.compare_approved):
        parser.error("--details-only cannot be combined with other review modes")
    if options.portraits_only and options.deformation:
        parser.error("--portraits-only cannot be combined with --deformation")
    if options.portraits_only and options.compare_approved:
        parser.error("--portraits-only cannot be combined with --compare-approved")
    design = load_design(options.design)
    source, directory = prepare_build(options.source, options.output, design)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.context.preferences.filepaths.save_version = 0
    data = HumanData(source, design.morphs, design.identity.height_m)
    record = {"character": design.identity.key, "npc_age_years": design.identity.npc_age_years,
              "height_m": design.identity.height_m, "bones": len(data.rig["bones"]),
              "body_vertices": len({i for _, face, _ in data.group_faces("body") for i in face}),
              "design": str(Path(options.design).resolve()), "status": "unapproved-clay-study"}
    (directory / "review.json").write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    gray = material("NeutralClay", (0.40, 0.40, 0.40), 0.85)
    if options.portraits_only or options.details_only:
        actor = add_actor(data, gray, "front", 0, 0, design.standing_pose)
        camera = setup_studio(options.samples)
        scene = bpy.context.scene
        render_portraits(scene, camera, actor, directory, restore_view=False)
        bpy.ops.wm.save_as_mainfile(filepath=str(directory / "head-clay.blend"))
        if options.details_only:
            render_joint_details(scene, camera, actor, design, directory)
        return
    standing = [add_actor(data, gray, name, (index - 1) * 0.9, angle, design.standing_pose)
                for index, (name, angle) in enumerate(VIEWS.items())]
    camera = setup_studio(options.samples)
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = 1800, 1050
    # A separate file preserves the previous dressed experiment unchanged.
    bpy.ops.wm.save_as_mainfile(filepath=str(directory / "body-clay.blend"))
    scene.render.filepath = str(directory / "body-front-side-back.png")
    bpy.ops.render.render(write_still=True)
    if options.portraits:
        render_portraits(scene, camera, standing[0], directory)
    if options.compare_approved:
        from clay_compare import compare_approved
        compare_approved(options.compare_approved, standing[0], standing[1:], design.standing_pose, gray, camera, directory)
    if not options.deformation:
        return
    for actor in standing:
        for obj in actor:
            obj.hide_render = True
            obj.hide_viewport = True
    for index, name in enumerate(REVIEW_POSES):
        add_actor(data, gray, name, (index - 1.5) * 1.02, -0.50 if index < 2 else -math.pi / 2, design.standing_pose, name)
    camera.data.ortho_scale = 4.7
    scene.render.resolution_x, scene.render.resolution_y = 2200, 1000
    scene.render.filepath = str(directory / "body-deformation.png")
    bpy.ops.wm.save_as_mainfile(filepath=str(directory / "body-deformation.blend"))
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main()
