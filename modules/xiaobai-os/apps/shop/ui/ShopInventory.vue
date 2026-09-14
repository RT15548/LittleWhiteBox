<script setup lang="ts">
import { computed } from 'vue';
import type { ShopCatalogItemView } from '../types.js';
import ShopIcon from './ShopIcon.vue';
import ShopItemArt from './ShopItemArt.vue';
const props = defineProps<{ catalog: ShopCatalogItemView[]; writeDisabledReason: string }>();
defineEmits<{ open: [item: ShopCatalogItemView]; use: [item: ShopCatalogItemView]; browse: [] }>();
const held = computed(() => props.catalog.filter(item => item.quantity > 0));
const exhausted = computed(() => props.catalog.filter(item => item.purchasedCount > 0 && item.quantity === 0));
const quantity = computed(() => held.value.reduce((total, item) => total + item.quantity, 0));
</script>
<template>
    <section class="shop-page" aria-labelledby="shop-inventory-title">
        <header class="shop-page-heading"><h2 id="shop-inventory-title">背包</h2><small>{{ quantity }} 件</small></header>
        <p v-if="writeDisabledReason" class="shop-hint" role="status">{{ writeDisabledReason }}</p>
        <div v-if="held.length" class="shop-held-list">
            <article v-for="item in held" :key="item.id" class="shop-held-card">
                <button type="button" class="shop-held-open" :data-item-id="item.id" :aria-label="`查看${item.name}`" @click="$emit('open', item)">
                    <span class="shop-held-art" :data-category="item.category"><ShopItemArt :name="item.icon" /></span>
                    <span><small>{{ item.categoryLabel }}</small><strong>{{ item.name }}</strong><span>{{ item.durationLabel }}</span></span>
                    <b>×{{ item.quantity }}</b>
                </button>
                <footer><span>{{ item.duration === 'permanent' ? '永久效果 · 使用前请确认' : item.duration === 'manual' ? '启用后可手动关闭' : '未使用，不会消耗次数' }}</span><button type="button" class="shop-text-button" :disabled="Boolean(writeDisabledReason)" :aria-label="`使用${item.name}`" @click="$emit('use', item)">使用<ShopIcon name="next" /></button></footer>
            </article>
        </div>
        <div v-else class="shop-empty"><ShopIcon name="bag" /><h3>背包是空的</h3><button type="button" class="shop-primary-button" @click="$emit('browse')">去逛店<ShopIcon name="next" /></button></div>
        <details v-if="exhausted.length" class="shop-exhausted">
            <summary>用过的奇物 <small>{{ exhausted.length }} 种</small><ShopIcon name="next" /></summary>
            <div v-for="item in exhausted" :key="item.id"><button type="button" :data-item-id="item.id" @click="$emit('open', item)">{{ item.name }}</button><span>曾购入 {{ item.purchasedCount }} 件 · 库存 0</span></div>
            <p>奇物用完后，效果可能还在。可到「生效中」查看。</p>
        </details>
    </section>
</template>
