<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import MapAtlas from './MapAtlas.vue';
import MapScene from './MapScene.vue';
import MapSettings from './MapSettings.vue';
import MapSearch from './MapSearch.vue';
import MapPlaceDetail from './MapPlaceDetail.vue';
import MapIcon from './MapIcon.vue';
import { initialWorldRegion, locationInRegion, locationTrail } from './world-map.js';
import { useMapState } from './use-map-state.js';
import './map.css';

const props = defineProps<XiaobaiOsAppProps>();
const { state, activeRequest, busy, disabledReason, requiresConfirmation, status, notice, isError, dismissNotice, refresh, confirmSave, adopt, setAuto, update, rebuild } = useMapState(props);
const region = ref(state.value.map ? initialWorldRegion(state.value.map.atlas) : '');
const selectedKey = ref('');
// null: world, empty string: follow the current place, otherwise: browse a recorded place.
const sceneKey = ref<string | null>(null);
const showingScene = computed(() => sceneKey.value !== null);
const focusKey = ref('');
const focusSequence = ref(0);
const settingsOpen = ref(false);
const searchOpen = ref(false);
const helpOpen = ref(false);
const atlas = computed(() => state.value.map?.atlas);
const playerKey = computed(() => atlas.value?.actors.find(actor => actor.actorKey === 'player')?.locationKey || '');
const player = computed(() => atlas.value?.locations.find(place => place.key === playerKey.value));
const selected = computed(() => atlas.value?.locations.find(place => place.key === selectedKey.value));
const sceneLocation = computed(() => atlas.value?.locations.find(place => place.key === (sceneKey.value || playerKey.value)));
const scene = computed(() => showingScene.value && sceneLocation.value?.sceneKey ? state.value.map?.scenes[sceneLocation.value.sceneKey] : undefined);
const currentRegion = computed(() => atlas.value?.locations.find(place => place.key === region.value));
const places = computed(() => atlas.value?.locations.filter(place => (place.parent || '') === region.value) || []);
const unvisited = computed(() => places.value.filter(place => place.status !== 'visited').length);
const trail = computed(() => atlas.value ? locationTrail(atlas.value, region.value) : []);

