import type { MapScene, MapSceneLighting } from '../../../domains/map/types.js';
import { MAP_MOOD_RECIPES } from './map-presentation.js';
import { isAreaElement, sceneElementBounds, sceneUnitScale } from './scene-geometry.js';

interface SceneLight {
    readonly color: string;
    readonly intensity: number;
}

export interface SceneLightingRecipe {
    readonly sky: SceneLight;
    readonly ground: string;
    readonly key: SceneLight;
    readonly fill: SceneLight;
    readonly shadows: boolean;
    /** RGB multipliers for artwork only; names and navigation keep their UI contrast. */
    readonly surface?: readonly [number, number, number];
    readonly lampEmission: number;
}

/** The original studio lighting, including colours and intensities, is the absent-key contract. */
const DEFAULT_LIGHTING: SceneLightingRecipe = {
    sky: { color: '#f5f8ff', intensity: 1.65 }, ground: '#9c8c7a',
    key: { color: '#fff3df', intensity: 3.1 }, fill: { color: '#daeaff', intensity: .65 },
    shadows: true, lampEmission: .18,
};

const NATURAL_LIGHTING: Record<MapSceneLighting['space'], Record<MapSceneLighting['natural'], Omit<SceneLightingRecipe, 'lampEmission'>>> = {
    indoor: {
        sunlight: {
            sky: { color: '#dceaff', intensity: .7 }, ground: '#8a8d98',
            key: { color: '#fff0d4', intensity: 3.6 }, fill: { color: '#bcd4ff', intensity: .18 },
            shadows: true, surface: [1.06, 1.02, .91],
        },
        daylight: {
            sky: { color: '#e4eeff', intensity: 1.1 }, ground: '#8c929b',
            key: { color: '#e4edff', intensity: .4 }, fill: { color: '#dce9ff', intensity: .45 },
            shadows: false, surface: [.89, .94, 1],
        },
        night: {
            sky: { color: '#bccff0', intensity: .55 }, ground: '#667589',
            key: { color: '#c5d7ff', intensity: .12 }, fill: { color: '#bdd5ff', intensity: .3 },
            shadows: false, surface: [.46, .54, .69],
        },
    },
    outdoor: {
        sunlight: {
            sky: { color: '#dceeff', intensity: .9 }, ground: '#9b9b8c',
            key: { color: '#fff0d4', intensity: 4 }, fill: { color: '#c7deff', intensity: .25 },
            shadows: true, surface: [1.08, 1.04, .94],
        },
        daylight: {
            sky: { color: '#e1eaff', intensity: 1.6 }, ground: '#a3a9b2',
            key: { color: '#edf2ff', intensity: .45 }, fill: { color: '#dbe6ff', intensity: .65 },
            shadows: false, surface: [.93, .98, 1.03],
        },
        night: {
            sky: { color: '#b8cfff', intensity: .48 }, ground: '#596f8b',
            key: { color: '#c5daff', intensity: .22 }, fill: { color: '#abc9ff', intensity: .26 },
            shadows: false, surface: [.5, .61, .78],
        },
    },
};

/** Environmental facts select local recipes; UI theme and wall-clock time never infer them. */
export function sceneLighting(lighting?: MapSceneLighting): SceneLightingRecipe {
    if (!lighting) {return DEFAULT_LIGHTING;}
    const natural = NATURAL_LIGHTING[lighting.space][lighting.natural];
    if (lighting.artificial === 'off') {return { ...natural, lampEmission: 0 };}
    // Lamps illuminate locally. Turning one on does not recolour the sun or the sky.
    return { ...natural, lampEmission: 1.2 };
}

export function sceneLightingStyle(scene: MapScene): Record<string, string> {
    return { '--scene-glow': MAP_MOOD_RECIPES[scene.mood || 'neutral'].glow };
}

export function sceneSurfaceMatrix(surface?: readonly [number, number, number]): string | undefined {
    if (!surface) {return undefined;}
    const [r, g, b] = surface;
    return `${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`;
}

export function sceneLightingMatrix(lighting?: MapSceneLighting): string | undefined {
    return sceneSurfaceMatrix(sceneLighting(lighting).surface);
}

export const MAX_SCENE_LIGHT_SOURCES = 4;
export const MAX_SCENE_LIGHT_SHADOWS = 1;
export const SCENE_SUN_DIRECTION = [-1, .95, -.6] as const;

const LAMP_COLOURS = {
    warm: { color: '#ffd59a', surface: [1.35, 1.12, .79] as const },
    cold: { color: '#c5e4ff', surface: [.99, 1.15, 1.35] as const },
};

export interface SceneLightSource {
    readonly id: string;
    readonly x: number;
    readonly y: number;
    /** Radius is in map coordinates, like the source's position. */
    readonly radius: number;
    readonly overhead: boolean;
    readonly color: string;
    readonly surface: readonly [number, number, number];
}

/** Shared 2D/3D light placement. This is presentation only; it creates no scene elements. */
export function sceneLightSources(scene: MapScene): SceneLightSource[] {
    if (scene.lighting?.artificial !== 'on') {return [];}
    const floor = scene.elements.filter(element => element.category === 'terrain' && isAreaElement(element))
        .map(sceneElementBounds).sort((a, b) => b.width * b.height - a.width * a.height)[0];
    const [x, y, width, height] = floor ? [floor.x, floor.y, floor.width, floor.height] : scene.viewBox;
    const unit = sceneUnitScale(width, height);
    const fixtures = scene.elements.filter(element => element.shape !== 'label' && element.material !== 'shadow'
        && (element.category === 'light' || element.icon === 'light' || element.icon === 'fire'))
        .sort((a, b) => a.id.localeCompare(b.id)).slice(0, MAX_SCENE_LIGHT_SOURCES);
    if (fixtures.length) {
        return fixtures.map(element => {
            const b = sceneElementBounds(element);
            const size = Math.max(b.width, b.height);
            const overhead = element.category === 'light' && !element.icon;
            return { id: element.id, x: b.x + b.width / 2, y: b.y + b.height / 2,
                radius: size > 0 ? size * (overhead ? 1.3 : 6) : unit * 3.8,
                overhead,
                ...(element.material === 'cold-light' ? LAMP_COLOURS.cold : LAMP_COLOURS.warm) };
        });
    }
    // Illumination is known but fixture positions are not. Represent it as broad overhead
    // illumination over the main surface, without inventing or persisting a visible lamp.
    return [{ id: 'overhead', x: x + width / 2, y: y + height / 2,
        radius: Math.max(width, height) * .58, overhead: true, ...LAMP_COLOURS.warm }];
}
