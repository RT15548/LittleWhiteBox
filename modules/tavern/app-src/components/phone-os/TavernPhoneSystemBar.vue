<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    isHome: boolean;
    walletBalance: number;
    walletLoading: boolean;
    walletReady: boolean;
}>();

const emit = defineEmits<{
    (event: 'wallet'): void;
}>();

const walletBalanceLabel = computed(() => {
    if (props.walletLoading && !props.walletReady) {return '···';}
    if (!props.walletReady) {return '—';}
    return props.walletBalance.toLocaleString('zh-CN');
});
</script>

<template>
  <header
    class="tavern-phone-systembar"
    :class="{ 'is-home': isHome }"
  >
    <button
      type="button"
      class="tavern-phone-wallet-status"
      :aria-label="walletReady ? `钱包余额 ${walletBalanceLabel} 小白币` : '打开钱包'"
      title="打开钱包"
      @click="emit('wallet')"
    >
      <span aria-hidden="true">◈</span>
      <strong>{{ walletBalanceLabel }}</strong>
    </button>
    <span
      class="tavern-phone-system-icons"
      aria-hidden="true"
    >
      <i class="tavern-phone-signal"><b /><b /><b /><b /></i>
      <i class="tavern-phone-battery"><b /></i>
    </span>
  </header>
</template>
