import { DIRECT_INPUTS } from '../engine/input.js';
import type { Compiled, JsonObject, UpdateStage } from '../types.js';
import { allowsStage, directWriteScopes } from '../definition/stages.js';
import type { AgentToolDefinition } from '../../../agent-core/public-api.js';
import { embedSchema } from './tool-schema.js';

export const SUBMIT_TOOL = 'write';
export function getInputSchema(compiled: Compiled, stage?: UpdateStage, location = '#'): JsonObject {
    const operations: JsonObject[] = [];
    const scopes = directWriteScopes(compiled.definition, stage);
    if (scopes.length) {
        // Tool providers may reject array-valued enums and tuple/prefix schemas.
        // Keep the path shape here; settlement enforces the full permissions.
        const path: JsonObject = { type: 'array', items: { type: 'string' }, minItems: Math.max(1, Math.min(...scopes.map(scope => scope.path.length))),
            description: 'Field-name segments within a writable scope in the writing guide.' };
        for (const [op, input] of Object.entries(DIRECT_INPUTS)) {
            operations.push({ type: 'object', description: input.description, required: ['op', 'path', ...Object.keys(input.parameters)],
                properties: { op: { enum: [op] }, path, ...input.parameters,
                    reason: { type: 'string' }, old: {} }, additionalProperties: true });
        }
    }
    for (const action of compiled.definition.actions.filter(action => allowsStage(compiled.definition, action, stage))) {
        operations.push({ type: 'object', required: ['action', 'params'], properties: {
            action: { enum: [action.id], description: action.description },
            params: embedSchema(action.parameters, `${location}/items/anyOf/${operations.length}/properties/params`) as JsonObject,
            reason: { type: 'string' }, old: {},
        }, additionalProperties: true });
    }
    return { type: 'array', items: operations.length ? { anyOf: operations } : false };
}
export function getTools(compiled: Compiled, stage?: UpdateStage): AgentToolDefinition[] {
    return [{ type: 'function', function: { name: SUBMIT_TOOL,
        description: 'Submit one ordered batch of changes and actions caused by the marked passage. The platform validates and saves them to that passage, then ends this request without a tool-result turn. A rejected batch applies none of its items and returns its diagnostics for one corrected submission. An empty state array records that this passage causes no changes.',
        parameters: { type: 'object', required: ['state'], additionalProperties: false, properties: { state: getInputSchema(compiled, stage, '#/properties/state') } },
    } }];
}
