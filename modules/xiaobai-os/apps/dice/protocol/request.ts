import { ACTION_CHECK_REQUEST_FIELDS, parseActionCheckRequest, type ActionCheckRequest } from '../domain/action-check.js';
import { ACTION_CHECK_CLOSE, ACTION_CHECK_OPEN, findActionCheckStart } from './markup.js';
import { COC7_REQUEST_FIELDS, parseCoc7Request, type Coc7Request } from '../domain/coc7-request.js';
import type { ActionCheckRule } from '../types.js';
import { CHECK_CONSEQUENCE_FIELDS } from '../domain/check-consequences.js';

export const ACTION_CHECK_FIELDS = Object.freeze({
    action: { ...ACTION_CHECK_REQUEST_FIELDS.action, description: 'The attempt and objective.' },
    stat: { ...ACTION_CHECK_REQUEST_FIELDS.stat, description: 'The ability used.' },
    character: { ...ACTION_CHECK_REQUEST_FIELDS.character, description: 'Acting character, if ambiguous.' },
    ...CHECK_CONSEQUENCE_FIELDS,
});

export type ActionCheckParseResult = { kind: 'none' }
    | { kind: 'invalid'; error: string }
    | ({ kind: 'request'; body: string; start: number; end: number } & (
        { rule: 'd20'; request: ActionCheckRequest } | { rule: 'coc7'; request: Coc7Request }));

function findRequestClose(block: string): number | null {
    let quoted = false;
    let escaped = false;
    for (let index = ACTION_CHECK_OPEN.length; index < block.length; index++) {
        const char = block[index];
        if (quoted) {
            if (escaped) { escaped = false; }
            else if (char === '\\') { escaped = true; }
            else if (char === '"') { quoted = false; }
        } else if (char === '"') { quoted = true; }
        else if (block.startsWith(ACTION_CHECK_CLOSE, index)) { return index; }
    }
    return null;
}

export function parseActionCheck(body: string, generatedFrom = 0, rule: ActionCheckRule = 'd20'): ActionCheckParseResult {
    if (!Number.isSafeInteger(generatedFrom) || generatedFrom < 0 || generatedFrom > body.length) {
        return { kind: 'invalid', error: 'dice_generation_boundary_invalid' };
    }
    const start = findActionCheckStart(body, generatedFrom);
    if (start === null) { return { kind: 'none' }; }
    const block = body.slice(start).trimStart();
    const close = block.startsWith(ACTION_CHECK_OPEN) ? findRequestClose(block) : null;
    if (close === null) {
        return { kind: 'invalid', error: 'dice_request_incomplete' };
    }
    const end = body.length - block.length + close + ACTION_CHECK_CLOSE.length;
    if (findActionCheckStart(body, end) !== null) {
        return { kind: 'invalid', error: 'dice_request_json_invalid' };
    }
    try {
        // Tags inside JSON strings are data; preset suffixes after the request are not.
        const json: unknown = JSON.parse(block.slice(ACTION_CHECK_OPEN.length, close));
        // Ignore model-added keys only at the request boundary; stored records remain strict.
        const fields = rule === 'coc7' ? COC7_REQUEST_FIELDS : ACTION_CHECK_REQUEST_FIELDS;
        const input = json && typeof json === 'object' && !Array.isArray(json)
            ? Object.fromEntries(Object.entries(json).filter(([key]) => key === 'difficulty' || Object.hasOwn(fields, key))) : json;
        const common = { kind: 'request' as const, body: body.slice(0, start), start, end };
        return rule === 'coc7' ? { ...common, rule, request: parseCoc7Request(input) }
            : { ...common, rule, request: parseActionCheckRequest(input) };
    } catch (error) {
        return { kind: 'invalid', error: error instanceof TypeError ? error.message : 'dice_request_json_invalid' };
    }
}

export const ACTION_CHECK_EXAMPLE = 'Mira reaches for the ledge.\n\n<xb_action_check>'
    + '{"action":"Climb the wet wall","stat":"Agility","difficulty":"hard","character":"Mira","success":"Reach the balcony unseen.","failure":"Make noise and draw a guard."}'
    + '</xb_action_check>';
