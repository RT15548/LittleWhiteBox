<script setup lang="ts">
import { computed } from 'vue';
import type { ShopCatalogItemView } from '../types.js';
import ShopIcon from './ShopIcon.vue';
import ShopItemArt from './ShopItemArt.vue';
import { shopPurchaseReason, shopUseNotice } from './shop-display.js';
const props = defineProps<{ item: ShopCatalogItemView; balance: number; writeDisabledReason: string; activationDisabledReason: string }>();
defineEmits<{ purchase: []; use: []; back: [] }>();
const purchaseReason = computed(() => props.writeDisabledReason || shopPurchaseReason(props.item, props.balance));
</script>
<template>
    <section class="shop-detail" aria-labelledby="shop-detail-title">
        <div class="shop-detail-art" :data-category="item.category">
            <button type="button" class="shop-detail-back shop-icon-button" aria-label="返回商品列表" @click="$emit('back')"><ShopIcon name="back" /></button>
            <span class="shop-detail-category">{{ item.categoryLabel }}</span>
            <ShopItemArt :name="item.icon" />
        </div>
        <div class="shop-detail-copy">
            <header><h2 id="shop-detail-title">{{ item.name }}</h2><strong class="shop-detail-price"><small>¤</small> {{ item.price.toLocaleString('zh-CN') }}</strong></header>
            <p class="shop-detail-description">{{ item.description }}</p>
            <dl class="shop-item-terms">
                <div><dt><ShopIcon name="clock" />作用期限</dt><dd>{{ item.durationLabel }}</dd></div>
                <div><dt><ShopIcon name="bag" />背包持有</dt><dd>{{ item.quantity }} 件</dd></div>
                <div v-if="item.purchaseLimit !== null"><dt><ShopIcon name="lock" />购买限制</dt><dd>最多 {{ item.purchaseLimit }} 件 · 已购 {{ item.purchasedCount }} 件</dd></div>
            </dl>
            <details class="shop-use-guide"><summary>使用说明</summary><p>{{ shopUseNotice(item) }}</p><p v-if="item.inputs.length">使用时需要填写：{{ item.inputs.map(input => input.label).join('、') }}。</p><p>每次使用消耗 1 件库存，不会再次扣款。已经发生的剧情不会因效果结束而撤销。</p></details>
            <p v-if="item.duration === 'permanent'" class="shop-hint is-warning"><ShopIcon name="lock" />效果会永久保留，但使用一次仍会消耗一件奇物。</p>
            <div v-if="item.quantity" class="shop-detail-owned"><span><ShopIcon name="check" />背包里已有 {{ item.quantity }} 件</span><button type="button" class="shop-text-button" :disabled="Boolean(activationDisabledReason)" @click="$emit('use')">使用一件<ShopIcon name="next" /></button><p v-if="activationDisabledReason">{{ activationDisabledReason }}</p></div>
        </div>
        <footer class="shop-detail-checkout">
            <p v-if="purchaseReason" class="shop-checkout-reason" role="status">{{ purchaseReason }}</p>
            <div><span><small>小白币</small><strong>¤ {{ item.price.toLocaleString('zh-CN') }}</strong></span><button type="button" class="shop-primary-button" :disabled="Boolean(purchaseReason)" @click="$emit('purchase')">{{ item.quantity ? '再买一件' : '购买' }}<ShopIcon name="bag" /></button></div>
            <small>购买后放入背包，不会自动使用</small>
        </footer>
    </section>
</template>
