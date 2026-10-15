import * as T from 'three';
import type { Resource } from '../model.js';
import { BASIN_SHAPES, basinRadius, type BasinKind } from '../water-basins.js';
import { elevationAt, basinWaterLevel, seaLevel } from '../terrain.js';
import { RESOURCE_RULES } from '../survival-content.js';
import { reefRockGeometry } from './reef-rock.js';

export function waterBasin(resource: Resource & { kind: BasinKind }, stone: T.Material, water: T.Material, tide: number) {
    const root = new T.Group(), center = resource.position, floor = elevationAt(center), segments = 48;
    const fill = resource.kind === 'seep' ? Math.min(1, resource.stock / RESOURCE_RULES.seep.capacity) : 1;
    if (fill > 0 && basinWaterLevel(resource.kind, center, fill) > seaLevel(tide)) {
        const level = basinWaterLevel(resource.kind, center, fill) - floor, positions = [0, level, 0], uvs = [.5, .5], indices: number[] = [];
        for (let i = 0; i <= segments; i++) {
            const angle = i / segments * Math.PI * 2, radius = basinRadius(resource.kind, center, angle);
            positions.push(Math.cos(angle) * radius, level, Math.sin(angle) * radius);
            uvs.push(.5 + Math.cos(angle) * .5, .5 + Math.sin(angle) * .5);
            if (i) { indices.push(0, i + 1, i); }
        }
        const geometry = new T.BufferGeometry();
        geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices); geometry.computeVertexNormals();
        const surface = new T.Mesh(geometry, water); surface.receiveShadow = true; root.add(surface);
    }
    const phase = center.x * .13 + center.y * .07, count = resource.kind === 'reef_food' ? 15 : 5;
    for (let i = 0; i < count; i++) {
        const angle = i * 2.399963 + phase, variation = .5 + Math.sin(i * 3.71 + phase) * .5;
        const radius = basinRadius(resource.kind, center, angle) * (.78 + variation * .32);
        const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
        const size = BASIN_SHAPES[resource.kind].radius * (.045 + variation * .075);
        const rock = new T.Mesh(reefRockGeometry(phase + i, size), stone);
        rock.scale.set(1.5 + variation, .8 + variation * .4, .8 + variation * .5);
        rock.rotation.set(variation * .3, angle, variation * .2);
        rock.position.set(x, elevationAt({ x: center.x + x, y: center.y + z }) - floor + size * .15, z);
        rock.castShadow = true; rock.receiveShadow = true; root.add(rock);
    }
    return root;
}
