import type { ManagementResult, ManagementTool } from '../../../capabilities/management/index.js';
import { ADMINISTRATOR_COPY } from '../ui/copy.js';
import { parseToolArguments } from '../../../capabilities/agent/tool-arguments.js';
import type { AdministratorTurn } from '../domain/types.js';

export const TOOLS_LOAD = 'ToolsLoad';
export const TOOL_NOT_LOADED = Object.freeze({ ok: false, status: 'failed' as const, code: 'tool_not_loaded' });

interface ToolPackage { id: string; label: string; tools: readonly ManagementTool[] }

function requestedApps(args: Record<string, unknown>): string[] | null {
    const ids = args.apps === undefined ? [] : args.apps;
    return Object.keys(args).some(key => key !== 'apps') || !Array.isArray(ids) || ids.some(id => typeof id !== 'string')
        ? null : ids;
}

// Confirmed load calls are the conversation's selection record, including summarized turns.
// Pair within each protocol group: providers may reuse call IDs in later rounds.
export function administratorLoadedApps(turns: readonly Pick<AdministratorTurn, 'toolMessages'>[]): string[] {
    const selected = new Set<string>();
    for (const turn of turns) {
        for (const [index, message] of turn.toolMessages.entries()) {
            for (const [offset, call] of (message.toolCalls ?? []).entries()) {
                if (call.name !== TOOLS_LOAD) { continue; }
                const result = JSON.parse(turn.toolMessages[index + offset + 1].content);
                if (result.ok !== true || result.status !== 'read') { continue; }
                const ids = requestedApps(parseToolArguments(call.arguments));
                if (!ids) { throw new Error('administrator_data_invalid'); }
                for (const id of ids) { selected.add(id); }
            }
        }
    }
    return [...selected];
}

export function createAdministratorToolLoader(apps: readonly ToolPackage[], common: readonly ManagementTool[], selectedApps: readonly string[] = []) {
    const packages = new Map(apps.map(app => [app.id, app]));
    const loaded = new Map<string, readonly ManagementTool[]>();
    for (const id of selectedApps) {
        const app = packages.get(id);
        if (app) { loaded.set(id, app.tools); }
    }
    const describe = (tools: readonly ManagementTool[]) => tools.map(tool => `${tool.definition.function.name}: ${tool.label} (${tool.effect})`).join('; ');
    const tool: ManagementTool = {
        effect: 'read', label: ADMINISTRATOR_COPY.loadTools,
        target: args => Array.isArray(args.apps) ? args.apps.filter(id => typeof id === 'string').join(', ') : '',
        definition: { type: 'function', function: {
            name: TOOLS_LOAD,
            description: [
                'Add the selected APPs’ record tools to this conversation.',
                'data contains apps (all loaded APP IDs) and tools (all currently available tool names, including this entry). Full tool definitions become available on the next model request.',
                'Choose the packages that help with the user’s request. Each package includes both read and write tools, ready for the next steps of the work.',
                'Successful selections in the retained conversation history stay available across requests and reopening. Clearing the conversation resets the selection; removed APPs are unavailable.',
                'This call opens access to the tools; reading and changing records happen through those tools afterward.',
                'An invalid request loads nothing. data.unavailableApps identifies any requested APPs that could not be loaded.',
                '',
                ...apps.map(app => `APP ${app.id} (${app.label}): ${describe(app.tools)}`),
            ].join('\n'),
            parameters: { type: 'object', properties: {
                apps: { type: 'array', items: { type: 'string' }, description: 'APP IDs from the catalog above. Loads every selected APP’s tools. Default [] adds no APP tools and reports the current selection.' },
            }, additionalProperties: false },
        } },
    };
    const getTools = () => [tool.definition, ...common.map(item => item.definition), ...[...loaded.values()].flatMap(tools => tools.map(item => item.definition))];
    return {
        tool, getTools,
        load(args: Record<string, unknown>): ManagementResult & { code?: string } {
            const ids = requestedApps(args);
            if (!ids) {
                return { ok: false, status: 'failed', code: 'arguments_invalid' };
            }
            const unavailable = ids.filter(id => !packages.has(id));
            if (unavailable.length) { return { ok: false, status: 'failed', code: 'management_unavailable', data: { unavailableApps: unavailable } }; }
            for (const id of ids) { loaded.set(id, packages.get(id)!.tools); }
            return { ok: true, status: 'read', data: { apps: [...loaded.keys()], tools: getTools().map(item => item.function.name) } };
        },
    };
}
