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
  <section
    class="tavern-phone-home"
    :class="{ 'has-character-wallpaper': !!characterAvatar }"
  >
    <div
      class="tavern-phone-wallpaper"
      aria-hidden="true"
    >
      <img
        v-if="characterAvatar"
        :src="characterAvatar"
        alt=""
      >
      <span />
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
      v-if="apps.length"
      class="tavern-phone-page-indicator"
      aria-hidden="true"
    >
      <i class="active" />
    </div>
  </section>
</template>
