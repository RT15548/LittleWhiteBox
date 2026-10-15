"""Local, hand-authored surface colors and brows; no photographs are embedded."""

import math
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

from makehuman_data import read_obj
from mesh_tools import bind_weights, join_meshes, material, mesh_object, rigid_bind, source_mesh, tube
from ye_design import BROW_ARCH


def skin_material():
    mat = material("Skin", (1, 1, 1), 0.48)
    shader = mat.node_tree.nodes.get("Principled BSDF")
    colors = mat.node_tree.nodes.new("ShaderNodeVertexColor")
    colors.layer_name = "SkinColor"
    mat.node_tree.links.new(colors.outputs["Color"], shader.inputs["Base Color"])
    shader.inputs["Subsurface Weight"].default_value = 0.055
    shader.inputs["Subsurface Radius"].default_value = (1, 0.42, 0.24)
    shader.inputs["Subsurface Scale"].default_value = 0.018
    return mat


def paint_skin(data, body, indices):
    lip_fields = []
    for region in ("upperlip", "lowerlip"):
        field = {}
        path = data.source / "targets/mouth" / f"mouth-{region}-volume-incr.target"
        for line in path.read_text(encoding="utf-8").splitlines():
            row = line.split()
            if row and not row[0].startswith("#"):
                field[int(row[0])] = abs(float(row[3]))
        peak = max(field.values())
        lip_fields.append({index: value / peak for index, value in field.items()})
    eye = data.joint(data.rig["bones"]["eye.L"]["head"])
    colors = body.data.color_attributes.new(name="SkinColor", type="FLOAT_COLOR", domain="POINT")
    for vertex, source_index in zip(body.data.vertices, indices):
        x, y, z = vertex.co
        color = Vector((0.57, 0.365, 0.272))
        if y < eye.y + 0.02:
            cheek = math.exp(-((abs(x) - eye.x * 1.45) / 0.019) ** 2 - ((z - eye.z + 0.028) / 0.020) ** 2)
            color = color.lerp(Vector((0.61, 0.287, 0.251)), cheek * 0.19)
        # The two lips have independent supports. An ellipse around their
        # pooled centroid biases toward the denser upper-lip topology and cuts
        # away lower-lip pigment when their height or projection changes.
        lip = max(field.get(source_index, 0) for field in lip_fields)
        weight = max(0, min(1, (lip - 0.20) / 0.55))
        color = color.lerp(Vector((0.39, 0.118, 0.116)), weight * 0.82)
        colors.data[vertex.index].color = (*color, 1)


def build_eyes(data, rig):
    directory = data.source / "eyes/low-poly"
    _, uv, faces = read_obj(directory / "low-poly.obj")
    lines = (directory / "low-poly.mhclo").read_text().splitlines()
    start = lines.index("verts 0") + 1
    indices = [int(line) for line in lines[start:] if line.strip()]
    mat = material("BrownEyes", (1, 1, 1), 0.22)
    texture = mat.node_tree.nodes.new("ShaderNodeTexImage")
    texture.image = bpy.data.images.load(str(data.source / "eyes/materials/brown_eye.png"))
    # Keep the source UV layout, but grade the red-brown iris to dark chestnut.
    pixels = np.empty(len(texture.image.pixels), dtype=np.float32)
    texture.image.pixels.foreach_get(pixels)
    rgba = pixels.reshape(-1, 4)
    iris = (rgba[:, 0] > rgba[:, 1] * 1.45) & (rgba[:, 0] > rgba[:, 2] * 1.7)
    rgba[iris, :3] *= (0.24, 0.42, 0.55)
    texture.image.pixels.foreach_set(pixels)
    texture.image.pack()
    shader = mat.node_tree.nodes.get("Principled BSDF")
    mat.node_tree.links.new(texture.outputs["Color"], shader.inputs["Base Color"])
    obj = mesh_object("body.eyes", [data.vertices[i] for i in indices], [f for _, f, _ in faces], mat,
                      [[uv[i] for i in coordinates] for _, _, coordinates in faces])
    bind_weights(obj, rig, [data.weights[i] for i in indices])
    return obj


def build_brows(data, body, rig):
    bvh = BVHTree.FromPolygons([v.co for v in body.data.vertices], [list(p.vertices) for p in body.data.polygons])
    mat = material("Brows", (0.047, 0.024, 0.014), 0.87)
    pieces = []
    for side in (-1, 1):
        bounds = data.bounds("helper-l-eye" if side > 0 else "helper-r-eye")
        inner_x, outer_x = sorted(abs(v) for v in bounds[0])
        start, end = inner_x * 0.73, outer_x + 0.010
        brow_z = bounds[2][1] + 0.007
        # A soft arch, separate from the hairline; keep the ends tapered.
        for row in range(8):
            points, radii = [], []
            for j in range(17):
                t = j / 16
                x = side * (start + t * (end - start) + 0.0005 * (row % 3) * (1 - t))
                arch = BROW_ARCH["height"] * math.sin(math.pi * t ** BROW_ARCH["peak_curve"])
                z = brow_z + arch - BROW_ARCH["tail_drop"] * t + (row - 3.5) * 0.00065 * (1 - t * 0.8)
                hit, _, _, _ = bvh.ray_cast(Vector((x, -0.5, z)), Vector((0, 1, 0)))
                if hit is None:
                    raise ValueError("Brow is outside the head surface")
                points.append(hit + Vector((0, -0.00065, 0)))
                radii.append(0.00036 * (0.1 + math.sin(math.pi * t) * 0.9))
            pieces.append(tube("brow", points, radii, mat, 4, 0.4))
    obj = join_meshes(pieces, "body.brows")
    rigid_bind(obj, rig)
    return obj


def build_lashes(data, rig):
    mat = material("Lashes", (0.035, 0.016, 0.01), 0.77)
    pieces = []
    for side in ["l", "r"]:
        for lid in [1, 2]:
            rows = data.group_faces(f"helper-{side}-eyelashes-{lid}")
            candidates = [data.vertices[i] for i in {i for _, face, _ in rows for i in face}]
            sign = 1 if side == "l" else -1
            inner_x, outer_x = min(abs(p.x) for p in candidates), max(abs(p.x) for p in candidates)
            points = []
            for index in range(20):
                x = sign * (inner_x + index / 19 * (outer_x - inner_x))
                near = sorted(candidates, key=lambda p: abs(p.x - x))[:5]
                inner = max(near, key=lambda p: p.y).copy()
                inner.x = x
                inner.y -= 0.00025
                points.append(inner)
            smooth = [points[0]] + [(points[i - 1] + points[i] * 2 + points[i + 1]) / 4 for i in range(1, 19)] + [points[-1]]
            radii = [(0.00032 if lid == 2 else 0.00014) * (0.15 + 0.85 * math.sin(math.pi * i / 19)) for i in range(20)]
            pieces.append(tube("lash", smooth, radii, mat, 5, 0.7))
    obj = join_meshes(pieces, "body.lashes")
    rigid_bind(obj, rig)
    return obj
