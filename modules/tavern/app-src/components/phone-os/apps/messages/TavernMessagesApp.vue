<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTavernPhoneContext } from '../../../tavern-app-context';
import TavernMessagesAddContact from './TavernMessagesAddContact.vue';
import TavernMessagesConversation from './TavernMessagesConversation.vue';
import TavernMessagesThreadList from './TavernMessagesThreadList.vue';

const phone = useTavernPhoneContext();
const activePath = computed(() => (
    phone.os.activeRoute.value.kind === 'app' ? phone.os.activeRoute.value.path : ''
));
const hasKnownRoute = computed(() => (
    activePath.value === '/threads'
    || activePath.value === '/contacts/add'
    || (activePath.value.startsWith('/threads/') && !!phone.messages.activeContact.value)
));

onMounted(() => {
    void phone.messages.prepareMessages();
});
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
        :candidate-count="phone.messages.contactCandidates.value.length"
        :filtered-contact-ids="phone.messages.filteredContactIds.value"
        @add="phone.showAddContact"
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
        :blocked-reason="phone.messages.sendBlockedReason.value"
        @back="phone.os.back"
        @retry="phone.messages.retryMessage"
        @send="phone.messages.sendMessage()"
      />
      <TavernMessagesAddContact
        v-else-if="activePath === '/contacts/add'"
        key="messages-add-contact"
        :candidates="phone.messages.contactCandidates.value"
        @back="phone.os.back"
        @add="phone.addContact"
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
