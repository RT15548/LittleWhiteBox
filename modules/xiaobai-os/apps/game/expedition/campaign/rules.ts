import { createBattle, tickBattle } from '../combat.js';
import { RELIC_RULES, RULES } from '../content.js';
import { COURTYARD } from '../content/courtyard.js';
import { COURTYARD_ENCOUNTERS, courtyardBattle } from '../content/courtyard-encounters.js';
import type { CourtyardFact } from '../content/world-types.js';
import { fault, random, sample } from '../random.js';
import { compatibleRelics, RELIC_SPECS, relicRank, relicReady } from '../relics.js';
import type { Command, InputFrame, Loadout, Outfit, Relic, Weapon } from '../types.js';
import { interactWorld, sceneSpace, startWorld, walkWorld } from '../world/exploration.js';
import type { Campaign } from './types.js';
import { availableChoices, CAMPAIGN_ACTIONS } from '../content/campaign-actions.js';
import { PERSON_IDS } from '../content/people.js';
import { initialPeople, personAt, reachablePeople, relocatePeople, tickPeople } from '../world/people.js';
import { PERSON_PLACES } from '../content/people-places.js';
import { isPerson, PARTICIPANT_IDS, type Participant } from '../content/participants.js';
import { PARLEY_ENEMIES, PARLEY_IDS } from '../content/parley.js';
import { canParley } from './parley.js';
import { parseTraveler, type Traveler } from './traveler.js';
import { FIRST_CHAPTER } from '../content/chapters.js';
import { greet } from '../content/greetings.js';
import { pendingEnding } from './reply-checkpoint.js';

