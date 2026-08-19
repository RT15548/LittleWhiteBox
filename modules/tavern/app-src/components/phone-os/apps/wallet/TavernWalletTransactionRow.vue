<script setup lang="ts">
import { computed } from 'vue';
import type { TavernEconomyTransactionRecord } from '../../../../../shared/economy/economy-types';
import {
    formatTavernWalletCoins,
    formatTavernWalletTransactionAmount,
    formatTavernWalletTransactionAnchor,
    tavernWalletTransactionDirection,
} from '../../../../features/phone-os/apps/wallet/tavern-wallet-format';

const props = defineProps<{
    transaction: TavernEconomyTransactionRecord;
}>();

const direction = computed(() => tavernWalletTransactionDirection(props.transaction));
const amount = computed(() => formatTavernWalletTransactionAmount(props.transaction));
const anchor = computed(() => formatTavernWalletTransactionAnchor(props.transaction));
const balanceAfter = computed(() => formatTavernWalletCoins(props.transaction.playerBalanceAfter));
</script>

<template>
  <article
    class="tavern-wallet-transaction-row"
    :class="`is-${direction}`"
  >
    <span
      class="tavern-wallet-transaction-mark"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24">
        <path
          v-if="direction === 'income'"
          d="M12 4v13m0 0-5-5m5 5 5-5"
        />
        <path
          v-else-if="direction === 'expense'"
          d="M12 20V7m0 0-5 5m5-5 5 5"
        />
        <path
          v-else
          d="M5 8h13m0 0-4-4m4 4-4 4M19 16H6m0 0 4-4m-4 4 4 4"
        />
      </svg>
    </span>
    <span class="tavern-wallet-transaction-copy">
      <strong>{{ transaction.title }}</strong>
      <small>{{ anchor }}</small>
    </span>
    <span class="tavern-wallet-transaction-value">
      <strong>{{ amount }}</strong>
      <small>余额 {{ balanceAfter }}</small>
    </span>
  </article>
</template>