watch(() => state.value, (next, previous) => {
    const changedChat = next.chatIdentity !== previous.chatIdentity;
    if (!previous.map || changedChat || (region.value && !next.map?.atlas.locations.some(place => place.key === region.value))) {
        region.value = next.map ? initialWorldRegion(next.map.atlas) : '';
    }
    if (changedChat || !next.map?.atlas.locations.some(place => place.key === selectedKey.value)) {selectedKey.value = '';}
    if (changedChat || (sceneKey.value && !next.map?.atlas.locations.some(place => place.key === sceneKey.value))) {sceneKey.value = null;}
    if (changedChat) {settingsOpen.value = false; searchOpen.value = false;}
});
function enterRegion(key: string): void {
    region.value = key;
    selectedKey.value = '';
    sceneKey.value = null;
    helpOpen.value = false;
}
async function selectPlace(key: string, locate = false): Promise<void> {
    const place = atlas.value?.locations.find(item => item.key === key);
    if (!place) {return;}
    sceneKey.value = null;
    selectedKey.value = key;
    searchOpen.value = false;
    helpOpen.value = false;
    if (locate) {region.value = place.parent || '';}
    await nextTick();
    focusKey.value = atlas.value ? locationInRegion(atlas.value, key, region.value) : key;
    focusSequence.value += 1;
}
async function locatePlayer(): Promise<void> {
    if (player.value) {await selectPlace(player.value.key, true);}
}
function showScene(key = ''): void {
    sceneKey.value = key === playerKey.value ? '' : key;
    helpOpen.value = false;
    searchOpen.value = false;
}
function showWorld(): void {
    sceneKey.value = null;
    helpOpen.value = false;
}
useAppBack(() => {
    if (helpOpen.value) { helpOpen.value = false; return true; }
    if (showingScene.value) { showWorld(); return true; }
    if (selectedKey.value) { selectedKey.value = ''; return true; }
    if (region.value) { enterRegion(currentRegion.value?.parent || ''); return true; }
    return false;
});
</script>
<template>
    <main class="map-app" :class="{ 'has-view-switch': atlas?.locations.length, 'is-scene-view': showingScene }">
        <div class="map-top">
            <header class="map-search-bar"><MapIcon :name="showingScene ? 'layers' : 'search'" /><button v-if="!showingScene" type="button" class="map-search-entry" :disabled="!atlas?.locations.length" @click="searchOpen = true">想去哪里？<small>搜索世界中的地点</small></button><div v-else class="map-search-entry">{{ sceneLocation?.name || '当前场景' }}<small>{{ sceneKey ? '正在查看已记录的场景' : '看看你身边的布局' }}</small></div><button type="button" class="map-round-button" aria-label="地图设置" @click="settingsOpen = true"><MapIcon name="more" /></button></header>
            <nav v-if="atlas?.locations.length" class="map-view-switch" aria-label="地图视图">
                <button type="button" :aria-pressed="!showingScene" @click="showWorld"><MapIcon name="globe" />世界地图</button>
                <button type="button" :aria-pressed="showingScene" @click="showScene()"><MapIcon name="layers" />{{ sceneKey ? '场景地图' : '当前场景' }}</button>
            </nav>
            <nav v-if="atlas?.locations.length && !showingScene" class="map-region-trail" aria-label="当前查看区域"><button type="button" @click="enterRegion('')"><MapIcon name="globe" />世界</button><template v-for="place in trail" :key="place.key"><MapIcon name="next" /><button type="button" @click="enterRegion(place.key)">{{ place.name }}</button></template></nav>
            <div v-if="status" class="map-progress" role="status"><span />{{ status }}</div>
            <aside v-if="notice || requiresConfirmation || state.status === 'conflict'" class="map-notice" :class="{ 'is-error': isError }" role="status">
                <p>{{ notice || (requiresConfirmation ? '保存结果尚未确认。' : '保存的版本不一致。') }}</p>
                <button v-if="requiresConfirmation" type="button" :disabled="busy" @click="confirmSave">核实保存结果</button>
                <template v-else-if="state.status === 'conflict'"><small>恢复会放弃尚未保存的更改，并使用当前聊天已保存的 OS 数据（不只是地图）。</small><button type="button" :disabled="busy" @click="adopt">放弃未保存更改并恢复</button></template>
                <button v-else-if="state.status === 'error' || state.status === 'blocked'" type="button" :disabled="busy" @click="refresh">重新读取</button>
                <button v-else type="button" class="map-notice-close" aria-label="关闭地图提示" @click="dismissNotice"><MapIcon name="close" /></button>
            </aside>
        </div>
        <div class="map-canvas" :class="{ 'has-detail': selected && !showingScene }">
            <template v-if="state.map && atlas?.locations.length">
                <MapAtlas v-show="!showingScene" :atlas="state.map.atlas" :region="region" :current-location-key="playerKey" :selected-location-key="selectedKey" :focus-key="focusKey" :focus-sequence="focusSequence" @select="key => selectPlace(key)" />
                <template v-if="showingScene">
                    <MapScene v-if="scene?.status === 'active'" :scene="scene" />
                    <div v-else class="map-empty"><MapIcon name="layers" /><h2>{{ sceneLocation ? '这里的布局还没画出来' : '还不知道你在哪里' }}</h2><p>{{ sceneLocation ? '更新地图后，会结合设定与剧情补齐这里的普通布局。' : '更新地图后，会根据剧情确认你所在的地方。' }}</p><button type="button" class="map-secondary-button" :disabled="Boolean(disabledReason)" @click="update">{{ busy ? '正在更新…' : '更新地图' }}</button><p v-if="disabledReason && !busy" class="map-setting-note">{{ disabledReason }}</p></div>
                </template>
                <div v-if="!showingScene && !places.length" class="map-empty"><MapIcon name="pin" /><h2>这里还没有标出更多地点</h2><p>可以先看看其他区域，或更新地图补充。</p><button type="button" class="map-secondary-button" @click="enterRegion(currentRegion?.parent || '')">查看上级区域</button></div>
            </template>
            <div v-else class="map-empty map-first-map"><span class="map-empty-art"><MapIcon name="globe" /></span><small>故事之外，还有一整个世界</small><h1>{{ state.status === 'loading' ? '正在打开地图…' : '下一站，去哪里？' }}</h1><p>把世界设定画成地图，<br>也为留白的地方添上值得探索的去处。</p><button v-if="state.status !== 'loading'" type="button" class="map-primary-button" :disabled="Boolean(disabledReason)" @click="rebuild">{{ busy ? status || '正在准备…' : '绘制世界地图' }}</button><p v-if="disabledReason && !busy" class="map-setting-note">{{ disabledReason }}</p></div>
        </div>
        <div v-if="atlas?.locations.length" class="map-floating-tools" :class="{ 'has-detail': selected && !showingScene }"><button v-if="showingScene && sceneKey" type="button" class="map-round-button" aria-label="回到当前场景" @click="showScene()"><MapIcon name="locate" /></button><button v-else-if="!showingScene" type="button" class="map-round-button" :disabled="!player" aria-label="回到我的位置" @click="locatePlayer"><MapIcon name="locate" /></button><button type="button" class="map-round-button" :aria-expanded="helpOpen" aria-label="地图图例" @click="helpOpen = !helpOpen"><MapIcon name="layers" /></button></div>
        <aside v-if="helpOpen" class="map-key"><strong>读懂这张地图</strong><p><i class="map-key-current" />你在这里 <i class="map-key-place" />可探索地点</p><p>路线连接已记录的地点；箭头表示单向通行。</p><small>世界图展示区域与地点，不按实际比例。场景图展示一个地点的内部布局。</small></aside>
        <MapPlaceDetail v-if="selected && state.map && !showingScene" :key="selected.key" :location="selected" :map="state.map" :current-key="playerKey" @close="selectedKey = ''" @scene="showScene(selected.key)" @explore="enterRegion(selected.key)" @select="key => selectPlace(key, true)" />
        <footer v-else-if="atlas?.locations.length && !showingScene" class="map-region-card"><span class="map-region-icon"><MapIcon name="compass" /></span><div><h1>{{ currentRegion?.name || '世界地图' }}</h1><p>{{ places.length }} 个地点 · {{ unvisited ? unvisited + ' 处还没去过' : '看看熟悉的地方有什么变化' }}</p></div><button type="button" class="map-round-button" aria-label="浏览全部地点" @click="searchOpen = true"><MapIcon name="next" /></button></footer>
        <footer v-else-if="showingScene && atlas?.locations.length" class="map-scene-caption"><MapIcon name="layers" /><span><strong>{{ sceneLocation?.name || '当前位置待确认' }}</strong><small>{{ sceneKey ? '正在查看场景图 · 不会移动人物' : '当前位置的场景图' }}</small></span></footer>
        <MapSearch v-if="searchOpen && atlas" :atlas="atlas" @close="searchOpen = false" @select="key => selectPlace(key, true)" />
        <MapSettings v-if="settingsOpen" :auto-maintenance="state.autoMaintenance" :busy="busy" :refresh-disabled="requiresConfirmation" :auto-toggle-busy="activeRequest !== null" :disabled-reason="disabledReason" :has-map="Boolean(state.map)" :status="status" :maintenance-message="state.maintenanceMessage || ''" :maintenance-error="state.maintenanceStatus === 'error'" :notice="notice" :notice-error="isError" @close="settingsOpen = false" @set-auto="setAuto" @update="update" @rebuild="rebuild" @refresh="refresh" />
    </main>
</template>
