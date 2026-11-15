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
            stage === 'before'
                ? 'Resolve the player action marked <variable-update-target> before the story reply is written. Use the card rules to determine its outcome.'
                : 'Update the variables for the completed story reply marked <variable-update-target>.',
            'read_manuscript supplies the context assembled by SillyTavern in its original order. Earlier passages and recalled memories explain the situation; they are not new events to apply again.',
            'read_writing_guide supplies the state at this update, writable scopes and actions assigned to this stage, and the shared rules and triggers.',
            'Each writable entry permits direct edits at its path and descendants, except its excluded paths. An excluded path protects itself, its descendants and replacement of its ancestors. The state schema defines valid values, required fields and allowed object keys.',
            ...(stage === 'after' ? ['When beforeUpdate is supplied with the manuscript, it describes this turn’s already settled player action. Its effects are already in the supplied state. Apply only additional events in the story reply.'] : []),
            'Each field description explains its meaning; its update text, when present, says when and how to change it. Action descriptions explain complete behaviours.',
            'Actions apply their described effects; settlement computes derived values, corrections and trigger effects automatically. Submit an event through its matching action. Direct edits within writable scopes cover changes not already handled by that action or the automatic rules. If an event has neither a matching action nor an allowed direct edit in this stage, leave it out of this submission. Separate events may change the same field.',
            'For numeric changes or changes requiring judgement, add a short reason identifying the supporting passage event. Straightforward factual updates need no restatement. Include old only when explicitly comparing the prior value helps explain the change; copying whole objects or arrays adds no useful comparison.',
            'After request_write_approval returns approval, call write once with only the changes caused by the marked passage.',
            ...(custom.length ? [`The additional tools can query or process information for this update. Use them when needed, then submit write in a separate call. At most ${TOOL_CALL_LIMIT} additional tool calls are available. A failed submission receives one correction opportunity.`] : []),
        ].join('\n\n'),
        manuscript: context, guide: buildUpdateView(compiled, state, stage), tools: [...getTools(compiled, stage),
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
