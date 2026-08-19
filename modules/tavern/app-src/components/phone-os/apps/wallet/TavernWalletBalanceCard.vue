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
const balanceSizeClass = computed(() => {
    const digitCount = balanceLabel.value.replace(/\D/g, '').length;
    if (digitCount > 11) {return 'is-extra-compact';}
    if (digitCount > 8) {return 'is-compact';}
    return '';
});
</script>

<template>
  <section class="tavern-wallet-balance-card">
    <span>可用余额</span>
    <div class="tavern-wallet-card-balance">
      <strong
        :class="[{ 'is-loading': loading }, balanceSizeClass]"
        :title="ready ? `${balanceLabel} 小白币` : undefined"
      >{{ balanceLabel }}</strong>
      <span>小白币</span>
    </div>
    <p
      v-if="error && !ready"
      class="is-error"
    >
      {{ error }}
    </p>
  </section>
</template>
