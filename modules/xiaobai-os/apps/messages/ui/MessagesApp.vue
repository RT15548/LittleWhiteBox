<script setup lang="ts">
import { computed, nextTick, onUnmounted, reactive, ref } from 'vue';
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { MessageSendFailure, MessagesClientState, MessagesSettings as Settings, PendingOutgoingMessage, ThreadPage } from '../types.js';
import type { OutgoingMessage } from '../application/image-upload.js';
import ContactList from './ContactList.vue';
import MessagesSettings from './MessagesSettings.vue';
import Conversation from './Conversation.vue';
import MessageIcon from './MessageIcon.vue';
import ContactAvatar from './ContactAvatar.vue';
import { emptyDraft, type MessageDraft } from './draft.js';
import { createMessageId } from '../application/identity.js';
import { messageSyncCopy } from '../sync-copy.js';
import { MESSAGES_LAYOUT_COPY as layoutCopy } from './layout-copy.js';
import './messages.css';

const props = defineProps<XiaobaiOsAppProps>();
const state = ref(props.initialState as MessagesClientState);
const emptyPage = (contactId = ''): ThreadPage => ({ contactId, messages: [], hasMore: false, hasNewer: false, retryMessageId: null, revision: '', permissions: {} });
const selected = ref(''); const page = ref<ThreadPage>(emptyPage());
const loading = ref(false); const working = ref(false); const syncing = ref(false); const dismissing = ref(false); const error = ref('');
const threadError = ref('');
const conversation = ref<InstanceType<typeof Conversation> | null>(null);
const dialogOpen = ref(false); const mode = ref<'add' | 'detail' | 'delete' | 'delete-message' | 'sync' | 'recover' | 'adopt' | 'settings'>('add');
const syncDialog = computed(() => dialogOpen.value && (mode.value === 'sync' || mode.value === 'recover'));
const dialogClose = ref<HTMLButtonElement | null>(null);
const unsyncedCount = computed(() => state.value.syncNotice.messageIds.length);
const messageToDelete = ref('');
const operationRevision = ref('');
const deletionReason = computed(() => mode.value === 'delete' ? contact.value?.deleteReason ?? '' : page.value.permissions[messageToDelete.value]?.reason ?? '');
const name = ref(''); const note = ref(''); const personSearch = ref('');
const peopleStatus = ref<'loading' | 'ready' | 'failed'>('ready');
const contactAction = ref(createMessageId());
let alive = true; let threadRequest = 0; let dialogGeneration = 0;
// Navigation intent survives state refreshes; page.hasNewer describes only loaded records.
let latestRequested = false;
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
const needsSave = computed(() => state.value.pendingSave || state.value.pendingModification || ['unconfirmed', 'conflict', 'failed'].includes(state.value.fileState));
const disabled = computed(() => working.value || !!state.value.busy || state.value.operationPending
    || needsSave.value || state.value.fileState !== 'ready' || state.value.generationActive);
const people = computed(() => state.value.knownPeople.filter(person => !state.value.contacts.some(contact => contact.name === person.name)
    && `${person.name} ${person.aliases.join(' ')}`.toLocaleLowerCase().includes(personSearch.value.toLocaleLowerCase())));
