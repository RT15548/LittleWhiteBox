import { COC7_DIFFICULTIES, COC7_REQUEST_FIELDS, type Coc7Request } from '../domain/coc7-request.js';
import { COC7_CAPABILITIES } from '../domain/coc7-catalog.js';
import { ACTION_CHECK_OPEN, ACTION_CHECK_CLOSE } from './markup.js';

const example: Coc7Request = { action: 'Climb the wet wall', stat: 'athletics', difficulty: 'hard',
    success: 'Reach the balcony unseen.', failure: 'Make noise and draw a guard.' };
export const COC7_EXAMPLE = 'You reach for the ledge.\n\n' + ACTION_CHECK_OPEN + JSON.stringify(example) + ACTION_CHECK_CLOSE;
export function coc7CapabilityProjection() {
    return Object.entries(COC7_CAPABILITIES).map(([id, { label, description }]) => ({
        id, name: label, use: description,
    }));
}
export function coc7RequestContract(): string {
    const difficulties = Object.entries(COC7_DIFFICULTIES)
        .map(([id, rule]) => `${id} (${rule.kind === 'bonus' ? `value + ${rule.amount}, max ${rule.cap}`
            : rule.divisor === 1 ? 'full value' : `1/${rule.divisor} value`})`).join('; ');
    const fields = Object.entries(COC7_REQUEST_FIELDS)
        .map(([name, spec]) => `${name} (${spec.required ? 'required' : 'optional'}${spec.type === 'string' ? `, max ${spec.maxLength} chars` : ''}): ${spec.description}`
            + (name === 'difficulty' ? ` ${difficulties}.` : '')).join('\n');
    const capabilities = coc7CapabilityProjection()
        .map(({ id, name, use }) => `${id}=${name} (${use})`).join('; ');
    return 'Fields: nonempty strings; omit unused optional fields.\n'
        + fields + '\n## Player capabilities\n' + capabilities
        + `\nExample:\n${COC7_EXAMPLE}\n`;
}
export const COC7_DOMAIN = 'CoC 7 (modified): setting-neutral D100 checks.\n'
    + 'Checks apply only to the character played by the user; NPC opposition becomes difficulty for that character’s attempt or response.\n'
    + 'Check when the outcome is uncertain and failure matters. One check covers a whole objective; another requires a new objective or obstacle.\n'
    + 'Choose one attribute or skill matching the main uncertainty; the app looks up its sheet value.\n'
    + 'Difficulty reflects the obstacle and approach, not the character’s competence.\n';
export const COC7_RESULT_GUIDANCE = 'For percentile results, result.verdict decides whether the objective was achieved; result.level is the rolled success degree, which may fall short of the required difficulty.\n'
    + 'result.value is the value used. Optional resolution records a mapped input name or an untrained basis (unknown or ambiguous capability).\n';
