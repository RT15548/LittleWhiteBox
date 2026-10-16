"""Print geometry landmarks for an explicitly selected local character design."""

import argparse
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))
from design import load_design
from makehuman_data import HumanData

parser = argparse.ArgumentParser()
parser.add_argument("--design", required=True)
parser.add_argument("--source", required=True)
options = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
design = load_design(options.design)
data = HumanData(options.source, design.morphs, design.identity.height_m)
for group in ["body", "helper-tights", "helper-hair", "helper-l-eye", "joint-mouth", "joint-jaw", "helper-l-eyelashes-1"]:
    faces = data.group_faces(group)
    ids = {i for _, face, _ in faces for i in face}
    print(group, len(ids), len(faces), data.bounds(group), "weighted", sum(bool(data.weights[i]) for i in ids))
for name in ["head", "neck01", "spine01", "spine03", "spine05", "root", "eye.L", "upperarm01.L", "lowerarm01.L", "wrist.L", "upperleg01.L", "lowerleg01.L", "foot.L"]:
    bone = data.rig["bones"][name]
    print(name, tuple(data.joint(bone["head"])), tuple(data.joint(bone["tail"])))
for filename in ["mouth/mouth-upperlip-volume-incr.target", "mouth/mouth-lowerlip-volume-incr.target"]:
    rows = [line.split() for line in (data.source / "targets" / filename).read_text().splitlines() if line and not line.startswith("#")]
    rows.sort(key=lambda row: sum(float(v) ** 2 for v in row[1:]), reverse=True)
    print(filename, [tuple(round(v, 4) for v in data.vertices[int(row[0])]) for row in rows[:6]])
