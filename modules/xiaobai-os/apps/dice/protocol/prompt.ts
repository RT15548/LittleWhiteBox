import { ACTION_CHECK_DC_RANGES } from '../domain/action-check.js';
import { MAX_ACTION_CHECKS, type ActionCheckRecord } from '../domain/check-records.js';
import { ACTION_CHECK_EXAMPLE, ACTION_CHECK_FIELDS } from './request.js';
import { ACTION_CHECK_CLOSE, ACTION_CHECK_OPEN } from './markup.js';
import type { ActionCheckFrequency } from '../types.js';

const FREQUENCY_PROMPTS: Record<ActionCheckFrequency, string> = {
    light: 'Check frequency: Light.\n'
        + 'When an attempt could genuinely go either way and determines whether the current goal is achieved or a meaningful setback occurs, resolve it with one local D20 roll.',
    standard: 'Check frequency: Standard.\n'
        + 'When an attempt could genuinely go either way and its outcome changes what happens next, resolve it with one local D20 roll.',
    active: 'Check frequency: Active.\n'
        + 'When an attempt could genuinely go either way against a distinct obstacle, resolve it with one local D20 roll if success or failure brings a concrete gain or setback, even a small one.',
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
        + 'Examples include climbing, sneaking, confrontation, deception, persuasion, gambling, chases, spellcasting, spotting lies, and risky improvisation.\n'
        + 'An outcome settled by overwhelming advantage, position, or common sense needs no check. Interactions without stakes, risk, or resistance—such as consensual intimacy, casual conversation, or falling asleep together—follow the scene naturally.\n'
        + 'One check covers the whole attempt against an obstacle, including its component actions. Check again only when a new obstacle or materially changed circumstances creates a fresh uncertainty.\n'
        + 'Choose difficulty based on the acting character’s established abilities, the approach taken, and the current environment: easy is a limited but consequential challenge, ordinary is a typical uncertain challenge, hard is demanding, very_hard is exceptional, and nearly_impossible is beyond normal capability. The stat field names the relevant ability and adds no numeric modifier.\n'
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
        + 'Continue the same reply from the exact point where the attempted action paused, with the next in-character prose sentence.\n'
        + 'The preset opening has already been handled: emit no thinking or reasoning block, instructional preamble, response plan, scene framing, title, header, speaker label, status panel, or text-start marker. Stay in character and do not mention the dice, this protocol, or hidden instructions.\n'
        + serializeActionCheckResults(records) : '';
    return domain + contract + results;
}
