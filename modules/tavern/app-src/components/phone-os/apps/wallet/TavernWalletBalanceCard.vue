<script setup lang="ts">
import { computed } from 'vue';
import { formatTavernWalletCoins } from '../../../../features/phone-os/apps/wallet/tavern-wallet-format';

const props = defineProps<{
    balance: number;
    error: string;
    loading: boolean;
    ready: boolean;
}>();

const balanceLabel = computed(() => {
    if (props.loading && !props.ready) {return '···';}
    if (!props.ready) {return '—';}
    return formatTavernWalletCoins(props.balance);
});
</script>

<template>
  <section class="tavern-wallet-balance-card">
    <span
      class="tavern-wallet-card-orbit"
      aria-hidden="true"
    />
    <div class="tavern-wallet-card-heading">
      <span class="tavern-wallet-card-seal">◈</span>
      <span>本段旅程</span>
    </div>
    <div class="tavern-wallet-card-balance">
      <strong :class="{ 'is-loading': loading }">{{ balanceLabel }}</strong>
      <span>小白币</span>
    </div>
    <p :class="{ 'is-error': !!error && !ready }">
      {{ error && !ready ? error : '剧情中的每一次收入与支出，都会在这里留下不可改写的账目。' }}
    </p>
  </section>
</template>
