<script setup lang="ts">
import { TAVERN_PHONE_MESSAGES_APP_ID } from '../../features/phone-os/phone-os-types';
import TavernMessagesApp from './apps/messages/TavernMessagesApp.vue';

defineProps<{
    appId: string;
}>();
</script>

<template>
  <TavernMessagesApp v-if="appId === TAVERN_PHONE_MESSAGES_APP_ID" />
  <section
    v-else
    class="tavern-phone-app tavern-phone-route-missing"
  >
    <strong>这个 App 暂时不可用</strong>
    <p>返回手机桌面后再试一次。</p>
  </section>
</template>
