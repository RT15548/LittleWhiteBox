import { type Box3, DirectionalLight, HemisphereLight, PointLight, type Scene, Vector3 } from 'three';
import type { MapScene } from '../../../../domains/map/types.js';
import { MAX_SCENE_LIGHT_SHADOWS, sceneLighting, sceneLightSources, SCENE_SUN_DIRECTION } from '../scene-lighting.js';
import type { sceneFrame } from './scene3d-geometry.js';

/** Owns only the scene's light rig and shadow maps, not geometry, camera or render scheduling. */
export function createSceneLighting(scene: Scene) {
    const defaults = sceneLighting();
    const ambient = new HemisphereLight(defaults.sky.color, defaults.ground, defaults.sky.intensity);
    const key = new DirectionalLight(defaults.key.color, defaults.key.intensity);
    const fill = new DirectionalLight(defaults.fill.color, defaults.fill.intensity);
    const lamps: PointLight[] = [];
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.normalBias = .012;
    key.shadow.bias = -.00015;
    key.shadow.radius = 2;
    scene.add(ambient, key, key.target, fill);
    function removeLamp() {
        const light = lamps.pop()!;
        light.removeFromParent(); light.dispose();
    }
    return {
        update(data: MapScene, frame: ReturnType<typeof sceneFrame>, bounds: Box3, anchors: ReadonlyMap<string, Vector3>) {
            const recipe = sceneLighting(data.lighting);
            ambient.color.set(recipe.sky.color); ambient.groundColor.set(recipe.ground); ambient.intensity = recipe.sky.intensity;
            key.color.set(recipe.key.color); key.intensity = recipe.key.intensity; key.castShadow = recipe.shadows;
            fill.color.set(recipe.fill.color); fill.intensity = recipe.fill.intensity;
            const center = bounds.getCenter(new Vector3());
            const span = Math.max(1, bounds.getSize(new Vector3()).length());
            const direction = data.lighting ? new Vector3(...SCENE_SUN_DIRECTION) : new Vector3(-.5, 1, .5);
            key.position.copy(center).add(direction.multiplyScalar(span));
            key.target.position.copy(center);
            fill.position.copy(center).add(new Vector3(span, span / 2, -span));
            key.updateMatrixWorld(true); key.target.updateMatrixWorld(true);
            key.shadow.updateMatrices(key);
            const shadowBounds = bounds.clone().applyMatrix4(key.shadow.camera.matrixWorldInverse);
            Object.assign(key.shadow.camera, {
                left: shadowBounds.min.x - .3, right: shadowBounds.max.x + .3,
                top: shadowBounds.max.y + .3, bottom: shadowBounds.min.y - .3,
                near: Math.max(.01, -shadowBounds.max.z - 1), far: -shadowBounds.min.z + 1,
            });
            key.shadow.camera.updateProjectionMatrix(); key.shadow.needsUpdate = true;

            const sources = sceneLightSources(data);
            while (lamps.length > sources.length) {removeLamp();}
            sources.forEach((source, index) => {
                let light = lamps[index];
                if (!light) {
                    light = new PointLight(); lamps.push(light); scene.add(light);
                    light.shadow.mapSize.set(512, 512);
                    light.shadow.normalBias = .025; light.shadow.bias = -.0002;
                    light.shadow.radius = 2;
                    light.shadow.autoUpdate = false;
                }
                const radius = source.radius / frame.scale;
                const height = source.overhead ? Math.max(2.2, radius * .44) : Math.max(1, anchors.get(source.id)?.y || 0);
                light.color.set(source.color);
                light.position.copy(frame.point(source.x, source.y, height));
                light.distance = Math.hypot(radius, height);
                light.decay = 2;
                light.intensity = height * height * (source.overhead ? 6 : 9);
                light.castShadow = index < MAX_SCENE_LIGHT_SHADOWS;
                light.shadow.camera.near = .08; light.shadow.camera.far = light.distance;
                light.shadow.camera.updateProjectionMatrix(); light.shadow.needsUpdate = true;
            });
        },
        invalidateShadows() {for (const light of lamps) {light.shadow.needsUpdate = true;}},
        dispose() {
            while (lamps.length) {removeLamp();}
            key.dispose(); key.removeFromParent(); key.target.removeFromParent();
            ambient.removeFromParent(); fill.removeFromParent();
        },
    };
}
