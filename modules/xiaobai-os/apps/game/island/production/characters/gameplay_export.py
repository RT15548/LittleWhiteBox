"""Export approved Ye for gameplay without rebuilding or saving over its source.

Run with Blender --factory-startup --python gameplay_export.py -- --render.
Only the character selection is exported. Source / review materials are not rebuilt.
"""

import argparse
import bisect
import hashlib
import json
import struct
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))
from gameplay_motion import CLIP_FRAMES, HAND_BONE, author_gameplay_clips, world_points
from gameplay_wardrobe import add_gameplay_wardrobe
from motion import relaxed_pose

SOURCE = Path("output/island-characters/ye-hair-review/ye-sample.blend")
OUTPUT = Path("output/island-characters/ye-game")
ASSET = Path("modules/xiaobai-os/apps/game/island/assets/characters/ye.glb")


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def mesh_digest(obj):
    record = {"vertices": [tuple(v.co) for v in obj.data.vertices],
              "polygons": [tuple(p.vertices) for p in obj.data.polygons],
              "weights": [[(obj.vertex_groups[g.group].name, g.weight) for g in v.groups]
                          for v in obj.data.vertices],
              "uv": [[tuple(item.uv) for item in layer.data] for layer in obj.data.uv_layers],
              "materials": [m.name for m in obj.data.materials],
              "transform": [list(row) for row in obj.matrix_world]}
    return hashlib.sha256(json.dumps(record, sort_keys=True).encode()).hexdigest()


def action_digest(action):
    channels = []
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for curve in bag.fcurves:
                    channels.append((curve.data_path, curve.array_index,
                                     [(tuple(k.co), tuple(k.handle_left), tuple(k.handle_right), k.interpolation)
                                      for k in curve.keyframe_points]))
    return hashlib.sha256(json.dumps(channels).encode()).hexdigest()


def read_glb(path):
    data = path.read_bytes()
    magic, version, length = struct.unpack_from("<III", data)
    assert magic == 0x46546C67 and version == 2 and length == len(data)
    size, kind = struct.unpack_from("<II", data, 12)
    assert kind == 0x4E4F534A
    document = json.loads(data[20:20 + size])
    binary_size, binary_kind = struct.unpack_from("<II", data, 20 + size)
    assert binary_kind == 0x004E4942
    return document, data[28 + size:28 + size + binary_size]


def accessor_bytes(document, binary, index):
    accessor = document["accessors"][index]
    view = document["bufferViews"][accessor["bufferView"]]
    count = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}[accessor["type"]]
    width = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}[accessor["componentType"]] * count
    start = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    stride = view.get("byteStride", width)
    return b"".join(binary[start + i * stride:start + i * stride + width] for i in range(accessor["count"]))


