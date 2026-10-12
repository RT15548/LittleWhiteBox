import { AGENT_CAPABILITY } from '../../capabilities/agent/index.js';
import { ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY } from '../../capabilities/economy/index.js';
import type { XiaobaiOsAppModule } from '../../kernel/app-registry.js';
import type { PartitionStore } from '../../kernel/contracts.js';
import { LEARNING_APP_DESCRIPTOR } from './descriptor.js';
import { createLearningRuntime } from './host/runtime.js';
import { LEARNING_PARTITION, type LearningStoredCompanions } from './partition.js';
import { LEARNING_REWARDS_PARTITION } from './reward-partition.js';
import { LEARNING_WORKBENCH_PARTITION } from './workbench-partition.js';

export function createLearningModule(deps: Omit<Parameters<typeof createLearningRuntime>[0], 'store' | 'files' | 'workbenchStore' | 'workbenchFiles' | 'rewardStore' | 'rewardFiles' | 'agent' | 'economy' | 'execution'>): XiaobaiOsAppModule {
    return {
        descriptor: LEARNING_APP_DESCRIPTOR, partition: LEARNING_PARTITION,
        additionalPartitions: [LEARNING_REWARDS_PARTITION, LEARNING_WORKBENCH_PARTITION],
        capabilities: [AGENT_CAPABILITY, ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY],
        async install(context) {
            if (!context.partition) { throw new Error('Learning partition unavailable'); }
            const rewardStore = context.storeFor(LEARNING_REWARDS_PARTITION);
            await rewardStore.read();
            const workbenchStore = context.storeFor(LEARNING_WORKBENCH_PARTITION);
            await workbenchStore.read();
            return createLearningRuntime({ ...deps, store: context.partition as PartitionStore<LearningStoredCompanions>,
                workbenchStore, workbenchFiles: context.filesFor(LEARNING_WORKBENCH_PARTITION),
                rewardStore, rewardFiles: context.filesFor(LEARNING_REWARDS_PARTITION),
                files: context.files, execution: context.execution,
                agent: context.useCapability(AGENT_CAPABILITY), economy: context.useCapability(ECONOMY_READ_CAPABILITY) });
        },
        // Chat deletion retires private companion history; user-level study history has its own clear action.
        clearData: context => context.removePartition(LEARNING_PARTITION.key),
    };
}
