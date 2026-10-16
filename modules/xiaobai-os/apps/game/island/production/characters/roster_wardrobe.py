"""Refit the existing physical garment patterns, not the wearer's style or body."""

from pathlib import Path

import bpy
from mathutils import Matrix, Vector
from mathutils.kdtree import KDTree
from mathutils.bvhtree import BVHTree

from makehuman_data import HumanData
from mesh_tools import normalize_weights
from ye_design import DESIGN as PATTERN_BODY
from motion import relaxed_pose


def fit_wardrobe(source, pattern_blend, data, rig):
    """Transfer cage displacement to the approved patterns, retaining cut/details.

    The source file is read-only. Shared topology provides correspondence between
    two independently authored bodies; no scaling of the character itself occurs.
    """
    reference = HumanData(source, PATTERN_BODY.morphs, PATTERN_BODY.identity.height_m)
    ids = sorted({i for _, face, _ in reference.group_faces("body") for i in face})
    tree = KDTree(len(ids))
    for i in ids:
        tree.insert(reference.vertices[i], i)
    tree.balance()
    with bpy.data.libraries.load(str(Path(pattern_blend).resolve()), link=False) as (available, selected):
        selected.objects = [name for name in available.objects if name.startswith("clothing.")]
    objects = []
    for original in selected.objects:
        obj = original.copy()
        obj.data = original.data.copy()
        obj.name = original.name.removesuffix(".001")
        obj.parent = rig
        obj.matrix_parent_inverse = Matrix.Identity(4)
        obj.matrix_basis = Matrix.Identity(4)
        obj.hide_render = obj.hide_viewport = False
        obj.animation_data_clear()
        for modifier in obj.modifiers:
            if modifier.type == "ARMATURE":
                modifier.object = rig
        bpy.context.collection.objects.link(obj)
        for vertex in obj.data.vertices:
            closest = tree.find_n(vertex.co, 12)
            factors = [(index, 1 / max(.001, distance)**2) for _, index, distance in closest]
            total = sum(weight for _, weight in factors)
            displacement = sum(((data.vertices[index] - reference.vertices[index]) * weight
                                for index, weight in factors), Vector()) / total
            vertex.co += displacement
        normalize_weights(obj)
        obj.data.update()
        objects.append(obj)
    if not objects:
        raise ValueError("The garment pattern source contains no independent clothing")
    return objects


def clear_body(garments, body):
    """Give each fitted layer its own outward seam allowance on the final skin."""
    skin = BVHTree.FromPolygons([v.co for v in body.data.vertices],
                                [list(p.vertices) for p in body.data.polygons])
    for garment in garments:
        shape = garment.get("garment_id")
        clearance = {"inner-top": .003, "inner-shorts": .003, "shirt": .010,
                     "trousers": .009, "lifejacket": .022, "shoes": .005, "wraps": .003}[shape]
        for vertex in garment.data.vertices:
            point, normal, _, distance = skin.find_nearest(vertex.co)
            signed = (vertex.co - point).dot(normal)
            if distance < .065 and signed < clearance:
                vertex.co += normal * (clearance - signed)
        garment.data.update()


def fit_standing_seams(garments, body, rig, standing_pose):
    """Tailor shoulder/arm seams in the wearer's stance, then return to bind space."""
    relaxed_pose(rig, standing_pose)
    graph = bpy.context.evaluated_depsgraph_get()
    evaluated = body.evaluated_get(graph)
    skin_mesh = evaluated.to_mesh()
    skin = BVHTree.FromPolygons([v.co for v in skin_mesh.vertices],
                                [list(p.vertices) for p in skin_mesh.polygons])
    evaluated.to_mesh_clear()
    transforms = {bone.name: (bone.matrix @ bone.bone.matrix_local.inverted()).to_3x3()
                  for bone in rig.pose.bones}
    for garment in garments:
        if garment.get("garment_id") not in ("shirt", "trousers", "inner-top", "inner-shorts"):
            continue
        clearance = .003 if garment["garment_id"].startswith("inner-") else .009
        posed = garment.evaluated_get(graph)
        mesh = posed.to_mesh()
        for vertex, live in zip(garment.data.vertices, mesh.vertices):
            point, normal, _, distance = skin.find_nearest(live.co)
            signed = (live.co - point).dot(normal)
            if distance >= .065 or signed >= clearance:
                continue
            matrix = Matrix(((0, 0, 0), (0, 0, 0), (0, 0, 0)))
            for influence in vertex.groups:
                matrix += transforms[garment.vertex_groups[influence.group].name] * influence.weight
            vertex.co += matrix.inverted() @ (normal * (clearance - signed))
        posed.to_mesh_clear()
        garment.data.update()
    for bone in rig.pose.bones:
        bone.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()
