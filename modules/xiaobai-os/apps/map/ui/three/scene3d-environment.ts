import { PMREMGenerator, type Scene, type WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { MapSceneLighting } from '../../../../domains/map/types.js';

/** Neutral reflection light, not a visible room, map geometry or additional light source. */
export function createReflectionEnvironment(renderer: WebGLRenderer, scene: Scene) {
    const generator = new PMREMGenerator(renderer), studio = new RoomEnvironment();
    let target;
    try {target = generator.fromScene(studio, .06, .1, 100, { size: 128 });}
    finally {studio.dispose(); generator.dispose();}
    scene.environment = target.texture;
    return {
        update(lighting?: MapSceneLighting) {
            scene.environmentIntensity = lighting?.natural === 'night' ? .08 : .18;
        },
        dispose() {scene.environment = null; target.dispose();},
    };
}
