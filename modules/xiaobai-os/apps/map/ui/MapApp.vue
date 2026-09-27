<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useAppBack } from '../../../shell/app-src/navigation/app-navigation.js';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import MapAtlas from './MapAtlas.vue';
import MapSceneView from './MapSceneView.vue';
import { resolveInitialMapView } from './map-view.js';
import MapSettings from './MapSettings.vue';
import MapSearch from './MapSearch.vue';
import MapPlaceDetail from './MapPlaceDetail.vue';
import MapIcon from './MapIcon.vue';
import { locationInScope } from './world-map.js';
import { isMapRegion, locationRegion } from '../../../domains/map/hierarchy.js';
import { mapBrowseScope, type MapBrowseFilter } from './map-browse.js';
import { MAP_BROWSE_COPY, MAP_NAV_COPY, MAP_VIEW_LABELS, mapBrowseAction, mapBrowseSummary } from './map-copy.js';
import { useMapState } from './use-map-state.js';
import './map.css';

const props = defineProps<XiaobaiOsAppProps>();
const { state, activeRequest, busy, disabledReason, requiresConfirmation, status, notice, isError, dismissNotice, refresh, confirmSave, adopt, setAuto, update, rebuild } = useMapState(props);
const selectedKey = ref('');
type MapView = { kind: 'world' } | { kind: 'region' | 'scene'; key: string };
// An empty key follows the player's region/scene; explicit keys browse without moving anyone.
const initialView = (): MapView => resolveInitialMapView(state.value.map) === 'scene' ? { kind: 'scene', key: '' } : { kind: 'world' };
const view = ref<MapView>(initialView());
const renderMode = ref<'2d' | '3d'>('3d');
const threeUnavailable = ref(false);
const threeNotice = ref('');
let viewChosen = false;
const showingScene = computed(() => view.value.kind === 'scene');
const sceneKey = computed(() => view.value.kind === 'scene' ? view.value.key : '');
const focusKey = ref('');
const focusSequence = ref(0);
const settingsOpen = ref(false);
const searchFilter = ref<MapBrowseFilter | null>(null);
const helpOpen = ref(false);
const atlas = computed(() => state.value.map?.atlas);
const playerKey = computed(() => atlas.value?.actors.find(actor => actor.actorKey === 'player')?.locationKey || '');
const player = computed(() => atlas.value?.locations.find(place => place.key === playerKey.value));
const sceneLocation = computed(() => atlas.value?.locations.find(place => place.key === (sceneKey.value || playerKey.value)));
const scene = computed(() => showingScene.value && sceneLocation.value?.sceneKey ? state.value.map?.scenes[sceneLocation.value.sceneKey] : undefined);
const currentRegion = computed(() => {
    if (!atlas.value || view.value.kind === 'world') {return undefined;}
    const key = view.value.key || playerKey.value;
    return locationRegion(atlas.value, key);
});
const scope = computed(() => mapBrowseScope(atlas.value || { locations: [], links: [], actors: [] }, view.value.kind === 'world' ? null : currentRegion.value?.key || ''));
const selected = computed(() => scope.value.locations.find(place => place.key === selectedKey.value));
const browseTitle = computed(() => scope.value.kind === 'world' ? MAP_VIEW_LABELS.world : currentRegion.value?.name || MAP_NAV_COPY.unknownRegion);
const browseCopy = computed(() => MAP_BROWSE_COPY[scope.value.kind]);
const bannerFilter = computed(() => scope.value.unvisited ? 'unvisited' : 'all');

