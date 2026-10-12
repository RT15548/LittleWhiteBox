import type { XiaobaiOsSettingsRepository } from '../../host/settings-repository.js';
import type { MainGenerationRuntime } from '../../host/main-generation-runtime.js';
import type { XiaobaiOsChatIdentity } from '../../types.js';
import { createAppRuntimeGroup } from '../../kernel/runtime-group.js';
import { createMapController } from './host/controller.js';
import { createMapMaintenanceParticipant } from './host/maintenance-participant.js';
import { createMapPromptRuntime, type MapPromptEventHandlers } from './host/prompt-runtime.js';
import { createMapSettingsRuntime } from './host/settings-runtime.js';
import type { createMapProjectionRuntime, MapProjectionReplyPause } from './host/projection-runtime.js';
import { createMapModule } from './module.js';
import { MAP_PROMPTS } from './prompt-registration.js';
import { createMapManagement } from './management/participant.js';
import { createMapService } from './application/service.js';
import type { PartitionStore } from '../../kernel/contracts.js';
import type { MapDomainV1 } from '../../domains/map/types.js';
import type { XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import { MANAGEMENT_CAPABILITY } from '../../capabilities/management/index.js';

export interface ProductionMapModuleDependencies {
    settings: XiaobaiOsSettingsRepository;
    mainGeneration: MainGenerationRuntime;
    replyPause?: MapProjectionReplyPause;
    getChatIdentity: () => XiaobaiOsChatIdentity | null;
    getPlayerDisplayName: () => string;
    subscribePrompt(handlers: MapPromptEventHandlers): () => void;
    createProjectionRuntime: typeof createMapProjectionRuntime;
}

export function createProductionMapModule(dependencies: ProductionMapModuleDependencies): XiaobaiOsAppModule {
    const module = createMapModule({
        async install({ map, maintenance, prompts, execution }) {
            const injection = prompts.register(MAP_PROMPTS);
            execution.addCleanup(injection.dispose);
            const unregisterParticipant = maintenance.registerParticipant(createMapMaintenanceParticipant({
                map,
                readSettings: () => dependencies.settings.read()?.apps.map ?? null,
            }));
            execution.addCleanup(unregisterParticipant);
            const controller = createMapController({
                map,
                settings: dependencies.settings,
                maintenance: maintenance.runner,
                getChatIdentity: dependencies.getChatIdentity,
                subscribeData: map.subscribe,
            });
            const prompt = createMapPromptRuntime({
                readCurrentMap: () => map.readCurrent().map,
                setPrompt: value => injection.set('context', value),
                subscribe: dependencies.subscribePrompt,
            });
            const settings = createMapSettingsRuntime({
                settings: dependencies.settings,
                maintenance: maintenance.runner,
            });
            const projection = dependencies.createProjectionRuntime(map, dependencies.settings, maintenance.runner, controller.readState, dependencies.mainGeneration, dependencies.replyPause);
            return createAppRuntimeGroup(controller, [prompt, settings, projection]);
        },
        async dispose(runtime) { await runtime.stopBackground?.(); },
    });
    return { ...module, register(context) {
        const registry = context.useCapability(MANAGEMENT_CAPABILITY);
        const map = createMapService(context.partition as PartitionStore<MapDomainV1>, context.files);
        try {
            const unregister = registry.register(createMapManagement(map, () => ({ actorKey: 'player', displayName: dependencies.getPlayerDisplayName() })));
            return () => { unregister(); map.dispose(); };
        } catch (error) { map.dispose(); throw error; }
    } };
}
