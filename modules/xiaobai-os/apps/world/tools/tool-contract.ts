import type { MaintenanceFunctionDeclaration } from '../../../capabilities/maintenance/registry.js';
import { WORLD_WRITE_LIMITS as L } from '../../../domains/world/types.js';
import { WORLD_EDIT_SCHEMA } from '../../../domains/world/schema.js';

export function worldEditTool(saveDescription: string): MaintenanceFunctionDeclaration {
    return { type: 'function', function: {
        name: 'WorldEdit',
        description: [
            'Edit the world overview and news articles in one batch.',
            saveDescription,
            'Use it to submit related publication changes together. The batch is atomic: a failed batch changes nothing.',
            `Unmentioned articles remain; existing articles keep their order, and new articles appear first in input order. The publication holds at most ${L.news} articles. Text limits count Unicode code points.`,
            'Validation errors identify independent problems by path and message, with code and expected when available. unchecked:["publication"] means the final article list needs valid fields before its relationships and capacity can be checked.',
        ].join('\n'),
        parameters: structuredClone(WORLD_EDIT_SCHEMA),
    } };
}

export const WORLD_TOOLS: readonly MaintenanceFunctionDeclaration[] = Object.freeze([
    { type: 'function', function: {
        name: 'WorldRead',
        description: 'Read the complete current draft, including article bodies omitted from the initial reference data and changes from successful edits. Returns {overview,news:[{id,title,body}]}, without truncation.',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
    } },
    worldEditTool([
        'Changes remain in the draft until the app saves after the run. Returns {ok,status,changed,data:{overview,news},errors:[{path,message}]}. status is updated, unchanged (already matches; success) or failed.',
        'errors also lists unresolved changes from earlier failed batches, even when this call succeeds. These corrections must be completed before the publication can be saved.',
        'Resolve a rejected article with a valid upsert or remove. remove deletes an existing article; for a rejected new ID it abandons that proposal. To retain an existing article, upsert its complete values from WorldRead, shortening the body if needed to meet the writing limit. Resolve a rejected overview by resubmitting the desired or unchanged overview.',
    ].join('\n')),
]);
