<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import type {
    TavernCommunicationContactRecord,
    TavernCommunicationMessageRecord,
} from '../../../shared/session-db';

const props = defineProps<{
    contact: TavernCommunicationContactRecord;
    messages: TavernCommunicationMessageRecord[];
    sending: boolean;
    canSend: boolean;
    status: string;
    lastResult?: 'reply' | 'silent' | 'unavailable';
    blockedReason: string;
}>();

const draft = defineModel<string>('draft', { required: true });
const emit = defineEmits<{
    (event: 'back'): void;
    (event: 'retry', message: TavernCommunicationMessageRecord): void;
    (event: 'send'): void;
}>();

const scrollRef = ref<HTMLElement | null>(null);

function initial(name = ''): string {
    return Array.from(String(name || '').trim())[0] || '·';
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) {return;}
    event.preventDefault();
    if (props.canSend) {emit('send');}
}

watch(
    () => `${props.messages.length}:${props.sending}:${props.messages.at(-1)?.updatedAt || 0}`,
    async () => {
        await nextTick();
        scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'smooth' });
    },
    { immediate: true },
);
</script>

<template>
  <section class="tavern-phone-app tavern-phone-conversation">
    <header class="tavern-phone-conversation-head">
      <button
        type="button"
        class="tavern-phone-back-button"
        aria-label="返回消息列表"
        @click="emit('back')"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="m15 4-8 8 8 8" /></svg>
      </button>
      <div class="tavern-phone-conversation-person">
        <span class="tavern-phone-contact-avatar is-small">
          <img
            v-if="contact.avatar"
            :src="contact.avatar"
            alt=""
          >
          <b v-else>{{ initial(contact.name) }}</b>
        </span>
        <strong>{{ contact.name }}</strong>
        <span>{{ sending ? '正在输入…' : '消息' }}</span>
      </div>
      <span class="tavern-phone-head-spacer" />
    </header>
    <div
      ref="scrollRef"
      class="tavern-phone-message-scroll"
    >
      <button
        v-for="message in messages"
        :key="`${message.threadId}:${message.sequence}`"
        type="button"
        class="tavern-phone-message-row"
        :class="[
          `is-${message.role}`,
          `is-${message.status}`,
        ]"
        :disabled="message.status !== 'failed'"
        :title="message.status === 'failed' ? '轻触重新发送' : ''"
        @click="message.status === 'failed' && emit('retry', message)"
      >
        <span class="tavern-phone-message-bubble">{{ message.content }}</span>
        <span
          v-if="message.status !== 'sent'"
          class="tavern-phone-message-meta"
        >
          {{ message.status === 'failed' ? '发送失败 · 轻触重试' : '发送中' }}
        </span>
      </button>
      <div
        v-if="sending"
        class="tavern-phone-typing-row"
        aria-label="对方正在输入"
      >
        <span><i /><i /><i /></span>
      </div>
      <div
        v-if="!sending && (status || lastResult === 'silent' || lastResult === 'unavailable')"
        class="tavern-phone-thread-status"
      >
        {{ status || (lastResult === 'unavailable' ? '暂时无法联系到对方' : '对方暂时没有回复') }}
      </div>
    </div>
    <footer class="tavern-phone-composer">
      <div class="tavern-phone-imessage-field">
        <textarea
          v-model="draft"
          rows="1"
          maxlength="2000"
          :placeholder="blockedReason || '发消息…'"
          :disabled="!!blockedReason && !sending"
          @keydown="handleKeydown"
        />
        <button
          type="button"
          :disabled="!canSend"
          aria-label="发送消息"
          @click="emit('send')"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          ><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        </button>
      </div>
    </footer>
  </section>
</template>
