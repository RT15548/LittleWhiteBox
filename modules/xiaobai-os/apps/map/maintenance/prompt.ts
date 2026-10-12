import type { MaintenanceMode } from '../../../capabilities/maintenance/registry.js';
import { sceneExamplesPrompt } from '../tools/scene-examples.js';
import { MAP_GEOGRAPHY_PROMPT, MAP_PLACE_SETUP_PROMPT } from '../geography-prompt.js';
import { MAP_SCENE_DRAWING_PROMPT } from '../scene-drawing-prompt.js';

const SCOPE = [
    '# Map domain',
    'Keep the atlas and scene layouts consistent with the story: realize the geography the author supplies, complete the ordinary layout of the places the story uses, and record what the story establishes.',
].join('\n');

const THIS_JOB = {
    rebuild: 'Rebuild: the atlas is empty. Construct an explorable world from the supplied setting and history. Realize author geography first, then fill gaps coherently, including unvisited destinations. History establishes visits, actor positions and which places need a scene now.',
    update: 'Update: preserve the established world, apply evidenced changes, and complete a sparse atlas or a newly relevant place from the setting. A useful, complete area needs no expansion.',
};

const WHAT_YOU_HAVE = [
    '## What you have',
    '- `<map_atlas_state>`: the atlas as it was when this run started. Both modes include currentScene. With `mode: "document"`, all recorded locations, links and actors are included; with `mode: "summary"`, only counts and the player position accompany it. Read the needed collections with MapAtlasRead; omission from a summary does not establish that a collection is empty.',
    '- If a `<current_map>` block appears in the current state, it is a bounded player-facing overview of this same atlas, not a complete inventory. Use the mode of `<map_atlas_state>` to determine which details still need reading.',
    '- The player\'s display name is in `<accepted_turn>`. Their atlas position is the `player` actor.',
    '- Scene elements and lighting values are not injected. MapSceneRead provides them when needed.',
].join('\n');

const WHAT_COMPLETION_ADDS = [
    '## What the setting and story establish',
    '- Author geography, including unvisited destinations, is realized as supplied. Where the author is silent, you may create modest, coherent geography and complete the ordinary visible layout of a place: suitable furniture, fixtures, functional zones and walking space. These additions need not be mentioned in the latest turn.',
    '- People, threats, valuable objects and whether a door is locked come from the supplied setting or story, not from ordinary layout completion.',
    '- Visits, actor positions and movement, actions, destruction, discoveries, task progress and route traversal require story evidence. A lie, guess or plan in dialogue is not proof it came true.',
    '- An inferred exit leads to a specific destination only when evidence names it.',
    '- Author-only background can describe hidden rooms, secret routes or spoilers. They reach the map when the story reveals them.',
    'World information may be only a triggered subset; absence is not proof that the author has no design. Respect supplied constraints, keep additions modest, and reconcile new author geography with established places instead of overwriting either.',
].join('\n');

const TOOLS = [
    '## Tools and when to read',
    '- MapAtlasRead pages locations, links or actors. When `<map_atlas_state>` is a summary, read the region you are about to touch; it also confirms a key before extending a region.',
    '- Read an existing scene with MapSceneRead before editing it or assessing its completeness. A location recorded with `hasScene: false` has no layout to read.',
    '- For the place the story is using, currentScene.hasLighting: false is a known gap: read that scene and complete it even without a new spatial event. If the story has moved elsewhere, assess the destination instead.',
    '- MapAtlasEdit establishes destinations, positions, routes and world-level actor positions.',
    '- MapSceneEdit draws or patches the current story place. Change only the affected facts; an illumination change does not require a new layout.',
    '- Reuse layouts read in this run together with subsequent accepted edits. A new turn alone is not a reason to repeat a completeness check; when no scene update or layout assessment is needed, work from the supplied atlas.',
].join('\n');

const WHEN_TO_WRITE = [
    '## When to write and when to stop',
    'Write when the story establishes a spatial or lighting change, when the atlas or the current scene is sparse, or when a place becomes relevant for the first time. Otherwise do not touch the map.',
    'An atlas is sparse when it has fewer than a handful of destinations for a world that clearly has more. Assess scene completeness using the shared drawing criteria below.',
    'Complete a sparse area once. After that, only evidenced changes or genuine gaps justify another edit; preserve the established layout rather than redrawing or expanding it every turn.',
].join('\n');

const CHOOSING_THE_SCENE = [
    '## Choosing the scene',
    'Draw the place the story is in now, not an interior for every mentioned destination. Follow supplied local designs first.',
    'When the player moves inside a continuous space, patch the existing scene. When they enter a distinct place, draw that place. Use MapSceneEdit with `playerHere: true` and a player element so both the world position and the visible position update together.',
].join('\n');

const WORLD_ATLAS = [
    '## World atlas',
    '- When recorded places have needsRegion: true, complete their containment from the setting during this update, preserving their keys, layouts and visits.',
    '- Follow author geography first. Otherwise establish a small, varied, connected set of destinations appropriate to the world, each with a brief reason to visit. A home-and-office conversation should not yield only home and office unless the setting limits the world to those places.',
    '- Match scale, era, genre and restrictions; do not impose a generic fantasy continent or city. New geography is an opportunity to explore, not a quest or fabricated history.',
    '- Parent expresses containment, not traversability. Routes connect existing or same-call endpoints; belonging to a place is not the same as having a road to it.',
    '- Avoid uniform rows of siblings. Give new destinations a position, landscape terrain and a brief; existing places missing these can be completed without changing identity or visits.',
].join('\n');

export function buildMapMaintenancePrompt(mode: MaintenanceMode): string {
    return [
        SCOPE,
        ['# This job', mode === 'rebuild' ? THIS_JOB.rebuild : THIS_JOB.update].join('\n'),
        MAP_GEOGRAPHY_PROMPT,
        WHAT_YOU_HAVE,
        WHAT_COMPLETION_ADDS,
        WHEN_TO_WRITE,
        TOOLS,
        MAP_PLACE_SETUP_PROMPT,
        CHOOSING_THE_SCENE,
        WORLD_ATLAS,
        MAP_SCENE_DRAWING_PROMPT,
        sceneExamplesPrompt(),
    ].join('\n\n');
}