async function request<T>(type: string, payload: Record<string, unknown> = {}): Promise<T> {
    const response = await props.bridge.request(type, { chatIdentity: state.value.chatIdentity, ...payload }, 60000) as { result: T };
    return response.result;
}
async function readThread(older = false, latest = false) {
    const id = selected.value; if (!id) {return;}
    if (older) {latestRequested = false;} else if (latest) {latestRequested = true;}
    const token = ++threadRequest; loading.value = true; threadError.value = '';
    try {
        const current = page.value;
        const next = await request<ThreadPage>('messages/thread', { contactId: id,
            ...(older ? { before: current.messages[0]?.seq, revision: current.revision }
                : !latestRequested && current.messages.length ? { window: { first: current.messages[0].seq, last: current.messages.at(-1)!.seq, latest: !current.hasNewer } } : {}) });
        if (!alive || token !== threadRequest || selected.value !== id) {return;}
        if (next.revision !== state.value.revision) {return;}
        const combine = older && current.revision === next.revision;
        const messages = combine ? [...next.messages, ...current.messages].slice(0, 100) : next.messages;
        page.value = { ...next, messages, hasNewer: combine ? messages.at(-1)?.id !== current.messages.at(-1)?.id || current.hasNewer : next.hasNewer,
            permissions: combine ? { ...current.permissions, ...next.permissions } : next.permissions };
        latestRequested = false;
        if (submitted.value?.contactId === id && messages.some(message => message.id === submitted.value?.messageId)) {submitted.value = null; sendError.value = null;}
    } catch {if (alive && token === threadRequest && selected.value === id) {threadError.value = '消息暂时无法读取。';}}
    finally {if (token === threadRequest) {loading.value = false;}}
}
function apply(next: MessagesClientState) {
    if (!alive || next.chatIdentity !== state.value.chatIdentity) {return;}
    const changed = state.value.revision !== next.revision || state.value.boundary !== next.boundary
        || state.value.fileState !== next.fileState || state.value.pendingSave !== next.pendingSave;
    state.value = next;
    // Once Host acknowledges this send, its outgoing/busy/failure state owns the
    // result, even when the user is reading another page or another contact.
    if (submitted.value && (next.outgoing?.messageId === submitted.value.messageId
        || next.busy?.messageId === submitted.value.messageId
        || next.contacts.some(person => person.lastMessageId === submitted.value!.messageId))) {submitted.value = null; sendError.value = null;}
    for (const id of drafts.keys()) {if (!next.contacts.some(person => person.id === id)) {drafts.delete(id);}}
    if (submitted.value && !next.contacts.some(contact => contact.id === submitted.value?.contactId)) {submitted.value = null; sendError.value = null;}
    if (selected.value && !next.contacts.some(contact => contact.id === selected.value)) {back();}
    else if (selected.value && changed) {void readThread();}
}
const unsubscribe = props.bridge.subscribe(event => {if (event.type === 'messages/state') {apply((event.payload as { state: MessagesClientState }).state);}});
function select(id: string) {
    if (id === selected.value) { return; }
    selected.value = id; latestRequested = false; error.value = ''; page.value = emptyPage(id); void readThread();
}
function back() {selected.value = ''; latestRequested = false; threadRequest++; threadError.value = ''; page.value = emptyPage();}
useAppBack(() => { back(); return true; }, () => !!selected.value);
async function run(task: () => Promise<void>, showFailure: () => boolean = () => true) {
    if (working.value) {return;} working.value = true; error.value = '';
    try {await task();} catch (cause) {if (alive && showFailure()) {error.value = cause instanceof Error && cause.message !== 'host_request_timeout' ? cause.message : messageSyncCopy.operationTimeout;}}
    finally {working.value = false;}
}
function send(payload: OutgoingMessage) {
    if (disabled.value || outgoing.value) {return;}
    const input = { contactId: selected.value, messageId: `input:${createMessageId()}`, payload, createdAt: Date.now() };
    submitted.value = input; sendError.value = null;
    drafts.delete(input.contactId);
    // Keep history marked as history until the latest page has actually arrived.
    void readThread(false, true);
    conversation.value?.sent();
    void deliver(input.contactId, input.messageId, input);
}
async function deliver(contactId: string, messageId: string, input?: PendingOutgoingMessage) {
    if (working.value) {return;}
    working.value = true; sendError.value = null; error.value = '';
    try {
        if (needsSave.value) {
            apply(await request('messages/confirm'));
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
        if (alive) {sendError.value = { contactId, messageId, message: cause instanceof Error && cause.message !== 'host_request_timeout' ? cause.message : '还不确定是否发送成功，可以重试。' };}
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
function saveSettings(settings: Settings) {void run(async () => {apply(await request('messages/settings', { settings })); close();});}
function sync() {
    if (syncing.value) {return;}
    syncing.value = true; error.value = '';
    const started = dialogGeneration;
    void request<MessagesClientState>('messages/sync')
        .then(next => {apply(next); if (dialogGeneration === started) {close();}})
        .catch(cause => {if (alive && dialogGeneration === started && state.value.settings.syncNoticeEnabled) {
            error.value = cause instanceof Error && cause.message !== 'host_request_timeout'
                ? cause.message : messageSyncCopy.operationTimeout;
        }})
        .finally(() => {syncing.value = false;});
}
function dismissSyncNotice() {
    if (dismissing.value || !state.value.settings.syncNoticeEnabled) {return;}
    dismissing.value = true; error.value = '';
    const started = dialogGeneration;
    void request<MessagesClientState>('messages/dismiss-sync-notice')
        .then(next => {apply(next); if (dialogOpen.value && dialogGeneration === started) {close();} error.value = '';})
        .catch(cause => {if (alive) {error.value = cause instanceof Error && cause.message !== 'host_request_timeout'
            ? cause.message : messageSyncCopy.settingsFailed;}})
        .finally(() => {dismissing.value = false;});
}
function open(next: typeof mode.value) {
    if (dialogOpen.value) {void nextTick(() => dialogClose.value?.focus());}
    dialogGeneration++;
    mode.value = next; error.value = ''; name.value = ''; note.value = contact.value?.note ?? ''; personSearch.value = '';
    contactAction.value = createMessageId(); dialogOpen.value = true;
    operationRevision.value = state.value.revision;
    if (next === 'add') {void refreshPeople();}
}
async function refreshPeople() {
    const action = contactAction.value;
    const current = () => alive && dialogOpen.value && mode.value === 'add' && contactAction.value === action;
    peopleStatus.value = 'loading';
    try {
        const next = await request<MessagesClientState>('messages/refresh');
        if (!current()) {return;}
        apply(next); peopleStatus.value = 'ready';
    } catch {if (current()) {peopleStatus.value = 'failed';}}
}
function close() {if (syncDialog.value) {error.value = '';} dialogOpen.value = false; dialogGeneration++;}
function cancelDialog() {close();}
function backDialog() {
    if (working.value && syncDialog.value) {close(); return;}
    if (working.value) { return; }
    if (mode.value === 'delete') { mode.value = 'detail'; }
    else if (mode.value === 'recover') { mode.value = 'sync'; }
    else { cancelDialog(); }
}
function add(personName = name.value) {
    if (!personName.trim() || disabled.value || peopleStatus.value === 'loading') {return;}
    void run(async () => {
        const result = await request<{ contactId: string; state: MessagesClientState }>('messages/contact/add', { actionId: contactAction.value, name: personName.trim(), note: note.value.trim() });
        apply(result.state); close(); select(result.contactId);
    });
}
function saveNote() {void run(async () => {apply(await request('messages/contact/note', { contactId: selected.value, note: note.value })); close();});}
function remove() {void run(async () => {apply(await request('messages/contact/delete', { contactId: selected.value, revision: operationRevision.value })); close(); back();});}
function confirmMessageDelete(messageId: string) {messageToDelete.value = messageId; open('delete-message'); operationRevision.value = page.value.revision;}
function removeMessage() {
    const contactId = selected.value; const messageId = messageToDelete.value;
    void run(async () => {
        apply(await request('messages/message/delete', { contactId, messageId, revision: operationRevision.value }));
        await readThread();
        close();
    });
}
function regenerate(messageId: string) {
    const target = { contactId: selected.value, messageId, revision: page.value.revision };
    void run(async () => {apply(await request('messages/regenerate', target));});
}
function recover() {void run(async () => {apply(await request('messages/recover')); close();});}
function adoptServer() {
    void run(async () => {
        apply(await request('messages/adopt-server-state'));
        if (state.value.fileState === 'ready' && !state.value.pendingSave) {submitted.value = null; sendError.value = null; close();}
        else {error.value = '暂时无法加载已保存版本，请检查网络后重试。当前记录未改。';}
    });
}
onUnmounted(() => {alive = false; threadRequest++; unsubscribe();});
</script>
<template>
    <main class="messages-app">
        <div v-if="needsSave" class="messages-banner" role="status">
            <span>{{ state.fileState === 'conflict' ? '服务器上的存档已有变化，请选择如何处理。' : '还不确定部分消息是否保存成功，请先检查保存。' }}</span>
            <div class="messages-save-actions">
                <button :disabled="working || state.operationPending || !!state.busy" @click="operation('messages/confirm')">检查保存</button>
                <button v-if="state.fileState === 'conflict' || state.recoveryBlocked" :disabled="working || state.operationPending || !!state.busy || state.generationActive" @click="open('adopt')">使用已保存版本</button>
            </div>
        </div>
        <div v-else-if="unsyncedCount && state.settings.syncNoticeEnabled && !state.busy" class="messages-banner" role="status">
            <span>{{ messageSyncCopy.pending(unsyncedCount) }}</span>
            <span v-if="state.syncNotice.error">{{ state.syncNotice.error }}</span>
            <div class="messages-save-actions">
                <button :disabled="disabled" @click="open('sync')">{{ messageSyncCopy.view }}</button>
                <button :disabled="dismissing" @click="dismissSyncNotice">{{ messageSyncCopy.dismiss }}</button>
            </div>
        </div>
        <div v-if="state.generationActive" class="messages-notice">故事正在继续，稍后就能发送消息。</div>
        <p v-if="(error && !syncDialog) || state.error" class="messages-error" role="alert">{{ (!syncDialog && error) || state.error }}</p>
        <div v-if="threadError" class="messages-banner" role="alert"><span>{{ threadError }}</span><button :disabled="loading" @click="readThread()">重新加载</button></div>
        <div class="messages-layout" :class="{ 'has-conversation': !!contact, 'is-empty': !state.contacts.length }">
            <ContactList :contacts="state.contacts" :active-contact-id="selected" :busy-contact-id="state.busy?.contactId ?? ''" :drafts="drafts" @select="select" @add="open('add')" @settings="open('settings')" />
            <Conversation
                v-if="contact" :key="contact.id" ref="conversation" v-model:draft="draft" :context-state="state"
                :contact="contact" :page="page" :bridge="bridge" :chat-identity="state.chatIdentity" :disabled="disabled"
                :send-disabled="disabled || !!outgoing" :busy="state.busy" :outgoing="pendingBubble"
                :send-failure="state.sendFailure" :send-error="sendError" :working="working" :pending-save="needsSave"
                :retry-disabled="working || state.operationPending || !!state.busy || state.generationActive || state.fileState === 'conflict'"
                :loading="loading" :load-more="() => readThread(true)" :media="state.media" :waiting-for="waitingFor"
                @back="back" @details="open('detail')" @send="send" @retry="retry" @discard="discard"
                @delete-message="confirmMessageDelete" @regenerate="regenerate" @latest="readThread(false, true)"
            />
            <div v-else class="messages-selection"><MessageIcon name="message" /><p>{{ layoutCopy.chooseConversation }}</p></div>
        </div>
        <AppDialog v-if="dialogOpen" class="messages-dialog" aria-labelledby="messages-dialog-title" :busy="working && !syncDialog" @close="backDialog">
            <header><ContactAvatar v-if="mode === 'detail' && contact" :identity="contact.id" :name="contact.name" small /><h2 id="messages-dialog-title">{{ mode === 'settings' ? '信息设置' : mode === 'add' ? '新的对话' : mode === 'detail' ? contact?.name : mode === 'delete' ? '删除联系人？' : mode === 'delete-message' ? '删除这条消息？' : mode === 'sync' ? messageSyncCopy.title : mode === 'adopt' ? '使用已保存版本？' : '在当前位置补记？' }}</h2><button ref="dialogClose" class="messages-icon-button" aria-label="关闭" :disabled="working && !syncDialog" @click="cancelDialog"><MessageIcon name="close" /></button></header>
            <p v-if="error || (syncDialog && state.syncNotice.error)" class="messages-error" role="alert">{{ error || state.syncNotice.error }}</p>
            <template v-if="mode === 'settings'">
                <MessagesSettings :settings="state.settings" :busy="working || state.operationPending" @save="saveSettings" />
                <button v-if="unsyncedCount" class="messages-secondary messages-sync-entry" :disabled="working" @click="open('sync')">{{ messageSyncCopy.title }} · {{ unsyncedCount }}</button>
            </template>
            <template v-else-if="mode === 'add'">
                <label class="messages-search"><MessageIcon name="search" /><input v-model="personSearch" placeholder="查找已知人物" aria-label="查找已知人物" aria-describedby="messages-people-source"></label>
                <div id="messages-people-source" class="messages-subtle messages-people-source">人物来自当前聊天的剧情总结，需要开启总结功能；找不到的人可以手动添加。</div>
                <div class="messages-known-list" :aria-busy="peopleStatus === 'loading'">
                    <p v-if="peopleStatus === 'loading'" class="messages-subtle" role="status">正在读取已知人物…</p>
                    <div v-else-if="peopleStatus === 'failed'"><p class="messages-subtle" role="alert">已知人物暂时无法读取，可以重试或手动添加。</p><button class="messages-secondary" :disabled="working" @click="refreshPeople">重新加载</button></div>
                    <template v-else>
                        <button v-for="person in people" :key="person.name" :disabled="disabled" @click="add(person.name)"><ContactAvatar :identity="person.name" :name="person.name" small /><span>{{ person.name }}<small v-if="person.aliases.length">{{ person.aliases.join('、') }}</small></span><MessageIcon name="plus" /></button>
                        <p v-if="!people.length" class="messages-subtle">{{ personSearch ? '没有匹配的人物，可以在下面手动添加。' : '暂无可添加的已知人物，可以在下面手动添加。' }}</p>
                    </template>
                </div>
                <details class="messages-manual"><summary>想联系的人不在这里？</summary><form @submit.prevent="add()"><label>姓名<input v-model="name" maxlength="120" required placeholder="对方的姓名"></label><label>身份说明（可选）<textarea v-model="note" maxlength="600" rows="2" placeholder="例如：住在隔壁的花店老板" /></label><button class="messages-primary" :disabled="disabled || peopleStatus === 'loading' || !name.trim()">添加并聊天</button></form></details>
            </template>
            <form v-else-if="mode === 'detail'" @submit.prevent="saveNote"><label>身份说明 / 备注<textarea v-model="note" maxlength="600" rows="3" placeholder="帮助辨认这位联系人" /></label><button class="messages-primary" :disabled="disabled">保存备注</button><button type="button" class="messages-danger" :disabled="disabled" @click="mode = 'delete'">删除联系人与通讯记录</button></form>
            <template v-else-if="mode === 'delete'"><p v-if="deletionReason" role="status">{{ deletionReason }}</p><p v-else>删除与 {{ contact?.name }} 的全部通讯和摘要，同时更新主聊天记录。其他联系人和图库文件保留，删除后不能恢复。</p><button class="messages-danger" :disabled="disabled || !!deletionReason" @click="remove">确认删除</button><button class="messages-secondary" @click="mode = 'detail'">保留联系人</button></template>
            <template v-else-if="mode === 'delete-message'"><p v-if="deletionReason" role="status">{{ deletionReason }}</p><p v-else>删除这条消息，同时更新主聊天记录。后续回复、其他消息和图库文件保留，删除后不能恢复。</p><button class="messages-danger" :disabled="disabled || !!deletionReason" @click="removeMessage">确认删除</button><button class="messages-secondary" @click="close">取消</button></template>
            <template v-else-if="mode === 'sync'"><p>{{ messageSyncCopy.pending(unsyncedCount) }}</p><p>{{ messageSyncCopy.description }}</p><button class="messages-primary" :disabled="disabled || syncing" @click="sync">{{ messageSyncCopy.retry }}</button><button v-if="state.settings.syncNoticeEnabled" class="messages-secondary" :disabled="dismissing" @click="dismissSyncNotice">{{ messageSyncCopy.dismiss }}</button><details class="messages-manual"><summary>原来的记录已被修改或删除？</summary><p>不会覆盖你的修改。需要这些消息继续进入剧情时，可以在当前位置另加一条补记。</p><button class="messages-secondary" :disabled="disabled" @click="mode = 'recover'">查看补记方式</button></details></template>
            <template v-else-if="mode === 'adopt'"><p>将读取服务器上的当前聊天小白 OS 存档，放弃本地尚未确认的修改。信息 APP 会显示服务器已保存的联系人和消息。</p><p class="messages-subtle">这项选择作用于当前聊天的整份 OS 存档，不会删除主聊天里的记录，也不会重新生成回复。</p><button class="messages-danger" :disabled="working || !!state.busy || state.generationActive" @click="adoptServer">确认使用已保存版本</button><button class="messages-secondary" :disabled="working" @click="close">暂不处理</button></template>
            <template v-else><p>先检查已有记录；仍未写入的消息会在主聊天当前位置标为「补录」，保留原发送时间。不会覆盖旧记录或恢复你删除的那一条。</p><button class="messages-primary" :disabled="disabled" @click="recover">确认补记</button><button class="messages-secondary" :disabled="working" @click="close">暂不补记</button></template>
        </AppDialog>
    </main>
</template>
