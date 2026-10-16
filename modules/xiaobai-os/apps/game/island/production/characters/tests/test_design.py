"""Blender integration tests for explicit designs, local inputs and protected outputs."""

import argparse
from dataclasses import replace
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

import bpy

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from authoring import prepare_build
import build
from design import CATALOG, load_design
from makehuman_data import HumanData
from mesh_tools import build_rig
from motion import relaxed_pose

parser = argparse.ArgumentParser()
parser.add_argument("--source", required=True)
parser.add_argument("--temporary", required=True)
options = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
source = Path(options.source).resolve(strict=True)
temporary = Path(options.temporary).resolve(strict=True)
directory = Path(__file__).resolve().parents[1]


class CharacterDesignTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.lin = load_design(directory / "lin_design.py")
        cls.ye = load_design(directory / "ye_design.py")
        cls.data = HumanData(source, cls.lin.morphs, cls.lin.identity.height_m)

    def test_identity_uses_the_cast_catalog(self):
        catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
        for design in (self.lin, self.ye):
            facts = catalog["npcs"][design.identity.key]
            self.assertEqual(design.identity.height_m, facts["heightMetres"])
            self.assertEqual(design.identity.npc_age_years, facts["age"])
            self.assertEqual(design.identity.gender, facts["gender"])
        self.assertIsNone(self.lin.sample_style)

    def test_independent_morph_changes_geometry_without_changing_height(self):
        reference = HumanData(source, {}, self.lin.identity.height_m)
        changed = HumanData(source, {"hip/hip-scale-horiz-incr.target": 0.5}, self.lin.identity.height_m)
        ids = {i for _, face, _ in reference.group_faces("body") for i in face}
        self.assertGreater(max((changed.vertices[i] - reference.vertices[i]).length for i in ids), 0.001)
        for data in (changed, reference):
            heights = [data.vertices[i].z for i in ids]
            self.assertAlmostEqual(max(heights) - min(heights), self.lin.identity.height_m, places=5)

    def test_body_has_normalized_four_influence_weights(self):
        ids = {i for _, face, _ in self.data.group_faces("body") for i in face}
        for index in ids:
            weights = self.data.weights[index]
            self.assertGreater(len(weights), 0)
            self.assertLessEqual(len(weights), 4)
            self.assertAlmostEqual(sum(weights.values()), 1, places=6)
            self.assertTrue(set(weights) <= set(self.data.rig["bones"]))

    def test_standing_pose_is_explicit_and_has_no_cross_character_state(self):
        rig = build_rig(self.data)
        relaxed_pose(rig, self.lin.standing_pose)
        initial = rig.pose.bones["upperarm01.L"].rotation_quaternion.copy()
        changed = {**self.lin.standing_pose, "upperarm_in": self.lin.standing_pose["upperarm_in"] + 8}
        relaxed_pose(rig, changed)
        self.assertGreater(initial.rotation_difference(rig.pose.bones["upperarm01.L"].rotation_quaternion).angle, 0.05)
        relaxed_pose(rig, self.lin.standing_pose)
        self.assertLess(initial.rotation_difference(rig.pose.bones["upperarm01.L"].rotation_quaternion).angle, 0.001)

    def test_missing_local_morph_does_not_create_output(self):
        output = temporary / "missing-input-must-not-create"
        self.assertFalse(output.exists())
        unavailable = replace(self.lin, morphs={"absent-local-input.target": 1.0})
        with self.assertRaises(FileNotFoundError):
            prepare_build(source, output, unavailable)
        self.assertFalse(output.exists())

    def test_existing_output_is_never_overwritten(self):
        before = sorted(path.name for path in temporary.iterdir())
        with self.assertRaises(FileExistsError):
            prepare_build(source, temporary, self.lin)
        self.assertEqual(sorted(path.name for path in temporary.iterdir()), before)

    def test_unfinished_design_cannot_borrow_ye_hair_and_clothes(self):
        output = temporary / "unfinished-design-must-not-create"
        self.assertFalse(output.exists())
        argv = ["blender", "--", "--design", str(directory / "lin_design.py"),
                "--source", str(source), "--output", str(output)]
        with patch.object(sys, "argv", argv), self.assertRaises(ValueError):
            build.main()
        self.assertFalse(output.exists())


if __name__ == "__main__":
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(CharacterDesignTest))
    if not result.wasSuccessful():
        raise RuntimeError("Character design contracts failed")
