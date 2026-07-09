<script setup lang="ts">
import TavernCornerActions from './TavernCornerActions.vue';

defineProps<{
    dark: boolean;
    hasSession: boolean;
    subtitle: string;
    characterCount: number;
}>();

defineEmits<{
    (event: 'toggle-theme'): void;
    (event: 'exit'): void;
    (event: 'enter'): void;
    (event: 'open-characters'): void;
    (event: 'open-settings', workspace: 'api' | 'chatPreset' | 'assistantPreset' | 'worldbooks' | 'regex' | 'base'): void;
    (event: 'open-about'): void;
}>();
</script>

<template>
  <section class="tavern-home xb-page home-command-center">
    <TavernCornerActions
      include-exit
      :dark="dark"
      @toggle-theme="$emit('toggle-theme')"
      @exit="$emit('exit')"
    />
    <div class="home-hero home-command-hero">
      <div class="home-brand-panel">
        <p class="eyebrow">
          Private Narrative Archive
        </p>
        <h2>
          <span>Little White Tavern</span>
        </h2>
        <p>
          A quiet narrative desk where the scene, the archive, and the assistant stay in the same room.
        </p>
        <p class="home-version-line">
          {{ hasSession ? subtitle : `${characterCount} cards in archive` }}
        </p>
      </div>
      <button
        type="button"
        class="enter-btn home-enter-chat"
        @click="$emit('enter')"
      >
        <span class="home-enter-desktop">{{ hasSession ? 'ENTER LAST CHAT' : 'OPEN CHARACTER ARCHIVE' }}</span>
        <span class="home-enter-mobile-label">{{ hasSession ? 'RESUME SESSION' : 'OPEN ARCHIVE' }}</span>
        <span class="home-enter-mobile-title">{{ hasSession ? '继续聊天' : '选择角色' }}</span>
        <span
          class="home-enter-mobile-arrow"
          aria-hidden="true"
        >→</span>
      </button>
      <div class="home-command-panel home-menu-panel">
        <button
          type="button"
          class="home-menu-item"
          @click="$emit('open-characters')"
        >
          <svg
            class="home-menu-icon"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-width="1.6"
              d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21a7 7 0 0 1 14 0"
            />
          </svg>
          <strong>角色卡</strong>
          <span>Character Cards</span>
        </button>
        <button
          type="button"
          class="home-menu-item"
          @click="$emit('open-settings', 'worldbooks')"
        >
          <svg
            class="home-menu-icon"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-width="1.6"
              d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM3.8 9h16.4M3.8 15h16.4M12 3c2 2.2 3 5.2 3 9s-1 6.8-3 9M12 3c-2 2.2-3 5.2-3 9s1 6.8 3 9"
            />
          </svg>
          <strong>世界书</strong>
          <span>World Lore Books</span>
        </button>
        <button
          type="button"
          class="home-menu-item"
          @click="$emit('open-settings', 'chatPreset')"
        >
          <svg
            class="home-menu-icon"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-width="1.6"
              d="M5 5h14v10H9l-4 4V5ZM8 9h8M8 12h5"
            />
          </svg>
          <strong>聊天预设</strong>
          <span>Prompt Presets</span>
        </button>
        <button
          type="button"
          class="home-menu-item"
          @click="$emit('open-settings', 'assistantPreset')"
        >
          <svg
            class="home-menu-icon"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-width="1.6"
              d="M8 6.5A3.5 3.5 0 0 1 15 6a3.5 3.5 0 0 1 1 6.85V19a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6.15A3.5 3.5 0 0 1 8 6.5ZM8 14h8M10 18h4"
            />
          </svg>
          <strong>助手预设</strong>
          <span>Memory Manager</span>
        </button>
        <button
          type="button"
          class="home-menu-item"
          @click="$emit('open-settings', 'regex')"
        >
          <svg
            class="home-menu-icon"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-width="1.6"
              d="M10 20 14 4M6 8l-4 4 4 4M18 8l4 4-4 4"
            />
          </svg>
          <strong>正则</strong>
          <span>Text Filters</span>
        </button>
        <button
          type="button"
          class="home-menu-item"
          @click="$emit('open-settings', 'api')"
        >
          <svg
            class="home-menu-icon"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-width="1.6"
              d="M9 7V3M15 7V3M7 11h10M8 7h8v5a4 4 0 0 1-8 0V7ZM12 16v5"
            />
          </svg>
          <strong>API 配置</strong>
          <span>Model Connection</span>
        </button>
        <button
          type="button"
          class="home-menu-item desktop-only"
          @click="$emit('open-settings', 'base')"
        >
          <svg
            class="home-menu-icon"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-width="1.6"
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0"
            />
          </svg>
          <strong>基础设定</strong>
          <span>Base Setup</span>
        </button>
        <button
          type="button"
          class="home-menu-item highlight desktop-only"
          @click="$emit('open-about')"
        >
          <strong>关于界面</strong>
          <span>About</span>
        </button>
        <div class="home-menu-mobile-footer">
          <button
            type="button"
            class="home-menu-item mobile-footer-item"
            @click="$emit('open-settings', 'base')"
          >
            <strong>基础设定</strong>
          </button>
          <button
            type="button"
            class="home-menu-item mobile-footer-item mobile-footer-about"
            @click="$emit('open-about')"
          >
            <strong>关于界面</strong>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
