import type { ExperienceView } from '../cooperation.js';
import type { PersonId } from '../model.js';

const isTalk = (event: ExperienceView) => event.payload.kind === 'speech' || event.payload.kind === 'declaration';

/**
 * The conversation is what the people who can follow it now are saying, not a log of everything that happened.
 * Speech from someone out of earshot, and the player's words that nobody here heard, stay in the journal;
 * so does every event that is not speech (those reach the player as short notes on the map).
 */
export function sceneTalk(events: readonly ExperienceView[], listeners: readonly PersonId[]): ExperienceView[] {
    return events.filter(event => {
        if (!isTalk(event) || !('actor' in event.payload)) { return false; }
        return event.payload.actor === 'player' ? event.audience.some(id => listeners.includes(id)) : listeners.includes(event.payload.actor);
    });
}
