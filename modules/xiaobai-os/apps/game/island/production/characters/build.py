"""Build the local clothed character sample with Blender; never sends references anywhere."""

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))
from authoring import prepare_build
from design import load_design
from face import build_brows, build_eyes, build_lashes, paint_skin, skin_material
from hair import build_hair
from makehuman_data import HumanData, SOURCE_COMMIT
from mesh_tools import apply_modifier, bind_weights, build_rig, material, normalize_weights, source_mesh
from motion import author_clips, relaxed_pose
from wardrobe import build_wardrobe


def args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--design", required=True, help="Local Python module exporting DESIGN")
    parser.add_argument("--source", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--render", choices=["none", "portrait", "all"], default="all")
    parser.add_argument("--samples", type=int, default=32)
    return parser.parse_args(sys.argv[sys.argv.index("--") + 1:])


def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def studio(samples):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = "AgX"
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.27, 0.32, 0.34, 1)
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.3
    stage = bpy.data.collections.new("ReviewStudio")
    scene.collection.children.link(stage)
    def move(obj):
        for collection in list(obj.users_collection):
            collection.objects.unlink(obj)
        stage.objects.link(obj)
    bpy.ops.mesh.primitive_plane_add(size=200)
    plane = bpy.context.object
    plane.name = "ReviewFloor"
    plane.location.z = -0.005
    plane.data.materials.append(material("ReviewSand", (0.20, 0.24, 0.23), 0.9))
    move(plane)
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 3, 0), rotation=(math.pi / 2, 0, 0))
    backdrop = bpy.context.object
    backdrop.name = "ReviewBackdrop"
    backdrop.data.materials.append(plane.data.materials[0])
    move(backdrop)
    for name, location, power, size, color in [
        ("Key", (-2.5, -3, 4), 450, 3, (1, 0.86, 0.73)),
        ("Fill", (2.5, -1.5, 2.4), 230, 2.5, (0.79, 0.88, 1)),
        ("Rim", (0.5, 2, 3.0), 550, 2, (1, 0.92, 0.8)),
    ]:
        lamp = bpy.data.lights.new(name, "AREA")
        lamp.energy, lamp.shape, lamp.size, lamp.color = power, "DISK", size, color
        obj = bpy.data.objects.new(name, lamp)
        stage.objects.link(obj)
        obj.location = location
        aim(obj, (0, 0, 1.1))
    cam = bpy.data.cameras.new("ReviewCamera")
    obj = bpy.data.objects.new("ReviewCamera", cam)
    stage.objects.link(obj)
    scene.camera = obj
    return obj


def render(camera, directory, name, location, target, width, height, lens):
    camera.location = location
    camera.data.type = "PERSP"
    camera.data.lens = lens
    aim(camera, target)
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.render.filepath = str(directory / f"{name}.png")
    bpy.ops.render.render(write_still=True)


def main():
    options = args()
    design = load_design(options.design)
    if design.sample_style != "ye":
        raise ValueError("This design has no authored clothed sample; use clay_review.py instead")
    source, destination = prepare_build(options.source, options.output, design)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.context.preferences.filepaths.save_version = 0
    data = HumanData(source, design.morphs, design.identity.height_m)
    rig = build_rig(data)
    body, indices = source_mesh("body.skin", data, data.group_faces("body"), skin_material())
    paint_skin(data, body, indices)
    bind_weights(body, rig, [data.weights[i] for i in indices])
    # The exported skin uses the same smooth geometry as the studio render.
    subdivision = body.modifiers.new("AnatomySurface", "SUBSURF")
    subdivision.levels = 1
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.modifier_move_up(modifier=subdivision.name)
    apply_modifier(body, subdivision)
    reduction = body.modifiers.new("SkinBudget", "DECIMATE")
    reduction.ratio = 0.55
    bpy.ops.object.modifier_move_up(modifier=reduction.name)
    apply_modifier(body, reduction)
    normalize_weights(body)
    wardrobe = build_wardrobe(data, rig, body)
    objects = [body, build_eyes(data, rig), build_brows(data, body, rig, design.brow_arch), build_lashes(data, rig),
               build_hair(data, rig, body, wardrobe[0]), *wardrobe]
    for obj in objects:
        obj["asset_role"] = obj.name
    rig["source_commit"] = SOURCE_COMMIT
    rig["sample_status"] = "art-review; not yet wired to game inventory"
    author_clips(rig, design.standing_pose, design.walk_arm_clearance)
    # Export the rest pose and intact separate wardrobe, not a posed static statue.
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(filepath=str(destination / f"{design.identity.key}-sample.glb"), export_format="GLB",
                              use_selection=True, export_extras=True, export_animations=True,
                              export_animation_mode="ACTIONS",
                              export_optimize_animation_keep_anim_armature=False,
                              export_skins=True, export_all_influences=False)
    relaxed_pose(rig, design.standing_pose)
    camera = studio(options.samples)
    camera.location = (2.6, -4.8, 2.2)
    aim(camera, (0, 0, 0.85))
    bpy.context.scene.render.resolution_x, bpy.context.scene.render.resolution_y = 800, 1000
    camera.data.lens = 85
    bpy.ops.wm.save_as_mainfile(filepath=str(destination / f"{design.identity.key}-sample.blend"))
    statistics = {"source_commit": SOURCE_COMMIT, "character": design.identity.key, "height_m": design.identity.height_m,
                  "bones": len(rig.data.bones), "objects": {o.name: {
                      "vertices": len(o.data.vertices),
                      "triangles": sum(len(p.vertices) - 2 for p in o.data.polygons),
                  } for o in objects}}
    (destination / "mesh-statistics.json").write_text(json.dumps(statistics, indent=2), encoding="utf-8")
    print(json.dumps(statistics, indent=2), flush=True)
    if options.render != "none":
        render(camera, destination, "portrait-front", (0, -1.32, 1.52), (0, -0.045, 1.49), 720, 840, 85)
    if options.render == "all":
        render(camera, destination, "portrait-three-quarter", (0.82, -1.28, 1.53), (0, -0.045, 1.48), 720, 840, 85)
        render(camera, destination, "full-front", (0, -4.5, 1.15), (0, -0.025, 0.85), 800, 1100, 70)
        render(camera, destination, "full-side", (3.7, -0.5, 1.35), (0, -0.025, 0.85), 800, 1100, 60)


if __name__ == "__main__":
    main()
