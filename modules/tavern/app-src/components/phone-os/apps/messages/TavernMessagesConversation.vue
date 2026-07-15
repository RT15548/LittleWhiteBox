<script setup lang="ts">
import { nextTick, onActivated, onDeactivated, ref, watch } from 'vue';
import type {
    TavernCommunicationContactRecord,
    TavernCommunicationMessageRecord,
} from '../../../../../shared/session-db';

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
const composerRef = ref<HTMLTextAreaElement | null>(null);
let shouldFollowLatest = true;
let messageLengthWhenDeactivated = props.messages.length;

function initial(name = ''): string {
    return Array.from(String(name || '').trim())[0] || '·';
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) {return;}
    event.preventDefault();
    if (props.canSend) {emit('send');}
}

function resizeComposer() {
    const element = composerRef.value;
    if (!element) {return;}
    element.style.height = '0px';
    element.style.height = `${Math.min(element.scrollHeight, 112)}px`;
}

function handleMessageScroll() {
    const element = scrollRef.value;
    if (!element) {return;}
    shouldFollowLatest = element.scrollHeight - element.scrollTop - element.clientHeight < 72;
}

watch(
    () => `${props.messages.length}:${props.sending}:${props.messages.at(-1)?.updatedAt || 0}`,
    async () => {
        await nextTick();
        if (shouldFollowLatest || props.sending) {
            scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'smooth' });
        }
    },
    { immediate: true },
);

watch(draft, async () => {
    await nextTick();
    resizeComposer();
});

watch(() => props.contact.id, async () => {
    shouldFollowLatest = true;
    await nextTick();
    scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'auto' });
});

onDeactivated(() => {
    messageLengthWhenDeactivated = props.messages.length;
});

onActivated(async () => {
    if (props.messages.length !== messageLengthWhenDeactivated) {shouldFollowLatest = true;}
    await nextTick();
    resizeComposer();
    if (shouldFollowLatest) {
        scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'auto' });
    }
});
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
      </div>
      <span class="tavern-phone-head-spacer" />
    </header>
    <div
      ref="scrollRef"
      class="tavern-phone-message-scroll"
      @scroll.passive="handleMessageScroll"
    >
      <div
        v-for="message in messages"
        :key="`${message.threadId}:${message.sequence}`"
        class="tavern-phone-message-row"
        :class="[
          `is-${message.role}`,
          `is-${message.status}`,
        ]"
      >
        <span class="tavern-phone-message-bubble">{{ message.content }}</span>
        <button
          v-if="message.status === 'failed'"
          type="button"
          class="tavern-phone-message-meta"
          aria-label="重新发送这条消息"
          @click="emit('retry', message)"
        >
          发送失败 · 重新发送
        </button>
        <span
          v-else-if="message.status === 'pending'"
          class="tavern-phone-message-meta"
        >发送中</span>
      </div>
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
          ref="composerRef"
          v-model="draft"
          rows="1"
          maxlength="2000"
          :placeholder="blockedReason || '发消息…'"
          :disabled="!!blockedReason && !sending"
          @input="resizeComposer"
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
      <p
        v-if="blockedReason && !sending"
        class="tavern-phone-composer-reason"
        role="status"
      >
        {{ blockedReason }}
      </p>
    </footer>
  </section>
</template>
