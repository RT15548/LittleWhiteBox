<script setup lang="ts">
import { computed } from 'vue';
import type { TavernTaskListing } from '../../../../../shared/tasks/task-types';
import { tavernTaskRewardLabel } from '../../../../features/phone-os/apps/tasks/tavern-task-presentation';

const props = defineProps<{
    listing: TavernTaskListing;
    accepted: boolean;
}>();

const emit = defineEmits<{
    (event: 'open'): void;
}>();

const rewardLabel = computed(() => tavernTaskRewardLabel(props.listing.reward));
const rewardSizeClass = computed(() => {
    if (rewardLabel.value.length > 10) {return 'is-dense';}
    if (rewardLabel.value.length > 7) {return 'is-compact';}
    return '';
});
</script>

<template>
  <button
    type="button"
    class="tavern-task-offer-card"
    :class="{ 'is-accepted': accepted }"
    @click="emit('open')"
  >
    <span class="tavern-task-ticket-grade">{{ listing.grade }}</span>
    <span class="tavern-task-ticket-copy">
      <b class="tavern-task-ticket-title">{{ listing.title }}</b>
      <small>{{ listing.issuer.name }} · {{ listing.location }}</small>
    </span>
    <span class="tavern-task-ticket-reward">
      <strong
        :class="rewardSizeClass"
        :title="`${rewardLabel} 小白币`"
      >{{ rewardLabel }}</strong>
      <small>小白币</small>
      <i v-if="accepted">已接取</i>
    </span>
  </button>
</template>
