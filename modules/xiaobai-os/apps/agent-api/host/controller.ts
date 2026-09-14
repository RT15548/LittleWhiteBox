import type { XiaobaiOsAgentGateway } from '../../../capabilities/agent/gateway.js';
import type { XiaobaiOsExecutionScope } from '../../../kernel/execution-scope.js';
import type { XiaobaiOsHostFrameMessage } from '../../../host/frame-bridge.js';
import type { XiaobaiOsAppActivationContext, XiaobaiOsAppRuntime } from '../../../types.js';
import type { AgentApiClientState } from '../types.js';

type UnknownRecord = Record<string, unknown>;

interface AgentApiActivation {
    generation: number;
    post: XiaobaiOsAppActivationContext['post'];
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error || 'unknown_error');
}

function loadingState(): AgentApiClientState {
    return { status: 'loading', config: null, message: '' };
}

export function createAgentApiController(
    gateway: XiaobaiOsAgentGateway,
    execution?: XiaobaiOsExecutionScope,
): XiaobaiOsAppRuntime & {
    activate: NonNullable<XiaobaiOsAppRuntime['activate']>;
    handleMessage: NonNullable<XiaobaiOsAppRuntime['handleMessage']>;
} {
    let activation: AgentApiActivation | null = null;
    let activationGeneration = 0;
    const networkOperations = new Set<AbortController>();

    function isCurrent(current: AgentApiActivation): boolean {
        return activation === current && current.generation === activationGeneration;
    }

    function assertActivation(): AgentApiActivation {
        if (!activation) {throw new Error('Agent API APP 未激活');}
        return activation;
    }

    async function readState(): Promise<AgentApiClientState> {
        try {
            return { status: 'ready', config: await gateway.loadConfig(), message: '' };
        } catch (error) {
            return {
                status: 'error',
                config: null,
                message: `模型设置加载失败：${describeError(error)}`,
            };
        }
    }

    function scheduleInitialLoad(current: AgentApiActivation): void {
        const load = async () => {
            if (!isCurrent(current)) {return;}
            const state = await readState();
            if (isCurrent(current)) {current.post('agent-api/state', { state });}
        };
        if (execution) { execution.setTimeout(load, 0); }
        else { globalThis.setTimeout(() => { void load(); }, 0); }
    }

    function beginNetworkOperation(): AbortController {
        const controller = new AbortController();
        networkOperations.add(controller);
        return controller;
    }

    function endNetworkOperation(controller: AbortController): void {
        networkOperations.delete(controller);
    }

    function cancelForeground(reason = 'cancelled'): void {
        activationGeneration += 1;
        activation = null;
        for (const controller of networkOperations) {
            controller.abort(reason);
        }
        networkOperations.clear();
    }

    function activate(context: XiaobaiOsAppActivationContext): AgentApiClientState {
        cancelForeground('reactivated');
        const current = { generation: ++activationGeneration, post: context.post };
        activation = current;
        scheduleInitialLoad(current);
        return loadingState();
    }

    async function handleMessage(message: XiaobaiOsHostFrameMessage): Promise<unknown> {
        const current = assertActivation();
        const payload = isRecord(message.payload) ? message.payload : {};
        if (message.type === 'agent-api/reload') {
            const state = await readState();
            if (!isCurrent(current)) {throw new Error('app_inactive');}
            return state;
        }
        if (message.type === 'agent-api/save') {
            const patch = isRecord(payload.patch) ? payload.patch : {};
            const result = await gateway.saveConfig(patch);
            if (!isCurrent(current)) {throw new Error('app_inactive');}
            return result;
        }
        if (message.type === 'agent-api/pull-models') {
            if (!isRecord(payload.providerConfig)) {throw new Error('模型配置无效');}
            const operation = beginNetworkOperation();
            try {
                const models = await gateway.pullModels(payload.providerConfig, operation.signal);
                if (!isCurrent(current)) {throw new Error('app_inactive');}
                return { models };
            } finally {
                endNetworkOperation(operation);
            }
        }
        if (message.type === 'agent-api/test-connection') {
            if (!isRecord(payload.providerConfig)) {throw new Error('模型配置无效');}
            const operation = beginNetworkOperation();
            try {
                const result = await gateway.testConnection(payload.providerConfig, operation.signal);
                if (!isCurrent(current)) {throw new Error('app_inactive');}
                return result;
            } finally {
                endNetworkOperation(operation);
            }
        }
        throw new Error('未知的 Agent API 操作');
    }

    execution?.addCleanup(() => cancelForeground('execution-disposed'));

    return Object.freeze({
        activate,
        deactivate: cancelForeground,
        cancelForeground,
        cancelAll: cancelForeground,
        handleMessage,
        stopBackground() {
            cancelForeground('background-stopped');
        },
    });
}
