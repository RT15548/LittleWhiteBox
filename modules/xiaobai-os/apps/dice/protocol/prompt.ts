import { ACTION_CHECK_DC_RANGES, type ActionCheckDifficulty } from '../domain/action-check.js';
import { MAX_ACTION_CHECKS, referencedActionChecks, isCheckContinuationPoint, type ActionCheckRecord } from '../domain/check-records.js';
import { ACTION_CHECK_EXAMPLE, ACTION_CHECK_FIELDS } from './request.js';
import { ACTION_CHECK_CLOSE, ACTION_CHECK_OPEN } from './markup.js';
import type { ActionCheckFrequency, ActionCheckRule } from '../types.js';
import { COC7_DOMAIN, COC7_RESULT_GUIDANCE, coc7RequestContract } from './coc7-contract.js';

const FREQUENCY_PROMPTS: Record<ActionCheckFrequency, string> = {
    standard: 'Check frequency: Standard.\n'
        + 'Check an attempt when its outcome is genuinely uncertain and changes what happens next.\n'
        + 'One check covers the whole attempt and its component actions; another requires a new obstacle or materially changed circumstances that create fresh uncertainty.\n'
        + 'Outcomes settled by ability, the situation, or common sense need no check.\n'
        + 'Actions and intimate interactions without risk or resistance proceed naturally without a check.',
    active: 'Check frequency: Active.\n'
        + 'Check concrete, unresolved outcomes a character pursues: success, quality, time or cost, including small goals in everyday, social and intimate scenes.\n'
        + 'When completion is assured, check only an additional desired effect; the result applies only to that objective.\n'
        + 'One check covers a whole objective and its component actions. Carry its result forward; another check concerns a different unresolved objective.',
};
const D20_DIFFICULTY_GUIDANCE: Record<ActionCheckDifficulty, string> = {
    easy: 'modest challenge', ordinary: 'typical uncertainty', hard: 'demanding',
    very_hard: 'exceptional', nearly_impossible: 'beyond normal capability',
};
const INTIMACY_CHECK_SCOPE = 'Whether intimacy happens or continues, and each character\'s willingness, are set by the story, never by a check. '
    + 'A check covers only an additional objective within it; failure means only that objective is missed, and the interaction goes on.\n';

export function projectActionCheckResults(records: readonly ActionCheckRecord[]) {
    return records.map(record => record.rule === 'coc7' ? { rule: record.rule, ...record.request, result: record.result,
        ...(record.context ? { context: record.context } : {}),
        ...(record.resolution ? { resolution: record.resolution } : {}) }
        : { rule: record.rule, ...record.request, roll: record.roll, dc: record.dc, outcome: record.outcome,
            ...(record.context ? { context: record.context } : {}) });
}

function escapePromptMacros(json: string): string {
    // Macro-like action text remains data. Escaping string values keeps the
    // outgoing result free of executable host macro syntax while preserving JSON.
    return json.replace(/"(?:[^"\\]|\\.)*"/g,
        token => token.replaceAll('{{', '\\u007b\\u007b').replaceAll('}}', '\\u007d\\u007d'));
}

export function serializeActionCheckResults(records: readonly ActionCheckRecord[]): string {
    return '[\n' + projectActionCheckResults(records).map(record => escapePromptMacros(JSON.stringify(record))).join(',\n') + '\n]';
}

