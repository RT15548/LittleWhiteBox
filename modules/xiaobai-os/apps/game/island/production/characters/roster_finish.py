"""Final groom and mesh budget from an authored roster scene, retaining its actions."""

import argparse
import json
from pathlib import Path
import sys

import bpy
from mathutils import Matrix

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))

from authoring import prepare_build
from build import aim
from gameplay_motion import ground
from makehuman_data import HumanData
from mesh_tools import apply_modifier, normalize_weights
from motion import relaxed_pose
from roster_build import image
from roster_designs import DESIGNS, STYLES
from roster_hair import build_roster_hair
from roster_wardrobe import clear_body, fit_standing_seams


def finish(key, source, input_root, output_root, samples):
    design = DESIGNS[key]
    scene_path = (Path(input_root) / key / "character.blend").resolve(strict=True)
    source, directory = prepare_build(source, Path(output_root) / key, design)
    bpy.ops.wm.open_mainfile(filepath=str(scene_path))
    bpy.context.preferences.filepaths.save_version = 0
    rig = next(obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE" and obj.get("character_id") == key)
    rig.animation_data.action = None
    for bone in rig.pose.bones:
        bone.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()
    body = next(obj for obj in bpy.context.scene.objects if obj.get("asset_role") == "body.skin")
    hair = next(obj for obj in bpy.context.scene.objects if obj.get("asset_role") == "body.hair")
    bpy.data.objects.remove(hair, do_unlink=True)
    data = HumanData(source, design.morphs, design.identity.height_m)
    wardrobe = [obj for obj in bpy.context.scene.objects if obj.get("garment_id")]
    clear_body(wardrobe, body)
    fit_standing_seams(wardrobe, body, rig, design.standing_pose)
    shirt = next(obj for obj in wardrobe if obj.get("garment_id") == "shirt")
    hair = build_roster_hair(data, rig, body, STYLES[key], shirt)
    hair["asset_role"] = "body.hair"
    for obj, ratio in ((body, .75), (hair, .75)):
        reduction = obj.modifiers.new("GameSurfaceBudget", "DECIMATE")
        reduction.ratio = ratio
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_move_up(modifier=reduction.name)
        apply_modifier(obj, reduction)
        normalize_weights(obj)
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH" and obj.get("asset_role")]
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.context.scene.frame_set(0)
    bpy.ops.export_scene.gltf(filepath=str(directory / f"{key}.glb"), export_format="GLB", use_selection=True,
                              export_extras=True, export_animations=True, export_animation_mode="ACTIONS",
                              export_optimize_animation_keep_anim_armature=True,
                              export_skins=True, export_all_influences=False)
    relaxed_pose(rig, design.standing_pose)
    ground(rig, [obj for obj in objects if not obj.hide_render])
    scene, h = bpy.context.scene, design.identity.height_m
    scene.cycles.samples = samples
    camera = scene.camera
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = h * 1.20
    camera.location = (0, -5, h * .51)
    aim(camera, (0, 0, h * .51))
    bpy.ops.wm.save_as_mainfile(filepath=str(directory / "character.blend"))
    image(directory, "front", 612, 900)
    camera.location = (3.3, -4.5, h * .62)
    aim(camera, (0, 0, h * .51))
    image(directory, "three-quarter", 612, 900)
    head = rig.pose.bones["head"].head
    camera.data.ortho_scale = .46
    camera.location = (0, -3, head.z + .008)
    aim(camera, (0, 0, head.z + .008))
    image(directory, "portrait", 480, 560)
    # Garment layers are deliberately separate in the exported asset; this
    # studio image shows a working outfit, not the player's live inventory.
    stats = {"character": key,
             "triangles": sum(len(p.vertices) - 2 for obj in objects for p in obj.data.polygons),
             "asset_bytes": (directory / f"{key}.glb").stat().st_size}
    (directory / "asset.json").write_text(json.dumps(stats, indent=2), encoding="utf-8")
    print("FINISHED", json.dumps(stats), flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--characters", nargs="+", choices=list(DESIGNS), required=True)
    parser.add_argument("--source", required=True)
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--samples", type=int, default=12)
    options = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
    for key in options.characters:
        finish(key, options.source, options.input, options.output, options.samples)


if __name__ == "__main__":
    main()