export const CAMPAIGN_RULES = Object.freeze({ encounterReach: 14, alarmTicks: 900, explorationSpeed: 1.65, playerTextLimit: 2000, replyTextLimit: 8000 });
export function campaignLoadout(campaign: Campaign): Loadout {
    return { weapon: campaign.weapon, oaths: [], relics: campaign.equipped.map(id => campaign.collection.find(r => r.id === id)!) };
}
export function loadoutIssue(campaign: Campaign, equipped: Relic[]) {
    if (campaign.phase !== 'exploration' || !COURTYARD[campaign.location.scene].safe) { return 'unavailable'; }
    if (equipped.length > RULES.relicSlots) { return 'capacity'; }
    if (new Set(equipped).size !== equipped.length || equipped.some(id => !campaign.collection.some(r => r.id === id))) { return 'invalid'; }
    const loadout = { weapon: campaign.weapon, oaths: [], relics: campaign.collection.filter(r => equipped.includes(r.id)) };
    return equipped.some(id => !relicReady(loadout, id)) ? 'dependency' : null;
}
export function createCampaign(id: string, seed: number, weapon: Weapon, outfit: Outfit, traveler: Traveler): Campaign {
    const identity = parseTraveler(traveler);
    if (!identity.appearanceAge) { fault('invalid'); }
    return { id, seed, weapon, outfit, traveler: identity, chapter: FIRST_CHAPTER.id, location: startWorld(COURTYARD.camp, 'start'), facts: [], hp: RULES.maxHp,
        collection: [], equipped: [], offers: [], phase: 'exploration', battle: null, checkpoint: null, alarmTicks: 0,
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
    return courtyardBattle(campaign.location.scene, new Set(campaign.facts), checkpoint?.player ?? campaign.location.position,
        checkpoint?.seed ?? campaign.seed, checkpoint?.player.hp ?? campaign.hp,
        campaign.facts.includes('alarm_raised') && !campaign.facts.includes('alarm_silenced'))?.field;
}
export function canTalk(campaign: Campaign, person: Participant) {
    if (pendingEnding(campaign)) { return false; }
    if (!isPerson(person)) { return canParley(campaign, person); }
    if (campaign.pendingParley) { return false; }
    return campaign.phase === 'exploration' && reachablePeople(campaign)
        .some(i => i.kind === 'object' && i.target.kind === 'person' && i.target.person === person);
}
function receiveCaptives(campaign: Campaign) {
    if (campaign.location.scene === 'camp' && ['captives_released', 'postern_opened', 'receiving_arranged'].every(f => campaign.facts.includes(f as CourtyardFact))) {
        if (!campaign.facts.includes('captives_arrived')) {
            for (const id of PERSON_IDS.filter(id => PERSON_PLACES[id].captive)) { campaign.people[id] = personAt(PERSON_PLACES[id].station); }
            recordFact(campaign, 'captives_arrived');
        }
    }
}
function battleReward(campaign: Campaign) {
    const spec = COURTYARD_ENCOUNTERS[campaign.location.scene]!;
    recordFact(campaign, spec.complete);
    const loadout = campaignLoadout(campaign);
    if (spec.boss) { campaign.hp = Math.min(RULES.maxHp, campaign.hp + 20 + relicRank(loadout, 'renewal') * RELIC_RULES.renewalZoneHeal); }
    const pool = compatibleRelics(campaign.weapon).flatMap(id => {
        const rank = campaign.collection.find(r => r.id === id)?.rank ?? 0;
        return rank < RULES.maxRelicRank && relicReady(loadout, id) && (RELIC_SPECS[id].chapter === 0 || campaign.facts.includes('warden_defeated')) ? [{ id, rank: rank + 1 }] : [];
    });
    campaign.offers = sample(campaign, pool, 3);
    campaign.phase = campaign.offers.length ? 'reward' : 'exploration';
    campaign.battle = null; campaign.checkpoint = null;
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
        if (['gate', 'beacon'].includes(campaign.location.scene) && !campaign.facts.includes('alarm_silenced')) {
            campaign.alarmTicks++;
            if (campaign.alarmTicks >= CAMPAIGN_RULES.alarmTicks) { recordFact(campaign, 'alarm_raised'); }
        }
        if (battle.status === 'won') { battleReward(campaign); }
        else if (battle.status === 'lost') { campaign.phase = 'lost'; }
    } else if (campaign.phase === 'exploration') {
        const scene = COURTYARD[campaign.location.scene], facts = new Set(campaign.facts);
        walkWorld(campaign.location, input.move, sceneSpace(scene, facts), CAMPAIGN_RULES.explorationSpeed);
        const spec = COURTYARD_ENCOUNTERS[scene.id], trigger = scene.anchors.encounter;
        if (spec && !facts.has(spec.complete) && trigger && Math.hypot(campaign.location.position.x - trigger.x, campaign.location.position.y - trigger.y) <= (spec.triggerRadius ?? CAMPAIGN_RULES.encounterReach)) {
            const encounter = courtyardBattle(scene.id, facts, campaign.location.position, Math.floor(random(campaign) * 4294967296), campaign.hp,
                facts.has('alarm_raised') && !facts.has('alarm_silenced'))!;
            campaign.battle = createBattle(encounter.setup, campaignLoadout(campaign), encounter.field);
            campaign.checkpoint = structuredClone(campaign.battle); campaign.phase = 'battle';
        }
    }
    if (campaign.phase === 'exploration' || campaign.phase === 'battle') { tickPeople(campaign); }
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
            } else {
                const encounter = courtyardBattle(campaign.location.scene, facts, campaign.location.position, Math.floor(random(campaign) * 4294967296), campaign.hp,
                    facts.has('alarm_raised') && !facts.has('alarm_silenced'));
                if (!encounter) { fault('unavailable'); }
                campaign.battle = createBattle(encounter.setup, campaignLoadout(campaign), encounter.field);
                campaign.checkpoint = structuredClone(campaign.battle); campaign.phase = 'battle';
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
                campaign.location = result.location; relocatePeople(campaign); receiveCaptives(campaign);
            } else if (result.object.kind === 'switch') {
                recordFact(campaign, result.object.fact);
                if (result.object.fact === 'captives_released' && !facts.has('alarm_silenced')) { recordFact(campaign, 'alarm_raised'); }
            } else if (result.object.kind === 'rest') {
                campaign.hp = RULES.maxHp;
            } else if (result.object.kind === 'inspect' && result.object.passage === 'cargo') {
                recordFact(campaign, 'supplies_secured');
                campaign.evidence.dispatchNoteSeen = true;
            }
            break;
        }
        case 'choice': {
            const action = CAMPAIGN_ACTIONS[command.id];
            const person = command.person;
            if (!canTalk(campaign, person) || !availableChoices(campaign.facts, person, campaign.people[person]).includes(command.id)) { fault('unavailable'); }
            recordFact(campaign, action.fact, [person]);
            receiveCaptives(campaign);
            break;
        }
        case 'relic': {
            if (campaign.phase !== 'reward') { fault('unavailable'); }
            const offer = campaign.offers.find(r => r.id === command.id); if (!offer) { fault('invalid'); }
            const owned = campaign.collection.find(r => r.id === offer.id);
            if (owned) { owned.rank = offer.rank; } else { campaign.collection.push({ ...offer }); }
            if (!campaign.equipped.includes(offer.id) && campaign.equipped.length < RULES.relicSlots) { campaign.equipped.push(offer.id); }
            campaign.hp = Math.min(RULES.maxHp, campaign.hp + relicRank(campaignLoadout(campaign), 'renewal') * RELIC_RULES.renewalHeal);
            campaign.offers = []; campaign.phase = 'exploration'; break;
        }
        case 'leave':
            if (campaign.phase !== 'reward') { fault('unavailable'); }
            campaign.offers = []; campaign.phase = 'exploration'; break;
        case 'loadout': {
            if (loadoutIssue(campaign, command.equipped)) { fault('invalid'); }
            campaign.equipped = [...command.equipped]; break;
        }
        case 'retry':
            if (campaign.phase !== 'lost' || !campaign.checkpoint) { fault('unavailable'); }
            campaign.battle = structuredClone(campaign.checkpoint); campaign.phase = 'battle'; campaign.hp = campaign.battle.player.hp;
            campaign.location.position = { x: campaign.battle.player.x, y: campaign.battle.player.y };
            relocatePeople(campaign); break;
        case 'retreat': {
            if (campaign.phase !== 'lost') { fault('unavailable'); }
            const visited = campaign.location.visited;
            campaign.location = { ...startWorld(COURTYARD.camp, 'rest'), visited };
            campaign.hp = RULES.maxHp; campaign.battle = null; campaign.checkpoint = null; campaign.phase = 'exploration';
            relocatePeople(campaign); receiveCaptives(campaign); break;
        }
    }
}
