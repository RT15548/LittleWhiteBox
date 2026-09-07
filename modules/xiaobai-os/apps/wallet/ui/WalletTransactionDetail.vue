<script setup lang="ts">
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';

import type { WalletTransactionView } from '../types.js';
import WalletIcon from './WalletIcon.vue';
import { walletAmount, walletDirection, walletTransactionIcon } from './wallet-display.js';
defineProps<{ transaction: WalletTransactionView }>();
defineEmits<{ close: [] }>();
const dateFormatter = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short', hour12: false });
</script>
<template>
    <AppDialog class="wallet-receipt" aria-label="账单详情" @close="$emit('close')">
        <header><span>账单详情</span><button type="button" class="wallet-icon-button" aria-label="关闭账单详情" autofocus @click="$emit('close')"><WalletIcon name="close" /></button></header>
        <div class="wallet-receipt-hero" :class="`is-${transaction.direction}`"><span class="wallet-row-mark"><WalletIcon :name="walletTransactionIcon(transaction)" /></span><h2>{{ transaction.title }}</h2><strong>{{ walletAmount(transaction) }}<small>小白币</small></strong><span>{{ walletDirection[transaction.direction] }}</span></div>
        <dl><div><dt>来自</dt><dd>{{ transaction.source }}</dd></div><div><dt>发生时间</dt><dd>{{ dateFormatter.format(transaction.createdAt) }}</dd></div><div><dt>账目序号</dt><dd>#{{ transaction.sequence }}</dd></div><div v-if="transaction.note" class="wallet-receipt-note"><dt>备注</dt><dd>{{ transaction.note }}</dd></div></dl>
        <p v-if="transaction.direction === 'transfer'" class="wallet-ledger-caption">这笔资金在系统账户之间流转，不是你的收入或支出。</p>
        <footer>小白 OS · 当前聊天账本</footer>
    </AppDialog>
</template>
