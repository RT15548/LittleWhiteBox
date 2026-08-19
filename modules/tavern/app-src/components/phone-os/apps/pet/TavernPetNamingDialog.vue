<script setup lang="ts">
import { ref, toRef } from 'vue';
import { useTavernPhoneModal } from '../../useTavernPhoneModal';

const props = defineProps<{
    open: boolean;
    modelValue: string;
    specimenLabel: string;
    hasCustomName: boolean;
    busy: boolean;
    error: string;
}>();

const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void;
    (event: 'close'): void;
    (event: 'submit'): void;
    (event: 'restore'): void;
}>();

const backdropRef = ref<HTMLElement | null>(null);
const nameInputRef = ref<HTMLInputElement | null>(null);

useTavernPhoneModal({
    open: toRef(props, 'open'),
    modalRef: backdropRef,
    initialFocus: () => nameInputRef.value,
    canClose: () => !props.busy,
    close: () => emit('close'),
});

function updateValue(event: Event): void {
    emit('update:modelValue', (event.target as HTMLInputElement).value);
}

function closeFromBackdrop(event: MouseEvent): void {
    if (!props.busy && event.target === event.currentTarget) {emit('close');}
}
</script>

<template>
  <Transition name="tavern-pet-dialog">
    <div
      v-if="open"
      ref="backdropRef"
      class="tavern-pet-dialog-backdrop"
      :data-tavern-phone-modal="open ? 'pet-naming' : undefined"
      @click="closeFromBackdrop"
    >
      <form
        class="tavern-pet-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tavern-pet-name-title"
        @submit.prevent="emit('submit')"
      >
        <small>IDENTITY / LOCAL</small>
        <h3 id="tavern-pet-name-title">
          {{ hasCustomName ? '改名字' : '给它一个名字' }}
        </h3>
        <p>没有名字时，它仍会使用 {{ specimenLabel }}。</p>
        <label for="tavern-pet-name-input">名字</label>
        <input
          id="tavern-pet-name-input"
          ref="nameInputRef"
          :value="modelValue"
          type="text"
          maxlength="12"
          autocomplete="off"
          placeholder="1–12 个可见字符"
          :disabled="busy"
          @input="updateValue"
        >
        <p
          v-if="error"
          class="tavern-pet-dialog-error"
          role="alert"
        >
          {{ error }}
        </p>
        <div class="tavern-pet-dialog-actions">
          <button
            type="button"
            :disabled="busy"
            @click="emit('close')"
          >
            取消
          </button>
          <button
            v-if="hasCustomName"
            type="button"
            :disabled="busy"
            @click="emit('restore')"
          >
            恢复实验体编号
          </button>
          <button
            type="submit"
            :disabled="busy || !modelValue.trim()"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  </Transition>
</template>
