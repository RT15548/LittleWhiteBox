"""Separate, opaque garment meshes. Their topology is derived from the CC0 fitting cage."""

import math
import bpy
import bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

from mesh_tools import apply_modifier, bind_weights, material, normalize_weights, source_mesh


def cut(obj, plane_point, plane_normal, predicate=None):
    mesh = bmesh.new()
    mesh.from_mesh(obj.data)
    geometry = list(mesh.verts) + list(mesh.edges) + list(mesh.faces)
    if predicate:
        geometry = [element for element in geometry if all(predicate(v.co) for v in
                    ([element] if isinstance(element, bmesh.types.BMVert) else element.verts))]
    bmesh.ops.bisect_plane(mesh, geom=geometry,
                          plane_co=plane_point, plane_no=plane_normal,
                          clear_outer=True, clear_inner=False, dist=0.000001)
    mesh.to_mesh(obj.data)
    mesh.free()


def garment(data, rig, name, mat, lower, upper, offset, sleeves=False):
    rows = data.group_faces("helper-tights")
    if not sleeves:
        rows = [row for row in rows if abs(sum(data.vertices[i].x for i in row[1]) / len(row[1])) < 0.255]
    obj, indices = source_mesh(name, data, rows, mat)
    # Bind before bisect: BMesh interpolates the deform weights at new hem vertices.
    bind_weights(obj, rig, [data.weights[i] for i in indices])
    for vertex in obj.data.vertices:
        vertex.co += vertex.normal * offset
    cut(obj, (0, 0, lower), (0, 0, -1), (lambda p: abs(p.x) < 0.255) if sleeves else None)
    cut(obj, (0, 0, upper), (0, 0, 1))
    return obj


def finish(obj):
    # Geometry modifiers are evaluated before the skin, so the GLB keeps a deformable mesh.
    subdivision = obj.modifiers.new("TailoredSurface", "SUBSURF")
    subdivision.levels = 1
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_move_up(modifier=subdivision.name)
    apply_modifier(obj, subdivision)
    decimate = obj.modifiers.new("GameSurface", "DECIMATE")
    decimate.ratio = 0.34 if obj.name.startswith("clothing.inner") else 0.52
    bpy.ops.object.modifier_move_up(modifier=decimate.name)
    apply_modifier(obj, decimate)
    solid = obj.modifiers.new("FabricThickness", "SOLIDIFY")
    solid.thickness = 0.0014
    solid.offset = 0
    bpy.ops.object.modifier_move_up(modifier=solid.name)
    apply_modifier(obj, solid)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    normalize_weights(obj)


def build_wardrobe(data, rig, body):
    def joint(bone):
        return data.joint(data.rig["bones"][bone]["head"])

    neck, waist = joint("neck01").z, joint("spine03").z
    hip, ankle = joint("upperleg01.L"), joint("foot.L")
    ivory = material("IvoryCotton", (0.74, 0.71, 0.65), 0.82)
    charcoal = material("CharcoalTwill", (0.021, 0.025, 0.029), 0.76)
    inner = material("OpaqueInnerLayer", (0.105, 0.118, 0.115), 0.9)
    shirt = garment(data, rig, "clothing.shirt", ivory, waist + 0.014, neck - 0.014, 0.013, sleeves=True)
    for side, sign in (("L", 1), ("R", -1)):
        elbow, wrist = joint(f"lowerarm01.{side}"), joint(f"wrist.{side}")
        cut(shirt, elbow.lerp(wrist, 0.65), (wrist - elbow).normalized(), lambda p, s=sign: p.x * s > 0.25)
    # Relax the front cloth away from the anatomical fitting cage.
    for vertex in shirt.data.vertices:
        x, y, z = vertex.co
        if abs(x) < 0.145 and waist + 0.075 < z < neck - 0.04 and y < -0.035:
            vertex.co.y -= 0.008 * math.sin(math.pi * (z - waist - 0.075) / (neck - waist - 0.115))
        vertex.co.y += 0.0013 * math.sin(z * 150 + abs(x) * 33) * max(0, 1 - abs(z - waist - 0.045) / 0.075)
    # Fabric spans between the breasts instead of reproducing a skin-tight
    # anatomical cleft. Keep the fitted waist and lateral bust silhouette.
    front = [v.co.copy() for v in shirt.data.vertices if 0.045 < abs(v.co.x) < 0.115 and v.co.y < -0.04]
    for vertex in shirt.data.vertices:
        x, y, z = vertex.co
        if abs(x) < 0.08 and y < -0.04 and waist + 0.10 < z < neck - 0.05:
            nearby = [p.y for p in front if abs(p.z - z) < 0.025]
            if nearby:
                vertex.co.y = min(y, min(nearby) + 0.004)
    trousers = garment(data, rig, "clothing.trousers", charcoal, ankle.z * 0.70, waist + 0.04, 0.008)
    knee = joint("lowerleg01.L")
    for vertex in trousers.data.vertices:
        x, y, z = vertex.co
        if z < hip.z - 0.05:
            sign = 1 if x >= 0 else -1
            lower, upper = (ankle, knee) if z < knee.z else (knee, hip)
            center = lower.lerp(upper, (z - lower.z) / (upper.z - lower.z))
            center.x *= sign
            center.z = z
            direction = vertex.co - center
            direction.z = 0
            amount = 0.005 + 0.009 * max(0, (knee.z - z) / knee.z)
            vertex.co += direction.normalized() * amount
    camisole = garment(data, rig, "clothing.inner-top", inner, waist + 0.045, joint("upperarm01.L").z + 0.025, 0.005)
    cut(camisole, (0.17, 0, 0), (1, 0, 0))
    cut(camisole, (-0.17, 0, 0), (-1, 0, 0))
    shorts = garment(data, rig, "clothing.inner-shorts", inner, hip.z - 0.08, waist + 0.035, 0.005)
    body_surface = BVHTree.FromPolygons([v.co for v in body.data.vertices], [list(p.vertices) for p in body.data.polygons])
    for obj in [shirt, trousers, camisole, shorts]:
        obj["garment_id"] = obj.name.removeprefix("clothing.")
        finish(obj)
        clearance = 0.003 if obj in (camisole, shorts) else 0.006
        for vertex in obj.data.vertices:
            hit, normal, _, _ = body_surface.find_nearest(vertex.co)
            distance = (vertex.co - hit).dot(normal)
            if distance < 0:
                vertex.co += normal * (clearance - distance)
        obj.data.update()
    return [shirt, trousers, camisole, shorts]
