<script setup lang="ts">
import TavernCornerActions from '../TavernCornerActions.vue';
import TavernCharacterWorkspacePanel from '../TavernCharacterWorkspacePanel.vue';
import TavernSettingsSidebar from '../TavernSettingsSidebar.vue';
import TavernApiSettingsPanel from './TavernApiSettingsPanel.vue';
import TavernBaseSettingsPanel from './TavernBaseSettingsPanel.vue';
import TavernChatPresetSettingsPanel from './TavernChatPresetSettingsPanel.vue';
import TavernWorldbooksSettingsPanel from './TavernWorldbooksSettingsPanel.vue';
import TavernRegexSettingsPanel from './TavernRegexSettingsPanel.vue';
import TavernAssistantPresetSettingsPanel from './TavernAssistantPresetSettingsPanel.vue';
import { useTavernSettingsContext, useTavernShellContext } from '../tavern-app-context';

const settings = useTavernSettingsContext();
const shell = useTavernShellContext();
const {
    activeSettingsWorkspace,
    selectSettingsWorkspace,
    settingsNavItems,
} = settings;
const {
    activeView,
    homeThemeDark,
} = shell;
</script>

<template>
  <section
    v-if="activeView === 'settings'"
    class="xb-layout xb-page settings-layout"
    :class="`is-${activeSettingsWorkspace}-workspace`"
  >
    <TavernCornerActions
      include-home
      home-last
      :dark="homeThemeDark"
      @home="activeView = 'home'"
      @toggle-theme="homeThemeDark = !homeThemeDark"
    />
    <TavernSettingsSidebar
      :active="activeSettingsWorkspace"
      :items="settingsNavItems"
      @select="selectSettingsWorkspace"
    />

    <section class="xb-main">
      <TavernCharacterWorkspacePanel
        v-if="activeSettingsWorkspace === 'characters'"
      />

      <TavernApiSettingsPanel
        v-if="activeSettingsWorkspace === 'api'"
      />

      <TavernChatPresetSettingsPanel
        v-if="activeSettingsWorkspace === 'chatPreset'"
      />

      <TavernWorldbooksSettingsPanel
        v-if="activeSettingsWorkspace === 'worldbooks'"
      />

      <TavernRegexSettingsPanel
        v-if="activeSettingsWorkspace === 'regex'"
      />

      <TavernAssistantPresetSettingsPanel
        v-if="activeSettingsWorkspace === 'assistantPreset'"
      />

      <TavernBaseSettingsPanel
        v-if="activeSettingsWorkspace === 'base'"
      />
    </section>
  </section>
</template>
