<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue';
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { MessageSendFailure, MessagesClientState, PendingOutgoingMessage, ThreadPage } from '../types.js';
import type { OutgoingMessage } from '../application/image-upload.js';
import ContactList from './ContactList.vue';
import Conversation from './Conversation.vue';
import MessageIcon from './MessageIcon.vue';
import ContactAvatar from './ContactAvatar.vue';
import { emptyDraft, type MessageDraft } from './draft.js';
import { createMessageId } from '../application/identity.js';
import './messages.css';

const props = defineProps<XiaobaiOsAppProps>();
const state = ref(props.initialState as MessagesClientState);
const selected = ref(''); const page = ref<ThreadPage>({ contactId: '', messages: [], hasMore: false, retryMessageId: null });
const loading = ref(false); const working = ref(false); const error = ref('');
const threadError = ref('');
const conversation = ref<InstanceType<typeof Conversation> | null>(null);
const dialogOpen = ref(false); const mode = ref<'add' | 'detail' | 'delete' | 'delete-image' | 'sync' | 'recover' | 'adopt'>('add');
const imageToDelete = ref('');
const name = ref(''); const note = ref(''); const personSearch = ref('');
const contactAction = ref(createMessageId());
let alive = true; let threadRequest = 0;
const drafts = reactive(new Map<string, MessageDraft>());
const draft = computed({ get: () => drafts.get(selected.value) ?? emptyDraft(), set: value => {drafts.set(selected.value, value);} });
const submitted = ref<PendingOutgoingMessage | null>(null);
const sendError = ref<MessageSendFailure | null>(null);
const outgoing = computed(() => state.value.outgoing ?? submitted.value);
const pendingBubble = computed(() => outgoing.value?.contactId === selected.value
    && !page.value.messages.some(message => message.id === outgoing.value?.messageId) ? outgoing.value : null);
const contact = computed(() => state.value.contacts.find(person => person.id === selected.value));
const waitingFor = computed(() => state.value.busy && state.value.busy.contactId !== selected.value
    ? state.value.contacts.find(person => person.id === state.value.busy?.contactId)?.name ?? '另一位联系人' : '');
const needsSave = computed(() => state.value.pendingSave || ['unconfirmed', 'conflict', 'failed'].includes(state.value.fileState));
const disabled = computed(() => working.value || !!state.value.busy || state.value.pendingSave || state.value.fileState !== 'ready' || state.value.generationActive);
const people = computed(() => state.value.knownPeople.filter(person => !state.value.contacts.some(contact => contact.name === person.name)
    && `${person.name} ${person.aliases.join(' ')}`.toLocaleLowerCase().includes(personSearch.value.toLocaleLowerCase())));
