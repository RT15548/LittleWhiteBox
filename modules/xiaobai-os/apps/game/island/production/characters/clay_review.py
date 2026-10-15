"""Uncovered adult anatomy review. No clothing, hair, skin colors, or photographs."""

import argparse
import math
import subprocess
import sys
from pathlib import Path

import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).parent))
from face import build_eyes
from makehuman_data import HumanData, SOURCE_COMMIT
from mesh_tools import bind_weights, build_rig, material, source_mesh
from motion import REVIEW_POSES, exercise_pose, relaxed_pose
from ye_design import HEIGHT, MORPHS


VIEWS = {"front": 0, "side": math.pi / 2, "back": math.pi}
PORTRAITS = {"front": 0, "three-quarter": math.pi / 4, "side": math.pi / 2}


def aim(obj, point):
    obj.rotation_euler = (Vector(point) - obj.location).to_track_quat("-Z", "Y").to_euler()


def add_actor(data, gray, name, x, angle, exercise=None):
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
    relaxed_pose(rig)
    if exercise:
        exercise_pose(rig, exercise)
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


def render_portraits(scene, camera, actor, directory, restore_view=True):
    rig = actor[0]
    original_rotation = rig.rotation_euler.copy()
    original_camera = camera.matrix_world.copy()
    original_scale = camera.data.ortho_scale
    original_resolution = scene.render.resolution_x, scene.render.resolution_y
    head = rig.pose.bones["head"]
    camera.location = (rig.location.x, -8, (head.head.z + head.tail.z) / 2 - 0.03)
    camera.rotation_euler = (math.pi / 2, 0, 0)
    camera.data.ortho_scale = 0.36
    scene.render.resolution_x, scene.render.resolution_y = 800, 1000
    for name, angle in PORTRAITS.items():
        rig.rotation_euler.z = angle
        scene.render.filepath = str(directory / f"face-{name}.png")
        bpy.ops.render.render(write_still=True)
    rig.rotation_euler = original_rotation
    if restore_view:
        camera.matrix_world = original_camera
        camera.data.ortho_scale = original_scale
        scene.render.resolution_x, scene.render.resolution_y = original_resolution


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--samples", type=int, default=16)
    parser.add_argument("--deformation", action="store_true")
    parser.add_argument("--portraits", action="store_true")
    parser.add_argument("--portraits-only", action="store_true")
    options = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
    if options.portraits_only and options.deformation:
        parser.error("--portraits-only cannot be combined with --deformation")
    revision = subprocess.check_output(["git", "-C", str(Path(options.source).resolve()), "rev-parse", "HEAD"], text=True).strip()
    if revision != SOURCE_COMMIT:
        raise ValueError(f"Unexpected source revision: {revision}")
    directory = Path(options.output).resolve()
    directory.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.context.preferences.filepaths.save_version = 0
    data = HumanData(options.source, MORPHS, HEIGHT)
    gray = material("NeutralClay", (0.40, 0.40, 0.40), 0.85)
    if options.portraits_only:
        actor = add_actor(data, gray, "front", 0, 0)
        camera = setup_studio(options.samples)
        render_portraits(bpy.context.scene, camera, actor, directory, restore_view=False)
        bpy.ops.wm.save_as_mainfile(filepath=str(directory / "head-clay.blend"))
        return
    standing = [add_actor(data, gray, name, (index - 1) * 0.9, angle)
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
    if not options.deformation:
        return
    for actor in standing:
        for obj in actor:
            obj.hide_render = True
            obj.hide_viewport = True
    for index, name in enumerate(REVIEW_POSES):
        add_actor(data, gray, name, (index - 1.5) * 1.02, -0.50 if index < 2 else -math.pi / 2, name)
    camera.data.ortho_scale = 4.7
    scene.render.resolution_x, scene.render.resolution_y = 2200, 1000
    scene.render.filepath = str(directory / "body-deformation.png")
    bpy.ops.wm.save_as_mainfile(filepath=str(directory / "body-deformation.blend"))
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main()
