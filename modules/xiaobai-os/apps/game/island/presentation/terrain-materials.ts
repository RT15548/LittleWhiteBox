import * as T from 'three';
import sand from '../assets/ground-sand.jpg?url&no-inline';
import scrub from '../assets/ground-scrub.jpg?url&no-inline';
import reef from '../assets/ground-reef.jpg?url&no-inline';
import mangrove from '../assets/ground-mangrove.jpg?url&no-inline';
import { seaLevel } from '../terrain.js';

export function groundMaterial(anisotropy: number, onLoad: () => void, onError: () => void) {
    const loader = new T.TextureLoader();
    const textures = [sand, scrub, reef, mangrove].map(url => {
        const texture = loader.load(url, onLoad, undefined, onError);
        texture.wrapS = texture.wrapT = T.RepeatWrapping;
        texture.colorSpace = T.SRGBColorSpace; texture.anisotropy = Math.min(4, anisotropy);
        return texture;
    });
    const material = new T.MeshStandardMaterial({ map: textures[0], roughness: 1 });
    const waterline = { value: seaLevel(0) };
    material.onBeforeCompile = shader => {
        shader.uniforms.waterline = waterline;
        shader.uniforms.scrubMap = { value: textures[1] }; shader.uniforms.reefMap = { value: textures[2] }; shader.uniforms.mangroveMap = { value: textures[3] };
        shader.vertexShader = `attribute vec4 groundBlend; varying vec4 vGroundBlend; varying float groundHeight;\n${shader.vertexShader}`
            .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGroundBlend = groundBlend; groundHeight = (modelMatrix * vec4(position, 1.)).y;');
        shader.fragmentShader = `uniform sampler2D scrubMap; uniform sampler2D reefMap; uniform sampler2D mangroveMap; uniform float waterline; varying vec4 vGroundBlend; varying float groundHeight;\n${shader.fragmentShader}`
            .replace('#include <map_fragment>', `diffuseColor *= texture2D(map, vMapUv) * vGroundBlend.x
                + texture2D(scrubMap, vMapUv) * vGroundBlend.y
                + texture2D(reefMap, vMapUv) * vGroundBlend.z
                + texture2D(mangroveMap, vMapUv) * vGroundBlend.w;
                float dampSand = (1. - smoothstep(waterline + .025, waterline + .15, groundHeight)) * vGroundBlend.x;
                diffuseColor.rgb *= mix(vec3(1.), vec3(.67, .73, .75), dampSand);`);
    };
    const reefRock = new T.MeshStandardMaterial({ map: textures[2], color: '#c4c7b4', roughness: .96, flatShading: true });
    return { material, reefRock, update(tide: number) { waterline.value = seaLevel(tide); },
        dispose() { reefRock.dispose(); for (const texture of textures) { texture.dispose(); } } };
}
