import { Box3, BoxGeometry, Group, InstancedMesh, Line, Matrix4, Mesh, SphereGeometry, Vector2, Vector3 } from 'three';
import type { MapScene } from '../../../../domains/map/types.js';
import { forestCanopies, isAreaElement, isSceneMarker, isSceneObject, sceneElementLabelPoint } from '../scene-geometry.js';
import { sortedSceneElements } from '../map-presentation.js';
import { sceneTemplate } from './scene3d-presentation.js';
import { elementFootprint, footprintGeometry, outlineGeometry, ribbonGeometry, sceneFrame, wallSegments } from './scene3d-geometry.js';
import { createSceneMaterials } from './scene3d-materials.js';
import { Scene3DResources } from './scene3d-resources.js';
import { createTemplates } from './scene3d-templates.js';
import { fitSceneAsset, sceneAssetHeight, sceneAssetKind } from './scene3d-asset-fit.js';
import type { SceneAsset, SceneAssetKind } from './scene3d-assets.js';
import { buildFence } from './scene3d-fence.js';

function inside(point: Vector2, polygon: Vector2[]): boolean {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i], b = polygon[j];
        if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) {result = !result;}
    }
    return result;
}

export function createSceneModel(data: MapScene, dark: boolean, assets?: { get(kind: SceneAssetKind): SceneAsset | undefined }, frame = sceneFrame(data)) {
    const resources = new Scene3DResources();
    const group = new Group();
    try {
        const materials = createSceneMaterials(resources, dark);
        const template = createTemplates(resources, materials);
        const cube = resources.own(new BoxGeometry(1, 1, 1));
        const crownShape = resources.own(new SphereGeometry(.5, 8, 6));
        const crowns = forestCanopies(data.elements);
        const anchors = new Map<string, Vector3>();
        const walls: InstancedMesh[] = [];
        const assetBounds = new Box3();
        for (const [index, element] of sortedSceneElements(data.elements).entries()) {
            const fp = elementFootprint(element, frame.scale);
            const parent = new Group();
            let height = .015, needsOutline = false;
            const model = sceneTemplate(element);
            const kind = sceneAssetKind(element), asset = kind && assets?.get(kind);
            const fence = element.icon === 'fence' && ['path', 'curve'].includes(element.shape) && !isSceneMarker(element) && !['wall', 'grid'].includes(element.category);
            const footprintOnly = !model && !isSceneMarker(element) && isAreaElement(element) && (isSceneObject(element) || ['furniture', 'decoration'].includes(element.category));
            if (element.shape === 'icon' || element.shape === 'label') {
                height = .08;
            } else if (element.category === 'wall') {
                height = 1.1;
                const segments = wallSegments(fp.points, fp.closed);
                const mesh = resources.own(new InstancedMesh(cube, materials.mesh(element, .12), segments.length));
                mesh.castShadow = mesh.receiveShadow = true;
                parent.add(mesh);
                segments.forEach((segment, index) => {
                    const matrix = new Matrix4().makeRotationY(segment.rotation).scale(new Vector3(segment.length, height, .08)).setPosition(segment.x, height / 2, segment.z);
                    mesh.setMatrixAt(index, matrix);
                });
                walls.push(mesh);
            } else if (fence) {
                height = buildFence(parent, fp.points, fp.closed, cube, materials.mesh(element), resources);
            } else if (kind && asset) {
                height = fitSceneAsset(parent, element, kind, asset, fp.width, fp.depth, resources, materials);
            } else if (model) {
                height = template(parent, element, model, fp.width, fp.depth);
            } else if (isAreaElement(element)) {
                height = footprintOnly ? .20 : .015;
                const mesh = new Mesh(resources.own(footprintGeometry(fp.points, height)), materials.mesh(element));
                mesh.castShadow = height > .1;
                mesh.receiveShadow = true;
                parent.add(mesh);
            } else if (element.category === 'road' || element.category === 'water') {
                const mesh = new Mesh(resources.own(ribbonGeometry(fp.points, fp.closed, element.category === 'road' ? .16 : .08).translate(0, height, 0)), materials.mesh(element));
                mesh.receiveShadow = true;
                parent.add(mesh);
            }
            if (model || asset) {
                // Measure either representation in the footprint's axes, before placement.
                const drawn = new Box3().setFromObject(parent);
                const tolerance = Math.max(fp.width, fp.depth) * 1e-6;
                needsOutline = drawn.min.x > -fp.width / 2 + tolerance || drawn.max.x < fp.width / 2 - tolerance
                    || drawn.min.z > -fp.depth / 2 + tolerance || drawn.max.z < fp.depth / 2 - tolerance;
            }
            if (fp.points.length && (needsOutline || (!model && !asset))) {
                // A fitted decorative model must not erase occupied ground when it is smaller.
                const line = new Line(resources.own(outlineGeometry(fp.points, fp.closed, needsOutline ? .019 : element.category === 'wall' ? .012 : height + .004)), materials.line(element));
                line.computeLineDistances();
                parent.add(line);
            }
            const decoration = (crowns.get(element.id) || []).flatMap(crown => {
                const center = new Vector2((crown.x - fp.center[0]) / frame.scale, (crown.y - fp.center[1]) / frame.scale);
                const radius = crown.size / frame.scale / 2;
                if (!Array.from({ length: 8 }, (_, i) => new Vector2(center.x + radius * Math.cos(i * Math.PI / 4), center.y + radius * Math.sin(i * Math.PI / 4))).every(p => inside(p, fp.points))) {return [];}
                return [{ center, radius }];
            });
            if (decoration.length) {
                const trees = new InstancedMesh(crownShape, materials.mesh(element, -.13), decoration.length);
                decoration.forEach(({ center, radius }, i) => trees.setMatrixAt(i, new Matrix4().makeScale(radius * 2, radius * 1.4, radius * 2).setPosition(center.x, radius * .7 + height, center.y)));
                trees.castShadow = trees.receiveShadow = true;
                resources.own(trees);
                parent.add(trees);
            }
            // Separate layered surfaces enough to avoid depth fighting at overview scale.
            parent.position.copy(frame.point(...fp.center, index * .002));
            parent.rotation.y = fp.rotation;
            group.add(parent);
            if (kind) {
                // Include the footprint and eventual label height from the first frame.
                // This affects framing only; placeholders and map facts stay unchanged.
                const top = sceneAssetHeight(element, kind, fp.width, fp.depth) + .10;
                parent.updateMatrix();
                assetBounds.union(new Box3(new Vector3(-fp.width / 2, 0, -fp.depth / 2), new Vector3(fp.width / 2, top, fp.depth / 2)).applyMatrix4(parent.matrix));
            }
            if (isSceneMarker(element)) {
                anchors.set(element.id, frame.point(...fp.center, parent.position.y + .025));
            } else if (model || kind || footprintOnly) {
                anchors.set(element.id, frame.point(...fp.center, parent.position.y + height + .10));
            } else {
                anchors.set(element.id, frame.point(...sceneElementLabelPoint(element, 0), parent.position.y + (fence ? height : 0) + .10));
            }
        }
        const bounds = new Box3().setFromObject(group).union(assetBounds);
        for (const anchor of anchors.values()) {bounds.expandByPoint(anchor);}
        return {
            group, anchors, bounds, frame,
            updateWalls(low: boolean) {
                // A viewing aid, not an inferred room interior or camera-facing wall.
                // Only height changes; every authored segment and entrance stays intact.
                for (const mesh of walls) {mesh.scale.y = low ? .20 / 1.1 : 1;}
            },
            dispose() {group.removeFromParent(); resources.dispose(); group.clear();},
        };
    } catch (error) {
        resources.dispose(); group.clear(); throw error;
    }
}
