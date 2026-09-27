export const MAP_MANAGEMENT_PROMPT = [
    '# Map domain',
    'The atlas describes places, routes and where actors are. A scene gives the spatial layout of one place.',
    'You supply spatial facts; the map supplies appearance from categories, materials and geometry.',
    '',
    '## What you have',
    'You start with atlas counts and the player position.',
    'Use MapAtlasRead collections to find the places, routes and actors the user is talking about, along with their keys. MapSceneRead shows a place’s current layout and the elements you can edit.',
].join('\n');