def animation_equivalence(source, source_binary, document, binary):
    def values(doc, data, accessor):
        packed = accessor_bytes(doc, data, accessor)
        floats = struct.unpack('<' + 'f' * (len(packed) // 4), packed)
        width = {"SCALAR": 1, "VEC3": 3, "VEC4": 4}[doc['accessors'][accessor]['type']]
        return [floats[i:i + width] for i in range(0, len(floats), width)]
    def channels(doc, data, name):
        animation = next(a for a in doc['animations'] if a['name'] == name)
        result = {}
        for channel in animation['channels']:
            target = channel['target']
            sampler = animation['samplers'][channel['sampler']]
            key = (doc['nodes'][target['node']]['name'], target['path'])
            result[key] = ([v[0] for v in values(doc, data, sampler['input'])], values(doc, data, sampler['output']))
        return result
    result = {}
    for name in ('idle', 'walk'):
        old, new = channels(source, source_binary, name), channels(document, binary, name)
        worst = 0.0
        for key, (times, samples) in old.items():
            new_times, new_samples = new[key]
            for time, sample in zip(times, samples):
                index = max(0, min(len(new_times) - 1, bisect.bisect_right(new_times, time) - 1))
                value = new_samples[index]
                if index + 1 < len(new_times):
                    weight = (time - new_times[index]) / (new_times[index + 1] - new_times[index])
                    other = new_samples[index + 1]
                    if key[1] == 'rotation' and sum(a * b for a, b in zip(value, other)) < 0:
                        other = tuple(-v for v in other)
                    value = tuple(a * (1 - weight) + b * weight for a, b in zip(value, other))
                if key[1] == 'rotation' and sum(a * b for a, b in zip(value, sample)) < 0:
                    value = tuple(-v for v in value)
                worst = max(worst, max(abs(a - b) for a, b in zip(value, sample)))
        assert worst < 0.00002, f'Approved {name} changed: {worst}'
        result[name] = {'max_component_difference': worst, 'source_channels_checked': len(old)}
    return result


def verify_glb(path, source_path):
    document, binary = read_glb(path)
    source, source_binary = read_glb(source_path)
    original_meshes = {m["name"]: m for m in source["meshes"]}
    exported_meshes = {m["name"]: m for m in document["meshes"]}
    geometry = {}
    for name, original in original_meshes.items():
        result = exported_meshes[name]
        checks = []
        assert len(original["primitives"]) == len(result["primitives"])
        for old, new in zip(original["primitives"], result["primitives"]):
            for semantic, accessor in old["attributes"].items():
                same = accessor_bytes(source, source_binary, accessor) == accessor_bytes(document, binary, new["attributes"][semantic])
                checks.append(same)
                if not same:
                    raise AssertionError(f"Approved geometry changed during export: {name} {semantic}")
            assert accessor_bytes(source, source_binary, old["indices"]) == accessor_bytes(document, binary, new["indices"])
        geometry[name] = all(checks)
    durations = {}
    channels = {}
    for animation in document["animations"]:
        durations[animation["name"]] = max(document["accessors"][s["input"]]["max"][0] for s in animation["samplers"])
        channels[animation["name"]] = len(animation["channels"])
    assert set(durations) == {"idle", "walk", *CLIP_FRAMES}
    assert abs(durations["idle"] - 2.4) < 1e-5 and abs(durations["walk"] - 1) < 1e-5
    assert all(len(skin["joints"]) == 163 for skin in document["skins"])
    assert not any(n.get("name", "").startswith("Review") or "camera" in n for n in document["nodes"])
    tags = {n["extras"]["garment_id"]: n["name"] for n in document["nodes"] if "garment_id" in n.get("extras", {})}
    assert set(tags) == {"shirt", "trousers", "inner-top", "inner-shorts", "lifejacket", "shoes", "wraps"}
    images = {}
    for image in document.get("images", []):
        view = document["bufferViews"][image["bufferView"]]
        start = view.get("byteOffset", 0)
        images[image["name"]] = hashlib.sha256(binary[start:start + view["byteLength"]]).hexdigest()
    for image in source.get("images", []):
        view = source["bufferViews"][image["bufferView"]]
        start = view.get("byteOffset", 0)
        assert images[image["name"]] == hashlib.sha256(source_binary[start:start + view["byteLength"]]).hexdigest()
    masked = [m["name"] for m in document["materials"] if m.get("alphaMode") == "MASK"]
    assert masked, "Original hair alpha masking must survive"
    return {"mesh_count": len(document["meshes"]), "bones": 163, "clips_seconds": durations,
            "source_clips_equivalent": animation_equivalence(source, source_binary, document, binary),
            "animation_channels": channels, "garments": tags, "approved_geometry_identical": geometry,
            "embedded_image_sha256": images, "alpha_mask_materials": masked,
            "bytes": path.stat().st_size}


def select_character(rig, objects):
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = rig


def posed_bounds(objects):
    points = world_points(objects)
    return {"min": [min(p[i] for p in points) for i in range(3)],
            "max": [max(p[i] for p in points) for i in range(3)]}


def render_pose(rig, objects, output, clip, frame, position, target, span, live=False):
    if not live:
        rig.animation_data.action = bpy.data.actions[clip]
        bpy.context.scene.frame_set(frame)
    camera = bpy.context.scene.camera
    camera.location = position
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = span
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 12
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 900
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(output / f"pose-{clip}.png")
    bpy.ops.render.render(write_still=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--render", action="store_true")
    options = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    source, output, asset = SOURCE.resolve(), OUTPUT.resolve(), ASSET.resolve()
    assert source != output / "ye-game.blend"
    before = sha(source)
    output.mkdir(parents=True, exist_ok=True)
    asset.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.open_mainfile(filepath=str(source))
    rig = bpy.data.objects["Survivor"]
    approved = [o for o in bpy.context.scene.objects if o.type == "MESH" and o.get("asset_role")]
    assert len(approved) == 9 and len(rig.data.bones) == 163
    source_mesh_hashes = {o.name: mesh_digest(o) for o in approved}
    source_actions = {name: action_digest(bpy.data.actions[name]) for name in ("idle", "walk")}
    rig.animation_data.action = None
    for bone in rig.pose.bones:
        bone.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()
    for obj in approved:
        if obj.get("garment_id"):
            for mat in obj.data.materials:
                mat["garment_tint"] = True
    additions = add_gameplay_wardrobe(rig, bpy.data.objects["body.skin"], bpy.data.objects["clothing.shirt"])
    objects = [*approved, *additions]
    # Wraps are an alternative to shoes, not simultaneously worn starting clothing.
    starting = [o for o in objects if o.get("garment_id") != "wraps"]
    author_gameplay_clips(rig, starting)
    assert source_mesh_hashes == {o.name: mesh_digest(o) for o in approved}
    assert source_actions == {name: action_digest(bpy.data.actions[name]) for name in source_actions}
    contract = {"character_id": "ye", "height_m": 1.60, "world_root": rig.name,
                "root_bone": "root", "head_bone": "head", "hand_bone": HAND_BONE,
                "hand_tip_bone": "finger3-1.R", "forward_axis_gltf": "+Z", "up_axis_gltf": "+Y",
                "world_root_motion": False, "clip_grounding": "authored bone-local; no runtime crouch/death offset",
                "clips": ["idle", "walk", *CLIP_FRAMES],
                "garment_tag": "garment_id", "material_tint_tag": "garment_tint"}
    for key, value in contract.items():
        rig[key] = value
    rig["sample_status"] = "gameplay-export-from-approved; source-geometry-preserved"
    rig["source_blend_sha256"] = before
    bounds = {}
    for name, frames in {"idle": 72, "walk": 30, **CLIP_FRAMES}.items():
        rig.animation_data.action = bpy.data.actions[name]
        bounds[name] = []
        for frame in (0, frames // 4, frames // 2, frames):
            bpy.context.scene.frame_set(frame)
            bounds[name].append({"frame": frame, **posed_bounds(starting)})
        if name in CLIP_FRAMES:
            assert all(abs(sample['min'][2]) < 0.008 for sample in bounds[name]), f'{name} loses ground contact'
        if name in ('rest', 'dead'):
            maximum = 1.05 if name == 'rest' else 0.45
            assert all(sample['max'][2] < maximum for sample in bounds[name]), f'{name} has incorrect height'
    rig.animation_data.action = None
    for bone in rig.pose.bones:
        bone.matrix_basis = Matrix.Identity(4)
    bpy.context.scene.frame_set(0)
    bpy.context.view_layer.update()
    select_character(rig, objects)
    bpy.ops.export_scene.gltf(filepath=str(asset), export_format="GLB", use_selection=True,
                              export_extras=True, export_animations=True, export_animation_mode="ACTIONS",
                              export_optimize_animation_keep_anim_armature=True,
                              export_skins=True, export_all_influences=False)
    checked = verify_glb(asset, source.with_suffix(".glb"))
    relaxed_pose(rig)
    bpy.data.objects["clothing.wraps"].hide_render = True
    bpy.context.preferences.filepaths.save_version = 0
    bpy.context.preferences.filepaths.file_preview_type = 'NONE'
    bpy.ops.wm.save_as_mainfile(filepath=str(output / "ye-game.blend"))
    if options.render:
        render_pose(rig, starting, output, "rest", 12, (2.8, -3.6, 1.8), (0, -0.10, 0.61), 1.65)
        render_pose(rig, starting, output, "offer", 15, (2.4, -4.1, 1.95), (0, -0.07, 0.82), 1.88)
    after = sha(source)
    assert before == after, "Approved source file changed"
    result = {"contract": contract, "validation": checked, "source_sha256_before": before,
              "source_sha256_after": after, "source_actions_sha256": source_actions,
              "source_mesh_sha256": source_mesh_hashes, "sampled_bounds_m": bounds}
    (output / "export-check.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print("GAMEPLAY_EXPORT_OK", json.dumps(result, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
