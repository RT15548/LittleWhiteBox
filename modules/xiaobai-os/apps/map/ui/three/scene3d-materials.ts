import { Color, type DataTexture, DoubleSide, LineDashedMaterial, MeshStandardMaterial } from 'three';
import type { MapElement } from '../../../../domains/map/types.js';
import { SCENE_MATERIAL_COLORS } from '../scene-materials.js';
import { elementPresentation } from '../map-presentation.js';
import type { Scene3DResources } from './scene3d-resources.js';
import { createSurfaceTexture } from './scene3d-textures.js';

const SURFACE_COLORS = {
    ...SCENE_MATERIAL_COLORS,
    wood: '#9c6847', stone: '#c5cbd0', tile: '#cbd6df', carpet: '#a67568',
    fabric: '#608e92', 'bed-sheet': '#e3e7e9', metal: '#98acbf', glass: '#b3deeb',
    marble: '#e5e6e7', water: '#6aabbf', grass: '#b7cba0', forest: '#6d957d',
};

export function createSceneMaterials(resources: Scene3DResources, dark: boolean) {
    const meshes = new Map<string, MeshStandardMaterial>();
    const lines = new Map<string, LineDashedMaterial>();
    const textures = new Map<string, DataTexture>();
    function mesh(element: MapElement, tint = 0): MeshStandardMaterial {
        const token = element.material || (element.category === 'water' ? 'water' : 'unknown');
        const key = `${token}:${element.category}:${element.certainty}:${tint}`;
        let material = meshes.get(key);
        if (!material) {
            const special = { danger: '#d77c80', magic: '#b29cdb', light: '#f4d697', actor: '#4598cf', marker: '#72b9cb', secret: '#8d9ca9' };
            const floor = element.category === 'terrain';
            const base = token === 'wood' && floor ? '#c8ab85' : SURFACE_COLORS[token];
            const color = new Color(!element.material && element.category in special ? special[element.category as keyof typeof special] : base);
            // UI theme must not muddy the material identity or reduce map contrast.
            color.lerp(new Color(tint > 0 ? '#ffffff' : '#201c1a'), Math.abs(tint));
            const opacity = elementPresentation(element, '').opacity * (token === 'glass' ? .42 : 1);
            const textured = ['wood', 'tile', 'tatami', 'fabric', 'carpet', 'bed-sheet', 'stone', 'sand', 'dirt', 'marble'].includes(token);
            const textureKey = `${token}:${floor}`;
            if (textured && !textures.has(textureKey)) {textures.set(textureKey, resources.own(createSurfaceTexture(token, floor)));}
            const texture = textures.get(textureKey) || null;
            material = resources.own(new MeshStandardMaterial({
                color, roughness: token === 'metal' ? .32 : token === 'glass' || token === 'water' ? .22 : token === 'wood' ? .64 : .92,
                metalness: token === 'metal' ? .32 : 0, transparent: opacity < 1, opacity,
                depthWrite: opacity >= 1, side: DoubleSide, map: texture,
                bumpMap: texture, bumpScale: token === 'wood' ? .018 : .009,
                emissive: ['rune', 'warm-light', 'cold-light'].includes(token) ? color : '#000000', emissiveIntensity: .18,
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
                color: dark ? '#b1bfca' : '#798b91',
                dashSize: element.certainty === 'unknown' ? .035 : .12, gapSize: uncertain ? .09 : 0,
                transparent: true, opacity: elementPresentation(element, '').opacity,
            }));
            lines.set(key, material);
        }
        return material;
    }
    return { mesh, line };
}
