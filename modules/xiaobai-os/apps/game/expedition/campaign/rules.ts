import { createBattle, tickBattle } from '../combat.js';
import { RELIC_RULES, RULES } from '../content.js';
import { COURTYARD } from '../content/courtyard.js';
import { COURTYARD_ENCOUNTERS, courtyardBattle, nextEncounter, type EncounterSegment } from '../content/courtyard-encounters.js';
import type { CourtyardFact } from '../content/world-types.js';
import { fault, random } from '../random.js';
import { relicRank } from '../relics.js';
import type { Command, InputFrame, Loadout, Outfit, Relic, Weapon } from '../types.js';
import { interactWorld, sceneSpace, startWorld, walkWorld } from '../world/exploration.js';
import type { Campaign } from './types.js';
import { availableChoices, CAMPAIGN_ACTIONS } from '../content/campaign-actions.js';
import { PERSON_IDS } from '../content/people.js';
import { initialPeople, personAt, reachablePeople, relocatePeople, tickPeople } from '../world/people.js';
import { CAPTIVE_IDS, PERSON_PLACES } from '../content/people-places.js';
import { districtScene } from '../content/living-spaces.js';
import { hasReturned } from './rescue.js';
import { isPerson, PARTICIPANT_IDS, type Participant } from '../content/participants.js';
import { PARLEY_ENEMIES, PARLEY_IDS } from '../content/parley.js';
import { canParley } from './parley.js';
import { parseTraveler, type Traveler } from './traveler.js';
import { FIRST_CHAPTER } from '../content/chapters.js';
import { greet } from '../content/greetings.js';
import { pendingEnding } from './reply-checkpoint.js';
import { SUPPLIES_HANDOFF } from '../content/supplies.js';
import { grantRewardNode, rewardOffers } from './rewards.js';
import { campaignObjectVisible, canRebuildLoadout } from './interactions.js';
import { canStandInWorld } from '../world/geometry.js';
import { boundedFieldSpace } from '../combat/field.js';

