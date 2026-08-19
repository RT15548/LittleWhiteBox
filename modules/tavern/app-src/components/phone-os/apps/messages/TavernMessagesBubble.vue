<script setup lang="ts">
import {
    computed,
    nextTick,
    onActivated,
    onBeforeUnmount,
    onDeactivated,
    onMounted,
    ref,
    watch,
} from 'vue';
import type { TavernCommunicationMessageRecord } from '../../../../../shared/session-db';
import type {
    TavernMessageImageState,
    TavernMessageVoiceState,
} from '../../../../features/phone-os/apps/messages/tavern-message-media';

const props = defineProps<{
    message: TavernCommunicationMessageRecord;
    imageState?: TavernMessageImageState;
    voiceState?: TavernMessageVoiceState;
}>();

const emit = defineEmits<{
    (event: 'ensure-image', message: TavernCommunicationMessageRecord): void;
    (event: 'retry-image', message: TavernCommunicationMessageRecord): void;
    (event: 'cancel-image', message: TavernCommunicationMessageRecord): void;
    (event: 'release-image', message: TavernCommunicationMessageRecord): void;
    (event: 'toggle-voice', message: TavernCommunicationMessageRecord): void;
}>();

const imageExpanded = ref(false);
const bubbleRef = ref<HTMLElement | null>(null);
const imagePreviewButtonRef = ref<HTMLButtonElement | null>(null);
const lightboxCloseButtonRef = ref<HTMLButtonElement | null>(null);
let imageObserver: IntersectionObserver | null = null;
let wasDeactivated = false;
let restoreImagePreviewFocus = false;
const voiceStatus = computed(() => props.voiceState?.status || 'idle');
const imageStatus = computed(() => props.imageState?.status || 'idle');
const voiceLabel = computed(() => {
    if (voiceStatus.value === 'loading') {return '正在准备';}
    if (voiceStatus.value === 'playing') {return props.voiceState?.duration ? `${Math.ceil(props.voiceState.duration)} 秒` : '正在播放';}
    if (voiceStatus.value === 'error') {return '重新播放';}
    return '播放语音';
});
const imageProgressLabel = computed(() => {
    if (imageStatus.value === 'queued') {
        return props.imageState?.queueAhead ? `前方 ${props.imageState.queueAhead} 张` : '已进入生成队列';
    }
    if (imageStatus.value === 'waiting') {
        return props.imageState?.waitSeconds ? `${props.imageState.waitSeconds} 秒后继续` : '生成队列冷却中';
    }
    return '正在还原图片';
});

function ensureImage() {
    if (props.message.payload.type === 'image' && imageStatus.value === 'idle') {
        emit('ensure-image', props.message);
    }
}

function focusElement(element: HTMLElement | null | undefined) {
    if (!element) {return;}
    try {
        element.focus({ preventScroll: true });
    } catch {
        element.focus();
    }
}

function openImagePreview() {
    restoreImagePreviewFocus = true;
    imageExpanded.value = true;
}

function closeImagePreview(restoreFocus = true) {
    restoreImagePreviewFocus = restoreFocus;
    imageExpanded.value = false;
}

function handleEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !imageExpanded.value) {return;}
    event.preventDefault();
    event.stopImmediatePropagation();
    closeImagePreview();
}

function releaseImage() {
    if (props.message.payload.type === 'image') {emit('release-image', props.message);}
}

function stopImageObservation() {
    imageObserver?.disconnect();
    imageObserver = null;
}

async function startImageObservation() {
    stopImageObservation();
    if (props.message.payload.type !== 'image') {return;}
    await nextTick();
    const target = bubbleRef.value;
    if (!target || typeof IntersectionObserver === 'undefined') {
        ensureImage();
        return;
    }
    imageObserver = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) {
            ensureImage();
        } else if (!imageExpanded.value) {
            releaseImage();
        }
    }, { rootMargin: '320px 0px' });
    imageObserver.observe(target);
}

watch(imageExpanded, async (expanded) => {
    if (expanded) {
        document.addEventListener('keydown', handleEscape, true);
        await nextTick();
        if (imageExpanded.value) {focusElement(lightboxCloseButtonRef.value);}
        return;
    }
    document.removeEventListener('keydown', handleEscape, true);
    if (!restoreImagePreviewFocus || wasDeactivated) {return;}
    restoreImagePreviewFocus = false;
    await nextTick();
    focusElement(imagePreviewButtonRef.value);
});

