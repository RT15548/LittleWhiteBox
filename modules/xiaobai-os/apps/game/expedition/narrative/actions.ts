import type { Campaign } from '../campaign/types.js';
import type { CourtyardFact, CourtyardPerson } from '../content/world-types.js';
import { availableChoices, CAMPAIGN_ACTIONS, type CampaignChoice } from '../content/campaign-actions.js';
import { PERSON_SECRETS } from '../content/people.js';
import { relationshipBand, RELATIONSHIP_RULES } from '../campaign/relationships.js';
import type { RelationshipStage } from './stages.js';
import { DIALOGUE_COPY } from '../content/dialogue-copy.js';
import type { DestinationId } from '../content/people-places.js';
import { personCanMove, personMap } from '../world/people.js';
import { isPerson, type Participant } from '../content/participants.js';
import { PARLEY_ENEMIES } from '../content/parley.js';

export type MovementAction = 'follow' | 'stay' | `go:${DestinationId}`;
export type NarrativeAction = CampaignChoice | 'share_secret' | MovementAction | 'pass' | 'attack';
export function secretFact(person: CourtyardPerson): CourtyardFact | null { return PERSON_SECRETS[person]; }
export function narrativeActions(campaign: Campaign, person: Participant, stages: readonly RelationshipStage[] = []): Partial<Record<NarrativeAction, string>> {
    if (!isPerson(person)) {
        const spec = PARLEY_ENEMIES[person];
        if (campaign.facts.includes(spec.complete) || campaign.pendingParley) { return {}; }
        return { attack: DIALOGUE_COPY.attack, ...(campaign.facts.includes(spec.intel) ? { pass: DIALOGUE_COPY.pass } : {}) };
    }
    const actions: Partial<Record<NarrativeAction, string>> = Object.fromEntries(availableChoices(campaign.facts, person, campaign.people[person]).map(id => [id, CAMPAIGN_ACTIONS[id].meaning]));
    const secret = secretFact(person);
    const affection = campaign.relationships[person].affection;
    if (secret && !campaign.facts.includes(secret) && affection >= RELATIONSHIP_RULES.bands[4] && stages[relationshipBand(affection)]?.secret) {
        actions.share_secret = DIALOGUE_COPY.shareSecret;
    }
    if (personCanMove(campaign, person)) {
        actions.follow = DIALOGUE_COPY.follow; actions.stay = DIALOGUE_COPY.stay;
        for (const place of personMap(campaign, person).filter(p => p.accessible && p.solo)) { actions[`go:${place.id}`] = DIALOGUE_COPY.go(place.name); }
    }
    return actions;
}
