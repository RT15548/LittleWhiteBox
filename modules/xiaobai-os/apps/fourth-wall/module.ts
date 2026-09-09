import { AGENT_CAPABILITY, type AgentCapability } from '../../capabilities/agent/index.js';
import type { AppInstallContext, XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import type { ScopedChatStore } from '../../kernel/contracts.js';
import type { XiaobaiOsAppRuntime } from '../../types.js';
import { FOURTH_WALL_APP_DESCRIPTOR } from './descriptor.js';
import {
    createFourthWallRepository,
    type FourthWallChatRepository,
    type FourthWallUpgradeSource,
} from './host/repository.js';
import { FOURTH_WALL_PARTITION, type FourthWallStoredPartition } from './partition.js';

export interface FourthWallModuleInstallContext {
    ownerId: string;
    repository: FourthWallChatRepository;
    agent: AgentCapability;
    execution: AppInstallContext['execution'];
}

export interface FourthWallModuleDependencies {
    upgradeSource?: FourthWallUpgradeSource;
    install(context: FourthWallModuleInstallContext): Promise<XiaobaiOsAppRuntime>;
    dispose?(runtime: XiaobaiOsAppRuntime): Promise<void>;
}

export function createFourthWallModule(dependencies: FourthWallModuleDependencies): XiaobaiOsAppModule {
    return {
        descriptor: FOURTH_WALL_APP_DESCRIPTOR,
        partition: FOURTH_WALL_PARTITION,
        capabilities: [AGENT_CAPABILITY],
        install(context) {
            if (!context.partition) { throw new Error('Fourth Wall partition store is unavailable'); }
            const repository = createFourthWallRepository(
                context.partition as ScopedChatStore<FourthWallStoredPartition>,
                { upgradeSource: dependencies.upgradeSource },
            );
            return dependencies.install({
                ownerId: context.ownerId,
                repository,
                agent: context.useCapability(AGENT_CAPABILITY),
                execution: context.execution,
            });
        },
        dispose: dependencies.dispose,
        clearData: context => context.removePartition(FOURTH_WALL_PARTITION.key),
    };
}
