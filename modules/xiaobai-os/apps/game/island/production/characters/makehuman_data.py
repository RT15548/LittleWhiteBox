"""Read CC0 mesh/morph/rig data, without importing the MakeHuman application."""

import json
from pathlib import Path

from mathutils import Vector

SOURCE_COMMIT = "a8bc2d54ff0ac92e78ff71431b1023eda42bf482"


def read_obj(path):
    vertices, uv, faces = [], [], []
    group = ""
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        fields = line.split()
        if not fields or fields[0].startswith("#"):
            continue
        if fields[0] == "v":
            vertices.append(Vector(tuple(map(float, fields[1:4]))))
        elif fields[0] == "vt":
            uv.append(tuple(map(float, fields[1:3])))
        elif fields[0] == "g":
            group = fields[1]
        elif fields[0] == "f":
            corners = [word.split("/") for word in fields[1:]]
            faces.append((group, [int(c[0]) - 1 for c in corners],
                          [int(c[1]) - 1 for c in corners]))
    return vertices, uv, faces


class HumanData:
    def __init__(self, source, morphs, height):
        self.source = Path(source).resolve() / "makehuman/data"
        vertices, self.uv, self.faces = read_obj(self.source / "3dobjs/base.obj")
        for filename, amount in morphs.items():
            for line in (self.source / "targets" / filename).read_text(encoding="utf-8").splitlines():
                fields = line.split()
                if fields and not fields[0].startswith("#"):
                    vertices[int(fields[0])] += Vector(tuple(map(float, fields[1:4]))) * amount
        body_ids = {i for group, face, _ in self.faces if group == "body" for i in face}
        bottom = min(vertices[i].y for i in body_ids)
        self.scale = height / (max(vertices[i].y for i in body_ids) - bottom)
        self.vertices = [Vector((v.x, -v.z, v.y - bottom)) * self.scale for v in vertices]
        self.rig = json.loads((self.source / "rigs/default.mhskel").read_text(encoding="utf-8"))
        weights = json.loads((self.source / "rigs/default_weights.mhw").read_text(encoding="utf-8"))["weights"]
        self.weights = [{} for _ in vertices]
        for name, pairs in weights.items():
            for index, weight in pairs:
                self.weights[index][name] = weight
        # glTF's core skinning uses four influences. Normalize once at this boundary.
        for index, entry in enumerate(self.weights):
            ordered = sorted(entry.items(), key=lambda pair: pair[1], reverse=True)[:4]
            total = sum(weight for _, weight in ordered)
            self.weights[index] = {name: weight / total for name, weight in ordered} if total else {}

    def joint(self, name):
        indices = self.rig["joints"][name]
        return sum((self.vertices[i] for i in indices), Vector()) / len(indices)

    def group_faces(self, group):
        return [face for face in self.faces if face[0] == group]

    def bounds(self, group):
        points = [self.vertices[i] for _, face, _ in self.group_faces(group) for i in face]
        return [(round(min(p[a] for p in points), 4), round(max(p[a] for p in points), 4)) for a in range(3)]
