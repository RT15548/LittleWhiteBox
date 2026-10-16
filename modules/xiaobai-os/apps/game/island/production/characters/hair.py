"""Side-parted layered waves fitted to the authored head, without photographic textures."""

import math
import random
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

from mesh_tools import bind_weights, join_meshes, material, mesh_object


def hair_material(*, scalp=False, color=(0.100, 0.059, 0.037)):
    """Cutout fibers export as glTF MASK, not depth-sorted transparent sheets."""
    width, height = 512, 1024
    u, v = np.meshgrid(np.linspace(0, 1, width), np.linspace(0, 1, height))
    rng = np.random.default_rng(145)
    alpha = np.zeros_like(u)
    shade = np.zeros_like(u)
    fiber_count = 24
    for index in range(fiber_count):
        root = (index + rng.uniform(0.25, 0.75)) / fiber_count
        strand = root + 0.0018 * np.sin(v * 8 + rng.uniform(0, math.tau))
        fiber = np.exp(-((u - strand) / rng.uniform(0.010, 0.017)) ** 2)
        tip = rng.uniform(0.78, 1.06)
        length = np.clip((tip - v) / 0.035, 0, 1)
        # Coverage is denser than color variation. Using the narrow pigment
        # ridges as opacity leaves a visible chopped band above the tips.
        coverage = np.exp(-((u - strand) / rng.uniform(0.023, 0.032)) ** 2) * length
        alpha = np.maximum(alpha, coverage)
        shade = np.maximum(shade, fiber * rng.uniform(0.50, 1.0))
    # The dense roots merge into the scalp; separated fibers break up the ends.
    edges = np.clip(np.minimum(u, 1 - u) / 0.055, 0, 1)
    alpha = np.maximum(alpha, np.clip((0.76 - v) / 0.12, 0, 1) * edges)
    alpha *= edges
    grain = shade.copy()
    shade = 0.43 + shade * 0.57
    pixels = np.ones((height, width, 4), dtype=np.float32)
    for channel, base in enumerate(color):
        pixels[:, :, channel] = base * shade
    if not scalp:
        pixels[:, :, 3] = alpha
    image = bpy.data.images.new("ChestnutScalp" if scalp else "ChestnutFibers", width, height, alpha=not scalp)
    image.alpha_mode = "STRAIGHT"
    image.pixels.foreach_set(pixels.ravel())
    image.pack()
    mat = material("ChestnutScalp" if scalp else "ChestnutHair", (0.035, 0.020, 0.012), 0.70)
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Specular IOR Level"].default_value = 0.15
    shader.inputs["Anisotropic"].default_value = 0.50
    shader.inputs["Anisotropic Rotation"].default_value = 0.25
    texture = mat.node_tree.nodes.new("ShaderNodeTexImage")
    texture.image = image
    mat.node_tree.links.new(texture.outputs["Color"], shader.inputs["Base Color"])
    # Tangent-space relief breaks broad plastic highlights into fine fibers.
    # It is an actual packed normal map, so the browser receives the same detail.
    slope = np.gradient(grain, axis=1) * 1.5
    normal_pixels = np.ones_like(pixels)
    normal_pixels[:, :, 0] = 0.5 - slope / (2 * np.sqrt(1 + slope * slope))
    normal_pixels[:, :, 1] = 0.5
    normal_pixels[:, :, 2] = 0.5 + 1 / (2 * np.sqrt(1 + slope * slope))
    relief = bpy.data.images.new("ScalpFiberNormal" if scalp else "HairFiberNormal", width, height)
    relief.colorspace_settings.name = "Non-Color"
    relief.pixels.foreach_set(normal_pixels.ravel())
    relief.pack()
    normal_texture = mat.node_tree.nodes.new("ShaderNodeTexImage")
    normal_texture.image = relief
    normal = mat.node_tree.nodes.new("ShaderNodeNormalMap")
    mat.node_tree.links.new(normal_texture.outputs["Color"], normal.inputs["Color"])
    mat.node_tree.links.new(normal.outputs["Normal"], shader.inputs["Normal"])
    if not scalp:
        cutoff = mat.node_tree.nodes.new("ShaderNodeMath")
        cutoff.operation = "ROUND"
        mat.node_tree.links.new(texture.outputs["Alpha"], cutoff.inputs[0])
        mat.node_tree.links.new(cutoff.outputs[0], shader.inputs["Alpha"])
    return mat


