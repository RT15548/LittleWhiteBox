<script setup lang="ts">
import type { TavernShopInventoryRow } from '../../../../features/phone-os/apps/shop/tavern-shop-presentation';

defineProps<{
    row: TavernShopInventoryRow;
    mode: 'held' | 'exhausted';
    blockedReason?: string;
    busy?: boolean;
}>();

const emit = defineEmits<{
    (event: 'activate', row: TavernShopInventoryRow): void;
}>();
</script>

<template>
  <article
    class="tavern-shop-inventory-card"
    :class="{ 'is-exhausted': mode === 'exhausted' }"
  >
    <span
      class="material-symbols-rounded"
      aria-hidden="true"
    >{{ row.item.icon }}</span>
    <div>
      <h3>{{ row.item.name }}</h3>
      <p>{{ mode === 'held' ? row.item.description : `已使用 ${row.activationCount} 次` }}</p>
    </div>
    <strong v-if="mode === 'held'">×{{ row.quantity }}</strong>
    <button
      v-if="mode === 'held'"
      type="button"
      :disabled="!!blockedReason || busy"
      :title="blockedReason || `使用${row.item.name}`"
      @click="emit('activate', row)"
    >
      {{ busy ? '落契中' : '使用' }}
    </button>
  </article>
</template>
