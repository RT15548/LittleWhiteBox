<script setup lang="ts">
import { ref, toRef } from 'vue';
import { useTavernPhoneModal } from '../../useTavernPhoneModal';

const props = defineProps<{
    open: boolean;
    busy: boolean;
    error: string;
}>();

const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'confirm'): void;
}>();

const backdropRef = ref<HTMLElement | null>(null);
const confirmRef = ref<HTMLButtonElement | null>(null);

function requestClose(): void {
    if (!props.busy) {emit('close');}
}

useTavernPhoneModal({
    open: toRef(props, 'open'),
    modalRef: backdropRef,
    initialFocus: () => confirmRef.value,
    canClose: () => !props.busy,
    close: requestClose,
});

function closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {requestClose();}
}
</script>

<template>
  <Transition name="tavern-pet-dialog">
    <div
      v-if="open"
      ref="backdropRef"
      class="tavern-pet-dialog-backdrop"
      :data-tavern-phone-modal="open ? 'pet-leave' : undefined"
      @click="closeFromBackdrop"
    >
      <section
        class="tavern-pet-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="tavern-pet-leave-title"
        aria-describedby="tavern-pet-leave-copy"
      >
        <small>GOODBYE / GLOBAL</small>
        <h3 id="tavern-pet-leave-title">
          让它离开？
        </h3>
        <p id="tavern-pet-leave-copy">
          它的身份、成长、窝、聊天和所有痕迹都会被清空；任何会话都不会再看见它。已经花掉的小白币不会退回。
        </p>
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
            @click="requestClose"
          >
            留下它
          </button>
          <button
            ref="confirmRef"
            type="button"
            class="tavern-pet-danger"
            :disabled="busy"
            @click="emit('confirm')"
          >
            {{ busy ? '正在离开…' : '确认让它离开' }}
          </button>
        </div>
      </section>
    </div>
  </Transition>
</template>
