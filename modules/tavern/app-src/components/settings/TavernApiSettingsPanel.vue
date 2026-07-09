<script setup lang="ts">
import { useTavernSettingsContext } from '../tavern-app-context';

const settings = useTavernSettingsContext();
const {
    activeSettingsWorkspace,
    apiSettingsRootRef,
} = settings;

function setApiSettingsRootRef(element: Element | null) {
    apiSettingsRootRef.value = element instanceof HTMLElement ? element : null;
}
</script>

<template>
  <div
    v-show="activeSettingsWorkspace === 'api'"
    class="panel step-panel api-workspace"
  >
    <div class="panel-head">
      <div>
        <h2>API 配置</h2>
      </div>
    </div>
    <div
      class="api-scroll-body"
    >
      <div
        :ref="setApiSettingsRootRef"
        class="tavern-api-settings"
      />
    </div>
  </div>
</template>
