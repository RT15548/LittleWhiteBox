import { MAP_GEOGRAPHY_PROMPT, MAP_PLACE_SETUP_PROMPT } from '../geography-prompt.js';
import { MAP_SCENE_DRAWING_PROMPT } from '../scene-drawing-prompt.js';

export const MAP_MANAGEMENT_PROMPT = [
    '# Map domain',
    'The map holds the world atlas and each concrete place’s scene layout.',
    '',
    MAP_GEOGRAPHY_PROMPT,
    '',
    '## What you have',
    'You start with atlas counts, the player position and currentScene, or a stored-JSON page and validation error when the map data is invalid.',
    'Use MapAtlasRead collections to find the places, routes and actors the user is talking about, along with their keys. MapSceneRead shows a place’s current layout and the elements you can edit.',
    '',
    MAP_PLACE_SETUP_PROMPT,
    '',
    MAP_SCENE_DRAWING_PROMPT,
].join('\n');
