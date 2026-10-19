import {
    ECONOMY_READ_CAPABILITY,
    ECONOMY_TRANSACTION_CAPABILITY,
    type EconomyReadCapability,
} from '../../capabilities/economy/index.js';
import type { AppInstallContext, XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import type { PartitionStore } from '../../kernel/contracts.js';
import type { GameDomainV1 } from '../../domains/game/types.js';
import type { XiaobaiOsAppRuntime } from '../../types.js';
import {
    createGameService,
    type GameService,
    type GameServiceDependencies,
} from './application/service.js';
import { GAME_APP_DESCRIPTOR } from './descriptor.js';
import { GAME_PARTITION } from './partition.js';
import { MOVING_PARTITION } from './moving/partition.js';
import { createMovingService, type MovingService } from './moving/service.js';
import { BUILDING_PARTITION } from './building/partition.js';
import { createBuildingService, type BuildingService } from './building/service.js';
import { EXPEDITION_PARTITION } from './expedition/partition.js';
import { createExpeditionService, type ExpeditionService } from './expedition/service.js';
import { AGENT_CAPABILITY } from '../../capabilities/agent/index.js';

export { GAME_PARTITION } from './partition.js';

export interface GameModuleInstallContext {
    ownerId: string;
    game: GameService;
    moving: MovingService;
    building: BuildingService;
    expedition: ExpeditionService;
    economy: EconomyReadCapability;
    execution: AppInstallContext['execution'];
}

export interface GameModuleDependencies {
    install(context: GameModuleInstallContext): Promise<XiaobaiOsAppRuntime>;
    dispose?(runtime: XiaobaiOsAppRuntime): Promise<void>;
    service?: GameServiceDependencies;
    movingSoundEnabled?: () => boolean;
    buildingSoundEnabled?: () => boolean;
}

export function createGameModule(dependencies: GameModuleDependencies): XiaobaiOsAppModule {
    return {
        descriptor: GAME_APP_DESCRIPTOR,
        partition: GAME_PARTITION,
        additionalPartitions: [MOVING_PARTITION, BUILDING_PARTITION, EXPEDITION_PARTITION],
        capabilities: [ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY, AGENT_CAPABILITY],
        install(context) {
            if (!context.partition) {throw new Error('Game partition store is unavailable');}
            const economy = context.useCapability(ECONOMY_READ_CAPABILITY);
            const game = createGameService(
                context.partition as PartitionStore<GameDomainV1>,
                context.files,
                economy,
                dependencies.service,
            );
            context.execution.addCleanup(game.dispose);
            const moving = createMovingService(context.storeFor(MOVING_PARTITION), context.filesFor(MOVING_PARTITION), economy,
                { idle: () => !dependencies.service?.isMainGenerationActive?.(), soundEnabled: dependencies.movingSoundEnabled });
            return dependencies.install({
                ownerId: context.ownerId,
                game,
                moving,
                building: createBuildingService(context.storeFor(BUILDING_PARTITION), context.filesFor(BUILDING_PARTITION), economy,
                    { idle: () => !dependencies.service?.isMainGenerationActive?.(), soundEnabled: dependencies.buildingSoundEnabled }),
                expedition: createExpeditionService(context.storeFor(EXPEDITION_PARTITION), context.filesFor(EXPEDITION_PARTITION), economy,
                    { idle: () => !dependencies.service?.isMainGenerationActive?.(), agent: context.useCapability(AGENT_CAPABILITY) }),
                economy,
                execution: context.execution,
            });
        },
        dispose: dependencies.dispose,
        // Chat cleanup must not reset user-level first-clear awards or paid admission.
        clearData: context => context.removePartition(GAME_PARTITION.key),
    };
}
