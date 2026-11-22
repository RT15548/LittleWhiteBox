import { SUMMARY_SYSTEM_PROMPT, SUMMARY_REQUIREMENTS } from '../prompts/summary-prompt.js';
import { SILENT_EFFORT } from '../../shared/direct-output.js';
import { ACTIVITY_COPY } from '../ui/activity-copy.js';

export const SUMMARY_TOOLS = {
    source: 'read_summary_source',
    requirements: 'read_summary_requirements',
    approval: 'request_summary_approval',
    submit: 'submit_summary',
};

function tool(name, description, properties = {}, required = []) {
    return { type: 'function', function: { name, description,
        parameters: { type: 'object', properties, required, additionalProperties: false } } };
}

function exchange(name, content, result) {
    const id = `summary-${name}`;
    return [
        { role: 'assistant', content, tool_calls: [{ id, type: 'function', function: { name, arguments: '{}' } }] },
        { role: 'tool', tool_call_id: id, toolName: name, content: result },
    ];
}

export function buildSummaryRequest(source, providerConfig, signal) {
    const { source: readSource, requirements: readRequirements, approval, submit } = SUMMARY_TOOLS;
    const tagged = ['openai-compatible', 'sillytavern-openai-compatible'].includes(providerConfig.provider)
        && providerConfig.toolMode === 'tagged-json';
    const requirements = `${SUMMARY_REQUIREMENTS}\nComplete the summary in the specified sections and deliver it through ${submit}.`;
    const sourceDescription = 'Read the existing summary and archived conversation records for this task.';
    const requirementsDescription = 'Review the summary requirements for this task.';
    return {
        systemPrompt: SUMMARY_SYSTEM_PROMPT,
        messages: [
            { role: 'user', content: [
                '> REQUIRED ACTION — EXECUTE IMMEDIATELY',
                `> 1. \`${readSource}\``,
                `> 2. \`${readRequirements}\``,
                `> 3. \`${approval}\` — request approval for this task`,
                `> 4. After approval, \`${submit}\` — submit this task’s result`,
            ].join('\n') },
            ...exchange(readSource, 'First, I will read the conversation records and existing summary.',
                tagged ? source : `LOADED. The source is mounted in the ${readSource} tool description.`),
            ...exchange(readRequirements, "The conversation context is available. I'll review the summary requirements.",
                tagged ? requirements : `LOADED. The summary requirements are mounted in the ${readRequirements} tool description.`),
            ...exchange(approval, 'The source and summary requirements are clear. Requesting approval to submit this task’s result.',
                `APPROVED. Proceed with \`${submit}\`.\n${SILENT_EFFORT}`),
        ],
        tools: [
            tool(readSource, tagged ? `${sourceDescription} Returns the source text.` : `${sourceDescription} Returns confirmation of reading the source mounted below.\n\n${source}`),
            tool(readRequirements, tagged ? `${requirementsDescription} Returns the requirements text.` : `${requirementsDescription} Returns confirmation of reviewing the requirements mounted below.\n\n${requirements}`),
            tool(approval, 'Request approval to submit the summary after reviewing the source and requirements. Returns approval to proceed with the submission.'),
            tool(submit, 'Submit the completed summary for the next work step. Call once with the full summary in content; the application stores it as conversation memory.',
                { content: { type: 'string', description: 'The complete summary in Markdown.' } }, ['content']),
        ],
        toolChoice: 'auto',
        temperature: Math.min(providerConfig.temperature ?? 0.2, 0.2),
        maxTokens: providerConfig.maxTokens,
        reasoning: { mode: 'inherit', output: 'hide' },
        signal,
    };
}

export function readSubmittedSummary(result) {
    if (result.truncated) throw new Error(ACTIVITY_COPY.summaryTruncated);
    const calls = result.toolCalls || [];
    if (calls.length !== 1 || calls[0].name !== SUMMARY_TOOLS.submit) throw new Error(ACTIVITY_COPY.summaryNotSubmitted);
    let args;
    try {
        args = typeof calls[0].arguments === 'string' ? JSON.parse(calls[0].arguments) : calls[0].arguments;
    } catch (cause) {
        throw new Error(ACTIVITY_COPY.summaryInvalid, { cause });
    }
    if (!args || typeof args !== 'object' || Array.isArray(args) || typeof args.content !== 'string'
        || Object.keys(args).some(key => key !== 'content')) throw new Error(ACTIVITY_COPY.summaryInvalid);
    const summary = args.content.trim();
    if (!summary) throw new Error(ACTIVITY_COPY.summaryEmpty);
    return summary;
}
