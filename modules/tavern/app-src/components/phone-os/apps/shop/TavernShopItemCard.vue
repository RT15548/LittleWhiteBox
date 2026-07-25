<script setup lang="ts">
import type { TavernShopShelfRow } from '../../../../features/phone-os/apps/shop/tavern-shop-presentation';

defineProps<{
    row: TavernShopShelfRow;
    blockedReason: string;
    busy: boolean;
}>();

const emit = defineEmits<{
    (event: 'purchase', row: TavernShopShelfRow): void;
}>();
</script>

<template>
  <article class="tavern-shop-ticket">
    <header>
      <span
        class="material-symbols-rounded tavern-shop-ticket-icon"
        aria-hidden="true"
      >{{ row.item.icon }}</span>
      <div>
        <small>{{ row.categoryLabel }}</small>
        <h3>{{ row.item.name }}</h3>
      </div>
      <strong class="tavern-shop-price">
        <i aria-hidden="true">币</i>{{ row.item.price }}
      </strong>
    </header>
    <p>{{ row.item.description }}</p>
    <footer>
      <span>{{ row.durationLabel }}</span>
      <button
        type="button"
        :disabled="!!blockedReason || busy"
        :title="blockedReason || `购买${row.item.name}`"
        @click="emit('purchase', row)"
      >
        {{ busy ? '落契中' : row.purchaseLimitReached ? '已限购' : '购买' }}
      </button>
    </footer>
    <small
      v-if="blockedReason"
      class="tavern-shop-ticket-reason"
    >{{ blockedReason }}</small>
  </article>
</template>
