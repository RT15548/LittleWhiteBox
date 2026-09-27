import type { ManagementTool } from '../../../capabilities/management/index.js';
import { MANAGEMENT_PAGE_SIZE, MANAGEMENT_READ_CHARS } from '../../../capabilities/management/read-page.js';
import { mapTools, MAP_MAINTENANCE_TOOL_NAMES as TOOLS, MAP_SCENE_READ_DESCRIPTION } from '../tools/tool-contract.js';

const LABELS: Record<string, string> = {
    [TOOLS.ATLAS_READ]: '查看图册',
    [TOOLS.SCENE_READ]: '查看场景',
    [TOOLS.ATLAS_EDIT]: '修改图册',
    [TOOLS.SCENE_EDIT]: '修改场景',
};

export function createMapManagementTools(): readonly ManagementTool[] {
    return mapTools([
        'This call saves valid edits. Returns {ok,status,data}; status is saved, partial, unchanged or failed.',
        'data contains the edit report {ok,status,changed,applied,skipped,warnings,hint?,data?}. Its status describes the edit; the outer status describes persistence.',
    ].join('\n')).map(tool => {
        const definition = structuredClone(tool) as ManagementTool['definition'];
        const name = definition.function.name;
        const properties = definition.function.parameters.properties as Record<string, Record<string, unknown>>;
        if (name === TOOLS.ATLAS_READ) {
            properties.mode.enum = ['summary', 'locations', 'links', 'actors'];
            properties.limit.maximum = MANAGEMENT_PAGE_SIZE;
            properties.limit.description = `Records per page. Default and maximum ${MANAGEMENT_PAGE_SIZE}.`;
            definition.function.description = [
                'Read the current world atlas.',
                'Summary data contains mode, revision, counts for locations/links/actors, and player (null when unrecorded). Collection data contains mode, revision, count, returned, truncated, nextOffset and the named collection.',
                'Use a collection to find existing keys before editing. Locations include hasScene, which indicates whether a layout exists, not whether it is complete.',
                'Continue with nextOffset while it is not null, keeping the same mode and filters.',
            ].join('\n');
        } else if (name === TOOLS.SCENE_READ) {
            properties.offset = { type: 'integer', minimum: 0, description: 'Character offset in the scene JSON. Default 0; use nextOffset to continue.' };
            definition.function.description = [
                MAP_SCENE_READ_DESCRIPTION,
                'Returns {ok,status,data}; a successful read has status read.',
                `data contains a JSON text page with text, offset, nextOffset and totalChars, at most ${MANAGEMENT_READ_CHARS} characters.`,
                'Continue with nextOffset while it is not null.',
            ].join('\n');
        }
        return {
            definition,
            effect: name.endsWith('Read') ? 'read' : 'write',
            label: LABELS[name],
            target: args => String(args.scene ?? args.query ?? args.mode ?? ''),
        };
    });
}
