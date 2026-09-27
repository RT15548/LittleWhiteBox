import { normalizeAgentSettings } from '../../../agent-core/config.js';
import { resolveActiveProviderConfig } from '../../../agent-core/provider-resolution.js';
import { createAppRuntimeGroup } from '../../kernel/runtime-group.js';
import { createWorldModule } from './module.js';
import { WORLD_PROMPTS } from './prompt-registration.js';
import { createWorldManagement } from './management/participant.js';
import { createWorldService } from './application/service.js';
import type { PartitionStore } from '../../kernel/contracts.js';
import type { WorldDomain } from '../../domains/world/types.js';
import type { XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import { MANAGEMENT_CAPABILITY } from '../../capabilities/management/index.js';
import { createWorldController } from './host/controller.js';
import { createWorldMaintenanceParticipant } from './host/maintenance-participant.js';
import { createWorldPromptRuntime, type WorldPromptEventHandlers } from './host/prompt-runtime.js';
import type { XiaobaiOsSettingsRepository } from '../../host/settings-repository.js';

export function createProductionWorldModule(dependencies: {
    settings: XiaobaiOsSettingsRepository;
    getChatIdentity(): string;
    subscribePrompt(handlers: WorldPromptEventHandlers): () => void;
}): XiaobaiOsAppModule {
    const module = createWorldModule({
        settings: dependencies.settings,
        getChatIdentity: dependencies.getChatIdentity,
        install({ world, maintenance, agent, prompts, execution }) {
            const injection = prompts.register(WORLD_PROMPTS);
            execution.addCleanup(injection.dispose);
            const unregister = maintenance.registerParticipant(createWorldMaintenanceParticipant(world, () => dependencies.settings.read()!.apps.world));
            execution.addCleanup(unregister);
            const controller = createWorldController({ world, settings: dependencies.settings, maintenance: maintenance.runner,
                getChatIdentity: dependencies.getChatIdentity,
                async checkAgent() {
                    const config = resolveActiveProviderConfig(normalizeAgentSettings(await agent.loadConfig()));
                    return !!String(config.model || '').trim();
                },
            });
            const prompt = createWorldPromptRuntime({ world, settings: dependencies.settings, getChatIdentity: dependencies.getChatIdentity,
                setPrompt: value => injection.set('context', value), subscribe: dependencies.subscribePrompt });
            return createAppRuntimeGroup(controller, [prompt]);
        },
    });
    return { ...module, register(context) {
        const registry = context.useCapability(MANAGEMENT_CAPABILITY);
        const world = createWorldService(context.partition as PartitionStore<WorldDomain>, context.files, dependencies.getChatIdentity);
        try {
            const unregister = registry.register(createWorldManagement(world));
            return () => { unregister(); world.dispose(); };
        } catch (error) { world.dispose(); throw error; }
    } };
}
