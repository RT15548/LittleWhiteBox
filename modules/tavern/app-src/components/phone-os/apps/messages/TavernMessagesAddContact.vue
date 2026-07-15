<script setup lang="ts">
import type { TavernPhoneContactCandidate } from '../../../../features/phone-os/useTavernPhoneController';

defineProps<{
    candidates: TavernPhoneContactCandidate[];
}>();

const emit = defineEmits<{
    (event: 'back'): void;
    (event: 'add', candidate: TavernPhoneContactCandidate): void;
}>();

function initial(name = ''): string {
    return Array.from(String(name || '').trim())[0] || '·';
}
</script>

<template>
  <section class="tavern-phone-app tavern-phone-add-contact">
    <header class="tavern-phone-conversation-head tavern-phone-add-contact-head">
      <button
        type="button"
        class="tavern-phone-back-button"
        aria-label="返回信息列表"
        @click="emit('back')"
      >
        <span
          class="material-symbols-rounded"
          aria-hidden="true"
        >arrow_back_ios_new</span>
      </button>
      <div>
        <strong>添加联系人</strong>
        <span>剧情中已经认识的人</span>
      </div>
      <span class="tavern-phone-head-spacer" />
    </header>
    <div
      v-if="candidates.length"
      class="tavern-phone-contact-candidates"
    >
      <button
        v-for="candidate in candidates"
        :key="candidate.key"
        type="button"
        @click="emit('add', candidate)"
      >
        <span class="tavern-phone-contact-avatar">
          <img
            v-if="candidate.avatar"
            :src="candidate.avatar"
            alt=""
          >
          <b v-else>{{ initial(candidate.name) }}</b>
        </span>
        <span>
          <strong>{{ candidate.name }}</strong>
          <small>{{ candidate.source === 'character' ? '当前故事角色' : '人物记忆' }}</small>
        </span>
        <i>添加</i>
      </button>
    </div>
    <div
      v-else
      class="tavern-phone-empty-state"
    >
      <span
        class="tavern-phone-empty-icon is-contacts"
        aria-hidden="true"
      ><i /></span>
      <strong>暂时没有新联系人</strong>
      <p>剧情建立新的人物记忆后，对方会出现在这里。</p>
      <button
        type="button"
        @click="emit('back')"
      >
        返回信息
      </button>
    </div>
  </section>
</template>
