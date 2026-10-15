"""Reopen the local game cache and verify the exported character contract.

Run using Blender --background --factory-startup --python-exit-code 1 --python
modules/xiaobai-os/apps/game/island/production/characters/gameplay_check.py.
This check reads files only; it never saves the approved source or cache.
"""

import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))
from gameplay_export import ASSET, OUTPUT, SOURCE, mesh_digest, read_glb, sha, verify_glb
from gameplay_motion import CLIP_FRAMES, world_points


def main():
    record = json.loads((OUTPUT / 'export-check.json').read_text(encoding='utf-8'))
    assert sha(SOURCE) == record['source_sha256_before'] == record['source_sha256_after']
    checked = verify_glb(ASSET, SOURCE.with_suffix('.glb'))
    document, _ = read_glb(ASSET)
    garment_nodes = [node for node in document['nodes'] if 'garment_id' in node.get('extras', {})]
    assert all('mesh' in node and 'skin' in node for node in garment_nodes)
    for node in garment_nodes:
        for primitive in document['meshes'][node['mesh']]['primitives']:
            mat = document['materials'][primitive['material']]
            assert isinstance(mat.get('extras', {}).get('garment_tint'), bool)
    rig_index = next(i for i, node in enumerate(document['nodes']) if node.get('name') == 'Survivor')
    assert all(channel['target']['node'] != rig_index for animation in document['animations'] for channel in animation['channels'])
    bpy.ops.wm.open_mainfile(filepath=str((OUTPUT / 'ye-game.blend').resolve()))
    rig = bpy.data.objects['Survivor']
    assert len(rig.data.bones) == 163
    for name, digest in record['source_mesh_sha256'].items():
        assert mesh_digest(bpy.data.objects[name]) == digest
    objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH' and obj.get('asset_role')
               and obj.get('garment_id') != 'wraps']
    root_matrix = rig.matrix_world.copy()
    clip_checks = {}
    for name, frames in {'idle': 72, 'walk': 30, **CLIP_FRAMES}.items():
        rig.animation_data.action = None
        for bone in rig.pose.bones:
            bone.matrix_basis = Matrix.Identity(4)
        rig.animation_data.action = bpy.data.actions[name]
        samples = []
        for frame in sorted({0, 1, frames // 4, frames // 2, frames - 1, frames}):
            bpy.context.scene.frame_set(frame)
            points = world_points(objects)
            lower, upper = min(p.z for p in points), max(p.z for p in points)
            assert rig.matrix_world == root_matrix
            assert all(abs(value - 1) < 0.0001 for bone in rig.pose.bones for value in bone.scale)
            if name in CLIP_FRAMES:
                assert abs(lower) < 0.008, (name, frame, lower)
            samples.append((frame, lower, upper))
        if name == 'dead':
            assert max(s[2] for s in samples) < 0.45
            assert max(s[2] for s in samples) - min(s[2] for s in samples) < 0.00001
        if name == 'rest':
            assert max(s[2] for s in samples) < 1.05
        clip_checks[name] = samples
    print('GAMEPLAY_REOPEN_CHECK_OK', json.dumps({'export': checked, 'sampled_clip_bounds': clip_checks}), flush=True)


if __name__ == '__main__':
    main()
