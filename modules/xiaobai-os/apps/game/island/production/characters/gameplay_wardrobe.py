"""Additive game clothing fitted to the approved meshes, never a character rebuild."""

import bpy
import bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

from mesh_tools import bind_weights, join_meshes, material, mesh_object, normalize_weights
from wardrobe import cut


def weight_sampler(obj):
    tree = KDTree(len(obj.data.vertices))
    groups = {g.index: g.name for g in obj.vertex_groups}
    for v in obj.data.vertices:
        tree.insert(v.co, v.index)
    tree.balance()
    def sample(point):
        weights = {}
        for _, index, distance in tree.find_n(point, 4):
            factor = 1 / max(distance, 0.0001) ** 2
            for entry in obj.data.vertices[index].groups:
                name = groups[entry.group]
                weights[name] = weights.get(name, 0) + entry.weight * factor
        entries = sorted(weights.items(), key=lambda item: item[1], reverse=True)[:4]
        total = sum(value for _, value in entries)
        return {name: value / total for name, value in entries}
    return sample


def tree_for(obj):
    return BVHTree.FromPolygons([v.co for v in obj.data.vertices],
                               [list(p.vertices) for p in obj.data.polygons])


def add_lifejacket(rig, shirt):
    # Copy the fitted cloth and interpolated anatomical weights; source stays untouched.
    vest = shirt.copy()
    vest.data = shirt.data.copy()
    bpy.context.collection.objects.link(vest)
    vest.name = "clothing.lifejacket"
    vest.data.materials.clear()
    orange = material("GameVestOrangeFoam", (0.80, 0.205, 0.036), 0.85)
    dark = material("GameVestWebbing", (0.026, 0.037, 0.041), 0.83)
    reflective = material("GameVestReflectiveTape", (0.63, 0.68, 0.65), 0.43, 0.15)
    orange["garment_tint"] = True
    dark["garment_tint"] = False
    reflective["garment_tint"] = False
    vest.data.materials.append(orange)
    for poly in vest.data.polygons:
        poly.material_index = 0
    cut(vest, (0, 0, 1.004), (0, 0, -1))
    # Diagonal arm openings remove all inherited sleeves, not the starting shirt.
    for sign in (-1, 1):
        cut(vest, (sign * 0.163, 0, 1.17), (sign, 0, 0.24))
    # Both sides of the copied fabric shell must use the SAME continuous offset.
    # Mesh normals at its thin cut rims alternate inward/outward; offsetting those
    # normals separately serrates the armholes. A smooth torso field also avoids
    # the previous sign(y) discontinuity and gives the shoulder a vertical allowance.
    for vertex in vest.data.vertices:
        x, y, z = vertex.co
        outward = Vector((x / 0.15 ** 2, (y - 0.005) / 0.14 ** 2,
                          max(0, z - 1.23) / 0.15 ** 2)).normalized()
        shoulder = max(0, min(1, (z - 1.14) / 0.14))
        vertex.co += outward * (0.025 + 0.008 * shoulder)
    vest.data.update()
    sampler = weight_sampler(vest)
    surface = tree_for(vest)
    details = []
    def panel(name, xmin, xmax, zmin, zmax, mat, back=False, columns=16, rows=2):
        vertices, faces = [], []
        for row in range(rows + 1):
            z = zmin + (zmax - zmin) * row / rows
            for col in range(columns + 1):
                x = xmin + (xmax - xmin) * col / columns
                origin = Vector((x, 0.5 if back else -0.5, z))
                direction = Vector((0, -1 if back else 1, 0))
                hit, _, _, _ = surface.ray_cast(origin, direction)
                if hit is None:
                    raise ValueError(f"Vest detail misses fitted shell: {name} {x} {z}")
                hit.y += 0.003 if back else -0.003
                vertices.append(hit)
                if row and col:
                    i = row * (columns + 1) + col
                    face = (i - columns - 2, i - columns - 1, i, i - 1)
                    faces.append(tuple(reversed(face)) if back else face)
        obj = mesh_object(name, vertices, faces, mat)
        bind_weights(obj, rig, [sampler(v) for v in vertices])
        details.append(obj)
    for back in (False, True):
        for height in (1.048, 1.13):
            panel("VestWaistWebbing", -0.108, 0.108, height, height + 0.018, dark, back)
    panel("VestClosure", -0.009, 0.009, 1.014, 1.272, dark, columns=1, rows=20)
    for sign in (-1, 1):
        center = sign * 0.078
        panel("VestReflector", center - 0.014, center + 0.014, 1.225, 1.272, reflective, columns=3, rows=6)
    vest = join_meshes([vest, *details], "clothing.lifejacket")
    vest["garment_id"] = "lifejacket"
    vest["asset_role"] = "clothing.lifejacket"
    normalize_weights(vest)
    return vest


