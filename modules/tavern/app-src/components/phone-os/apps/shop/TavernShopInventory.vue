<script setup lang="ts">
import { ref } from 'vue';
import type {
    TavernShopActivationRow,
    TavernShopInventoryRow,
} from '../../../../features/phone-os/apps/shop/tavern-shop-presentation';
import TavernShopActivationCard from './TavernShopActivationCard.vue';
import TavernShopInventoryCard from './TavernShopInventoryCard.vue';

defineProps<{
    active: TavernShopActivationRow[];
    held: TavernShopInventoryRow[];
    exhausted: TavernShopInventoryRow[];
    loading: boolean;
    error: string;
    blockedReason: string;
    busyAction: string;
}>();

const emit = defineEmits<{
    (event: 'activate', row: TavernShopInventoryRow): void;
    (event: 'deactivate', row: TavernShopActivationRow): void;
    (event: 'retry'): void;
}>();

const exhaustedOpen = ref(false);
</script>

<template>
  <div class="tavern-shop-scroll tavern-shop-inventory">
    <div
      v-if="error"
      class="tavern-shop-notice is-error"
      role="status"
    >
      <strong>背包清点失败</strong>
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
      aria-label="正在读取背包"
    >
      <span />
      <span />
    </div>
    <template v-else>
      <section class="tavern-shop-inventory-section">
        <header>
          <div>
            <span class="tavern-shop-live-dot" />
            <h3>生效中</h3>
          </div>
          <small>{{ active.length }}</small>
        </header>
        <div
          v-if="active.length"
          class="tavern-shop-contract-list"
        >
          <TavernShopActivationCard
            v-for="row in active"
            :key="row.activation.id"
            :row="row"
            :blocked-reason="blockedReason"
            :busy="busyAction === `deactivate:${row.item.id}:${row.activation.id}`"
            @deactivate="emit('deactivate', $event)"
          />
        </div>
        <p
          v-else
          class="tavern-shop-empty-copy"
        >
          没有正在改写剧情规则的契约。
        </p>
      </section>

      <section class="tavern-shop-inventory-section">
        <header>
          <div><h3>持有</h3></div>
          <small>{{ held.length }}</small>
        </header>
        <div
          v-if="held.length"
          class="tavern-shop-inventory-list"
        >
          <TavernShopInventoryCard
            v-for="row in held"
            :key="row.item.id"
            :row="row"
            mode="held"
            :blocked-reason="blockedReason"
            :busy="busyAction === `activate:${row.item.id}:`"
            @activate="emit('activate', $event)"
          />
        </div>
        <p
          v-else
          class="tavern-shop-empty-copy"
        >
          背包里还没有待使用的契约。
        </p>
      </section>

      <section
        v-if="exhausted.length"
        class="tavern-shop-inventory-section is-exhausted"
      >
        <button
          type="button"
          class="tavern-shop-exhausted-toggle"
          :aria-expanded="exhaustedOpen"
          @click="exhaustedOpen = !exhaustedOpen"
        >
          <span>已耗尽</span>
          <small>{{ exhausted.length }}</small>
          <i aria-hidden="true">{{ exhaustedOpen ? '−' : '+' }}</i>
        </button>
        <div
          v-if="exhaustedOpen"
          class="tavern-shop-inventory-list"
        >
          <TavernShopInventoryCard
            v-for="row in exhausted"
            :key="row.item.id"
            :row="row"
            mode="exhausted"
          />
        </div>
      </section>
    </template>
  </div>
</template>
