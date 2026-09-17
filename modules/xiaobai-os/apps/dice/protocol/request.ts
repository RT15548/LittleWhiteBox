import { ACTION_CHECK_REQUEST_FIELDS, parseActionCheckRequest, type ActionCheckRequest } from '../domain/action-check.js';
import { ACTION_CHECK_CLOSE, ACTION_CHECK_OPEN, findActionCheckStart } from './markup.js';

export const ACTION_CHECK_FIELDS = Object.freeze({
    action: { ...ACTION_CHECK_REQUEST_FIELDS.action, description: 'The action being attempted.' },
    stat: { ...ACTION_CHECK_REQUEST_FIELDS.stat, description: 'The relevant ability, such as Agility.' },
    character: { ...ACTION_CHECK_REQUEST_FIELDS.character, description: 'The acting character, if ambiguous.' },
    stakes: { ...ACTION_CHECK_REQUEST_FIELDS.stakes, description: 'What success or failure changes.' },
});

export type ActionCheckParseResult = { kind: 'none' }
    | { kind: 'invalid'; error: string }
    | { kind: 'request'; request: ActionCheckRequest; body: string; start: number; end: number };

export function parseActionCheck(body: string, generatedFrom = 0): ActionCheckParseResult {
    if (!Number.isSafeInteger(generatedFrom) || generatedFrom < 0 || generatedFrom > body.length) {
        return { kind: 'invalid', error: 'dice_generation_boundary_invalid' };
    }
    const start = findActionCheckStart(body, generatedFrom);
    if (start === null) { return { kind: 'none' }; }
    const block = body.slice(start).trim();
    if (!block.startsWith(ACTION_CHECK_OPEN) || !block.endsWith(ACTION_CHECK_CLOSE)) {
        return { kind: 'invalid', error: 'dice_request_incomplete_or_not_final' };
    }
    try {
        // The final closing tag delimits the JSON. Similar tags inside JSON strings are data.
        const json: unknown = JSON.parse(block.slice(ACTION_CHECK_OPEN.length, -ACTION_CHECK_CLOSE.length));
        const end = body.lastIndexOf(ACTION_CHECK_CLOSE) + ACTION_CHECK_CLOSE.length;
        return { kind: 'request', request: parseActionCheckRequest(json), body: body.slice(0, start), start, end };
    } catch (error) {
        return { kind: 'invalid', error: error instanceof TypeError ? error.message : 'dice_request_json_invalid' };
    }
}

export const ACTION_CHECK_EXAMPLE = 'Mira reaches for the ledge.\n\n<xb_action_check>'
    + '{"action":"Climb the wet wall","stat":"Agility","difficulty":"hard","character":"Mira","stakes":"Reach the balcony unseen"}'
    + '</xb_action_check>';
