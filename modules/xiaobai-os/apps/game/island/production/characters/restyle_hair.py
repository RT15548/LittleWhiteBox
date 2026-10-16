"""Replace only hair in a finished NPC scene; retain anatomy, clothes, rig and clips."""

import argparse
from pathlib import Path
import sys

import bpy
from mathutils import Matrix

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))

from build import aim
from gameplay_motion import ground
from motion import relaxed_pose
from roster_designs import DESIGNS, STYLES
from loose_hair import build_loose_hair


def render(directory, name, width=480, height=600):
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.render.resolution_percentage = 100
    scene.render.filepath = str(directory / f"{name}.png")
    bpy.ops.render.render(write_still=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--character", choices=("lin", "xu"), required=True)
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    options = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
    source = Path(options.input).resolve(strict=True)
    directory = Path(options.output).resolve()
    directory.mkdir(parents=True, exist_ok=False)
    key, design = options.character, DESIGNS[options.character]
    bpy.ops.wm.open_mainfile(filepath=str(source))
    bpy.context.preferences.filepaths.save_version = 0
    rig = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE" and o.get("character_id") == key)
    rig.animation_data.action = None
    for bone in rig.pose.bones:
        bone.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()
    body = next(o for o in bpy.context.scene.objects if o.get("asset_role") == "body.skin")
    hair = next(o for o in bpy.context.scene.objects if o.get("asset_role") == "body.hair")
    shirt = next(o for o in bpy.context.scene.objects if o.get("garment_id") == "shirt")
    bpy.data.objects.remove(hair, do_unlink=True)
    hair = build_loose_hair(rig, body, shirt, STYLES[key])
    hair["asset_role"] = "body.hair"
    objects = [o for o in bpy.context.scene.objects if o.type == "MESH" and o.get("asset_role")]
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
    ground(rig, [o for o in objects if not o.hide_render])
    scene, camera = bpy.context.scene, bpy.context.scene.camera
    scene.cycles.samples = 16
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = .52
    z = rig.pose.bones["head"].head.z - .035
    camera.location = (0, -3, z)
    aim(camera, (0, 0, z))
    bpy.ops.wm.save_as_mainfile(filepath=str(directory / "character.blend"))
    render(directory, "portrait")
    camera.location = (2.5, -3, z)
    aim(camera, (0, 0, z))
    render(directory, "head-side")
    camera.location = (-2, 3, z)
    aim(camera, (0, 0, z))
    render(directory, "head-back")
    h = design.identity.height_m
    camera.data.ortho_scale = h * 1.20
    camera.location = (2.5, -4.5, h * .51)
    aim(camera, (0, 0, h * .51))
    render(directory, "full", 540, 820)
    rig.animation_data.action = bpy.data.actions["offer"]
    scene.frame_set(30)
    render(directory, "offer", 540, 820)
    print("HAIR_SAVED", key, directory, flush=True)


if __name__ == "__main__":
    main()
