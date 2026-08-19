<script setup lang="ts">
import { ref, toRef } from 'vue';
import type {
    TavernPetMomentChoiceId,
    TavernPetMomentView,
} from '../../../../../shared/pet/pet-types';
import { useTavernPhoneModal } from '../../useTavernPhoneModal';

const props = defineProps<{
    open: boolean;
    moment?: TavernPetMomentView;
    busy: boolean;
    error: string;
}>();

const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'choose', choiceId: TavernPetMomentChoiceId): void;
    (event: 'skip'): void;
}>();

const backdropRef = ref<HTMLElement | null>(null);
const closeRef = ref<HTMLButtonElement | null>(null);

function requestClose(): void {
    if (!props.busy) {emit('close');}
}

function closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {requestClose();}
}

useTavernPhoneModal({
    open: toRef(props, 'open'),
    modalRef: backdropRef,
    initialFocus: () => closeRef.value,
    canClose: () => !props.busy,
    close: requestClose,
});
</script>

<template>
  <Transition name="tavern-pet-moment-sheet">
    <div
      v-if="open && moment"
      ref="backdropRef"
      class="tavern-pet-moment-backdrop"
      data-tavern-phone-modal="pet-moment"
      @click="closeFromBackdrop"
    >
      <section
        class="tavern-pet-moment-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tavern-pet-moment-title"
      >
        <header>
          <div>
            <small>它没有说出口</small>
            <h3 id="tavern-pet-moment-title">
              {{ moment.prompt }}
            </h3>
          </div>
          <button
            ref="closeRef"
            type="button"
            aria-label="先放着"
            :disabled="busy"
            @click="requestClose"
          >
            ×
          </button>
        </header>

        <div class="tavern-pet-moment-sheet-choices">
          <button
            v-for="choice in moment.choices"
            :key="choice.id"
            type="button"
            :disabled="busy"
            @click="emit('choose', choice.id)"
          >
            {{ choice.label }}
          </button>
        </div>

        <p
          v-if="error"
          class="tavern-pet-moment-sheet-error"
          role="alert"
        >
          {{ error }}
        </p>

        <button
          type="button"
          class="tavern-pet-moment-sheet-skip"
          :disabled="busy"
          @click="emit('skip')"
        >
          这次先不回应
        </button>
      </section>
    </div>
  </Transition>
</template>
