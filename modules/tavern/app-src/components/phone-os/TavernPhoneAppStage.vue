<script setup lang="ts">
import type { TavernPhoneAppDefinition } from '../../features/phone-os/phone-os-types';

defineProps<{
    app: TavernPhoneAppDefinition | null;
}>();
</script>

<template>
  <section class="tavern-phone-app-stage">
    <component
      :is="app.component"
      v-if="app"
    />
    <section
      v-else
      class="tavern-phone-app tavern-phone-route-missing"
    >
      <strong>这个 App 暂时不可用</strong>
      <p>返回手机桌面后再试一次。</p>
    </section>
  </section>
</template>
