import type { PartitionRegistration } from '../../../kernel/contracts.js';
import { RELICS, RULES, WEAPON_LIST } from './content.js';
import { emptyExpedition } from './domain.js';
import { awardAmount, awardKeys } from './campaign/awards.js';
import { EXPEDITION_FORMAT_VERSION, OUTFIT_IDS } from './ids.js';
import { OUTFITS, ownsOutfit } from './outfits.js';
import { validateBattle } from './battle-validation.js';
import { fault } from './random.js';
import { compatibleRelics } from './relics.js';
import type { Command, ExpeditionData, InputSpan, RelicStack } from './types.js';
import { boolean, expeditionId, finite, integer, list, member, object, unique } from './validation.js';
import { COURTYARD } from './content/courtyard.js';
import { FACT_COPY } from './content/campaign-copy.js';
import type { CourtyardFact, CourtyardScene } from './content/world-types.js';
import { canStandInWorld } from './world/geometry.js';
import { sceneSpace } from './world/exploration.js';
import { CAMPAIGN_RULES } from './campaign/rules.js';
import { CAMPAIGN_CHOICES } from './content/campaign-actions.js';
import { relationshipBand, RELATIONSHIP_RULES } from './campaign/relationships.js';
import { DESTINATIONS } from './content/people-places.js';
import { isPerson, PARTICIPANT_IDS } from './content/participants.js';
import { PERSON_IDS } from './content/people.js';
import { PARLEY_IDS, PARLEY_ENEMIES } from './content/parley.js';
import { parseTraveler } from './campaign/traveler.js';
import { FIRST_CHAPTER } from './content/chapters.js';
import { readPerformance } from './performance/catalog.js';
import { readClothingChange } from './clothing.js';
import { upgradeExpeditionV6 } from './migration-v6.js';
import { REWARD_NODES } from './content/campaign-rewards.js';
import { COURTYARD_ENCOUNTERS, ENCOUNTER_SEGMENTS } from './content/courtyard-encounters.js';
export { expeditionId } from './validation.js';