def surface(name, rows, mat, repeat=1):
    vertices, faces, uv = [], [], []
    width = len(rows[0])
    for row, points in enumerate(rows):
        vertices.extend(points)
        if row:
            for col in range(width - 1):
                i = row * width + col
                faces.append((i, i + 1, i - width + 1, i - width))
                uv.append([(repeat * col / (width - 1), row / (len(rows) - 1)),
                           (repeat * (col + 1) / (width - 1), row / (len(rows) - 1)),
                           (repeat * (col + 1) / (width - 1), (row - 1) / (len(rows) - 1)),
                           (repeat * col / (width - 1), (row - 1) / (len(rows) - 1))])
    return mesh_object(name, vertices, faces, mat, uv)


def smooth_path(guides, steps):
    """Distance-parametrized Hermite guides keep crown and drape tangent-continuous."""
    lengths = [0.0]
    for before, after in zip(guides, guides[1:]):
        lengths.append(lengths[-1] + (after - before).length)
    tangents = [(guides[1] - guides[0]) / lengths[1]]
    for index in range(1, len(guides) - 1):
        tangents.append((guides[index + 1] - guides[index - 1]) / (lengths[index + 1] - lengths[index - 1]))
    tangents.append((guides[-1] - guides[-2]) / (lengths[-1] - lengths[-2]))
    points, segment = [], 0
    for step in range(steps):
        distance = lengths[-1] * step / (steps - 1)
        while segment < len(guides) - 2 and distance > lengths[segment + 1]:
            segment += 1
        span = lengths[segment + 1] - lengths[segment]
        t = (distance - lengths[segment]) / span
        points.append((2 * t**3 - 3 * t**2 + 1) * guides[segment]
                      + (t**3 - 2 * t**2 + t) * span * tangents[segment]
                      + (-2 * t**3 + 3 * t**2) * guides[segment + 1]
                      + (t**3 - t**2) * span * tangents[segment + 1])
    return points


def drape(points, collider, direction, below):
    """Spread garment clearance along the lock, instead of kinking individual rows."""
    distances = [0.0]
    for before, after in zip(points, points[1:]):
        distances.append(distances[-1] + (after - before).length)
    pushes = []
    for index, point in enumerate(points):
        if point.z > below:
            continue
        hit, _, _, _ = collider.ray_cast(Vector((point.x, direction * 0.6, point.z)), Vector((0, -direction, 0)))
        if hit is not None:
            clearance = direction * (hit.y - point.y) + 0.016
            if clearance > 0:
                pushes.append((distances[index], clearance))
    for point, distance in zip(points, distances):
        displacement = max((amount * math.exp(-0.5 * ((distance - origin) / 0.045)**2)
                            for origin, amount in pushes), default=0)
        point.y += direction * displacement


def lock(points, normals, width, mat):
    rows = []
    for index, (point, normal) in enumerate(zip(points, normals)):
        t = index / (len(points) - 1)
        tangent = points[min(index + 1, len(points) - 1)] - points[max(index - 1, 0)]
        across = normal.cross(tangent).normalized()
        taper = 0.22 + 0.78 * (1 - t ** 3)
        rows.append([point + across * (k / 2 - 1) * width * taper
                     + normal * (1 - (k / 2 - 1) ** 2) * width * 0.16 for k in range(5)])
    return surface("hair.lock", rows, mat)


