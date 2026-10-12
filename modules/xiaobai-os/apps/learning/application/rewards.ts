import { ECONOMY_TRANSACTION_CAPABILITY, type EconomyReadCapability } from '../../../capabilities/economy/index.js';
import { learningRewardInput, matchesLearningReward } from '../../../domains/learning/reward.js';
import type { LearningRewardPolicy } from '../reward-partition.js';
import type { LearningCompletion } from '../../../domains/learning/types.js';
import type { PartitionStore, XiaobaiOsFileControls } from '../../../kernel/contracts.js';
import { confirmedLearning, type LearningRepository } from './service.js';

export type LearningRewardStatus = 'paid' | 'retired' | 'wallet-closed' | 'unconfirmed' | 'conflict' | 'failed' | 'cancelled';

/** Completion, ledger, receipt: three confirmations; neither store pretends to own both files. */
export function createLearningRewards(deps: {
    repository: LearningRepository; store: PartitionStore<LearningRewardPolicy>;
    economy: EconomyReadCapability; files: XiaobaiOsFileControls;
}) {
    let queue: Promise<LearningRewardStatus | void> = Promise.resolve();
    async function settleNow(language: string, unitId: string, openWallet: boolean, isCurrent: () => boolean): Promise<LearningRewardStatus> {
        try {
            await deps.repository.read();
            const snapshot = deps.repository.snapshot();
            if (snapshot.status !== 'ready') { return snapshot.status === 'conflict' ? 'conflict' : 'unconfirmed'; }
            const completion = snapshot.document?.data.profiles.find(profile => profile.language === language)?.completions.find(item => item.unitId === unitId);
            if (!completion || !isCurrent()) { return 'cancelled'; }
            const initial = await deps.store.read();
            if (!isCurrent()) { return 'cancelled'; }
            if (initial.value?.retiredUnitIds.includes(completion.unitId)) { return 'retired'; }
            if (completion.receipt) { return 'paid'; }
            const sameCompletion = () => {
                const current = deps.repository.snapshot();
                return current.status === 'ready' && JSON.stringify(current.document?.data.profiles.find(profile => profile.language === language)
                    ?.completions.find(item => item.unitId === unitId)) === JSON.stringify(completion);
            };
            const guard = () => isCurrent() && sameCompletion();
            if (deps.files.hasPendingCommit()) { return 'unconfirmed'; }
            await deps.economy.refresh();
            if (!guard()) { return 'cancelled'; }
            if (!deps.economy.isOpen()) {
                if (!openWallet) { return 'wallet-closed'; }
                // The scoped transaction guard prevents account opening after a queued chat switch.
                // ensureOpen is invoked only by the explicit user action, never on view/activation.
                await deps.economy.ensureOpen(guard);
                if (!guard()) { return 'cancelled'; }
            }
            const result = await deps.store.transact(transaction => {
                if (!guard()) { throw new Error('learning_reward_cancelled'); }
                const economy = transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
                const input = learningRewardInput(completion);
                const existing = economy.listOwnedTransactions().find(item => item.idempotencyKey === input.idempotencyKey);
                if (existing) {
                    if (!matchesLearningReward(existing, completion)) { throw new Error('learning_reward_mismatch'); }
                    return existing;
                }
                const { sourceDomain: _source, sourceScope: _scope, ...leg } = input;
                return economy.postAction({ legs: [leg] }).transactions[0];
            }, { commitGuard: guard });
            if (!guard()) { return 'cancelled'; }
            if (result.status !== 'confirmed' && result.status !== 'unchanged') { return result.status; }
            const transaction = result.result;
            if (!transaction || !matchesLearningReward(transaction, completion)) { return 'failed'; }
            const expected = confirmedLearning(deps.repository);
            const data = structuredClone(expected!.data);
            const saved = data.profiles.find(profile => profile.language === language)!.completions.find(item => item.unitId === unitId)!;
            saved.receipt = { transactionId: transaction.id, receivedAt: transaction.createdAt };
            const receipt = await deps.repository.save(expected, data, guard);
            return receipt.status === 'confirmed' || receipt.status === 'unchanged' ? 'paid' : receipt.status;
        } catch { return isCurrent() ? 'failed' : 'cancelled'; }
    }
    return {
        settle(language: string, unitId: string, openWallet: boolean, isCurrent: () => boolean) {
            const result = queue.then(() => settleNow(language, unitId, openWallet, isCurrent));
            queue = result;
            return result;
        },
        status(completion: LearningCompletion): LearningRewardStatus | 'available' {
            if (deps.store.peekCurrent()?.value?.retiredUnitIds.includes(completion.unitId)) { return 'retired'; }
            if (completion.receipt) { return 'paid'; }
            if (!deps.economy.isOpen()) { return 'wallet-closed'; }
            return 'available';
        },
    };
}
