<script setup lang="ts">
export interface TavernSettingsNavItem {
  key: string;
  label: string;
  mobileLabel?: string;
  badge?: string;
}

defineProps<{
  active: string;
  items: TavernSettingsNavItem[];
}>();

const emit = defineEmits<{
  select: [key: string];
}>();
</script>

<template>
  <aside class="xb-sidebar settings-sidebar">
    <div class="panel guide-card">
      <h2>设置</h2>
      <div class="guide-steps">
        <button
          v-for="item in items"
          :key="item.key"
          type="button"
          class="guide-step"
          :class="{ active: active === item.key }"
          @click="emit('select', item.key)"
        >
          <strong>
            <span class="guide-label-full">{{ item.label }}</span>
            <span class="guide-label-mobile">{{ item.mobileLabel || item.label }}</span>
          </strong>
          <em v-if="item.badge">{{ item.badge }}</em>
        </button>
      </div>
    </div>
  </aside>
</template>
