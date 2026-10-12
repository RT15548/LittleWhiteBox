import { Color, type DataTexture, DoubleSide, LineDashedMaterial, type MeshStandardMaterial, MeshPhysicalMaterial } from 'three';
import type { MapElement, MapSceneLighting } from '../../../../domains/map/types.js';
import { SCENE_MATERIAL_COLORS } from '../scene-materials.js';
import { elementPresentation } from '../map-presentation.js';
import type { Scene3DResources } from './scene3d-resources.js';
import { createSurfaceTexture } from './scene3d-textures.js';
import { sceneLighting } from '../scene-lighting.js';
import { isGroundSurface } from '../scene-ground-surfaces.js';
import { createGroundTextures } from './scene3d-ground.js';

const SURFACE_COLORS = {
    ...SCENE_MATERIAL_COLORS,
    wood: '#966f51', stone: '#a5b0b9', tile: '#d2dce2', carpet: '#956e78',
    fabric: '#608e92', 'bed-sheet': '#e3e7e9', metal: '#98acbf', glass: '#b3deeb',
    marble: '#e5e6e7', water: '#458da9', grass: '#94b67d', forest: '#4e8666',
};

export function createSceneMaterials(resources: Scene3DResources, dark: boolean, lighting?: MapSceneLighting) {
    const illumination = sceneLighting(lighting);
    const meshes = new Map<string, MeshStandardMaterial>();
    const lines = new Map<string, LineDashedMaterial>();
    const textures = new Map<string, DataTexture>();
    const groundTextures = new Map<string, ReturnType<typeof createGroundTextures>>();
    function mesh(element: MapElement, tint = 0, ground = false): MeshStandardMaterial {
        const token = element.material || (element.category === 'water' ? 'water' : 'unknown');
        const surface = ground && isGroundSurface(token) ? token : undefined;
        const key = `${token}:${element.category}:${element.certainty}:${tint}:${!!surface}`;
        let material = meshes.get(key);
        if (!material) {
            const special = { danger: '#d77c80', magic: '#b29cdb', light: '#f4d697', actor: '#4598cf', marker: '#72b9cb', secret: '#8d9ca9' };
            const floor = element.category === 'terrain';
            const base = token === 'wood' && floor ? '#b69a77' : SURFACE_COLORS[token];
            const color = new Color(surface ? '#ffffff' : !element.material && element.category in special ? special[element.category as keyof typeof special] : base);
            // UI theme must not muddy the material identity or reduce map contrast.
            color.lerp(new Color(tint > 0 ? '#ffffff' : '#201c1a'), Math.abs(tint));
            const opacity = elementPresentation(element, '').opacity * (token === 'glass' ? .42 : token === 'slime' ? .88 : 1);
            const textured = !surface && !['unknown', 'glass', 'rune', 'warm-light', 'cold-light', 'shadow'].includes(token);
            const textureKey = `${token}:${floor}`;
            if (textured && !textures.has(textureKey)) {textures.set(textureKey, resources.own(createSurfaceTexture(token, floor)));}
            const texture = textured ? textures.get(textureKey)! : null;
            if (surface && !groundTextures.has(surface)) { groundTextures.set(surface, createGroundTextures(surface, resources)); }
            const groundChannels = surface ? groundTextures.get(surface) : undefined;
            const wet = ['water', 'slime', 'flesh', 'blood', 'glass'].includes(token);
            material = resources.own(new MeshPhysicalMaterial({
                color, roughness: token === 'metal' ? .35 : wet ? .26 : token === 'wood' ? .63 : .86,
                metalness: token === 'metal' ? .65 : 0, transparent: opacity < 1, opacity,
                clearcoat: wet ? .65 : 0, clearcoatRoughness: .23, dithering: true,
                depthWrite: opacity >= 1, side: DoubleSide, map: texture,
                bumpMap: texture, bumpScale: token === 'stone' || token === 'dirt' ? .055 : wet ? .018 : .014,
                emissive: ['rune', 'warm-light', 'cold-light'].includes(token) ? color : '#000000',
                emissiveIntensity: token === 'warm-light' || token === 'cold-light' ? illumination.lampEmission : .18,
                ...(groundChannels && { ...groundChannels, roughness: 1 }),
            }));
            meshes.set(key, material);
        }
        return material;
    }
    function line(element: MapElement): LineDashedMaterial {
        const key = `${element.certainty}:${element.category}`;
        let material = lines.get(key);
        if (!material) {
            const uncertain = element.certainty && element.certainty !== 'confirmed';
            material = resources.own(new LineDashedMaterial({
                color: dark ? '#91a4b2' : '#596d78',
                dashSize: element.certainty === 'unknown' ? .035 : .12, gapSize: uncertain ? .09 : 0,
                transparent: true, opacity: elementPresentation(element, '').opacity * (uncertain ? .7 : .28),
            }));
            lines.set(key, material);
        }
        return material;
    }
    function lampShade(element: MapElement, tint = 0): MeshStandardMaterial {
        const material = lighting?.artificial === 'on'
            ? (element.material === 'cold-light' ? 'cold-light' : 'warm-light') : 'bed-sheet';
        return mesh({ ...element, material }, tint);
    }
    return { mesh, ground: (element: MapElement) => mesh(element, 0, true), line, lampShade };
}
