/** Shared scene-drawing facts for maintenance and administration. Field meanings stay in the tool contract. */
export const MAP_SCENE_DRAWING_PROMPT = [
    '## Reading a place into geometry',
    'Named areas within the place become terrain elements. Boundaries become walls with real gaps where openings are evidenced. Roads, trails and corridors become paths. Rivers and lakes with meaningful banks become closed water areas; an open water line is only a schematic centreline.',
    'Furniture and fixtures become rect or circle footprints with an icon when a familiar token fits, or their real outline with a short label when nothing fits. Doors, stairs and exits become door elements at the opening. People become actors where evidence places them.',
    '',
    '## What the app draws for you',
    'You supply spatial facts in two dimensions; the app supplies flat or three-dimensional appearance from category, object type, material, size and rotation.',
    '- Walls draw boundaries only. Openings are the gaps you leave; a door icon does not cut a wall. Nothing is snapped, rerouted or reconnected for you.',
    '- A forest is a terrain area with material `forest`; its canopy is generated. A sized `tree` icon is one physical tree.',
    '- Labels are positioned automatically and never rotated. Put the name on the element itself; a separate label element is for text that belongs to no object, and the scene title is already shown.',
    '',
    '## Drawing a layout',
    '1. Identify the continuous place, its established anchors, directions, entrances and main circulation, and map the story’s relative directions onto the map compass.',
    '2. Choose a consistent relative scale and a full-map viewBox. Give the main surface a coherent extent. Contained places normally have a terrain floor and a separate wall boundary; open places need no enclosing wall.',
    '3. Place zones and object footprints in proportion to each other. Preserve established positions, leave usable aisles, and keep evidenced entrances connected to those aisles. Related objects may touch; unrelated solid footprints should not overlap. Do not distribute objects evenly just to fill the map.',
    '4. Give routes only endpoints and genuine turns. Area vertices follow the perimeter in order; for a river, follow one bank downstream and the other back upstream. Use curves for actual curved features.',
    '5. Check containment, openings, circulation, relative directions and label margins before submitting. Use as many elements as the place needs and no more.',
].join('\n');
