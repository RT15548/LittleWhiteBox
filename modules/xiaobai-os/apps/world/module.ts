import { AGENT_CAPABILITY, type AgentCapability } from '../../capabilities/agent/index.js';
import { MAINTENANCE_CAPABILITY, type MaintenanceCapability } from '../../capabilities/maintenance/index.js';
import type { AppInstallContext, XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import type { ScopedChatStore } from '../../kernel/contracts.js';
import type { WorldDomain } from '../../domains/world/types.js';
import type { XiaobaiOsSettingsRepository } from '../../host/settings-repository.js';
import { worldContent } from '../../domains/world/projection.js';
import type { XiaobaiOsAppRuntime } from '../../types.js';
import { createWorldService, type WorldService } from './application/service.js';
import { WORLD_APP_DESCRIPTOR } from './descriptor.js';
import { WORLD_PARTITION } from './partition.js';
import { WORLD_CONTEXT_CAPABILITY } from './context-capability.js';

export function createWorldModule(dependencies: {
    settings: XiaobaiOsSettingsRepository;
    getChatIdentity(): string;
    install(context: { world: WorldService; maintenance: MaintenanceCapability; agent: AgentCapability; execution: AppInstallContext['execution'] }): XiaobaiOsAppRuntime;
}): XiaobaiOsAppModule {
    return {
        descriptor: WORLD_APP_DESCRIPTOR,
        partition: WORLD_PARTITION,
        capabilities: [AGENT_CAPABILITY, MAINTENANCE_CAPABILITY, WORLD_CONTEXT_CAPABILITY],
        async install(context) {
            if (!context.partition) { throw new Error('World partition unavailable'); }
            const world = createWorldService(context.partition as ScopedChatStore<WorldDomain>, context.files, dependencies.getChatIdentity);
            context.execution.addCleanup(world.dispose);
            context.execution.addCleanup(context.useCapability(WORLD_CONTEXT_CAPABILITY).registerProvider({
                readCurrent(chatIdentity) {
                    const current = world.readCurrent();
                    return !!chatIdentity && current.chatIdentity === chatIdentity && (current.world.overview || current.world.news.length)
                        ? worldContent(current.world) : null;
                },
                isStoryBackgroundEnabled(identityKey) {
                    const snapshot = (context.partition as ScopedChatStore<WorldDomain>).peekCurrent();
                    return snapshot?.identityKey === identityKey && dependencies.settings.read()!.apps.world.injectToStory;
                },
            }));
            return dependencies.install({ world, execution: context.execution, maintenance: context.useCapability(MAINTENANCE_CAPABILITY),
                agent: context.useCapability(AGENT_CAPABILITY) });
        },
        async dispose(runtime) { await runtime.stopBackground?.(); },
        clearData: context => context.removePartition(WORLD_PARTITION.key),
    };
}
