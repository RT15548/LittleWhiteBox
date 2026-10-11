import type { Campaign } from '../campaign/types.js';
import { advanceCampaign, recordFact } from '../campaign/rules.js';
import { settleAffection } from '../campaign/relationships.js';
import { dialogueEffects } from '../campaign/reply-checkpoint.js';
import { CAMPAIGN_CHOICES, type CampaignChoice } from '../content/campaign-actions.js';
import { greet } from '../content/greetings.js';
import { isPerson, type Participant } from '../content/participants.js';
import { movePerson } from '../world/people.js';
import { secretFact, type MovementAction } from './actions.js';
import type { ConversationResult } from './conversation.js';
import { fault } from '../random.js';
import { clothingDifference } from '../clothing.js';

/** Both first replies and replacements settle exactly once from their pre-reply state. */
export function applyReply(campaign: Campaign, input: { actionId: string; person: Participant; text: string; regenerate?: string }, response: ConversationResult) {
    const person = input.person, before = dialogueEffects(campaign);
    if (input.regenerate && campaign.conversations[person].at(-1)?.kind === 'player') {
        const pending = campaign.conversations[person].at(-1)!;
        if (pending.id !== input.regenerate || pending.player !== input.text) { fault('stale'); }
        campaign.conversations[person].pop();
    }
    delete campaign.lastReply;
    greet(campaign, person);
    const affectionDelta = response.kind === 'dialogue' && isPerson(person) ? settleAffection(campaign, person, response.affection) : undefined;
    const clothing = response.kind === 'dialogue' ? clothingDifference(campaign, person, response.clothing) : undefined;
    campaign.conversations[person].push({ id: input.actionId, kind: response.kind, player: input.text,
        reply: response.reply, action: response.action, ...(response.issue ? { issue: response.issue } : {}),
        ...(response.performance ? { performance: response.performance } : {}),
        ...(clothing ? { clothing } : {}),
        ...(input.regenerate ? { regeneratedFrom: input.regenerate } : {}),
        ...(affectionDelta === undefined ? {} : { affectionDelta }), scene: campaign.location.scene, facts: [...campaign.knowledge[person]] });
    if (response.action === 'share_secret' && isPerson(person)) {
        const fact = secretFact(person); if (!fact) { fault('invalid'); }
        recordFact(campaign, fact, [person]);
    }
    const choice = response.action && CAMPAIGN_CHOICES.includes(response.action as CampaignChoice) ? response.action as CampaignChoice : null;
    if (!isPerson(person) && (response.action === 'pass' || response.action === 'attack')) {
        campaign.pendingParley = { enemy: person, decision: response.action };
    } else if (isPerson(person) && choice && choice !== 'finish') {
        advanceCampaign(campaign, { type: 'choice', id: choice, person });
    } else if (isPerson(person) && response.action && response.action !== 'share_secret' && !choice) {
        movePerson(campaign, person, response.action as MovementAction);
    }
    // finish stays on this reply until the player continues. No wallet side effect occurs here.
    campaign.lastReply = { person, turnId: input.actionId, before };
}
