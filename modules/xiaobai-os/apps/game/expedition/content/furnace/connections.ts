import type { CourtyardScene, SceneDefinition } from '../world-types.js';
import { defineLandscapeScene } from '../../world/landscape.js';

/** Extensions to existing places are owned by the chapter, not copied scene definitions. */
const CONNECTIONS: Partial<Record<CourtyardScene, Pick<SceneDefinition, 'anchors' | 'exits' | 'objects'>>> = {
    camp: { anchors: {}, exits: [], objects: [
        { id: 'furnace_invitation', anchor: 'rest', kind: 'inspect', passage: 'furnace_invitation', condition: { all: ['warmth_seen_home'], none: ['furnace_invited'] } },
        { id: 'furnace_home', anchor: 'rest', kind: 'inspect', passage: 'furnace_home', condition: { all: ['city_rekindled'] } },
    ] },
    heat_station: { anchors: { furnace_terrace: { x: 22, y: 7 } },
        exits: [{ id: 'furnace_terrace', anchor: 'furnace_terrace', to: 'furnace_terrace', arrival: 'south', condition: { all: ['furnace_invited'] } }],
        objects: [{ id: 'division_plan', anchor: 'plan', kind: 'inspect', passage: 'division_plan', condition: { all: ['furnace_offer_heard'], none: ['division_works_started'] } }] },
    south_street: { anchors: { furnace_cargo: { x: 29, y: -15 }, delivery: { x: 25, y: -11 } },
        exits: [{ id: 'return_bridge', anchor: 'furnace_cargo', to: 'return_bridge', arrival: 'north', condition: { all: ['furnace_convoy_secured'] } }],
        objects: [{ id: 'furnace_delivery', anchor: 'delivery', kind: 'inspect', passage: 'furnace_delivery', condition: { all: ['furnace_convoy_secured'] } },
            { id: 'furnace_shelter', anchor: 'rest', kind: 'inspect', passage: 'furnace_shelter', condition: { all: ['division_works_started'], none: ['furnace_stilled'] } },
            { id: 'laobai_return', anchor: 'tea', kind: 'inspect', passage: 'laobai_return', condition: { all: ['division_works_started'] } }] },
    workshop_street: { anchors: {}, exits: [], objects: [{ id: 'furnace_tools', anchor: 'pipes', kind: 'inspect', passage: 'furnace_tools', condition: { all: ['division_works_started'], none: ['furnace_stilled'] } }] },
    sanniang_room: { anchors: {}, exits: [], objects: [{ id: 'sanniang_coda', anchor: 'settle', kind: 'inspect', passage: 'sanniang_coda', condition: { all: ['long_night_ended', 'sanniang_furnace_pause'] } }] },
    anian_room: { anchors: {}, exits: [], objects: [{ id: 'anian_coda', anchor: 'settle', kind: 'inspect', passage: 'anian_coda', condition: { all: ['long_night_ended', 'anian_snow_view'] } }] },
    kouzi_home: { anchors: {}, exits: [], objects: [{ id: 'kouzi_coda', anchor: 'settle', kind: 'inspect', passage: 'kouzi_coda', condition: { all: ['long_night_ended', 'kouzi_furnace_crossing'] } }] },
    laobai_home: { anchors: {}, exits: [], objects: [{ id: 'laobai_coda', anchor: 'settle', kind: 'inspect', passage: 'laobai_coda', condition: { all: ['long_night_ended', 'laobai_return_seat'] } }] },
};
export function connectFurnace(scene: SceneDefinition): SceneDefinition {
    const extra = CONNECTIONS[scene.id];
    return extra ? defineLandscapeScene({ ...scene, anchors: { ...scene.anchors, ...extra.anchors },
        exits: [...scene.exits, ...extra.exits], objects: [...scene.objects, ...extra.objects] }) : scene;
}
