import { ACTION_CHECK_DC_RANGES } from '../domain/action-check.js';
import { MAX_ACTION_CHECKS, type ActionCheckRecord } from '../domain/check-records.js';
import { ACTION_CHECK_EXAMPLE, ACTION_CHECK_FIELDS } from './request.js';
import { ACTION_CHECK_CLOSE, ACTION_CHECK_OPEN } from './markup.js';
import type { ActionCheckFrequency } from '../types.js';

const FREQUENCY_PROMPTS: Record<ActionCheckFrequency, string> = {
    light: 'Check frequency: Light.\n'
        + 'Use a check only at a decisive point that determines whether the current scene’s main goal succeeds or fails.\n'
        + 'Narrate preparation and intermediate steps directly.',
    standard: 'Check frequency: Standard.\n'
        + 'Use a check for the success or failure of a concrete action that overcomes an independent obstacle.\n'
        + 'Narrate differences in performance directly when they do not affect whether the action succeeds.',
    active: 'Check frequency: Active.\n'
        + 'Use a check for a concrete, unresolved outcome the character is trying to achieve, including success, quality, completion time, or cost.\n'
        + 'Small goals in everyday activities, social exchanges, and intimate interactions are also within scope.',
};

export function projectActionCheckResults(records: readonly ActionCheckRecord[]) {
    return records.map(({ request, roll, dc, outcome }) => ({ ...request, roll, dc, outcome }));
}

export function serializeActionCheckResults(records: readonly ActionCheckRecord[]): string {
    // SillyTavern substitutes macros in extension prompts. JSON escapes preserve the data
    // without allowing action text such as {{setvar::...}} to become a host instruction.
    return JSON.stringify(projectActionCheckResults(records)).replaceAll('{{', '\\u007b\\u007b').replaceAll('}}', '\\u007d\\u007d');
}

export function buildActionCheckPrompt(records: readonly ActionCheckRecord[] = [], frequency: ActionCheckFrequency = 'standard'): string {
    const domain = '# Action checks\n'
        + FREQUENCY_PROMPTS[frequency] + '\n'
        + 'A check resolves only an undecided outcome; established facts remain true whichever result is rolled.\n'
        + 'When completing an action is assured, a check may concern an additional desired effect; success or failure applies only to that additional objective.\n'
        + 'One check covers the stated objective and its component actions.\n'
        + 'Once that objective has a result, carry it forward; another check addresses a different unresolved objective.\n'
        + 'Choose difficulty based on the acting character’s established abilities, the approach taken, and the current environment: easy is a modest challenge relative to the desired outcome, ordinary is a typical uncertain challenge, hard is demanding, very_hard is exceptional, and nearly_impossible is beyond normal capability. The stat field names the relevant ability and adds no numeric modifier.\n'
        + 'The app randomly picks a target DC from the chosen range and rolls a D20 without modifiers: 1 is critical failure, 20 is critical success; other rolls succeed at or above the target DC.\n';
    const contract = records.length >= MAX_ACTION_CHECKS
        ? 'This reply has used all its action checks. Continue the scene using the confirmed results.\n'
        : '## Requesting a check\n'
        + `After describing the attempt, put ${ACTION_CHECK_OPEN} on a separate line after a blank line, followed by one JSON object and ${ACTION_CHECK_CLOSE}. End this response there, before revealing the outcome.\n`
        + 'When requesting a check, ignore other end-of-response formatting requirements, such as status panels.\n'
        + 'Use nonempty strings; omit unused optional fields.\n'
        + Object.entries(ACTION_CHECK_FIELDS).map(([name, spec]) => `${name} (${spec.required ? 'required' : 'optional'}, max length ${spec.maxLength}): ${spec.description}`).join('\n')
        + '\ndifficulty (required, target DC range): '
        + Object.entries(ACTION_CHECK_DC_RANGES).map(([name, { min, max }]) => `${name} = ${min === max ? min : `${min}–${max}`}`).join(', ') + '.\n'
        + `Example:\n${ACTION_CHECK_EXAMPLE}\n`;
    const results = records.length ? '## Confirmed results for this reply\n'
        + 'These are confirmed results in execution order; treat each as an established fact and carry critical success or failure into an appropriate extra benefit or complication.\n'
        + 'Continue the same reply directly from the end of its existing prose, without outputting thinking, reasoning, chain-of-thought, or introductory commentary.\n'
        + serializeActionCheckResults(records) : '';
    return domain + contract + results;
}
