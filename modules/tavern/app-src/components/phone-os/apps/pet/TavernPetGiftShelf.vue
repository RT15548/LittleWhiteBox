<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TavernPetAvailableAction, TavernPetGiftId } from '../../../../../shared/pet/pet-types';

const props = defineProps<{
    actions: TavernPetAvailableAction[];
    blockedReason: string;
    busyAction: string;
}>();

const emit = defineEmits<{
    (event: 'action', actionId: TavernPetGiftId): void;
}>();

const open = ref(false);
const available = computed(() => props.actions.filter((action): action is TavernPetAvailableAction & { id: TavernPetGiftId } => (
    action.id === 'feed' || action.id === 'toy'
)));

function reason(action: TavernPetAvailableAction): string {
    return props.blockedReason || (action.enabled ? '' : action.reason);
}

function choose(actionId: TavernPetGiftId): void {
    open.value = false;
    emit('action', actionId);
}
</script>

<template>
  <section
    v-if="available.length"
    class="tavern-pet-gifts"
    aria-label="放点东西"
  >
    <button
      type="button"
      class="tavern-pet-gift-trigger"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span>放点东西</span>
      <i aria-hidden="true">{{ open ? '−' : '+' }}</i>
    </button>
    <Transition name="tavern-pet-gifts">
      <div
        v-if="open"
        class="tavern-pet-gift-list"
      >
        <button
          v-for="action in available"
          :key="action.id"
          type="button"
          :disabled="!!reason(action)"
          :title="reason(action)"
          @click="choose(action.id)"
        >
          <span>{{ action.id === 'feed' ? '食物' : '玩具' }}</span>
          <small>{{ action.cost }} 小白币</small>
          <i
            v-if="busyAction === action.id"
            aria-hidden="true"
          >
            …
          </i>
        </button>
      </div>
    </Transition>
  </section>
</template>