export const CAMPAIGN_RULES = Object.freeze({ explorationSpeed: 1.65, playerTextLimit: 2000, replyTextLimit: 8000 });
export function campaignLoadout(campaign: Campaign): Loadout {
    return { weapon: campaign.weapon, oaths: [], relics: campaign.equipped.map(id => campaign.collection.find(r => r.id === id)!) };
}
export function loadoutIssue(campaign: Campaign, equipped: Relic[]) {
    if (!canRebuildLoadout(campaign)) { return 'unavailable'; }
    if (equipped.length > RULES.relicSlots) { return 'capacity'; }
    if (new Set(equipped).size !== equipped.length || equipped.some(id => !campaign.collection.some(r => r.id === id))) { return 'invalid'; }
    return null;
}
export function createCampaign(id: string, seed: number, weapon: Weapon, outfit: Outfit, traveler: Traveler): Campaign {
    const identity = parseTraveler(traveler);
    if (!identity.appearanceAge) { fault('invalid'); }
    return { id, seed, weapon, outfit, traveler: identity, chapter: FIRST_CHAPTER.id, location: startWorld(COURTYARD.camp, 'start'), facts: [], hp: RULES.maxHp,
        collection: [], equipped: [], rewards: {}, rewardNode: null, completedSegments: [], engagement: null,
        phase: 'exploration', battle: null, checkpoint: null,
        relationships: Object.fromEntries(PERSON_IDS.map(person => [person, { affection: 0, highestBand: 0 }])) as Campaign['relationships'], people: initialPeople(),
        pendingParley: null, evidence: { dispatchNoteSeen: false },
        conversations: Object.fromEntries(PARTICIPANT_IDS.map(person => [person, [] as Campaign['conversations'][Participant]])) as Campaign['conversations'],
        memories: Object.fromEntries(PARTICIPANT_IDS.map(person => [person, null])) as Campaign['memories'],
        knowledge: Object.fromEntries(PARTICIPANT_IDS.map(person => [person, [] as CourtyardFact[]])) as Campaign['knowledge'] };
}
export function recordFact(campaign: Campaign, fact: CourtyardFact, witnesses?: readonly Participant[]) {
    if (!campaign.facts.includes(fact)) { campaign.facts.push(fact); }
    const present = witnesses ?? [...PERSON_IDS.filter(id => campaign.people[id].scene === campaign.location.scene), ...PARLEY_IDS.filter(id => PARLEY_ENEMIES[id].scene === campaign.location.scene)];
    for (const person of present) {
        if (!campaign.knowledge[person].includes(fact)) { campaign.knowledge[person].push(fact); }
    }
}
export function campaignField(campaign: Campaign) {
    // Completion is recorded after combat; the checkpoint retains exactly the encounter's entry and seed.
    const checkpoint = campaign.checkpoint;
    if (!campaign.engagement) { return undefined; }
    return courtyardBattle(campaign.engagement.id, new Set(campaign.facts), checkpoint?.player ?? campaign.location.position,
        checkpoint?.seed ?? campaign.seed, checkpoint?.player.hp ?? campaign.hp,
        campaign.engagement.reinforcement)?.field;
}
function beginEncounter(campaign: Campaign, id: EncounterSegment) {
    const reinforcement = campaign.facts.includes('alarm_raised') && !campaign.facts.includes('alarm_silenced');
    const encounter = courtyardBattle(id, new Set(campaign.facts), campaign.location.position,
        Math.floor(random(campaign) * 4294967296), campaign.hp, reinforcement);
    if (!encounter) { fault('unavailable'); }
    campaign.engagement = { id, reinforcement };
    campaign.battle = createBattle(encounter.setup, campaignLoadout(campaign), encounter.field);
    campaign.checkpoint = structuredClone(campaign.battle); campaign.phase = 'battle';
}
export function canTalk(campaign: Campaign, person: Participant) {
    if (pendingEnding(campaign)) { return false; }
    if (!isPerson(person)) { return canParley(campaign, person); }
    if (campaign.pendingParley) { return false; }
    return campaign.phase === 'exploration' && reachablePeople(campaign)
        .some(i => i.kind === 'object' && i.target.kind === 'person' && i.target.person === person);
}
function settleRescue(campaign: Campaign) {
    if (!campaign.facts.includes('captives_released') || campaign.facts.includes('captives_arrived')) { return; }
    const receiving = districtScene(campaign.location.scene) === 'camp'
        && campaign.facts.includes('postern_opened') && campaign.facts.includes('receiving_arranged');
    for (const id of CAPTIVE_IDS) {
        if (hasReturned(campaign.facts, id)) { continue; }
        const state = campaign.people[id];
        // Reception collects only those still waiting in the cells, never an agreed follower or traveller elsewhere.
        if (receiving && state.scene === 'cells' && state.mode === 'idle') {
            campaign.people[id] = personAt(PERSON_PLACES[id].station);
        }
        const scene = campaign.people[id].scene;
        if (districtScene(scene) === 'camp') {
            recordFact(campaign, PERSON_PLACES[id].returnFact!, PERSON_IDS.filter(person => campaign.people[person].scene === scene));
        }
    }
    if (CAPTIVE_IDS.every(id => hasReturned(campaign.facts, id))) {
        recordFact(campaign, 'captives_arrived', PERSON_IDS.filter(id => campaign.people[id].scene === 'camp'));
    }
}
function battleReward(campaign: Campaign) {
    const id = campaign.engagement!.id, spec = COURTYARD_ENCOUNTERS[id];
    if (spec.complete) { recordFact(campaign, spec.complete); }
    else if (!campaign.completedSegments.includes(id)) { campaign.completedSegments.push(id); }
    grantRewardNode(campaign, spec.reward);
    campaign.phase = 'exploration';
    campaign.battle = null; campaign.checkpoint = null; campaign.engagement = null;
}
/** The same fixed-step reducer is used for prediction and authoritative replay. */
export function tickCampaign(campaign: Campaign, input: InputFrame) {
    if (campaign.pendingParley || pendingEnding(campaign)) { return; }
    if (campaign.phase === 'battle' && campaign.battle) {
        const field = campaignField(campaign);
        if (!field) { fault('invalid'); }
        tickBattle(campaign.battle, input, campaignLoadout(campaign), field);
        const battle = campaign.battle;
        campaign.hp = battle.player.hp;
        campaign.location.position = { x: battle.player.x, y: battle.player.y };
        campaign.location.facing = battle.player.facing;
        if (campaign.engagement?.id === 'beacon' && battle.objective.hp === 0) { recordFact(campaign, 'alarm_raised'); }
        if (battle.status === 'won') { battleReward(campaign); }
        else if (battle.status === 'lost') { campaign.phase = 'lost'; }
    } else if (campaign.phase === 'exploration') {
        const scene = COURTYARD[campaign.location.scene], facts = new Set(campaign.facts);
        walkWorld(campaign.location, input.move, sceneSpace(scene, facts), CAMPAIGN_RULES.explorationSpeed);
        const id = nextEncounter(scene.id, facts, campaign.completedSegments);
        if (id) {
            const spec = COURTYARD_ENCOUNTERS[id], trigger = scene.anchors[spec.trigger];
            if (Math.hypot(campaign.location.position.x - trigger.x, campaign.location.position.y - trigger.y) <= spec.triggerRadius
                && canStandInWorld(boundedFieldSpace(sceneSpace(scene, facts), spec.bounds), campaign.location.position, RULES.playerRadius)) { beginEncounter(campaign, id); }
        }
    }
    if (campaign.phase === 'exploration' || campaign.phase === 'battle') { tickPeople(campaign); settleRescue(campaign); }
}
export function advanceCampaign(campaign: Campaign, command: Exclude<Command, { type: 'start' | 'restart' | 'purchase' | 'equip' }>) {
    if (campaign.pendingParley && command.type !== 'resolve_parley') { fault('unavailable'); }
    if (pendingEnding(campaign) && command.type !== 'accept_reply') { fault('unavailable'); }
    const facts = new Set(campaign.facts);
    switch (command.type) {
        case 'greet':
            if (!canTalk(campaign, command.person)) { fault('unavailable'); }
            greet(campaign, command.person); break;
        case 'accept_reply': {
            const person = pendingEnding(campaign);
            if (person !== 'sanniang') { fault('unavailable'); }
            delete campaign.lastReply;
            advanceCampaign(campaign, { type: 'choice', id: 'finish', person }); break;
        }
        case 'resolve_parley': {
            const pending = campaign.pendingParley;
            if (!pending || campaign.phase !== 'exploration') { fault('unavailable'); }
            const spec = PARLEY_ENEMIES[pending.enemy];
            if (pending.decision === 'pass') {
                recordFact(campaign, spec.complete); recordFact(campaign, spec.persuaded);
                grantRewardNode(campaign, COURTYARD_ENCOUNTERS[pending.enemy === 'bajin' ? 'gate' : 'beacon'].reward);
            } else {
                beginEncounter(campaign, pending.enemy === 'bajin' ? 'gate' : 'beacon');
            }
            campaign.pendingParley = null; break;
        }
        case 'input':
            if (!['battle', 'exploration'].includes(campaign.phase)) { fault('unavailable'); }
            for (const span of command.spans) { for (let i = 0; i < span.ticks; i++) { tickCampaign(campaign, span); } }
            break;
        case 'interact': {
            if (campaign.phase !== 'exploration') { fault('unavailable'); }
            const result = interactWorld(COURTYARD, campaign.location, facts, command.id);
            if (result.kind === 'travel') {
                campaign.location = result.location; relocatePeople(campaign); settleRescue(campaign);
                if (campaign.location.scene === 'cells') { grantRewardNode(campaign, 'cells'); }
            } else if (!campaignObjectVisible(campaign, result.object)) { fault('unavailable'); }
            else if (result.object.kind === 'reward') {
                campaign.rewardNode = result.object.node; campaign.phase = 'reward';
            } else if (result.object.kind === 'switch') {
                recordFact(campaign, result.object.fact);
                if (result.object.fact === 'captives_released' && !facts.has('alarm_silenced')) { recordFact(campaign, 'alarm_raised'); }
            } else if (result.object.kind === 'rest') {
                campaign.hp = RULES.maxHp;
            } else if (campaign.location.scene === SUPPLIES_HANDOFF.scene && result.object.id === SUPPLIES_HANDOFF.object.id) {
                recordFact(campaign, SUPPLIES_HANDOFF.fact);
                campaign.evidence.dispatchNoteSeen = true;
            }
            break;
        }
        case 'choice': {
            const action = CAMPAIGN_ACTIONS[command.id];
            const person = command.person;
            if (!canTalk(campaign, person) || !availableChoices(campaign.facts, person, campaign.people[person]).includes(command.id)) { fault('unavailable'); }
            recordFact(campaign, action.fact, [person]);
            settleRescue(campaign);
            break;
        }
        case 'relic': {
            if (campaign.phase !== 'reward') { fault('unavailable'); }
            const offer = rewardOffers(campaign).find(r => r.id === command.id); if (!offer) { fault('invalid'); }
            if (command.replace !== undefined) {
                if (!campaign.equipped.includes(command.replace) || campaign.equipped.includes(offer.id)) { fault('invalid'); }
                campaign.equipped = campaign.equipped.map(id => id === command.replace ? offer.id : id);
            }
            const owned = campaign.collection.find(r => r.id === offer.id);
            if (owned) { owned.rank = offer.rank; } else { campaign.collection.push({ ...offer }); }
            if (!campaign.equipped.includes(offer.id) && campaign.equipped.length < RULES.relicSlots) { campaign.equipped.push(offer.id); }
            campaign.hp = Math.min(RULES.maxHp, campaign.hp + relicRank(campaignLoadout(campaign), 'renewal') * RELIC_RULES.renewalHeal);
            campaign.rewards[campaign.rewardNode!]!.offers = []; campaign.rewardNode = null; campaign.phase = 'exploration'; break;
        }
        case 'leave':
            if (campaign.phase !== 'reward') { fault('unavailable'); }
            campaign.rewardNode = null; campaign.phase = 'exploration'; break;
        case 'loadout': {
            if (loadoutIssue(campaign, command.equipped)) { fault('invalid'); }
            campaign.equipped = [...command.equipped]; break;
        }
        case 'retry':
            if (campaign.phase !== 'lost' || !campaign.checkpoint) { fault('unavailable'); }
            campaign.checkpoint.player.hp = RULES.maxHp;
            campaign.battle = structuredClone(campaign.checkpoint); campaign.phase = 'battle'; campaign.hp = campaign.battle.player.hp;
            campaign.location.position = { x: campaign.battle.player.x, y: campaign.battle.player.y };
            relocatePeople(campaign); break;
        case 'retreat': {
            if (campaign.phase !== 'lost') { fault('unavailable'); }
            const visited = campaign.location.visited;
            campaign.location = { ...startWorld(COURTYARD.camp, 'rest'), visited };
            campaign.hp = RULES.maxHp; campaign.battle = null; campaign.checkpoint = null; campaign.engagement = null; campaign.phase = 'exploration';
            relocatePeople(campaign); settleRescue(campaign); break;
        }
    }
}