const weapon = (v: unknown) => member(v, WEAPON_LIST);
const relic = (v: unknown) => member(v, RELICS);
const outfit = (v: unknown) => member(v, OUTFIT_IDS);
const scene = (v: unknown) => member(v, Object.keys(COURTYARD) as CourtyardScene[]);
const facts = (v: unknown) => unique(list(v, Object.keys(FACT_COPY).length, f => member(f, Object.keys(FACT_COPY) as CourtyardFact[])));
export function boundedText(v: unknown, max: number): string {
    if (typeof v !== 'string' || !v.trim() || v.length > max) { fault('invalid'); } return v;
}
function stacks(v: unknown, max: number): RelicStack[] {
    const entries = list(v, max, raw => { const r = object(raw); return { id: relic(r.id), rank: integer(r.rank, 1, RULES.maxRelicRank) }; });
    unique(entries.map(r => r.id)); return entries;
}
export function parseCommand(value: unknown): Command {
    const v = object(value);
    switch (v.type) {
        case 'start': case 'restart': return { type: v.type, weapon: weapon(v.weapon), outfit: outfit(v.outfit), traveler: parseTraveler(v.traveler), chapter: member(v.chapter, [FIRST_CHAPTER.id]) };
        case 'purchase': case 'equip': return { type: v.type, id: outfit(v.id) };
        case 'interact': return { type: 'interact', id: expeditionId(v.id) };
        case 'choice': return { type: 'choice', id: member(v.id, CAMPAIGN_CHOICES), person: member(v.person, PERSON_IDS) };
        case 'greet': return { type: 'greet', person: member(v.person, PARTICIPANT_IDS) };
        case 'loadout': return { type: 'loadout', equipped: unique(list(v.equipped, RULES.relicSlots, relic)) };
        case 'input': {
            const spans: InputSpan[] = list(v.spans, RULES.maxInputTicks, raw => {
                const s = object(raw); boolean(s.dash); boolean(s.skill);
                return { move: integer(s.move, 0, 8), dash: s.dash, skill: s.skill, ticks: integer(s.ticks, 1, RULES.maxInputTicks) };
            });
            if (!spans.length || spans.reduce((sum, s) => sum + s.ticks, 0) > RULES.maxInputTicks) { fault('invalid'); }
            return { type: 'input', spans };
        }
        case 'relic': return { type: 'relic', id: relic(v.id), ...(v.replace === undefined ? {} : { replace: relic(v.replace) }) };
        case 'leave': case 'retry': case 'retreat': case 'resolve_parley': case 'accept_reply': return { type: v.type };
        default: return fault('invalid');
    }
}
function validateCampaign(raw: unknown, data: ExpeditionData) {
    const r = object(raw); expeditionId(r.id); integer(r.seed, 0, 0xffffffff); const w = weapon(r.weapon);
    parseTraveler(r.traveler); member(r.chapter, [FIRST_CHAPTER.id]);
    if (!ownsOutfit(data, outfit(r.outfit))) { fault('invalid'); }
    const owned = stacks(r.collection, RELICS.length), equipped = unique(list(r.equipped, RULES.relicSlots, relic));
    const rewards = object(r.rewards), offered: RelicStack[] = [];
    for (const [key, rawReward] of Object.entries(rewards)) {
        member(key, REWARD_NODES); const reward = object(rawReward), source = scene(reward.scene);
        if (!COURTYARD[source].objects.some(o => o.kind === 'reward' && o.node === key)) { fault('invalid'); }
        offered.push(...stacks(reward.offers, 3));
    }
    unique(offered.map(o => o.id));
    if ([...owned, ...offered].some(s => !compatibleRelics(w).includes(s.id)) || equipped.some(id => !owned.some(s => s.id === id))) { fault('invalid'); }
    for (const offer of offered) { if (offer.rank !== (owned.find(s => s.id === offer.id)?.rank ?? 0) + 1) { fault('invalid'); } }
    const phase = member(r.phase, ['exploration', 'battle', 'reward', 'lost']);
    if (r.rewardNode !== null) { const node = member(r.rewardNode, REWARD_NODES); if (!rewards[node] || !stacks(object(rewards[node]).offers, 3).length) { fault('invalid'); } }
    if ((phase === 'reward') !== (r.rewardNode !== null)) { fault('invalid'); }
    unique(list(r.completedSegments, ENCOUNTER_SEGMENTS.length, id => {
        const segment = member(id, ENCOUNTER_SEGMENTS); if (COURTYARD_ENCOUNTERS[segment].complete !== null) { fault('invalid'); } return segment;
    }));
    const knownFacts = facts(r.facts), location = object(r.location), id = scene(location.scene), position = object(location.position);
    if (r.rewardNode !== null && object(rewards[String(r.rewardNode)]).scene !== id) { fault('invalid'); }
    finite(position.x, -Number.MAX_VALUE, Number.MAX_VALUE); finite(position.y, -Number.MAX_VALUE, Number.MAX_VALUE);
    finite(location.facing, -100, 100); const visited = unique(list(location.visited, Object.keys(COURTYARD).length, scene));
    if (!visited.includes(id) || !canStandInWorld(sceneSpace(COURTYARD[id], new Set(knownFacts)), { x: Number(position.x), y: Number(position.y) }, RULES.playerRadius)) { fault('invalid'); }
    finite(r.hp, 0, RULES.maxHp);
    if (r.engagement !== null) {
        const engagement = object(r.engagement), segment = member(engagement.id, ENCOUNTER_SEGMENTS);
        boolean(engagement.reinforcement);
        if (COURTYARD_ENCOUNTERS[segment].scene !== id || !['battle', 'lost'].includes(phase)) { fault('invalid'); }
    } else if (['battle', 'lost'].includes(phase)) { fault('invalid'); }
    boolean(object(r.evidence).dispatchNoteSeen);
    if (r.battle !== null) {
        validateBattle(r.battle);
        if (!['battle', 'lost'].includes(phase) || r.battle.player.hp !== r.hp || r.battle.player.x !== position.x || r.battle.player.y !== position.y
            || (phase === 'battle' ? r.battle.status !== 'fighting' : r.battle.status !== 'lost')) { fault('invalid'); }
    } else if (['battle', 'lost'].includes(phase)) { fault('invalid'); }
    if (r.checkpoint !== null) { validateBattle(r.checkpoint); if (!r.battle || r.checkpoint.tick !== 0 || r.checkpoint.status !== 'fighting') { fault('invalid'); } }
    else if (r.battle) { fault('invalid'); }
    const conversations = object(r.conversations), memories = object(r.memories), knowledge = object(r.knowledge), relationships = object(r.relationships), people = object(r.people);
    for (const record of [conversations, memories, knowledge]) {
        if (Object.keys(record).length !== PARTICIPANT_IDS.length || PARTICIPANT_IDS.some(key => !Object.hasOwn(record, key))) { fault('invalid'); }
    }
    for (const record of [relationships, people]) {
        if (Object.keys(record).length !== PERSON_IDS.length || PERSON_IDS.some(key => !Object.hasOwn(record, key))) { fault('invalid'); }
    }
    if (r.pendingParley !== null) {
        const pending = object(r.pendingParley), enemy = member(pending.enemy, PARLEY_IDS), spec = PARLEY_ENEMIES[enemy];
        const decision = member(pending.decision, ['pass', 'attack']);
        if (phase !== 'exploration' || spec.scene !== id || knownFacts.includes(spec.complete) || decision === 'pass' && !knownFacts.includes(spec.intel)) { fault('invalid'); }
    }
    for (const person of PARTICIPANT_IDS) {
        if (isPerson(person)) {
        const resident = object(people[person]), residentScene = scene(resident.scene), point = object(resident.position);
        finite(point.x, -Number.MAX_VALUE, Number.MAX_VALUE); finite(point.y, -Number.MAX_VALUE, Number.MAX_VALUE); finite(resident.facing, -100, 100);
        if (!canStandInWorld(sceneSpace(COURTYARD[residentScene], new Set(knownFacts)), { x: Number(point.x), y: Number(point.y) }, RULES.playerRadius)) { fault('invalid'); }
        const mode = member(resident.mode, ['idle', 'follow', 'travel']);
        if (mode === 'travel') { member(resident.destination, Object.keys(DESTINATIONS)); } else if (resident.destination !== null) { fault('invalid'); }
        if (mode === 'follow' && residentScene !== id) { fault('invalid'); }
        const relation = object(relationships[person]);
        const affection = integer(relation.affection, 0, RELATIONSHIP_RULES.maximum);
        integer(relation.highestBand, relationshipBand(affection), RELATIONSHIP_RULES.bands.length - 1);
        }
        const entries = list(conversations[person], Number.MAX_SAFE_INTEGER, raw => {
            const t = object(raw); const id = boundedText(t.id, 150);
            member(t.kind, ['greeting', 'dialogue', 'receipt', 'player']); scene(t.scene);
            if (t.kind === 'greeting') {
                if (t.player !== '' || t.action !== null || t.affectionDelta !== undefined || t.issue !== undefined || t.regeneratedFrom !== undefined) { fault('invalid'); }
            } else { boundedText(t.player, CAMPAIGN_RULES.playerTextLimit); }
            if (t.regeneratedFrom !== undefined) { expeditionId(t.regeneratedFrom); }
            if (t.action !== null) { member(t.action, isPerson(person) ? [...CAMPAIGN_CHOICES, 'share_secret', 'follow', 'stay', ...Object.keys(DESTINATIONS).map(id => `go:${id}`)] : ['pass', 'attack']); }
            if (t.affectionDelta !== undefined) { integer(t.affectionDelta, -RELATIONSHIP_RULES.changeMax, RELATIONSHIP_RULES.changeMax); }
            if (t.performance !== undefined && (t.kind === 'receipt' || !readPerformance(person, t.performance))) { fault('invalid'); }
            if (t.clothing !== undefined) {
                const clothing = readClothingChange(t.clothing);
                if (t.kind !== 'dialogue' || clothing.rejected || !clothing.change) { fault('invalid'); }
            }
            if (t.kind === 'receipt') {
                member(t.issue, ['reply_invalid', 'reply_incomplete']);
                if (t.action !== null || t.affectionDelta !== undefined) { fault('invalid'); }
            } else if (t.issue !== undefined) {
                const issue = member(t.issue, ['action_rejected', 'clothing_rejected', 'performance_rejected', 'metadata_invalid']);
                if (t.kind !== 'dialogue' || issue === 'action_rejected' && t.action !== null
                    || issue === 'performance_rejected' && t.performance !== undefined
                    || issue === 'metadata_invalid' && (t.action !== null || t.performance !== undefined || t.affectionDelta || t.clothing !== undefined)) { fault('invalid'); }
            }
            if (t.kind === 'player') {
                if (t.reply !== '' || t.action !== null || ['affectionDelta', 'performance', 'clothing', 'issue', 'regeneratedFrom'].some(key => t[key] !== undefined)) { fault('invalid'); }
            } else { boundedText(t.reply, t.kind === 'receipt' ? Number.MAX_SAFE_INTEGER : CAMPAIGN_RULES.replyTextLimit); }
            if (facts(t.facts).some(f => !knownFacts.includes(f))) { fault('invalid'); } return id;
        });
        unique(entries);
        const turns = conversations[person] as { kind: string }[];
        if (turns.slice(1).some(turn => turn.kind === 'greeting')) { fault('invalid'); }
        if (facts(knowledge[person]).some(f => !knownFacts.includes(f))) { fault('invalid'); }
        if (memories[person] !== null) {
            const memory = object(memories[person]); boundedText(memory.text, Number.MAX_SAFE_INTEGER);
            if (!entries.includes(boundedText(memory.throughId, 150))) { fault('invalid'); }
        }
    }
    if (r.lastReply !== undefined) {
        const checkpoint = object(r.lastReply), person = member(checkpoint.person, PARTICIPANT_IDS);
        const turnId = expeditionId(checkpoint.turnId), turns = conversations[person] as { id: string; kind: string; action: string | null }[];
        const turn = turns.at(-1), before = object(checkpoint.before);
        const fields = ['seed', 'facts', 'knowledge', 'relationships', 'people', 'pendingParley'];
        if (phase !== 'exploration' || !turn || !['dialogue', 'receipt'].includes(turn.kind) || turn.id !== turnId
            || Object.keys(before).length !== fields.length || fields.some(key => !Object.hasOwn(before, key))
            || facts(before.facts).some(f => !knownFacts.includes(f)) || before.pendingParley !== null
            || turn.action === 'finish' && (person !== 'sanniang' || knownFacts.includes('chapter_completed'))) { fault('invalid'); }
        // Validate the bounded pre-reply state without recursively copying or walking old transcripts.
        const restored: Record<string, unknown> = { ...r, ...before,
            conversations: Object.fromEntries(PARTICIPANT_IDS.map(id => [id, []])), memories: Object.fromEntries(PARTICIPANT_IDS.map(id => [id, null])) };
        delete restored.lastReply;
        validateCampaign(restored, data);
    }
}
export function validateExpedition(value: unknown): asserts value is ExpeditionData {
    const v = object(value); if (v.formatVersion !== EXPEDITION_FORMAT_VERSION) { fault('invalid'); }
    const revision = integer(v.revision);
    if (v.last === null) { if (revision !== 0) { fault('invalid'); } }
    else {
        const last = object(v.last); expeditionId(last.id); const c = object(last.command);
        if (c.type === 'conversation') { member(c.person, PARTICIPANT_IDS); boundedText(c.text, CAMPAIGN_RULES.playerTextLimit); }
        else if (c.type !== 'rebuild') { parseCommand(c); }
        if (!revision) { fault('invalid'); }
    }
    const keys = awardKeys();
    unique(list(v.awards, keys.length, raw => { const a = object(raw); expeditionId(a.actionId); expeditionId(a.runId); const key = member(a.key, keys); if (integer(a.amount, 1) !== awardAmount(key)) { fault('invalid'); } return key; }));
    unique(list(v.purchases, OUTFIT_IDS.length, raw => {
        const p = object(raw), id = outfit(p.id), spec = OUTFITS[id]; expeditionId(p.actionId);
        if (spec.price <= 0 || spec.achievement !== null || integer(p.amount, 1) !== spec.price) { fault('invalid'); } return id;
    }));
    const data = value as ExpeditionData;
    if (!ownsOutfit(data, outfit(v.equippedOutfit))) { fault('invalid'); }
    if (v.active !== null) { validateCampaign(v.active, data); }
}
export const EXPEDITION_PARTITION: PartitionRegistration<ExpeditionData> = {
    key: 'expedition', ownerId: 'game', storage: 'user', schemaVersion: EXPEDITION_FORMAT_VERSION, createInitial: emptyExpedition,
    parse(raw) {
        try {
            const value = upgradeExpeditionV6(structuredClone(raw));
            validateExpedition(value); return { ok: true, value };
        } catch (error) { return { ok: false, error: { code: 'partition_invalid', message: error instanceof Error ? error.message : 'expedition_invalid' } }; }
    },
    serialize(value) { validateExpedition(value); return structuredClone(value); },
};
