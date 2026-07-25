<script setup lang="ts">
import { computed } from 'vue';
import type { TavernShopItem } from '../../../../../shared/shop/shop-types';
import type { TavernShopShelfRow } from '../../../../features/phone-os/apps/shop/tavern-shop-presentation';
import TavernShopItemCard from './TavernShopItemCard.vue';

const props = defineProps<{
    rows: TavernShopShelfRow[];
    loading: boolean;
    error: string;
    busyAction: string;
    purchaseBlockedReason: (item: TavernShopItem) => string;
}>();

const emit = defineEmits<{
    (event: 'purchase', row: TavernShopShelfRow): void;
    (event: 'retry'): void;
}>();

const groups = computed(() => {
    const grouped = new Map<string, TavernShopShelfRow[]>();
    for (const row of props.rows) {
        const rows = grouped.get(row.categoryLabel) || [];
        rows.push(row);
        grouped.set(row.categoryLabel, rows);
    }
    return [...grouped.entries()].map(([label, rows]) => ({ label, rows }));
});
</script>

<template>
  <div class="tavern-shop-scroll tavern-shop-shelf">
    <div
      v-if="error"
      class="tavern-shop-notice is-error"
      role="status"
    >
      <strong>货架暂时蒙尘</strong>
      <p>{{ error }}</p>
      <button
        type="button"
        @click="emit('retry')"
      >
        重新清点
      </button>
    </div>
    <div
      v-else-if="loading"
      class="tavern-shop-loading"
      aria-label="正在读取货架"
    >
      <span />
      <span />
      <span />
    </div>
    <section
      v-for="group in groups"
      v-else
      :key="group.label"
      class="tavern-shop-category"
    >
      <header>
        <span>{{ group.label }}</span>
        <i>{{ group.rows.length }} 份规则</i>
      </header>
      <div class="tavern-shop-ticket-list">
        <TavernShopItemCard
          v-for="row in group.rows"
          :key="row.item.id"
          :row="row"
          :blocked-reason="purchaseBlockedReason(row.item)"
          :busy="busyAction === `purchase:${row.item.id}:`"
          @purchase="emit('purchase', $event)"
        />
      </div>
    </section>
  </div>
</template>
