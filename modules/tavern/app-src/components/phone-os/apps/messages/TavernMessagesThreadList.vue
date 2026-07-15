<script setup lang="ts">
import { computed } from 'vue';
import type {
    TavernCommunicationContactRecord,
    TavernCommunicationMessageRecord,
    TavernCommunicationThreadRecord,
} from '../../../../../shared/session-db';

const props = defineProps<{
    contacts: TavernCommunicationContactRecord[];
    threads: TavernCommunicationThreadRecord[];
    previews: Record<string, TavernCommunicationMessageRecord | null>;
    candidateCount: number;
    filteredContactIds: string[];
}>();

const searchQuery = defineModel<string>('searchQuery', { required: true });

const emit = defineEmits<{
    (event: 'add'): void;
    (event: 'open', contactId: string): void;
}>();

const rows = computed(() => props.contacts.filter((contact) => props.filteredContactIds.includes(contact.id)).map((contact) => {
    const thread = props.threads.find((item) => item.contactId === contact.id) || null;
    const preview = thread ? props.previews[thread.id] || null : null;
    return { contact, thread, preview };
}).sort((left, right) => (
    Number(right.thread?.updatedAt || right.contact.updatedAt) - Number(left.thread?.updatedAt || left.contact.updatedAt)
)));

function initial(name = ''): string {
    return Array.from(String(name || '').trim())[0] || '·';
}

function previewText(message: TavernCommunicationMessageRecord | null, thread: TavernCommunicationThreadRecord | null): string {
    if (!message) {return '轻触开始对话';}
    if (message.status === 'failed') {return '发送失败，轻触查看';}
    if (message.status === 'pending') {return '正在发送…';}
    if (message.role === 'user' && thread?.lastResult === 'unavailable') {return '暂时无法联系到对方';}
    if (message.role === 'user' && thread?.lastResult === 'silent') {return `你：${message.content} · 未回复`;}
    return `${message.role === 'user' ? '你：' : ''}${message.content}`;
}

</script>

<template>
  <section class="tavern-phone-app tavern-phone-thread-list">
    <header class="tavern-phone-app-head tavern-phone-messages-head">
      <div>
        <span class="tavern-phone-overline">PRIVATE MESSAGES</span>
        <h2>消息</h2>
      </div>
      <button
        type="button"
        class="tavern-phone-compose-contact"
        :disabled="!candidateCount"
        aria-label="添加联系人"
        @click="emit('add')"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </header>
    <label class="tavern-phone-search">
      <svg viewBox="0 0 24 24"><circle
        cx="11"
        cy="11"
        r="6"
      /><path d="m16 16 4 4" /></svg>
      <input
        v-model="searchQuery"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        aria-label="搜索联系人和消息"
        placeholder="搜索联系人和消息"
      >
    </label>
    <div
      v-if="rows.length"
      class="tavern-phone-thread-rows"
    >
      <button
        v-for="row in rows"
        :key="row.contact.id"
        type="button"
        class="tavern-phone-thread-row"
        @click="emit('open', row.contact.id)"
      >
        <span class="tavern-phone-contact-avatar">
          <img
            v-if="row.contact.avatar"
            :src="row.contact.avatar"
            alt=""
          >
          <b v-else>{{ initial(row.contact.name) }}</b>
        </span>
        <span class="tavern-phone-thread-copy">
          <span class="tavern-phone-thread-title">
            <strong>{{ row.contact.name }}</strong>
            <i
              v-if="row.thread?.unreadCount"
              class="tavern-phone-unread-badge"
              :aria-label="`${row.thread.unreadCount} 条未读消息`"
            >{{ row.thread.unreadCount > 99 ? '99+' : row.thread.unreadCount }}</i>
          </span>
          <span class="tavern-phone-thread-preview">{{ previewText(row.preview, row.thread) }}</span>
        </span>
        <svg
          class="tavern-phone-chevron"
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="m9 5 7 7-7 7" /></svg>
      </button>
    </div>
    <div
      v-else-if="!contacts.length"
      class="tavern-phone-empty-state"
    >
      <span
        class="tavern-phone-empty-icon"
        aria-hidden="true"
      >
        <i />
      </span>
      <strong>还没有联系人</strong>
      <p>从剧情中已经认识的角色里，添加一位可以联系的人。</p>
      <button
        type="button"
        :disabled="!candidateCount"
        @click="emit('add')"
      >
        {{ candidateCount ? '添加联系人' : '暂无可添加角色' }}
      </button>
    </div>
    <div
      v-else
      class="tavern-phone-empty-state tavern-phone-search-empty"
    >
      <span
        class="tavern-phone-empty-icon is-search"
        aria-hidden="true"
      >
        <i />
      </span>
      <strong>没有找到相关内容</strong>
      <p>换个名字或消息关键词试试。</p>
      <button
        type="button"
        @click="searchQuery = ''"
      >
        清除搜索
      </button>
    </div>
  </section>
</template>
