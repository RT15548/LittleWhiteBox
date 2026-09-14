<script setup lang="ts">
import { computed } from 'vue';
import type { WalletStatus } from '../types.js';
import WalletIcon from './WalletIcon.vue';
const props = defineProps<{ balance: number; currency: string; status: WalletStatus }>();
const statusLabel = computed(() => ({
    ready: '正常', loading: '正在准备', saving: '正在保存',
    unconfirmed: '需要检查保存', conflict: '账本有变化', blocked: '暂时不可用',
})[props.status]);
</script>
<template>
    <section class="wallet-pocket" aria-labelledby="wallet-balance-title">
        <div class="wallet-pocket-cards" aria-hidden="true"><span /><span /></div>
        <div class="wallet-balance">
            <header><span id="wallet-balance-title">可用余额</span><span class="wallet-balance-chip"><i :class="`is-${status}`" />{{ statusLabel }}</span></header>
            <div class="wallet-balance-value" :aria-label="status === 'loading' ? '余额正在读取' : `${balance.toLocaleString('zh-CN')} ${currency}`"><small>¤</small><strong>{{ status === 'loading' ? '—' : balance.toLocaleString('zh-CN') }}</strong></div>
            <footer><span>{{ currency }} · 日常收支</span><span class="wallet-pocket-clasp" aria-hidden="true"><WalletIcon name="wallet" /></span></footer>
        </div>
    </section>
</template>
