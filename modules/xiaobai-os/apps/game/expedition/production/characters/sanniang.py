"""Authored silhouette from the existing Sanniang portrait, in metres, forward -Y."""

import math
from surface import loft, material, mesh, ribbon, stroke
from rig import body_weights, skirt_weights, sleeve_weights


def palette():
    return {key: material(key, color, .35 if key == 'silver' else 0) for key, color in {
        'skin': 'f2d6c9', 'navy': '343c59', 'ivory': 'e9e3dc', 'hair': '242a40',
        'hairlight': '3a425e', 'ink': '242332', 'eye': 'f4edf0', 'iris': '716e98',
        'lip': 'b77c83', 'sash': '78515d', 'leather': '3a3547', 'silver': 'b9b4be',
    }.items()}


def body(rig, m):
    loft('inner.tunic', [
        (.87, .116, .072, .073, 0, 0), (.96, .094, .060, .059, 0, 0),
        (1.06, .105, .067, .063, 0, 0), (1.17, .128, .091, .066, 0, 0),
        (1.25, .139, .074, .064, 0, 0), (1.29, .148, .052, .052, 0, 0),
        (1.33, .064, .043, .043, 0, 0), (1.37, .042, .037, .036, 0, 0),
    ], m['ivory'], rig, body_weights)
    loft('neck', [(1.32, .039, .034, .035, 0, 0), (1.40, .036, .034, .034, 0, 0),
                  (1.425, .041, .037, .038, 0, 0)], m['skin'], rig, {'neck': 1})
    loft('high.collar', [(1.325, .046, .042, .040, 0, 0), (1.385, .042, .039, .039, 0, 0)],
         m['ivory'], rig, {'neck': 1}, sides=32)
    stroke('collar.edge', [(-.039, -.019, 1.386), (0, -.041, 1.387), (.039, -.019, 1.386)],
           [.0016] * 3, m['navy'], rig, {'neck': 1}, 6)
    # The ankle-length inner panel is continuous, not a cone or separate horizontal rings.
    rows = [(.13, .175, .105, .107, 0, 0), (.28, .168, .102, .104, 0, 0),
            (.52, .149, .093, .095, 0, 0), (.74, .131, .083, .084, 0, 0),
            (.87, .12, .079, .079, 0, 0), (.96, .098, .064, .063, 0, 0)]
    loft('long.inner.panel', rows, m['ivory'], rig, skirt_weights, ripple=.025)
    outer = [(z, x + .011, f + .009, b + .009, cx, cy) for z, x, f, b, cx, cy in rows]
    loft('split.navy.skirt', outer, m['navy'], rig, skirt_weights, start=.53, end=math.tau - .53, ripple=.035)
    for side in (-1, 1):
        points = [(side * math.sin(.53) * (x + .012), -math.cos(.53) * (f + .011), z) for z, x, f, _, _, _ in rows]
        stroke('skirt.piping', points, [.0027] * len(points), m['ivory'], rig, skirt_weights, 6)
    # Cropped open jacket with a shaped waist, shoulder and oblique lapel.
    coat = [(1.00, .125, .078, .075, 0, 0), (1.04, .124, .081, .075, 0, 0),
            (1.16, .140, .103, .081, 0, 0), (1.26, .159, .081, .074, 0, 0),
            (1.30, .154, .060, .057, 0, 0), (1.335, .054, .047, .047, 0, 0)]
    loft('short.jacket', coat, m['navy'], rig, body_weights, start=.62, end=math.tau - .62)
    for side in (-1, 1):
        stroke('lapel.piping', [(side * math.sin(.62) * x, -math.cos(.62) * (f + .002), z)
                               for z, x, f, _, _, _ in coat], [.0026] * len(coat), m['ivory'], rig, body_weights, 6)
    for z in (1.34, 1.27, 1.12):
        y = -.043 if z > 1.3 else -.077 if z > 1.2 else -.084
        stroke('frog.fastener', [(-.014, y, z), (0, y - .004, z + .003), (.017, y, z)],
               [.0025, .003, .002], m['silver'], rig, body_weights, 6)
    # Small lapel knot and restrained tassel, carried by the chest rather than floating geometry.
    for i in range(4):
        a = i * math.pi / 2
        stroke('lapel.knot', [(-.061, -.070, 1.28), (-.061 + math.sin(a) * .009, -.074, 1.28 + math.cos(a) * .009)],
               [.002, .003], m['sash'], rig, body_weights, 6)
    stroke('lapel.tassel', [(-.06, -.074, 1.27), (-.066, -.086, 1.24), (-.069, -.097, 1.19)],
           [.002, .003, .006], m['sash'], rig, body_weights, 8)
    for sign, side in ((1, 'L'), (-1, 'R')):
        # Arm, wrist and palm surfaces are sculpted sections with skinning across the elbow.
        arm = [(.815, .023, .013, .012, sign * .233, -.032), (.85, .024, .016, .014, sign * .235, -.028),
               (.89, .020, .020, .019, sign * .235, -.025), (.96, .031, .027, .026, sign * .237, -.019),
               (1.08, .032, .031, .029, sign * .228, -.009), (1.19, .043, .037, .035, sign * .198, 0),
               (1.28, .044, .038, .036, sign * .157, 0)]
        sleeve_weight = sleeve_weights(side)
        def arm_weights(p, side=side, upper=sleeve_weight):
            if p[2] >= .91:
                return upper(p)
            t = max(0, min(1, (p[2] - .865) / .045))
            return {f'hand.{side}': 1 - t, f'forearm.{side}': t}
        loft('arm.and.hand', arm, m['skin'], rig, arm_weights, sides=20)
        sleeve = [(1.005, .043, .041, .042, sign * .238, -.016), (1.08, .053, .044, .044, sign * .23, -.009),
                  (1.18, .057, .047, .047, sign * .201, 0), (1.27, .049, .045, .043, sign * .161, 0),
                  (1.299, .035, .038, .036, sign * .151, 0), (1.308, .016, .022, .021, sign * .139, 0)]
        loft('jacket.sleeve', sleeve, m['navy'], rig, sleeve_weights(side), sides=24)
        loft('turned.cuff', [(1.005, .044, .042, .043, sign * .238, -.016),
                            (1.031, .046, .043, .044, sign * .236, -.014)], m['ivory'], rig, sleeve_weights(side), sides=24)
        # Delicate narrow hands and separately modelled fingers, all bound to one hand bone.
        hand = {f'hand.{side}': 1}
        for i, length in enumerate((.039, .049, .046, .033)):
            x = sign * (.215 + i * .011)
            stroke('finger', [(x, -.032, .825), (x, -.037, .804), (x, -.045, .825 - length)],
                   [.0055, .005, .0025], m['skin'], rig, hand, 7)
        stroke('thumb', [(sign * .215, -.025, .862), (sign * .203, -.039, .844), (sign * .205, -.052, .824)],
               [.008, .006, .003], m['skin'], rig, hand, 8)
        def leg_weights(p, side=side):
            t = max(0, min(1, (p[2] - .42) / .08))
            return {f'thigh.{side}': t, f'shin.{side}': 1 - t}
        # Fixed-costume scene asset: omit the entirely occluded upper legs, not extra hidden anatomy.
        loft('trouser.ankle', [(.045, .024, .026, .024, sign * .078, 0), (.14, .030, .028, .030, sign * .078, 0),
                              (.23, .038, .032, .035, sign * .078, 0)], m['ivory'], rig, leg_weights, sides=18)
        loft('cloth.shoe', [(.012, .031, .088, .041, sign * .078, -.016), (.028, .036, .094, .045, sign * .078, -.016),
                            (.056, .034, .083, .040, sign * .078, -.016), (.085, .024, .036, .030, sign * .078, 0)],
             m['leather'], rig, {f'foot.{side}': 1}, sides=24)
    loft('waist.sash', [(.935, .103, .066, .066, 0, 0), (.963, .100, .067, .067, 0, 0),
                       (.982, .102, .071, .067, 0, 0)], m['sash'], rig, {'hips': 1})
    ribbon('hanging.sash', [(-.10, -.04, .95), (-.145, -.025, .83), (-.17, -.02, .69), (-.21, -.015, .56)],
           [.019, .024, .020, .008], m['sash'], rig, {'sash': 1})
    ribbon('sash.second', [(-.10, -.045, .95), (-.12, -.055, .82), (-.14, -.04, .70)],
           [.015, .018, .008], m['sash'], rig, {'sash': 1})
    # Medicine pouch and flask on the opposite hip retain the portrait's profession cue.
    bag = {'hips': 1}
    loft('medicine.pouch', [(.70, .043, .028, .027, .126, -.07), (.73, .051, .033, .03, .126, -.07),
                           (.86, .047, .032, .029, .126, -.065), (.88, .04, .026, .025, .126, -.06)],
         m['leather'], rig, bag, sides=24)
    stroke('pouch.strap', [(.105, -.066, .97), (.131, -.076, .91), (.136, -.10, .84)],
           [.009, .008, .007], m['sash'], rig, bag, 8, .35)
    loft('medicine.flask', [(.84, .016, .017, .017, .151, -.074), (.925, .016, .017, .017, .151, -.074),
                           (.942, .010, .011, .011, .151, -.074)], m['silver'], rig, bag, sides=16)
    for dx, dz in ((0, .012), (0, -.012), (.011, 0), (-.011, 0)):
        stroke('pouch.flower', [(.126, -.105, .79), (.126 + dx, -.108, .79 + dz)],
               [.004, .004], m['silver'], rig, bag, 6)