onMounted(() => {
    void startImageObservation();
});

onActivated(() => {
    if (!wasDeactivated) {return;}
    wasDeactivated = false;
    void startImageObservation();
});

onDeactivated(() => {
    wasDeactivated = true;
    closeImagePreview(false);
    stopImageObservation();
    releaseImage();
});

onBeforeUnmount(() => {
    closeImagePreview(false);
    stopImageObservation();
    releaseImage();
    document.removeEventListener('keydown', handleEscape, true);
});
</script>

<template>
  <span
    v-if="message.payload.type === 'text'"
    class="tavern-phone-message-bubble is-text"
  >{{ message.payload.text }}</span>

  <span
    v-else-if="message.payload.type === 'voice'"
    class="tavern-phone-message-bubble is-voice"
    :class="`is-${voiceStatus}`"
  >
    <button
      type="button"
      class="tavern-phone-voice-control"
      :aria-label="voiceStatus === 'playing' || voiceStatus === 'loading' ? '停止语音' : '播放语音'"
      @click="emit('toggle-voice', message)"
    >
      <span
        class="tavern-phone-voice-play"
        aria-hidden="true"
      >
        <svg
          v-if="voiceStatus !== 'playing' && voiceStatus !== 'loading'"
          viewBox="0 0 24 24"
        ><path d="m9 7 8 5-8 5Z" /></svg>
        <i v-else-if="voiceStatus === 'loading'" />
        <svg
          v-else
          viewBox="0 0 24 24"
        ><path d="M8 7h3v10H8zM14 7h3v10h-3z" /></svg>
      </span>
      <span
        class="tavern-phone-voice-wave"
        aria-hidden="true"
      >
        <i
          v-for="index in 15"
          :key="index"
        />
      </span>
      <small>{{ voiceLabel }}</small>
    </button>
    <span class="tavern-phone-voice-transcript">{{ message.payload.transcript }}</span>
    <span
      v-if="voiceState?.error"
      class="tavern-phone-media-error"
    >{{ voiceState.error }}</span>
  </span>

  <span
    v-else
    ref="bubbleRef"
    class="tavern-phone-message-bubble is-image"
    :class="`is-${imageStatus}`"
  >
    <button
      v-if="imageState?.url"
      ref="imagePreviewButtonRef"
      type="button"
      class="tavern-phone-image-preview"
      :aria-label="`查看大图：${message.payload.description}`"
      @click="openImagePreview"
    >
      <img
        :src="imageState.url"
        :alt="message.payload.description"
      >
    </button>
    <span
      v-else-if="imageStatus !== 'error'"
      class="tavern-phone-image-loading"
      role="status"
    >
      <span
        class="tavern-phone-image-placeholder-icon"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z" /><circle
          cx="9"
          cy="9"
          r="1.6"
        /><path d="m5 17 4.5-4 3.2 2.8 2.4-2.2L20 18" /></svg>
      </span>
      <small>{{ imageProgressLabel }}</small>
      <button
        v-if="imageStatus !== 'idle'"
        type="button"
        class="tavern-phone-image-cancel"
        @click="emit('cancel-image', message)"
      >取消</button>
    </span>
    <span
      v-else
      class="tavern-phone-image-failed"
      role="status"
    >
      <span>{{ imageState?.error || '图片暂时无法生成' }}</span>
      <button
        type="button"
        @click="emit('retry-image', message)"
      >重试</button>
    </span>
    <span class="tavern-phone-image-description">{{ message.payload.description }}</span>
  </span>

  <Teleport to="body">
    <div
      v-if="imageExpanded && message.payload.type === 'image' && imageState?.url"
      class="tavern-phone-image-lightbox"
      data-tavern-phone-modal="image-preview"
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      @click.self="closeImagePreview()"
    >
      <button
        ref="lightboxCloseButtonRef"
        type="button"
        aria-label="关闭图片预览"
        @click="closeImagePreview()"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
      <img
        :src="imageState.url"
        :alt="message.payload.description"
      >
      <p>{{ message.payload.description }}</p>
    </div>
  </Teleport>
</template>
