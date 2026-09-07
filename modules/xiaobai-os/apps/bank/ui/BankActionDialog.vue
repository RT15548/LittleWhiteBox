<script setup lang="ts">
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import { computed, ref } from 'vue';
import { amountAtBps } from '../../../domains/bank/money.js';
import type { BankDepositPositionView, BankDepositProductView, BankFundProductView } from '../types.js';
const props = defineProps<{
    mode: 'deposit-open' | 'fund-open' | 'withdraw';
    product?: BankDepositProductView | BankFundProductView;
    position?: BankDepositPositionView;
    balance: number; busy: boolean; error: string; disabledReason: string; claimableCount: number;
}>();
const emit = defineEmits<{ cancel: []; confirm: [amount?: number] }>();
const amount = ref(props.product ? String(props.product.minAmount) : '');
const title = computed(() => props.mode === 'deposit-open' ? '存入定期' : props.mode === 'fund-open' ? '申购理财' : '提前支取');
const amountValue = computed(() => /^\d+$/.test(amount.value.trim()) ? Number(amount.value) : 0);
const validationMessage = computed(() => {
    if (props.mode === 'withdraw') {return '';}
    if (!props.product || !Number.isSafeInteger(amountValue.value) || amountValue.value <= 0) {return '请输入正整数金额';}
    if (amountValue.value < props.product.minAmount || amountValue.value > props.product.maxAmount) {
        return `金额须在 ${props.product.minAmount.toLocaleString('zh-CN')} 至 ${props.product.maxAmount.toLocaleString('zh-CN')} 之间`;
    }
    if (amountValue.value > props.balance) {return '可用余额不足';}
    return '';
});
const depositProduct = computed(() => props.mode === 'deposit-open' ? props.product as BankDepositProductView : null);
const fundProduct = computed(() => props.mode === 'fund-open' ? props.product as BankFundProductView : null);
const estimatedMaturity = computed(() => depositProduct.value && !validationMessage.value
    ? amountAtBps(amountValue.value, depositProduct.value.interestBps) : null);
const quickAmounts = computed(() => {
    const product = props.product;
    if (!product) {return [];}
    return [...new Set([product.minAmount, product.minAmount * 2, Math.min(product.maxAmount, props.balance)])]
        .filter(value => value >= product.minAmount && value <= product.maxAmount && value <= props.balance).sort((a, b) => a - b);
});
const canSubmit = computed(() => !props.busy && !props.disabledReason && !validationMessage.value);
function submit(): void {
    if (!canSubmit.value) {return;}
    if (props.mode === 'withdraw') {emit('confirm');}
    else {emit('confirm', amountValue.value);}
}
</script>
<template>
    <AppDialog class="bank-dialog" :aria-label="title" :busy="busy" @close="emit('cancel')">
        <form @submit.prevent="submit">
            <h2>{{ title }}</h2>
            <div class="bank-dialog-subject"><strong>{{ position?.name || product?.name }}</strong><span v-if="product">{{ product.lockRounds }} 回合</span></div>
            <template v-if="mode !== 'withdraw'">
                <label class="bank-dialog-field"><span>{{ mode === 'deposit-open' ? '存入金额' : '申购金额' }}</span><span class="bank-amount-input"><i>¤</i><input v-model="amount" :disabled="busy" type="text" inputmode="numeric" autocomplete="off" aria-describedby="bank-amount-help"></span></label>
                <small id="bank-amount-help" class="bank-amount-help">钱包可用 ¤ {{ balance.toLocaleString('zh-CN') }} · {{ product?.amountLabel }}</small>
                <div class="bank-quick-amounts"><button v-for="value in quickAmounts" :key="value" type="button" :disabled="busy" :aria-pressed="amountValue === value" @click="amount = String(value)">¤ {{ value.toLocaleString('zh-CN') }}</button></div>
            </template>
            <p v-if="validationMessage" class="bank-inline-error" role="status">{{ validationMessage }}</p>
            <dl v-if="depositProduct" class="bank-dialog-summary"><div><dt>整期收益率</dt><dd>{{ depositProduct.interestLabel }}</dd></div><div v-if="estimatedMaturity !== null"><dt>到期到账（含本金）</dt><dd>¤ {{ estimatedMaturity.toLocaleString('zh-CN') }}</dd></div><div><dt>提前支取</dt><dd>本金 {{ depositProduct.earlyPenaltyLabel }}，无利息</dd></div></dl>
            <template v-if="fundProduct"><dl class="bank-dialog-summary"><div><dt>整期收益区间</dt><dd>{{ fundProduct.returnLabel }}</dd></div><div><dt>风险等级</dt><dd>{{ fundProduct.riskLabel }}</dd></div></dl><p class="bank-dialog-warning">可能损失本金。申购后不能提前退出，实际收益封存至到期才揭晓。</p></template>
            <template v-if="mode === 'withdraw' && position"><div class="bank-withdraw-amount"><span>现在实际到账</span><strong>¤ {{ position.earlyWithdrawalAmount.toLocaleString('zh-CN') }}</strong></div><dl class="bank-dialog-summary"><div><dt>原存入本金</dt><dd>¤ {{ position.principal.toLocaleString('zh-CN') }}</dd></div><div><dt>提前支取损失</dt><dd class="is-loss">¤ {{ (position.principal - position.earlyWithdrawalAmount).toLocaleString('zh-CN') }}</dd></div></dl><p class="bank-dialog-warning">不再获得到期利息，确认后不可撤销。</p></template>
            <p v-if="claimableCount" class="bank-amount-help">另有 {{ claimableCount }} 笔到期资产，将随本次操作一并兑付至钱包。</p>
            <p v-if="disabledReason && !busy" class="bank-inline-error" role="status">{{ disabledReason }}</p>
            <p v-if="error" class="bank-inline-error" role="alert">{{ error }}</p>
            <footer class="bank-dialog-actions"><button type="button" class="bank-secondary-button" :disabled="busy" autofocus @click="emit('cancel')">返回</button><button type="submit" class="bank-primary-button" :disabled="!canSubmit">{{ busy ? '正在保存…' : mode === 'withdraw' ? '确认支取' : mode === 'fund-open' ? '确认申购' : '确认存入' }}</button></footer>
        </form>
    </AppDialog>
</template>
