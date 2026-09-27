import {
    ECONOMY_READ_CAPABILITY,
    ECONOMY_TRANSACTION_CAPABILITY,
    type EconomyReadCapability,
} from '../../capabilities/economy/index.js';
import { AGENT_CAPABILITY, type AgentCapability } from '../../capabilities/agent/index.js';
import { PROMPT_INJECTION_CAPABILITY, type PromptInjectionCapability } from '../../capabilities/prompt-injection/index.js';
import { MANAGEMENT_CAPABILITY } from '../../capabilities/management/index.js';
import {
    MAINTENANCE_CAPABILITY,
    type MaintenanceCapability,
} from '../../capabilities/maintenance/index.js';
import type { AppInstallContext, XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import type { PartitionStore } from '../../kernel/contracts.js';
import type { TaskDomainV1 } from '../../domains/tasks/types.js';
import type { UserTransactions } from '../../kernel/user-transactions.js';
import type { XiaobaiOsAppRuntime } from '../../types.js';
import { MAP_CONTEXT_CAPABILITY, type MapContextCapability } from '../map/context-capability.js';
import { WORLD_CONTEXT_CAPABILITY, type WorldContextCapability } from '../world/context-capability.js';
import {
    createTasksService,
    type TasksService,
    type TasksServiceDependencies,
} from './application/service.js';
import { TASKS_APP_DESCRIPTOR } from './descriptor.js';
import { TASKS_PARTITION } from './partition.js';

export { TASKS_PARTITION } from './partition.js';

export interface TasksModuleInstallContext {
    ownerId: string;
    store: PartitionStore<TaskDomainV1>;
    tasks: TasksService;
    economy: EconomyReadCapability;
    agent: AgentCapability;
    prompts: PromptInjectionCapability;
    maintenance: MaintenanceCapability;
    mapContext: MapContextCapability;
    worldContext: WorldContextCapability;
    execution: AppInstallContext['execution'];
}

export interface TasksModuleDependencies {
    getPlayerDisplayName: () => string;
    getEvidenceDigest: () => string;
    getStoryLabel: () => string;
    userTransactions?: () => UserTransactions | null;
    service?: Omit<TasksServiceDependencies, 'getPlayerDisplayName' | 'getEvidenceDigest' | 'getStoryLabel' | 'userTransactions'>;
    install(context: TasksModuleInstallContext): Promise<XiaobaiOsAppRuntime>;
    dispose?(runtime: XiaobaiOsAppRuntime): Promise<void>;
}

export function createTasksModule(dependencies: TasksModuleDependencies): XiaobaiOsAppModule {
    const services = new WeakMap<object, TasksService>();
    return {
        descriptor: TASKS_APP_DESCRIPTOR,
        partition: TASKS_PARTITION,
        capabilities: [
            ECONOMY_READ_CAPABILITY,
            ECONOMY_TRANSACTION_CAPABILITY,
            AGENT_CAPABILITY,
            PROMPT_INJECTION_CAPABILITY,
            MAINTENANCE_CAPABILITY,
            MANAGEMENT_CAPABILITY,
            MAP_CONTEXT_CAPABILITY,
            WORLD_CONTEXT_CAPABILITY,
        ],
        async install(context) {
            if (!context.partition) { throw new Error('Tasks partition store is unavailable'); }
            const economy = context.useCapability(ECONOMY_READ_CAPABILITY);
            const store = context.partition as PartitionStore<TaskDomainV1>;
            const tasks = createTasksService(
                store,
                context.files,
                economy,
                {
                    ...dependencies.service,
                    getPlayerDisplayName: dependencies.getPlayerDisplayName,
                    getEvidenceDigest: dependencies.getEvidenceDigest,
                    getStoryLabel: dependencies.getStoryLabel,
                    userTransactions: dependencies.userTransactions?.() ?? undefined,
                },
            );
            try {
                const runtime = await dependencies.install({
                    ownerId: context.ownerId,
                    store,
                    tasks,
                    economy,
                    agent: context.useCapability(AGENT_CAPABILITY),
                    prompts: context.useCapability(PROMPT_INJECTION_CAPABILITY),
                    maintenance: context.useCapability(MAINTENANCE_CAPABILITY),
                    mapContext: context.useCapability(MAP_CONTEXT_CAPABILITY),
                    worldContext: context.useCapability(WORLD_CONTEXT_CAPABILITY),
                    execution: context.execution,
                });
                services.set(runtime, tasks);
                return runtime;
            } catch (error) {
                tasks.dispose();
                throw error;
            }
        },
        async dispose(runtime) {
            runtime.stopBackground?.();
            services.get(runtime)?.dispose();
            services.delete(runtime);
            await dependencies.dispose?.(runtime);
        },
    };
}
