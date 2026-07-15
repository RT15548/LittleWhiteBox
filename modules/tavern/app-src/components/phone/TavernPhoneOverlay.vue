<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useTavernPhoneContext } from '../tavern-app-context';
import TavernPhoneContactList from './TavernPhoneContactList.vue';
import TavernPhoneConversation from './TavernPhoneConversation.vue';
import TavernPhoneShell from './TavernPhoneShell.vue';

const phone = useTavernPhoneContext();

function handleDocumentKeydown(event: KeyboardEvent) {
    if (!phone.phoneOpen.value || event.key !== 'Escape') {return;}
    if (phone.phoneScreen.value !== 'threads') {
        phone.showThreads();
        return;
    }
    phone.closePhone();
}

function initial(name = ''): string {
    return Array.from(String(name || '').trim())[0] || '·';
}

onMounted(() => document.addEventListener('keydown', handleDocumentKeydown));
onUnmounted(() => document.removeEventListener('keydown', handleDocumentKeydown));
</script>

<template>
  <Transition name="tavern-phone-reveal">
    <div
      v-if="phone.phoneOpen.value"
      class="tavern-phone-overlay"
      @pointerdown.self="phone.closePhone"
    >
      <TavernPhoneShell
        @close="phone.closePhone"
      >
        <Transition
          name="tavern-phone-app-slide"
          mode="out-in"
        >
          <TavernPhoneContactList
            v-if="phone.phoneScreen.value === 'threads'"
            key="threads"
            :contacts="phone.contacts.value"
            :threads="phone.threads.value"
            :previews="phone.threadPreviews.value"
            :candidate-count="phone.contactCandidates.value.length"
            @add="phone.showAddContact"
            @open="phone.openContact"
          />
          <TavernPhoneConversation
            v-else-if="phone.phoneScreen.value === 'conversation' && phone.activeContact.value"
            key="conversation"
            v-model:draft="phone.draft.value"
            :contact="phone.activeContact.value"
            :messages="phone.messages.value"
            :sending="phone.conversationSending.value"
            :can-send="phone.canSend.value"
            :status="phone.status.value"
            :last-result="phone.activeThread.value?.lastResult"
            :blocked-reason="phone.sendBlockedReason.value"
            @back="phone.showThreads"
            @retry="phone.retryMessage"
            @send="phone.sendMessage()"
          />
          <section
            v-else
            key="add-contact"
            class="tavern-phone-app tavern-phone-add-contact"
          >
            <header class="tavern-phone-conversation-head tavern-phone-add-contact-head">
              <button
                type="button"
                class="tavern-phone-back-button"
                aria-label="返回消息列表"
                @click="phone.showThreads"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                ><path d="m15 4-8 8 8 8" /></svg>
              </button>
              <div>
                <strong>添加联系人</strong>
                <span>已知角色</span>
              </div>
              <span class="tavern-phone-head-spacer" />
            </header>
            <div
              v-if="phone.contactCandidates.value.length"
              class="tavern-phone-contact-candidates"
            >
              <button
                v-for="candidate in phone.contactCandidates.value"
                :key="candidate.key"
                type="button"
                @click="phone.addContact(candidate)"
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
                  <small>{{ candidate.source === 'character' ? '当前角色' : '人物记忆' }}</small>
                </span>
                <i>添加</i>
              </button>
            </div>
            <div
              v-else
              class="tavern-phone-empty-state"
            >
              <strong>没有新的已知角色</strong>
              <p>剧情建立人物记忆后，就能把对方加入通讯录。</p>
            </div>
          </section>
        </Transition>
      </TavernPhoneShell>
    </div>
  </Transition>
</template>
