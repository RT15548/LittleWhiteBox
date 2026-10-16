"""Offline roster production: uncovered clay first, then fitted game assets."""

import argparse
import json
import math
from pathlib import Path
import sys

import bpy
from mathutils import Matrix

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))

from authoring import prepare_build
from build import aim, studio
from clay_review import add_actor, setup_studio
from face import build_brows, build_eyes, build_lashes, paint_skin, skin_material
from gameplay_motion import author_gameplay_clips
from makehuman_data import HumanData, SOURCE_COMMIT
from mesh_tools import apply_modifier, bind_weights, build_rig, material, normalize_weights, source_mesh
from motion import REVIEW_POSES, author_clips, relaxed_pose
from roster_designs import DESIGNS, STYLES
from roster_hair import build_roster_hair
from roster_wardrobe import clear_body, fit_wardrobe


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.world = bpy.data.worlds.new("StudioWorld")
    bpy.context.preferences.filepaths.save_version = 0
    bpy.context.preferences.filepaths.file_preview_type = "NONE"


def image(directory, name, width, height):
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.render.filepath = str(directory / f"{name}.png")
    bpy.ops.render.render(write_still=True)


def clay(data, design, directory, samples):
    gray = material("NeutralClay", (.40, .40, .40), .85)
    actors = [add_actor(data, gray, name, (i - 1) * .85, angle, design.standing_pose)
              for i, (name, angle) in enumerate((("front", 0), ("side", math.pi / 2), ("back", math.pi)))]
    camera = setup_studio(samples)
    camera.location.z = design.identity.height_m / 2
    aim(camera, (0, 0, camera.location.z))
    camera.data.ortho_scale = 3.2
    bpy.ops.wm.save_as_mainfile(filepath=str(directory / "anatomy.blend"))
    image(directory, "anatomy", 1440, 1000)
    for actor in actors:
        for obj in actor:
            obj.hide_render = obj.hide_viewport = True
    for i, pose in enumerate(REVIEW_POSES):
        add_actor(data, gray, pose, (i - 1.5) * 1.04, -.45 if i < 2 else -math.pi / 2,
                  design.standing_pose, pose)
    camera.data.ortho_scale = 4.5
    bpy.ops.wm.save_as_mainfile(filepath=str(directory / "deformation.blend"))
    image(directory, "deformation", 1800, 1000)


def dressed(data, design, style, source, patterns, directory, samples):
    rig = build_rig(data)
    body, indices = source_mesh("body.skin", data, data.group_faces("body"), skin_material())
    paint_skin(data, body, indices, style.skin, style.lip_strength)
    bind_weights(body, rig, [data.weights[i] for i in indices])
    subdivision = body.modifiers.new("AnatomySurface", "SUBSURF")
    subdivision.levels = 1
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.modifier_move_up(modifier=subdivision.name)
    apply_modifier(body, subdivision)
    reduction = body.modifiers.new("SkinBudget", "DECIMATE")
    reduction.ratio = .55
    bpy.ops.object.modifier_move_up(modifier=reduction.name)
    apply_modifier(body, reduction)
    normalize_weights(body)
    wardrobe = fit_wardrobe(source, patterns, data, rig)
    clear_body(wardrobe, body)
    shirt = next(obj for obj in wardrobe if obj.get("garment_id") == "shirt")
    objects = [body, build_eyes(data, rig), build_brows(data, body, rig, design.brow_arch),
               build_lashes(data, rig), build_roster_hair(data, rig, body, style, shirt), *wardrobe]
    for obj in objects:
        if not obj.get("asset_role"):
            obj["asset_role"] = obj.name
    rig["character_id"] = design.identity.key
    rig["height_m"] = design.identity.height_m
    rig["source_commit"] = SOURCE_COMMIT
    rig["world_root_motion"] = False
    # Library-linked pattern armatures/actions are not part of the new actor.
    for action in list(bpy.data.actions):
        bpy.data.actions.remove(action)
    author_clips(rig, design.standing_pose, design.walk_arm_clearance)
    author_gameplay_clips(rig, [body], design.standing_pose,
                          contact_scale=design.identity.height_m / PATTERN_HEIGHT)
    rig.animation_data.action = None
    for bone in rig.pose.bones:
        bone.matrix_basis = Matrix.Identity(4)
    bpy.context.scene.frame_set(0)
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(filepath=str(directory / f"{design.identity.key}.glb"), export_format="GLB",
                              use_selection=True, export_extras=True, export_animations=True,
                              export_animation_mode="ACTIONS", export_optimize_animation_keep_anim_armature=True,
                              export_skins=True, export_all_influences=False)
    relaxed_pose(rig, design.standing_pose)
    for obj in wardrobe:
        obj.hide_render = obj.get("garment_id") in ("wraps", "lifejacket")
    camera = studio(samples)
    h = design.identity.height_m
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = h * 1.13
    camera.location = (0, -5, h * .51)
    aim(camera, (0, 0, h * .51))
    bpy.ops.wm.save_as_mainfile(filepath=str(directory / "character.blend"))
    image(directory, "front", 680, 1000)
    camera.location = (3.3, -4.5, h * .62)
    aim(camera, (0, 0, h * .51))
    image(directory, "three-quarter", 680, 1000)
    head = rig.pose.bones["head"].head
    camera.data.ortho_scale = .48
    camera.location = (0, -3, head.z + .012)
    aim(camera, (0, 0, head.z + .012))
    image(directory, "portrait", 480, 560)
    for clip, angle in (("rest", (2.8, -4, 1.6)), ("offer", (2.8, -4, 1.6)), ("dead", (2.5, -3, 2.7))):
        rig.animation_data.action = bpy.data.actions[clip]
        bpy.context.scene.frame_set(12)
        camera.data.ortho_scale = h * 1.18
        camera.location = angle
        aim(camera, (0, -.10, .35 if clip != "offer" else h * .48))
        image(directory, clip, 800, 700)
    statistics = {"character": design.identity.key, "source_commit": SOURCE_COMMIT,
                  "triangles": sum(len(p.vertices) - 2 for obj in objects for p in obj.data.polygons),
                  "asset_bytes": (directory / f"{design.identity.key}.glb").stat().st_size}
    (directory / "asset.json").write_text(json.dumps(statistics, indent=2), encoding="utf-8")
    print(json.dumps(statistics), flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--characters", nargs="+", choices=list(DESIGNS), required=True)
    parser.add_argument("--stage", choices=("clay", "game"), required=True)
    parser.add_argument("--source", required=True)
    parser.add_argument("--patterns", default="output/island-characters/ye-game/ye-game.blend")
    parser.add_argument("--output", required=True)
    parser.add_argument("--samples", type=int, default=12)
    options = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
    for key in options.characters:
        design = DESIGNS[key]
        source, directory = prepare_build(options.source, Path(options.output) / key, design)
        reset()
        data = HumanData(source, design.morphs, design.identity.height_m)
        print(f"PRODUCING {options.stage}: {key}", flush=True)
        if options.stage == "clay":
            clay(data, design, directory, options.samples)
        else:
            dressed(data, design, STYLES[key], source, options.patterns, directory, options.samples)


from ye_design import DESIGN as PATTERN_DESIGN
PATTERN_HEIGHT = PATTERN_DESIGN.identity.height_m

if __name__ == "__main__":
    main()
