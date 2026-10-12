import { WORLD_COPY as c } from '../content/world-copy.js';
import type { Interaction } from '../world/exploration.js';
import { participantName } from '../content/participants.js';
import { COMBAT_COPY } from '../content/combat-copy.js';

export function interactionLabel(item: Interaction): string {
    if (item.kind === 'exit') { return `${c.actions.travel} ${c.scenes[item.target.to]}`; }
    const object = item.target;
    switch (object.kind) {
        case 'person': return `${c.actions.talk} · ${c.people[object.person]}`;
        case 'enemy': return `${c.actions.talk} · ${participantName(object.enemy)}`;
        case 'inspect': return c.passages[object.passage].title;
        case 'rest': return c.actions.rest;
        case 'reward': return COMBAT_COPY.cache;
        case 'switch': return c.switches[object.fact];
    }
}
