<script setup lang="ts">
import { ref, watch } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import MapBrowser from './MapBrowser.vue';
import MapSettings from './MapSettings.vue';
import MapIcon from './MapIcon.vue';
import { MAP_NAV_COPY } from './map-copy.js';
import { useMapState } from './use-map-state.js';

const props = defineProps<XiaobaiOsAppProps>();
const { state, activeRequest, busy, disabledReason, requiresConfirmation, status, notice, isError, dismissNotice, refresh, confirmSave, adopt, setAuto, setProjection, update, rebuild } = useMapState(props);
const settingsOpen = ref(false);
watch(() => state.value.chatIdentity, () => { settingsOpen.value = false; });
</script>
<template>
    <MapBrowser :map="state.map" :chat-identity="state.chatIdentity">
        <template #toolbar><button type="button" class="map-round-button" aria-label="地图设置" @click="settingsOpen = true"><MapIcon name="more" /></button></template>
        <template #feedback>
            <div v-if="status" class="map-progress" role="status"><span />{{ status }}</div>
            <aside v-if="notice || requiresConfirmation || state.status === 'conflict'" class="map-notice" :class="{ 'is-error': isError }" role="status">
                <p>{{ notice || (requiresConfirmation ? '还不确定是否保存成功，请先检查保存。' : '服务器上的存档与当前内容不同。') }}</p>
                <button v-if="requiresConfirmation" type="button" :disabled="busy" @click="confirmSave">检查保存</button>
                <template v-else-if="state.status === 'conflict'"><small>恢复会放弃尚未保存的更改，并使用当前聊天已保存的 OS 数据（不只是地图）。</small><button type="button" :disabled="busy" @click="adopt">放弃未保存更改并恢复</button></template>
                <button v-else-if="state.status === 'error' || state.status === 'blocked'" type="button" :disabled="busy" @click="refresh">重新加载</button>
                <button v-else type="button" class="map-notice-close" aria-label="关闭地图提示" @click="dismissNotice"><MapIcon name="close" /></button>
            </aside>
        </template>
        <template #scene-empty-action="{ located }">
            <p>{{ located ? MAP_NAV_COPY.sceneUpdateHint : MAP_NAV_COPY.locationUpdateHint }}</p>
            <button type="button" class="map-secondary-button" :disabled="Boolean(disabledReason)" @click="update">{{ busy ? MAP_NAV_COPY.updating : MAP_NAV_COPY.update }}</button>
            <p v-if="disabledReason && !busy" class="map-setting-note">{{ disabledReason }}</p>
        </template>
        <template #scope-empty-action><button type="button" class="map-secondary-button" :disabled="Boolean(disabledReason)" @click="update">{{ busy ? MAP_NAV_COPY.updating : MAP_NAV_COPY.update }}</button></template>
        <template #empty-map>
            <div class="map-empty map-first-map"><span class="map-empty-art"><MapIcon name="globe" /></span><small>故事之外，还有一整个世界</small><h1>{{ state.status === 'loading' ? MAP_NAV_COPY.loading : '下一站，去哪里？' }}</h1><p>把世界设定画成地图，<br>也为留白的地方添上值得探索的去处。</p><button v-if="state.status !== 'loading'" type="button" class="map-primary-button" :disabled="Boolean(disabledReason)" @click="rebuild">{{ busy ? status || '正在准备…' : '绘制世界地图' }}</button><p v-if="disabledReason && !busy" class="map-setting-note">{{ disabledReason }}</p></div>
        </template>
        <template #overlay>
            <MapSettings v-if="settingsOpen" :auto-maintenance="state.autoMaintenance" :project-to-chat="state.projectToChat" :busy="busy" :refresh-disabled="requiresConfirmation" :auto-toggle-busy="activeRequest !== null" :disabled-reason="disabledReason" :has-map="Boolean(state.map)" :status="status" :maintenance-message="state.maintenanceMessage || ''" :maintenance-error="state.maintenanceStatus === 'error'" :notice="notice" :notice-error="isError" @close="settingsOpen = false" @set-auto="setAuto" @set-projection="setProjection" @update="update" @rebuild="rebuild" @refresh="refresh" />
        </template>
    </MapBrowser>
</template>
