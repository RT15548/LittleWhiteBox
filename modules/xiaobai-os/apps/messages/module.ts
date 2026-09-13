import { AGENT_CAPABILITY, type AgentCapability } from '../../capabilities/agent/index.js';
import type { XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import type { ScopedChatStore } from '../../kernel/contracts.js';
import type { XiaobaiOsAppRuntime } from '../../types.js';
import type { MessagesDomainV2 } from '../../domains/messages/types.js';
import { createMessagesService, type MessagesService } from './application/service.js';
import { MESSAGES_PARTITION } from './partition.js';
import { MESSAGES_APP_DESCRIPTOR } from './descriptor.js';

export function createMessagesModule(install: (service: MessagesService, agent: AgentCapability) => Promise<XiaobaiOsAppRuntime>): XiaobaiOsAppModule {
    return {
        descriptor: MESSAGES_APP_DESCRIPTOR, partition: MESSAGES_PARTITION, capabilities: [AGENT_CAPABILITY],
        install(context) {
            if (!context.partition) {throw new Error('Messages partition unavailable');}
            return install(createMessagesService(context.partition as ScopedChatStore<MessagesDomainV2>, context.files), context.useCapability(AGENT_CAPABILITY));
        },
        async dispose(runtime) {await runtime.stopBackground?.();},
        clearData: context => context.removePartition(MESSAGES_PARTITION.key),
    };
}
