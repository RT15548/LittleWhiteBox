<script setup lang="ts">
import { unref } from 'vue';
import type { TavernPhoneAppDefinition } from '../../features/phone-os/phone-os-types';

defineProps<{
    apps: TavernPhoneAppDefinition[];
    characterAvatar: string;
}>();

const emit = defineEmits<{
    (event: 'launch', appId: string): void;
}>();

function appBadge(app: TavernPhoneAppDefinition): number {
    return Math.max(0, Math.floor(Number(unref(app.badge)) || 0));
}
</script>

<template>
  <section class="tavern-phone-home">
    <div
      class="tavern-phone-home-atmosphere"
      aria-hidden="true"
    >
      <img
        v-if="characterAvatar"
        :src="characterAvatar"
        alt=""
      >
      <i />
    </div>
    <div class="tavern-phone-home-copy">
      <span>PRIVATE STORY DEVICE</span>
      <h2>小白</h2>
      <p>属于这段故事的随身入口</p>
    </div>
    <div
      class="tavern-phone-app-grid"
      aria-label="应用"
    >
      <button
        v-for="app in apps"
        :key="app.id"
        type="button"
        class="tavern-phone-app-icon-button"
        @click="emit('launch', app.id)"
      >
        <span
          class="tavern-phone-app-icon"
          :style="{ '--phone-app-accent': app.accent }"
        >
          <span
            class="material-symbols-rounded"
            aria-hidden="true"
          >{{ app.icon }}</span>
          <i
            v-if="appBadge(app)"
            class="tavern-phone-app-badge"
            :aria-label="`${appBadge(app)} 条未读`"
          >{{ appBadge(app) > 99 ? '99+' : appBadge(app) }}</i>
        </span>
        <strong>{{ app.shortName }}</strong>
      </button>
    </div>
    <div
      class="tavern-phone-home-signature"
      aria-hidden="true"
    >
      <i />
      <span>每段故事，都有自己的入口</span>
    </div>
  </section>
</template>