watch(() => state.value, (next, previous) => {
    const changedChat = next.chatIdentity !== previous.chatIdentity;
    if (changedChat || !next.map?.atlas.locations.some(place => place.key === selectedKey.value)) {selectedKey.value = '';}
    if (changedChat) {viewChosen = false;}
    const target = view.value.kind === 'world' ? '' : view.value.key;
    const missingTarget = target && !next.map?.atlas.locations.some(place => place.key === target);
    if (changedChat || (!previous.map?.atlas.locations.length && next.map?.atlas.locations.length && !viewChosen) || missingTarget) {
        view.value = initialView();
    }
    if (changedChat) {settingsOpen.value = false; searchFilter.value = null; helpOpen.value = false;}
});
watch(scope, (next, previous) => {
    if (!next.locations.some(place => place.key === selectedKey.value)) {selectedKey.value = '';}
    if (next.kind !== previous.kind || next.region?.key !== previous.region?.key || !atlas.value) {
        selectedKey.value = ''; searchFilter.value = null; helpOpen.value = false;
    }
});
function navigate(next: MapView): void {
    viewChosen = true;
    view.value = next;
    selectedKey.value = '';
    searchFilter.value = null;
    helpOpen.value = false;
}
function enterRegion(key = ''): void {navigate({ kind: 'region', key });}
async function selectPlace(key: string, locate = false): Promise<void> {
    const place = atlas.value?.locations.find(item => item.key === key);
    if (!place) {return;}
    viewChosen = true;
    if (locate && atlas.value) {
        if (isMapRegion(place)) {showWorld();}
        else {
            const owner = locationRegion(atlas.value, key);
            if (!owner) {showScene(key); return;}
            enterRegion(owner.key);
        }
        await nextTick();
    }
    selectedKey.value = key;
    searchFilter.value = null;
    helpOpen.value = false;
    await nextTick();
    focusKey.value = atlas.value ? locationInScope(atlas.value, key, scope.value.locations) : key;
    focusSequence.value += 1;
}
async function locatePlayer(): Promise<void> {
    if (!player.value || !atlas.value) {return;}
    if (isMapRegion(player.value)) {await selectPlace(player.value.key, true); return;}
    const owner = locationRegion(atlas.value, player.value.key);
    if (!owner) {showScene(); return;}
    enterRegion();
    await nextTick();
    await selectPlace(player.value.key);
}
function showScene(key = ''): void {
    navigate({ kind: 'scene', key: key === playerKey.value ? '' : key });
}
function showWorld(): void {
    navigate({ kind: 'world' });
}
function fallbackThree(reason: string): void {
    if (threeUnavailable.value) {return;}
    threeUnavailable.value = true;
    renderMode.value = '2d';
    threeNotice.value = reason;
}
useAppBack(() => {
    if (helpOpen.value) { helpOpen.value = false; return true; }
    if (showingScene.value) { enterRegion(sceneKey.value ? currentRegion.value?.key || '' : ''); return true; }
    if (selectedKey.value) { selectedKey.value = ''; return true; }
    if (view.value.kind === 'region') { showWorld(); return true; }
    return false;
});
</script>
<template>
    <main class="map-app" :class="{ 'has-view-switch': atlas?.locations.length, 'is-scene-view': showingScene }">
        <div class="map-top">
            <header class="map-search-bar"><MapIcon :name="showingScene ? 'layers' : 'search'" /><button v-if="!showingScene" type="button" class="map-search-entry" :disabled="!atlas?.locations.length" @click="searchFilter = 'all'">{{ browseCopy.search }}<small>{{ browseTitle }}</small></button><div v-else class="map-search-entry">{{ sceneLocation?.name || MAP_VIEW_LABELS.scene }}<small>{{ sceneKey ? MAP_NAV_COPY.sceneBrowsing : MAP_NAV_COPY.sceneCurrent }}</small></div><button type="button" class="map-round-button" aria-label="地图设置" @click="settingsOpen = true"><MapIcon name="more" /></button></header>
            <div v-if="atlas?.locations.length" class="map-view-row">
                <nav class="map-view-switch" :aria-label="MAP_NAV_COPY.viewLabel">
                    <button type="button" :aria-pressed="view.kind === 'world'" @click="showWorld"><MapIcon name="globe" />{{ MAP_VIEW_LABELS.world }}</button>
                    <button type="button" :aria-pressed="view.kind === 'region'" @click="enterRegion()"><MapIcon name="compass" />{{ MAP_VIEW_LABELS.region }}</button>
                    <button type="button" :aria-pressed="showingScene" @click="showScene()"><MapIcon name="layers" />{{ MAP_VIEW_LABELS.scene }}</button>
                </nav>
                <div v-if="showingScene" class="map-scene-tools">
                    <button v-if="sceneKey" type="button" class="map-round-button" aria-label="回到当前场景" @click="showScene()"><MapIcon name="locate" /></button>
                    <button type="button" class="map-round-button" :aria-expanded="helpOpen" aria-label="地图图例" @click="helpOpen = !helpOpen"><MapIcon name="layers" /></button>
                </div>
            </div>
            <nav v-if="atlas?.locations.length && !showingScene" class="map-region-trail" :aria-label="MAP_NAV_COPY.trailLabel"><button type="button" :aria-current="view.kind === 'world' ? 'page' : undefined" @click="showWorld"><MapIcon name="globe" />{{ MAP_VIEW_LABELS.world }}</button><template v-if="view.kind === 'region'"><MapIcon name="next" /><span aria-current="page">{{ browseTitle }}</span></template></nav>
            <div v-if="status" class="map-progress" role="status"><span />{{ status }}</div>
            <aside v-if="threeNotice" class="map-notice" role="status"><p>{{ threeNotice }}</p><button type="button" class="map-notice-close" aria-label="关闭三维提示" @click="threeNotice = ''"><MapIcon name="close" /></button></aside>
            <aside v-if="notice || requiresConfirmation || state.status === 'conflict'" class="map-notice" :class="{ 'is-error': isError }" role="status">
                <p>{{ notice || (requiresConfirmation ? '还不确定是否保存成功，请先检查保存。' : '服务器上的存档与当前内容不同。') }}</p>
                <button v-if="requiresConfirmation" type="button" :disabled="busy" @click="confirmSave">检查保存</button>
                <template v-else-if="state.status === 'conflict'"><small>恢复会放弃尚未保存的更改，并使用当前聊天已保存的 OS 数据（不只是地图）。</small><button type="button" :disabled="busy" @click="adopt">放弃未保存更改并恢复</button></template>
                <button v-else-if="state.status === 'error' || state.status === 'blocked'" type="button" :disabled="busy" @click="refresh">重新加载</button>
                <button v-else type="button" class="map-notice-close" aria-label="关闭地图提示" @click="dismissNotice"><MapIcon name="close" /></button>
            </aside>
        </div>
        <div class="map-canvas" :class="{ 'has-detail': selected && !showingScene }">
            <template v-if="state.map && atlas?.locations.length">
                <MapAtlas v-if="scope.locations.length" v-show="!showingScene" :atlas="state.map.atlas" :scope="scope" :label="browseTitle" :current-location-key="playerKey" :selected-location-key="selectedKey" :focus-key="focusKey" :focus-sequence="focusSequence" @select="key => selectPlace(key)" />
                <template v-if="showingScene">
                    <MapSceneView v-if="scene?.status === 'active'" v-model:mode="renderMode" :scene="scene" :three-unavailable="threeUnavailable" @fallback="fallbackThree" />
                    <div v-else class="map-empty"><MapIcon name="layers" /><h2>{{ sceneLocation ? MAP_NAV_COPY.sceneEmpty : MAP_NAV_COPY.unknownLocation }}</h2><template v-if="sceneKey && sceneKey !== playerKey"><button type="button" class="map-secondary-button" @click="currentRegion ? enterRegion(currentRegion.key) : showWorld()">{{ currentRegion ? MAP_NAV_COPY.regionMap : MAP_VIEW_LABELS.world }}</button></template><template v-else><p>{{ sceneLocation ? MAP_NAV_COPY.sceneUpdateHint : MAP_NAV_COPY.locationUpdateHint }}</p><button type="button" class="map-secondary-button" :disabled="Boolean(disabledReason)" @click="update">{{ busy ? MAP_NAV_COPY.updating : MAP_NAV_COPY.update }}</button><p v-if="disabledReason && !busy" class="map-setting-note">{{ disabledReason }}</p></template></div>
                </template>
                <div v-if="!showingScene && !scope.locations.length" class="map-empty"><MapIcon name="pin" /><h2>{{ view.kind === 'region' && !currentRegion ? MAP_NAV_COPY.unknownRegion : browseCopy.empty }}</h2><p>{{ view.kind === 'region' && !currentRegion ? MAP_NAV_COPY.unknownRegionHint : browseCopy.emptyHint }}</p><button v-if="view.kind === 'region'" type="button" class="map-secondary-button" @click="showWorld">{{ MAP_VIEW_LABELS.world }}</button><button v-else type="button" class="map-secondary-button" :disabled="Boolean(disabledReason)" @click="update">{{ busy ? MAP_NAV_COPY.updating : MAP_NAV_COPY.update }}</button></div>
            </template>
            <div v-else class="map-empty map-first-map"><span class="map-empty-art"><MapIcon name="globe" /></span><small>故事之外，还有一整个世界</small><h1>{{ state.status === 'loading' ? '正在打开地图…' : '下一站，去哪里？' }}</h1><p>把世界设定画成地图，<br>也为留白的地方添上值得探索的去处。</p><button v-if="state.status !== 'loading'" type="button" class="map-primary-button" :disabled="Boolean(disabledReason)" @click="rebuild">{{ busy ? status || '正在准备…' : '绘制世界地图' }}</button><p v-if="disabledReason && !busy" class="map-setting-note">{{ disabledReason }}</p></div>
        </div>
        <div v-if="atlas?.locations.length && !showingScene" class="map-floating-tools" :class="{ 'has-detail': selected }"><button type="button" class="map-round-button" :disabled="!player" aria-label="回到我的位置" @click="locatePlayer"><MapIcon name="locate" /></button><button type="button" class="map-round-button" :aria-expanded="helpOpen" aria-label="地图图例" @click="helpOpen = !helpOpen"><MapIcon name="layers" /></button></div>
        <aside v-if="helpOpen" class="map-key"><strong>读懂这张地图</strong><p><i class="map-key-current" />你在这里 <i class="map-key-place" />可探索地点</p><p>路线连接已记录的地点；箭头表示单向通行。</p><small>{{ MAP_NAV_COPY.legend }}</small></aside>
        <MapPlaceDetail v-if="selected && state.map && !showingScene" :key="selected.key" :location="selected" :map="state.map" :current-key="playerKey" @close="selectedKey = ''" @scene="showScene(selected.key)" @explore="enterRegion(selected.key)" @select="key => selectPlace(key, true)" />
        <button v-else-if="atlas?.locations.length && !showingScene" type="button" class="map-region-card" :aria-label="mapBrowseAction(scope.kind, bannerFilter)" aria-describedby="map-browse-summary" @click="searchFilter = bannerFilter"><span class="map-region-icon"><MapIcon :name="scope.kind === 'world' ? 'globe' : 'compass'" /></span><span id="map-browse-summary" class="map-region-summary"><strong>{{ browseTitle }}</strong><small>{{ mapBrowseSummary(scope.kind, scope.locations.length, scope.unvisited) }}</small></span><span class="map-round-button" aria-hidden="true"><MapIcon name="next" /></span></button>
        <footer v-else-if="showingScene && atlas?.locations.length" class="map-scene-caption"><MapIcon name="layers" /><span><strong>{{ sceneLocation?.name || '当前位置待确认' }}</strong><small>{{ sceneKey ? '正在查看场景图 · 不会移动人物' : '当前位置的场景图' }}</small></span></footer>
        <MapSearch v-if="searchFilter && atlas" :scope="scope" :title="browseTitle" :initial-filter="searchFilter" @close="searchFilter = null" @select="key => selectPlace(key)" />
        <MapSettings v-if="settingsOpen" :auto-maintenance="state.autoMaintenance" :busy="busy" :refresh-disabled="requiresConfirmation" :auto-toggle-busy="activeRequest !== null" :disabled-reason="disabledReason" :has-map="Boolean(state.map)" :status="status" :maintenance-message="state.maintenanceMessage || ''" :maintenance-error="state.maintenanceStatus === 'error'" :notice="notice" :notice-error="isError" @close="settingsOpen = false" @set-auto="setAuto" @update="update" @rebuild="rebuild" @refresh="refresh" />
    </main>
</template>
