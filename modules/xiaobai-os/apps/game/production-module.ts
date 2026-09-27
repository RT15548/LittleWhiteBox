import type { XiaobaiOsChatIdentity } from '../../types.js';
import type { MainGenerationRuntime } from '../../host/main-generation-runtime.js';
import { createGameController } from './host/controller.js';
import { createGameModule } from './module.js';
import { withMovingRuntime } from './moving/host.js';

export interface ProductionGameModuleDependencies {
    getChatIdentity: () => XiaobaiOsChatIdentity | null;
    mainGeneration: MainGenerationRuntime;
}

export function createProductionGameModule(dependencies: ProductionGameModuleDependencies) {
    return createGameModule({
        service: { isMainGenerationActive: dependencies.mainGeneration.isActive },
        async install({ game, moving, economy, execution }) {
            return withMovingRuntime(createGameController({
                game,
                economy,
                getChatIdentity: dependencies.getChatIdentity,
                isMainGenerationActive: dependencies.mainGeneration.isActive,
                subscribeGeneration: dependencies.mainGeneration.subscribe,
                execution,
            }), moving, () => dependencies.getChatIdentity()?.key ?? '');
        },
        async dispose(runtime) { await runtime.stopBackground?.(); },
    });
}
