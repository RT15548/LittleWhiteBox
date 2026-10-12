import type { XiaobaiOsChatIdentity } from '../../types.js';
import type { MainGenerationRuntime } from '../../host/main-generation-runtime.js';
import { createGameController } from './host/controller.js';
import { createGameModule } from './module.js';
import { withMovingRuntime } from './moving/host.js';
import { withBuildingRuntime } from './building/host.js';
import { withExpeditionRuntime } from './expedition/host.js';
import type { XiaobaiOsSettingsRepository } from '../../host/settings-repository.js';

export interface ProductionGameModuleDependencies {
    getChatIdentity: () => XiaobaiOsChatIdentity | null;
    mainGeneration: MainGenerationRuntime;
    settings: XiaobaiOsSettingsRepository;
}

export function createProductionGameModule(dependencies: ProductionGameModuleDependencies) {
    return createGameModule({
        service: { isMainGenerationActive: dependencies.mainGeneration.isActive },
        movingSoundEnabled: () => dependencies.settings.read()!.apps.game.movingSoundEnabled,
        buildingSoundEnabled: () => dependencies.settings.read()!.apps.game.buildingSoundEnabled,
        async install({ game, moving, building, expedition, economy, execution }) {
            return withExpeditionRuntime(withBuildingRuntime(withMovingRuntime(createGameController({
                game,
                economy,
                getChatIdentity: dependencies.getChatIdentity,
                isMainGenerationActive: dependencies.mainGeneration.isActive,
                subscribeGeneration: dependencies.mainGeneration.subscribe,
                execution,
            }), moving, () => dependencies.getChatIdentity()?.key ?? '', dependencies.settings),
            building, () => dependencies.getChatIdentity()?.key ?? '', dependencies.settings),
            expedition, () => dependencies.getChatIdentity()?.key ?? '');
        },
        async dispose(runtime) { await runtime.stopBackground?.(); },
    });
}
