"""Fit garment skinning and layer allowance to the wearer's actual skin.

Only garment positions/normals, skin weights and position bounds change. Body,
face, hair, skeleton and textures are retained. Original GLBs are retained in
the output's source directory; the input directory is always read-only.
"""
import argparse
import json
import struct
import sys
from collections import defaultdict
from pathlib import Path

from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.geometry import barycentric_transform

COMPONENTS = {5121: ('B', 1), 5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
WIDTHS = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}
GARMENTS = {'shirt', 'trousers', 'inner-top', 'inner-shorts', 'lifejacket'}
CLEARANCE = {'shirt': .018, 'trousers': .016, 'inner-top': .004,
             'inner-shorts': .004, 'lifejacket': .035}


def fit(source, destination):
    original = source.read_bytes()
    data = bytearray(original)
    length = struct.unpack_from('<I', data, 12)[0]
    document = json.loads(data[20:20 + length])
    binary = 28 + length

    def layout(index):
        accessor = document['accessors'][index]
        view = document['bufferViews'][accessor['bufferView']]
        code, size = COMPONENTS[accessor['componentType']]
        width = WIDTHS[accessor['type']]
        if accessor.get('sparse') or accessor.get('normalized'):
            raise ValueError('Expected dense, unnormalized skin attributes')
        return (binary + view.get('byteOffset', 0) + accessor.get('byteOffset', 0),
                view.get('byteStride', width * size), accessor['count'], '<' + code * width)

    def read(index):
        offset, stride, count, code = layout(index)
        return [struct.unpack_from(code, data, offset + i * stride) for i in range(count)]

    def write(index, values):
        offset, stride, count, code = layout(index)
        if len(values) != count:
            raise ValueError('Skin attribute count differs from positions')
        for i, value in enumerate(values):
            struct.pack_into(code, data, offset + i * stride, *value)

    nodes = document['nodes']
    skin_node = next(n for n in nodes if n.get('extras', {}).get('asset_role') == 'body.skin')
    primitive, = document['meshes'][skin_node['mesh']]['primitives']
    attrs = primitive['attributes']
    vertices = [Vector(v) for v in read(attrs['POSITION'])]
    indices = [v[0] for v in read(primitive['indices'])]
    triangles = [tuple(indices[i:i + 3]) for i in range(0, len(indices), 3)]
    tree = BVHTree.FromPolygons(vertices, triangles, all_triangles=True)
    joints, weights = read(attrs['JOINTS_0']), read(attrs['WEIGHTS_0'])
    parent = {child: i for i, node in enumerate(nodes) for child in node.get('children', [])}
    skin_parent = parent.get(nodes.index(skin_node))
    changed = 0
    for node_index, node in enumerate(nodes):
        if node.get('extras', {}).get('garment_id') not in GARMENTS:
            continue
        if node.get('skin') != skin_node.get('skin') or parent.get(node_index) != skin_parent:
            raise ValueError('Garments and skin must use the same rig and bind space')
        if any(key in node or key in skin_node for key in ('matrix', 'translation', 'rotation', 'scale')):
            raise ValueError('Expected identity mesh transforms')
        for garment in document['meshes'][node['mesh']]['primitives']:
            a = garment['attributes']
            joint_values, weight_values, fitted_positions = [], [], []
            for position in read(a['POSITION']):
                original_position = Vector(position)
                point, normal, triangle, _ = tree.find_nearest(original_position)
                corners = triangles[triangle]
                bary = barycentric_transform(point, *(vertices[i] for i in corners),
                    Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)))
                blended = defaultdict(float)
                for corner, influence in zip(corners, bary):
                    for joint, weight in zip(joints[corner], weights[corner]):
                        blended[joint] += max(0, influence) * weight
                ranked = sorted(blended.items(), key=lambda pair: pair[1], reverse=True)[:4]
                total = sum(weight for _, weight in ranked)
                if not total:
                    raise ValueError('Unweighted clothing surface')
                ranked.extend([(0, 0)] * (4 - len(ranked)))
                joint_values.append(tuple(joint for joint, _ in ranked))
                weight_values.append(tuple(weight / total for _, weight in ranked))
                allowance = CLEARANCE[node['extras']['garment_id']]
                signed = (original_position - point).dot(normal)
                # The underwear is close-fitting: retaining its old, looser cage
                # can let it protrude through trousers when the thigh bends.
                displacement = allowance - signed
                if not node['extras']['garment_id'].startswith('inner-'):
                    displacement = max(0, displacement)
                fitted_positions.append(tuple(original_position + normal * displacement))
            write(a['JOINTS_0'], joint_values)
            write(a['WEIGHTS_0'], weight_values)
            write(a['POSITION'], fitted_positions)
            bounds = document['accessors'][a['POSITION']]
            bounds['min'] = [min(p[axis] for p in fitted_positions) for axis in range(3)]
            bounds['max'] = [max(p[axis] for p in fitted_positions) for axis in range(3)]
            normals = [Vector() for _ in fitted_positions]
            garment_indices = [v[0] for v in read(garment['indices'])]
            for i in range(0, len(garment_indices), 3):
                x, y, z = garment_indices[i:i + 3]
                edge_a = Vector(fitted_positions[y]) - Vector(fitted_positions[x])
                edge_b = Vector(fitted_positions[z]) - Vector(fitted_positions[x])
                face_normal = edge_a.cross(edge_b)
                for vertex in (x, y, z):
                    normals[vertex] += face_normal
            write(a['NORMAL'], [tuple(normal.normalized()) for normal in normals])
            changed += len(weight_values)
    metadata = json.dumps(document, separators=(',', ':')).encode('utf-8')
    metadata += b' ' * (-len(metadata) % 4)
    payload = data[binary:]
    destination.write_bytes(struct.pack('<4sII', b'glTF', 2, 28 + len(metadata) + len(payload))
        + struct.pack('<I4s', len(metadata), b'JSON') + metadata
        + struct.pack('<I4s', len(payload), b'BIN\0') + payload)
    (destination.parent / 'source' / source.name).write_bytes(original)
    print(f'{source.stem}: fitted {changed} garment vertices; body, face, hair and image bytes retained')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
    source, destination = Path(args.input).resolve(strict=True), Path(args.output).resolve()
    destination.mkdir(parents=True, exist_ok=False)
    (destination / 'source').mkdir()
    for path in sorted(source.glob('*.glb')):
        fit(path, destination / path.name)


if __name__ == '__main__':
    main()
