import type { Campaign } from '../campaign/types.js';
import { isPerson, participantName, type Participant } from '../content/participants.js';
import { PARLEY_ENEMIES } from '../content/parley.js';
import { OUTFIT_COPY, WEAPON_COPY } from '../copy.js';
import { narrativeActions, secretFact } from './actions.js';
import { projectStage, type RelationshipStage } from './stages.js';
import { projectRelationship } from './relationship-profile.js';
import { personMap } from '../world/people.js';
import type { NarrativeCanon } from './canon.js';
import { performanceOptions } from '../performance/catalog.js';
import { responseInstruction } from './response.js';
import { memoryBoundary, replayTurns, witnessedEvents } from './history.js';
import { conversationScene } from './scene.js';
import { greetingTurn } from '../content/greetings.js';
import { CLOTHING_SLOTS } from '../content/clothing.js';
import { currentClothing } from '../clothing.js';
import { travelerContext } from './traveler.js';
import { hasReturned } from '../campaign/rescue.js';
import { routeContext } from './navigation.js';

export function conversationContext(campaign: Campaign, person: Participant, stages: readonly RelationshipStage[] = []) {
    const actionMeanings = narrativeActions(campaign, person, stages), actions = Object.keys(actionMeanings);
    const shared = { person: participantName(person), ...conversationScene(campaign, person),
        clothing: currentClothing(campaign, person),
        events: witnessedEvents(campaign.knowledge[person]), actions, actionMeanings };
    if (!isPerson(person)) {
        const spec = PARLEY_ENEMIES[person];
        return { ...shared, rescued: false, resolved: campaign.facts.includes(spec.complete) };
    }
    return { ...shared, map: personMap(campaign, person).map(place => ({ ...place, route: routeContext(campaign.people[person].scene, place.route) })),
        rescued: hasReturned(campaign.facts, person),
        affection: campaign.relationships[person].affection };
}
function block(tag: string, content: string) { return `<${tag}>\n${content}\n</${tag}>`; }
export function buildConversationPrompt(campaign: Campaign, person: Participant, text: string, canon: NarrativeCanon,
    memory = campaign.memories[person]) {
    const context = conversationContext(campaign, person, canon.stages);
    const performance = performanceOptions(person);
    const secret = isPerson(person) ? secretFact(person) : null;
    const stage = isPerson(person) ? {
        psychology: projectRelationship(canon.relationship!, campaign.relationships[person].affection).psychology,
        ...projectStage(canon.stages, campaign.relationships[person], !!secret && campaign.facts.includes(secret)),
    } : null;
    const { actions: _actions, actionMeanings, events, ...situation } = context;
    const operations = { actions: actionMeanings, performance, clothing: CLOTHING_SLOTS };
    const story = { memory: memory?.text ?? null, events, ...situation,
        opening: campaign.conversations[person].some(t => t.kind === 'dialogue') || !isPerson(person) && campaign.facts.includes(PARLEY_ENEMIES[person].complete)
            ? null : context.rescued ? canon.opening.returned : canon.opening.initial,
        stage };
    return {
        systemPrompt: [canon.system.trim(), block('background', canon.world.trim()),
            block('player', `${canon.player.trim()}\n\n${JSON.stringify({ ...travelerContext(campaign.traveler),
                outfit: OUTFIT_COPY[campaign.outfit].detail, equipment: WEAPON_COPY[campaign.weapon].equipment }, null, 2)}`),
            block('NPCs', `${canon.npcs}\n\n${canon.character.trim()}`)].join('\n\n'),
        messages: [
            { role: 'user', content: `${block('meta_protocol', `${canon.protocol.trim()}\n\n${block('operations', JSON.stringify(operations, null, 2))}`)}\n\n<story>\n${JSON.stringify(story, null, 2)}` },
            ...replayTurns(campaign.conversations[person].length ? campaign.conversations[person].slice(memoryBoundary(campaign.conversations[person], memory)) : [greetingTurn(campaign, person)]),
            { role: 'user', content: `${text}\n</story>\n\n${responseInstruction(context.person)}` },
        ],
    };
}
