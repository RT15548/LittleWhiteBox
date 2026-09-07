<script setup lang="ts">
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import { computed, reactive } from 'vue';
import type { ShopActivationView, ShopCatalogItemView } from '../types.js';
import ShopIcon from './ShopIcon.vue';
import ShopItemArt from './ShopItemArt.vue';
import { shopUseNotice } from './shop-display.js';

const props = defineProps<{
    mode: 'purchase' | 'use' | 'deactivate';
    item: ShopCatalogItemView;
    activation?: ShopActivationView;
    balance: number;
    busy: boolean;
    error: string;
    disabledReason: string;
}>();
const emit = defineEmits<{ cancel: []; confirm: [parameters: Record<string, string>] }>();
const parameters = reactive<Record<string, string>>({});
const title = computed(() => props.mode === 'purchase' ? '确认购买' : props.mode === 'use' ? '使用奇物' : '关闭效果？');
const formValid = computed(() => props.mode !== 'use' || props.item.inputs.every(input => String(parameters[input.key] || '').trim().length > 0));
const canSubmit = computed(() => !props.busy && !props.disabledReason && formValid.value);
function submit(): void {
    if (canSubmit.value) {emit('confirm', { ...parameters });}
}
</script>
<template>
    <AppDialog class="shop-dialog" :aria-label="title" :busy="busy" @close="emit('cancel')">
        <form @submit.prevent="submit">
            <header class="shop-dialog-heading"><h2>{{ title }}</h2></header>
            <div class="shop-dialog-item"><ShopItemArt :name="item.icon" /><div><strong>{{ item.name }}</strong><span>{{ item.durationLabel }}</span><small v-if="mode === 'purchase'">数量 1 件 · 放入背包</small><small v-else-if="mode === 'use'">消耗库存 1 件 · 不再扣款</small></div></div>
            <dl v-if="mode === 'purchase'" class="shop-payment-summary">
                <div><dt>本次支付</dt><dd class="shop-payment-total">¤ {{ item.price.toLocaleString('zh-CN') }}</dd></div>
                <div><dt>钱包可用</dt><dd>¤ {{ balance.toLocaleString('zh-CN') }}</dd></div>
                <div v-if="balance >= item.price"><dt>支付后余额</dt><dd>¤ {{ (balance - item.price).toLocaleString('zh-CN') }}</dd></div>
            </dl>
            <p v-if="mode === 'use'" class="shop-dialog-description">{{ item.description }}</p>
            <label v-for="input in mode === 'use' ? item.inputs : []" :key="input.key" class="shop-dialog-field">
                <span>{{ input.label }}<small>最多 {{ input.maxLength }} 字</small></span>
                <input v-model="parameters[input.key]" :disabled="busy" type="text" :maxlength="input.maxLength" :placeholder="input.placeholder" autocomplete="off" required>
            </label>
            <dl v-if="mode === 'deactivate' && activation?.parameters.length" class="shop-effect-parameters"><div v-for="parameter in activation.parameters" :key="parameter.label"><dt>{{ parameter.label }}</dt><dd>{{ parameter.value }}</dd></div></dl>
            <div class="shop-dialog-note" :class="{ 'is-warning': mode !== 'purchase' && (mode === 'deactivate' || item.duration === 'permanent') }">
                <ShopIcon :name="mode === 'purchase' ? 'bag' : mode === 'deactivate' || item.duration === 'permanent' ? 'lock' : 'spark'" />
                <p v-if="mode === 'purchase'">购买不会立即影响聊天。想好后，再从背包中使用。</p>
                <p v-else-if="mode === 'deactivate'">关闭后，后续新回复不再使用这份效果。已经发生的剧情保留，不返还道具或小白币。</p>
                <p v-else>{{ shopUseNotice(item) }} 使用后不会返还库存。</p>
            </div>
            <p v-if="disabledReason && !busy" class="shop-inline-error" role="status">{{ disabledReason }}</p>
            <p v-if="error" class="shop-inline-error" role="alert">{{ error }}</p>
            <footer class="shop-dialog-actions"><button type="button" class="shop-secondary-button" :disabled="busy" autofocus @click="emit('cancel')">返回</button><button type="submit" class="shop-primary-button" :disabled="!canSubmit">{{ busy ? '正在保存…' : mode === 'purchase' ? '确认支付' : mode === 'deactivate' ? '确认关闭' : '确认使用' }}</button></footer>
        </form>
    </AppDialog>
</template>