def face(rig, m):
    head = {'head': 1}
    loft('face', [(1.397, .025, .039, .027, 0, -.008), (1.415, .050, .056, .044, 0, -.004),
                  (1.447, .076, .067, .062, 0, 0), (1.48, .088, .071, .074, 0, 0),
                  (1.52, .091, .071, .081, 0, 0), (1.56, .089, .067, .078, 0, 0),
                  (1.60, .067, .054, .059, 0, 0), (1.624, .014, .014, .014, 0, 0)],
         m['skin'], rig, head, sides=48)
    def yface(x, z):
        radius = .091 if z > 1.48 else .088 if z > 1.455 else .078
        return -.071 * math.sqrt(max(.03, 1 - (x / radius) ** 2)) - .002
    for side in (-1, 1):
        # Almond-shaped eye surfaces follow the face rather than floating eyeballs.
        vertices = [(side * .043, yface(side * .043, 1.492) - .002, 1.492)]
        upper, lower = [], []
        for i in range(33):
            t = i / 32
            x = side * (.018 + .054 * t)
            z = 1.489 + .007 * t + .007 * math.sin(math.pi * t)
            upper.append((x, yface(x, z) - .003, z))
            z = 1.489 + .007 * t - .005 * math.sin(math.pi * t)
            lower.append((x, yface(x, z) - .003, z))
        boundary = upper + list(reversed(lower[1:-1]))
        vertices.extend(boundary)
        mesh('eye.white', vertices, [(0, i + 1, (i + 1) % len(boundary) + 1) for i in range(len(boundary))], m['eye'], rig, head)
        for key, rx, rz, lift, cx, cz in [('iris', .009, .0075, .006, .044, 1.493),
                                        ('ink', .0035, .005, .007, .044, 1.494),
                                        ('eye', .0025, .0027, .008, .041, 1.498)]:
            vertices = [(side * cx, yface(side * cx, cz) - lift, cz)]
            for i in range(32):
                a = i * math.tau / 32
                x, z = side * (cx + rx * math.cos(a)), cz + rz * math.sin(a)
                vertices.append((x, yface(x, z) - lift, z))
            mesh('eye.' + key, vertices, [(0, i + 1, (i + 1) % 32 + 1) for i in range(32)], m[key], rig, head)
        stroke('upper.lash', upper[::4] + [(side * .078, yface(side * .073, 1.501), 1.501)],
               [.0006, .001, .0014, .0018, .002, .002, .0018, .0015, .0011, .00015], m['ink'], rig, head, 6, .6)
        stroke('lower.lash', lower[8::6], [.00045] * len(lower[8::6]), m['lip'], rig, head, 6, .5)
        brow = [(side * x, yface(side * x, z), z) for x, z in ((.020, 1.518), (.035, 1.525), (.052, 1.526), (.071, 1.520))]
        stroke('brow', brow, [.001, .0022, .0018, .0002], m['hair'], rig, head, 6, .45)
        loft('ear', [(1.452, .008, .009, .008, side * .087, .003), (1.47, .012, .013, .012, side * .088, .003),
                     (1.488, .009, .011, .010, side * .087, .003)], m['skin'], rig, head, sides=16)
        stroke('earring', [(side * .091, -.001, 1.455), (side * .094, -.003, 1.439), (side * .09, -.004, 1.432)],
               [.002, .002, .003], m['silver'], rig, head, 6)
    # A restrained shaped bridge and tip, not a sphere stuck onto the face.
    loft('nose', [(1.455, .003, .004, .003, 0, -.071), (1.464, .008, .011, .003, 0, -.071),
                  (1.473, .005, .009, .002, 0, -.071), (1.499, .004, .002, .001, 0, -.071)],
         m['skin'], rig, head, sides=16)
    stroke('mouth', [(-.019, -.066, 1.437), (-.009, -.071, 1.434), (0, -.073, 1.435),
                     (.009, -.071, 1.434), (.019, -.066, 1.437)], [.0003, .001, .001, .001, .0003], m['lip'], rig, head, 6, .45)


