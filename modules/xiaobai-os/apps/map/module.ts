import type { AppInstallContext, XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import type { PartitionStore } from '../../kernel/contracts.js';
import type { XiaobaiOsAppRuntime } from '../../types.js';
import { AGENT_CAPABILITY, type AgentCapability } from '../../capabilities/agent/index.js';
import { PROMPT_INJECTION_CAPABILITY, type PromptInjectionCapability } from '../../capabilities/prompt-injection/index.js';
import { MANAGEMENT_CAPABILITY, type ManagementRegistry } from '../../capabilities/management/index.js';
import {
    MAINTENANCE_CAPABILITY,
    type MaintenanceCapability,
} from '../../capabilities/maintenance/index.js';
import type { MapDomainV1 } from '../../domains/map/types.js';
import { createMapService, type MapService } from './application/service.js';
import { MAP_CONTEXT_CAPABILITY, type MapContextCapability } from './context-capability.js';
import { buildMapPromptBlock } from '../../domains/map/projection.js';
import { MAP_APP_DESCRIPTOR } from './descriptor.js';
import { MAP_PARTITION } from './partition.js';

export { MAP_PARTITION } from './partition.js';

export interface MapModuleInstallContext {
    ownerId: string;
    map: MapService;
    agent: AgentCapability;
    prompts: PromptInjectionCapability;
    maintenance: MaintenanceCapability;
    management: ManagementRegistry;
    mapContext: MapContextCapability;
    execution: AppInstallContext['execution'];
}

export interface MapModuleDependencies {
    install(context: MapModuleInstallContext): Promise<XiaobaiOsAppRuntime>;
    dispose?(runtime: XiaobaiOsAppRuntime): Promise<void>;
}

export function createMapModule(dependencies: MapModuleDependencies): XiaobaiOsAppModule {
    return {
        descriptor: MAP_APP_DESCRIPTOR,
        partition: MAP_PARTITION,
        capabilities: [AGENT_CAPABILITY, MAINTENANCE_CAPABILITY, MANAGEMENT_CAPABILITY, MAP_CONTEXT_CAPABILITY, PROMPT_INJECTION_CAPABILITY],
        install(context) {
            if (!context.partition) { throw new Error('Map partition store is unavailable'); }
            const map = createMapService(
                context.partition as PartitionStore<MapDomainV1>,
                context.files,
            );
            context.execution.addCleanup(map.dispose);
            const mapContext = context.useCapability(MAP_CONTEXT_CAPABILITY);
            context.execution.addCleanup(mapContext.registerProvider(() => {
                const current = map.readCurrent().map;
                return current ? buildMapPromptBlock(current) : '';
            }));
            return dependencies.install({
                ownerId: context.ownerId,
                map,
                agent: context.useCapability(AGENT_CAPABILITY),
                prompts: context.useCapability(PROMPT_INJECTION_CAPABILITY),
                maintenance: context.useCapability(MAINTENANCE_CAPABILITY),
                management: context.useCapability(MANAGEMENT_CAPABILITY),
                mapContext,
                execution: context.execution,
            });
        },
        dispose: dependencies.dispose,
        clearData: context => context.removePartition(MAP_PARTITION.key),
    };
}
