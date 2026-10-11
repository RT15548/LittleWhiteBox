import type { Campaign, ConversationTurn } from '../campaign/types.js';
import { pendingEnding } from '../campaign/reply-checkpoint.js';
import { isPerson, participantName, type Participant } from '../content/participants.js';
import { DESTINATIONS, type DestinationId } from '../content/people-places.js';
import { ACTION_FEEDBACK_COPY as copy } from '../content/action-feedback-copy.js';

/** Movement is paused in dialogue. Only the latest, still-active order needs a departure reminder. */
function movementPending(campaign: Campaign, person: Participant, turn: ConversationTurn) {
    if (!isPerson(person)) { return false; }
    const location = campaign.people[person], action = turn.action;
    if (!(action === 'follow' && location.mode === 'follow'
        || location.mode === 'travel' && action === `go:${location.destination}`)) { return false; }
    const turns = campaign.conversations[person];
    for (let i = turns.length - 1; i >= 0; i--) {
        const candidate = turns[i], a = candidate.action;
        if (a === 'follow' || a === 'stay' || a?.startsWith('go:')) { return candidate.id === turn.id; }
    }
    return false;
}

/** Derive from committed turns only; prose, pending requests and animation metadata are not game outcomes. */
export function dialogueActionFeedback(campaign: Campaign, person: Participant, turn: ConversationTurn) {
    const action = turn.action;
    if (turn.kind !== 'dialogue' || !action) { return null; }
    const last = campaign.conversations[person].at(-1)?.id === turn.id;
    const pending = movementPending(campaign, person, turn) || last && (action === 'finish' ? pendingEnding(campaign) === person
        : (action === 'pass' || action === 'attack') && campaign.pendingParley?.enemy === person);
    const name = participantName(person);
    let text: string;
    switch (action) {
        case 'briefing': case 'receiving': case 'clinic': case 'share_secret': text = copy[action]; break;
        case 'follow': text = copy.follow(name, pending); break;
        case 'stay': text = copy.stay(name); break;
        case 'pass': text = copy.pass(name, pending); break;
        case 'attack': case 'finish': text = copy[action](pending); break;
        default: text = copy.go(name, DESTINATIONS[action.slice(3) as DestinationId].name, pending);
    }
    return { action, phase: pending ? 'pending' as const : 'applied' as const, text };
}
