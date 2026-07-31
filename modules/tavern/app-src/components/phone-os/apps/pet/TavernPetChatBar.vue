<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    modelValue: string;
    canSubmit: boolean;
    disabledReason: string;
    waiting: boolean;
    egg: boolean;
}>();

const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void;
    (event: 'submit'): void;
}>();

const composing = ref(false);

function truncateCodePoints(value: string): string {
    const points = [...value];
    return points.length > 120 ? points.slice(0, 120).join('') : value;
}

function commitValue(input: HTMLInputElement): void {
    const value = truncateCodePoints(input.value);
    if (input.value !== value) {input.value = value;}
    emit('update:modelValue', value);
}

function updateValue(event: Event): void {
    if (composing.value) {return;}
    commitValue(event.target as HTMLInputElement);
}

function startComposition(): void {
    composing.value = true;
}

function finishComposition(event: CompositionEvent): void {
    composing.value = false;
    commitValue(event.target as HTMLInputElement);
}

function submit(): void {
    if (!composing.value && props.canSubmit) {emit('submit');}
}

function submitOnEnter(event: KeyboardEvent): void {
    if (composing.value || event.isComposing || event.shiftKey) {return;}
    event.preventDefault();
    submit();
}
</script>

<template>
  <form
    class="tavern-pet-chatbar"
    @submit.prevent="submit"
  >
    <label
      class="tavern-pet-sr-only"
      for="tavern-pet-chat-input"
    >跟住户说点什么</label>
    <input
      id="tavern-pet-chat-input"
      :value="modelValue"
      type="text"
      autocomplete="off"
      enterkeyhint="send"
      :placeholder="egg ? '跟蛋壳说点什么……' : '跟它说点什么……'"
      :disabled="waiting"
      :aria-describedby="disabledReason ? 'tavern-pet-chat-reason' : undefined"
      @compositionstart="startComposition"
      @compositionend="finishComposition"
      @input="updateValue"
      @keydown.enter="submitOnEnter"
    >
    <button
      type="submit"
      :disabled="!canSubmit"
      :title="disabledReason"
    >
      {{ waiting ? '……' : egg ? '敲一下' : '发送' }}
    </button>
    <small
      v-if="disabledReason"
      id="tavern-pet-chat-reason"
      class="tavern-pet-chat-reason"
    >{{ disabledReason }}</small>
  </form>
</template>
