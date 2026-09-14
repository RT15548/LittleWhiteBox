<script setup lang="ts">
import { computed, ref } from 'vue';
import type { WalletTransactionDirection, WalletTransactionView } from '../types.js';
import WalletEmpty from './WalletEmpty.vue';
import WalletIcon from './WalletIcon.vue';
import WalletTransactionRow from './WalletTransactionRow.vue';
const props = defineProps<{ transactions: readonly WalletTransactionView[]; hasMore: boolean; loadingMore: boolean; loading: boolean; error: string }>();
defineEmits<{ loadMore: []; open: [transaction: WalletTransactionView] }>();
const filter = ref<'all' | WalletTransactionDirection>('all');
const filters = [{ id: 'all', label: '全部' }, { id: 'income', label: '收入' }, { id: 'expense', label: '支出' }, { id: 'transfer', label: '划转' }] as const;
const dateFormatter = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
const groups = computed(() => {
    const result: { date: string; transactions: WalletTransactionView[] }[] = [];
    for (const transaction of props.transactions) {
        if (filter.value !== 'all' && transaction.direction !== filter.value) {continue;}
        const date = dateFormatter.format(transaction.createdAt);
        const last = result.at(-1);
        if (last?.date === date) {last.transactions.push(transaction);}
        else {result.push({ date, transactions: [transaction] });}
    }
    return result;
});
</script>
<template>
    <div>
        <div class="wallet-filters" aria-label="账单类型"><button v-for="option in filters" :key="option.id" type="button" :aria-pressed="filter === option.id" @click="filter = option.id">{{ option.label }}</button></div>
        <p v-if="filter === 'transfer'" class="wallet-ledger-caption">系统账户间的划转，不计入你的个人收支。</p>
        <div v-if="loading" class="wallet-ui-empty" role="status"><WalletIcon name="refresh" class="is-spinning" /><strong>正在准备你的钱包…</strong></div>
        <template v-else>
            <WalletEmpty v-if="!groups.length" :title="hasMore ? '当前已加载的账目中没有这类记录' : '这里还没有账目'" message="收支记录会显示在这里。"><template #icon><WalletIcon name="receipt" /></template></WalletEmpty>
            <section v-for="group in groups" :key="group.transactions[0].id" class="wallet-day-group">
                <h3>{{ group.date }}</h3>
                <ol class="wallet-ui-list"><WalletTransactionRow v-for="transaction in group.transactions" :key="transaction.id" :transaction="transaction" @open="$emit('open', $event)" /></ol>
            </section>
            <div class="wallet-ledger-foot">
                <p v-if="error" class="wallet-load-error" role="alert">{{ error }}</p>
                <button v-if="hasMore" type="button" class="wallet-ui-text-button" :disabled="loadingMore" @click="$emit('loadMore')">{{ loadingMore ? '正在读取…' : '查看更早的账单' }}<WalletIcon name="next" /></button>
                <span v-else-if="transactions.length" class="wallet-ledger-end">已显示全部账目</span>
            </div>
        </template>
    </div>
</template>
