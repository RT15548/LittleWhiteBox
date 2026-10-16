"""Build Sanniang's editable source and GLB with Blender. No downloads or paid calls."""

import argparse
import json
import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))
from rig import clips, skeleton, STRIDE
from sanniang import create
from surface import material, merge_by_material


def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    parser.add_argument('--render', action='store_true')
    options = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
    output = Path(options.output).resolve()
    output.mkdir(parents=True, exist_ok=False)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    rig = skeleton()
    create(rig)
    merge_by_material(rig)
    clips(rig)
    bpy.ops.object.select_all(action='SELECT')
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(filepath=str(output / 'sanniang.glb'), export_format='GLB', use_selection=True,
                              export_animations=True, export_animation_mode='ACTIONS', export_skins=True,
                              export_extras=True, export_optimize_animation_keep_anim_armature=False)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    stats = {'triangles': sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes),
             'meshes': len(meshes), 'bones': len(rig.data.bones), 'bytes': (output / 'sanniang.glb').stat().st_size,
             'stride': STRIDE}
    (output / 'statistics.json').write_text(json.dumps(stats, indent=2), encoding='utf8')
    print(json.dumps(stats), flush=True)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.view_settings.view_transform = 'AgX'
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.4, .45, .6, 1)
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .5
    bpy.ops.mesh.primitive_plane_add(size=200)
    bpy.context.object.data.materials.append(material('studio', 'd2d7e1'))
    bpy.context.object.location.z = -.01
    for name, loc, power, color in [('key', (-2, -3, 4), 240, (1, .91, .86)), ('rim', (2, 2, 3), 280, (.76, .84, 1)), ('fill', (2, -1, 2), 100, (.9, .94, 1))]:
        data = bpy.data.lights.new(name, 'AREA')
        data.energy, data.shape, data.size, data.color = power, 'DISK', 3, color
        obj = bpy.data.objects.new(name, data)
        scene.collection.objects.link(obj)
        obj.location = loc
        aim(obj, (0, 0, .9))
    data = bpy.data.cameras.new('review')
    camera = bpy.data.objects.new('review', data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    data.type = 'ORTHO'
    data.ortho_scale = 1.95
    camera.location = (1.4, -4, 2.0)
    aim(camera, (0, 0, .85))
    scene.render.resolution_x, scene.render.resolution_y = 760, 980
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(output / 'sanniang.blend'))
    if options.render:
        for name, loc, target, scale in [('three-quarter', (1.4, -4, 1.9), (0, 0, .85), 1.92),
                                          ('face', (.35, -3, 1.57), (0, 0, 1.47), .54),
                                          ('back', (-1.4, 4, 1.9), (0, 0, .85), 1.92)]:
            camera.location = loc
            data.ortho_scale = scale
            aim(camera, target)
            scene.render.filepath = str(output / f'{name}.png')
            bpy.ops.render.render(write_still=True)


if __name__ == '__main__':
    main()
