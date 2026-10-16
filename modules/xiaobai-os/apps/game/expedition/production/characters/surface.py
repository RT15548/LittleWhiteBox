"""Offline curved mesh authoring. No primitive stack or runtime geometry generator."""

import math
import bpy
from mathutils import Vector


def material(name, hex_color, metallic=0):
    rgb = [int(hex_color[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    rgb = [v / 12.92 if v < .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb]
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*rgb, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes['Principled BSDF']
    shader.inputs['Base Color'].default_value = (*rgb, 1)
    shader.inputs['Roughness'].default_value = .75 if not metallic else .38
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Specular IOR Level'].default_value = .2
    return mat


def mesh(name, vertices, faces, mat, rig, weights):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    data.materials.append(mat)
    for face in data.polygons:
        face.use_smooth = True
    groups = {}
    for i, point in enumerate(vertices):
        for bone, weight in (weights(point) if callable(weights) else weights).items():
            if bone not in groups:
                groups[bone] = obj.vertex_groups.new(name=bone)
            groups[bone].add([i], weight, 'REPLACE')
    modifier = obj.modifiers.new('Skin', 'ARMATURE')
    modifier.object = rig
    obj.parent = rig
    return obj


def smooth_rows(rows, steps=3):
    """Interpolate designed sections without turning the silhouette into cylinders."""
    result = []
    for i in range(len(rows) - 1):
        a, b, c, d = [Vector(rows[max(0, min(len(rows) - 1, j))]) for j in (i - 1, i, i + 1, i + 2)]
        for j in range(steps):
            t = j / steps
            result.append(.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t ** 3))
    result.append(Vector(rows[-1]))
    return result


def loft(name, rows, mat, rig, weights, sides=32, steps=3, start=0, end=math.tau, ripple=0):
    # Sections are z, x-radius, front-depth, back-depth, x-center, y-center.
    rows = smooth_rows(rows, steps)
    closed = abs(end - start - math.tau) < .001
    count = sides if closed else sides + 1
    vertices, faces = [], []
    for z, width, front, back, cx, cy in rows:
        for j in range(count):
            angle = start + (end - start) * j / sides
            s, c = math.sin(angle), math.cos(angle)
            fold = 1 + ripple * math.cos(angle * 10)
            vertices.append((cx + s * width * fold, cy - c * (front if c > 0 else back) * fold, z))
        if len(vertices) > count:
            base = len(vertices) - count
            for j in range(sides):
                n = (j + 1) % count
                faces.append((base - count + j, base - count + n, base + n, base + j))
    if closed:
        faces.extend([tuple(reversed(range(count))), tuple(len(vertices) - count + j for j in range(count))])
    return mesh(name, vertices, faces, mat, rig, weights)


def stroke(name, points, widths, mat, rig, weights, sides=8, flatten=1):
    rows = smooth_rows([(*point, widths[i]) for i, point in enumerate(points)], 3)
    vertices, faces = [], []
    for i, row in enumerate(rows):
        p = Vector(row[:3])
        tangent = Vector(rows[min(i + 1, len(rows) - 1)][:3]) - Vector(rows[max(i - 1, 0)][:3])
        tangent.normalize()
        u = tangent.cross(Vector((0, -1, 0)))
        if u.length < .01:
            u = tangent.cross(Vector((1, 0, 0)))
        u.normalize()
        v = tangent.cross(u).normalized()
        for j in range(sides):
            angle = j * math.tau / sides
            vertices.append(p + max(.0001, row[3]) * (u * math.cos(angle) + v * math.sin(angle) * flatten))
        if i:
            for j in range(sides):
                a, b = (i - 1) * sides + j, (i - 1) * sides + (j + 1) % sides
                faces.append((a, b, b + sides, a + sides))
    faces += [tuple(reversed(range(sides))), tuple((len(rows) - 1) * sides + j for j in range(sides))]
    return mesh(name, vertices, faces, mat, rig, weights)


def ribbon(name, points, widths, mat, rig, weights, depth=.008):
    rows = smooth_rows([(*p, widths[i]) for i, p in enumerate(points)], 5)
    vertices, faces = [], []
    for i, row in enumerate(rows):
        p = Vector(row[:3])
        tangent = Vector(rows[min(i + 1, len(rows) - 1)][:3]) - Vector(rows[max(i - 1, 0)][:3])
        side = tangent.cross(Vector((0, -1, 0))).normalized()
        for j in range(9):
            t = j / 8 * 2 - 1
            vertices.append(p + side * row[3] * t + Vector((0, -depth * (1 - t * t), 0)))
        if i:
            base = i * 9
            for j in range(8):
                faces.append((base - 9 + j, base - 8 + j, base + j + 1, base + j))
    return mesh(name, vertices, faces, mat, rig, weights)


def merge_by_material(rig):
    pigment = material('pigment', 'ffffff')
    shader = pigment.node_tree.nodes['Principled BSDF']
    colors = pigment.node_tree.nodes.new('ShaderNodeVertexColor')
    colors.layer_name = 'Pigment'
    pigment.node_tree.links.new(colors.outputs['Color'], shader.inputs['Base Color'])
    groups = {}
    for obj in list(bpy.context.scene.objects):
        if obj.type == 'MESH' and obj.parent == rig:
            mat = obj.data.materials[0]
            if mat.name != 'silver':
                color = tuple(mat.diffuse_color)
                layer = obj.data.color_attributes.new(name='Pigment', type='FLOAT_COLOR', domain='CORNER')
                for entry in layer.data:
                    entry.color = color
                obj.data.materials.clear()
                obj.data.materials.append(pigment)
            groups.setdefault(obj.data.materials[0].name, []).append(obj)
    for name, objects in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objects[0]
        bpy.ops.object.join()
        obj = bpy.context.object
        obj.name = 'sanniang.' + name
        # Open jacket/hair surfaces are genuine thin cloth; both sides render.
        obj.data.materials[0].use_backface_culling = False
        obj.select_set(False)
