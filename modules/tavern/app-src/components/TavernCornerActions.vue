<script setup lang="ts">
defineProps<{
  dark: boolean;
  includeHome?: boolean;
  includeApi?: boolean;
  includeChatPreset?: boolean;
  includeWorldbooks?: boolean;
  includeExit?: boolean;
  compact?: boolean;
  homeLast?: boolean;
}>();

const emit = defineEmits<{
  api: [];
  chatPreset: [];
  home: [];
  toggleTheme: [];
  worldbooks: [];
  exit: [];
}>();
</script>

<template>
  <div
    class="home-corner-actions"
    :class="{ 'page-corner-actions': includeHome || compact }"
  >
    <button
      v-if="includeChatPreset"
      type="button"
      class="home-icon-button page-chat-preset-button"
      title="聊天预设"
      aria-label="聊天预设"
      @click="emit('chatPreset')"
    >
      <svg
        class="xb-chat-preset-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          stroke-width="1.6"
          d="M5 5h14v10H9l-4 4V5ZM8 9h8M8 12h5"
        />
      </svg>
    </button>
    <button
      v-if="includeApi"
      type="button"
      class="home-icon-button page-api-button"
      title="API 配置"
      aria-label="API 配置"
      @click="emit('api')"
    >
      <svg
        class="xb-api-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          stroke-width="1.6"
          d="M9 7V3M15 7V3M7 11h10M8 7h8v5a4 4 0 0 1-8 0V7ZM12 16v5"
        />
      </svg>
    </button>
    <button
      v-if="includeWorldbooks"
      type="button"
      class="home-icon-button page-worldbooks-button"
      title="世界书"
      aria-label="世界书"
      @click="emit('worldbooks')"
    >
      <svg
        class="xb-worldbooks-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          stroke-width="1.6"
          d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM3.8 9h16.4M3.8 15h16.4M12 3c2 2.2 3 5.2 3 9s-1 6.8-3 9M12 3c-2 2.2-3 5.2-3 9s1 6.8 3 9"
        />
      </svg>
    </button>
    <template v-if="includeHome && !homeLast">
      <button
        type="button"
        class="home-icon-button page-home-button"
        title="首页"
        aria-label="首页"
        @click="emit('home')"
      >
        <svg
          class="xb-home-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10.5V20h13v-9.5" />
          <path d="M9.5 20v-5.5h5V20" />
        </svg>
      </button>
    </template>
    <button
      type="button"
      class="home-icon-button home-theme-button"
      :title="dark ? '切换到白天' : '切换到夜间'"
      :aria-label="dark ? '切换到白天' : '切换到夜间'"
      @click="emit('toggleTheme')"
    >
      <svg
        v-if="dark"
        class="xb-theme-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="4"
        />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
      <span
        v-else
        class="xb-theme-glyph"
        aria-hidden="true"
      >☾</span>
    </button>
    <template v-if="includeHome && homeLast">
      <button
        type="button"
        class="home-icon-button page-home-button"
        title="首页"
        aria-label="首页"
        @click="emit('home')"
      >
        <svg
          class="xb-home-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10.5V20h13v-9.5" />
          <path d="M9.5 20v-5.5h5V20" />
        </svg>
      </button>
    </template>
    <button
      v-if="includeExit"
      type="button"
      class="home-icon-button home-exit-button"
      title="退出"
      aria-label="退出"
      @click="emit('exit')"
    >
      <svg
        class="xb-exit-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    </button>
  </div>
</template>