export function buildActionCheckRules(frequency: ActionCheckFrequency, rule: ActionCheckRule, coc7Ready: boolean): string {
    if (rule === 'coc7' && !coc7Ready) { return ''; }
    const domain = '# Action checks\n'
        + 'The app resolves checks outside the story and shows numbers and verdicts in a card; characters do not perceive this process.\n'
        + 'Narrate attempts and consequences as in-scene events. Resolution numbers, outcome labels and instructions belong to the card, not prose or dialogue; dice used by characters remain part of the story.\n'
        + 'Checks settle only undecided outcomes; established facts stay true.\n'
        + INTIMACY_CHECK_SCOPE
        + (rule === 'coc7' ? COC7_DOMAIN : FREQUENCY_PROMPTS[frequency] + '\n'
        + 'Difficulty reflects the character’s established abilities, approach, environment and any other character’s resistance to that specific objective. stat names the ability, without a numeric modifier.\n'
        + 'The app rolls a D20 against a DC chosen from the selected range: 1 is critical failure, 20 critical success; other rolls succeed at or above DC.\n');
    const contract = '## Requesting a check\n'
        + `A chat message can use at most ${MAX_ACTION_CHECKS} checks.\n`
        + `Describe the attempt, leave a blank line, then write one JSON object wrapped in ${ACTION_CHECK_OPEN} and ${ACTION_CHECK_CLOSE} on its own line.\n`
        + 'Requesting a check pauses the current chat message before the outcome; it does not finish the message.\n'
        + 'Stop after the request and omit end-of-message formats such as status panels at this pause.\n'
        + (rule === 'coc7' ? coc7RequestContract() : 'Fields: nonempty strings; omit unused optional fields.\n'
        + Object.entries(ACTION_CHECK_FIELDS).map(([name, spec]) => `${name} (${spec.required ? 'required' : 'optional'}, max ${spec.maxLength} chars): ${spec.description}`).join('\n')
        + '\ndifficulty (required): '
        + Object.entries(ACTION_CHECK_DC_RANGES).map(([name, { min, max }]) => `${name} (DC ${min === max ? min : `${min}–${max}`}, ${D20_DIFFICULTY_GUIDANCE[name as ActionCheckDifficulty]})`).join('; ') + '.\n'
        + `Example:\n${ACTION_CHECK_EXAMPLE}\n`);
    return `<dice_context>\n${domain + contract}</dice_context>`;
}

export function buildActionCheckContinuation(body: string, records: readonly ActionCheckRecord[], canCheck: boolean): string {
    const referenced = referencedActionChecks(body, records);
    if (!referenced.length && records.length < MAX_ACTION_CHECKS) { return ''; }
    const availability = !canCheck ? 'New checks are unavailable for this reply.'
        : records.length >= MAX_ACTION_CHECKS
            ? 'This reply has used all its action checks.' : '';
    if (!referenced.length) { return availability; }
    const last = referenced.at(-1)!;
    const paused = isCheckContinuationPoint(body, last);
    const reply = [
        '### Reply to continue',
        '',
        'These results belong to the assistant reply that appears later in this context.',
        ...(paused ? [`That reply paused just before the outcome of: ${escapePromptMacros(JSON.stringify(last.request.action))}.`] : []),
        'Your output is appended to that reply. Its existing text stays unchanged; continue after its existing ending.',
        'Do not restart, repeat or rephrase it, and do not answer this user message anew.',
    ].join('\n');
    const results = [
        '### Results',
        '',
        'Listed in the order their checks appear in that reply.',
        ...(paused ? ['The last result is the paused check.'] : []),
        'Carry forward consequences already narrated in that reply without replaying them.',
        ...(referenced.some(record => record.rule === 'coc7') ? [COC7_RESULT_GUIDANCE.trimEnd()] : []),
        '```json\n' + serializeActionCheckResults(referenced) + '\n```',
    ].join('\n');
    const narration = [
        '### Narration and formatting',
        '',
        'Narrate the consequences within the scene under the check rules.',
        'Success achieves the objective.',
        'Failure leaves the objective unachieved; the scene continues from there.',
        'Critical success achieves the objective with a modest extra benefit tied to it.',
        'Critical failure leaves the objective unachieved and adds a setback arising from the attempt itself.',
        'The success and failure fields describe alternative consequences; narrate only the one selected by the recorded verdict. Optional context is background, not another outcome.',
        'Scale any extra benefit or setback to that consequence and the attempt.',
        'Skip new-message opening formats: opening markers (such as <-begin-response->), introductory phrases (such as “好的，这是你需求的最终输出：”), and written reasoning blocks (such as <think> or <thinking>).',
        'Use normal end-of-response formatting, such as status panels, when finishing the reply, not when pausing for another check.',
        ...(availability ? [availability] : []),
    ].join('\n');
    return ['## Check results (app data, not a new user action)', reply, results, narration].join('\n\n');
}
