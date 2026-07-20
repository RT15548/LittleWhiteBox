<script setup lang="ts">
import type { TavernTaskListing } from '../../../../../shared/tasks/task-types';
import { tavernTaskRewardLabel } from '../../../../features/phone-os/apps/tasks/tavern-task-presentation';

defineProps<{
    listing: TavernTaskListing;
    accepted: boolean;
}>();

const emit = defineEmits<{
    (event: 'open'): void;
}>();
</script>

<template>
  <button
    type="button"
    class="tavern-task-offer-card"
    :class="{ 'is-accepted': accepted }"
    @click="emit('open')"
  >
    <span
      class="tavern-task-ticket-rail"
      aria-hidden="true"
    >
      <b>{{ listing.grade }}</b>
      <i />
      <small>{{ listing.id.slice(-5).toUpperCase() }}</small>
    </span>
    <span class="tavern-task-ticket-copy">
      <span class="tavern-task-ticket-meta">
        <strong>{{ listing.issuer.name }}</strong>
        <span>{{ listing.location }}</span>
      </span>
      <b class="tavern-task-ticket-title">{{ listing.title }}</b>
      <span class="tavern-task-ticket-hook">{{ listing.hook }}</span>
      <span class="tavern-task-tag-row">
        <i
          v-for="tag in listing.tags.slice(0, 3)"
          :key="tag"
        >{{ tag }}</i>
      </span>
    </span>
    <span class="tavern-task-ticket-reward">
      <small>报酬</small>
      <strong>{{ tavernTaskRewardLabel(listing.reward) }}</strong>
      <span>小白币</span>
      <i v-if="accepted">已接取</i>
    </span>
  </button>
</template>
