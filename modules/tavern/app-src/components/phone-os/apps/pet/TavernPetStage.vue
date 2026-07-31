<script setup lang="ts">
import { computed } from 'vue';
import type { TavernPetView } from '../../../../../shared/pet/pet-types';
import {
    tavernPetReadableState,
    tavernPetThinkingFace,
    type TavernPetUtterancePresentation,
} from '../../../../features/phone-os/apps/pet/tavern-pet-presentation';

const props = defineProps<{
    view: TavernPetView;
    utterance: TavernPetUtterancePresentation;
    waiting: boolean;
    murmurVisible: boolean;
}>();

const emit = defineEmits<{
    (event: 'touch'): void;
}>();

const face = computed(() => props.waiting ? tavernPetThinkingFace(props.view) : props.utterance.face);
const text = computed(() => props.waiting ? '它还在反应……' : props.utterance.text);
const motionClass = computed(() => props.waiting ? 'motion-none' : `motion-${props.utterance.motion}`);
const readableState = computed(() => tavernPetReadableState(props.view));
</script>

<template>
  <section
    class="tavern-pet-stage"
    :class="{ 'is-waiting': waiting }"
    :aria-label="readableState"
  >
    <div
      class="tavern-pet-stage-grain"
      aria-hidden="true"
    />
    <button
      :key="`${utterance.key}:${waiting ? 'waiting' : 'settled'}`"
      class="tavern-pet-presence"
      :class="motionClass"
      type="button"
      :disabled="waiting"
      :aria-label="waiting ? '它还在反应' : '碰一碰它'"
      @click="emit('touch')"
    >
      <div
        class="tavern-pet-face"
        aria-hidden="true"
      >
        {{ face }}
      </div>
    </button>
    <p class="tavern-pet-sr-only">
      {{ readableState }}
    </p>
    <blockquote>{{ text }}</blockquote>
    <Transition name="tavern-pet-murmur">
      <small
        v-if="utterance.murmur && murmurVisible && !waiting"
        class="tavern-pet-murmur"
      >{{ utterance.murmur }}</small>
    </Transition>
  </section>
</template>