def hair(rig, m):
    head = {'head': 1}
    vertices, faces = [], []
    for i in range(17):
        t = i / 16
        for j in range(64):
            a = j * math.tau / 64
            # Hairline is high above the eyes in front, low at nape, with sculpted crown volume.
            bottom = 1.435 + .12 * max(0, math.cos(a)) ** 2
            phi = math.acos((bottom - 1.515) / .13) * t
            z, r = 1.515 + .13 * math.cos(phi), math.sin(phi)
            vertices.append((.102 * math.sin(a) * r, -(.088 if math.cos(a) > 0 else .095) * math.cos(a) * r + .003, z))
            if i:
                b = i * 64 + j
                n = i * 64 + (j + 1) % 64
                faces.append((b - 64, n - 64, n, b))
    mesh('hair.cap', vertices, faces, m['hair'], rig, head)
    locks = [
        ([(.038, -.035, 1.638), (.013, -.075, 1.613), (-.022, -.085, 1.575), (-.061, -.076, 1.533), (-.081, -.052, 1.487)], [.012, .025, .029, .019, .0004]),
        ([(.056, -.02, 1.631), (.039, -.065, 1.606), (.008, -.088, 1.571), (-.028, -.088, 1.533), (-.051, -.078, 1.517)], [.01, .022, .023, .012, .0003]),
        ([(.048, -.02, 1.634), (.074, -.052, 1.605), (.087, -.056, 1.559), (.089, -.043, 1.51), (.079, -.037, 1.467)], [.013, .019, .016, .012, .0003]),
        ([(-.025, -.026, 1.639), (-.055, -.060, 1.603), (-.083, -.060, 1.56), (-.098, -.031, 1.514), (-.09, -.017, 1.46)], [.013, .02, .021, .013, .0004]),
        ([(-.063, .008, 1.619), (-.089, -.014, 1.57), (-.10, -.008, 1.514), (-.099, -.011, 1.449), (-.084, -.028, 1.418)], [.013, .018, .014, .009, .0003]),
        ([(.072, .003, 1.60), (.099, .005, 1.558), (.103, -.002, 1.50), (.101, -.016, 1.449), (.087, -.033, 1.408)], [.01, .015, .012, .007, .0003]),
    ]
    for i, (points, widths) in enumerate(locks):
        widths[0] = .001
        ribbon('swept.lock', points, widths, m['hairlight'] if i % 3 == 0 else m['hair'], rig, head, .009)
        offset = [(x, y - .004, z + .001) for x, y, z in points[1:-1]]
        stroke('hair.glint', offset, [.0013] * len(offset), m['hairlight'], rig, head, 5, .35)
    loft('low.coiled.bun', [(1.365, .023, .024, .023, -.037, .068), (1.39, .053, .041, .039, -.038, .075),
                           (1.44, .062, .044, .043, -.039, .077), (1.479, .046, .036, .035, -.04, .072),
                           (1.495, .015, .015, .015, -.038, .065)], m['hair'], rig, head, sides=32)
    for i in range(5):
        points = []
        for j in range(9):
            t = j / 8
            a = -.4 + t * 3.5
            points.append((-.04 + .056 * math.cos(a), .079 + .043 * math.sin(a), 1.394 + i * .016 + .009 * math.sin(a)))
        stroke('bun.coil', points, [.0016] * len(points), m['hairlight'], rig, head, 6)
    stroke('hairpin', [(-.13, .057, 1.457), (-.04, .075, 1.464), (.052, .088, 1.474)], [.0026] * 3, m['silver'], rig, head, 8)
    for i in range(5):
        a = i * math.tau / 5
        stroke('pin.flower', [(-.105, .035, 1.464), (-.105 + math.sin(a) * .010, .032, 1.464 + math.cos(a) * .010)],
               [.0025, .004], m['silver'], rig, head, 7)


def create(rig):
    colors = palette()
    body(rig, colors)
    face(rig, colors)
    hair(rig, colors)
