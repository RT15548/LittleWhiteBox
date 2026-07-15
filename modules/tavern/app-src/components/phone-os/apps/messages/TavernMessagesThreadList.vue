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
    filteredContactIds: string[];
}>();

const searchQuery = defineModel<string>('searchQuery', { required: true });

const emit = defineEmits<{
    (event: 'open', contactId: string): void;
}>();

const rows = computed(() => props.contacts.filter((contact) => props.filteredContactIds.includes(contact.id)).map((contact) => {
    const thread = props.threads.find((item) => item.contactId === contact.id) || null;
    const preview = thread ? props.previews[thread.id] || null : null;
    return { contact, thread, preview };
}).sort((left, right) => {
    if (!!left.preview !== !!right.preview) {return left.preview ? -1 : 1;}
    if (left.preview && right.preview) {
        const recentDifference = Number(right.preview.updatedAt) - Number(left.preview.updatedAt);
        if (recentDifference) {return recentDifference;}
    }
    return left.contact.name.localeCompare(right.contact.name, 'zh-CN');
}));

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
        <h2>信息</h2>
      </div>
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
      <strong>剧情中还没有可联系的人</strong>
      <p>人物档案出现后，会自动来到这里。</p>
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
