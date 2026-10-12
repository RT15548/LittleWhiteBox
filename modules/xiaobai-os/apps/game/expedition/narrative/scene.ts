import type { Campaign } from '../campaign/types.js';
import { parleyInteractions, parleyPosition } from '../campaign/parley.js';
import { COURTYARD } from '../content/courtyard.js';
import { PARLEY_ENEMIES } from '../content/parley.js';
import { DESTINATIONS } from '../content/people-places.js';
import { isPerson, participantName, type Participant } from '../content/participants.js';
import { WORLD_COPY } from '../content/world-copy.js';
import { reachablePersonInteractions, sceneRoute } from '../world/people.js';
import { conditionMet, reachableInteractions, sceneSpace } from '../world/exploration.js';
import { worldLineClear } from '../world/geometry.js';
import { livingSpace, LIVING_SPACES } from '../content/living-spaces.js';
import { LOCAL_LIFE, LOCAL_ACTIVITY } from '../content/local-life.js';
import { PERSON_IDS } from '../content/people.js';
import { rescuePhase } from '../campaign/rescue.js';
import { RESCUE_COPY } from '../content/rescue-copy.js';
import { chapterProgress } from '../campaign/progress.js';
import { campaignObjective } from '../content/campaign-copy.js';
import { SUPPLIES_HANDOFF } from '../content/supplies.js';
import { findWorldPath } from '../world/navigation.js';
import { RULES } from '../content.js';
import { routeContext } from './navigation.js';

/** Nearby means within the game's talking reach and line of sight, not everyone in the scene. */
export function conversationScene(campaign: Campaign, person: Participant) {
    const facts = new Set(campaign.facts), resident = isPerson(person) ? campaign.people[person] : null;
    const scene = COURTYARD[isPerson(person) ? campaign.people[person].scene : PARLEY_ENEMIES[person].scene];
    const position = isPerson(person) ? campaign.people[person].position : parleyPosition(person, facts);
    const residents = reachablePersonInteractions(scene, position, facts, campaign.people);
    const guards = parleyInteractions(scene.id, position, facts)
        .filter(item => worldLineClear(sceneSpace(scene, facts), position, item.position));
    const room = livingSpace(scene.id);
    const rescue = isPerson(person) ? rescuePhase(campaign.facts, person) : null;
    const reachable = campaign.location.scene === scene.id ? reachableInteractions(scene, campaign.location, facts) : [];
    const progress = chapterProgress(campaign), handoff = SUPPLIES_HANDOFF;
    const space = sceneSpace(scene, facts);
    return { place: WORLD_COPY.scenes[scene.id],
        chapter: { phase: progress.phase, playerObjective: campaignObjective(campaign), optionalRoots: progress.optionalRoots },
        supplies: { phase: progress.supplies, situation: handoff.situation[progress.supplies],
            collection: { scene: handoff.scene, place: WORLD_COPY.scenes[handoff.scene], interaction: WORLD_COPY.passages[handoff.object.passage].title,
                position: COURTYARD[handoff.scene].anchors[handoff.object.anchor], available: conditionMet(handoff.object.condition, facts),
                route: routeContext(campaign.location.scene, sceneRoute(campaign.location, { scene: handoff.scene, anchor: handoff.object.anchor }, facts, false)) } },
        exits: scene.exits.map(exit => {
            const at = scene.anchors[exit.anchor], open = conditionMet(exit.condition, facts);
            return { id: exit.id, to: exit.to, place: WORLD_COPY.scenes[exit.to], position: at, open,
                selfAccessible: open && findWorldPath(space, position, at, RULES.playerRadius) !== null,
                playerAccessible: open && campaign.location.scene === scene.id && findWorldPath(space, campaign.location.position, at, RULES.playerRadius) !== null,
                withinReach: reachable.some(item => item.target.id === exit.id) };
        }),
        playerLodging: LIVING_SPACES.guest_room.name,
        ...(rescue ? { rescue: { phase: rescue, situation: RESCUE_COPY[rescue] } } : {}),
        playerMechanisms: scene.objects.flatMap(item => item.kind === 'switch' && conditionMet(item.condition, facts)
            ? [{ id: item.id, action: WORLD_COPY.switches[item.fact], position: scene.anchors[item.anchor],
                completed: facts.has(item.fact), withinReach: reachable.some(entry => entry.target.id === item.id) }] : []),
        ...(room ? { room: { use: room.use, enclosure: room.enclosure,
            household: room.household.map(id => id === 'player' ? campaign.traveler.name : id === 'anian_parents' || id === 'innkeeper' ? WORLD_COPY.households[id] : participantName(id)),
            furniture: room.furniture.map(item => ({ item: item.label, position: { x: item.footprint.x, y: item.footprint.z } })),
            exits: scene.exits.map(exit => ({ place: WORLD_COPY.scenes[exit.to], position: scene.anchors[exit.anchor] })) } } : {}),
        positions: { player: campaign.location.position, self: position },
        present: [campaign.traveler.name, ...PERSON_IDS.filter(id => campaign.people[id].scene === scene.id).map(participantName),
            ...guards.map(item => participantName(item.target.id as Participant))],
        residents: (LOCAL_LIFE[scene.id] ?? []).map(local => ({ name: local.name, activity: LOCAL_ACTIVITY[local.activity] })),
        movement: resident ? { mode: resident.mode, destination: resident.destination ? DESTINATIONS[resident.destination].name : null,
            leader: resident.mode === 'follow' ? campaign.traveler.name : null } : null,
        nearby: [...residents, ...guards].filter(item => item.target.id !== person)
            .map(item => participantName(item.target.id as Participant)) };
}
