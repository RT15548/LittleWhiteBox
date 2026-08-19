<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{
    title: string;
    message: string;
    details: string[];
    confirmText: string;
    busy: boolean;
    error?: string;
    tone?: 'default' | 'danger' | 'warning';
}>();

const emit = defineEmits<{
    (event: 'confirm'): void;
    (event: 'cancel'): void;
}>();

const cancelRef = ref<HTMLButtonElement | null>(null);
let returnFocus: HTMLElement | null = null;

function handleEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || props.busy) {return;}
    event.preventDefault();
    event.stopImmediatePropagation();
    emit('cancel');
}

onMounted(async () => {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.addEventListener('keydown', handleEscape, true);
    await nextTick();
    cancelRef.value?.focus({ preventScroll: true });
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscape, true);
    if (returnFocus?.isConnected) {
        try {returnFocus.focus({ preventScroll: true });} catch {returnFocus.focus();}
    }
});
</script>

<template>
  <Teleport to="body">
    <div
      class="tavern-task-dialog-backdrop"
      data-tavern-phone-modal="task-action"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="tavern-task-dialog-title"
      @click.self="!busy && emit('cancel')"
    >
      <section
        class="tavern-task-dialog"
        :class="`is-${tone || 'default'}`"
      >
        <header>
          <strong id="tavern-task-dialog-title">{{ title }}</strong>
        </header>
        <p>{{ message }}</p>
        <ul v-if="details.length">
          <li
            v-for="detail in details"
            :key="detail"
          >
            {{ detail }}
          </li>
        </ul>
        <div
          v-if="error"
          class="tavern-task-inline-alert"
          role="status"
        >
          <strong>操作未完成</strong>
          <p>{{ error }}</p>
        </div>
        <footer>
          <button
            ref="cancelRef"
            type="button"
            :disabled="busy"
            @click="emit('cancel')"
          >
            取消
          </button>
          <button
            type="button"
            :disabled="busy"
            @click="emit('confirm')"
          >
            {{ busy ? '正在提交' : confirmText }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
