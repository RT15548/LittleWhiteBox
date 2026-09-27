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

export { GAME_PARTITION } from './partition.js';

export interface GameModuleInstallContext {
    ownerId: string;
    game: GameService;
    moving: MovingService;
    economy: EconomyReadCapability;
    execution: AppInstallContext['execution'];
}

export interface GameModuleDependencies {
    install(context: GameModuleInstallContext): Promise<XiaobaiOsAppRuntime>;
    dispose?(runtime: XiaobaiOsAppRuntime): Promise<void>;
    service?: GameServiceDependencies;
    movingSoundEnabled?: () => boolean;
}

export function createGameModule(dependencies: GameModuleDependencies): XiaobaiOsAppModule {
    return {
        descriptor: GAME_APP_DESCRIPTOR,
        partition: GAME_PARTITION,
        additionalPartitions: [MOVING_PARTITION],
        capabilities: [ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY],
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
                economy,
                execution: context.execution,
            });
        },
        dispose: dependencies.dispose,
        // Chat cleanup must not reset user-level first-clear awards or paid admission.
        clearData: context => context.removePartition(GAME_PARTITION.key),
    };
}
