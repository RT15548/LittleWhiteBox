import type { Landscape, PersonId, Point } from './model.js';
import { COASTLINE } from './coastline.js';

// Authored metre-based level geometry, not a geographic claim.
// The renderer consumes these same boundaries; screens do not block walking.
export const LANDSCAPE: Landscape = {
    land: COASTLINE,
    obstacles: [],
    sightScreens: [
        [{ x: -670, y: -60 }, { x: -590, y: -80 }, { x: -570, y: 80 }, { x: -640, y: 110 }],
        [{ x: -300, y: -120 }, { x: -160, y: -160 }, { x: -100, y: 100 }, { x: -250, y: 140 }],
    ],
    soundScreens: [],
};
export const LANDING: Record<PersonId, Point> = {
    player: { x: -728, y: 0 }, lin: { x: -726, y: 1 }, zhou: { x: -728, y: -2 }, xu: { x: -730, y: 1 },
    chen: { x: -727, y: 3 }, ye: { x: -729, y: -3 }, luo: { x: -731, y: 0 },
};

// Game-scale parameters only. Physiology, terrain hazards and medical rates are not implied.
export const RULES = {
    walkMetresPerSecond: 1,
    hearingMetres: 8,
    sightMetres: 35,
    reachMetres: 1.5,
    takeSeconds: 2,
    maxAdvanceSeconds: 3600,
    maxRoutePoints: 64,
    maxSpeechCharacters: 8000,
} as const;

// Metres relative to the authored coast, not a measured Indian Ocean tide table.
export const TIDE = { periodSeconds: 12.42 * 3600, forageMax: .6, lowWater: -.08, highWater: .65 } as const;
