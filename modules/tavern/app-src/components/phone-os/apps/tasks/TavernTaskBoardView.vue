<script setup lang="ts">
import type {
    TavernTaskBoardRecord,
    TavernTaskListing,
} from '../../../../../shared/tasks/task-types';
import TavernTaskOfferCard from './TavernTaskOfferCard.vue';

defineProps<{
    board: TavernTaskBoardRecord | null;
    loading: boolean;
    refreshing: boolean;
    error: string;
    isAccepted: (listing: TavernTaskListing) => boolean;
}>();

const emit = defineEmits<{
    (event: 'refresh'): void;
    (event: 'open', listing: TavernTaskListing): void;
}>();
</script>

<template>
  <section class="tavern-task-root-view tavern-task-board-view">
    <div class="tavern-task-board-status">
      <strong>{{ board?.listings.length || 0 }} 项委托</strong>
      <button
        type="button"
        :disabled="refreshing || loading"
        @click="emit('refresh')"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="M19 8a8 8 0 1 0 1 7M19 4v4h-4" /></svg>
        {{ refreshing ? '刷新中' : '刷新' }}
      </button>
    </div>
    <div
      v-if="error"
      class="tavern-task-inline-alert"
      role="status"
    >
      <strong>暂时无法刷新</strong>
      <p>{{ error }}</p>
    </div>
    <div
      v-if="loading && !board"
      class="tavern-task-skeleton-list"
      aria-label="正在读取委托板"
    >
      <span
        v-for="index in 4"
        :key="index"
      />
    </div>
    <div
      v-else-if="board?.listings.length"
      class="tavern-task-offer-list"
    >
      <TavernTaskOfferCard
        v-for="listing in board.listings"
        :key="listing.id"
        :listing="listing"
        :accepted="isAccepted(listing)"
        @open="emit('open', listing)"
      />
    </div>
    <div
      v-else
      class="tavern-task-empty"
    >
      <span aria-hidden="true"><i /><i /><i /></span>
      <strong>暂无委托</strong>
      <button
        type="button"
        :disabled="refreshing || loading"
        @click="emit('refresh')"
      >
        {{ refreshing ? '正在刷新' : '刷新委托' }}
      </button>
    </div>
  </section>
</template>
