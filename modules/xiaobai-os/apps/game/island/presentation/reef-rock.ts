import * as T from 'three';

// Low coastal limestone shared by the shore scatter and the pool margins.
export function reefRockGeometry(seed: number, size = 1) {
    const geometry = new T.IcosahedronGeometry(size, 1), vertices = geometry.getAttribute('position');
    for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i) / size, y = vertices.getY(i) / size, z = vertices.getZ(i) / size;
        const weathering = 1 + Math.sin(x * 5 + y * 3 + seed) * .13 + Math.cos(z * 6 - y * 4 + seed) * .1;
        vertices.setXYZ(i, x * weathering * size, (y * .4 + Math.sin(x * 4 + z * 3 + seed) * .07) * size, z * weathering * size);
    }
    geometry.computeVertexNormals();
    // Project each face along its dominant normal instead of stretching spherical UVs
    // over the flattened rock. Local metre-based UVs keep the pores at a stable scale.
    const normals = geometry.getAttribute('normal'), uv = geometry.getAttribute('uv');
    for (let i = 0; i < vertices.count; i++) {
        const nx = Math.abs(normals.getX(i)), ny = Math.abs(normals.getY(i)), nz = Math.abs(normals.getZ(i));
        const u = nx > ny && nx > nz ? vertices.getZ(i) : vertices.getX(i);
        const v = ny >= nx && ny >= nz ? vertices.getZ(i) : vertices.getY(i);
        uv.setXY(i, u + seed, v + seed);
    }
    return geometry;
}
