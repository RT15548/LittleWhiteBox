import { EXPEDITION_FORMAT_VERSION } from './ids.js';
import { BOSSES, BOSS_SPECS, OATHS, WEAPONS } from './content.js';
import { OUTFITS, ownsOutfit, canChangeOutfit } from './outfits.js';
import { fault } from './random.js';
import { createCampaign, advanceCampaign } from './campaign/rules.js';
import { pendingEnding } from './campaign/reply-checkpoint.js';
import { CHAPTER_AWARDS } from './campaign/awards.js';
import type { Command, ExpeditionData, Weapon } from './types.js';

export function emptyExpedition(): ExpeditionData {
    return { formatVersion: EXPEDITION_FORMAT_VERSION, revision: 0, last: null, active: null, awards: [], purchases: [], equippedOutfit: 'traveler' };
}
export function expeditionProgress(data: ExpeditionData) {
    const earned = new Set(data.awards.map(a => a.key));
    return { bossClears: BOSSES.filter(id => earned.has(BOSS_SPECS[id].awardKey)),
        mastered: (Object.keys(WEAPONS) as Weapon[]).filter(id => earned.has(`mastery-${id}`)),
        oathWins: OATHS.filter(id => earned.has(`oath-${id}`)) };
}
export function advanceExpedition(current: ExpeditionData, command: Command, actionId: string, seed: number): ExpeditionData {
    if (current.last?.id === actionId) {
        if (JSON.stringify(current.last.command) !== JSON.stringify(command)) { fault('identity'); }
        return current;
    }
    const data = structuredClone(current);
    // World actions commit reply side effects, not the right to replace its dialogue.
    if (command.type === 'purchase') {
        const spec = OUTFITS[command.id];
        if (ownsOutfit(data, command.id) || spec.price <= 0 || spec.achievement !== null) { fault('locked'); }
        data.purchases.push({ id: command.id, actionId, amount: spec.price });
    } else if (command.type === 'equip') {
        if (!ownsOutfit(data, command.id)) { fault('locked'); }
        if (!canChangeOutfit(data.active)) { fault('unavailable'); }
        data.equippedOutfit = command.id;
        if (data.active) { data.active.outfit = command.id; }
    } else if (command.type === 'start' || command.type === 'restart') {
        if (command.type === 'start' ? !!data.active : !data.active) { fault('unavailable'); }
        if (!ownsOutfit(data, command.outfit)) { fault('locked'); }
        data.active = createCampaign(actionId, seed, command.weapon, command.outfit, command.traveler);
    } else {
        if (!data.active) { fault('unavailable'); }
        advanceCampaign(data.active, command);
        for (const award of CHAPTER_AWARDS) {
            if (data.active.facts.includes(award.fact) && !data.awards.some(a => a.key === award.key)) {
                data.awards.push({ key: award.key, actionId, runId: data.active.id, amount: award.amount });
            }
        }
    }
    if (data.active && !pendingEnding(data.active)) { delete data.active.lastReply; }
    data.revision++; data.last = { id: actionId, command: structuredClone(command) }; return data;
}