async function request<T>(type: string, payload: Record<string, unknown> = {}): Promise<T> {
    const response = await props.bridge.request(type, { chatIdentity: state.value.chatIdentity, ...payload }, 60000) as { result: T };
    return response.result;
}
async function readThread(older = false, replace = false) {
    const id = selected.value; if (!id) {return;}
    const token = ++threadRequest; loading.value = true; threadError.value = '';
    try {
        const next = await request<ThreadPage>('messages/thread', { contactId: id, ...(older ? { before: page.value.messages[0]?.seq } : {}) });
        if (!alive || token !== threadRequest || selected.value !== id) {return;}
        const overlap = next.messages.some(message => page.value.messages.some(previous => previous.id === message.id));
        // A newly received page may be more than one page ahead (e.g. resuming a
        // suspended WebView). Never merge two disjoint ranges and hide the gap.
        const previous = !replace && (older || overlap) ? page.value.messages : [];
        const combined = new Map([...previous, ...next.messages].map(message => [message.id, message]));
        const messages = [...combined.values()].sort((left, right) => left.seq - right.seq);
        page.value = { ...next, messages, hasMore: replace || older || !overlap || messages.length <= 50 ? next.hasMore : page.value.hasMore };
        if (submitted.value?.contactId === id && messages.some(message => message.id === submitted.value?.messageId)) {submitted.value = null; sendError.value = null;}
    } catch {if (alive && token === threadRequest && selected.value === id) {threadError.value = '消息暂时无法读取。';}}
    finally {if (token === threadRequest) {loading.value = false;}}
}
function apply(next: MessagesClientState) {
    if (!alive || next.chatIdentity !== state.value.chatIdentity) {return;}
    const previousSeq = contact.value?.lastSeq;
    const wasPendingSave = needsSave.value;
    state.value = next;
    for (const id of drafts.keys()) {if (!next.contacts.some(person => person.id === id)) {drafts.delete(id);}}
    if (submitted.value && !next.contacts.some(contact => contact.id === submitted.value?.contactId)) {submitted.value = null; sendError.value = null;}
    if (selected.value && !next.contacts.some(contact => contact.id === selected.value)) {back();}
    else if (selected.value && (previousSeq !== contact.value?.lastSeq || wasPendingSave && !needsSave.value)) {
        // A confirmed pending deletion may not change the last message. Reload
        // authoritative history instead of merging deleted rows back into view.
        void readThread(false, wasPendingSave && !needsSave.value);
    }
}
const unsubscribe = props.bridge.subscribe(event => {if (event.type === 'messages/state') {apply((event.payload as { state: MessagesClientState }).state);}});
function select(id: string) {
    selected.value = id; error.value = ''; page.value = { contactId: id, messages: [], hasMore: false, retryMessageId: null }; void readThread();
}
function back() {selected.value = ''; threadRequest++; threadError.value = ''; page.value = { contactId: '', messages: [], hasMore: false, retryMessageId: null };}
useAppBack(() => { back(); return true; }, () => !!selected.value);
async function run(task: () => Promise<void>) {
    if (working.value) {return;} working.value = true; error.value = '';
    try {await task();} catch (cause) {if (alive) {error.value = cause instanceof Error && cause.message !== 'host_request_timeout' ? cause.message : '等待操作结果超时，请核实保存状态后重试。';}}
    finally {working.value = false;}
}
function send(payload: OutgoingMessage) {
    if (disabled.value || outgoing.value) {return;}
    const input = { contactId: selected.value, messageId: `input:${createMessageId()}`, payload, createdAt: Date.now() };
    submitted.value = input; sendError.value = null;
    drafts.delete(input.contactId);
    conversation.value?.sent();
    void deliver(input.contactId, input.messageId, input);
}
async function deliver(contactId: string, messageId: string, input?: PendingOutgoingMessage) {
    if (working.value) {return;}
    working.value = true; sendError.value = null; error.value = '';
    try {
        if (needsSave.value) {
            apply(await request(state.value.pendingSave ? 'messages/confirm' : 'messages/refresh'));
            if (needsSave.value) {return;}
        }
        // Build a plain bridge DTO: retry input may come from Vue-reactive state.
        const payload = input?.payload.type === 'image'
            ? { type: 'image', description: input.payload.description, upload: { ...input.payload.upload } }
            : input ? { type: 'text', text: input.payload.text } : undefined;
        const next = input
            ? await request<MessagesClientState>('messages/send', { contactId, actionId: messageId.slice('input:'.length), payload })
            : await request<MessagesClientState>('messages/retry', { contactId, messageId });
        apply(next);
    } catch (cause) {
        if (alive) {sendError.value = { contactId, messageId, message: cause instanceof Error && cause.message !== 'host_request_timeout' ? cause.message : '尚未确认发送结果，可以重试。' };}
    } finally {working.value = false;}
}
function retry(messageId: string) {
    const input = outgoing.value?.messageId === messageId ? outgoing.value : undefined;
    void deliver(selected.value, messageId, input);
}
function discard(messageId: string) {
    void run(async () => {
        apply(await request('messages/discard-send', { messageId }));
        if (submitted.value?.messageId === messageId) {submitted.value = null;}
        sendError.value = null;
        await readThread();
    });
}
function operation(type: string) {void run(async () => apply(await request(type)));}
function sync() {void run(async () => {apply(await request('messages/sync')); close();});}
function open(next: typeof mode.value) {
    mode.value = next; error.value = ''; name.value = ''; note.value = contact.value?.note ?? ''; personSearch.value = '';
    contactAction.value = createMessageId(); dialogOpen.value = true;
}
function close() {dialogOpen.value = false;}
function backDialog() {
    if (working.value) { return; }
    if (mode.value === 'delete') { mode.value = 'detail'; }
    else if (mode.value === 'recover') { mode.value = 'sync'; }
    else { close(); }
}
function add(personName = name.value) {
    if (!personName.trim() || disabled.value) {return;}
    void run(async () => {
        const result = await request<{ contactId: string; state: MessagesClientState }>('messages/contact/add', { actionId: contactAction.value, name: personName.trim(), note: note.value.trim() });
        apply(result.state); close(); select(result.contactId);
    });
}
function saveNote() {void run(async () => {apply(await request('messages/contact/note', { contactId: selected.value, note: note.value })); close();});}
function remove() {void run(async () => {apply(await request('messages/contact/delete', { contactId: selected.value })); close(); back();});}
function confirmImageDelete(messageId: string) {imageToDelete.value = messageId; void open('delete-image');}
function removeImage() {
    const contactId = selected.value; const messageId = imageToDelete.value;
    void run(async () => {
        const result = await request<{ state: MessagesClientState; retryMessageId: string | null }>(
            'messages/message/delete-image', { contactId, messageId });
        apply(result.state);
        if (alive && selected.value === contactId) {
            // Deleting an older image may leave lastSeq unchanged. Update this
            // loaded window explicitly, without jumping back to the latest page.
            threadRequest++; loading.value = false;
            page.value = { ...page.value, messages: page.value.messages.filter(item => item.id !== messageId)
                .map(item => item.replyTo === messageId ? { ...item, replyTo: null } : item), retryMessageId: result.retryMessageId };
        }
        close();
    });
}
function recover() {void run(async () => {apply(await request('messages/recover')); close();});}
function adoptServer() {
    void run(async () => {
        apply(await request('messages/adopt-server-state'));
        if (state.value.fileState === 'ready' && !state.value.pendingSave) {submitted.value = null; sendError.value = null; close();}
        else {error.value = '暂时未能采用服务器版本，请检查网络后重试。当前记录保持不变。';}
    });
}
onUnmounted(() => {alive = false; threadRequest++; unsubscribe();});
</script>
<template>
    <main class="messages-app">
        <div v-if="needsSave" class="messages-banner" role="status">
            <span>{{ state.fileState === 'conflict' ? '服务器上的存档已有变化，请选择如何处理。' : '有消息还在等待保存确认，已保存的记录不会丢失。' }}</span>
            <div class="messages-save-actions">
                <button :disabled="working || !!state.busy" @click="operation(state.pendingSave ? 'messages/confirm' : 'messages/refresh')">检查保存</button>
                <button v-if="state.fileState === 'conflict'" :disabled="working || !!state.busy || state.generationActive" @click="open('adopt')">采用服务器版本</button>
            </div>
        </div>
        <div v-else-if="state.unsynced && !state.busy" class="messages-banner" role="status"><span>{{ state.unsynced }} 条消息已保留，尚未写入主聊天。</span><button :disabled="disabled" @click="open('sync')">查看</button></div>
        <div v-if="state.generationActive" class="messages-notice">故事正在继续，稍后就能发送消息。</div>
        <p v-if="error || state.error" class="messages-error" role="alert">{{ error || state.error }}</p>
        <div v-if="threadError" class="messages-banner" role="alert"><span>{{ threadError }}</span><button :disabled="loading" @click="readThread()">重试读取</button></div>
        <Conversation v-if="contact" :key="contact.id" ref="conversation" v-model:draft="draft" :contact="contact" :page="page" :bridge="bridge" :chat-identity="state.chatIdentity" :disabled="disabled" :send-disabled="disabled || !!outgoing" :busy="state.busy" :outgoing="pendingBubble" :send-failure="state.sendFailure" :send-error="sendError" :working="working" :pending-save="needsSave" :retry-disabled="working || !!state.busy || state.generationActive || state.fileState === 'conflict'" :loading="loading" :load-more="() => readThread(true)" :media="state.media" :waiting-for="waitingFor" @back="back" @details="open('detail')" @send="send" @retry="retry" @discard="discard" @delete-image="confirmImageDelete" />
        <ContactList v-show="!contact" :contacts="state.contacts" :busy-contact-id="state.busy?.contactId ?? ''" :drafts="drafts" @select="select" @add="open('add')" />
        <AppDialog v-if="dialogOpen" class="messages-dialog" aria-labelledby="messages-dialog-title" :busy="working" @close="backDialog">
            <header><ContactAvatar v-if="mode === 'detail' && contact" :identity="contact.id" :name="contact.name" small /><h2 id="messages-dialog-title">{{ mode === 'add' ? '新的对话' : mode === 'detail' ? contact?.name : mode === 'delete' ? '删除联系人？' : mode === 'delete-image' ? '删除这条图片消息？' : mode === 'sync' ? '消息还未写入主聊天' : mode === 'adopt' ? '采用服务器版本？' : '在当前位置补记？' }}</h2><button class="messages-icon-button" aria-label="关闭" :disabled="working" @click="close"><MessageIcon name="close" /></button></header>
            <p v-if="error" class="messages-error" role="alert">{{ error }}</p>
            <template v-if="mode === 'add'">
                <label class="messages-search"><MessageIcon name="search" /><input v-model="personSearch" placeholder="查找已知人物" aria-label="查找已知人物"></label>
                <div class="messages-known-list"><button v-for="person in people" :key="person.name" :disabled="disabled" @click="add(person.name)"><ContactAvatar :identity="person.name" :name="person.name" small /><span>{{ person.name }}<small v-if="person.aliases.length">{{ person.aliases.join('、') }}</small></span><MessageIcon name="plus" /></button><p v-if="!people.length" class="messages-subtle">没有更多已知人物，可以在下面补充。</p></div>
                <details class="messages-manual"><summary>想联系的人不在这里？</summary><form @submit.prevent="add()"><label>姓名<input v-model="name" maxlength="120" required placeholder="对方的姓名"></label><label>身份说明（可选）<textarea v-model="note" maxlength="600" rows="2" placeholder="例如：住在隔壁的花店老板" /></label><button class="messages-primary" :disabled="disabled || !name.trim()">添加并聊天</button></form></details>
            </template>
            <form v-else-if="mode === 'detail'" @submit.prevent="saveNote"><label>身份说明 / 备注<textarea v-model="note" maxlength="600" rows="3" placeholder="帮助辨认这位联系人" /></label><button class="messages-primary" :disabled="disabled">保存备注</button><button type="button" class="messages-danger" :disabled="disabled" @click="mode = 'delete'">删除联系人与通讯记录</button></form>
            <template v-else-if="mode === 'delete'"><p>会删除信息 APP 内与 {{ contact?.name }} 的全部通讯和摘要，不能恢复。主聊天中的「私人信息」楼层不会删除，其他联系人不受影响。</p><button class="messages-danger" :disabled="disabled" @click="remove">确认删除</button><button class="messages-secondary" @click="mode = 'detail'">保留联系人</button></template>
            <template v-else-if="mode === 'delete-image'"><p>这条图片及配文将从信息 APP 中删除，不再发送给模型，不能恢复。其他消息保留。</p><p class="messages-subtle">主聊天里的记录和图库原图不会删除。</p><button class="messages-danger" :disabled="disabled" @click="removeImage">确认删除</button><button class="messages-secondary" @click="close">取消</button></template>
            <template v-else-if="mode === 'sync'"><p>信息 APP 已保留这些消息。重试只会补上主聊天里的记录，不会再次向对方发送，也不会重新生成回复。</p><button class="messages-primary" :disabled="disabled" @click="sync">重试写入</button><details class="messages-manual"><summary>原来的记录已被修改或删除？</summary><p>不会覆盖你的修改。需要这些消息继续进入剧情时，可以在当前位置另加一条补记。</p><button class="messages-secondary" :disabled="disabled" @click="mode = 'recover'">查看补记方式</button></details></template>
            <template v-else-if="mode === 'adopt'"><p>将读取服务器上的当前聊天小白 OS 存档，放弃本地尚未确认的修改。信息 APP 会显示服务器已保存的联系人和消息。</p><p class="messages-subtle">这项选择作用于当前聊天的整份 OS 存档，不会删除主聊天里的记录，也不会重新生成回复。</p><button class="messages-danger" :disabled="working || !!state.busy || state.generationActive" @click="adoptServer">确认采用服务器版本</button><button class="messages-secondary" :disabled="working" @click="close">暂不处理</button></template>
            <template v-else><p>先检查已有记录；仍未写入的消息会在主聊天当前位置标为「补录」，保留原发送时间。不会覆盖旧记录或恢复你删除的那一条。</p><button class="messages-primary" :disabled="disabled" @click="recover">确认补记</button><button class="messages-secondary" @click="close">暂不补记</button></template>
        </AppDialog>
    </main>
</template>
