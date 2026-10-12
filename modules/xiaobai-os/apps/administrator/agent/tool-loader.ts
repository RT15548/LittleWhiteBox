import type { ManagementResult, ManagementTool } from '../../../capabilities/management/index.js';
import { ADMINISTRATOR_COPY } from '../ui/copy.js';

export const TOOLS_LOAD = 'ToolsLoad';
export const TOOL_NOT_LOADED = Object.freeze({ ok: false, status: 'failed' as const, code: 'tool_not_loaded' });

interface ToolPackage { id: string; label: string; tools: readonly ManagementTool[] }

export function createAdministratorToolLoader(apps: readonly ToolPackage[], common: readonly ManagementTool[]) {
    const packages = new Map(apps.map(app => [app.id, app]));
    const loaded = new Map<string, readonly ManagementTool[]>();
    const describe = (tools: readonly ManagementTool[]) => tools.map(tool => `${tool.definition.function.name}: ${tool.label} (${tool.effect})`).join('; ');
    const tool: ManagementTool = {
        effect: 'read', label: ADMINISTRATOR_COPY.loadTools,
        target: args => Array.isArray(args.apps) ? args.apps.filter(id => typeof id === 'string').join(', ') : '',
        definition: { type: 'function', function: {
            name: TOOLS_LOAD,
            description: [
                'Make the selected APPs’ record tools available for the current request.',
                'data contains apps (all loaded APP IDs) and tools (all currently available tool names, including this entry). Full tool definitions become available on the next model request.',
                'Choose the packages that help with the user’s request. Each package includes both read and write tools, ready for the next steps of the work.',
                'Loaded packages stay available until this run ends. Each new user request or regeneration starts with the common tools and this catalog; APP packages are selected for that request.',
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
            const ids = args.apps === undefined ? [] : args.apps;
            if (Object.keys(args).some(key => key !== 'apps') || !Array.isArray(ids) || ids.some(id => typeof id !== 'string')) {
                return { ok: false, status: 'failed', code: 'arguments_invalid' };
            }
            const unavailable = ids.filter(id => !packages.has(id));
            if (unavailable.length) { return { ok: false, status: 'failed', code: 'management_unavailable', data: { unavailableApps: unavailable } }; }
            for (const id of ids) { loaded.set(id, packages.get(id)!.tools); }
            return { ok: true, status: 'read', data: { apps: [...loaded.keys()], tools: getTools().map(item => item.function.name) } };
        },
    };
}
