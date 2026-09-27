import { createEconomyCapabilityRegistrations, ECONOMY_PARTITION, ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY } from '../capabilities/economy/index.js';
import { createCapabilityRegistry } from '../kernel/capability-registry.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createUserTransactions } from '../kernel/user-transactions.js';
import { DICE_PARTITION } from '../apps/dice/partition.js';
import { LEARNING_REWARDS_PARTITION } from '../apps/learning/reward-partition.js';
import { BANK_PARTITION } from '../apps/bank/partition.js';
import { GAME_PARTITION } from '../apps/game/partition.js';
import { SHOP_PARTITION } from '../apps/shop/partition.js';
import { TASKS_PARTITION } from '../apps/tasks/partition.js';
import { USER_DOCUMENT_FILENAME } from '../kernel/user-document.js';
import { MOVING_PARTITION } from '../apps/game/moving/partition.js';

export async function userEconomyHarness({ files = new Map(), initialPartitions, resolveStory, references: suppliedReferences } = {}) {
    let serial = 0;
    const state = { files, mode: 'confirmed', writes: [], capture: null, referencesCreated: 0 };
    function switchStory(id, referenced = true) {
        state.capture = id === null ? null : { identityKey: `chat-${id}`, binding: { kind: 'character', ownerLocator: 'avatar.png', chatId: `chat-${id}` },
            reference: referenced ? { formatVersion: 1, osId: id } : null };
    }
    switchStory('a');
    const references = suppliedReferences ?? {
        capture: () => structuredClone(state.capture),
        isCurrent: requested => requested.identityKey === state.capture?.identityKey
            && requested.reference?.osId === state.capture?.reference?.osId,
    };
    const storage = {
        read: async name => structuredClone(files.get(name) ?? null),
        async replace(name, candidate) {
            state.writes.push(structuredClone(candidate));
            if (state.mode === 'rejected') { throw Object.assign(new Error('rejected'), { httpStatus: 403 }); }
            if (state.mode !== 'unknown') { files.set(name, structuredClone(candidate)); }
            if (state.mode !== 'confirmed') { throw new Error('connection lost'); }
        },
    };
    const partitions = new XiaobaiOsPartitionRegistry();
    for (const registration of [ECONOMY_PARTITION, DICE_PARTITION, LEARNING_REWARDS_PARTITION, BANK_PARTITION, GAME_PARTITION, MOVING_PARTITION, SHOP_PARTITION, TASKS_PARTITION]) { partitions.register(registration); }
    const capabilities = createCapabilityRegistry(createEconomyCapabilityRegistrations());
    const transactions = createUserTransactions({ storage, partitions, references, binder: capabilities,
        createId: () => `commit-${++serial}-${Date.now()}`,
        initialPartitions: initialPartitions ?? (async () => ({ economy: ECONOMY_PARTITION.createInitial(), dice: DICE_PARTITION.createInitial(), 'learning-rewards': LEARNING_REWARDS_PARTITION.createInitial() })),
        resolveStory: resolveStory ?? (async write => {
            if (!state.capture) { throw new Error('chat unavailable'); }
            if (write && !state.capture.reference) { state.referencesCreated++; state.capture.reference = { formatVersion: 1, osId: 'new-story' }; }
            return references.capture();
        }),
    });
    await capabilities.install({ createStore: (registration, allowed) => transactions.createStore(registration, allowed), files: transactions });
    const economy = capabilities.require(ECONOMY_READ_CAPABILITY);
    return { state, switchStory, storage, transactions, economy, references,
        document: () => files.get(USER_DOCUMENT_FILENAME),
        store: registration => transactions.createStore(registration, [ECONOMY_TRANSACTION_CAPABILITY]),
    };
}
