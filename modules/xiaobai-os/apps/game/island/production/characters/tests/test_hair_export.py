"""Blender integration check: exported hair must keep its cutout texture.

Run with Blender --background --factory-startup --python-exit-code 1 --python
this_file.py. Uses only a temporary directory, never a character work file.
"""

import json
import struct
import sys
import tempfile
import unittest
from pathlib import Path

import bpy
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from hair import hair_material, surface


class HairExportTest(unittest.TestCase):
    def test_packed_cutout_survives_blend_and_gltf(self):
        with tempfile.TemporaryDirectory(prefix="island-hair-export-") as directory:
            destination = Path(directory)
            bpy.ops.object.select_all(action="SELECT")
            bpy.ops.object.delete(use_global=False)
            obj = surface("ExportFixture", [[(-0.01, 0, 0), (0.01, 0, 0)],
                                             [(-0.01, 0, -0.1), (0.01, 0, -0.1)]], hair_material())
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.wm.save_as_mainfile(filepath=str(destination / "fixture.blend"))
            # Saving/reopening matters: an RGB generated image can appear to
            # have alpha in memory but silently lose it in the packed PNG.
            bpy.ops.wm.open_mainfile(filepath=str(destination / "fixture.blend"))
            bpy.ops.export_scene.gltf(filepath=str(destination / "fixture.glb"), export_format="GLB",
                                     use_selection=True, export_animations=False)
            binary = (destination / "fixture.glb").read_bytes()
            json_size = struct.unpack_from("<I", binary, 12)[0]
            gltf = json.loads(binary[20:20 + json_size])
            mat = gltf["materials"][gltf["meshes"][0]["primitives"][0]["material"]]
            self.assertEqual(mat["alphaMode"], "MASK")
            self.assertIn("normalTexture", mat)
            texture = gltf["textures"][mat["pbrMetallicRoughness"]["baseColorTexture"]["index"]]
            image = gltf["images"][texture["source"]]
            self.assertEqual(image["mimeType"], "image/png")
            view = gltf["bufferViews"][image["bufferView"]]
            offset = 28 + json_size + view.get("byteOffset", 0)
            image_path = destination / "exported-color.png"
            image_path.write_bytes(binary[offset:offset + view["byteLength"]])
            loaded = bpy.data.images.load(str(image_path))
            alpha = np.array(loaded.pixels[:]).reshape(-1, 4)[:, 3]
            self.assertLess(float(alpha.min()), 0.01)
            self.assertGreater(float(alpha.max()), 0.99)
            self.assertGreater(float(np.mean(alpha < 0.5)), 0.05)
            self.assertGreater(float(np.mean(alpha >= 0.5)), 0.50)


if __name__ == "__main__":
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(HairExportTest))
    if not result.wasSuccessful():
        raise RuntimeError("Hair export contract failed")
