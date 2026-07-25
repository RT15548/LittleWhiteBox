<script setup lang="ts">
import type { TavernShopActivationRow } from '../../../../features/phone-os/apps/shop/tavern-shop-presentation';

defineProps<{
    row: TavernShopActivationRow;
    blockedReason: string;
    busy: boolean;
}>();

const emit = defineEmits<{
    (event: 'deactivate', row: TavernShopActivationRow): void;
}>();
</script>

<template>
  <article
    class="tavern-shop-active-contract"
    :class="{ 'is-permanent': row.item.duration.kind === 'permanent' }"
  >
    <div
      class="tavern-shop-contract-seal"
      aria-hidden="true"
    >
      生效
    </div>
    <header>
      <span
        class="material-symbols-rounded"
        aria-hidden="true"
      >{{ row.item.icon }}</span>
      <div>
        <small>{{ row.item.duration.kind === 'permanent' ? '永久封契' : '已盖印' }}</small>
        <h3>{{ row.item.name }}</h3>
      </div>
    </header>
    <p v-if="row.parameterSummary">
      {{ row.parameterSummary }}
    </p>
    <footer>
      <strong>{{ row.durationLabel }}</strong>
      <button
        v-if="row.canDeactivate"
        type="button"
        :disabled="!!blockedReason || busy"
        :title="blockedReason || '关闭效果'"
        @click="emit('deactivate', row)"
      >
        {{ busy ? '封存中' : '关闭' }}
      </button>
      <span v-else>{{ row.finalRound ? '本回合后消退' : '不可手动关闭' }}</span>
    </footer>
  </article>
</template>
