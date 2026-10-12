<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ContactView } from '../types.js';
import MessageIcon from './MessageIcon.vue';
import ContactAvatar from './ContactAvatar.vue';
import type { MessageDraft } from './draft.js';
const props = defineProps<{ contacts: ContactView[]; activeContactId: string; busyContactId: string; drafts: ReadonlyMap<string, MessageDraft> }>();
defineEmits<{ select: [id: string]; add: []; settings: [] }>();
const search = ref('');
const filtered = computed(() => props.contacts.filter(contact => `${contact.name} ${contact.note}`.toLocaleLowerCase().includes(search.value.toLocaleLowerCase())));
function time(value: number | null) {
    if (value === null) {return '';}
    const date = new Date(value);
    return date.toDateString() === new Date().toDateString()
        ? date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
}
</script>
<template>
    <section class="messages-contacts">
        <header class="messages-home-header"><h1>信息</h1><div class="messages-home-actions"><button class="messages-icon-button" title="设置" aria-label="设置" @click="$emit('settings')"><MessageIcon name="settings" /></button><button class="messages-icon-button messages-add-contact" aria-label="添加联系人" @click="$emit('add')"><MessageIcon name="plus" /></button></div></header>
        <label class="messages-search"><MessageIcon name="search" /><input v-model="search" type="search" placeholder="搜索联系人" aria-label="搜索联系人"></label>
        <div v-if="!contacts.length" class="messages-empty">
            <MessageIcon name="message" />
            <h2>暂无联系人</h2>
            <button class="messages-primary" @click="$emit('add')">添加联系人<MessageIcon name="plus" /></button>
        </div>
        <div v-else class="messages-contact-rows">
            <p v-if="!filtered.length" class="messages-subtle">没有找到这个人。</p>
            <button v-for="contact in filtered" :key="contact.id" class="messages-contact-row" :aria-current="activeContactId === contact.id ? 'true' : undefined" @click="$emit('select', contact.id)">
                <ContactAvatar :identity="contact.id" :name="contact.name" />
                <span class="messages-contact-copy"><span class="messages-contact-heading"><strong>{{ contact.name }}</strong><time>{{ time(contact.lastAt) }}</time></span><span v-if="busyContactId === contact.id" class="messages-preview messages-preview-active">正在等待回复…</span><span v-else-if="drafts.get(contact.id)?.text.trim() || drafts.get(contact.id)?.image" class="messages-preview"><em>草稿</em> {{ drafts.get(contact.id)?.image ? '［图片］' : '' }}{{ drafts.get(contact.id)?.text }}</span><span v-else class="messages-preview">{{ contact.preview }}</span></span>
            </button>
        </div>
    </section>
</template>
