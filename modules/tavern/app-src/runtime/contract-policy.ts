import {
    getTavernContractMandateDefinition,
    resolveTavernSessionContractRuntime,
    type TavernSessionContract,
    type TavernSessionContractRuntime,
} from '../../shared/session-contract';
import { TAVILY_TOOL_NAME } from '../../../agent-core/tavily-search.js';
import { TAVERN_SOURCE_FILE_TOOL_NAMES, type TavernMemoryToolResult } from '../../shared/memory-files';
import { TAVERN_STATE_TOOL_NAMES, type TavernStateToolResult } from '../../shared/structured-state';
import { TAVERN_STATUS_TOOL_NAMES, type TavernStatusToolResult } from '../../shared/status-state';
import { TAVERN_TASK_TOOL_NAMES } from '../../shared/tasks/task-tools';

const SOURCE_READ_TOOL_NAMES: string[] = [
    TAVERN_SOURCE_FILE_TOOL_NAMES.LS,
    TAVERN_SOURCE_FILE_TOOL_NAMES.GREP,
    TAVERN_SOURCE_FILE_TOOL_NAMES.READ,
    TAVILY_TOOL_NAME,
];
const SOURCE_WRITE_TOOL_NAMES: string[] = [
    TAVERN_SOURCE_FILE_TOOL_NAMES.EDIT,
    TAVERN_SOURCE_FILE_TOOL_NAMES.WRITE,
];
const INTERNAL_STATE_TOOL_NAMES: string[] = Object.values(TAVERN_STATE_TOOL_NAMES);
const MODEL_STATE_TOOL_NAMES: string[] = [
    TAVERN_STATE_TOOL_NAMES.READ_ATLAS,
    TAVERN_STATE_TOOL_NAMES.READ_SCENE,
    TAVERN_STATE_TOOL_NAMES.EDIT_SCENE,
];
const STATUS_TOOL_NAMES: string[] = Object.values(TAVERN_STATUS_TOOL_NAMES);
const TASK_TOOL_NAMES: string[] = Object.values(TAVERN_TASK_TOOL_NAMES);

export interface TavernAutoManagerToolPolicy {
    runtime: TavernSessionContractRuntime;
    allowedToolNames: string[];
    deniedToolNames: string[];
}

function getAutoManagerToolModuleKey(toolName = ''): 'memoryArchiving' | 'cartographyEngine' | 'statusPanel' | null {
    const name = String(toolName || '').trim();
    if (!name || SOURCE_READ_TOOL_NAMES.includes(name)) {return null;}
    if (SOURCE_WRITE_TOOL_NAMES.includes(name)) {return 'memoryArchiving';}
    if (INTERNAL_STATE_TOOL_NAMES.includes(name)) {return 'cartographyEngine';}
    if (STATUS_TOOL_NAMES.includes(name)) {return 'statusPanel';}
    return null;
}

function isStateToolName(toolName = ''): boolean {
    return INTERNAL_STATE_TOOL_NAMES.includes(String(toolName || '').trim());
}

function isStatusToolName(toolName = ''): boolean {
    return STATUS_TOOL_NAMES.includes(String(toolName || '').trim());
}

export function resolveTavernAutoManagerToolPolicy(
    contract?: Partial<TavernSessionContract> | null,
): TavernAutoManagerToolPolicy {
    const runtime = resolveTavernSessionContractRuntime(contract);
    const allowedToolNames: string[] = [...SOURCE_READ_TOOL_NAMES, ...TASK_TOOL_NAMES];
    if (runtime.includeMemoryFiles) {
        allowedToolNames.push(...SOURCE_WRITE_TOOL_NAMES);
    }
    if (runtime.includeStructuredStates) {
        allowedToolNames.push(...MODEL_STATE_TOOL_NAMES);
    }
    if (runtime.includeStatusStates) {
        allowedToolNames.push(...STATUS_TOOL_NAMES);
    }
    const allowed = new Set(allowedToolNames);
    const deniedToolNames = [...SOURCE_WRITE_TOOL_NAMES, ...INTERNAL_STATE_TOOL_NAMES, ...STATUS_TOOL_NAMES].filter((name) => !allowed.has(name));
    return {
        runtime,
        allowedToolNames: [...allowed],
        deniedToolNames,
    };
}

export function filterAutoManagerToolDefinitions<T extends { function?: { name?: string } }>(
    tools: T[] = [],
    contract?: Partial<TavernSessionContract> | null,
): T[] {
    const allowed = new Set(resolveTavernAutoManagerToolPolicy(contract).allowedToolNames);
    return tools.filter((tool) => allowed.has(String(tool?.function?.name || '').trim()));
}

export function isAutoManagerToolAllowed(
    toolName = '',
    contract?: Partial<TavernSessionContract> | null,
): boolean {
    const allowed = new Set(resolveTavernAutoManagerToolPolicy(contract).allowedToolNames);
    return allowed.has(String(toolName || '').trim());
}

export function buildDeniedAutoManagerToolResult(
    toolName = '',
    contract?: Partial<TavernSessionContract> | null,
): TavernMemoryToolResult | TavernStateToolResult | TavernStatusToolResult {
    const name = String(toolName || '').trim();
    const moduleKey = getAutoManagerToolModuleKey(name);
    const moduleTitle = moduleKey
        ? (getTavernContractMandateDefinition(moduleKey)?.title || moduleKey)
        : 'Auto Manager';
    const summary = moduleKey
        ? `契约未授权 ${moduleTitle}，本轮不会执行 ${name || '该工具'}。`
        : `自动管理员当前不会执行 ${name || '该工具'}。`;
    if (isStateToolName(name)) {
        return {
            ok: false,
            summary,
            changed: false,
            error: 'contract_tool_unauthorized',
            warnings: resolveTavernAutoManagerToolPolicy(contract).runtime.hasAutomaticManagerWork
                ? []
                : ['contract_manager_work_disabled'],
        };
    }
    if (isStatusToolName(name)) {
        return {
            ok: false,
            summary,
            changed: false,
            error: 'contract_tool_unauthorized',
            warnings: resolveTavernAutoManagerToolPolicy(contract).runtime.hasAutomaticManagerWork
                ? []
                : ['contract_manager_work_disabled'],
        };
    }
    return {
        ok: false,
        summary,
        changed: false,
        error: 'contract_tool_unauthorized',
        warning: resolveTavernAutoManagerToolPolicy(contract).runtime.hasAutomaticManagerWork
            ? ''
            : 'contract_manager_work_disabled',
    };
}
