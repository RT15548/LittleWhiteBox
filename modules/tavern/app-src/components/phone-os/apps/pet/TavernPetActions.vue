<script setup lang="ts">
import type { TavernPetAvailableAction, TavernPetInteractionId } from '../../../../../shared/pet/pet-types';
import { tavernPetActionLabel } from '../../../../features/phone-os/apps/pet/tavern-pet-presentation';

const props = defineProps<{
    actions: TavernPetAvailableAction[];
    blockedReason: string;
    busyAction: string;
}>();

const emit = defineEmits<{
    (event: 'action', actionId: TavernPetInteractionId): void;
}>();

function disabledReason(action: TavernPetAvailableAction): string {
    return props.blockedReason || (action.enabled ? '' : action.reason);
}
</script>

<template>
  <section
    v-if="actions.length"
    class="tavern-pet-actions"
    aria-label="和住户互动"
  >
    <button
      v-for="action in actions"
      :key="action.id"
      type="button"
      :disabled="!!disabledReason(action)"
      :title="disabledReason(action)"
      :aria-describedby="disabledReason(action) ? `pet-action-reason-${action.id}` : undefined"
      @click="emit('action', action.id)"
    >
      <span>{{ tavernPetActionLabel(action.id) }}</span>
      <small v-if="action.cost">{{ action.cost }}</small>
      <i
        v-if="busyAction === action.id"
        aria-hidden="true"
      >…</i>
      <span
        v-if="disabledReason(action)"
        :id="`pet-action-reason-${action.id}`"
        class="tavern-pet-sr-only"
      >{{ disabledReason(action) }}</span>
    </button>
  </section>
</template>
