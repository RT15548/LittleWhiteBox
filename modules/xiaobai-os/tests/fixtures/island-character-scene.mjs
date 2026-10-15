// Isolated browser acceptance: real domain/services, no provider calls or private user files.
import { randomUUID } from 'node:crypto';
import { newJourney } from '../../apps/game/island/world.ts';
import { createItem } from '../../apps/game/island/inventory.ts';
import { plainWater } from '../../apps/game/island/water.ts';

export function characterReviewWorld() {
    const world = newJourney('character-browser'), center = { x: -706, y: 0 };
    const positions = { player: [0, 0], ye: [1.1, .45], lin: [-3, -1], zhou: [3, -2], xu: [-2, 3], chen: [4, 3], luo: [-4, 2] };
    for (const [id, [x, y]] of Object.entries(positions)) {
        world.people[id].position = { x: center.x + x, y: center.y + y };
        if (id !== 'player' && id !== 'ye') { world.people[id].activity = { kind: 'rest', until: 3600 }; }
    }
    const cup = createItem(world, 'ye', 'metal_cup', 1); world.items[cup].water = plainWater(350, 'treated');
    createItem(world, 'ye', 'branch', 3);
    return world;
}
export async function driveCharacterReview(service, input) {
    const request = () => ({ id: randomUUID(), revision: service.view().revision });
    if (input.kind === 'npc') {
        return service.scene(request(), input.actor, async work => { work.act(input.actor, input.operation); }, () => true);
    }
    if (input.kind === 'work') {
        return service.scene(request(), input.actor, async work => {
            let cup;
            for (let offset = 0; offset !== null;) {
                const observation = work.context(offset).find(view => view.observer === input.actor);
                cup = observation.items.find(item => item.kind === 'metal_cup' && item.location.kind === 'carried' && item.location.person === input.actor);
                if (cup) break;
                offset = observation.next;
            }
            if (!cup || !['drink', 'wash'].includes(input.task)) { throw new Error('character_review_supply'); }
            const task = input.task === 'drink' ? { kind: 'drink', container: cup.id, millilitres: 100 }
                : { kind: 'wash', supply: { kind: 'container', id: cup.id }, millilitres: 100 };
            work.act(input.actor, { kind: 'work', task });
        }, () => true);
    }
    if (input.kind === 'advance') {
        for (let pass = 0; pass < 6 && service.view().needsDecision; pass++) {
            await service.think(request(), 'decision', async work => {
                const observations = work.context();
                for (const actor of work.due()) {
                    const observation = observations.find(view => view.observer === actor);
                    work.act(actor, observation.self.activity ? { kind: 'intend', text: '继续眼前的事情。' } : { kind: 'rest', seconds: 3600 });
                }
            }, () => true);
        }
        return service.elapse(request(), input.seconds, () => true);
    }
    throw new Error('character_review_operation');
}
