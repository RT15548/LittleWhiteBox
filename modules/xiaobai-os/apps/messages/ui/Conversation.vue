<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { ContactView, ThreadPage, MessagesClientState, PendingOutgoingMessage, MessageSendFailure } from '../types.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { OutgoingMessage } from '../application/image-upload.js';
import MessageIcon from './MessageIcon.vue';
import MessageBubble from './MessageBubble.vue';
import MessageComposer from './MessageComposer.vue';
import ContactAvatar from './ContactAvatar.vue';
import DeliveryStatus from './DeliveryStatus.vue';
import type { MessageDraft } from './draft.js';
const draft = defineModel<MessageDraft>('draft', { required: true });
const props = defineProps<{ contact: ContactView; page: ThreadPage; bridge: XiaobaiOsAppProps['bridge']; chatIdentity: string; disabled: boolean; sendDisabled: boolean; busy: MessagesClientState['busy']; outgoing: PendingOutgoingMessage | null; sendFailure: MessageSendFailure | null; sendError: MessageSendFailure | null; working: boolean; pendingSave: boolean; retryDisabled: boolean; loading: boolean; loadMore: () => Promise<void>; media: MessagesClientState['media']; waitingFor: string }>();
defineEmits<{ back: []; details: []; send: [payload: OutgoingMessage]; retry: [id: string]; discard: [id: string]; deleteImage: [messageId: string] }>();
const stage = computed(() => props.busy?.contactId === props.contact.id ? props.busy.stage : '');
const replying = computed(() => ['replying', 'summarizing', 'saving-reply'].includes(stage.value));
function failure(messageId: string): string | undefined {
    return [props.sendFailure, props.sendError].find(error => error?.contactId === props.contact.id && error.messageId === messageId)?.message;
}
const scroller = ref<HTMLElement | null>(null);
let bottom = true; let older = false;
function scroll() {const el = scroller.value; if (el) {bottom = el.scrollHeight - el.clientHeight - el.scrollTop < 70;}}
async function stick() {await nextTick(); if (bottom && !older && scroller.value) {scroller.value.scrollTop = scroller.value.scrollHeight;}}
watch(() => [props.page.messages.at(-1)?.id, props.outgoing?.messageId, stage.value, props.sendFailure, props.sendError], stick, { immediate: true });
async function more() {
    const el = scroller.value; if (!el || older) {return;} older = true;
    const height = el.scrollHeight; const top = el.scrollTop;
    try {await props.loadMore(); await nextTick(); el.scrollTop = top + el.scrollHeight - height;}
    finally {older = false; scroll();}
}
defineExpose({ sent() {bottom = true; void stick();} });
</script>
<template>
    <section class="messages-conversation">
        <header class="messages-thread-header"><button class="messages-icon-button" aria-label="返回信息" @click="$emit('back')"><MessageIcon name="back" /></button><ContactAvatar :identity="contact.id" :name="contact.name" small /><div><h2>{{ contact.name }}</h2></div><button class="messages-icon-button" aria-label="联系人详情" @click="$emit('details')"><MessageIcon name="more" /></button></header>
        <div ref="scroller" class="messages-thread-scroll" @scroll="scroll">
            <button v-if="page.hasMore" class="messages-older" :disabled="loading" @click="more">{{ loading ? '读取中…' : '查看更早的消息' }}</button>
            <p v-if="loading && !page.messages.length" class="messages-thread-start">正在读取消息…</p>
            <template v-for="(message, index) in page.messages" :key="message.id">
                <time v-if="index === 0 || message.createdAt - page.messages[index - 1].createdAt > 300000" class="messages-time">{{ new Date(message.createdAt).toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</time>
                <MessageBubble :message="message" :bridge="bridge" :chat-identity="chatIdentity" :media="media" :disabled="disabled" @resize="stick" @delete-image="$emit('deleteImage', $event)" />
                <DeliveryStatus v-if="message.id === page.retryMessageId && !replying" :sending="busy?.messageId === message.id && ['saving', 'uploading'].includes(stage)" :error="failure(message.id)" :pending-save="pendingSave" :disabled="retryDisabled" @retry="$emit('retry', message.id)" />
            </template>
            <template v-if="outgoing">
                <div class="messages-bubble-row outgoing">
                    <div class="messages-bubble" :class="{ 'messages-bubble-image': outgoing.payload.type === 'image' }">
                        <p v-if="outgoing.payload.type === 'text'">{{ outgoing.payload.text }}</p>
                        <template v-else><img class="messages-pending-image" :src="outgoing.payload.upload.dataUrl" :alt="outgoing.payload.upload.name" @load="stick"><p v-if="outgoing.payload.description" class="messages-image-caption">{{ outgoing.payload.description }}</p></template>
                    </div>
                </div>
                <DeliveryStatus :sending="working || busy?.messageId === outgoing.messageId" :error="failure(outgoing.messageId) || '发送未完成'" :pending-save="pendingSave" :disabled="retryDisabled" discard @retry="$emit('retry', outgoing.messageId)" @discard="$emit('discard', outgoing.messageId)" />
            </template>
            <div v-if="replying" class="messages-typing" role="status"><span><i /><i /><i /></span>对方正在输入…</div>
        </div>
        <MessageComposer v-model:draft="draft" :disabled="sendDisabled" :sending="false" :waiting-for="waitingFor" @send="$emit('send', $event)" />
    </section>
</template>
