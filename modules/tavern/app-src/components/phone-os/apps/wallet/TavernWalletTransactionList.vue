<script setup lang="ts">
import type { TavernEconomyTransactionRecord } from '../../../../../shared/economy/economy-types';
import TavernWalletTransactionRow from './TavernWalletTransactionRow.vue';

defineProps<{
    transactions: TavernEconomyTransactionRecord[];
    initialLoading: boolean;
    loadingMore: boolean;
    loadMoreError: string;
    hasMore: boolean;
}>();

const emit = defineEmits<{
    (event: 'load-more'): void;
}>();
</script>

<template>
  <div class="tavern-wallet-transaction-list">
    <div
      v-if="initialLoading"
      class="tavern-wallet-ledger-loading"
      aria-label="正在读取钱包流水"
    >
      <span
        v-for="index in 3"
        :key="index"
      />
    </div>
    <template v-else-if="transactions.length">
      <TavernWalletTransactionRow
        v-for="transaction in transactions"
        :key="transaction.id"
        :transaction="transaction"
      />
      <div
        v-if="loadMoreError"
        class="tavern-wallet-load-more-error"
        role="status"
      >
        <p>{{ loadMoreError }}</p>
        <button
          type="button"
          :disabled="loadingMore"
          @click="emit('load-more')"
        >
          {{ loadingMore ? '正在重试…' : '重试载入' }}
        </button>
      </div>
      <button
        v-else-if="hasMore"
        type="button"
        class="tavern-wallet-load-more"
        :disabled="loadingMore"
        @click="emit('load-more')"
      >
        {{ loadingMore ? '正在翻阅…' : '载入更早流水' }}
      </button>
      <p
        v-else
        class="tavern-wallet-ledger-end"
      >
        已经翻到这本账簿的第一页
      </p>
    </template>
    <div
      v-else
      class="tavern-wallet-empty-state"
    >
      <span aria-hidden="true">◈</span>
      <strong>账簿还是空的</strong>
      <p>第一笔小白币交易发生后，会安静地记在这里。</p>
    </div>
  </div>
</template>
