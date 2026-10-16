"""Loose shoulder-draping hair on the existing head; no tie or ponytail root."""

import math

from mathutils import Vector
from mathutils.bvhtree import BVHTree

from hair import drape, hair_material, lock, smooth_path, surface
from mesh_tools import bind_weights, join_meshes


def build_loose_hair(rig, body, shirt, style):
    fringe = style.hair == "loose-fringe"
    eye = rig.data.bones["eye.L"].head_local
    neck = rig.data.bones["neck01"].head_local
    head = rig.data.bones["head"].head_local
    top = max(v.co.z for v in body.data.vertices)
    center = Vector((0, head.y, top - (top - eye.z) * .80))
    skull = [v.co for v in body.data.vertices if v.co.z > eye.z + .015]
    rx = max(abs(p.x) for p in skull) + .004
    ry = max(abs(p.y - center.y) for p in skull) + .005
    rz = top - center.z + .004
    vertices = [v.co.copy() for v in body.data.vertices]
    faces = [list(p.vertices) for p in body.data.polygons]
    head_surface = BVHTree.FromPolygons(vertices, faces)
    offset = len(vertices)
    vertices.extend(v.co.copy() for v in shirt.data.vertices)
    faces.extend([i + offset for i in p.vertices] for p in shirt.data.polygons)
    collider = BVHTree.FromPolygons(vertices, faces)
    fibers, scalp = hair_material(color=style.hair_color), hair_material(scalp=True, color=style.hair_color)
    for mat in (fibers, scalp):
        shader = mat.node_tree.nodes["Principled BSDF"]
        shader.inputs["Roughness"].default_value = .82
        shader.inputs["Specular IOR Level"].default_value = .08

    def crown(theta, angle, lift=.003):
        normal = Vector((math.sin(theta) * math.sin(angle) / rx,
                         -math.sin(theta) * math.cos(angle) / ry, math.cos(theta) / rz)).normalized()
        point = center + Vector((rx * math.sin(theta) * math.sin(angle),
                                -ry * math.sin(theta) * math.cos(angle), rz * math.cos(theta)))
        direction = (point - center).normalized()
        hit, _, _, _ = head_surface.ray_cast(center, direction)
        if hit is not None:
            point = center + direction * max((point - center).length, (hit - center).length + .003)
        return point + normal * lift, normal

    def edge(a):
        return 1.02 + .56 * (1 - math.cos(a))

    rows = [[crown(.008 + row / 24 * edge(math.tau * col / 96), math.tau * col / 96, .001)[0]
             for col in range(97)] for row in range(25)]
    objects = [surface("hair.loose-scalp", rows, scalp, repeat=24)]
    # Each length starts at the crown and falls separately across the upper
    # back. There is no narrow gathered root hidden behind the head.
    for i in range(84):
        a = 1.05 + (math.tau - 2.10) * i / 83
        guides = [crown(.10 + j / 9 * 1.65, a + .04 * math.sin(j / 9 * math.pi), .005)[0]
                  for j in range(10)]
        anchor = guides[-1].copy()
        outward = Vector((math.sin(a), -math.cos(a), 0))
        end_z = neck.z - (.18 if fringe else .22) + .018 * math.cos(a * 2) + .006 * math.sin(i * 1.7)
        for j in range(1, 9):
            t = j / 8
            wave = (.008 if fringe else .003) * math.sin(t * 6 + a) * math.sin(math.pi * t / 2)
            point = anchor + outward * (.030 * math.sin(t * math.pi / 2) + wave - .013 * t**3)
            point.y += .027 * t
            point.z = anchor.z * (1 - t) + end_z * t
            guides.append(point)
        points = smooth_path(guides, 49)
        drape(points, collider, 1, center.z - .02)
        normals = []
        for point in points:
            normal = Vector(tuple((point[k] - center[k]) / (rx, ry, rz)[k] ** 2 for k in range(3))).normalized()
            blend = max(0, min(1, (center.z + .04 - point.z) / .12))
            normals.append(normal.lerp(outward, blend).normalized())
        objects.append(lock(points, normals, .0065 + .0007 * math.sin(i), fibers))
    # Keep Lin's tidy centre part and Xu's soft fringe. Both rear silhouettes
    # remain loose; neither repeats Ye's one-sided mature waved curtain.
    for side in (-1, 1):
        for i in range(19):
            points, normals = [], []
            spread = i / 18
            for j in range(25):
                t = j / 24
                p, n = crown(.10 + spread * .72 + t * .52,
                             side * (.02 + t * (1.25 + spread * .30)), .005)
                points.append(p); normals.append(n)
            objects.append(lock(points, normals, .004, fibers))
    if fringe:
        for i in range(17):
            a = -.65 + i / 16 * 1.3
            points, normals = [], []
            for j in range(29):
                t = j / 28
                p, n = crown(.40 + t * (1.04 + .055 * math.sin(i * 1.8)),
                             a + .10 * math.sin(t * math.pi), .007 + .004 * math.sin(t * math.pi))
                points.append(p); normals.append(n)
            objects.append(lock(points, normals, .0035, fibers))
    result = join_meshes(objects, "body.hair")
    weights = []
    for v in result.data.vertices:
        amount = max(0, min(1, (v.co.z - neck.z + .075) / .17))
        weights.append({bone: value for bone, value in {"head": amount, "spine01": 1 - amount}.items() if value})
    bind_weights(result, rig, weights)
    return result
