import type { ExperienceView } from '../cooperation.js';
import type { EventPayload } from '../model.js';
import { eventText } from '../copy.js';

export interface FeedbackNote { sequence: number; text: string; tone: 'plain' | 'warn' }

// Talk belongs to the conversation; the rest of this list is the island's way of telling the player what just happened.
const NOT_FEEDBACK: readonly EventPayload['kind'][] = ['speech', 'declaration', 'intention', 'started', 'departed', 'arrived'];
// Things worth noting even when they happen to someone else within sight.
const WITNESSED: readonly EventPayload['kind'][] = ['died', 'noticed_body', 'strike_started', 'strike_resolved'];
const WARNING: readonly EventPayload['kind'][] = ['died', 'noticed_body', 'strike_started', 'strike_resolved', 'accident', 'need', 'work_failed', 'take_unavailable', 'contested', 'resource_contested', 'site_contested'];

const involvesPlayer = (payload: EventPayload) => Object.values(payload).some(value => value === 'player' || Array.isArray(value) && value.includes('player'));

/** A short line for events the player should notice on the map, or null when the event is only for the journal. */
export function feedbackNote(event: ExperienceView): FeedbackNote | null {
    const { payload } = event;
    if (NOT_FEEDBACK.includes(payload.kind)) { return null; }
    if (!WITNESSED.includes(payload.kind) && !involvesPlayer(payload)) { return null; }
    return { sequence: event.sequence, text: eventText(payload), tone: WARNING.includes(payload.kind) ? 'warn' : 'plain' };
}