def build_hair(data, rig, body, shirt, *, color=(0.100, 0.059, 0.037), length_scale=1.0, wave_scale=1.0):
    rng, mat = random.Random(145), hair_material(color=color)
    vertices = [v.co.copy() for v in body.data.vertices]
    faces = [list(p.vertices) for p in body.data.polygons]
    offset = len(vertices)
    vertices.extend(v.co.copy() for v in shirt.data.vertices)
    faces.extend([index + offset for index in p.vertices] for p in shirt.data.polygons)
    drape_surface = BVHTree.FromPolygons(vertices, faces)
    top = max(v.co.z for v in body.data.vertices)
    neck = data.joint(data.rig["bones"]["neck01"]["head"])
    head = data.joint(data.rig["bones"]["head"]["head"])
    center = Vector((0, head.y, top - 0.097))
    eye_z = data.joint(data.rig["bones"]["eye.L"]["head"]).z
    crown = [v.co for v in body.data.vertices if v.co.z > eye_z + 0.02]
    radii = Vector((max(abs(p.x) for p in crown) + 0.005,
                    max(abs(p.y - center.y) for p in crown) + 0.005, top - center.z + 0.004))

    def project(point, offset):
        # A smooth crown envelope avoids wrapping the hair into ear folds.
        direction = (point - center).normalized()
        radius = 1 / math.sqrt(sum((direction[i] / radii[i]) ** 2 for i in range(3)))
        hit = center + direction * radius
        normal = Vector(tuple((hit[i] - center[i]) / radii[i] ** 2 for i in range(3))).normalized()
        return hit + normal * offset, normal

    objects, rows = [], []
    for row in range(25):
        points = []
        for col in range(97):
            a = math.tau * col / 96
            theta = 0.005 + row / 24 * (0.94 + 0.58 * (1 - math.cos(a)) + 0.10 * math.sin(a))
            direction = Vector((0.086 * math.sin(theta) * math.sin(a),
                                -0.10 * math.sin(theta) * math.cos(a), 0.114 * math.cos(theta)))
            point, _ = project(center + direction, 0.003)
            points.append(point)
        rows.append(points)
    objects.append(surface("hair.scalp", rows, hair_material(scalp=True, color=color), repeat=24))

    # Overlapping individual lengths, not a continuous shoulder-length sheet.
    for index in range(68):
        angle = 1.05 + (math.tau - 2.10) * index / 67
        phase = 0.8 * math.sin(angle * 3) + rng.uniform(-0.16, 0.16)
        length = (0.30 + 0.025 * math.cos(angle * 2) + rng.uniform(-0.014, 0.014)) * length_scale
        guides = []
        for step in range(8):
            q = step / 7
            theta = 0.22 + q * 1.53
            a = angle + 0.14 * math.sin(q * math.pi)
            direction = Vector((0.085 * math.sin(theta) * math.sin(a),
                                -0.102 * math.sin(theta) * math.cos(a), 0.115 * math.cos(theta)))
            point, normal = project(center + direction, 0.006 + 0.004 * math.sin(q * math.pi))
            guides.append(point)
        anchor = guides[-1]
        outward = Vector((math.sin(angle), -math.cos(angle), 0))
        for step in range(1, 7):
            r = step / 6
            wave = 0.016 * wave_scale * (math.sin(r * 9 + phase) - math.sin(phase)) * math.sin(r * math.pi / 2)
            point = anchor + outward * (0.014 * r + wave)
            point.z -= length * r
            point.y += 0.017 * r
            guides.append(point)
        points = smooth_path(guides, 49)
        drape(points, drape_surface, 1, center.z - 0.02)
        normals = []
        for point in points:
            _, crown_normal = project(point, 0)
            blend = max(0, min(1, (center.z + 0.04 - point.z) / 0.12))
            normals.append(crown_normal.lerp(outward, blend).normalized())
        objects.append(lock(points, normals, rng.uniform(0.006, 0.009), mat))

    # Side-part roots follow the scalp. Lower locks drape outside the upper body.
    for side, count in ((-1, 23), (1, 31)):
        for index in range(count):
            spread = index / (count - 1)
            phase = spread * 1.8 + rng.uniform(-0.12, 0.12)
            guides = []
            end = neck.z - (0.14 + 0.045 * math.sin(spread * math.pi)) * length_scale + rng.uniform(-0.012, 0.012)
            for step in range(8):
                q = step / 7
                point = Vector((-0.022 * (1 - q) + side * (0.078 + spread * 0.024) * math.sin(q * math.pi / 2),
                                -0.135 + spread * 0.14 - 0.020 * math.sin(q * math.pi / 2),
                                top - 0.050 + spread * 0.060 - q * (0.055 + 0.10 * spread) + 0.040 * math.sin(q * math.pi)))
                point, normal = project(point, 0.006 + 0.007 * math.sin(q * math.pi))
                guides.append(point)
            anchor = guides[-1]
            for step in range(1, 8):
                r = step / 7
                point = anchor.copy()
                wave = wave_scale * (math.sin(r * 9 + phase) - math.sin(phase)) * math.sin(r * math.pi / 2)
                point.x += side * (0.013 * r + 0.020 * wave)
                point.y -= 0.018 * math.sin(r * math.pi) + 0.008 * wave
                point.z = anchor.z * (1 - r) + end * r
                guides.append(point)
            points = smooth_path(guides, 49)
            drape(points, drape_surface, -1, center.z - 0.015)
            normals = []
            outward = Vector((side * 0.45, -1, 0)).normalized()
            for point in points:
                _, crown_normal = project(point, 0)
                blend = max(0, min(1, (center.z + 0.05 - point.z) / 0.15))
                normals.append(crown_normal.lerp(outward, blend).normalized())
            objects.append(lock(points, normals, rng.uniform(0.004, 0.006), mat))
    obj = join_meshes(objects, "body.hair")
    weights = []
    for vertex in obj.data.vertices:
        head_weight = max(0, min(1, (vertex.co.z - neck.z + 0.08) / 0.17))
        weights.append({name: weight for name, weight in {"head": head_weight, "spine01": 1 - head_weight}.items() if weight > 0})
    bind_weights(obj, rig, weights)
    return obj
