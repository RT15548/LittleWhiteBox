import { normalizeAgentSettings } from '../../../agent-core/config.js';
import { isSillyTavernProvider, resolveActiveProviderConfig } from '../../../agent-core/provider-resolution.js';
import { createAppRuntimeGroup } from '../../kernel/runtime-group.js';
import { createWorldModule } from './module.js';
import { createWorldController } from './host/controller.js';
import { createWorldMaintenanceParticipant } from './host/maintenance-participant.js';
import { createWorldPromptRuntime, type WorldPromptEventHandlers } from './host/prompt-runtime.js';
import type { XiaobaiOsSettingsRepository } from '../../host/settings-repository.js';

export function createProductionWorldModule(dependencies: {
    settings: XiaobaiOsSettingsRepository;
    getChatIdentity(): string;
    setPrompt(value: string): void;
    subscribePrompt(handlers: WorldPromptEventHandlers): () => void;
}) {
    return createWorldModule({
        settings: dependencies.settings,
        getChatIdentity: dependencies.getChatIdentity,
        install({ world, maintenance, agent, execution }) {
            const unregister = maintenance.registerParticipant(createWorldMaintenanceParticipant(world, () => dependencies.settings.read()!.apps.world));
            execution.addCleanup(unregister);
            const controller = createWorldController({ world, settings: dependencies.settings, maintenance: maintenance.runner,
                getChatIdentity: dependencies.getChatIdentity,
                async checkAgent() {
                    const config = resolveActiveProviderConfig(normalizeAgentSettings(await agent.loadConfig()));
                    return !!String(config.model || '').trim()
                        && (isSillyTavernProvider(config.provider) || !!String(config.apiKey || '').trim());
                },
            });
            const prompt = createWorldPromptRuntime({ world, settings: dependencies.settings, getChatIdentity: dependencies.getChatIdentity,
                setPrompt: dependencies.setPrompt, subscribe: dependencies.subscribePrompt });
            return createAppRuntimeGroup(controller, [prompt]);
        },
    });
}
