import { getTools } from './tools.js';
import { buildUpdateView } from './views.js';
import { buildHandoff } from '../../updater/handoff.js';
import type { Compiled, Json, JsonObject, UpdateStage } from '../types.js';
import type { AgentChatInput } from '../../../agent-core/public-api.js';
import { activeTools, TOOL_CALL_LIMIT } from '../extensions/definition.js';

export function buildUpdateTask(compiled: Compiled, state: Json, context: unknown, stage: UpdateStage = 'after'): AgentChatInput {
    const custom = activeTools(compiled.bundle, stage);
    return buildHandoff({
        systemPrompt: [
            '# Task',
            stage === 'before'
                ? 'You resolve the player action marked <variable-update-target> before the story reply is written. The card rules decide its outcome. Everything before that message is already reflected in the state.'
                : 'You update the story variables for the reply marked <variable-update-target>. Everything before that reply is already reflected in the state; this update records what the reply itself changes.',
            ...(custom.length ? ['', '# Additional tools', `The additional tools can query or process information for this update. Use them when needed, then submit write in a separate call. At most ${TOOL_CALL_LIMIT} additional tool calls are available. A failed submission receives one correction opportunity.`] : []),
        ].join('\n'),
        manuscript: context,
        manuscriptDescription: [
            'Read the conversation context for this update. Returns confirmation of reading the manuscript mounted below.',
            stage === 'before'
                ? '- messages: the conversation up to and including the marked player message. Earlier passages and recalled memories are background; their events are already in the state.'
                : '- messages: the conversation up to and including the marked reply. Earlier passages and recalled memories are background; their events are already in the state.',
            ...(stage === 'after' ? ['- beforeUpdate, when present: this turn’s player action, resolved before the reply was written. Its changes are already in the state; the reply may add further events.'] : []),
        ].join('\n'),
        guide: buildUpdateView(compiled, state, stage),
        guideDescription: [
            'Read the starting state, schema, actions and rules for this update. Returns confirmation of reading the writing guide mounted below.',
            '',
            '# What the guide contains',
            '- state: current values.',
            '- schema: valid values, required fields and allowed object keys.',
            '- fields: what each field means. write lists how it can change in this update: "direct" or action ids. update, when present, says when and how to change it.',
            '- actions: complete behaviours and their parameters.',
            '- writable: paths open to direct edits, with their descendants. An excluded path keeps itself and its descendants protected, and its ancestors cannot be replaced as a whole.',
            '- rules, triggers, constraints: what the system derives, corrects, fires or checks after your submission.',
            '',
            '# Turning events into changes',
            '- An event that matches an action goes through that action; the action applies all of its described effects.',
            '- Derived values, corrections and trigger effects are computed automatically after submission.',
            '- Direct edits cover the rest: changes inside writable paths that no action or rule already produces.',
            '- An event with neither a matching action nor a writable path stays out of this update.',
            '- Items run in the order submitted. Separate events may each change the same field; list them in story order.',
            '',
            '# Writing each item',
            '- reason: for numeric changes and judgement calls, name the event in the passage that supports it. Plain factual updates go without one.',
            '- old: only when the prior value explains the change, as that single value rather than a copied object or array.',
        ].join('\n'),
        tools: [...getTools(compiled, stage),
            ...custom.map(([name, entry]) => ({ type: 'function' as const, function: { name, description: entry.description, parameters: entry.parameters as JsonObject } }))],
    });
}

export function beforeProsePrompt(outcome: unknown): string {
    return [
        'The JSON below records the part of the latest user message already resolved before this reply; everything else in that message remains open for this reply.',
        'Keep what happens in this reply consistent with this outcome. The current state shown elsewhere in this context already includes these changes.',
        'This block is reference data for generating the reply; raw JSON, field paths and outcome labels are not part of the reply.',
        'applied means the listed actions and changes took effect; rejected means the attempted action did not pass the pre-reply check. diagnostics records the reasons it did not pass.',
    ].join(' ') + '\n' + JSON.stringify(outcome);
}
