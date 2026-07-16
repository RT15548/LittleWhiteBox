<script setup lang="ts">
import { computed } from 'vue';
import { useTavernPhoneContext } from '../../../tavern-app-context';
import TavernMessagesConversation from './TavernMessagesConversation.vue';
import TavernMessagesThreadList from './TavernMessagesThreadList.vue';

const phone = useTavernPhoneContext();
const activePath = computed(() => (
    phone.os.activeRoute.value.kind === 'app' ? phone.os.activeRoute.value.path : ''
));
const hasKnownRoute = computed(() => (
    activePath.value === '/threads'
    || (activePath.value.startsWith('/threads/') && !!phone.messages.activeContact.value)
));

</script>

<template>
  <Transition
    :name="`tavern-phone-route-${phone.os.transitionDirection.value}`"
    mode="out-in"
  >
    <KeepAlive>
      <TavernMessagesThreadList
        v-if="activePath === '/threads'"
        key="messages-threads"
        v-model:search-query="phone.messages.searchQuery.value"
        :contacts="phone.messages.contacts.value"
        :threads="phone.messages.threads.value"
        :previews="phone.messages.threadPreviews.value"
        :filtered-contact-ids="phone.messages.filteredContactIds.value"
        @open="phone.openContact"
      />
      <TavernMessagesConversation
        v-else-if="activePath.startsWith('/threads/') && phone.messages.activeContact.value"
        key="messages-conversation"
        v-model:draft="phone.messages.draft.value"
        :contact="phone.messages.activeContact.value"
        :messages="phone.messages.messages.value"
        :sending="phone.messages.conversationSending.value"
        :can-send="phone.messages.canSend.value"
        :status="phone.messages.status.value"
        :last-result="phone.messages.activeThread.value?.lastResult"
        :reply-request="phone.messages.activeThread.value?.replyRequest"
        :retry-blocked-reason="phone.messages.sendBlockedReason.value"
        :blocked-reason="phone.messages.sendBlockedReason.value"
        :image-states="phone.messages.imageStates.value"
        :voice-states="phone.messages.voiceStates.value"
        @back="phone.os.back"
        @retry="phone.messages.retryReplyRequest"
        @send="phone.messages.sendMessage()"
        @ensure-image="phone.messages.ensureImageAsset"
        @retry-image="phone.messages.retryImageAsset"
        @cancel-image="phone.messages.cancelImageAsset"
        @release-image="phone.messages.releaseImageAsset"
        @toggle-voice="phone.messages.toggleVoicePlayback"
      />
    </KeepAlive>
  </Transition>
  <section
    v-if="!hasKnownRoute"
    class="tavern-phone-app tavern-phone-route-missing"
  >
    <strong>信息页面暂时不可用</strong>
    <p>返回信息首页后再试一次。</p>
    <button
      type="button"
      @click="phone.showMessageThreads"
    >
      返回信息
    </button>
  </section>
</template>