def add_shoes(rig, body, identifier="shoes"):
    wrapped = identifier == "wraps"
    upper_mat = material("GameWrapsCloth" if wrapped else "GameShoesCanvas",
                         (0.48, 0.43, 0.33) if wrapped else (0.038, 0.054, 0.055), 0.9)
    upper_mat["garment_tint"] = True
    sole_mat = material("GameWrapsOverlap" if wrapped else "GameShoesRubber",
                        (0.40, 0.36, 0.28) if wrapped else (0.018, 0.023, 0.023), 0.95)
    sole_mat["garment_tint"] = wrapped
    sampler = weight_sampler(body)
    pieces = []
    for side, sign in (("L", 1), ("R", -1)):
        foot = rig.data.bones[f"foot.{side}"].head_local
        points = [v.co.copy() for v in body.data.vertices
                  if v.co.x * sign > 0.07 and v.co.z < (0.145 if wrapped else 0.116)]
        if not points:
            raise ValueError("Approved body has no foot fitting vertices")
        # A convex upper bridges toe gaps, unlike painted copies of individual toes.
        cage = bmesh.new()
        for point in points:
            point.x = foot.x + (point.x - foot.x) * (1.07 if wrapped else 1.17)
            point.y = foot.y + (point.y - foot.y) * (1.035 if wrapped else 1.085)
            point.z = (-0.003 + point.z * 0.20) if point.z < 0.018 else point.z + (0.0025 if wrapped else 0.006)
            cage.verts.new(point)
        cage.verts.ensure_lookup_table()
        hull = bmesh.ops.convex_hull(cage, input=list(cage.verts), use_existing_faces=False)
        unused = set(hull.get("geom_interior", [])) | set(hull.get("geom_unused", []))
        bmesh.ops.delete(cage, geom=[v for v in unused if isinstance(v, bmesh.types.BMVert)], context="VERTS")
        cage.verts.ensure_lookup_table()
        cage.verts.index_update()
        verts = [v.co.copy() for v in cage.verts]
        faces = [[v.index for v in f.verts] for f in cage.faces]
        cage.free()
        obj = mesh_object(f"GameShoe.{side}", verts, faces, upper_mat)
        obj.data.materials.append(sole_mat)
        for polygon in obj.data.polygons:
            z = polygon.center.z
            if (wrapped and int(z / 0.018) % 2) or (not wrapped and z < 0.022):
                polygon.material_index = 1
        weights = []
        for v in verts:
            # Toes are enclosed by one shoe, but the ankle still follows the fitted shin.
            inherited = sampler(v)
            amount = sum(w for name, w in inherited.items() if name.startswith("lowerleg"))
            amount *= max(0, min(1, (v.z - 0.065) / 0.055))
            weights.append({f"foot.{side}": 1 - amount, f"lowerleg02.{side}": amount})
        bind_weights(obj, rig, weights)
        pieces.append(obj)
    shoes = join_meshes(pieces, f"clothing.{identifier}")
    shoes["garment_id"] = identifier
    shoes["asset_role"] = f"clothing.{identifier}"
    normalize_weights(shoes)
    return shoes


def add_gameplay_wardrobe(rig, body, shirt):
    return [add_lifejacket(rig, shirt), add_shoes(rig, body), add_shoes(rig, body, "wraps")]
