"""Head-fitted short styles and body-draped long styles with packed fiber cards."""

import math
import random

from mathutils import Vector

from hair import build_hair, hair_material, lock, smooth_path, surface
from mesh_tools import join_meshes, material, rigid_bind, tube
from loose_hair import build_loose_hair


def build_roster_hair(data, rig, body, style, shirt):
    if style.hair in ("loose-straight", "loose-fringe"):
        return build_loose_hair(rig, body, shirt, style)
    if style.hair in ("long-straight", "long-waves"):
        length, wave = {"long-straight": (1.48, .15), "long-waves": (1.30, .85)}[style.hair]
        return build_hair(data, rig, body, shirt, color=style.hair_color,
                          length_scale=length, wave_scale=wave)
    rng = random.Random(713)
    top = max(v.co.z for v in body.data.vertices)
    eye = data.joint(data.rig["bones"]["eye.L"]["head"])
    head = data.joint(data.rig["bones"]["head"]["head"])
    neck = data.joint(data.rig["bones"]["neck01"]["head"])
    center = Vector((0, head.y, top - (top - eye.z) * .78))
    skull = [v.co for v in body.data.vertices if v.co.z > eye.z + .015]
    rx = max(abs(p.x) for p in skull) + .005
    ry = max(abs(p.y - center.y) for p in skull) + .005
    rz = top - center.z + .005
    mat = hair_material(color=style.hair_color)
    scalp = hair_material(scalp=True, color=style.hair_color)
    for fiber in (mat, scalp):
        shader = fiber.node_tree.nodes["Principled BSDF"]
        shader.inputs["Roughness"].default_value = .82
        shader.inputs["Specular IOR Level"].default_value = .08
    long = style.hair in ("bob", "ponytail")

    def crown(theta, angle, lift=0):
        normal = Vector((math.sin(theta) * math.sin(angle) / rx,
                         -math.sin(theta) * math.cos(angle) / ry, math.cos(theta) / rz)).normalized()
        point = center + Vector((rx * math.sin(theta) * math.sin(angle),
                                 -ry * math.sin(theta) * math.cos(angle), rz * math.cos(theta)))
        return point + normal * lift, normal

    def edge(angle):
        front = 1.10 if style.hair == "crop" else .96
        return front + .58 * (1 - math.cos(angle)) + .035 * math.sin(angle)

    rows = [[crown(.008 + row / 20 * edge(math.tau * col / 80), math.tau * col / 80, .002)[0]
             for col in range(81)] for row in range(21)]
    objects = [surface("hair.scalp", rows, scalp, repeat=20)]

    if style.hair == "bob":
        # A continuous, tucked-under volume supports the fine ends. Cards alone
        # become sparse strings at the jaw when their tapered tips all separate.
        backing = []
        for row in range(29):
            t = row / 28
            points = []
            for col in range(73):
                a = .86 + (math.tau - 1.72) * col / 72
                if t < .60:
                    point = crown(.16 + t / .60 * (edge(a) - .16), a, .002)[0]
                else:
                    q = (t - .60) / .40
                    point = crown(edge(a), a, .002)[0]
                    point += Vector((math.sin(a), -math.cos(a), 0)) * (.010 * math.sin(q * math.pi) - .010 * q * q)
                    point.z = point.z * (1 - q) + (neck.z + .019 + .012 * math.cos(a)) * q
                points.append(point)
            backing.append(points)
        objects.append(surface("hair.bob-volume", backing, scalp, repeat=20))

    # Side/back flow. The bob has a blunt, lightly tucked-in jaw-length line;
    # the other styles end on the skull, leaving ears and neck readable.
    for i in range(72):
        angle = .86 + (math.tau - 1.72) * i / 71
        limit = edge(angle)
        guides, normals = [], []
        for j in range(20):
            t = j / 19
            sweep = (.27 if style.hair == "parted" else .12) * math.sin(t * math.pi)
            lift = .003 + (.010 if style.hair == "textured" else .005) * math.sin(t * math.pi)
            p, n = crown(.14 + t * (limit - .14), angle + sweep, lift)
            guides.append(p); normals.append(n)
        if style.hair == "bob":
            anchor = guides[-1].copy()
            end_z = neck.z + .006 + .012 * math.cos(angle) + rng.uniform(-.004, .004)
            outward = Vector((math.sin(angle), -math.cos(angle), 0))
            for j in range(1, 15):
                t = j / 14
                p = anchor + outward * (.012 * math.sin(t * math.pi) - .009 * t * t)
                p.z = anchor.z * (1 - t) + end_z * t
                guides.append(p); normals.append(outward)
        objects.append(lock(guides, normals, .0075 if long else .006, mat))

    # Sweep from an offset part towards the temples; no solid fringe over eyes.
    for side, count in (() if style.hair in ("crop", "textured") else ((-1, 29), (1, 23))):
        for i in range(count):
            spread = i / (count - 1)
            points, normals = [], []
            for j in range(25):
                t = j / 24
                angle = side * (.06 + t * (.95 + .28 * spread))
                theta = .08 + spread * .72 + t * (.68 + .28 * spread)
                lift = .004 + .003 * math.sin(t * math.pi)
                if style.hair == "textured":
                    lift += .013 * math.sin(t * math.pi) * (.5 + .5 * math.sin(i * 2.7))
                if style.hair == "crop":
                    lift *= .40
                p, n = crown(theta, angle, lift)
                points.append(p); normals.append(n)
            objects.append(lock(points, normals, .0055, mat))

    if style.hair not in ("crop", "textured"):
        # Over-part strands soften the former two-shell centre seam and give a
        # genuine asymmetric comb direction rather than a plastic hair cap.
        for i in range(18):
            points, normals = [], []
            for j in range(25):
                t = j / 24
                theta = .06 + i / 17 * .54 + t * .78
                angle = .32 - t * (1.60 + i / 17 * .18)
                p, n = crown(theta, angle, .008 + .003 * math.sin(t * math.pi))
                points.append(p); normals.append(n)
            objects.append(lock(points, normals, .005, mat))

    if style.hair == "crop":
        for _ in range(360):
            a = rng.uniform(0, math.tau)
            start = rng.uniform(.015, edge(a) - .12)
            length = rng.uniform(.08, .15)
            points, normals = [], []
            for j in range(7):
                t = j / 6
                p, n = crown(start + t * length, a + .05 * t, .003 + .0008 * math.sin(t * math.pi))
                points.append(p); normals.append(n)
            objects.append(lock(points, normals, .0018, mat))
    if style.hair == "textured":
        for i in range(48):
            a = -.92 + i / 47 * 1.84
            end = 1.17 + .11 * math.sin(i * 2.4)
            points, normals = [], []
            for j in range(21):
                t = j / 20
                p, n = crown(.08 + t * end, a + .24 * math.sin(t * math.pi),
                             .005 + (.011 + .006 * math.sin(i)) * math.sin(t * math.pi))
                points.append(p); normals.append(n)
            objects.append(lock(points, normals, .006, mat))

    if style.hair == "ponytail":
        tie = center + Vector((0, ry + .012, -.008))
        for i in range(38):
            a = math.tau * i / 38
            radial = Vector((math.cos(a), math.sin(a), 0))
            guides = [tie + radial * .015,
                      tie + Vector((.003, .036, -.026)) + radial * .026,
                      tie + Vector((.012, .055, -.10)) + radial * .024,
                      tie + Vector((.019, .046, -.18)) + radial * .019,
                      tie + Vector((.008, .030, -.265 + rng.uniform(-.015, .015))) + radial * .012]
            points = smooth_path(guides, 33)
            objects.append(lock(points, [Vector((math.cos(a), math.sin(a), .05)).normalized()] * len(points), .009, mat))
        band = material("HairTie", (.032, .043, .037), .92)
        points = [tie + Vector((.020 * math.cos(a), .020 * math.sin(a), 0))
                  for a in [math.tau * i / 32 for i in range(33)]]
        objects.append(tube("hair.tie", points, [.003] * len(points), band, 6))
    result = join_meshes(objects, "body.hair")
    rigid_bind(result, rig)
    return result
