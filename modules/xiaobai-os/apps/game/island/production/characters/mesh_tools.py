"""Blender mesh construction and skin binding for the local character authoring tool."""

import bpy
from mathutils import Vector


def material(name, color, roughness=0.5, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metallic
    return mat


def mesh_object(name, vertices, faces, mat, uv=None):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    for face in mesh.polygons:
        face.use_smooth = True
    if uv:
        layer = mesh.uv_layers.new(name="UVMap")
        for face, coords in zip(mesh.polygons, uv):
            for loop_index, coord in zip(face.loop_indices, coords):
                layer.data[loop_index].uv = coord
    return obj


def source_mesh(name, data, rows, mat):
    indices = sorted({i for _, face, _ in rows for i in face})
    remap = {old: new for new, old in enumerate(indices)}
    obj = mesh_object(name, [data.vertices[i] for i in indices],
                      [[remap[i] for i in face] for _, face, _ in rows], mat,
                      [[data.uv[i] for i in uv] for _, _, uv in rows])
    return obj, indices


def bind_weights(obj, rig, weights):
    groups = {}
    for index, entry in enumerate(weights):
        if not entry:
            raise ValueError(f"Unweighted vertex: {obj.name}[{index}]")
        for name, weight in entry.items():
            if name not in rig.data.bones:
                raise ValueError(f"Missing bone: {name}")
            if name not in groups:
                groups[name] = obj.vertex_groups.new(name=name)
            groups[name].add([index], weight, "REPLACE")
    modifier = obj.modifiers.new("Skin", "ARMATURE")
    modifier.object = rig
    obj.parent = rig


def rigid_bind(obj, rig, name="head"):
    bind_weights(obj, rig, [{name: 1.0}] * len(obj.data.vertices))


def normalize_weights(obj):
    """Re-establish glTF's four-influence boundary after topology operations."""
    for vertex in obj.data.vertices:
        influences = sorted([(g.group, g.weight) for g in vertex.groups], key=lambda pair: pair[1], reverse=True)
        total = sum(weight for _, weight in influences[:4])
        for group, _ in influences[4:]:
            obj.vertex_groups[group].remove([vertex.index])
        if total <= 0:
            raise ValueError(f"Unweighted vertex: {obj.name}[{vertex.index}]")
        for group, weight in influences[:4]:
            obj.vertex_groups[group].add([vertex.index], weight / total, "REPLACE")


def build_rig(data):
    armature = bpy.data.armatures.new("SurvivorSkeleton")
    rig = bpy.data.objects.new("Survivor", armature)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    for name, spec in data.rig["bones"].items():
        bone = armature.edit_bones.new(name)
        bone.head, bone.tail = data.joint(spec["head"]), data.joint(spec["tail"])
        bone.align_roll(Vector((0, -1, 0)))
    for name, spec in data.rig["bones"].items():
        if spec["parent"]:
            armature.edit_bones[name].parent = armature.edit_bones[spec["parent"]]
    bpy.ops.object.mode_set(mode="OBJECT")
    rig.select_set(False)
    rig.show_in_front = True
    return rig


def tube(name, points, radii, mat, sides=6, flatten=1.0):
    from math import cos, sin, tau
    vertices, faces = [], []
    for i, point in enumerate(points):
        center = Vector(point)
        tangent = Vector(points[min(i + 1, len(points) - 1)]) - Vector(points[max(i - 1, 0)])
        tangent.normalize()
        side = tangent.cross(Vector((0, -1, 0)))
        if side.length < 0.01:
            side = tangent.cross(Vector((1, 0, 0)))
        side.normalize()
        normal = side.cross(tangent).normalized()
        for j in range(sides):
            angle = tau * j / sides
            vertices.append(center + radii[i] * (cos(angle) * side + sin(angle) * normal * flatten))
        if i:
            for j in range(sides):
                a, b = (i - 1) * sides + j, (i - 1) * sides + (j + 1) % sides
                faces.append((a + sides, b + sides, b, a))
    faces += [tuple(range(sides)), tuple((len(points) - 1) * sides + j for j in reversed(range(sides)))]
    return mesh_object(name, vertices, faces, mat)


def join_meshes(objects, name):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = name
    obj.select_set(False)
    return obj


def apply_modifier(obj, modifier):
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)
