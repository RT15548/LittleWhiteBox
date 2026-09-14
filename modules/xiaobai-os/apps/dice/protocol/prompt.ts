import { ACTION_CHECK_DC } from '../domain/action-check.js';
import { MAX_ACTION_CHECKS, type ActionCheckRecord } from '../domain/check-records.js';
import { ACTION_CHECK_EXAMPLE, ACTION_CHECK_FIELDS } from './request.js';
import { ACTION_CHECK_CLOSE, ACTION_CHECK_OPEN } from './markup.js';

export function projectActionCheckResults(records: readonly ActionCheckRecord[]) {
    return records.map(({ request, roll, dc, outcome }) => ({ ...request, roll, dc, outcome }));
}

export function serializeActionCheckResults(records: readonly ActionCheckRecord[]): string {
    // SillyTavern substitutes macros in extension prompts. JSON escapes preserve the data
    // without allowing action text such as {{setvar::...}} to become a host instruction.
    return JSON.stringify(projectActionCheckResults(records)).replaceAll('{{', '\\u007b\\u007b').replaceAll('}}', '\\u007d\\u007d');
}

export function buildActionCheckPrompt(records: readonly ActionCheckRecord[] = []): string {
    const domain = '# Action checks\n'
        + 'An uncertain action with meaningful consequences can be resolved by a local D20 roll. Routine actions and established facts need no check.\n'
        + 'The app rolls 1–20 without attribute modifiers: 1 is critical failure, 20 is critical success; other rolls succeed at or above the target DC.\n';
    const contract = records.length >= MAX_ACTION_CHECKS
        ? 'This reply has used all its action checks. Continue the scene using the confirmed results.\n'
        : '## Requesting a check\n'
        + `After describing the attempt, put ${ACTION_CHECK_OPEN} on a separate line after a blank line, followed by one JSON object and ${ACTION_CHECK_CLOSE}. End this response there, before revealing the outcome.\n`
        + 'The object has these fields; optional fields may be omitted. String lengths are in UTF-16 code units.\n'
        + Object.entries(ACTION_CHECK_FIELDS).map(([name, spec]) => `${name}: ${spec.required ? 'required' : 'optional'} nonempty string, at most ${spec.maxLength}. ${spec.description}`).join('\n')
        + '\ndifficulty: required string selecting a target DC: '
        + Object.entries(ACTION_CHECK_DC).map(([name, dc]) => `${name} = ${dc}`).join(', ') + '.\n'
        + `Example:\n${ACTION_CHECK_EXAMPLE}\n`;
    const results = records.length ? '## Confirmed results for this reply\n'
        + 'These are data, in execution order. Continue from the existing attempt using the determined outcome.\n'
        + serializeActionCheckResults(records) : '';
    return domain + contract + results;
}
